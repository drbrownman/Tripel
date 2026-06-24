// ============================================================
// WIZARD UI
// ============================================================
const WZ_TITLES = { 1: 'Upload Your Travel Data', 2: 'Settings & API Key', 3: 'Tag Your Places', 4: 'Trips Detected' };

function openWizard() {
  document.getElementById('wizard-overlay').classList.add('open');
  gotoWizardStep(1);
}

function closeWizard() {
  document.getElementById('wizard-overlay').classList.remove('open');
  if (App.wizardMap) { App.wizardMap.remove(); App.wizardMap = null; }
}

function gotoWizardStep(step) {
  App.wizardStep = step;
  // Update indicators
  for (let i = 1; i <= 4; i++) {
    const ind = document.getElementById(`wz-ind-${i}`);
    ind.className = 'wz-step' + (i === step ? ' active' : i < step ? ' done' : '');
    ind.querySelector('.wz-step-num').textContent = i < step ? '✓' : i;
  }
  document.getElementById('wz-title').textContent = WZ_TITLES[step];
  document.getElementById('wz-btn-back').style.visibility = step === 1 ? 'hidden' : 'visible';
  document.getElementById('wz-btn-next').textContent = step === 4 ? 'View Trips' : 'Next';
  document.getElementById('wz-btn-next').innerHTML = step === 4 ? '<i class="fa-solid fa-map"></i> View Trips' : 'Next <i class="fa-solid fa-arrow-right"></i>';

  // Resize modal for step 3
  const modal = document.getElementById('wizard-modal');
  modal.style.width = step === 3 ? 'min(900px,100%)' : 'min(640px,100%)';

  // Render step body
  const renders = { 1: renderWzStep1, 2: renderWzStep2, 3: renderWzStep3, 4: renderWzStep4 };
  renders[step]();
  document.getElementById('wz-status').textContent = '';
}

function wizardBack() {
  if (App.wizardStep > 1) gotoWizardStep(App.wizardStep - 1);
}

