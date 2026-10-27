import pytest
from sqlalchemy.orm import Session

from app.Repository.InventarioFinal.Conteo import ConteoProductoTerminadoRepository
from app.Repository.InventarioFinal.ProductoFinal import ProductoFinalRepository
from app.Services.InventarioFinal.Conteo import ConteoProductoTerminadoService
from app.Services.InventarioFinal.ProductoFinal import ProductoFinalService
from tests.dobles.producto_terminado import (
    NOMBRES_MOVIMIENTO,
    AlmacenProductoTerminadoFake,
    FakeConteoRepository,
    FakeProductoFinalRepository,
)


@pytest.fixture
def sesion_dummy(mocker):
    return mocker.create_autospec(Session, instance=True)


@pytest.fixture
def repo_pt(mocker):
    persistencia = FakeProductoFinalRepository(AlmacenProductoTerminadoFake())
    repositorio = mocker.create_autospec(ProductoFinalRepository, instance=True)
    repositorio.ObtenerBloqueoActivo.return_value = None
    repositorio.IdTurnoActual.return_value = 1
    repositorio.NombreTipoMovimiento.side_effect = NOMBRES_MOVIMIENTO.get
    repositorio.RegistrarMovimientos.side_effect = persistencia.RegistrarMovimientos
    return repositorio


@pytest.fixture
def repo_conteo(mocker):
    repositorio = mocker.create_autospec(ConteoProductoTerminadoRepository, instance=True)
    repositorio.ObtenerConteoAbierto.return_value = None
    repositorio.IdTurnoActual.return_value = 1
    return repositorio


@pytest.fixture
def servicio_pt(sesion_dummy, repo_pt, repo_conteo):
    servicio = ProductoFinalService(sesion_dummy)
    servicio.repository = repo_pt
    servicio.conteo_repository = repo_conteo
    return servicio


@pytest.fixture
def servicio_conteo(sesion_dummy, repo_pt, repo_conteo):
    servicio = ConteoProductoTerminadoService(sesion_dummy)
    servicio.repository = repo_conteo
    servicio.producto_repository = repo_pt
    return servicio


@pytest.fixture
def almacen():
    return AlmacenProductoTerminadoFake()


@pytest.fixture
def servicios_fake(sesion_dummy, almacen):
    repo_pt = FakeProductoFinalRepository(almacen)
    repo_conteo = FakeConteoRepository(almacen)

    pt = ProductoFinalService(sesion_dummy)
    pt.repository = repo_pt
    pt.conteo_repository = repo_conteo

    conteo = ConteoProductoTerminadoService(sesion_dummy)
    conteo.repository = repo_conteo
    conteo.producto_repository = repo_pt

    return pt, conteo
