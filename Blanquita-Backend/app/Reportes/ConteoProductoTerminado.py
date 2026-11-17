from collections import Counter, defaultdict
from datetime import date, datetime

from reportlab.lib import colors
from reportlab.lib.units import cm

from app.Constants.Estados import (
    DIFERENCIA_CONTEO_SIN_REGISTRO,
    ESTADO_CONTEO_ANULADO,
    ESTADO_CONTEO_CERRADO,
    NIVEL_USO_ADECUADO,
    NIVEL_USO_ATENCION,
    NIVEL_USO_DEFICIENTE,
    TEXTO_RECONTEO_CONFIRMADO,
)
from app.Constants.Cantidades import DIFERENCIA_CONTEO_UNIDADES_ADECUADO
from app.Models.InventarioFinal.Conteo import (
    ActaConteoProductoTerminadoResponse,
    HojaConteoProductoTerminadoResponse,
    IndicadoresConteoResponse,
    ReporteConteosProductoTerminadoResponse,
)
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA

LINEA_FIRMA = "____________________________"


def _texto_fecha_hora(fecha: datetime) -> str:
    return f"{fecha.astimezone(ZONA_BOLIVIA):%d/%m/%Y} a las {fecha.astimezone(ZONA_BOLIVIA):%H:%M}"


def _texto_fecha_corta(fecha: datetime) -> str:
    return f"{fecha.astimezone(ZONA_BOLIVIA):%d/%m/%Y %H:%M}"


def _texto_paquetes(cantidad: int | None) -> str | None:
    if cantidad is None:
        return None
    return f"{cantidad} paquete" if cantidad == 1 else f"{cantidad} paquetes"


def _texto_producto(item) -> str:
    return item.NombrePresentacion if item.Activo else f"{item.NombrePresentacion} (inactiva)"


def _texto_diferencia(diferencia: int | None) -> str | None:
    if diferencia is None:
        return None
    return f"{diferencia:+d}" if diferencia else "0"


COLOR_NIVEL_USO = {
    NIVEL_USO_ADECUADO: colors.HexColor("#d1fae5"),
    NIVEL_USO_ATENCION: colors.HexColor("#fef3c7"),
    NIVEL_USO_DEFICIENTE: colors.HexColor("#fee2e2"),
}


COLOR_VINETA_NIVEL = {
    NIVEL_USO_ADECUADO: colors.HexColor("#059669"),
    NIVEL_USO_ATENCION: colors.HexColor("#d97706"),
    NIVEL_USO_DEFICIENTE: colors.HexColor("#dc2626"),
}


def _fondo_nivel(nivel: str, *columnas: int) -> dict:
    return {columna: COLOR_NIVEL_USO[nivel] for columna in columnas}


def _fondo_variacion(item) -> dict:
    return _fondo_nivel(item.Nivel, 5) if item.Nivel else {}


def _texto_porcentaje(porcentaje: float | None) -> str | None:
    if porcentaje is None:
        return None
    return f"{porcentaje:.1f} %".replace(".", ",")


def _texto_variacion(item) -> str | None:
    if item.TipoDiferencia == DIFERENCIA_CONTEO_SIN_REGISTRO:
        return item.TipoDiferencia
    return _texto_porcentaje(item.PorcentajeDiferencia)


def _explicar_criterio(reporte: Reporte, indicadores: IndicadoresConteoResponse) -> None:
    reporte.parrafo("La diferencia % indica qué parte del stock contado no coincidió con el sistema.")
    reporte.vinetas(
        [
            (f"Verde (hasta {indicadores.PorcentajeAdecuado} %): el sistema se usa bien.", COLOR_VINETA_NIVEL[NIVEL_USO_ADECUADO]),
            (f"Ámbar (hasta {indicadores.PorcentajeAtencion} %): revisar.", COLOR_VINETA_NIVEL[NIVEL_USO_ATENCION]),
            ("Rojo (más): hay movimientos que no se registraron.", COLOR_VINETA_NIVEL[NIVEL_USO_DEFICIENTE]),
        ]
    )
    reporte.parrafo("Faltante: salió producto sin registrarse. Sobrante: entró producto sin registrarse.")


