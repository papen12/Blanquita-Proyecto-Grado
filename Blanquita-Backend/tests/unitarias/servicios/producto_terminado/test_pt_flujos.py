from datetime import datetime

import pytest
import time_machine
from fastapi import HTTPException, status

from app.Constants.Estados import (
    ESTADO_CONTEO_ANULADO,
    ESTADO_CONTEO_CERRADO,
    MOVIMIENTO_PT_AJUSTE_NEGATIVO,
    MOVIMIENTO_PT_AJUSTE_POSITIVO,
    MOVIMIENTO_PT_DESCUENTO,
    MOVIMIENTO_PT_ENTRADA,
    MOVIMIENTO_PT_SALIDA,
)
from app.Models.InventarioFinal.Conteo import (
    AnularConteoProductoTerminadoRequest,
    CerrarConteoProductoTerminadoRequest,
    IniciarConteoProductoTerminadoRequest,
    RegistrarCantidadesConteoRequest,
)
from app.Models.InventarioFinal.ProductoFinal import (
    BloqueoProductoTerminadoRequest,
    CorreccionProductoTerminadoRequest,
    IngresoProductoTerminadoRequest,
    SalidaProductoTerminadoRequest,
)
from app.utils.dates import ZONA_BOLIVIA
from tests.dobles.producto_terminado import (
    ID_ECO_J12,
    ID_LIDER,
    ID_LUX_J24,
    ID_MRO_PLANCHA,
    ID_OPERADOR,
)

pytestmark = [
    pytest.mark.servicio,
    pytest.mark.producto_terminado,
    pytest.mark.usefixtures("horario_laboral"),
]


@pytest.fixture
def horario_laboral():
    with time_machine.travel(datetime(2026, 10, 27, 10, 0, tzinfo=ZONA_BOLIVIA), tick=False):
        yield


@pytest.fixture
def pt(servicios_fake):
    return servicios_fake[0]


@pytest.fixture
def conteo(servicios_fake):
    return servicios_fake[1]


def _ingresar(pt, *items):
    return pt.InsertarIngresoProductoTerminado(
        IngresoProductoTerminadoRequest(Presentaciones=[{"IdPresentacion": i, "Cantidad": c} for i, c in items]),
        id_usuario=ID_OPERADOR,
    )


def _despachar(pt, *items):
    return pt.InsertarSalidaProductoTerminado(
        SalidaProductoTerminadoRequest(
            Observacion="Despacho trailer Potosi",
            Presentaciones=[{"IdPresentacion": i, "Cantidad": c} for i, c in items],
        ),
        id_usuario=ID_OPERADOR,
    )


def _corregir(pt, id_presentacion, cantidad):
    return pt.CorregirInventarioProductoTerminado(
        CorreccionProductoTerminadoRequest(
            IdPresentacion=id_presentacion, Cantidad=cantidad, Observacion="Jabas contadas de mas"
        ),
        id_usuario=ID_OPERADOR,
    )


def _ajustar_positivo(pt, id_presentacion, cantidad):
    return pt.AjustePositivoInventarioProductoTerminado(
        CorreccionProductoTerminadoRequest(
            IdPresentacion=id_presentacion, Cantidad=cantidad, Observacion="Ajuste por revision del lider"
        ),
        id_usuario=ID_LIDER,
    )


def _bloquear(pt, ingreso=False, correccion=False, salida=False):
    return pt.BloquearMovimientos(
        BloqueoProductoTerminadoRequest(
            Motivo="Revision de stock", BloqueaIngreso=ingreso, BloqueaCorreccion=correccion, BloqueaSalida=salida
        ),
        id_usuario=ID_LIDER,
    )


def _iniciar_conteo(conteo):
    return conteo.Iniciar(IniciarConteoProductoTerminadoRequest(Motivo="Conteo de fin de semana"), id_usuario=ID_LIDER)


def _contar(conteo, id_conteo, *items):
    return conteo.RegistrarCantidades(
        id_conteo,
        RegistrarCantidadesConteoRequest(Cantidades=[{"IdPresentacion": i, "CantidadFisica": c} for i, c in items]),
        id_usuario=ID_OPERADOR,
    )


