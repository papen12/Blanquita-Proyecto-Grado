from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_ingreso_lote,
    RUTA_INVENTARIO_BOBINA_SERVILLETA,
)

from typing import List

from app.Services.BobinaServilleta.BobinaServilletaService import BobinaServilletaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL

from app.Models.BobinaServilleta.BobinaServilleta import (
    IngresoBobinaServilletaResponse,
    IngresoBobinaServilletaRequest,
    TipoBobinaServilletaIngreso
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
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: BobinaServilletaService = Depends(bobina_servilleta_service)
):
    resultado = service.InsertarBobinasServilleta(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ingreso_lote("bobina servilleta", resultado.CantidadBobinasServilleta, RUTA_INVENTARIO_BOBINA_SERVILLETA), usuario_actual["IdUsuario"])
    return resultado

@BobinaServilletaRouter.get(
    "/obtenertipos",
    response_model=List[TipoBobinaServilletaIngreso],
    status_code=200
)
def ObtenerTiposBobinaServilleta(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: BobinaServilletaService = Depends(bobina_servilleta_service)
):
    return service.ObtenerTiposBobinaServilleta()