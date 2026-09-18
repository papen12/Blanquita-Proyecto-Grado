from datetime import date, datetime

from app.Models.BobinaServilleta.Reporte import (
    ReporteInventarioBobinaServilletaResponse,
    ReporteInventarioSubBobinaServilletaResponse,
    ReporteHistorialMovimientosUnidadServilletaResponse,
    ReporteDetalleBobinaServilletaResponse,
    ReporteLoteBobinaServilletaDetalleResponse,
    ReporteLotesServilletaPorPeriodoResponse,
)
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA


def construir_reporte_inventario_bobina_servilleta(
    data: ReporteInventarioBobinaServilletaResponse,
) -> bytes:
    tipos = ", ".join(r.NombreTipoBobinaServilleta for r in data.Resumen) or "Todos"

    reporte = Reporte(
        titulo="Informe de inventario - Bobina de servilleta",
        subtitulo="Bobinas en almacén",
        filtros={"Tipos": tipos},
        generado_en=data.FechaGeneracion,
    )

    reporte.titulo_seccion("Resumen por tipo")
    reporte.tabla(
        columnas=[
            ("Tipo", "NombreTipoBobinaServilleta"),
            ("Cantidad", "CantidadBobinas"),
            ("Peso bruto (kg)", "PesoBrutoTotalKg"),
            ("Gramaje prom.", "GramajePromedio"),
            ("Recepción más antigua", "RecepcionMasAntigua"),
            ("Recepción más reciente", "RecepcionMasReciente"),
        ],
        filas=data.Resumen,
        fila_total=[
            "TOTAL",
            data.TotalBobinas,
            data.PesoBrutoGeneralKg,
            "",
            "",
            "",
        ],
    )

    for tipo in data.Resumen:
        bobinas_tipo = [
            b for b in data.Bobinas if b.IdTipoBobinaServilleta == tipo.IdTipoBobinaServilleta
        ]
        reporte.titulo_seccion(f"{tipo.NombreTipoBobinaServilleta} ({tipo.CantidadBobinas})")
        reporte.tabla(
            columnas=[
                ("Lote", "CodigoLote"),
                ("Recepción", "FechaRecepcion"),
                ("Proveedor", "NombreProveedor"),
                (
                    "Código",
                    lambda b: reporte.celda_multilinea(
                        [b.CodigoUnidad1, b.CodigoUnidad2]
                    ),
                ),
                (
                    "Formato",
                    lambda b: reporte.celda_multilinea(
                        [b.DescripcionFormato1, b.DescripcionFormato2]
                    ),
                ),
                (
                    "P. bruto (kg)",
                    lambda b: reporte.celda_multilinea(
                        [b.PesoBrutoKg1, b.PesoBrutoKg2]
                    ),
                ),
                (
                    "Gramaje",
                    lambda b: reporte.celda_multilinea([b.GramajeGr1, b.GramajeGr2]),
                ),
            ],
            filas=bobinas_tipo,
        )

    return reporte.a_pdf()


def nombre_archivo_inventario_servilleta() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"informe-inventario-bobina-servilleta-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_inventario_subbobina_servilleta(
    data: ReporteInventarioSubBobinaServilletaResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Informe de inventario - Sub-bobina de servilleta",
        subtitulo="Sub-bobinas en almacén",
        generado_en=data.FechaGeneracion,
    )

    reporte.titulo_seccion("Resumen por formato")
    reporte.tabla(
        columnas=[
            ("Formato", "NombreTipoMedida"),
            ("Cantidad", "CantidadSubBobinas"),
        ],
        filas=data.Resumen,
        fila_total=["TOTAL", data.TotalSubBobinas],
    )

    for medida in data.Resumen:
        sub_bobinas_medida = [
            sb
            for sb in data.SubBobinas
            if sb.IdTipoMedidaSubBobina == medida.IdTipoMedidaSubBobina
        ]
        reporte.titulo_seccion(f"{medida.NombreTipoMedida} ({medida.CantidadSubBobinas})")
        if sub_bobinas_medida:
            reporte.tabla(
                columnas=[
                    ("Código unidad", "CodigoBobina"),
                    ("Tipo bobina", "NombreTipoBobinaServilleta"),
                    ("Lote", "CodigoLote"),
                    ("Recepción", "FechaRecepcion"),
                    ("Proveedor", "NombreProveedor"),
                ],
                filas=sub_bobinas_medida,
            )
        else:
            reporte.parrafo("No hay sub-bobinas en almacén con este formato.")

    return reporte.a_pdf()


