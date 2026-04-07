import logging
from langchain_aws import ChatBedrock
from langchain_core.messages import HumanMessage
from app.core.config import settings
from app.core.database import similarity_search

logger = logging.getLogger(__name__)

def run_rag_pipeline(query: str):
    # 1. Search the Vector DB (Postgres)
    docs = similarity_search(query, k=3)
    
    # Extract text from documents
    context = "\n".join([d.page_content for d in docs])
    
    if not context.strip():
        context = "NO RELEVANT MEDICAL RECORDS FOUND."

    # 2. Setup Claude 3.5
    llm = ChatBedrock(
        model_id=settings.BEDROCK_MODEL_ID,
        region_name=settings.AWS_DEFAULT_REGION
    )

    # 3. Create the Prompt
    prompt = f"""
    SYSTEM: You are a professional Medical Assistant.
    USER QUESTION: {query}
    
    PROVIDED RECORDS:
    {context}
    
    INSTRUCTIONS:
    1. If the medicine mentioned in the QUESTION is in the RECORDS, explain its use.
    2. If the medicine is NOT in the RECORDS, state clearly: "Aciflom is not in our current database."
    3. Do not invent names like "E.Yep". Stick strictly to the text provided.
    """

    response = llm.invoke([HumanMessage(content=prompt)])
    
    return {
        "answer": response.content,
        "context": context
    }