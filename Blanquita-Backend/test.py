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





















from datetime import datetime

from pydantic import BaseModel


class IniciarProduccionBobinaTuboRequest(BaseModel):
    IdBobina1: int
    IdBobina2: int

class IniciarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str


from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionBobinaTuboRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def IniciarProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "IniciarProduccionBobinaTubo"(
                :p_IdBobina1,
                :p_IdBobina2,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
    
    def FinalizarProduccion(self,params:dict)->dict:
        sql="""
            Select * from "FinalizarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario 
            )
            """
        return self.caller.LlamarUnRegistro(sql,params)
    def PausarProduccion(self,params:dict)->dict:
        sql="""
            select * from "FnPausarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario,
            :p_MotivoPausaProduccion 
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def RenudarProduccion(self,params:dict)->dict:
        sql="""
            select * from "ReanudarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def CancelarProduccion(self,params:dict)->dict:
        sql="""
            select * from "CancelarProduccionBobinaTubo"(
            :p_id_produccion,
            :p_id_usuario,
            :p_motivo_cancelacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    
    def ReingresarBobina(self,params:dict)->dict:
        sql="""
            select * from "ReingresarBobinaAInventario"(
            :p_IdBobinaPapel,
            :p_IdUsuario,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def DarDeBajaBobina(self,params:dict)->dict:
        sql="""
            select * from "DarDeBajaBobina"(
            :p_IdBobinaPapel,
            :p_IdUsuario,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    
    def InsertarMovimientoOperadorLogs(self,params:dict)->dict:
        sql="""
            select * from "InsertarMovimientoOperadorLogs"(
            :p_IdProduccionBobinaTubo,
            :p_IdTipoMovimientoOperadorLogs,
            :p_IdUsuario,
            :p_CantidadLogs,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    


from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.BobinaPapel.produccionbobinarepository import ProduccionBobinaTuboRepository
from app.Models.BobinaPapel.IniciarProduccion import IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.FinalizarProduccion import FinalizarProduccionBobinaTuboRequest,FinalizarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.PausaProduccion import PausarProduccionBobinaTuboRequest,PausarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReanudarProduccion import ReanudarProduccionBobinaTuboRequest,ReanudarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.CancelarProduccion import CancelarProduccionBobinaTuboRequest,CancelarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReIngresarBobina import ReingresarBobinaAInventarioRequest,ReingresarBobinaAInventarioResponse
from app.Models.BobinaPapel.BajarBobina import DarDeBajaBobinaRequest,DarDeBajaBobinaResponse
from app.Models.BobinaPapel.OperadorLogs import InsertarMovimientoOperadorLogsRequest,InsertarMovimientoOperadorLogsResponse

class ProduccionBobinaTuboService:
    def __init__(self, db: Session):
        self.repository = ProduccionBobinaTuboRepository(db)

    def IniciarProduccionBobinaTubo(self, data: IniciarProduccionBobinaTuboRequest, id_usuario: int) -> IniciarProduccionBobinaTuboResponse:
        params = {
            "p_IdBobina1": data.IdBobina1,
            "p_IdBobina2": data.IdBobina2,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.IniciarProduccionBobinaTubo(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "no puede ser la misma bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IdBobina1 e IdBobina2 no pueden ser la misma bobina"
                )
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Una de las bobinas indicadas no existe"
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Una de las bobinas indicadas no está disponible en almacén"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo iniciar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de bobina tubo"
            )

        return IniciarProduccionBobinaTuboResponse(**resultado)

    def FinalizarProduccion(self, data: FinalizarProduccionBobinaTuboRequest, id_usuario: int) -> FinalizarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.FinalizarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede finalizarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo finalizar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo finalizar la producción de bobina tubo"
            )

        return FinalizarProduccionBobinaTuboResponse(**resultado)

    def PausarProduccion(self, data: PausarProduccionBobinaTuboRequest, id_usuario: int) -> PausarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
            "p_MotivoPausaProduccion": data.MotivoPausaProduccion,
        }

        try:
            resultado = self.repository.PausarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede pausarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo pausar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo pausar la producción de bobina tubo"
            )

        return PausarProduccionBobinaTuboResponse(**resultado)

    def ReanudarProduccion(self, data: ReanudarProduccionBobinaTuboRequest, id_usuario: int) -> ReanudarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.RenudarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "No existe una pausa activa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No existe una pausa activa para la producción indicada"
                )
            if "no se encuentra en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra en Pausa, no puede reanudarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reanudar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reanudar la producción de bobina tubo"
            )

        return ReanudarProduccionBobinaTuboResponse(**resultado)

    def CancelarProduccion(self, data: CancelarProduccionBobinaTuboRequest, id_usuario: int) -> CancelarProduccionBobinaTuboResponse:
        params = {
            "p_id_produccion": data.IdProduccionBobinaTubo,
            "p_id_usuario": id_usuario,
            "p_motivo_cancelacion": data.MotivoCancelacion,
        }

        try:
            resultado = self.repository.CancelarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no está en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no está en Pausa, no se puede cancelar"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo cancelar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cancelar la producción de bobina tubo"
            )

        return CancelarProduccionBobinaTuboResponse(**resultado)

    def ReingresarBobina(self, data: ReingresarBobinaAInventarioRequest, id_usuario: int) -> ReingresarBobinaAInventarioResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.ReingresarBobina(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la bobina con id {data.IdBobinaPapel}"
                )
            if "no está Fuera de Inventario" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La bobina indicada no está Fuera de Inventario, no puede reingresarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reingresar la bobina a inventario, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reingresar la bobina a inventario"
            )

        return ReingresarBobinaAInventarioResponse(**resultado)

    def DarDeBajaBobina(self, data: DarDeBajaBobinaRequest, id_usuario: int) -> DarDeBajaBobinaResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.DarDeBajaBobina(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la bobina con id {data.IdBobinaPapel}"
                )
            if "no está Fuera de Inventario" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La bobina indicada no está Fuera de Inventario, no puede darse de baja"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo dar de baja la bobina, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo dar de baja la bobina"
            )

        return DarDeBajaBobinaResponse(**resultado)

    def InsertarMovimientoOperadorLogs(self, data: InsertarMovimientoOperadorLogsRequest, id_usuario: int) -> InsertarMovimientoOperadorLogsResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdTipoMovimientoOperadorLogs": data.IdTipoMovimientoOperadorLogs,
            "p_IdUsuario": id_usuario,
            "p_CantidadLogs": data.CantidadLogs,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.InsertarMovimientoOperadorLogs(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "CantidadLogs debe ser un valor positivo" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CantidadLogs debe ser un valor positivo"
                )
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se pueden registrar logs" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no está En Producción ni en Pausa, no se pueden registrar logs"
                )
            if "No se puede descontar" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La cantidad a descontar supera el total de logs registrados"
                )
            if "no es válido" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El tipo de movimiento {data.IdTipoMovimientoOperadorLogs} no es válido"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el movimiento de logs del operador, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el movimiento de logs del operador"
            )

        return InsertarMovimientoOperadorLogsResponse(**resultado)
    




