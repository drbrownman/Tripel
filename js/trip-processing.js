// ============================================================
// PLACE CLUSTERING (for Step 3)
// ============================================================
function extractAllPlaces() {
  const placesMap = {}; // placeId -> {lat,lng,count}
  const rawPoints = [];

  for (const el of App.rawData) {
    if (el.visit) {
      const prob = parseFloat(el.visit.probability || '0');
      if (prob < App.settings.minVisitProb) continue;
      const geo = parseGeo(el.visit.topCandidate?.placeLocation);
      if (!geo) continue;
      const placeId = el.visit.topCandidate?.placeId || el.visit.topCandidate?.placeID;
      const semType = el.visit.topCandidate?.semanticType || 'Unknown';
      rawPoints.push({ lat: geo.lat, lng: geo.lng, placeId, semType, type: 'visit', el });
    }
    if (el.activity) {
      const prob = parseFloat(el.activity.probability || '0');
      if (prob < App.settings.minActivityProb) continue;
      const geo = parseGeo(el.activity.end);
      if (!geo) continue;
      rawPoints.push({ lat: geo.lat, lng: geo.lng, placeId: null, semType: 'Unknown', type: 'activity', el });
    }
  }

  // Greedy clustering
  const clusters = [];
  for (const pt of rawPoints) {
    let nearest = null, nearestDist = Infinity;
    for (const cl of clusters) {
      const d = haversine(pt.lat, pt.lng, cl.center.lat, cl.center.lng);
      if (d < nearestDist) { nearest = cl; nearestDist = d; }
    }
    const radius = App.settings.placeClusterRadius;
    if (nearest && nearestDist <= radius) {
      const n = nearest.count;
      nearest.center.lat = (nearest.center.lat * n + pt.lat) / (n + 1);
      nearest.center.lng = (nearest.center.lng * n + pt.lng) / (n + 1);
      nearest.count++;
      nearest.elements.push(pt);
      if (pt.placeId) {
        if (!nearest.placeId) {
          nearest.placeId = pt.placeId;
        } else if (nearest.placeId !== pt.placeId && !nearest.nearestPlaceIds.includes(pt.placeId)) {
          nearest.nearestPlaceIds.push(pt.placeId);
        }
      }
      if (pt.semType && pt.semType !== 'Unknown') nearest.semType = pt.semType;
    } else {
      clusters.push({
        id: uid(),
        center: { lat: pt.lat, lng: pt.lng },
        count: 1,
        placeId: pt.placeId || null,
        nearestPlaceIds: [],
        semType: pt.semType || 'Unknown',
        elements: [pt],
        tag: 'none',
        name: null,
        address: null,
      });
    }
  }

  // Filter: visited more than 50 times, atmost 100, sort by frequency
  return clusters.filter(c => c.count >= 50).slice(0, 100).sort((a, b) => b.count - a.count);
}

function autoTagBySemType(semType) {
  if (!semType) return 'none';
  const s = semType.toLowerCase();
  if (s.includes('home')) return 'home';
  if (s.includes('work') || s.includes('office')) return 'work';
  if (s.includes('gym') || s.includes('grocery') || s.includes('shopping') || s.includes('gas')) return 'chores';
  return 'none';
}


