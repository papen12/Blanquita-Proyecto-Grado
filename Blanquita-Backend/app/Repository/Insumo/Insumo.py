from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.Repository.DbCaller import DbCaller
from app.Schemas.Insumo import InventarioInsumo, MovimientoInsumo, TipoInsumo


class InsumoRepository:
    def __init__(self, db: Session):
        self.db = db
        self.caller = DbCaller(db)

    def VerCatalogoInsumo(self) -> list[dict]:
        consulta = (
            select(
                InventarioInsumo.IdInventarioInsumo,
                InventarioInsumo.IdTipoInsumo,
                InventarioInsumo.CantidadActual,
                TipoInsumo.NombreInsumo,
                TipoInsumo.DescripcionInsumo,
            )
            .join(TipoInsumo, InventarioInsumo.IdTipoInsumo == TipoInsumo.IdTipoInsumo)
            .order_by(TipoInsumo.NombreInsumo)
        )
        return self.caller.Consultar(consulta)

    def ObtenerInventarioBloqueado(self, id_tipo_insumo: int) -> tuple[InventarioInsumo, TipoInsumo] | None:
        try:
            fila = self.db.execute(
                select(InventarioInsumo, TipoInsumo)
                .join(TipoInsumo, InventarioInsumo.IdTipoInsumo == TipoInsumo.IdTipoInsumo)
                .where(InventarioInsumo.IdTipoInsumo == id_tipo_insumo)
                .order_by(InventarioInsumo.IdInventarioInsumo)
                .limit(1)
                .with_for_update(of=InventarioInsumo)
            ).first()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener el inventario del insumo",
            )
        return (fila[0], fila[1]) if fila else None

    def RegistrarMovimiento(
        self, inventario: InventarioInsumo, movimiento: MovimientoInsumo, cantidad_nueva: int
    ) -> MovimientoInsumo:
        try:
            inventario.CantidadActual = cantidad_nueva
            self.db.add(movimiento)
            self.db.commit()
            self.db.refresh(movimiento)
            self.db.refresh(inventario)
            return movimiento
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo registrar el movimiento del insumo",
            )

    def Revertir(self) -> None:
        self.db.rollback()
