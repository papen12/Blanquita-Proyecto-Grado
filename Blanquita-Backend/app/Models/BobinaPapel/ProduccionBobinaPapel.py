from datetime import datetime
from typing import Optional

from pydantic import BaseModel,Field


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


class FinalizarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int


class FinalizarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str


class CancelarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoCancelacion: Optional[str] = None


class CancelarProduccionBobinaTuboResponse(BaseModel):
    IdCancelacionProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str] = None
    IdEstadoProduccion: int


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


class InsertarMovimientoOperadorLogsRequest(BaseModel):
    IdProduccionBobinaTubo: int
    IdTipoMovimientoOperadorLogs: int
    CantidadLogs: int=Field(ge=1)
    Observacion: Optional[str] = None


class InsertarMovimientoOperadorLogsResponse(BaseModel):
    IdMovimientoOperadorLogs: int
    IdProduccionBobinaTubo: int
    IdTipoMovimientoOperadorLogs: int
    CantidadLogs: int
    CantidadTotalActual: int
    FechaMovimiento: datetime