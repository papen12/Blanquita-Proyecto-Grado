from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class AuthRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ResolverCorreoPorCi(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ResolverCorreoPorCi"(p_Ci => :p_Ci)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)

    def ObtenerUsuarioPorId(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ObtenerUsuarioPorId"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params, commit=False)