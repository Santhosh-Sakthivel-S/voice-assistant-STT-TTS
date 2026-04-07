from pydantic_settings import BaseSettings
from typing import Optional, List
from pydantic import Field

class Settings(BaseSettings):
    # AWS Bedrock
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_DEFAULT_REGION: str = "ap-south-1"
    BEDROCK_MODEL_ID: str = "anthropic.claude-3-5-sonnet-20240620-v1:0"

    # PostgreSQL
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "meddb"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str
    POSTGRES_TABLE: str = "medical_records"

    # Embedding & Search
    EMBEDDING_MODEL: str = "amazon.titan-embed-text-v2:0"
    WHISPER_MODEL: str = "base"

    # TTS SETTINGS
    TTS_MODEL: str = "tts_models/en/ljspeech/tacotron2-DDC"
    TTS_SPEAKER: Optional[str] = None
    TTS_LANGUAGE: Optional[str] = None

    # App & CORS
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    CORS_ORIGINS: str = "http://localhost:3000"

    # This fixes the 'cors_origins_list' AttributeError
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()