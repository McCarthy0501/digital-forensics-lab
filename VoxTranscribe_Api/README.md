# VoxTranscribe API

Backend de transcripción de audio con FastAPI y faster-whisper.

## Requisitos

- Python 3.13
- FFmpeg y ffprobe en el PATH

## Estructura

```
VoxTranscribe_Api/
├── main.py                  arranque de FastAPI, CORS, routers
├── requirements.txt         dependencias de runtime
├── requirements-dev.txt     dependencias de desarrollo (pytest, ruff)
├── .env / .env.example      configuración local y plantilla
├── core/config.py           ajustes: límites, modelo, rutas, formatos
├── models/transcription.py  esquemas Pydantic (Job, JobStatus, respuestas)
├── routes/transcriptions.py capa HTTP (endpoints)
├── services/                lógica de negocio
│   ├── audio.py             validar y convertir con FFmpeg
│   ├── transcriber.py       motor faster-whisper
│   ├── jobs.py              estado de los trabajos (en memoria)
│   ├── exporter.py          exportar TXT y PDF
│   └── cleanup.py           limpieza de archivos temporales
├── assets/fonts/            fuente DejaVuSans.ttf para el PDF
├── storage/                 archivos temporales (ignorado por Git)
│   ├── uploads/
│   └── converted/
└── tests/                   pruebas con pytest
```

## Puesta en marcha

```bash
python -m venv env
source env/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn main:app --reload
```

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/v1/transcriptions` | Sube un audio y crea un trabajo |
| GET | `/api/v1/transcriptions` | Lista los trabajos |
| GET | `/api/v1/transcriptions/{id}` | Consulta un trabajo |
| GET | `/api/v1/transcriptions/{id}/export?format=txt\|pdf` | Exporta la transcripción |
| DELETE | `/api/v1/transcriptions/{id}` | Elimina un trabajo |
| GET | `/health` | Comprobación de estado |

Documentación interactiva en `/docs`.

## Pruebas y lint

```bash
pytest
ruff check .
```

## Nota

La lógica de negocio (`services/*`, endpoints) está definida como esqueleto
(firmas y tipos). La implementación se aborda en la siguiente fase.
