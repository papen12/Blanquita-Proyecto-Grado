from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class ReporteInventarioInsumoRequest(BaseModel):
    IdsTipoInsumo: Optional[list[int]] = None


class InventarioInsumoResponse(BaseModel):
    IdTipoInsumo: int
    NombreInsumo: str
    DescripcionInsumo: Optional[str]
    CantidadActual: int
    FechaUltimoMovimiento: Optional[datetime]


class ReporteInventarioInsumoResponse(BaseModel):
    FechaGeneracion: datetime
    TodosLosTipos: bool
    Insumos: list[InventarioInsumoResponse]


class ReporteMovimientosInsumoRequest(BaseModel):
    FechaInicio: date
    FechaFin: date
    IdsTipoInsumo: Optional[list[int]] = None


class MovimientoInsumoReporteResponse(BaseModel):
    IdMovimientoInsumo: int
    FechaMovimiento: datetime
    IdTipoInsumo: int
    NombreInsumo: str
    IdTipoMovimiento: int
    NombreMovimiento: str
    CantidadMovimiento: int
    Observacion: Optional[str]
    Ci: str
    PrimerNombre: str
    ApellidoPaterno: str
    NombreRol: str


class ResumenMovimientosInsumoResponse(BaseModel):
    IdTipoInsumo: int
    NombreInsumo: str
    Ingresos: int
    Salidas: int
    Neto: int
    NumeroMovimientos: int
    CantidadActual: int


class ReporteMovimientosInsumoResponse(BaseModel):
    PeriodoInicio: date
    PeriodoFin: date
    TodosLosTipos: bool
    Resumen: list[ResumenMovimientosInsumoResponse]
    Movimientos: list[MovimientoInsumoReporteResponse]
