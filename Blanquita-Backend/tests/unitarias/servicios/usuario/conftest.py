from datetime import datetime

import httpx
import pytest
import time_machine
from sqlalchemy.orm import Session

from app.Repository.Usuario.UsuarioRepository import UsuarioRepository
from app.Services.Usuario import UsuarioService as modulo_servicio
from app.Services.Usuario.UsuarioService import UsuarioService
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.usuarios import AUTH_USER_ID, ESTADOS, ROLES, respuesta_auth


@pytest.fixture(autouse=True)
def horario_laboral():
    with time_machine.travel(datetime(2026, 10, 27, 10, 0, tzinfo=ZONA_BOLIVIA), tick=False):
        yield


@pytest.fixture
def repo(mocker):
    repositorio = mocker.create_autospec(UsuarioRepository, instance=True)
    repositorio.ObtenerRol.side_effect = ROLES.get
    repositorio.NombresEstadosUsuario.return_value = dict(ESTADOS)
    repositorio.ExisteCi.return_value = False
    repositorio.CrearUsuario.side_effect = lambda usuario, observacion, id_admin: _persistir(usuario)
    return repositorio


def _persistir(usuario):
    usuario.IdUsuario = 40
    usuario.FechaRegistro = datetime(2026, 10, 27, 14, 0, tzinfo=ZONA_BOLIVIA)
    return usuario


@pytest.fixture
def auth(mocker):
    cliente = mocker.patch.object(modulo_servicio, "httpx", autospec=True)
    cliente.RequestError = httpx.RequestError
    cliente.post.return_value = respuesta_auth(200, {"id": AUTH_USER_ID})
    cliente.put.return_value = respuesta_auth(200, {"id": AUTH_USER_ID})
    cliente.delete.return_value = respuesta_auth(200)
    return cliente


@pytest.fixture
def servicio(mocker, repo, auth):
    servicio = UsuarioService(mocker.create_autospec(Session, instance=True))
    servicio.repository = repo
    return servicio