// ============================================================
// TRIP SEGMENTATION
// ============================================================
function segmentTrips(onProgress) {
  return new Promise(async (resolve, reject) => {
    try {
      const homeBaseTags = new Set(['home', 'work', 'chores']);

      const homeLocations = App.frequentPlaces.filter(p => homeBaseTags.has(p.tag));
      if (homeLocations.length === 0) {
        toast('No Home locations tagged. Please tag at least one Home place.', 'warning');
        return resolve([]);
      }

      function isAtHome(lat, lng) {
        for (const h of homeLocations) {
          if (haversine(lat, lng, h.center.lat, h.center.lng) <= App.settings.homeRadius) return true;
        }
        return false;
      }

      const excludedTags = new Set(['ignore']);
      function isExcluded(lat, lng) {
        for (const p of App.frequentPlaces) {
          if (excludedTags.has(p.tag)) {
            if (haversine(lat, lng, p.center.lat, p.center.lng) <= App.settings.placeClusterRadius) return true;
          }
        }
        return false;
      }

      function getElementGeo(el) {
        if (el.visit) return parseGeo(el.visit.topCandidate?.placeLocation);
        if (el.activity) return parseGeo(el.activity.end) || parseGeo(el.activity.start);
        if (el.timelinePath && el.timelinePath.length) return parseGeo(el.timelinePath[el.timelinePath.length - 1].point);
        return null;
      }

      function getElementProb(el) {
        if (el.visit) return parseFloat(el.visit.probability || '1');
        if (el.activity) return parseFloat(el.activity.probability || '1');
        return 1;
      }

      const { minTripDuration, maxTripDuration, minTripRange, minGapBetweenTrips } = App.settings;

      for (let i = 0; i < App.rawData.length; i++) {
        if (App.rawData[i].visit) {
          if (App.rawData[i].visit.topCandidate.placeID in App.gmapsCache) {
            App.rawData[i].approxDisplayName = App.gmapsCache[App.rawData[i].visit.topCandidate.placeID].name;
          } else {
            const geo = parseGeo(App.rawData[i].visit.topCandidate?.placeLocation);
            for (const h of homeLocations) {
              if (haversine(geo.lat, geo.lng, h.center.lat, h.center.lng) <= App.settings.homeRadius) {
                App.rawData[i].approxDisplayName = h.tag.charAt(0).toUpperCase() + h.tag.slice(1);
              }
            }
          }
        }
      }

      // Build "away periods" from Visit elements only (they define location state)
      const visits = App.rawData.filter(el => el.visit).sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

      let awayPeriods = []; // {start, end}
      let awayStart = null, lastHomeTime = null;

      for (const v of visits) {
        const prob = parseFloat(v.visit.probability || '0');
        if (prob < App.settings.minVisitProb) continue;
        const geo = parseGeo(v.visit.topCandidate?.placeLocation);
        if (!geo) continue;
        if (isAtHome(geo.lat, geo.lng)) {
          if (awayStart !== null) {
            awayPeriods.push({ start: awayStart, end: v.startTime });
            awayStart = null;
          }
          lastHomeTime = v.endTime;
        } else {
          if (awayStart === null && lastHomeTime !== null) {
            awayStart = lastHomeTime;
          }
        }
      }
      if (awayStart !== null) {
        const lastEl = App.rawData[App.rawData.length - 1];
        awayPeriods.push({ start: awayStart, end: lastEl.endTime });
      }
      console.log(awayPeriods.length, " away periods identified");

      // Merge away periods with small gaps
      const minGapMs = minGapBetweenTrips * 3600000;
      const merged = [];
      for (const p of awayPeriods.sort((a, b) => a.start - b.start)) {
        if (merged.length && (p.start - merged[merged.length - 1].end) < minGapMs) {
          merged[merged.length - 1].end = new Date(Math.max(merged[merged.length - 1].end, p.end));
        } else {
          merged.push({ start: new Date(p.start), end: new Date(p.end) });
        }
      }
      console.log(merged.length, " merged away periods identified");

      // Build trips from merged periods
      const trips = [];
      let idx = 0;
      for (const period of merged) {
        idx++;
        if (onProgress && idx % 10 === 0) {
          onProgress(trips.length, idx, merged.length);
          await new Promise(r => setTimeout(r, 0));
        }
        // Collect all elements in this period
        const elements = App.rawData.filter(el =>
          new Date(el.startTime) >= period.start && new Date(el.endTime) <= new Date(period.end + 3600000)
        );
        if (!elements.length) continue;

        const durationHours = (period.end - period.start) / 3600000;
        if (durationHours < minTripDuration || durationHours > maxTripDuration) {
          //console.log("Skipping trip because duration:", durationHours, "(hrs) out of range");
          continue;
        }

        let maxRange = 0;
        // Calculate range (diagonal of the bounding box)
        // const homeBase = homeLocations[0].center;
        // for (const el of elements) {
        //   const geo = getElementGeo(el);
        //   if (!geo) continue;
        //   const d = haversine(homeBase.lat, homeBase.lng, geo.lat, geo.lng) / 1000;
        //   if (d > maxRange) maxRange = d;
        // }
        //if (maxRange < minTripRange) continue;

        minLat = Math.min(...elements.map(el => getElementGeo(el)?.lat))
        maxLat = Math.max(...elements.map(el => getElementGeo(el)?.lat))
        minLng = Math.min(...elements.map(el => getElementGeo(el)?.lng))
        maxLng = Math.max(...elements.map(el => getElementGeo(el)?.lng))
        const diagDist = haversine(minLat, minLng, maxLat, maxLng) / 1000;
        if (diagDist < minTripRange) {
          //console.log("Skipping trip because diagDist=", diagDist, " < ", minTripRange, " BBox=[", minLat, ",", minLng, " -> ", maxLat, ",", maxLng, "]")
          continue;
          //} else {
          //console.log("Trip passed minRange filter diagDist=", diagDist, " >= ", minTripRange, " BBox=[", minLat, ",", minLng, " -> ", maxLat, ",", maxLng, "]");
        }
        maxRange = diagDist;

        // Check that trip includes non-excluded visits
        const hasRealVisit = elements.some(el => {
          if (!el.visit) return false;
          const geo = parseGeo(el.visit.topCandidate?.placeLocation);
          if (!geo) return false;
          return !isAtHome(geo.lat, geo.lng) && !isExcluded(geo.lat, geo.lng);
        });
        if (!hasRealVisit) {
          console.log("Skipping trip because of no real stops")
          continue;
        }

        // console.log("Adding trip starting at ", period.start, " -> ", period.end, " with ", elements.length, "elements ...");
        trips.push({
          id: uid(),
          _hidden: false,
          _tag: '',
          startTime: period.start,
          endTime: period.end,
          displayStartDate: formatDate(period.start, getElementGeo(elements[0])?.lng),
          displayStartShortDate: formatShortDate(period.start, getElementGeo(elements[0])?.lng),
          displayEndDate: formatDate(period.end, getElementGeo(elements.at(-1))?.lng),
          elements: elements.map(el => ({
            ...el,
            _hidden: false,
            _visitType: el.visit?.visitType || 'default',
            _activityMode: detectActivityMode(el),
          })),
          name: '',
          stats: {},
          destination: null,
          _maxRange: maxRange,
        });
      }

      return resolve(trips);
    } catch (e) {
      reject(e);
    }
  });
}

