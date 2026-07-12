from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class UsuarioRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def crear_usuario(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "CrearUsuario"(
                :p_IdRol,
                :p_IdEstadoUsuario,
                :p_Ci,
                :p_Clave,
                :p_PrimerNombre,
                :p_SegundoNombre,
                :p_ApellidoPaterno,
                :p_ApellidoMaterno
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def verificacion_usuario(self, ci: str) -> dict | None:
        sql = 'SELECT * FROM "VerificacionUsuario"(:p_ci)'
        return self.caller.LlamarUnRegistro(sql, {"p_ci": ci}, commit=False)