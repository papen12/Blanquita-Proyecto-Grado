import re
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Constants.Cantidades import LONGITUD_MINIMA_DESCRIPCION
from app.Models.BobinaPapel.TipoBobina import (
    CrearTipoBobinaPapelRequest,
    EditarTipoBobinaPapelRequest,
    ListarTiposBobinaPapelRequest,
    ListarTiposBobinaPapelResponse,
    TipoBobinaPapelItem,
    TipoBobinaPapelResponse,
)
from app.Repository.BobinaPapel.TipoBobinaRepository import TipoBobinaRepository
from app.Schemas.BobinaPapel import TipoBobina

PATRON_NOMBRE_TIPO = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$"

# El nombre no aparece: queda fijo desde la creación.
CAMPOS_EDITABLES = [
    ("Descripcion", "Descripción"),
    ("DiametroMm", "Diámetro (mm)"),
    ("Formato", "Formato (mm)"),
    ("TaraKg", "Tara (kg)"),
]


def _numero(valor) -> str:
    return format(Decimal(valor).normalize(), "f")


def _texto(campo: str, valor) -> str:
    if campo == "Descripcion":
        return valor or "(sin descripción)"
    return _numero(valor)


def _respuesta(tipo: TipoBobina) -> TipoBobinaPapelResponse:
    return TipoBobinaPapelResponse(
        IdTipoBobina=tipo.IdTipoBobina,
        NombreTipoBobina=tipo.NombreTipoBobina,
        Descripcion=tipo.Descripcion,
        DiametroMm=tipo.DiametroMm,
        Formato=tipo.Formato,
        TaraKg=tipo.TaraKg,
    )


def _DescripcionValida(descripcion: str) -> str:
    limpia = " ".join(descripcion.split())
    if len(limpia) < LONGITUD_MINIMA_DESCRIPCION:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"La descripción debe tener al menos {LONGITUD_MINIMA_DESCRIPCION} caracteres",
        )
    return limpia


class TipoBobinaService:
    def __init__(self, db: Session):
        self.repository = TipoBobinaRepository(db)

    def _NombreValido(self, nombre_crudo: str) -> str:
        nombre = " ".join(nombre_crudo.split())

        if not re.fullmatch(PATRON_NOMBRE_TIPO, nombre):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El nombre solo puede tener letras, números, espacios y guiones",
            )

        if self.repository.NombreEnUso(nombre):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un tipo de bobina llamado {nombre}",
            )

        return nombre

    def ListarTipos(self, data: ListarTiposBobinaPapelRequest) -> ListarTiposBobinaPapelResponse:
        total, filas = self.repository.ListarTipos(data.model_dump())

        return ListarTiposBobinaPapelResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Tipos=[TipoBobinaPapelItem(**fila) for fila in filas],
        )

    def CrearTipo(
        self, datos: CrearTipoBobinaPapelRequest, id_admin: int
    ) -> TipoBobinaPapelResponse:
        nombre = self._NombreValido(datos.NombreTipoBobina)
        descripcion = _DescripcionValida(datos.Descripcion)

        tipo = TipoBobina(
            NombreTipoBobina=nombre,
            Descripcion=descripcion,
            DiametroMm=datos.DiametroMm,
            Formato=datos.Formato,
            TaraKg=datos.TaraKg,
        )

        creado = self.repository.CrearTipo(
            tipo,
            lambda t: (
                f"Crear tipo de bobina papel · #{t.IdTipoBobina} {t.NombreTipoBobina} "
                f"(diámetro {_numero(datos.DiametroMm)} mm, formato {_numero(datos.Formato)} mm, "
                f"tara {_numero(datos.TaraKg)} kg) · {descripcion}"
            ),
            id_admin,
        )
        return _respuesta(creado)

    def EditarTipo(
        self, datos: EditarTipoBobinaPapelRequest, id_admin: int
    ) -> TipoBobinaPapelResponse:
        descripcion = _DescripcionValida(datos.Descripcion)

        tipo = self.repository.ObtenerTipoBloqueado(datos.IdTipoBobina)
        if tipo is None:
            self.repository.Revertir()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El tipo de bobina no existe",
            )

        nuevos = {
            "Descripcion": descripcion,
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

        observacion = (
            f"Editar tipo de bobina papel · #{tipo.IdTipoBobina} {tipo.NombreTipoBobina}: "
            + "; ".join(cambios)
        )
        return _respuesta(self.repository.GuardarEdicion(tipo, observacion, id_admin))
