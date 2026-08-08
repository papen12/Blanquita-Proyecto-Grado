export const IngresoProductoTerminadoItem = ({
  IdPresentacion,
  Cantidad,
  Observacion = null,
}) => ({
  IdPresentacion,
  Cantidad,
  Observacion,
});

export const IngresoProductoTerminadoRequest = ({ Presentaciones = [] }) => ({
  Presentaciones: Presentaciones.map((item) => IngresoProductoTerminadoItem(item)),
});

export const IngresoProductoTerminadoResponse = ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadIngresada,
  CantidadActual,
}) => ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadIngresada,
  CantidadActual,
});

export const IngresoProductoTerminadoResponseList = (jsonList) =>
  (jsonList ?? []).map((item) => IngresoProductoTerminadoResponse(item));

export const SalidaProductoTerminadoItem = ({
  IdPresentacion,
  Cantidad,
  Observacion = null,
}) => ({
  IdPresentacion,
  Cantidad,
  Observacion,
});

export const SalidaProductoTerminadoRequest = ({ Presentaciones = [] }) => ({
  Presentaciones: Presentaciones.map((item) => SalidaProductoTerminadoItem(item)),
});

export const SalidaProductoTerminadoResponse = ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadSalida,
  CantidadActual,
}) => ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadSalida,
  CantidadActual,
});

export const SalidaProductoTerminadoResponseList = (jsonList) =>
  (jsonList ?? []).map((item) => SalidaProductoTerminadoResponse(item));

export const AjustePositivoInventarioRequest = ({
  IdPresentacion,
  Cantidad,
  Observacion = null,
}) => ({
  IdPresentacion,
  Cantidad,
  Observacion,
});

export const AjustePositivoInventarioResponse = ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadAjustada,
  CantidadActual,
}) => ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadAjustada,
  CantidadActual,
});

export const AjusteNegativoInventarioRequest = ({
  IdPresentacion,
  Cantidad,
  Observacion = null,
}) => ({
  IdPresentacion,
  Cantidad,
  Observacion,
});

export const AjusteNegativoInventarioResponse = ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadAjustada,
  CantidadActual,
}) => ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  CantidadAjustada,
  CantidadActual,
});

export const VerInventarioProductoTerminadoRequest = ({ IdProducto = null } = {}) => ({
  IdProducto,
});

export const VerInventarioProductoTerminadoQueryParams = ({ IdProducto = null } = {}) => {
  const params = new URLSearchParams();
  if (IdProducto !== null && IdProducto !== undefined) {
    params.append("IdProducto", IdProducto);
  }
  return params;
};

export const VerInventarioProductoTerminadoResponse = ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  TipoContenedor,
  CantidadRollosUnidades,
  CantidadPorUnidadTerminada,
  CantidadActual,
}) => ({
  IdPresentacion,
  CodigoPresentacion,
  NombreProducto,
  TipoContenedor,
  CantidadRollosUnidades,
  CantidadPorUnidadTerminada,
  CantidadActual,
});

export const VerInventarioProductoTerminadoResponseList = (jsonList) =>
  (jsonList ?? []).map((item) => VerInventarioProductoTerminadoResponse(item));