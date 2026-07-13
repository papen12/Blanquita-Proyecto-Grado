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