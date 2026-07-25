import secrets
import hashlib
import os
from datetime import datetime, timedelta, timezone

REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))
REFRESH_TOKEN_MAX_AGE_SEGUNDOS = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def GenerarRefreshTokenCrudo() -> str:
    return secrets.token_urlsafe(64)


def HashRefreshToken(token_crudo: str) -> str:
    return hashlib.sha256(token_crudo.encode("utf-8")).hexdigest()


def CalcularExpiracionRefreshToken() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)