from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import jwt
from cryptography.hazmat.primitives.asymmetric import ec

from app.Auth.Jwt import AUDIENCE, ISSUER


class JwkClientStub:
    def __init__(self, llave_publica):
        self.llave_publica = llave_publica

    def get_signing_key_from_jwt(self, token: str):
        jwt.get_unverified_header(token)
        return SimpleNamespace(key=self.llave_publica)


class FabricaTokens:
    def __init__(self):
        self.llave = ec.generate_private_key(ec.SECP256R1())
        self.llave_ajena = ec.generate_private_key(ec.SECP256R1())

    @property
    def llave_publica(self):
        return self.llave.public_key()

    def crear(
        self,
        id_usuario: int | None = 7,
        id_rol: int | None = 1,
        id_estado: int = 1,
        es_admin: bool | None = None,
        expira_en: timedelta = timedelta(minutes=15),
        llave=None,
        algoritmo: str = "ES256",
        **cambios,
    ) -> str:
        metadata = {"IdEstadoUsuario": id_estado}
        if id_usuario is not None:
            metadata["IdUsuario"] = id_usuario
        if id_rol is not None:
            metadata["IdRol"] = id_rol
        if es_admin is not None:
            metadata["IsAdmin"] = es_admin
        ahora = datetime.now(timezone.utc)
        payload = {
            "sub": "00000000-0000-0000-0000-000000000007",
            "email": "1234567@papelblanquita.invalid",
            "aud": AUDIENCE,
            "iss": ISSUER,
            "iat": ahora,
            "exp": ahora + expira_en,
            "app_metadata": metadata,
            **cambios,
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        return jwt.encode(payload, llave or self.llave, algorithm=algoritmo)
