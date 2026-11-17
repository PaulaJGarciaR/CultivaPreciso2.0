export const DEFAULT_COORDS = { lat: 8.55, lon: -73.15 };

export async function buscarCoordenadas(municipio, signal) {
  if (!municipio) return DEFAULT_COORDS;

  const cacheKey = `coords_${municipio}`;
  const guardado = localStorage.getItem(cacheKey);
  if (guardado) return JSON.parse(guardado);

  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(municipio)}&count=10&language=es&countryCode=CO`;

  const res = await fetch(url, { signal });
  if (!res.ok) return DEFAULT_COORDS;

  const data = await res.json();
  const lugar = data.results?.find((r) => r.admin1 === "Norte de Santander");
  if (!lugar) return DEFAULT_COORDS;

  const coords = { lat: lugar.latitude, lon: lugar.longitude, elevation: lugar.elevation };
  localStorage.setItem(cacheKey, JSON.stringify(coords));
  return coords;
}