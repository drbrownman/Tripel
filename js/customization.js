function renderSpOverviewCustomization(trip, container) {
  if (!trip.style) {
    trip.style = {
      themeId: 'carto-dark',
      overrides: {
        allLinesColor: '',
        allLinesWeight: '',
        allFlightsColor: '',
        allFlightsWeight: '',
        allActivitiesColor: '',
        allStaysColor: '',
        allMarkersColor: '',
        homeMarkerColor: '',
        hideDate: false,
        hideTime: false,
        hideDuration: false,
        hideDistance: false
      }
    };
  }

  const themesHtml = PRESET_THEMES.map(t => `<option value="${t.id}" ${trip.style.themeId === t.id ? 'selected' : ''}>${t.name}</option>`).join('');

  container.innerHTML = `
    <div class="info-card">
      <div class="info-card-title">Visual Customization</div>
      <div class="setting-group" style="padding:0; border:none; margin-bottom:12px;">
        <label>Theme</label>
        <select class="db-input" onchange="updateTripTheme('${trip.id}', this.value)">
          ${themesHtml}
        </select>
      </div>

      <div class="expandable" style="margin-bottom:8px;">
        <button class="expand-toggle" onclick="toggleExpand(this)">
          <span><i class="fa-solid fa-palette"></i> Advanced Styles</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="expand-content" style="padding-top:8px;">
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">Basemap Override</span>
             <select class="db-input" onchange="updateTripStyle('${trip.id}', 'basemapId', this.value)">
               <option value="">Default (From Theme)</option>
               ${PRESET_THEMES.map(t => `<option value="${t.id}" ${trip.style.overrides.basemapId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
             </select>
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">Home Icon</span>
             <select class="db-input" onchange="updateTripStyle('${trip.id}', 'homeIcon', this.value)">
               <option value="">Default</option>
               <option value="fa-house" ${trip.style.overrides.homeIcon === 'fa-house' ? 'selected' : ''}>House</option>
               <option value="fa-building" ${trip.style.overrides.homeIcon === 'fa-building' ? 'selected' : ''}>Building</option>
               <option value="fa-star" ${trip.style.overrides.homeIcon === 'fa-star' ? 'selected' : ''}>Star</option>
               <option value="fa-map-pin" ${trip.style.overrides.homeIcon === 'fa-map-pin' ? 'selected' : ''}>Map Pin</option>
               <option value="fa-location-dot" ${trip.style.overrides.homeIcon === 'fa-location-dot' ? 'selected' : ''}>Dot</option>
             </select>
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">Stays Icon</span>
             <select class="db-input" onchange="updateTripStyle('${trip.id}', 'staysIcon', this.value)">
               <option value="">Default</option>
               <option value="fa-bed" ${trip.style.overrides.staysIcon === 'fa-bed' ? 'selected' : ''}>Bed</option>
               <option value="fa-building" ${trip.style.overrides.staysIcon === 'fa-building' ? 'selected' : ''}>Building</option>
               <option value="fa-house" ${trip.style.overrides.staysIcon === 'fa-house' ? 'selected' : ''}>House</option>
               <option value="fa-campground" ${trip.style.overrides.staysIcon === 'fa-campground' ? 'selected' : ''}>Tent</option>
             </select>
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">All Lines</span>
             <input type="color" value="${trip.style.overrides.allLinesColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'allLinesColor', this.value)">
             <input type="number" min="1" max="10" style="width:50px;" class="db-input" value="${trip.style.overrides.allLinesWeight || 3}" onchange="updateTripStyle('${trip.id}', 'allLinesWeight', this.value)">
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">All Flights</span>
             <input type="color" value="${trip.style.overrides.allFlightsColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'allFlightsColor', this.value)">
             <input type="number" min="1" max="10" style="width:50px;" class="db-input" value="${trip.style.overrides.allFlightsWeight || 2}" onchange="updateTripStyle('${trip.id}', 'allFlightsWeight', this.value)">
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">All Activities Marker</span>
             <input type="color" value="${trip.style.overrides.allActivitiesColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'allActivitiesColor', this.value)">
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">All Stays Marker</span>
             <input type="color" value="${trip.style.overrides.allStaysColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'allStaysColor', this.value)">
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">All Other Markers</span>
             <input type="color" value="${trip.style.overrides.allMarkersColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'allMarkersColor', this.value)">
          </div>
          <div class="stat-row" style="margin-bottom:8px;">
             <span class="stat-label">Home Marker</span>
             <input type="color" value="${trip.style.overrides.homeMarkerColor || '#ffffff'}" onchange="updateTripStyle('${trip.id}', 'homeMarkerColor', this.value)">
          </div>
        </div>
      </div>
      
      <div class="expandable">
        <button class="expand-toggle" onclick="toggleExpand(this)">
          <span><i class="fa-solid fa-comment-slash"></i> Popup Elements</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
        <div class="expand-content" style="padding-top:8px;">
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><input type="checkbox" onchange="updateTripPopup('${trip.id}', 'hideDate', this.checked)" ${trip.style.overrides.hideDate ? 'checked' : ''}> Hide Date</label>
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><input type="checkbox" onchange="updateTripPopup('${trip.id}', 'hideTime', this.checked)" ${trip.style.overrides.hideTime ? 'checked' : ''}> Hide Time</label>
          <label style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><input type="checkbox" onchange="updateTripPopup('${trip.id}', 'hideDuration', this.checked)" ${trip.style.overrides.hideDuration ? 'checked' : ''}> Hide Duration</label>
          <label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" onchange="updateTripPopup('${trip.id}', 'hideDistance', this.checked)" ${trip.style.overrides.hideDistance ? 'checked' : ''}> Hide Distance</label>
        </div>
      </div>
    </div>
  `;
}

window.updateTripTheme = function(tripId, themeId) {
  const trip = App.trips.find(t => t.id === tripId);
  if (!trip) return;
  trip.style.themeId = themeId;
  
  const theme = getTheme(themeId);
  if (App.mapLayers.basemap) {
    App.map.removeLayer(App.mapLayers.basemap);
  }
  App.mapLayers.basemap = L.tileLayer(theme.basemapUrl, {
    attribution: theme.basemapAttr,
    maxZoom: 19,
    crossOrigin: true
  }).addTo(App.map);
  
  renderTripOnMap(trip, true);
};

window.updateTripStyle = function(tripId, key, val) {
  const trip = App.trips.find(t => t.id === tripId);
  if (!trip) return;
  trip.style.overrides[key] = val;

  if (key === 'basemapId') {
    const themeId = val || trip.style.themeId || 'carto-dark';
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

  renderTripOnMap(trip, true);
};

window.updateTripPopup = function(tripId, key, val) {
  const trip = App.trips.find(t => t.id === tripId);
  if (!trip) return;
  trip.style.overrides[key] = val;
  renderTripOnMap(trip, true); // Re-render to update popups
};

window.toggleSegStyle = function(id, evt) {
  evt.stopPropagation();
  const el = document.getElementById(`style-${id}`);
  if (el) el.style.display = (el.style.display === 'none') ? 'flex' : 'none';
};

window.setSegStyle = function(id, key, val) {
  const trip = App.trips.find(t => t.id === App.currentTripId);
  if (!trip) return;
  const el = trip.elements.find(e => e._id === id);
  if (!el) return;
  el['_' + key] = val;
  renderTripOnMap(trip, true);
};
