from sqlalchemy.orm import Session
from app.Repository.DbCaller import DbCaller


class PausaProduccionBobinaTuboRepository:
    def __init__(self, db: Session):
        self.caller = DbCaller(db)

    