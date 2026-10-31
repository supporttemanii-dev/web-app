/* RCA TB-HIV 2026 · ANALISIS TAMBAHAN (placeholder)
 * -------------------------------------------------------------------------------
 * Tambahkan analisis baru di sini tanpa mengubah berkas lain. Setiap item:
 *   { id, title, description, todo, render(V, D, RCA) }
 *   - V : data Valid per formulir, contoh V.C3.C3A = [{unit, fac, kk, prov, status, data:{...}}]
 *   - D : data mentah analysis.data (termasuk D.C2 ringkasan sampel)
 *   - RCA.anl.tbl(head, rows), RCA.anl.hbars([[label, nilai]]), RCA.anl.nN(n, N), RCA.anl.median(arr) tersedia sebagai pembantu tampilan.
 * Item tanpa render tampil sebagai kotak placeholder dengan teks "todo".
 */
window.RCA_ANALYSES = [
  {
    id: 'contoh-tpt-per-paduan',
    title: 'Contoh: luaran TPT menurut paduan (C3 unit B)',
    description: 'Contoh analisis yang dapat disalin. Menghitung luaran TPT (B16) untuk setiap paduan (B14) pada unit B yang Valid.',
    render: function (V, D, RCA) {
      var rows = (V.C3 && V.C3.C3B) || [];
      var by = {};
      rows.forEach(function (r) { var p = r.data.B14 || 'Tidak tercatat'; var l = r.data.B16 || 'Kosong'; by[p] = by[p] || {}; by[p][l] = (by[p][l] || 0) + 1; });
      var luaran = ['Lengkap', 'Sedang terapi', 'Putus', 'Dihentikan: efek samping', 'Dihentikan: TB aktif', 'Meninggal', 'Pindah', 'Belum diketahui', 'TBL (tidak mulai)', 'Kosong'];
      if (!rows.length) return RCA.h('p', { class: 'muted' }, 'Belum ada unit B yang Valid.');
      return RCA.anl.tbl(['Paduan'].concat(luaran), Object.keys(by).map(function (p) { return [p].concat(luaran.map(function (l) { return by[p][l] || ''; })); }), { num: true });
    }
  },
  { id: 'kaskade-kabkota', title: 'Kaskade TB-HIV per kab/kota (pasangan rendah–tinggi)', todo: 'Tentukan indikator kaskade dan sumbernya (C1 indikator dikonfirmasi, C3, C5).' },
  { id: 'integrasi-wp7', title: 'Matriks integrasi bukti untuk WP7', todo: 'Tentukan struktur matriks (CP × sumber bukti C3/C4/C5/C6/C7) dan aturan keyakinan.' },
  { id: 'perbandingan-rs-pkm', title: 'Perbandingan RS dan Puskesmas', todo: 'Tentukan indikator dan cara penyajian.' }
];
