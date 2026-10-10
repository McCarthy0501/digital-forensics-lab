from datetime import UTC, datetime
from enum import Enum

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(UTC)


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    ERROR = "error"


class Segment(BaseModel):
    start: float
    end: float
    text: str


class Job(BaseModel):
    id: str
    filename: str
    status: JobStatus = JobStatus.QUEUED
    progress: float = 0.0
    duration: float | None = None
    language: str | None = None
    text: str | None = None
    segments: list[Segment] = Field(default_factory=list)
    error: str | None = None
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)


class JobResponse(BaseModel):
    id: str
    filename: str
    status: JobStatus
    progress: float
    duration: float | None
    language: str | None
    text: str | None
    segments: list[Segment]
    error: str | None
    created_at: datetime
    updated_at: datetime


class JobListResponse(BaseModel):
    total: int
    items: list[JobResponse]


class ErrorResponse(BaseModel):
    detail: str
