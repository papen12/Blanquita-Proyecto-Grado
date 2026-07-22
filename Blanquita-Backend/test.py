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



















#Models/Pallet/IngresoPallet.py
from datetime import date

from pydantic import BaseModel


class PalletItem(BaseModel):
    CodigoPallet: str


class IngresoPalletRequest(BaseModel):
    IdProveedor: int
    IdTipoPallet: int
    Pallets: list[PalletItem]


class IngresoPalletResponse(BaseModel):
    FechaRecepcion: date
    CantidadPallets: int

#Models/Pallet/InventarioPallet.py

from datetime import date
from pydantic import BaseModel
from datetime import datetime

class ResumenInventarioPalletResponse(BaseModel):
    IdTipoPallet: int
    NumeroRodelas: int | None
    Descripcion: str | None
    CantidadPallets: int


class DetalleInventarioPalletRequest(BaseModel):
    IdTipoPallet: int


class DetalleInventarioPalletResponse(BaseModel):
    IdPallet: int
    CodigoPallet: str
    CodigoLote: str
    FechaRecepcion: date
    NombreProveedor: str


class ReingresarPalletInventarioRequest(BaseModel):
    IdPallet: int
    Observacion: str | None = None


class ReingresarPalletInventarioResponse(BaseModel):
    IdPallet: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime


class DarDeBajaPalletRequest(BaseModel):
    IdPallet: int
    Observacion: str | None = None


class DarDeBajaPalletResponse(BaseModel):
    IdPallet: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime



#Models/Pallet/ProduccionPallet.py

from datetime import datetime
from pydantic import BaseModel


class IniciarProduccionPalletRequest(BaseModel):
    IdPallet: int


class IniciarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str



class PausaProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int
    MotivoPausaProduccion: str | None = None


class PausaProduccionPalletResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: str | None
    FechaHoraReanudacion: datetime | None
    IdEstadoProduccion: int



class ReanudarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int


class ReanudarProduccionPalletResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: str | None
    FechaHoraReanudacion: datetime
    IdEstadoProduccion: int



class FinalizarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int


class FinalizarProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str


class CancelarProduccionPalletRequest(BaseModel):
    IdProduccionPalletTubo: int
    MotivoCancelacion: str | None = None


class CancelarProduccionPalletResponse(BaseModel):
    IdCancelacionProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: str | None
    IdEstadoProduccion: int


class VerProduccionPalletRequest(BaseModel):
    IdTipoPallet: int | None = None


class VerProduccionPalletResponse(BaseModel):
    IdProduccionPalletTubo: int
    NombreEstadoProduccion: str
    CodigoPallet: str
    IdTipoPallet: int
    NombreTurno: str
    FechaInicioProduccion: datetime

class VerPausasProduccionPalletActivasRequest(BaseModel):
    IdTipoPallet: int | None = None


class VerPausasProduccionPalletActivasResponse(BaseModel):
    IdPausaProduccionPalletTubo: int
    IdProduccionPalletTubo: int
    CodigoPallet: str
    IdTipoPallet: int
    FechaHoraPausa: datetime
    NombreEstadoProduccion: str




#Repository/Pallet/InventarioPallet.py

