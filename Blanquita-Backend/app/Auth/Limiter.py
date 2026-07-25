from slowapi import Limiter

limiter=Limiter(
    key_func=lambda request:request.client.host
)