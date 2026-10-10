from dataclasses import dataclass, field
from pathlib import Path

from models.transcription import Segment


@dataclass
class TranscriptionResult:
    text: str
    language: str
    segments: list[Segment] = field(default_factory=list)


def get_model() -> object:
    raise NotImplementedError


def transcribe(audio_path: Path) -> TranscriptionResult:
    raise NotImplementedError
