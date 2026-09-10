from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ReporteInventarioBobinaPapelRequest(BaseModel):
    IdsTipoBobina: Optional[list[int]] = None


class ReporteInventarioResumenTipoResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    CantidadBobinas: int
    PesoNetoTotalKg: Decimal
    GramajePromedio: Decimal
    RecepcionMasAntigua: Optional[date]
    RecepcionMasReciente: Optional[date]


class ReporteInventarioBobinaResponse(BaseModel):
    IdTipoBobina: int
    NombreTipoBobina: str
    IdBobinaPapel: int
    CodigoBobina: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    PesoBrutoKg: Optional[Decimal]
    PesoNetoKg: Optional[Decimal]
    Gramaje: Optional[Decimal]


class ReporteInventarioBobinaPapelResponse(BaseModel):
    FechaGeneracion: datetime
    TotalBobinas: int
    PesoNetoGeneralKg: Decimal
    Resumen: list[ReporteInventarioResumenTipoResponse]
    Bobinas: list[ReporteInventarioBobinaResponse]
