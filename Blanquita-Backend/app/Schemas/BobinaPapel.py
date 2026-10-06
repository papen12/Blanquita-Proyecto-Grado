from sqlalchemy import Text
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class TipoBobina(Base):
    __tablename__ = "TipoBobina"

    IdTipoBobina: Mapped[int] = mapped_column(primary_key=True)
    NombreTipoBobina: Mapped[str] = mapped_column(Text)
