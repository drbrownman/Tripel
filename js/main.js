// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  loadRegionBboxes();

  // Show home
  document.getElementById('welcome-card').style.display = 'block';
  document.getElementById('trips-section').style.display = 'none';
});
