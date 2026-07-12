from pydantic import BaseModel, Field, field_validator
from datetime import datetime


class UsuarioCreate(BaseModel):
    IdRol: int = Field(..., gt=0)
    IdEstadoUsuario: int = Field(..., gt=0)
    Ci: str = Field(..., min_length=8, max_length=10)
    PrimerNombre: str = Field(..., min_length=1, max_length=15)
    SegundoNombre: str = Field(default="")
    ApellidoPaterno: str = Field(..., min_length=1, max_length=15)
    ApellidoMaterno: str = Field(default="")
    Clave: str = Field(..., min_length=6)

    @field_validator("Ci")
    @classmethod
    def limpiar_ci(cls, v: str) -> str:
        return v.strip()


class UsuarioResponse(BaseModel):
    IdUsuario: int
    IdRol: int
    NombreRol: str
    IdEstadoUsuario: int
    NombreEstadoUsuario: str
    Ci: str
    PrimerNombre: str
    SegundoNombre: str
    ApellidoPaterno: str
    ApellidoMaterno: str
    FechaRegistro: datetime

    class Config:
        from_attributes = True