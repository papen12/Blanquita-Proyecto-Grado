from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Services.Notificacion.Push import avisar_push
from app.Services.Notificacion.Avisos import (
    aviso_cancelacion,
    aviso_posposicion,
    RUTA_PRODUCCION_BOBINA_SERVILLETA,
)

from app.Services.BobinaServilleta.ProduccionBobinaServilletaService import ProduccionBobinaServilletaService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL

from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    AbrirBobinaServilletaResponse,
    IniciarProduccionServilletaRequest,
    IniciarProduccionServilletaResponse,
    PausaProduccionServilletaRequest,
    PausaProduccionServilletaResponse,
    ReanudarProduccionServilletaRequest,
    ReanudarProduccionServilletaResponse,
    PosponerProduccionServilletaRequest,
    PosponerProduccionServilletaResponse,
    RetomarProduccionServilletaRequest,
    RetomarProduccionServilletaResponse,
    FinalizarProduccionServilletaRequest,
    FinalizarProduccionServilletaResponse,
    CancelarProduccionServilletaRequest,
    CancelarProduccionServilletaResponse,
    VerPausasProduccionServilletaActivasResponse,
    VerPospuestasProduccionServilletaResponse,
    VerProduccionServilletaActivasRequest,
    VerProduccionServilletaActivasResponse
)

ProduccionBobinaServilletaRouter = APIRouter(
    prefix="/bobinaservilleta/produccion", tags=["Bobina Servilleta - Producción"]
)


def produccion_bobina_servilleta_service(db: Session = Depends(get_db)) -> ProduccionBobinaServilletaService:
    return ProduccionBobinaServilletaService(db)


@ProduccionBobinaServilletaRouter.post(
    "/abrir",
    response_model=AbrirBobinaServilletaResponse,
    status_code=200
)
def AbrirBobinaServilleta(
    data: AbrirBobinaServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.AbrirBobinaServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/iniciar",
    response_model=IniciarProduccionServilletaResponse,
    status_code=201
)
def IniciarProduccionSubBobina(
    data: IniciarProduccionServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.IniciarProduccionServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/pausar",
    response_model=PausaProduccionServilletaResponse,
    status_code=200
)
def PausarProduccionSubBobina(
    data: PausaProduccionServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.PausaProduccionServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/reanudar",
    response_model=ReanudarProduccionServilletaResponse,
    status_code=200
)
def ReanudadProduccionSubBobina(
    data: ReanudarProduccionServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.ReanudarProduccionServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/posponer",
    response_model=PosponerProduccionServilletaResponse,
    status_code=200
)
def PosponerProduccionSubBobina(
    data: PosponerProduccionServilletaRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    resultado = service.PosponerProduccionServilleta(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_posposicion("servilleta", data.MotivoPosposicion, RUTA_PRODUCCION_BOBINA_SERVILLETA), usuario_actual["IdUsuario"])
    return resultado

@ProduccionBobinaServilletaRouter.post(
    "/retomar",
    response_model=RetomarProduccionServilletaResponse,
    status_code=200
)
def RetomarProduccionSubBobina(
    data: RetomarProduccionServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.RetomarProduccionServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/finalizar",
    response_model=FinalizarProduccionServilletaResponse,
    status_code=200
)
def FinalizarProduccionServilelta(
    data: FinalizarProduccionServilletaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.FinalizarProduccionServilleta(data, usuario_actual["IdUsuario"])

@ProduccionBobinaServilletaRouter.post(
    "/cancelar",
    response_model=CancelarProduccionServilletaResponse,
    status_code=200
)
def CancelarProduccionServilleta(
    data: CancelarProduccionServilletaRequest,
    tareas: BackgroundTasks,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    resultado = service.CancelarProduccionServilleta(data, usuario_actual["IdUsuario"])
    avisar_push(tareas, aviso_cancelacion("servilleta", data.MotivoCancelacion, RUTA_PRODUCCION_BOBINA_SERVILLETA), usuario_actual["IdUsuario"])
    return resultado
@ProduccionBobinaServilletaRouter.get(
    "/activas",
    response_model=list[VerProduccionServilletaActivasResponse],
    status_code=200
)
def VerProduccionServilletaActivas(
    IdTipoMedidaSubBobina: int | None = None,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    data = VerProduccionServilletaActivasRequest(IdTipoMedidaSubBobina=IdTipoMedidaSubBobina)
    return service.VerProduccionServilletaActivas(data)

@ProduccionBobinaServilletaRouter.get(
    "/pausadas",
    response_model=list[VerPausasProduccionServilletaActivasResponse],
    status_code=200
)
def VerPausasProduccionServilletaActivas(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.VerPausasProduccionServilletaActivas()

@ProduccionBobinaServilletaRouter.get(
    "/pospuestas",
    response_model=list[VerPospuestasProduccionServilletaResponse],
    status_code=200
)
def VerPospuestasProduccionServilleta(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL])),
    service: ProduccionBobinaServilletaService = Depends(produccion_bobina_servilleta_service)
):
    return service.VerPospuestasProduccionServilleta()
