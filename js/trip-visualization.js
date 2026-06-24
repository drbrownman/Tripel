// ============================================================
// MAP INIT
// ============================================================
function resetMapToTheme(themeId = 'carto-dark') {
  const theme = getTheme(themeId);
  if (App.mapLayers.basemap) {
    App.map.removeLayer(App.mapLayers.basemap);
  }
  App.mapLayers.basemap = L.tileLayer(theme.basemapUrl, {
    attribution: theme.basemapAttr,
    maxZoom: 19,
    crossOrigin: true
  }).addTo(App.map);
}

function initMap() {
  App.map = L.map('map', { zoomControl: false, attributionControl: true }).setView([20, 0], 3);
  resetMapToTheme('carto-dark');
  App.mapLayers.tripGroup = L.layerGroup().addTo(App.map);
}

function clearTripMapLayers() {
  App.mapLayers.tripGroup.clearLayers();
  App.tripMarkers = {};
  App.tripMapLayers = [];
}

function adjustMapForPanel(open) {
  // When side panel is open, offset the map center
  const panelW = open ? parseInt(getComputedStyle(document.documentElement).getPropertyValue('--panel-w')) : 0;
  document.getElementById('map').style.right = open ? `${panelW}px` : '0';
  if (App.map) App.map.invalidateSize();
}

// ============================================================
// APP VIEW MANAGEMENT
// ============================================================
window._selectedTripIds = new Set();

function showHome() {
  document.getElementById('welcome-card').style.display = 'block';
  document.getElementById('trips-section').style.display = App.trips.length ? 'flex' : 'none';
  document.getElementById('side-panel').classList.remove('open');
  // document.getElementById('btn-home').style.display = 'none';
  if (window.exitSlideshowMode) window.exitSlideshowMode();
  clearTripMapLayers();
  resetMapToTheme();
  adjustMapForPanel(false);
  App.map.setView([20, 0], 3);
}

let _prevTripsGridScrollPosition = 0.0;
function showTripsView() {
  document.getElementById('welcome-card').style.display = 'none';
  document.getElementById('trips-section').style.display = 'flex';
  document.getElementById('trips-section').style.flexDirection = 'column';
  // document.getElementById('btn-trips').style.display = 'none';
  if (document.getElementById('btn-save')) document.getElementById('btn-save').style.display = 'flex';
  // document.getElementById('btn-home').style.display = 'flex';
  document.getElementById('side-panel').classList.remove('open');
  adjustMapForPanel(false);
  clearTripMapLayers();
  resetMapToTheme();
  renderTripCards();

  //Disabled because we are no longer computing destination centers
  // if (App.trips.length) {
  //   // document.getElementById('btn-trips').style.display = 'flex';
  //   // Show all trip locations as dots on map
  //   const pts = App.trips.filter(t => t.destination).map(t => [t.destination.lat, t.destination.lng]);
  //   if (pts.length) {
  //     App.map.fitBounds(pts, { padding: [60, 60] });
  //     pts.forEach(([lat, lng]) => {
  //       const icon = L.divIcon({
  //         className: 'custom-div-icon',
  //         html: `<div style="width:8px;height:8px;border-radius:50%;background:var(--accent);opacity:0.7;"></div>`,
  //         iconSize: [8, 8], iconAnchor: [4, 4]
  //       });
  //       L.marker([lat, lng], { icon }).addTo(App.mapLayers.tripGroup);
  //     });
  //   }
  // }
}

let _groupByYear = true;
function toggleGroupByYear() {
  _groupByYear = !_groupByYear;
  document.getElementById('btn-group-year').classList.toggle('active', _groupByYear);
  renderTripCards();
}

function renderTripCards() {
  const grid = document.getElementById('trips-grid');
  const badge = document.getElementById('trip-count-badge');
  const regularTrips = App.trips.filter(t => t.id !== 'all-trips').filter(t => !t._hidden);
  const allTripsTrip = App.trips.find(t => t.id === 'all-trips');

  badge.textContent = `${regularTrips.length} trip${regularTrips.length !== 1 ? 's' : ''}`;

  const mergeBtn = document.getElementById('btn-merge-trips');
  if (mergeBtn) {
    mergeBtn.style.display = window._selectedTripIds.size > 1 ? 'inline-block' : 'none';
  }

  if (!regularTrips.length) {
    grid.innerHTML = `<div class="empty-trips" style="grid-column:1/-1"><i class="fa-solid fa-map-pin"></i><p>No trips yet. Import your travel data to get started.</p></div>`;
    return;
  }

  let html = '';

  if (allTripsTrip) {
    html += tripCardHtml(allTripsTrip);
  }

  if (_groupByYear) {
    const byYear = {};
    regularTrips.forEach(t => {
      const y = t.startTime.getFullYear();
      (byYear[y] || (byYear[y] = [])).push(t);
    });
    Object.keys(byYear).sort((a, b) => b - a).forEach(yr => {
      html += `<div class="year-group-header">${yr}</div>`;
      html += byYear[yr].map(t => tripCardHtml(t)).join('');
    });
  } else {
    html += regularTrips.map(t => tripCardHtml(t)).join('');
  }
  grid.innerHTML = html;
  grid.scrollTop = _prevTripsGridScrollPosition || 0.0;
}

