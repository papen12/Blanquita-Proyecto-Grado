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