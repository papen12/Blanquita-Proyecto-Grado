from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class RodelaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    def InsertarRodelas(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "InsertarRodelas"(
                :p_IdProveedor,
                :p_IdTipoRodela,
                :p_IdUsuario,
                :p_Rodelas
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)

    def ObtenerTipoRodela(self) -> list[dict]:
        sql = """
            SELECT "IdTipoRodela", "NombreTipoRodela", "Descripcion"
            FROM "TipoRodela"
            ORDER BY "IdTipoRodela"
        """
        return self.caller.LlamarFuncion(sql, {})
