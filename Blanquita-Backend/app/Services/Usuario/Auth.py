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

    