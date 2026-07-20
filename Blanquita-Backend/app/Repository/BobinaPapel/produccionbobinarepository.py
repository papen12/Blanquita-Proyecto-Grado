from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class ProduccionBobinaTuboRepository:
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
    
    def FinalizarProduccion(self,params:dict)->dict:
        sql="""
            Select * from "FinalizarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario 
            )
            """
        return self.caller.LlamarUnRegistro(sql,params)
    def PausarProduccion(self,params:dict)->dict:
        sql="""
            select * from "FnPausarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario,
            :p_MotivoPausaProduccion 
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def RenudarProduccion(self,params:dict)->dict:
        sql="""
            select * from "ReanudarProduccionBobinaTubo"(
            :p_IdProduccionBobinaTubo,
            :p_IdUsuario
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def CancelarProduccion(self,params:dict)->dict:
        sql="""
            select * from "CancelarProduccionBobinaTubo"(
            :p_id_produccion,
            :p_id_usuario,
            :p_motivo_cancelacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    
    def ReingresarBobina(self,params:dict)->dict:
        sql="""
            select * from "ReingresarBobinaAInventario"(
            :p_IdBobinaPapel,
            :p_IdUsuario,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def DarDeBajaBobina(self,params:dict)->dict:
        sql="""
            select * from "DarDeBajaBobina"(
            :p_IdBobinaPapel,
            :p_IdUsuario,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    
    def InsertarMovimientoOperadorLogs(self,params:dict)->dict:
        sql="""
            select * from "InsertarMovimientoOperadorLogs"(
            :p_IdProduccionBobinaTubo,
            :p_IdTipoMovimientoOperadorLogs,
            :p_IdUsuario,
            :p_CantidadLogs,
            :p_Observacion
            )
        """
        return self.caller.LlamarUnRegistro(sql,params)
    def VerProduccionBobinaTubo(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerProduccionBobinaTubo"(
                :p_IdTipoBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)
    

    def VerPausasActivas(self, params: dict) -> list[dict]:
        sql = """
            SELECT * FROM "VerPausasProduccionBobinaTuboActivas"(
                :p_FiltroIdTipoBobina
            )
        """
        return self.caller.LlamarFuncion(sql, params)


    def VerBobinasFueraInventario(self) -> list[dict]:
        sql = """
            SELECT * FROM "VerBobinasPapelFueraInventario"()
        """
        return self.caller.LlamarFuncion(sql, {})