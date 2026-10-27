from datetime import timedelta
from types import SimpleNamespace

import pytest
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from app.Auth import Dependencies
from app.Auth.Dependencies import (
    get_current_user,
    get_generado_por,
    require_admin,
    require_admin_db,
    require_role,
)
from app.Auth.Jwt import verificar_token
from app.Auth.Limiter import obtener_ip_real
from app.Constants.Roles import ROL_GERENTE_GENERAL, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.Models.InventarioFinal.ProductoFinal import EstadoBloqueoProductoTerminadoResponse
from app.Routes.InventarioFinal.ProductoFinal import producto_terminado_service
from app.main import app
from tests.api.conftest import usuario

pytestmark = [pytest.mark.api, pytest.mark.usuario]

ENDPOINT_TODOS = "/productofinal/bloqueo"
ENDPOINT_LIDER = "/productofinal/ajuste/positivo"


def _credenciales(token: str) -> HTTPAuthorizationCredentials:
    return HTTPAuthorizationCredentials(scheme="Bearer", credentials=token)


def _error(funcion, *argumentos) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        funcion(*argumentos)
    return error.value


@pytest.fixture
def servicio_bloqueo(mocker):
    servicio = mocker.Mock()
    servicio.VerBloqueo.return_value = EstadoBloqueoProductoTerminadoResponse(Bloqueado=False)
    app.dependency_overrides[producto_terminado_service] = lambda: servicio
    return servicio


class TestVerificarToken:
    def test_token_valido_devuelve_el_payload(self, tokens):
        payload = verificar_token(tokens.crear(id_usuario=7, id_rol=2))

        assert payload["app_metadata"]["IdUsuario"] == 7
        assert payload["aud"] == "authenticated"

    def test_token_expirado_lanza_401_expirado(self, tokens):
        error = _error(verificar_token, tokens.crear(expira_en=timedelta(seconds=-1)))

        assert error.status_code == status.HTTP_401_UNAUTHORIZED
        assert error.detail == "Token expirado"

    @pytest.mark.parametrize(
        "cambios",
        [
            {"aud": "anon"},
            {"iss": "https://otro-proyecto.supabase.co/auth/v1"},
            {"sub": None},
            {"exp": None},
        ],
        ids=["otra-audiencia", "otro-emisor", "sin-sub", "sin-exp"],
    )
    def test_token_con_claims_invalidos_lanza_401(self, tokens, cambios):
        error = _error(verificar_token, tokens.crear(**cambios))

        assert error.status_code == status.HTTP_401_UNAUTHORIZED
        assert error.detail == "Token inválido"

    def test_token_firmado_con_otra_llave_lanza_401(self, tokens):
        error = _error(verificar_token, tokens.crear(llave=tokens.llave_ajena))

        assert error.detail == "Token inválido"

    def test_token_hs256_con_secreto_no_se_acepta(self, tokens):
        error = _error(verificar_token, tokens.crear(llave="secreto-compartido-de-32-bytes!!", algoritmo="HS256"))

        assert error.detail == "Token inválido"

    @pytest.mark.parametrize("token", ["", "basura", "a.b.c"])
    def test_texto_que_no_es_jwt_lanza_401(self, tokens, token):
        error = _error(verificar_token, token)

        assert error.status_code == status.HTTP_401_UNAUTHORIZED


