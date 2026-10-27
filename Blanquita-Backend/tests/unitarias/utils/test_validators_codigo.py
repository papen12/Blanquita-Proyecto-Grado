import pytest
from fastapi import HTTPException, status

from app.Constants.Cantidades import (
    LONGITUD_MAXIMA_CODIGO_MATERIA_PRIMA,
    LONGITUD_MINIMA_CODIGO_MATERIA_PRIMA,
)
from app.utils.validators import (
    CodigoBusqueda,
    CodigoMateriaPrima,
    NormalizarCodigo,
    ValidarCodigo,
)

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]


@pytest.mark.parametrize(
    ("entrada", "esperado"),
    [
        ("bp-0012", "BP-0012"),
        ("lote 15", "LOTE-15"),
        ("  lote   15  ", "LOTE-15"),
        ("café", "CAFE"),
        ("árbol índigo", "ARBOL-INDIGO"),
        ("peña", "PEÑA"),
        ("AÑO 2026", "AÑO-2026"),
        ("a--b---c", "A-B-C"),
        ("-ab-", "AB"),
        ("a - b", "A-B"),
        ("pingüino", "PINGUINO"),
    ],
)
def test_normalizar_codigo(entrada, esperado):
    assert NormalizarCodigo(entrada) == esperado


@pytest.mark.parametrize("entrada", [None, 123, ["BP-1"]])
def test_normalizar_codigo_que_no_es_cadena_devuelve_vacio(entrada):
    assert NormalizarCodigo(entrada) == ""


@pytest.mark.parametrize(
    "codigo",
    [
        "ABC",
        "BP-0012",
        "PEÑA-01",
        "A1-B2-C3",
        "X" * LONGITUD_MAXIMA_CODIGO_MATERIA_PRIMA,
    ],
)
def test_codigo_valido(codigo):
    assert ValidarCodigo(codigo) is True


@pytest.mark.parametrize(
    "codigo",
    [
        "A" * (LONGITUD_MINIMA_CODIGO_MATERIA_PRIMA - 1),
        "X" * (LONGITUD_MAXIMA_CODIGO_MATERIA_PRIMA + 1),
        "bp-0012",
        "BP--0012",
        "-BP12",
        "BP12-",
        "BP_12",
        "BP 12",
        "BP.12",
        "CAFÉ",
    ],
)
def test_codigo_invalido(codigo):
    assert ValidarCodigo(codigo) is False


def test_codigo_materia_prima_devuelve_el_codigo_normalizado():
    assert CodigoMateriaPrima(" bobina 12 ", "de bobina") == "BOBINA-12"


@pytest.mark.parametrize("entrada", ["", "   ", "---", None])
def test_codigo_materia_prima_vacio_lanza_422_obligatorio(entrada):
    with pytest.raises(HTTPException) as error:
        CodigoMateriaPrima(entrada, "de bobina")

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert error.value.detail == "El código de bobina es obligatorio"


def test_codigo_materia_prima_corto_lanza_422_con_el_codigo_normalizado():
    with pytest.raises(HTTPException) as error:
        CodigoMateriaPrima("ab", "del lote")

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "«AB»" in error.value.detail
    assert error.value.detail.startswith("El código del lote")


def test_codigo_materia_prima_con_simbolos_lanza_422():
    with pytest.raises(HTTPException) as error:
        CodigoMateriaPrima("BP#12", "de bobina")

    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    assert "solo con letras, números y guiones" in error.value.detail


def test_codigo_busqueda_normaliza_el_texto():
    assert CodigoBusqueda("bp 12") == "BP-12"


@pytest.mark.parametrize("entrada", ["", "   ", None])
def test_codigo_busqueda_vacio_devuelve_none(entrada):
    assert CodigoBusqueda(entrada) is None
