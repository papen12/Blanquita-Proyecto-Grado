import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.InventarioFinal.ProductoFinal import ProductoFinalRepository
from app.Models.InventarioFinal.ProductoFinal import(
      IngresoProductoTerminadoRequest,
      IngresoProductoTerminadoResponse,
      SalidaProductoTerminadoRequest,
      SalidaProductoTerminadoResponse,
      AjusteNegativoInventarioRequest,
      AjusteNegativoInventarioResponse,
      AjustePositivoInventarioRequest,
      AjustePositivoInventarioResponse,
      VerInventarioProductoTerminadoRequest,
      VerInventarioProductoTerminadoResponse
)

class ProductoFinalService:
    def __init__(self, db: Session):
            self.repository = ProductoFinalRepository(db)

    def InsertarIngresoProductoTerminado(
        self, data: IngresoProductoTerminadoRequest, id_usuario: int
    ) -> list[IngresoProductoTerminadoResponse]:
        if not data.Presentaciones:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Debe incluir al menos una presentación."
            )

        params = {
            "p_IdUsuario": id_usuario,
            "p_Presentaciones": json.dumps(
                [e.model_dump() for e in data.Presentaciones]
            )
        }

        filas = self.repository.InsertarIngresoProductoTerminado(params)

        return [IngresoProductoTerminadoResponse(**fila) for fila in filas]

    def InsertarSalidaProductoTerminado(
        self, data: SalidaProductoTerminadoRequest, id_usuario: int
    ) -> list[SalidaProductoTerminadoResponse]:
        params = {
            "p_IdUsuario": id_usuario,
            "p_Presentaciones": json.dumps(
                [e.model_dump() for e in data.Presentaciones]
            )
        }

        filas = self.repository.InsertarSalidaProductoTerminado(params)

        return [SalidaProductoTerminadoResponse(**fila) for fila in filas]


    def AjustePositivoInventarioProductoTerminado(
        self, data: AjustePositivoInventarioRequest, id_usuario: int
    ) -> AjustePositivoInventarioResponse:
        params = {
            "p_IdPresentacion": data.IdPresentacion,
            "p_IdUsuario": id_usuario,
            "p_Cantidad": data.Cantidad,
            "p_Observacion": data.Observacion
        }

        fila = self.repository.AjustePositivoInventarioProductoTerminado(params)

        return AjustePositivoInventarioResponse(**fila)

    def AjusteNegativoInventarioProductoTerminado(
        self, data: AjusteNegativoInventarioRequest, id_usuario: int
    ) -> AjusteNegativoInventarioResponse:
        params = {
            "p_IdPresentacion": data.IdPresentacion,
            "p_IdUsuario": id_usuario,
            "p_Cantidad": data.Cantidad,
            "p_Observacion": data.Observacion
        }

        fila = self.repository.AjusteNegativoInventarioProductoTerminado(params)

        return AjusteNegativoInventarioResponse(**fila)

    def VerInventarioProductoTerminado(
        self, id_producto: int | None
    ) -> list[VerInventarioProductoTerminadoResponse]:
        params = {"p_IdProducto": id_producto}

        filas = self.repository.VerInventarioProductoTerminado(params)

        return [VerInventarioProductoTerminadoResponse(**fila) for fila in filas]