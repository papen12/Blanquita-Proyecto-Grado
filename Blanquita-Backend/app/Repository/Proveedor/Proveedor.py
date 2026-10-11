from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.Constants.Estados import ESTADO_PROVEEDOR_ACTIVO
from app.Repository.DbCaller import DbCaller
from app.Schemas.HistorialAdmin import HistorialAdmin
from app.Schemas.Proveedor import EstadoProveedor, Proveedor


class ProveedorRepository():
    def __init__(self,db:Session):
        self.db = db
        self.caller=DbCaller(db)

    def ObtenerProveedorForm(self)-> list[dict]:
        consulta = (
            select(Proveedor.IdProveedor, Proveedor.NombreProveedor)
            .where(Proveedor.IdEstadoProveedor == ESTADO_PROVEEDOR_ACTIVO)
            .order_by(Proveedor.NombreProveedor)
        )
        return self.caller.Consultar(consulta)

    def ListarProveedores(self, params: dict) -> tuple[int, list[dict]]:
        consulta = (
            select(
                Proveedor.IdProveedor,
                Proveedor.NombreProveedor,
                Proveedor.CelularProveedor,
                Proveedor.CorreoProveedor,
                Proveedor.IdEstadoProveedor,
                EstadoProveedor.NombreEstadoProveedor,
            )
            .join(EstadoProveedor, Proveedor.IdEstadoProveedor == EstadoProveedor.IdEstadoProveedor)
        )

        if params.get("IdEstadoProveedor") is not None:
            consulta = consulta.where(Proveedor.IdEstadoProveedor == params["IdEstadoProveedor"])

        busqueda = (params.get("Busqueda") or "").strip()
        if busqueda:
            consulta = consulta.where(
                or_(
                    Proveedor.NombreProveedor.ilike(f"%{busqueda}%"),
                    Proveedor.CelularProveedor.ilike(f"%{busqueda}%"),
                    Proveedor.CorreoProveedor.ilike(f"%{busqueda}%"),
                )
            )

        total = self.caller.Consultar(
            select(func.count().label("Total")).select_from(consulta.subquery())
        )[0]["Total"]

        pagina = consulta.order_by(
            Proveedor.NombreProveedor, Proveedor.IdProveedor
        ).limit(params["TamanoPagina"]).offset((params["Pagina"] - 1) * params["TamanoPagina"])

        return total, self.caller.Consultar(pagina)

    def ListarEstados(self) -> list[dict]:
        consulta = select(
            EstadoProveedor.IdEstadoProveedor,
            EstadoProveedor.NombreEstadoProveedor,
            EstadoProveedor.DescripcionEstadoProveedor,
        ).order_by(EstadoProveedor.IdEstadoProveedor)
        return self.caller.Consultar(consulta)

    def NombresEstados(self) -> dict[int, str]:
        return {
            f["IdEstadoProveedor"]: f["NombreEstadoProveedor"] for f in self.ListarEstados()
        }

    def NombreEnUso(self, nombre: str, excluir_id: int | None = None) -> bool:
        consulta = select(Proveedor.IdProveedor).where(
            func.lower(func.trim(Proveedor.NombreProveedor)) == nombre.lower()
        )
        if excluir_id is not None:
            consulta = consulta.where(Proveedor.IdProveedor != excluir_id)
        return bool(self.caller.Consultar(consulta.limit(1)))

    def ObtenerProveedorBloqueado(self, id_proveedor: int) -> Proveedor | None:
        """Lee el proveedor con FOR UPDATE; el bloqueo dura hasta el commit/rollback."""
        try:
            return self.db.execute(
                select(Proveedor).where(Proveedor.IdProveedor == id_proveedor).with_for_update()
            ).scalar_one_or_none()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener el proveedor",
            )

    def CrearProveedor(self, proveedor: Proveedor, observacion, id_admin: int) -> Proveedor:
        """`observacion` recibe el proveedor ya insertado para poder incluir su Id."""
        try:
            self.db.add(proveedor)
            self.db.flush()
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion(proveedor)))
            self.db.commit()
            self.db.refresh(proveedor)
            return proveedor
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el proveedor",
            )

    def EditarProveedor(
        self, proveedor: Proveedor, cambios: dict, observacion: str, id_admin: int
    ) -> Proveedor:
        """Aplica los cambios y registra el historial en la misma transacción."""
        try:
            for campo, valor in cambios.items():
                setattr(proveedor, campo, valor)
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion))
            self.db.commit()
            self.db.refresh(proveedor)
            return proveedor
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo editar el proveedor",
            )

    def CambiarEstado(
        self, proveedor: Proveedor, id_estado: int, observacion: str, id_admin: int
    ) -> None:
        """Actualiza el estado y registra el historial en la misma transacción."""
        try:
            proveedor.IdEstadoProveedor = id_estado
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion))
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo cambiar el estado del proveedor",
            )
