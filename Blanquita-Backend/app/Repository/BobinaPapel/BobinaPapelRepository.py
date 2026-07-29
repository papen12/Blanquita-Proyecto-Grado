from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class BobinaPapelRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarBobinasPapel(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarBobinasPapel"(
                :p_IdProveedor,
                :p_IdTipoBobina,
                :p_IdUsuario,
                :p_Bobinas
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ObtenerTipoBobinaPapel(self) -> list[dict]:
        sql = """
            SELECT "IdTipoBobina", "NombreTipoBobina"
            FROM "TipoBobina"
            ORDER BY "NombreTipoBobina"
        """
        return self.caller.LlamarFuncion(sql, {})