import pytest
from fastapi import HTTPException

from app.Constants.Estados import (
    ESTADO_MATERIA_PRIMA_ABIERTA,
    ESTADO_MATERIA_PRIMA_AGOTADO,
    ESTADO_MATERIA_PRIMA_EN_ALMACEN,
    ESTADO_MATERIA_PRIMA_EN_PRODUCCION,
    ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO,
    ESTADO_PRODUCCION_CANCELADA,
    ESTADO_PRODUCCION_EN_PRODUCCION,
    ESTADO_PRODUCCION_FINALIZADO,
)
from app.Models.BobinaServilleta.ProduccionBobinaServilleta import (
    AbrirBobinaServilletaRequest,
    CancelarProduccionServilletaRequest,
    FinalizarProduccionServilletaRequest,
    IniciarProduccionServilletaRequest,
    PausaProduccionServilletaRequest,
    ReanudarProduccionServilletaRequest,
)
from app.Schemas.BobinaServilleta import MovimientoSubBobina
from tests.dobles.fabricas import ID_MEDIDA_220, ID_MEDIDA_435

pytestmark = [pytest.mark.servicio, pytest.mark.bobina_servilleta]


def _abrir(servicio, id_bobina=1):
    return servicio.AbrirBobinaServilleta(AbrirBobinaServilletaRequest(IdBobinaServilleta=id_bobina), id_usuario=7)


def _iniciar(servicio, id_sub) -> int:
    return servicio.IniciarProduccionServilleta(
        IniciarProduccionServilletaRequest(IdSubBobina=id_sub), id_usuario=7
    ).IdProduccionServilleta


def _pausar(servicio, id_produccion):
    servicio.PausaProduccionServilleta(
        PausaProduccionServilletaRequest(IdProduccionServilleta=id_produccion, MotivoPausaProduccion="Falla en la cortadora"),
        id_usuario=7,
    )


def _reanudar(servicio, id_produccion):
    servicio.ReanudarProduccionServilleta(
        ReanudarProduccionServilletaRequest(IdProduccionServilleta=id_produccion, MotivoReanudacion="Cortadora reparada"),
        id_usuario=7,
    )


def _finalizar(servicio, id_produccion):
    servicio.FinalizarProduccionServilleta(
        FinalizarProduccionServilletaRequest(IdProduccionServilleta=id_produccion), id_usuario=2
    )


def _cancelar(servicio, id_produccion):
    servicio.CancelarProduccionServilleta(
        CancelarProduccionServilletaRequest(IdProduccionServilleta=id_produccion, MotivoCancelacion="Sub-bobina mojada"),
        id_usuario=2,
    )


def _en_almacen(fake_repo, id_medida):
    return fake_repo.SubBobinasDeMedida(id_medida, ESTADO_MATERIA_PRIMA_EN_ALMACEN)


def test_abrir_libera_sub_bobinas_disponibles_para_produccion(servicio_fake, fake_repo):
    _abrir(servicio_fake)

    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_ABIERTA
    assert len(_en_almacen(fake_repo, ID_MEDIDA_435)) == 5
    assert len(_en_almacen(fake_repo, ID_MEDIDA_220)) == 1
    assert len(fake_repo.Guardados(MovimientoSubBobina)) == 6


def test_una_bobina_madre_no_se_puede_abrir_dos_veces(servicio_fake, fake_repo):
    _abrir(servicio_fake)

    with pytest.raises(HTTPException) as error:
        _abrir(servicio_fake)

    assert error.value.status_code == 409
    assert len(fake_repo.sub_bobinas) == 6


def test_dos_maquinas_producen_en_paralelo_con_sub_bobinas_distintas(servicio_fake, fake_repo):
    _abrir(servicio_fake)
    primera, segunda = _en_almacen(fake_repo, ID_MEDIDA_435)[:2]

    maquina_1 = _iniciar(servicio_fake, primera.IdSubBobinaServilleta)
    maquina_2 = _iniciar(servicio_fake, segunda.IdSubBobinaServilleta)
    _pausar(servicio_fake, maquina_2)
    _reanudar(servicio_fake, maquina_2)
    _finalizar(servicio_fake, maquina_1)
    _pausar(servicio_fake, maquina_2)
    _cancelar(servicio_fake, maquina_2)

    assert fake_repo.producciones[maquina_1].IdEstadoProduccion == ESTADO_PRODUCCION_FINALIZADO
    assert fake_repo.producciones[maquina_2].IdEstadoProduccion == ESTADO_PRODUCCION_CANCELADA
    assert primera.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO
    assert segunda.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_FUERA_INVENTARIO
    assert len(_en_almacen(fake_repo, ID_MEDIDA_435)) == 3
    assert fake_repo.reversiones == 0


def test_una_sub_bobina_en_produccion_no_entra_a_otra_maquina(servicio_fake, fake_repo):
    _abrir(servicio_fake)
    sub = _en_almacen(fake_repo, ID_MEDIDA_220)[0]
    _iniciar(servicio_fake, sub.IdSubBobinaServilleta)

    with pytest.raises(HTTPException) as error:
        _iniciar(servicio_fake, sub.IdSubBobinaServilleta)

    assert error.value.status_code == 409
    assert sub.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_EN_PRODUCCION
    assert len(fake_repo.producciones) == 1


def test_las_sub_bobinas_sobrantes_quedan_en_almacen_para_otro_dia(servicio_fake, fake_repo):
    _abrir(servicio_fake)
    for sub in _en_almacen(fake_repo, ID_MEDIDA_435)[:3]:
        _finalizar(servicio_fake, _iniciar(servicio_fake, sub.IdSubBobinaServilleta))

    assert len(_en_almacen(fake_repo, ID_MEDIDA_435)) == 2
    assert len(_en_almacen(fake_repo, ID_MEDIDA_220)) == 1


def test_pendiente_la_madre_sigue_abierta_aunque_se_agoten_todas_sus_sub_bobinas(servicio_fake, fake_repo):
    _abrir(servicio_fake)
    for sub in list(fake_repo.sub_bobinas.values()):
        _finalizar(servicio_fake, _iniciar(servicio_fake, sub.IdSubBobinaServilleta))

    assert all(s.IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_AGOTADO for s in fake_repo.sub_bobinas.values())
    assert fake_repo.bobinas[1].IdEstadoMateriaPrima == ESTADO_MATERIA_PRIMA_ABIERTA


def test_pendiente_no_se_limita_una_produccion_activa_por_formato(servicio_fake, fake_repo):
    _abrir(servicio_fake)
    for sub in _en_almacen(fake_repo, ID_MEDIDA_435)[:3]:
        _iniciar(servicio_fake, sub.IdSubBobinaServilleta)

    activas = [p for p in fake_repo.producciones.values() if p.IdEstadoProduccion == ESTADO_PRODUCCION_EN_PRODUCCION]
    assert len(activas) == 3
