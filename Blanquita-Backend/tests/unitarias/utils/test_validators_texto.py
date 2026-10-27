import pytest

from app.Constants.Cantidades import (
    CANTIDAD_INGRESO_LOGS,
    LONGITUD_MAXIMA_DESCRIPCION,
    LONGITUD_MINIMA_DESCRIPCION,
)
from app.utils.validators import (
    EsCantidadValida,
    ValidarCaracteres,
    ValidarFormularioUsuario,
    ValidarTexto,
)

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]


@pytest.mark.parametrize("cantidad", [1, 50, CANTIDAD_INGRESO_LOGS])
def test_cantidad_dentro_del_limite_es_valida(cantidad):
    assert EsCantidadValida(cantidad, CANTIDAD_INGRESO_LOGS) is True


def test_cantidad_mayor_al_limite_no_es_valida():
    assert EsCantidadValida(CANTIDAD_INGRESO_LOGS + 1, CANTIDAD_INGRESO_LOGS) is False


@pytest.mark.parametrize(
    "texto",
    [
        "Falta de pegamento",
        "Empalme bobina BP-0012",
        "Ñandú, árbol; pingüino: (ok) \"x\" 1/2 #3 - fin.",
        "ÁÉÍÓÚÜÑáéíóúüñ",
    ],
)
def test_caracteres_permitidos_son_validos(texto):
    assert ValidarCaracteres(texto) is True


@pytest.mark.parametrize(
    "texto",
    ["", "hola!", "precio $10", "correo@dominio", "50%", "tab\tinterno", "salto\nlinea", "emoji 😀", "a_b"],
)
def test_caracteres_no_permitidos_son_invalidos(texto):
    assert ValidarCaracteres(texto) is False


def test_texto_con_longitud_minima_es_valido():
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, "a" * LONGITUD_MINIMA_DESCRIPCION) is True


def test_texto_con_longitud_maxima_es_valido():
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, "a" * LONGITUD_MAXIMA_DESCRIPCION) is True


def test_texto_mas_corto_que_el_minimo_es_invalido():
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, "a" * (LONGITUD_MINIMA_DESCRIPCION - 1)) is False


def test_texto_mas_largo_que_el_maximo_es_invalido():
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, "a" * (LONGITUD_MAXIMA_DESCRIPCION + 1)) is False


def test_texto_con_longitud_correcta_pero_caracteres_invalidos_es_invalido():
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, "pausa por falla!") is False


@pytest.mark.parametrize("valor", [None, 12345, ["texto"], b"bytes valido"])
def test_texto_que_no_es_cadena_es_invalido(valor):
    assert ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, valor) is False


@pytest.mark.parametrize("nombre", ["Fabricio", "José", "Ñusta", "Al", "A" * 15])
def test_nombre_de_usuario_valido(nombre):
    assert ValidarFormularioUsuario(nombre) is True


@pytest.mark.parametrize("nombre", ["A", "A" * 16, "Juan Carlos", "Ana1", "O'Neil", "María-José", ""])
def test_nombre_de_usuario_invalido(nombre):
    assert ValidarFormularioUsuario(nombre) is False
