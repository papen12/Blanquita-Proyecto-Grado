from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_edicion,
    aviso_ingreso_lote,
    RUTA_INVENTARIO_BOBINA_PAPEL,
)

from app.Services.BobinaPapel.BobinaPapelService import BobinaPapelService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL

from typing import List
from app.Models.BobinaPapel.BobinaPapel import (
    IngresoModelo,
    IngresoLoteBobinaPapelResponse,
    TipoBobinaPapelIngreso,
    EditarBobinaPapelRequest,
    EditarBobinaPapelResponse,
)


def bobina_papel_service(db: Session = Depends(get_db)) -> BobinaPapelService:
    return BobinaPapelService(db)


BobinaPapelRouter = APIRouter(
    prefix="/bobinapapel", tags=["Bobina Papel - CRUD e Ingreso"]
)


@BobinaPapelRouter.post(
    "/cargarlote",
    response_model=IngresoLoteBobinaPapelResponse,
    status_code=201,
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: BobinaPapelService = Depends(bobina_papel_service),
):
    resultado = service.InsertarBobinasPapel(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ingreso_lote("bobina papel", resultado.CantidadBobinas, RUTA_INVENTARIO_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado

@BobinaPapelRouter.get(
    "/obtenertipos",
    response_model=List[TipoBobinaPapelIngreso],
    status_code=200,
)
def ObtenerTiposBobina(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: BobinaPapelService = Depends(bobina_papel_service),
):
    return service.ObtenerTiposBobinaPapel()

@BobinaPapelRouter.patch(
    "/editar",
    response_model=EditarBobinaPapelResponse,
    status_code=200,
)
def EditarBobinaPapel(
    data: EditarBobinaPapelRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: BobinaPapelService = Depends(bobina_papel_service),
):
    resultado = service.EditarBobinaPapel(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_edicion("una bobina papel", f"Código {resultado.CodigoBobina}", RUTA_INVENTARIO_BOBINA_PAPEL), usuario_actual["IdUsuario"])
    return resultado