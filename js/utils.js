// ============================================================
// UTILITIES
// ============================================================
function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }

function haversine(lat1, lng1, lat2, lng2) {
  const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parseGeo(geoStr) {
  if (!geoStr) return null;
  if (typeof geoStr === 'object') {
    geoStr = geoStr.latLng;
  }
  const parts = geoStr.replace('geo:', '').replace(' ', '').split(',');
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) {
    console.log("Error reading geo: ", geoStr);
    return null;
  }
  return { lat, lng };
}

//function estimateLocalTime(dateString, lng) {
//  const tmpTime = new Date(dateString);
//  if (isNaN(tmpTime)) {
//    console.log("Error reading date: ", dateString);
//  }
//  if (/Z|[+-]00:?00$/.test(dateString)) {
//     const offsetHours = Math.round((lng || 0) / 15);
//     return new Date(tmpTime.getTime() + offsetHours * 3600000);
//   }
//   return tmpTime;
// }

// function getDisplayTime(givenDate, lng) {
//   return new Intl.DateTimeFormat("en-US", {
//     timeZone: `Etc/GMT${gmtSign}${hours}`,
//     dateStyle: 'medium',
//     timeStyle: 'short'
//   }
//   ).format(new Date(givenDate))
// }

function formatDate(d, lng) {
  if (!d) return '?';
  if (lng == null) {
    //console.log("For date=", d, " longitude not provided; ignoring timezone");
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  const offsetHours = Math.round((lng || 0) / 15);
  const gmtSign = (offsetHours >= 0) ? "-" : "+";
  const hours = Math.abs(offsetHours).toString();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: `Etc/GMT${gmtSign}${hours}` });
}

function formatShortDate(d, lng) {
  if (!d) return '?';
  if (lng == null) {
    //console.log("For date=", d, " longitude not provided; ignoring timezone");
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  const offsetHours = Math.round((lng || 0) / 15);
  const gmtSign = (offsetHours >= 0) ? "-" : "+";
  const hours = Math.abs(offsetHours).toString();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: `Etc/GMT${gmtSign}${hours}` });
}

function formatTime(d, lng) {
  if (!d) return '?';
  if (lng == null) {
    //console.log("For date=", d, " longitude not provided; ignoring timezone");
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  const offsetHours = Math.round((lng || 0) / 15);
  const gmtSign = (offsetHours >= 0) ? "-" : "+";
  const hours = Math.abs(offsetHours).toString();
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: `Etc/GMT${gmtSign}${hours}` });
}

function formatDuration(ms) {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60), remMins = mins % 60;
  if (hours < 24) return remMins ? `${hours}h ${remMins}m` : `${hours}h`;
  const days = Math.floor(hours / 24), remHours = hours % 24;
  return remHours ? `${days}d ${remHours}h` : `${days}d`;
}

function formatDist(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${Math.round(km)}km`;
}

function uid() { return Math.random().toString(36).slice(2, 10); }

function bboxArea(minLat, minLng, maxLat, maxLng) {
  const h = haversine(minLat, minLng, maxLat, minLng) / 1000;
  const w = haversine(minLat, minLng, minLat, maxLng) / 1000;
  return h * w;
}

function centroid(points) {
  if (!points.length) return null;
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
    lng: points.reduce((s, p) => s + p.lng, 0) / points.length
  };
}

function greatCirclePoints(lat1, lng1, lat2, lng2, n = 80) {
  const φ1 = toRad(lat1), λ1 = toRad(lng1), φ2 = toRad(lat2), λ2 = toRad(lng2);
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2));
  if (d < 0.001) return [[lat1, lng1], [lat2, lng2]];
  const pts = [];

  const seed = (Math.abs(lat1 + lng1 + lat2 + lng2) * 10000) % 1;
  const offsetIntensity = 0.5 + seed;

  // Calculate initial bearing from point 1 to point 2 to determine "sideways" direction
  const yBearing = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const xBearing = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  const initialBearing = Math.atan2(yBearing, xBearing);
  const perpendicularBearing = initialBearing + Math.PI / 2; // 90 degrees offset

  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);

    let lat = toDeg(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)));
    let lng = toDeg(Math.atan2(y, x));

    // Parabolic offset modifier: 0 at ends, 1 at peak midpoint
    const offsetFactor = 4 * f * (1 - f);
    const currentOffset = offsetIntensity * offsetFactor;

    // Shift lat/lng perpendicular to the flight path direction
    lat += currentOffset * Math.cos(perpendicularBearing);
    lng += currentOffset * Math.sin(perpendicularBearing);

    pts.push([lat, lng]);
  }
  return pts;
}

// ============================================================
// NOTIFICATIONS
// ============================================================
function toast(msg, type = 'info') {
  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span class="toast-msg">${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 4000);
}


// ============================================================
// UTILITIES (UI)
// ============================================================
function toggleExpand(btn) {
  const content = btn.nextElementSibling;
  const icon = btn.querySelector('i.fa-chevron-down, i.fa-chevron-up');
  const isOpen = content.classList.toggle('open');
  if (icon) { icon.classList.toggle('fa-chevron-down', !isOpen); icon.classList.toggle('fa-chevron-up', isOpen); }
}



function getTripIcon(trip) {
  const modes = Object.keys(trip.stats?.transportModes || {});
  if (modes.includes('boat')) return '<i class="fa-solid fa-ship" style="color:#4dd8e8"></i>';
  if (modes.includes('train')) return '<i class="fa-solid fa-train" style="color:var(--accent4)"></i>';
  if (modes.includes('flight')) return '<i class="fa-solid fa-plane" style="color:var(--accent4)"></i>';
  return '<i class="fa-solid fa-car" style="color:var(--accent3)"></i>';
}
