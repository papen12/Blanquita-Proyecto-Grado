from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ReporteRodelaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def VerRodelas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerRodelas"(
                :p_CodigoRodela,
                :p_IdProveedor,
                CAST(:p_IdsTipoRodela AS integer[]),
                :p_IdEstadoMateriaPrima,
                :p_IdRodela,
                :p_IdLoteRodela
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteInventario(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteInventarioRodela"(
                CAST(:p_IdsTipoRodela AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteHistorialMovimientosRodela(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteHistorialMovimientosRodela"(
                :p_IdRodela
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerLotesRodela(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerLotesRodela"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdProveedor,
                CAST(:p_IdsTipoRodela AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteLoteRodelaDetalle(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteLoteRodelaDetalle"(
                :p_IdLoteRodela
            )
        """
        return self.caller.LlamarFuncion(sql, params)
