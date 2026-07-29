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