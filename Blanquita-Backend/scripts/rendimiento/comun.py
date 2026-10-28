import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

CARPETA = Path(__file__).resolve().parent
SALIDA = CARPETA / "salida"
ARCHIVO_LLAVE = SALIDA / "llave_privada.pem"
ARCHIVO_JWKS = SALIDA / "auth" / "v1" / ".well-known" / "jwks.json"
ARCHIVO_USUARIOS = SALIDA / "usuarios.json"

KID = "rendimiento-blanquita"
PUERTO_JWKS = 8099
EMISOR = f"http://127.0.0.1:{PUERTO_JWKS}/auth/v1"
AUDIENCIA = "authenticated"
HORAS_VIGENCIA_TOKEN = 12


def llave_privada() -> ec.EllipticCurvePrivateKey:
    if ARCHIVO_LLAVE.exists():
        return serialization.load_pem_private_key(ARCHIVO_LLAVE.read_bytes(), password=None)

    llave = ec.generate_private_key(ec.SECP256R1())
    SALIDA.mkdir(parents=True, exist_ok=True)
    ARCHIVO_LLAVE.write_bytes(
        llave.private_bytes(
            serialization.Encoding.PEM,
            serialization.PrivateFormat.PKCS8,
            serialization.NoEncryption(),
        )
    )
    publicar_jwks(llave)
    return llave


def publicar_jwks(llave: ec.EllipticCurvePrivateKey) -> None:
    jwk = json.loads(jwt.algorithms.ECAlgorithm.to_jwk(llave.public_key()))
    jwk.update(kid=KID, use="sig", alg="ES256")
    ARCHIVO_JWKS.parent.mkdir(parents=True, exist_ok=True)
    ARCHIVO_JWKS.write_text(json.dumps({"keys": [jwk]}), encoding="utf-8")


def emitir_token(usuario: dict) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": usuario["AuthUserId"],
        "email": f"{usuario['Ci']}@papelblanquita.invalid",
        "aud": AUDIENCIA,
        "iss": EMISOR,
        "role": "authenticated",
        "iat": ahora,
        "exp": ahora + timedelta(hours=HORAS_VIGENCIA_TOKEN),
        "app_metadata": {
            "IdUsuario": usuario["IdUsuario"],
            "IdRol": usuario["IdRol"],
            "IsAdmin": usuario["IsAdmin"],
            "IdEstadoUsuario": 1,
        },
    }
    return jwt.encode(payload, llave_privada(), algorithm="ES256", headers={"kid": KID})


def guardar_usuarios(usuarios: list[dict]) -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    ARCHIVO_USUARIOS.write_text(json.dumps(usuarios, indent=2, ensure_ascii=False), encoding="utf-8")


def leer_usuarios() -> list[dict]:
    if not ARCHIVO_USUARIOS.exists():
        raise SystemExit(f"No existe {ARCHIVO_USUARIOS}, ejecute primero sembrar.py")
    return json.loads(ARCHIVO_USUARIOS.read_text(encoding="utf-8"))
