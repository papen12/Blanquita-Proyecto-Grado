from datetime import datetime, timezone

from app.Constants.Estados import ESTADO_MATERIA_PRIMA_EN_ALMACEN, ESTADO_PRODUCCION_EN_PRODUCCION
from app.Schemas.BobinaPapel import BobinaPapel
from app.Schemas.BobinaServilleta import BobinaServilleta, SubBobinaServilleta
from app.Schemas.Produccion import (
    PausaProduccionBobinaTubo,
    PausaProduccionServilleta,
    ProduccionBobinaTubo,
    ProduccionServilleta,
)

ID_TIPO_HIGIENICO = 1
ID_TIPO_TOALLA = 2

PRODUCTO_LUX = {"IdProducto": 1, "NombreProducto": "Luxury", "Activo": True}
PRODUCTO_ECO = {"IdProducto": 2, "NombreProducto": "EcoPack", "Activo": True}
PRODUCTO_INACTIVO = {"IdProducto": 3, "NombreProducto": "Descontinuado", "Activo": False}

TURNO_MANANA = {"IdTurno": 1, "NombreTurno": "Mañana"}

FECHA_BASE = datetime(2026, 10, 27, 12, 0, tzinfo=timezone.utc)


def crear_bobina(
    id_bobina: int,
    id_tipo: int = ID_TIPO_HIGIENICO,
    id_estado: int = ESTADO_MATERIA_PRIMA_EN_ALMACEN,
) -> BobinaPapel:
    return BobinaPapel(
        IdBobinaPapel=id_bobina,
        CodigoBobina=f"BP-{id_bobina:04d}",
        IdTipoBobina=id_tipo,
        IdLoteBobina=1,
        IdEstadoMateriaPrima=id_estado,
    )


def crear_produccion(
    id_produccion: int = 10,
    id_estado: int = ESTADO_PRODUCCION_EN_PRODUCCION,
    logs: int = 0,
    id_bobina_1: int = 1,
    id_bobina_2: int = 2,
    id_producto: int = PRODUCTO_LUX["IdProducto"],
) -> ProduccionBobinaTubo:
    return ProduccionBobinaTubo(
        IdProduccionBobinaTubo=id_produccion,
        IdEstadoProduccion=id_estado,
        IdUsuario=1,
        IdBobina_1=id_bobina_1,
        IdBobina_2=id_bobina_2,
        IdTurno=TURNO_MANANA["IdTurno"],
        IdProducto=id_producto,
        FechaInicioProduccion=FECHA_BASE,
        CantidadLogsActual=logs,
    )


def crear_pausa(id_pausa: int = 50, id_produccion: int = 10, motivo: str = "Falta de pegamento") -> PausaProduccionBobinaTubo:
    return PausaProduccionBobinaTubo(
        IdPausaProduccionBobinaTubo=id_pausa,
        IdProduccionBobinaTubo=id_produccion,
        IdUsuario=1,
        FechaHoraPausa=FECHA_BASE,
        MotivoPausaProduccion=motivo,
    )


ID_MEDIDA_435 = 1
ID_MEDIDA_220 = 2

COMPOSICION_G18 = [
    {"IdUnidadBobinaServilleta": 11, "IdTipoMedidaSubBobina": ID_MEDIDA_435, "MedidaMm": 435, "Cantidad": 3},
    {"IdUnidadBobinaServilleta": 12, "IdTipoMedidaSubBobina": ID_MEDIDA_435, "MedidaMm": 435, "Cantidad": 2},
    {"IdUnidadBobinaServilleta": 12, "IdTipoMedidaSubBobina": ID_MEDIDA_220, "MedidaMm": 220, "Cantidad": 1},
]


def crear_bobina_servilleta(id_bobina: int = 1, id_estado: int = ESTADO_MATERIA_PRIMA_EN_ALMACEN) -> BobinaServilleta:
    return BobinaServilleta(
        IdBobinaServilleta=id_bobina,
        IdLoteBobinaServilleta=1,
        IdTipoBobinaServilleta=1,
        IdEstadoMateriaPrima=id_estado,
    )


def crear_sub_bobina(
    id_sub: int = 30,
    id_medida: int = ID_MEDIDA_435,
    id_estado: int = ESTADO_MATERIA_PRIMA_EN_ALMACEN,
) -> SubBobinaServilleta:
    return SubBobinaServilleta(
        IdSubBobinaServilleta=id_sub,
        IdUnidadBobinaServilleta=11,
        IdTipoMedidaSubBobina=id_medida,
        IdEstadoMateriaPrima=id_estado,
    )


def crear_produccion_servilleta(
    id_produccion: int = 20,
    id_estado: int = ESTADO_PRODUCCION_EN_PRODUCCION,
    id_sub: int = 30,
) -> ProduccionServilleta:
    return ProduccionServilleta(
        IdProduccionServilleta=id_produccion,
        IdEstadoProduccion=id_estado,
        IdUsuario=1,
        IdSubBobina=id_sub,
        IdTurno=TURNO_MANANA["IdTurno"],
        FechaInicioProduccion=FECHA_BASE,
    )


def crear_pausa_servilleta(id_pausa: int = 60, id_produccion: int = 20) -> PausaProduccionServilleta:
    return PausaProduccionServilleta(
        IdPausaProduccionServilleta=id_pausa,
        IdProduccionServilleta=id_produccion,
        IdUsuario=1,
        FechaHoraPausa=FECHA_BASE,
        MotivoPausaProduccion="Falta de personal",
    )
