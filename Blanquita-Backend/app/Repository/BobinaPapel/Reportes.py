from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ReporteBobinaPapelRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ReporteInventario(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteInventarioBobinaPapel"(
                CAST(:p_IdsTipoBobina AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)
