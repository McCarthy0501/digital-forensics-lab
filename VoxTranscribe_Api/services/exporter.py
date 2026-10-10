from models.transcription import Job


def to_txt(job: Job) -> str:
    raise NotImplementedError


def to_pdf(job: Job) -> bytes:
    raise NotImplementedError
