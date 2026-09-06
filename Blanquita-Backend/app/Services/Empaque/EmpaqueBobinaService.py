import json

from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.Repository.Empaque.EmpaqueBobina import EmpaqueBobinaRepository
from app.Models.Empaque.EmpaqueBobina import(
    IngresoEmpaqueRequest,
    IngresoEmpaqueResponse,
    TrasladarEmpaquesProduccionRequest,
    TrasladarEmpaquesProduccionResponseItem,
    ResumenInventarioEmpaqueResponse,
    DetalleInventarioEmpaqueRequest,
    DetalleInventarioEmpaqueResponse,
    TipoEmpaque
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

        try:
            resultado = self.repository.InsertarEmpaques(params)
        except HTTPException as e:
            mensaje = str(e.detail)
            if "duplicate key" in mensaje or "CodigoEmpaque" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Ya existe un empaque registrado con ese código"
                )
            if "al menos un empaque" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Debe enviar al menos un empaque para registrar"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el lote de empaques, verifica los datos ingresados"
            )

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

    def ObtenerTiposEmpaque(self) -> list[TipoEmpaque]:
        resultado = self.repository.ObtenerTipoEmpaque()
        if not resultado:
            return []
        return [TipoEmpaque(**tipo) for tipo in resultado]