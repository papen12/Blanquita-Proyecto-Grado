from datetime import datetime

import httpx
import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import ESTADO_USUARIO_ACTIVO as ACTIVO
from app.Constants.Estados import ESTADO_USUARIO_INACTIVO as INACTIVO
from app.Constants.Estados import ESTADO_USUARIO_SUSPENDIDO as SUSPENDIDO
from app.Constants.Roles import ROL_GERENTE_GENERAL as GERENTE
from app.Constants.Roles import ROL_LIDER_INVENTARIO_PRODUCCION as LIDER
from app.Constants.Roles import ROL_OPERADOR as OPERADOR
from app.Models.Usuario.Usuario import (
    CambiarAdminUsuarioRequest,
    CambiarEstadoUsuarioRequest,
    CambiarRolUsuarioRequest,
    ListarUsuariosRequest,
    RestablecerClaveRequest,
)
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.usuarios import AUTH_USER_ID, FECHA_REGISTRO, ID_ADMIN, crear_usuario, respuesta_auth

pytestmark = [pytest.mark.servicio, pytest.mark.usuario]

MOTIVO = "Reasignado al area de rebobinado"


def _error(funcion, *argumentos) -> HTTPException:
    with pytest.raises(HTTPException) as error:
        funcion(*argumentos)
    return error.value


class TestCambiarRol:
    def _cambiar(self, servicio, id_rol=LIDER, id_usuario=7, motivo=MOTIVO):
        return servicio.CambiarRolUsuario(
            CambiarRolUsuarioRequest(IdUsuario=id_usuario, IdRol=id_rol, Motivo=motivo), ID_ADMIN
        )

    def test_motivo_invalido_lanza_422(self, servicio, repo):
        error = _error(self._cambiar, servicio, LIDER, 7, "no")

        assert error.detail.startswith("El motivo es obligatorio")
        repo.ObtenerUsuarioBloqueado.assert_not_called()

    def test_no_puede_cambiar_su_propio_rol(self, servicio, repo):
        error = _error(self._cambiar, servicio, LIDER, ID_ADMIN)

        assert error.detail == "No puede cambiar el rol de su propio usuario"

    def test_nunca_se_asigna_gerente_general(self, servicio, repo):
        error = _error(self._cambiar, servicio, GERENTE)

        assert error.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        assert error.detail == "No se puede asignar el rol Gerente General desde un cambio de rol"
        repo.ObtenerUsuarioBloqueado.assert_not_called()

    def test_rol_inexistente_lanza_422(self, servicio):
        assert _error(self._cambiar, servicio, 9).detail == "El rol indicado no existe"

    def test_usuario_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = None

        assert _error(self._cambiar, servicio).status_code == status.HTTP_404_NOT_FOUND

    def test_usuario_suspendido_no_cambia_de_rol(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=SUSPENDIDO)

        error = _error(self._cambiar, servicio)

        assert error.detail == "El usuario está Suspendido de forma definitiva, no se puede cambiar su rol"
        repo.Revertir.assert_called_once()

    def test_el_rol_de_un_gerente_no_se_cambia(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=GERENTE, es_admin=True)

        error = _error(self._cambiar, servicio, OPERADOR)

        assert error.detail == "El rol de un Gerente General no se puede cambiar"
        repo.EditarUsuario.assert_not_called()

    def test_mismo_rol_lanza_409(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=LIDER)

        assert _error(self._cambiar, servicio, LIDER).detail == "El usuario ya tiene el rol Líder de Inventario y Producción"

    def test_admin_no_puede_bajar_a_operador_sin_retirar_el_acceso(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=LIDER, es_admin=True)

        error = _error(self._cambiar, servicio, OPERADOR)

        assert error.detail.startswith("Retire primero el acceso de administrador")
        repo.Revertir.assert_called_once()

    def test_cambio_valido_guarda_el_rol_y_el_historial(self, servicio, repo):
        usuario = crear_usuario(id_rol=OPERADOR)
        repo.ObtenerUsuarioBloqueado.return_value = usuario

        respuesta = self._cambiar(servicio, LIDER)

        repo.EditarUsuario.assert_called_once_with(
            usuario,
            {"IdRol": LIDER},
            "Cambio de rol · Usuario CI 7654321 (Juan Mamani Quispe): Operador → Líder de Inventario y Producción. "
            f"Motivo: {MOTIVO}",
            ID_ADMIN,
        )
        assert respuesta.NombreRolAnterior == "Operador"
        assert respuesta.NombreRol == "Líder de Inventario y Producción"


