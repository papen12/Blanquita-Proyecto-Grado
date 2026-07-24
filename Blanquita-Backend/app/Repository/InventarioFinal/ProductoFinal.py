from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProductoFinalRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarIngresoProductoTerminado(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "InsertarIngresoProductoTerminado"(
                :p_IdUsuario,
                :p_Presentaciones
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def InsertarSalidaProductoTerminado(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "InsertarSalidaProductoTerminado"(
                :p_IdUsuario,
                :p_Presentaciones
            )
        """
        return self.caller.LlamarFuncion(sql, params)


    def AjustePositivoInventarioProductoTerminado(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "AjustePositivoInventarioProductoTerminado"(
                :p_IdPresentacion,
                :p_IdUsuario,
                :p_Cantidad,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def AjusteNegativoInventarioProductoTerminado(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "AjusteNegativoInventarioProductoTerminado"(
                :p_IdPresentacion,
                :p_IdUsuario,
                :p_Cantidad,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def VerInventarioProductoTerminado(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerInventarioProductoTerminado"(
                :p_IdProducto
            )
        """
        return self.caller.LlamarFuncion(sql, params)