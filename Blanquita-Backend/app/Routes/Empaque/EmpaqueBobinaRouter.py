from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.Empaque.EmpaqueBobinaService import EmpaqueBobinaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Empaque.EmpaqueBobina import( 
    IngresoEmpaqueRequest,
    IngresoEmpaqueResponse,
    TrasladarEmpaquesProduccionRequest,
    TrasladarEmpaquesProduccionResponseItem,
    ResumenInventarioEmpaqueResponse,
    DetalleInventarioEmpaqueRequest,
    DetalleInventarioEmpaqueResponse
)

EmpaqueBobinaRouter = APIRouter(
    prefix="/empaquebobina", tags=["Empaque Bobina - Ingreso - CRUD - Inventario"]
)


def empaque_bobina_service(db: Session = Depends(get_db)) -> EmpaqueBobinaService:
    return EmpaqueBobinaService(db)


@EmpaqueBobinaRouter.post(
    "/cargarlote",
    response_model=IngresoEmpaqueResponse,
    status_code=201
)
def CargarLoteEmpaque(
    data: IngresoEmpaqueRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.InsertarEmpaques(data, usuario_actual["IdUsuario"])


@EmpaqueBobinaRouter.post(
    "/trasladarproduccion",
    response_model=list[TrasladarEmpaquesProduccionResponseItem],
    status_code=200
)
def TrasladarProduccion(
    data: TrasladarEmpaquesProduccionRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.TrasladarEmpaquesAProduccion(data, usuario_actual["IdUsuario"])



@EmpaqueBobinaRouter.get(
    "/inventario",
    response_model=list[ResumenInventarioEmpaqueResponse],
    status_code=200
)
def VerInventario(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.VerResumenInventarioEmpaque()


@EmpaqueBobinaRouter.get(
    "/inventariodetalle",
    response_model=list[DetalleInventarioEmpaqueResponse],
    status_code=200
)
def VerDetalleInventario(
    IdTipoEmpaque: int,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    data = DetalleInventarioEmpaqueRequest(IdTipoEmpaque=IdTipoEmpaque)
    return service.VerDetalleInventarioEmpaque(data)