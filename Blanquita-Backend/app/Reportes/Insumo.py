from datetime import date, datetime

from app.Models.Insumo.Reporte import (
    ReporteInventarioInsumoResponse,
    ReporteMovimientosInsumoResponse,
)
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA

UMBRAL_STOCK_BAJO = 6
ID_TIPO_MOVIMIENTO_INGRESO = 1


def _texto_periodo(inicio: date, fin: date) -> str:
    if inicio == fin:
        return f"Día {inicio.strftime('%d/%m/%Y')}"
    return f"Del {inicio.strftime('%d/%m/%Y')} al {fin.strftime('%d/%m/%Y')}"


def _texto_insumos(todos: bool, nombres: list[str]) -> str:
    if todos:
        return "Todos"
    if len(nombres) <= 3:
        return ", ".join(nombres)
    return f"{len(nombres)} seleccionados"


def _texto_movimiento(id_tipo_movimiento: int) -> str:
    return "Ingreso" if id_tipo_movimiento == ID_TIPO_MOVIMIENTO_INGRESO else "Salida"


def _estado_stock(cantidad: int) -> str:
    if cantidad == 0:
        return "Sin stock"
    if cantidad < UMBRAL_STOCK_BAJO:
        return "Stock bajo"
    return "Disponible"


def construir_reporte_inventario_insumo(
    data: ReporteInventarioInsumoResponse,
    generado_por: str | None = None,
) -> bytes:
    reporte = Reporte(
        titulo="Informe de inventario - Insumos",
        subtitulo="Stock actual en almacén",
        filtros={
            "Insumos": _texto_insumos(
                data.TodosLosTipos, [i.NombreInsumo for i in data.Insumos]
            )
        },
        generado_en=data.FechaGeneracion,
        generado_por=generado_por,
    )

    reporte.titulo_seccion(f"Insumos ({len(data.Insumos)})")
    reporte.tabla(
        columnas=[
            ("Insumo", "NombreInsumo"),
            ("Descripción", "DescripcionInsumo"),
            ("Stock", "CantidadActual"),
            ("Estado", lambda i: _estado_stock(i.CantidadActual)),
            ("Último movimiento", "FechaUltimoMovimiento"),
        ],
        filas=data.Insumos,
    )

    return reporte.a_pdf()


def nombre_archivo_inventario_insumo() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"informe-inventario-insumos-{ahora:%Y%m%d-%H%M}.pdf"


def construir_reporte_movimientos_insumo(
    data: ReporteMovimientosInsumoResponse,
    generado_por: str | None = None,
) -> bytes:
    reporte = Reporte(
        titulo="Movimientos de insumos",
        subtitulo=_texto_periodo(data.PeriodoInicio, data.PeriodoFin),
        filtros={
            "Insumos": _texto_insumos(
                data.TodosLosTipos, [r.NombreInsumo for r in data.Resumen]
            )
        },
        generado_en=datetime.now(ZONA_BOLIVIA),
        generado_por=generado_por,
    )

    reporte.titulo_seccion("Resumen por insumo")
    reporte.tabla(
        columnas=[
            ("Insumo", "NombreInsumo"),
            ("Ingresos", "Ingresos"),
            ("Salidas", "Salidas"),
            ("Neto", "Neto"),
            ("N° Movimientos", "NumeroMovimientos"),
            ("Stock actual", "CantidadActual"),
        ],
        filas=data.Resumen,
        fila_total=[
            "TOTAL",
            sum(r.Ingresos for r in data.Resumen),
            sum(r.Salidas for r in data.Resumen),
            sum(r.Neto for r in data.Resumen),
            sum(r.NumeroMovimientos for r in data.Resumen),
            "",
        ],
    )

    reporte.titulo_seccion(f"Detalle de movimientos ({len(data.Movimientos)})")
    reporte.tabla(
        columnas=[
            ("Fecha", "FechaMovimiento"),
            ("Insumo", "NombreInsumo"),
            ("Movimiento", lambda m: _texto_movimiento(m.IdTipoMovimiento)),
            ("Cantidad", "CantidadMovimiento"),
            (
                "Usuario",
                lambda m: reporte.celda_multilinea(
                    [f"{m.PrimerNombre} {m.ApellidoPaterno},", m.Ci, m.NombreRol]
                ),
            ),
            ("Observación", "Observacion"),
        ],
        filas=data.Movimientos,
    )

    return reporte.a_pdf()


def nombre_archivo_movimientos_insumo(fecha_inicio: date, fecha_fin: date) -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return (
        f"movimientos-insumos-{fecha_inicio:%Y%m%d}-{fecha_fin:%Y%m%d}"
        f"-{ahora:%Y%m%d-%H%M}.pdf"
    )
