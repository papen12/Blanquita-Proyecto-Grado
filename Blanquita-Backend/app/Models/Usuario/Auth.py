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


