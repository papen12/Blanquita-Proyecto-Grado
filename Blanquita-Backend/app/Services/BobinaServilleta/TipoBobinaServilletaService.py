import re
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Constants.Cantidades import LONGITUD_MINIMA_DESCRIPCION
from app.Models.BobinaServilleta.TipoBobinaServilleta import (
    CrearTipoBobinaServilletaRequest,
    EditarTipoBobinaServilletaRequest,
    ListarTiposBobinaServilletaRequest,
    ListarTiposBobinaServilletaResponse,
    TipoBobinaServilletaItem,
    TipoBobinaServilletaResponse,
)
from app.Repository.BobinaServilleta.TipoBobinaServilletaRepository import (
    TipoBobinaServilletaRepository,
)
from app.Schemas.BobinaServilleta import TipoBobinaServilleta

PATRON_NOMBRE_TIPO = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$"

# El nombre no aparece: queda fijo desde la creación.
CAMPOS_EDITABLES = [
    ("Descripcion", "Descripción"),
    ("DiametroMm", "Diámetro (mm)"),
    ("CrepadoPorcentaje", "Crepado (%)"),
    ("ResistenciaKgf", "Resistencia (kgf)"),
]


def _numero(valor) -> str:
    return format(Decimal(valor).normalize(), "f")


def _texto(campo: str, valor) -> str:
    if campo == "Descripcion":
        return valor or "(sin descripción)"
    return _numero(valor)


def _respuesta(tipo: TipoBobinaServilleta) -> TipoBobinaServilletaResponse:
    return TipoBobinaServilletaResponse(
        IdTipoBobinaServilleta=tipo.IdTipoBobinaServilleta,
        NombreTipoBobinaServilleta=tipo.NombreTipoBobinaServilleta,
        Descripcion=tipo.Descripcion,
        DiametroMm=tipo.DiametroMm,
        CrepadoPorcentaje=tipo.CrepadoPorcentaje,
        ResistenciaKgf=tipo.ResistenciaKgf,
    )


def _DescripcionValida(descripcion: str) -> str:
    limpia = " ".join(descripcion.split())
    if len(limpia) < LONGITUD_MINIMA_DESCRIPCION:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"La descripción debe tener al menos {LONGITUD_MINIMA_DESCRIPCION} caracteres",
        )
    return limpia


class TipoBobinaServilletaService:
    def __init__(self, db: Session):
        self.repository = TipoBobinaServilletaRepository(db)

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
                detail=f"Ya existe un tipo de bobina servilleta llamado {nombre}",
            )

        return nombre

    def ListarTipos(
        self, data: ListarTiposBobinaServilletaRequest
    ) -> ListarTiposBobinaServilletaResponse:
        total, filas = self.repository.ListarTipos(data.model_dump())

        return ListarTiposBobinaServilletaResponse(
            Total=total,
            Pagina=data.Pagina,
            TamanoPagina=data.TamanoPagina,
            Tipos=[TipoBobinaServilletaItem(**fila) for fila in filas],
        )

    def CrearTipo(
        self, datos: CrearTipoBobinaServilletaRequest, id_admin: int
    ) -> TipoBobinaServilletaResponse:
        nombre = self._NombreValido(datos.NombreTipoBobinaServilleta)
        descripcion = _DescripcionValida(datos.Descripcion)

        tipo = TipoBobinaServilleta(
            NombreTipoBobinaServilleta=nombre,
            Descripcion=descripcion,
            DiametroMm=datos.DiametroMm,
            CrepadoPorcentaje=datos.CrepadoPorcentaje,
            ResistenciaKgf=datos.ResistenciaKgf,
        )

        creado = self.repository.CrearTipo(
            tipo,
            lambda t: (
                f"Crear tipo de bobina servilleta · #{t.IdTipoBobinaServilleta} "
                f"{t.NombreTipoBobinaServilleta} (diámetro {_numero(datos.DiametroMm)} mm, "
                f"crepado {_numero(datos.CrepadoPorcentaje)} %, "
                f"resistencia {_numero(datos.ResistenciaKgf)} kgf) · {descripcion}"
            ),
            id_admin,
        )
        return _respuesta(creado)

    def EditarTipo(
        self, datos: EditarTipoBobinaServilletaRequest, id_admin: int
    ) -> TipoBobinaServilletaResponse:
        descripcion = _DescripcionValida(datos.Descripcion)

        tipo = self.repository.ObtenerTipoBloqueado(datos.IdTipoBobinaServilleta)
        if tipo is None:
            self.repository.Revertir()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El tipo de bobina servilleta no existe",
            )

        nuevos = {
            "Descripcion": descripcion,
            "DiametroMm": datos.DiametroMm,
            "CrepadoPorcentaje": datos.CrepadoPorcentaje,
            "ResistenciaKgf": datos.ResistenciaKgf,
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
            f"Editar tipo de bobina servilleta · #{tipo.IdTipoBobinaServilleta} "
            f"{tipo.NombreTipoBobinaServilleta}: " + "; ".join(cambios)
        )
        return _respuesta(self.repository.GuardarEdicion(tipo, observacion, id_admin))
