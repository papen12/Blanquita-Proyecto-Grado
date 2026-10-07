import re
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.Models.BobinaServilleta.TipoBobinaServilleta import (
    CrearTipoBobinaServilletaRequest,
    EditarTipoBobinaServilletaRequest,
    TipoBobinaServilletaDatos,
    TipoBobinaServilletaItem,
    TipoBobinaServilletaResponse,
)
from app.Repository.BobinaServilleta.TipoBobinaServilletaRepository import (
    TipoBobinaServilletaRepository,
)
from app.Schemas.BobinaServilleta import TipoBobinaServilleta

PATRON_NOMBRE_TIPO = r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 -]+$"

CAMPOS_EDITABLES = [
    ("NombreTipoBobinaServilleta", "Nombre"),
    ("DiametroMm", "Diámetro (mm)"),
    ("CrepadoPorcentaje", "Crepado (%)"),
    ("ResistenciaKgf", "Resistencia (kgf)"),
]


def _numero(valor) -> str:
    return format(Decimal(valor).normalize(), "f")


def _texto(campo: str, valor) -> str:
    return valor if campo == "NombreTipoBobinaServilleta" else _numero(valor)


def _respuesta(tipo: TipoBobinaServilleta) -> TipoBobinaServilletaResponse:
    return TipoBobinaServilletaResponse(
        IdTipoBobinaServilleta=tipo.IdTipoBobinaServilleta,
        NombreTipoBobinaServilleta=tipo.NombreTipoBobinaServilleta,
        DiametroMm=tipo.DiametroMm,
        CrepadoPorcentaje=tipo.CrepadoPorcentaje,
        ResistenciaKgf=tipo.ResistenciaKgf,
    )


class TipoBobinaServilletaService:
    def __init__(self, db: Session):
        self.repository = TipoBobinaServilletaRepository(db)

    def _NombreValido(
        self, datos: TipoBobinaServilletaDatos, excluir_id: int | None = None
    ) -> str:
        nombre = " ".join(datos.NombreTipoBobinaServilleta.split())

        if not re.fullmatch(PATRON_NOMBRE_TIPO, nombre):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El nombre solo puede tener letras, números, espacios y guiones",
            )

        if self.repository.NombreEnUso(nombre, excluir_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un tipo de bobina servilleta llamado {nombre}",
            )

        return nombre

    def ListarTipos(self) -> list[TipoBobinaServilletaItem]:
        return [TipoBobinaServilletaItem(**fila) for fila in self.repository.ListarTipos()]

    def CrearTipo(
        self, datos: CrearTipoBobinaServilletaRequest, id_admin: int
    ) -> TipoBobinaServilletaResponse:
        nombre = self._NombreValido(datos)

        tipo = TipoBobinaServilleta(
            NombreTipoBobinaServilleta=nombre,
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
                f"resistencia {_numero(datos.ResistenciaKgf)} kgf)"
            ),
            id_admin,
        )
        return _respuesta(creado)

    def EditarTipo(
        self, datos: EditarTipoBobinaServilletaRequest, id_admin: int
    ) -> TipoBobinaServilletaResponse:
        nombre = self._NombreValido(datos, excluir_id=datos.IdTipoBobinaServilleta)

        tipo = self.repository.ObtenerTipoBloqueado(datos.IdTipoBobinaServilleta)
        if tipo is None:
            self.repository.Revertir()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El tipo de bobina servilleta no existe",
            )

        nuevos = {
            "NombreTipoBobinaServilleta": nombre,
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
            f"Editar tipo de bobina servilleta · #{tipo.IdTipoBobinaServilleta}: "
            + "; ".join(cambios)
        )
        return _respuesta(self.repository.GuardarEdicion(tipo, observacion, id_admin))
