export const prerender = false;

const BACKEND_URL = import.meta.env.BACKEND_URL;

export const ALL = async ({ request, params, cookies }) => {
  const token = cookies.get("token")?.value;

  if (!token) {
    return new Response(
      JSON.stringify({ detail: "No autenticado" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${params.path}${url.search}`;

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const init = {
    method: request.method,
    headers
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.text();
  }

  const backendResponse = await fetch(targetUrl, init);
  const data = await backendResponse.text();

  return new Response(data, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") || "application/json"
    }
  });
};