from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, File, Query, UploadFile
from fastapi.responses import Response

from models.transcription import JobListResponse, JobResponse

router = APIRouter(prefix="/api/v1/transcriptions", tags=["transcriptions"])


@router.post("", response_model=JobResponse, status_code=201)
async def create_transcription(
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File()],
) -> JobResponse:
    raise NotImplementedError


@router.get("", response_model=JobListResponse)
async def list_transcriptions() -> JobListResponse:
    raise NotImplementedError


@router.get("/{job_id}", response_model=JobResponse)
async def get_transcription(job_id: str) -> JobResponse:
    raise NotImplementedError


@router.get("/{job_id}/export")
async def export_transcription(
    job_id: str,
    format: Annotated[str, Query(pattern="^(txt|pdf)$")] = "txt",
) -> Response:
    raise NotImplementedError


@router.delete("/{job_id}", status_code=204)
async def delete_transcription(job_id: str) -> Response:
    raise NotImplementedError
