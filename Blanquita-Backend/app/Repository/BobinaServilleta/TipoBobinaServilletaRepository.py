from fastapi import HTTPException, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.Constants.Estados import ESTADO_MATERIA_PRIMA_EN_ALMACEN
from app.Repository.DbCaller import DbCaller
from app.Schemas.BobinaServilleta import BobinaServilleta, TipoBobinaServilleta
from app.Schemas.HistorialAdmin import HistorialAdmin


class TipoBobinaServilletaRepository:
    def __init__(self, db: Session):
        self.db = db
        self.caller = DbCaller(db)

    def ListarTipos(self, params: dict) -> tuple[int, list[dict]]:
        consulta = (
            select(
                TipoBobinaServilleta.IdTipoBobinaServilleta,
                TipoBobinaServilleta.NombreTipoBobinaServilleta,
                TipoBobinaServilleta.Descripcion,
                TipoBobinaServilleta.DiametroMm,
                TipoBobinaServilleta.CrepadoPorcentaje,
                TipoBobinaServilleta.ResistenciaKgf,
                func.count(BobinaServilleta.IdBobinaServilleta).label("CantidadBobinas"),
                func.count(
                    case(
                        (
                            BobinaServilleta.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_ALMACEN,
                            BobinaServilleta.IdBobinaServilleta,
                        )
                    )
                ).label("CantidadEnAlmacen"),
            )
            .outerjoin(
                BobinaServilleta,
                BobinaServilleta.IdTipoBobinaServilleta == TipoBobinaServilleta.IdTipoBobinaServilleta,
            )
            .group_by(TipoBobinaServilleta.IdTipoBobinaServilleta)
        )

        busqueda = (params.get("Busqueda") or "").strip()
        if busqueda:
            consulta = consulta.where(
                or_(
                    TipoBobinaServilleta.NombreTipoBobinaServilleta.ilike(f"%{busqueda}%"),
                    TipoBobinaServilleta.Descripcion.ilike(f"%{busqueda}%"),
                )
            )

        total = self.caller.Consultar(
            select(func.count().label("Total")).select_from(consulta.subquery())
        )[0]["Total"]

        pagina = consulta.order_by(
            TipoBobinaServilleta.NombreTipoBobinaServilleta,
            TipoBobinaServilleta.IdTipoBobinaServilleta,
        ).limit(params["TamanoPagina"]).offset((params["Pagina"] - 1) * params["TamanoPagina"])

        return total, self.caller.Consultar(pagina)

    def NombreEnUso(self, nombre: str, excluir_id: int | None = None) -> bool:
        consulta = select(TipoBobinaServilleta.IdTipoBobinaServilleta).where(
            func.lower(func.trim(TipoBobinaServilleta.NombreTipoBobinaServilleta)) == nombre.lower()
        )
        if excluir_id is not None:
            consulta = consulta.where(TipoBobinaServilleta.IdTipoBobinaServilleta != excluir_id)
        return bool(self.caller.Consultar(consulta.limit(1)))

    def ObtenerTipoBloqueado(self, id_tipo: int) -> TipoBobinaServilleta | None:
        try:
            return self.db.execute(
                select(TipoBobinaServilleta)
                .where(TipoBobinaServilleta.IdTipoBobinaServilleta == id_tipo)
                .with_for_update()
            ).scalar_one_or_none()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener el tipo de bobina servilleta",
            )

    def CrearTipo(
        self, tipo: TipoBobinaServilleta, observacion, id_admin: int
    ) -> TipoBobinaServilleta:
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
                detail="No se pudo crear el tipo de bobina servilleta",
            )

    def GuardarEdicion(
        self, tipo: TipoBobinaServilleta, observacion: str, id_admin: int
    ) -> TipoBobinaServilleta:
        try:
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion))
            self.db.commit()
            self.db.refresh(tipo)
            return tipo
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo editar el tipo de bobina servilleta",
            )

    def Revertir(self) -> None:
        self.db.rollback()
