from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CancelarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoCancelacion: Optional[str] = None


class CancelarProduccionBobinaTuboResponse(BaseModel):
    IdCancelacionProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str] = None
    IdEstadoProduccion: int