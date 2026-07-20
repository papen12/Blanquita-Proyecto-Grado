from sqlalchemy.orm import Session
from app.Repository.BobinaPapel.PausaProduccionBobinaRepository import PausaProduccionBobinaTuboRepository
from app.Models.BobinaPapel.VerPausasProduccionBobina import VerPausasProduccionBobinaTuboActivasRequest, VerPausasProduccionBobinaTuboActivasResponse


class PausaProduccionBobinaTuboService:
    def __init__(self, db: Session):
        self.repository = PausaProduccionBobinaTuboRepository(db)

    def VerPausasActivas(self, data: VerPausasProduccionBobinaTuboActivasRequest) -> list[VerPausasProduccionBobinaTuboActivasResponse]:
        params = {
            "p_FiltroIdTipoBobina": data.FiltroIdTipoBobina,
        }

        resultados = self.repository.VerPausasActivas(params)

        return [VerPausasProduccionBobinaTuboActivasResponse(**resultado) for resultado in resultados]