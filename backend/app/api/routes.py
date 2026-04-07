import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.stt_service import transcribe_audio
from app.services.rag_service import run_rag_pipeline
from app.services.tts_service import synthesize_speech

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/voice-query")
async def voice_query(file: UploadFile = File(...)):
    """
    Main endpoint for the Voice-to-Voice RAG loop.
    URL: http://localhost:8000/api/voice-query
    """
    try:
        # 1. READ AUDIO
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")

        # 2. STT (Whisper)
        logger.info("--- Step 1: Transcribing Audio ---")
        transcript = transcribe_audio(audio_bytes)
        logger.info(f"User said: {transcript}")

        # 3. RAG (Postgres + Bedrock Claude 3.5)
        logger.info("--- Step 2: Running RAG Pipeline ---")
        rag_result = run_rag_pipeline(transcript)
        answer = rag_result.get("answer", "I couldn't find an answer in the records.")
        logger.info(f"AI Answer: {answer}")

        # 4. TTS (Coqui Tacotron2)
        logger.info("--- Step 3: Synthesizing Speech ---")
        wav_bytes = synthesize_speech(answer)

        # 5. RETURN RESPONSE
        # Note: Sending audio as hex string for simple JSON handling
        return {
            "transcript": transcript,
            "answer": answer,
            "audio": wav_bytes.hex(),
            "status": "success"
        }

    except Exception as e:
        logger.error(f"FATAL ERROR in voice_query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))