function tripCardHtml(t) {
  const days = t.stats?.days || '?';
  const dist = t.stats?.distKm ? `${t.stats.distKm}km` : '';
  const stops = t.stats?.stops || 0;
  return `<div class="trip-card" onclick="viewTrip('${t.id}')">
    <div class="trip-card-thumb">${getTripIcon(t)}</div>
    <div class="trip-card-body">
      <div class="trip-card-name" title="${t.name}">${t.name}</div>
      <div class="trip-card-meta">
        <span>${t.displayStartShortDate}</span>
        <span class="trip-tag">${days}d</span>
        ${dist ? `<span class="trip-tag">${dist}</span>` : ''}
      </div>
    </div>
    <div class="trip-card-actions">
      ${t.id !== 'all-trips' ? `<div style="display:flex;align-items:center;padding:0 8px;cursor:pointer;" onclick="event.stopPropagation()"><input type="checkbox" title="Select for Merge" style="cursor:pointer;width:16px;height:16px;" ${window._selectedTripIds && window._selectedTripIds.has(t.id) ? 'checked' : ''} onchange="window.toggleTripSelect('${t.id}', this.checked)"></div>` : ''}
      ${addTripTagButton(t.id)}
      ${addHideButton(t.id)}
      <button title="Download JSON" onclick="event.stopPropagation();downloadTripJSON('${t.id}')"><i class="fa-solid fa-download"></i></button>
    </div>
  </div>`;
}

function addTripTagButton(tripId) {
  const trip = App.trips.find(t => t.id === tripId);
  if (trip && trip._hidden) return "";
  let currentTag = trip._tag || "";
  let index = TRIP_TAGS.findIndex(t => t.title === currentTag);
  if (index === -1) index = 0;
  return `<button id="btn-tag-${tripId}" title="${currentTag}" onclick="event.stopPropagation();cycleTripTag('${tripId}')">${TRIP_TAGS[index].icon}</button>`;
}

function cycleTripTag(tripId) {
  const trip = App.trips.find(t => t.id === tripId);
  let index = TRIP_TAGS.findIndex(t => t.title === trip._tag);
  index = (index + 1) % TRIP_TAGS.length;
  trip._tag = TRIP_TAGS[index].title;
  document.getElementById(`btn-tag-${tripId}`).title = TRIP_TAGS[index].title;
  document.getElementById(`btn-tag-${tripId}`).innerHTML = TRIP_TAGS[index].icon;
}

function addHideButton(tripId) {
  if (tripId !== "all-trips") {
    return `<button title="Hide Trip" onclick="event.stopPropagation();hideTrip('${tripId}')"><i class="fa-solid fa-eye-slash"></i></button>`;
  }
  return "";
}

function hideTrip(tripId) {
  App.trips.find(t => t.id === tripId)._hidden = true;
  renderTripCards();
}

window.toggleTripSelect = function (tripId, checked) {
  if (!window._selectedTripIds) window._selectedTripIds = new Set();
  if (checked) {
    window._selectedTripIds.add(tripId);
  } else {
    window._selectedTripIds.delete(tripId);
  }
  const mergeBtn = document.getElementById('btn-merge-trips');
  if (mergeBtn) {
    mergeBtn.style.display = window._selectedTripIds.size > 1 ? 'inline-block' : 'none';
  }
};

window.mergeSelectedTrips = async function () {
  if (!window._selectedTripIds || window._selectedTripIds.size < 2) return;
  const selectedIds = Array.from(window._selectedTripIds);
  const tripsToMerge = App.trips.filter(t => selectedIds.includes(t.id)).sort((a, b) => a.startTime - b.startTime);

  if (tripsToMerge.length < 2) return;

  const newElements = [];
  tripsToMerge.forEach(t => newElements.push(...t.elements));
  newElements.sort((a, b) => a.startTime - b.startTime);

  const startTime = newElements[0].startTime;
  const endTime = newElements.at(-1).endTime;
  const name = "Merged trip: " + tripsToMerge.map(t => t.name).join(" and ");

  const newTrip = {
    id: uid(),
    _hidden: false,
    startTime: startTime,
    endTime: endTime,
    displayStartDate: tripsToMerge[0].displayStartDate,
    displayStartShortDate: tripsToMerge[0].displayStartShortDate,
    displayEndDate: tripsToMerge.at(-1).displayEndDate,
    elements: newElements,
    name: name,
    stats: {},
    destination: null,
    _maxRange: Math.max(...tripsToMerge.map(t => t._maxRange || 0)),
    style: defaultTripStyle(),
  };

  if (window.calcTripStats) {
    await window.calcTripStats(newTrip);
  }

  // App.trips = App.trips.filter(t => !selectedIds.includes(t.id));
  App.trips.push(newTrip);
  App.trips.sort((a, b) => b.startTime - a.startTime);

  window._selectedTripIds.clear();

  // if (window.saveAppState) window.saveAppState();
  if (window.renderTripCards) window.renderTripCards();
  if (window.toast) toast('Trips merged successfully', 'success');
};

