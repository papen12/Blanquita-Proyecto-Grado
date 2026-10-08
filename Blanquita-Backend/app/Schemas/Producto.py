from decimal import Decimal

from sqlalchemy import Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class Producto(Base):
    __tablename__ = "Producto"

    IdProducto: Mapped[int] = mapped_column(primary_key=True)
    NombreProducto: Mapped[str] = mapped_column(Text)
    SiglasProducto: Mapped[str] = mapped_column(Text)


class PresentacionProducto(Base):
    __tablename__ = "PresentacionProducto"

    IdPresentacion: Mapped[int] = mapped_column(primary_key=True)
    IdProducto: Mapped[int]
    TipoContenedor: Mapped[str] = mapped_column(Text)
    CantidadRollosUnidades: Mapped[int | None]
    CantidadPorUnidadTerminada: Mapped[int | None]
    CodigoPresentacion: Mapped[str] = mapped_column(Text)


class InventarioProductoTerminado(Base):
    __tablename__ = "InventarioProductoTerminado"

    IdPresentacion: Mapped[int] = mapped_column(primary_key=True)
    CantidadActual: Mapped[Decimal] = mapped_column(Numeric, default=0)
