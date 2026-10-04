from datetime import date

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.Config.supabase import get_db

from app.Auth.Dependencies import require_role, get_generado_por
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION

from app.Models.InventarioFinal.Reporte import (
    ReporteProduccionDiariaProductoTerminadoRequest,
    ReporteProduccionDiariaProductoTerminadoResponse,
    ReporteInventarioProductoTerminadoRequest,
    ReporteInventarioProductoTerminadoResponse,
)
from app.Services.InventarioFinal.Reporte import ReporteProductoTerminadoService
from app.Reportes.ProductoTerminado import (
    construir_reporte_produccion_diaria_producto_terminado,
    nombre_archivo_produccion_diaria_producto_terminado,
    construir_reporte_inventario_producto_terminado,
    nombre_archivo_inventario_producto_terminado,
)


def reporte_producto_terminado_service(
    db: Session = Depends(get_db),
) -> ReporteProductoTerminadoService:
    return ReporteProductoTerminadoService(db)


ProductoFinalReporteRouter = APIRouter(
    prefix="/productofinal/reportes",
    tags=["Producto Terminado - Reportes"],
)


@ProductoFinalReporteRouter.get(
    "/produccion/diaria/resumen",
    response_model=ReporteProduccionDiariaProductoTerminadoResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ResumenProduccionDiariaProductoTerminado(
    FechaInicio: date,
    FechaFin: date,
    IdsProducto: list[int] | None = Query(
        default=None,
        description="IDs de Producto (líneas) a incluir. Vacío = todas las líneas.",
    ),
    service: ReporteProductoTerminadoService = Depends(
        reporte_producto_terminado_service
    ),
):
    return service.ResumenProduccionDiaria(
        ReporteProduccionDiariaProductoTerminadoRequest(
            FechaInicio=FechaInicio,
            FechaFin=FechaFin,
            IdsProducto=IdsProducto,
        )
    )


@ProductoFinalReporteRouter.get(
    "/produccion/diaria",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ReporteProduccionDiariaProductoTerminado(
    FechaInicio: date,
    FechaFin: date,
    IdsProducto: list[int] | None = Query(
        default=None,
        description="IDs de Producto (líneas) a incluir. Vacío = todas las líneas.",
    ),
    VerMovimientos: bool = False,
    generado_por: str | None = Depends(get_generado_por),
    service: ReporteProductoTerminadoService = Depends(
        reporte_producto_terminado_service
    ),
):
    data = service.ReporteProduccionDiaria(
        ReporteProduccionDiariaProductoTerminadoRequest(
            FechaInicio=FechaInicio,
            FechaFin=FechaFin,
            IdsProducto=IdsProducto,
            VerMovimientos=VerMovimientos,
        )
    )
    pdf = construir_reporte_produccion_diaria_producto_terminado(data, generado_por)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_produccion_diaria_producto_terminado(FechaInicio, FechaFin)}"'
        },
    )


@ProductoFinalReporteRouter.get(
    "/inventario/resumen",
    response_model=ReporteInventarioProductoTerminadoResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ResumenInventarioProductoTerminado(
    IdsProducto: list[int] | None = Query(
        default=None,
        description="IDs de Producto (líneas) a incluir. Vacío = todas las líneas.",
    ),
    service: ReporteProductoTerminadoService = Depends(
        reporte_producto_terminado_service
    ),
):
    return service.ReporteInventario(
        ReporteInventarioProductoTerminadoRequest(IdsProducto=IdsProducto)
    )


@ProductoFinalReporteRouter.get(
    "/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ReporteInventarioProductoTerminado(
    IdsProducto: list[int] | None = Query(
        default=None,
        description="IDs de Producto (líneas) a incluir. Vacío = todas las líneas.",
    ),
    generado_por: str | None = Depends(get_generado_por),
    service: ReporteProductoTerminadoService = Depends(
        reporte_producto_terminado_service
    ),
):
    data = service.ReporteInventario(
        ReporteInventarioProductoTerminadoRequest(IdsProducto=IdsProducto)
    )
    pdf = construir_reporte_inventario_producto_terminado(data, generado_por)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_inventario_producto_terminado()}"'
        },
    )