async function wizardNext() {
  const step = App.wizardStep;
  if (step === 1) {
    if (!App.rawData.length) { toast('Please upload at least one file first', 'warning'); return; }
    gotoWizardStep(2);
  } else if (step === 2) {
    saveSettingsFromUI();
    // Load Google Maps API if key provided
    if (App.gmapAPIKey) {
      try {
        await loadGoogleMapsAPI(App.gmapAPIKey);
        toast('Google Maps API loaded', 'success');
      } catch (e) { toast('Could not load Google Maps API – continuing without it', 'warning'); }
    }
    // Extract frequent places
    App.frequentPlaces = extractAllPlaces();
    // Auto-tag
    for (const p of App.frequentPlaces) {
      p.tag = autoTagBySemType(p.semType);
    }
    if (window.google && App.gmapAPIKey) {
      document.getElementById('wz-btn-next').disabled = true;
      const statusEl = document.getElementById('wz-status');
      const nFrequentPlaces = App.frequentPlaces.length;
      for (let i = 0; i < App.frequentPlaces.length; i++) {
        const p = App.frequentPlaces[i];
        statusEl.innerHTML = `Fetching place ${i + 1} of ${nFrequentPlaces}...<div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((i / nFrequentPlaces) * 100)}%"></div></div>`;
        if (p.placeId) {
          const details = await fetchGooglePlaceDetails(p.placeId, p.nearestPlaceIds);
          if (details) {
            p.name = details.name;
            p.address = details.formatted_address;
            if (details.types) {
              const tag = autoTagByGoogleTypes(details.types);
              if (tag !== 'none') p.tag = tag;
            }
          }
        }
        await new Promise(r => setTimeout(r, 50));
      }
      document.getElementById('wz-btn-next').disabled = false;
    }
    gotoWizardStep(3);
  } else if (step === 3) {
    const homeCount = App.frequentPlaces.filter(p => p.tag === 'home').length;
    if (homeCount === 0) { toast('Please tag at least one place as Home', 'warning'); return; }
    console.log("Getting ready for trip segmentation...");
    const statusEl = document.getElementById('wz-status');
    statusEl.innerHTML = 'Analyzing travel history...<div class="progress-bar-wrap"><div class="progress-bar" style="width:0%"></div></div>';
    document.getElementById('wz-btn-next').disabled = true;
    try {
      console.log("Starting trip segmentation...");
      const rawTrips = await segmentTrips((nfound, curr, total) => {
        statusEl.innerHTML = `🔍 Detecting trips... (${nfound} found so far)<div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((curr / total) * 100)}%"></div></div>`;
      });
      console.log("Finished trip segmentation.");
      App.trips = rawTrips;
      // Name all trips
      for (const t of App.trips) {
        t.name = await nameTrip(t);
      }
      App.trips.sort((a, b) => b.startTime - a.startTime);

      if (App.trips.length > 0) {
        let allElements = [];
        let totalStops = 0;
        let totalDist = 0;
        let transportModes = {};
        let longestStop = 0;
        let maxRangeKm = 0;

        for (let i = App.trips.length - 1; i >= 0; i--) {
          allElements.push(...(App.trips[i].elements.map(e =>
            structuredClone(e)
          ).map(e => ({
            ...e,
            _hidden: (e.visit ? true : (e.activity ? (e._activityMode != "flight" ? true : false) : false)),
          }))
          ));
          totalStops += App.trips[i].stats.stops || 0;
          totalDist += App.trips[i].stats.distKm || 0;
          if (App.trips[i].stats.maxRangeKm > maxRangeKm) maxRangeKm = App.trips[i].stats.maxRangeKm;
          if (App.trips[i].stats.longestStop > longestStop) longestStop = App.trips[i].stats.longestStop;
          Object.entries(App.trips[i].stats.transportModes || {}).forEach(([k, v]) => {
            transportModes[k] = (transportModes[k] || 0) + v;
          });
        }

        const first = App.trips[App.trips.length - 1];
        const last = App.trips[0];

        const allTripsSpecial = {
          id: 'all-trips',
          _hidden: false,
          _tag: 'Star',
          name: 'All Trips',
          startTime: first.startTime,
          endTime: last.endTime,
          displayStartDate: first.displayStartDate,
          displayStartShortDate: 'All Time',
          displayEndDate: last.displayEndDate,
          elements: allElements,
          stats: {
            distKm: totalDist,
            days: Math.ceil((last.endTime - first.startTime) / 86400000),
            stops: totalStops,
            maxRangeKm: maxRangeKm,
            transportModes: transportModes,
            longestStop: longestStop,
            avgSpeedKmh: 0
          },
          destination: null,
          _destName: 'All regions',
          _maxRange: maxRangeKm,
          isSpecial: true,
          style: defaultTripStyle()
        };
        App.trips.unshift(allTripsSpecial);
      }
    } catch (e) {
      console.error(e);
      toast('Error during trip segmentation: ' + e.message, 'error');
    }
    document.getElementById('wz-status').textContent = '';
    document.getElementById('wz-btn-next').disabled = false;
    gotoWizardStep(4);
  } else if (step === 4) {
    closeWizard();
    showTripsView();
  }
}

function autoTagByGoogleTypes(types) {
  const t = types.join(' ');
  if (t.includes('premise') || t.includes('street_address')) return 'home';
  if (t.includes('workplace') || t.includes('employer') || t.includes('university') || t.includes('school') || t.includes('institution') || t.includes('office')) return 'work';
  if (t.includes('grocery') || t.includes('supermarket') || t.includes('shopping_mall') || t.includes('food') || t.includes('store') || t.includes('restaurant') || t.includes('pharmacy') || t.includes('gas_station') || t.includes('bank') || t.includes('atm')) return 'chores';
  if (t.includes('parking')) return 'ignore';
  if (t.includes('attraction') || t.includes('airport')) return 'none';
  return 'none';
}

