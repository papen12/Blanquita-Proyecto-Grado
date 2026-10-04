from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ReporteProductoTerminadoRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def ReporteProduccionDiaria(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteProduccionDiariaProductoTerminado"(
                :p_FechaInicio,
                :p_FechaFin,
                CAST(:p_IdsProducto AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteMovimientosProduccion(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteMovimientosProduccionProductoTerminado"(
                :p_FechaInicio,
                :p_FechaFin,
                CAST(:p_IdsProducto AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReporteInventario(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ReporteInventarioProductoTerminado"(
                CAST(:p_IdsProducto AS integer[])
            )
        """
        return self.caller.LlamarFuncion(sql, params)
