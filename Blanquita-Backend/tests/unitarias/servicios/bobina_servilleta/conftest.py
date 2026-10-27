import pytest
from sqlalchemy.orm import Session

from app.Repository.BobinaServilleta.ProduccionBobinaServilleta import ProduccionBobinaServilletaRepository
from app.Services.BobinaServilleta.ProduccionBobinaServilletaService import ProduccionBobinaServilletaService
from tests.dobles.fabricas import COMPOSICION_G18, TURNO_MANANA, crear_bobina_servilleta
from tests.dobles.repositorios import FakeProduccionServilletaRepository


@pytest.fixture
def sesion_dummy(mocker):
    return mocker.create_autospec(Session, instance=True)


@pytest.fixture
def repo(mocker):
    persistencia = FakeProduccionServilletaRepository()
    repositorio = mocker.create_autospec(ProduccionBobinaServilletaRepository, instance=True)
    repositorio.TurnoActual.return_value = TURNO_MANANA
    repositorio.NombreEstadoProduccion.return_value = "Finalizado"
    repositorio.Agregar.side_effect = persistencia.Agregar
    repositorio.Guardar.side_effect = persistencia.Guardar
    return repositorio


@pytest.fixture
def servicio(sesion_dummy, repo):
    servicio = ProduccionBobinaServilletaService(sesion_dummy)
    servicio.repository = repo
    return servicio


@pytest.fixture
def fake_repo():
    return FakeProduccionServilletaRepository(
        bobinas=[crear_bobina_servilleta(1), crear_bobina_servilleta(2)],
        composiciones={1: COMPOSICION_G18, 2: COMPOSICION_G18},
    )


@pytest.fixture
def servicio_fake(sesion_dummy, fake_repo):
    servicio = ProduccionBobinaServilletaService(sesion_dummy)
    servicio.repository = fake_repo
    return servicio
