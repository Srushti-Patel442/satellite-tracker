import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();

app.use(cors());

const API_KEY = "P76JX2-2L5QRR-KSVPBT-5TJP";

app.get("/satellites", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.n2yo.com/rest/v1/satellite/above/43.6532/-79.3832/0/90/20/&apiKey=${API_KEY}`
    );

    res.json(response.data.above);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch satellites" });
  }
});

app.get("/api/active-satellites", async (req, res) => {
  try {
    const response = await fetch(
      "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json"
    );

    const text = await response.text();

    console.log(text);

    res.send(text);
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

