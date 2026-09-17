from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class VerRodelasRequest(BaseModel):
    CodigoRodela: Optional[str] = None
    IdProveedor: Optional[int] = None
    IdsTipoRodela: Optional[list[int]] = None
    IdEstadoMateriaPrima: Optional[int] = None
    IdRodela: Optional[int] = None
    IdLoteRodela: Optional[int] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class RodelaCatalogoResponse(BaseModel):
    IdRodela: int
    CodigoRodela: str
    TipoEstado: str
    NombreTipoRodela: str
    NombreProveedor: str
    FechaRecepcion: date
    IdLoteRodela: int


class VerRodelasResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Rodelas: list[RodelaCatalogoResponse]


class ReporteInventarioRodelaRequest(BaseModel):
    IdsTipoRodela: Optional[list[int]] = None


class ReporteInventarioResumenTipoRodelaResponse(BaseModel):
    IdTipoRodela: int
    NombreTipoRodela: str
    CantidadRodelas: int
    RecepcionMasAntigua: Optional[date]
    RecepcionMasReciente: Optional[date]


class ReporteInventarioRodelaDetalleResponse(BaseModel):
    IdTipoRodela: int
    NombreTipoRodela: str
    IdRodela: int
    CodigoRodela: str
    IdLoteRodela: int
    FechaRecepcion: date
    NombreProveedor: str


class ReporteInventarioRodelaResponse(BaseModel):
    FechaGeneracion: datetime
    TotalRodelas: int
    Resumen: list[ReporteInventarioResumenTipoRodelaResponse]
    Rodelas: list[ReporteInventarioRodelaDetalleResponse]


class ReporteHistorialMovimientosRodelaRequest(BaseModel):
    IdRodela: int


class MovimientoRodelaResponse(BaseModel):
    IdMovimientoRodela: int
    NombreMovimiento: str
    FechaMovimiento: datetime
    Observacion: Optional[str]
    Ci: str
    PrimerNombre: str
    ApellidoPaterno: str
    NombreRol: str


class ReporteHistorialMovimientosRodelaResponse(BaseModel):
    IdRodela: int
    CodigoRodela: str
    NombreTipoRodela: str
    TipoEstado: str
    Movimientos: list[MovimientoRodelaResponse]


class VerLotesRodelaRequest(BaseModel):
    FechaInicio: Optional[date] = None
    FechaFin: Optional[date] = None
    IdProveedor: Optional[int] = None
    IdsTipoRodela: Optional[list[int]] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class LoteRodelaCatalogoResponse(BaseModel):
    IdLoteRodela: int
    FechaRecepcion: date
    NombreProveedor: str
    CantidadRodelas: int


class VerLotesRodelaResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Lotes: list[LoteRodelaCatalogoResponse]


class ReporteLoteRodelaDetalleRequest(BaseModel):
    IdLoteRodela: int


class RodelaLoteDetalleResponse(BaseModel):
    CodigoRodela: str
    NombreTipoRodela: str
    TipoEstado: str


class ReporteLoteRodelaDetalleResponse(BaseModel):
    IdLoteRodela: int
    FechaRecepcion: date
    NombreProveedor: str
    CantidadRodelas: int
    Rodelas: list[RodelaLoteDetalleResponse]


class ReporteLotesRodelaPorPeriodoRequest(BaseModel):
    FechaInicio: date
    FechaFin: date


class ReporteLotesRodelaPorPeriodoResponse(BaseModel):
    PeriodoInicio: date
    PeriodoFin: date
    TotalLotes: int
    TotalRodelas: int
    Lotes: list[ReporteLoteRodelaDetalleResponse]
