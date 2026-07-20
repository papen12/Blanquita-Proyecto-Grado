from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class PalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarPallets(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarPallets"(
                :p_IdProveedor,
                :p_IdTipoPallet,
                :p_IdUsuario,
                :p_Pallets
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)