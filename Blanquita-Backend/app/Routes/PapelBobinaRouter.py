from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.BobinaPapel.LoteBobinaPapelService import LoteBobinaService
from app.Services.BobinaPapel.ProduccionBobinaPapelService import ProduccionBobinaTuboService
from app.Services.BobinaPapel.InventarioBobinaPapelService import InventarioBobinaPapelService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR


from app.Models.BobinaPapel.IngresoBobina import IngresoModelo,IngresoLoteBobinaPapelResponse
from app.Models.BobinaPapel.IniciarProduccion import IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.FinalizarProduccion import FinalizarProduccionBobinaTuboRequest, FinalizarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.PausaProduccion import PausarProduccionBobinaTuboRequest,PausarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReanudarProduccion import ReanudarProduccionBobinaTuboRequest,ReanudarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.CancelarProduccion import CancelarProduccionBobinaTuboRequest,CancelarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReIngresarBobina import ReingresarBobinaAInventarioRequest,ReingresarBobinaAInventarioResponse
from app.Models.BobinaPapel.BajarBobina import DarDeBajaBobinaRequest,DarDeBajaBobinaResponse

from app.Models.BobinaPapel.InventarioBobinaPapel import (
    VerResumenInventarioBobinaPapelResponse,
    VerDetalleInventarioBobinaPapelRequest,
    VerDetalleInventarioBobinaPapelResponse,
)

from app.Models.BobinaPapel.OperadorLogs import InsertarMovimientoOperadorLogsRequest,InsertarMovimientoOperadorLogsResponse


PapelBobinaRouter = APIRouter(prefix="/papelbobina", tags=["Operaciones de produccion sobre Papel Bobina"])


def bobina_papel_service(db: Session = Depends(get_db)) -> LoteBobinaService:
    return LoteBobinaService(db)

def iniciar_produccion_bobina_tubo_service(db: Session = Depends(get_db)) -> ProduccionBobinaTuboService:
    return ProduccionBobinaTuboService(db)

def inventario_bobina_papel_service(db: Session = Depends(get_db)) -> InventarioBobinaPapelService:
    return InventarioBobinaPapelService(db)

@PapelBobinaRouter.post(
    "/cargarlotebobinapapel",
    response_model=IngresoLoteBobinaPapelResponse,
    status_code=201,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    service: LoteBobinaService = Depends(bobina_papel_service)
):
    return service.insertar_bobinas_papel(data)

@PapelBobinaRouter.post(
    "/iniciarproduccion",
    response_model=IniciarProduccionBobinaTuboResponse,
    status_code=201,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR]))]
)
def IniciarProduccion(
    data: IniciarProduccionBobinaTuboRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.IniciarProduccionBobinaTubo(data)

@PapelBobinaRouter.post(
    "/finalizarproduccion",
    response_model=FinalizarProduccionBobinaTuboResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def FinalizarProduccion(
    data: FinalizarProduccionBobinaTuboRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.FinalizarProduccion(data)

@PapelBobinaRouter.post(
    "/pausarproduccion",
    response_model=PausarProduccionBobinaTuboResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def PausarProduccion(
    data: PausarProduccionBobinaTuboRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.PausarProduccion(data)

@PapelBobinaRouter.post(
    "/reanudarproduccion",
    response_model=ReanudarProduccionBobinaTuboResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def ReanudarProduccion(
    data: ReanudarProduccionBobinaTuboRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReanudarProduccion(data)

@PapelBobinaRouter.post(
    "/cancelarproduccion",
    response_model=CancelarProduccionBobinaTuboResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def CancelarProduccion(
    data: CancelarProduccionBobinaTuboRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.CancelarProduccion(data)

@PapelBobinaRouter.post(
    "/reingresarbobinainventario",
    response_model=ReingresarBobinaAInventarioResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def ReIngresarBobinaInventario(
    data: ReingresarBobinaAInventarioRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReingresarBobina(data)

@PapelBobinaRouter.post(
    "/dardebajabobina",
    response_model=DarDeBajaBobinaResponse,
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]))]
)
def DarDeBajaBobina(
    data: DarDeBajaBobinaRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.DarDeBajaBobina(data)

@PapelBobinaRouter.post(
    "/insertarmovimientolog",
    response_model=InsertarMovimientoOperadorLogsResponse,
    status_code=201,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR]))]
)
def InsertarMovimientoLog(
    data: InsertarMovimientoOperadorLogsRequest,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.InsertarMovimientoOperadorLogs(data)

@PapelBobinaRouter.get(
    "/verinventariobobinapapel",
    response_model=list[VerResumenInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerInventarioBobinaPapel(
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service)
):
    return service.VerResumen()

@PapelBobinaRouter.get(
    "/verdetalleinventariobobinapapel/{IdTipoBobina}",
    response_model=list[VerDetalleInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerDetalleInventarioBobinaPapel(
    IdTipoBobina: int,
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service)
):
    return service.VerDetalle(VerDetalleInventarioBobinaPapelRequest(IdTipoBobina=IdTipoBobina))