export const SuscribirPushRequest = (suscripcion) => {
  const { endpoint, keys } = suscripcion.toJSON();
  return {
    Endpoint: endpoint,
    Claves: { p256dh: keys.p256dh, auth: keys.auth },
  };
};

export const DesuscribirPushRequest = (suscripcion) => ({
  Endpoint: suscripcion.endpoint,
});

export const ClavePublicaPushResponse = (data) => data.ClavePublica ?? null;

export const EstadoSuscripcionPushResponse = (data) => Boolean(data.Suscrito);
