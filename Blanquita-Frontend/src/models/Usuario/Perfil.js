const limpiarOpcional = (valor) => {
  const texto = (valor ?? "").trim();
  return texto === "" ? null : texto;
};

export const PerfilUpdateRequest = (datos) => ({
  PrimerNombre: (datos.PrimerNombre ?? "").trim(),
  SegundoNombre: limpiarOpcional(datos.SegundoNombre),
  ApellidoPaterno: (datos.ApellidoPaterno ?? "").trim(),
  ApellidoMaterno: limpiarOpcional(datos.ApellidoMaterno),
  Celular: limpiarOpcional(datos.Celular)
});

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
