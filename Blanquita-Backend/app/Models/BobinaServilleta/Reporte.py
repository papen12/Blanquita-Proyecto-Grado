from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ReporteInventarioBobinaServilletaRequest(BaseModel):
    IdsTipoBobinaServilleta: Optional[list[int]] = None


class ReporteInventarioResumenTipoServilletaResponse(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    CantidadBobinas: int
    PesoBrutoTotalKg: Decimal
    GramajePromedio: Decimal
    RecepcionMasAntigua: Optional[date]
    RecepcionMasReciente: Optional[date]


class ReporteInventarioBobinaServilletaDetalleResponse(BaseModel):
    IdTipoBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    IdBobinaServilleta: int
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    CodigoUnidad1: Optional[str]
    DescripcionFormato1: Optional[str]
    PesoBrutoKg1: Optional[Decimal]
    GramajeGr1: Optional[Decimal]
    CodigoUnidad2: Optional[str]
    DescripcionFormato2: Optional[str]
    PesoBrutoKg2: Optional[Decimal]
    GramajeGr2: Optional[Decimal]


class ReporteInventarioBobinaServilletaResponse(BaseModel):
    FechaGeneracion: datetime
    TotalBobinas: int
    PesoBrutoGeneralKg: Decimal
    Resumen: list[ReporteInventarioResumenTipoServilletaResponse]
    Bobinas: list[ReporteInventarioBobinaServilletaDetalleResponse]


class VerBobinasServilletaRequest(BaseModel):
    CodigoBobina: Optional[str] = None
    IdProveedor: Optional[int] = None
    IdTipoBobinaServilleta: Optional[int] = None
    IdEstadoMateriaPrima: Optional[int] = None
    IdBobinaServilleta: Optional[int] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class BobinaServilletaCatalogoResponse(BaseModel):
    IdBobinaServilleta: int
    TipoEstado: str
    NombreTipoBobinaServilleta: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    IdUnidad1: Optional[int]
    CodigoUnidad1: Optional[str]
    DescripcionFormato1: Optional[str]
    PesoBrutoKg1: Optional[Decimal]
    GramajeGr1: Optional[Decimal]
    IdUnidad2: Optional[int]
    CodigoUnidad2: Optional[str]
    DescripcionFormato2: Optional[str]
    PesoBrutoKg2: Optional[Decimal]
    GramajeGr2: Optional[Decimal]


class VerBobinasServilletaResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Bobinas: list[BobinaServilletaCatalogoResponse]


class VerSubBobinasServilletaRequest(BaseModel):
    CodigoBobina: Optional[str] = None
    IdProveedor: Optional[int] = None
    IdTipoBobinaServilleta: Optional[int] = None
    IdsTipoMedidaSubBobina: Optional[list[int]] = None
    IdEstadoMateriaPrima: Optional[int] = None
    IdBobinaServilleta: Optional[int] = None
    IdSubBobinaServilleta: Optional[int] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class SubBobinaServilletaCatalogoResponse(BaseModel):
    IdSubBobinaServilleta: int
    TipoEstado: str
    IdTipoMedidaSubBobina: int
    DescripcionMedida: str
    CantidadPorMedida: int
    CodigoBobina: str
    IdBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str


class VerSubBobinasServilletaResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    SubBobinas: list[SubBobinaServilletaCatalogoResponse]


class ReporteInventarioResumenMedidaResponse(BaseModel):
    IdTipoMedidaSubBobina: int
    NombreTipoMedida: str
    CantidadSubBobinas: int


class ReporteInventarioSubBobinaServilletaResponse(BaseModel):
    FechaGeneracion: datetime
    TotalSubBobinas: int
    Resumen: list[ReporteInventarioResumenMedidaResponse]
    SubBobinas: list[SubBobinaServilletaCatalogoResponse]


class ReporteHistorialMovimientosUnidadServilletaRequest(BaseModel):
    IdUnidadBobinaServilleta: int


class MovimientoSubBobinaHistorialResponse(BaseModel):
    IdMovimientoSubBobina: int
    IdSubBobinaServilleta: int
    NombreTipoMedida: str
    NombreMovimiento: str
    FechaMovimiento: datetime
    Observacion: Optional[str]
    Ci: str
    PrimerNombre: str
    ApellidoPaterno: str
    NombreRol: str


class ReporteHistorialMovimientosUnidadServilletaResponse(BaseModel):
    IdUnidadBobinaServilleta: int
    CodigoBobina: str
    DescripcionFormato: str
    PesoBrutoKg: Optional[Decimal]
    GramajeGr: Optional[Decimal]
    IdBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    TipoEstado: str
    Movimientos: list[MovimientoSubBobinaHistorialResponse]


class ReporteDetalleBobinaServilletaRequest(BaseModel):
    IdBobinaServilleta: int


class UnidadDetalleBobinaServilletaResponse(BaseModel):
    IdUnidadBobinaServilleta: int
    CodigoUnidad: str
    DescripcionFormato: str
    PesoBrutoKg: Optional[Decimal]
    GramajeGr: Optional[Decimal]
    Movimientos: list[MovimientoSubBobinaHistorialResponse]


class ReporteDetalleBobinaServilletaResponse(BaseModel):
    IdBobinaServilleta: int
    NombreTipoBobinaServilleta: str
    TipoEstado: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str
    Unidades: list[UnidadDetalleBobinaServilletaResponse]
