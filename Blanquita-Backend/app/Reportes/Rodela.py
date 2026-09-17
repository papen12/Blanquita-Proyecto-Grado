from datetime import date, datetime

from app.Models.Rodela.Reporte import (
    ReporteInventarioRodelaResponse,
    ReporteHistorialMovimientosRodelaResponse,
    ReporteLoteRodelaDetalleResponse,
    ReporteLotesRodelaPorPeriodoResponse,
)
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA


def construir_reporte_inventario_rodela(
    data: ReporteInventarioRodelaResponse,
) -> bytes:
    tipos = ", ".join(r.NombreTipoRodela for r in data.Resumen) or "Todos"

    reporte = Reporte(
        titulo="Informe de inventario - Rodela",
        subtitulo="Rodelas en almacén",
        filtros={"Tipos": tipos},
        generado_en=data.FechaGeneracion,
    )

    reporte.titulo_seccion("Resumen por tipo")
    reporte.tabla(
        columnas=[
            ("Tipo", "NombreTipoRodela"),
            ("Cantidad", "CantidadRodelas"),
            ("Recepción más antigua", "RecepcionMasAntigua"),
            ("Recepción más reciente", "RecepcionMasReciente"),
        ],
        filas=data.Resumen,
        fila_total=["TOTAL", data.TotalRodelas, "", ""],
    )

    for tipo in data.Resumen:
        rodelas_tipo = [
            r for r in data.Rodelas if r.IdTipoRodela == tipo.IdTipoRodela
        ]
        reporte.titulo_seccion(f"{tipo.NombreTipoRodela} ({tipo.CantidadRodelas})")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoRodela"),
                ("Lote", "IdLoteRodela"),
                ("Recepción", "FechaRecepcion"),
                ("Proveedor", "NombreProveedor"),
            ],
            filas=rodelas_tipo,
        )

    return reporte.a_pdf()


def nombre_archivo_inventario_rodela() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"informe-inventario-rodela-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_historial_movimientos_rodela(
    data: ReporteHistorialMovimientosRodelaResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Historial de movimientos - Rodela",
        subtitulo=f"Rodela {data.CodigoRodela} - {data.NombreTipoRodela}",
        filtros={
            "Estado actual": data.TipoEstado,
            "Movimientos": f"{len(data.Movimientos):,}".replace(",", "."),
        },
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    reporte.titulo_seccion(f"Movimientos ({len(data.Movimientos)})")
    if data.Movimientos:
        reporte.tabla(
            columnas=[
                ("Fecha", "FechaMovimiento"),
                ("Movimiento", "NombreMovimiento"),
                (
                    "Operador",
                    lambda m: reporte.celda_multilinea(
                        [f"{m.PrimerNombre} {m.ApellidoPaterno},", m.Ci, m.NombreRol]
                    ),
                ),
                ("Observación", "Observacion"),
            ],
            filas=data.Movimientos,
        )
    else:
        reporte.parrafo("No hay movimientos registrados para esta rodela.")

    return reporte.a_pdf()


def nombre_archivo_historial_movimientos_rodela(id_rodela: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"historial-movimientos-rodela-{id_rodela}-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_lote_rodela_detalle(
    data: ReporteLoteRodelaDetalleResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Detalle de lote - Rodela",
        subtitulo=f"Lote #{data.IdLoteRodela} - {data.NombreProveedor}",
        filtros={
            "Proveedor": data.NombreProveedor,
            "Recepción": data.FechaRecepcion.strftime("%d/%m/%Y"),
        },
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    reporte.titulo_seccion("Datos generales")
    reporte.tabla(
        columnas=[("Campo", "campo"), ("Valor", "valor")],
        filas=[
            {"campo": "Proveedor", "valor": data.NombreProveedor},
            {"campo": "Fecha de recepción", "valor": data.FechaRecepcion},
            {
                "campo": "Cantidad de rodelas",
                "valor": f"{data.CantidadRodelas:,}".replace(",", "."),
            },
        ],
    )

    reporte.titulo_seccion(f"Rodelas del lote ({data.CantidadRodelas})")
    reporte.tabla(
        columnas=[
            ("Código", "CodigoRodela"),
            ("Tipo", "NombreTipoRodela"),
            ("Estado", "TipoEstado"),
        ],
        filas=data.Rodelas,
    )

    return reporte.a_pdf()


def nombre_archivo_lote_rodela_detalle(id_lote_rodela: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"detalle-lote-rodela-{id_lote_rodela}-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_lotes_rodela_por_periodo(
    data: ReporteLotesRodelaPorPeriodoResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Ingresos por período - Rodela",
        subtitulo=(
            f"Del {data.PeriodoInicio.strftime('%d/%m/%Y')} "
            f"al {data.PeriodoFin.strftime('%d/%m/%Y')}"
        ),
        filtros={
            "Lotes": f"{data.TotalLotes:,}".replace(",", "."),
            "Rodelas": f"{data.TotalRodelas:,}".replace(",", "."),
        },
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    if not data.Lotes:
        reporte.parrafo("No se encontraron lotes en este período.")
        return reporte.a_pdf()

    for lote in data.Lotes:
        reporte.titulo_seccion(
            f"Lote #{lote.IdLoteRodela} - {lote.FechaRecepcion.strftime('%d/%m/%Y')} "
            f"- {lote.NombreProveedor} ({lote.CantidadRodelas})"
        )
        reporte.tabla(
            columnas=[
                ("Código", "CodigoRodela"),
                ("Tipo", "NombreTipoRodela"),
                ("Estado", "TipoEstado"),
            ],
            filas=lote.Rodelas,
        )

    return reporte.a_pdf()


def nombre_archivo_lotes_rodela_periodo(fecha_inicio: date, fecha_fin: date) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return (
        f"ingresos-lotes-rodela-periodo-{fecha_inicio:%Y%m%d}-{fecha_fin:%Y%m%d}"
        f"-{ahora:%Y%m%d-%H%M}.pdf"
    )
