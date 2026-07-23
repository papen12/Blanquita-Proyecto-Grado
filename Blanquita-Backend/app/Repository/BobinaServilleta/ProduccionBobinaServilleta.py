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