from app.Constants.Push import DESTINO_GERENTE_LIDER, DESTINO_LIDER, DESTINO_PLANTA, LONGITUD_MAXIMA_CUERPO_PUSH
from app.Services.Notificacion.Push import AvisoPush

RUTA_ACCIONES_ADMIN = "/admin/acciones"
RUTA_ACCESOS_ADMIN = "/admin/accesos"
RUTA_INVENTARIO_PRODUCTO = "producto/inventario"
RUTA_MOVIMIENTOS_PRODUCTO = "producto/movimientos"
RUTA_REPORTE_SALIDAS = "reportes/producto/salidas"

RUTA_INVENTARIO_BOBINA_PAPEL = "bobina-papel/inventario"
RUTA_INVENTARIO_BOBINA_SERVILLETA = "bobina-servilleta/inventario"
RUTA_INVENTARIO_RODELA = "rodela/inventario"
RUTA_INVENTARIO_EMPAQUE_BOBINA = "empaque/bobina-inventario"
RUTA_PRODUCCION_BOBINA_PAPEL = "bobina-papel/produccion"
RUTA_PRODUCCION_BOBINA_SERVILLETA = "bobina-servilleta/produccion"


def _recortar(texto: str) -> str:
    texto = (texto or "").strip()
    if len(texto) <= LONGITUD_MAXIMA_CUERPO_PUSH:
        return texto
    return f"{texto[: LONGITUD_MAXIMA_CUERPO_PUSH - 1]}…"


def _gerente_lider(titulo: str, cuerpo: str, ruta: str) -> AvisoPush:
    return AvisoPush(titulo, _recortar(cuerpo), ruta, DESTINO_GERENTE_LIDER)


def _planta(titulo: str, cuerpo: str) -> AvisoPush:
    return AvisoPush(titulo, _recortar(cuerpo), RUTA_INVENTARIO_PRODUCTO, DESTINO_PLANTA)


def _lider(titulo: str, cuerpo: str, ruta: str) -> AvisoPush:
    return AvisoPush(titulo, _recortar(cuerpo), ruta, DESTINO_LIDER)


def aviso_ingreso_lote(materia: str, cantidad: int, ruta: str) -> AvisoPush:
    return _gerente_lider(f"Nuevo lote de {materia}", f"Se registró un lote con {cantidad} en total.", ruta)


def aviso_edicion(materia: str, detalle: str, ruta: str) -> AvisoPush:
    return _gerente_lider(f"Se editó {materia}", detalle, ruta)


def aviso_cancelacion(materia: str, motivo: str | None, ruta: str) -> AvisoPush:
    return _gerente_lider(f"Producción de {materia} cancelada", motivo or "Sin motivo", ruta)


def aviso_posposicion(materia: str, motivo: str | None, ruta: str) -> AvisoPush:
    return _gerente_lider(f"Producción de {materia} pospuesta", motivo or "Sin motivo", ruta)


def aviso_salida(cantidad: int, observacion: str) -> AvisoPush:
    return _gerente_lider(
        "Salida de producto terminado",
        f"{cantidad} en total. {observacion}",
        RUTA_REPORTE_SALIDAS,
    )


def aviso_ajuste(tipo: str, cantidad: int, observacion: str) -> AvisoPush:
    return _gerente_lider(
        f"Ajuste {tipo} de producto terminado",
        f"Cantidad {cantidad}. {observacion}",
        RUTA_MOVIMIENTOS_PRODUCTO,
    )


def aviso_bloqueo(motivo: str) -> AvisoPush:
    return _planta("Movimientos de producto terminado bloqueados", motivo)


def aviso_desbloqueo() -> AvisoPush:
    return _planta(
        "Movimientos de producto terminado desbloqueados",
        "Ya se pueden registrar movimientos de producto terminado.",
    )


def aviso_inicio_conteo(motivo: str) -> AvisoPush:
    return _planta("Conteo físico iniciado", f"Movimientos bloqueados durante el conteo. {motivo}")


def aviso_cierre_conteo() -> AvisoPush:
    return _planta(
        "Conteo físico finalizado",
        "Ya se pueden registrar movimientos de producto terminado.",
    )


def aviso_anulacion_conteo(motivo: str) -> AvisoPush:
    return _planta("Conteo físico anulado", f"Movimientos liberados. {motivo}")


def aviso_stock_critico(nombre: str, cantidad: int, minimo: int) -> AvisoPush:
    return _gerente_lider(
        f"Stock crítico: {nombre}",
        f"Quedan {cantidad}; el mínimo es {minimo}.",
        RUTA_INVENTARIO_PRODUCTO,
    )


def aviso_sin_stock(nombre: str) -> AvisoPush:
    return _gerente_lider(f"Sin stock: {nombre}", "La existencia llegó a cero.", RUTA_INVENTARIO_PRODUCTO)


def aviso_pausa_larga(materia: str, motivo: str | None, horas: int, ruta: str) -> AvisoPush:
    return _lider(f"Pausa de más de {horas} h en {materia}", motivo or "Sin motivo", ruta)


def aviso_produccion_larga(producto: str, horas: int) -> AvisoPush:
    return _lider(
        f"Producción de más de {horas} h",
        f"{producto} lleva más de {horas} horas activa sin finalizar.",
        RUTA_PRODUCCION_BOBINA_PAPEL,
    )


def aviso_sin_cerrar(detalle: str, ruta: str) -> AvisoPush:
    return _lider("Producción sin cerrar", f"{detalle} sigue abierta desde un día anterior.", ruta)


def aviso_accion_admin(observacion: str) -> AvisoPush:
    return AvisoPush("Cambio en el panel de administración", _recortar(observacion), RUTA_ACCIONES_ADMIN, SoloAdmin=True)


def aviso_intentos_fallidos(ci: str, intentos: int, minutos: int) -> AvisoPush:
    return AvisoPush(
        "Intentos fallidos de ingreso",
        f"CI {ci}: {intentos} intentos en {minutos} minutos.",
        RUTA_ACCESOS_ADMIN,
        SoloAdmin=True,
    )
