// ============================================================
// INFO CARD STAT DEFINITIONS
// ============================================================
const INFO_CARD_STATS = {
  totalDistance: { label: 'Total Distance', icon: 'fa-route', unit: 'km', getValue: s => s.distKm || 0 },
  tripDays: { label: 'Trip Duration', icon: 'fa-calendar-days', unit: 'days', getValue: s => s.days || 0 },
  tripHours: { label: 'Trip Duration', icon: 'fa-clock', unit: 'hrs', getValue: (s, trip) => Math.round((trip.endTime - trip.startTime) / 3600000) },
  flightCount: { label: 'Flights', icon: 'fa-plane', unit: '', getValue: s => s.transportModes?.flight || 0 },
  trainCount: { label: 'Train Rides', icon: 'fa-train', unit: '', getValue: s => s.transportModes?.train || 0 },
  boatCount: { label: 'Boat Rides', icon: 'fa-ship', unit: '', getValue: s => s.transportModes?.boat || 0 },
  driveCount: { label: 'Drives', icon: 'fa-car', unit: '', getValue: s => s.transportModes?.drive || 0 },
  maxDailyDistance: { label: 'Max Distance in a Day', icon: 'fa-arrows-left-right', unit: 'km', getValue: s => s.maxDailyDistKm || 0 },
  longestTravelDay: { label: 'Longest Travel Day', icon: 'fa-hourglass-half', unit: 'hrs', getValue: s => s.longestTravelDayHrs || 0 },
  maxSpeedNoFlights: { label: 'Max Speed (no flights)', icon: 'fa-gauge-high', unit: 'km/h', getValue: s => s.maxSpeedNoFlightsKmh || 0 },
  stops: { label: 'Stops', icon: 'fa-location-dot', unit: '', getValue: s => s.stops || 0 },
};

function formatInfoCardValue(statKey, stats, trip) {
  const def = INFO_CARD_STATS[statKey];
  if (!def) return '—';
  const val = def.getValue(stats, trip);
  return def.unit ? `${val} ${def.unit}` : `${val}`;
}


// ============================================================
// SLIDESHOW PANEL RENDERER
// ============================================================
function renderSpSlideshow(trip, container) {
  if (!trip.slides) trip.slides = [];

  enterSlideshowMode();

  let html = `
    <div class="info-card">
      <div class="info-card-title">Create Slide</div>
      <p style="font-size:13px;color:var(--text2);margin-bottom:12px;">Pan and zoom the square map view, then capture it as a slide.</p>
      <button class="btn accent w-100" onclick="captureSlide()"><i class="fa-solid fa-camera"></i> Capture Current View</button>
    </div>

    <div class="section-label" style="margin-top:20px;">Saved Slides (${trip.slides.length})</div>
    <div id="slide-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:12px; margin-top:12px;">
  `;

  trip.slides.forEach((s, idx) => {
    html += `
      <div class="info-card" style="padding:12px; cursor:pointer; position:relative; border:1px solid transparent;" onclick="previewSlide('${s.id}'); editSlide('${s.id}'); document.querySelectorAll('#slide-list .info-card').forEach(c=>c.style.borderColor='transparent'); this.style.borderColor='var(--accent)';" id="slide-tile-${s.id}">
        <div style="font-weight:600; font-size:13px; text-align:center;">Slide ${idx + 1}</div>
        <div style="font-size:11px; color:var(--text2); text-align:center; margin-top:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${s.title}">${s.title || 'Untitled'}</div>
      </div>
    `;
  });

  html += `</div>`;
  html += `<div id="slide-editor-container" style="margin-top:20px;"></div>`;
  container.innerHTML = html;

  // Create overlay element if it doesn't exist
  if (!document.getElementById('slide-overlay')) {
    const mapDiv = document.getElementById('map');
    const overlay = document.createElement('div');
    overlay.id = 'slide-overlay';
    overlay.style.position = 'absolute';
    overlay.style.zIndex = '1000';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '8px';
    overlay.style.display = 'none';
    overlay.style.fontFamily = 'var(--font-head)';
    overlay.style.cursor = 'grab';
    overlay.innerHTML = `
      <h1 id="slide-title" style="margin:0; font-size:32px; color:white;"></h1>
      <h2 id="slide-subtitle" style="margin:8px 0 0; font-size:20px; color:white; font-weight:500;"></h2>
      <p id="slide-desc" style="margin:8px 0 0; font-size:16px; color:rgba(255,255,255,0.9); font-family:var(--font-body);"></p>
    `;
    mapDiv.appendChild(overlay);

    makeDraggable(overlay, {
      get x() {
        const trip = App.trips.find(t => t.id === App.currentTripId);
        if (!trip) return 5;
        const slide = trip.slides.find(s => s.id === window._currentPreviewSlideId);
        return slide ? (slide.titleX ?? 5) : 5;
      },
      set x(val) {
        const trip = App.trips.find(t => t.id === App.currentTripId);
        if (!trip) return;
        const slide = trip.slides.find(s => s.id === window._currentPreviewSlideId);
        if (slide) slide.titleX = val;
      },
      get y() {
        const trip = App.trips.find(t => t.id === App.currentTripId);
        if (!trip) return 75;
        const slide = trip.slides.find(s => s.id === window._currentPreviewSlideId);
        return slide ? (slide.titleY ?? 75) : 75;
      },
      set y(val) {
        const trip = App.trips.find(t => t.id === App.currentTripId);
        if (!trip) return;
        const slide = trip.slides.find(s => s.id === window._currentPreviewSlideId);
        if (slide) slide.titleY = val;
      }
    }, null, mapDiv);
  }
}

