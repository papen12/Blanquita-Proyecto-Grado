"""
Prueba de punta a punta del panel de usuarios contra la base y Supabase Auth reales.

Crea un usuario de prueba y ejecuta, con los servicios del backend:
  1. Crear usuario          -> HistorialAdmin
  2. Listar usuarios        (búsqueda por CI)
  3. Cambio de estado       Activo -> Inactivo -> Activo, y reglas inválidas
  4. Restablecer clave      -> HistorialAdmin, y login con la clave nueva
  5. Suspensión definitiva  -> HistorialAdmin, y login rechazado

El usuario de prueba queda Suspendido al final (no se borra).
Las claves se generan al azar y no se muestran.

Uso (desde Blanquita-Backend):
    .venv\\Scripts\\python.exe scripts\\probar_admin_usuarios.py --admin 4
"""

import argparse
import secrets
import string
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import HTTPException  # noqa: E402
from sqlalchemy import select  # noqa: E402

from app.Config.supabase import SessionLocal  # noqa: E402
from app.Constants.Estados import (  # noqa: E402
    ESTADO_USUARIO_ACTIVO,
    ESTADO_USUARIO_INACTIVO,
    ESTADO_USUARIO_SUSPENDIDO,
)
from app.Models.Usuario.Usuario import (  # noqa: E402
    CambiarEstadoUsuarioRequest,
    ListarUsuariosRequest,
    RestablecerClaveRequest,
    UsuarioCreate,
)
from app.Schemas.HistorialAdmin import HistorialAdmin  # noqa: E402
from app.Services.Usuario.Auth import AuthService  # noqa: E402
from app.Services.Usuario.UsuarioService import UsuarioService  # noqa: E402

ROL_OPERADOR = 1


def clave_aleatoria() -> str:
    simbolos = "#$%&*!"
    partes = [
        secrets.choice(string.ascii_uppercase),
        secrets.choice(string.ascii_lowercase),
        secrets.choice(string.digits),
        secrets.choice(simbolos),
    ]
    partes += [secrets.choice(string.ascii_letters + string.digits) for _ in range(6)]
    secrets.SystemRandom().shuffle(partes)
    return "".join(partes)


resultados: list[tuple[bool, str]] = []


def verificar(condicion: bool, descripcion: str) -> None:
    resultados.append((condicion, descripcion))
    print(f"  [{'OK' if condicion else 'FALLA'}] {descripcion}")


def espera_error(funcion, codigo: int, descripcion: str) -> None:
    try:
        funcion()
        verificar(False, f"{descripcion} (no dio error)")
    except HTTPException as e:
        verificar(e.status_code == codigo, f"{descripcion} -> {e.status_code} {e.detail}")


