from decimal import Decimal
from pydantic import BaseModel
from datetime import date

class VerResumenInventarioBobinaPapelResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    CantidadBobinas: int
    PesoNetoTotalKg: Decimal
    GramajePromedio: Decimal

class VerDetalleInventarioBobinaPapelRequest(BaseModel):
    IdTipoBobina: int


class VerDetalleInventarioBobinaPapelResponse(BaseModel):
    IdBobinaPapel: int
    CodigoBobina: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    PesoBrutoKg: Decimal
    PesoNetoKg: Decimal
    Gramaje: Decimal