class TestUsuarioActual:
    def test_extrae_los_datos_del_app_metadata(self, tokens):
        actual = get_current_user(_credenciales(tokens.crear(id_usuario=12, id_rol=2, es_admin=True)))

        assert actual["IdUsuario"] == 12
        assert actual["IdRol"] == 2
        assert actual["IsAdmin"] is True
        assert actual["Correo"] == "1234567@papelblanquita.invalid"

    def test_sin_is_admin_se_asume_que_no_es_admin(self, tokens):
        assert get_current_user(_credenciales(tokens.crear()))["IsAdmin"] is False

    @pytest.mark.parametrize(
        ("id_estado", "mensaje"),
        [
            (2, "Usuario inactivo, no puede operar el sistema"),
            (3, "Usuario suspendido, no puede operar el sistema"),
            (9, "Usuario no habilitado para operar el sistema"),
        ],
    )
    def test_usuario_no_activo_lanza_403_segun_su_estado(self, tokens, id_estado, mensaje):
        token = tokens.crear(id_usuario=None, id_rol=None, id_estado=id_estado)

        error = _error(get_current_user, _credenciales(token))

        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert error.detail == mensaje

    def test_token_sin_rol_lanza_403(self, tokens):
        error = _error(get_current_user, _credenciales(tokens.crear(id_rol=None)))

        assert error.status_code == status.HTTP_403_FORBIDDEN


class TestDependenciasDeRol:
    @pytest.mark.parametrize("id_rol", [ROL_OPERADOR, ROL_LIDER_INVENTARIO_PRODUCCION])
    def test_rol_permitido_devuelve_el_usuario(self, id_rol):
        actual = usuario(id_rol)

        assert require_role([ROL_OPERADOR, ROL_LIDER_INVENTARIO_PRODUCCION])(actual) is actual

    def test_rol_no_permitido_lanza_403(self):
        error = _error(require_role([ROL_LIDER_INVENTARIO_PRODUCCION]), usuario(ROL_GERENTE_GENERAL))

        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert error.detail == "No tienes permisos para realizar esta acción"

    def test_require_admin_usa_el_flag_del_token(self):
        assert require_admin(usuario(ROL_LIDER_INVENTARIO_PRODUCCION, es_admin=True))["IsAdmin"] is True
        assert _error(require_admin, usuario(ROL_LIDER_INVENTARIO_PRODUCCION)).status_code == 403


class TestAdminEnBaseDeDatos:
    @pytest.fixture
    def verificar_admin(self, mocker):
        repositorio = mocker.patch.object(Dependencies, "UsuarioRepository", autospec=True)
        return repositorio.return_value.VerificarAdmin

    @pytest.mark.parametrize(
        "fila",
        [
            None,
            {"EsAdminOut": False, "IdEstadoUsuarioOut": 1},
            {"EsAdminOut": True, "IdEstadoUsuarioOut": 2},
            {"EsAdminOut": True, "IdEstadoUsuarioOut": 3},
        ],
        ids=["no-existe", "no-es-admin", "inactivo", "suspendido"],
    )
    def test_sin_admin_vigente_en_bd_lanza_403_aunque_el_token_diga_admin(self, verificar_admin, mocker, fila):
        verificar_admin.return_value = fila

        error = _error(require_admin_db, usuario(ROL_LIDER_INVENTARIO_PRODUCCION, es_admin=True), mocker.Mock())

        assert error.status_code == status.HTTP_403_FORBIDDEN
        assert error.detail == "Requiere permisos de administrador"

    def test_admin_activo_en_bd_se_acepta_aunque_el_token_este_desactualizado(self, verificar_admin, mocker):
        verificar_admin.return_value = {"EsAdminOut": True, "IdEstadoUsuarioOut": 1}

        actual = require_admin_db(usuario(ROL_GERENTE_GENERAL, es_admin=False), mocker.Mock())

        assert actual["IsAdmin"] is True
        verificar_admin.assert_called_once_with({"p_IdUsuario": 7})


class TestGeneradoPor:
    @pytest.fixture
    def obtener_perfil(self, mocker):
        repositorio = mocker.patch.object(Dependencies, "UsuarioRepository", autospec=True)
        return repositorio.return_value.ObtenerPerfil

    def test_arma_nombre_ci_y_rol_para_los_pdf(self, obtener_perfil, mocker):
        obtener_perfil.return_value = {
            "PrimerNombreOut": "Carlos",
            "ApellidoPaternoOut": "Pérez",
            "CiOut": "7654321",
            "NombreRolOut": "Líder de Inventario y Producción",
        }

        texto = get_generado_por(usuario(ROL_LIDER_INVENTARIO_PRODUCCION), mocker.Mock())

        assert texto == "Carlos Pérez - CI 7654321 - Líder de Inventario y Producción"
        obtener_perfil.assert_called_once_with({"p_IdUsuario": 7})

    def test_sin_perfil_devuelve_none(self, obtener_perfil, mocker):
        obtener_perfil.return_value = None

        assert get_generado_por(usuario(ROL_OPERADOR), mocker.Mock()) is None


