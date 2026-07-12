from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
import re

ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16
)


def EstructuraClave(clave):
    patron = r'^[A-Z]{3}\d{3}$'
    if re.fullmatch(patron, clave):
        return True
    else:
        return False


def HashPassword(clave):
    clave_hash = ph.hash(clave)
    return clave_hash


def VerificarClave(clave_hash, clave_plana):
    try:
        ph.verify(clave_hash, clave_plana)
        return True
    except (VerifyMismatchError, VerificationError, InvalidHash):
        return False
    
    
print(ph.hash("PapelBlanquita2026SistemaProduccionInventarioHash"))