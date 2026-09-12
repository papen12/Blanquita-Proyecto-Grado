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

    def VerProduccionesBobinaTubo(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionesBobinaTubo"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdTurno,
                CAST(:p_IdsTipoBobina AS integer[]),
                :p_CodigoBobina,
                :p_Operador,
                :p_IdEstadoProduccion
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteProduccionBobinaTuboDetalle(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteProduccionBobinaTuboDetalle"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ReportePausasProduccionBobinaTubo(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReportePausasProduccionBobinaTubo"(
                :p_IdProduccion,
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdTurno,
                :p_SoloAbiertas
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerLotesBobinaPapel(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerLotesBobinaPapel"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdProveedor,
                CAST(:p_IdsTipoBobina AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteLoteBobinaPapelDetalle(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteLoteBobinaPapelDetalle"(
                :p_IdLoteBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteCancelacionProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteCancelacionProduccionBobinaTubo"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def VerCancelacionesProduccionBobinaTubo(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerCancelacionesProduccionBobinaTubo"(
                :p_FechaInicio,
                :p_FechaFin
            )
        """
        return self.caller.LlamarFuncion(sql, params)
