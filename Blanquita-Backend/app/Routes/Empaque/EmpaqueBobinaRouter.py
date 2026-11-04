from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_ingreso_lote,
    RUTA_INVENTARIO_EMPAQUE_BOBINA,
)

from app.Services.Empaque.EmpaqueBobinaService import EmpaqueBobinaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL


from app.Models.Empaque.EmpaqueBobina import(
    IngresoEmpaqueRequest,
    IngresoEmpaqueResponse,
    TrasladarEmpaquesProduccionRequest,
    TrasladarEmpaquesProduccionResponseItem,
    ResumenInventarioEmpaqueResponse,
    DetalleInventarioEmpaqueRequest,
    DetalleInventarioEmpaqueResponse,
    EmpaqueReingresableResponse,
    ReingresarEmpaqueRequest,
    ReingresarEmpaqueResponse,
    TipoEmpaque
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
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    resultado = service.InsertarEmpaques(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_ingreso_lote("empaque en bobina", len(data.Empaques), RUTA_INVENTARIO_EMPAQUE_BOBINA), usuario_actual["IdUsuario"])
    return resultado


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
    "/reingresables",
    response_model=list[EmpaqueReingresableResponse],
    status_code=200
)
def ListarReingresables(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.ListarEmpaquesReingresables()


@EmpaqueBobinaRouter.post(
    "/reingresar",
    response_model=ReingresarEmpaqueResponse,
    status_code=200
)
def Reingresar(
    data: ReingresarEmpaqueRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.ReingresarEmpaque(data, usuario_actual["IdUsuario"])


@EmpaqueBobinaRouter.get(
    "/inventario",
    response_model=list[ResumenInventarioEmpaqueResponse],
    status_code=200
)
def VerInventario(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
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
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    data = DetalleInventarioEmpaqueRequest(IdTipoEmpaque=IdTipoEmpaque)
    return service.VerDetalleInventarioEmpaque(data)


@EmpaqueBobinaRouter.get(
    "/obtenertipos",
    response_model=list[TipoEmpaque],
    status_code=200
)
def ObtenerTiposEmpaque(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: EmpaqueBobinaService = Depends(empaque_bobina_service)
):
    return service.ObtenerTiposEmpaque()