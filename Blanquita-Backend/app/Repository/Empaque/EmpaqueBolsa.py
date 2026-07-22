from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class EmpaqueBolsaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarEmpaqueBolsa(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "InsertarEmpaqueBolsa"(
                :p_IdProveedor,
                :p_IdUsuario,
                :p_CantidadToneladasPedida,
                :p_EmpaquesBolsa
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    def DescontarEmpaqueBolsa(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "DescontarEmpaqueBolsa"(
                :p_IdUsuario,
                :p_EmpaquesBolsa
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReingresarEmpaqueBolsaAInventario(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReingresarEmpaqueBolsaAInventario"(
                :p_IdUsuario,
                :p_IdTipoEmpaqueBolsa,
                :p_CantidadMovimiento,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
    def VerCatalogoEmpaqueBolsa(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerCatalogoEmpaqueBolsa"()
        """
        return self.caller.LlamarFuncion(sql)