from datetime import datetime, timezone
from decimal import Decimal
from itertools import count

from fastapi import HTTPException, status

from app.Constants.Estados import ESTADO_CONTEO_ABIERTO
from app.Schemas.Producto import (
    ConteoProductoTerminado,
    ConteoProductoTerminadoDetalle,
    InventarioProductoTerminado,
    MovimientoProductoTerminado,
    PresentacionProducto,
    Producto,
)

ID_LIDER = 2
ID_OPERADOR = 7
USUARIOS = {ID_LIDER: "Carlos Pérez", ID_OPERADOR: "Juan Mamani"}

ID_LUX_J24 = 1
ID_ECO_J12 = 2
ID_MRO_PLANCHA = 4
ID_LUX_INACTIVA = 9

FECHA_CONTEO = datetime(2026, 10, 27, 12, 30, tzinfo=timezone.utc)

NOMBRES_MOVIMIENTO = {
    1: "Entrada",
    2: "Salida",
    3: "Descuento",
    4: "Aumento",
    5: "Ajuste +",
    6: "Ajuste -",
}


def crear_producto(id_producto: int, nombre: str, activo: bool = True) -> Producto:
    return Producto(IdProducto=id_producto, NombreProducto=nombre, SiglasProducto=nombre[:3].upper(), Activo=activo)


def crear_presentacion(
    id_presentacion: int,
    producto: Producto,
    codigo: str,
    rollos: int | None = 24,
    contenedor: str = "Jaba",
    activo: bool = True,
) -> tuple[PresentacionProducto, Producto]:
    presentacion = PresentacionProducto(
        IdPresentacion=id_presentacion,
        IdProducto=producto.IdProducto,
        TipoContenedor=contenedor,
        CantidadRollosUnidades=rollos,
        CantidadPorUnidadTerminada=2,
        CodigoPresentacion=codigo,
        Activo=activo,
    )
    return presentacion, producto


def catalogo_presentaciones() -> dict[int, tuple[PresentacionProducto, Producto]]:
    luxury = crear_producto(1, "Luxury")
    ecopack = crear_producto(2, "EcoPack")
    megarollo = crear_producto(4, "MegaRollo")
    return {
        ID_LUX_J24: crear_presentacion(ID_LUX_J24, luxury, "LUX-J24"),
        ID_ECO_J12: crear_presentacion(ID_ECO_J12, ecopack, "ECO-J12", rollos=12),
        ID_MRO_PLANCHA: crear_presentacion(ID_MRO_PLANCHA, megarollo, "MRO-P01", rollos=1, contenedor="Plancha"),
        ID_LUX_INACTIVA: crear_presentacion(ID_LUX_INACTIVA, luxury, "LUX-J06", rollos=6, activo=False),
    }


def crear_inventario(id_presentacion: int, cantidad: int) -> InventarioProductoTerminado:
    return InventarioProductoTerminado(IdPresentacion=id_presentacion, CantidadActual=Decimal(cantidad))


def fila_bloqueo(ingreso=True, correccion=True, salida=True, motivo="Inventario de fin de mes") -> dict:
    return {
        "IdBloqueoProductoTerminado": 1,
        "UsuarioBloqueo": USUARIOS[ID_LIDER],
        "FechaHoraBloqueo": FECHA_CONTEO,
        "MotivoBloqueo": motivo,
        "BloqueaIngreso": ingreso,
        "BloqueaCorreccion": correccion,
        "BloqueaSalida": salida,
    }


def fila_conteo(id_conteo=3, estado=ESTADO_CONTEO_ABIERTO, inicio=FECHA_CONTEO, **cambios) -> dict:
    return {
        "IdConteoProductoTerminado": id_conteo,
        "Estado": estado,
        "UsuarioInicio": USUARIOS[ID_LIDER],
        "FechaHoraInicio": inicio,
        "MotivoInicio": "Conteo semanal",
        "UsuarioCierre": None,
        "FechaHoraCierre": None,
        "MotivoAnulacion": None,
        "TotalPresentaciones": 2,
        "Contadas": 0,
        "ConDiferencia": 0,
        "Faltante": 0,
        "Sobrante": 0,
        **cambios,
    }


