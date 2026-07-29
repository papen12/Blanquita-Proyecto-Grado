from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.Config.supabase import get_db
from app.Auth.Dependencies import get_current_user
from app.Services.Usuario.Auth import AuthService
from app.Models.Usuario.Auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    LogoutResponse,
)
from app.Auth.Limiter import limiter

AuthRouter = APIRouter(prefix="/auth", tags=["Autenticación"])


def _ObtenerIp(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else None


def _ObtenerUserAgent(request: Request) -> str | None:
    return request.headers.get("x-client-user-agent") or request.headers.get("user-agent")


def _ObtenerAccessToken(request: Request) -> str | None:
    autorizacion = request.headers.get("authorization")
    if not autorizacion:
        return None
    partes = autorizacion.split()
    if len(partes) != 2 or partes[0].lower() != "bearer":
        return None
    return partes[1]


@AuthRouter.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
def login(
    datos: LoginRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    resultado = service.Login(
        ci=datos.Ci,
        clave=datos.Clave,
        ip=_ObtenerIp(request),
        user_agent=_ObtenerUserAgent(request),
    )

    return LoginResponse(
        AccessToken=resultado["AccessToken"],
        RefreshToken=resultado["RefreshTokenCrudo"],
    )


@AuthRouter.post("/refresh", response_model=RefreshResponse)
@limiter.limit("20/minute")
def refresh(
    datos: RefreshRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    resultado = service.RefreshAccessToken(refresh_token_crudo=datos.RefreshToken)

    return RefreshResponse(
        AccessToken=resultado["AccessToken"],
        RefreshToken=resultado["RefreshTokenCrudo"],
    )


@AuthRouter.post("/logout", response_model=LogoutResponse)
def logout(
    request: Request,
    db: Session = Depends(get_db),
):
    access_token = _ObtenerAccessToken(request)

    if access_token is None:
        return LogoutResponse(Revocado=False)

    service = AuthService(db)
    revocado = service.Logout(access_token)

    return LogoutResponse(Revocado=revocado)


@AuthRouter.post("/logout-todos", response_model=LogoutResponse)
def logout_todos(
    request: Request,
    usuario_actual: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    access_token = _ObtenerAccessToken(request)

    if access_token is None:
        return LogoutResponse(Revocado=False)

    service = AuthService(db)
    revocado = service.LogoutTodasLasSesiones(access_token)

    return LogoutResponse(Revocado=revocado)