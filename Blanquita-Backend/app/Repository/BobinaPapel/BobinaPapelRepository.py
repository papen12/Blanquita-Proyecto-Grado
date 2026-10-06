from sqlalchemy import select
from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller
from app.Schemas.BobinaPapel import TipoBobina


class BobinaPapelRepository:
    def __init__(self, db: Session):
        self.db = db
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
        consulta = (
            select(TipoBobina.IdTipoBobina, TipoBobina.NombreTipoBobina)
            .order_by(TipoBobina.NombreTipoBobina)
        )
        return [dict(fila) for fila in self.db.execute(consulta).mappings()]

    def EditarBobinaPapel(self, params: dict) -> dict | None:
        sql = """
            SELECT * FROM "EditarBobinaPapel"(
                :p_IdBobinaPapel,
                :p_IdUsuario,
                :p_CodigoBobina,
                :p_PesoBrutoKg,
                :p_PesoNetoKg,
                :p_Gramaje,
                :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql, params)