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
import re

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def EstructuraClave(clave):
    patron = r'^[A-Z]{3}\d{3}$'
    if re.fullmatch(patron, clave):
        return True
    else:
        return False


def HashPassword(clave):
    clave_hash = ph.hash(clave)
    return clave_hash


def VerificarClave(clave_hash, clave_plana):
    try:
        ph.verify(clave_hash, clave_plana)
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



from pydantic import BaseModel


class UsuarioLogin(BaseModel):
    Ci: str
    Clave: str


class UsuarioLoginResponse(BaseModel):
    access_token: str
    IdUsuario: int
    IdRol: int
    NombreRol: str
    PrimerNombre: str
    ApellidoPaterno: str



from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class UsuarioRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def crear_usuario(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "CrearUsuario"(
                :p_IdRol,
                :p_IdEstadoUsuario,
                :p_Ci,
                :p_Clave,
                :p_PrimerNombre,
                :p_SegundoNombre,
                :p_ApellidoPaterno,
                :p_ApellidoMaterno
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def verificacion_usuario(self, ci: str) -> dict | None:
        sql = 'SELECT * FROM "VerificacionUsuario"(:p_ci)'
        return self.caller.LlamarUnRegistro(sql, {"p_ci": ci}, commit=False)
    

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Usuario.UsuarioRepository import UsuarioRepository
from app.Auth.Security import VerificarClave,EstructuraClave,HashPassword
from app.Auth.Jwt import crear_token_acceso
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Models.Usuario.UsuarioLogIn import UsuarioLogin, UsuarioLoginResponse

ESTADO_ACTIVO = 1

class UsuarioService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def crear_usuario(self, data: UsuarioCreate) -> dict:
        if not EstructuraClave(data.Clave):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La clave debe tener el formato: 3 letras mayúsculas seguidas de 3 dígitos (ej. ABC123)"
            )

        clave_hasheada = HashPassword(data.Clave)

        params = {
            "p_IdRol": data.IdRol,
            "p_IdEstadoUsuario": data.IdEstadoUsuario,
            "p_Ci": data.Ci,
            "p_Clave": clave_hasheada,
            "p_PrimerNombre": data.PrimerNombre,
            "p_SegundoNombre": data.SegundoNombre,
            "p_ApellidoPaterno": data.ApellidoPaterno,
            "p_ApellidoMaterno": data.ApellidoMaterno,
        }

        try:
            usuario = self.repository.crear_usuario(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "Ya existe un usuario registrado con el CI" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Ya existe un usuario registrado con el CI {data.Ci}"
                )
            if "El rol especificado no existe" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El rol con id {data.IdRol} no existe"
                )
            if "El estado de usuario especificado no existe" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El estado de usuario con id {data.IdEstadoUsuario} no existe"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo crear el usuario, verifica los datos ingresados"
            )

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el usuario"
            )

        return usuario
    
    def login(self, data: UsuarioLogin) -> UsuarioLoginResponse:
        usuario = self.repository.verificacion_usuario(data.Ci)
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        if usuario["IdEstadoUsuario"] != ESTADO_ACTIVO:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Usuario {usuario['NombreEstadoUsuario'].lower()}"
            )

        if not VerificarClave(usuario["Clave"], data.Clave):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )

        token = crear_token_acceso({
            "sub": str(usuario["IdUsuario"]),
            "rol_id": usuario["IdRol"],
            "rol": usuario["NombreRol"],
        })

        return UsuarioLoginResponse(
            access_token=token,
            IdUsuario=usuario["IdUsuario"],
            IdRol=usuario["IdRol"],
            NombreRol=usuario["NombreRol"],
            PrimerNombre=usuario["PrimerNombre"],
            ApellidoPaterno=usuario["ApellidoPaterno"],
        )
    

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Models.Usuario.UsuarioLogIn import UsuarioLogin, UsuarioLoginResponse
from app.Services.UsuarioService import UsuarioService



UsuarioRouter = APIRouter(prefix="/Usuario", tags=["Funciones Usuario"])


def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioService(db)


@UsuarioRouter.post("/create", response_model=UsuarioResponse, status_code=201)
def crear_usuario(
    data: UsuarioCreate,
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.crear_usuario(data)


@UsuarioRouter.post("/login", response_model=UsuarioLoginResponse, status_code=200)
def login(data: UsuarioLogin, service: UsuarioService = Depends(get_usuario_service)):
    return service.login(data)


