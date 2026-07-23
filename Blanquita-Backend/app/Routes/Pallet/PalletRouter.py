from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.Pallet.PalletService import PalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR

from app.Models.Pallet.Pallet import IngresoPalletRequest, IngresoPalletResponse


PalletRouter = APIRouter(prefix="/pallet", tags=["Pallet CRUD y Ingreso"])


def pallet_service(db: Session = Depends(get_db)) -> PalletService:
    return PalletService(db)




@PalletRouter.post(
    "/cargarlote",
    response_model=IngresoPalletResponse,
    status_code=201
)
def CargarLotePallet(
    data: IngresoPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: PalletService = Depends(pallet_service)
):
    return service.InsertarPallets(data, usuario_actual["IdUsuario"])


