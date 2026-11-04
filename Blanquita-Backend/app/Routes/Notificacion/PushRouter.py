import hmac
import os

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.Auth.Dependencies import require_role
from app.Config.supabase import get_db
from app.Constants.Roles import ROL_GERENTE_GENERAL, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.Models.Notificacion.Push import (
    ClavePublicaPushResponse,
    DesuscribirPushRequest,
    EstadoSuscripcionPushResponse,
    EvaluacionPushResponse,
    SuscribirPushRequest,
)
from app.Services.Notificacion.EvaluadorPush import EvaluadorPushService
from app.Services.Notificacion.Push import PushService

load_dotenv()

PUSH_CRON_SECRET = os.getenv("PUSH_CRON_SECRET")

ROLES_PUSH = [ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR, ROL_GERENTE_GENERAL]


def push_service(db: Session = Depends(get_db)) -> PushService:
    return PushService(db)


def evaluador_push_service(db: Session = Depends(get_db)) -> EvaluadorPushService:
    return EvaluadorPushService(db)


def verificar_cron(x_cron_secret: str | None = Header(default=None)) -> None:
    if not PUSH_CRON_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="El evaluador de notificaciones no está configurado",
        )
    if not x_cron_secret or not hmac.compare_digest(x_cron_secret, PUSH_CRON_SECRET):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Secreto del evaluador inválido",
        )


PushRouter = APIRouter(prefix="/notificaciones/push", tags=["Notificaciones push"])


@PushRouter.get(
    "/clave",
    response_model=ClavePublicaPushResponse,
    status_code=200,
)
def VerClavePublicaPush(
    usuario_actual: dict = Depends(require_role(ROLES_PUSH)),
    service: PushService = Depends(push_service),
):
    return service.VerClavePublica()


@PushRouter.get(
    "/estado",
    response_model=EstadoSuscripcionPushResponse,
    status_code=200,
)
def VerEstadoSuscripcionPush(
    endpoint: str = Query(...),
    usuario_actual: dict = Depends(require_role(ROLES_PUSH)),
    service: PushService = Depends(push_service),
):
    return service.VerEstado(endpoint, usuario_actual["IdUsuario"])


@PushRouter.post(
    "/suscribir",
    response_model=EstadoSuscripcionPushResponse,
    status_code=200,
)
def SuscribirPush(
    data: SuscribirPushRequest,
    usuario_actual: dict = Depends(require_role(ROLES_PUSH)),
    service: PushService = Depends(push_service),
):
    return service.Suscribir(data, usuario_actual["IdUsuario"])


@PushRouter.post(
    "/desuscribir",
    response_model=EstadoSuscripcionPushResponse,
    status_code=200,
)
def DesuscribirPush(
    data: DesuscribirPushRequest,
    usuario_actual: dict = Depends(require_role(ROLES_PUSH)),
    service: PushService = Depends(push_service),
):
    return service.Desuscribir(data, usuario_actual["IdUsuario"])


@PushRouter.post(
    "/evaluar",
    response_model=EvaluacionPushResponse,
    status_code=200,
    dependencies=[Depends(verificar_cron)],
)
def EvaluarPush(service: EvaluadorPushService = Depends(evaluador_push_service)):
    return service.Evaluar()
