from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Pallet.ProduccionPallet import ProduccionPalletRepository
from app.Models.Pallet.ProduccionPallet import (
    IniciarProduccionPalletRequest,
    IniciarProduccionPalletResponse,
    FinalizarProduccionPalletRequest,
    FinalizarProduccionPalletResponse,
    PausaProduccionPalletRequest,
    PausaProduccionPalletResponse,
    ReanudarProduccionPalletRequest,
    ReanudarProduccionPalletResponse,
    CancelarProduccionPalletRequest,
    CancelarProduccionPalletResponse,
   
    VerProduccionPalletRequest,VerProduccionPalletResponse,
    VerPausasProduccionPalletActivasRequest,
    VerPausasProduccionPalletActivasResponse
)

class ProduccionPalletService:
    def __init__(self, db: Session):
        self.repository = ProduccionPalletRepository(db)

    def IniciarProduccionPallet(
        self, data: IniciarProduccionPalletRequest, id_usuario: int
    ) -> IniciarProduccionPalletResponse:
        params = {
            "p_IdPallet": data.IdPallet,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.IniciarProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "es obligatorio" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="IdPallet es obligatorio para iniciar producción",
                )
            if "No existe el pallet" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe el pallet con id {data.IdPallet}",
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El pallet indicado no está disponible en almacén",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo iniciar la producción de pallet tubo, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de pallet tubo",
            )

        return IniciarProduccionPalletResponse(**resultado)

    def PausaProduccionPallet(
        self, data: PausaProduccionPalletRequest, id_usuario: int
    ) -> PausaProduccionPalletResponse:
        params = {
            "p_IdProduccionPalletTubo": data.IdProduccionPalletTubo,
            "p_IdUsuario": id_usuario,
            "p_MotivoPausaProduccion": data.MotivoPausaProduccion,
        }

        try:
            resultado = self.repository.PausaProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionPalletTubo}",
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede pausarse",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo pausar la producción de pallet tubo, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo pausar la producción de pallet tubo",
            )

        return PausaProduccionPalletResponse(**resultado)

    def ReanudarProduccionPallet(
        self, data: ReanudarProduccionPalletRequest, id_usuario: int
    ) -> ReanudarProduccionPalletResponse:
        params = {
            "p_IdProduccionPalletTubo": data.IdProduccionPalletTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.ReanudarProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionPalletTubo}",
                )
            if "no se encuentra en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra en Pausa, no puede reanudarse",
                )
            if "No existe una pausa activa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="No existe una pausa activa para la producción indicada",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo reanudar la producción de pallet tubo, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo reanudar la producción de pallet tubo",
            )

        return ReanudarProduccionPalletResponse(**resultado)

    def FinalizarProduccionPallet(
        self, data: FinalizarProduccionPalletRequest, id_usuario: int
    ) -> FinalizarProduccionPalletResponse:
        params = {
            "p_IdProduccionPalletTubo": data.IdProduccionPalletTubo,
            "p_IdUsuario": id_usuario,
        }

        try:
            resultado = self.repository.FinalizarProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionPalletTubo}",
                )
            if "no se encuentra En Producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no se encuentra En Producción, no puede finalizarse",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo finalizar la producción de pallet tubo, verifica los datos ingresados",
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo finalizar la producción de pallet tubo",
            )

        return FinalizarProduccionPalletResponse(**resultado)
    
    
    def CancelarProduccionPallet(self, data: CancelarProduccionPalletRequest, id_usuario: int) -> CancelarProduccionPalletResponse:
        params = {
            "p_id_produccion": data.IdProduccionPalletTubo,
            "p_id_usuario": id_usuario,
            "p_motivo_cancelacion": data.MotivoCancelacion,
        }

        try:
            resultado = self.repository.CancelarProduccionPallet(params)
        except SQLAlchemyError as e:
            mensaje = str(e.orig) if hasattr(e, "orig") else str(e)
            if "No existe la producción" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe la producción con id {data.IdProduccionPalletTubo}"
                )
            if "no está en Pausa" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="La producción indicada no está en Pausa, no se puede cancelar"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo cancelar la producción de pallet tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cancelar la producción de pallet tubo"
            )

        return CancelarProduccionPalletResponse(**resultado)
    
    
    
    def VerProduccionPallet(self, data: VerProduccionPalletRequest) -> list[VerProduccionPalletResponse]:
        params = {
            "p_IdTipoPallet": data.IdTipoPallet,
        }

        try:
            resultado = self.repository.VerProduccionPallet(params)
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener la producción de pallet tubo"
            )

        return [VerProduccionPalletResponse(**fila) for fila in resultado]
    
    def VerPausasProduccionPalletActivas(self, data: VerPausasProduccionPalletActivasRequest) -> list[VerPausasProduccionPalletActivasResponse]:
        params = {
            "p_IdTipoPallet": data.IdTipoPallet,
        }

        try:
            resultado = self.repository.VerPausasProduccionPalletActivas(params)
        except SQLAlchemyError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo obtener las pausas de producción de pallet tubo"
            )

        return [VerPausasProduccionPalletActivasResponse(**fila) for fila in resultado]