from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


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