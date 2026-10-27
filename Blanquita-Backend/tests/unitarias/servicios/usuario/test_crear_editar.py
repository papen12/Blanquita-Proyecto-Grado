from uuid import UUID

import httpx
import pytest
from fastapi import HTTPException, status
from pydantic import ValidationError

from app.Constants.Estados import ESTADO_USUARIO_ACTIVO, ESTADO_USUARIO_INACTIVO, ESTADO_USUARIO_SUSPENDIDO
from app.Constants.Roles import ROL_GERENTE_GENERAL, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.Models.Usuario.Usuario import EditarUsuarioRequest, UsuarioCreate
from app.Schemas.Usuario import Usuario
from tests.dobles.usuarios import AUTH_USER_ID, ID_ADMIN, crear_usuario, respuesta_auth

pytestmark = [pytest.mark.servicio, pytest.mark.usuario]

CLAVE = "Lajas#2026"


def _nuevo(**cambios):
    datos = {
        "IdRol": ROL_OPERADOR,
        "Ci": "7654321",
        "PrimerNombre": "Juan",
        "ApellidoPaterno": "Mamani",
        "ApellidoMaterno": "Quispe",
        "Celular": "71234567",
        "Clave": CLAVE,
        "IsAdmin": False,
        **cambios,
    }
    return UsuarioCreate(**datos)


def _error(funcion, *argumentos) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        funcion(*argumentos)
    return error.value


class TestModeloCrear:
    @pytest.mark.parametrize(
        "cambios",
        [{"Ci": "12345"}, {"Ci": "12A4567"}, {"Celular": "51234567"}, {"Celular": "7123456"}, {"Clave": "Ab1!"}, {"IdRol": 0}],
        ids=["ci-corto", "ci-con-letras", "celular-sin-6-o-7", "celular-corto", "clave-corta", "rol-cero"],
    )
    def test_el_modelo_rechaza_datos_mal_formados(self, cambios):
        with pytest.raises(ValidationError):
            _nuevo(**cambios)


class TestCrear:
    @pytest.mark.parametrize(
        ("cambios", "detalle"),
        [
            ({"PrimerNombre": "   "}, "El primer nombre es obligatorio"),
            ({"PrimerNombre": "Juan Carlos"}, "El primer nombre solo puede tener letras, sin espacios, entre 2 y 15 caracteres"),
            ({"ApellidoPaterno": "M"}, "El apellido paterno solo puede tener letras, sin espacios, entre 2 y 15 caracteres"),
            ({"ApellidoMaterno": "Qu1spe"}, "El apellido materno solo puede tener letras, sin espacios, entre 2 y 15 caracteres"),
        ],
    )
    def test_nombres_invalidos_lanzan_422_sin_tocar_auth(self, servicio, repo, auth, cambios, detalle):
        error = _error(servicio.CrearUsuario, _nuevo(**cambios), ID_ADMIN)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == detalle
        auth.post.assert_not_called()

    def test_nombres_opcionales_vacios_se_aceptan(self, servicio, repo):
        respuesta = servicio.CrearUsuario(_nuevo(ApellidoMaterno="  ", SegundoNombre=""), ID_ADMIN)

        usuario = repo.CrearUsuario.call_args.args[0]
        assert usuario.SegundoNombre is None
        assert usuario.ApellidoMaterno is None
        assert respuesta.NombreCompleto == "Juan Mamani"

    @pytest.mark.parametrize(
        ("clave", "detalle"),
        [
            ("Lajas2026", "La clave debe incluir al menos un símbolo"),
            ("Ab#7654321", "La clave no puede contener el CI ni los nombres del usuario"),
            ("Mamani#2026", "La clave no puede contener el CI ni los nombres del usuario"),
        ],
    )
    def test_clave_invalida_lanza_422_antes_de_consultar(self, servicio, repo, auth, clave, detalle):
        error = _error(servicio.CrearUsuario, _nuevo(Clave=clave), ID_ADMIN)

        assert error.detail == detalle
        repo.ObtenerRol.assert_not_called()
        auth.post.assert_not_called()

    def test_rol_inexistente_lanza_422(self, servicio, auth):
        error = _error(servicio.CrearUsuario, _nuevo(IdRol=9), ID_ADMIN)

        assert error.detail == "El rol indicado no existe"
        auth.post.assert_not_called()

    def test_operador_no_puede_crearse_como_admin(self, servicio, auth):
        error = _error(servicio.CrearUsuario, _nuevo(IsAdmin=True), ID_ADMIN)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail.startswith("Solo un Líder de Inventario y Producción o Gerente General")
        auth.post.assert_not_called()

    def test_ci_repetido_lanza_409_sin_crear_cuenta(self, servicio, repo, auth):
        repo.ExisteCi.return_value = True

        error = _error(servicio.CrearUsuario, _nuevo(), ID_ADMIN)

        assert error.status_code == status.HTTP_409_CONFLICT
        assert error.detail == "Ya existe un usuario registrado con el CI 7654321"
        repo.ExisteCi.assert_called_once_with("7654321")
        auth.post.assert_not_called()

    @pytest.mark.parametrize(
        ("respuesta", "codigo", "detalle"),
        [
            (respuesta_auth(422), status.HTTP_409_CONFLICT, "Ya existe una cuenta de acceso para el CI 7654321"),
            (respuesta_auth(409), status.HTTP_409_CONFLICT, "Ya existe una cuenta de acceso para el CI 7654321"),
            (respuesta_auth(500), status.HTTP_503_SERVICE_UNAVAILABLE, "No se pudo crear la cuenta de acceso"),
            (respuesta_auth(200, {}), status.HTTP_502_BAD_GATEWAY, "Respuesta inválida del servicio de autenticación"),
        ],
        ids=["auth-422", "auth-409", "auth-500", "auth-sin-id"],
    )
    def test_errores_de_supabase_auth_se_traducen(self, servicio, repo, auth, respuesta, codigo, detalle):
        auth.post.return_value = respuesta

        error = _error(servicio.CrearUsuario, _nuevo(), ID_ADMIN)

        assert (error.status_code, error.detail) == (codigo, detalle)
        repo.CrearUsuario.assert_not_called()

    def test_supabase_caido_responde_503(self, servicio, repo, auth):
        auth.post.side_effect = httpx.ConnectError("sin red")

        error = _error(servicio.CrearUsuario, _nuevo(), ID_ADMIN)

        assert error.status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        assert error.detail == "Servicio de autenticación no disponible"

    def test_crear_registra_la_cuenta_auth_con_correo_sintetico(self, servicio, auth):
        servicio.CrearUsuario(_nuevo(), ID_ADMIN)

        url = auth.post.call_args.args[0]
        cuerpo = auth.post.call_args.kwargs["json"]
        cabeceras = auth.post.call_args.kwargs["headers"]
        assert url == "https://supabase-de-prueba.invalid/auth/v1/admin/users"
        assert cuerpo == {"email": "7654321@papelblanquita.invalid", "password": CLAVE, "email_confirm": True}
        assert cabeceras["Authorization"] == "Bearer clave-servicio-de-prueba"

    @pytest.mark.parametrize(("id_rol", "es_admin"), [(ROL_OPERADOR, False), (ROL_LIDER_INVENTARIO_PRODUCCION, True), (ROL_GERENTE_GENERAL, True)])
    def test_crear_guarda_el_usuario_activo_y_el_historial(self, servicio, repo, id_rol, es_admin):
        respuesta = servicio.CrearUsuario(
            _nuevo(IdRol=id_rol, IsAdmin=es_admin, PrimerNombre=" Juan ", Celular="71234567"), ID_ADMIN
        )

        usuario, observacion, id_admin = repo.CrearUsuario.call_args.args
        assert isinstance(usuario, Usuario)
        assert usuario.AuthUserId == UUID(AUTH_USER_ID)
        assert usuario.IdEstadoUsuario == ESTADO_USUARIO_ACTIVO
        assert usuario.PrimerNombre == "Juan"
        assert usuario.IsAdmin is es_admin
        assert id_admin == ID_ADMIN
        assert observacion.startswith("Crear usuario · CI 7654321 (Juan Mamani Quispe), rol ")
        assert observacion.endswith(", administrador") is es_admin
        assert respuesta.IdUsuario == 40
        assert respuesta.IdRol == id_rol

    def test_si_falla_la_bd_se_elimina_la_cuenta_auth_creada(self, servicio, repo, auth):
        repo.CrearUsuario.side_effect = HTTPException(status_code=409, detail="La cuenta de acceso ya está vinculada a otro usuario")

        error = _error(servicio.CrearUsuario, _nuevo(), ID_ADMIN)

        assert error.status_code == 409
        auth.delete.assert_called_once()
        assert auth.delete.call_args.args[0].endswith(f"/auth/v1/admin/users/{AUTH_USER_ID}")

    def test_si_falla_la_bd_y_tambien_el_borrado_se_conserva_el_error_original(self, servicio, repo, auth):
        repo.CrearUsuario.side_effect = HTTPException(status_code=500, detail="No se pudo registrar el usuario")
        auth.delete.side_effect = httpx.ConnectError("sin red")

        error = _error(servicio.CrearUsuario, _nuevo(), ID_ADMIN)

        assert error.detail == "No se pudo registrar el usuario"


