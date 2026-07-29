#!/usr/bin/env python3
"""
probar_auth.py — Verificación end-to-end de Supabase Auth para Papel Blanquita.

Comprueba tres cosas:
  1. Que el usuario se crea correctamente en auth.users (con su fila en auth.identities).
  2. Que el access token se firma con ES256 y se verifica localmente contra el JWKS.
  3. Que el hook custom_access_token_hook inyecta IdUsuario, IdRol, Ci e IdEstadoUsuario.

Además valida la rotación de refresh tokens, que es la razón principal de la migración.

Uso:
    python probar_auth.py crear      # crea la cuenta en Auth e imprime el INSERT
    python probar_auth.py probar     # login + verificación de token + refresh

Dependencias:
    pip install httpx "pyjwt[crypto]"
"""

import argparse
import os
import sys
from pathlib import Path

import httpx
import jwt
from dotenv import load_dotenv
from jwt import PyJWKClient

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------
# La service_role key NUNCA va hardcodeada ni llega al frontend.
#   PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY = "..."
#   bash:        export SUPABASE_SERVICE_ROLE_KEY="..."

RUTA_ENV = Path(__file__).resolve().parent / ".env"
if not load_dotenv(RUTA_ENV):
    print(f"Aviso: no se encontró .env en {RUTA_ENV}")

SUPABASE_URL = os.environ.get(
    "SUPABASE_URL", "https://pyvimfqomqjdvopzsmts.supabase.co"
).rstrip("/")

SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
PUBLISHABLE_KEY = os.environ.get("SUPABASE_PUBLISHABLE_KEY")

# Datos del usuario de prueba
CORREO = os.environ.get("USUARIO_CORREO", "papenfabri3.0@gmail.com")
PASSWORD = os.environ.get("USUARIO_PASSWORD", "F67603009mG/")
CI = os.environ.get("USUARIO_CI", "10369743")
PRIMER_NOMBRE = "Papen"
APELLIDO_PATERNO = "Papen"
ID_ROL = 1  # 2 = Líder de Inventario y Producción
ID_ESTADO_USUARIO = 1  # 1 = Activo

# Parámetros de verificación — los mismos que irán en core/auth.py
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
ISSUER = f"{SUPABASE_URL}/auth/v1"
AUDIENCE = "authenticated"
ALGORITMOS = ["ES256"]  # solo ES256: evita ataques de confusión de algoritmo

CLAIMS_REQUERIDOS = ("IdUsuario", "IdRol", "Ci", "IdEstadoUsuario")

_jwk_client = PyJWKClient(JWKS_URL, cache_keys=True, lifespan=600)


# ---------------------------------------------------------------------------
# Utilidades de salida
# ---------------------------------------------------------------------------
def ok(mensaje: str) -> None:
    print(f"  [OK]    {mensaje}")


def fallo(mensaje: str) -> None:
    print(f"  [FALLO] {mensaje}")


def info(mensaje: str) -> None:
    print(f"  ->      {mensaje}")


def titulo(mensaje: str) -> None:
    print(f"\n{mensaje}\n{'-' * len(mensaje)}")


def recortar(token: str) -> str:
    """Nunca imprimimos un token completo en consola."""
    return f"{token[:18]}...{token[-8:]}" if len(token) > 30 else "<corto>"


def exigir(variable: str | None, nombre: str) -> str:
    if not variable:
        print(f"Falta la variable de entorno {nombre}.")
        sys.exit(1)
    return variable


