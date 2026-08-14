export async function getSatellites() {
  const response = await fetch(
    "http://localhost:3001/satellites"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch satellites: ${response.status}`
    );
  }

  return response.json();
}

export async function getActiveSatellites() {
  const response = await fetch(
    "http://localhost:3001/api/active-satellites"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch active satellites: ${response.status}`
    );
  }

  return response.json();
}