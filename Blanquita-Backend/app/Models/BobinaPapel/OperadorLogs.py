from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class InsertarMovimientoOperadorLogsRequest(BaseModel):
    IdProduccionBobinaTubo: int
    IdTipoMovimientoOperadorLogs: int
    IdUsuario: int
    CantidadLogs: int
    Observacion: Optional[str] = None


class InsertarMovimientoOperadorLogsResponse(BaseModel):
    IdMovimientoOperadorLogs: int
    IdProduccionBobinaTubo: int
    IdTipoMovimientoOperadorLogs: int
    CantidadLogs: int
    CantidadTotalActual: int
    FechaMovimiento: datetime