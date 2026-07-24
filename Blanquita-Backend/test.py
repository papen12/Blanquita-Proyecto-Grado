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