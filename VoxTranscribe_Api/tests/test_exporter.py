import pytest

pytestmark = pytest.mark.skip(reason="exporter.to_txt/to_pdf pendientes de implementación")


def test_to_txt() -> None:
    raise NotImplementedError


def test_to_pdf() -> None:
    raise NotImplementedError
