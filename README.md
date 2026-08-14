# Satellite Tracker

A real-time 3D satellite tracking platform that visualizes live orbital data around Earth, allowing users to monitor satellite positions, trajectories, and metadata through an interactive web-based interface.

---

## Overview

Satellite Tracker is a full-stack web application designed to provide real-time visualization of satellites orbiting Earth. The platform retrieves live orbital data from the N2YO API, propagates satellite positions using Satellite.js, and renders satellites in a fully interactive 3D environment using React Three Fiber and Three.js.

Users can search for satellites, filter orbital objects, inspect satellite details, and explore real-time telemetry through an immersive 3D Earth model.

---

## Features

- Real-time satellite tracking and visualization
- Interactive 3D Earth rendered with React Three Fiber
- Live orbital propagation using Satellite.js
- Integration with N2YO satellite telemetry API
- Search and filtering of satellite objects
- Satellite information panels with orbital details
- Real-time position updates and trajectory rendering
- Responsive web interface optimized for desktop and mobile

---

## Tech Stack

| Category | Technologies |
|-----------|-------------|
| Frontend | React, TypeScript, Vite |
| 3D Visualization | Three.js, React Three Fiber |
| Backend | Node.js, Express |
| Orbital Mechanics | Satellite.js |
| API Integration | N2YO API |
| Styling | CSS, Tailwind CSS |
| Version Control | Git, GitHub |

---

## Data Sources

### N2YO API

The application retrieves live satellite telemetry including:

- Satellite positions
- Orbital elements
- Altitude
- Velocity
- Inclination
- Visibility data

### Satellite.js

Used for:

- Orbital propagation
- Coordinate transformations
- Real-time satellite position calculations
- Ground track generation

---

## Current Capabilities

- Track live satellite positions
- Visualize thousands of orbital objects
- Display satellite metadata and orbital parameters
- Search satellites by name
- Filter displayed satellites
- Navigate an interactive 3D Earth environment

---

## Controls

| Action | Description |
|----------|------------|
| Left Click | Select satellite |
| Scroll Wheel | Zoom in/out |
| Left Click + Drag | Rotate Earth |
| Search Bar | Find satellites by name |
| Filter Panel | Filter displayed satellites |

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Srushti-Patel442/satellite-tracker.git
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Start the backend:

```bash
node server.js
```

Open:

```text
http://localhost:5173
```

---

## Roadmap

- Satellite trajectory prediction
- Ground station visualization
- Collision-risk monitoring
- Historical orbit playback
- Space debris tracking
- Real-time notifications and alerts
- WebSocket-based live updates
- PostgreSQL data storage

---

## Author

**Srushti Patel**

Computer Engineering Student  
Toronto Metropolitan University

GitHub: https://github.com/Srushti-Patel442