function detectActivityMode(el) {
  if (!el.activity) return 'default';
  const type = el.activity.topCandidate?.type || '';
  const t = type.toLowerCase();
  if (t.includes('walk') || t.includes('foot')) return 'walk';
  if (t.includes('vehicle') || t.includes('car')) return 'drive';
  if (t.includes('train') || t.includes('subway') || t.includes('rail')) return 'train';
  if (t.includes('boat') || t.includes('ferry') || t.includes('cruise')) return 'boat';
  //
  const dist = parseFloat(el.activity.distanceMeters || 0) / 1000;
  const timeDiff = (el.endTime - el.startTime) / 3600000; //hours
  const speed = dist / timeDiff;
  //
  if ((t.includes('fly') || t.includes('flight')) && dist > 300) return 'flight';
  //
  if (dist < 10 && speed < 20) {
    return 'walk';
  } else if (dist > 300 && speed > 300) {
    // console.log("Flight detected. dist=", dist, " speed=", speed, " startTime=", el.startTime);
    return 'flight';
  }
  //
  return 'drive';
}

async function calcTripStats(trip) {
  let totalDist = 0;
  const transportModes = {};
  const visitPoints = [];
  let longestStop = 0;

  for (const el of trip.elements) {
    if (el.activity) {
      //totalDist += parseFloat(el.activity.distanceMeters || 0) / 1000;
      const mode = el._activityMode || 'drive';
      transportModes[mode] = (transportModes[mode] || 0) + 1;
    }
    if (el.visit) {
      const dur = el.endTime - el.startTime;
      if (dur > longestStop) longestStop = dur;
      const geo = parseGeo(el.visit.topCandidate?.placeLocation);
      if (geo) visitPoints.push(geo);
    }
    if (el.timelinePath) {
      for (let i = 1; i < el.timelinePath.length; i++) {
        const p1 = parseGeo(el.timelinePath[i - 1].point);
        const p2 = parseGeo(el.timelinePath[i].point);
        if (p1 && p2) totalDist += haversine(p1.lat, p1.lng, p2.lat, p2.lng) / 1000;
      }
    }
  }

  const days = Math.ceil((trip.endTime - trip.startTime) / 86400000);
  const hours = (trip.endTime - trip.startTime) / 3600000;

  trip.stats = {
    distKm: Math.round(totalDist),
    days,
    stops: visitPoints.length,
    maxRangeKm: Math.round(trip._maxRange || 0),
    transportModes,
    longestStop,
    avgSpeedKmh: hours > 0 ? Math.round(totalDist / hours) : 0,
  };

  // Compute destination
  if (visitPoints.length) {
    //const homeLocations = App.frequentPlaces.filter(p => p.tag === 'home');
    //const homeBase = homeLocations.length ? homeLocations[0].center : visitPoints[0];
    const tripStart = visitPoints[0];

    // Get "destination" stops: far from home, stayed longer than minStopDuration
    const minStopMs = App.settings.minStopDuration * 60000;
    const destStops = trip.elements
      .filter(el => {
        if (!el.visit) return false;
        const dur = el.endTime - el.startTime;
        if (dur < minStopMs) return false;
        const geo = parseGeo(el.visit.topCandidate?.placeLocation);
        if (!geo) return false;
        return haversine(tripStart.lat, tripStart.lng, geo.lat, geo.lng) > 10000; // > 10km from home
      })
      .map(el => {
        const geo = parseGeo(el.visit.topCandidate?.placeLocation);
        return { lat: geo.lat, lng: geo.lng, region: findRegionByPoint(geo.lat, geo.lng), dur: el.endTime - el.startTime };
      });

    //Algorithm 1: Progressively refine the central destination of the trip and lookup the region of that destination
    // let destCenter;
    // if (destStops.length) {
    //   let candidates = destStops;
    //   // Reduce bounding box outliers
    //   while (candidates.length > 1) {
    //     const lats = candidates.map(p => p.lat), lngs = candidates.map(p => p.lng);
    //     const midIndex = Math.floor(lats.length / 2);
    //     const medianLat = lats[midIndex];
    //     const medianLng = lngs[midIndex];
    //     const area = bboxArea(Math.min(...lats), Math.min(...lngs), Math.max(...lats), Math.max(...lngs));
    //     if (area < 10000) break;
    //     //const c = centroid(candidates);
    //     //candidates.sort((a,b) => haversine(b.lat,b.lng,c.lat,c.lng) - haversine(a.lat,a.lng,c.lat,c.lng));
    //     candidates.sort((a, b) => haversine(b.lat, b.lng, medianLat, medianLng) - haversine(a.lat, a.lng, medianLat, medianLng));
    //     candidates = candidates.slice(0, -1);
    //   }
    //   destCenter = centroid(candidates);
    // } else {
    //   destCenter = centroid(visitPoints);
    // }
    // trip.destination = destCenter;
    // // Lookup region name
    // let destName = findRegionByPoint(destCenter.lat, destCenter.lng);
    // trip._destName = destName;

    //Algorithm 2: Frequency rank the regions visited during the trip and select most frequent region(s)
    mostFrequentRegions = destStops.map(d => d.region).reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
    mostFrequentRegionsSorted = Object.keys(mostFrequentRegions).sort((a, b) => mostFrequentRegions[b] - mostFrequentRegions[a]);
    //Frequency sort retain frequency counts
    regionsVisitedWithCounts = mostFrequentRegionsSorted.map(region => {
      return { region: region.split(",")[0].trim(), count: mostFrequentRegions[region] };
    });
    if (regionsVisitedWithCounts.length > 1) {
      if (regionsVisitedWithCounts[0].count <= (0.33 * destStops.length)) {
        regionsVisitedWithCounts = regionsVisitedWithCounts.slice(0, 3);
      } else {
        regionsVisitedWithCounts = [regionsVisitedWithCounts[0]];
      }
    }
    trip._destName = regionsVisitedWithCounts.map(region => region.region).join(", ");
  }
}