// ── Slideshow mode: position map as a centered square ──

function enterSlideshowMode() {
  document.body.classList.add('slideshow-active');
  positionSquareMap();
  updateGuideOverlay();
  App.map.invalidateSize();

  // Reposition on window resize
  if (!App._slideshowResizeHandler) {
    App._slideshowResizeHandler = () => {
      if (document.body.classList.contains('slideshow-active')) {
        positionSquareMap();
        updateGuideOverlay();
        App.map.invalidateSize();
      }
    };
    window.addEventListener('resize', App._slideshowResizeHandler);
  }
}

function positionSquareMap() {
  const mapEl = document.getElementById('map');
  // Get the available area (everything to the left of the side panel)
  const sidePanelW = 400;
  const headerH = 54;
  const availW = window.innerWidth - sidePanelW;
  const availH = window.innerHeight - headerH;
  const size = Math.min(availW - 60, availH - 60); // 30px padding on each side

  mapEl.style.position = 'fixed';
  mapEl.style.width = size + 'px';
  mapEl.style.height = size + 'px';
  mapEl.style.top = (headerH + (availH - size) / 2) + 'px';
  mapEl.style.left = ((availW - size) / 2) + 'px';
  mapEl.style.right = 'auto';
  mapEl.style.bottom = 'auto';
}

function updateGuideOverlay() {
  const overlay = document.getElementById('slideshow-guide-overlay');
  if (!overlay) return;
  const mapEl = document.getElementById('map');
  const rect = mapEl.getBoundingClientRect();

  // Draw the semi-transparent mask around the map square using an SVG with a cutout
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Only cover the area to the left of the sidebar
  const sidePanelW = 400;
  const maskW = w - sidePanelW;

  overlay.innerHTML = `<svg width="${maskW}" height="${h}" style="position:fixed;top:0;left:0;">
    <defs>
      <mask id="guide-mask">
        <rect width="${maskW}" height="${h}" fill="white"/>
        <rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" fill="black"/>
      </mask>
    </defs>
    <rect width="${maskW}" height="${h}" fill="rgba(0,0,0,0.55)" mask="url(#guide-mask)"/>
  </svg>`;
}

