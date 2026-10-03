import { manejarErrorBackend } from "@/utils/validators";

export async function pedir(url, { method = "GET", body, headers = {} } = {}) {
  const init = { method, headers: { ...headers } };

  if (body !== undefined) {
    init.headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  const response = await fetch(url, init);

  if (!response.ok) {
    await manejarErrorBackend(response);
  }

  return response;
}

export async function pedirJson(url, opciones) {
  const response = await pedir(url, opciones);
  return response.json();
}
