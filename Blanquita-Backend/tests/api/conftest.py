from datetime import datetime

import pytest
import time_machine
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.Auth import Jwt
from app.Auth.Dependencies import get_current_user
from app.Config.supabase import get_db
from app.Constants.Roles import ROL_GERENTE_GENERAL, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.main import app
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.rutas import rutas_api
from tests.dobles.tokens import FabricaTokens, JwkClientStub

ROLES = {
    "operador": ROL_OPERADOR,
    "lider": ROL_LIDER_INVENTARIO_PRODUCCION,
    "gerente": ROL_GERENTE_GENERAL,
}

RUTAS = rutas_api(app)

HORARIO_LABORAL = datetime(2026, 10, 27, 10, 0, tzinfo=ZONA_BOLIVIA)
MADRUGADA = datetime(2026, 10, 27, 3, 0, tzinfo=ZONA_BOLIVIA)


def usuario(id_rol: int, es_admin: bool = False, id_usuario: int = 7) -> dict:
    return {
        "IdUsuario": id_usuario,
        "IdRol": id_rol,
        "IdEstadoUsuario": 1,
        "IsAdmin": es_admin,
        "AuthUserId": f"auth-{id_usuario}",
        "Correo": f"{id_usuario}@papelblanquita.invalid",
    }


@pytest.fixture(autouse=True)
def horario_laboral():
    with time_machine.travel(HORARIO_LABORAL, tick=False):
        yield


@pytest.fixture(autouse=True)
def limpiar_overrides(mocker):
    sesion = mocker.create_autospec(Session, instance=True)
    app.dependency_overrides[get_db] = lambda: sesion
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def cliente():
    with TestClient(app, raise_server_exceptions=True) as cliente:
        yield cliente


@pytest.fixture
def como():
    def autenticar(id_rol: int, es_admin: bool = False) -> dict:
        actual = usuario(id_rol, es_admin)
        app.dependency_overrides[get_current_user] = lambda: actual
        return actual

    return autenticar


@pytest.fixture
def tokens(monkeypatch):
    fabrica = FabricaTokens()
    monkeypatch.setattr(Jwt, "_jwk_client", JwkClientStub(fabrica.llave_publica))
    return fabrica
