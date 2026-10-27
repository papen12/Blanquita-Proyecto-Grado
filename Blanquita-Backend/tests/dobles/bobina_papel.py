from datetime import datetime, timezone
from decimal import Decimal
from itertools import count

from fastapi import HTTPException, status

from app.Constants.Estados import ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
from app.Schemas.BobinaPapel import BobinaPapel, LoteBobina, MovimientoBobina
from tests.dobles.fabricas import ID_TIPO_HIGIENICO, ID_TIPO_TOALLA

ID_PROVEEDOR_ACTIVO = 1
ID_PROVEEDOR_INACTIVO = 2
ID_TIPO_ECONOMICO_INACTIVO = 3

PROVEEDORES = {
    ID_PROVEEDOR_ACTIVO: {"IdProveedor": ID_PROVEEDOR_ACTIVO, "NombreProveedor": "Papelera Andina", "Activo": True},
    ID_PROVEEDOR_INACTIVO: {"IdProveedor": ID_PROVEEDOR_INACTIVO, "NombreProveedor": "Papeles del Sur", "Activo": False},
}

TIPOS = {
    ID_TIPO_HIGIENICO: {"IdTipoBobina": ID_TIPO_HIGIENICO, "NombreTipoBobina": "Higiénico", "Activo": True, "TaraKg": Decimal("38")},
    ID_TIPO_TOALLA: {"IdTipoBobina": ID_TIPO_TOALLA, "NombreTipoBobina": "Toalla", "Activo": True, "TaraKg": Decimal("38")},
    ID_TIPO_ECONOMICO_INACTIVO: {"IdTipoBobina": ID_TIPO_ECONOMICO_INACTIVO, "NombreTipoBobina": "Económico", "Activo": False, "TaraKg": Decimal("38")},
}


def bobina_ingreso(codigo: str, bruto="736", neto="698", gramaje="13.9") -> dict:
    return {"CodigoBobina": codigo, "PesoBrutoKg": bruto, "PesoNetoKg": neto, "Gramaje": gramaje}


def _ahora():
    return datetime.now(timezone.utc)


class AlmacenBobinaPapelFake:
    def __init__(self):
        self.bobinas: dict[int, BobinaPapel] = {}
        self.lotes: list[LoteBobina] = []
        self.movimientos: list[MovimientoBobina] = []
        self.reversiones = 0
        self._ids = count(1)

    def por_codigo(self, codigo: str) -> BobinaPapel:
        return next(b for b in self.bobinas.values() if b.CodigoBobina == codigo)

    def movimientos_de(self, bobina: BobinaPapel) -> list[int]:
        return [m.IdTipoMovimiento for m in self.movimientos if m.IdBobinaPapel == bobina.IdBobinaPapel]

    def registrar_movimiento(self, movimiento: MovimientoBobina) -> MovimientoBobina:
        movimiento.IdMovimientoBobina = next(self._ids)
        movimiento.FechaMovimiento = _ahora()
        self.movimientos.append(movimiento)
        return movimiento


class FakeBobinaPapelRepository:
    def __init__(self, almacen: AlmacenBobinaPapelFake):
        self.almacen = almacen

    def ObtenerTipoBobinaPapel(self):
        return sorted(TIPOS.values(), key=lambda t: t["NombreTipoBobina"])

    def ObtenerTipo(self, id_tipo_bobina):
        tipo = TIPOS.get(id_tipo_bobina)
        return {k: tipo[k] for k in ("IdTipoBobina", "NombreTipoBobina", "Activo")} if tipo else None

    def ObtenerProveedor(self, id_proveedor):
        return PROVEEDORES.get(id_proveedor)

    def CodigosRegistrados(self, codigos, excluir_id=None):
        return [
            b.CodigoBobina for b in self.almacen.bobinas.values()
            if b.CodigoBobina.upper() in codigos and b.IdBobinaPapel != excluir_id
        ]

    def RegistrarLote(self, lote, bobinas, id_usuario, observacion):
        lote.IdLoteBobina = next(self.almacen._ids)
        self.almacen.lotes.append(lote)
        for bobina in bobinas:
            bobina.IdLoteBobina = lote.IdLoteBobina
            bobina.IdBobinaPapel = next(self.almacen._ids)
            self.almacen.bobinas[bobina.IdBobinaPapel] = bobina
            self.almacen.registrar_movimiento(
                MovimientoBobina(IdBobinaPapel=bobina.IdBobinaPapel, IdTipoMovimiento=1, IdUsuario=id_usuario, Observacion=observacion)
            )
        return lote

    def ObtenerBobinaBloqueada(self, id_bobina_papel):
        return self.almacen.bobinas.get(id_bobina_papel)

    def RegistrarCorreccion(self, bobina, cambios, movimiento):
        if "CodigoBobina" in cambios and self.CodigosRegistrados([cambios["CodigoBobina"]], bobina.IdBobinaPapel):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe una bobina registrada con ese código")
        for campo, valor in cambios.items():
            setattr(bobina, campo, valor)
        return self.almacen.registrar_movimiento(movimiento)

    def Revertir(self):
        self.almacen.reversiones += 1


class FakeInventarioBobinaPapelRepository:
    def __init__(self, almacen: AlmacenBobinaPapelFake):
        self.almacen = almacen

    def ObtenerBobinaBloqueada(self, id_bobina_papel):
        return self.almacen.bobinas.get(id_bobina_papel)

    def RegistrarMovimiento(self, bobina, movimiento, id_estado):
        bobina.IdEstadoMateriaPrima = id_estado
        return self.almacen.registrar_movimiento(movimiento)

    def VerBobinasFueraInventario(self):
        return [
            {"IdBobinaPapel": b.IdBobinaPapel, "CodigoBobina": b.CodigoBobina}
            for b in self.almacen.bobinas.values()
            if b.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
        ]

    def Revertir(self):
        self.almacen.reversiones += 1
