const API_URL = import.meta.env.VITE_API_URL || '';

export async function api(path, options = {}) {
  const token = localStorage.getItem('valverde-token');
  const response = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const result = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result?.message || 'No se pudo completar la solicitud.');
  return result;
}

export const imageUrl = (image) => {
  if (!image) return '/imagenes/logo.png';
  return `/${image.replace(/^\/+/, '')}`;
};
