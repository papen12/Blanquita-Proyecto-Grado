import json

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.InventarioFinal.ProductoFinal import ProductoFinalRepository
from app.Constants.Cantidades import (
    CANTIDAD_INGRESO_PRODUCTO_TERMINADO,
    CANTIDAD_CORRECCION_PRODUCTO_TERMINADO,
    LONGITUD_MINIMA_DESCRIPCION,
    LONGITUD_MAXIMA_DESCRIPCION,
)
from app.utils.validators import EsCantidadValida, ValidarTexto
from app.Models.InventarioFinal.ProductoFinal import(
      IngresoProductoTerminadoRequest,
      IngresoProductoTerminadoResponse,
      SalidaProductoTerminadoRequest,
      SalidaProductoTerminadoResponse,
      AjusteNegativoInventarioRequest,
      AjusteNegativoInventarioResponse,
      AjustePositivoInventarioRequest,
      AjustePositivoInventarioResponse,
      CorreccionProductoTerminadoRequest,
      CorreccionProductoTerminadoResponse,
      VerInventarioProductoTerminadoRequest,
      VerInventarioProductoTerminadoResponse
)

ID_TIPO_MOVIMIENTO_DESCUENTO = 3

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

        for item in data.Presentaciones:
            if item.Cantidad <= 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="La cantidad de ingreso debe ser mayor a 0",
                )
            if not EsCantidadValida(item.Cantidad, CANTIDAD_INGRESO_PRODUCTO_TERMINADO):
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail=f"La cantidad máxima de ingreso por presentación es de {CANTIDAD_INGRESO_PRODUCTO_TERMINADO}",
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

    def CorregirInventarioProductoTerminado(
        self, data: CorreccionProductoTerminadoRequest, id_usuario: int
    ) -> CorreccionProductoTerminadoResponse:
        if data.Cantidad <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="La cantidad a corregir debe ser mayor a 0",
            )
        if not EsCantidadValida(data.Cantidad, CANTIDAD_CORRECCION_PRODUCTO_TERMINADO):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"La cantidad máxima de corrección por presentación es de {CANTIDAD_CORRECCION_PRODUCTO_TERMINADO}",
            )

        observacion = (data.Observacion or "").strip()
        if not ValidarTexto(LONGITUD_MINIMA_DESCRIPCION, LONGITUD_MAXIMA_DESCRIPCION, observacion):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"La observación es obligatoria y debe tener entre {LONGITUD_MINIMA_DESCRIPCION} y {LONGITUD_MAXIMA_DESCRIPCION} caracteres",
            )

        params = {
            "p_IdTipoMovimientoInventario": ID_TIPO_MOVIMIENTO_DESCUENTO,
            "p_IdPresentacion": data.IdPresentacion,
            "p_IdUsuario": id_usuario,
            "p_Cantidad": data.Cantidad,
            "p_Observacion": observacion,
        }

        fila = self.repository.CorregirInventarioProductoTerminado(params)

        if not fila:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar la corrección de producto terminado",
            )

        return CorreccionProductoTerminadoResponse(**fila)

    def VerInventarioProductoTerminado(
        self, id_producto: int | None
    ) -> list[VerInventarioProductoTerminadoResponse]:
        params = {"p_IdProducto": id_producto}

        filas = self.repository.VerInventarioProductoTerminado(params)

        return [VerInventarioProductoTerminadoResponse(**fila) for fila in filas]