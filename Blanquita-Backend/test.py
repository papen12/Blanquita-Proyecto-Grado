from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.Auth.Jwt import verificar_token

seguridad = HTTPBearer()


def get_current_user(credenciales: HTTPAuthorizationCredentials = Depends(seguridad)) -> dict:
    token = credenciales.credentials
    payload = verificar_token(token)

    id_usuario = payload.get("sub")
    id_rol = payload.get("rol_id")
    nombre_rol = payload.get("rol")

    if id_usuario is None or id_rol is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

    return {"IdUsuario": int(id_usuario), "IdRol": int(id_rol), "NombreRol": nombre_rol}


def require_role(roles_permitidos: list[int]):
    def verificar_rol(usuario_actual: dict = Depends(get_current_user)) -> dict:
        if usuario_actual["IdRol"] not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción"
            )
        return usuario_actual

    return verificar_rol



import os
import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status

SECRET_KEY = os.getenv("SECRET_KEY")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
ALGORITHM = "HS256"


def crear_token_acceso(data: dict) -> str:
    to_encode = data.copy()
    expira = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expira})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verificar_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )





import secrets
import hashlib
import os
from datetime import datetime, timedelta, timezone

REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))
REFRESH_TOKEN_MAX_AGE_SEGUNDOS = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def GenerarRefreshTokenCrudo() -> str:
    return secrets.token_urlsafe(64)


def HashRefreshToken(token_crudo: str) -> str:
    return hashlib.sha256(token_crudo.encode("utf-8")).hexdigest()


def CalcularExpiracionRefreshToken() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)




from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
import unicodedata

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)

LONGITUD_MINIMA = 15
LONGITUD_MAXIMA = 64


def EstructuraClave(clave):
    if not isinstance(clave, str) or clave == "":
        return False

    clave = unicodedata.normalize('NFC', clave)

    longitud = len(clave)  
    if longitud < LONGITUD_MINIMA or longitud > LONGITUD_MAXIMA:
        return False
    if any(ch.isspace() for ch in clave):
        return False

    return True


def HashPassword(clave):
    clave_normalizada = unicodedata.normalize('NFC', clave)
    clave_hash = ph.hash(clave_normalizada)
    return clave_hash


def VerificarClave(clave_hash, clave_plana):
    try:
        clave_normalizada = unicodedata.normalize('NFC', clave_plana)
        ph.verify(clave_hash, clave_normalizada)
        return True
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False





import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("Backend:")


class LoggingErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        inicio = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as e:
            duracion_ms = round((time.perf_counter() - inicio) * 1000, 2)
            logger.error(
                f"{request.method} {request.url.path} -> excepción no controlada: {e} ({duracion_ms} ms)"
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Error interno del servidor"},
            )

        duracion_ms = round((time.perf_counter() - inicio) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duracion_ms} ms)"
        )
        return response





    























from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional



class LoginRequest(BaseModel):
    Ci: str
    Clave: str


class LoginResponse(BaseModel):
    AccessToken: str
    TokenType: str = "bearer"


class RefreshResponse(BaseModel):
    AccessToken: str
    TokenType: str = "bearer"


class ValidacionRefreshToken(BaseModel):
    Valido: bool
    IdUsuario: Optional[int] = None
    IdRefreshToken: Optional[int] = None
    Motivo: str



class CrearRefreshTokenData(BaseModel):
    IdUsuario: int
    TokenHash: str
    FechaExpiracion: datetime
    IpOrigen: Optional[str] = None
    UserAgent: Optional[str] = None


class RotarRefreshTokenData(BaseModel):
    IdRefreshTokenViejo: int
    IdUsuario: int
    TokenHashNuevo: str
    FechaExpiracionNueva: datetime
    IpOrigen: Optional[str] = None
    UserAgent: Optional[str] = None



class LogoutResponse(BaseModel):
    Revocado: bool


class LogoutTodosResponse(BaseModel):
    SesionesRevocadas: int


from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class AuthRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ObtenerUsuarioPorId(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ObtenerUsuarioPorId"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def VerificacionUsuario(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "VerificacionUsuario"(p_ci => :p_ci)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def CrearRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "CrearRefreshToken"(
                p_IdUsuario => :p_IdUsuario,
                p_TokenHash => :p_TokenHash,
                p_FechaExpiracion => :p_FechaExpiracion,
                p_IpOrigen => :p_IpOrigen,
                p_UserAgent => :p_UserAgent
            ) AS "IdRefreshToken"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def ValidarRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ValidarRefreshToken"(p_TokenHash => :p_TokenHash)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def RotarRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "RotarRefreshToken"(
                p_IdRefreshTokenViejo => :p_IdRefreshTokenViejo,
                p_IdUsuario => :p_IdUsuario,
                p_TokenHashNuevo => :p_TokenHashNuevo,
                p_FechaExpiracionNueva => :p_FechaExpiracionNueva,
                p_IpOrigen => :p_IpOrigen,
                p_UserAgent => :p_UserAgent
            ) AS "IdRefreshToken"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def RevocarCadenaRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "RevocarCadenaRefreshToken"(p_IdUsuario => :p_IdUsuario) AS "SesionesRevocadas"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def RevocarRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "RevocarRefreshToken"(p_TokenHash => :p_TokenHash) AS "Revocado"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)




