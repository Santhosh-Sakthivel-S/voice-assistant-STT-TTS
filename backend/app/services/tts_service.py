import os
import uuid
import torch
from TTS.api import TTS
from app.core.config import settings

_tts_model = None

def get_tts_model():
    global _tts_model
    if _tts_model is None:
        # Now settings.TTS_MODEL will work because we updated config.py
        model_name = settings.TTS_MODEL
        print(f"--- Loading TTS Model: {model_name} ---")
        use_gpu = torch.cuda.is_available()
        _tts_model = TTS(model_name=model_name, gpu=use_gpu)
    return _tts_model

def synthesize_speech(text: str):
    tts = get_tts_model()
    
    filename = f"speech_{uuid.uuid4()}.wav"
    output_path = os.path.join("temp", filename)
    os.makedirs("temp", exist_ok=True)

    try:
        # Build arguments dynamically
        tts_kwargs = {
            "text": text,
            "file_path": output_path
        }

        # Only pass speaker if model supports it and it's provided
        if tts.is_multi_speaker and settings.TTS_SPEAKER:
            tts_kwargs["speaker"] = settings.TTS_SPEAKER

        # Only pass language if model supports it and it's provided
        if tts.is_multi_lingual and settings.TTS_LANGUAGE:
            tts_kwargs["language"] = settings.TTS_LANGUAGE

        # Generate
        tts.tts_to_file(**tts_kwargs)

        with open(output_path, "rb") as f:
            return f.read()

    finally:
        if os.path.exists(output_path):
            os.remove(output_path)