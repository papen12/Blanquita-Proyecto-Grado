from datetime import datetime
from pydantic import BaseModel
class FinalizarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
class FinalizarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str