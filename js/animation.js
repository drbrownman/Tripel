// ============================================================
// ANIMATION MODE
// ============================================================
let animState = {
  playing: false,
  currentTime: 0, // In ms relative to trip start
  speedMultiplier: 12 * 60 * 60 * 1000, // 1 sec = 12 hours (in ms)
  fps: 15,
  aspectRatio: '1:1',
  interval: null,
  showTimestamp: false,
  keyframes: [] // { timeMs: 0, center: [lat, lng], zoom: 10 }
};

function renderSpAnimation(trip, container) {
  if (!trip) return;

  // Initialize keyframes if empty
  if (!trip.animKeyframes || trip.animKeyframes.length === 0) {
    trip.animKeyframes = [{
      id: Date.now().toString(),
      timeMs: 0,
      center: [App.map.getCenter().lat, App.map.getCenter().lng],
      zoom: App.map.getZoom()
    }];
  }
  trip.animKeyframes.sort((a, b) => a.timeMs - b.timeMs);
  animState.keyframes = trip.animKeyframes;

  enterAnimationMode();

  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();

  let html = `
    <div class="info-card">
      <div class="info-card-title">Animation Controls</div>
      
      <div class="anim-aspect-ratio" style="margin-bottom:12px;">
        <button class="anim-aspect-btn ${animState.aspectRatio === '1:1' ? 'active' : ''}" onclick="setAnimAspectRatio('1:1')">1:1 Square</button>
        <button class="anim-aspect-btn ${animState.aspectRatio === '16:9' ? 'active' : ''}" onclick="setAnimAspectRatio('16:9')">16:9 Landscape</button>
        <button class="anim-aspect-btn ${animState.aspectRatio === '9:16' ? 'active' : ''}" onclick="setAnimAspectRatio('9:16')">9:16 Vertical</button>
      </div>

      <div class="anim-timeline-container">
        <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text2);">
          <span>${trip.displayStartShortDate}</span>
          <span id="anim-current-time-label">0%</span>
          <span>${trip.displayEndDate || trip.displayStartShortDate}</span>
        </div>
        <div class="anim-timeline-track" id="anim-timeline-track" onclick="seekAnimation(event)">
          <div class="anim-timeline-progress" id="anim-timeline-progress" style="width:0%"></div>
          <div id="anim-keyframes-container"></div>
        </div>
      </div>

      <div class="anim-controls" style="margin-top:20px;">
        <button class="anim-btn" onclick="stepAnimation(-1)"><i class="fa-solid fa-backward-step"></i></button>
        <button class="anim-btn primary" id="anim-play-btn" onclick="toggleAnimationPlay()"><i class="fa-solid fa-play"></i></button>
        <button class="anim-btn" onclick="stepAnimation(1)"><i class="fa-solid fa-forward-step"></i></button>
      </div>
      
      <div style="display:flex; justify-content:center; margin-top:12px;">
        <label class="anim-speed-control">
          Speed:
          <select class="db-input" style="width:auto; padding:4px;" onchange="setAnimSpeed(this.value)">
            <option value="6" ${animState.speedMultiplier === 6 * 3600000 ? 'selected' : ''}>1s = 6h</option>
            <option value="12" ${animState.speedMultiplier === 12 * 3600000 ? 'selected' : ''}>1s = 12h</option>
            <option value="24" ${animState.speedMultiplier === 24 * 3600000 ? 'selected' : ''}>1s = 24h</option>
            <option value="48" ${animState.speedMultiplier === 48 * 3600000 ? 'selected' : ''}>1s = 2 days</option>
          </select>
        </label>
      </div>
      
      <div style="display:flex; justify-content:center; margin-top:12px;">
        <label class="anim-speed-control">
          <input type="checkbox" id="anim-timestamp-toggle" ${animState.showTimestamp ? 'checked' : ''} onchange="animState.showTimestamp = this.checked; updateAnimUI();"> Show Timestamp
        </label>
      </div>
    </div>

    <div class="info-card" style="margin-top:12px;">
      <div class="info-card-title">Keyframes</div>
      <p style="font-size:12px;color:var(--text3);margin-bottom:12px;">Add keyframes to animate the map center and zoom level.</p>
      <button class="btn ghost w-100" onclick="addAnimKeyframe()"><i class="fa-solid fa-plus"></i> Add Keyframe at Current Time</button>
      <div id="anim-keyframes-list" style="margin-top:12px; display:flex; flex-direction:column; gap:8px;"></div>
    </div>

    <div class="info-card" style="margin-top:12px;">
      <button class="btn accent w-100" id="anim-export-btn" onclick="exportAnimationVideo()"><i class="fa-solid fa-video"></i> Download Video</button>
      <div id="anim-export-progress" style="display:none; font-size:12px; color:var(--text2); margin-top:8px; text-align:center;">Recording...</div>
    </div>
  `;
  container.innerHTML = html;

  updateAnimUI();
}

