import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useState, useEffect } from "react";
import { TextureLoader } from "three";
import { getSatellites, getActiveSatellites } from "./services/satelliteApi";
import { tleToPosition } from "./services/orbitService";

type GroundStation = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: "ONLINE" | "OFFLINE";
};

const groundStations: GroundStation[] = [
  {
    id: 1,
    name: "Toronto",
    latitude: 43.6532,
    longitude: -79.3832,
    status: "ONLINE",
  },
  {
    id: 2,
    name: "Houston",
    latitude: 29.7604,
    longitude: -95.3698,
    status: "OFFLINE",
  },
  {
    id: 3,
    name: "London",
    latitude: 51.5072,
    longitude: -0.1276,
    status: "ONLINE",
  },
];

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

function GroundStationMarker({
  station,
  onSelect,
  selected,
}: {
  station: GroundStation;
  onSelect: (station: GroundStation) => void;
  selected: boolean;
}) {
  const position = latLonToVector3(
    station.latitude,
    station.longitude,
    2.05
  );

  return (
    <mesh 
      position={position}
      onClick={() => onSelect(station)}
    >
      <sphereGeometry
        args={[
          selected ? 0.09 : 0.06,
          16,
          16,
        ]}
      />

      <meshStandardMaterial
        color={
          station.status === "ONLINE"
            ? "lime"
            : "red"
        }
        emissive={
          station.status === "ONLINE"
            ? "lime"
            : "red"
        }
        emissiveIntensity={2}
      />
    </mesh>
  );
}

export default function App() {

  const [selectedLiveSatellite, setSelectedLiveSatellite] =
    useState<any | null>(null);
  
  const [selectedGroundStation, setSelectedGroundStation] =
    useState<GroundStation | null>(null);

  const [search, setSearch] = useState("");

  const [liveSatellites, setLiveSatellites] =
    useState<any[]>([]);

  const [activeSatellites, setActiveSatellites] =
    useState<any[]>([]);

  useEffect(() => {
    getSatellites()
      .then((data) => {
        console.log("FULL DATA:", data);
        console.log("TYPE:", typeof data);
        console.log("LENGTH:", data?.length);

        setLiveSatellites(data);
      })
      .catch((err) => {
        console.error("API ERROR:", err);
      });
  }, []);

  useEffect(() => {
    getActiveSatellites()
      .then((data) => {
        console.log("ACTIVE DATA:", data);

        setActiveSatellites(data);
      })
      .catch((err) => {
        console.error("ACTIVE ERROR:", err);
      });
  }, []);

  useEffect(() => {
    try {
      console.log("START");

      const pos = tleToPosition(
        "1 25544U 98067A   26225.54791667  .00016717  00000+0  10270-3 0  9991",
        "2 25544  51.6428 120.1456 0004297 115.0207  26.5193 15.50060232393958"
      );

      console.log("POSITION:", pos);
    } catch (err) {
      console.error("TLE ERROR:", err);
    }
  }, []);

  const filteredSatellites = liveSatellites.filter(
    (sat) =>
      sat.satname
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  const totalSatellites = liveSatellites.length;

  const totalAlerts = 0;

  const onlineStations =
    groundStations.filter(
      (station) => station.status === "ONLINE"
    ).length;

  const avgBattery = "--";

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

        <Earth />

        {/* REAL SATELLITES */}
          {liveSatellites.map((sat) => (
            <mesh
              key={sat.satid}
              position={latLonToVector3(
                sat.satlat,
                sat.satlng,
                4
              )}
              onClick={() => setSelectedLiveSatellite(sat)}
            >
              <sphereGeometry args={[0.025, 12, 12]} />

              <meshStandardMaterial
                color={
                  selectedLiveSatellite?.satid === sat.satid
                    ? "red"
                    : "cyan"
                }
              />
            </mesh>
          ))}

        {groundStations.map((station) => (
         <GroundStationMarker
          key={station.id}
          station={station}
          onSelect={setSelectedGroundStation}
          selected={
            selectedGroundStation?.id === station.id||false
          }
        />
        ))}

        <OrbitControls />
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
        <p style={{ color: "lime" }}>
          Live Satellites: {liveSatellites.length}
        </p>

        <p style={{ color: "cyan" }}>
          Active Satellites: {activeSatellites.length}
        </p>
        <p style={{ color: "yellow" }}>
          Raw Active Data: {JSON.stringify(activeSatellites).slice(0, 50)}
        </p>

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
            }}
          >
            <div style={{ fontSize: 11, color: "#888" }}>
              ONLINE GS
            </div>

            <div style={{ fontSize: 18 }}>
              {onlineStations}
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
              AVG BATTERY
            </div>

            <div style={{ fontSize: 18 }}>
              {avgBattery}
            </div>
          </div>
        </div>

        
        <h4>Ground Stations</h4>

        <table
          style={{
            width: "100%",
            fontSize: "12px",
            marginBottom: 12,
          }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {groundStations.map((station) => (
              <tr
                key={station.id}
                onClick={() =>
                  setSelectedGroundStation(station)
                }
                style={{
                  cursor: "pointer",
                }}
              >
                <td>{station.name}</td>

                <td
                  style={{
                    color:
                      station.status === "ONLINE"
                        ? "lime"
                        : "red",
                  }}
                >
                  {station.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <h4>Live Satellite</h4>

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
          {filteredSatellites.map((sat) => (
            <tr
              key={sat.satid}
              onClick={() => setSelectedLiveSatellite(sat)}
              style={{
                cursor: "pointer",
              }}
            >
              <td>{sat.satname}</td>

              <td>
                {Math.round(sat.satalt)} km
              </td>

              <td>
                {sat.satlat.toFixed(1)}
              </td>

              <td>
                {sat.satlng.toFixed(1)}
              </td>
            </tr>
          ))}
        </tbody>

        </table>

        <h4>Alerts</h4>

      <p
        style={{
          color: "#888",
          fontSize: "12px",
        }}
      >
        No alert system connected yet
      </p>
        
      </div>

      {/* Info Panel */}

      {selectedLiveSatellite && (
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
    <h3>{selectedLiveSatellite.satname}</h3>

    <p>ID: {selectedLiveSatellite.satid}</p>

    <p>
      Altitude:
      {" "}
      {Math.round(selectedLiveSatellite.satalt)}
      km
    </p>

    <p>
      Latitude:
      {" "}
      {selectedLiveSatellite.satlat.toFixed(2)}
    </p>

    <p>
      Longitude:
      {" "}
      {selectedLiveSatellite.satlng.toFixed(2)}
    </p>

    <p>
      Launch:
      {" "}
      {selectedLiveSatellite.launchDate}
    </p>

    <p>
      Designator:
      {" "}
      {selectedLiveSatellite.intDesignator}
    </p>
  </div>
)}

    </div>
  );
}