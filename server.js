import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

console.log("EMAIL:", process.env.SPACE_TRACK_EMAIL);
console.log(
  "PASSWORD EXISTS:",
  !!process.env.SPACE_TRACK_PASSWORD
);

const app = express();

app.use(cors());

const API_KEY = "P76JX2-2L5QRR-KSVPBT-5TJP";

app.get("/satellites", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.n2yo.com/rest/v1/satellite/above/43.6532/-79.3832/0/90/0/&apiKey=${API_KEY}`
    );

    res.json(response.data.above);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch satellites" });
  }
});


app.get("/api/stations", async (req, res) => {
  try {
    const response = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json"
    );

    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/tles", async (req, res) => {
  try {
    console.log("Logging into Space-Track...");

    const loginResponse = await fetch(
    "https://www.space-track.org/ajaxauth/login",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        identity:
          process.env.SPACE_TRACK_EMAIL,
        password:
          process.env.SPACE_TRACK_PASSWORD,
      }),
    }
);

console.log(
  "LOGIN STATUS:",
  loginResponse.status
);

console.log(
  "SET COOKIE:",
  loginResponse.headers.get("set-cookie")
);

const loginText =
  await loginResponse.text();

console.log("LOGIN RESPONSE:");
console.log(loginText);
const cookie =
  loginResponse.headers.get("set-cookie");

console.log("COOKIE:");
console.log(cookie);
    if (!cookie) {
      throw new Error(
        "Failed to get Space-Track session cookie"
      );
    }

    console.log("Logged in successfully");

    const tleResponse = await fetch(
      "https://www.space-track.org/basicspacedata/query/class/gp/limit/3000/format/json",
      {
        headers: {
          Cookie: cookie,
        },
      }
    );

    const data =
      await tleResponse.json();

    console.log(
      `Fetched ${data.length} satellites`
    );

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