def _indicador_total(reporte: Reporte, indicadores: IndicadoresConteoResponse | None) -> None:
    reporte.titulo_seccion("Indicador de uso del sistema")
    if indicadores is None:
        reporte.parrafo("No hay presentaciones contadas para calcular el indicador.")
        return
    reporte.tabla(
        columnas=[
            ("Faltante %", lambda i: _texto_porcentaje(i.PorcentajeFaltante)),
            ("Sobrante %", lambda i: _texto_porcentaje(i.PorcentajeSobrante)),
            ("Diferencia %", lambda i: _texto_porcentaje(i.PorcentajeDiferencia)),
            ("Estado", "Nivel"),
        ],
        filas=[indicadores],
        fondos=lambda i: _fondo_nivel(i.Nivel, 2, 3),
    )
    reporte.salto()
    _explicar_criterio(reporte, indicadores)


def _indicadores_lineas(reporte: Reporte, indicadores: IndicadoresConteoResponse | None) -> None:
    if indicadores is None:
        return
    reporte.titulo_seccion("Indicador por línea")
    reporte.tabla(
        columnas=[
            ("Línea", lambda i: i.NombreProducto),
            ("Unidad", lambda i: i.Unidad.capitalize()),
            ("Sistema", "CantidadSistema"),
            ("Faltante", "Faltante"),
            ("Sobrante", "Sobrante"),
            ("Faltante %", lambda i: _texto_porcentaje(i.PorcentajeFaltante)),
            ("Sobrante %", lambda i: _texto_porcentaje(i.PorcentajeSobrante)),
            ("Diferencia %", lambda i: _texto_porcentaje(i.PorcentajeDiferencia)),
            ("Estado", "Nivel"),
        ],
        filas=indicadores.Lineas,
        fondos=lambda i: _fondo_nivel(i.Nivel, 7, 8),
    )


def _agrupar_por_linea(items: list) -> list[tuple[str, str, list]]:
    lineas: dict[int, list] = defaultdict(list)
    for item in items:
        lineas[item.IdProducto].append(item)
    return [(grupo[0].NombreProducto, grupo[0].Unidad, grupo) for grupo in lineas.values()]


def _firmas(reporte: Reporte, firmantes: list[str]) -> None:
    reporte.titulo_seccion("Firmas")
    for firmante in firmantes:
        reporte.salto(0.6 * cm)
        reporte.parrafo(f"{firmante}: {LINEA_FIRMA}   Firma: {LINEA_FIRMA}")


def construir_hoja_conteo_producto_terminado(
    data: HojaConteoProductoTerminadoResponse,
    generado_por: str | None = None,
) -> bytes:
    subtitulo = (
        f"Conteo N° {data.IdConteoProductoTerminado} iniciado el {_texto_fecha_hora(data.FechaHoraInicio)}"
        if data.IdConteoProductoTerminado
        else "Lista de presentaciones a contar"
    )
    reporte = Reporte(
        titulo="Hoja de conteo físico - Producto terminado",
        subtitulo=subtitulo,
        filtros={"Presentaciones": str(len(data.Presentaciones))},
        generado_en=data.FechaGeneracion,
        generado_por=generado_por,
    )

    reporte.parrafo(
        "Anote la cantidad encontrada físicamente en cada presentación, incluso si es 0. "
        "Si encuentra una presentación que no figura en la lista, anótela al final en observaciones."
    )
    reporte.parrafo(f"Fecha y hora del conteo: {LINEA_FIRMA}")

    for nombre_linea, unidad, presentaciones in _agrupar_por_linea(data.Presentaciones):
        reporte.titulo_seccion(f"{nombre_linea} (en {unidad})")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoPresentacion"),
                ("Producto", _texto_producto),
                ("Contenedor", "TipoContenedor"),
                ("Contenido", lambda p: _texto_paquetes(p.CantidadPorUnidadTerminada)),
                ("Cantidad física", lambda _: reporte.celda_multilinea([" "])),
                ("Observación", lambda _: reporte.celda_multilinea([" "])),
            ],
            filas=presentaciones,
            anchos=[2.6 * cm, 3.6 * cm, 2.2 * cm, 2.4 * cm, 2.8 * cm, 3.9 * cm],
        )

    reporte.titulo_seccion("Observaciones")
    for _ in range(3):
        reporte.salto(0.5 * cm)
        reporte.parrafo(LINEA_FIRMA * 3)

    _firmas(reporte, ["Contado por", "Revisado por"])

    return reporte.a_pdf()


def nombre_archivo_hoja_conteo() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"hoja-conteo-producto-terminado-{ahora:%Y%m%d-%H%M}.pdf"


