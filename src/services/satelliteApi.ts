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

export async function getStations() {
  const response = await fetch(
    "http://localhost:3001/api/stations"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch stations: ${response.status}`
    );
  }

  return response.json();
}

export async function getTLEs() {
  const response = await fetch(
    "http://localhost:3001/api/tles"
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch TLEs: ${response.status}`
    );
  }

  return response.json();
}
