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
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Usuario.Auth import AuthRepository
from app.Models.Usuario.Auth import(
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    ValidacionRefreshToken,
    CrearRefreshTokenData,
    RotarRefreshTokenData,
    LogoutResponse,
    LogoutTodosResponse
)

class AuthService:
    def __init__(self, db: Session):
        self.repository=AuthRepository(db)