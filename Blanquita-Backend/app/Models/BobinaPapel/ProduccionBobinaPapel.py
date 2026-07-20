from datetime import datetime

from pydantic import BaseModel


class IniciarProduccionBobinaTuboRequest(BaseModel):
    IdBobina1: int
    IdBobina2: int

class IniciarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaInicioProduccion: datetime
    IdTurno: int
    NombreTurno: str


from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PausarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoPausaProduccion: Optional[str] = None


class PausarProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str] = None
    FechaHoraReanudacion: Optional[datetime] = None
    IdEstadoProduccion: int



from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReanudarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int


class ReanudarProduccionBobinaTuboResponse(BaseModel):
    IdPausaProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraPausa: datetime
    MotivoPausaProduccion: Optional[str] = None
    FechaHoraReanudacion: datetime
    IdEstadoProduccion: int

from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class CancelarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
    MotivoCancelacion: Optional[str] = None


class CancelarProduccionBobinaTuboResponse(BaseModel):
    IdCancelacionProduccionBobinaTubo: int
    IdProduccionBobinaTubo: int
    FechaHoraCancelacion: datetime
    MotivoCancelacion: Optional[str] = None
    IdEstadoProduccion: int


from datetime import datetime
from pydantic import BaseModel


class FinalizarProduccionBobinaTuboRequest(BaseModel):
    IdProduccionBobinaTubo: int
class FinalizarProduccionBobinaTuboResponse(BaseModel):
    IdProduccionBobinaTubo: int
    FechaFinProduccion: datetime
    IdEstadoProduccion: int
    NombreEstadoProduccion: str




from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReingresarBobinaAInventarioRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class ReingresarBobinaAInventarioResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime

from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class DarDeBajaBobinaRequest(BaseModel):
    IdBobinaPapel: int
    Observacion: Optional[str] = None


class DarDeBajaBobinaResponse(BaseModel):
    IdBobinaPapel: int
    IdEstadoMateriaPrima: int
    FechaMovimiento: datetime