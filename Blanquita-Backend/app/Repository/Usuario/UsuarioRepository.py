from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.Repository.DbCaller import DbCaller
from app.Schemas.Usuario import EstadoUsuario, Rol, Usuario


class UsuarioRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ListarUsuarios(self, params: dict) -> tuple[int, list[dict]]:
        consulta = (
            select(
                Usuario.IdUsuario,
                Usuario.Ci,
                Usuario.PrimerNombre,
                Usuario.SegundoNombre,
                Usuario.ApellidoPaterno,
                Usuario.ApellidoMaterno,
                Usuario.Celular,
                Usuario.FechaRegistro,
                Rol.IdRol,
                Rol.NombreRol,
                EstadoUsuario.IdEstadoUsuario,
                EstadoUsuario.NombreEstadoUsuario,
            )
            .join(Rol, Usuario.IdRol == Rol.IdRol)
            .join(EstadoUsuario, Usuario.IdEstadoUsuario == EstadoUsuario.IdEstadoUsuario)
        )

        if params.get("IdEstadoUsuario") is not None:
            consulta = consulta.where(Usuario.IdEstadoUsuario == params["IdEstadoUsuario"])

        if params.get("IdRol") is not None:
            consulta = consulta.where(Usuario.IdRol == params["IdRol"])

        busqueda = (params.get("Busqueda") or "").strip()
        if busqueda:
            nombre_completo = func.concat_ws(
                " ",
                Usuario.PrimerNombre,
                Usuario.SegundoNombre,
                Usuario.ApellidoPaterno,
                Usuario.ApellidoMaterno,
            )
            consulta = consulta.where(
                or_(
                    Usuario.Ci.ilike(f"%{busqueda}%"),
                    nombre_completo.ilike(f"%{busqueda}%"),
                )
            )

        total = self.caller.Consultar(
            select(func.count().label("Total")).select_from(consulta.subquery())
        )[0]["Total"]

        pagina = consulta.order_by(
            Usuario.ApellidoPaterno, Usuario.PrimerNombre, Usuario.IdUsuario
        ).limit(params["TamanoPagina"]).offset((params["Pagina"] - 1) * params["TamanoPagina"])

        return total, self.caller.Consultar(pagina)

    def VerificarAdmin(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "VerificarAdmin"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)

    def ObtenerPerfil(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ObtenerPerfil"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)

    def EditarPerfil(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "EditarPerfil"(
                p_IdUsuario       => :p_IdUsuario,
                p_PrimerNombre    => :p_PrimerNombre,
                p_ApellidoPaterno => :p_ApellidoPaterno,
                p_SegundoNombre   => :p_SegundoNombre,
                p_ApellidoMaterno => :p_ApellidoMaterno,
                p_Celular         => :p_Celular
            )
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def CrearUsuario(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "CrearUsuario"(
                p_AuthUserId      => :p_AuthUserId,
                p_IdRol           => :p_IdRol,
                p_Ci              => :p_Ci,
                p_PrimerNombre    => :p_PrimerNombre,
                p_ApellidoPaterno => :p_ApellidoPaterno,
                p_Celular         => :p_Celular,
                p_SegundoNombre   => :p_SegundoNombre,
                p_ApellidoMaterno => :p_ApellidoMaterno,
                p_IsAdmin         => :p_IsAdmin
            )
        '''
        return self.caller.LlamarUnRegistro(consulta, params)