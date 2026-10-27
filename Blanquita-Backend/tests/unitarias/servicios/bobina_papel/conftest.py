import pytest
from sqlalchemy.orm import Session

from app.Repository.BobinaPapel.ProduccionBobinaPapel import ProduccionBobinaPapelRepository
from app.Services.BobinaPapel.ProduccionBobinaPapelService import ProduccionBobinaPapelService
from tests.dobles.fabricas import (
    ID_TIPO_HIGIENICO,
    ID_TIPO_TOALLA,
    PRODUCTO_ECO,
    PRODUCTO_LUX,
    TURNO_MANANA,
    crear_bobina,
)
from tests.dobles.repositorios import FakeProduccionBobinaPapelRepository


@pytest.fixture
def sesion_dummy(mocker):
    return mocker.create_autospec(Session, instance=True)


@pytest.fixture
def repo(mocker):
    persistencia = FakeProduccionBobinaPapelRepository()
    repositorio = mocker.create_autospec(ProduccionBobinaPapelRepository, instance=True)
    repositorio.TurnoActual.return_value = TURNO_MANANA
    repositorio.ProductosDelTipo.return_value = [PRODUCTO_LUX]
    repositorio.NombreEstadoProduccion.return_value = "Finalizado"
    repositorio.Agregar.side_effect = persistencia.Agregar
    repositorio.Guardar.side_effect = persistencia.Guardar
    return repositorio


@pytest.fixture
def servicio(sesion_dummy, repo):
    servicio = ProduccionBobinaPapelService(sesion_dummy)
    servicio.repository = repo
    return servicio


@pytest.fixture
def fake_repo():
    return FakeProduccionBobinaPapelRepository(
        bobinas=[
            crear_bobina(1),
            crear_bobina(2),
            crear_bobina(3),
            crear_bobina(4, id_tipo=ID_TIPO_TOALLA),
        ],
        productos_por_tipo={ID_TIPO_HIGIENICO: [PRODUCTO_LUX, PRODUCTO_ECO]},
    )


@pytest.fixture
def servicio_fake(sesion_dummy, fake_repo):
    servicio = ProduccionBobinaPapelService(sesion_dummy)
    servicio.repository = fake_repo
    return servicio
