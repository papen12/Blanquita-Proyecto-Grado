from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UsuarioCreate(BaseModel):
    IdRol: int = Field(..., gt=0)
    Ci: str = Field(..., min_length=6, max_length=12, pattern=r"^\d+$")
    PrimerNombre: str = Field(..., min_length=1, max_length=15)
    SegundoNombre: str | None = Field(default=None, max_length=15)
    ApellidoPaterno: str = Field(..., min_length=1, max_length=15)
    ApellidoMaterno: str | None = Field(default=None, max_length=15)
    Celular: str = Field(..., pattern=r"^[67]\d{7}$")
    Clave: str = Field(..., min_length=8, max_length=64)
    IsAdmin: bool = False


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    IdUsuario: int = Field(..., validation_alias="IdUsuarioOut")
    AuthUserId: UUID = Field(..., validation_alias="AuthUserIdOut")
    Ci: str = Field(..., validation_alias="CiOut")
    IdRol: int = Field(..., validation_alias="IdRolOut")
    NombreRol: str = Field(..., validation_alias="NombreRolOut")
    IdEstadoUsuario: int = Field(..., validation_alias="IdEstadoUsuarioOut")
    NombreCompleto: str = Field(..., validation_alias="NombreCompletoOut")
    Celular: str = Field(..., validation_alias="CelularOut")
    IsAdmin: bool = Field(..., validation_alias="IsAdminOut")
    FechaRegistro: datetime = Field(..., validation_alias="FechaRegistroOut")