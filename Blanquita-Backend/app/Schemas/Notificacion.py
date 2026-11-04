from datetime import datetime

from sqlalchemy import DateTime, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class SuscripcionPush(Base):
    __tablename__ = "SuscripcionPush"

    IdSuscripcionPush: Mapped[int] = mapped_column(primary_key=True)
    IdUsuario: Mapped[int]
    Endpoint: Mapped[str] = mapped_column(Text, unique=True)
    Claves: Mapped[dict] = mapped_column(JSONB)
    FechaRegistro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )


class AlertaPushEnviada(Base):
    __tablename__ = "AlertaPushEnviada"

    IdAlertaPushEnviada: Mapped[int] = mapped_column(primary_key=True)
    Clave: Mapped[str] = mapped_column(Text)
    Datos: Mapped[dict] = mapped_column(JSONB)
    FechaEnvio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    FechaResuelta: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
