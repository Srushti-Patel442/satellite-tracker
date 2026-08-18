export function calculateDistance(
  a: [number, number, number],
  b: [number, number, number]
) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];

  return Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  );
}

export function findThreats(
  satellites: any[]
) {
  const threats = [];

  for (let i = 0; i < satellites.length; i++) {
    for (let j = i + 1; j < satellites.length; j++) {

      const satA = satellites[i];
      const satB = satellites[j];

      if (
        !satA ||
        !satB ||
        !satA.position ||
        !satB.position
      ) {
        continue;
      }

      const distance = calculateDistance(
        satA.position,
        satB.position
      );

      if (distance < 0.15) {
        let severity = "LOW";

        if (distance < 0.05) {
          severity = "HIGH";
        } else if (distance < 0.10) {
          severity = "MEDIUM";
        }

        threats.push({
          sat1: satA.name,
          sat2: satB.name,
          distance,
          severity,
        });
      }
    }
  }

  return threats;
}