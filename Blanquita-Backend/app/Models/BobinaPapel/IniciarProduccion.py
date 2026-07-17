from datetime import datetime

from pydantic import BaseModel


class IniciarProduccionBobinaTuboRequest(BaseModel):
    IdBobina1: int
    IdBobina2: int
    IdUsuario: int


class IniciarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str