def construir_acta_conteo_producto_terminado(
    data: ActaConteoProductoTerminadoResponse,
    generado_por: str | None = None,
) -> bytes:
    anulado = data.Estado == ESTADO_CONTEO_ANULADO
    reporte = Reporte(
        titulo=f"Acta de conteo físico N° {data.IdConteoProductoTerminado}",
        subtitulo=f"{'Anulado' if anulado else 'Cerrado'} el {_texto_fecha_hora(data.FechaHoraCierre)}",
        filtros={"Estado": data.Estado},
        generado_en=datetime.now(ZONA_BOLIVIA),
        generado_por=generado_por,
    )

    reporte.parrafo(f"Iniciado por {data.UsuarioInicio} el {_texto_fecha_hora(data.FechaHoraInicio)}.")
    reporte.parrafo(f"Motivo: {data.MotivoInicio}")
    reporte.parrafo(
        f"{'Anulado' if anulado else 'Cerrado'} por {data.UsuarioCierre} el {_texto_fecha_hora(data.FechaHoraCierre)}."
    )
    if anulado:
        reporte.parrafo(f"Motivo de anulación: {data.MotivoAnulacion}")
        reporte.parrafo("El conteo fue anulado, no se generaron ajustes en el inventario.")

    reporte.titulo_seccion("Resumen")
    reporte.tabla(
        columnas=[
            ("Presentaciones", "TotalPresentaciones"),
            ("Contadas", "Contadas"),
            ("Con diferencia", "ConDiferencia"),
            ("Faltante", "Faltante"),
            ("Sobrante", "Sobrante"),
        ],
        filas=[data],
    )

    _indicador_total(reporte, data.Indicadores)
    _indicadores_lineas(reporte, data.Indicadores)

    reporte.salto_pagina()
    reporte.parrafo(
        "Cada producto usa los mismos colores; una diferencia de hasta "
        f"{DIFERENCIA_CONTEO_UNIDADES_ADECUADO} unidad se acepta. Los productos en ámbar o rojo "
        f"se volvieron a contar antes de ajustar el stock (su motivo dice «{TEXTO_RECONTEO_CONFIRMADO}»)."
    )

    for nombre_linea, unidad, detalle in _agrupar_por_linea(data.Detalle):
        reporte.titulo_seccion(f"{nombre_linea} (en {unidad})")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoPresentacion"),
                ("Producto", _texto_producto),
                ("Sistema", "CantidadSistema"),
                ("Físico", "CantidadFisica"),
                ("Diferencia", lambda d: _texto_diferencia(d.Diferencia)),
                ("Variación", _texto_variacion),
                ("Motivo", "MotivoDiferencia"),
            ],
            filas=detalle,
            anchos=[2.3 * cm, 3.1 * cm, 1.6 * cm, 1.6 * cm, 1.8 * cm, 2.4 * cm, 4.7 * cm],
            fondos=_fondo_variacion,
        )

    desde = (
        f"desde el {_texto_fecha_hora(data.AjustesManualesDesde)}"
        if data.AjustesManualesDesde
        else "sin conteo anterior"
    )
    reporte.titulo_seccion(f"Ajustes manuales desde el último conteo ({desde})")
    if data.AjustesManuales:
        reporte.tabla(
            columnas=[
                ("Fecha", "FechaMovimiento"),
                ("Código", "CodigoPresentacion"),
                ("Producto", "NombrePresentacion"),
                ("Tipo", "NombreTipoMovimientoInventario"),
                ("Cantidad", "Cantidad"),
                ("Usuario", "Usuario"),
                ("Observación", "Observacion"),
            ],
            filas=data.AjustesManuales,
        )
    else:
        reporte.parrafo("No se registraron ajustes manuales en ese período.")

    _firmas(reporte, ["Contado por", "Aprobado por"])

    return reporte.a_pdf()


