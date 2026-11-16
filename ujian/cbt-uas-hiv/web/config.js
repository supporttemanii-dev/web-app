/* =====================================================================
 *  KONFIGURASI FRONTEND — satu-satunya file yang WAJIB Anda ubah.
 *  Tempel URL Web App Google Apps Script (berakhiran /exec) di bawah.
 * ===================================================================== */
window.CBT_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzOKU36h_9bVioRQ8zQgf4g19NyMJzZt0Te0gU1DR7GPdFjlU6nMAjTQ4hwXDwX39vE/exec',   // contoh: https://script.google.com/macros/s/AKfy.../exec
  NAMA_INSTITUSI: 'Program Studi Kesehatan Masyarakat',
  HEARTBEAT_MS: 15000,      // interval kirim status & autosave ke server (ms)
  PERSIST_EVERY: 4,         // tiap N heartbeat, jawaban disimpan permanen ke Spreadsheet (~1 menit)
  RANKING_REFRESH_MS: 30000,
  DASHBOARD_REFRESH_MS: 10000
};
