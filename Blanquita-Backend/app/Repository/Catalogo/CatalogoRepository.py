from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.Repository.DbCaller import DbCaller
from app.Schemas.HistorialAdmin import HistorialAdmin
from app.Schemas.Producto import InventarioProductoTerminado, PresentacionProducto, Producto


class CatalogoRepository:
    def __init__(self, db: Session):
        self.db = db
        self.caller = DbCaller(db)

    def ListarLineas(self) -> list[dict]:
        consulta = (
            select(
                Producto.IdProducto,
                Producto.NombreProducto,
                Producto.SiglasProducto,
                func.count(PresentacionProducto.IdPresentacion).label("CantidadPresentaciones"),
            )
            .outerjoin(PresentacionProducto, PresentacionProducto.IdProducto == Producto.IdProducto)
            .group_by(Producto.IdProducto)
            .order_by(Producto.NombreProducto)
        )
        return self.caller.Consultar(consulta)

    def ListarPresentaciones(self) -> list[dict]:
        consulta = (
            select(
                PresentacionProducto.IdPresentacion,
                PresentacionProducto.IdProducto,
                PresentacionProducto.TipoContenedor,
                PresentacionProducto.CantidadRollosUnidades,
                PresentacionProducto.CantidadPorUnidadTerminada,
                PresentacionProducto.CodigoPresentacion,
                Producto.NombreProducto,
            )
            .join(Producto, PresentacionProducto.IdProducto == Producto.IdProducto)
            .order_by(Producto.NombreProducto, PresentacionProducto.CodigoPresentacion)
        )
        return self.caller.Consultar(consulta)

    def NombreLineaEnUso(self, nombre: str) -> bool:
        consulta = select(Producto.IdProducto).where(
            func.lower(func.trim(Producto.NombreProducto)) == nombre.lower()
        )
        return bool(self.caller.Consultar(consulta.limit(1)))

    def CodigoEnUso(self, codigo: str) -> bool:
        consulta = select(PresentacionProducto.IdPresentacion).where(
            func.upper(func.trim(PresentacionProducto.CodigoPresentacion)) == codigo.upper()
        )
        return bool(self.caller.Consultar(consulta.limit(1)))

    def LineaConSiglas(self, siglas: str) -> str | None:
        """Nombre de la línea que ya usa esas siglas, si hay alguna."""
        consulta = select(Producto.NombreProducto).where(Producto.SiglasProducto == siglas)
        filas = self.caller.Consultar(consulta.limit(1))
        return filas[0]["NombreProducto"] if filas else None

    def ObtenerLinea(self, id_producto: int) -> Producto | None:
        try:
            return self.db.get(Producto, id_producto)
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al obtener la línea de producción",
            )

    def CrearLinea(self, linea: Producto, observacion, id_admin: int) -> Producto:
        """`observacion` recibe la línea ya insertada para poder incluir su Id."""
        try:
            self.db.add(linea)
            self.db.flush()
            self.db.add(HistorialAdmin(IdUsuario=id_admin, Observacion=observacion(linea)))
            self.db.commit()
            self.db.refresh(linea)
            return linea
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El nombre o las siglas ya están en uso por otra línea",
            )
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear la línea de producción",
            )

    def CrearPresentacion(
        self, presentacion: PresentacionProducto, observacion: str, id_admin: int
    ) -> PresentacionProducto:
        """Crea la presentación y su inventario en cero en una sola transacción."""
        try:
            self.db.add(presentacion)
            self.db.flush()
            self.db.add(
                InventarioProductoTerminado(
                    IdPresentacion=presentacion.IdPresentacion, CantidadActual=0
                )
            )
            self.db.add(
                HistorialAdmin(
                    IdUsuario=id_admin,
                    Observacion=f"Crear producto · #{presentacion.IdPresentacion} {observacion}",
                )
            )
            self.db.commit()
            self.db.refresh(presentacion)
            return presentacion
        except IntegrityError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El código de presentación ya está registrado",
            )
        except SQLAlchemyError:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="No se pudo crear el producto",
            )
