import * as satellite from "satellite.js";

export function tleToPosition(
  tle1: string,
  tle2: string
) {
  const satrec = satellite.twoline2satrec(
    tle1,
    tle2
  );

  const pv = satellite.propagate(
    satrec,
    new Date()
  ) as any;

  if (!pv.position) return null;

  const gmst = satellite.gstime(new Date());

  const geo = satellite.eciToGeodetic(
    pv.position,
    gmst
  );

  return {
    latitude: satellite.degreesLat(
      geo.latitude
    ),
    longitude: satellite.degreesLong(
      geo.longitude
    ),
    altitude: geo.height,
  };
}

export function generateOrbitPath(
  tle1: string,
  tle2: string,
  points = 90
) {
  const satrec = satellite.twoline2satrec(
    tle1,
    tle2
  );

  const orbitPoints = [];

  for (let i = 0; i < points; i++) {
    const future = new Date(
      Date.now() + i * 60 * 1000
    );

    const pv = satellite.propagate(
      satrec,
      future
    ) as any;

    if (!pv.position) continue;

    const gmst =
      satellite.gstime(future);

    const geo =
      satellite.eciToGeodetic(
        pv.position,
        gmst
      );

    orbitPoints.push({
      latitude: satellite.degreesLat(
        geo.latitude
      ),
      longitude: satellite.degreesLong(
        geo.longitude
      ),
      altitude: geo.height,
    });
  }

  return orbitPoints;
}