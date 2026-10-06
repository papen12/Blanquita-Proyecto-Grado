from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.Config.supabase import Base


class TipoBobina(Base):
    __tablename__ = "TipoBobina"

    IdTipoBobina: Mapped[int] = mapped_column(primary_key=True)
    NombreTipoBobina: Mapped[str] = mapped_column(Text)


class LoteBobina(Base):
    __tablename__ = "LoteBobina"

    IdLoteBobina: Mapped[int] = mapped_column(primary_key=True)
    IdProveedor: Mapped[int]
    IdUsuario: Mapped[int | None]
    FechaRecepcion: Mapped[date] = mapped_column(Date)


class BobinaPapel(Base):
    __tablename__ = "BobinaPapel"

    IdBobinaPapel: Mapped[int] = mapped_column(primary_key=True)
    CodigoBobina: Mapped[str] = mapped_column(Text)
    IdTipoBobina: Mapped[int]
    IdLoteBobina: Mapped[int]
    IdEstadoMateriaPrima: Mapped[int]
    PesoBrutoKg: Mapped[Decimal | None] = mapped_column(Numeric)
    Gramaje: Mapped[Decimal | None] = mapped_column(Numeric)
    PesoNetoKg: Mapped[Decimal | None] = mapped_column(Numeric)
