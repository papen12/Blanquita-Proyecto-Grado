from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.BobinaPapel.BobinaPapelService import BobinaPapelService
from app.Services.BobinaPapel.TipoBobinaService import TipoBobinaService

from app.Auth.Dependencies import require_admin_db, require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

from typing import List
from app.Models.BobinaPapel.BobinaPapel import (
    IngresoModelo,
    IngresoLoteBobinaPapelResponse,
    TipoBobinaPapelIngreso,
    EditarBobinaPapelRequest,
    EditarBobinaPapelResponse,
)
from app.Models.BobinaPapel.TipoBobina import (
    CrearTipoBobinaPapelRequest,
    EditarTipoBobinaPapelRequest,
    ListarTiposBobinaPapelRequest,
    ListarTiposBobinaPapelResponse,
    TipoBobinaPapelResponse,
)


def bobina_papel_service(db: Session = Depends(get_db)) -> BobinaPapelService:
    return BobinaPapelService(db)


def tipo_bobina_service(db: Session = Depends(get_db)) -> TipoBobinaService:
    return TipoBobinaService(db)


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
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: BobinaPapelService = Depends(bobina_papel_service),
):
    return service.InsertarBobinasPapel(data, usuario_actual["IdUsuario"])

@BobinaPapelRouter.get(
    "/obtenertipos",
    response_model=List[TipoBobinaPapelIngreso],
    status_code=200,
)
def ObtenerTiposBobina(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
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
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: BobinaPapelService = Depends(bobina_papel_service),
):
    return service.EditarBobinaPapel(data, usuario_actual["IdUsuario"])


@BobinaPapelRouter.get(
    "/tipos/listar",
    response_model=ListarTiposBobinaPapelResponse,
    status_code=200,
)
def ListarTiposBobinaPapel(
    Busqueda: str | None = Query(default=None, max_length=50),
    Pagina: int = Query(default=1, ge=1),
    TamanoPagina: int = Query(default=20, ge=1, le=100),
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaService = Depends(tipo_bobina_service),
):
    return service.ListarTipos(
        ListarTiposBobinaPapelRequest(Busqueda=Busqueda, Pagina=Pagina, TamanoPagina=TamanoPagina)
    )

@BobinaPapelRouter.post(
    "/tipos/crear",
    response_model=TipoBobinaPapelResponse,
    status_code=201,
)
def CrearTipoBobinaPapel(
    data: CrearTipoBobinaPapelRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaService = Depends(tipo_bobina_service),
):
    return service.CrearTipo(data, usuario_actual["IdUsuario"])

@BobinaPapelRouter.put(
    "/tipos/editar",
    response_model=TipoBobinaPapelResponse,
    status_code=200,
)
def EditarTipoBobinaPapel(
    data: EditarTipoBobinaPapelRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaService = Depends(tipo_bobina_service),
):
    return service.EditarTipo(data, usuario_actual["IdUsuario"])
