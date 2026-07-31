from app.Repository.DbCaller import DbCaller
from sqlalchemy.orm import Session

class ProveedorRepository():
    def __init__(self,db:Session):
        self.caller=DbCaller(db)

    def ObtenerProveedorForm(self)-> list[dict]:
        sql="""
            select "IdProveedor","NombreProveedor" 
            from "Proveedor" where "IdEstadoProveedor"=1 
            order by "NombreProveedor"
        """
        return  self.caller.LlamarFuncion(sql, {})