def fila_detalle(id_presentacion=ID_LUX_J24, sistema=10, fisica=None, codigo="LUX-J24", id_producto=1, nombre="Luxury") -> dict:
    return {
        "IdPresentacion": id_presentacion,
        "CodigoPresentacion": codigo,
        "IdProducto": id_producto,
        "NombreProducto": nombre,
        "CantidadRollosUnidades": 24,
        "TipoContenedor": "Jaba",
        "CantidadPorUnidadTerminada": 2,
        "Activo": True,
        "CantidadSistema": sistema,
        "CantidadFisica": fisica,
        "MotivoDiferencia": None,
        "UsuarioConteo": None,
        "FechaHoraConteo": None,
        "IdMovimientoProductoTerminado": None,
    }


def crear_detalle(id_presentacion: int, sistema: int, fisica: int | None = None, id_conteo: int = 3) -> ConteoProductoTerminadoDetalle:
    return ConteoProductoTerminadoDetalle(
        IdConteoProductoTerminado=id_conteo,
        IdPresentacion=id_presentacion,
        CantidadSistema=Decimal(sistema),
        CantidadFisica=None if fisica is None else Decimal(fisica),
    )


def _ahora():
    return datetime.now(timezone.utc)


def _fecha(valor):
    return valor if isinstance(valor, datetime) or valor is None else _ahora()


class AlmacenProductoTerminadoFake:
    def __init__(self, inventarios: dict[int, int] | None = None):
        self.presentaciones = catalogo_presentaciones()
        self.inventarios = {
            id_presentacion: crear_inventario(id_presentacion, cantidad)
            for id_presentacion, cantidad in (inventarios or {}).items()
        }
        self.movimientos: list[MovimientoProductoTerminado] = []
        self.bloqueo: dict | None = None
        self.conteos: dict[int, ConteoProductoTerminado] = {}
        self.detalles: dict[int, dict[int, ConteoProductoTerminadoDetalle]] = {}
        self.pendientes: list = []
        self.reversiones = 0
        self._ids = count(1)

    def stock(self, id_presentacion: int) -> int:
        inventario = self.inventarios.get(id_presentacion)
        return int(inventario.CantidadActual) if inventario else 0

    def movimientos_de_tipo(self, id_tipo: int) -> list[MovimientoProductoTerminado]:
        return [m for m in self.movimientos if m.IdTipoMovimientoInventario == id_tipo]

    def registrar_movimiento(self, movimiento: MovimientoProductoTerminado) -> None:
        if movimiento.IdMovimientoProductoTerminado is None:
            movimiento.IdMovimientoProductoTerminado = next(self._ids)
            movimiento.FechaMovimiento = _ahora()
            self.movimientos.append(movimiento)

    def conteo_abierto(self) -> ConteoProductoTerminado | None:
        return next((c for c in self.conteos.values() if c.Estado == ESTADO_CONTEO_ABIERTO), None)

    def resumen(self, conteo: ConteoProductoTerminado) -> dict:
        detalles = list(self.detalles[conteo.IdConteoProductoTerminado].values())
        diferencias = [
            int(d.CantidadFisica) - int(d.CantidadSistema) for d in detalles if d.CantidadFisica is not None
        ]
        return {
            "IdConteoProductoTerminado": conteo.IdConteoProductoTerminado,
            "Estado": conteo.Estado,
            "UsuarioInicio": USUARIOS[conteo.IdUsuarioInicio],
            "FechaHoraInicio": conteo.FechaHoraInicio,
            "MotivoInicio": conteo.MotivoInicio,
            "UsuarioCierre": USUARIOS.get(conteo.IdUsuarioCierre),
            "FechaHoraCierre": conteo.FechaHoraCierre,
            "MotivoAnulacion": conteo.MotivoAnulacion,
            "TotalPresentaciones": len(detalles),
            "Contadas": len(diferencias),
            "ConDiferencia": sum(1 for d in diferencias if d != 0),
            "Faltante": sum(-d for d in diferencias if d < 0),
            "Sobrante": sum(d for d in diferencias if d > 0),
        }

    def filas_detalle(self, id_conteo: int) -> list[dict]:
        filas = []
        for detalle in self.detalles[id_conteo].values():
            presentacion, producto = self.presentaciones[detalle.IdPresentacion]
            filas.append(
                {
                    "IdPresentacion": presentacion.IdPresentacion,
                    "CodigoPresentacion": presentacion.CodigoPresentacion,
                    "IdProducto": producto.IdProducto,
                    "NombreProducto": producto.NombreProducto,
                    "CantidadRollosUnidades": presentacion.CantidadRollosUnidades,
                    "TipoContenedor": presentacion.TipoContenedor,
                    "CantidadPorUnidadTerminada": presentacion.CantidadPorUnidadTerminada,
                    "Activo": presentacion.Activo and producto.Activo,
                    "CantidadSistema": detalle.CantidadSistema,
                    "CantidadFisica": detalle.CantidadFisica,
                    "MotivoDiferencia": detalle.MotivoDiferencia,
                    "UsuarioConteo": USUARIOS.get(detalle.IdUsuarioConteo),
                    "FechaHoraConteo": detalle.FechaHoraConteo,
                    "IdMovimientoProductoTerminado": detalle.IdMovimientoProductoTerminado,
                }
            )
        return filas

    def presentaciones_para_conteo(self) -> list[dict]:
        filas = []
        for id_presentacion, (presentacion, producto) in sorted(self.presentaciones.items()):
            activo = presentacion.Activo and producto.Activo
            cantidad = self.stock(id_presentacion)
            if activo or cantidad > 0:
                filas.append(
                    {
                        "IdPresentacion": id_presentacion,
                        "CodigoPresentacion": presentacion.CodigoPresentacion,
                        "IdProducto": producto.IdProducto,
                        "NombreProducto": producto.NombreProducto,
                        "CantidadRollosUnidades": presentacion.CantidadRollosUnidades,
                        "TipoContenedor": presentacion.TipoContenedor,
                        "CantidadPorUnidadTerminada": presentacion.CantidadPorUnidadTerminada,
                        "Activo": activo,
                        "CantidadActual": cantidad,
                    }
                )
        return filas


