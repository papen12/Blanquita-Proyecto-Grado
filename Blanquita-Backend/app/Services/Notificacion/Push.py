import json
import logging
import os
from dataclasses import dataclass
from urllib.parse import urlsplit

from dotenv import load_dotenv
from fastapi import BackgroundTasks, HTTPException, status
from pywebpush import WebPushException, webpush
from sqlalchemy.orm import Session

from app.Config.supabase import SessionLocal
from app.Constants.Push import (
    CODIGOS_SUSCRIPCION_VENCIDA,
    LONGITUD_MAXIMA_CLAVE_PUSH,
    LONGITUD_MAXIMA_ENDPOINT_PUSH,
    PREFIJO_RUTA_POR_ROL,
    RUTA_PUSH_POR_DEFECTO,
    SERVICIOS_PUSH_PERMITIDOS,
    TIMEOUT_PUSH_SEGUNDOS,
    TTL_PUSH_SEGUNDOS,
    URGENCIA_PUSH,
)
from app.Models.Notificacion.Push import (
    ClavePublicaPushResponse,
    DesuscribirPushRequest,
    EstadoSuscripcionPushResponse,
    SuscribirPushRequest,
)
from app.Repository.Notificacion.Push import PushRepository

load_dotenv()

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_SUBJECT = os.getenv("VAPID_SUBJECT")

logger = logging.getLogger("Backend:")


@dataclass(frozen=True)
class AvisoPush:
    Titulo: str
    Cuerpo: str
    Ruta: str
    Roles: tuple[int, ...] = ()
    SoloAdmin: bool = False


def _endpoint_permitido(endpoint: str) -> bool:
    if len(endpoint) > LONGITUD_MAXIMA_ENDPOINT_PUSH:
        return False
    partes = urlsplit(endpoint)
    host = partes.hostname or ""
    return partes.scheme == "https" and any(
        host == servicio or host.endswith(f".{servicio}") for servicio in SERVICIOS_PUSH_PERMITIDOS
    )


def _ruta_destino(aviso: AvisoPush, id_rol: int) -> str:
    if aviso.SoloAdmin:
        return aviso.Ruta
    prefijo = PREFIJO_RUTA_POR_ROL.get(id_rol)
    return f"/{prefijo}/{aviso.Ruta}" if prefijo else RUTA_PUSH_POR_DEFECTO


class PushService:
    def __init__(self, db: Session):
        self.repository = PushRepository(db)

    def VerClavePublica(self) -> ClavePublicaPushResponse:
        return ClavePublicaPushResponse(ClavePublica=VAPID_PUBLIC_KEY)

    def VerEstado(self, endpoint: str, id_usuario: int) -> EstadoSuscripcionPushResponse:
        return EstadoSuscripcionPushResponse(
            Suscrito=self.repository.SuscripcionDeUsuarioExiste(id_usuario, endpoint)
        )

    def Suscribir(self, data: SuscribirPushRequest, id_usuario: int) -> EstadoSuscripcionPushResponse:
        if not _endpoint_permitido(data.Endpoint):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El navegador entregó un servicio de notificaciones no permitido",
            )

        claves = data.Claves.model_dump()
        if any(not valor or len(valor) > LONGITUD_MAXIMA_CLAVE_PUSH for valor in claves.values()):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="Las claves de la suscripción no son válidas",
            )

        self.repository.GuardarSuscripcion(id_usuario, data.Endpoint, claves)
        return EstadoSuscripcionPushResponse(Suscrito=True)

    def Desuscribir(self, data: DesuscribirPushRequest, id_usuario: int) -> EstadoSuscripcionPushResponse:
        self.repository.EliminarSuscripcionDeUsuario(id_usuario, data.Endpoint)
        return EstadoSuscripcionPushResponse(Suscrito=False)

    def Enviar(self, aviso: AvisoPush, excluir: int | None = None) -> int:
        if not VAPID_PRIVATE_KEY or not VAPID_SUBJECT:
            logger.warning("Push sin enviar: faltan VAPID_PRIVATE_KEY o VAPID_SUBJECT")
            return 0

        destinatarios = self.repository.Destinatarios(aviso.Roles, aviso.SoloAdmin, excluir)
        return sum(1 for destino in destinatarios if self._EnviarA(destino, aviso))

    def _EnviarA(self, destino: dict, aviso: AvisoPush) -> bool:
        carga = {
            "Titulo": aviso.Titulo,
            "Cuerpo": aviso.Cuerpo,
            "Ruta": _ruta_destino(aviso, destino["IdRol"]),
        }
        try:
            webpush(
                subscription_info={"endpoint": destino["Endpoint"], "keys": destino["Claves"]},
                data=json.dumps(carga),
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": VAPID_SUBJECT},
                ttl=TTL_PUSH_SEGUNDOS,
                timeout=TIMEOUT_PUSH_SEGUNDOS,
                headers={"Urgency": URGENCIA_PUSH},
            )
            return True
        except WebPushException as error:
            codigo = error.response.status_code if error.response is not None else None
            if codigo in CODIGOS_SUSCRIPCION_VENCIDA:
                self.repository.EliminarSuscripcion(destino["Endpoint"])
            else:
                logger.warning("Push rechazado por el servicio del navegador: %s", codigo)
            return False
        except Exception:
            logger.exception("No se pudo enviar el push a una suscripción")
            return False


def enviar_aviso(aviso: AvisoPush, id_actor: int | None) -> None:
    db = SessionLocal()
    try:
        PushService(db).Enviar(aviso, id_actor)
    except Exception:
        logger.exception("No se pudo enviar el aviso push")
    finally:
        db.close()


def avisar_push(tareas: BackgroundTasks, aviso: AvisoPush, id_actor: int | None) -> None:
    tareas.add_task(enviar_aviso, aviso, id_actor)
