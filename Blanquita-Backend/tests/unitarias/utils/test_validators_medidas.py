from decimal import Decimal

import pytest
from fastapi import HTTPException, status

from app.Constants.Cantidades import (
    PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG,
    PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG,
    TONELADAS_MAXIMAS_PEDIDO,
)
from app.utils.validators import MedidasUnidadServilleta, ToneladasPedidas, ValidarMedida

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]


def _peso_bobina(valor, **opciones):
    return ValidarMedida(
        valor,
        "el peso bruto",
        "kg",
        PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG,
        PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG,
        **opciones,
    )


def _detalle_422(funcion, *argumentos) -> str:
    with pytest.raises(HTTPException) as error:
        funcion(*argumentos)
    assert error.value.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
    return error.value.detail


@pytest.mark.parametrize(
    ("valor", "esperado"),
    [
        (735.5, Decimal("735.5")),
        ("735.25", Decimal("735.25")),
        (PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG, Decimal(PESO_BRUTO_MINIMO_BOBINA_PAPEL_KG)),
        (PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG, Decimal(PESO_BRUTO_MAXIMO_BOBINA_PAPEL_KG)),
        (Decimal("800.10"), Decimal("800.10")),
    ],
)
def test_medida_dentro_del_rango_devuelve_decimal(valor, esperado):
    resultado = _peso_bobina(valor)

    assert isinstance(resultado, Decimal)
    assert resultado == esperado


@pytest.mark.parametrize("valor", [99.99, 1500.01, 0, -5])
def test_medida_fuera_del_rango_lanza_422_con_el_rango(valor):
    detalle = _detalle_422(_peso_bobina, valor)

    assert detalle == "El peso bruto debe estar entre 100 y 1500 kg"


@pytest.mark.parametrize("valor", ["abc", "", float("nan"), float("inf"), "-inf"])
def test_medida_no_numerica_o_no_finita_lanza_422(valor):
    detalle = _detalle_422(_peso_bobina, valor)

    assert detalle.startswith("El peso bruto debe estar entre")


def test_medida_con_mas_decimales_de_los_permitidos_lanza_422():
    detalle = _detalle_422(_peso_bobina, "735.123")

    assert detalle == "El peso bruto admite como máximo 2 decimales"


def test_medida_con_ceros_a_la_derecha_no_cuenta_como_decimales_extra():
    assert _peso_bobina("735.1000") == Decimal("735.1")


def test_medida_entera_grande_no_se_confunde_con_decimales():
    assert _peso_bobina(1000) == Decimal("1000")


def test_medida_obligatoria_ausente_lanza_422():
    detalle = _detalle_422(_peso_bobina, None)

    assert detalle == "Falta el peso bruto"


def test_medida_opcional_ausente_devuelve_none():
    assert _peso_bobina(None, obligatorio=False) is None


def test_medida_con_minimo_cero_exige_mayor_a_cero():
    detalle = _detalle_422(ValidarMedida, 0, "el gramaje", "g/m²", 50)

    assert detalle == "El gramaje debe ser mayor a 0 y como máximo 50 g/m²"


def test_medida_con_minimo_cero_acepta_valores_pequenos():
    assert ValidarMedida("0.01", "el gramaje", "g/m²", 50) == Decimal("0.01")


@pytest.mark.parametrize("valor", ["0.01", 1, "13.9", "2.125", TONELADAS_MAXIMAS_PEDIDO])
def test_toneladas_validas(valor):
    assert ToneladasPedidas(valor) == Decimal(str(valor))


@pytest.mark.parametrize("valor", ["0.009", "50.001", 0])
def test_toneladas_fuera_del_rango_lanzan_422(valor):
    detalle = _detalle_422(ToneladasPedidas, valor)

    assert detalle == "La cantidad de toneladas pedidas debe estar entre 0,01 y 50 t"


def test_toneladas_admiten_tres_decimales_como_maximo():
    detalle = _detalle_422(ToneladasPedidas, "1.2345")

    assert detalle == "La cantidad de toneladas pedidas admite como máximo 3 decimales"


def test_toneladas_obligatorias_ausentes_lanzan_422():
    detalle = _detalle_422(ToneladasPedidas, None)

    assert detalle == "Falta la cantidad de toneladas pedidas"


def test_toneladas_opcionales_ausentes_devuelven_none():
    assert ToneladasPedidas(None, obligatorio=False) is None


def test_medidas_unidad_servilleta_validas():
    assert MedidasUnidadServilleta("U-01", "370", "18.05") == {
        "PesoBrutoKg": Decimal("370"),
        "GramajeGr": Decimal("18.05"),
    }


def test_medidas_unidad_servilleta_son_opcionales():
    assert MedidasUnidadServilleta("U-01", None, None) == {"PesoBrutoKg": None, "GramajeGr": None}


def test_peso_de_unidad_servilleta_fuera_del_rango_indica_el_codigo():
    detalle = _detalle_422(MedidasUnidadServilleta, "U-01", 40, None)

    assert detalle == "El peso bruto de la unidad U-01 debe estar entre 50 y 1000 kg"


def test_gramaje_de_unidad_servilleta_mayor_al_maximo_indica_el_codigo():
    detalle = _detalle_422(MedidasUnidadServilleta, "U-02", None, "50.5")

    assert detalle == "El gramaje de la unidad U-02 debe ser mayor a 0 y como máximo 50 g/m²"