# ---------------------------------------------------------------------------
# Paso 1 — Crear la cuenta en Auth
# ---------------------------------------------------------------------------
def crear_usuario() -> None:
    clave = exigir(SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")

    titulo("Creando cuenta en auth.users")

    respuesta = httpx.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers={
            "apikey": clave,
            "Authorization": f"Bearer {clave}",
            "Content-Type": "application/json",
        },
        json={
            "email": CORREO,
            "password": PASSWORD,
            # Indispensable: con correo sintético nunca llegará la confirmación.
            "email_confirm": True,
        },
        timeout=30,
    )

    if respuesta.status_code >= 400:
        detalle = respuesta.text
        if "already" in detalle.lower() or "registered" in detalle.lower():
            fallo("El correo ya existe en auth.users.")
            info("Bórralo primero:  DELETE FROM auth.users WHERE email = "
                 f"'{CORREO}';")
        else:
            fallo(f"HTTP {respuesta.status_code}: {detalle}")
        sys.exit(1)

    auth_user_id = respuesta.json()["id"]
    ok(f"Cuenta creada. AuthUserId = {auth_user_id}")

    titulo("Pega esto en el SQL Editor")
    print(f"""
INSERT INTO "Usuario" (
    "AuthUserId", "IdRol", "IdEstadoUsuario",
    "Ci", "PrimerNombre", "ApellidoPaterno", "Celular"
) VALUES (
    '{auth_user_id}', {ID_ROL}, {ID_ESTADO_USUARIO},
    '{CI}', '{PRIMER_NOMBRE}', '{APELLIDO_PATERNO}', NULL
);
""")
    info("Luego corre:  python probar_auth.py probar")


# ---------------------------------------------------------------------------
# Paso 2 — Login y refresh contra GoTrue
# ---------------------------------------------------------------------------
def iniciar_sesion() -> dict:
    clave = exigir(PUBLISHABLE_KEY, "SUPABASE_PUBLISHABLE_KEY")

    respuesta = httpx.post(
        f"{SUPABASE_URL}/auth/v1/token",
        params={"grant_type": "password"},
        headers={"apikey": clave, "Content-Type": "application/json"},
        json={"email": CORREO, "password": PASSWORD},
        timeout=30,
    )
    if respuesta.status_code >= 400:
        fallo(f"Login rechazado — HTTP {respuesta.status_code}: {respuesta.text}")
        sys.exit(1)
    return respuesta.json()


def refrescar_sesion(refresh_token: str) -> dict:
    clave = exigir(PUBLISHABLE_KEY, "SUPABASE_PUBLISHABLE_KEY")

    respuesta = httpx.post(
        f"{SUPABASE_URL}/auth/v1/token",
        params={"grant_type": "refresh_token"},
        headers={"apikey": clave, "Content-Type": "application/json"},
        json={"refresh_token": refresh_token},
        timeout=30,
    )
    if respuesta.status_code >= 400:
        fallo(f"Refresh rechazado — HTTP {respuesta.status_code}: {respuesta.text}")
        sys.exit(1)
    return respuesta.json()


# ---------------------------------------------------------------------------
# Paso 3 — Verificación local del token (esto es lo que irá en core/auth.py)
# ---------------------------------------------------------------------------
def verificar_token(token: str) -> dict:
    """Verifica firma, emisor y audiencia contra el JWKS. Devuelve el payload."""
    llave = _jwk_client.get_signing_key_from_jwt(token).key
    return jwt.decode(
        token,
        llave,
        algorithms=ALGORITMOS,
        audience=AUDIENCE,
        issuer=ISSUER,
        options={"require": ["exp", "sub", "aud"]},
    )


def extraer_usuario_actual(payload: dict) -> dict:
    """Equivalente al retorno de obtener_usuario_actual() en FastAPI."""
    metadata = payload.get("app_metadata", {})
    return {
        "IdUsuario": metadata.get("IdUsuario"),
        "IdRol": metadata.get("IdRol"),
        "Ci": metadata.get("Ci"),
        "IdEstadoUsuario": metadata.get("IdEstadoUsuario"),
        "AuthUserId": payload.get("sub"),
        "Correo": payload.get("email"),
    }


