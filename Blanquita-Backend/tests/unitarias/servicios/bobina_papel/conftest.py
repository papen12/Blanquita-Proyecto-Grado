import pytest
from sqlalchemy.orm import Session

from app.Repository.BobinaPapel.BobinaPapelRepository import BobinaPapelRepository
from app.Repository.BobinaPapel.InventarioBobinaPapel import InventarioBobinaPapelRepository
from app.Repository.BobinaPapel.ProduccionBobinaPapel import ProduccionBobinaPapelRepository
from app.Services.BobinaPapel.BobinaPapelService import BobinaPapelService
from app.Services.BobinaPapel.InventarioBobinaPapelService import InventarioBobinaPapelService
from app.Services.BobinaPapel.ProduccionBobinaPapelService import ProduccionBobinaPapelService
from tests.dobles.bobina_papel import (
    AlmacenBobinaPapelFake,
    FakeBobinaPapelRepository,
    FakeInventarioBobinaPapelRepository,
)
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


@pytest.fixture
def repo_ingreso(mocker):
    almacen = AlmacenBobinaPapelFake()
    persistencia = FakeBobinaPapelRepository(almacen)
    repositorio = mocker.create_autospec(BobinaPapelRepository, instance=True)
    repositorio.ObtenerProveedor.side_effect = persistencia.ObtenerProveedor
    repositorio.ObtenerTipo.side_effect = persistencia.ObtenerTipo
    repositorio.CodigosRegistrados.return_value = []
    repositorio.RegistrarLote.side_effect = persistencia.RegistrarLote
    repositorio.RegistrarCorreccion.side_effect = persistencia.RegistrarCorreccion
    return repositorio


@pytest.fixture
def servicio_ingreso(sesion_dummy, repo_ingreso):
    servicio = BobinaPapelService(sesion_dummy)
    servicio.repository = repo_ingreso
    return servicio


@pytest.fixture
def repo_inventario(mocker):
    persistencia = FakeInventarioBobinaPapelRepository(AlmacenBobinaPapelFake())
    repositorio = mocker.create_autospec(InventarioBobinaPapelRepository, instance=True)
    repositorio.RegistrarMovimiento.side_effect = persistencia.RegistrarMovimiento
    return repositorio


@pytest.fixture
def servicio_inventario(sesion_dummy, repo_inventario):
    servicio = InventarioBobinaPapelService(sesion_dummy)
    servicio.repository = repo_inventario
    return servicio


@pytest.fixture
def almacen_papel():
    return AlmacenBobinaPapelFake()


@pytest.fixture
def planta_papel(sesion_dummy, almacen_papel):
    ingreso = BobinaPapelService(sesion_dummy)
    ingreso.repository = FakeBobinaPapelRepository(almacen_papel)

    inventario = InventarioBobinaPapelService(sesion_dummy)
    inventario.repository = FakeInventarioBobinaPapelRepository(almacen_papel)

    produccion = ProduccionBobinaPapelService(sesion_dummy)
    produccion.repository = FakeProduccionBobinaPapelRepository(
        productos_por_tipo={ID_TIPO_HIGIENICO: [PRODUCTO_LUX, PRODUCTO_ECO]}
    )
    produccion.repository.bobinas = almacen_papel.bobinas

    return ingreso, inventario, produccion
