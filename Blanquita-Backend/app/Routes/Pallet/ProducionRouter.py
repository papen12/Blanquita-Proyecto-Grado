from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.ProduccionPalletService import ProduccionPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Pallet.ProduccionPallet import (
    IniciarProduccionPalletRequest,
    IniciarProduccionPalletResponse,
    PausaProduccionPalletRequest,
    PausaProduccionPalletResponse,
    ReanudarProduccionPalletRequest,
    ReanudarProduccionPalletResponse,
    FinalizarProduccionPalletRequest,
    FinalizarProduccionPalletResponse,
    CancelarProduccionPalletRequest,
    CancelarProduccionPalletResponse,
    ReingresarPalletInventarioResponse,
    ReingresarPalletInventarioRequest,
    DarDeBajaPalletRequest,DarDeBajaPalletResponse
)



def produccion_pallet_service(db: Session = Depends(get_db)) -> ProduccionPalletService:
    return ProduccionPalletService(db)

ProduccionPalletRouter = APIRouter(
    prefix="/pallet/produccion", tags=["Pallet - Producción"]
)

@ProduccionPalletRouter.post(
    "/iniciar",
    response_model=IniciarProduccionPalletResponse,
    status_code=201
)
def IniciarProduccionPallet(
    data: IniciarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.IniciarProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/pausar",
    response_model=PausaProduccionPalletResponse,
    status_code=200
)
def PausarProduccionPallet(
    data: PausaProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.PausaProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/reanudar",
    response_model=ReanudarProduccionPalletResponse,
    status_code=200
)
def ReanudarProduccionPallet(
    data:ReanudarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
): return service.ReanudarProduccionPallet(data, usuario_actual["IdUsuario"])


@ProduccionPalletRouter.post(
    "/finalizar",
    response_model=FinalizarProduccionPalletResponse,
    status_code=200
)
def FinalizarProduccionPallet(
    data: FinalizarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.FinalizarProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/cancelar",
    response_model=CancelarProduccionPalletResponse,
    status_code=200
)
def CancelarProduccionPallet(
    data: CancelarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.CancelarProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/reingresar",
    response_model=ReingresarPalletInventarioResponse,
    status_code=200
)
def ReingresarInventarioPallet(
    data: ReingresarPalletInventarioRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService= Depends(produccion_pallet_service)
): return service.ReingresarPalletInventario(data,usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/dardebaja",
    response_model=DarDeBajaPalletResponse,
    status_code=200
)
def DarDeBajaPallet(
    data: DarDeBajaPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.DarDeBajaPallet(data, usuario_actual["IdUsuario"])