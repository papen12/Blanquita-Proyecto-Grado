from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.Config.supabase import get_db

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

from app.Models.BobinaServilleta.Reporte import (
    ReporteInventarioBobinaServilletaRequest,
    VerBobinasServilletaRequest,
    VerBobinasServilletaResponse,
    VerSubBobinasServilletaRequest,
    VerSubBobinasServilletaResponse,
    ReporteHistorialMovimientosUnidadServilletaRequest,
    ReporteDetalleBobinaServilletaRequest,
)
from app.Services.BobinaServilleta.Reporte import ReporteBobinaServilletaService
from app.Reportes.BobinaServilleta import (
    construir_reporte_inventario_bobina_servilleta,
    nombre_archivo_inventario_servilleta,
    construir_reporte_inventario_subbobina_servilleta,
    nombre_archivo_inventario_subbobina_servilleta,
    construir_reporte_historial_movimientos_unidad_servilleta,
    nombre_archivo_historial_movimientos_unidad_servilleta,
    construir_reporte_detalle_bobina_servilleta,
    nombre_archivo_detalle_bobina_servilleta,
)


bs_ReporteRouter = APIRouter(
    prefix="/bobinaservilleta/reporte", tags=["Bobina Servilleta - Reportes"]
)


def reporte_bobina_servilleta_service(
    db: Session = Depends(get_db),
) -> ReporteBobinaServilletaService:
    return ReporteBobinaServilletaService(db)


@bs_ReporteRouter.get(
    "/bobina/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
)
def ReporteInventarioBobinasServilleta(
    tipos: list[int] | None = Query(
        default=None,
        description="IDs de TipoBobinaServilleta a incluir. Vacío = todos los tipos.",
    ),
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    data = service.ReporteInventario(
        ReporteInventarioBobinaServilletaRequest(IdsTipoBobinaServilleta=tipos)
    )
    pdf = construir_reporte_inventario_bobina_servilleta(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_inventario_servilleta()}"'
        },
    )


@bs_ReporteRouter.get(
    "/bobina/catalogo",
    response_model=VerBobinasServilletaResponse,
    status_code=200,
)
def CatalogoBobinasServilleta(
    CodigoBobina: str | None = None,
    IdProveedor: int | None = None,
    IdTipoBobinaServilleta: int | None = None,
    IdEstadoMateriaPrima: int | None = None,
    Pagina: int = 1,
    TamanoPagina: int = 50,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    return service.VerBobinasServilleta(
        VerBobinasServilletaRequest(
            CodigoBobina=CodigoBobina,
            IdProveedor=IdProveedor,
            IdTipoBobinaServilleta=IdTipoBobinaServilleta,
            IdEstadoMateriaPrima=IdEstadoMateriaPrima,
            Pagina=Pagina,
            TamanoPagina=TamanoPagina,
        )
    )

@bs_ReporteRouter.get(
    "/sub/inventario",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
)
def ReporteInventarioSubBobinasServilleta(
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    data = service.ReporteInventarioSubBobina()
    pdf = construir_reporte_inventario_subbobina_servilleta(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_inventario_subbobina_servilleta()}"'
        },
    )


@bs_ReporteRouter.get(
    "/sub/catalogo",
    response_model=VerSubBobinasServilletaResponse,
    status_code=200,
)
def subBobinaCatalogo(
    CodigoBobina: str | None = None,
    IdProveedor: int | None = None,
    IdTipoBobinaServilleta: int | None = None,
    IdsTipoMedidaSubBobina: list[int] | None = Query(
        default=None,
        description="IDs de TipoMedidaSubBobina (435/220) a incluir. Vacío = todos los formatos.",
    ),
    IdEstadoMateriaPrima: int | None = None,
    Pagina: int = 1,
    TamanoPagina: int = 50,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    return service.VerSubBobinasServilleta(
        VerSubBobinasServilletaRequest(
            CodigoBobina=CodigoBobina,
            IdProveedor=IdProveedor,
            IdTipoBobinaServilleta=IdTipoBobinaServilleta,
            IdsTipoMedidaSubBobina=IdsTipoMedidaSubBobina,
            IdEstadoMateriaPrima=IdEstadoMateriaPrima,
            Pagina=Pagina,
            TamanoPagina=TamanoPagina,
        )
    )


@bs_ReporteRouter.get(
    "/unidad/movimientos/{id_unidad_bobina_servilleta}",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
)
def ReporteHistorialMovimientosUnidadServilleta(
    id_unidad_bobina_servilleta: int,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    data = service.ReporteHistorialMovimientosUnidad(
        ReporteHistorialMovimientosUnidadServilletaRequest(
            IdUnidadBobinaServilleta=id_unidad_bobina_servilleta
        )
    )
    pdf = construir_reporte_historial_movimientos_unidad_servilleta(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_historial_movimientos_unidad_servilleta(id_unidad_bobina_servilleta)}"'
        },
    )


@bs_ReporteRouter.get(
    "/bobina/detalle/{id_bobina_servilleta}",
    status_code=200,
    response_class=Response,
    responses={200: {"content": {"application/pdf": {}}}},
)
def ReporteDetalleBobinaServilletaRoute(
    id_bobina_servilleta: int,
    usuario_actual: dict = Depends(
        require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])
    ),
    service: ReporteBobinaServilletaService = Depends(reporte_bobina_servilleta_service),
):
    data = service.ReporteDetalleBobinaServilleta(
        ReporteDetalleBobinaServilletaRequest(IdBobinaServilleta=id_bobina_servilleta)
    )
    pdf = construir_reporte_detalle_bobina_servilleta(data)

    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo_detalle_bobina_servilleta(id_bobina_servilleta)}"'
        },
    )
