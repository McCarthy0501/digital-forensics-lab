from models.transcription import Job


def cleanup_job(job: Job) -> None:
    raise NotImplementedError


def cleanup_old(max_age_hours: int) -> int:
    raise NotImplementedError
