from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReanudarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int


class ReanudarProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str] = None
    FechaHoraReanudacion: datetime
    IdEstadoProduccion: int