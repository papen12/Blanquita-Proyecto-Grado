from pydantic import BaseModel


class LoginRequest(BaseModel):
    Ci: str
    Clave: str


class RefreshRequest(BaseModel):
    RefreshToken: str


class LoginResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    TokenType: str = "bearer"


class RefreshResponse(BaseModel):
    AccessToken: str
    RefreshToken: str
    TokenType: str = "bearer"


class LogoutResponse(BaseModel):
    Revocado: bool