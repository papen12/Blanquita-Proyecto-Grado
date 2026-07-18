from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PausarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoPausaProduccion: Optional[str] = None


class PausarProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str] = None
    FechaHoraReanudacion: Optional[datetime] = None
    IdEstadoProduccion: int