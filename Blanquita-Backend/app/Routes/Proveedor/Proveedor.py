from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.Proveedor.Proveedor import ProveedorService
from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR

from typing import List

from app.Models.Proveedor.Proveedor import (
    ProveedorForm
)

def proveedor_service(db:Session=Depends(get_db))->ProveedorService:
    return ProveedorService(db)

ProveedorRouter=APIRouter(
    prefix="/proveedor",
    tags=["Proveedor - CRUD e Ingreso"]
)

@ProveedorRouter.get(
    "/formulario",
    response_model=List[ProveedorForm],
    status_code=200
)
def ObtenerProveedoresForm(
    usuario_actual:dict=Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service:ProveedorService=Depends(proveedor_service)
): return service.ObtenerProveedoresForm()