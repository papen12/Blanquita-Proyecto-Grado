import {
  IngresoProductoTerminadoRequest,
  IngresoProductoTerminadoResponseList,
  SalidaProductoTerminadoRequest,
  SalidaProductoTerminadoResponseList,
  CorreccionProductoTerminadoRequest,
  CorreccionProductoTerminadoResponse,
  VerInventarioProductoTerminadoResponseList,
  ProductoResponse
} from "../../models/Inventario/inventario";

import { pedirJson } from "@/utils/api";
import { conQueryParams } from "@/utils/params";

export async function insertarIngresoProductoTerminado(presentaciones) {
  const payload = IngresoProductoTerminadoRequest({ Presentaciones: presentaciones });

  const data = await pedirJson("/api/productofinal/insertar", {
    method: "POST",
    body: payload
  });

  return IngresoProductoTerminadoResponseList(data);
}

export async function insertarSalidaProductoTerminado(presentaciones) {
  const payload = SalidaProductoTerminadoRequest({ Presentaciones: presentaciones });

  const data = await pedirJson("/api/productofinal/salida", {
    method: "POST",
    body: payload
  });

  return SalidaProductoTerminadoResponseList(data);
}

export async function ajustePositivoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = CorreccionProductoTerminadoRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion
  });

  const data = await pedirJson("/api/productofinal/ajuste/positivo", {
    method: "POST",
    body: payload
  });

  return CorreccionProductoTerminadoResponse(data);
}

export async function ajusteNegativoInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = CorreccionProductoTerminadoRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion
  });

  const data = await pedirJson("/api/productofinal/ajuste/negativo", {
    method: "POST",
    body: payload
  });

  return CorreccionProductoTerminadoResponse(data);
}

export async function corregirInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = CorreccionProductoTerminadoRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion
  });

  const data = await pedirJson("/api/productofinal/correccion", {
    method: "POST",
    body: payload
  });

  return CorreccionProductoTerminadoResponse(data);
}

export async function aumentarInventarioProductoTerminado(idPresentacion, cantidad, observacion) {
  const payload = CorreccionProductoTerminadoRequest({
    IdPresentacion: idPresentacion,
    Cantidad: cantidad,
    Observacion: observacion
  });

  const data = await pedirJson("/api/productofinal/aumento", {
    method: "POST",
    body: payload
  });

  return CorreccionProductoTerminadoResponse(data);
}

export async function verInventarioProductoTerminado(idProducto) {
  const data = await pedirJson(
    conQueryParams("/api/productofinal/inventario/ver", { IdProducto: idProducto })
  );

  return VerInventarioProductoTerminadoResponseList(data);
}

export async function obtenerProductos() {
  const data = await pedirJson("/api/productofinal/obtenerproductos");

  return data.map(ProductoResponse);
}