import os
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.Config.supabase import get_db 
from app.Auth.Dependencies import get_current_user
from app.Services.Usuario.Auth import AuthService
from app.Models.Usuario.Auth import (
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    LogoutResponse,
    LogoutTodosResponse,
)
from app.Auth.Limiter import limiter

AuthRouter = APIRouter(prefix="/auth", tags=["Autenticación"])

NOMBRE_COOKIE_REFRESH = "refresh_token"
ENTORNO = os.getenv("ENTORNO")
COOKIE_SECURE = ENTORNO == "production"
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
REFRESH_TOKEN_MAX_AGE_SEGUNDOS = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def _SetearCookieRefreshToken(response: Response, refresh_token_crudo: str) -> None:
    response.set_cookie(
        key=NOMBRE_COOKIE_REFRESH,
        value=refresh_token_crudo,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="strict",
        max_age=REFRESH_TOKEN_MAX_AGE_SEGUNDOS,
        path="/",
    )


def _BorrarCookieRefreshToken(response: Response) -> None:
    response.delete_cookie(key=NOMBRE_COOKIE_REFRESH, path="/")


def _ObtenerIp(request: Request) -> str | None:
    return request.client.host if request.client else None


def _ObtenerUserAgent(request: Request) -> str | None:
    return request.headers.get("user-agent")


@AuthRouter.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
def login(
    datos: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    resultado = service.Login(
        ci=datos.Ci,
        clave=datos.Clave,
        ip=_ObtenerIp(request),
        user_agent=_ObtenerUserAgent(request),
    )

    _SetearCookieRefreshToken(response, resultado["RefreshTokenCrudo"])

    return LoginResponse(AccessToken=resultado["AccessToken"])


@AuthRouter.post("/refresh", response_model=RefreshResponse)
def refresh(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token_crudo = request.cookies.get(NOMBRE_COOKIE_REFRESH)

    if refresh_token_crudo is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No hay sesión activa"
        )

    service = AuthService(db)

    try:
        resultado = service.RefreshAccessToken(
            refresh_token_crudo=refresh_token_crudo,
            ip=_ObtenerIp(request),
            user_agent=_ObtenerUserAgent(request),
        )
    except HTTPException:
        _BorrarCookieRefreshToken(response)
        raise

    _SetearCookieRefreshToken(response, resultado["RefreshTokenCrudo"])

    return RefreshResponse(AccessToken=resultado["AccessToken"])


@AuthRouter.post("/logout", response_model=LogoutResponse)
def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    refresh_token_crudo = request.cookies.get(NOMBRE_COOKIE_REFRESH)
    _BorrarCookieRefreshToken(response)

    if refresh_token_crudo is None:
        return LogoutResponse(Revocado=False)

    service = AuthService(db)
    revocado = service.Logout(refresh_token_crudo)

    return LogoutResponse(Revocado=revocado)


@AuthRouter.post("/logout-todos", response_model=LogoutTodosResponse)
def logout_todos(
    response: Response,
    usuario_actual: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = AuthService(db)
    sesiones_revocadas = service.LogoutTodasLasSesiones(usuario_actual["IdUsuario"])

    _BorrarCookieRefreshToken(response)

    return LogoutTodosResponse(SesionesRevocadas=sesiones_revocadas)