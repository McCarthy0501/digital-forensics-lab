from models.transcription import Job, JobStatus, Segment


class JobStore:
    def create(self, filename: str) -> Job:
        raise NotImplementedError

    def get(self, job_id: str) -> Job | None:
        raise NotImplementedError

    def list_all(self) -> list[Job]:
        raise NotImplementedError

    def update(
        self,
        job_id: str,
        *,
        status: JobStatus | None = None,
        progress: float | None = None,
        duration: float | None = None,
        language: str | None = None,
        text: str | None = None,
        segments: list[Segment] | None = None,
        error: str | None = None,
    ) -> Job:
        raise NotImplementedError

    def delete(self, job_id: str) -> bool:
        raise NotImplementedError

    def clear(self) -> None:
        raise NotImplementedError


job_store = JobStore()
