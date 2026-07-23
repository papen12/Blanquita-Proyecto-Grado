from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class BobinaServilletaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarBobinasServilleta(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarBobinasServilleta"(
                :p_IdProveedor,
                :p_IdTipoBobinaServilleta,
                :p_IdUsuario,
                :p_Bobinas
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)