class TestCambiarAdmin:
    def _cambiar(self, servicio, es_admin=True, id_usuario=7):
        return servicio.CambiarAdminUsuario(
            CambiarAdminUsuarioRequest(IdUsuario=id_usuario, IsAdmin=es_admin, Motivo=MOTIVO), ID_ADMIN
        )

    def test_no_puede_cambiar_su_propio_acceso(self, servicio):
        assert _error(self._cambiar, servicio, False, ID_ADMIN).detail == "No puede cambiar su propio acceso de administrador"

    def test_suspendido_no_cambia_su_acceso(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=LIDER, id_estado=SUSPENDIDO)

        assert _error(self._cambiar, servicio).status_code == status.HTTP_409_CONFLICT

    @pytest.mark.parametrize(
        ("es_admin", "detalle"),
        [(True, "El usuario ya tiene acceso de administrador"), (False, "El usuario no tiene acceso de administrador")],
    )
    def test_sin_cambio_real_lanza_409(self, servicio, repo, es_admin, detalle):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=LIDER, es_admin=es_admin)

        assert _error(self._cambiar, servicio, es_admin).detail == detalle
        repo.Revertir.assert_called_once()

    def test_operador_no_puede_ser_admin(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_rol=OPERADOR)

        error = _error(self._cambiar, servicio, True)

        assert error.detail.startswith("Solo un Líder de Inventario y Producción o Gerente General")
        repo.EditarUsuario.assert_not_called()

    @pytest.mark.parametrize(("id_rol", "es_admin", "palabra"), [(LIDER, True, "otorgado"), (GERENTE, True, "otorgado"), (LIDER, False, "retirado")])
    def test_otorgar_o_retirar_registra_el_historial(self, servicio, repo, id_rol, es_admin, palabra):
        usuario = crear_usuario(id_rol=id_rol, es_admin=not es_admin)
        repo.ObtenerUsuarioBloqueado.return_value = usuario

        respuesta = self._cambiar(servicio, es_admin)

        _, cambios, observacion, _ = repo.EditarUsuario.call_args.args
        assert cambios == {"IsAdmin": es_admin}
        assert f": {palabra}. Motivo: {MOTIVO}" in observacion
        assert respuesta.IsAdmin is es_admin


