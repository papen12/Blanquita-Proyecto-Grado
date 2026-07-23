from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller

class InventarioBobinaServilletaRepository:
    def __init__(self, db: Session):
            self.caller = DbCaller(db)

    def ReingresarSubBobinaAInventario(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "ReingresarSubBobinaAInventario"(
                :p_IdSubBobina,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def DarDeBajaSubBobina(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "DarDeBajaSubBobina"(
                :p_IdSubBobina,
                :p_IdUsuario,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def VerResumenInventarioBobinaServilleta(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioBobinaServilleta"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioBobinaServilleta"(
                :p_IdTipoBobinaServilleta
            )
        """
        return self.caller.LlamarFuncion(sql, params)


    def VerResumenInventarioSubBobinaServilleta(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioSubBobinaServilleta"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioSubBobinaServilleta(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioSubBobinaServilleta"(
                :p_IdTipoMedidaSubBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)