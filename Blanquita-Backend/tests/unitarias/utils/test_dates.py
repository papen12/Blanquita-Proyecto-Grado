from datetime import datetime, timezone
from zoneinfo import ZoneInfo

import pytest

from app.utils.dates import date_formatter

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]


def test_cadena_iso_con_z_se_muestra_en_hora_de_la_paz():
    assert date_formatter("2026-10-27T14:30:00Z") == "27/10/2026, 10:30:00"


def test_cadena_iso_con_desplazamiento_se_respeta():
    assert date_formatter("2026-10-27T14:30:00+00:00") == "27/10/2026, 10:30:00"


def test_cadena_iso_sin_zona_se_asume_utc():
    assert date_formatter("2026-10-27T14:30:00") == "27/10/2026, 10:30:00"


def test_datetime_utc_se_convierte_a_la_paz():
    assert date_formatter(datetime(2026, 10, 27, 2, 5, 9, tzinfo=timezone.utc)) == "26/10/2026, 22:05:09"


def test_datetime_sin_zona_se_asume_utc():
    assert date_formatter(datetime(2026, 10, 27, 4, 0, 0)) == "27/10/2026, 00:00:00"


def test_datetime_en_la_paz_no_cambia():
    fecha = datetime(2026, 10, 27, 8, 0, 0, tzinfo=ZoneInfo("America/La_Paz"))

    assert date_formatter(fecha) == "27/10/2026, 08:00:00"


def test_timestamp_en_milisegundos():
    milisegundos = datetime(2026, 10, 27, 14, 30, tzinfo=timezone.utc).timestamp() * 1000

    assert date_formatter(int(milisegundos)) == "27/10/2026, 10:30:00"
    assert date_formatter(milisegundos) == "27/10/2026, 10:30:00"
