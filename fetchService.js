const post = async (url, payload) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message || 'Error en la petición'}`);
  return { response, data };
};

const get = async (url) => {
  const response = await fetch(url, { method: "GET" });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message || 'Error en la petición'}`);
  return { response, data };
};

const put = async (url, payload) => {
  const response = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message || 'Error en la petición'}`);
  return { response, data };
};

const del = async (url) => {
  const response = await fetch(url, { method: "DELETE" });
  const data = await response.json();
  if (!response.ok) throw new Error(`Error: ${data.message || 'Error en la petición'}`);
  return { response, data };
};

const fetchService = { post, get, put, del };
export default fetchService;