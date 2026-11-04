import secrets
from base64 import urlsafe_b64encode

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import Encoding, PublicFormat


def codificar(valor: bytes) -> str:
    return urlsafe_b64encode(valor).rstrip(b"=").decode()


clave = ec.generate_private_key(ec.SECP256R1())
privada = clave.private_numbers().private_value.to_bytes(32, "big")
publica = clave.public_key().public_bytes(Encoding.X962, PublicFormat.UncompressedPoint)

print(f"VAPID_PUBLIC_KEY={codificar(publica)}")
print(f"VAPID_PRIVATE_KEY={codificar(privada)}")
print(f"PUSH_CRON_SECRET={secrets.token_urlsafe(32)}")