def nombre_archivo_acta_conteo(id_conteo: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"acta-conteo-producto-terminado-{id_conteo}-{ahora:%Y%m%d-%H%M}.pdf"


def _texto_periodo(inicio: date, fin: date) -> str:
    if inicio == fin:
        return f"Día {inicio:%d/%m/%Y}"
    return f"Del {inicio:%d/%m/%Y} al {fin:%d/%m/%Y}"


def construir_reporte_conteos_producto_terminado(
    data: ReporteConteosProductoTerminadoResponse,
    generado_por: str | None = None,
) -> bytes:
    reporte = Reporte(
        titulo="Conteos físicos de producto terminado",
        subtitulo=_texto_periodo(data.PeriodoInicio, data.PeriodoFin),
        filtros={"Estados": ", ".join(data.Estados)},
        generado_en=datetime.now(ZONA_BOLIVIA),
        generado_por=generado_por,
    )

    por_estado = Counter(conteo.Estado for conteo in data.Conteos)
    cerrados = [conteo for conteo in data.Conteos if conteo.Estado == ESTADO_CONTEO_CERRADO]

    reporte.titulo_seccion("Resumen")
    reporte.tabla(
        columnas=[
            ("Conteos", lambda _: len(data.Conteos)),
            *[(estado, lambda _, estado=estado: por_estado.get(estado, 0)) for estado in data.Estados],
            ("Con diferencia", lambda _: sum(c.ConDiferencia for c in cerrados)),
            ("Faltante", lambda _: sum(c.Faltante for c in cerrados)),
            ("Sobrante", lambda _: sum(c.Sobrante for c in cerrados)),
        ],
        filas=[data],
    )

    reporte.titulo_seccion(f"Conteos ({len(data.Conteos)})")
    reporte.tabla(
        columnas=[
            ("N°", "IdConteoProductoTerminado"),
            ("Estado", "Estado"),
            (
                "Inicio",
                lambda c: reporte.celda_multilinea([_texto_fecha_corta(c.FechaHoraInicio), c.UsuarioInicio]),
            ),
            (
                "Cierre",
                lambda c: reporte.celda_multilinea(
                    [_texto_fecha_corta(c.FechaHoraCierre), c.UsuarioCierre] if c.FechaHoraCierre else ["En curso"]
                ),
            ),
            ("Motivo", lambda c: c.MotivoAnulacion if c.Estado == ESTADO_CONTEO_ANULADO else c.MotivoInicio),
            ("Contadas", lambda c: f"{c.Contadas}/{c.TotalPresentaciones}"),
            ("Dif.", "ConDiferencia"),
            ("Faltante", "Faltante"),
            ("Sobrante", "Sobrante"),
        ],
        filas=data.Conteos,
        anchos=[0.9 * cm, 1.6 * cm, 2.7 * cm, 2.7 * cm, 3.1 * cm, 1.6 * cm, 1.0 * cm, 1.7 * cm, 1.7 * cm],
    )

    medidos = sorted(
        (conteo for conteo in cerrados if conteo.Indicadores),
        key=lambda conteo: conteo.FechaHoraInicio,
    )
    if medidos:
        reporte.titulo_seccion("Evolución del uso del sistema en conteos cerrados")
        _explicar_criterio(reporte, medidos[0].Indicadores)
        reporte.tabla(
            columnas=[
                ("N°", "IdConteoProductoTerminado"),
                ("Cierre", lambda c: _texto_fecha_corta(c.FechaHoraCierre)),
                ("Faltante %", lambda c: _texto_porcentaje(c.Indicadores.PorcentajeFaltante)),
                ("Sobrante %", lambda c: _texto_porcentaje(c.Indicadores.PorcentajeSobrante)),
                ("Diferencia %", lambda c: _texto_porcentaje(c.Indicadores.PorcentajeDiferencia)),
                ("Estado", lambda c: c.Indicadores.Nivel),
            ],
            filas=medidos,
            fondos=lambda c: _fondo_nivel(c.Indicadores.Nivel, 4, 5),
        )
        reporte.titulo_seccion("Diferencia por línea en conteos cerrados")
        reporte.tabla(
            columnas=[
                ("N°", lambda fila: fila[0].IdConteoProductoTerminado),
                ("Línea", lambda fila: fila[1].NombreProducto),
                ("Faltante %", lambda fila: _texto_porcentaje(fila[1].PorcentajeFaltante)),
                ("Sobrante %", lambda fila: _texto_porcentaje(fila[1].PorcentajeSobrante)),
                ("Diferencia %", lambda fila: _texto_porcentaje(fila[1].PorcentajeDiferencia)),
                ("Estado", lambda fila: fila[1].Nivel),
            ],
            filas=[(conteo, linea) for conteo in medidos for linea in conteo.Indicadores.Lineas],
            fondos=lambda fila: _fondo_nivel(fila[1].Nivel, 4, 5),
        )

    if data.Presentaciones:
        reporte.titulo_seccion("Presentaciones con diferencias en conteos cerrados")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoPresentacion"),
                ("Producto", "NombrePresentacion"),
                ("Unidad", lambda p: p.Unidad.capitalize()),
                ("Veces con diferencia", "VecesConDiferencia"),
                ("Faltante", "Faltante"),
                ("Sobrante", "Sobrante"),
            ],
            filas=data.Presentaciones,
        )

    return reporte.a_pdf()


def nombre_archivo_reporte_conteos(fecha_inicio: date, fecha_fin: date) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return (
        f"conteos-producto-terminado-{fecha_inicio:%Y%m%d}-{fecha_fin:%Y%m%d}"
        f"-{ahora:%Y%m%d-%H%M}.pdf"
    )
