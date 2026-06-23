// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  loadRegionBboxes();

  // Show home
  document.getElementById('welcome-card').style.display = 'block';
  document.getElementById('trips-section').style.display = 'none';

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      const saveBtn = document.getElementById('btn-save');
      if (saveBtn && saveBtn.style.display !== 'none') {
        console.log("Ctrl+S save triggered");
        saveBtn.click();
      }
    }
  });
});
