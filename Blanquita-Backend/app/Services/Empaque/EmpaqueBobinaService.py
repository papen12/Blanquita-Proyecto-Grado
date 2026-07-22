import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Empaque.EmpaqueBobina import EmpaqueBobinaRepository
from app.Models.Empaque.EmpaqueBobina import( 
    IngresoEmpaqueRequest,
    IngresoEmpaqueResponse,
    TrasladarEmpaquesProduccionRequest,
    TrasladarEmpaquesProduccionResponseItem,
    ResumenInventarioEmpaqueResponse,
    DetalleInventarioEmpaqueRequest,
    DetalleInventarioEmpaqueResponse
)


class EmpaqueBobinaService:
    def __init__(self, db: Session):
        self.repository = EmpaqueBobinaRepository(db)

    def InsertarEmpaques(self, data: IngresoEmpaqueRequest, id_usuario: int) -> IngresoEmpaqueResponse:
        params = {
            "p_IdProveedor": data.IdProveedor,
            "p_IdUsuario": id_usuario,
            "p_CantidadToneladasPedida": data.CantidadToneladasPedida,
            "p_Empaques": json.dumps([e.model_dump() for e in data.Empaques])
        }

        resultado = self.repository.InsertarEmpaques(params)

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el lote de empaques"
            )

        return IngresoEmpaqueResponse(Resumen=resultado)
    def TrasladarEmpaquesAProduccion(self, data: TrasladarEmpaquesProduccionRequest, id_usuario: int) -> list[TrasladarEmpaquesProduccionResponseItem]:
        params = {
            "p_IdsEmpaque": data.IdsEmpaque,
            "p_IdUsuario": id_usuario
        }

        resultado = self.repository.TrasladarEmpaquesAProduccion(params)

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo trasladar los empaques a producción"
            )

        return resultado

    def VerResumenInventarioEmpaque(self) -> list[ResumenInventarioEmpaqueResponse]:
        resultado = self.repository.VerResumenInventarioEmpaque()
        return resultado

    def VerDetalleInventarioEmpaque(self, data: DetalleInventarioEmpaqueRequest) -> list[DetalleInventarioEmpaqueResponse]:
        params = {
            "p_IdTipoEmpaque": data.IdTipoEmpaque
        }

        resultado = self.repository.VerDetalleInventarioEmpaque(params)

        return resultado