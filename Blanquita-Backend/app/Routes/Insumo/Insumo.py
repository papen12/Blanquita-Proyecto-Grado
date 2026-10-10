from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Auth.Dependencies import require_role
from app.Config.supabase import get_db
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.Models.Insumo.Insumo import (
    CatalogoInsumoResponse,
    MovimientoInsumoRequest,
    MovimientoInsumoResponse,
)
from app.Services.Insumo.Insumo import InsumoService


def insumo_service(db: Session = Depends(get_db)) -> InsumoService:
    return InsumoService(db)


InsumoRouter = APIRouter(prefix="/insumo", tags=["Insumo - Ingreso - Salida - Inventario"])


@InsumoRouter.get(
    "/inventario",
    response_model=list[CatalogoInsumoResponse],
    status_code=200,
)
def VerCatalogoInsumo(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InsumoService = Depends(insumo_service),
):
    return service.VerCatalogoInsumo()


@InsumoRouter.post(
    "/ingreso",
    response_model=MovimientoInsumoResponse,
    status_code=201,
)
def IngresarInsumo(
    data: MovimientoInsumoRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InsumoService = Depends(insumo_service),
):
    return service.IngresarInsumo(data, usuario_actual["IdUsuario"])


@InsumoRouter.post(
    "/salida",
    response_model=MovimientoInsumoResponse,
    status_code=201,
)
def SacarInsumo(
    data: MovimientoInsumoRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InsumoService = Depends(insumo_service),
):
    return service.SacarInsumo(data, usuario_actual["IdUsuario"])
