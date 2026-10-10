from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
CONVERTED_DIR = STORAGE_DIR / "converted"
ASSETS_DIR = BASE_DIR / "assets"
FONTS_DIR = ASSETS_DIR / "fonts"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="VT_",
        extra="ignore",
    )

    app_name: str = "VoxTranscribe API"
    version: str = "0.1.0"
    debug: bool = False

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:5173"]

    storage_dir: Path = STORAGE_DIR
    uploads_dir: Path = UPLOADS_DIR
    converted_dir: Path = CONVERTED_DIR
    fonts_dir: Path = FONTS_DIR

    max_file_size: int = 200 * 1024 * 1024
    allowed_extensions: list[str] = [
        "mp3",
        "wav",
        "m4a",
        "aac",
        "ogg",
        "webm",
        "flac",
        "mp4",
        "mov",
    ]

    whisper_model: str = "small"
    whisper_device: str = "cpu"
    whisper_compute_type: str = "int8"
    whisper_language: str | None = None
    whisper_beam_size: int = 5

    cleanup_max_age_hours: int = 24

    def ensure_directories(self) -> None:
        for directory in (self.storage_dir, self.uploads_dir, self.converted_dir):
            directory.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()