class TestCambiarEstado:
    def _cambiar(self, servicio, id_estado, id_usuario=7, motivo=MOTIVO):
        return servicio.CambiarEstadoUsuario(
            CambiarEstadoUsuarioRequest(IdUsuario=id_usuario, IdEstadoUsuario=id_estado, Motivo=motivo), ID_ADMIN
        )

    def test_activar_en_modo_consulta_responde_423_antes_de_todo(self, servicio, repo):
        with time_machine.travel(datetime(2026, 10, 27, 3, 0, tzinfo=ZONA_BOLIVIA), tick=False):
            error = _error(self._cambiar, servicio, ACTIVO, 7, "")

        assert error.status_code == 423
        assert error.detail == "En modo consulta solo se puede inactivar o suspender usuarios"
        repo.ObtenerUsuarioBloqueado.assert_not_called()

    @pytest.mark.parametrize("id_estado", [INACTIVO, SUSPENDIDO])
    def test_inactivar_o_suspender_en_modo_consulta_si_se_permite(self, servicio, repo, id_estado):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=ACTIVO)

        with time_machine.travel(datetime(2026, 10, 27, 3, 0, tzinfo=ZONA_BOLIVIA), tick=False):
            respuesta = self._cambiar(servicio, id_estado)

        assert respuesta.IdEstadoUsuario == id_estado

    def test_no_puede_cambiar_su_propio_estado(self, servicio):
        assert _error(self._cambiar, servicio, INACTIVO, ID_ADMIN).detail == "No puede cambiar el estado de su propio usuario"

    def test_estado_inexistente_lanza_422(self, servicio, repo):
        assert _error(self._cambiar, servicio, 9).detail == "El estado indicado no existe"
        repo.ObtenerUsuarioBloqueado.assert_not_called()

    def test_usuario_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = None

        assert _error(self._cambiar, servicio, INACTIVO).status_code == status.HTTP_404_NOT_FOUND

    def test_mismo_estado_lanza_409(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=INACTIVO)

        assert _error(self._cambiar, servicio, INACTIVO).detail == "El usuario ya se encuentra Inactivo"

    @pytest.mark.parametrize("id_estado", [ACTIVO, INACTIVO])
    def test_suspendido_es_definitivo(self, servicio, repo, id_estado):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=SUSPENDIDO)

        error = _error(self._cambiar, servicio, id_estado)

        assert error.detail == "El usuario está Suspendido de forma definitiva, su estado no puede cambiarse"
        repo.CambiarEstado.assert_not_called()

    @pytest.mark.parametrize(
        ("anterior", "nuevo"),
        [(ACTIVO, INACTIVO), (ACTIVO, SUSPENDIDO), (INACTIVO, ACTIVO), (INACTIVO, SUSPENDIDO)],
        ids=["activo-inactivo", "activo-suspendido", "inactivo-activo", "inactivo-suspendido"],
    )
    def test_transiciones_permitidas(self, servicio, repo, anterior, nuevo):
        usuario = crear_usuario(id_estado=anterior)
        repo.ObtenerUsuarioBloqueado.return_value = usuario

        respuesta = self._cambiar(servicio, nuevo)

        _, id_estado, observacion, id_admin = repo.CambiarEstado.call_args.args
        assert id_estado == nuevo
        assert observacion.endswith(f"Motivo: {MOTIVO}")
        assert id_admin == ID_ADMIN
        assert (respuesta.IdEstadoAnterior, respuesta.IdEstadoUsuario) == (anterior, nuevo)


class TestRestablecerClave:
    def _restablecer(self, servicio, clave="Lajas#2026"):
        return servicio.RestablecerClave(RestablecerClaveRequest(IdUsuario=7, ClaveNueva=clave), ID_ADMIN)

    def test_usuario_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerUsuarioBloqueado.return_value = None

        assert _error(self._restablecer, servicio).status_code == status.HTTP_404_NOT_FOUND

    def test_suspendido_no_restablece_clave(self, servicio, repo, auth):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario(id_estado=SUSPENDIDO)

        assert _error(self._restablecer, servicio).status_code == status.HTTP_409_CONFLICT
        auth.put.assert_not_called()

    @pytest.mark.parametrize("clave", ["Ab#7654321", "Juan#20261", "Password1#"])
    def test_clave_con_datos_personales_o_comun_lanza_422(self, servicio, repo, auth, clave):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario()

        assert _error(self._restablecer, servicio, clave).status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
        repo.Revertir.assert_called_once()
        auth.put.assert_not_called()

    def test_restablecer_registra_historial_actualiza_auth_y_confirma_en_orden(self, servicio, repo, auth, mocker):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario()
        orden = mocker.Mock()
        orden.attach_mock(repo.AgregarHistorial, "AgregarHistorial")
        orden.attach_mock(auth.put, "put")
        orden.attach_mock(repo.Confirmar, "Confirmar")

        respuesta = self._restablecer(servicio)

        assert [c[0] for c in orden.mock_calls] == ["AgregarHistorial", "put", "Confirmar"]
        assert repo.AgregarHistorial.call_args.args == (ID_ADMIN, "Restablecer clave · Usuario CI 7654321 (Juan Mamani Quispe)")
        assert auth.put.call_args.args[0].endswith(f"/auth/v1/admin/users/{AUTH_USER_ID}")
        assert auth.put.call_args.kwargs["json"] == {"password": "Lajas#2026"}
        assert respuesta.Ci == "7654321"

    @pytest.mark.parametrize(
        ("respuesta", "codigo"),
        [(respuesta_auth(404), 404), (respuesta_auth(422), 422), (respuesta_auth(500), 503)],
        ids=["sin-cuenta", "clave-rechazada", "error-auth"],
    )
    def test_si_falla_auth_se_revierte_el_historial(self, servicio, repo, auth, respuesta, codigo):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario()
        auth.put.return_value = respuesta

        assert _error(self._restablecer, servicio).status_code == codigo
        repo.Revertir.assert_called_once()
        repo.Confirmar.assert_not_called()

    def test_si_auth_no_responde_se_revierte_y_responde_503(self, servicio, repo, auth):
        repo.ObtenerUsuarioBloqueado.return_value = crear_usuario()
        auth.put.side_effect = httpx.ReadTimeout("lento")

        assert _error(self._restablecer, servicio).status_code == status.HTTP_503_SERVICE_UNAVAILABLE
        repo.Revertir.assert_called_once()


