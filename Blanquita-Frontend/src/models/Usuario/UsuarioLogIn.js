export const UsuarioLogin = (Ci, Clave) => ({
  Ci,
  Clave
});

export const UsuarioLoginResponse = (data) => ({
  access_token: data.access_token,
  IdUsuario: data.IdUsuario,
  IdRol: data.IdRol,
  NombreRol: data.NombreRol,
  PrimerNombre: data.PrimerNombre,
  ApellidoPaterno: data.ApellidoPaterno
});

export const UsuarioSesion = (data) => ({
  IdUsuario: data.IdUsuario,
  IdRol: data.IdRol,
  NombreRol: data.NombreRol,
  PrimerNombre: data.PrimerNombre,
  ApellidoPaterno: data.ApellidoPaterno
});