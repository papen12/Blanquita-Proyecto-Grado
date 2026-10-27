import ipaddress
import os
import socket

os.environ["DATABASE_URL"] = "postgresql+psycopg2://prueba:prueba@bd-de-prueba.invalid:5432/prueba"
os.environ["SUPABASE_URL"] = "https://supabase-de-prueba.invalid"
os.environ["SUPABASE_PUBLISHABLE_KEY"] = "clave-publica-de-prueba"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "clave-servicio-de-prueba"

import pytest
from sqlalchemy import event

from app.Config.supabase import engine

MENSAJE_RED_BLOQUEADA = "Las pruebas no pueden conectarse a la red ni a la base de datos real"


class ConexionBloqueada(RuntimeError):
    pass


def _es_local(direccion) -> bool:
    if isinstance(direccion, tuple) and direccion:
        host = direccion[0]
    else:
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return host == "localhost"


_connect_original = socket.socket.connect
_connect_ex_original = socket.socket.connect_ex


def _connect_vigilado(self, direccion):
    if not _es_local(direccion):
        raise ConexionBloqueada(f"{MENSAJE_RED_BLOQUEADA}: {direccion}")
    return _connect_original(self, direccion)


def _connect_ex_vigilado(self, direccion):
    if not _es_local(direccion):
        raise ConexionBloqueada(f"{MENSAJE_RED_BLOQUEADA}: {direccion}")
    return _connect_ex_original(self, direccion)


@event.listens_for(engine, "do_connect")
def _bloquear_base_de_datos(*_):
    raise ConexionBloqueada(MENSAJE_RED_BLOQUEADA)


@pytest.fixture(autouse=True, scope="session")
def blindaje_de_red():
    with pytest.MonkeyPatch.context() as parche:
        parche.setattr(socket.socket, "connect", _connect_vigilado)
        parche.setattr(socket.socket, "connect_ex", _connect_ex_vigilado)
        yield
