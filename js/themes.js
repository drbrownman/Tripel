const PRESET_THEMES = [
  // ── EXISTING THEMES (1-20) ─────────────────────────────────
  {
    id: 'carto-dark',
    name: 'Dark Matter',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#a5c1d6',
    lineWeight: 3,
    flightColor: '#4dd8e8',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#a5c1d6', default: '#a5c1d6' }
  },
  {
    id: 'carto-light',
    name: 'Positron',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#2b506e',
    lineWeight: 3,
    flightColor: '#e07a5f',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#2b506e', default: '#2b506e' }
  },
  {
    id: 'carto-voyager',
    name: 'Voyager',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#e07a5f',
    lineWeight: 4,
    flightColor: '#3d405b',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#3d405b', default: '#e07a5f' }
  },
  {
    id: 'esri-street',
    name: 'World Street Map',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri',
    lineColor: '#1d3557',
    lineWeight: 4,
    flightColor: '#e63946',
    flightWeight: 3,
    flightDashArray: '6, 12',
    markerColors: { home: '#1d3557', default: '#e63946' }
  },
  {
    id: 'esri-topo',
    name: 'World Topo',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri',
    lineColor: '#2a9d8f',
    lineWeight: 4,
    flightColor: '#e76f51',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#264653', default: '#2a9d8f' }
  },
  {
    id: 'esri-imagery',
    name: 'Satellite Imagery',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    lineColor: '#f4a261',
    lineWeight: 4,
    flightColor: '#e76f51',
    flightWeight: 3,
    flightDashArray: '4, 8',
    markerColors: { home: '#ffffff', default: '#f4a261' }
  },
  {
    id: 'esri-natgeo',
    name: 'National Geographic',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri',
    lineColor: '#8ecae6',
    lineWeight: 4,
    flightColor: '#ffb703',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#023047', default: '#8ecae6' }
  },
  {
    "id": "natgeo-classic-adventure",
    "name": "National Geographic Gemini",
    "basemapUrl": "https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",
    "basemapAttr": "Tiles &copy; Esri",
    "lineColor": "#A83232",
    "lineColorLighter": "#D9534F",
    "lineColorLightest": "#F0AD4E",
    "lineWeight": 4,
    lineWeight: 4,
    flightColor: '#D9534F',
    flightWeight: 3,
    "flightDashArray": "4, 8",
    "markerColors": {
      "home": "#1F4E5B",
      "default": "#2E7D73",
      "other": "#8E9B75"
    },
    "textColors": {
      "title": "#2B2B2B",
      "subtitle": "#4A4A4A",
      "description": "#6E6E6E"
    }
  },
  {
    id: 'osm-standard',
    name: 'OSM Standard',
    basemapUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors",
    lineColor: '#d62828',
    lineWeight: 3,
    flightColor: '#003049',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#003049', default: '#d62828' }
  },
  {
    id: 'osm-hot',
    name: 'OSM Humanitarian',
    basemapUrl: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors",
    lineColor: '#bc6c25',
    lineWeight: 4,
    flightColor: '#dda15e',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#283618', default: '#bc6c25' }
  },
  {
    id: 'opentopo',
    name: 'OpenTopoMap',
    basemapUrl: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    basemapAttr: "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors, <a href=\"http://viewfinderpanoramas.org\" target=\"_blank\">SRTM</a> | Map style: &copy; <a href=\"https://opentopomap.org\" target=\"_blank\">OpenTopoMap</a> (<a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" target=\"_blank\">CC-BY-SA</a>)",
    lineColor: '#023e8a',
    lineWeight: 4,
    flightColor: '#0096c7',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#03045e', default: '#023e8a' }
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    basemapUrl: "https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg",
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#606c38',
    lineWeight: 5,
    flightColor: '#bc6c25',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#283618', default: '#606c38' }
  },
  {
    id: 'toner',
    name: 'Toner Black & White',
    basemapUrl: "https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png",
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#e63946',
    lineWeight: 4,
    flightColor: '#457b9d',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#1d3557', default: '#e63946' }
  },
  {
    id: 'pastel',
    name: 'Pastel Dream',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#ffb5a7',
    lineWeight: 5,
    flightColor: '#fcd5ce',
    flightWeight: 4,
    flightDashArray: '4, 8',
    markerColors: { home: '#f08080', default: '#ffb5a7' }
  },
  {
    id: 'neon',
    name: 'Neon Cyberpunk',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#00ffcc',
    lineWeight: 4,
    flightColor: '#ff00ff',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#ff00ff', default: '#00ffcc' }
  },
  {
    id: 'minimalist',
    name: 'Minimalist Clean',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#000000',
    lineWeight: 2,
    flightColor: '#888888',
    flightWeight: 1,
    flightDashArray: '5, 5',
    markerColors: { home: '#000000', default: '#000000' }
  },
  {
    id: 'vintage',
    name: 'Vintage Explorer',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri',
    lineColor: '#8b5a2b',
    lineWeight: 3,
    flightColor: '#cd853f',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#5c4033', default: '#8b5a2b' }
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri',
    lineColor: '#ff6b6b',
    lineWeight: 3,
    flightColor: '#feca57',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#5f27cd', default: '#ff6b6b' }
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#48dbfb',
    lineWeight: 4,
    flightColor: '#1dd1a1',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#ff9ff3', default: '#48dbfb' }
  },
  {
    id: 'autumn',
    name: 'Autumn Leaves',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#d35400',
    lineWeight: 4,
    flightColor: '#f39c12',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#c0392b', default: '#d35400' }
  },
  {
    id: 'purple',
    name: 'Purple Haze',
    basemapUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    basemapAttr: "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors &copy; <a href=\"https://carto.com/attributions\" target=\"_blank\">CARTO</a>",
    lineColor: '#9b59b6',
    lineWeight: 4,
    flightColor: '#8e44ad',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#8e44ad', default: '#9b59b6' }
  },

  // ── NEW THEMES (21-70) ─────────────────────────────────────

  // --- Alidade Smooth ---
  {
    id: 'alidade-smooth-mint',
    name: 'Smooth Mint',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#2ec4b6',
    lineWeight: 3,
    flightColor: '#e71d36',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#011627', default: '#2ec4b6' }
  },
  {
    id: 'alidade-smooth-lavender',
    name: 'Smooth Lavender',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#7b2d8e',
    lineWeight: 3,
    flightColor: '#c77dff',
    flightWeight: 2,
    flightDashArray: '6, 8',
    markerColors: { home: '#3c096c', default: '#7b2d8e' }
  },
  {
    id: 'alidade-smooth-coral',
    name: 'Smooth Coral',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#e07a5f',
    lineWeight: 4,
    flightColor: '#81b29a',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#3d405b', default: '#e07a5f' }
  },

  // --- Alidade Dark ---
  {
    id: 'alidade-dark-ember',
    name: 'Dark Ember',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#ff6b35',
    lineWeight: 3,
    flightColor: '#f7c59f',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#efefd0', default: '#ff6b35' }
  },
  {
    id: 'alidade-dark-arctic',
    name: 'Dark Arctic',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#90e0ef',
    lineWeight: 3,
    flightColor: '#caf0f8',
    flightWeight: 2,
    flightDashArray: '4, 8',
    markerColors: { home: '#caf0f8', default: '#90e0ef' }
  },
  {
    id: 'alidade-dark-neon-green',
    name: 'Dark Neon Green',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#39ff14',
    lineWeight: 3,
    flightColor: '#ccff00',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#ccff00', default: '#39ff14' }
  },

  // --- Alidade Satellite ---
  {
    id: 'alidade-sat-gold',
    name: 'Satellite Gold',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg',
    basemapAttr: '&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#ffd700',
    lineWeight: 4,
    flightColor: '#ff8c00',
    flightWeight: 3,
    flightDashArray: '4, 8',
    markerColors: { home: '#ffffff', default: '#ffd700' }
  },
  {
    id: "alidade-sat-gemini",
    name: "Satellite Gemini",
    basemapUrl: "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg",
    basemapAttr: "&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href=\"https://stadiamaps.com/\" target=\"_blank\">Stadia Maps</a> &copy; <a href=\"https://openmaptiles.org/\" target=\"_blank\">OpenMapTiles</a> &copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a>",
    lineColor: "#FF416C",
    lineColorLight: "#FFD200",
    lineWeight: 4,
    flightColor: "#FF4B2B",
    flightWeight: 3,
    flightDashArray: "4, 8",
    "markerColors": {
      "home": "#FF512F",
      "default": "#F09819",
      "other": "#EDDE5D"
    },
    "textColors": {
      "title": "#FFFFFF",
      "subtitle": "#ECE9E6",
      "description": "#F3E7E9"
    }
  },
  {
    id: 'alidade-sat-electric',
    name: 'Satellite Electric',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg',
    basemapAttr: '&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#00e5ff',
    lineWeight: 4,
    flightColor: '#ea80fc',
    flightWeight: 3,
    flightDashArray: '6, 6',
    markerColors: { home: '#ea80fc', default: '#00e5ff' }
  },

  // --- Stadia Outdoors ---
  {
    id: 'stadia-outdoors-trail',
    name: 'Outdoors Trail',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#588157',
    lineWeight: 4,
    flightColor: '#a3b18a',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#344e41', default: '#588157' }
  },
  {
    id: 'stadia-outdoors-sunset',
    name: 'Outdoors Sunset',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#e63946',
    lineWeight: 4,
    flightColor: '#f4a261',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#264653', default: '#e63946' }
  },

  // --- Terrain ---
  {
    id: 'terrain-earth',
    name: 'Terrain Earth',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#6b4226',
    lineWeight: 4,
    flightColor: '#c19a6b',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#3e2723', default: '#6b4226' }
  },
  {
    id: 'terrain-highlands',
    name: 'Terrain Highlands',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#2d6a4f',
    lineWeight: 4,
    flightColor: '#b7e4c7',
    flightWeight: 3,
    flightDashArray: '6, 8',
    markerColors: { home: '#1b4332', default: '#2d6a4f' }
  },
  {
    id: 'terrain-fire',
    name: 'Terrain Fire',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#d00000',
    lineWeight: 4,
    flightColor: '#ffba08',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#370617', default: '#d00000' }
  },

  // --- Bright ---
  {
    id: 'bright-royal',
    name: 'Bright Royal',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#003566',
    lineWeight: 4,
    flightColor: '#ffc300',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#001d3d', default: '#003566' }
  },
  {
    id: 'bright-rose',
    name: 'Bright Rose',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#c9184a',
    lineWeight: 3,
    flightColor: '#ff758f',
    flightWeight: 2,
    flightDashArray: '4, 8',
    markerColors: { home: '#590d22', default: '#c9184a' }
  },

  // --- Pioneer ---
  {
    id: 'pioneer-expedition',
    name: 'Pioneer Expedition',
    basemapUrl: 'https://api.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#6f1d1b',
    lineWeight: 4,
    flightColor: '#bb9457',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#432818', default: '#6f1d1b' }
  },
  {
    id: 'pioneer-jade',
    name: 'Pioneer Jade',
    basemapUrl: 'https://api.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#006d77',
    lineWeight: 4,
    flightColor: '#83c5be',
    flightWeight: 3,
    flightDashArray: '6, 8',
    markerColors: { home: '#004e64', default: '#006d77' }
  },

  // --- OpenCycleMap ---
  {
    id: 'cycle-velocity',
    name: 'Cycle Velocity',
    basemapUrl: 'https://api.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#0077b6',
    lineWeight: 4,
    flightColor: '#00b4d8',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#023e8a', default: '#0077b6' }
  },
  {
    id: 'cycle-tangerine',
    name: 'Cycle Tangerine',
    basemapUrl: 'https://api.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#fb8500',
    lineWeight: 4,
    flightColor: '#ffb703',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#023047', default: '#fb8500' }
  },

  // --- Transport ---
  {
    id: 'transport-metro',
    name: 'Transport Metro',
    basemapUrl: 'https://api.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#5e60ce',
    lineWeight: 4,
    flightColor: '#7400b8',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#6930c3', default: '#5e60ce' }
  },
  {
    id: 'transport-citrus',
    name: 'Transport Citrus',
    basemapUrl: 'https://api.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#80b918',
    lineWeight: 3,
    flightColor: '#55a630',
    flightWeight: 2,
    flightDashArray: '4, 8',
    markerColors: { home: '#2b9348', default: '#80b918' }
  },

  // --- Landscape ---
  {
    id: 'landscape-meadow',
    name: 'Landscape Meadow',
    basemapUrl: 'https://api.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#4a7c59',
    lineWeight: 4,
    flightColor: '#d4a373',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#2d4a22', default: '#4a7c59' }
  },
  {
    id: 'landscape-canyon',
    name: 'Landscape Canyon',
    basemapUrl: 'https://api.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#ae2012',
    lineWeight: 4,
    flightColor: '#ca6702',
    flightWeight: 3,
    flightDashArray: '6, 8',
    markerColors: { home: '#001219', default: '#ae2012' }
  },

  // --- Outdoors ---
  {
    id: 'outdoors-alpine',
    name: 'Outdoors Alpine',
    basemapUrl: 'https://api.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#1b4965',
    lineWeight: 4,
    flightColor: '#5fa8d3',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#62b6cb', default: '#1b4965' }
  },
  {
    id: 'outdoors-safari',
    name: 'Outdoors Safari',
    basemapUrl: 'https://api.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#b07d62',
    lineWeight: 4,
    flightColor: '#e6b89c',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#4a3728', default: '#b07d62' }
  },
  {
    id: 'outdoors-glacier',
    name: 'Outdoors Glacier',
    basemapUrl: 'https://api.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#48cae4',
    lineWeight: 4,
    flightColor: '#ade8f4',
    flightWeight: 3,
    flightDashArray: '4, 8',
    markerColors: { home: '#0077b6', default: '#48cae4' }
  },

  // --- Transport Dark ---
  {
    id: 'transport-dark-neon',
    name: 'Transport Dark Neon',
    basemapUrl: 'https://api.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#f72585',
    lineWeight: 4,
    flightColor: '#4cc9f0',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#4cc9f0', default: '#f72585' }
  },
  {
    id: 'transport-dark-amber',
    name: 'Transport Dark Amber',
    basemapUrl: 'https://api.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#f9a825',
    lineWeight: 3,
    flightColor: '#ff8f00',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#fff8e1', default: '#f9a825' }
  },
  {
    id: 'transport-dark-matrix',
    name: 'Transport Dark Matrix',
    basemapUrl: 'https://api.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#00ff41',
    lineWeight: 3,
    flightColor: '#76ff03',
    flightWeight: 2,
    flightDashArray: '3, 6',
    markerColors: { home: '#b2ff59', default: '#00ff41' }
  },

  // --- Spinal Map ---
  {
    id: 'spinal-vintage',
    name: 'Spinal Vintage',
    basemapUrl: 'https://api.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#d4a276',
    lineWeight: 4,
    flightColor: '#a98467',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#6c584c', default: '#d4a276' }
  },
  {
    id: 'spinal-mystique',
    name: 'Spinal Mystique',
    basemapUrl: 'https://api.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#7209b7',
    lineWeight: 4,
    flightColor: '#b5179e',
    flightWeight: 3,
    flightDashArray: '4, 8',
    markerColors: { home: '#560bad', default: '#7209b7' }
  },

  // --- Mobile Atlas ---
  {
    id: 'atlas-mobile-breeze',
    name: 'Mobile Breeze',
    basemapUrl: 'https://api.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#219ebc',
    lineWeight: 3,
    flightColor: '#8ecae6',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#023047', default: '#219ebc' }
  },
  {
    id: 'atlas-mobile-sunrise',
    name: 'Mobile Sunrise',
    basemapUrl: 'https://api.thunderforest.com/mobile-atlas/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#e85d04',
    lineWeight: 4,
    flightColor: '#faa307',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#6a040f', default: '#e85d04' }
  },

  // --- Neighbourhood ---
  {
    id: 'neighbourhood-urban',
    name: 'Neighbourhood Urban',
    basemapUrl: 'https://api.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#495057',
    lineWeight: 3,
    flightColor: '#adb5bd',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#212529', default: '#495057' }
  },
  {
    id: 'neighbourhood-bloom',
    name: 'Neighbourhood Bloom',
    basemapUrl: 'https://api.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#c1121f',
    lineWeight: 4,
    flightColor: '#e5383b',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#780000', default: '#c1121f' }
  },

  // --- Atlas ---
  {
    id: 'atlas-navigator',
    name: 'Atlas Navigator',
    basemapUrl: 'https://api.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#1b263b',
    lineWeight: 4,
    flightColor: '#415a77',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#778da9', default: '#1b263b' }
  },
  {
    id: 'atlas-treasure',
    name: 'Atlas Treasure',
    basemapUrl: 'https://api.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#9b2226',
    lineWeight: 4,
    flightColor: '#bb3e03',
    flightWeight: 3,
    flightDashArray: '6, 8',
    markerColors: { home: '#005f73', default: '#9b2226' }
  },

  // --- IceAge ---
  {
    id: 'iceage-frost',
    name: 'Ice Age Frost',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    lineColor: '#577590',
    lineWeight: 4,
    flightColor: '#43aa8b',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#277da1', default: '#577590' }
  },
  {
    id: 'iceage-mammoth',
    name: 'Ice Age Mammoth',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    lineColor: '#7f5539',
    lineWeight: 4,
    flightColor: '#b08968',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#9c6644', default: '#7f5539' }
  },

  // --- MillennialPink ---
  {
    id: 'pink-blush',
    name: 'Blush',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri &mdash; Source: Esri',
    lineColor: '#ff006e',
    lineWeight: 4,
    flightColor: '#fb5607',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#8338ec', default: '#ff006e' }
  },
  {
    id: 'pink-relief-warm',
    name: 'Warm Relief',
    basemapUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
    basemapAttr: 'Tiles &copy; Esri &mdash; Source: Esri',
    lineColor: '#e76f51',
    lineWeight: 4,
    flightColor: '#264653',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#264653', default: '#e76f51' }
  },

  // --- Wikimedia ---
  {
    id: 'wiki-scholar',
    name: 'Wiki Scholar',
    basemapUrl: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png',
    basemapAttr: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    lineColor: '#073b4c',
    lineWeight: 3,
    flightColor: '#118ab2',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#06d6a0', default: '#073b4c' }
  },
  {
    id: 'wiki-heritage',
    name: 'Wiki Heritage',
    basemapUrl: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png',
    basemapAttr: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    lineColor: '#6d6875',
    lineWeight: 3,
    flightColor: '#b5838d',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#e5989b', default: '#6d6875' }
  },

  // ── MORE CROSS-BASEMAP THEME VARIATIONS ────────────────────

  {
    id: 'smooth-monochrome',
    name: 'Smooth Monochrome',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#333333',
    lineWeight: 3,
    flightColor: '#666666',
    flightWeight: 2,
    flightDashArray: '5, 5',
    markerColors: { home: '#111111', default: '#333333' }
  },
  {
    id: 'dark-aurora',
    name: 'Dark Aurora',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#80ffdb',
    lineWeight: 4,
    flightColor: '#72efdd',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#64dfdf', default: '#80ffdb' }
  },
  {
    id: 'pioneer-cartographer',
    name: 'Pioneer Cartographer',
    basemapUrl: 'https://api.thunderforest.com/pioneer/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#283618',
    lineWeight: 4,
    flightColor: '#606c38',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#fefae0', default: '#283618' }
  },
  {
    id: 'cycle-neon-ride',
    name: 'Cycle Neon Ride',
    basemapUrl: 'https://api.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#06d6a0',
    lineWeight: 4,
    flightColor: '#118ab2',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#ef476f', default: '#06d6a0' }
  },
  {
    id: 'landscape-autumn-hike',
    name: 'Landscape Autumn Hike',
    basemapUrl: 'https://api.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#bc4749',
    lineWeight: 4,
    flightColor: '#f2e8cf',
    flightWeight: 3,
    flightDashArray: '6, 8',
    markerColors: { home: '#386641', default: '#bc4749' }
  },
  {
    id: 'spinal-industrial',
    name: 'Spinal Industrial',
    basemapUrl: 'https://api.thunderforest.com/spinal-map/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#5c677d',
    lineWeight: 3,
    flightColor: '#7d8597',
    flightWeight: 2,
    flightDashArray: '5, 10',
    markerColors: { home: '#33415c', default: '#5c677d' }
  },
  {
    id: 'atlas-oceanic',
    name: 'Atlas Oceanic',
    basemapUrl: 'https://api.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=2cb566dda40044a1ab9ffebbce7027fb',
    basemapAttr: 'Maps &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    lineColor: '#0096c7',
    lineWeight: 4,
    flightColor: '#00b4d8',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#03045e', default: '#0096c7' }
  },
  {
    id: 'bright-tropical',
    name: 'Bright Tropical',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#ff9f1c',
    lineWeight: 4,
    flightColor: '#2ec4b6',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#e71d36', default: '#ff9f1c' }
  },
  {
    id: 'terrain-tundra',
    name: 'Terrain Tundra',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png',
    basemapAttr: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#457b9d',
    lineWeight: 4,
    flightColor: '#a8dadc',
    flightWeight: 3,
    flightDashArray: '5, 10',
    markerColors: { home: '#1d3557', default: '#457b9d' }
  },
  {
    id: 'sat-crimson',
    name: 'Satellite Crimson',
    basemapUrl: 'https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}.jpg',
    basemapAttr: '&copy; CNES, Distribution Airbus DS, &copy; Airbus DS, &copy; PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    lineColor: '#ff0a54',
    lineWeight: 4,
    flightColor: '#ff477e',
    flightWeight: 3,
    flightDashArray: '4, 8',
    markerColors: { home: '#ffffff', default: '#ff0a54' }
  }
];

function getTheme(id) {
  return PRESET_THEMES.find(t => t.id === id) || PRESET_THEMES[0];
}
