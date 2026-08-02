import unicodedata

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHash, VerificationError, VerifyMismatchError

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)

LONGITUD_MINIMA = 8
LONGITUD_MAXIMA = 64

SIMBOLOS = set("!@#$%^&*()-_=+[]{}|;:',.<>?/`~\"\\")

CLAVES_PROHIBIDAS = {
    "12345678", "123456789", "1234567890", "password", "password1",
    "contrasena", "contraseña", "qwerty123", "abc12345", "11111111",
    "papelblanquita", "blanquita", "papel123", "papelera",
    "bolivia", "sucre", "chuquisaca", "servilleta", "bobina",
    "usuario", "operador", "administrador", "inventario", "produccion",
}


def NormalizarClave(clave: str) -> str:
    return unicodedata.normalize("NFC", clave).strip()


def EstructuraClave(clave) -> tuple[bool, str]:
    if not isinstance(clave, str):
        return False, "La clave es obligatoria"

    clave = NormalizarClave(clave)

    if len(clave) < LONGITUD_MINIMA:
        return False, f"La clave debe tener al menos {LONGITUD_MINIMA} caracteres"

    if len(clave) > LONGITUD_MAXIMA:
        return False, f"La clave no puede superar los {LONGITUD_MAXIMA} caracteres"

    if not any(ch.isdigit() for ch in clave):
        return False, "La clave debe incluir al menos un número"

    if not any(ch.isupper() for ch in clave):
        return False, "La clave debe incluir al menos una letra mayúscula"

    if not any(ch in SIMBOLOS for ch in clave):
        return False, "La clave debe incluir al menos un símbolo"

    if ClaveComprometida(clave):
        return False, "La clave es demasiado común o predecible, elija otra"

    return True, ""


def ClaveComprometida(clave: str) -> bool:
    normalizada = clave.lower()

    if normalizada in CLAVES_PROHIBIDAS:
        return True

    sin_digitos = normalizada.rstrip("0123456789")
    if sin_digitos and sin_digitos in CLAVES_PROHIBIDAS:
        return True

    return False


def ClaveContieneDatosPersonales(clave: str, ci: str, nombres: list[str]) -> bool:
    normalizada = NormalizarClave(clave).lower()

    if ci and ci in normalizada:
        return True

    for nombre in nombres:
        if nombre and len(nombre) >= 4 and nombre.lower() in normalizada:
            return True

    return False


def HashPassword(clave: str) -> str:
    return ph.hash(NormalizarClave(clave))


def VerificarClave(clave_hash: str, clave_plana: str) -> bool:
    try:
        ph.verify(clave_hash, NormalizarClave(clave_plana))
        return True
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False