// ============================================================
// CAPTURE SLIDE
// ============================================================
window.captureSlide = function () {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  const center = App.map.getCenter();
  const zoom = App.map.getZoom();

  trip.slides.push({
    id: Date.now().toString(),
    center: [center.lat, center.lng],
    zoom: zoom,
    title: trip.name,
    subtitle: '',
    description: '',
    overlayColor: '#000000',
    overlayOpacity: 0.6,
    titleColor: '#ffffff',
    titleX: 5,
    titleY: 75,
    // Basemap controls
    hideBasemap: false,
    backgroundColor: '#0d0f14',
    // Info cards
    infoCards: [],
  });

  renderSpTab();
  toast('Slide captured', 'success');
};

// ============================================================
// PREVIEW SLIDE
// ============================================================
window.previewSlide = function (id) {
  window._currentPreviewSlideId = id;
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === id);
  if (!slide) return;

  App.map.setView(slide.center, slide.zoom);

  // Apply basemap visibility
  applySlideBasemap(slide);

  applySlideOverlay(slide);

  // Render info cards on map
  renderInfoCards(slide, trip);
};

// ============================================================
// BASEMAP SHOW/HIDE
// ============================================================
function applySlideBasemap(slide) {
  const mapEl = document.getElementById('map');
  const leafletContainer = mapEl.querySelector('.leaflet-tile-pane') || mapEl;

  if (slide.hideBasemap) {
    // Hide basemap tiles
    if (App.mapLayers.basemap) {
      App.mapLayers.basemap.setOpacity(0);
    }
    // Set background color on the map container
    mapEl.style.backgroundColor = slide.backgroundColor || '#0d0f14';
  } else {
    // Show basemap tiles
    if (App.mapLayers.basemap) {
      App.mapLayers.basemap.setOpacity(1);
    }
    mapEl.style.backgroundColor = '';
  }
}

function restoreBasemap() {
  if (App.mapLayers.basemap) {
    App.mapLayers.basemap.setOpacity(1);
  }
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.style.backgroundColor = '';
}

