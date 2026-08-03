import { ProveedorForm } from "../../models/Proveedor/Proveedor";
import { manejarErrorBackend } from "@/utils/validators";

export async function ObtenerProveedoresForm() {
  const response = await fetch("/api/proveedor/formulario");

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  const data = await response.json();

  return data.map(ProveedorForm);
}