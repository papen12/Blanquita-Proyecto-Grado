import os
import socket

import pytest
from sqlalchemy import text

from app.Config.supabase import engine
from tests.conftest import ConexionBloqueada

pytestmark = pytest.mark.unitaria


def test_las_variables_de_entorno_apuntan_a_hosts_de_prueba():
    assert "bd-de-prueba.invalid" in os.environ["DATABASE_URL"]
    assert "supabase-de-prueba.invalid" in os.environ["SUPABASE_URL"]


def test_el_engine_usa_la_url_de_prueba():
    assert engine.url.host == "bd-de-prueba.invalid"


def test_conectarse_a_la_base_de_datos_esta_bloqueado():
    with pytest.raises(ConexionBloqueada):
        with engine.connect() as conexion:
            conexion.execute(text("SELECT 1"))


def test_conectarse_a_un_host_externo_esta_bloqueado():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as cliente:
        with pytest.raises(ConexionBloqueada):
            cliente.connect(("8.8.8.8", 443))


def test_las_conexiones_locales_siguen_permitidas():
    servidor, cliente = socket.socketpair()
    servidor.close()
    cliente.close()