class FakeProductoFinalRepository:
    def __init__(self, almacen: AlmacenProductoTerminadoFake, id_turno: int = 1):
        self.almacen = almacen
        self.id_turno = id_turno

    def IdTurnoActual(self) -> int:
        return self.id_turno

    def ObtenerPresentaciones(self, ids_presentacion):
        return {i: self.almacen.presentaciones[i] for i in ids_presentacion if i in self.almacen.presentaciones}

    def ObtenerInventariosBloqueados(self, ids_presentacion):
        return {
            i: (self.almacen.inventarios[i], *self.almacen.presentaciones[i])
            for i in sorted(ids_presentacion)
            if i in self.almacen.inventarios
        }

    def NombreTipoMovimiento(self, id_tipo_movimiento):
        return NOMBRES_MOVIMIENTO.get(id_tipo_movimiento, "")

    def RegistrarMovimientos(self, registros, mensaje_error):
        for inventario, movimiento, cantidad_nueva in registros:
            inventario.CantidadActual = Decimal(cantidad_nueva)
            self.almacen.inventarios[inventario.IdPresentacion] = inventario
            self.almacen.registrar_movimiento(movimiento)
        return [movimiento for _, movimiento, _ in registros]

    def Revertir(self):
        self.almacen.reversiones += 1

    def ObtenerBloqueoActivo(self):
        return self.almacen.bloqueo

    def RegistrarBloqueo(self, id_usuario, motivo, bloquea_ingreso, bloquea_correccion, bloquea_salida):
        if self.almacen.bloqueo is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya hay un bloqueo activo de movimientos de producto terminado",
            )
        self.almacen.bloqueo = {
            "IdBloqueoProductoTerminado": next(self.almacen._ids),
            "UsuarioBloqueo": USUARIOS[id_usuario],
            "FechaHoraBloqueo": _ahora(),
            "MotivoBloqueo": motivo,
            "BloqueaIngreso": bloquea_ingreso,
            "BloqueaCorreccion": bloquea_correccion,
            "BloqueaSalida": bloquea_salida,
        }

    def CerrarBloqueoActivo(self, id_usuario):
        if self.almacen.bloqueo is None:
            return False
        self.almacen.bloqueo = None
        return True


