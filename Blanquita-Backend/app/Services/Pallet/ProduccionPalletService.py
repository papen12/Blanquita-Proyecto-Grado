from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from app.Repository.Pallet.ProduccionPallet import ProduccionPalletRepository
from app.Models.Pallet.ProduccionPallet import IniciarProduccionPalletRequest, IniciarProduccionPalletResponse


class ProduccionPalletService:
    def __init__(self, db: Session):
        self.repository = ProduccionPalletRepository(db)

    def IniciarProduccionPallet(self, data: IniciarProduccionPalletRequest, id_usuario: int) -> IniciarProduccionPalletResponse:
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
                    detail="IdPallet es obligatorio para iniciar producción"
                )
            if "No existe el pallet" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"No existe el pallet con id {data.IdPallet}"
                )
            if "no está En almacén" in mensaje:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="El pallet indicado no está disponible en almacén"
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pudo iniciar la producción de pallet tubo, verifica los datos ingresados"
            )

        if not resultado:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo iniciar la producción de pallet tubo"
            )

        return IniciarProduccionPalletResponse(**resultado)