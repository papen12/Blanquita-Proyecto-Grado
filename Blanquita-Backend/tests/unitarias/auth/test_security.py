import pytest

from app.Auth.Security import (
    LONGITUD_MAXIMA,
    LONGITUD_MINIMA,
    ClaveComprometida,
    ClaveContieneDatosPersonales,
    EstructuraClave,
    HashPassword,
    NormalizarClave,
    ValidarClaveNueva,
    VerificarClave,
)

pytestmark = [pytest.mark.unitaria, pytest.mark.usuario]

CLAVE_VALIDA = "Lajas#2026"


@pytest.mark.parametrize("clave", [CLAVE_VALIDA, "Abcdef1!", "Rollo$9xyzQ1", "Ñandu.2026"])
def test_clave_con_estructura_valida(clave):
    assert EstructuraClave(clave) == (True, "")


@pytest.mark.parametrize(
    ("clave", "mensaje"),
    [
        (None, "La clave es obligatoria"),
        (12345678, "La clave es obligatoria"),
        ("Ab1!xyz", f"La clave debe tener al menos {LONGITUD_MINIMA} caracteres"),
        ("Ab1!xyzabcdef", f"La clave no puede superar los {LONGITUD_MAXIMA} caracteres"),
        ("Abcdefg!", "La clave debe incluir al menos un número"),
        ("abcdef1!", "La clave debe incluir al menos una letra mayúscula"),
        ("Abcdefg1", "La clave debe incluir al menos un símbolo"),
    ],
)
def test_clave_con_estructura_invalida(clave, mensaje):
    assert EstructuraClave(clave) == (False, mensaje)


def test_los_espacios_de_los_extremos_no_cuentan_para_la_longitud():
    assert EstructuraClave("   Ab1!xyz   ")[0] is False


@pytest.mark.parametrize("clave", ["Blanquita1!", "Password1#", "Bolivia123$", "Servilleta1!"])
def test_clave_comun_con_relleno_es_rechazada(clave):
    assert ClaveComprometida(clave) is True
    assert EstructuraClave(clave) == (False, "La clave es demasiado común o predecible, elija otra")


@pytest.mark.parametrize("clave", ["PASSWORD", "Contraseña", "12345678"])
def test_clave_prohibida_exacta_sin_importar_mayusculas(clave):
    assert ClaveComprometida(clave) is True


@pytest.mark.parametrize("clave", ["Planta#2026", "Lux24!jabas"])
def test_clave_que_solo_contiene_una_palabra_comun_no_es_comprometida(clave):
    assert ClaveComprometida(clave) is False


@pytest.mark.parametrize(
    ("clave", "ci", "nombres", "esperado"),
    [
        ("Ab#1234567", "1234567", [], True),
        ("Carlos#2026", "", ["Carlos"], True),
        ("CARLOS#2026", "", ["carlos"], True),
        ("Ana#20261x", "", ["Ana"], False),
        ("Lajas#2026", "7654321", ["Carlos", "Perez"], False),
    ],
    ids=["contiene-ci", "contiene-nombre", "sin-distinguir-mayusculas", "nombre-corto-se-ignora", "sin-datos"],
)
def test_clave_con_datos_personales(clave, ci, nombres, esperado):
    assert ClaveContieneDatosPersonales(clave, ci, nombres) is esperado


def test_validar_clave_nueva_valida_devuelve_none():
    assert ValidarClaveNueva(CLAVE_VALIDA, ci="7654321", nombres=["Carlos", "Perez"]) is None


def test_validar_clave_nueva_devuelve_primero_el_error_de_estructura():
    assert ValidarClaveNueva("corta", ci="corta") == f"La clave debe tener al menos {LONGITUD_MINIMA} caracteres"


def test_validar_clave_nueva_rechaza_datos_personales():
    assert ValidarClaveNueva("Perez#2026", nombres=["Perez"]) == "La clave no puede contener el CI ni los nombres del usuario"


def test_validar_clave_nueva_sin_ci_ni_nombres():
    assert ValidarClaveNueva(CLAVE_VALIDA) is None


def test_normalizar_clave_unifica_tildes_compuestas():
    assert NormalizarClave(" Ñandu ") == "Ñandu"


class TestHash:
    @pytest.fixture(scope="class")
    def hash_clave(self):
        return HashPassword(CLAVE_VALIDA)

    def test_el_hash_es_argon2id_y_no_contiene_la_clave(self, hash_clave):
        assert hash_clave.startswith("$argon2id$")
        assert CLAVE_VALIDA not in hash_clave

    def test_la_clave_correcta_verifica(self, hash_clave):
        assert VerificarClave(hash_clave, CLAVE_VALIDA) is True

    def test_la_clave_con_espacios_en_los_extremos_verifica(self, hash_clave):
        assert VerificarClave(hash_clave, f"  {CLAVE_VALIDA} ") is True

    def test_la_clave_incorrecta_no_verifica(self, hash_clave):
        assert VerificarClave(hash_clave, "Lajas#2027") is False

    def test_un_hash_corrupto_no_verifica_ni_lanza(self):
        assert VerificarClave("no-es-un-hash", CLAVE_VALIDA) is False

    def test_dos_hashes_de_la_misma_clave_son_distintos(self, hash_clave):
        assert HashPassword(CLAVE_VALIDA) != hash_clave