class FakeConteoRepository:
    def __init__(self, almacen: AlmacenProductoTerminadoFake, id_turno: int = 1):
        self.almacen = almacen
        self.id_turno = id_turno

    def IdTurnoActual(self) -> int:
        return self.id_turno

    def ObtenerConteoAbierto(self):
        conteo = self.almacen.conteo_abierto()
        return self.almacen.resumen(conteo) if conteo else None

    def ObtenerConteo(self, id_conteo):
        conteo = self.almacen.conteos.get(id_conteo)
        return self.almacen.resumen(conteo) if conteo else None

    def ListarConteos(self, fecha_inicio, fecha_fin, estados=None):
        return [
            self.almacen.resumen(c)
            for c in self.almacen.conteos.values()
            if not estados or c.Estado in estados
        ]

    def DiferenciasPorPresentacion(self, fecha_inicio, fecha_fin):
        return []

    def ObtenerDetalle(self, id_conteo):
        return self.almacen.filas_detalle(id_conteo)

    def PresentacionesParaConteo(self):
        return self.almacen.presentaciones_para_conteo()

    def IniciarConteo(self, id_usuario, motivo):
        presentaciones = self.almacen.presentaciones_para_conteo()
        if not presentaciones:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No hay presentaciones de producto terminado para contar",
            )
        if self.almacen.conteo_abierto() is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya hay un conteo físico de producto terminado en curso",
            )
        conteo = ConteoProductoTerminado(
            IdConteoProductoTerminado=next(self.almacen._ids),
            IdUsuarioInicio=id_usuario,
            FechaHoraInicio=_ahora(),
            MotivoInicio=motivo,
            Estado=ESTADO_CONTEO_ABIERTO,
        )
        self.almacen.conteos[conteo.IdConteoProductoTerminado] = conteo
        self.almacen.detalles[conteo.IdConteoProductoTerminado] = {
            fila["IdPresentacion"]: crear_detalle(
                fila["IdPresentacion"], fila["CantidadActual"], id_conteo=conteo.IdConteoProductoTerminado
            )
            for fila in presentaciones
        }
        return conteo.IdConteoProductoTerminado

    def BloquearConteo(self, id_conteo):
        return self.almacen.conteos.get(id_conteo)

    def DetallesBloqueados(self, id_conteo):
        return dict(self.almacen.detalles.get(id_conteo, {}))

    def InventariosBloqueados(self, ids_presentacion):
        return {i: self.almacen.inventarios[i] for i in sorted(ids_presentacion) if i in self.almacen.inventarios}

    def Agregar(self, entidad):
        self.almacen.pendientes.append(entidad)

    def Enlazar(self):
        for entidad in self.almacen.pendientes:
            if isinstance(entidad, InventarioProductoTerminado):
                self.almacen.inventarios[entidad.IdPresentacion] = entidad
            if isinstance(entidad, MovimientoProductoTerminado):
                self.almacen.registrar_movimiento(entidad)
        self.almacen.pendientes.clear()

    def Guardar(self, mensaje_error):
        self.Enlazar()
        for conteo in self.almacen.conteos.values():
            conteo.FechaHoraCierre = _fecha(conteo.FechaHoraCierre)
        for detalles in self.almacen.detalles.values():
            for detalle in detalles.values():
                detalle.FechaHoraConteo = _fecha(detalle.FechaHoraConteo)

    def Revertir(self):
        self.almacen.pendientes.clear()
        self.almacen.reversiones += 1

    def FechaCierreAnterior(self, id_conteo, fecha_inicio):
        return None

    def AjustesManuales(self, desde, hasta):
        return []
