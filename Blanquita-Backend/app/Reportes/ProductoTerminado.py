from datetime import date, datetime

from app.Models.InventarioFinal.Reporte import (
    ReporteProduccionDiariaProductoTerminadoResponse,
)
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA

DIAS_SEMANA = ("Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom")


def _texto_periodo(inicio: date, fin: date) -> str:
    if inicio == fin:
        return f"Día {inicio.strftime('%d/%m/%Y')}"
    return f"Del {inicio.strftime('%d/%m/%Y')} al {fin.strftime('%d/%m/%Y')}"


def _texto_lineas(data: ReporteProduccionDiariaProductoTerminadoResponse) -> str:
    if data.TodasLasLineas:
        return "Todas"
    if len(data.Lineas) <= 3:
        return ", ".join(linea.NombreProducto for linea in data.Lineas)
    return f"{len(data.Lineas)} seleccionadas"


def _texto_fecha_con_dia(fecha: date) -> str:
    return f"{DIAS_SEMANA[fecha.weekday()]} {fecha.strftime('%d/%m/%Y')}"


def construir_reporte_produccion_diaria_producto_terminado(
    data: ReporteProduccionDiariaProductoTerminadoResponse,
    generado_por: str | None = None,
) -> bytes:
    reporte = Reporte(
        titulo="Producción diaria - Producto terminado",
        subtitulo=_texto_periodo(data.PeriodoInicio, data.PeriodoFin),
        filtros={"Líneas": _texto_lineas(data)},
        generado_en=datetime.now(ZONA_BOLIVIA),
        generado_por=generado_por,
    )

    lineas_con_produccion = [linea for linea in data.Lineas if linea.NumeroRegistros]

    reporte.titulo_seccion("Resumen por línea")
    reporte.tabla(
        columnas=[
            ("Línea", "NombreProducto"),
            ("Unidad", lambda linea: linea.Unidad.capitalize()),
            (
                "Total",
                lambda linea: linea.Total if linea.NumeroRegistros else "Sin producción",
            ),
            ("Días con producción", "DiasConProduccion"),
            ("Promedio por día", "PromedioPorDia"),
            ("N° Registros", "NumeroRegistros"),
        ],
        filas=data.Lineas,
    )
    reporte.parrafo(
        f"Días con producción: {data.DiasConProduccion} de {data.DiasPeriodo}."
    )

    if data.PeriodoInicio < data.PeriodoFin:
        reporte.titulo_seccion("Producción por día")
        reporte.tabla(
            columnas=[("Fecha", lambda dia: _texto_fecha_con_dia(dia.Fecha))]
            + [
                (
                    f"{linea.NombreProducto} ({linea.Unidad})",
                    lambda dia, id_producto=linea.IdProducto: dia.TotalesPorLinea.get(
                        id_producto
                    ),
                )
                for linea in lineas_con_produccion
            ],
            filas=data.ProduccionPorDia,
            fila_total=["TOTAL"] + [linea.Total for linea in lineas_con_produccion],
        )

    for linea in lineas_con_produccion:
        total = f"{linea.Total:,}".replace(",", ".")
        reporte.titulo_seccion(f"{linea.NombreProducto}: {total} {linea.Unidad}")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoPresentacion"),
                ("Producto", "NombrePresentacion"),
                ("Entradas", "Entradas"),
                ("Correcciones", "Correcciones"),
                ("Total", "Total"),
                ("N° Registros", "NumeroRegistros"),
            ],
            filas=linea.Presentaciones,
            fila_total=[
                "TOTAL",
                "",
                linea.Entradas,
                linea.Correcciones,
                linea.Total,
                linea.NumeroRegistros,
            ],
        )

    if data.Movimientos is not None:
        for linea in lineas_con_produccion:
            movimientos = [
                m for m in data.Movimientos if m.IdProducto == linea.IdProducto
            ]
            reporte.titulo_seccion(
                f"Movimientos - {linea.NombreProducto} ({len(movimientos)})"
            )
            reporte.tabla(
                columnas=[
                    ("Fecha", "FechaMovimiento"),
                    ("Código", "CodigoPresentacion"),
                    ("Producto", "NombrePresentacion"),
                    ("Movimiento", "NombreTipoMovimientoInventario"),
                    ("Cantidad", "Cantidad"),
                    (
                        "Operador",
                        lambda m: reporte.celda_multilinea(
                            [f"{m.PrimerNombre} {m.ApellidoPaterno},", m.Ci, m.NombreRol]
                        ),
                    ),
                    ("Observación", "Observacion"),
                ],
                filas=movimientos,
                fila_total=[
                    "TOTAL",
                    "",
                    "",
                    "",
                    sum(m.Cantidad for m in movimientos),
                    "",
                    "",
                ],
            )

    return reporte.a_pdf()


def nombre_archivo_produccion_diaria_producto_terminado(
    fecha_inicio: date, fecha_fin: date
) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return (
        f"produccion-diaria-producto-terminado-{fecha_inicio:%Y%m%d}-{fecha_fin:%Y%m%d}"
        f"-{ahora:%Y%m%d-%H%M}.pdf"
    )
