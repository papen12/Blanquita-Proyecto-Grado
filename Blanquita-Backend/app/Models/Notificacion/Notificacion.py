from datetime import time

from pydantic import BaseModel

from app.Models.AlertaStock.AlertaStock import UmbralStockItem
from app.Models.BobinaPapel.Inicio import (
    PausaAbiertaInicioBobinaPapel,
    PospuestaInicioBobinaPapel,
    ProduccionActivaInicioBobinaPapel,
)
from app.Models.BobinaServilleta.Inicio import (
    PausaAbiertaInicioBobinaServilleta,
    PospuestaInicioBobinaServilleta,
    ProduccionActivaInicioBobinaServilleta,
)
from app.Models.InventarioFinal.Conteo import ResumenConteoProductoTerminadoResponse
from app.Models.InventarioFinal.ProductoFinal import EstadoBloqueoProductoTerminadoResponse


class StockNotificaciones(BaseModel):
    SinStock: list[UmbralStockItem]
    Criticos: list[UmbralStockItem]


class ProduccionBobinaPapelNotificaciones(BaseModel):
    Activas: list[ProduccionActivaInicioBobinaPapel]
    Pausadas: list[PausaAbiertaInicioBobinaPapel]
    Pospuestas: list[PospuestaInicioBobinaPapel]


class ProduccionBobinaServilletaNotificaciones(BaseModel):
    Activas: list[ProduccionActivaInicioBobinaServilleta]
    Pausadas: list[PausaAbiertaInicioBobinaServilleta]
    Pospuestas: list[PospuestaInicioBobinaServilleta]


class ModoConsultaNotificaciones(BaseModel):
    HoraInicio: time
    HoraFin: time


class NotificacionesResponse(BaseModel):
    ModoConsulta: ModoConsultaNotificaciones | None
    Stock: StockNotificaciones | None
    BloqueoProductoTerminado: EstadoBloqueoProductoTerminadoResponse | None
    ConteoProductoTerminado: ResumenConteoProductoTerminadoResponse | None
    HorasAlertaConteo: int
    BobinaPapel: ProduccionBobinaPapelNotificaciones
    BobinaServilleta: ProduccionBobinaServilletaNotificaciones
    HorasAlertaPausa: int
    Atrasadas: int
    Total: int
