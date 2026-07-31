import json
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from typing import List

from app.Repository.Proveedor.Proveedor import ProveedorRepository
from app.Models.Proveedor.Proveedor import ProveedorForm


class ProveedorService:
    def __init__(self, db: Session):
        self.repository = ProveedorRepository(db)

    def ObtenerProveedoresForm(self) -> List[ProveedorForm]:
        try:
            resultado = self.repository.ObtenerProveedorForm()
        except SQLAlchemyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudieron obtener los proveedores",
            )
        return [ProveedorForm(**pf) for pf in resultado]
