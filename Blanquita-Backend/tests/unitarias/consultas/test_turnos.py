from datetime import datetime, time
from zoneinfo import ZoneInfo

import pytest
import time_machine

from app.Constants.Turno import TURNO_HORAS_EXTRA, TURNO_MANANA, TURNO_TARDE
from app.Repository.Consultas import _turno_cubre_hora, turno_actual, turno_de_hora
from tests.dobles.consultas import (
    TURNO_MANANA_BD,
    TURNO_TARDE_BD,
    TURNOS_BD,
    TURNOS_SEMILLA,
    CallerStub,
)

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]

LA_PAZ = ZoneInfo("America/La_Paz")


@pytest.mark.parametrize(
    ("hora", "id_turno"),
    [
        (time(6, 0, 0), TURNO_MANANA),
        (time(9, 30), TURNO_MANANA),
        (time(11, 59, 59), TURNO_MANANA),
        (time(12, 0, 0), TURNO_TARDE),
        (time(15, 0, 0), TURNO_TARDE),
        (time(15, 1, 0), TURNO_HORAS_EXTRA),
        (time(20, 0), TURNO_HORAS_EXTRA),
        (time(23, 59, 59), TURNO_HORAS_EXTRA),
    ],
)
def test_turno_segun_la_hora(hora, id_turno):
    assert turno_de_hora(TURNOS_BD, hora)["IdTurno"] == id_turno


@pytest.mark.parametrize("hora", [time(0, 0, 0), time(3, 0), time(5, 59, 59)])
def test_madrugada_cae_en_horas_extra(hora):
    assert turno_de_hora(TURNOS_BD, hora)["IdTurno"] == TURNO_HORAS_EXTRA


def test_hueco_entre_tarde_y_horas_extra_cae_en_horas_extra():
    assert turno_de_hora(TURNOS_BD, time(15, 0, 30))["IdTurno"] == TURNO_HORAS_EXTRA


@pytest.mark.parametrize(
    ("hora", "id_turno"),
    [
        (time(3, 0), TURNO_HORAS_EXTRA),
        (time(5, 59, 59), TURNO_HORAS_EXTRA),
        (time(6, 0, 0), TURNO_MANANA),
        (time(16, 0), TURNO_HORAS_EXTRA),
    ],
)
def test_horas_extra_que_cruza_medianoche_como_en_la_semilla(hora, id_turno):
    assert turno_de_hora(TURNOS_SEMILLA, hora)["IdTurno"] == id_turno


def test_sin_turnos_devuelve_none():
    assert turno_de_hora([], time(9, 0)) is None


def test_sin_horas_extra_usa_el_ultimo_turno():
    assert turno_de_hora([TURNO_MANANA_BD, TURNO_TARDE_BD], time(20, 0)) is TURNO_TARDE_BD


def test_turno_que_no_cruza_medianoche_cubre_sus_extremos():
    assert _turno_cubre_hora(TURNO_MANANA_BD, time(6, 0, 0)) is True
    assert _turno_cubre_hora(TURNO_MANANA_BD, time(11, 59, 59)) is True
    assert _turno_cubre_hora(TURNO_MANANA_BD, time(12, 0, 0)) is False


def test_turno_que_cruza_medianoche():
    nocturno = {"IdTurno": 9, "HoraInicio": time(22, 0), "HoraFin": time(5, 59, 59)}

    assert _turno_cubre_hora(nocturno, time(22, 0)) is True
    assert _turno_cubre_hora(nocturno, time(2, 0)) is True
    assert _turno_cubre_hora(nocturno, time(6, 0)) is False
    assert _turno_cubre_hora(nocturno, time(21, 59, 59)) is False


@time_machine.travel(datetime(2026, 10, 27, 13, 20, 45, 999999, tzinfo=LA_PAZ), tick=False)
def test_turno_actual_usa_la_hora_de_la_paz_y_consulta_una_vez():
    caller = CallerStub(TURNOS_BD)

    assert turno_actual(caller)["IdTurno"] == TURNO_TARDE
    assert len(caller.consultas) == 1


@time_machine.travel(datetime(2026, 10, 27, 12, 30, tzinfo=ZoneInfo("UTC")), tick=False)
def test_turno_actual_convierte_desde_utc():
    assert turno_actual(CallerStub(TURNOS_BD))["IdTurno"] == TURNO_MANANA


@time_machine.travel(datetime(2026, 10, 27, 11, 59, 59, 900000, tzinfo=LA_PAZ), tick=False)
def test_turno_actual_descarta_los_microsegundos():
    assert turno_actual(CallerStub(TURNOS_BD))["IdTurno"] == TURNO_MANANA


def test_turno_actual_solo_pide_los_turnos_del_sistema():
    caller = CallerStub(TURNOS_BD)

    turno_actual(caller)
    consulta = str(caller.consultas[0].compile(compile_kwargs={"literal_binds": True}))

    assert '"Turno"."IdTurno" IN (1, 2, 3)' in consulta


def test_turno_actual_sin_turnos_devuelve_none():
    assert turno_actual(CallerStub([])) is None
