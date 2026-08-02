from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class UsuarioRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

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
                p_ApellidoMaterno => :p_ApellidoMaterno
            )
        '''
        return self.caller.LlamarUnRegistro(consulta, params)