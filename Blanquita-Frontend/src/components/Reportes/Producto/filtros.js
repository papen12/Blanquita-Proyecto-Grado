import { obtenerProductos } from "@/services/Inventario/Inventario";

export const LINEA_PRODUCTO = {
  cargar: obtenerProductos,
  campo: "IdsProducto",
  campoValor: "IdProducto",
  campoEtiqueta: "NombreProducto",
  etiqueta: "Líneas",
};
