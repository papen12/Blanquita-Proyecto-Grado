from datetime import datetime, timezone
from itertools import count

from sqlalchemy import inspect

from app.Schemas.BobinaServilleta import BobinaServilleta, SubBobinaServilleta
from app.Schemas.Produccion import (
    PausaProduccionBobinaTubo,
    PausaProduccionServilleta,
    ProduccionBobinaTubo,
    ProduccionServilleta,
)
from tests.dobles.fabricas import TURNO_MANANA

COLUMNAS_FECHA_SERVIDOR = ("FechaMovimiento", "FechaHoraCancelacion")


class RepositorioEnMemoria:
    def __init__(self, turno=TURNO_MANANA):
        self.turno = turno
        self.guardados: list = []
        self.reversiones = 0
        self.confirmaciones = 0
        self._ids = count(100)

    def TurnoActual(self):
        return self.turno

    def NombreEstadoProduccion(self, id_estado):
        return {3: "Finalizado"}.get(id_estado, "")

    def Agregar(self, *registros):
        for registro in registros:
            self._Persistir(registro)

    def Guardar(self, *registros, mensaje_error):
        for registro in registros:
            self._Persistir(registro)
        self.confirmaciones += 1

    def Revertir(self):
        self.reversiones += 1

    def Guardados(self, clase):
        return [r for r in self.guardados if isinstance(r, clase)]

    def _Persistir(self, registro):
        clave = inspect(type(registro)).primary_key[0].key
        if getattr(registro, clave) is None:
            setattr(registro, clave, next(self._ids))
        for columna in COLUMNAS_FECHA_SERVIDOR:
            if hasattr(registro, columna) and getattr(registro, columna) is None:
                setattr(registro, columna, datetime.now(timezone.utc))
        self._Indexar(registro)
        if registro not in self.guardados:
            self.guardados.append(registro)

    def _Indexar(self, registro):
        pass


class FakeProduccionBobinaPapelRepository(RepositorioEnMemoria):
    def __init__(self, bobinas=(), productos_por_tipo=None, turno=TURNO_MANANA):
        super().__init__(turno)
        self.bobinas = {bobina.IdBobinaPapel: bobina for bobina in bobinas}
        self.productos_por_tipo = productos_por_tipo or {}
        self.producciones: dict[int, ProduccionBobinaTubo] = {}
        self.pausas: list[PausaProduccionBobinaTubo] = []

    def ObtenerBobinasBloqueadas(self, ids_bobina):
        return {i: self.bobinas[i] for i in sorted(ids_bobina) if i in self.bobinas}

    def ObtenerProduccionBloqueada(self, id_produccion):
        return self.producciones.get(id_produccion)

    def ObtenerPausaActiva(self, id_produccion):
        activas = [
            p for p in self.pausas
            if p.IdProduccionBobinaTubo == id_produccion and p.FechaHoraReanudacion is None
        ]
        return activas[-1] if activas else None

    def ProductosDelTipo(self, id_tipo_bobina):
        return list(self.productos_por_tipo.get(id_tipo_bobina, []))

    def _Indexar(self, registro):
        if isinstance(registro, ProduccionBobinaTubo):
            self.producciones[registro.IdProduccionBobinaTubo] = registro
        if isinstance(registro, PausaProduccionBobinaTubo) and registro not in self.pausas:
            self.pausas.append(registro)


class FakeProduccionServilletaRepository(RepositorioEnMemoria):
    def __init__(self, bobinas=(), composiciones=None, turno=TURNO_MANANA):
        super().__init__(turno)
        self.bobinas = {bobina.IdBobinaServilleta: bobina for bobina in bobinas}
        self.composiciones = composiciones or {}
        self.sub_bobinas: dict[int, SubBobinaServilleta] = {}
        self.producciones: dict[int, ProduccionServilleta] = {}
        self.pausas: list[PausaProduccionServilleta] = []

    def ObtenerBobinaBloqueada(self, id_bobina) -> BobinaServilleta | None:
        return self.bobinas.get(id_bobina)

    def ObtenerSubBobinaBloqueada(self, id_sub_bobina):
        return self.sub_bobinas.get(id_sub_bobina)

    def ObtenerProduccionBloqueada(self, id_produccion):
        return self.producciones.get(id_produccion)

    def ObtenerPausaActiva(self, id_produccion):
        activas = [
            p for p in self.pausas
            if p.IdProduccionServilleta == id_produccion and p.FechaHoraReanudacion is None
        ]
        return activas[-1] if activas else None

    def SubBobinasPorUnidad(self, id_bobina):
        return list(self.composiciones.get(id_bobina, []))

    def SubBobinasDeMedida(self, id_tipo_medida, id_estado):
        return [
            s for s in self.sub_bobinas.values()
            if s.IdTipoMedidaSubBobina == id_tipo_medida and s.IdEstadoMateriaPrima == id_estado
        ]

    def _Indexar(self, registro):
        if isinstance(registro, SubBobinaServilleta):
            self.sub_bobinas[registro.IdSubBobinaServilleta] = registro
        if isinstance(registro, ProduccionServilleta):
            self.producciones[registro.IdProduccionServilleta] = registro
        if isinstance(registro, PausaProduccionServilleta) and registro not in self.pausas:
            self.pausas.append(registro)
