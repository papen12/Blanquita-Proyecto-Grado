import os
from uuid import UUID

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
    UsuarioResponse,
)
from app.Schemas.Usuario import Usuario
from app.Repository.Usuario.UsuarioRepository import UsuarioRepository
from app.utils.validators import ValidarFormularioUsuario
from app.Auth.Security import ValidarClaveNueva

SUPABASE_URL = os.getenv("SUPABASE_URL").rstrip("/")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

TIMEOUT_ADMIN = 15.0
DOMINIO_SINTETICO = "papelblanquita.invalid"
ESTADO_USUARIO_ACTIVO = 1


def _texto_opcional(valor: str | None) -> str | None:
    texto = (valor or "").strip()
    return texto or None

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

    def CrearUsuario(self, datos: UsuarioCreate, id_admin: int) -> UsuarioResponse:
        self._ValidarNombres(datos)

        ci = datos.Ci.strip()
        nombres = [
            _texto_opcional(datos.PrimerNombre),
            _texto_opcional(datos.SegundoNombre),
            _texto_opcional(datos.ApellidoPaterno),
            _texto_opcional(datos.ApellidoMaterno),
        ]

        error_clave = ValidarClaveNueva(datos.Clave, ci, nombres)
        if error_clave:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=error_clave,
            )

        rol = self.repository.ObtenerRol(datos.IdRol)
        if rol is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El rol indicado no existe",
            )

        if self.repository.ExisteCi(ci):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un usuario registrado con el CI {ci}",
            )

        auth_user_id = self._CrearCuentaAuth(ci, datos.Clave)

        usuario = Usuario(
            AuthUserId=UUID(auth_user_id),
            IdRol=datos.IdRol,
            IdEstadoUsuario=ESTADO_USUARIO_ACTIVO,
            Ci=ci,
            PrimerNombre=nombres[0],
            SegundoNombre=nombres[1],
            ApellidoPaterno=nombres[2],
            ApellidoMaterno=nombres[3],
            Celular=datos.Celular.strip(),
            IsAdmin=datos.IsAdmin,
        )
        nombre_completo = " ".join(n for n in nombres if n)
        observacion = (
            f"Crear usuario · CI {ci} ({nombre_completo}), rol {rol['NombreRol']}"
            + (", administrador" if datos.IsAdmin else "")
        )

        try:
            usuario = self.repository.CrearUsuario(usuario, observacion, id_admin)
        except Exception:
            self._EliminarCuentaAuth(auth_user_id)
            raise

        return UsuarioResponse(
            IdUsuario=usuario.IdUsuario,
            AuthUserId=usuario.AuthUserId,
            Ci=usuario.Ci,
            IdRol=usuario.IdRol,
            NombreRol=rol["NombreRol"],
            IdEstadoUsuario=usuario.IdEstadoUsuario,
            NombreCompleto=nombre_completo,
            Celular=usuario.Celular,
            IsAdmin=usuario.IsAdmin,
            FechaRegistro=usuario.FechaRegistro,
        )