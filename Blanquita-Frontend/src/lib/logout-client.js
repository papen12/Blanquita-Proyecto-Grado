/**
 * Cierre de sesion desde el cliente.
 *
 * Las cookies de sesion (`token`, `refresh_token`) son httpOnly, por lo que NO
 * se pueden borrar desde JS: hay que pasar por el endpoint del servidor
 * `POST /api/auth/logout`, que ademas revoca los refresh tokens en el backend
 * (logout-todos) y limpia las cookies con `limpiarSesion`.
 *
 * Pase lo que pase con esa llamada, forzamos la salida: limpiamos el estado
 * local y reemplazamos la entrada del historial por `/` para no dejar la vista
 * autenticada accesible con el boton "atras".
 */
let cerrandoSesion = false;

export async function cerrarSesion() {
  if (cerrandoSesion) return;
  cerrandoSesion = true;

  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
  } catch {
    /* sin red: igual forzamos la salida abajo */
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
    /* almacenamiento no disponible */
  }

  window.location.replace("/");
}
