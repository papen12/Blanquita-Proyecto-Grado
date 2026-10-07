import re
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Models.BobinaPapel.TipoBobina import (
    CrearTipoBobinaPapelRequest,
    EditarTipoBobinaPapelRequest,
    TipoBobinaPapelDatos,
    TipoBobinaPapelItem,
    TipoBobinaPapelResponse,
)
from app.Repository.BobinaPapel.TipoBobinaRepository import TipoBobinaRepository
from app.Schemas.BobinaPapel import TipoBobina

PATRON_NOMBRE_TIPO = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$"

CAMPOS_EDITABLES = [
    ("NombreTipoBobina", "Nombre"),
    ("DiametroMm", "Diámetro (mm)"),
    ("Formato", "Formato (mm)"),
    ("TaraKg", "Tara (kg)"),
]


def _numero(valor) -> str:
    return format(Decimal(valor).normalize(), "f")


def _texto(campo: str, valor) -> str:
    return valor if campo == "NombreTipoBobina" else _numero(valor)


def _respuesta(tipo: TipoBobina) -> TipoBobinaPapelResponse:
    return TipoBobinaPapelResponse(
        IdTipoBobina=tipo.IdTipoBobina,
        NombreTipoBobina=tipo.NombreTipoBobina,
        DiametroMm=tipo.DiametroMm,
        Formato=tipo.Formato,
        TaraKg=tipo.TaraKg,
    )


class TipoBobinaService:
    def __init__(self, db: Session):
        self.repository = TipoBobinaRepository(db)

    def _NombreValido(self, datos: TipoBobinaPapelDatos, excluir_id: int | None = None) -> str:
        nombre = " ".join(datos.NombreTipoBobina.split())

        if not re.fullmatch(PATRON_NOMBRE_TIPO, nombre):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El nombre solo puede tener letras, números, espacios y guiones",
            )

        if self.repository.NombreEnUso(nombre, excluir_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un tipo de bobina llamado {nombre}",
            )

        return nombre

    def ListarTipos(self) -> list[TipoBobinaPapelItem]:
        return [TipoBobinaPapelItem(**fila) for fila in self.repository.ListarTipos()]

    def CrearTipo(
        self, datos: CrearTipoBobinaPapelRequest, id_admin: int
    ) -> TipoBobinaPapelResponse:
        nombre = self._NombreValido(datos)

        tipo = TipoBobina(
            NombreTipoBobina=nombre,
            DiametroMm=datos.DiametroMm,
            Formato=datos.Formato,
            TaraKg=datos.TaraKg,
        )

        creado = self.repository.CrearTipo(
            tipo,
            lambda t: (
                f"Crear tipo de bobina papel · #{t.IdTipoBobina} {t.NombreTipoBobina} "
                f"(diámetro {_numero(datos.DiametroMm)} mm, formato {_numero(datos.Formato)} mm, "
                f"tara {_numero(datos.TaraKg)} kg)"
            ),
            id_admin,
        )
        return _respuesta(creado)

    def EditarTipo(
        self, datos: EditarTipoBobinaPapelRequest, id_admin: int
    ) -> TipoBobinaPapelResponse:
        nombre = self._NombreValido(datos, excluir_id=datos.IdTipoBobina)

        tipo = self.repository.ObtenerTipoBloqueado(datos.IdTipoBobina)
        if tipo is None:
            self.repository.Revertir()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El tipo de bobina no existe",
            )

        nuevos = {
            "NombreTipoBobina": nombre,
            "DiametroMm": datos.DiametroMm,
            "Formato": datos.Formato,
            "TaraKg": datos.TaraKg,
        }

        cambios = []
        for campo, etiqueta in CAMPOS_EDITABLES:
            anterior = _texto(campo, getattr(tipo, campo))
            nuevo = _texto(campo, nuevos[campo])
            if anterior != nuevo:
                cambios.append(f"{etiqueta}: {anterior} → {nuevo}")
                setattr(tipo, campo, nuevos[campo])

        if not cambios:
            self.repository.Revertir()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="No hay cambios para guardar",
            )

        observacion = f"Editar tipo de bobina papel · #{tipo.IdTipoBobina}: " + "; ".join(cambios)
        return _respuesta(self.repository.GuardarEdicion(tipo, observacion, id_admin))
