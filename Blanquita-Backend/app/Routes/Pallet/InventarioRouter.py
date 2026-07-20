from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.ProduccionPalletService import ProduccionPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR


from app.Models.Pallet.ProduccionPallet import IniciarProduccionPalletRequest, IniciarProduccionPalletResponse



def produccion_pallet_service(db: Session = Depends(get_db)) -> ProduccionPalletService:
    return ProduccionPalletService(db)

InventarioPalletRouter = APIRouter(
    prefix="/pallet/inventario", tags=["Pallet - Inventario"]
)

