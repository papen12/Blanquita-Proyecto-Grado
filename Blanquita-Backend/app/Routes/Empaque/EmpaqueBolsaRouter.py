from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.Empaque.EmpaqueBolsaService import EmpaqueBolsaService
from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Empaque.EmpaqueBolsa import (
    IngresoEmpaqueBolsaRequest,
    IngresoEmpaqueBolsaResponse,
    DescontarEmpaqueBolsaRequest,
    DescontarEmpaqueBolsaResponse,
    ReingresarEmpaqueBolsaRequest,
    ReingresarEmpaqueBolsaResponse,
    CatalogoEmpaqueBolsaResponse
)


EmpaqueBolsaRouter = APIRouter(
    prefix="/empaquebolsa", tags=["Empaque Bolsa - Ingreso - CRUD - Inventario"]
)


def empaque_bolsa_service(db: Session = Depends(get_db)) -> EmpaqueBolsaService:
    return EmpaqueBolsaService(db)


@EmpaqueBolsaRouter.post(
    "/cargarlote",
    response_model=list[IngresoEmpaqueBolsaResponse],
    status_code=201
)
def CargarLoteEmpaque(
    data: IngresoEmpaqueBolsaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBolsaService = Depends(empaque_bolsa_service)
):
    return service.InsertarEmpaqueBolsa(data, usuario_actual["IdUsuario"])


@EmpaqueBolsaRouter.post(
    "/trasladarproduccion",
    response_model=list[DescontarEmpaqueBolsaResponse],
    status_code=200
)
def TrasladarProduccion(
    data: DescontarEmpaqueBolsaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBolsaService = Depends(empaque_bolsa_service)
):
    return service.DescontarEmpaqueBolsa(data, usuario_actual["IdUsuario"])

@EmpaqueBolsaRouter.post(
    "/reingresar",
    response_model=ReingresarEmpaqueBolsaResponse,
    status_code=200
)
def ReingresarEmpaqueBolsa(
    data: ReingresarEmpaqueBolsaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBolsaService = Depends(empaque_bolsa_service)
):
    return service.ReingresarEmpaqueBolsaAInventario(data, usuario_actual["IdUsuario"])

@EmpaqueBolsaRouter.get(
    "/inventario",
    response_model=list[CatalogoEmpaqueBolsaResponse],
    status_code=200
)
def VerCatalogoEmpaqueBolsa(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: EmpaqueBolsaService = Depends(empaque_bolsa_service)
):
    return service.VerCatalogoEmpaqueBolsa()