function enterAnimationMode() {
  document.body.classList.add('animation-active');
  positionAnimationMap();
  updateAnimGuideOverlay();
  App.map.invalidateSize();

  if (!App._animationResizeHandler) {
    App._animationResizeHandler = () => {
      if (document.body.classList.contains('animation-active')) {
        positionAnimationMap();
        updateAnimGuideOverlay();
        App.map.invalidateSize();
      }
    };
    window.addEventListener('resize', App._animationResizeHandler);
  }

  animState.currentTime = 0;
  updateAnimMap();
}

window.exitAnimationMode = function () {
  document.body.classList.remove('animation-active');
  pauseAnimation();

  const guideOverlay = document.getElementById('slideshow-guide-overlay');
  if (guideOverlay) guideOverlay.innerHTML = '';

  if (App.map) {
    const mapEl = document.getElementById('map');
    if (mapEl) {
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

  let overlay = document.getElementById('anim-timestamp-overlay');
  if (overlay) overlay.remove();

  // Restore full map render
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (trip) {
    renderTripOnMap(trip, true, null);
  }
};

// Override switchSpTab again to handle animation exit
const originalSwitchSpTabFromAnimation = window.switchSpTab;
window.switchSpTab = function (tab) {
  if (tab !== 'animation' && window.exitAnimationMode) {
    window.exitAnimationMode();
  }
  originalSwitchSpTabFromAnimation(tab);
};

function positionAnimationMap() {
  const mapEl = document.getElementById('map');
  const sidePanelW = 400;
  const headerH = 54;
  const availW = window.innerWidth - sidePanelW;
  const availH = window.innerHeight - headerH;

  let mapW, mapH;
  const maxW = availW - 60;
  const maxH = availH - 60;

  if (animState.aspectRatio === '1:1') {
    const size = Math.min(maxW, maxH);
    mapW = size; mapH = size;
  } else if (animState.aspectRatio === '16:9') {
    mapW = maxW;
    mapH = mapW * 9 / 16;
    if (mapH > maxH) {
      mapH = maxH;
      mapW = mapH * 16 / 9;
    }
  } else if (animState.aspectRatio === '9:16') {
    mapH = maxH;
    mapW = mapH * 9 / 16;
    if (mapW > maxW) {
      mapW = maxW;
      mapH = mapW * 16 / 9;
    }
  }

  mapEl.style.position = 'fixed';
  mapEl.style.width = mapW + 'px';
  mapEl.style.height = mapH + 'px';
  mapEl.style.top = (headerH + (availH - mapH) / 2) + 'px';
  mapEl.style.left = ((availW - mapW) / 2) + 'px';
  mapEl.style.right = 'auto';
  mapEl.style.bottom = 'auto';
  mapEl.style.border = '1px solid rgba(255,255,255,0.2)';
}

function updateAnimGuideOverlay() {
  const overlay = document.getElementById('slideshow-guide-overlay');
  if (!overlay) return;
  const mapEl = document.getElementById('map');
  const rect = mapEl.getBoundingClientRect();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const sidePanelW = 400;
  const maskW = w - sidePanelW;

  overlay.innerHTML = `<svg width="${maskW}" height="${h}" style="position:fixed;top:0;left:0;">
    <defs>
      <mask id="guide-mask-anim">
        <rect width="${maskW}" height="${h}" fill="white"/>
        <rect x="${rect.left}" y="${rect.top}" width="${rect.width}" height="${rect.height}" fill="black"/>
      </mask>
    </defs>
    <rect width="${maskW}" height="${h}" fill="rgba(0,0,0,0.55)" mask="url(#guide-mask-anim)"/>
  </svg>`;
}

window.setAnimAspectRatio = function (ratio) {
  animState.aspectRatio = ratio;
  positionAnimationMap();
  updateAnimGuideOverlay();
  App.map.invalidateSize();

  // Update buttons
  const trip = App.trips.find(t => t.id === App.currentTripId);
  const container = document.getElementById('sp-body');
  if (trip && container && App.spTab === 'animation') {
    // Re-render tab lightly or just update classes
    document.querySelectorAll('.anim-aspect-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.includes(ratio.split(':')[0]));
    });
  }
};

window.setAnimSpeed = function (hoursPerSec) {
  animState.speedMultiplier = parseInt(hoursPerSec) * 3600000;
};

// ============================================================
// PLAYBACK LOGIC
// ============================================================

async function preloadKeyframeTiles() {
  const originalCenter = App.map.getCenter();
  const originalZoom = App.map.getZoom();

  if (App.mapLayers.basemap) {
    App.mapLayers.basemap.options.keepBuffer = 16;
  }

  const btn = document.getElementById('anim-play-btn');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

  for (const kf of animState.keyframes) {
    App.map.setView(kf.center, kf.zoom, { animate: false });
    await new Promise(resolve => {
      let fired = false;
      const onTileLoad = () => { if (!fired) { fired = true; resolve(); } };
      App.mapLayers.basemap.once('load', onTileLoad);
      setTimeout(onTileLoad, 800);
    });
  }

  App.map.setView(originalCenter, originalZoom, { animate: false });
  await new Promise(resolve => setTimeout(resolve, 300));
}

window.toggleAnimationPlay = async function () {
  if (animState.playing || animState.preloading) {
    pauseAnimation();
  } else {
    animState.preloading = true;
    await preloadKeyframeTiles();
    if (!animState.preloading) return; // Aborted during preload
    animState.preloading = false;
    playAnimation();
  }
};

function playAnimation() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();
  if (animState.currentTime >= totalDurationMs) {
    animState.currentTime = 0; // Loop to start
  }

  animState.playing = true;
  document.getElementById('anim-play-btn').innerHTML = '<i class="fa-solid fa-pause"></i>';

  const tickMs = 1000 / animState.fps;
  const timeStep = (animState.speedMultiplier / animState.fps);

  animState.interval = setInterval(() => {
    let nextTime = animState.currentTime + timeStep;
    nextTime = checkHiddenKeyframes(nextTime, totalDurationMs);

    if (nextTime >= totalDurationMs) {
      animState.currentTime = totalDurationMs;
      pauseAnimation();
    } else {
      animState.currentTime = nextTime;
    }
    updateAnimUI();
    updateAnimMap();
  }, tickMs);
}

