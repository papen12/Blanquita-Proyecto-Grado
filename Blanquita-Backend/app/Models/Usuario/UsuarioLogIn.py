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