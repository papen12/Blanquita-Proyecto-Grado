from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class InventarioPalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def VerResumenInventarioPallet(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioPallet"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioPallet(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioPallet"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ReingresarPalletInventario(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "ReingresarPalletAInventario"(
            :p_IdPallet,
            :p_IdUsuario,
            :p_Observacion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)

    def DarDeBajaPallet(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "DarDeBajaPallet"(
                :p_IdPallet,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)
    def VerPalletsFueraInventario(self) -> list[dict]:
            sql = """
                SELECT * FROM "VerPalletsFueraInventario"()
            """
            return self.caller.LlamarFuncion(sql)
