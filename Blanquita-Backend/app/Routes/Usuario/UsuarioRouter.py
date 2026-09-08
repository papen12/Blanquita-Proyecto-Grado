from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.Auth.Dependencies import require_admin_db
from app.Config.supabase import get_db
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Services.Usuario.UsuarioService import UsuarioService


UsuarioRouter = APIRouter(prefix="/Usuario", tags=["Funciones Usuario"])


def get_usuario_service(db: Session = Depends(get_db)) -> UsuarioService:
    return UsuarioService(db)


@UsuarioRouter.post(
    "/crear",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def CrearUsuario(
    datos: UsuarioCreate,
    service: UsuarioService = Depends(get_usuario_service),
    usuario_actual: dict = Depends(require_admin_db),
):
    return service.CrearUsuario(datos)