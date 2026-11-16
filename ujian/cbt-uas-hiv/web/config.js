/* =====================================================================
 *  KONFIGURASI FRONTEND — satu-satunya file yang WAJIB Anda ubah.
 *  Tempel URL Web App Google Apps Script (berakhiran /exec) di bawah.
 * ===================================================================== */
window.CBT_CONFIG = {
  API_URL: 'TEMPEL_URL_WEB_APP_DI_SINI',   // contoh: https://script.google.com/macros/s/AKfy.../exec
  NAMA_INSTITUSI: 'Program Studi Kesehatan Masyarakat',
  HEARTBEAT_MS: 15000,      // interval kirim status & autosave ke server (ms)
  PERSIST_EVERY: 4,         // tiap N heartbeat, jawaban disimpan permanen ke Spreadsheet (~1 menit)
  RANKING_REFRESH_MS: 30000,
  DASHBOARD_REFRESH_MS: 10000
};
