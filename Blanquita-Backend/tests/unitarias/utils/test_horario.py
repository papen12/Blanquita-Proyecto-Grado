from datetime import datetime, time, timezone
from zoneinfo import ZoneInfo

import pytest
import time_machine

from app.utils import horario
from app.utils.horario import en_modo_consulta

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]

LA_PAZ = ZoneInfo("America/La_Paz")


def _la_paz(hora: int, minuto: int = 0, segundo: int = 0) -> datetime:
    return datetime(2026, 10, 27, hora, minuto, segundo, tzinfo=LA_PAZ)


@pytest.mark.parametrize(
    "ahora",
    [_la_paz(0, 0, 0), _la_paz(3, 30), _la_paz(5, 59, 59)],
    ids=["medianoche", "madrugada", "ultimo-segundo"],
)
def test_madrugada_esta_en_modo_consulta(ahora):
    assert en_modo_consulta(ahora) is True


@pytest.mark.parametrize(
    "ahora",
    [_la_paz(6, 0, 0), _la_paz(12, 0), _la_paz(23, 59, 59)],
    ids=["inicio-turno-manana", "mediodia", "fin-del-dia"],
)
def test_fuera_de_la_madrugada_no_esta_en_modo_consulta(ahora):
    assert en_modo_consulta(ahora) is False


def test_hora_utc_se_convierte_a_la_paz_antes_de_comparar():
    assert en_modo_consulta(datetime(2026, 10, 27, 5, 0, tzinfo=timezone.utc)) is True
    assert en_modo_consulta(datetime(2026, 10, 27, 10, 0, tzinfo=timezone.utc)) is False


def test_las_3_utc_son_las_23_del_dia_anterior_en_la_paz():
    assert en_modo_consulta(datetime(2026, 10, 27, 3, 0, tzinfo=timezone.utc)) is False


@time_machine.travel(_la_paz(4, 15), tick=False)
def test_sin_argumento_usa_la_hora_actual_en_madrugada():
    assert en_modo_consulta() is True


@time_machine.travel(_la_paz(9, 45), tick=False)
def test_sin_argumento_usa_la_hora_actual_en_horario_laboral():
    assert en_modo_consulta() is False


@pytest.fixture
def horario_que_cruza_medianoche(monkeypatch):
    monkeypatch.setattr(horario, "HORA_INICIO_SOLO_CONSULTA", time(22, 0, 0))
    monkeypatch.setattr(horario, "HORA_FIN_SOLO_CONSULTA", time(5, 59, 59))


@pytest.mark.parametrize(
    ("ahora", "esperado"),
    [
        (_la_paz(22, 0, 0), True),
        (_la_paz(23, 30), True),
        (_la_paz(0, 0, 0), True),
        (_la_paz(5, 59, 59), True),
        (_la_paz(6, 0, 0), False),
        (_la_paz(21, 59, 59), False),
        (_la_paz(14, 0), False),
    ],
)
def test_horario_que_cruza_medianoche(horario_que_cruza_medianoche, ahora, esperado):
    assert en_modo_consulta(ahora) is esperado
