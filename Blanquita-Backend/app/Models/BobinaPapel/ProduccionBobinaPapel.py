from datetime import datetime
from pydantic import BaseModel
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class IniciarProduccionBobinaTuboRequest(BaseModel):
    IdBobina1: int
    IdBobina2: int

class IniciarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str



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





class ReanudarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int


class ReanudarProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str] = None
    FechaHoraReanudacion: datetime
    IdEstadoProduccion: int


class CancelarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoCancelacion: Optional[str] = None


class CancelarProduccionBobinaTuboResponse(BaseModel):
    IdCancelacionProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str] = None
    IdEstadoProduccion: int


class FinalizarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
class FinalizarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str


class ReingresarBobinaAInventarioRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class ReingresarBobinaAInventarioResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime

class DarDeBajaBobinaRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class DarDeBajaBobinaResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime