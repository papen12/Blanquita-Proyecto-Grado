from datetime import datetime
from pydantic import BaseModel


class IniciarProduccionPalletRequest(BaseModel):
    IdPallet: int


class IniciarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str



class PausaProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int
    MotivoPausaProduccion: str | None = None


class PausaProduccionPalletResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: str | None
    FechaHoraReanudacion: datetime | None
    IdEstadoProduccion: int



class ReanudarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int


class ReanudarProduccionPalletResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: str | None
    FechaHoraReanudacion: datetime
    IdEstadoProduccion: int



class FinalizarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int


class FinalizarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str