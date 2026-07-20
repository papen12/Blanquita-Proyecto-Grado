from datetime import datetime
from pydantic import BaseModel


class IniciarProduccionPalletRequest(BaseModel):
    IdPallet: int


class IniciarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str