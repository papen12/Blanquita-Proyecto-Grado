from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class LoteBobinaPapelRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def insertar_bobinas_papel(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarBobinasPapel"(
                :p_IdProveedor,
                :p_IdTipoBobina,
                :p_IdUsuario,
                :p_Bobinas
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    