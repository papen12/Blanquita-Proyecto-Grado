from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.Auth.Jwt import verificar_token

seguridad = HTTPBearer()

ESTADO_USUARIO_INACTIVO = 2
ESTADO_USUARIO_SUSPENDIDO = 3

MENSAJE_POR_ESTADO = {
    ESTADO_USUARIO_INACTIVO: "Usuario inactivo, no puede operar el sistema",
    ESTADO_USUARIO_SUSPENDIDO: "Usuario suspendido, no puede operar el sistema",
}


def get_current_user(credenciales: HTTPAuthorizationCredentials = Depends(seguridad)) -> dict:
    token = credenciales.credentials
    payload = verificar_token(token)
    metadata = payload.get("app_metadata", {})

    id_usuario = metadata.get("IdUsuario")
    id_rol = metadata.get("IdRol")
    if id_usuario is None or id_rol is None:
        id_estado = metadata.get("IdEstadoUsuario")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=MENSAJE_POR_ESTADO.get(
                id_estado,
                "Usuario no habilitado para operar el sistema"
            )
        )

    return {
        "IdUsuario": int(id_usuario),
        "IdRol": int(id_rol),
        "NombreRol": metadata.get("NombreRol"),
        "Ci": metadata.get("Ci"),
        "IdEstadoUsuario": metadata.get("IdEstadoUsuario"),
        "AuthUserId": payload.get("sub"),
        "Correo": payload.get("email"),
    }


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
from fastapi import HTTPException, status
from jwt import PyJWKClient

SUPABASE_URL = os.getenv("SUPABASE_URL").rstrip("/")

JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
ISSUER = f"{SUPABASE_URL}/auth/v1"
AUDIENCE = "authenticated"

ALGORITMOS = ["ES256"]

_jwk_client = PyJWKClient(JWKS_URL, cache_keys=True, lifespan=900)


def precargar_jwks() -> None:
    try:
        _jwk_client.get_jwk_set()
    except Exception:
        pass


