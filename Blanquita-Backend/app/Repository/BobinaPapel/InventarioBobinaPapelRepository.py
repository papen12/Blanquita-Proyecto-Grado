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