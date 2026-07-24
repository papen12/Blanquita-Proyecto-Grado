from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
import unicodedata

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)

LONGITUD_MINIMA = 15
LONGITUD_MAXIMA = 64


def EstructuraClave(clave):
    if not isinstance(clave, str) or clave == "":
        return False

    clave = unicodedata.normalize('NFC', clave)

    longitud = len(clave)  
    if longitud < LONGITUD_MINIMA or longitud > LONGITUD_MAXIMA:
        return False
    if any(ch.isspace() for ch in clave):
        return False

    return True


def HashPassword(clave):
    clave_normalizada = unicodedata.normalize('NFC', clave)
    clave_hash = ph.hash(clave_normalizada)
    return clave_hash


def VerificarClave(clave_hash, clave_plana):
    try:
        clave_normalizada = unicodedata.normalize('NFC', clave_plana)
        ph.verify(clave_hash, clave_normalizada)
        return True
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False