from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class DarDeBajaBobinaRequest(BaseModel):
    IdBobinaPapel: int
    IdUsuario: int
    Observacion: Optional[str] = None


class DarDeBajaBobinaResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime