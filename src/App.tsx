import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import React, { useState, useEffect } from "react";
import { TextureLoader } from "three";
import { getTLEs  } from "./services/satelliteApi";
import { tleToPosition } from "./services/orbitService";
import { findThreats } from "./services/threatDetection";

function Earth() {
  const texture = useLoader(TextureLoader, "/earth.jpg");

  return (
    <mesh>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial
        map={texture}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function latLonToVector3(
  lat: number,
  lon: number,
  radius: number
) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x =
    -(radius * Math.sin(phi) * Math.cos(theta));

  const z =
    radius * Math.sin(phi) * Math.sin(theta);

  const y =
    radius * Math.cos(phi);

  return [x, y, z] as [number, number, number];
}

function getSatelliteType(name: string) {
  const upper = name.toUpperCase();

  if (
    upper.includes("DEB") ||
    upper.includes("DEBRIS")
  ) {
    return "DEBRIS";
  }

  if (
    upper.includes("R/B") ||
    upper.includes("ROCKET")
  ) {
    return "ROCKET";
  }

  return "ACTIVE";
}

export default function App() {

  const [selectedSatellite, setSelectedSatellite] =
    useState<any | null>(null);

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [tleSatellites, setTleSatellites] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [hoveredSatellite, setHoveredSatellite] =
  useState<number | null>(null);

  useEffect(() => {
    getTLEs()
      .then((data) => {
        setTleSatellites(data);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredSatellites = tleSatellites.filter(
    (sat) => {
      const matchesSearch =
        sat.OBJECT_NAME
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const type =
        getSatelliteType(
          sat.OBJECT_NAME || ""
        );

      const matchesFilter =
        filter === "ALL" ||
        filter === type;

      return (
        matchesSearch &&
        matchesFilter
      );
    }
  );

  const satellitePositions =
  filteredSatellites
    .slice(0, 300)
    .map((sat) => {
      try {
        const pos = tleToPosition(
          sat.TLE_LINE1,
          sat.TLE_LINE2
        );

        if (!pos) return null;

        return {
          name: sat.OBJECT_NAME,
          position: latLonToVector3(
            pos.latitude,
            pos.longitude,
            2 + pos.altitude / 2000
          ),
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const totalSatellites = tleSatellites.length;

  const activeCount =
  filteredSatellites.filter(
    (s) =>
      getSatelliteType(
        s.OBJECT_NAME || ""
      ) === "ACTIVE"
  ).length;

  const rocketCount =
    filteredSatellites.filter(
      (s) =>
        getSatelliteType(
          s.OBJECT_NAME || ""
        ) === "ROCKET"
    ).length;

  const debrisCount =
    filteredSatellites.filter(
      (s) =>
        getSatelliteType(
          s.OBJECT_NAME || ""
        ) === "DEBRIS"
    ).length;

  const threats = findThreats(
    satellitePositions as any[]
  );

  const totalAlerts =
    threats.length;

  const activeSatellite = selectedSatellite;

  const handleThreatClick = (
    satName: string
  ) => {
    const sat =
      filteredSatellites.find(
        (s) =>
          s.OBJECT_NAME === satName
      );

    if (!sat) return;

    const pos = tleToPosition(
      sat.TLE_LINE1,
      sat.TLE_LINE2
    );

    if (!pos) return;

    setSelectedSatellite({
      name: sat.OBJECT_NAME,
      altitude: pos.altitude,
      latitude: pos.latitude,
      longitude: pos.longitude,
      norad: sat.NORAD_CAT_ID,
      objectType: getSatelliteType(
        sat.OBJECT_NAME || ""
      ),
    });
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas camera={{ position: [1.5, 0, 6] }}>
        <ambientLight intensity={3} />

        <directionalLight
          position={[10, 10, 10]}
          intensity={3}
        />

        <directionalLight
          position={[-10, -5, -10]}
          intensity={1.5}
        />

        <Stars
          radius={300}
          depth={60}
          count={10000}
          factor={7}
          saturation={0}
          fade
        />

      <group>
        <group
          onClick={() => {
            setSelectedSatellite(null);
            }}
        >
          <Earth />
        </group>

        {filteredSatellites
        .slice(0, 500)
        .map((sat) => {
          try {
            const pos = tleToPosition(
              sat.TLE_LINE1,
              sat.TLE_LINE2
            );

            if (!pos) return null;

            const radius =
            2 + Math.min(pos.altitude, 4000) / 4000;

            const type = getSatelliteType(
              sat.OBJECT_NAME || ""
            );

const isSelected =
  activeSatellite?.norad === sat.NORAD_CAT_ID;

const color = isSelected
  ? "cyan"
  : type === "ACTIVE"
  ? "lime"
  : type === "ROCKET"
  ? "orange"
  : "red";

            return (
            <React.Fragment key={sat.NORAD_CAT_ID}>

              <group
  position={latLonToVector3(
    pos.latitude,
    pos.longitude,
    radius
  )}
>
  {/* Satellite */}
  <mesh
    onPointerOver={() => setHoveredSatellite(sat.NORAD_CAT_ID)}
    onPointerOut={() => setHoveredSatellite(null)}
    onClick={(e) => {
      e.stopPropagation();

      setSelectedSatellite({
        name: sat.OBJECT_NAME,
        altitude: pos.altitude,
        latitude: pos.latitude,
        longitude: pos.longitude,
        norad: sat.NORAD_CAT_ID,
        objectType: getSatelliteType(
          sat.OBJECT_NAME || ""
        ),
      });
    }}
  >
    <sphereGeometry args={[0.015, 8, 8]} />
    <meshStandardMaterial color={color} />
  </mesh>

  {/* Hover / Selected Ring */}
  {(hoveredSatellite === sat.NORAD_CAT_ID ||
    activeSatellite?.norad === sat.NORAD_CAT_ID) && (
    <mesh>
      <ringGeometry args={[0.04, 0.05, 32]} />
      <meshBasicMaterial
        color="#ff66ff"
        side={2}
      />
    </mesh>
  )}
</group>

        </React.Fragment>
      );
    } catch {
      return null;
    }
  })}
        </group>
         <OrbitControls
  enablePan={false}
  enableZoom={true}
  enableRotate={true}
  enableDamping
/>
      </Canvas>

      {/* Search Panel */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 10,
          width: 300,

          height: "calc(100vh - 40px)",
          boxSizing: "border-box",

          background: "#111",
          color: "white",
          padding: 16,
          borderRadius: 8,

          overflowY: "auto",
        }}
      >
      
        <input
          type="text"
          placeholder="Search satellites..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            marginBottom: 12,
            background: "#222",
            color: "white",
            border: "1px solid #444",
            borderRadius: 4,
            boxSizing: "border-box",
          }}
        />
        {loading ? (
          <p style={{ color: "orange" }}>
            Loading satellites...
          </p>
        ) : (
          <p style={{ color: "cyan" }}>
            TLE Satellites: {tleSatellites.length}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <button
            onClick={() => {
              setFilter("ALL");
              setSelectedSatellite(null);
            }}
          >
            All
          </button>

          <button
            onClick={() => {
              setFilter("ACTIVE");
              setSelectedSatellite(null);
            }}
          >
            Active
          </button>

          <button
            onClick={() => {
              setFilter("ROCKET");
              setSelectedSatellite(null);
            }}
          >
            Rocket
          </button>

          <button
            onClick={() => {
              setFilter("DEBRIS");
              setSelectedSatellite(null);
            }}
          >
            Debris
          </button>
        </div>

        <div
          style={{
            background: "#222",
            padding: 8,
            borderRadius: 6,
            marginBottom: 12,
            fontSize: "12px",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 6,
            }}
          >
            Satellite Types
          </div>

          <table style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td style={{ color: "lime" }}>
                  ●
                </td>
                <td>Active</td>
              </tr>

              <tr>
                <td style={{ color: "orange" }}>
                  ●
                </td>
                <td>Rocket Body</td>
              </tr>

              <tr>
                <td style={{ color: "red" }}>
                  ●
                </td>
                <td>Debris</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4>System Overview</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: "#222",
              padding: 8,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, color: "#888" }}>
              SATELLITES
            </div>

            <div style={{ fontSize: 18 }}>
              {totalSatellites}
            </div>
          </div>

          <div
            style={{
              background: "#222",
              padding: 8,
              borderRadius: 6,
            }}
          >
            <div style={{ fontSize: 11, color: "#888" }}>
              ALERTS
            </div>

            <div
              style={{
                fontSize: 18,
                color: totalAlerts > 0 ? "red" : "lime",
              }}
            >
              {totalAlerts}
            </div>
          </div>

          <div
            style={{
              background: "#222",
              padding: 8,
              borderRadius: 6,
              marginBottom: 12,
              fontSize: "12px",
            }}
          >
            <div>🟢 Active: {activeCount}</div>
            <div>🟠 Rocket: {rocketCount}</div>
            <div>🔴 Debris: {debrisCount}</div>
          </div>
        </div>

        <h4>Space-Track Satellites</h4>

        <table
          style={{
            width: "100%",
            fontSize: "12px",
            marginBottom: 12,
          }}
        >
          <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Alt</th>
            <th align="left">Lat</th>
            <th align="left">Lon</th>
          </tr>
          </thead>

          <tbody>
            {filteredSatellites.slice(0, 100).map(
              (sat, index) => {
                try {
                  const pos = tleToPosition(
                    sat.TLE_LINE1,
                    sat.TLE_LINE2
                  );

                  if (!pos) return null;

                  return (
                    <tr
                      key={index}
                        onClick={() => {
                        setSelectedSatellite({
                          name: sat.OBJECT_NAME,
                          altitude: pos.altitude,
                          latitude: pos.latitude,
                          longitude: pos.longitude,
                          norad: sat.NORAD_CAT_ID,
                          objectType: getSatelliteType(
                            sat.OBJECT_NAME || ""
                          ),
                        });

                        }}
                      style={{
                        cursor: "pointer",
                      }}
                    >
                      <td>{sat.OBJECT_NAME}</td>

                      <td>
                        {Math.round(pos.altitude)} km
                      </td>

                      <td>
                        {pos.latitude.toFixed(1)}
                      </td>

                      <td>
                        {pos.longitude.toFixed(1)}
                      </td>
                    </tr>
                  );
                } catch {
                  return null;
                }
              }
            )}
          </tbody>

        </table>
        <h4>Threat Alerts</h4>

        <div
          style={{
            maxHeight: 200,
            overflowY: "auto",
            fontSize: "12px",
          }}
        >
          {threats.length === 0 ? (
            <p style={{ color: "#888" }}>
              No threats detected
            </p>
          ) : (
            threats.slice(0, 20).map(
              (threat, index) => (
                <div
                  key={index}
                  onClick={() =>
                    handleThreatClick(
                      threat.sat1
                    )
                  }
                  style={{
                    cursor: "pointer",
                    padding: 6,
                    background: "#222",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      color:
                        threat.severity === "HIGH"
                          ? "red"
                          : threat.severity === "MEDIUM"
                          ? "orange"
                          : "lime",
                      fontWeight: "bold",
                    }}
                  >
                    {threat.severity}
                  </div>

                  ⚠ {threat.sat1}

                  <br />

                  {threat.sat2}

                  <br />

                  Distance:
                  {" "}
                  {threat.distance.toFixed(3)}
                </div>
              )
            )
          )}
        </div>
        
      </div>

      {/* Info Panel */}

      {activeSatellite && (
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 300,
          background: "#111",
          color: "white",
          padding: 16,
          borderRadius: 8,
        }}
      >
      
      <button
        onClick={() => {
          setSelectedSatellite(null);
        }}
        style={{
          float: "right",
          background: "#222",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        ✕
      </button>

      <h3
        style={{
          marginTop: 0,
          color: "cyan",
        }}
      >
        {activeSatellite.name}
      </h3>

      <hr />

      <p>
        <strong>NORAD:</strong>{" "}
        {activeSatellite.norad}
      </p>

      <p>
        <strong>Type:</strong>{" "}
        {activeSatellite.objectType}
      </p>

      <p>
        <strong>Altitude:</strong>{" "}
        {Math.round(
          activeSatellite.altitude
        )} km
      </p>

      <p>
        <strong>Latitude:</strong>{" "}
        {activeSatellite.latitude.toFixed(2)}
      </p>

      <p>
        <strong>Longitude:</strong>{" "}
        {activeSatellite.longitude.toFixed(2)}
      </p>
      </div>
    )}

    </div>
  );
}