from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionBobinaServilletaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def AbrirBobinaServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "AbrirBobinaServilleta"(
                :p_IdBobinaServilleta,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def IniciarProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "IniciarProduccionServilleta"(
                :p_IdSubBobina,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def PausaProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "PausaProduccionServilleta"(
                :p_IdProduccionServilleta,
                :p_IdUsuario,
                :p_MotivoPausaProduccion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ReanudarProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReanudarProduccionServilleta"(
                :p_IdProduccionServilleta,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def FinalizarProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "FinalizarProduccionServilleta"(
                :p_IdProduccionServilleta,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def CancelarProduccionServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "CancelarProduccionServilleta"(
                :p_id_produccion,
                :p_id_usuario,
                :p_motivo_cancelacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)


    def VerProduccionServilletaActivas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionServilletaActivas"(
                :p_IdTipoMedidaSubBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerPausasProduccionServilletaActivas(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerPausasProduccionServilletaActivas"()
        """
        return self.caller.LlamarFuncion(sql)