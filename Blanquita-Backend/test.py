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



















#Repository/Pallet/ProduccionPallet.py
from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionPalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)
 
    def IniciarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "IniciarProduccionPalletTubo"(
                :p_IdPallet,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)




#ProduccionPallet.py
from datetime import datetime
from pydantic import BaseModel


class IniciarProduccionPalletRequest(BaseModel):
    IdPallet: int


class IniciarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str



#Services/Pallet/ProduccionPalletService.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Pallet.ProduccionPallet import ProduccionPalletRepository
from app.Models.Pallet.ProduccionPallet import IniciarProduccionPalletRequest, IniciarProduccionPalletResponse


class ProduccionPalletService:
    def __init__(self, db: Session):
        self.repository = ProduccionPalletRepository(db)

    def IniciarProduccionPallet(self, data: IniciarProduccionPalletRequest, id_usuario: int) -> IniciarProduccionPalletResponse:
        params = {
            "p_IdPallet": data.IdPallet,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.IniciarProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "es obligatorio" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IdPallet es obligatorio para iniciar producción"
                )
            if "No existe el pallet" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe el pallet con id {data.IdPallet}"
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El pallet indicado no está disponible en almacén"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo iniciar la producción de pallet tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de pallet tubo"
            )

        return IniciarProduccionPalletResponse(**resultado)


#Routes/ProduccionRouter.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.ProduccionPalletService import ProduccionPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR


from app.Models.Pallet.ProduccionPallet import IniciarProduccionPalletRequest, IniciarProduccionPalletResponse



def produccion_pallet_service(db: Session = Depends(get_db)) -> ProduccionPalletService:
    return ProduccionPalletService(db)

ProduccionPalletRouter = APIRouter(
    prefix="/pallet/produccion", tags=["Pallet - Producción"]
)

@ProduccionPalletRouter.post(
    "/iniciar",
    response_model=IniciarProduccionPalletResponse,
    status_code=201
)
def IniciarProduccionPallet(
    data: IniciarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.IniciarProduccionPallet(data, usuario_actual["IdUsuario"])