from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.BobinaPapel.LoteBobinaPapelService import LoteBobinaService
from app.Services.BobinaPapel.ProduccionBobinaPapelService import ProduccionBobinaTuboService
from app.Services.BobinaPapel.InventarioBobinaPapelService import InventarioBobinaPapelService

from app.Auth.Dependencies import require_role, get_current_user
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR


from app.Models.BobinaPapel.IngresoBobina import IngresoModelo,IngresoLoteBobinaPapelResponse
from app.Models.BobinaPapel.IniciarProduccion import IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.FinalizarProduccion import FinalizarProduccionBobinaTuboRequest, FinalizarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.PausaProduccion import PausarProduccionBobinaTuboRequest,PausarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReanudarProduccion import ReanudarProduccionBobinaTuboRequest,ReanudarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.CancelarProduccion import CancelarProduccionBobinaTuboRequest,CancelarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReIngresarBobina import ReingresarBobinaAInventarioRequest,ReingresarBobinaAInventarioResponse
from app.Models.BobinaPapel.BajarBobina import DarDeBajaBobinaRequest,DarDeBajaBobinaResponse

from app.Models.BobinaPapel.InventarioBobinaPapel import (
    VerResumenInventarioBobinaPapelResponse,
    VerDetalleInventarioBobinaPapelRequest,
    VerDetalleInventarioBobinaPapelResponse,
)