def _cerrar_conteo(conteo, id_conteo, *motivos):
    return conteo.Cerrar(
        id_conteo,
        CerrarConteoProductoTerminadoRequest(
            Motivos=[{"IdPresentacion": i, "Motivo": m} for i, m in motivos], Confirmado=True
        ),
        id_usuario=ID_LIDER,
    )


def _codigo(error: pytest.ExceptionInfo) -> int:
    return error.value.status_code


def test_ingreso_salida_correccion_y_ajuste_mantienen_el_stock(pt, almacen):
    _ingresar(pt, (ID_LUX_J24, 100), (ID_ECO_J12, 40))
    _ingresar(pt, (ID_LUX_J24, 20))
    _despachar(pt, (ID_LUX_J24, 90), (ID_ECO_J12, 40))
    _corregir(pt, ID_LUX_J24, 5)
    _ajustar_positivo(pt, ID_ECO_J12, 3)

    assert almacen.stock(ID_LUX_J24) == 100 + 20 - 90 - 5
    assert almacen.stock(ID_ECO_J12) == 40 - 40 + 3
    assert len(almacen.movimientos_de_tipo(MOVIMIENTO_PT_ENTRADA)) == 3
    assert len(almacen.movimientos_de_tipo(MOVIMIENTO_PT_SALIDA)) == 2
    assert len(almacen.movimientos_de_tipo(MOVIMIENTO_PT_DESCUENTO)) == 1
    assert len(almacen.movimientos_de_tipo(MOVIMIENTO_PT_AJUSTE_POSITIVO)) == 1
    assert almacen.reversiones == 0


def test_salida_con_stock_insuficiente_no_descuenta_ninguna_presentacion(pt, almacen):
    _ingresar(pt, (ID_LUX_J24, 10), (ID_ECO_J12, 2))

    with pytest.raises(HTTPException) as error:
        _despachar(pt, (ID_LUX_J24, 5), (ID_ECO_J12, 3))

    assert _codigo(error) == status.HTTP_409_CONFLICT
    assert almacen.stock(ID_LUX_J24) == 10
    assert almacen.stock(ID_ECO_J12) == 2
    assert almacen.movimientos_de_tipo(MOVIMIENTO_PT_SALIDA) == []


def test_bloqueo_parcial_solo_frena_lo_elegido_y_desbloquear_lo_libera(pt, almacen):
    _ingresar(pt, (ID_LUX_J24, 10))
    _bloquear(pt, ingreso=True)

    with pytest.raises(HTTPException) as error:
        _ingresar(pt, (ID_LUX_J24, 1))
    assert _codigo(error) == status.HTTP_409_CONFLICT

    _despachar(pt, (ID_LUX_J24, 4))
    _corregir(pt, ID_LUX_J24, 1)

    estado = pt.DesbloquearMovimientos(id_usuario=ID_LIDER)
    assert estado.Bloqueado is False

    _ingresar(pt, (ID_LUX_J24, 1))
    assert almacen.stock(ID_LUX_J24) == 10 - 4 - 1 + 1


def test_no_puede_haber_dos_bloqueos_activos(pt):
    _bloquear(pt, salida=True)

    with pytest.raises(HTTPException) as error:
        _bloquear(pt, ingreso=True)

    assert _codigo(error) == status.HTTP_409_CONFLICT


def test_conteo_con_bloqueo_manual_activo_no_inicia(pt, conteo, almacen):
    _ingresar(pt, (ID_LUX_J24, 10))
    _bloquear(pt, salida=True)

    with pytest.raises(HTTPException) as error:
        _iniciar_conteo(conteo)

    assert _codigo(error) == status.HTTP_409_CONFLICT
    assert almacen.conteos == {}


