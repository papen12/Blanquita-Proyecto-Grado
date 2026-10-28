import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool, QueuePool

from app.Config.supabase import engine, opciones_pool

pytestmark = [pytest.mark.unitaria, pytest.mark.comun]

URL = "postgresql+psycopg2://prueba:prueba@bd-de-prueba.invalid:5432/prueba"


def test_sin_variable_se_mantiene_el_comportamiento_actual():
    assert opciones_pool({}) == {"poolclass": NullPool, "pool_pre_ping": True}


def test_el_engine_de_la_aplicacion_usa_null_pool_por_defecto():
    assert isinstance(engine.pool, NullPool)


@pytest.mark.parametrize("valor", ["nulo", " NULO ", "Nulo"])
def test_nulo_acepta_espacios_y_mayusculas(valor):
    assert opciones_pool({"DB_POOL": valor})["poolclass"] is NullPool


def test_cola_usa_los_valores_por_defecto():
    assert opciones_pool({"DB_POOL": "cola"}) == {
        "poolclass": QueuePool,
        "pool_size": 10,
        "max_overflow": 10,
        "pool_timeout": 10,
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }


def test_cola_toma_los_tamanos_del_entorno():
    opciones = opciones_pool(
        {
            "DB_POOL": "cola",
            "DB_POOL_SIZE": "5",
            "DB_MAX_OVERFLOW": "2",
            "DB_POOL_TIMEOUT": "3",
            "DB_POOL_RECYCLE": "120",
            "DB_POOL_PRE_PING": "0",
        }
    )

    assert (opciones["pool_size"], opciones["max_overflow"], opciones["pool_timeout"]) == (5, 2, 3)
    assert opciones["pool_recycle"] == 120
    assert opciones["pool_pre_ping"] is False


def test_un_modo_desconocido_falla_al_arrancar():
    with pytest.raises(ValueError, match="DB_POOL debe ser 'nulo' o 'cola'"):
        opciones_pool({"DB_POOL": "infinito"})


def test_las_opciones_de_cola_arman_un_engine_valido():
    motor = create_engine(URL, connect_args={"sslmode": "require"}, **opciones_pool({"DB_POOL": "cola", "DB_POOL_SIZE": "4"}))

    assert isinstance(motor.pool, QueuePool)
    assert motor.pool.size() == 4
    assert motor.pool.timeout() == 10
    motor.dispose()
