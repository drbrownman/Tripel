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
        <!-- button class="btn ghost sm w-100" style="margin-top:8px;" onclick="event.stopPropagation(); editSlide('${s.id}')"><i class="fa-solid fa-pen"></i> Edit</button -->
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
    overlay.style.bottom = '20px';
    overlay.style.left = '20px';
    overlay.style.right = '20px';
    overlay.style.zIndex = '1000';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '8px';
    overlay.style.display = 'none';
    overlay.style.fontFamily = 'var(--font-heading)';
    overlay.innerHTML = `
      <h1 id="slide-title" style="margin:0; font-size:32px; color:white;"></h1>
      <h2 id="slide-subtitle" style="margin:8px 0 0; font-size:20px; color:white; font-weight:500;"></h2>
      <p id="slide-desc" style="margin:8px 0 0; font-size:16px; color:rgba(255,255,255,0.9); font-family:var(--font-body);"></p>
    `;
    mapDiv.appendChild(overlay);
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
    subtitle: 'My Journey',
    description: '',
    overlayColor: '#000000',
    overlayOpacity: 0.6
  });

  renderSpTab();
  toast('Slide captured', 'success');
};

window.previewSlide = function (id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const slide = trip.slides.find(s => s.id === id);
  if (!slide) return;

  App.map.setView(slide.center, slide.zoom);
  applySlideOverlay(slide);
};

window.editSlide = function (id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const s = trip.slides.find(s => s.id === id);
  if (!s) return;

  // Highlight tile
  document.querySelectorAll('#slide-list .info-card').forEach(c => c.style.borderColor = 'transparent');
  const tile = document.getElementById(`slide-tile-${id}`);
  if (tile) tile.style.borderColor = 'var(--accent)';

  previewSlide(id);

  const cont = document.getElementById('slide-editor-container');
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
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="btn accent w-100" onclick="downloadSlide('${s.id}')"><i class="fa-solid fa-download"></i> Download</button>
        <button class="btn accent w-100" onclick="updateSlide('${s.id}', 'center', App.map.getCenter()); updateSlide('${s.id}', 'zoom', App.map.getZoom());"><i class="fa-solid fa-save"></i> Save view</button>
        <button class="btn error w-100" style="background:var(--error);color:white;border:none;" onclick="deleteSlide('${s.id}')"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    </div>
  `;
};

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
  renderSpTab();
};

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

  // const baseW = mapEl.clientWidth;
  // const baseH = mapEl.clientHeight;
  // const baseW = App.map.getSize().x;
  // const baseH = App.map.getSize().y;
  // console.log("map.size.x=", baseW, " y=", baseH, " || div.width=", mapEl.clientWidth, " height=", mapEl.clientHeight);
  const baseW = mapRect.width;
  const baseH = mapRect.height;

  const bufferW = 0;
  const bufferH = 0;
  const captureW = baseW + bufferW;
  const captureH = baseH + bufferH;

  // Use a higher DPR for high-res output
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(dpr, 2); // at least 2x resolution
  // console.log(`captureW=${captureW} captureH=${captureH} Scale=${scale}`);

  const canvasW = Math.round(captureW * scale);
  const canvasH = Math.round(captureH * scale);

  try {
    const dataUrl = await domtoimage.toPng(mapEl, {
      width: canvasW,
      height: canvasH,
      quality: 0.99,
      style: {
        transform: `scale(${scale})`,
        transformOrigin: `${mapRect.x + 4}px ${mapRect.y + 4}px`,
        // transformOrigin: 'top left',
        // transformOrigin: '50% 50%',
        // width: captureW + 'px',
        // height: captureH + 'px',
        // border: 'none',
        // borderRadius: '0px',
        // margin: 'none'
      }
    });

    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `tripelxyz-s${id}-${(slide.title || 'untitled').trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace('--', '-')}.png`;
    a.click();
    toast('Download complete', 'success');
  } catch (e) {
    console.error('Screenshot error:', e);
    toast('Failed to capture screenshot. Some basemaps block cross-origin requests.', 'error');
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
