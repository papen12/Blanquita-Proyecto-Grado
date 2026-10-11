from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class EstadoProveedor(Base):
    __tablename__ = "EstadoProveedor"

    IdEstadoProveedor: Mapped[int] = mapped_column(primary_key=True)
    NombreEstadoProveedor: Mapped[str] = mapped_column(Text)
    DescripcionEstadoProveedor: Mapped[str | None] = mapped_column(Text)


class Proveedor(Base):
    __tablename__ = "Proveedor"

    IdProveedor: Mapped[int] = mapped_column(primary_key=True)
    NombreProveedor: Mapped[str] = mapped_column(Text)
    CelularProveedor: Mapped[str | None] = mapped_column(Text)
    CorreoProveedor: Mapped[str | None] = mapped_column(Text)
    IdEstadoProveedor: Mapped[int]