class TestConsultas:
    def _detalle(self, es_admin, acciones):
        return {
            "IdUsuario": 7, "Ci": "7654321", "PrimerNombre": "Juan", "ApellidoPaterno": "Mamani",
            "NombreCompleto": "Juan Mamani", "IdRol": LIDER, "NombreRol": "Líder", "IdEstadoUsuario": 1,
            "NombreEstadoUsuario": "Activo", "IsAdmin": es_admin, "FechaRegistro": FECHA_REGISTRO,
            "AccionesAdmin": acciones,
        }

    @pytest.mark.parametrize(
        ("es_admin", "acciones", "fue_admin"),
        [(False, 3, True), (True, 3, False), (False, 0, False)],
        ids=["ex-admin", "admin-actual", "nunca-admin"],
    )
    def test_detalle_calcula_si_fue_admin(self, servicio, repo, es_admin, acciones, fue_admin):
        repo.ObtenerDetalle.return_value = self._detalle(es_admin, acciones)

        assert servicio.ObtenerDetalle(7).FueAdmin is fue_admin

    def test_detalle_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerDetalle.return_value = None

        assert _error(servicio.ObtenerDetalle, 99).status_code == status.HTTP_404_NOT_FOUND

    def test_perfil_agrega_el_correo_del_token(self, servicio, repo):
        repo.ObtenerPerfil.return_value = {
            "IdUsuarioOut": 7, "CiOut": "7654321", "PrimerNombreOut": "Juan", "ApellidoPaternoOut": "Mamani",
            "NombreCompletoOut": "Juan Mamani", "IdRolOut": 1, "NombreRolOut": "Operador", "IdEstadoUsuarioOut": 1,
            "NombreEstadoUsuarioOut": "Activo", "FechaRegistroOut": FECHA_REGISTRO,
        }

        perfil = servicio.ObtenerPerfil({"IdUsuario": 7, "Correo": "7654321@papelblanquita.invalid"})

        repo.ObtenerPerfil.assert_called_once_with({"p_IdUsuario": 7})
        assert perfil.Correo == "7654321@papelblanquita.invalid"

    def test_perfil_inexistente_lanza_404(self, servicio, repo):
        repo.ObtenerPerfil.return_value = None

        assert _error(servicio.ObtenerPerfil, {"IdUsuario": 7}).status_code == status.HTTP_404_NOT_FOUND

    def test_listar_pasa_los_filtros_y_la_paginacion(self, servicio, repo):
        repo.ListarUsuarios.return_value = (41, [])

        respuesta = servicio.ListarUsuarios(ListarUsuariosRequest(IdRol=OPERADOR, Pagina=3, TamanoPagina=20))

        filtros = repo.ListarUsuarios.call_args.args[0]
        assert filtros["IdRol"] == OPERADOR
        assert filtros["Pagina"] == 3
        assert (respuesta.Total, respuesta.Pagina, respuesta.Usuarios) == (41, 3, [])
