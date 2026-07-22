from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionBobinaPapelRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def IniciarProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "IniciarProduccionBobinaTubo"(
                :p_IdBobina1,
                :p_IdBobina2,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def PausaProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "FnPausarProduccionBobinaTubo"(
                :p_IdProduccionBobinaTubo,
                :p_IdUsuario,
                :p_MotivoPausaProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ReanudarProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReanudarProduccionBobinaTubo"(
                :p_IdProduccionBobinaTubo,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def FinalizarProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "FinalizarProduccionBobinaTubo"(
                :p_IdProduccionBobinaTubo,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def CancelarProduccionBobinaTubo(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "CancelarProduccionBobinaTubo"(
                :p_id_produccion,
                :p_id_usuario,
                :p_motivo_cancelacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def InsertarMovimientoOperadorLogs(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarMovimientoOperadorLogs"(
                :p_IdProduccionBobinaTubo,
                :p_IdTipoMovimientoOperadorLogs,
                :p_IdUsuario,
                :p_CantidadLogs,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def VerProduccionBobinaTubo(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionBobinaTubo"(
                :p_IdTipoBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerPausasProduccionBobinaTuboActivas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerPausasProduccionBobinaTuboActivas"(
                :p_FiltroIdTipoBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)