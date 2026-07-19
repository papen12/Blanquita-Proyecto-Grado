from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VerProduccionBobinaTuboRequest(BaseModel):
    IdTipoBobina: Optional[int] = None


class VerProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    IdTipoBobina: int
    NombreTipoBobina: str
    NombreEstadoProduccion: str
    CodigoBobina1: str
    CodigoBobina2: str
    NombreTurno: str
    FechaInicioProduccion: datetime
    CantidadLogsActual: int