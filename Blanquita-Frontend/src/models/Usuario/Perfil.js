export const PerfilResponse = (data) => ({
  IdUsuario: data.IdUsuario,
  Ci: data.Ci,
  PrimerNombre: data.PrimerNombre,
  SegundoNombre: data.SegundoNombre ?? null,
  ApellidoPaterno: data.ApellidoPaterno,
  ApellidoMaterno: data.ApellidoMaterno ?? null,
  NombreCompleto: data.NombreCompleto,
  Celular: data.Celular ?? null,
  IdRol: data.IdRol,
  NombreRol: data.NombreRol,
  IdEstadoUsuario: data.IdEstadoUsuario,
  NombreEstadoUsuario: data.NombreEstadoUsuario,
  FechaRegistro: data.FechaRegistro,
  Correo: data.Correo ?? null
});