function pauseAnimation() {
  animState.playing = false;
  animState.preloading = false;
  if (animState.interval) clearInterval(animState.interval);
  const btn = document.getElementById('anim-play-btn');
  if (btn) btn.innerHTML = '<i class="fa-solid fa-play"></i>';
}

window.stepAnimation = function (dir) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();
  const timeStep = (animState.speedMultiplier / animState.fps) * 5; // step 5 frames

  let nextTime = animState.currentTime + dir * timeStep;
  nextTime = Math.max(0, Math.min(nextTime, totalDurationMs));
  animState.currentTime = checkHiddenKeyframes(nextTime, totalDurationMs);

  updateAnimUI();
  updateAnimMap();
};

window.seekAnimation = function (e) {
  const track = document.getElementById('anim-timeline-track');
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();
  const targetTime = pct * totalDurationMs;
  animState.currentTime = checkHiddenKeyframes(targetTime, totalDurationMs);
  updateAnimUI();
  updateAnimMap();
};

function updateAnimUI() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();

  const pct = (animState.currentTime / totalDurationMs) * 100;
  const prog = document.getElementById('anim-timeline-progress');
  if (prog) prog.style.width = pct + '%';

  const lbl = document.getElementById('anim-current-time-label');
  if (lbl) {
    const curDate = new Date(trip.startTime.getTime() + animState.currentTime);
    lbl.textContent = curDate.toLocaleString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  // Render keyframes on timeline
  const kfCont = document.getElementById('anim-keyframes-container');
  if (kfCont) {
    kfCont.innerHTML = animState.keyframes.map(kf => {
      const kfPct = (kf.timeMs / totalDurationMs) * 100;
      return `<div class="anim-keyframe-marker ${kf.hidden ? 'hidden' : ''}" style="left:${kfPct}%; opacity:${kf.hidden ? 0.3 : 1}" onclick="event.stopPropagation(); seekToKeyframe('${kf.id}')"></div>`;
    }).join('');
  }

  // Render keyframes list
  const list = document.getElementById('anim-keyframes-list');
  if (list) {
    list.innerHTML = animState.keyframes.map((kf, i) => {
      const kfDate = new Date(trip.startTime.getTime() + kf.timeMs);
      const timeStr = kfDate.toLocaleString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `
        <div class="info-card" style="padding:8px; display:flex; justify-content:space-between; align-items:center; background:var(--surface3);">
          <div>
            <div style="font-size:12px; font-weight:600;">Keyframe ${i + 1}</div>
            <div style="font-size:11px; color:var(--text2);">${timeStr}</div>
          </div>
          <div style="display:flex; gap:4px;">
            <button class="btn ghost sm" onclick="seekToKeyframe('${kf.id}')" title="Seek to"><i class="fa-solid fa-arrow-right"></i></button>
            <button class="btn ghost sm" onclick="updateKeyframeView('${kf.id}')" title="Update to current map view"><i class="fa-solid fa-camera"></i></button>
            <button class="btn ghost sm" onclick="toggleKeyframeHidden('${kf.id}')" title="Toggle visibility"><i class="fa-solid ${kf.hidden ? 'fa-eye-slash' : 'fa-eye'}"></i></button>
            ${i > 0 ? `<button class="btn ghost sm" onclick="deleteKeyframe('${kf.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Timestamp Overlay
  let tsOverlay = document.getElementById('anim-timestamp-overlay');
  if (!tsOverlay && animState.showTimestamp) {
    tsOverlay = document.createElement('div');
    tsOverlay.id = 'anim-timestamp-overlay';
    tsOverlay.style.position = 'absolute';
    tsOverlay.style.top = '20px';
    tsOverlay.style.left = '20px';
    tsOverlay.style.zIndex = '9999';
    tsOverlay.style.color = 'white';
    tsOverlay.style.background = 'rgba(0,0,0,0.6)';
    tsOverlay.style.padding = '8px 12px';
    tsOverlay.style.borderRadius = '8px';
    tsOverlay.style.fontFamily = '"Syne", sans-serif';
    tsOverlay.style.fontSize = '18px';
    document.getElementById('map').appendChild(tsOverlay);
  }

  if (tsOverlay) {
    if (animState.showTimestamp) {
      tsOverlay.style.display = 'block';
      const curDate = new Date(trip.startTime.getTime() + animState.currentTime);
      const m = curDate.toLocaleString('default', { month: 'short' });
      const d = String(curDate.getDate()).padStart(2, '0');
      const y = curDate.getFullYear();
      let h = curDate.getHours();
      const ampm = h >= 12 ? 'pm' : 'am';
      h = h % 12 || 12;
      const hs = String(h).padStart(2, '0');
      tsOverlay.textContent = `${m}, ${d}, ${y} ${hs}${ampm}`;
    } else {
      tsOverlay.style.display = 'none';
    }
  }
}

function updateAnimMap() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  const absTime = trip.startTime.getTime() + animState.currentTime;

  // Map layers filtering
  renderTripOnMap(trip, true, absTime);

  // Keyframe interpolation
  if (animState.keyframes.length > 0) {
    // Sort keyframes by time
    const sorted = [...animState.keyframes].sort((a, b) => a.timeMs - b.timeMs);
    let prev = sorted[0];
    let next = sorted[sorted.length - 1];

    for (let i = 0; i < sorted.length - 1; i++) {
      if (animState.currentTime >= sorted[i].timeMs && animState.currentTime <= sorted[i + 1].timeMs) {
        prev = sorted[i];
        next = sorted[i + 1];
        break;
      }
    }

    if (animState.currentTime <= prev.timeMs) {
      App.map.setView(prev.center, prev.zoom, { animate: false });
    } else if (animState.currentTime >= next.timeMs) {
      App.map.setView(next.center, next.zoom, { animate: false });
    } else {
      const range = next.timeMs - prev.timeMs;
      const progress = (animState.currentTime - prev.timeMs) / range;
      const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const eProgress = easeInOutCubic(progress);

      const lat = prev.center[0] + (next.center[0] - prev.center[0]) * eProgress;
      const lng = prev.center[1] + (next.center[1] - prev.center[1]) * eProgress;
      const zoom = prev.zoom + (next.zoom - prev.zoom) * eProgress;

      App.map.setView([lat, lng], zoom, { animate: true });
    }
  }
}

// ============================================================
// KEYFRAMES
// ============================================================
window.addAnimKeyframe = function () {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  const center = App.map.getCenter();
  const zoom = App.map.getZoom();

  animState.keyframes.push({
    id: Date.now().toString(),
    timeMs: animState.currentTime,
    center: [center.lat, center.lng],
    zoom: zoom
  });

  animState.keyframes.sort((a, b) => a.timeMs - b.timeMs);
  trip.animKeyframes = animState.keyframes;
  updateAnimUI();
};

window.seekToKeyframe = function (id) {
  const kf = animState.keyframes.find(k => k.id === id);
  if (kf) {
    animState.currentTime = kf.timeMs;
    updateAnimUI();
    updateAnimMap();
  }
};

window.updateKeyframeView = function (id) {
  const kf = animState.keyframes.find(k => k.id === id);
  if (kf) {
    const center = App.map.getCenter();
    kf.center = [center.lat, center.lng];
    kf.zoom = App.map.getZoom();
    const trip = App.trips.find(t => t.id === App.currentTripId);
    if (trip) trip.animKeyframes = animState.keyframes;
    toast('Keyframe view updated', 'success');
  }
};

window.deleteKeyframe = function (id) {
  animState.keyframes = animState.keyframes.filter(k => k.id !== id);
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (trip) trip.animKeyframes = animState.keyframes;
  updateAnimUI();
};

window.toggleKeyframeHidden = function (id) {
  const kf = animState.keyframes.find(k => k.id === id);
  if (kf) {
    kf.hidden = !kf.hidden;
    const trip = App.trips.find(t => t.id === App.currentTripId);
    if (trip) trip.animKeyframes = animState.keyframes;
    updateAnimUI();
  }
};

function checkHiddenKeyframes(time, totalDurationMs) {
  if (animState.keyframes.length === 0) return time;
  const sorted = [...animState.keyframes].sort((a, b) => a.timeMs - b.timeMs);
  for (let i = 0; i < sorted.length; i++) {
    const kf = sorted[i];
    if (kf.hidden) {
      const nextTime = (i + 1 < sorted.length) ? sorted[i + 1].timeMs : totalDurationMs;
      if (time >= kf.timeMs && time < nextTime) {
        return checkHiddenKeyframes(nextTime, totalDurationMs);
      }
    }
  }
  return time;
}

// ============================================================
// VIDEO EXPORT
// ============================================================
window.exportAnimationVideo = async function () {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  if (animState.playing) pauseAnimation();

  // Rewind
  animState.currentTime = 0;
  updateAnimUI();
  updateAnimMap();

  const btn = document.getElementById('anim-export-btn');
  const progInfo = document.getElementById('anim-export-progress');
  btn.style.display = 'none';
  progInfo.style.display = 'block';

  // We'll capture the map using dom-to-image on an interval and write to a canvas,
  // while MediaRecorder captures the canvas stream.

  const mapEl = document.getElementById('map');
  const mapRect = mapEl.getBoundingClientRect();

  await preloadKeyframeTiles();

  const watermark = document.createElement('div');
  watermark.style.position = 'absolute';
  watermark.style.bottom = '20px';
  watermark.style.right = '20px';
  watermark.style.zIndex = '9999';
  watermark.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
  watermark.style.padding = '8px 14px';
  watermark.style.color = '#ffffff';
  watermark.style.borderRadius = '6px';
  watermark.style.color = 'var(--accent)';
  watermark.style.fontFamily = 'var(--font-head), sans-serif';
  // watermark.style.textShadow = '0px 0px 8px rgba(0,0,0,0.8)';
  watermark.style.fontWeight = '800';
  watermark.style.fontSize = '32px';
  watermark.style.letterSpacing = '-0.5px';
  watermark.style.gap = '8px';
  watermark.innerHTML = '<i class="fa-solid fa-route"></i> <span>Tripel</span><span style="font-size:xx-small;">.xyz</span>';
  mapEl.appendChild(watermark);

  const canvas = document.createElement('canvas');
  canvas.width = mapRect.width;
  canvas.height = mapRect.height;
  const ctx = canvas.getContext('2d');

  // 15 FPS output stream
  const stream = canvas.captureStream(15);

  // We specify webm format
  let options = { mimeType: 'video/webm; codecs=vp9' };
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options = { mimeType: 'video/webm' };
  }

  const mediaRecorder = new MediaRecorder(stream, options);
  const recordedChunks = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tripel-animation-${trip.name.replace(/[^a-zA-Z0-9]/g, '-')}.webm`;
    a.click();
    URL.revokeObjectURL(url);

    btn.style.display = 'block';
    progInfo.style.display = 'none';
    if (watermark.parentNode) watermark.parentNode.removeChild(watermark);
    toast('Video exported successfully', 'success');
  };

  // Start recording
  mediaRecorder.start();

  // Play animation slightly slower to ensure dom-to-image can keep up, or just run it real-time.
  // Real-time might drop frames visually but video will maintain 30fps of whatever is drawn.
  const totalDurationMs = trip.endTime.getTime() - trip.startTime.getTime();
  const tickMs = 1000 / 30; // Capture map at 30fps
  const timeStep = (animState.speedMultiplier / 30);

  const drawFrame = async () => {
    try {
      // Hide zoom controls if any
      const controls = document.querySelector('.leaflet-control-container');
      if (controls) controls.style.display = 'none';

      const dataUrl = await domtoimage.toPng(mapEl, { quality: 0.95 });

      if (controls) controls.style.display = '';

      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = dataUrl;
    } catch (e) {
      console.error(e);
    }
  };

  const animInterval = setInterval(async () => {
    let nextTime = animState.currentTime + timeStep;
    nextTime = checkHiddenKeyframes(nextTime, totalDurationMs);

    if (nextTime >= totalDurationMs) {
      animState.currentTime = totalDurationMs;
      clearInterval(animInterval);
      await drawFrame(); // draw last frame

      // Stop recorder after a short delay to ensure last frame is caught
      setTimeout(() => {
        mediaRecorder.stop();
      }, 500);
      return;
    }

    animState.currentTime = nextTime;
    updateAnimUI();
    updateAnimMap();
    await drawFrame();
  }, tickMs);
};
