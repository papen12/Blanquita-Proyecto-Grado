from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class InventarioBobinaPapelRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def VerResumen(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioBobinaPapel"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalle(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioBobinaPapel"(
                :p_IdTipoBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReingresarBobinaInventario(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReingresarBobinaAInventario"(
                :p_IdBobinaPapel,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def DarDeBajaBobina(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "DarDeBajaBobina"(
                :p_IdBobinaPapel,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def VerBobinasFueraInventario(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerBobinasPapelFueraInventario"()
        """
        return self.caller.LlamarFuncion(sql, {})