def test_conteo_completo_bloquea_movimientos_y_ajusta_el_inventario(pt, conteo, almacen):
    _ingresar(pt, (ID_LUX_J24, 10), (ID_ECO_J12, 5))
    abierto = _iniciar_conteo(conteo)
    id_conteo = abierto.IdConteoProductoTerminado

    assert {d.IdPresentacion: d.CantidadSistema for d in abierto.Detalle} == {
        ID_LUX_J24: 10,
        ID_ECO_J12: 5,
        ID_MRO_PLANCHA: 0,
    }
    assert pt.VerBloqueo().IdConteoProductoTerminado == id_conteo

    for intento in (
        lambda: _ingresar(pt, (ID_LUX_J24, 1)),
        lambda: _despachar(pt, (ID_LUX_J24, 1)),
        lambda: _corregir(pt, ID_LUX_J24, 1),
        lambda: _ajustar_positivo(pt, ID_LUX_J24, 1),
        lambda: _bloquear(pt, ingreso=True),
        lambda: _iniciar_conteo(conteo),
    ):
        with pytest.raises(HTTPException) as error:
            intento()
        assert _codigo(error) == status.HTTP_409_CONFLICT

    parcial = _contar(conteo, id_conteo, (ID_LUX_J24, 8), (ID_ECO_J12, 5))
    assert parcial.Contadas == 2
    with pytest.raises(HTTPException) as error:
        _cerrar_conteo(conteo, id_conteo, (ID_LUX_J24, "Dos jabas danadas"))
    assert error.value.detail == "Faltan 1 presentaciones por contar antes de cerrar el conteo"

    _contar(conteo, id_conteo, (ID_MRO_PLANCHA, 4))
    cerrado = _cerrar_conteo(
        conteo, id_conteo, (ID_LUX_J24, "Dos jabas danadas"), (ID_MRO_PLANCHA, "Planchas sin registrar")
    )

    assert cerrado.Estado == ESTADO_CONTEO_CERRADO
    assert (cerrado.Faltante, cerrado.Sobrante, cerrado.ConDiferencia) == (2, 4, 2)
    assert almacen.stock(ID_LUX_J24) == 8
    assert almacen.stock(ID_ECO_J12) == 5
    assert almacen.stock(ID_MRO_PLANCHA) == 4
    negativos = almacen.movimientos_de_tipo(MOVIMIENTO_PT_AJUSTE_NEGATIVO)
    positivos = almacen.movimientos_de_tipo(MOVIMIENTO_PT_AJUSTE_POSITIVO)
    assert [(m.IdPresentacion, int(m.CantidadIngresoInventario)) for m in negativos] == [(ID_LUX_J24, 2)]
    assert [(m.IdPresentacion, int(m.CantidadIngresoInventario)) for m in positivos] == [(ID_MRO_PLANCHA, 4)]
    detalle = {d.IdPresentacion: d for d in cerrado.Detalle}
    assert detalle[ID_LUX_J24].IdMovimientoProductoTerminado == negativos[0].IdMovimientoProductoTerminado
    assert detalle[ID_ECO_J12].IdMovimientoProductoTerminado is None

    assert pt.VerBloqueo().Bloqueado is False
    _ingresar(pt, (ID_LUX_J24, 1))
    assert almacen.stock(ID_LUX_J24) == 9


def test_anular_conteo_libera_los_movimientos_sin_tocar_el_stock(pt, conteo, almacen):
    _ingresar(pt, (ID_LUX_J24, 10))
    id_conteo = _iniciar_conteo(conteo).IdConteoProductoTerminado
    _contar(conteo, id_conteo, (ID_LUX_J24, 3))

    anulado = conteo.Anular(
        id_conteo,
        AnularConteoProductoTerminadoRequest(Motivo="Conteo hecho en la bodega equivocada", Confirmado=True),
        id_usuario=ID_LIDER,
    )

    assert anulado.Estado == ESTADO_CONTEO_ANULADO
    assert almacen.stock(ID_LUX_J24) == 10
    assert almacen.movimientos_de_tipo(MOVIMIENTO_PT_AJUSTE_NEGATIVO) == []
    _ingresar(pt, (ID_LUX_J24, 1))
    assert almacen.stock(ID_LUX_J24) == 11


def test_stock_modificado_durante_el_conteo_impide_cerrarlo(pt, conteo, almacen):
    _ingresar(pt, (ID_LUX_J24, 10))
    id_conteo = _iniciar_conteo(conteo).IdConteoProductoTerminado
    _contar(conteo, id_conteo, (ID_LUX_J24, 10), (ID_ECO_J12, 0), (ID_MRO_PLANCHA, 0))
    almacen.inventarios[ID_LUX_J24].CantidadActual = 12

    with pytest.raises(HTTPException) as error:
        _cerrar_conteo(conteo, id_conteo)

    assert _codigo(error) == status.HTTP_409_CONFLICT
    assert "LUX-J24 cambió durante el conteo" in error.value.detail
    assert almacen.reversiones == 1
    assert conteo.VerActivo().Abierto is True
