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