def nombre_archivo_inventario_subbobina_servilleta() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"informe-inventario-subbobina-servilleta-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_historial_movimientos_unidad_servilleta(
    data: ReporteHistorialMovimientosUnidadServilletaResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Historial de movimientos - Unidad de bobina servilleta",
        subtitulo=f"Unidad {data.CodigoBobina} - {data.NombreTipoBobinaServilleta}",
        filtros={"Estado actual": data.TipoEstado, "Formato": data.DescripcionFormato},
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    reporte.titulo_seccion(f"Movimientos ({len(data.Movimientos)})")
    if data.Movimientos:
        reporte.tabla(
            columnas=[
                ("Fecha", "FechaMovimiento"),
                ("Movimiento", "NombreMovimiento"),
                ("Sub-bobina", "IdSubBobinaServilleta"),
                ("Formato", "NombreTipoMedida"),
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
        reporte.parrafo("Esta unidad aún no registra movimientos (no ha sido abierta).")

    return reporte.a_pdf()


def nombre_archivo_historial_movimientos_unidad_servilleta(id_unidad: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"historial-movimientos-unidad-servilleta-{id_unidad}-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_detalle_bobina_servilleta(
    data: ReporteDetalleBobinaServilletaResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Detalle de bobina - Servilleta",
        subtitulo=f"Bobina #{data.IdBobinaServilleta} - {data.NombreTipoBobinaServilleta}",
        filtros={"Estado": data.TipoEstado, "Lote": data.CodigoLote},
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    reporte.titulo_seccion("Datos generales")
    reporte.tabla(
        columnas=[("Campo", "campo"), ("Valor", "valor")],
        filas=[
            {"campo": "Tipo de bobina", "valor": data.NombreTipoBobinaServilleta},
            {"campo": "Estado", "valor": data.TipoEstado},
            {"campo": "Lote", "valor": data.CodigoLote},
            {"campo": "Recepción", "valor": data.FechaRecepcion},
            {"campo": "Proveedor", "valor": data.NombreProveedor},
        ],
    )

    for unidad in data.Unidades:
        reporte.titulo_seccion(f"Unidad {unidad.CodigoUnidad} - {unidad.DescripcionFormato}")
        reporte.tabla(
            columnas=[("Campo", "campo"), ("Valor", "valor")],
            filas=[
                {"campo": "Peso bruto (kg)", "valor": unidad.PesoBrutoKg},
                {"campo": "Gramaje", "valor": unidad.GramajeGr},
            ],
        )

        reporte.titulo_seccion(f"Movimientos ({len(unidad.Movimientos)})")
        if unidad.Movimientos:
            reporte.tabla(
                columnas=[
                    ("Fecha", "FechaMovimiento"),
                    ("Movimiento", "NombreMovimiento"),
                    ("Sub-bobina", "IdSubBobinaServilleta"),
                    ("Formato", "NombreTipoMedida"),
                    (
                        "Operador",
                        lambda m: reporte.celda_multilinea(
                            [f"{m.PrimerNombre} {m.ApellidoPaterno},", m.Ci, m.NombreRol]
                        ),
                    ),
                    ("Observación", "Observacion"),
                ],
                filas=unidad.Movimientos,
            )
        else:
            reporte.parrafo("Esta unidad aún no registra movimientos (no ha sido abierta).")

    return reporte.a_pdf()


def nombre_archivo_detalle_bobina_servilleta(id_bobina: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"detalle-bobina-servilleta-{id_bobina}-{ahora:%Y%m%d-%H%M}.pdf"


def _columnas_bobinas_lote(reporte: Reporte) -> list:
    return [
        ("Tipo", "NombreTipoBobinaServilleta"),
        (
            "Código",
            lambda b: reporte.celda_multilinea([b.CodigoUnidad1, b.CodigoUnidad2]),
        ),
        (
            "Formato",
            lambda b: reporte.celda_multilinea(
                [b.DescripcionFormato1, b.DescripcionFormato2]
            ),
        ),
        (
            "P. bruto (kg)",
            lambda b: reporte.celda_multilinea([b.PesoBrutoKg1, b.PesoBrutoKg2]),
        ),
        (
            "Gramaje",
            lambda b: reporte.celda_multilinea([b.GramajeGr1, b.GramajeGr2]),
        ),
    ]


def construir_reporte_lote_bobina_servilleta_detalle(
    data: ReporteLoteBobinaServilletaDetalleResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Detalle de lote - Bobina de servilleta",
        subtitulo=f"Lote #{data.IdLoteBobinaServilleta} - {data.NombreProveedor}",
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
                "campo": "Cantidad de bobinas",
                "valor": f"{data.CantidadBobinas:,}".replace(",", "."),
            },
        ],
    )

    reporte.titulo_seccion(f"Bobinas del lote ({data.CantidadBobinas})")
    reporte.tabla(columnas=_columnas_bobinas_lote(reporte), filas=data.Bobinas)

    return reporte.a_pdf()


def nombre_archivo_lote_servilleta_detalle(id_lote: int) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"detalle-lote-bobina-servilleta-{id_lote}-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_lotes_servilleta_por_periodo(
    data: ReporteLotesServilletaPorPeriodoResponse,
) -> bytes:
    reporte = Reporte(
        titulo="Ingresos por período - Bobina de servilleta",
        subtitulo=(
            f"Del {data.PeriodoInicio.strftime('%d/%m/%Y')} "
            f"al {data.PeriodoFin.strftime('%d/%m/%Y')}"
        ),
        filtros={
            "Lotes": f"{data.TotalLotes:,}".replace(",", "."),
            "Bobinas": f"{data.TotalBobinas:,}".replace(",", "."),
        },
        generado_en=datetime.now(ZONA_BOLIVIA),
    )

    if not data.Lotes:
        reporte.parrafo("No se encontraron lotes en este período.")
        return reporte.a_pdf()

    for lote in data.Lotes:
        reporte.titulo_seccion(
            f"Lote #{lote.IdLoteBobinaServilleta} - {lote.FechaRecepcion.strftime('%d/%m/%Y')} "
            f"- {lote.NombreProveedor} ({lote.CantidadBobinas})"
        )
        reporte.tabla(columnas=_columnas_bobinas_lote(reporte), filas=lote.Bobinas)

    return reporte.a_pdf()


def nombre_archivo_lotes_servilleta_periodo(fecha_inicio: date, fecha_fin: date) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return (
        f"ingresos-lotes-servilleta-periodo-{fecha_inicio:%Y%m%d}-{fecha_fin:%Y%m%d}"
        f"-{ahora:%Y%m%d-%H%M}.pdf"
    )