class TestIpParaLimiteDeIntentos:
    def _peticion(self, cabeceras=None, host="10.0.0.5"):
        return SimpleNamespace(headers=cabeceras or {}, client=SimpleNamespace(host=host) if host else None)

    def test_usa_la_primera_ip_de_x_forwarded_for(self):
        peticion = self._peticion({"x-forwarded-for": " 181.115.1.20 , 10.0.0.1"})

        assert obtener_ip_real(peticion) == "181.115.1.20"

    def test_sin_proxy_usa_la_ip_del_cliente(self):
        assert obtener_ip_real(self._peticion()) == "10.0.0.5"

    def test_sin_cliente_devuelve_desconocido(self):
        assert obtener_ip_real(self._peticion(host=None)) == "desconocido"


class TestCadenaHttp:
    def test_sin_cabecera_authorization_se_rechaza(self, cliente, servicio_bloqueo):
        respuesta = cliente.get(ENDPOINT_TODOS)

        assert respuesta.status_code == status.HTTP_401_UNAUTHORIZED
        servicio_bloqueo.VerBloqueo.assert_not_called()

    def test_token_invalido_responde_401(self, cliente, tokens, servicio_bloqueo):
        respuesta = cliente.get(ENDPOINT_TODOS, headers={"Authorization": "Bearer basura"})

        assert respuesta.status_code == status.HTTP_401_UNAUTHORIZED
        assert respuesta.json()["detail"] == "Token inválido"

    def test_token_expirado_responde_401(self, cliente, tokens, servicio_bloqueo):
        token = tokens.crear(expira_en=timedelta(minutes=-1))

        respuesta = cliente.get(ENDPOINT_TODOS, headers={"Authorization": f"Bearer {token}"})

        assert respuesta.status_code == status.HTTP_401_UNAUTHORIZED
        assert respuesta.json()["detail"] == "Token expirado"

    @pytest.mark.parametrize("id_rol", [ROL_OPERADOR, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_GERENTE_GENERAL])
    def test_token_valido_de_cualquier_rol_consulta_el_bloqueo(self, cliente, tokens, servicio_bloqueo, id_rol):
        token = tokens.crear(id_rol=id_rol)

        respuesta = cliente.get(ENDPOINT_TODOS, headers={"Authorization": f"Bearer {token}"})

        assert respuesta.status_code == status.HTTP_200_OK
        assert respuesta.json()["Bloqueado"] is False

    @pytest.mark.parametrize("id_rol", [ROL_OPERADOR, ROL_GERENTE_GENERAL])
    def test_token_valido_sin_el_rol_requerido_responde_403(self, cliente, tokens, servicio_bloqueo, id_rol):
        token = tokens.crear(id_rol=id_rol)

        respuesta = cliente.post(ENDPOINT_LIDER, json={}, headers={"Authorization": f"Bearer {token}"})

        assert respuesta.status_code == status.HTTP_403_FORBIDDEN
        servicio_bloqueo.AjustePositivoInventarioProductoTerminado.assert_not_called()

    def test_usuario_inactivo_con_token_vigente_responde_403(self, cliente, tokens, servicio_bloqueo):
        token = tokens.crear(id_usuario=None, id_rol=None, id_estado=2)

        respuesta = cliente.get(ENDPOINT_TODOS, headers={"Authorization": f"Bearer {token}"})

        assert respuesta.status_code == status.HTTP_403_FORBIDDEN
        assert respuesta.json()["detail"] == "Usuario inactivo, no puede operar el sistema"
