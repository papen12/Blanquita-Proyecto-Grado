import {
  LineaItem,
  CrearLineaRequest,
  LineaResponse,
  PresentacionItem,
  CrearPresentacionRequest,
  PresentacionResponse,
} from "@/models/Catalogo/Catalogo";
import { pedirJson } from "@/utils/api";

export async function listarLineas() {
  const data = await pedirJson("/api/catalogo/lineas/listar");
  return data.map(LineaItem);
}

export async function crearLinea(datos) {
  const data = await pedirJson("/api/catalogo/lineas/crear", {
    method: "POST",
    body: CrearLineaRequest(datos),
  });
  return LineaResponse(data);
}

export async function listarProductos() {
  const data = await pedirJson("/api/catalogo/productos/listar");
  return data.map(PresentacionItem);
}

export async function crearProducto(datos) {
  const data = await pedirJson("/api/catalogo/productos/crear", {
    method: "POST",
    body: CrearPresentacionRequest(datos),
  });
  return PresentacionResponse(data);
}
