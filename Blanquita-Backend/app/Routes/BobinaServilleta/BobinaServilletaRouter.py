from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from typing import List

from app.Services.BobinaServilleta.BobinaServilletaService import BobinaServilletaService
from app.Services.BobinaServilleta.TipoBobinaServilletaService import TipoBobinaServilletaService

from app.Auth.Dependencies import require_admin_db, require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR

from app.Models.BobinaServilleta.BobinaServilleta import (
    IngresoBobinaServilletaResponse,
    IngresoBobinaServilletaRequest,
    TipoBobinaServilletaIngreso
)
from app.Models.BobinaServilleta.TipoBobinaServilleta import (
    CrearTipoBobinaServilletaRequest,
    EditarTipoBobinaServilletaRequest,
    ListarTiposBobinaServilletaRequest,
    ListarTiposBobinaServilletaResponse,
    TipoBobinaServilletaResponse,
)

BobinaServilletaRouter=APIRouter(prefix="/bobinaservilleta",tags=["Bobina Servilleta - CRUD e Ingreso"])

def bobina_servilleta_service(db: Session = Depends(get_db))->BobinaServilletaService: return BobinaServilletaService(db)

def tipo_bobina_servilleta_service(db: Session = Depends(get_db)) -> TipoBobinaServilletaService:
    return TipoBobinaServilletaService(db)

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

@BobinaServilletaRouter.get(
    "/obtenertipos",
    response_model=List[TipoBobinaServilletaIngreso],
    status_code=200
)
def ObtenerTiposBobinaServilleta(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: BobinaServilletaService = Depends(bobina_servilleta_service)
):
    return service.ObtenerTiposBobinaServilleta()


@BobinaServilletaRouter.get(
    "/tipos/listar",
    response_model=ListarTiposBobinaServilletaResponse,
    status_code=200,
)
def ListarTiposBobinaServilleta(
    Busqueda: str | None = Query(default=None, max_length=50),
    Pagina: int = Query(default=1, ge=1),
    TamanoPagina: int = Query(default=20, ge=1, le=100),
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaServilletaService = Depends(tipo_bobina_servilleta_service),
):
    return service.ListarTipos(
        ListarTiposBobinaServilletaRequest(Busqueda=Busqueda, Pagina=Pagina, TamanoPagina=TamanoPagina)
    )

@BobinaServilletaRouter.post(
    "/tipos/crear",
    response_model=TipoBobinaServilletaResponse,
    status_code=201,
)
def CrearTipoBobinaServilleta(
    data: CrearTipoBobinaServilletaRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaServilletaService = Depends(tipo_bobina_servilleta_service),
):
    return service.CrearTipo(data, usuario_actual["IdUsuario"])

@BobinaServilletaRouter.put(
    "/tipos/editar",
    response_model=TipoBobinaServilletaResponse,
    status_code=200,
)
def EditarTipoBobinaServilleta(
    data: EditarTipoBobinaServilletaRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: TipoBobinaServilletaService = Depends(tipo_bobina_servilleta_service),
):
    return service.EditarTipo(data, usuario_actual["IdUsuario"])
