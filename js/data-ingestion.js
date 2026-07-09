// ============================================================
// REGION BBOX LOADING
// ============================================================
async function loadRegionBboxes() {
  try {
    const resp = await fetch('./regions_provinces_bbox.csv');
    if (!resp.ok) {
      console.warning("Failed to load regions!");
      return;
    }
    const text = await resp.text();
    const lines = text.trim().split('\n').slice(1);
    App.regionBboxes = lines.map(line => {
      const cols = line.match(/^([^,]+),([^,]*),"(.*)"$/) || line.match(/^([^,]+),([^,]*),(.*)$/);
      //const cols = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
      if (!cols || cols.length < 4) {
        console.log("Error while reading region: ", cols);
        return null;
      }
      const country = cols[1].replace(/"/g, '').trim();
      const region = cols[2].replace(/"/g, '').trim();
      const bboxStr = cols[3] ? cols[3].replace(/"/g, '').trim() : '';
      const bbox = bboxStr.split(',').map(Number);
      if (bbox.length < 4) {
        console.log("Error while reading bounding box: ", cols);
        return null;
      }
      const area = bboxArea(bbox[0], bbox[1], bbox[2], bbox[3])
      return { country, region, bbox: [bbox[0], bbox[1], bbox[2], bbox[3]], area: bboxArea };
    }).filter(Boolean).sort((a, b) => a.area - b.area);
    console.log("Loaded ", App.regionBboxes.length, " geographic regions");
  } catch (e) { }
}

function findRegionByPoint(lat, lng) {
  for (const r of App.regionBboxes) {
    const [minLat, minLng, maxLat, maxLng] = r.bbox;
    if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
      return `${r.region}, ${r.country}`;
    }
  }
  // console.log("Unable to find region for [", lat, ",", lng, "]");
  return null;
}


// ============================================================
// DATA INGESTION
// ============================================================
async function parseTimelineFile(jsonData, onProgress) {
  if (!Array.isArray(jsonData)) {
    toast('Invalid format: expected a JSON array', 'error');
    return [];
  }
  const elements = [];
  const CHUNK_SIZE = 5000;
  let prevVisit = null;
  for (let i = 0; i < jsonData.length; i++) {
    if (i % CHUNK_SIZE === 0 && onProgress) {
      onProgress(i, jsonData.length);
      await new Promise(r => setTimeout(r, 0));
    }
    const item = jsonData[i];
    let geo = null;
    if (item.visit) {
      geo = parseGeo(item.visit.topCandidate?.placeLocation);
      item.visit.visitType = detectVisitType(item, prevVisit);
      prevVisit = item;
    } else if (item.activity) {
      geo = parseGeo(item.activity.start)
      if (geo == null) {
        geo = parseGeo(item.activity.end)
      }
    } else if (item.timelinePath && item.timelinePath.length) {
      geo = parseGeo(item.timelinePath[0].point);
    } else if (item.timelineMemory) {
      // console.log("Ignoring timeline memory; no useful data");
      continue;
    }

    if (geo == null) {
      // console.log("Ignoring item due to missing geo: ", item);
      continue;
    }

    const lng = geo.lng;
    const startDateTime = new Date(item.startTime);
    const endDateTime = new Date(item.endTime);
    const displayStartDate = formatDate(startDateTime, lng);
    const displayStartShortDate = formatShortDate(startDateTime, lng);
    const displayStartTime = formatTime(startDateTime, lng);
    const displayEndDate = formatDate(endDateTime, lng);
    const displayEndTime = formatTime(endDateTime, lng);
    const regionApprox = findRegionByPoint(geo.lat, geo.lng);
    // console.log("RegionApprox = ", regionApprox);

    item.startTime = startDateTime;
    item.endTime = endDateTime;
    elements.push({
      ...item,
      _id: uid(),
      approxDisplayName: regionApprox,
      displayStartDate: displayStartDate,
      displayStartShortDate: displayStartShortDate,
      displayStartTime: displayStartTime,
      displayEndDate: displayEndDate,
      displayEndTime: displayEndTime,
    });
  }
  return elements;
}

async function mergeDataFiles(newElements, onProgress) {
  // Merge avoiding exact-time duplicates
  const existingIds = new Set(App.rawData.map(e => `${e.startTime}|${e.endTime}`));
  let added = 0;
  const CHUNK_SIZE = 10000;
  for (let i = 0; i < newElements.length; i++) {
    if (i % CHUNK_SIZE === 0 && onProgress) {
      onProgress(i, newElements.length);
      await new Promise(r => setTimeout(r, 0));
    }
    const el = newElements[i];
    const k = `${el.startTime}|${el.endTime}`;
    if (!existingIds.has(k)) {
      App.rawData.push(el);
      existingIds.add(k);
      added++;
    }
  }
  App.rawData.sort((a, b) => a.startTime - b.startTime);
  return added;
}

function detectVisitType(currentVisit, prevVisit) {
  if (!currentVisit.visit) return 'default';

  if (currentVisit.visit.topCandidate.placeId in App.gmapsCache) {
    const t = App.gmapsCache[currentVisit.visit.topCandidate.placeId].types.join(' ');
    if (t.includes('premise') || t.includes('street_address') || t.includes('hotel') || t.includes('motel') || t.includes('bed_and_breakfast') || t.includes('campsite')) return 'stay';
    if (t.includes('restaurant') || t.includes('cafe') || t.includes('bar ') || t.includes('food')) return 'eat';
    if (t.includes('grocery') || t.includes('supermarket') || t.includes('shopping_mall') || t.includes('store') || t.includes('pharmacy')) return 'shop';
    if (t.includes('point_of_interest') || t.includes('attraction') || t.includes('museum') || t.includes('_park') || t.includes('movie') || t.includes('club')) return 'attraction';
    if (t.includes('airport') || t.includes('taxi_stand') || t.includes('_station')) return 'transport';
  }

  const dur = (new Date(currentVisit.endTime) - new Date(currentVisit.startTime)) / 60000; //minutes
  let timeSincePrev = null, distSincePrev = null;
  if (prevVisit != null) {
    timeSincePrev = (new Date(prevVisit.endTime) - new Date(currentVisit.startTime)) / 60000;
    //const p1Geo = parseGeo(currentVisit.visit.topCandidate.placeLocation);
    //const p2Geo = parseGeo(prevVisit.visit.topCandidate.placeLocation);
    //distSincePrev = haversine(p1Geo.lat, p1Geo.lng, p2Geo.lat, p2Geo.lng) / 1000;
  }

  let visitType = "default";
  if (dur > 400) visitType = 'stay';
  else if (dur < 30) visitType = 'transport';
  else if (prevVisit != null) {
    if (timeSincePrev > 30 && timeSincePrev < 100) {
      if (dur < 30) visitType = 'photo';
      else if (dur < 100) visitType = 'eat'
      else visitType = 'attraction'
    } else if (timeSincePrev < 200) {
      if (dur < 30) visitType = 'photo';
      else visitType = 'attraction'
    } else {
      visitType = 'stay'
    }
  }
  // console.log("Detected visit type=", visitType);
  return visitType;
}

// ============================================================
// GOOGLE MAPS API LOADER
// ============================================================
let gmapsLoaded = false;
function loadGoogleMapsAPI(gmapAPIKey) {
  return new Promise((resolve, reject) => {
    if (gmapsLoaded) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${gmapAPIKey}&libraries=places`;
    script.onload = () => { gmapsLoaded = true; resolve(); };
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    document.head.appendChild(script);
  });
}

async function fetchGooglePlaceDetails(placeId, nearestPlaceIds) {
  if (!placeId || !window.google) return null;

  try {
    if (!(placeId in App.gmapsCache)) {
      // 1. Dynamically import the Places library (Google's modern best practice)
      const { Place } = await google.maps.importLibrary("places");

      // 2. Instantiate a new Place object with the target ID
      const place = new Place({ id: placeId });

      // 3. Fetch data using native async/await
      await place.fetchFields({
        // NOTE: Field names have changed from snake_case to camelCase
        fields: ['displayName', 'types', 'formattedAddress']
      });

      App.gmapsCache[placeId] = {
        name: place.displayName,
        types: place.types,
        formatted_address: place.formattedAddress
      };

      if (nearestPlaceIds != null && nearestPlaceIds.length > 0) {
        for (const pid in nearestPlaceIds) {
          App.gmapsCache[pid] = {
            name: place.displayName,
            types: place.types,
            formatted_address: place.formattedAddress
          };
        }
      }
    }

    return App.gmapsCache[placeId];
  } catch (error) {
    console.error("Failed to fetch place details:", error);
    return null;
  }
}

async function handleFiles(fileList) {
  if (!fileList || !fileList.length) return;
  const area = document.getElementById('upload-area');
  const progContainer = document.getElementById('upload-progress-container') || (() => {
    const div = document.createElement('div');
    div.id = 'upload-progress-container';
    div.style.marginTop = '12px';
    if (area) area.after(div);
    return div;
  })();
  if (area) area.style.pointerEvents = 'none';

  let totalAdded = 0;
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    if (!file.name.endsWith('.json')) {
      toast(`${file.name} is not a JSON file`, 'warning');
      continue;
    }
    progContainer.innerHTML = `Reading file ${i + 1}/${fileList.length} (${file.name})...<div class="progress-bar-wrap"><div class="progress-bar" style="width:0%"></div></div>`;
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
        if (data.semanticSegments) {
          data = data.semanticSegments;
        }
      } catch (e) {
        toast(`${file.name}: invalid JSON`, 'error'); continue;
      }
      progContainer.innerHTML = `Parsing ${data.length.toLocaleString()} items in ${file.name}...<div class="progress-bar-wrap"><div class="progress-bar" style="width:0%"></div></div>`;
      const elements = await parseTimelineFile(data, (curr, total) => {
        progContainer.innerHTML = `Parsing ${file.name}... (${curr}/${total})<div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((curr / total) * 100)}%"></div></div>`;
      });
      progContainer.innerHTML = `Merging ${elements.length.toLocaleString()} items from ${file.name}...<div class="progress-bar-wrap"><div class="progress-bar" style="width:0%"></div></div>`;
      const added = await mergeDataFiles(elements, (curr, total) => {
        progContainer.innerHTML = `Merging ${file.name}... (${curr}/${total})<div class="progress-bar-wrap"><div class="progress-bar" style="width:${Math.round((curr / total) * 100)}%"></div></div>`;
      });
      totalAdded += added;
      if (!App.uploadedFiles.includes(file.name)) App.uploadedFiles.push(file.name);
    } catch (e) {
      console.log(e);
      toast(`Error reading ${file.name}: ${e.message}`, 'error');
    }
  }
  progContainer.innerHTML = '';
  if (area) area.style.pointerEvents = 'auto';
  toast(`Added ${totalAdded.toLocaleString()} new data points`, 'success');
  renderWzStep1();
}