// ============================================================
// TRIP VIEW
// ============================================================
function viewTrip(tripId) {
  const trip = App.trips.find(t => t.id === tripId);
  if (!trip) return;
  App.currentTripId = tripId;
  App.segFilter = { type: 'all', subtype: 'all' };

  // Hide main panel
  _prevTripsGridScrollPosition = document.getElementById('trips-grid').scrollTop;
  document.getElementById('welcome-card').style.display = 'none';
  document.getElementById('trips-section').style.display = 'none';

  // Show side panel
  document.getElementById('side-panel').classList.add('open');
  // document.getElementById('btn-home').style.display = 'flex';
  if (window.exitSlideshowMode) window.exitSlideshowMode();
  adjustMapForPanel(true);

  // Apply this trip's basemap/theme
  const themeId = trip.style?.overrides?.basemapId || trip.style?.themeId || 'carto-dark';
  const theme = getTheme(themeId);
  if (App.mapLayers.basemap) {
    App.map.removeLayer(App.mapLayers.basemap);
  }
  App.mapLayers.basemap = L.tileLayer(theme.basemapUrl, {
    attribution: theme.basemapAttr,
    maxZoom: 19,
    crossOrigin: true
  }).addTo(App.map);

  document.getElementById('sp-trip-name').textContent = trip.name;
  App.spTab = 'overview';
  switchSpTab('overview')
  renderSpTab();

  renderTripOnMap(trip);
}

function closeTripView() {
  const center = App.map.getCenter();
  const zoom = App.map.getZoom();

  const tripId = App.currentTripId;
  const trip = App.trips.find(t => t.id === tripId);

  if (trip != null) {
    trip.lastView = { center, zoom };
    // console.log("Saved trip view: " + trip.lastView)
  }

  document.getElementById('side-panel').classList.remove('open');
  if (window.exitSlideshowMode) window.exitSlideshowMode();
  adjustMapForPanel(false);
  clearTripMapLayers();
  showTripsView();
}

function switchSpTab(tab) {
  App.spTab = tab;
  document.querySelectorAll('.sp-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });
  renderSpTab();
}

function renderSpTab() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const body = document.getElementById('sp-body');
  if (App.spTab === 'overview') {
    renderSpOverview(trip, body);
    if (window.exitSlideshowMode) window.exitSlideshowMode();
  } else if (App.spTab === 'segments') {
    renderSpSegments(trip, body);
    if (window.exitSlideshowMode) window.exitSlideshowMode();
  } else if (App.spTab === 'slideshow') {
    if (window.renderSpSlideshow) renderSpSlideshow(trip, body);
  }
}

function renderSpOverview(trip, body) {
  const s = trip.stats || {};
  const modes = Object.entries(s.transportModes || {}).map(([k, v]) => `<span class="mode-pill"><i class="fa-solid ${ACTIVITY_MODES[k]?.icon || 'fa-arrow-right'}"></i> ${ACTIVITY_MODES[k]?.label || k} ×${v}</span>`).join('');

  body.innerHTML = `
    <div class="info-card">
      <div class="info-card-title">Trip Summary</div>
      <div class="stat-row"><span class="stat-label">Duration</span><span class="stat-value">${s.days || '?'} days</span></div>
      <div class="stat-row"><span class="stat-label">Distance</span><span class="stat-value">${s.distKm || 0}km</span></div>
      <div class="stat-row"><span class="stat-label">Max range</span><span class="stat-value">${s.maxRangeKm || 0}km</span></div>
      <div class="stat-row"><span class="stat-label">Stops</span><span class="stat-value">${s.stops || 0}</span></div>
      <div class="stat-row"><span class="stat-label">Avg speed</span><span class="stat-value">${s.avgSpeedKmh || 0} km/h</span></div>
      <div class="stat-row"><span class="stat-label">Data points</span><span class="stat-value">${trip.elements.length}</span></div>
    </div>
    <div class="info-card">
      <div class="info-card-title">Dates</div>
      <div class="stat-row"><span class="stat-label">Start</span><span class="stat-value">${trip.displayStartDate}</span></div>
      <div class="stat-row"><span class="stat-label">End</span><span class="stat-value">${trip.displayEndDate}</span></div>
    </div>
    ${modes ? `<div class="info-card"><div class="info-card-title">Transport</div><div style="display:flex;flex-wrap:wrap;">${modes}</div></div>` : ''}
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn sm ghost" onclick="downloadTripJSON('${trip.id}')"><i class="fa-solid fa-download"></i> Export JSON</button>
      <button class="btn sm ghost" onclick="startRenameTrip()"><i class="fa-solid fa-pen"></i> Rename</button>
    </div>
    <div id="customization-container" style="margin-top:24px;"></div>
  `;
  if (window.renderSpOverviewCustomization) {
    renderSpOverviewCustomization(trip, document.getElementById('customization-container'));
  }
}

