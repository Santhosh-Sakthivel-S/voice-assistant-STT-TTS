# MedRAG — STT → LangGraph RAG → TTS

A full-stack voice-powered medical assistant that combines:

| Layer | Technology |
|-------|-----------|
| **Speech-to-Text** | OpenAI Whisper (local) |
| **Vector DB** | PostgreSQL + pgvector (`meddb`) |
| **RAG Orchestration** | LangGraph |
| **Embeddings** | AWS Bedrock — Amazon Titan Embed v2 |
| **LLM** | AWS Bedrock — Claude 3.5 Sonnet |
| **Text-to-Speech** | Coqui TTS (local) |
| **Backend** | FastAPI (Python 3.11) |
| **Frontend** | React 18 |

---

## Architecture

```
Browser mic
    │
    ▼ audio/webm
┌───────────────────────────────────────────────────────┐
│                   FastAPI Backend                      │
│                                                       │
│  Whisper STT ──► LangGraph Pipeline ──► Coqui TTS    │
│                       │                               │
│            ┌──────────┼──────────┐                   │
│            ▼          ▼          ▼                   │
│        retrieve    grade      generate               │
│        (pgvector)  (Bedrock)  (Claude 3.5)           │
└───────────────────────────────────────────────────────┘
    │
    ▼ JSON  {transcript, answer, sources, audio_b64}
React UI (chat + waveform + audio player)
```

---

## Prerequisites

- Python 3.11+
- Node 20+
- PostgreSQL 15+ with **pgvector** extension (`CREATE EXTENSION vector;`)
- AWS account with Bedrock enabled for:
  - `anthropic.claude-3-5-sonnet-20240620-v1:0`
  - `amazon.titan-embed-text-v2:0`
- Your CSV data already imported into `meddb` (any table name)

---

## Quick Start

### 1. Configure

```bash
cp backend/.env.example backend/.env
# Edit backend/.env — set AWS keys, DB password, and your CSV table name
```

### 2. Enable pgvector in meddb (once)

```sql
-- Connect to meddb in psql / DBeaver / pgAdmin
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Install backend deps & embed your data (once)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.services.ingest   # reads meddb rows → pgvector embeddings
```

### 4. Start the backend

```bash
# inside backend/ with venv active
uvicorn app.main:app --reload --port 8000
```

### 5. Start the frontend (new terminal)

```bash
cd frontend
npm install
npm start
```

Open **http://localhost:3000**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/transcribe` | Upload audio → Whisper transcription |
| `POST` | `/api/query` | Text query → RAG answer + optional TTS |
| `POST` | `/api/synthesize` | Text → WAV audio |
| `POST` | `/api/voice-query` | Audio → full pipeline → JSON response |
| `GET`  | `/api/health` | Health check |

### Example: `/api/voice-query`

**Request:** `multipart/form-data` with `audio` field (webm/wav/mp4)

**Response:**
```json
{
  "transcript": "What medications is patient John Doe taking?",
  "answer": "According to the records, patient John Doe is prescribed...",
  "sources": [
    { "content": "...", "metadata": {...}, "score": 0.87 }
  ],
  "audio_b64": "<base64-encoded WAV>"
}
```

---

## LangGraph Pipeline

```
retrieve ──► grade ──► generate
```

1. **retrieve** — pgvector similarity search (top-5 docs)
2. **grade** — Bedrock Claude evaluates each doc for relevance (YES/NO)
3. **generate** — Claude 3.5 Sonnet answers using graded context + chat history

---

## Configuration Reference (`.env`)

```env
# AWS
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
EMBEDDING_MODEL=amazon.titan-embed-text-v2:0

# DB
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=meddb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=...
POSTGRES_TABLE=medical_records   # your CSV table name

# Whisper: tiny | base | small | medium | large
WHISPER_MODEL=base

# Coqui TTS
TTS_MODEL=tts_models/en/ljspeech/tacotron2-DDC

# App
APP_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

---

## Project Structure

```
stt-tts-rag/
├── backend/
│   ├── app/
│   │   ├── api/routes.py          # FastAPI endpoints
│   │   ├── core/
│   │   │   ├── config.py          # Settings (pydantic)
│   │   │   └── database.py        # pgvector store
│   │   ├── models/schemas.py      # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── stt_service.py     # Whisper STT
│   │   │   ├── tts_service.py     # Coqui TTS
│   │   │   ├── rag_service.py     # LangGraph pipeline
│   │   │   └── ingest.py          # One-time embedding ingestion
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── App.jsx                # Main chat UI
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── MicButton.jsx
│   │   │   ├── WaveVisualizer.jsx
│   │   │   ├── AudioPlayer.jsx
│   │   │   ├── SourceCard.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── hooks/useRecorder.js   # MediaRecorder + volume analyser
│   │   ├── utils/api.js           # Axios API calls
│   │   └── styles/globals.css
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## Notes

- **First run** will download Whisper and Coqui models (~500MB). Subsequent runs use cache.
- For **GPU acceleration** set `gpu=True` in `tts_service.py` and use a CUDA-enabled base image.
- The `ingest.py` script is idempotent — re-running it appends documents; use `store.delete_collection()` first to re-index cleanly.
- HTTPS / microphone access: browsers require HTTPS for `getUserMedia` in production. Use nginx + Let's Encrypt or a reverse proxy.
