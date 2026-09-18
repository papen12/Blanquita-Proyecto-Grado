from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ReporteBobinaServilletaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ReporteInventario(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteInventarioBobinaServilleta"(
                CAST(:p_IdsTipoBobinaServilleta AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerBobinasServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerBobinasServilleta"(
                :p_CodigoBobina,
                :p_IdProveedor,
                :p_IdTipoBobinaServilleta,
                :p_IdEstadoMateriaPrima,
                :p_IdBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerResumenSubBobinas(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioSubBobinaServilleta"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerSubBobinasServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerSubBobinasServilleta"(
                :p_CodigoBobina,
                :p_IdProveedor,
                :p_IdTipoBobinaServilleta,
                CAST(:p_IdsTipoMedidaSubBobina AS integer[]),
                :p_IdEstadoMateriaPrima,
                :p_IdBobinaServilleta,
                :p_IdSubBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteHistorialMovimientosUnidadServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteHistorialMovimientosUnidadServilleta"(
                :p_IdUnidadBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteDetalleBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteDetalleBobinaServilleta"(
                :p_IdBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerLotesBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerLotesBobinaServilleta"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdProveedor,
                CAST(:p_IdsTipoBobinaServilleta AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteLoteBobinaServilletaDetalle(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteLoteBobinaServilletaDetalle"(
                :p_IdLoteBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerProduccionesServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionesServilleta"(
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdTurno,
                CAST(:p_IdsTipoBobinaServilleta AS integer[]),
                :p_CodigoBobina,
                :p_Operador,
                :p_IdEstadoProduccion
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteProduccionServilletaDetalle(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteProduccionServilletaDetalle"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ReportePausasProduccionServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReportePausasProduccionServilleta"(
                :p_IdProduccion,
                :p_FechaInicio,
                :p_FechaFin,
                :p_IdTurno,
                :p_SoloAbiertas
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerCancelacionesProduccionServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerCancelacionesProduccionServilleta"(
                :p_FechaInicio,
                :p_FechaFin
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteCancelacionProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReporteCancelacionProduccionServilleta"(
                :p_IdProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