function renderSpSegments(trip, body) {
  const elements = [...trip.elements].sort((a, b) => a.startTime - b.startTime);

  if (!elements.length) {
    body.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);">No segments</div>';
    return;
  }

  // Precompute visit indices
  let vIdx = 0;
  const visitIdxMap = {};
  for (const el of elements) {
    if (el.visit) {
      vIdx++;
      visitIdxMap[el._id] = vIdx;
    }
  }

  if (!App.segFilter) App.segFilter = { type: 'all', subtype: 'all' };

  let filteredElements = elements;
  if (App.segFilter.type === 'visits') {
    filteredElements = elements.filter(e => e.visit);
    if (App.segFilter.subtype !== 'all') {
      filteredElements = filteredElements.filter(e => (e._visitType || 'default') === App.segFilter.subtype);
    }
  } else if (App.segFilter.type === 'activities') {
    filteredElements = elements.filter(e => e.activity);
    if (App.segFilter.subtype !== 'all') {
      filteredElements = filteredElements.filter(e => (e._activityMode || 'default') === App.segFilter.subtype);
    }
  } else if (App.segFilter.type === 'paths') {
    filteredElements = elements.filter(e => e.timelinePath);
  }

  let html = `
    <div class="info-card" style="margin-top:12px; padding:12px;">
      <div style="display:flex; gap:8px; margin-bottom:8px;">
        <select class="db-input" onchange="window.clearSegSelections(); App.segFilter.type=this.value; App.segFilter.subtype='all'; renderSpTab();">
          <option value="all" ${App.segFilter.type === 'all' ? 'selected' : ''}>All Segments</option>
          <option value="visits" ${App.segFilter.type === 'visits' ? 'selected' : ''}>Visits</option>
          <option value="activities" ${App.segFilter.type === 'activities' ? 'selected' : ''}>Activities</option>
          <option value="paths" ${App.segFilter.type === 'paths' ? 'selected' : ''}>Timeline Paths</option>
        </select>
        ${App.segFilter.type === 'visits' ? `
          <select class="db-input" onchange="window.clearSegSelections(); App.segFilter.subtype=this.value; renderSpTab();">
            <option value="all">All Subtypes</option>
            ${Object.entries(VISIT_TYPES).map(([k, v]) => `<option value="${k}" ${App.segFilter.subtype === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select>
        ` : App.segFilter.type === 'activities' ? `
          <select class="db-input" onchange="window.clearSegSelections(); App.segFilter.subtype=this.value; renderSpTab();">
            <option value="all">All Subtypes</option>
            ${Object.entries(ACTIVITY_MODES).map(([k, v]) => `<option value="${k}" ${App.segFilter.subtype === k ? 'selected' : ''}>${v.label}</option>`).join('')}
          </select>
        ` : ''}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border); padding-top:8px;">
        <label style="font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer;">
          <input type="checkbox" id="selectAllCheckbox" onchange="window.selectAllSegments(this.checked)"> Select All Filtered
        </label>
        <div style="display:flex; gap:4px;">
          <button class="btn ghost sm" onclick="window.bulkHideSegments(true)"><i class="fa-solid fa-eye-slash"></i> Hide</button>
          <button class="btn ghost sm" onclick="window.bulkHideSegments(false)"><i class="fa-solid fa-eye"></i> Show</button>
        </div>
      </div>
    </div>
    <div class="section-label" style="margin-top:12px;">Timeline (${filteredElements.length})</div>
  `;

  for (const el of filteredElements) {
    if (el.visit) {
      const geo = parseGeo(el.visit.topCandidate?.placeLocation);
      const type = el._visitType || 'default';
      const vt = VISIT_TYPES[type] || VISIT_TYPES.default;
      const dur = formatDuration(el.endTime - el.startTime);
      const gmUrl = geo ? `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}` : '#';
      const visitIdx = visitIdxMap[el._id];

      html += `<div class="seg-item ${el._hidden ? 'hidden-seg' : ''} ${el._mapHighlighted ? 'highlighted' : ''}" id="seg-${el._id}" onclick="highlightSegment('${el._id}')">
        <div style="display:flex; align-items:center; padding-right:8px;" onclick="event.stopPropagation()">
          <input type="checkbox" class="seg-checkbox" ${el._selected ? 'checked' : ''} onchange="window.toggleSegSelect('${el._id}', this.checked)">
        </div>
        <div class="seg-icon" style="background:${vt.color};color:#000;"><i class="fa-solid ${vt.icon}"></i></div>
        <div class="seg-info">
          <div class="seg-name">${visitIdx}. ${el.approxDisplayName} ${geo ? `[${geo.lat.toFixed(2)}, ${geo.lng.toFixed(2)}]` : ''}</div>
          <div class="seg-meta">${el.displayStartDate} ${el.displayStartTime} · ${dur}</div>
          <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
            <select class="tag-select" onchange="tagVisit('${el._id}',this.value)">
              ${Object.entries(VISIT_TYPES).map(([k, v]) => `<option value="${k}" ${el._visitType === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
            ${geo ? `<a href="${gmUrl}" target="_blank" style="font-size:10px;color:var(--accent);display:flex;align-items:center;gap:3px;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Maps</a>` : ''}
          </div>
        </div>
        <div class="seg-actions">
          <button class="seg-btn" onclick="toggleSegStyle('${el._id}',event)" data-tip="Style"><i class="fa-solid fa-palette"></i></button>
          <button class="seg-btn ${el._hidden ? 'on' : ''}" onclick="toggleHidden('${el._id}',event)" data-tip="${el._hidden ? 'Show' : 'Hide'}"><i class="fa-solid ${el._hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
        </div>
        <div id="style-${el._id}" style="display:none; width:100%; margin-top:8px; border-top:1px solid var(--border); padding-top:8px;" onclick="event.stopPropagation()">
           <label style="font-size:11px;">Marker Color: <input type="color" value="${el._markerColor || '#ffffff'}" onchange="setSegStyle('${el._id}','markerColor',this.value)"></label>
        </div>
      </div>`;
    } else if (el.activity) {
      const mode = el._activityMode || 'default';
      const am = ACTIVITY_MODES[mode] || ACTIVITY_MODES.default;
      const dist = Math.round(parseFloat(el.activity.distanceMeters || 0) / 1000);
      const dur = formatDuration(el.endTime - el.startTime);
      html += `<div class="seg-item ${el._hidden ? 'hidden-seg' : ''}" id="seg-${el._id}" onclick="highlightSegment('${el._id}')">
        <div style="display:flex; align-items:center; padding-right:8px;" onclick="event.stopPropagation()">
          <input type="checkbox" class="seg-checkbox" ${el._selected ? 'checked' : ''} onchange="window.toggleSegSelect('${el._id}', this.checked)">
        </div>
        <div class="seg-icon" style="background:var(--surface3);color:var(--text2);"><i class="fa-solid ${am.icon}"></i></div>
        <div class="seg-info">
          <div class="seg-name">${am.label} · ${dist}km</div>
          <div class="seg-meta">${el.displayStartDate} ${el.displayStartTime} · ${dur}</div>
          <div style="margin-top:4px;">
            <select class="tag-select" onchange="tagActivity('${el._id}',this.value)">
              ${Object.entries(ACTIVITY_MODES).map(([k, v]) => `<option value="${k}" ${el._activityMode === k ? 'selected' : ''}>${v.label}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="seg-actions">
          <button class="seg-btn" onclick="toggleSegStyle('${el._id}',event)" data-tip="Style"><i class="fa-solid fa-palette"></i></button>
          <button class="seg-btn ${el._hidden ? 'on' : ''}" onclick="toggleHidden('${el._id}',event)" data-tip="${el._hidden ? 'Show' : 'Hide'}"><i class="fa-solid ${el._hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
        </div>
        <div id="style-${el._id}" style="display:none; width:100%; margin-top:8px; border-top:1px solid var(--border); padding-top:8px; display:none; gap:8px;" onclick="event.stopPropagation()">
           <label style="font-size:11px;">Line Color: <input type="color" value="${el._lineColor || '#ffffff'}" onchange="setSegStyle('${el._id}','lineColor',this.value)"></label>
           <label style="font-size:11px;">Line Weight: <input type="number" style="width:40px" class="db-input" value="${el._lineWeight || ''}" onchange="setSegStyle('${el._id}','lineWeight',this.value)"></label>
           <label style="font-size:11px;">Marker Color: <input type="color" value="${el._markerColor || '#ffffff'}" onchange="setSegStyle('${el._id}','markerColor',this.value)"></label>
        </div>
      </div>`;
    } else if (el.timelinePath) {
      const dur = formatDuration(el.endTime - el.startTime);
      const pts = el.timelinePath.length;
      html += `<div class="seg-item ${el._hidden ? 'hidden-seg' : ''}" id="seg-${el._id}" onclick="highlightSegment('${el._id}')">
        <div style="display:flex; align-items:center; padding-right:8px;" onclick="event.stopPropagation()">
          <input type="checkbox" class="seg-checkbox" ${el._selected ? 'checked' : ''} onchange="window.toggleSegSelect('${el._id}', this.checked)">
        </div>
        <div class="seg-icon"><i class="fa-solid fa-route"></i></div>
        <div class="seg-info">
          <div class="seg-name">${pts} points · ${dur}</div>
          <div class="seg-meta">${el.displayStartDate} ${el.displayStartTime} – ${el.displayEndTime}</div>
        </div>
        <div class="seg-actions">
          <button class="seg-btn" onclick="toggleSegStyle('${el._id}',event)" data-tip="Style"><i class="fa-solid fa-palette"></i></button>
          <button class="seg-btn ${el._hidden ? 'on' : ''}" onclick="toggleHidden('${el._id}',event)" data-tip="${el._hidden ? 'Show' : 'Hide'}"><i class="fa-solid ${el._hidden ? 'fa-eye' : 'fa-eye-slash'}"></i></button>
        </div>
        <div id="style-${el._id}" style="display:none; width:100%; margin-top:8px; border-top:1px solid var(--border); padding-top:8px; display:none; gap:8px;" onclick="event.stopPropagation()">
           <label style="font-size:11px;">Line Color: <input type="color" value="${el._lineColor || '#ffffff'}" onchange="setSegStyle('${el._id}','lineColor',this.value)"></label>
           <label style="font-size:11px;">Line Weight: <input type="number" style="width:40px" class="db-input" value="${el._lineWeight || ''}" onchange="setSegStyle('${el._id}','lineWeight',this.value)"></label>
        </div>
      </div>`;
    }
  }

  body.innerHTML = html;
}

// SEGMENT INTERACTIONS
function highlightSegment(id) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (!el) return;

  // Switch to segments tab if not active
  if (App.spTab !== 'segments') {
    switchSpTab('segments');
  }

  // Highlight in list
  document.querySelectorAll('.seg-item').forEach(s => s.classList.remove('highlighted'));
  const segEl = document.getElementById(`seg-${id}`);
  if (segEl) {
    segEl.classList.add('highlighted');
    segEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Pan to element on map
  const geo = getElementGeo(el);
  if (geo && App.map) App.map.panTo([geo.lat, geo.lng]);
  // Highlight map marker
  if (App.tripMarkers[id]) {
    App.tripMarkers[id].openPopup();
  }
}

function getElementGeo(el) {
  if (el.visit) return parseGeo(el.visit.topCandidate?.placeLocation);
  if (el.activity) return parseGeo(el.activity.end);
  if (el.timelinePath?.length) return parseGeo(el.timelinePath[Math.floor(el.timelinePath.length / 2)].point);
  return null;
}

function toggleHidden(id, evt) {
  evt.stopPropagation();
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (!el) return;
  el._hidden = !el._hidden;
  renderTripOnMap(trip, true);
  renderSpTab();
}

window.toggleSegSelect = function (id, checked) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (el) el._selected = checked;
};

