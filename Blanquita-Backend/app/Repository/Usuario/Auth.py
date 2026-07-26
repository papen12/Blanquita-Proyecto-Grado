from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class AuthRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ObtenerUsuarioPorId(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ObtenerUsuarioPorId"(p_IdUsuario => :p_IdUsuario)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def VerificacionUsuario(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "VerificacionUsuario"(p_ci => :p_ci)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def CrearRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "CrearRefreshToken"(
                p_IdUsuario => :p_IdUsuario,
                p_TokenHash => :p_TokenHash,
                p_FechaExpiracion => :p_FechaExpiracion,
                p_IpOrigen => :p_IpOrigen,
                p_UserAgent => :p_UserAgent
            ) AS "IdRefreshToken"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def ValidarRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT * FROM "ValidarRefreshToken"(p_TokenHash => :p_TokenHash)
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def RevocarRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "RevocarRefreshToken"(p_TokenHash => :p_TokenHash) AS "Revocado"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)

    def RevocarCadenaRefreshToken(self, params: dict) -> dict | None:
        consulta = '''
            SELECT "RevocarCadenaRefreshToken"(p_IdUsuario => :p_IdUsuario) AS "SesionesRevocadas"
        '''
        return self.caller.LlamarUnRegistro(consulta, params)