def historial_de(db, ci: str) -> list[str]:
    db.expire_all()
    filas = db.scalars(
        select(HistorialAdmin)
        .where(HistorialAdmin.Observacion.contains(f"CI {ci}"))
        .order_by(HistorialAdmin.IdHistorialAdmin)
    ).all()
    return [f.Observacion for f in filas]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--admin", type=int, required=True, help="IdUsuario de un administrador activo")
    args = parser.parse_args()

    ci = "99" + "".join(secrets.choice(string.digits) for _ in range(6))
    clave_inicial = clave_aleatoria()
    clave_nueva = clave_aleatoria()

    db = SessionLocal()
    servicio = UsuarioService(db)
    auth = AuthService(db)

    try:
        print(f"\n1. Crear usuario de prueba (CI {ci})")
        creado = servicio.CrearUsuario(
            UsuarioCreate(
                IdRol=ROL_OPERADOR,
                Ci=ci,
                PrimerNombre="Prueba",
                ApellidoPaterno="Sistema",
                Celular="70000000",
                Clave=clave_inicial,
            ),
            id_admin=args.admin,
        )
        id_usuario = creado.IdUsuario
        verificar(creado.IdEstadoUsuario == ESTADO_USUARIO_ACTIVO, f"creado IdUsuario={id_usuario}, Activo")
        verificar(any(o.startswith("Crear usuario") for o in historial_de(db, ci)), "historial: Crear usuario")
        espera_error(
            lambda: servicio.CrearUsuario(
                UsuarioCreate(IdRol=ROL_OPERADOR, Ci=ci, PrimerNombre="Prueba",
                              ApellidoPaterno="Sistema", Celular="70000000", Clave=clave_inicial),
                id_admin=args.admin,
            ),
            409, "CI repetido",
        )

        print("\n2. Listar usuarios")
        lista = servicio.ListarUsuarios(ListarUsuariosRequest(Busqueda=ci))
        verificar(lista.Total == 1 and lista.Usuarios[0].IdUsuario == id_usuario, "búsqueda por CI encuentra al usuario")

        print("\n3. Cambio de estado")
        motivo = "Prueba automatica del panel"
        r = servicio.CambiarEstadoUsuario(
            CambiarEstadoUsuarioRequest(IdUsuario=id_usuario, IdEstadoUsuario=ESTADO_USUARIO_INACTIVO, Motivo=motivo),
            args.admin,
        )
        verificar(r.NombreEstadoUsuario == "Inactivo", "Activo -> Inactivo")
        espera_error(lambda: auth.Login(ci, clave_inicial, None, None), 403, "login con usuario Inactivo")
        r = servicio.CambiarEstadoUsuario(
            CambiarEstadoUsuarioRequest(IdUsuario=id_usuario, IdEstadoUsuario=ESTADO_USUARIO_ACTIVO, Motivo=motivo),
            args.admin,
        )
        verificar(r.NombreEstadoUsuario == "Activo", "Inactivo -> Activo")
        espera_error(
            lambda: servicio.CambiarEstadoUsuario(
                CambiarEstadoUsuarioRequest(IdUsuario=args.admin, IdEstadoUsuario=ESTADO_USUARIO_INACTIVO, Motivo=motivo),
                args.admin,
            ),
            409, "admin cambiando su propio estado",
        )

        print("\n4. Restablecer clave")
        servicio.RestablecerClave(RestablecerClaveRequest(IdUsuario=id_usuario, ClaveNueva=clave_nueva), args.admin)
        verificar(True, "clave restablecida en Supabase Auth")
        espera_error(lambda: auth.Login(ci, clave_inicial, None, None), 401, "login con la clave anterior")
        sesion = auth.Login(ci, clave_nueva, None, None)
        verificar(bool(sesion.get("AccessToken")), "login con la clave nueva")

        print("\n5. Suspensión definitiva")
        r = servicio.CambiarEstadoUsuario(
            CambiarEstadoUsuarioRequest(IdUsuario=id_usuario, IdEstadoUsuario=ESTADO_USUARIO_SUSPENDIDO, Motivo=motivo),
            args.admin,
        )
        verificar(r.NombreEstadoUsuario == "Suspendido", "Activo -> Suspendido")
        espera_error(
            lambda: servicio.CambiarEstadoUsuario(
                CambiarEstadoUsuarioRequest(IdUsuario=id_usuario, IdEstadoUsuario=ESTADO_USUARIO_ACTIVO, Motivo=motivo),
                args.admin,
            ),
            409, "Suspendido -> Activo",
        )
        espera_error(
            lambda: servicio.RestablecerClave(RestablecerClaveRequest(IdUsuario=id_usuario, ClaveNueva=clave_aleatoria()), args.admin),
            409, "restablecer clave de un Suspendido",
        )
        espera_error(lambda: auth.Login(ci, clave_nueva, None, None), 403, "login con usuario Suspendido")

        print("\nHistorialAdmin del usuario de prueba:")
        for observacion in historial_de(db, ci):
            print("  -", observacion)
    finally:
        db.close()

    fallas = [d for ok, d in resultados if not ok]
    print(f"\n{len(resultados) - len(fallas)}/{len(resultados)} verificaciones correctas")
    return 1 if fallas else 0


if __name__ == "__main__":
    sys.exit(main())
