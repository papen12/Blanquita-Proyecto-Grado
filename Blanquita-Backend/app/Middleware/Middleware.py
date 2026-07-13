import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("Backend:")


class LoggingErrorMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        inicio = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as e:
            duracion_ms = round((time.perf_counter() - inicio) * 1000, 2)
            logger.error(
                f"{request.method} {request.url.path} -> excepción no controlada: {e} ({duracion_ms} ms)"
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Error interno del servidor"},
            )

        duracion_ms = round((time.perf_counter() - inicio) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} -> {response.status_code} ({duracion_ms} ms)"
        )
        return response