from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.Repository.Usuario.Auth import AuthRepository
from app.Auth.Jwt import crear_token_acceso
from app.Auth.Security import VerificarClave
from app.Auth.RefreshTokenUtils import (
    GenerarRefreshTokenCrudo,
    HashRefreshToken,
    CalcularExpiracionRefreshToken,
)

ESTADO_USUARIO_ACTIVO = 1


class AuthService:
    def __init__(self, db: Session):
        self.repository = AuthRepository(db)

    def Login(self, ci: str, clave: str, ip: str | None, user_agent: str | None) -> dict:
        usuario = self.repository.VerificacionUsuario({"p_ci": ci})

        if usuario is None or not VerificarClave(usuario["Clave"], clave):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        if usuario["IdEstadoUsuario"] != ESTADO_USUARIO_ACTIVO:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario {usuario['NombreEstadoUsuario']}, no puede iniciar sesión"
            )

        access_token = crear_token_acceso({
            "sub": str(usuario["IdUsuario"]),
            "rol_id": usuario["IdRol"],
            "rol": usuario["NombreRol"],
        })

        refresh_token_crudo = GenerarRefreshTokenCrudo()

        self.repository.CrearRefreshToken({
            "p_IdUsuario": usuario["IdUsuario"],
            "p_TokenHash": HashRefreshToken(refresh_token_crudo),
            "p_FechaExpiracion": CalcularExpiracionRefreshToken(),
            "p_IpOrigen": ip,
            "p_UserAgent": user_agent,
        })

        return {"AccessToken": access_token, "RefreshTokenCrudo": refresh_token_crudo}

    def RefreshAccessToken(
        self,
        refresh_token_crudo: str,
        ip: str | None,
        user_agent: str | None,
    ) -> dict:
        validacion = self.repository.ValidarRefreshToken({
            "p_TokenHash": HashRefreshToken(refresh_token_crudo)
        })

        if validacion is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")

        if validacion["Motivo"] == "Reuso detectado":
            self.repository.RevocarCadenaRefreshToken({"p_IdUsuario": validacion["IdUsuarioOut"]})
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesión comprometida, se cerraron todas las sesiones"
            )

        if not validacion["Valido"]:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token inválido")

        usuario = self.repository.ObtenerUsuarioPorId({"p_IdUsuario": validacion["IdUsuarioOut"]})

        if usuario is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")

        if usuario["IdEstadoUsuario"] != ESTADO_USUARIO_ACTIVO:
            self.repository.RevocarCadenaRefreshToken({"p_IdUsuario": usuario["IdUsuario"]})
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario {usuario['NombreEstadoUsuario']}, sesión cerrada"
            )

        nuevo_refresh_token_crudo = GenerarRefreshTokenCrudo()

        self.repository.RotarRefreshToken({
            "p_IdRefreshTokenViejo": validacion["IdRefreshTokenOut"],
            "p_IdUsuario": usuario["IdUsuario"],
            "p_TokenHashNuevo": HashRefreshToken(nuevo_refresh_token_crudo),
            "p_FechaExpiracionNueva": CalcularExpiracionRefreshToken(),
            "p_IpOrigen": ip,
            "p_UserAgent": user_agent,
        })

        nuevo_access_token = crear_token_acceso({
            "sub": str(usuario["IdUsuario"]),
            "rol_id": usuario["IdRol"],
            "rol": usuario["NombreRol"],
        })

        return {"AccessToken": nuevo_access_token, "RefreshTokenCrudo": nuevo_refresh_token_crudo}

    def Logout(self, refresh_token_crudo: str) -> bool:
        resultado = self.repository.RevocarRefreshToken({
            "p_TokenHash": HashRefreshToken(refresh_token_crudo)
        })
        return bool(resultado["Revocado"]) if resultado else False

    def LogoutTodasLasSesiones(self, id_usuario: int) -> int:
        resultado = self.repository.RevocarCadenaRefreshToken({"p_IdUsuario": id_usuario})
        return resultado["SesionesRevocadas"] if resultado else 0







    








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