window.selectAllSegments = function (checked) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;

  // Find currently filtered segments to only select those
  const elements = trip.elements;
  let filteredElements = elements;
  if (App.segFilter.type === 'visits') {
    filteredElements = elements.filter(e => e.visit);
    if (App.segFilter.subtype !== 'all') filteredElements = filteredElements.filter(e => (e._visitType || 'default') === App.segFilter.subtype);
  } else if (App.segFilter.type === 'activities') {
    filteredElements = elements.filter(e => e.activity);
    if (App.segFilter.subtype !== 'all') filteredElements = filteredElements.filter(e => (e._activityMode || 'default') === App.segFilter.subtype);
  } else if (App.segFilter.type === 'paths') {
    filteredElements = elements.filter(e => e.timelinePath);
  }

  filteredElements.forEach(el => el._selected = checked);
  renderSpTab(); // Re-render to update checkboxes
};

window.bulkHideSegments = function (hide) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  let changed = false;
  trip.elements.forEach(el => {
    if (el._selected) {
      el._hidden = hide;
      el._selected = false;
      changed = true;
    }
  });
  if (changed) {
    renderTripOnMap(trip, true);
    renderSpTab();
  }
};

window.clearSegSelections = function () {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  trip.elements.forEach(el => el._selected = false);
};

