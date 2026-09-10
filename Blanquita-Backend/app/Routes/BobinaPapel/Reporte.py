from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app.Config.supabase import get_db

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION

from app.Models.BobinaPapel.Reportes import ReporteInventarioBobinaPapelRequest
from app.Services.BobinaPapel.Reportes import ReporteBobinaPapelService
from app.Reportes.BobinaPapel import (
    construir_reporte_inventario_bobina_papel,
    nombre_archivo_inventario,
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