# ---------------------------------------------------------------------------
# Suite de comprobaciones
# ---------------------------------------------------------------------------
def probar() -> None:
    errores = 0

    # --- Login ---------------------------------------------------------
    titulo("1. Login contra GoTrue")
    sesion = iniciar_sesion()
    access_token = sesion["access_token"]
    refresh_token = sesion["refresh_token"]
    ok(f"Sesión obtenida. access_token = {recortar(access_token)}")
    info(f"expires_in = {sesion.get('expires_in')} s")

    # --- Header --------------------------------------------------------
    titulo("2. Header del token")
    header = jwt.get_unverified_header(access_token)
    info(f"alg = {header.get('alg')}   kid = {header.get('kid')}")

    if header.get("alg") == "ES256":
        ok("Firmado con ES256 (asimétrico).")
    else:
        fallo(f"Se esperaba ES256 y llegó {header.get('alg')}. "
              "Falta rotar a la llave asimétrica.")
        errores += 1

    kids_publicados = {
        k["kid"] for k in httpx.get(JWKS_URL, timeout=15).json().get("keys", [])
    }
    if header.get("kid") in kids_publicados:
        ok("El kid del token está publicado en el JWKS.")
    else:
        fallo("El kid del token no aparece en el JWKS.")
        errores += 1

    # --- Firma ---------------------------------------------------------
    titulo("3. Verificación local de la firma")
    try:
        payload = verificar_token(access_token)
        ok("Firma, emisor y audiencia válidos (sin llamar al servidor de Auth).")
    except jwt.PyJWTError as error:
        fallo(f"Verificación fallida: {type(error).__name__} — {error}")
        sys.exit(1)

    # --- Claims del hook -----------------------------------------------
    titulo("4. Claims inyectados por el hook")
    metadata = payload.get("app_metadata", {})

    for claim in CLAIMS_REQUERIDOS:
        if claim in metadata:
            ok(f"{claim} = {metadata[claim]!r}")
        else:
            fallo(f"{claim} ausente en app_metadata.")
            errores += 1

    if metadata.get("IdUsuario") is None and metadata.get("IdEstadoUsuario") == 1:
        fallo("IdEstadoUsuario es 1 pero no llegó IdUsuario. "
              "Revisa que AuthUserId esté vinculado en la tabla Usuario.")
        errores += 1

    titulo("5. usuario_actual tal como lo verá FastAPI")
    for llave, valor in extraer_usuario_actual(payload).items():
        print(f"  {llave:<16} = {valor!r}")

    # --- Rotación de refresh -------------------------------------------
    titulo("6. Rotación de refresh token")
    nueva_sesion = refrescar_sesion(refresh_token)
    nuevo_refresh = nueva_sesion["refresh_token"]

    if nuevo_refresh != refresh_token:
        ok("El refresh token rotó (el anterior queda invalidado).")
    else:
        fallo("El refresh token no rotó.")
        errores += 1

    try:
        verificar_token(nueva_sesion["access_token"])
        ok("El access token renovado también verifica correctamente.")
    except jwt.PyJWTError as error:
        fallo(f"El token renovado no verifica: {error}")
        errores += 1

    # --- Detección de reuso --------------------------------------------
    titulo("7. Detección de reuso del refresh token")
    info("Reintentando con el refresh token ya consumido...")
    respuesta = httpx.post(
        f"{SUPABASE_URL}/auth/v1/token",
        params={"grant_type": "refresh_token"},
        headers={"apikey": PUBLISHABLE_KEY, "Content-Type": "application/json"},
        json={"refresh_token": refresh_token},
        timeout=30,
    )
    if respuesta.status_code >= 400:
        ok(f"Rechazado con HTTP {respuesta.status_code}, como debe ser.")
    else:
        info("Aceptado: cae dentro de la ventana de gracia por reintentos de red. "
             "No es un error.")

    titulo("Resumen")
    if errores == 0:
        print("  Todo correcto. El hook y la verificación funcionan de punta a punta.")
        print("  Siguiente paso: llevar verificar_token() a core/auth.py.")
    else:
        print(f"  {errores} comprobación(es) fallida(s). Revisa el detalle arriba.")
        sys.exit(1)


def main() -> None:
    parser = argparse.ArgumentParser(description="Verificación de Supabase Auth.")
    parser.add_argument("comando", choices=["crear", "probar"])
    argumentos = parser.parse_args()

    print(f"Proyecto: {SUPABASE_URL}")

    if argumentos.comando == "crear":
        crear_usuario()
    else:
        probar()


if __name__ == "__main__":
    main()