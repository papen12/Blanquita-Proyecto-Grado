import { ProveedorForm } from "../../models/Proveedor/Proveedor";
import { pedirJson } from "@/utils/api";

export async function ObtenerProveedoresForm() {
  const data = await pedirJson("/api/proveedor/formulario");

  return data.map(ProveedorForm);
}