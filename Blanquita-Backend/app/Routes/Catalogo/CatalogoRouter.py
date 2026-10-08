from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Auth.Dependencies import require_admin_db
from app.Config.supabase import get_db
from app.Models.Catalogo.Catalogo import (
    CrearLineaRequest,
    CrearPresentacionRequest,
    LineaItem,
    LineaResponse,
    PresentacionItem,
    PresentacionResponse,
)
from app.Services.Catalogo.CatalogoService import CatalogoService

CatalogoRouter = APIRouter(prefix="/catalogo", tags=["Catálogo - Líneas y Productos"])


def catalogo_service(db: Session = Depends(get_db)) -> CatalogoService:
    return CatalogoService(db)


@CatalogoRouter.get(
    "/lineas/listar",
    response_model=List[LineaItem],
    status_code=200,
)
def ListarLineas(
    usuario_actual: dict = Depends(require_admin_db),
    service: CatalogoService = Depends(catalogo_service),
):
    return service.ListarLineas()


@CatalogoRouter.post(
    "/lineas/crear",
    response_model=LineaResponse,
    status_code=201,
)
def CrearLinea(
    data: CrearLineaRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: CatalogoService = Depends(catalogo_service),
):
    return service.CrearLinea(data, usuario_actual["IdUsuario"])


@CatalogoRouter.get(
    "/productos/listar",
    response_model=List[PresentacionItem],
    status_code=200,
)
def ListarProductos(
    usuario_actual: dict = Depends(require_admin_db),
    service: CatalogoService = Depends(catalogo_service),
):
    return service.ListarPresentaciones()


@CatalogoRouter.post(
    "/productos/crear",
    response_model=PresentacionResponse,
    status_code=201,
)
def CrearProducto(
    data: CrearPresentacionRequest,
    usuario_actual: dict = Depends(require_admin_db),
    service: CatalogoService = Depends(catalogo_service),
):
    return service.CrearPresentacion(data, usuario_actual["IdUsuario"])