// ============================================================
// EDIT SLIDE
// ============================================================
window.editSlide = function (id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const s = trip.slides.find(s => s.id === id);
  if (!s) return;

  // Ensure new properties exist for older slides
  if (s.hideBasemap === undefined) s.hideBasemap = false;
  if (s.backgroundColor === undefined) s.backgroundColor = '#0d0f14';
  if (!s.infoCards) s.infoCards = [];

  // Highlight tile
  document.querySelectorAll('#slide-list .info-card').forEach(c => c.style.borderColor = 'transparent');
  const tile = document.getElementById(`slide-tile-${id}`);
  if (tile) tile.style.borderColor = 'var(--accent)';

  previewSlide(id);

  const cont = document.getElementById('slide-editor-container');

  // Build info cards editor HTML
  const infoCardsHtml = buildInfoCardsEditorHtml(s, trip);

  cont.innerHTML = `
    <div class="info-card">
      <div class="info-card-title">Editing Slide</div>

      <div class="setting-group" style="padding:0; border:none; margin-bottom:8px;">
        <label>Title</label>
        <input type="text" class="db-input" value="${s.title}" oninput="updateSlide('${s.id}', 'title', this.value); document.getElementById('slide-tile-${s.id}').children[1].textContent=this.value;">
      </div>
      <div class="setting-group" style="padding:0; border:none; margin-bottom:8px;">
        <label>Subtitle</label>
        <input type="text" class="db-input" value="${s.subtitle}" oninput="updateSlide('${s.id}', 'subtitle', this.value)">
      </div>
      <div class="setting-group" style="padding:0; border:none; margin-bottom:8px;">
        <label>Description</label>
        <textarea class="db-input" rows="2" oninput="updateSlide('${s.id}', 'description', this.value)">${s.description}</textarea>
      </div>
      <div class="setting-group" style="padding:0; border:none; margin-bottom:8px;">
        <label>Overlay Color</label>
        <input type="color" value="${s.overlayColor || '#000000'}" onchange="updateSlide('${s.id}', 'overlayColor', this.value)">
        <input type="number" min="0" max="1" step="0.1" style="width:60px;" class="db-input" value="${s.overlayOpacity ?? 0.6}" onchange="updateSlide('${s.id}', 'overlayOpacity', this.value)" title="Opacity (0 to 1)">
        <span style="font-size:12px;color:var(--text2);margin-left:8px;">Text</span>
        <input type="color" value="${s.titleColor || '#ffffff'}" onchange="updateSlide('${s.id}', 'titleColor', this.value)" style="width:28px;height:24px;padding:0;border:none;">
      </div>

      <div style="border-top:1px solid var(--border); margin:12px 0; padding-top:12px;">
        <div class="info-card-title" style="margin-bottom:8px;">Map Background</div>
        <label style="display:flex;align-items:center;gap:8px;margin-bottom:8px;cursor:pointer;">
          <input type="checkbox" ${s.hideBasemap ? 'checked' : ''} onchange="toggleSlideBasemap('${s.id}', this.checked)">
          <span style="font-size:13px;">Hide basemap tiles</span>
        </label>
        <div id="bg-color-row-${s.id}" style="display:${s.hideBasemap ? 'flex' : 'none'};align-items:center;gap:8px;">
          <span style="font-size:12px;color:var(--text2);">Background</span>
          <input type="color" value="${s.backgroundColor || '#0d0f14'}" onchange="updateSlideBackground('${s.id}', this.value)">
        </div>
      </div>

      <div style="border-top:1px solid var(--border); margin:12px 0; padding-top:12px;">
        <div class="info-card-title" style="margin-bottom:8px;">Information Cards</div>
        <div id="info-cards-editor-${s.id}">
          ${infoCardsHtml}
        </div>
        <button class="btn ghost sm w-100" style="margin-top:8px;" onclick="addInfoCard('${s.id}')">
          <i class="fa-solid fa-plus"></i> Add Info Card
        </button>
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn accent w-100" onclick="downloadSlide('${s.id}')"><i class="fa-solid fa-download"></i> Download</button>
        <button class="btn accent w-100" onclick="updateSlide('${s.id}', 'center', App.map.getCenter()); updateSlide('${s.id}', 'zoom', App.map.getZoom());"><i class="fa-solid fa-save"></i> Save view</button>
        <button class="btn error w-100" style="background:var(--error);color:white;border:none;" onclick="deleteSlide('${s.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    </div>
  `;
};