class TestEditar:
    def _editar(self, servicio, **cambios):
        datos = {
            "IdUsuario": 7,
            "PrimerNombre": "Juan",
            "ApellidoPaterno": "Mamani",
            "ApellidoMaterno": "Quispe",
            "Celular": "71234567",
            **cambios,
        }
        return servicio.EditarUsuario(EditarUsuarioRequest(**datos), ID_ADMIN)

    def test_nombre_invalido_lanza_422_sin_consultar(self, servicio, repo):
        with pytest.raises(HTTPException) as error:
            self._editar(servicio, PrimerNombre="J")

        assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo.ObtenerUsuarioBloqueado.assert_not_called()

    def test_usuario_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = None

        with pytest.raises(HTTPException) as error:
            self._editar(servicio)

        assert error.value.status_code == status.HTTP_404_NOT_FOUND

    def test_usuario_suspendido_no_se_edita(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=ESTADO_USUARIO_SUSPENDIDO)

        with pytest.raises(HTTPException) as error:
            self._editar(servicio, Celular="79999999")

        assert error.value.status_code == status.HTTP_409_CONFLICT
        repo.Revertir.assert_called_once()
        repo.EditarUsuario.assert_not_called()

    def test_sin_cambios_lanza_409(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario()

        with pytest.raises(HTTPException) as error:
            self._editar(servicio, PrimerNombre=" Juan ")

        assert error.value.detail == "No hay cambios para guardar"
        repo.Revertir.assert_called_once()

    def test_editar_inactivo_si_se_permite_y_solo_lista_los_campos_cambiados(self, servicio, repo):
        usuario = crear_usuario(id_estado=ESTADO_USUARIO_INACTIVO)
        repo.ObtenerUsuarioBloqueado.return_value = usuario

        self._editar(servicio, SegundoNombre="Carlos", Celular=None)

        _, nuevos, observacion, id_admin = repo.EditarUsuario.call_args.args
        assert nuevos["SegundoNombre"] == "Carlos"
        assert nuevos["Celular"] is None
        assert observacion == "Editar usuario · CI 7654321 (Juan Mamani Quispe): SegundoNombre, Celular"
        assert id_admin == ID_ADMIN
