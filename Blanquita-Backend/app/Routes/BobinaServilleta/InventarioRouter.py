# Routes/BobinaServilleta/ProduccionBobinaServilletaRouter.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.BobinaServilleta.ProduccionBobinaServilletaService import ProduccionBobinaServilletaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    AbrirBobinaServilletaResponse
)

ProduccionBobinaServilletaRouter = APIRouter(
    prefix="/bobinaservilleta/produccion", tags=["Bobina Servilleta - Producción"]
)


def produccion_bobina_servilleta_service(db: Session = Depends(get_db)) -> ProduccionBobinaServilletaService:
    return ProduccionBobinaServilletaService(db)


@ProduccionBobinaServilletaRouter.post(
    "/abrir",
    response_model=AbrirBobinaServilletaResponse,
    status_code=200
)
def AbrirBobinaServilleta(
    data: AbrirBobinaServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.AbrirBobinaServilleta(data, usuario_actual["IdUsuario"])