from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class InventarioPalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def VerResumenInventarioPallet(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioPallet"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioPallet(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioPallet"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReingresarPalletInventario(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "ReingresarPalletAInventario"(
            :p_IdPallet,
            :p_IdUsuario,
            :p_Observacion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)

    def DarDeBajaPallet(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "DarDeBajaPallet"(
                :p_IdPallet,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
    

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
    

    

    def PausaProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "PausaProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario,
            :p_MotivoPausaProduccion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
    def ReanudarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "ReanudarProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)

    def FinalizarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "FinalizarProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
    def CancelarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "CancelarProduccionPalletTubo"(
            :p_id_produccion,
            :p_id_usuario,
            :p_motivo_cancelacion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
    
    

    
    

    def VerProduccionPallet(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionPalletTubo"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    def VerPausasProduccionPalletActivas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerPausasProduccionPalletTuboActivas"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    


#Repository/Pallet/PalletRepository.py

from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class PalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarPallets(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarPallets"(
                :p_IdProveedor,
                :p_IdTipoPallet,
                :p_IdUsuario,
                :p_Pallets
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
    
    

#Routes/Pallet/InventarioPallet.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.InventarioPalletService import InventarioPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Pallet.InventarioPallet import (
    ResumenInventarioPalletResponse,
    DetalleInventarioPalletRequest,
    DetalleInventarioPalletResponse,
    ReingresarPalletInventarioRequest,
    ReingresarPalletInventarioResponse,
    DarDeBajaPalletRequest,
    DarDeBajaPalletResponse,
    PalletFueraInventarioResponse
)


def inventario_pallet_service(db: Session = Depends(get_db)) -> InventarioPalletService:
    return InventarioPalletService(db)

InventarioPalletRouter = APIRouter(
    prefix="/pallet/inventario", tags=["Pallet - Inventario"]
)

@InventarioPalletRouter.get(
    "/resumen",
    response_model=list[ResumenInventarioPalletResponse],
    status_code=200
)
def VerResumenInventarioPallet(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.VerResumenInventarioPallet()

@InventarioPalletRouter.get(
    "/detalle",
    response_model=list[DetalleInventarioPalletResponse],
    status_code=200
)
def VerDetalleInventarioPallet(
    data: DetalleInventarioPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.VerDetalleInventarioPallet(data)

@InventarioPalletRouter.post(
    "/reingresar",
    response_model=ReingresarPalletInventarioResponse,
    status_code=200
)
def ReingresarInventarioPallet(
    data: ReingresarPalletInventarioRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService= Depends(inventario_pallet_service)
): return service.ReingresarPalletInventario(data,usuario_actual["IdUsuario"])

@InventarioPalletRouter.post(
    "/dardebaja",
    response_model=DarDeBajaPalletResponse,
    status_code=200
)
def DarDeBajaPallet(
    data: DarDeBajaPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service:InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.DarDeBajaPallet(data, usuario_actual["IdUsuario"])

@InventarioPalletRouter.get(
    "/fuera",
    response_model=list[PalletFueraInventarioResponse],
    status_code=200
)
def VerPalletFueraInventario(
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: InventarioPalletService = Depends(inventario_pallet_service)
):
    return service.VerPalletsFueraInventario()


#Routes/Pallet/PalletRouter.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db

from app.Services.Pallet.PalletService import PalletService
from app.Services.Pallet.ProduccionPalletService import ProduccionPalletService

from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR

from app.Models.Pallet.IngresoPallet import IngresoPalletRequest, IngresoPalletResponse


PalletRouter = APIRouter(prefix="/pallet", tags=["Pallet CRUD y Ingreso"])


def pallet_service(db: Session = Depends(get_db)) -> PalletService:
    return PalletService(db)


def produccion_pallet_service(db: Session = Depends(get_db)) -> ProduccionPalletService:
    return ProduccionPalletService(db)


@PalletRouter.post(
    "/cargarlotepallet",
    response_model=IngresoPalletResponse,
    status_code=201
)
def CargarLotePallet(
    data: IngresoPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
    service: PalletService = Depends(pallet_service)
):
    return service.InsertarPallets(data, usuario_actual["IdUsuario"])






#Routes/Pallet/ProduccionRouter.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db


from app.Services.Pallet.ProduccionPalletService import ProduccionPalletService


from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR


from app.Models.Pallet.ProduccionPallet import (
    IniciarProduccionPalletRequest,
    IniciarProduccionPalletResponse,
    PausaProduccionPalletRequest,
    PausaProduccionPalletResponse,
    ReanudarProduccionPalletRequest,
    ReanudarProduccionPalletResponse,
    FinalizarProduccionPalletRequest,
    FinalizarProduccionPalletResponse,
    CancelarProduccionPalletRequest,
    CancelarProduccionPalletResponse,
    VerProduccionPalletRequest,VerProduccionPalletResponse,
    VerPausasProduccionPalletActivasRequest,
    VerPausasProduccionPalletActivasResponse
)



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
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.IniciarProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/pausar",
    response_model=PausaProduccionPalletResponse,
    status_code=200
)
def PausarProduccionPallet(
    data: PausaProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.PausaProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/reanudar",
    response_model=ReanudarProduccionPalletResponse,
    status_code=200
)
def ReanudarProduccionPallet(
    data:ReanudarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
): return service.ReanudarProduccionPallet(data, usuario_actual["IdUsuario"])


@ProduccionPalletRouter.post(
    "/finalizar",
    response_model=FinalizarProduccionPalletResponse,
    status_code=200
)
def FinalizarProduccionPallet(
    data: FinalizarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.FinalizarProduccionPallet(data, usuario_actual["IdUsuario"])

@ProduccionPalletRouter.post(
    "/cancelar",
    response_model=CancelarProduccionPalletResponse,
    status_code=200
)
def CancelarProduccionPallet(
    data: CancelarProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.CancelarProduccionPallet(data, usuario_actual["IdUsuario"])




@ProduccionPalletRouter.post(
    "/activas",
    response_model=list[VerProduccionPalletResponse],
    status_code=200
)
def VerProduccionPallet(
    data: VerProduccionPalletRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.VerProduccionPallet(data)

@ProduccionPalletRouter.post(
    "/pausadas",
    response_model=list[VerPausasProduccionPalletActivasResponse],
    status_code=200
)
def VerPausasProduccionPalletActivas(
    data: VerPausasProduccionPalletActivasRequest,
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR])),
    service: ProduccionPalletService = Depends(produccion_pallet_service)
):
    return service.VerPausasProduccionPalletActivas(data)


