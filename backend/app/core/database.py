import os
import urllib.parse
from langchain_postgres.vectorstores import PGVector
from langchain_aws import BedrockEmbeddings
from app.core.config import settings

# Initialize Bedrock Embeddings
embeddings = BedrockEmbeddings(
    model_id=settings.EMBEDDING_MODEL,
    region_name=settings.AWS_DEFAULT_REGION
)

# --- THE FIX: URL-Encode the password to handle special characters ---
encoded_password = urllib.parse.quote_plus(settings.POSTGRES_PASSWORD)

# Reconstruct the connection string with the safe password
CONNECTION_STRING = (
    f"postgresql+psycopg2://{settings.POSTGRES_USER}:{encoded_password}@"
    f"{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
)

COLLECTION_NAME = f"{settings.POSTGRES_TABLE}_embeddings"

def get_vector_store():
    """Returns the PGVector store instance."""
    return PGVector(
        embeddings=embeddings,
        collection_name=COLLECTION_NAME,
        connection=CONNECTION_STRING,
        use_jsonb=True,
    )

def similarity_search(query: str, k: int = 5):
    """Performs a similarity search in the vector database."""
    store = get_vector_store()
    # This might trigger the 'vector' extension creation on first run
    docs = store.similarity_search(query, k=k)
    return docs