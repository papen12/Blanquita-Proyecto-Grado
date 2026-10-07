import os

import httpx
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Models.Usuario.Usuario import (
    ListarUsuariosRequest,
    ListarUsuariosResponse,
    PerfilUpdate,
    UsuarioCreate,
    UsuarioListaItem,
    UsuarioPerfil,
)
from app.Repository.Usuario.UsuarioRepository import UsuarioRepository
from app.utils.validators import ValidarFormularioUsuario
from app.Auth.Security import ValidarClaveNueva

SUPABASE_URL = os.getenv("SUPABASE_URL").rstrip("/")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TIMEOUT_ADMIN = 15.0
DOMINIO_SINTETICO = "papelblanquita.invalid"

# (campo, etiqueta para el mensaje, obligatorio)
CAMPOS_NOMBRE = (
    ("PrimerNombre", "El primer nombre", True),
    ("SegundoNombre", "El segundo nombre", False),
    ("ApellidoPaterno", "El apellido paterno", True),
    ("ApellidoMaterno", "El apellido materno", False),
)


class UsuarioService:
    def __init__(self, db: Session):
        self.repository = UsuarioRepository(db)

    def _ValidarNombres(self, datos: PerfilUpdate | UsuarioCreate) -> None:
        for campo, etiqueta, obligatorio in CAMPOS_NOMBRE:
            valor = (getattr(datos, campo) or "").strip()

            if not valor:
                if obligatorio:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                        detail=f"{etiqueta} es obligatorio",
                    )
                continue

            if not ValidarFormularioUsuario(valor):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"{etiqueta} solo puede tener letras, sin espacios, entre 2 y 15 caracteres",
                )

    def ListarUsuarios(self, data: ListarUsuariosRequest) -> ListarUsuariosResponse:
        total, filas = self.repository.ListarUsuarios(data.model_dump())

        return ListarUsuariosResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Usuarios=[UsuarioListaItem(**fila) for fila in filas],
        )

    def ObtenerPerfil(self, usuario_actual: dict) -> UsuarioPerfil:
        fila = self.repository.ObtenerPerfil(
            {"p_IdUsuario": usuario_actual["IdUsuario"]}
        )

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró el perfil del usuario"
            )

        return UsuarioPerfil(**fila, Correo=usuario_actual.get("Correo"))

    def EditarPerfil(self, usuario_actual: dict, datos: PerfilUpdate) -> UsuarioPerfil:
        self._ValidarNombres(datos)

        fila = self.repository.EditarPerfil({
            "p_IdUsuario": usuario_actual["IdUsuario"],
            "p_PrimerNombre": datos.PrimerNombre,
            "p_ApellidoPaterno": datos.ApellidoPaterno,
            "p_SegundoNombre": datos.SegundoNombre,
            "p_ApellidoMaterno": datos.ApellidoMaterno,
            "p_Celular": datos.Celular,
        })

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No se encontró el perfil del usuario"
            )

        return UsuarioPerfil(**fila, Correo=usuario_actual.get("Correo"))

    def _CabecerasAdmin(self) -> dict:
        return {
            "apikey": SUPABASE_SECRET_KEY,
            "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
            "Content-Type": "application/json",
        }

    def _CorreoSintetico(self, ci: str) -> str:
        return f"{ci}@{DOMINIO_SINTETICO}"

    def _CrearCuentaAuth(self, ci: str, clave: str) -> str:
        try:
            respuesta = httpx.post(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers=self._CabecerasAdmin(),
                json={
                    "email": self._CorreoSintetico(ci),
                    "password": clave,
                    "email_confirm": True,
                },
                timeout=TIMEOUT_ADMIN,
            )
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Servicio de autenticación no disponible"
            )

        if respuesta.status_code in (409, 422):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una cuenta de acceso para el CI {ci}"
            )

        if respuesta.status_code >= 400:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No se pudo crear la cuenta de acceso"
            )

        cuenta = respuesta.json()
        auth_user_id = cuenta.get("id")

        if not auth_user_id:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Respuesta inválida del servicio de autenticación"
            )

        return auth_user_id

    def _EliminarCuentaAuth(self, auth_user_id: str) -> None:
        try:
            httpx.delete(
                f"{SUPABASE_URL}/auth/v1/admin/users/{auth_user_id}",
                headers=self._CabecerasAdmin(),
                timeout=TIMEOUT_ADMIN,
            )
        except httpx.RequestError:
            pass

    def CrearUsuario(self, datos: UsuarioCreate) -> dict:
        self._ValidarNombres(datos)

        error_clave = ValidarClaveNueva(
            datos.Clave,
            datos.Ci,
            [datos.PrimerNombre, datos.SegundoNombre, datos.ApellidoPaterno, datos.ApellidoMaterno],
        )
        if error_clave:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=error_clave,
            )

        auth_user_id = self._CrearCuentaAuth(datos.Ci, datos.Clave)

        params = {
            "p_AuthUserId": auth_user_id,
            "p_IdRol": datos.IdRol,
            "p_Ci": datos.Ci,
            "p_PrimerNombre": datos.PrimerNombre,
            "p_ApellidoPaterno": datos.ApellidoPaterno,
            "p_Celular": datos.Celular,
            "p_SegundoNombre": datos.SegundoNombre,
            "p_ApellidoMaterno": datos.ApellidoMaterno,
            "p_IsAdmin": datos.IsAdmin,
        }

        try:
            usuario = self.repository.CrearUsuario(params)
        except HTTPException:
            self._EliminarCuentaAuth(auth_user_id)
            raise
        except Exception:
            self._EliminarCuentaAuth(auth_user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el usuario"
            )

        if not usuario:
            self._EliminarCuentaAuth(auth_user_id)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el usuario"
            )

        return usuario