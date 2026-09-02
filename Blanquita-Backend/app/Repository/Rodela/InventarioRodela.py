from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class InventarioRodelaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def VerResumenInventarioRodela(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioRodela"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioRodela(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioRodela"(
                :p_IdTipoRodela
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ListarRodelasEnAlmacen(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "ListarRodelasEnAlmacen"(
                :p_IdTipoRodela
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def TrasladarRodelaAProduccion(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "TrasladarRodelaAProduccion"(
                :p_IdRodela,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def CorregirTrasladoRodela(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "CorregirTrasladoRodela"(
                :p_IdRodela,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def DarDeBajaRodela(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "DarDeBajaRodela"(
                :p_IdRodela,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
