from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionPalletRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)
 
    def IniciarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "IniciarProduccionPalletTubo"(
                :p_IdPallet,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)