function tagVisit(id, type) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (el) { el._visitType = type; renderTripOnMap(trip, true); }
}

function tagActivity(id, mode) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (el) { el._activityMode = mode; renderTripOnMap(trip, true); }
}

function startRenameTrip() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const nameEl = document.getElementById('sp-trip-name');
  const oldName = trip.name;
  nameEl.innerHTML = `<div class="inline-edit"><input type="text" value="${oldName}" id="rename-input"><button class="btn sm accent" onclick="confirmRename()">Save</button><button class="btn sm ghost" onclick="cancelRename('${oldName}')">✕</button></div>`;
  document.getElementById('rename-input')?.focus();
}

function confirmRename() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  const newName = document.getElementById('rename-input')?.value?.trim();
  if (!trip || !newName) return;
  trip.name = newName;
  document.getElementById('sp-trip-name').textContent = newName;
  renderTripCards();
}

function cancelRename(oldName) {
  document.getElementById('sp-trip-name').textContent = oldName;
}


// ============================================================
// MAP VISUALIZATION
// ============================================================
function renderTripOnMap(trip, retainView = false) {
  clearTripMapLayers();
  const group = App.mapLayers.tripGroup;
  const bounds = [];

  // Collect timeline path time ranges
  const pathRanges = trip.elements
    .filter(el => el.timelinePath && !el._hidden)
    .map(el => ({ start: el.startTime.getTime(), end: el.endTime.getTime() }));

  function coveredByPath(el) {
    const s = el.startTime.getTime(), e = el.endTime.getTime();
    return pathRanges.some(r => s >= r.start && e <= r.end);
  }

  const theme = window.getTheme ? getTheme(trip.style?.themeId) : { lineColor: 'var(--accent)', lineWeight: 3, flightColor: 'var(--accent4)', flightWeight: 2, flightDashArray: '6, 4', markerColors: { home: '#a5c1d6', default: '#a5c1d6' } };
  const o = trip.style?.overrides || {};
  const tColor = o.allLinesColor || theme.lineColor;
  const tWeight = parseInt(o.allLinesWeight) || theme.lineWeight;
  const fColor = o.allFlightsColor || theme.flightColor;
  const fWeight = parseInt(o.allFlightsWeight) || theme.flightWeight;
  const mColorDefault = o.allMarkersColor || theme.markerColors.default;
  const staysColor = o.allStaysColor || mColorDefault;
  const aColorMarker = o.allActivitiesColor || mColorDefault;
  const hColor = o.homeMarkerColor || theme.markerColors.home || mColorDefault;

  let lastDrawnPoint = null;
  // 1. Draw timeline paths
  for (const el of trip.elements.filter(e => e.timelinePath && !e._hidden)) {
    const pts = el.timelinePath.map(p => {
      const g = parseGeo(p.point);
      return g ? [g.lat, g.lng] : null;
    }).filter(Boolean);
    if (lastDrawnPoint != null) {
      const distance = haversine(pts[0][0], pts[0][1], lastDrawnPoint[0], lastDrawnPoint[1]) / 1000;
      if (distance > 5 && distance < 500) {
        const opacity = (distance > 300) ? 0.3 : 0.8;
        const gapPoly = L.polyline([lastDrawnPoint, pts[0]], { color: el._lineColor || tColor, weight: el._lineWeight || tWeight, opacity: opacity, dashArray: '6 4' })
          .addTo(group)
        App.tripMarkers[el._id + "_gapfill"] = gapPoly;
        lastDrawnPoint = pts[0];
      }
    }
    if (pts.length < 2) continue;
    const poly = L.polyline(pts, { color: el._lineColor || tColor, weight: el._lineWeight || tWeight, opacity: 0.8 })
      .addTo(group)
      .bindPopup(makeTimelinePopup(el, o));
    poly.on('click', () => highlightSegment(el._id));
    App.tripMarkers[el._id] = poly;
    pts.forEach(p => bounds.push(p));
    lastDrawnPoint = pts.at(-1);
  }

  // 2. Draw activities NOT covered by timeline paths
  for (const el of trip.elements.filter(e => e.activity && !e._hidden)) {
    if (coveredByPath(el)) continue;
    const start = parseGeo(el.activity.start);
    const end = parseGeo(el.activity.end);
    if (!start || !end) continue;
    const mode = el._activityMode || 'drive';
    const dist = parseFloat(el.activity.distanceMeters || 0) / 1000;
    const isFlight = mode === 'flight';

    if (isFlight) {
      // Great circle arc
      const arcPts = greatCirclePoints(start.lat, start.lng, end.lat, end.lng);
      const poly = L.polyline(arcPts, { color: el._lineColor || fColor, weight: el._lineWeight || fWeight, opacity: 0.8, dashArray: theme.flightDashArray || '6 4' })
        .addTo(group)
        .bindPopup(makeActivityPopup(el, o));
      poly.on('click', () => highlightSegment(el._id));
      App.tripMarkers[el._id] = poly;
      // Flight icon at midpoint
      const midPt = arcPts[Math.floor(arcPts.length / 2)];
      const angle = (270 + ((Math.atan2(end.lng - start.lng, end.lat - start.lat) * 180) / Math.PI)) % 360;
      const flightIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="flight-icon-marker" style="transform:rotate(${angle}deg);color:${el._markerColor || aColorMarker}"><i class="fa-solid fa-plane"></i></div>`,
        iconSize: [20, 20], iconAnchor: [10, 10]
      });
      L.marker(midPt, { icon: flightIcon })
        .addTo(group);
      bounds.push([start.lat, start.lng], [end.lat, end.lng]);
    } else {
      // Straight line for activities not covered by timeline path
      const poly = L.polyline([[start.lat, start.lng], [end.lat, end.lng]], { color: el._lineColor || tColor, weight: el._lineWeight || 1.5, opacity: 0.3, dashArray: '6 4' })
        .addTo(group)
        .bindPopup(makeActivityPopup(el, o));
      poly.on('click', () => highlightSegment(el._id));
      App.tripMarkers[el._id] = poly;
      bounds.push([start.lat, start.lng], [end.lat, end.lng]);
    }
  }

  // 3. Draw visit markers
  let visitIdx = 0;
  for (const el of trip.elements.filter(e => e.visit && !e._hidden)) {
    const geo = parseGeo(el.visit.topCandidate?.placeLocation);
    if (!geo) continue;
    const type = el._visitType || 'default';
    const vt = VISIT_TYPES[type] || VISIT_TYPES.default;

    //For now, remove first and last marker
    // const isFirst = visitIdx === 0;
    // const isLast = visitIdx === trip.elements.filter(e => e.visit && !e._hidden).length - 1;
    // const markerClass = isFirst ? 'start' : isLast ? 'end' : type;
    // let colorStr = isFirst ? '#52e552' : isLast ? '#e14b4b' : (el._markerColor || staysColor);
    // if (type === 'home' && !el._markerColor && !isFirst && !isLast) colorStr = hColor;
    // let iconStr = isFirst ? 'fa-play' : isLast ? 'fa-stop' : vt.icon;
    // if (!isFirst && !isLast) {
    //   if (type === 'home' && o.homeIcon) iconStr = o.homeIcon;
    //   if (type === 'stay' && o.staysIcon) iconStr = o.staysIcon;
    // }

    const markerClass = type;
    let colorStr = el._markerColor || staysColor;
    if (type === 'home' && !el._markerColor) colorStr = hColor;
    let iconStr = vt.icon;
    if (type === 'home' && o.homeIcon) iconStr = o.homeIcon;
    if (type === 'stay' && o.staysIcon) iconStr = o.staysIcon;

    const icon = L.divIcon({
      className: 'custom-div-icon',
      // html: `<div class="map-marker ${markerClass}" style=""><i class="fa-solid ${iconStr}" style="color:${colorStr}"></i></div>`,
      html: `<div class="map-marker ${markerClass}" style="background:${colorStr}"><i class="fa-solid ${iconStr}" style="color:#000"></i></div>`,
      iconSize: [28, 28], iconAnchor: [8, 28]
    });
    const marker = L.marker([geo.lat, geo.lng], { icon })
      .addTo(group)
      .bindPopup(makeVisitPopup(el, geo, visitIdx + 1, o));
    marker.on('click', () => highlightSegment(el._id));
    App.tripMarkers[el._id] = marker;
    bounds.push([geo.lat, geo.lng]);
    visitIdx++;
  }

  // Fit map to trip
  if (!retainView) {
    if (trip.lastView != null) {
      // console.log("Loading saved trip view: " + trip.lastView)
      App.map.setView(trip.lastView.center, trip.lastView.zoom);
    } else if (bounds.length) {
      App.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }
}

function makeVisitPopup(el, geo, stopIndex, o = {}) {
  const dur = formatDuration(el.endTime - el.startTime);
  const type = el._visitType || 'default';
  const gmUrl = `https://www.google.com/maps/search/?api=1&query=${geo.lat},${geo.lng}`;
  const dateStr = el.displayStartDate;

  let html = `<div class="popup-title">${stopIndex}. ${VISIT_TYPES[type]?.label || 'Stop'}</div>`;
  if (!o.hideDate) html += `<div class="popup-meta">📅 ${dateStr}</div>`;

  let timeStr = '';
  if (!o.hideTime) timeStr += `${el.displayStartTime} – ${el.displayEndTime}`;
  if (!o.hideDuration) timeStr += (timeStr ? ` (${dur})` : `⏱️ ${dur}`);
  if (timeStr) html += `<div class="popup-meta">🕐 ${timeStr}</div>`;

  html += `<div class="popup-link"><a href="${gmUrl}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open in Google Maps</a></div>`;
  return html;
}

function makeActivityPopup(el, o = {}) {
  const mode = el._activityMode || 'drive';
  const dist = Math.round(parseFloat(el.activity.distanceMeters || 0) / 1000);
  const dur = formatDuration(el.endTime - el.startTime);

  let html = `<div class="popup-title">${ACTIVITY_MODES[mode]?.label || 'Travel'}</div>`;
  let meta = [];
  if (!o.hideDistance) meta.push(`📏 ${dist}km`);
  if (!o.hideDuration) meta.push(`⏱️ ${dur}`);
  if (meta.length) html += `<div class="popup-meta">${meta.join(' · ')}</div>`;

  return html;
}

function makeTimelinePopup(el, o = {}) {
  const pts = el.timelinePath.length;
  const firstPoint = el.timelinePath[0];
  const lastPoint = el.timelinePath.at(-1);
  const firstPointGeo = parseGeo(firstPoint.point);
  const lastPointGeo = parseGeo(lastPoint.point);
  const firstGMUrl = `https://www.google.com/maps/search/?api=1&query=${firstPointGeo.lat},${firstPointGeo.lng}`;
  const lastGMUrl = `https://www.google.com/maps/search/?api=1&query=${lastPointGeo.lat},${lastPointGeo.lng}`;
  const dur = lastPoint.durationMinutesOffsetFromStartTime;

  let html = `<div class="popup-title">${pts} point(s)</div>`;
  if (!o.hideDuration) html += `<div class="popup-meta">⏱️ ${dur}mins</div>`;
  html += `<div class="popup-link"><a href="${firstGMUrl}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Starting point</a></div>
<div class="popup-link"><a href="${lastGMUrl}" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ending point</a></div>`;
  return html;
}

function fitMapToTrip() {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const pts = [];
  for (const el of trip.elements.filter(e => !e._hidden)) {
    const geo = getElementGeo(el);
    if (geo) pts.push([geo.lat, geo.lng]);
    if (el.timelinePath) {
      el.timelinePath.forEach(p => {
        const g = parseGeo(p.point);
        if (g) pts.push([g.lat, g.lng]);
      });
    }
  }
  if (pts.length) App.map.fitBounds(pts, { padding: [40, 40], maxZoom: 14 });
}


// ============================================================
// EXPORT
// ============================================================
function downloadTripJSON(tripId) {
  const trip = App.trips.find(t => t.id === tripId);
  if (!trip) return;
  const data = JSON.stringify(trip, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tripel-${trip.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('Trip JSON downloaded', 'success');
}

function downloadCurrentTrip() {
  if (App.currentTripId) downloadTripJSON(App.currentTripId);
}