// STEP 1 – UPLOAD
function renderWzStep1() {
  const body = document.getElementById('wz-body');
  const filesHtml = App.uploadedFiles.length
    ? `<div style="margin-top:12px;"><div class="section-label">Loaded files</div><div id="file-chips">${App.uploadedFiles.map(f => `<span class="file-chip"><i class="fa-solid fa-file-code"></i>${f}</span>`).join('')}</div><div style="margin-top:6px;font-size:11px;color:var(--text2)">${App.rawData.length.toLocaleString()} data points loaded</div></div>`
    : '';

  body.innerHTML = `
    <div id="resume-container"></div>
    <div class="upload-area" id="upload-area" onclick="document.getElementById('file-input').click()">
      <i class="fa-solid fa-cloud-arrow-up"></i>
      <p>Click or drag & drop your Google Maps Timeline JSON files here<br><strong>Multiple files supported</strong> – data will be merged automatically</p>
    </div>
    <div id="upload-progress-container" style="margin-top:12px;"></div>
    ${filesHtml}
  `;

  if (typeof hasSavedAppState === 'function') {
    hasSavedAppState().then(hasSaved => {
      if (hasSaved) {
        document.getElementById('resume-container').innerHTML = `
          <div class="resume-area" style="margin-bottom:16px; padding:16px; background:var(--surface2); border-radius:8px; text-align:center; border: 1px solid var(--border);">
            <p style="margin-bottom:12px;font-size:14px;color:var(--text);font-weight:500;">A previously saved session was found.</p>
            <button class="btn accent" onclick="resumeAppState()"><i class="fa-solid fa-window-restore"></i> Resume Saved Session</button>
          </div>
          <div style="text-align:center; margin-bottom:16px; font-size:12px; color:var(--text3); text-transform:uppercase; letter-spacing:1px;">Or</div>
        `;
      }
    });
  }

  // Add the rest of the HTML template
  body.insertAdjacentHTML('beforeend', `
    <div class="expandable" style="margin-top:14px;">
      <button class="expand-toggle" onclick="toggleExpand(this)">
        <span><i class="fa-solid fa-triangle-exclamation" style="color:var(--accent4);margin-right:6px;"></i>How to export your Timeline data</span>
        <i class="fa-solid fa-chevron-down"></i>
      </button>
      <div class="expand-content">
        <ol>
          <li>Open <strong>Google Maps</strong> on your phone 📲</li>
          <li>Tap your profile picture → <strong>Your Timeline</strong></li>
          <li>Tap the <strong>(...)</strong> menu → <strong>Location & privacy</strong></li>
          <li>Scroll to <strong>Export Timeline data</strong> and tap it</li>
          <li>Save the downloaded <code>location-history.json</code> file and upload it here</li>
        </ol>
      </div>
    </div>
  `);

  // Drag & drop
  const area = document.getElementById('upload-area');
  area.addEventListener('dragover', e => { e.preventDefault(); area.classList.add('drag-over'); });
  area.addEventListener('dragleave', () => area.classList.remove('drag-over'));
  area.addEventListener('drop', e => { e.preventDefault(); area.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });

  // File input
  const fi = document.getElementById('file-input');
  fi.onchange = e => handleFiles(e.target.files);
}

// STEP 2 – SETTINGS
function renderWzStep2() {
  const s = App.settings;
  document.getElementById('wz-body').innerHTML = `
    <div class="setting-group">
      <div class="setting-group-title">Google Maps API Key (optional)</div>
      <p style="font-size:12px;color:var(--text2);margin-bottom:8px;">Provide a key to get place names and better auto-tagging. Without it, coordinates will be used.</p>
      <input type="text" class="db-input" id="s-gmapapikey" placeholder="AIza…" value="${App.gmapAPIKey}">
    </div>
    <div class="divider"></div>
    <div class="setting-group">
      <div class="setting-group-title">Home & Trip Detection</div>
      ${makeSlider('homeRadius', 'Home detection radius', s.homeRadius, 10, 1000, 'm')}
      ${makeSlider('minTripDuration', 'Minimum trip duration', s.minTripDuration, 1, 100, 'h')}
      ${makeSlider('maxTripDuration', 'Maximum trip duration', Math.round(s.maxTripDuration), 1, 1000, 'd', 'days', 24)}
      ${makeSlider('minTripRange', 'Minimum trip range (farthest point)', s.minTripRange, 1, 1000, 'km')}
      ${makeSlider('minGapBetweenTrips', 'Minimum gap between trips', s.minGapBetweenTrips, 10, 1000, 'h')}
      ${makeSlider('minStopDuration', 'Minimum stop duration', s.minStopDuration, 10, 500, 'min')}
    </div>
    <div class="divider"></div>
    <div class="setting-group">
      <div class="setting-group-title">Data Quality</div>
      ${makeSlider('minVisitProb', 'Minimum visit probability', s.minVisitProb, 0.1, 0.9, '', '')}
      ${makeSlider('minActivityProb', 'Minimum activity probability', s.minActivityProb, 0.1, 0.9, '', '')}
      ${makeSlider('placeClusterRadius', 'Place clustering radius', s.placeClusterRadius, 10, 1000, 'm')}
    </div>
  `;
  // Add live slider listeners
  document.querySelectorAll('#wz-body input[type=range]').forEach(slider => {
    slider.addEventListener('input', () => {
      const valEl = document.getElementById(`val-${slider.id}`);
      if (valEl) valEl.textContent = slider.value + slider.dataset.unit;
    });
  });
}

