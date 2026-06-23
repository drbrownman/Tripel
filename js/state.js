// ============================================================
// CONSTANTS
// ============================================================
const VISIT_TYPES = {
  stay: { label: 'Stay', icon: 'fa-bed', color: '#f1b5a2ff' },
  eat: { label: 'Eat', icon: 'fa-utensils', color: 'var(--accent3)' },
  attraction: { label: 'Attraction', icon: 'fa-star', color: '#f7b7f4ff' },
  photo: { label: 'Photo', icon: 'fa-camera', color: 'var(--accent4)' },
  shop: { label: 'Shop', icon: 'fa-bag-shopping', color: '#b7d8f7ff' },
  transport: { label: 'Transport', icon: 'fa-suitcase-rolling', color: '#b2af23ff)' },
  default: { label: 'Stop', icon: 'fa-crosshairs', color: 'var(--accent)' },
};
const ACTIVITY_MODES = {
  walk: { label: 'Walk', icon: 'fa-person-walking', color: 'var(--accent)' },
  drive: { label: 'Drive', icon: 'fa-car', color: 'var(--accent3)' },
  train: { label: 'Train', icon: 'fa-train', color: 'var(--accent4)' },
  flight: { label: 'Flight', icon: 'fa-plane', color: 'var(--accent4)' },
  boat: { label: 'Boat', icon: 'fa-ship', color: '#4dd8e8' },
  default: { label: 'Travel', icon: 'fa-arrow-right', color: 'var(--text2)' },
};
const TAG_COLORS = { home: 'var(--accent)', work: 'var(--accent4)', chores: 'var(--accent3)', ignore: 'var(--accent2)', none: 'var(--text3)' };
const TAG_LABELS = { home: 'Home', work: 'Work', chores: 'Chores', ignore: 'Ignore', none: 'None' };
const EARTH_R = 6371008.8; // meters


// ============================================================
// APP STATE
// ============================================================
const App = {
  map: null,
  wizardMap: null,
  rawData: [],
  uploadedFiles: [],
  settings: {
    homeRadius: 500,
    minTripDuration: 10,     // hours
    maxTripDuration: 90 * 24,  // hours
    minTripRange: 100,        // km
    minGapBetweenTrips: 12,  // hours
    minStopDuration: 20,     // minutes
    minVisitProb: 0.1,
    minActivityProb: 0.1,
    placeClusterRadius: 500, // meters
  },
  gmapAPIKey: '',
  frequentPlaces: [],
  trips: [],
  currentTripId: null,
  wizardStep: 1,
  spTab: 'overview',
  mapLayers: {},
  regionBboxes: [],
  gmapsCache: {},
  groupByYear: true,
  tripMapLayers: [],
  tripMarkers: {},
};


// ============================================================
// PERSISTENCE (IndexedDB)
// ============================================================
const DB_NAME = 'TripelXYZDB';
const STORE_NAME = 'AppStateStore';

function getDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function saveAppState() {
  try {
    const stateToSave = {
      rawData: App.rawData,
      uploadedFiles: App.uploadedFiles,
      settings: App.settings,
      gmapAPIKey: App.gmapAPIKey,
      frequentPlaces: App.frequentPlaces,
      trips: App.trips,
      currentTripId: App.currentTripId,
      wizardStep: App.wizardStep,
      spTab: App.spTab,
      gmapsCache: App.gmapsCache,
      groupByYear: App.groupByYear
    };
    const jsonStr = JSON.stringify(stateToSave);

    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(jsonStr, 'tripelxyzAppState');
      req.onsuccess = () => {
        if (window.toast) toast('App state saved successfully', 'success');
        resolve();
      };
      req.onerror = (e) => {
        console.error("Save state failed:", e.target.error);
        if (window.toast) toast('Failed to save state. Data might be too large.', 'error');
        reject(e.target.error);
      };
    });
  } catch (e) {
    console.error("Save state failed:", e);
    if (window.toast) toast('Failed to save state.', 'error');
  }
}

async function loadAppState() {
  try {
    const db = await getDB();
    const saved = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get('tripelxyzAppState');
      req.onsuccess = () => resolve(req.result);
      req.onerror = (e) => reject(e.target.error);
    });

    if (saved) {
      const revived = JSON.parse(saved, function (key, value) {
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
          return new Date(value);
        }
        return value;
      });
      Object.assign(App, revived);
      return true;
    }
  } catch (e) {
    console.error("Failed to load state", e);
  }
  return false;
}

async function hasSavedAppState() {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.count('tripelxyzAppState');
      req.onsuccess = () => resolve(req.result > 0);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

async function resumeAppState() {
  const loaded = await loadAppState();
  if (loaded) {
    if (window.closeWizard) closeWizard();
    if (window.showTripsView) showTripsView();
    if (window.toast) toast('Session resumed successfully', 'success');
  } else {
    if (window.toast) toast('Failed to resume session', 'error');
  }
}
