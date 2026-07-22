from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.BobinaPapel.LoteBobinaPapelService import LoteBobinaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION

from app.Models.BobinaPapel.IngresoBobinaPapel import (
    IngresoModelo,
    IngresoLoteBobinaPapelResponse,
)


def lote_bobina_papel_service(db: Session = Depends(get_db)) -> LoteBobinaService:
    return LoteBobinaService(db)


BobinaPapelRouter = APIRouter(
    prefix="/papelbobina", tags=["Papel Bobina - CRUD e Ingreso"]
)


@BobinaPapelRouter.post(
    "/cargarlote",
    response_model=IngresoLoteBobinaPapelResponse,
    status_code=201,
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: LoteBobinaService = Depends(lote_bobina_papel_service),
):
    return service.insertar_bobinas_papel(data, usuario_actual["IdUsuario"])