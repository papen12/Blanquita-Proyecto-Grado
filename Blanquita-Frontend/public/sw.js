const TITULO_POR_DEFECTO = "Papel Blanquita";
const RUTA_POR_DEFECTO = "/";

self.addEventListener("push", (evento) => {
  const datos = evento.data ? evento.data.json() : {};
  evento.waitUntil(
    self.registration.showNotification(datos.Titulo ?? TITULO_POR_DEFECTO, {
      body: datos.Cuerpo ?? "",
      icon: "/android-chrome-192x192.png",
      badge: "/favicon-32x32.png",
      data: { Ruta: datos.Ruta ?? RUTA_POR_DEFECTO },
    }),
  );
});

self.addEventListener("notificationclick", (evento) => {
  evento.notification.close();
  const ruta = evento.notification.data?.Ruta ?? RUTA_POR_DEFECTO;
  evento.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((ventanas) => {
      const ventana = ventanas.find((cliente) => "focus" in cliente && "navigate" in cliente);
      if (ventana) {
        return ventana
          .navigate(ruta)
          .then((abierta) => (abierta ?? ventana).focus())
          .catch(() => self.clients.openWindow(ruta));
      }
      return self.clients.openWindow(ruta);
    }),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(self.clients.claim());
});
