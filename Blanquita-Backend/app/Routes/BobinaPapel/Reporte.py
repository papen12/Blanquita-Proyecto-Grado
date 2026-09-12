from datetime import date

from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.Config.supabase import get_db

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION

from app.Models.BobinaPapel.Reportes import (
    ReporteInventarioBobinaPapelRequest,
    VerProduccionesBobinaTuboRequest,
    VerProduccionesBobinaTuboResponse,
    ReporteProduccionBobinaTuboDetalleRequest,
    VerLotesBobinaPapelRequest,
    VerLotesBobinaPapelResponse,
    ReporteLoteBobinaPapelDetalleRequest,
    ReporteCancelacionProduccionBobinaTuboRequest,
    ReporteProduccionPorPeriodoRequest,
)
from app.Services.BobinaPapel.Reportes import ReporteBobinaPapelService
from app.Reportes.BobinaPapel import (
    construir_reporte_inventario_bobina_papel,
    nombre_archivo_inventario,
    construir_reporte_detalle_produccion_bobina_papel,
    nombre_archivo_detalle_produccion,
    construir_reporte_lote_bobina_papel_detalle,
    nombre_archivo_lote_detalle,
    construir_reporte_cancelacion_produccion_bobina_papel,
    nombre_archivo_cancelacion_produccion,
    construir_reporte_produccion_por_periodo,
    nombre_archivo_produccion_por_periodo,
)


def reporte_bobina_papel_service(
    db: Session = Depends(get_db),
) -> ReporteBobinaPapelService:
    return ReporteBobinaPapelService(db)


bpReporteRouter = APIRouter(
    prefix="/papelbobina/reportes",
    tags=["Papel Bobina - Reportes"],
)


@bpReporteRouter.get(
    "/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ReporteInventarioBobinasPapel(
    tipos: list[int] | None = Query(
        default=None,
        description="IDs de TipoBobina a incluir. Vacío = todos los tipos.",
    ),
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    data = service.ReporteInventario(
        ReporteInventarioBobinaPapelRequest(IdsTipoBobina=tipos)
    )
    pdf = construir_reporte_inventario_bobina_papel(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_inventario()}"'
        },
    )

@bpReporteRouter.get(
    "/produccion/catalogo",
    response_model=VerProduccionesBobinaTuboResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ObtenerCatalogoProduccion(
    FechaInicio: date | None = None,
    FechaFin: date | None = None,
    IdTurno: int | None = None,
    IdsTipoBobina: list[int] | None = Query(default=None),
    CodigoBobina: str | None = None,
    Operador: str | None = None,
    IdEstadoProduccion: int | None = None,
    Pagina: int = 1,
    TamanoPagina: int = 50,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    return service.VerProduccionesBobinaTubo(
        VerProduccionesBobinaTuboRequest(
            FechaInicio=FechaInicio,
            FechaFin=FechaFin,
            IdTurno=IdTurno,
            IdsTipoBobina=IdsTipoBobina,
            CodigoBobina=CodigoBobina,
            Operador=Operador,
            IdEstadoProduccion=IdEstadoProduccion,
            Pagina=Pagina,
            TamanoPagina=TamanoPagina,
        )
    )


@bpReporteRouter.get(
    "/produccion/detalle/{id_produccion}",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ObtenerDetalleProduccion(
    id_produccion: int,
    VerPausas: bool = False,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    data = service.ReporteDetalleProduccion(
        ReporteProduccionBobinaTuboDetalleRequest(
            IdProduccion=id_produccion,
            VerPausas=VerPausas,
        )
    )
    pdf = construir_reporte_detalle_produccion_bobina_papel(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_detalle_produccion(id_produccion)}"'
        },
    )
@bpReporteRouter.get(
    "/produccion/cancelada/{id_produccion}",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ReporteProduccionCancelada(
    id_produccion: int,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    data = service.ReporteCancelacionProduccion(
        ReporteCancelacionProduccionBobinaTuboRequest(IdProduccion=id_produccion)
    )
    pdf = construir_reporte_cancelacion_produccion_bobina_papel(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_cancelacion_produccion(id_produccion)}"'
        },
    )


@bpReporteRouter.get(
    "/lote/catalogo",
    response_model=VerLotesBobinaPapelResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ObtenerLoteCatalogo(
    FechaInicio: date | None = None,
    FechaFin: date | None = None,
    IdProveedor: int | None = None,
    IdsTipoBobina: list[int] | None = Query(default=None),
    Pagina: int = 1,
    TamanoPagina: int = 50,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    return service.VerLotesBobinaPapel(
        VerLotesBobinaPapelRequest(
            FechaInicio=FechaInicio,
            FechaFin=FechaFin,
            IdProveedor=IdProveedor,
            IdsTipoBobina=IdsTipoBobina,
            Pagina=Pagina,
            TamanoPagina=TamanoPagina,
        )
    )


@bpReporteRouter.get(
    "/lote/detalle/{id_lote_bobina}",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def CrearReporteLote(
    id_lote_bobina: int,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    data = service.ReporteLoteBobinaPapelDetalle(
        ReporteLoteBobinaPapelDetalleRequest(IdLoteBobina=id_lote_bobina)
    )
    pdf = construir_reporte_lote_bobina_papel_detalle(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_lote_detalle(id_lote_bobina)}"'
        },
    )


@bpReporteRouter.get(
    "/produccion/periodo",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))],
)
def ReporteProduccionPorPeriodo(
    FechaInicio: date,
    FechaFin: date,
    VerCancelaciones: bool = False,
    service: ReporteBobinaPapelService = Depends(reporte_bobina_papel_service),
):
    data = service.ReporteProduccionPorPeriodo(
        ReporteProduccionPorPeriodoRequest(
            FechaInicio=FechaInicio,
            FechaFin=FechaFin,
            VerCancelaciones=VerCancelaciones,
        )
    )
    pdf = construir_reporte_produccion_por_periodo(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_produccion_por_periodo(FechaInicio, FechaFin)}"'
        },
    )
