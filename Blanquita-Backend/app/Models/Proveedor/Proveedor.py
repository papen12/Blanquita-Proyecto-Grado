from pydantic import BaseModel

class ProveedorForm(BaseModel):
    IdProveedor:int
    NombreProveedor:str