from app.Models.BobinaPapel.OperadorLogs import InsertarMovimientoOperadorLogsRequest,InsertarMovimientoOperadorLogsResponse


PapelBobinaRouter = APIRouter(prefix="/papelbobina", tags=["Operaciones de produccion sobre Papel Bobina"])


def bobina_papel_service(db: Session = Depends(get_db)) -> LoteBobinaService:
    return LoteBobinaService(db)

def iniciar_produccion_bobina_tubo_service(db: Session = Depends(get_db)) -> ProduccionBobinaTuboService:
    return ProduccionBobinaTuboService(db)

def inventario_bobina_papel_service(db: Session = Depends(get_db)) -> InventarioBobinaPapelService:
    return InventarioBobinaPapelService(db)

@PapelBobinaRouter.post(
    "/cargarlotebobinapapel",
    response_model=IngresoLoteBobinaPapelResponse,
    status_code=201
)
def CargarLoteBobinaPapel(
    data: IngresoModelo,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: LoteBobinaService = Depends(bobina_papel_service)
):
    return service.insertar_bobinas_papel(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/iniciarproduccion",
    response_model=IniciarProduccionBobinaTuboResponse,
    status_code=201
)
def IniciarProduccion(
    data: IniciarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.IniciarProduccionBobinaTubo(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/finalizarproduccion",
    response_model=FinalizarProduccionBobinaTuboResponse,
    status_code=200
)
def FinalizarProduccion(
    data: FinalizarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.FinalizarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/pausarproduccion",
    response_model=PausarProduccionBobinaTuboResponse,
    status_code=200
)
def PausarProduccion(
    data: PausarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.PausarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/reanudarproduccion",
    response_model=ReanudarProduccionBobinaTuboResponse,
    status_code=200
)
def ReanudarProduccion(
    data: ReanudarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReanudarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/cancelarproduccion",
    response_model=CancelarProduccionBobinaTuboResponse,
    status_code=200
)
def CancelarProduccion(
    data: CancelarProduccionBobinaTuboRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.CancelarProduccion(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/reingresarbobinainventario",
    response_model=ReingresarBobinaAInventarioResponse,
    status_code=200
)
def ReIngresarBobinaInventario(
    data: ReingresarBobinaAInventarioRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.ReingresarBobina(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/dardebajabobina",
    response_model=DarDeBajaBobinaResponse,
    status_code=200
)
def DarDeBajaBobina(
    data: DarDeBajaBobinaRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.DarDeBajaBobina(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.post(
    "/insertarmovimientolog",
    response_model=InsertarMovimientoOperadorLogsResponse,
    status_code=201
)
def InsertarMovimientoLog(
    data: InsertarMovimientoOperadorLogsRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: ProduccionBobinaTuboService = Depends(iniciar_produccion_bobina_tubo_service)
):
    return service.InsertarMovimientoOperadorLogs(data, usuario_actual["IdUsuario"])

@PapelBobinaRouter.get(
    "/verinventariobobinapapel",
    response_model=list[VerResumenInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerInventarioBobinaPapel(
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service)
):
    return service.VerResumen()

@PapelBobinaRouter.get(
    "/verdetalleinventariobobinapapel/{IdTipoBobina}",
    response_model=list[VerDetalleInventarioBobinaPapelResponse],
    status_code=200,
    dependencies=[Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR]))]
)
def VerDetalleInventarioBobinaPapel(
    IdTipoBobina: int,
    service: InventarioBobinaPapelService = Depends(inventario_bobina_papel_service)
):
    return service.VerDetalle(VerDetalleInventarioBobinaPapelRequest(IdTipoBobina=IdTipoBobina))