function makeSlider(id, label, val, min, max, unit, altUnit, multiplier) {
  const displayVal = multiplier ? Math.round(val / multiplier) : val;
  const displayUnit = altUnit || unit;
  const step = (max - min) <= 10 ? 0.05 : 1;
  //console.log("Creating slider:", label, " value=", val, " mult=", multiplier);
  return `
    <div class="slider-row">
      <label>${label} <span id="val-${id}">${displayVal}${displayUnit}</span></label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${displayVal}" data-unit="${displayUnit}" data-multiplier="${multiplier || 1}">
        <input type="number" class="db-input sm" id="${id}-num" value="${displayVal}" min="${min}" max="${max}" step="${step}" style="width:70px;flex-shrink:0;" oninput="syncSlider('${id}','${unit}','${multiplier || 1}')">
      </div>
    </div>`;
}

function syncSlider(id, unit, multiplier) {
  const numEl = document.getElementById(`${id}-num`);
  const sliderEl = document.getElementById(id);
  const valEl = document.getElementById(`val-${id}`);
  if (!numEl || !sliderEl) return;
  sliderEl.value = numEl.value;
  if (valEl) valEl.textContent = numEl.value + (sliderEl.dataset.unit || '');
}

function saveSettingsFromUI() {
  App.gmapAPIKey = document.getElementById('s-gmapapikey')?.value?.trim() || '';
  const getVal = (id) => {
    const el = document.getElementById(id);
    const num = document.getElementById(`${id}-num`);
    const v = parseFloat((num || el)?.value || 0);
    const m = parseFloat(el?.dataset?.multiplier || 1);
    return v * m;
  };
  App.settings.homeRadius = getVal('homeRadius');
  App.settings.minTripDuration = getVal('minTripDuration');
  App.settings.maxTripDuration = getVal('maxTripDuration') * 24;
  App.settings.minTripRange = getVal('minTripRange');
  App.settings.minGapBetweenTrips = getVal('minGapBetweenTrips');
  App.settings.minStopDuration = getVal('minStopDuration');
  App.settings.minVisitProb = getVal('minVisitProb');
  App.settings.minActivityProb = getVal('minActivityProb');
  App.settings.placeClusterRadius = getVal('placeClusterRadius');
}

// STEP 3 – PLACE TAGGING
let wzMapMarkers = {};
function renderWzStep3() {
  const places = App.frequentPlaces;
  const body = document.getElementById('wz-body');

  if (!places.length) {
    body.innerHTML = `<div style="text-align:center;color:var(--text2);padding:40px;"><i class="fa-solid fa-magnifying-glass" style="font-size:32px;color:var(--text3);margin-bottom:12px;display:block;"></i>No frequently visited places found (10+ visits required). You can skip this step.</div>`;
    return;
  }

  const tagged = places.filter(p => p.tag !== 'none').length;
  body.innerHTML = `
    <p style="font-size:12px;color:var(--text2);margin-bottom:12px;">Tag your frequently visited places so Tripel can identify what counts as a trip. <strong style="color:var(--text)">At least one Home is required.</strong> &nbsp;<span style="color:var(--text3)">${tagged}/${places.length} tagged</span></p>
    <div class="tag-layout">
      <div class="tag-list" id="wz-place-list"></div>
      <div id="wizard-mini-map" style="height:380px;"></div>
    </div>
  `;

  // Render list
  renderWzPlaceList();

  // Init mini-map
  setTimeout(() => {
    if (App.wizardMap) { App.wizardMap.remove(); App.wizardMap = null; }
    App.wizardMap = L.map('wizard-mini-map', { zoomControl: true, attributionControl: true }).setView([20, 0], 2);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 19,
      crossOrigin: '', // or true
      subdomains: 'abcd'
    }).addTo(App.wizardMap);
    renderWzMapMarkers();
    if (places.length) {
      const bounds = places.map(p => [p.center.lat, p.center.lng]);
      App.wizardMap.fitBounds(bounds, { padding: [20, 20] });
    }
  }, 100);
}