async function nameTrip(trip) {
  await calcTripStats(trip);
  const s = trip.stats;
  const dest = trip._destName || 'Unknown';
  //const multiRegion = trip._destName.split(",").length > 1;
  const start = trip.startTime;
  const month = start.toLocaleString('en-US', { month: 'long' });
  const year = start.getFullYear();
  const days = s.days;
  const dist = s.distKm;
  const isDayTrip = days <= 1;
  const isWeekend = days > 1 && days <= 3;
  const isFlight = (s.transportModes.flight || 0) > 0;

  // 5 naming templates
  const templates = [
    () => `${dest} – ${month} ${year}`,
    () => `${dist}km in ${dest}, ${year}`,
    () => `${days}-day trip to ${dest}`,
    () => isDayTrip ? `Day trip in ${dest} – ${trip.displayStartShortDate}` : `${month} trip to ${dest}`,
    () => isWeekend ? `Weekend in ${dest} – ${trip.displayStartShortDate}` : `${month} trip to ${dest}`,
    () => isFlight ? `Flight to ${dest} – ${year}` : `Road trip to ${dest} – ${year}`,
  ];

  // Pick best template
  let templateIdx = 0;
  if (days <= 3) templateIdx = 3;
  else if (dist > 500) templateIdx = 1;
  else if (days > 14) templateIdx = 2;
  else if (isFlight) templateIdx = 4;
  else templateIdx = 0;

  return templates[templateIdx]();
}


