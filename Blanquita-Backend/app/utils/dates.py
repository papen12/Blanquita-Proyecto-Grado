from datetime import datetime, timezone
from zoneinfo import ZoneInfo

ZONA_BOLIVIA = ZoneInfo("America/La_Paz")


def date_formatter(fecha_utc: str | int | float | datetime) -> str:
    if isinstance(fecha_utc, datetime):
        fecha = fecha_utc
    elif isinstance(fecha_utc, (int, float)):
        fecha = datetime.fromtimestamp(fecha_utc / 1000, tz=timezone.utc)
    else:
        fecha = datetime.fromisoformat(fecha_utc.replace("Z", "+00:00"))

    if fecha.tzinfo is None:
        fecha = fecha.replace(tzinfo=timezone.utc)

    return fecha.astimezone(ZONA_BOLIVIA).strftime("%d/%m/%Y, %H:%M:%S")