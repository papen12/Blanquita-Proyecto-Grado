from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.BobinaServilleta.BobinaServilletaService import BobinaServilletaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR

from app.Models.BobinaServilleta.BobinaServilleta import (
    IngresoBobinaServilletaResponse,
    IngresoBobinaServilletaRequest
)

BobinaServilletaRouter=APIRouter(prefix="/bobinaservilleta",tags=["Bobina Servilleta - CRUD e Ingreso"])

def bobina_servilleta_service(db: Session = Depends(get_db))->BobinaServilletaService: return BobinaServilletaService(db)

@BobinaServilletaRouter.post(
    "/cargarlote",
    response_model=IngresoBobinaServilletaResponse,
    status_code=201
)
def CargarLoteBobinaServilleta(
    data: IngresoBobinaServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: BobinaServilletaService = Depends(bobina_servilleta_service)
):
    return service.InsertarBobinasServilleta(data, usuario_actual["IdUsuario"])