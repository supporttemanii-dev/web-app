/* =====================================================================
 *  CBT UAS HIV/AIDS & IMS — Dashboard Dosen
 * ===================================================================== */
(function () {
  'use strict';
  const CFG = window.CBT_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const TZ = 'Asia/Makassar';
  const D = { pass: '', data: null, offset: 0, timer: null, clock: null, showKode: false, mapSel: null, vFilter: '' };
  const now = () => Date.now() + D.offset;

  const JENIS = {
    PINDAH_TAB: ['Pindah tab / minimize', 'b-red'],
    FOKUS_HILANG: ['Fokus pindah ke aplikasi lain', 'b-red'],
    KELUAR_LAYAR_PENUH: ['Keluar layar penuh', 'b-yellow'],
    PINTASAN: ['Tombol pintasan terlarang', 'b-yellow'],
    SALIN_TEMPEL: ['Salin / tempel', 'b-yellow'],
    UKURAN_JENDELA: ['Jendela diperkecil / split', 'b-yellow'],
    LOGIN_ULANG: ['Login ulang / perangkat lain', 'b-red'],
    INFO_PERANGKAT: ['Info perangkat', 'b-gray'],
    INFO_RESET_DOSEN: ['Direset dosen', 'b-gray']
  };
  const jenisBadge = (j) => { const x = JENIS[j] || [j, 'b-gray']; return '<span class="badge ' + x[1] + '">' + esc(x[0]) + '</span>'; };

  /* ------------------------------ util ------------------------------ */
  async function api(action, data) {
    const t0 = Date.now();
    const res = await fetch(CFG.API_URL, {
      method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action, password: D.pass }, data || {}))
    });
    const j = await res.json();
    if (j.serverNow) D.offset = j.serverNow - Math.round((t0 + Date.now()) / 2);
    if (!j.ok) { const e = new Error(j.msg); e.code = j.code; throw e; }
    return j;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const pad = (n) => String(n).padStart(2, '0');
  function fmtTime(ms, sec) {
    if (!ms) return '–';
    const o = { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false };
    if (sec) o.second = '2-digit';
    return new Intl.DateTimeFormat('id-ID', o).format(new Date(ms)).replace(/\./g, ':');
  }
  function fmtDate(ms) { return new Intl.DateTimeFormat('id-ID', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ms)); }
  function ago(ms) {
    if (!ms) return '–';
    const s = Math.max(0, Math.round((now() - ms) / 1000));
    if (s < 60) return s + ' dtk lalu';
    if (s < 3600) return Math.floor(s / 60) + ' mnt lalu';
    return fmtTime(ms);
  }
  const nf = (v) => v == null || v === '' ? '–' : Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
  function toast(msg) { const t = $('toast'); t.textContent = msg; t.classList.remove('hidden'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.add('hidden'), 3500); }
  function loading(on, txt) { $('ov-loading').classList.toggle('hidden', !on); if (txt) $('loading-text').textContent = txt; }

  /* ------------------------------ login ------------------------------ */
  async function login(ev) {
    if (ev) ev.preventDefault();
    D.pass = D.pass || $('d-pass').value;
    $('d-login-err').classList.add('hidden');
    $('d-btn-login').disabled = true;
    try {
      await refresh(true);
      sessionStorage.setItem('cbt_dosen_pass', D.pass);
      $('d-login').classList.add('hidden'); $('d-main').classList.remove('hidden'); $('d-who').classList.remove('hidden');
      clearInterval(D.timer); D.timer = setInterval(() => refresh(false), CFG.DASHBOARD_REFRESH_MS || 10000);
      clearInterval(D.clock); D.clock = setInterval(tickClock, 1000); tickClock();
    } catch (e) {
      D.pass = ''; sessionStorage.removeItem('cbt_dosen_pass');
      $('d-login-err').textContent = e.message || 'Gagal terhubung ke server.'; $('d-login-err').classList.remove('hidden');
    } finally { $('d-btn-login').disabled = false; }
  }

  async function refresh(throwErr) {
    try {
      const j = await api('dosenDashboard');
      D.data = j;
      render();
      $('d-updated').textContent = 'Diperbarui otomatis tiap ' + Math.round((CFG.DASHBOARD_REFRESH_MS || 10000) / 1000) + ' detik · terakhir ' + fmtTime(now(), true) + ' WITA';
    } catch (e) {
      if (throwErr) throw e;
      $('d-updated').innerHTML = '<span style="color:var(--red)">Gagal memuat data (' + esc(e.message) + '). Mencoba lagi…</span>';
    }
  }

  function tickClock() {
    if (!D.data) return;
    $('d-clock').textContent = fmtTime(now(), true) + ' WITA';
    const s = D.data.start, e = D.data.end, t = now();
    let txt;
    if (t < s) txt = 'Dimulai dalam ' + dur(s - t);
    else if (t <= e) txt = 'Sisa waktu ' + dur(e - t);
    else txt = 'Ujian telah berakhir';
    $('d-left').textContent = txt;
  }
  function dur(ms) { const x = Math.floor(ms / 1000); return pad(Math.floor(x / 3600)) + ':' + pad(Math.floor(x % 3600 / 60)) + ':' + pad(x % 60); }

  /* ------------------------------ render ------------------------------ */
  function derivedStatus(s) {
    if (s.status === 'MENGERJAKAN' && !s.online) return 'OFFLINE';
    return s.status;
  }
  function statusBadge(s) {
    const st = derivedStatus(s);
    const m = {
      'BELUM LOGIN': ['Belum login', 'b-gray'], MENUNGGU: ['Ruang tunggu', 'b-blue'],
      MENGERJAKAN: ['Mengerjakan', 'b-green'], OFFLINE: ['Mengerjakan (offline)', 'b-yellow'], SELESAI: ['Selesai', 'b-blue']
    }[st] || [st, 'b-gray'];
    return '<span class="badge ' + m[1] + '">' + m[0] + '</span>';
  }

  function render() {
    const d = D.data, S = d.students;
    $('d-title').textContent = 'Dashboard Dosen — ' + d.examName;
    $('d-jadwal').textContent = fmtDate(d.start) + ', ' + fmtTime(d.start) + '–' + fmtTime(d.end) + ' WITA';
    $('d-kode').textContent = D.showKode ? d.kode : '••••••';
    $('d-uji').classList.toggle('hidden', !d.uji);

    const c = { total: S.length, belum: 0, tunggu: 0, kerja: 0, off: 0, selesai: 0 };
    S.forEach((s) => {
      const st = derivedStatus(s);
      if (st === 'BELUM LOGIN') c.belum++; else if (st === 'MENUNGGU') c.tunggu++;
      else if (st === 'MENGERJAKAN') c.kerja++; else if (st === 'OFFLINE') c.off++; else if (st === 'SELESAI') c.selesai++;
    });
    const vTotal = d.logs.filter((l) => !/^INFO/.test(l.jenis)).length;
    const done = S.filter((s) => s.status === 'SELESAI' && s.nilai != null);
    const avg = done.length ? done.reduce((a, s) => a + s.nilai, 0) / done.length : null;
    const stat = (v, l, color) => '<div class="stat"><div class="v" style="color:' + (color || 'var(--navy)') + '">' + v + '</div><div class="l">' + l + '</div></div>';
    $('d-stats').innerHTML =
      stat(c.total, 'Peserta terdaftar') + stat(c.belum, 'Belum login', '#6b7280') + stat(c.tunggu, 'Di ruang tunggu', 'var(--blue)') +
      stat(c.kerja, 'Sedang mengerjakan', 'var(--green)') + stat(c.off, 'Mengerjakan, offline', '#b07800') +
      stat(c.selesai, 'Selesai', 'var(--navy)') + stat(vTotal, 'Total pelanggaran', 'var(--red)');
    $('tab-viol-n').textContent = vTotal;

    renderMonitor(); renderMap(); renderViol(); renderRank(done, avg);
  }

  function renderMonitor() {
    const d = D.data;
    const q = $('f-q').value.trim().toLowerCase(), fs = $('f-status').value, sort = $('f-sort').value;
    let L = d.students.filter((s) => {
      if (q && (s.nama + ' ' + s.nim).toLowerCase().indexOf(q) < 0) return false;
      if (!fs) return true;
      if (fs === 'VIOL') return s.viol > 0;
      if (fs === 'MENGERJAKAN') return s.status === 'MENGERJAKAN';
      return derivedStatus(s) === fs;
    });
    const by = {
      nama: (a, b) => a.nama.localeCompare(b.nama, 'id', { numeric: true }),
      viol: (a, b) => (b.viol || 0) - (a.viol || 0),
      prog: (a, b) => (a.answered || 0) - (b.answered || 0),
      nilai: (a, b) => (b.nilai == null ? -1 : b.nilai) - (a.nilai == null ? -1 : a.nilai)
    }[sort];
    L.sort(by);
    $('f-count').textContent = L.length + ' dari ' + d.students.length + ' peserta';
    $('m-body').innerHTML = L.map((s, i) => {
      const pct = Math.round(((s.answered || 0) / d.total) * 100);
      const conn = s.status === 'BELUM LOGIN' || s.status === 'SELESAI' ? '–'
        : '<span class="dot ' + (s.online ? 'on' : 'off') + '"></span> ' + (s.online ? (s.vis === 'hidden' ? 'Tab tersembunyi' : (s.vis === 'nofs' ? 'Online (tanpa FS)' : 'Online')) : 'Offline');
      const pos = s.status === 'MENGERJAKAN' ? '<b>No. ' + ((s.pos || 0) + 1) + '</b>' + (s.qid ? ' <span class="muted">(ID ' + s.qid + ')</span>' : '') : '–';
      const prog = s.status && s.status !== 'BELUM LOGIN' && s.status !== 'MENUNGGU'
        ? '<div style="display:flex;align-items:center;gap:8px"><div class="progress"><i style="width:' + pct + '%"></i></div><span style="font-size:12px">' + (s.answered || 0) + '/' + d.total + '</span></div>' : '–';
      const viol = s.viol ? '<button class="link" style="color:var(--red)" data-viol="' + esc(s.nim) + '">' + s.viol + ' kali</button>' : (s.status === 'BELUM LOGIN' ? '–' : '0');
      let aksi = '';
      if (s.status === 'MENGERJAKAN') aksi += '<button class="btn btn-warn btn-sm" data-fin="' + esc(s.nim) + '">Kumpulkan</button> ';
      if (s.status && s.status !== 'BELUM LOGIN') aksi += '<button class="btn btn-ghost btn-sm" data-reset="' + esc(s.nim) + '" title="Hapus sesi agar mahasiswa dapat mengulang dari awal">Reset</button>';
      return '<tr><td>' + (i + 1) + '</td><td>' + esc(s.nim) + '</td><td>' + esc(s.nama) + '</td><td>' + statusBadge(s) + '</td><td style="white-space:nowrap">' + conn + '</td>' +
        '<td>' + pos + '</td><td>' + prog + '</td><td>' + (s.ragu || (s.status === 'MENGERJAKAN' ? 0 : '–')) + '</td><td>' + viol + '</td>' +
        '<td style="white-space:nowrap">' + (s.status === 'BELUM LOGIN' ? '–' : ago(s.lastSeen)) + '</td><td><b>' + nf(s.nilai) + '</b></td><td style="white-space:nowrap">' + aksi + '</td></tr>';
    }).join('') || '<tr><td colspan="12" class="muted">Tidak ada data.</td></tr>';
  }

  function renderMap() {
    const d = D.data;
    const at = {};
    d.students.filter((s) => s.status === 'MENGERJAKAN' && s.qid).forEach((s) => { (at[s.qid] = at[s.qid] || []).push(s); });
    let html = '';
    for (let id = 1; id <= d.total; id++) {
      const L = at[id] || [];
      const names = L.map((s) => s.nama + ' (' + s.nim + ')').join('\n');
      html += '<div class="qcell ' + (L.length ? 'has' : '') + (L.length >= 3 ? ' hot' : '') + '" data-q="' + id + '" title="' + esc(names || 'Tidak ada') + '"><div class="id">Soal ID ' + id + '</div><div class="n">' + L.length + '</div></div>';
    }
    $('qmap').innerHTML = html;
    if (D.mapSel) showMapDetail(D.mapSel, at);
    D._at = at;
  }
  function showMapDetail(id, at) {
    const L = (at || D._at || {})[id] || [];
    $('qmap-detail').innerHTML = '<b>Soal ID ' + id + '</b> — ' + (L.length ? L.map((s) => esc(s.nama) + ' <span class="muted">(' + esc(s.nim) + ', No. ' + (s.pos + 1) + ')</span>').join(', ') : 'tidak ada mahasiswa yang sedang membuka soal ini.');
  }

  function renderViol() {
    const logs = D.data.logs;
    const f = D.vFilter.toLowerCase();
    const L = logs.filter((l) => !f || (l.nim + ' ' + l.nama).toLowerCase().indexOf(f) >= 0);
    $('v-body').innerHTML = L.map((l) => '<tr><td style="white-space:nowrap">' + fmtTime(l.t, true) + '</td><td>' + esc(l.nim) + '</td><td>' + esc(l.nama) + '</td><td>' + jenisBadge(l.jenis) +
      '</td><td style="font-size:12px">' + esc(l.detail) + '</td><td>' + (l.pos || '–') + '</td></tr>').join('') || '<tr><td colspan="6" class="muted">Belum ada pelanggaran tercatat.</td></tr>';
    const per = {}, perMhs = {};
    logs.filter((l) => !/^INFO/.test(l.jenis)).forEach((l) => {
      per[l.jenis] = (per[l.jenis] || 0) + 1;
      const k = l.nim; perMhs[k] = perMhs[k] || { nama: l.nama, nim: l.nim, n: 0 }; perMhs[k].n++;
    });
    $('v-sum').innerHTML = Object.keys(per).sort((a, b) => per[b] - per[a]).map((k) => '<div class="feed-item" style="justify-content:space-between">' + jenisBadge(k) + '<b>' + per[k] + '</b></div>').join('') || '<div class="feed-item muted">Belum ada.</div>';
    $('v-top').innerHTML = Object.values(perMhs).sort((a, b) => b.n - a.n).slice(0, 15).map((m) =>
      '<div class="feed-item" style="justify-content:space-between"><span><button class="link" data-viol="' + esc(m.nim) + '">' + esc(m.nama) + '</button> <span class="muted">' + esc(m.nim) + '</span></span><b style="color:var(--red)">' + m.n + '</b></div>').join('') || '<div class="feed-item muted">Belum ada.</div>';
  }

  function renderRank(done, avg) {
    const L = done.slice().sort((a, b) => b.nilai - a.nilai || (a.selesai || 0) - (b.selesai || 0));
    let lastV = null, lastR = 0;
    L.forEach((s, i) => { if (s.nilai !== lastV) { lastR = i + 1; lastV = s.nilai; } s._rank = lastR; });
    const maxV = L.length ? L[0].nilai : null, minV = L.length ? L[L.length - 1].nilai : null;
    $('rk-max').textContent = 'Tertinggi: ' + nf(maxV); $('rk-min').textContent = 'Terendah: ' + nf(minV); $('rk-avg').textContent = 'Rata-rata: ' + nf(avg);
    $('rk-body').innerHTML = L.map((s) => {
      const top = s.nilai === maxV, low = s.nilai === minV && maxV !== minV;
      return '<tr class="' + (top ? 'top' : '') + (low ? ' low' : '') + '"><td><span class="rank-badge ' + (s._rank <= 3 ? 'rank-' + s._rank : '') + '">' + s._rank + '</span></td><td>' + esc(s.nama) + '</td><td>' + esc(s.nim) + '</td><td>' + (s.benar === '' ? '–' : s.benar) +
        '</td><td><b>' + nf(s.nilai) + '</b></td><td>' + (s.viol || 0) + '</td><td style="font-size:12px">' + esc(s.cara || '') + '</td><td>' + (top ? '<span class="badge b-green">Tertinggi</span>' : (low ? '<span class="badge b-red">Terendah</span>' : '')) + '</td></tr>';
    }).join('') || '<tr><td colspan="8" class="muted">Belum ada mahasiswa yang mengumpulkan.</td></tr>';
  }

  /* ------------------------------ aksi ------------------------------ */
  async function finalize(nim) {
    const s = D.data.students.find((x) => x.nim === nim);
    if (!confirm('Kumpulkan paksa jawaban ' + (s ? s.nama : nim) + '?\nNilai dihitung dari jawaban terakhir yang tersimpan otomatis.')) return;
    loading(true, 'Mengumpulkan…');
    try { await api('dosenFinalize', { nim: nim }); toast('Jawaban ' + (s ? s.nama : nim) + ' telah dikumpulkan.'); await refresh(); }
    catch (e) { alert(e.message); } finally { loading(false); }
  }
  async function finalizeAll() {
    const n = D.data.students.filter((s) => s.status === 'MENGERJAKAN').length;
    if (!n) return toast('Tidak ada mahasiswa yang masih mengerjakan.');
    if (!confirm('Kumpulkan paksa ' + n + ' mahasiswa yang masih berstatus MENGERJAKAN?\nGunakan ini setelah waktu ujian berakhir. Nilai dihitung dari autosave terakhir.')) return;
    loading(true, 'Mengumpulkan ' + n + ' peserta…');
    try { const j = await api('dosenFinalize', { all: true }); toast(j.count + ' peserta telah dikumpulkan.'); await refresh(); }
    catch (e) { alert(e.message); } finally { loading(false); }
  }
  async function reset(nim) {
    const s = D.data.students.find((x) => x.nim === nim);
    if (!confirm('RESET sesi ' + (s ? s.nama : nim) + '?\nSeluruh jawaban & nilainya akan DIHAPUS dan mahasiswa harus mengulang dari awal.\nGunakan hanya untuk kendala teknis.')) return;
    if (!confirm('Konfirmasi sekali lagi: hapus data ujian ' + (s ? s.nama : nim) + '?')) return;
    loading(true, 'Mereset…');
    try { await api('dosenReset', { nim: nim }); toast('Sesi ' + (s ? s.nama : nim) + ' direset.'); await refresh(); }
    catch (e) { alert(e.message); } finally { loading(false); }
  }

  async function exportExcel() {
    if (typeof XLSX === 'undefined') return alert('Pustaka Excel (SheetJS) gagal dimuat. Periksa koneksi internet lalu muat ulang halaman.');
    loading(true, 'Menyiapkan file Excel…');
    try {
      const j = await api('dosenExport');
      const wb = XLSX.utils.book_new();
      const add = (rows, name, widths) => {
        const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Info: 'Belum ada data' }]);
        if (widths) ws['!cols'] = widths.map((w) => ({ wch: w }));
        XLSX.utils.book_append_sheet(wb, ws, name);
      };
      add(j.rekap, 'Rekap Nilai', [5, 14, 30, 8, 14, 7, 7, 8, 8, 12, 20, 20, 10, 30, 40]);
      let lv = null, lr = 0;
      const sorted = j.rekap.filter((r) => r.Nilai !== '').sort((a, b) => b.Nilai - a.Nilai).map((r, i) => ({ Peringkat: (r.Nilai !== lv ? (lr = i + 1, lv = r.Nilai) : 0, lr), NIM: r.NIM, Nama: r.Nama, Nilai: r.Nilai, Pelanggaran: r['Jumlah Pelanggaran'] }));
      add(sorted, 'Peringkat', [10, 14, 30, 8, 12]);
      add(j.butir, 'Analisis Butir', [8, 34, 7, 8, 5, 5, 5, 5, 5, 7, 7, 18, 10]);
      add(j.jawaban, 'Matriks Jawaban');
      add(j.logs, 'Log Pelanggaran', [20, 14, 28, 22, 60, 10]);
      const info = [
        { Keterangan: 'Ujian', Nilai: j.examName },
        { Keterangan: 'Diekspor', Nilai: fmtDate(now()) + ' ' + fmtTime(now(), true) + ' WITA' },
        { Keterangan: 'Matriks Jawaban', Nilai: 'Huruf kapital = benar, huruf kecil = salah, "-" = kosong. Kolom S1..S50 = ID soal di bank soal.' },
        { Keterangan: 'Indeks kesukaran', Nilai: 'p = proporsi benar; >0,70 mudah, 0,30–0,70 sedang, <0,30 sukar.' }
      ];
      add(info, 'Keterangan', [20, 100]);
      const tgl = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(now()));
      XLSX.writeFile(wb, 'Nilai_UAS_HIV_IMS_' + tgl + '.xlsx');
      toast('File Excel berhasil diunduh.');
    } catch (e) { alert('Ekspor gagal: ' + e.message); } finally { loading(false); }
  }

  /* ------------------------------ init ------------------------------ */
  function bind() {
    $('d-form').addEventListener('submit', (e) => { D.pass = ''; login(e); });
    $('d-refresh').onclick = () => refresh();
    $('d-finalize').onclick = finalizeAll;
    $('d-export').onclick = exportExcel;
    $('d-kode-toggle').onclick = () => { D.showKode = !D.showKode; $('d-kode-toggle').textContent = D.showKode ? 'sembunyikan' : 'tampilkan'; if (D.data) $('d-kode').textContent = D.showKode ? D.data.kode : '••••••'; };
    ['f-q', 'f-status', 'f-sort'].forEach((id) => $(id).addEventListener('input', () => D.data && renderMonitor()));
    $('v-q').addEventListener('input', (e) => { D.vFilter = e.target.value; renderViol(); });
    $('v-clear').onclick = () => { D.vFilter = ''; $('v-q').value = ''; renderViol(); };
    document.querySelectorAll('.tab').forEach((t) => t.onclick = () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('on', x === t));
      document.querySelectorAll('.tabpane').forEach((p) => p.classList.toggle('hidden', p.id !== t.dataset.tab));
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-fin],[data-reset],[data-viol],[data-q]');
      if (!b) return;
      if (b.dataset.fin) finalize(b.dataset.fin);
      else if (b.dataset.reset) reset(b.dataset.reset);
      else if (b.dataset.viol) {
        D.vFilter = b.dataset.viol; $('v-q').value = b.dataset.viol; renderViol();
        document.querySelector('.tab[data-tab="t-viol"]').click();
      } else if (b.dataset.q) { D.mapSel = Number(b.dataset.q); showMapDetail(D.mapSel); }
    });
  }

  bind();
  const saved = sessionStorage.getItem('cbt_dosen_pass');
  if (!CFG.API_URL || CFG.API_URL.indexOf('http') !== 0) {
    $('d-login-err').textContent = 'API_URL belum diatur di config.js.'; $('d-login-err').classList.remove('hidden');
  } else if (saved) { D.pass = saved; login(); }
})();
