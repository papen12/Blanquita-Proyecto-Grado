from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.InventarioPalletService import InventarioPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Pallet.InventarioPallet import (
    ResumenInventarioPalletResponse,
    DetalleInventarioPalletRequest,
    DetalleInventarioPalletResponse,
    ReingresarPalletInventarioRequest,
    ReingresarPalletInventarioResponse
)


def inventario_pallet_service(db: Session = Depends(get_db)) -> InventarioPalletService:
    return InventarioPalletService(db)

InventarioPalletRouter = APIRouter(
    prefix="/pallet/inventario", tags=["Pallet - Inventario"]
)

@InventarioPalletRouter.get(
    "/resumen",
    response_model=list[ResumenInventarioPalletResponse],
    status_code=200
)
def VerResumenInventarioPallet(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.VerResumenInventarioPallet()

@InventarioPalletRouter.post(
    "/detalle",
    response_model=list[DetalleInventarioPalletResponse],
    status_code=200
)
def VerDetalleInventarioPallet(
    data: DetalleInventarioPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.VerDetalleInventarioPallet(data)

@InventarioPalletRouter.post(
    "/reingresar",
    response_model=ReingresarPalletInventarioResponse,
    status_code=200
)
def ReingresarInventarioPallet(
    data: ReingresarPalletInventarioRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService= Depends(inventario_pallet_service)
): return service.ReingresarPalletInventario(data,usuario_actual["IdUsuario"])
