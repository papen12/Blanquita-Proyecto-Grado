from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.BobinaPapel.produccionbobinarepository import ProduccionBobinaTuboRepository
from app.Models.BobinaPapel.IniciarProduccion import IniciarProduccionBobinaTuboRequest, IniciarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.FinalizarProduccion import FinalizarProduccionBobinaTuboRequest,FinalizarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.PausaProduccion import PausarProduccionBobinaTuboRequest,PausarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReanudarProduccion import ReanudarProduccionBobinaTuboRequest,ReanudarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.CancelarProduccion import CancelarProduccionBobinaTuboRequest,CancelarProduccionBobinaTuboResponse
from app.Models.BobinaPapel.ReIngresarBobina import ReingresarBobinaAInventarioRequest,ReingresarBobinaAInventarioResponse
from app.Models.BobinaPapel.BajarBobina import DarDeBajaBobinaRequest,DarDeBajaBobinaResponse
from app.Models.BobinaPapel.OperadorLogs import InsertarMovimientoOperadorLogsRequest,InsertarMovimientoOperadorLogsResponse

class ProduccionBobinaTuboService:
    def __init__(self, db: Session):
        self.repository = ProduccionBobinaTuboRepository(db)

    def IniciarProduccionBobinaTubo(self, data: IniciarProduccionBobinaTuboRequest, id_usuario: int) -> IniciarProduccionBobinaTuboResponse:
        params = {
            "p_IdBobina1": data.IdBobina1,
            "p_IdBobina2": data.IdBobina2,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.IniciarProduccionBobinaTubo(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "no puede ser la misma bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IdBobina1 e IdBobina2 no pueden ser la misma bobina"
                )
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Una de las bobinas indicadas no existe"
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Una de las bobinas indicadas no está disponible en almacén"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo iniciar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de bobina tubo"
            )

        return IniciarProduccionBobinaTuboResponse(**resultado)

    def FinalizarProduccion(self, data: FinalizarProduccionBobinaTuboRequest, id_usuario: int) -> FinalizarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.FinalizarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede finalizarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo finalizar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo finalizar la producción de bobina tubo"
            )

        return FinalizarProduccionBobinaTuboResponse(**resultado)

    def PausarProduccion(self, data: PausarProduccionBobinaTuboRequest, id_usuario: int) -> PausarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
            "p_MotivoPausaProduccion": data.MotivoPausaProduccion,
        }

        try:
            resultado = self.repository.PausarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede pausarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo pausar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo pausar la producción de bobina tubo"
            )

        return PausarProduccionBobinaTuboResponse(**resultado)

    def ReanudarProduccion(self, data: ReanudarProduccionBobinaTuboRequest, id_usuario: int) -> ReanudarProduccionBobinaTuboResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.RenudarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "No existe una pausa activa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No existe una pausa activa para la producción indicada"
                )
            if "no se encuentra en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra en Pausa, no puede reanudarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reanudar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reanudar la producción de bobina tubo"
            )

        return ReanudarProduccionBobinaTuboResponse(**resultado)

    def CancelarProduccion(self, data: CancelarProduccionBobinaTuboRequest, id_usuario: int) -> CancelarProduccionBobinaTuboResponse:
        params = {
            "p_id_produccion": data.IdProduccionBobinaTubo,
            "p_id_usuario": id_usuario,
            "p_motivo_cancelacion": data.MotivoCancelacion,
        }

        try:
            resultado = self.repository.CancelarProduccion(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no está en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no está en Pausa, no se puede cancelar"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo cancelar la producción de bobina tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cancelar la producción de bobina tubo"
            )

        return CancelarProduccionBobinaTuboResponse(**resultado)

    def ReingresarBobina(self, data: ReingresarBobinaAInventarioRequest, id_usuario: int) -> ReingresarBobinaAInventarioResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.ReingresarBobina(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la bobina con id {data.IdBobinaPapel}"
                )
            if "no está Fuera de Inventario" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La bobina indicada no está Fuera de Inventario, no puede reingresarse"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reingresar la bobina a inventario, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reingresar la bobina a inventario"
            )

        return ReingresarBobinaAInventarioResponse(**resultado)

    def DarDeBajaBobina(self, data: DarDeBajaBobinaRequest, id_usuario: int) -> DarDeBajaBobinaResponse:
        params = {
            "p_IdBobinaPapel": data.IdBobinaPapel,
            "p_IdUsuario": id_usuario,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.DarDeBajaBobina(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la bobina" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la bobina con id {data.IdBobinaPapel}"
                )
            if "no está Fuera de Inventario" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La bobina indicada no está Fuera de Inventario, no puede darse de baja"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo dar de baja la bobina, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo dar de baja la bobina"
            )

        return DarDeBajaBobinaResponse(**resultado)

    def InsertarMovimientoOperadorLogs(self, data: InsertarMovimientoOperadorLogsRequest, id_usuario: int) -> InsertarMovimientoOperadorLogsResponse:
        params = {
            "p_IdProduccionBobinaTubo": data.IdProduccionBobinaTubo,
            "p_IdTipoMovimientoOperadorLogs": data.IdTipoMovimientoOperadorLogs,
            "p_IdUsuario": id_usuario,
            "p_CantidadLogs": data.CantidadLogs,
            "p_Observacion": data.Observacion,
        }

        try:
            resultado = self.repository.InsertarMovimientoOperadorLogs(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "CantidadLogs debe ser un valor positivo" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CantidadLogs debe ser un valor positivo"
                )
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionBobinaTubo}"
                )
            if "no se pueden registrar logs" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no está En Producción ni en Pausa, no se pueden registrar logs"
                )
            if "No se puede descontar" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La cantidad a descontar supera el total de logs registrados"
                )
            if "no es válido" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El tipo de movimiento {data.IdTipoMovimientoOperadorLogs} no es válido"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo registrar el movimiento de logs del operador, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el movimiento de logs del operador"
            )

        return InsertarMovimientoOperadorLogsResponse(**resultado)