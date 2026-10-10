from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class AudioInfo:
    duration: float
    format: str
    codec: str


def probe(input_path: Path) -> AudioInfo:
    raise NotImplementedError


def convert(input_path: Path, output_path: Path) -> Path:
    raise NotImplementedError
