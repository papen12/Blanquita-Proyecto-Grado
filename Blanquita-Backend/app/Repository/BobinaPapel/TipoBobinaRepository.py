from fastapi import HTTPException, status
from sqlalchemy import case, func, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.Constants.Estados import ESTADO_MATERIA_PRIMA_EN_ALMACEN
from app.Repository.DbCaller import DbCaller
from app.Schemas.BobinaPapel import BobinaPapel, TipoBobina
from app.Schemas.HistorialAdmin import HistorialAdmin


class TipoBobinaRepository:
    def __init__(self, db: Session):
        self.db = db
        self.caller = DbCaller(db)

    def ListarTipos(self) -> list[dict]:
        consulta = (
            select(
                TipoBobina.IdTipoBobina,
                TipoBobina.NombreTipoBobina,
                TipoBobina.DiametroMm,
                TipoBobina.Formato,
                TipoBobina.TaraKg,
                func.count(BobinaPapel.IdBobinaPapel).label("CantidadBobinas"),
                func.count(
                    case(
                        (
                            BobinaPapel.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN,
                            BobinaPapel.IdBobinaPapel,
                        )
                    )
                ).label("CantidadEnAlmacen"),
            )
            .outerjoin(BobinaPapel, BobinaPapel.IdTipoBobina == TipoBobina.IdTipoBobina)
            .group_by(TipoBobina.IdTipoBobina)
            .order_by(TipoBobina.IdTipoBobina)
        )
        return self.caller.Consultar(consulta)

    def NombreEnUso(self, nombre: str, excluir_id: int | None = None) -> bool:
        consulta = select(TipoBobina.IdTipoBobina).where(
            func.lower(func.trim(TipoBobina.NombreTipoBobina)) == nombre.lower()
        )
        if excluir_id is not None:
            consulta = consulta.where(TipoBobina.IdTipoBobina != excluir_id)
        return bool(self.caller.Consultar(consulta.limit(1)))

    def ObtenerTipoBloqueado(self, id_tipo: int) -> TipoBobina | None:
        try:
            return self.db.execute(
                select(TipoBobina)
                .where(TipoBobina.IdTipoBobina == id_tipo)
                .with_for_update()
            ).scalar_one_or_none()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener el tipo de bobina",
            )

    def CrearTipo(self, tipo: TipoBobina, observacion, id_admin: int) -> TipoBobina:
        """`observacion` recibe el tipo ya insertado para poder incluir su Id."""
        try:
            self.db.add(tipo)
            self.db.flush()
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion(tipo)))
            self.db.commit()
            self.db.refresh(tipo)
            return tipo
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el tipo de bobina",
            )

    def GuardarEdicion(self, tipo: TipoBobina, observacion: str, id_admin: int) -> TipoBobina:
        try:
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion))
            self.db.commit()
            self.db.refresh(tipo)
            return tipo
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo editar el tipo de bobina",
            )

    def Revertir(self) -> None:
        self.db.rollback()