function renderWzPlaceList() {
  const list = document.getElementById('wz-place-list');
  if (!list) return;
  list.innerHTML = App.frequentPlaces.map((p, i) => `
    <div class="place-item ${p._selected ? 'selected' : ''}" id="place-item-${p.id}" onclick="selectPlace('${p.id}')">
      <div class="place-item-header">
        <div class="place-dot" style="background:${TAG_COLORS[p.tag] || 'var(--text3)'}"></div>
        <div class="place-name">${p.name || `Place ${i + 1}`}</div>
        <div class="place-freq">${p.count}×</div>
      </div>
      ${p.address ? `<div class="place-addr">${p.address}</div>` : `<div class="place-addr">${p.center.lat.toFixed(4)}, ${p.center.lng.toFixed(4)}</div>`}
      <div class="tag-btns">
        ${Object.entries(TAG_LABELS).map(([tag, label]) => `<button class="tag-btn ${p.tag === tag ? 'active' : ''}" data-tag="${tag}" onclick="tagPlace('${p.id}','${tag}',event)">${label}</button>`).join('')}
      </div>
    </div>
  `).join('');
}

function selectPlace(id) {
  const p = App.frequentPlaces.find(pl => pl.id === id);
  if (!p) return;
  App.frequentPlaces.forEach(pl => pl._selected = false);
  p._selected = true;
  renderWzPlaceList();
  if (App.wizardMap && wzMapMarkers[id]) {
    App.wizardMap.panTo([p.center.lat, p.center.lng]);
    wzMapMarkers[id].openPopup();
  }
}

function tagPlace(id, tag, evt) {
  evt.stopPropagation();
  const p = App.frequentPlaces.find(pl => pl.id === id);
  if (!p) return;
  p.tag = tag;
  renderWzPlaceList();
  renderWzMapMarkers();
}

function renderWzMapMarkers() {
  if (!App.wizardMap) return;
  // Clear existing
  Object.values(wzMapMarkers).forEach(m => m.remove());
  wzMapMarkers = {};
  for (const p of App.frequentPlaces) {
    const color = TAG_COLORS[p.tag] || 'var(--text3)';
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.4);box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12], iconAnchor: [6, 6]
    });
    const marker = L.marker([p.center.lat, p.center.lng], { icon })
      .addTo(App.wizardMap)
      .bindPopup(`<div class="popup-title">${p.name || 'Place'}</div><div class="popup-meta">${p.count} visits · Tagged: <strong>${TAG_LABELS[p.tag]}</strong></div>`);
    marker.on('click', () => selectPlace(p.id));
    wzMapMarkers[p.id] = marker;
  }
}

// STEP 4 – RESULTS
function renderWzStep4() {
  const body = document.getElementById('wz-body');
  const n = App.trips.length;

  if (!n) {
    body.innerHTML = `<div style="text-align:center;padding:30px;"><i class="fa-solid fa-magnifying-glass" style="font-size:36px;color:var(--text3);display:block;margin-bottom:12px;"></i><p style="color:var(--text2);">No trips found with current settings. Try adjusting the minimum trip duration or range, or check your Home tagging.</p><button class="btn ghost" style="margin-top:14px;" onclick="wizardBack()"><i class="fa-solid fa-arrow-left"></i> Back to Settings</button></div>`;
    return;
  }

  const statBadges = `<div class="stat-badges"><span class="stat-badge"><i class="fa-solid fa-plane"></i>${n} trips found</span><span class="stat-badge"><i class="fa-solid fa-calendar"></i>${App.trips.length ? Math.round((App.trips[n - 1].startTime - App.trips[0].endTime) / 86400000 / 365) : 0}+ yrs of data</span></div>`;

  const items = App.trips.slice(0, 20).map(t => `
    <div class="result-trip-item">
      <div class="result-trip-icon">${getTripIcon(t)}</div>
      <div style="flex:1;min-width:0;">
        <div class="result-trip-name">${t.name}</div>
        <div class="result-trip-meta">${t.displayStartDate} – ${t.displayEndDate} · ${t.stats.days || '?'}d · ${t.stats.distKm || 0}km</div>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <div style="margin-bottom:16px;">
      <div style="font-size:22px;font-family:var(--font-head);font-weight:800;color:var(--accent);">${n} trips detected</div>
      <div style="font-size:13px;color:var(--text2);margin-top:4px;">${App.rawData.length.toLocaleString()} data points analysed</div>
      ${statBadges}
    </div>
    <div style="max-height:360px;overflow-y:auto;">${items}${n > 20 ? `<div style="text-align:center;font-size:12px;color:var(--text2);padding:8px;">…and ${n - 20} more trips</div>` : ''}</div>
  `;
}
