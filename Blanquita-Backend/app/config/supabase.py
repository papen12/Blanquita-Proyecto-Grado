import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import NullPool, QueuePool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

POOL_NULO = "nulo"
POOL_COLA = "cola"


def opciones_pool(entorno=os.environ) -> dict:
    modo = entorno.get("DB_POOL", POOL_NULO).strip().lower()
    pre_ping = entorno.get("DB_POOL_PRE_PING", "1").strip() != "0"

    if modo == POOL_NULO:
        return {"poolclass": NullPool, "pool_pre_ping": pre_ping}

    if modo == POOL_COLA:
        return {
            "poolclass": QueuePool,
            "pool_size": int(entorno.get("DB_POOL_SIZE", 10)),
            "max_overflow": int(entorno.get("DB_MAX_OVERFLOW", 10)),
            "pool_timeout": int(entorno.get("DB_POOL_TIMEOUT", 10)),
            "pool_recycle": int(entorno.get("DB_POOL_RECYCLE", 300)),
            "pool_pre_ping": pre_ping,
        }

    raise ValueError(f"DB_POOL debe ser '{POOL_NULO}' o '{POOL_COLA}', se recibió '{modo}'")


engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"},
    **opciones_pool(),
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
