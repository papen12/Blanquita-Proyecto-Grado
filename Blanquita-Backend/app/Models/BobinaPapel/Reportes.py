from datetime import date, datetime, timedelta
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


class VerProduccionesBobinaTuboRequest(BaseModel):
    FechaInicio: Optional[date] = None
    FechaFin: Optional[date] = None
    IdTurno: Optional[int] = None
    IdsTipoBobina: Optional[list[int]] = None
    CodigoBobina: Optional[str] = None
    Operador: Optional[str] = None
    IdEstadoProduccion: Optional[int] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class ProduccionBobinaTuboCatalogoResponse(BaseModel):
    IdProduccionBobinaTubo: int
    NombreEstadoProduccion: str
    NombreTurno: str
    Operador: str
    Ci: str
    NombreRol: str
    TipoBobina: str
    CodigoBobina1: str
    CodigoBobina2: str
    FechaInicioProduccion: datetime
    FechaFinProduccion: Optional[datetime]
    DuracionTotal: Optional[timedelta]
    CantidadLogsActual: int


class VerProduccionesBobinaTuboResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Producciones: list[ProduccionBobinaTuboCatalogoResponse]


class ReporteProduccionBobinaTuboDetalleRequest(BaseModel):
    IdProduccion: int
    VerPausas: bool = False


class PausaProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    CodigoBobina1: str
    CodigoBobina2: str
    NombreTurno: str
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str]
    FechaHoraReanudacion: Optional[datetime]
    DuracionPausa: Optional[timedelta]
    OperadorPausa: str
    RolPausa: str
    EstadoPausa: str


class ReporteProduccionBobinaTuboDetalleResponse(BaseModel):
    IdProduccionBobinaTubo: int
    NombreEstadoProduccion: str
    NombreTurno: str
    Operador: str
    Ci: str
    NombreRol: str
    TipoBobina: str
    CodigoBobina1: str
    PesoNeto1: Optional[Decimal]
    Gramaje1: Optional[Decimal]
    Proveedor1: str
    Recepcion1: date
    CodigoBobina2: str
    PesoNeto2: Optional[Decimal]
    Gramaje2: Optional[Decimal]
    Proveedor2: str
    Recepcion2: date
    FechaInicioProduccion: datetime
    FechaFinProduccion: Optional[datetime]
    DuracionTotal: Optional[timedelta]
    CantidadLogsActual: int
    Pausas: Optional[list[PausaProduccionBobinaTuboResponse]] = None
    TotalTiempoPausado: Optional[timedelta] = None


class VerLotesBobinaPapelRequest(BaseModel):
    FechaInicio: Optional[date] = None
    FechaFin: Optional[date] = None
    IdProveedor: Optional[int] = None
    IdsTipoBobina: Optional[list[int]] = None
    Pagina: int = 1
    TamanoPagina: int = 50


class LoteBobinaPapelCatalogoResponse(BaseModel):
    IdLoteBobina: int
    FechaRecepcion: date
    NombreProveedor: str
    CantidadBobinas: int


class VerLotesBobinaPapelResponse(BaseModel):
    Total: int
    Pagina: int
    TamanoPagina: int
    Lotes: list[LoteBobinaPapelCatalogoResponse]


class ReporteLoteBobinaPapelDetalleRequest(BaseModel):
    IdLoteBobina: int


class BobinaLoteDetalleResponse(BaseModel):
    CodigoBobina: str
    NombreTipoBobina: str
    PesoBrutoKg: Optional[Decimal]
    Gramaje: Optional[Decimal]
    PesoNetoKg: Optional[Decimal]


class ReporteLoteBobinaPapelDetalleResponse(BaseModel):
    IdLoteBobina: int
    FechaRecepcion: date
    NombreProveedor: str
    CantidadBobinas: int
    Ci: str
    PrimerNombre: str
    ApellidoPaterno: str
    NombreRol: str
    Bobinas: list[BobinaLoteDetalleResponse]


class ReporteCancelacionProduccionBobinaTuboRequest(BaseModel):
    IdProduccion: int


class CancelacionProduccionBobinaTuboResponse(BaseModel):
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str]
    Ci: str
    Operador: str
    NombreRol: str


class ReporteCancelacionProduccionBobinaTuboResponse(
    ReporteProduccionBobinaTuboDetalleResponse
):
    Pausas: list[PausaProduccionBobinaTuboResponse]
    TotalTiempoPausado: timedelta
    Cancelacion: CancelacionProduccionBobinaTuboResponse


class ReporteProduccionPorPeriodoRequest(BaseModel):
    FechaInicio: date
    FechaFin: date
    VerCancelaciones: bool = False


class PausaPorMotivoResponse(BaseModel):
    Motivo: str
    CantidadPausas: int
    TiempoTotal: timedelta


class CancelacionPeriodoResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str]
    Ci: str
    PrimerNombre: str
    ApellidoPaterno: str
    NombreRol: str


class ReporteProduccionPorPeriodoResponse(BaseModel):
    PeriodoInicio: date
    PeriodoFin: date
    TotalProducciones: int
    TotalLogs: int
    Producciones: list[ProduccionBobinaTuboCatalogoResponse]
    PausasPorMotivo: list[PausaPorMotivoResponse]
    TotalPausas: int
    TotalTiempoPausado: timedelta
    Cancelaciones: Optional[list[CancelacionPeriodoResponse]] = None
