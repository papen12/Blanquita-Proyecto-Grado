from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.Auth.Dependencies import require_role
from app.Config.supabase import get_db
from app.Models.Usuario.Usuario import UsuarioCreate, UsuarioResponse
from app.Services.Usuario.UsuarioService import UsuarioService
from app.Constants.Roles import ROL_OPERADOR,ROL_LIDER_INVENTARIO_PRODUCCION


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
    usuario_actual: dict = Depends(require_role([ROL_LIDER_INVENTARIO_PRODUCCION,ROL_OPERADOR])),
):
    return service.CrearUsuario(datos)