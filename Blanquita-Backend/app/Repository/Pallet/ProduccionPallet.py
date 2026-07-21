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
    

    

    def PausaProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "PausaProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario,
            :p_MotivoPausaProduccion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
    def ReanudarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "ReanudarProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)

    def FinalizarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "FinalizarProduccionPalletTubo"(
            :p_IdProduccionPalletTubo,
            :p_IdUsuario
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
    def CancelarProduccionPallet(self, params: dict) -> dict | None:
        sql = """
        SELECT * FROM "CancelarProduccionPalletTubo"(
            :p_id_produccion,
            :p_id_usuario,
            :p_motivo_cancelacion
        )
    """
        return self.caller.LlamarUnRegistro(sql, params)
    
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
    

    def VerProduccionPallet(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionPalletTubo"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    def VerPausasProduccionPalletActivas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerPausasProduccionPalletTuboActivas"(
                :p_IdTipoPallet
            )
        """
        return self.caller.LlamarFuncion(sql, params)
