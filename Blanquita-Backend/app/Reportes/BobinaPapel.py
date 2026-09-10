from datetime import datetime

from app.Models.BobinaPapel.Reportes import ReporteInventarioBobinaPapelResponse
from app.Reportes.reporte import Reporte
from app.utils.dates import ZONA_BOLIVIA


def construir_reporte_inventario_bobina_papel(
    data: ReporteInventarioBobinaPapelResponse,
) -> bytes:
    tipos = ", ".join(r.NombreTipoBobina for r in data.Resumen) or "Todos"

    reporte = Reporte(
        titulo="Informe de inventario - Bobina de papel",
        subtitulo="Bobinas en almacén",
        filtros={"Tipos": tipos},
        generado_en=data.FechaGeneracion,
    )

    reporte.titulo_seccion("Resumen por tipo")
    reporte.tabla(
        columnas=[
            ("Tipo", "NombreTipoBobina"),
            ("Cantidad", "CantidadBobinas"),
            ("Peso neto (kg)", "PesoNetoTotalKg"),
            ("Gramaje prom.", "GramajePromedio"),
            ("Recepción más antigua", "RecepcionMasAntigua"),
            ("Recepción más reciente", "RecepcionMasReciente"),
        ],
        filas=data.Resumen,
        fila_total=[
            "TOTAL",
            data.TotalBobinas,
            data.PesoNetoGeneralKg,
            "",
            "",
            "",
        ],
    )

    for tipo in data.Resumen:
        bobinas_tipo = [
            b for b in data.Bobinas if b.IdTipoBobina == tipo.IdTipoBobina
        ]
        reporte.titulo_seccion(f"{tipo.NombreTipoBobina} ({tipo.CantidadBobinas})")
        reporte.tabla(
            columnas=[
                ("Código", "CodigoBobina"),
                ("Lote", "CodigoLote"),
                ("Recepción", "FechaRecepcion"),
                ("Proveedor", "NombreProveedor"),
                ("P. bruto (kg)", "PesoBrutoKg"),
                ("P. neto (kg)", "PesoNetoKg"),
                ("Gramaje", "Gramaje"),
            ],
            filas=bobinas_tipo,
        )

    return reporte.a_pdf()


def nombre_archivo_inventario() -> str:
    ahora = datetime.now(ZONA_BOLIVIA)
    return f"informe-inventario-bobina-papel-{ahora:%Y%m%d-%H%M}.pdf"