def verificar_token(token: str) -> dict:
    try:
        llave_firma = _jwk_client.get_signing_key_from_jwt(token).key
        payload = jwt.decode(
            token,
            llave_firma,
            algorithms=ALGORITMOS,
            audience=AUDIENCE,
            issuer=ISSUER,
            options={"require": ["exp", "sub", "aud"]},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expirado"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )







from slowapi import Limiter


def obtener_ip_real(request):
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "desconocido"


limiter = Limiter(
    key_func=obtener_ip_real
)


from pydantic import BaseModel


class LoginRequest(BaseModel):
    Ci: str
    Clave: str


class RefreshRequest(BaseModel):
    RefreshToken: str


class LoginResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    TokenType: str = "bearer"


class RefreshResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    TokenType: str = "bearer"


class LogoutResponse(BaseModel):
    Revocado: bool


from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class AuthRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ResolverCorreoPorCi(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ResolverCorreoPorCi"(p_Ci => :p_Ci)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)

    def ObtenerUsuarioPorId(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ObtenerUsuarioPorId"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)


from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status


class DbCaller:
    def __init__(self, db: Session):
        self.db = db

    def LlamarFuncion(self, consulta: str, parametros: dict | None = None, commit: bool = True) -> list[dict]:
        try:
            res = self.db.execute(text(consulta), parametros or {})
            filas = [dict(fila) for fila in res.mappings().all()]
            if commit:
                self.db.commit()
            return filas
        except SQLAlchemyError as e:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ejecutando operación en base de datos: {str(e)}"
            )

    def LlamarUnRegistro(self, consulta: str, parametros: dict | None = None, commit: bool = True) -> dict | None:
        filas = self.LlamarFuncion(consulta, parametros, commit)
        return filas[0] if filas else None


import os
import time

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Repository.Usuario.Auth import AuthRepository

SUPABASE_URL = os.getenv("SUPABASE_URL").rstrip("/")
SUPABASE_PUBLISHABLE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY")

TIMEOUT_AUTH = 15.0
TIEMPO_MINIMO_LOGIN = 0.5

ESTADO_USUARIO_ACTIVO = 1


class AuthService:
    def __init__(self, db: Session):
        self.repository = AuthRepository(db)

    def _Cabeceras(self, access_token: str | None = None) -> dict:
        cabeceras = {
            "apikey": SUPABASE_PUBLISHABLE_KEY,
            "Content-Type": "application/json",
        }
        if access_token:
            cabeceras["Authorization"] = f"Bearer {access_token}"
        return cabeceras

    def _SolicitarToken(self, grant_type: str, cuerpo: dict) -> httpx.Response:
        try:
            return httpx.post(
                f"{SUPABASE_URL}/auth/v1/token",
                params={"grant_type": grant_type},
                headers=self._Cabeceras(),
                json=cuerpo,
                timeout=TIMEOUT_AUTH,
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Servicio de autenticación no disponible"
            )

    def _IgualarTiempo(self, inicio: float) -> None:
        transcurrido = time.perf_counter() - inicio
        if transcurrido < TIEMPO_MINIMO_LOGIN:
            time.sleep(TIEMPO_MINIMO_LOGIN - transcurrido)

    def Login(self, ci: str, clave: str, ip: str | None, user_agent: str | None) -> dict:
        inicio = time.perf_counter()
        try:
            return self._EjecutarLogin(ci, clave)
        finally:
            self._IgualarTiempo(inicio)

    def _EjecutarLogin(self, ci: str, clave: str) -> dict:
        usuario = self.repository.ResolverCorreoPorCi({"p_Ci": ci})

        if usuario is None or usuario["CorreoOut"] is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        respuesta = self._SolicitarToken("password", {
            "email": usuario["CorreoOut"],
            "password": clave,
        })

        if respuesta.status_code in (400, 401, 403):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        if respuesta.status_code == 429:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados intentos, intente más tarde"
            )

        if respuesta.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Error del servicio de autenticación"
            )

        if usuario["IdEstadoUsuarioOut"] != ESTADO_USUARIO_ACTIVO:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario {usuario['NombreEstadoUsuarioOut']}, no puede iniciar sesión"
            )

        sesion = respuesta.json()

        return {
            "AccessToken": sesion["access_token"],
            "RefreshTokenCrudo": sesion["refresh_token"],
        }

    def RefreshAccessToken(self, refresh_token_crudo: str) -> dict:
        respuesta = self._SolicitarToken("refresh_token", {
            "refresh_token": refresh_token_crudo,
        })

        if respuesta.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido"
            )

        sesion = respuesta.json()

        return {
            "AccessToken": sesion["access_token"],
            "RefreshTokenCrudo": sesion["refresh_token"],
        }

    def _CerrarSesion(self, access_token: str, scope: str) -> bool:
        try:
            respuesta = httpx.post(
                f"{SUPABASE_URL}/auth/v1/logout",
                params={"scope": scope},
                headers=self._Cabeceras(access_token),
                timeout=TIMEOUT_AUTH,
            )
        except httpx.RequestError:
            return False

        return respuesta.status_code < 400

    def Logout(self, access_token: str) -> bool:
        return self._CerrarSesion(access_token, "local")

    def LogoutTodasLasSesiones(self, access_token: str) -> bool:
        return self._CerrarSesion(access_token, "global")











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


CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_claims      JSONB;
    v_extra       JSONB;
    v_id_usuario  INTEGER;
    v_id_rol      INTEGER;
    v_id_estado   INTEGER;
    v_ci          TEXT;
    v_nombre_rol  TEXT;
BEGIN
    SELECT u."IdUsuario", u."IdRol", u."IdEstadoUsuario", u."Ci", r."NombreRol"
      INTO v_id_usuario, v_id_rol, v_id_estado, v_ci, v_nombre_rol
      FROM public."Usuario" u
      JOIN public."Rol" r ON r."IdRol" = u."IdRol"
     WHERE u."AuthUserId" = (event ->> 'user_id')::UUID;

    v_claims := event -> 'claims';

    v_extra := jsonb_build_object('IdEstadoUsuario', v_id_estado);

    IF v_id_usuario IS NOT NULL AND v_id_estado = 1 THEN
        v_extra := v_extra || jsonb_build_object(
            'IdUsuario', v_id_usuario,
            'IdRol',     v_id_rol,
            'Ci',        v_ci,
            'NombreRol', v_nombre_rol
        );
    END IF;

    v_claims := jsonb_set(
        v_claims,
        '{app_metadata}',
        COALESCE(v_claims -> 'app_metadata', '{}'::JSONB) || v_extra
    );

    RETURN jsonb_set(event, '{claims}', v_claims);
END;
$$;

GRANT SELECT ON TABLE public."Rol" TO supabase_auth_admin;