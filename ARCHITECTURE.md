# Tripel Architecture

Tripel (https://tripel.xyz) is built entirely as a static, client-side web application. It requires no backend server.

## Directory Structure

```text
/
├── index.html                  # The main entrypoint. Contains structural HTML and loads CSS/JS.
├── css/
│   └── styles.css              # All visual styling and layout for the application.
├── js/
│   ├── state.js                # App state object and global constants.
│   ├── utils.js                # Mathematical, geographical, formatting, and UI utility functions.
│   ├── wizard.js               # Wizard UI flow
│   ├── data-ingestion.js       # File upload parsing, Timeline data merging, and Google Maps API interaction.
│   ├── trip-processing.js      # Core algorithms for place clustering, segmentation, statistics, and naming.
│   ├── trip-visualization.js   # Leaflet map rendering and trip panel interactions.
│   └── main.js                 # App initialization, event listeners binding.
├── regions_provinces_bbox.csv  # Geographical reference data used for naming regions/destinations.
├── README.md                   # Application documentation.
└── ARCHITECTURE.md             # This file.
```

## Module Overview

### `state.js`
Defines the `App` singleton which holds the global application state. It stores uploaded raw data, parsed trips, application settings, geographic layers, and wizard state. Also exports fixed configuration constants such as `VISIT_TYPES`, `ACTIVITY_MODES`, and color mappings. Support for storing and retrieving App state across sessions.

### `utils.js`
A collection of pure functions dealing with logic outside of the main business domain:
- **Geo Math**: `haversine`, `centroid`, bounding box area.
- **Parsing/Formatting**: Coordinate string parsing, date/time string formatting.
- **UI Utils**: `toast` notification system.

### `wizard.js`
- **Wizard Flow**: Manages the step-by-step import and configuration modal.

### `data-ingestion.js`
Responsible for getting data into the application:
- **File Input**: Reads Google Maps Timeline `.json` files, normalizes timestamps, and merges overlapping periods.
- **Geocoding**: Interfaces with the Google Maps Places API to fetch formatted addresses and semantic types for detected places.
- **Region Matching**: Loads the local CSV database to correlate bounding boxes with country/region names.

### `trip-processing.js`
The "brain" of the application:
- **Clustering**: Groups raw geographic coordinate points into distinct "Frequent Places" based on proximity.
- **Segmentation**: Evaluates the timeline sequence, factoring in the user's "Home" location to identify distinct "away" periods (trips).
- **Statistics**: Computes max range, total distance traversed, transportation modes used, and duration.
- **Naming**: Generates human-readable names for trips based on distance, duration, and destination (e.g., "Weekend in Paris - May 2023").

### `trip-visualization.js`
The view layer:
- **Map Control**: Integrates with Leaflet.js to draw routes, map markers (customized for flight vs drive vs walk), and bounding boxes.
- **Trip Panels**: Renders the dynamic HTML for the trip grid and the detailed sidebar panel displaying individual segment information.

### `main.js`
The bootstrap file. It initializes the map layout and kicks off initial data loads once the DOM is ready.
