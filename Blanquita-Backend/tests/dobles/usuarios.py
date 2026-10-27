from datetime import datetime, timezone
from uuid import UUID

import httpx

from app.Constants.Estados import ESTADO_USUARIO_ACTIVO
from app.Constants.Roles import ROL_GERENTE_GENERAL, ROL_LIDER_INVENTARIO_PRODUCCION, ROL_OPERADOR
from app.Schemas.Usuario import Usuario

ID_ADMIN = 2
AUTH_USER_ID = "3f1c2a9e-5b7d-4e8f-9a0b-1c2d3e4f5a6b"
FECHA_REGISTRO = datetime(2026, 10, 1, 12, 0, tzinfo=timezone.utc)

ROLES = {
    ROL_OPERADOR: {"IdRol": ROL_OPERADOR, "NombreRol": "Operador"},
    ROL_LIDER_INVENTARIO_PRODUCCION: {"IdRol": ROL_LIDER_INVENTARIO_PRODUCCION, "NombreRol": "Líder de Inventario y Producción"},
    ROL_GERENTE_GENERAL: {"IdRol": ROL_GERENTE_GENERAL, "NombreRol": "Gerente General"},
}

ESTADOS = {1: "Activo", 2: "Inactivo", 3: "Suspendido"}


def crear_usuario(
    id_usuario: int = 7,
    id_rol: int = ROL_OPERADOR,
    id_estado: int = ESTADO_USUARIO_ACTIVO,
    es_admin: bool = False,
    ci: str = "7654321",
    celular: str | None = "71234567",
) -> Usuario:
    return Usuario(
        IdUsuario=id_usuario,
        AuthUserId=UUID(AUTH_USER_ID),
        IdRol=id_rol,
        IdEstadoUsuario=id_estado,
        Ci=ci,
        PrimerNombre="Juan",
        SegundoNombre=None,
        ApellidoPaterno="Mamani",
        ApellidoMaterno="Quispe",
        Celular=celular,
        IsAdmin=es_admin,
        FechaRegistro=FECHA_REGISTRO,
    )


def respuesta_auth(codigo: int, cuerpo: dict | None = None) -> httpx.Response:
    return httpx.Response(codigo, json=cuerpo or {}, request=httpx.Request("POST", "https://supabase-de-prueba.invalid"))
