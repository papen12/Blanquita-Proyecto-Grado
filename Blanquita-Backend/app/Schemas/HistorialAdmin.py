from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class HistorialAdmin(Base):
    __tablename__ = "HistorialAdmin"

    IdHistorialAdmin: Mapped[int] = mapped_column(primary_key=True)
    IdUsuario: Mapped[int]
    Observacion: Mapped[str] = mapped_column(Text)
    FechaMovimiento: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
