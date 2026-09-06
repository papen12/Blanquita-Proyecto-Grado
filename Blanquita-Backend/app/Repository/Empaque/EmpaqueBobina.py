from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class EmpaqueBobinaRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)
        
    def InsertarEmpaques(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "InsertarEmpaques"(
                :p_IdProveedor,
                :p_IdUsuario,
                :p_CantidadToneladasPedida,
                :p_Empaques
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    
    def TrasladarEmpaquesAProduccion(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "TrasladarEmpaquesAProduccion"(
                :p_IdsEmpaque,
                :p_IdUsuario
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def VerResumenInventarioEmpaque(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerResumenInventarioEmpaque"()
        """
        return self.caller.LlamarFuncion(sql)

    def VerDetalleInventarioEmpaque(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerDetalleInventarioEmpaque"(
                :p_IdTipoEmpaque
            )
        """
        return self.caller.LlamarFuncion(sql, params)

    def ObtenerTipoEmpaque(self) -> list[dict]:
        sql = """
            SELECT * FROM "TipoEmpaque"
            ORDER BY "IdTipoEmpaque"
        """
        return self.caller.LlamarFuncion(sql, {})