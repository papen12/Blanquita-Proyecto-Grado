
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


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



class VerBobinasPapelFueraInventarioResponse(BaseModel):
    IdBobinaPapel: int
    CodigoBobina: str
    NombreTipoBobina: str
    PesoBrutoKg: Optional[float]
    Gramaje: Optional[float]
    NombreProveedor: str
    FechaRecepcion: date
    UltimaObservacion: Optional[str]
    FechaUltimoMovimiento: Optional[datetime]



class VerBobinasPapelFueraInventarioResponse(BaseModel):
    IdBobinaPapel: int
    CodigoBobina: str
    NombreTipoBobina: str
    PesoBrutoKg: Optional[float]
    Gramaje: Optional[float]
    NombreProveedor: str
    FechaRecepcion: date
    UltimaObservacion: Optional[str]
    FechaUltimoMovimiento: Optional[datetime]






class DarDeBajaBobinaRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class DarDeBajaBobinaResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime