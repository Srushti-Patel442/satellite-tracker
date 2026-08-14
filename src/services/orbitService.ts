import * as satellite from "satellite.js";

export function tleToPosition(
  tle1: string,
  tle2: string
) {
  const satrec = satellite.twoline2satrec(
    tle1,
    tle2
  );

  const now = new Date();

  const positionAndVelocity =
    satellite.propagate(
      satrec,
      now
    );

  const positionEci =
    positionAndVelocity.position;

  if (!positionEci) {
    return null;
  }

  const gmst =
    satellite.gstime(now);

  const geo =
    satellite.eciToGeodetic(
      positionEci,
      gmst
    );

  return {
    latitude:
      satellite.degreesLat(
        geo.latitude
      ),

    longitude:
      satellite.degreesLong(
        geo.longitude
      ),

    altitude:
      geo.height,
  };
}