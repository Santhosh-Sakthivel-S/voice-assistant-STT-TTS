import io
import torch
import whisper
import numpy as np
from pydub import AudioSegment
from app.core.config import settings

_model = None

def get_whisper_model():
    global _model
    if _model is None:
        model_name = settings.WHISPER_MODEL or "base"
        device = "cuda" if torch.cuda.is_available() else "cpu"
        _model = whisper.load_model(model_name, device=device)
    return _model

def transcribe_audio(audio_bytes: bytes) -> str:
    """
    Handles audio conversion and transcription.
    """
    model = get_whisper_model()
    
    # Load audio into pydub
    audio_file = io.BytesIO(audio_bytes)
    audio = AudioSegment.from_file(audio_file)

    # Convert to 16kHz Mono (Standard for Whisper)
    audio = audio.set_frame_rate(16000).set_channels(1)
    samples = np.array(audio.get_array_of_samples()).astype(np.float32) / 32768.0

    # Transcribe with English focus to prevent 'E.Yep' hallucinations
    result = model.transcribe(samples, language="en", fp16=torch.cuda.is_available())
    
    transcript = result["text"].strip()
    print(f"--- WHISPER CAPTURED: {transcript} ---") # Check your terminal for this!
    return transcript