
export const LoginRequest = (ci, clave) => ({
  Ci: ci,
  Clave: clave
});

export const LoginResponse = (data) => ({
  AccessToken: data.AccessToken,
  TokenType: data.TokenType
});

export const RefreshResponse = (data) => ({
  AccessToken: data.AccessToken,
  TokenType: data.TokenType
});

export const LogoutResponse = (data) => ({
  Revocado: data.Revocado
});

export const LogoutTodosResponse = (data) => ({
  SesionesRevocadas: data.SesionesRevocadas
});

export const SesionUsuario = (payload) => ({
  IdUsuario: Number(payload.sub),
  IdRol: Number(payload.rol_id),
  NombreRol: payload.rol
});