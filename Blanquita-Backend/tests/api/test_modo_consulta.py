from datetime import datetime

import pytest
import time_machine
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.Constants.Horario import MENSAJE_SOLO_CONSULTA, RUTAS_PERMITIDAS_SOLO_CONSULTA
from app.Middleware.ModoConsulta import HTTP_423_LOCKED, ModoConsultaMiddleware
from app.utils.dates import ZONA_BOLIVIA
from tests.api.conftest import MADRUGADA, RUTAS

pytestmark = [pytest.mark.api, pytest.mark.comun]

METODOS_ESCRITURA = ["POST", "PUT", "PATCH", "DELETE"]


def _la_paz(hora, minuto=0, segundo=0):
    return datetime(2026, 10, 27, hora, minuto, segundo, tzinfo=ZONA_BOLIVIA)


@pytest.fixture
def mini_app():
    aplicacion = FastAPI()
    aplicacion.add_middleware(ModoConsultaMiddleware)

    @aplicacion.api_route("/recurso", methods=["GET", "HEAD", "OPTIONS", *METODOS_ESCRITURA])
    def recurso():
        return {"ok": True}

    for ruta in RUTAS_PERMITIDAS_SOLO_CONSULTA:
        aplicacion.add_api_route(ruta, lambda: {"ok": True}, methods=["POST", "PATCH"])

    return TestClient(aplicacion)


def _en(momento):
    return time_machine.travel(momento, tick=False)


class TestMiddlewareAislado:
    @pytest.mark.parametrize("metodo", METODOS_ESCRITURA)
    def test_escrituras_en_madrugada_responden_423(self, mini_app, metodo):
        with _en(MADRUGADA):
            respuesta = mini_app.request(metodo, "/recurso")

        assert respuesta.status_code == HTTP_423_LOCKED
        assert respuesta.json() == {"detail": MENSAJE_SOLO_CONSULTA}

    @pytest.mark.parametrize("metodo", ["GET", "HEAD", "OPTIONS"])
    def test_lecturas_en_madrugada_pasan(self, mini_app, metodo):
        with _en(MADRUGADA):
            respuesta = mini_app.request(metodo, "/recurso")

        assert respuesta.status_code == 200

    @pytest.mark.parametrize("ruta", sorted(RUTAS_PERMITIDAS_SOLO_CONSULTA))
    def test_rutas_permitidas_pasan_en_madrugada(self, mini_app, ruta):
        with _en(MADRUGADA):
            respuesta = mini_app.post(ruta)

        assert respuesta.status_code == 200

    def test_ruta_permitida_con_barra_final_tambien_pasa(self, mini_app):
        with _en(MADRUGADA):
            respuesta = mini_app.post("/auth/login/", follow_redirects=False)

        assert respuesta.status_code != HTTP_423_LOCKED

    def test_ruta_que_solo_empieza_igual_no_se_permite(self, mini_app):
        with _en(MADRUGADA):
            respuesta = mini_app.post("/auth/login-falso")

        assert respuesta.status_code == HTTP_423_LOCKED

    @pytest.mark.parametrize(
        ("momento", "bloqueado"),
        [
            (_la_paz(0, 0, 0), True),
            (_la_paz(5, 59, 59), True),
            (_la_paz(6, 0, 0), False),
            (_la_paz(14, 0), False),
            (_la_paz(23, 59, 59), False),
        ],
        ids=["medianoche", "ultimo-segundo", "seis-en-punto", "tarde", "fin-del-dia"],
    )
    def test_bordes_del_horario(self, mini_app, momento, bloqueado):
        with _en(momento):
            respuesta = mini_app.post("/recurso")

        assert (respuesta.status_code == HTTP_423_LOCKED) is bloqueado


class TestAplicacionReal:
    def test_las_rutas_permitidas_existen_en_la_api(self):
        rutas = {r.ruta for r in RUTAS if not r.es_lectura}

        assert RUTAS_PERMITIDAS_SOLO_CONSULTA <= rutas

    def test_el_middleware_responde_423_antes_de_pedir_credenciales(self, cliente):
        with _en(MADRUGADA):
            respuesta = cliente.post("/papelbobina/produccion/iniciar", json={})

        assert respuesta.status_code == HTTP_423_LOCKED

    def test_en_horario_laboral_la_misma_peticion_llega_a_la_autenticacion(self, cliente):
        respuesta = cliente.post("/papelbobina/produccion/iniciar", json={})

        assert respuesta.status_code == 401

    def test_cambiar_estado_de_usuario_sigue_disponible_en_madrugada(self, cliente):
        with _en(MADRUGADA):
            respuesta = cliente.patch("/Usuario/estado", json={})

        assert respuesta.status_code == 401

    def test_consultas_siguen_disponibles_en_madrugada(self, cliente):
        with _en(MADRUGADA):
            respuesta = cliente.get("/productofinal/inventario/ver")

        assert respuesta.status_code == 401

    @pytest.mark.parametrize(
        "ruta",
        [r for r in RUTAS if not r.es_lectura and r.ruta not in RUTAS_PERMITIDAS_SOLO_CONSULTA],
        ids=str,
    )
    def test_toda_escritura_de_la_api_queda_bloqueada_en_madrugada(self, cliente, ruta):
        with _en(MADRUGADA):
            respuesta = cliente.request(ruta.metodo, ruta.url(), json={})

        assert respuesta.status_code == HTTP_423_LOCKED
