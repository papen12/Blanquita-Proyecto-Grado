from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class Producto(Base):
    __tablename__ = "Producto"

    IdProducto: Mapped[int] = mapped_column(primary_key=True)
    NombreProducto: Mapped[str] = mapped_column(Text)
