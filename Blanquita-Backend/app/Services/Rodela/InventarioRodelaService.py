from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Rodela.InventarioRodela import InventarioRodelaRepository
from app.Models.Rodela.InventarioRodela import (
    ResumenInventarioRodelaResponse,
    DetalleInventarioRodelaRequest,
    DetalleInventarioRodelaResponse,
    RodelaEnAlmacenResponse,
    TrasladarRodelaRequest,
    TrasladarRodelaResponse,
    CorregirTrasladoRodelaRequest,
    CorregirTrasladoRodelaResponse,
    DarDeBajaRodelaRequest,
    DarDeBajaRodelaResponse,
)


class InventarioRodelaService:
    def __init__(self, db: Session):
        self.repository = InventarioRodelaRepository(db)

    def VerResumenInventarioRodela(self) -> list[ResumenInventarioRodelaResponse]:
        try:
            resultado = self.repository.VerResumenInventarioRodela()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el resumen de inventario de rodelas",
            )

        return [ResumenInventarioRodelaResponse(**fila) for fila in resultado]

    def VerDetalleInventarioRodela(
        self, data: DetalleInventarioRodelaRequest
    ) -> list[DetalleInventarioRodelaResponse]:
        params = {
            "p_IdTipoRodela": data.IdTipoRodela,
        }

        try:
            resultado = self.repository.VerDetalleInventarioRodela(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el detalle de inventario de rodelas",
            )

        return [DetalleInventarioRodelaResponse(**fila) for fila in resultado]

    def ListarRodelasEnAlmacen(self, id_tipo_rodela: int) -> list[RodelaEnAlmacenResponse]:
        params = {
            "p_IdTipoRodela": id_tipo_rodela,
        }

        try:
            resultado = self.repository.ListarRodelasEnAlmacen(params)
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el listado de rodelas en almacén",
            )

        return [RodelaEnAlmacenResponse(**fila) for fila in resultado]

    def TrasladarRodelaAProduccion(
        self, data: TrasladarRodelaRequest, id_usuario: int
    ) -> TrasladarRodelaResponse:
        params = {
            "p_IdRodela": data.IdRodela,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.TrasladarRodelaAProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "es obligatorio" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IdRodela es obligatorio para trasladar a producción",
                )
            if "No existe la rodela" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la rodela con id {data.IdRodela}",
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La rodela indicada no está disponible en almacén",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo trasladar la rodela a producción, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo trasladar la rodela a producción",
            )

        return TrasladarRodelaResponse(**resultado)

    def CorregirTrasladoRodela(
        self, data: CorregirTrasladoRodelaRequest, id_usuario: int
    ) -> CorregirTrasladoRodelaResponse:
        params = {
            "p_IdRodela": data.IdRodela,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.CorregirTrasladoRodela(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la rodela" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la rodela con id {data.IdRodela}",
                )
            if "no está Abierta" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La rodela indicada no está Abierta, no puede corregirse el traslado",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo corregir el traslado de la rodela, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo corregir el traslado de la rodela",
            )

        return CorregirTrasladoRodelaResponse(**resultado)

    def DarDeBajaRodela(
        self, data: DarDeBajaRodelaRequest, id_usuario: int
    ) -> DarDeBajaRodelaResponse:
        params = {
            "p_IdRodela": data.IdRodela,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.DarDeBajaRodela(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la rodela" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la rodela con id {data.IdRodela}",
                )
            if "obligatoria" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La observación (motivo de la baja) es obligatoria",
                )
            if "no está En almacén ni Abierta" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La rodela indicada no puede darse de baja en su estado actual",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo dar de baja la rodela, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo dar de baja la rodela",
            )

        return DarDeBajaRodelaResponse(**resultado)