// ============================================================
// INFO CARDS EDITOR HTML
// ============================================================
function buildInfoCardsEditorHtml(slide, trip) {
  if (!slide.infoCards || !slide.infoCards.length) {
    return '<p style="font-size:12px;color:var(--text3);margin:4px 0;">No info cards yet. Add one below.</p>';
  }

  const stats = trip.stats || {};

  return slide.infoCards.map((card, idx) => {
    const statOptions = Object.entries(INFO_CARD_STATS).map(([key, def]) => {
      const val = formatInfoCardValue(key, stats, trip);
      return `<option value="${key}" ${card.statKey === key ? 'selected' : ''}>${def.label} (${val})</option>`;
    }).join('');

    return `
      <div class="info-card" style="padding:8px;margin-bottom:6px;background:var(--surface3);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:11px;font-weight:600;color:var(--text2);">Card ${idx + 1}</span>
          <button class="btn ghost sm" style="padding:2px 6px;font-size:11px;" onclick="removeInfoCard('${slide.id}', '${card.id}')">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <select class="db-input" style="font-size:12px;margin-bottom:6px;" onchange="updateInfoCard('${slide.id}', '${card.id}', 'statKey', this.value)">
          ${statOptions}
        </select>
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">Size</span>
          <input type="number" min="10" max="32" step="1" class="db-input" style="width:50px;font-size:11px;" value="${card.fontSize || 14}" onchange="updateInfoCard('${slide.id}', '${card.id}', 'fontSize', +this.value)">
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">Text</span>
          <input type="color" value="${card.color || '#ffffff'}" onchange="updateInfoCard('${slide.id}', '${card.id}', 'color', this.value)" style="width:28px;height:24px;padding:0;border:none;">
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">Bg</span>
          <input type="color" value="${card.bgColor || '#000000'}" onchange="updateInfoCard('${slide.id}', '${card.id}', 'bgColor', this.value)" style="width:28px;height:24px;padding:0;border:none;">
          <span style="font-size:11px;color:var(--text2);white-space:nowrap;">Op</span>
          <input type="number" min="0" max="1" step="0.1" class="db-input" style="width:44px;font-size:11px;" value="${card.bgOpacity ?? 0.6}" onchange="updateInfoCard('${slide.id}', '${card.id}', 'bgOpacity', +this.value)">
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// INFO CARD ACTIONS
// ============================================================
window.addInfoCard = function (slideId) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === slideId);
  if (!slide) return;
  if (!slide.infoCards) slide.infoCards = [];

  // Stagger default positions for multiple cards
  const offset = slide.infoCards.length * 8;
  slide.infoCards.push({
    id: Date.now().toString() + '_' + slide.infoCards.length,
    statKey: 'totalDistance',
    x: 5 + (offset % 40),
    y: 5 + (offset % 40),
    fontSize: 32,
    color: slide.titleColor || '#ffffff',
    bgColor: slide.overlayColor || '#000000',
    bgOpacity: slide.overlayOpacity ?? 0.6,
  });

  // Re-render editor and map cards
  editSlide(slideId);
};

window.removeInfoCard = function (slideId, cardId) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === slideId);
  if (!slide) return;
  slide.infoCards = slide.infoCards.filter(c => c.id !== cardId);

  // Re-render
  editSlide(slideId);
};

window.updateInfoCard = function (slideId, cardId, key, val) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === slideId);
  if (!slide) return;
  const card = slide.infoCards.find(c => c.id === cardId);
  if (!card) return;

  card[key] = val;

  // Re-render info cards on map (but not the whole editor to avoid focus loss)
  renderInfoCards(slide, trip);

  // If statKey changed, also update the editor dropdown previews
  if (key === 'statKey') {
    editSlide(slideId);
  }
};

// ============================================================
// BASEMAP TOGGLE ACTIONS
// ============================================================
window.toggleSlideBasemap = function (slideId, hide) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === slideId);
  if (!slide) return;

  slide.hideBasemap = hide;
  applySlideBasemap(slide);

  // Show/hide background color picker
  const bgRow = document.getElementById(`bg-color-row-${slideId}`);
  if (bgRow) bgRow.style.display = hide ? 'flex' : 'none';
};

window.updateSlideBackground = function (slideId, color) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === slideId);
  if (!slide) return;

  slide.backgroundColor = color;
  applySlideBasemap(slide);
};

// ============================================================
// RENDER INFO CARDS ON MAP (draggable overlays)
// ============================================================
function renderInfoCards(slide, trip) {
  const mapEl = document.getElementById('map');

  // Remove existing info card overlays
  mapEl.querySelectorAll('.slide-info-card').forEach(el => el.remove());

  if (!slide.infoCards || !slide.infoCards.length) return;

  const stats = trip.stats || {};

  slide.infoCards.forEach(card => {
    const def = INFO_CARD_STATS[card.statKey];
    if (!def) return;

    const value = formatInfoCardValue(card.statKey, stats, trip);

    const el = document.createElement('div');
    el.className = 'slide-info-card';
    el.dataset.cardId = card.id;
    el.style.left = card.x + '%';
    el.style.top = card.y + '%';
    el.style.fontSize = (card.fontSize || 14) + 'px';
    el.style.color = card.color || '#ffffff';
    el.style.backgroundColor = hexToRgba(card.bgColor || '#000000', card.bgOpacity ?? 0.6);

    el.innerHTML = `
      <div class="slide-info-card-icon"><i class="fa-solid ${def.icon}"></i></div>
      <div class="slide-info-card-content">
        <div class="slide-info-card-value">${value}</div>
        <div class="slide-info-card-label">${def.label}</div>
      </div>
    `;

    // Make draggable
    makeDraggable(el, card, slide, mapEl);

    mapEl.appendChild(el);
  });
}

// ============================================================
// DRAG LOGIC FOR INFO CARDS
// ============================================================
function makeDraggable(el, card, slide, mapEl) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  el.addEventListener('mousedown', onStart);
  el.addEventListener('touchstart', onStart, { passive: false });

  function onStart(e) {
    e.preventDefault();
    e.stopPropagation();
    isDragging = true;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startX = clientX;
    startY = clientY;

    const rect = mapEl.getBoundingClientRect();
    startLeft = (card.x / 100) * rect.width;
    startTop = (card.y / 100) * rect.height;

    el.classList.add('dragging');

    // Disable map dragging while card is being dragged
    if (App.map) App.map.dragging.disable();

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  function onMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;

    const rect = mapEl.getBoundingClientRect();
    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    // Clamp to map bounds
    newLeft = Math.max(0, Math.min(newLeft, rect.width - el.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, rect.height - el.offsetHeight));

    // Convert to percentage and snap to 5% increments
    let pctX = (newLeft / rect.width) * 100;
    let pctY = (newTop / rect.height) * 100;

    pctX = Math.round(pctX / 5) * 5;
    pctY = Math.round(pctY / 5) * 5;

    el.style.left = pctX + '%';
    el.style.top = pctY + '%';
  }

  function onEnd(e) {
    if (!isDragging) return;
    isDragging = false;

    el.classList.remove('dragging');

    // Re-enable map dragging
    if (App.map) App.map.dragging.enable();

    // Save final position
    const rect = mapEl.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    card.x = +(((elRect.left - rect.left) / rect.width) * 100).toFixed(2);
    card.y = +(((elRect.top - rect.top) / rect.height) * 100).toFixed(2);

    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
  }
}

// ============================================================
// SLIDE UPDATE / DELETE / OVERLAY
// ============================================================
window.updateSlide = function (id, key, val) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === id);
  if (!slide) return;

  slide[key] = val;
  applySlideOverlay(slide);
};

window.deleteSlide = function (id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  trip.slides = trip.slides.filter(s => s.id !== id);
  const overlay = document.getElementById('slide-overlay');
  if (overlay) overlay.style.display = 'none';
  // Clean up info cards and restore basemap
  clearInfoCards();
  restoreBasemap();
  renderSpTab();
};

function clearInfoCards() {
  const mapEl = document.getElementById('map');
  if (mapEl) mapEl.querySelectorAll('.slide-info-card').forEach(el => el.remove());
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applySlideOverlay(slide) {
  const overlay = document.getElementById('slide-overlay');
  if (!overlay) return;

  document.getElementById('slide-title').textContent = slide.title;
  document.getElementById('slide-title').style.display = slide.title ? 'block' : 'none';

  document.getElementById('slide-subtitle').textContent = slide.subtitle;
  document.getElementById('slide-subtitle').style.display = slide.subtitle ? 'block' : 'none';

  document.getElementById('slide-desc').textContent = slide.description;
  document.getElementById('slide-desc').style.display = slide.description ? 'block' : 'none';

  if (!slide.title && !slide.subtitle && !slide.description) {
    overlay.style.display = 'none';
  } else {
    overlay.style.display = 'block';
    overlay.style.backgroundColor = hexToRgba(slide.overlayColor || '#000000', slide.overlayOpacity ?? 0.6);
    overlay.style.left = (slide.titleX ?? 5) + '%';
    overlay.style.top = (slide.titleY ?? 75) + '%';
    
    const color = slide.titleColor || '#ffffff';
    document.getElementById('slide-title').style.color = color;
    document.getElementById('slide-subtitle').style.color = color;
    document.getElementById('slide-desc').style.color = color;
  }
}

// ── Download slide using Canvas API for precise capture ──

window.downloadSlide = async function (id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === id);
  if (!slide) return;

  // Ensure we are viewing it
  previewSlide(id);

  toast('Generating high-res screenshot...', 'info');

  const mapEl = document.getElementById('map');

  // Temporarily hide map controls and guide overlay
  const controls = document.querySelector('.leaflet-control-container');
  const guideOverlay = document.getElementById('slideshow-guide-overlay');
  if (controls) controls.style.display = 'none';
  if (guideOverlay) guideOverlay.style.display = 'none';

  // Add temporary watermark
  const watermark = document.createElement('div');
  watermark.id = 'temp-watermark';
  watermark.style.position = 'absolute';
  watermark.style.top = '20px';
  watermark.style.right = '20px';
  watermark.style.zIndex = '9999';
  watermark.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  watermark.style.padding = '8px 14px';
  watermark.style.borderRadius = '6px';
  watermark.style.color = 'var(--accent)';
  watermark.style.fontFamily = 'var(--font-head), sans-serif';
  watermark.style.fontWeight = '800';
  watermark.style.fontSize = '32px';
  watermark.style.letterSpacing = '-0.5px';
  // watermark.style.display = 'flex';
  // watermark.style.alignItems = 'center';
  watermark.style.gap = '8px';
  watermark.innerHTML = '<i class="fa-solid fa-route"></i> <span>Tripel</span><span style="font-size:xx-small;">.xyz</span>';
  mapEl.appendChild(watermark);

  const mapRect = mapEl.getBoundingClientRect();

  const baseW = mapRect.width;
  const baseH = mapRect.height;

  const bufferW = 0;
  const bufferH = 0;
  const captureW = baseW + bufferW;
  const captureH = baseH + bufferH;

  // Use a higher DPR for high-res output
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(dpr, 2); // at least 2x resolution

  const canvasW = Math.round(captureW * scale);
  const canvasH = Math.round(captureH * scale);

  try {
    await document.fonts.ready;

    const dataUrl = await domtoimage.toPng(mapEl, {
      width: canvasW,
      height: canvasH,
      quality: 0.99,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: `${mapRect.x + 4}px ${mapRect.y + 4}px`,
      }
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `tripelxyz-s${id}-${(slide.title || 'untitled').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace('--', '-')}.png`;
    a.click();
    toast('Download complete', 'success');
  } catch (e) {
    console.error('Screenshot error:', e);
    toast('Failed to capture screenshot.', 'error');
  } finally {
    if (controls) controls.style.display = '';
    if (guideOverlay) guideOverlay.style.display = '';
    if (watermark.parentNode) watermark.parentNode.removeChild(watermark);
  }
};

// ── Exit slideshow mode ──

window.exitSlideshowMode = function () {
  document.body.classList.remove('slideshow-active');

  const overlay = document.getElementById('slide-overlay');
  if (overlay) overlay.style.display = 'none';

  const guideOverlay = document.getElementById('slideshow-guide-overlay');
  if (guideOverlay) guideOverlay.innerHTML = '';

  // Restore basemap and clean up info cards
  restoreBasemap();
  clearInfoCards();

  if (App.map) {
    const mapEl = document.getElementById('map');
    if (mapEl) {
      // Reset map to full-screen fixed position
      mapEl.style.position = 'fixed';
      mapEl.style.width = '';
      mapEl.style.height = '';
      mapEl.style.top = '0';
      mapEl.style.left = '0';
      mapEl.style.right = '0';
      mapEl.style.bottom = '0';
      mapEl.style.border = '';
      mapEl.style.borderRadius = '';
      App.map.invalidateSize();
      if (window.adjustMapForPanel && App.currentTripId) {
        adjustMapForPanel(true);
      }
    }
  }
};

// Listen for tab changes to remove slideshow-active class
const originalSwitchSpTab = window.switchSpTab;
window.switchSpTab = function (tab) {
  if (tab !== 'slideshow') {
    window.exitSlideshowMode();
  }
  originalSwitchSpTab(tab);
};
