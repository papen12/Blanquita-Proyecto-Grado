from slowapi import Limiter


def obtener_ip_real(request):
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "desconocido"


limiter = Limiter(
    key_func=obtener_ip_real
)