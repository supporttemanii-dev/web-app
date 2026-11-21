/* RCA TB-HIV 2026 · Dashboard Kematian (panel telaah kematian)
   Daftar kasus → berkas kasus (ringkasan, garis waktu perjalanan pasien, penilaian penelaah, faktor penyumbang,
   episode C3, dokumen, konteks) → lembar penilaian panelis (tersamar) → matriks kesepakatan dan konsensus.
   Data formulir hanya dibaca; penilaian panel disimpan terpisah di server. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const M = RCA.mort = {};
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  const esc = v => (v === undefined || v === null) ? '' : Array.isArray(v) ? v.join(', ') : String(v);

  /* ---------------- butir penilaian (selaras C6 B4/B5 dan lembar panel C6P) */
  const opt = (sub, sec, col) => { try { const s = RCA.S.forms.C6.sub.find(x => x.id === sub).sections.find(x => (x.k || x.id) === sec); return (s.cols.find(c => c.k === col) || {}).o || []; } catch (e) { return []; } };
  M.PHASE = ['T1 Akses dan diagnosis', 'T2 Awal terapi', 'T3 Pemantauan', 'T4 Rujukan', 'T5 Penanganan saat kondisi memburuk'];
  M.FIELDS = [
    { k: 'kecukupan', l: 'Kecukupan data untuk dinilai', t: 'select', o: ['Cukup', 'Terbatas', 'Tidak cukup'] },
    { k: 'sebab', l: 'Sebab kematian yang paling mungkin', t: 'textarea', hint: 'Sebab langsung dan sebab dasar; sebutkan dasar penilaian (tanggal, sumber).' },
    { k: 'hubungan', l: 'Hubungan kematian dengan TB/HIV', t: 'select', o: ['TB sebagai sebab dasar', 'TB berkontribusi', 'Terutama HIV lanjut/infeksi oportunistik lain', 'Tidak berhubungan dengan TB', 'Tidak dapat ditentukan'] },
    { k: 'dicegah', l: 'Apakah kematian dapat dicegah?', t: 'select', o: ['Ya', 'Mungkin', 'Tidak', 'Tidak dapat dinilai'] },
    { k: 'keyakinan', l: 'Keyakinan keseluruhan', t: 'select', o: ['Tinggi', 'Sedang', 'Rendah'] },
    { k: 'peluang', l: 'Peluang perbaikan utama', t: 'textarea' },
    { k: 'catatan', l: 'Hal yang perlu dibahas di forum', t: 'textarea' }
  ];
  M.FCOLS = () => [
    { k: 'kelompok', l: 'Kelompok', o: ['Pasien', 'Layanan kesehatan', 'Sistem', 'Lainnya'] },
    { k: 'fase', l: 'Fase', o: M.PHASE },
    { k: 'uraian', l: 'Masalah / faktor penyumbang', t: 'textarea' },
    { k: 'faktor', l: 'Kategori faktor', o: opt('C6B', 'B4', 'faktor') },
    { k: 'klas', l: 'Klasifikasi', o: opt('C6B', 'B4', 'klas') },
    { k: 'peluang', l: 'Peluang perbaikan', t: 'text' },
    { k: 'pihak', l: 'Pihak', o: opt('C6B', 'B4', 'pihak') }
  ];
  M.isFilled = d => d && (M.FIELDS.some(f => has(d[f.k])) || (d.faktor || []).some(r => has(r.uraian) || has(r.kelompok)));

  /* ---------------- tanggal (termasuk tanggal tidak lengkap seperti --/05/2026) */
  M.pd = function (s) {
    if (!s) return null; s = String(s).trim(); let m;
    if ((m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s))) return { d: new Date(+m[1], +m[2] - 1, +m[3]), approx: false };
    if ((m = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/.exec(s))) return { d: new Date(+m[3], +m[2] - 1, +m[1]), approx: false };
    if ((m = /^(?:-{1,2}|\?{1,2}|xx)[\/.-](\d{1,2})[\/.-](\d{4})/i.exec(s)) || (m = /^(\d{1,2})[\/.-](\d{4})$/.exec(s))) return { d: new Date(+m[2], +m[1] - 1, 15), approx: true };
    if ((m = /^(\d{4})$/.exec(s))) return { d: new Date(+m[1], 6, 1), approx: true };
    return null;
  };
  const fd = p => p ? (p.approx ? '±' + p.d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : p.d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })) : '';
  const days = (a, b) => (a && b) ? Math.round((b.d - a.d) / 864e5) : null;
  const facName = c => c ? (RCA.reg.fac(c).name ? RCA.reg.facName(c) : c) : '';

  /* ---------------- perjalanan pasien: kumpulkan kejadian dari C6A, kronologi, C3, rujukan, interupsi */
  const TAHAP = { AD: 'T1', AT: 'T2', PM: 'T3', RJ: 'T4', PB: 'T5' };
  M.events = function (D) {
    const E = [], A = (D.rec.C6A || {}).data || {}, fac0 = D.case.fac;
    const add = (tgl, label, o) => { const p = M.pd(tgl); if (!p) return; E.push(Object.assign({ p, label, fac: fac0, ph: 'T1', src: '' }, o || {})); };
    add(A.gejala_tgl, 'Gejala pertama', { ph: 'T1', src: 'C6A', kind: 'gejala' });
    add(A.kontak_tgl, 'Kontak pertama terkait TB', { ph: 'T1', fac: A.kontak_fas || fac0, src: 'C6A', kind: 'kontak' });
    add(A.dx_tb_tgl, 'Diagnosis TB' + (A.dx_tb_dasar ? ' (' + esc(A.dx_tb_dasar) + ')' : ''), { ph: 'T1', src: 'C6A', kind: 'dxtb' });
    add(A.dx_hiv_tgl, 'Diagnosis HIV' + (A.dx_hiv_waktu ? ' · ' + esc(A.dx_hiv_waktu) : ''), { ph: 'T1', src: 'C6A', kind: 'dxhiv' });
    add(A.cd4_tgl, 'CD4 ' + esc(A.cd4), { ph: 'T3', src: 'C6A' });
    add(A.oat_tgl, 'Mulai OAT' + (A.oat_paduan ? ' (' + esc(A.oat_paduan) + ')' : ''), { ph: 'T2', src: 'C6A', kind: 'oat' });
    add(A.arv_tgl, 'Mulai ARV' + (A.arv_paduan ? ' (' + esc(A.arv_paduan) + ')' : ''), { ph: 'T2', src: 'C6A', kind: 'arv' });
    add(A.ppk_tgl, 'Mulai PPK', { ph: 'T2', src: 'C6A' });
    add(A.vl_tgl, 'Viral load ' + esc(A.vl), { ph: 'T3', src: 'C6A' });
    add(A.bahaya_tgl, 'Tanda bahaya' + (A.bahaya_respons ? ': ' + esc(A.bahaya_respons) : ''), { ph: 'T5', src: 'C6A' });
    (A.kronologi || []).forEach(r => add(r.tgl, esc(r.kejadian) || 'Kejadian', { ph: TAHAP[r.tahap] || 'T3', fac: r.fas || fac0, src: 'C6A kronologi' + (r.sumber ? ' · ' + r.sumber : ''), st: r.status }));
    const C3F = { A00: ['Tercatat sebagai terduga TB', 'T1', 'kontak'], P02: ['Gejala pertama', 'T1', 'gejala'], A01: ['Diagnosis TB', 'T1', 'dxtb'], U13: ['Diagnosis HIV', 'T1', 'dxhiv'], A07: ['Tes HIV pada episode TB', 'T1', 'dxhiv'],
      R_E: ['Diagnosis TB', 'T1', 'dxtb'], R_I: ['Tes/dokumentasi HIV', 'T1', 'dxhiv'], B03: ['Skrining TB saat mulai ARV', 'T1'], B06: ['Keputusan diagnostik TB', 'T1'],
      A08: ['Mulai OAT', 'T2', 'oat'], B07: ['Mulai OAT', 'T2', 'oat'], U14: ['Pertama kali mulai ARV', 'T2', 'arv'], A11: ['Mulai/mulai kembali ARV', 'T2', 'arv'], B01: ['Mulai ARV di fasyankes', 'T2', 'arv'], B13: ['Mulai TPT', 'T2'],
      CD4_tgl: ['Pemeriksaan CD4', 'T3'], A14: ['Luaran pengobatan TB', 'T3'], B17: ['Luaran TPT', 'T3'], T04: ['Kontak pelayanan terakhir', 'T3', 'last'], T06: ['Meninggal (tercatat di C3)', 'T5', 'mati'] };
    (D.c3 || []).forEach(r => {
      const d = r.data || {}, f = r.fac || fac0, s = 'C3 ' + r.frame + ' · ' + r.unit;
      Object.keys(C3F).forEach(k => { if (has(d[k])) add(d[k], C3F[k][0] + (k === 'A14' && d.A13 ? ': ' + d.A13 : ''), { ph: C3F[k][1], fac: f, src: s, kind: C3F[k][2] }); });
      (d.rujukan || []).forEach(x => { add(x.tanggal_rujuk, 'Rujuk ' + esc(x.layanan) + ' → ' + facName(x.tujuan) + (x.status ? ' (' + x.status + ')' : ''), { ph: 'T4', fac: x.asal || f, to: x.tujuan, src: s, kind: 'rujuk', p2: M.pd(x.tanggal_hadir_di_tujuan) }); });
      (d.interupsi || []).forEach(x => { add(x.tanggal_jadwal_terlewat, 'Interupsi ' + esc(x.layanan) + (x.alasan_tercatat ? ': ' + x.alasan_tercatat : ''), { ph: 'T3', fac: f, src: s, kind: 'interupsi' });
        add(x.tanggal_kembali_berobat, 'Kembali berobat ' + esc(x.layanan), { ph: 'T3', fac: x.fasilitas_tempat_kembali || f, src: s }); });
    });
    add(A.tgl_mati || (D.calon || {}).tgl_mati || D.case.tgl_mati, 'Meninggal' + (A.mati_tempat ? ' di ' + esc(A.mati_tempat) : ''), { ph: 'T5', src: A.tgl_mati ? 'C6A' : 'C2', kind: 'mati' });
    // gabung kejadian ganda (tanggal dan label sama)
    const seen = {}, out = [];
    E.sort((a, b) => a.p.d - b.p.d || (a.kind === 'mati') - (b.kind === 'mati')).forEach(e => {
      const k = e.kind === 'mati' ? 'mati' : e.p.d.toDateString() + '|' + (e.kind && e.kind !== 'last' ? e.kind : e.label.toLowerCase().slice(0, 18));
      if (seen[k]) { const o = seen[k]; if (o.src.indexOf(e.src) < 0) o.src += '; ' + e.src; if (e.kind === 'mati' && e.src === 'C6A' && o.src.indexOf('C6A') !== 0) { o.p = e.p; o.label = e.label; } if (e.kind === 'mati' && +e.p.d !== +o.p.d) o.beda = true; return; }
      seen[k] = e; out.push(e); });
    out.sort((a, b) => a.p.d - b.p.d || (a.kind === 'mati') - (b.kind === 'mati'));
    const mati = out.find(e => e.kind === 'mati');
    out.forEach((e, i) => { e.n = i + 1; if (mati && e !== mati && e.p.d - mati.p.d > 864e5) e.after = true; });
    return out;
  };
  M.intervals = function (E) {
    const first = k => (E.find(e => e.kind === k) || {}).p, last = k => { const L = E.filter(e => e.kind === k); return L.length ? L[L.length - 1].p : null; };
    const mati = first('mati'), lastC = E.filter(e => e.kind !== 'mati' && (!mati || e.p.d <= mati.d)).slice(-1)[0];
    return [
      ['Gejala → diagnosis TB', days(first('gejala') || first('kontak'), first('dxtb'))],
      ['Diagnosis TB → mulai OAT', days(first('dxtb'), first('oat'))],
      ['Diagnosis HIV → mulai ARV', days(first('dxhiv'), first('arv'))],
      ['Kontak tercatat terakhir → meninggal', days(lastC && lastC.p, mati)]
    ];
  };

  /* ---------------- garis waktu (SVG; lajur per fasyankes) */
  const PHC = { T1: '#1a8fa3', T2: '#2e8b57', T3: '#6d5aa8', T4: '#d08a1f', T5: '#c0503d' };
  M.timeline = function (E, opts) {
    opts = opts || {};
    if (!E.length) return h('p', { class: 'muted' }, 'Belum ada tanggal yang tercatat untuk disusun menjadi garis waktu.');
    const lanes = []; E.forEach(e => { [e.fac, e.to].forEach(f => { const k = f || '–'; if (f !== undefined && !lanes.includes(k)) lanes.push(k); }); });
    const W = 1000, L = 170, R = 24, T = 34, LH = 54, H = T + lanes.length * LH + 30;
    const t0 = Math.min(...E.map(e => +e.p.d)), t1 = Math.max(...E.map(e => +(e.p2 ? e.p2.d : e.p.d))), span = Math.max(1, t1 - t0);
    const X = d => L + (W - L - R) * ((+d - t0) / span), Y = f => T + lanes.indexOf(f || '–') * LH + LH / 2;
    const NS = 'http://www.w3.org/2000/svg', el = (n, a, txt) => { const x = document.createElementNS(NS, n); Object.keys(a || {}).forEach(k => x.setAttribute(k, a[k])); if (txt !== undefined) x.textContent = txt; return x; };
    const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'mt-svg', role: 'img', 'aria-label': 'Garis waktu perjalanan pasien: ' + E.length + ' kejadian di ' + lanes.length + ' fasilitas' });
    lanes.forEach((f, i) => { const y = T + i * LH; svg.appendChild(el('rect', { x: 0, y, width: W, height: LH, class: i % 2 ? 'mt-lane alt' : 'mt-lane' }));
      const lab = el('text', { x: 8, y: y + LH / 2 + 4, class: 'mt-lab' }, (f === '–' ? 'Fasilitas tidak tercatat' : facName(f)).slice(0, 26)); svg.appendChild(lab); });
    // sumbu waktu (bulan)
    const d0 = new Date(t0), months = []; for (let d = new Date(d0.getFullYear(), d0.getMonth(), 1); +d <= t1 + 864e5 * 31; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) months.push(d);
    const step = Math.max(1, Math.ceil(months.length / 10));
    months.forEach((d, i) => { if (+d < t0 - 864e5 * 20 || i % step) return; const x = X(Math.max(+d, t0)); svg.appendChild(el('line', { x1: x, x2: x, y1: T - 6, y2: H - 26, class: 'mt-grid' })); svg.appendChild(el('text', { x, y: T - 12, class: 'mt-tick', 'text-anchor': 'middle' }, d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }))); });
    // rujukan: garis antarlajur
    E.filter(e => e.kind === 'rujuk' && e.to).forEach(e => { const x1 = X(e.p.d), x2 = X((e.p2 || e.p).d); svg.appendChild(el('path', { d: 'M' + x1 + ' ' + Y(e.fac) + ' C ' + (x1 + 30) + ' ' + Y(e.fac) + ', ' + (x2 - 30) + ' ' + Y(e.to) + ', ' + x2 + ' ' + Y(e.to), class: 'mt-ref' + (e.p2 ? '' : ' open') })); });
    // titik kejadian (bernomor)
    const used = {};
    E.forEach(e => {
      const x = X(e.p.d), yb = Y(e.fac), slot = Math.round(x / 14) + '|' + (e.fac || '–'), k = used[slot] = (used[slot] || 0) + 1, y = yb + (k - 1) * 9 - (k > 1 ? 4 : 0);
      const g = el('g', { class: 'mt-ev', tabindex: '0' });
      if (e.kind === 'mati') g.appendChild(el('path', { d: `M${x} ${y - 9} L${x + 9} ${y} L${x} ${y + 9} L${x - 9} ${y} Z`, fill: '#222', stroke: '#c0503d', 'stroke-width': 2.5 }));
      else g.appendChild(el('circle', { cx: x, cy: y, r: 8.5, fill: PHC[e.ph] || '#888', stroke: '#fff', 'stroke-width': 1.5, 'stroke-dasharray': e.p.approx ? '2 2' : '' }));
      g.appendChild(el('text', { x, y: y + 3.5, class: 'mt-num', 'text-anchor': 'middle' }, String(e.n)));
      g.appendChild(el('title', null, e.n + '. ' + fd(e.p) + ' · ' + e.label + ' · ' + (facName(e.fac) || 'fasilitas tidak tercatat') + (e.src ? ' · ' + e.src : '')));
      if (opts.onPick) g.addEventListener('click', () => opts.onPick(e));
      svg.appendChild(g);
    });
    // legenda fase
    let lx = L; ['T1 Akses dan diagnosis', 'T2 Awal terapi', 'T3 Pemantauan', 'T4 Rujukan', 'T5 Memburuk'].forEach((t, i) => { const c = 'T' + (i + 1); svg.appendChild(el('circle', { cx: lx, cy: H - 12, r: 5, fill: PHC[c] })); svg.appendChild(el('text', { x: lx + 9, y: H - 8, class: 'mt-leg' }, t)); lx += 150; });
    svg.appendChild(el('path', { d: `M${lx} ${H - 18} L${lx + 6} ${H - 12} L${lx} ${H - 6} L${lx - 6} ${H - 12} Z`, fill: '#222', stroke: '#c0503d', 'stroke-width': 1.5 })); svg.appendChild(el('text', { x: lx + 10, y: H - 8, class: 'mt-leg' }, 'Meninggal'));
    return h('div', { class: 'mt-wrap' }, svg);
  };

  /* ---------------- bagian berkas kasus */
  const kv = rows => h('dl', { class: 'kv mort-kv' }, rows.filter(r => has(r[1])).map(([a, b]) => [h('dt', null, a), h('dd', null, esc(b))]));
  const sec = (id, title, ...kids) => h('section', { class: 'card mort-sec', id: 'ms-' + id, 'data-sec': id }, h('h2', null, title), ...kids);
  const chip = (t, cls) => h('span', { class: 'chip ' + (cls || '') }, t);
  const stBadge = s => s ? h('span', { class: 'mort-st st-' + String(s).replace(/\s+/g, '') }, s) : null;

  M.profileRows = function (D) {
    const A = (D.rec.C6A || {}).data || {}, cal = D.calon || {}, c = D.case;
    const c3 = (D.c3 || []).map(r => r.data || {}), pick = k => (c3.find(d => has(d[k])) || {})[k];
    return [['Umur saat meninggal', A.umur ? A.umur + ' tahun' : ''], ['Jenis kelamin', A.jk], ['Fasyankes', c.fac ? c.fac + ' · ' + facName(c.fac) : ''], ['Kab/kota', c.kk_name || c.kk],
      ['Dokumentasi TB / HIV', [A.dok_tb || cal.tb, A.dok_hiv || cal.hiv].filter(Boolean).join(' / ')], ['Diagnosis TB', [A.dx_tb_dasar, A.dx_tb_lokasi, A.dx_tb_tipe, A.dx_tb_res].filter(has).map(esc).join(' · ')],
      ['Diagnosis HIV', A.dx_hiv_waktu], ['Stadium klinis', A.stadium], ['CD4', A.cd4 ? A.cd4 + (A.cd4_tgl ? ' (' + A.cd4_tgl + ')' : '') : pick('CD4')], ['Infeksi oportunistik lain', A.io_lain],
      ['Status gizi / IMT', A.gizi], ['Komorbid', A.komorbid], ['Rawat inap saat awal', A.ranap], ['Status ARV', A.arv_status], ['Perubahan/interupsi OAT', A.oat_perubahan],
      ['Komplikasi', [A.komplikasi, A.komplikasi_lain].filter(has).map(esc).join('; ')], ['Rujukan (C6A)', A.rujukan], ['Interupsi (C6A)', A.interupsi], ['Luaran TB (C3)', pick('A13')], ['Status ARV terakhir (C3)', pick('T03')]].filter(r => has(r[1])).map(r => [r[0], esc(r[1])]);
  };
  const profil = D => kv(M.profileRows(D));
  M.causeRows = function (D) {
    const A = (D.rec.C6A || {}).data || {}, B = (D.rec.C6B || {}).data || {}, cal = D.calon || {};
    return [['Tanggal meninggal', A.tgl_mati || cal.tgl_mati || D.case.tgl_mati], ['Tempat meninggal', A.mati_tempat], ['Konfirmasi kematian', [A.mati_konf, A.mati_sumber].filter(has).map(esc).join(' · ')],
      ['Sebab kematian tercatat (C6A)', A.mati_sebab], ['Sebab kematian tercatat dan sumber (penelaah 1)', B.sebab], ['Dugaan hubungan dengan TB (penelaah 1)', B.hubungan], ['Catatan daftar calon (C2)', cal.alasan_gagal || cal.alasan]].filter(r => has(r[1])).map(r => [r[0], esc(r[1])]);
  };
  const sebab = D => h('div', { class: 'mort-cause' }, kv(M.causeRows(D)));
  function scores(D) {
    const B = (D.rec.C6B || {}).data || {}, C = (D.rec.C6C || {}).data || {};
    const b1 = B.B1 || {}, c1 = C.C1 || {}, b2 = B.B2 || {}, c2 = C.C2 || {};
    if (!D.rec.C6B && !D.rec.C6C) return h('p', { class: 'muted' }, 'Belum ada penilaian penelaah (C6B/C6C) untuk kasus ini.');
    const diff = (a, b) => a && b && ((a === 'BD') !== (b === 'BD') || Math.abs(+a - +b) >= 2);
    const t1 = h('div', { class: 'table-wrap' }, h('table', { class: 't mort-score' }, h('thead', null, h('tr', null, h('th', null, 'Fase'), h('th', null, 'Penelaah 1'), h('th', null, 'Alasan penelaah 1'), h('th', null, 'Penelaah 2 (tersamar)'), h('th', null, 'Alasan penelaah 2'))),
      h('tbody', null, M.PHASE.map((p, i) => { const k = 'T' + (i + 1), a = (b1[k] || {}), b = (c1[k] || {}), df = diff(a.skor, b.skor);
        return h('tr', { class: df ? 'beda' : null }, h('th', null, p), h('td', { class: 'n' }, h('span', { class: 'skor s' + (a.skor || 'x') }, a.skor || '–')), h('td', null, esc(a.alasan)), h('td', { class: 'n' }, h('span', { class: 'skor s' + (b.skor || 'x') }, b.skor || '–'), df ? h('b', { class: 'beda-tag' }, ' berbeda') : null), h('td', null, esc(b.alasan))); }))));
    const DL = [['d1', 'Keterlambatan 1 · mencari pelayanan'], ['d2', 'Keterlambatan 2 · mencapai layanan yang tepat'], ['d3', 'Keterlambatan 3 · tata laksana di fasyankes']];
    const t2 = h('div', { class: 'mort-delays' }, DL.map(([k, l]) => { const a = b2[k] || {}, b = c2[k] || {}; return h('div', { class: 'mort-delay' + (a.nilai === 'Ada' || b.nilai === 'Ada' ? ' ada' : '') }, h('b', null, l), h('div', null, 'Penelaah 1: ', h('b', null, a.nilai || '–'), a.bukti ? ' · ' + a.bukti : ''), D.rec.C6C ? h('div', null, 'Penelaah 2: ', h('b', null, b.nilai || '–'), b.bukti ? ' · ' + b.bukti : '') : null); }));
    const B3 = B.B3 || {}, b3rows = Object.keys(B3).filter(k => has(B3[k].rm) || (B3[k].interp && B3[k].interp !== 'BD'));
    const t3 = b3rows.length ? h('div', null, h('h3', null, 'Komplikasi: tercatat di rekam medis vs interpretasi penelaah'), h('ul', null, b3rows.map(k => h('li', null, h('b', null, k.replace(/_/g, ' ')), ': rekam medis ' + (B3[k].rm || '–') + ' · interpretasi ' + (B3[k].interp || '–') + (B3[k].bukti ? ' · ' + B3[k].bukti : ''))))) : null;
    const b4 = (B.B4 || []).filter(r => has(r.masalah));
    const t4 = b4.length ? h('div', null, h('h3', null, 'Masalah, faktor penyumbang, dan peluang perbaikan (penelaah 1)'), h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Masalah', 'Fase', 'Faktor penyumbang', 'Kategori', 'Klasifikasi', 'Peluang perbaikan', 'Pihak'].map(x => h('th', null, x)))),
      h('tbody', null, b4.map(r => h('tr', null, [r.masalah, r.fase, r.penyumbang, r.faktor, r.klas, r.peluang, r.pihak].map(x => h('td', null, esc(x))))))))) : null;
    const C3c = C.C3 ? null : null;
    const q = [B.panel_q && ['Pertanyaan untuk panel (penelaah 1)', B.panel_q], C.panel_q && ['Hal untuk dibahas (penelaah 2)', C.panel_q], C.peluang && ['Peluang perbaikan (penelaah 2)', C.peluang], B.peluang && ['Peluang perbaikan (penelaah 1)', B.peluang],
      [C.faktor1, C.faktor2, C.faktor3].some(has) && ['Faktor utama (penelaah 2)', [C.faktor1, C.faktor2, C.faktor3].filter(has).join(' · ')], C.keyakinan && ['Keyakinan penelaah 2', C.keyakinan]].filter(Boolean);
    return h('div', { class: 'stack' }, t1, h('h3', null, 'Tiga keterlambatan'), t2, t3, t4, q.length ? kv(q) : null, C3c);
  }
  /** faktor penyumbang dikelompokkan: pasien, layanan, sistem */
  M.factorData = function (D) {
    const A = (D.rec.C6A || {}).data || {}, B = (D.rec.C6B || {}).data || {}, G = { Pasien: [], 'Layanan kesehatan': [], 'Sistem dan lainnya': [] };
    const add = (g, t, src) => { if (has(t)) G[g].push({ t: esc(t), src }); };
    const d = B.B2 || {};
    if ((d.d1 || {}).nilai === 'Ada') add('Pasien', 'Keterlambatan mencari pelayanan' + (d.d1.bukti ? ': ' + d.d1.bukti : ''), 'C6B B2');
    if ((d.d2 || {}).nilai === 'Ada') add('Sistem dan lainnya', 'Keterlambatan mencapai layanan yang tepat' + (d.d2.bukti ? ': ' + d.d2.bukti : ''), 'C6B B2');
    if ((d.d3 || {}).nilai === 'Ada') add('Layanan kesehatan', 'Keterlambatan tata laksana di fasyankes' + (d.d3.bukti ? ': ' + d.d3.bukti : ''), 'C6B B2');
    if (has(A.gizi)) add('Pasien', 'Status gizi: ' + esc(A.gizi), 'C6A');
    if (has(A.komorbid)) add('Pasien', 'Komorbid: ' + esc(A.komorbid), 'C6A');
    if (has(A.stadium)) add('Pasien', 'Stadium klinis: ' + esc(A.stadium), 'C6A');
    Object.keys(B.B1 || {}).forEach(k => { const x = B.B1[k] || {}; if (/^[12]$/.test(String(x.skor))) add('Layanan kesehatan', M.PHASE[+k.slice(1) - 1] + ' bermutu kurang (skor ' + x.skor + ')' + (x.alasan ? ': ' + x.alasan : ''), 'C6B B1'); });
    (B.B4 || []).forEach(r => { if (!has(r.masalah)) return; const f = String(r.faktor || ''), g = /pasien|komunitas|keparahan/i.test(f) ? 'Pasien' : /^F(3|6|7)/.test(f) ? 'Sistem dan lainnya' : 'Layanan kesehatan';
      add(g, r.masalah + (r.penyumbang ? ' — ' + r.penyumbang : '') + (f ? ' [' + f + ']' : ''), 'C6B B4' + (r.fase ? ' · ' + r.fase.slice(0, 2) : '')); });
    (D.c3 || []).forEach(r => { const x = r.data || {};
      (x.interupsi || []).forEach(i => add('Pasien', 'Interupsi ' + esc(i.layanan) + (i.alasan_tercatat ? ': ' + i.alasan_tercatat : ''), 'C3 ' + r.unit));
      (x.rujukan || []).forEach(j => { if (j.status && !/selesai|hadir|diterima/i.test(j.status)) add('Layanan kesehatan', 'Rujukan ' + esc(j.layanan) + ' ke ' + facName(j.tujuan) + ': ' + j.status, 'C3 ' + r.unit); }); });
    (D.c4 || []).forEach(r => Object.keys(r.data.matriks_cp || {}).forEach(cp => { const m = r.data.matriks_cp[cp] || {}; if (m.klasifikasi && !/^(Terlaksana dan terverifikasi|Tidak berlaku)/.test(m.klasifikasi)) add('Sistem dan lainnya', cp + ' di ' + facName(r.unit) + ': ' + m.klasifikasi + (m.masalah ? ' — ' + m.masalah : ''), 'C4'); }));
    (D.c5 || []).forEach(x => { if (x.row.jenis && x.row.jenis !== 'Sesuai') add('Sistem dan lainnya', 'Data ' + ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[x.sub] + ' tidak sesuai: ' + x.row.jenis + (x.row.penjelasan ? ' — ' + x.row.penjelasan : ''), 'C5'); });
    (D.c7 || []).slice(0, 6).forEach(t => add(/pasien|stigma|biaya|jarak|transport|menyangkal|keluarga/i.test(t.tema + t.catatan) ? 'Pasien' : 'Sistem dan lainnya', 'Tema wawancara di kab/kota: ' + t.tema, 'C7 ' + t.sesi));
    return G;
  };
  function factors(D) {
    const G = M.factorData(D);
    return h('div', { class: 'mort-fac3' }, Object.keys(G).map(g => h('div', { class: 'mort-fcol' }, h('h3', null, g + ' (' + G[g].length + ')'), G[g].length ? h('ul', null, G[g].map(x => h('li', null, x.t, h('small', { class: 'muted' }, ' · ' + x.src)))) : h('p', { class: 'muted small' }, 'Tidak ada catatan.'))));
  }
  function episodes(D) {
    if (!(D.c3 || []).length) return h('p', { class: 'muted' }, 'Pasien ini tidak memiliki unit telaah catatan C3.');
    const KEYS = { A: [['A01', 'Diagnosis TB'], ['A07', 'Tes HIV'], ['A08', 'Mulai OAT'], ['A11', 'Mulai ARV'], ['A13', 'Luaran TB'], ['A14', 'Tanggal luaran'], ['T03', 'Status ARV'], ['T04', 'Kontak terakhir'], ['T06', 'Tanggal kematian']],
      B: [['B01', 'Mulai ARV'], ['B03', 'Skrining TB'], ['B04', 'Hasil skrining'], ['B07', 'Mulai OAT'], ['B13', 'Mulai TPT'], ['B16', 'Luaran TPT'], ['T03', 'Status ARV'], ['T04', 'Kontak terakhir'], ['T06', 'Tanggal kematian']],
      CP3: [['R_E', 'Diagnosis TB'], ['R_F', 'Status HIV'], ['R_G', 'Penawaran tes'], ['R_I', 'Tes/dokumentasi HIV']] };
    return h('div', { class: 'stack' }, D.c3.map(r => { const d = r.data || {};
      return h('details', { class: 'mort-ep', open: r.dead || null }, h('summary', null, h('b', null, 'Kerangka ' + r.frame + ' · ' + r.unit), ' · ', facName(r.fac), ' ', stBadge(r.status), r.dead ? chip('berstatus akhir meninggal', 'danger') : null),
        kv((KEYS[r.frame] || []).map(([k, l]) => [l, d[k]])),
        (d.rujukan || []).length ? h('div', null, h('h4', null, 'Rujukan'), h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Layanan', 'Asal', 'Tujuan', 'Tgl rujuk', 'Tgl hadir', 'Status'].map(x => h('th', null, x)))),
          h('tbody', null, d.rujukan.map(x => h('tr', null, [x.layanan, facName(x.asal), facName(x.tujuan), x.tanggal_rujuk, x.tanggal_hadir_di_tujuan, x.status].map(v => h('td', null, esc(v))))))))) : null,
        (d.interupsi || []).length ? h('div', null, h('h4', null, 'Interupsi'), h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Layanan', 'Jenis', 'Jadwal terlewat', 'Alasan', 'Kembali', 'Status'].map(x => h('th', null, x)))),
          h('tbody', null, d.interupsi.map(x => h('tr', null, [x.layanan, x.jenis, x.tanggal_jadwal_terlewat, x.alasan_tercatat, x.tanggal_kembali_berobat, x.status].map(v => h('td', null, esc(v))))))))) : null);
    }));
  }
  function docs(D) {
    if (!(D.photos || []).length) return h('p', { class: 'muted' }, 'Belum ada foto atau dokumen pendukung yang diunggah untuk kasus ini.');
    const items = D.photos.map(p => Object.assign({ mortKey: D.case.key }, p));
    const grid = h('div', { class: 'mort-docs' });
    items.forEach((p, i) => { const b = h('button', { type: 'button', class: 'mort-doc', onclick: () => RCA.photo.viewer(items, i) }, h('span', { class: 'mort-th' }, h('small', { class: 'muted' }, 'memuat…')), h('span', { class: 'small' }, (p.caption || 'Dokumen') + ' · ' + p.form + ' ' + p.unit));
      grid.appendChild(b); RCA.photo.b64Of(p).then(x => { const th = b.querySelector('.mort-th'); if (x) { th.innerHTML = ''; th.style.backgroundImage = 'url(data:image/jpeg;base64,' + x + ')'; } else th.textContent = 'tidak tersedia'; }); });
    return h('div', null, h('p', { class: 'muted small' }, 'Foto sudah disamarkan oleh pengambil data sebelum diunggah. Ketuk untuk memperbesar, geser untuk foto lain.'), grid);
  }
  function context(D) {
    const parts = [];
    (D.c4 || []).forEach(r => { const rows = Object.keys(r.data.matriks_cp || {}).map(cp => [cp, r.data.matriks_cp[cp] || {}]).filter(([, m]) => m.klasifikasi || m.masalah);
      parts.push(h('div', null, h('h3', null, 'Penilaian proses C4 · ' + facName(r.unit)), rows.length ? h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['CP', 'Klasifikasi', 'Masalah', 'Dugaan penyebab'].map(x => h('th', null, x)))), h('tbody', null, rows.map(([cp, m]) => h('tr', null, [cp, m.klasifikasi, m.masalah, m.dugaan].map(v => h('td', null, esc(v))))))))
        : h('p', { class: 'muted small' }, 'Belum ada klasifikasi CP.'))); });
    if (D.c1 && (D.c1.dugaan || []).length) parts.push(h('div', null, h('h3', null, 'Dugaan awal kab/kota (C1)'), h('ul', null, D.c1.dugaan.map(x => h('li', null, esc(x.dugaan), x.cp ? h('small', { class: 'muted' }, ' · ' + x.cp) : null)))));
    if ((D.c7 || []).length) parts.push(h('div', null, h('h3', null, 'Tema wawancara dan diskusi di kab/kota (C7)'), h('ul', null, D.c7.map(t => h('li', null, h('b', null, t.tema), t.kutipan ? ' — “' + t.kutipan + '”' : '', h('small', { class: 'muted' }, ' · ' + t.sesi + (t.cp ? ' · ' + t.cp : '')))))));
    if ((D.c5 || []).length) parts.push(h('div', null, h('h3', null, 'Verifikasi data sentinel (C5) untuk pasien ini'), h('ul', null, D.c5.map(x => h('li', null, ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[x.sub] + ': ' + esc(x.row.jenis) + (x.row.penjelasan ? ' — ' + x.row.penjelasan : ''))))));
    return parts.length ? h('div', { class: 'stack' }, parts) : h('p', { class: 'muted' }, 'Belum ada data konteks dari C1, C4, C5, atau C7.');
  }

  /* ---------------- lembar penilaian (panelis dan konsensus) */
  M.form = function (data, opts) {
    data = JSON.parse(JSON.stringify(data || {})); opts = opts || {};
    const wrap = h('div', { class: 'mort-form' }), onCh = () => opts.onChange && opts.onChange(data);
    M.FIELDS.concat(opts.extra || []).forEach(f => {
      const id = 'mf-' + (opts.prefix || '') + f.k;
      const inp = f.t === 'select' ? h('select', { id, disabled: opts.readOnly || null }, h('option', { value: '' }, '—'), f.o.map(o => h('option', { value: o, selected: data[f.k] === o || null }, o)))
        : h('textarea', { id, rows: f.k === 'sebab' ? 3 : 2, disabled: opts.readOnly || null }, data[f.k] || '');
      inp.addEventListener(f.t === 'select' ? 'change' : 'input', () => { data[f.k] = inp.value; onCh(); });
      let ctl = inp; if (f.t !== 'select' && RCA.voice && RCA.voice.wrap && !opts.readOnly) { try { ctl = RCA.voice.wrap(inp); } catch (e) { ctl = inp; } }
      const box = h('div', { class: 'field' }, h('label', { for: id, class: 'lbl' }, f.l), f.hint ? h('small', { class: 'muted' }, f.hint) : null, ctl);
      wrap.appendChild(box);
    });
    // faktor penyumbang
    const FC = M.FCOLS(); data.faktor = (data.faktor || []).filter(Boolean);
    const list = h('div', { class: 'mort-frows' });
    const redraw = () => { list.innerHTML = ''; data.faktor.forEach((r, i) => {
      const row = h('div', { class: 'mort-frow' }, h('div', { class: 'mort-frow-h' }, h('b', null, 'Faktor ' + (i + 1)), opts.readOnly ? null : h('button', { type: 'button', class: 'linkbtn', onclick: () => { data.faktor.splice(i, 1); redraw(); onCh(); } }, 'hapus')));
      FC.forEach(c => { const inp = c.o ? h('select', { disabled: opts.readOnly || null, 'aria-label': c.l + ' faktor ' + (i + 1) }, h('option', { value: '' }, c.l + '…'), c.o.map(o => h('option', { value: o, selected: r[c.k] === o || null }, o)))
          : h(c.t === 'textarea' ? 'textarea' : 'input', { rows: 2, value: r[c.k] || '', placeholder: c.l, 'aria-label': c.l + ' faktor ' + (i + 1), disabled: opts.readOnly || null }, c.t === 'textarea' ? (r[c.k] || '') : null);
        inp.addEventListener(c.o ? 'change' : 'input', () => { r[c.k] = inp.value; onCh(); }); row.appendChild(inp); });
      list.appendChild(row); }); };
    redraw();
    wrap.appendChild(h('div', { class: 'field' }, h('span', { class: 'lbl' }, 'Faktor penyumbang (pasien, layanan kesehatan, sistem, lainnya)'), list,
      opts.readOnly ? null : h('button', { type: 'button', class: 'btn small', onclick: () => { data.faktor.push({}); redraw(); onCh(); } }, '+ Tambah faktor')));
    wrap.get = () => data;
    return wrap;
  };
  function assessPanel(D, rerender) {
    const me = D.me || {}, sent = me.status === 'Dikirim', st = h('span', { class: 'small muted' });
    const status = () => { st.textContent = sent ? 'Terkirim ' + RCA.fmtD(me.at) + '. Anda masih dapat memperbarui dan mengirim ulang.' : me.at ? 'Draf tersimpan ' + new Date(me.at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Belum diisi.'; };
    let timer = null;
    const save = async (submit) => {
      clearTimeout(timer);
      const data = f.get();
      if (submit && !await RCA.confirm('Kirim penilaian', 'Kirim penilaian Anda untuk kasus ' + D.case.key + '? Setelah dikirim, Anda dapat melihat penilaian panelis lain yang sudah dikirim.', 'Kirim')) return;
      try { const r = await RCA.api('mort.assess.save', { key: D.case.key, data, submit: !!submit }); Object.assign(me, { status: r.status, at: r.at, data }); D.me = me;
        try { localStorage.removeItem('rca.mort.' + D.case.key); } catch (e) { }
        status(); if (submit) { RCA.toast('Penilaian terkirim', 'ok'); rerender(); } }
      catch (e) { try { localStorage.setItem('rca.mort.' + D.case.key, JSON.stringify(data)); } catch (x) { } st.textContent = 'Belum tersimpan ke server (' + e.message + '); disimpan di perangkat ini.'; }
    };
    let init = me.data; try { const loc = JSON.parse(localStorage.getItem('rca.mort.' + D.case.key) || 'null'); if (loc && (!init || !M.isFilled(init))) init = loc; } catch (e) { }
    const f = M.form(init, { prefix: 'me-', onChange: () => { st.textContent = 'Mengubah…'; clearTimeout(timer); timer = setTimeout(() => save(false), 2500); } });
    status();
    return h('aside', { class: 'card mort-assess', id: 'mortAssess' }, h('h2', null, 'Penilaian saya'),
      h('p', { class: 'muted small' }, 'Isi secara mandiri. Penilaian panelis lain baru terlihat setelah Anda mengirim. Isian tersimpan otomatis sebagai draf.'), f,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => save(false) }, 'Simpan draf'), h('button', { class: 'btn primary', type: 'button', onclick: () => save(true) }, sent ? 'Kirim ulang' : 'Kirim penilaian')), st);
  }
  /** matriks kesepakatan + kesimpulan konsensus */
  async function panelResult(D, box) {
    box.innerHTML = ''; box.appendChild(h('p', { class: 'muted' }, 'Memuat penilaian panel…'));
    let R; try { R = await RCA.api('mort.assess.all', { key: D.case.key }); } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    box.innerHTML = '';
    if (R.hidden) { box.appendChild(h('div', { class: 'notice' }, 'Penilaian panelis lain disembunyikan sampai Anda mengirim penilaian sendiri (' + R.n + ' dari ' + R.total + ' panelis sudah mengirim).')); return; }
    const L = R.list.filter(x => x.status === 'Dikirim');
    box.appendChild(h('p', null, L.length + ' dari ' + R.total + ' panelis sudah mengirim penilaian.'));
    if (L.length) {
      const rows = M.FIELDS.map(f => { const vals = L.map(x => esc(x.data[f.k])); const uniq = [...new Set(vals.filter(Boolean))]; return { f, vals, beda: f.t === 'select' && uniq.length > 1 }; });
      const fk = L.map(x => (x.data.faktor || []).filter(r => r.uraian || r.kelompok).map(r => [r.kelompok, r.fase ? r.fase.slice(0, 2) : '', r.uraian].filter(Boolean).join(' · ')).join('\n'));
      box.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't mort-matrix' }, h('thead', null, h('tr', null, h('th', null, 'Butir'), L.map(x => h('th', null, x.name)))),
        h('tbody', null, rows.map(r => h('tr', { class: r.beda ? 'beda' : null }, h('th', null, r.f.l, r.beda ? h('b', { class: 'beda-tag' }, ' berbeda') : null), r.vals.map(v => h('td', null, v || '–')))),
          h('tr', null, h('th', null, 'Faktor penyumbang'), fk.map(v => h('td', { style: { whiteSpace: 'pre-line' } }, v || '–')))))));
    }
    const canK = D.peran.ketua || D.peran.koord;
    if (!canK) { if (D.konsensus && M.isFilled(D.konsensus)) box.appendChild(h('div', null, h('h3', null, 'Kesimpulan konsensus'), M.form(D.konsensus, { readOnly: true, prefix: 'kr-' }))); return; }
    // usulan awal konsensus: nilai terbanyak untuk butir pilihan
    let base = D.konsensus && M.isFilled(D.konsensus) ? D.konsensus : {};
    if (!M.isFilled(base) && L.length) { base = {}; M.FIELDS.forEach(f => { const v = L.map(x => x.data[f.k]).filter(has); if (!v.length) return; if (f.t === 'select') { const c = {}; v.forEach(x => { c[x] = (c[x] || 0) + 1; }); base[f.k] = Object.keys(c).sort((a, b) => c[b] - c[a])[0]; } else base[f.k] = v.join('\n— '); });
      base.faktor = [].concat(...L.map(x => (x.data.faktor || []).filter(r => r.uraian || r.kelompok))); }
    const kf = M.form(base, { prefix: 'ks-', extra: [{ k: 'implikasi', l: 'Implikasi program', t: 'textarea' }] });
    const final = D.konsensus_meta && D.konsensus_meta.final_at;
    const save = async fin => { try { const r = await RCA.api('mort.consensus', { key: D.case.key, data: kf.get(), final: fin }); D.konsensus = kf.get(); if (fin) D.konsensus_meta = Object.assign(D.konsensus_meta || {}, { final_at: new Date().toISOString() }); RCA.toast(fin ? 'Kesimpulan konsensus final disimpan' : 'Draf kesimpulan disimpan', 'ok'); } catch (e) { RCA.toast(e.message, 'err'); } };
    box.appendChild(h('div', { class: 'mort-kons' }, h('h3', null, 'Kesimpulan konsensus panel'), final ? h('div', { class: 'notice ok' }, 'Final ' + RCA.fmtD(D.konsensus_meta.final_at) + (D.konsensus_meta.final_by ? ' oleh ' + D.konsensus_meta.final_by : '') + '. Masih dapat diperbarui.') : null,
      h('p', { class: 'muted small' }, 'Usulan awal diambil dari jawaban terbanyak panelis; sesuaikan dengan hasil diskusi forum.'), kf,
      h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: () => save(false) }, 'Simpan draf kesimpulan'), h('button', { class: 'btn primary', type: 'button', onclick: () => save(true) }, 'Tetapkan sebagai konsensus final'),
        D.peran.koord && D.case.kode_kasus ? h('button', { class: 'btn ghost', type: 'button', title: 'Mengisi kolom C6P yang masih kosong; C6P yang sudah Valid tidak diubah', onclick: async () => { try { const r = await RCA.api('mort.toC6P', { key: D.case.key }); RCA.toast(r.skipped || ('Disalin ke C6P: ' + r.fields.join(', ')), r.skipped ? 'info' : 'ok', 7000); } catch (e) { RCA.toast(e.message, 'err', 7000); } } }, 'Salin ke lembar panel C6P') : null)));
  }

  /* ---------------- halaman berkas kasus */
  M.casePage = async function (main, key) {
    main.innerHTML = ''; main.appendChild(h('p', { class: 'muted' }, 'Memuat berkas kasus ' + key + '…'));
    let D; try { D = await RCA.api('mort.case', { key }); } catch (e) { main.innerHTML = ''; main.appendChild(h('a', { href: '#/kematian' }, '‹ Daftar kasus')); main.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    M.cur = D;
    const render = () => {
      main.innerHTML = '';
      const c = D.case, E = M.events(D), IV = M.intervals(E);
      const canAssess = D.peran.panelis || D.peran.ketua;
      const head = h('div', { class: 'page-head mort-head' }, h('div', { class: 'grow' }, h('a', { href: '#/kematian', class: 'small' }, '‹ Daftar kasus'),
        h('h1', null, 'Kasus ' + c.key), h('p', null, [c.fac ? facName(c.fac) : '', c.kk_name, c.umur ? c.umur + ' th' : '', c.jk].filter(Boolean).join(' · ')),
        h('div', { class: 'row', style: { gap: '6px', marginTop: '6px' } }, c.sumber.map(s => chip(s === 'C6' ? 'Telaah kematian C6' : s === 'C3' ? 'Unit C3 meninggal' : 'Calon kematian C2')), c.terbatas ? chip('data terbatas', 'warn') : null, c.beda ? chip('penilaian 1 dan 2 berbeda', 'danger') : null,
          c.kecukupan && c.kecukupan !== 'Memadai' ? chip('kronologi ' + c.kecukupan.toLowerCase(), 'warn') : null, chip('Panel: ' + c.panel.status))),
        h('div', { class: 'row no-print' }, h('button', { class: 'btn', type: 'button', onclick: () => M.forum(D) }, 'Mode forum'),
          h('button', { class: 'btn', type: 'button', onclick: () => RCA.mortx.pdf([D]) }, 'Unduh PDF'), h('button', { class: 'btn', type: 'button', onclick: () => RCA.mortx.excel([D]) }, 'Unduh Excel')));
      const tl = M.timeline(E, { onPick: e => { const r = document.getElementById('mev-' + e.n); if (r) { r.scrollIntoView({ block: 'center', behavior: 'smooth' }); r.classList.add('flash'); setTimeout(() => r.classList.remove('flash'), 1600); } } });
      const kron = h('div', { class: 'table-wrap' }, h('table', { class: 't mort-kron' }, h('thead', null, h('tr', null, ['#', 'Tanggal', 'Fasilitas', 'Fase', 'Kejadian', 'Sumber'].map(x => h('th', null, x)))),
        h('tbody', null, E.map(e => h('tr', { id: 'mev-' + e.n, class: e.kind === 'mati' ? 'mati' : null }, h('td', { class: 'n' }, String(e.n)), h('td', { style: { whiteSpace: 'nowrap' } }, fd(e.p)), h('td', null, facName(e.fac) || '–'),
          h('td', null, h('span', { class: 'ph', style: { background: PHC[e.ph] } }, e.ph)), h('td', null, e.label, e.st && e.st !== 'Y' ? h('small', { class: 'muted' }, ' · status ' + e.st) : null, e.after ? h('b', { class: 'beda-tag' }, ' · tanggal sesudah kematian, periksa sumber') : null, e.beda ? h('b', { class: 'beda-tag' }, ' · tanggal kematian berbeda antarsumber') : null), h('td', { class: 'small muted' }, e.src))))));
      const ivBox = h('div', { class: 'mort-iv' }, IV.map(([l, d]) => h('div', { class: 'mort-ivc' + (d !== null && d > 30 ? ' long' : '') }, h('b', null, d === null ? '–' : d + ' hari'), h('small', null, l))));
      const result = h('div');
      const body = h('div', { class: 'mort-body' },
        sec('ringkas', 'Ringkasan pasien', h('div', { class: 'mort-2' }, h('div', null, h('h3', null, 'Profil klinis'), profil(D)), h('div', null, h('h3', null, 'Kematian dan sebabnya'), sebab(D), h('h3', null, 'Waktu antartahap'), ivBox))),
        sec('alur', 'Perjalanan pasien dari kontak pertama sampai meninggal', h('p', { class: 'muted small' }, 'Satu lajur per fasilitas; garis putus-putus menunjukkan rujukan antarfasilitas. Ketuk titik untuk melihat rinciannya di kronologi. Titik bergaris putus = tanggal perkiraan.'), tl, h('h3', null, 'Kronologi terpadu (' + E.length + ' kejadian)'), kron),
        sec('telaah', 'Penilaian penelaah (C6B dan C6C)', scores(D)),
        sec('faktor', 'Faktor penyumbang dari semua formulir', h('p', { class: 'muted small' }, 'Dikumpulkan otomatis dari C3, C4, C5, C6, dan C7 sebagai bahan diskusi; bukan kesimpulan panel.'), factors(D, E)),
        sec('episode', 'Episode pelayanan (telaah catatan C3)', episodes(D)),
        sec('dokumen', 'Foto dan dokumen pendukung (' + (D.photos || []).length + ')', docs(D)),
        sec('konteks', 'Konteks fasyankes dan wilayah (C1, C4, C5, C7)', context(D)),
        sec('panel', 'Hasil panel', result));
      const grid = h('div', { class: 'mort-grid' + (canAssess ? '' : ' solo') }, body, canAssess ? assessPanel(D, () => { panelResult(D, result); }) : null);
      main.appendChild(head); main.appendChild(h('nav', { class: 'mort-toc no-print', 'aria-label': 'Bagian berkas' }, [['ringkas', 'Ringkasan'], ['alur', 'Perjalanan'], ['telaah', 'Penelaah'], ['faktor', 'Faktor'], ['episode', 'Episode C3'], ['dokumen', 'Dokumen'], ['konteks', 'Konteks'], ['panel', 'Hasil panel']].map(([k, l]) => h('a', { href: 'javascript:void 0', onclick: () => document.getElementById('ms-' + k).scrollIntoView({ behavior: 'smooth' }) }, l))));
      main.appendChild(grid);
      panelResult(D, result);
    };
    render();
  };

  /* ---------------- mode forum (layar bersama) */
  M.forum = function (D) {
    const E = M.events(D), slides = [['Ringkasan pasien', () => h('div', { class: 'mort-2' }, h('div', null, profil(D)), h('div', null, sebab(D), h('div', { class: 'mort-iv' }, M.intervals(E).map(([l, d]) => h('div', { class: 'mort-ivc' }, h('b', null, d === null ? '–' : d + ' hari'), h('small', null, l))))))],
      ['Perjalanan pasien', () => h('div', null, M.timeline(E), h('ol', { class: 'mort-flist' }, E.map(e => h('li', { value: e.n }, h('b', null, fd(e.p)), ' · ', e.label, h('small', { class: 'muted' }, ' · ' + (facName(e.fac) || '–'))))))],
      ['Penilaian penelaah', () => scores(D)], ['Faktor penyumbang', () => factors(D, E)], ['Hasil panel', () => { const b = h('div'); panelResult(D, b); return b; }]];
    let i = 0;
    const stage = h('div', { class: 'mf-stage' }), ttl = h('h2'), cnt = h('span', { class: 'muted' });
    const show = () => { ttl.textContent = 'Kasus ' + D.case.key + ' · ' + slides[i][0]; cnt.textContent = (i + 1) + ' / ' + slides.length; stage.innerHTML = ''; stage.appendChild(slides[i][1]()); stage.scrollTop = 0; };
    const go = d => { i = Math.max(0, Math.min(slides.length - 1, i + d)); show(); };
    const close = () => { document.removeEventListener('keydown', key); ov.remove(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
    const key = e => { if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1); else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1); else if (e.key === 'Escape') close(); };
    const ov = h('div', { class: 'mort-forum', role: 'dialog', 'aria-label': 'Mode forum' }, h('header', null, ttl, h('div', { class: 'row' }, cnt, h('button', { class: 'btn', type: 'button', onclick: () => go(-1) }, '‹ Sebelumnya'), h('button', { class: 'btn primary', type: 'button', onclick: () => go(1) }, 'Berikutnya ›'), h('button', { class: 'btn ghost', type: 'button', onclick: close }, 'Tutup'))),
      h('nav', null, slides.map((s, k) => h('button', { type: 'button', onclick: () => { i = k; show(); } }, s[0]))), stage);
    document.body.appendChild(ov); document.addEventListener('keydown', key);
    try { if (ov.requestFullscreen) ov.requestFullscreen().catch(() => {}); } catch (e) { }
    show();
  };

  /* ---------------- daftar kasus */
  M.page = async function (main, key) {
    if (key) return M.casePage(main, key);
    main.innerHTML = '';
    const isK = RCA.can.review();
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Kematian'),
      h('p', null, isK ? 'Semua kasus kematian dari C6, C2, dan C3 untuk ditelaah panel. Pilih kasus untuk menugaskan panelis, atau buka berkas kasus.' : 'Kasus kematian yang ditugaskan kepada Anda. Buka berkas kasus, telaah, lalu isi penilaian Anda.'))));
    const box = h('div'); main.appendChild(box); box.appendChild(h('p', { class: 'muted' }, 'Memuat kasus…'));
    let R; try { R = await RCA.api('mort.list', {}); } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
    M.list = R.cases; const f = M.filter = M.filter || { q: '', prov: '', kk: '', fac: '', st: '', src: '' }, sel = new Set();
    box.innerHTML = '';
    const C = R.cases;
    box.appendChild(h('div', { class: 'mort-stats' }, [[C.length, 'kasus kematian'], [C.filter(c => c.sumber.includes('C6')).length, 'sudah ditelaah C6'], [C.filter(c => c.beda).length, 'penilaian 1 dan 2 berbeda'],
      [C.filter(c => c.panel.status === 'Konsensus').length, 'sudah konsensus'], [C.filter(c => c.terbatas).length, 'data terbatas (belum C6)']].map(([n, l]) => h('div', { class: 'mort-stat' }, h('b', null, String(n)), h('small', null, l)))));
    const opts = (arr, v, lab) => [h('option', { value: '' }, lab)].concat([...new Set(arr.filter(Boolean))].sort().map(x => h('option', { value: x, selected: v === x || null }, x)));
    const q = h('input', { type: 'search', placeholder: 'Cari kode kasus, fasyankes, sebab…', value: f.q, 'aria-label': 'Cari kasus' });
    const sP = h('select', { 'aria-label': 'Provinsi' }, opts(C.map(c => c.prov), f.prov, 'Semua provinsi')), sK = h('select', { 'aria-label': 'Kab/kota' }, opts(C.map(c => c.kk_name), f.kk, 'Semua kab/kota')),
      sS = h('select', { 'aria-label': 'Status panel' }, opts(C.map(c => c.panel.status).concat(['Belum ditugaskan', 'Ditugaskan', 'Penilaian', 'Forum', 'Konsensus']), f.st, 'Semua status panel')),
      sR = h('select', { 'aria-label': 'Sumber' }, [h('option', { value: '' }, 'Semua sumber'), ['C6', 'Telaah C6'], ['C3', 'Unit C3 meninggal'], ['C2', 'Calon C2'], ['beda', 'Penilaian berbeda'], ['terbatas', 'Data terbatas']].map(x => Array.isArray(x) ? h('option', { value: x[0], selected: f.src === x[0] || null }, x[1]) : x));
    const grid = h('div', { class: 'mort-cards' }), info = h('span', { class: 'muted small' });
    const shown = () => C.filter(c => (!f.prov || c.prov === f.prov) && (!f.kk || c.kk_name === f.kk) && (!f.st || c.panel.status === f.st) && (!f.src || (f.src === 'beda' ? c.beda : f.src === 'terbatas' ? c.terbatas : c.sumber.includes(f.src)))
      && (!f.q || (c.key + ' ' + c.fac + ' ' + c.fac_name + ' ' + c.kk_name + ' ' + c.sebab + ' ' + c.c3.join(' ')).toLowerCase().includes(f.q.toLowerCase())));
    const draw = () => {
      grid.innerHTML = ''; const L = shown(); info.textContent = L.length + ' kasus ditampilkan' + (sel.size ? ' · ' + sel.size + ' dipilih' : '');
      if (!L.length) grid.appendChild(h('p', { class: 'muted' }, isK ? 'Tidak ada kasus yang cocok dengan filter.' : 'Belum ada kasus yang ditugaskan kepada Anda. Koordinator akan menugaskan kasus untuk ditelaah.'));
      L.forEach(c => {
        const cb = isK ? h('input', { type: 'checkbox', 'aria-label': 'Pilih ' + c.key, checked: sel.has(c.key) || null, onclick: e => e.stopPropagation(), onchange: e => { e.target.checked ? sel.add(c.key) : sel.delete(c.key); info.textContent = L.length + ' kasus ditampilkan' + (sel.size ? ' · ' + sel.size + ' dipilih' : ''); } }) : null;
        const n = c.panel.panelis.length || (c.panel.nama || []).length;
        grid.appendChild(h('a', { class: 'mort-card' + (c.beda ? ' beda' : '') + (c.panel.status === 'Konsensus' ? ' done' : ''), href: '#/kematian/' + encodeURIComponent(c.key) },
          h('div', { class: 'mc-top' }, cb, h('b', null, c.key), h('span', { class: 'grow' }), stBadge(c.panel.status)),
          h('div', { class: 'small' }, [c.fac_name || c.fac, c.kk_name].filter(Boolean).join(' · ')),
          h('div', { class: 'small muted' }, [c.umur ? c.umur + ' th' : '', c.jk, c.tgl_mati ? 'meninggal ' + c.tgl_mati : ''].filter(Boolean).join(' · ') || '–'),
          c.sebab ? h('div', { class: 'mc-cause' }, c.sebab.length > 140 ? c.sebab.slice(0, 140) + '…' : c.sebab) : null,
          h('div', { class: 'mc-chips' }, c.sumber.map(s => chip(s)), c.beda ? chip('berbeda', 'danger') : null, c.terbatas ? chip('data terbatas', 'warn') : null),
          h('div', { class: 'mc-foot small' }, n ? 'Panel ' + c.panel.dikirim + '/' + n + ' mengirim' : 'Belum ada panelis', c.saya ? h('b', { class: 'mc-me' }, ' · Saya: ' + c.saya) : (c.panel.panelis.includes(RCA.state.user.email) ? h('b', { class: 'mc-me todo' }, ' · Saya: belum') : null))));
      });
    };
    [[q, 'input', 'q'], [sP, 'change', 'prov'], [sK, 'change', 'kk'], [sS, 'change', 'st'], [sR, 'change', 'src']].forEach(([el, ev, k]) => el.addEventListener(ev, () => { f[k] = el.value; draw(); }));
    const tools = h('div', { class: 'row no-print' },
      isK ? h('button', { class: 'btn primary', type: 'button', onclick: () => assign([...sel], R.panelis) }, 'Tugaskan panelis') : null,
      h('button', { class: 'btn', type: 'button', onclick: () => RCA.mortx.bulk(shown(), 'excel') }, 'Unduh Excel (semua kasus tampil)'),
      h('button', { class: 'btn', type: 'button', onclick: () => RCA.mortx.bulk(shown(), 'pdf') }, 'Unduh PDF (semua kasus tampil)'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => RCA.mortx.importDialog() }, 'Unggah penilaian dari Excel'));
    box.appendChild(h('div', { class: 'mort-filters' }, q, sP, sK, sS, sR));
    box.appendChild(h('div', { class: 'row', style: { justifyContent: 'space-between', margin: '8px 0' } }, info, tools));
    box.appendChild(grid); draw();
    async function assign(keys, people) {
      if (!keys.length) return RCA.toast('Centang dulu kasus yang akan ditugaskan.', 'info');
      if (!people.length) return RCA.toast('Belum ada akun Panelis yang aktif. Minta panelis mendaftar dengan peran Panelis, lalu setujui di Admin.', 'info', 8000);
      const cur = C.find(c => c.key === keys[0]) || { panel: { panelis: [], ketua: '' } };
      const cbs = people.map(p => h('label', { class: 'row', style: { gap: '8px' } }, h('input', { type: 'checkbox', value: p.email, checked: cur.panel.panelis.includes(p.email) || null }), p.name + ' · ' + p.role + (p.code ? ' · ' + p.code : '')));
      const ket = h('select', { 'aria-label': 'Ketua panel' }, h('option', { value: '' }, '— pilih ketua panel —'), people.map(p => h('option', { value: p.email, selected: cur.panel.ketua === p.email || null }, p.name)));
      const ok = await RCA.modal('Tugaskan panelis untuk ' + keys.length + ' kasus', h('div', { class: 'stack' }, h('p', { class: 'muted' }, keys.join(', ')), h('b', null, 'Panelis'), h('div', { class: 'stack' }, cbs), h('label', { class: 'field' }, h('span', { class: 'lbl' }, 'Ketua panel (menyusun kesimpulan konsensus)'), ket),
        h('p', { class: 'small muted' }, 'Penugasan menggantikan daftar panelis sebelumnya untuk kasus yang dipilih. Penilaian yang sudah diisi tidak terhapus.')), [{ label: 'Batal', value: false }, { label: 'Simpan penugasan', value: true, cls: 'primary' }]);
      if (!ok) return;
      const pan = cbs.map(l => l.querySelector('input')).filter(x => x.checked).map(x => x.value);
      try { const r = await RCA.api('mort.assign', { keys, panelis: pan, ketua: ket.value }); RCA.toast(r.n + ' kasus ditugaskan', 'ok'); M.page(main); } catch (e) { RCA.toast(e.message, 'err'); }
    }
  };
})();
