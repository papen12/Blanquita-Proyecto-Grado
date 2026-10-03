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
  }

  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
  } catch {
  }

  window.location.replace("/");
}
