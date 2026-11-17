from datetime import date, datetime

from pydantic import BaseModel, Field


class IniciarConteoProductoTerminadoRequest(BaseModel):
    Motivo: str


class CantidadConteoItem(BaseModel):
    IdPresentacion: int = Field(..., gt=0)
    CantidadFisica: int


class RegistrarCantidadesConteoRequest(BaseModel):
    Cantidades: list[CantidadConteoItem]


class MotivoDiferenciaItem(BaseModel):
    IdPresentacion: int = Field(..., gt=0)
    Motivo: str


class CerrarConteoProductoTerminadoRequest(BaseModel):
    Motivos: list[MotivoDiferenciaItem] = []
    Reconteos: list[int] = []
    Confirmado: bool = False


class AnularConteoProductoTerminadoRequest(BaseModel):
    Motivo: str
    Confirmado: bool = False


class DetalleConteoProductoTerminadoResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    IdProducto: int
    NombreProducto: str
    NombrePresentacion: str
    Unidad: str
    TipoContenedor: str
    CantidadPorUnidadTerminada: int | None
    Activo: bool
    CantidadSistema: int
    CantidadFisica: int | None
    Diferencia: int | None
    TipoDiferencia: str | None
    PorcentajeDiferencia: float | None
    Nivel: str | None
    RequiereReconteo: bool
    MotivoDiferencia: str | None
    UsuarioConteo: str | None
    FechaHoraConteo: datetime | None
    IdMovimientoProductoTerminado: int | None


class IndicadorLineaConteoResponse(BaseModel):
    IdProducto: int
    NombreProducto: str
    Unidad: str
    CantidadSistema: int
    Faltante: int
    Sobrante: int
    PorcentajeDiferencia: float
    PorcentajeFaltante: float
    PorcentajeSobrante: float
    Nivel: str


class IndicadoresConteoResponse(BaseModel):
    PorcentajeDiferencia: float
    PorcentajeFaltante: float
    PorcentajeSobrante: float
    Nivel: str
    PorcentajeAdecuado: int
    PorcentajeAtencion: int
    Lineas: list[IndicadorLineaConteoResponse]


class ResumenConteoProductoTerminadoResponse(BaseModel):
    IdConteoProductoTerminado: int
    Estado: str
    UsuarioInicio: str
    FechaHoraInicio: datetime
    MotivoInicio: str
    UsuarioCierre: str | None
    FechaHoraCierre: datetime | None
    MotivoAnulacion: str | None
    TotalPresentaciones: int
    Contadas: int
    ConDiferencia: int
    Faltante: int
    Sobrante: int
    Atrasado: bool
    Indicadores: IndicadoresConteoResponse | None = None


class ConteoProductoTerminadoResponse(ResumenConteoProductoTerminadoResponse):
    Detalle: list[DetalleConteoProductoTerminadoResponse]


class EstadoConteoProductoTerminadoResponse(BaseModel):
    Abierto: bool
    HorasAlerta: int
    Conteo: ConteoProductoTerminadoResponse | None = None


class AjusteManualConteoResponse(BaseModel):
    IdMovimientoProductoTerminado: int
    FechaMovimiento: datetime
    CodigoPresentacion: str
    NombrePresentacion: str
    NombreTipoMovimientoInventario: str
    Cantidad: int
    Usuario: str
    Observacion: str | None


class ActaConteoProductoTerminadoResponse(ConteoProductoTerminadoResponse):
    AjustesManualesDesde: datetime | None
    AjustesManuales: list[AjusteManualConteoResponse]


class DiferenciaPresentacionConteoResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    NombreProducto: str
    NombrePresentacion: str
    Unidad: str
    VecesConDiferencia: int
    Faltante: int
    Sobrante: int


class ReporteConteosProductoTerminadoResponse(BaseModel):
    PeriodoInicio: date
    PeriodoFin: date
    Estados: list[str]
    Conteos: list[ResumenConteoProductoTerminadoResponse]
    Presentaciones: list[DiferenciaPresentacionConteoResponse]


class HojaConteoPresentacionResponse(BaseModel):
    IdPresentacion: int
    CodigoPresentacion: str
    IdProducto: int
    NombreProducto: str
    NombrePresentacion: str
    Unidad: str
    TipoContenedor: str
    CantidadPorUnidadTerminada: int | None
    Activo: bool


class HojaConteoProductoTerminadoResponse(BaseModel):
    FechaGeneracion: datetime
    IdConteoProductoTerminado: int | None
    FechaHoraInicio: datetime | None
    Presentaciones: list[HojaConteoPresentacionResponse]
