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


class CancelarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int
    MotivoCancelacion: str | None = None


class CancelarProduccionPalletResponse(BaseModel):
    IdCancelacionProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: str | None
    IdEstadoProduccion: int






class DarDeBajaPalletRequest(BaseModel):
    IdPallet: int
    Observacion: str | None = None


class DarDeBajaPalletResponse(BaseModel):
    IdPallet: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime



class VerProduccionPalletRequest(BaseModel):
    IdTipoPallet: int | None = None


class VerProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    NombreEstadoProduccion: str
    CodigoPallet: str
    IdTipoPallet: int
    NombreTurno: str
    FechaInicioProduccion: datetime

class VerPausasProduccionPalletActivasRequest(BaseModel):
    IdTipoPallet: int | None = None


class VerPausasProduccionPalletActivasResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    CodigoPallet: str
    IdTipoPallet: int
    FechaHoraPausa: datetime
    NombreEstadoProduccion: str