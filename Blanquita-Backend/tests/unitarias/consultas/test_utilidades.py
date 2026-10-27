from datetime import date, timedelta
from types import SimpleNamespace

import pytest
from sqlalchemy import column
from sqlalchemy.dialects import postgresql

from app.Repository.Consultas import filtro_rango, nombre_operador

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]

FECHA = column("FechaMovimiento")


def test_nombre_operador_une_primer_nombre_y_apellido_paterno():
    usuario = SimpleNamespace(PrimerNombre="Carlos", ApellidoPaterno="Pérez", SegundoNombre="Luis")

    assert nombre_operador(usuario) == "Carlos Pérez"


def test_filtro_rango_sin_fechas_no_agrega_condiciones():
    assert filtro_rango(FECHA, None, None) == []


def test_filtro_rango_solo_con_inicio():
    inicio = date(2026, 10, 1)

    condiciones = filtro_rango(FECHA, inicio, None)

    assert len(condiciones) == 1
    assert condiciones[0].right.value == inicio


def test_filtro_rango_incluye_todo_el_dia_final():
    fin = date(2026, 10, 27)

    condiciones = filtro_rango(FECHA, None, fin)

    assert len(condiciones) == 1
    assert condiciones[0].right.value == fin + timedelta(days=1)
    assert " < " in str(condiciones[0].compile(dialect=postgresql.dialect()))


def test_filtro_rango_convierte_la_columna_a_hora_de_la_paz():
    condiciones = filtro_rango(FECHA, date(2026, 10, 1), date(2026, 10, 27))
    sql = [str(c.compile(dialect=postgresql.dialect(), compile_kwargs={"literal_binds": True})) for c in condiciones]

    assert len(sql) == 2
    assert all("timezone('America/La_Paz', \"FechaMovimiento\")" in s for s in sql)
    assert " >= '2026-10-01'" in sql[0]
    assert " < '2026-10-28'" in sql[1]
