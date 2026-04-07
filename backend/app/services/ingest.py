from __future__ import annotations

import logging
import sys

import pandas as pd
from langchain_core.documents import Document

from app.core.database import get_vector_store

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CSV → Documents
# ---------------------------------------------------------------------------

def fetch_records_from_csv(file_path: str):
    import pandas as pd
    from langchain_core.documents import Document

    df = pd.read_csv(file_path)

    print("Columns:", df.columns)  # debug

    documents = []

    for _, row in df.iterrows():
        # ✅ EMBEDDING ONLY PRODUCT NAME
        product_name = str(row["product_name"])

        # ✅ store ALL columns in metadata
        metadata = {
            "ws_code": str(row["ws_code"]),
            "product_name": str(row["product_name"]),
            "combinations": str(row["combinations_string"]),
            "manufacturer": str(row["manufacturer_name"]),
            "dosage_form": str(row["dosage_form"]),
            "package_type": str(row["package_type"]),
            "mrp": str(row["mrp"]),
            "sale_price": str(row["sale_price"]),
        }

        documents.append(
            Document(
                page_content=product_name,   # 🔥 ONLY THIS IS EMBEDDED
                metadata=metadata            # 🔥 FULL DATA STORED HERE
            )
        )

    return documents

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    logger.info("Starting ingestion into pgvector …")

    # 🔴 CHANGE THIS PATH
    CSV_PATH = r"D:/task/stt-tts-rag/medicines.csv"

    docs = fetch_records_from_csv(CSV_PATH)

    if not docs:
        logger.error("No records found in CSV. Exiting.")
        sys.exit(1)

    store = get_vector_store()

    batch_size = 50

    for i in range(0, len(docs), batch_size):
        batch = docs[i : i + batch_size]
        store.add_documents(batch)
        logger.info("Ingested batch %d–%d", i, i + len(batch))

    logger.info("✅ Ingestion complete. %d documents embedded.", len(docs))


# ---------------------------------------------------------------------------
# RUN
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    main()