from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.BobinaPapel.LoteBobinaPapelService import LoteBobinaService
from app.Services.BobinaPapel.ProduccionBobinaPapelService import ProduccionBobinaTuboService
from app.Services.BobinaPapel.InventarioBobinaPapelService import InventarioBobinaPapelService

from app.Auth.Dependencies import require_role, get_current_user
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR


from app.Models.BobinaPapel.IngresoBobina import IngresoModelo,IngresoLoteBobinaPapelResponse
from app.Models.BobinaPapel.IniciarProduccion import IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.FinalizarProduccion import FinalizarProduccionBobinaTuboRequest, FinalizarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.PausaProduccion import PausarProduccionBobinaTuboRequest,PausarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReanudarProduccion import ReanudarProduccionBobinaTuboRequest,ReanudarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.CancelarProduccion import CancelarProduccionBobinaTuboRequest,CancelarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReIngresarBobina import ReingresarBobinaAInventarioRequest,ReingresarBobinaAInventarioResponse
from app.Models.BobinaPapel.BajarBobina import DarDeBajaBobinaRequest,DarDeBajaBobinaResponse
from app.Models.BobinaPapel.VerProduccionBobinaTubo import VerProduccionBobinaTuboRequest, VerProduccionBobinaTuboResponse

from app.Models.BobinaPapel.VerPausasProduccionBobina import VerPausasProduccionBobinaTuboActivasRequest, VerPausasProduccionBobinaTuboActivasResponse
from app.Models.BobinaPapel.VerBobinasPapelFueraInventario import VerBobinasPapelFueraInventarioResponse


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
    status_code=201
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: LoteBobinaService = Depends(bobina_papel_service)
):
    return service.insertar_bobinas_papel(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/iniciarproduccion",
    response_model=IniciarProduccionBobinaTuboResponse,
    status_code=201
)
def IniciarProduccion(
    data: IniciarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.IniciarProduccionBobinaTubo(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/finalizarproduccion",
    response_model=FinalizarProduccionBobinaTuboResponse,
    status_code=200
)
def FinalizarProduccion(
    data: FinalizarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.FinalizarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/pausarproduccion",
    response_model=PausarProduccionBobinaTuboResponse,
    status_code=200
)
def PausarProduccion(
    data: PausarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.PausarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/reanudarproduccion",
    response_model=ReanudarProduccionBobinaTuboResponse,
    status_code=200
)
def ReanudarProduccion(
    data: ReanudarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReanudarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/cancelarproduccion",
    response_model=CancelarProduccionBobinaTuboResponse,
    status_code=200
)
def CancelarProduccion(
    data: CancelarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.CancelarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/reingresarbobinainventario",
    response_model=ReingresarBobinaAInventarioResponse,
    status_code=200
)
def ReIngresarBobinaInventario(
    data: ReingresarBobinaAInventarioRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReingresarBobina(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/dardebajabobina",
    response_model=DarDeBajaBobinaResponse,
    status_code=200
)
def DarDeBajaBobina(
    data: DarDeBajaBobinaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.DarDeBajaBobina(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/insertarmovimientolog",
    response_model=InsertarMovimientoOperadorLogsResponse,
    status_code=201
)
def InsertarMovimientoLog(
    data: InsertarMovimientoOperadorLogsRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.InsertarMovimientoOperadorLogs(data, usuario_actual["IdUsuario"])

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


@PapelBobinaRouter.get(
    "/verproduccionbobinatubo",
    response_model=list[VerProduccionBobinaTuboResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerProduccionBobinaTubo(
    IdTipoBobina: int | None = None,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.VerProduccionBobinaTubo(VerProduccionBobinaTuboRequest(IdTipoBobina=IdTipoBobina))

@PapelBobinaRouter.get(
    "/verpausasactivas",
    response_model=list[VerPausasProduccionBobinaTuboActivasResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerPausasProduccionBobinaTuboActivas(
    FiltroIdTipoBobina: int | None = None,
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.VerPausasActivas(VerPausasProduccionBobinaTuboActivasRequest(FiltroIdTipoBobina=FiltroIdTipoBobina))



@PapelBobinaRouter.get(
    "/verbobinasfuerainventario",
    response_model=list[VerBobinasPapelFueraInventarioResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerBobinasPapelFueraInventario(
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.VerBobinasFueraInventario()