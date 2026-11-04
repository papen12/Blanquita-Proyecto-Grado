from pydantic import BaseModel


class ClavesSuscripcionPush(BaseModel):
    p256dh: str
    auth: str


class SuscribirPushRequest(BaseModel):
    Endpoint: str
    Claves: ClavesSuscripcionPush


class DesuscribirPushRequest(BaseModel):
    Endpoint: str


class ClavePublicaPushResponse(BaseModel):
    ClavePublica: str | None


class EstadoSuscripcionPushResponse(BaseModel):
    Suscrito: bool


class EvaluacionPushResponse(BaseModel):
    ModoConsulta: bool
    Enviadas: int
    Resueltas: int
