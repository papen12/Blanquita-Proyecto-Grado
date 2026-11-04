from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_ingreso_lote,
    RUTA_INVENTARIO_RODELA,
)

from app.Services.Rodela.RodelaService import RodelaService

from typing import List
from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL

from app.Models.Rodela.Rodela import (
    IngresoRodelaRequest,
    IngresoRodelaResponse,
    TipoRodela,
)


RodelaRouter = APIRouter(prefix="/rodela", tags=["Rodela CRUD y Ingreso"])


def rodela_service(db: Session = Depends(get_db)) -> RodelaService:
    return RodelaService(db)


@RodelaRouter.post(
    "/cargarlote",
    response_model=IngresoRodelaResponse,
    status_code=201
)
def CargarLoteRodela(
    data: IngresoRodelaRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: RodelaService = Depends(rodela_service)
):
    resultado = service.InsertarRodelas(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ingreso_lote("rodela", resultado.CantidadRodelas, RUTA_INVENTARIO_RODELA), usuario_actual["IdUsuario"])
    return resultado


@RodelaRouter.get(
    "/obtenertipos",
    response_model=List[TipoRodela],
    status_code=200
)
def ObtenerTiposRodela(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: RodelaService = Depends(rodela_service)
):
    return service.ObtenerTiposRodela()
