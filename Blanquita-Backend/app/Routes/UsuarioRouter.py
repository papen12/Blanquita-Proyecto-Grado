from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.Config.supabase import get_db
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Models.Usuario.UsuarioLogIn import UsuarioLogin, UsuarioLoginResponse
from app.Services.UsuarioService import UsuarioService
from app.Auth.Dependencies import require_role
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION


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