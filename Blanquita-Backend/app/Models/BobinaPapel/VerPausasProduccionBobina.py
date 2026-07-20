from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class VerPausasProduccionBobinaTuboActivasRequest(BaseModel):
    FiltroIdTipoBobina: Optional[int] = None


class VerPausasProduccionBobinaTuboActivasResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    CodigoBobina1: str
    CodigoBobina2: str
    FechaHoraPausa: datetime
    NombreEstadoProduccion: str
    CantidadLogsActual: int