from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.Repository.Rodela.InventarioRodela import InventarioRodelaRepository
from app.utils.validators import ValidarTexto
from app.Constants.Cantidades import OBSERVACION_RODELA_MIN, OBSERVACION_RODELA_MAX
from app.Models.Rodela.InventarioRodela import (
    ResumenInventarioRodelaResponse,
    DetalleInventarioRodelaRequest,
    DetalleInventarioRodelaResponse,
    RodelaEnAlmacenResponse,
    TrasladarRodelaRequest,
    TrasladarRodelaResponse,
    CorregirTrasladoRodelaRequest,
    CorregirTrasladoRodelaResponse,
    DeshacerTrasladoRodelaRequest,
    DeshacerTrasladoRodelaResponse,
    RodelaReingresableResponse,
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

    def DeshacerTrasladoRodela(
        self, data: DeshacerTrasladoRodelaRequest, id_usuario: int
    ) -> DeshacerTrasladoRodelaResponse:
        observacion = (data.Observacion or "").strip()
        if not ValidarTexto(OBSERVACION_RODELA_MIN, OBSERVACION_RODELA_MAX, observacion):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=(
                    "La observación es obligatoria y debe tener entre "
                    f"{OBSERVACION_RODELA_MIN} y {OBSERVACION_RODELA_MAX} caracteres"
                ),
            )

        params = {
            "p_IdRodela": data.IdRodela,
            "p_IdUsuario": id_usuario,
            "p_Observacion": observacion,
        }

        try:
            resultado = self.repository.DeshacerTrasladoRodela(params)
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
                    detail="La rodela indicada no está Abierta, no puede deshacerse el traslado",
                )
            if "no tiene un traslado a producción registrado" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La rodela indicada no tiene un traslado a producción registrado",
                )
            if "más de 30 minutos" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Pasaron más de 30 minutos desde el traslado; la rodela ya no puede reingresarse al almacén",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo deshacer el traslado de la rodela, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo deshacer el traslado de la rodela",
            )

        return DeshacerTrasladoRodelaResponse(**resultado)

    def ListarRodelasReingresables(self) -> list[RodelaReingresableResponse]:
        try:
            resultado = self.repository.ListarRodelasReingresables()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener el listado de rodelas por reingresar",
            )

        return [RodelaReingresableResponse(**fila) for fila in resultado]
