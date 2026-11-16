/* =====================================================================
 *  CBT UAS HIV/AIDS & IMS — Aplikasi Mahasiswa
 * ===================================================================== */
(function () {
  'use strict';
  const CFG = window.CBT_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const TZ = 'Asia/Makassar';

  const S = {
    sess: null,            // {nim, nama, token, start, end, examName, total, peringkat}
    offset: 0,             // selisih jam server - jam perangkat (ms)
    questions: [], answers: {}, ragu: [], pos: 0,
    examActive: false, submitting: false, done: false,
    hbCount: 0, timers: {}, lastViol: {}, violCount: 0,
    fs: 17, online: true, lastSaved: null
  };
  const now = () => Date.now() + S.offset;

  const VIOL_TEXT = {
    PINDAH_TAB: 'Anda meninggalkan halaman ujian (pindah tab, minimize, atau membuka aplikasi lain).',
    FOKUS_HILANG: 'Jendela ujian kehilangan fokus (kemungkinan membuka aplikasi/jendela lain).',
    KELUAR_LAYAR_PENUH: 'Anda keluar dari mode layar penuh.',
    PINTASAN: 'Anda menekan tombol pintasan yang dilarang selama ujian.',
    SALIN_TEMPEL: 'Anda mencoba menyalin/menempel teks soal.',
    UKURAN_JENDELA: 'Ukuran jendela ujian diperkecil (kemungkinan layar dibagi/split screen).'
  };

  /* ------------------------------ API ------------------------------ */
  async function api(action, data, opt) {
    opt = opt || {};
    const retries = opt.retries == null ? 2 : opt.retries;
    const body = JSON.stringify(Object.assign({ action: action }, data || {}));
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try {
        const t0 = Date.now();
        const res = await fetch(CFG.API_URL, {
          method: 'POST', body: body, redirect: 'follow', keepalive: !!opt.keepalive,
          headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const j = await res.json();
        const t1 = Date.now();
        if (j.serverNow) S.offset = j.serverNow - Math.round((t0 + t1) / 2);
        setOnline(true);
        if (!j.ok) { const e = new Error(j.msg || 'Terjadi kesalahan.'); e.code = j.code; e.data = j; e.server = true; throw e; }
        return j;
      } catch (e) {
        lastErr = e;
        if (e.server) throw e;
        setOnline(false);
        if (i < retries) await sleep(800 * (i + 1) + Math.random() * 600);
      }
    }
    const e = new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    e.network = true; e.cause = lastErr;
    throw e;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* --------------------------- UTILITIES --------------------------- */
  const pad = (n) => String(n).padStart(2, '0');
  function fmtClock(ms) {
    if (ms < 0) ms = 0;
    const s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
  }
  function fmtTime(ms, withDate) {
    const o = { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false };
    if (withDate) Object.assign(o, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return new Intl.DateTimeFormat('id-ID', o).format(new Date(ms)).replace(/\./g, ':');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function show(id) { ['screen-login', 'screen-wait', 'screen-exam', 'screen-result'].forEach((s) => $(s).classList.toggle('hidden', s !== id)); window.scrollTo(0, 0); }
  function toast(msg, ms) {
    const t = $('toast'); t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(S.timers.toast); S.timers.toast = setTimeout(() => t.classList.add('hidden'), ms || 3000);
  }
  function loading(on, txt) { $('ov-loading').classList.toggle('hidden', !on); if (txt) $('loading-text').textContent = txt; }
  function message(title, text, buttons, icon) {
    $('msg-title').textContent = title; $('msg-text').innerHTML = text; $('msg-icon').textContent = icon || 'ℹ️';
    const a = $('msg-actions'); a.innerHTML = '';
    (buttons || [{ label: 'Tutup', cls: 'btn-primary' }]).forEach((b) => {
      const el = document.createElement('button'); el.className = 'btn ' + (b.cls || 'btn-ghost'); el.textContent = b.label;
      el.onclick = () => { $('ov-msg').classList.add('hidden'); if (b.fn) b.fn(); };
      a.appendChild(el);
    });
    $('ov-msg').classList.remove('hidden');
  }
  function setOnline(on) {
    if (S.online === on) return;
    S.online = on;
    $('net-banner').classList.toggle('hidden', on || !S.examActive);
    updateSaveState();
  }
  function updateSaveState() {
    const dot = $('net-dot');
    dot.className = 'dot ' + (S.online ? 'on' : 'off');
    $('save-txt').textContent = S.online
      ? (S.lastSaved ? 'Tersimpan otomatis ' + fmtTime(S.lastSaved).slice(0, 5) + ' WITA' : 'Terhubung ke server')
      : 'Offline — tersimpan di perangkat';
  }

  /* --------------------------- PENYIMPANAN LOKAL --------------------------- */
  const LS_SESS = 'cbt_hiv_sess';
  const lsAnsKey = () => 'cbt_hiv_ans_' + (S.sess ? S.sess.nim : '');
  function saveSess() { try { localStorage.setItem(LS_SESS, JSON.stringify(S.sess)); } catch (e) {} }
  function loadSess() { try { return JSON.parse(localStorage.getItem(LS_SESS) || 'null'); } catch (e) { return null; } }
  function saveLocal() { try { localStorage.setItem(lsAnsKey(), JSON.stringify({ a: S.answers, r: S.ragu, p: S.pos })); } catch (e) {} }
  function loadLocal() { try { return JSON.parse(localStorage.getItem(lsAnsKey()) || 'null'); } catch (e) { return null; } }
  function clearAll() { try { localStorage.removeItem(lsAnsKey()); localStorage.removeItem(LS_SESS); } catch (e) {} }

  /* ------------------------------ LOGIN ------------------------------ */
  async function loadInfo() {
    $('inst-name').textContent = CFG.NAMA_INSTITUSI || '';
    if (!CFG.API_URL || CFG.API_URL.indexOf('http') !== 0) {
      $('hero-sched').innerHTML = '<b>API_URL belum diatur.</b><br>Isi URL Web App pada file config.js.';
      return;
    }
    try {
      const j = await api('info', {}, { retries: 1 });
      document.title = 'CBT ' + j.nama;
      $('tb-title').textContent = j.nama; $('hero-title').textContent = j.nama;
      $('hero-sched').innerHTML = '<b>' + esc(fmtTime(j.start, true)) + '</b><br>Pukul ' + fmtTime(j.start) + ' – ' + fmtTime(j.end) +
        ' WITA · ' + j.total + ' soal' + (j.uji ? '<br><span class="badge b-yellow" style="margin-top:6px">MODE UJI COBA AKTIF</span>' : '');
    } catch (e) { $('hero-sched').textContent = 'Jadwal tidak dapat dimuat: ' + e.message; }
  }

  async function onLogin(ev) {
    ev.preventDefault();
    const nim = $('in-nim').value.trim(), kode = $('in-kode').value.trim();
    $('login-err').classList.add('hidden');
    if (!nim || !kode) return;
    const btn = $('btn-login'); btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Memeriksa…';
    try {
      const j = await api('login', { nim: nim, kode: kode, ua: navigator.userAgent });
      S.sess = { nim: j.nim, nama: j.nama, token: j.token, start: j.start, end: j.end, examName: j.examName, total: j.total, peringkat: j.peringkat, uji: j.uji };
      saveSess();
      if (j.done) { showResult(j); return; }
      showWait();
    } catch (e) {
      $('login-err').textContent = e.message; $('login-err').classList.remove('hidden');
    } finally { btn.disabled = false; btn.textContent = 'Masuk'; }
  }

  /* --------------------------- RUANG TUNGGU --------------------------- */
  function showWait() {
    const s = S.sess;
    $('w-nama').textContent = s.nama; $('w-nim').textContent = s.nim; $('w-ujian').textContent = s.examName;
    $('w-total').textContent = s.total + ' soal pilihan ganda (A–E)';
    $('w-jadwal').textContent = fmtTime(s.start, true) + ', ' + fmtTime(s.start) + '–' + fmtTime(s.end) + ' WITA';
    setHeader(true);
    show('screen-wait');
    const resume = !!loadLocal();
    $('btn-start').textContent = resume ? 'Lanjutkan Ujian' : 'Mulai Ujian';
    clearInterval(S.timers.wait);
    const tick = () => {
      const left = s.start - now();
      const ready = left <= 0 || s.uji;
      $('wait-area').classList.toggle('hidden', ready);
      $('w-countdown').textContent = fmtClock(left);
      $('btn-start').disabled = !ready;
      if (now() > s.end) { $('btn-start').disabled = true; $('wait-err').textContent = 'Waktu ujian telah berakhir.'; $('wait-err').classList.remove('hidden'); }
    };
    tick(); S.timers.wait = setInterval(tick, 500);
  }

  function setHeader(on) {
    $('tb-who').classList.toggle('hidden', !on);
    if (on && S.sess) { $('tb-nama').textContent = S.sess.nama; $('tb-nim').textContent = 'NIM ' + S.sess.nim; $('tb-title').textContent = S.sess.examName; }
  }

  async function requestFS() {
    const el = document.documentElement;
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) { /* diabaikan; dicatat oleh detektor */ }
  }
  const fsSupported = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
  const isFS = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

  async function onStart() {
    $('wait-err').classList.add('hidden');
    await requestFS();
    loading(true, 'Menyiapkan soal…');
    try {
      const j = await api('questions', { nim: S.sess.nim, token: S.sess.token }, { retries: 3 });
      clearInterval(S.timers.wait);
      startExam(j);
    } catch (e) {
      if (document.exitFullscreen && isFS()) document.exitFullscreen().catch(() => {});
      if (e.code === 'SELESAI') return fetchResultAfterDone();
      if (e.code === 'SESI' || e.code === 'SESI_GANDA') { clearAll(); return message('Sesi Berakhir', esc(e.message), [{ label: 'Login Ulang', cls: 'btn-primary', fn: () => location.reload() }], '🔒'); }
      $('wait-err').textContent = e.message; $('wait-err').classList.remove('hidden');
    } finally { loading(false); }
  }

  /* ------------------------------ UJIAN ------------------------------ */
  function startExam(j) {
    S.questions = j.questions;
    S.sess.end = j.end; S.sess.uji = j.uji; saveSess();
    const local = loadLocal();
    S.answers = Object.assign({}, j.answers || {}, local ? local.a : {});
    S.ragu = Array.from(new Set([].concat(j.ragu || [], local ? local.r : [])));
    S.pos = Math.min(local ? local.p : (j.pos || 0), S.questions.length - 1);
    S.examActive = true; S.done = false;
    $('q-total').textContent = S.questions.length;
    buildNav(); render(); buildWatermark();
    show('screen-exam'); setHeader(true);
    $('tb-timer').classList.remove('hidden');
    clearInterval(S.timers.clock); S.timers.clock = setInterval(tickTimer, 500); tickTimer();
    clearInterval(S.timers.hb); S.timers.hb = setInterval(heartbeat, CFG.HEARTBEAT_MS || 15000);
    heartbeat();
    if (!fsSupported()) report('INFO_PERANGKAT', 'Perangkat tidak mendukung layar penuh: ' + navigator.userAgent.slice(0, 120));
    else if (!isFS()) setTimeout(() => { if (S.examActive && !isFS()) violation('KELUAR_LAYAR_PENUH', 'Ujian dibuka tanpa layar penuh'); }, 1500);
    history.pushState(null, '', location.href);
  }

  function buildWatermark() {
    const t = (S.sess.nim + ' · ' + S.sess.nama + '   ').repeat(1);
    $('watermark').innerHTML = Array.from({ length: 40 }, () => '<span>' + esc(t) + '</span>').join('');
  }

  function buildNav() {
    const g = $('nav-grid'); g.innerHTML = '';
    S.questions.forEach((q, i) => {
      const b = document.createElement('button');
      b.className = 'nav-btn'; b.textContent = i + 1; b.type = 'button';
      b.onclick = () => go(i);
      g.appendChild(b);
    });
    updateNav();
  }

  function updateNav() {
    const btns = $('nav-grid').children;
    let ans = 0, ragu = 0;
    S.questions.forEach((q, i) => {
      const a = !!S.answers[q.id], r = S.ragu.indexOf(q.id) >= 0;
      if (a) ans++; if (r) ragu++;
      btns[i].className = 'nav-btn' + (r ? ' ragu' : (a ? ' ans' : '')) + (i === S.pos ? ' cur' : '');
    });
    $('s-ans').textContent = ans; $('s-ragu').textContent = ragu; $('s-empty').textContent = S.questions.length - ans;
  }

  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  function render() {
    const q = S.questions[S.pos];
    $('q-no').textContent = S.pos + 1;
    $('q-stem').textContent = q.stem;
    const box = $('q-opts'); box.innerHTML = '';
    q.opsi.forEach((o, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt' + (S.answers[q.id] === o.k ? ' sel' : '');
      b.innerHTML = '<span class="letter">' + LETTERS[i] + '</span><span>' + esc(o.t) + '</span>';
      b.onclick = () => choose(q.id, o.k);
      box.appendChild(b);
    });
    $('btn-prev').disabled = S.pos === 0;
    $('btn-next').textContent = S.pos === S.questions.length - 1 ? 'Soal Terakhir' : 'Selanjutnya ›';
    $('btn-next').disabled = S.pos === S.questions.length - 1;
    $('btn-ragu').classList.toggle('on', S.ragu.indexOf(q.id) >= 0);
    $('btn-ragu').textContent = S.ragu.indexOf(q.id) >= 0 ? '✓ Ragu-ragu' : 'Ragu-ragu';
    updateNav();
  }

  function choose(qid, k) {
    if (!S.examActive) return;
    S.answers[qid] = k; saveLocal(); render();
  }
  function go(i) {
    if (i < 0 || i >= S.questions.length) return;
    S.pos = i; saveLocal(); render();
    document.querySelector('.q-card').scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function toggleRagu() {
    const id = S.questions[S.pos].id, i = S.ragu.indexOf(id);
    if (i >= 0) S.ragu.splice(i, 1); else S.ragu.push(id);
    saveLocal(); render();
  }

  function tickTimer() {
    const left = S.sess.end - now();
    $('timer-val').textContent = fmtClock(left);
    const t = $('tb-timer');
    t.classList.toggle('warn', left <= 600000 && left > 300000);
    t.classList.toggle('danger', left <= 300000);
    if (!S.timers.w10 && left <= 600000 && left > 595000) { S.timers.w10 = 1; toast('Sisa waktu 10 menit.', 5000); }
    if (!S.timers.w5 && left <= 300000 && left > 295000) { S.timers.w5 = 1; toast('Sisa waktu 5 menit! Periksa kembali jawaban Anda.', 6000); }
    if (left <= 0 && S.examActive && !S.submitting && !S.sess.uji) submit('WAKTU_HABIS');
  }

  async function heartbeat() {
    if (!S.examActive || S.submitting) return;
    const persist = (++S.hbCount % (CFG.PERSIST_EVERY || 4)) === 0;
    const q = S.questions[S.pos];
    try {
      const j = await api('heartbeat', {
        nim: S.sess.nim, token: S.sess.token, pos: S.pos, qid: q ? q.id : '',
        answers: S.answers, ragu: S.ragu, persist: persist, vis: document.hidden ? 'hidden' : (isFS() ? 'fs' : 'nofs')
      }, { retries: 0 });
      if (j.done) return fetchResultAfterDone(true);
      if (j.end && j.end !== S.sess.end) { S.sess.end = j.end; saveSess(); toast('Waktu ujian diperbarui oleh dosen: berakhir ' + fmtTime(j.end) + ' WITA', 6000); }
      S.lastSaved = now(); updateSaveState();
    } catch (e) {
      if (e.code === 'SESI_GANDA') return sessionKicked(e.message);
    }
  }

  function sessionKicked(msg) {
    S.examActive = false;
    clearInterval(S.timers.hb); clearInterval(S.timers.clock);
    if (document.exitFullscreen && isFS()) document.exitFullscreen().catch(() => {});
    message('Sesi Dihentikan', esc(msg) + '<br><br>Jika ini bukan Anda, segera lapor ke pengawas.', [{ label: 'Muat Ulang', cls: 'btn-primary', fn: () => { localStorage.removeItem(LS_SESS); location.reload(); } }], '🔒');
  }

  /* ---------------------------- PENGUMPULAN ---------------------------- */
  function openFinish() {
    const ans = Object.keys(S.answers).filter((k) => S.questions.some((q) => String(q.id) === String(k))).length;
    const empty = S.questions.length - ans;
    $('f-ans').textContent = ans; $('f-ragu').textContent = S.ragu.length; $('f-empty').textContent = empty;
    const w = [];
    if (empty) w.push('Masih ada <b>' + empty + ' soal</b> yang belum dijawab.');
    if (S.ragu.length) w.push('Masih ada <b>' + S.ragu.length + ' soal</b> bertanda ragu-ragu.');
    $('f-warn').innerHTML = w.join('<br>'); $('f-warn').classList.toggle('hidden', !w.length);
    $('f-sure').checked = false; $('btn-f-ok').disabled = true;
    $('ov-finish').classList.remove('hidden');
  }

  async function submit(reason) {
    if (S.submitting) return;
    S.submitting = true; S.examActive = false;
    clearInterval(S.timers.hb);
    $('ov-finish').classList.add('hidden'); $('ov-violation').classList.add('hidden');
    loading(true, reason === 'WAKTU_HABIS' ? 'Waktu habis. Mengirim jawaban…' : 'Mengirim jawaban…');
    try {
      const j = await api('submit', { nim: S.sess.nim, token: S.sess.token, answers: S.answers, ragu: S.ragu, reason: reason }, { retries: 6 });
      loading(false);
      finishLocal();
      showResult(j);
    } catch (e) {
      loading(false);
      S.submitting = false;
      if (e.code === 'SESI_GANDA') return sessionKicked(e.message);
      message('Gagal Mengirim', esc(e.message) + '<br>Jawaban Anda aman tersimpan di perangkat ini. Silakan coba kirim lagi.',
        [{ label: 'Kirim Ulang', cls: 'btn-primary', fn: () => submit(reason) }], '📡');
    }
  }

  function finishLocal() {
    S.done = true; S.examActive = false;
    clearInterval(S.timers.hb); clearInterval(S.timers.clock);
    try { localStorage.removeItem(lsAnsKey()); } catch (e) {}
    $('tb-timer').classList.add('hidden'); $('net-banner').classList.add('hidden');
    if (document.exitFullscreen && isFS()) document.exitFullscreen().catch(() => {});
  }

  async function fetchResultAfterDone(byDosen) {
    finishLocal();
    loading(true, 'Mengambil hasil…');
    try {
      const j = await api('submit', { nim: S.sess.nim, token: S.sess.token, answers: {}, reason: 'CEK' }, { retries: 3 });
      showResult(j);
      if (byDosen) message('Ujian Diakhiri', 'Jawaban Anda telah dikumpulkan oleh dosen/pengawas.', null, '📋');
    } catch (e) { message('Info', esc(e.message)); } finally { loading(false); }
  }

  /* ------------------------------ HASIL ------------------------------ */
  function showResult(j) {
    S.done = true;
    setHeader(true);
    $('r-score').textContent = Number(j.nilai || 0).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    $('r-name').textContent = S.sess.nama; $('r-nim').textContent = 'NIM ' + S.sess.nim;
    $('r-benar').textContent = j.benar; $('r-salah').textContent = j.salah; $('r-kosong').textContent = j.kosong;
    show('screen-result');
    const showRank = j.peringkat !== false && S.sess.peringkat !== false;
    $('rank-card').classList.toggle('hidden', !showRank);
    if (showRank) { loadRanking(); clearInterval(S.timers.rank); S.timers.rank = setInterval(loadRanking, CFG.RANKING_REFRESH_MS || 30000); }
  }

  async function loadRanking() {
    try {
      const j = await api('ranking', { nim: S.sess.nim, token: S.sess.token }, { retries: 1 });
      if (j.hidden) { $('rank-card').classList.add('hidden'); return; }
      const L = j.list || [];
      $('rank-info').textContent = j.selesai + ' dari ' + j.total + ' mahasiswa telah mengumpulkan · diperbarui ' + fmtTime(now()) + ' WITA';
      const nf = (v) => Number(v).toLocaleString('id-ID', { maximumFractionDigits: 2 });
      if (L.length) {
        $('rank-max').textContent = 'Tertinggi: ' + nf(L[0].nilai);
        $('rank-min').textContent = 'Terendah: ' + nf(L[L.length - 1].nilai);
        $('rank-avg').textContent = 'Rata-rata: ' + nf(j.rata);
      }
      const maxV = L.length ? L[0].nilai : null, minV = L.length ? L[L.length - 1].nilai : null;
      const me = L.find((x) => x.nim === S.sess.nim);
      $('r-rank').textContent = me ? me.rank + ' / ' + L.length : '–';
      $('rank-body').innerHTML = L.map((x) => {
        const isTop = x.nilai === maxV, isLow = x.nilai === minV && L.length > 1 && maxV !== minV;
        const cls = [x.nim === S.sess.nim ? 'me' : '', isTop ? 'top' : '', isLow ? 'low' : ''].join(' ');
        const ket = isTop ? '<span class="badge b-green">Tertinggi</span>' : (isLow ? '<span class="badge b-red">Terendah</span>' : '');
        return '<tr class="' + cls + '"><td><span class="rank-badge ' + (x.rank <= 3 ? 'rank-' + x.rank : '') + '">' + x.rank + '</span></td>' +
          '<td>' + esc(x.nama) + (x.nim === S.sess.nim ? ' <span class="badge b-blue">Anda</span>' : '') + '</td><td>' + esc(x.nim) + '</td>' +
          '<td><b>' + nf(x.nilai) + '</b></td><td>' + ket + '</td></tr>';
      }).join('') || '<tr><td colspan="5" class="muted">Belum ada data.</td></tr>';
    } catch (e) { $('rank-info').textContent = 'Peringkat belum dapat dimuat (' + e.message + '). Mencoba lagi…'; }
  }

  /* ------------------------ DETEKSI PELANGGARAN ------------------------ */
  function report(jenis, detail) {
    if (!S.sess) return Promise.resolve();
    return api('violation', { nim: S.sess.nim, token: S.sess.token, jenis: jenis, detail: detail, pos: S.pos }, { retries: 2, keepalive: true })
      .then((j) => { if (j && j.count != null && !/^INFO/.test(jenis)) { S.violCount = j.count; updateViolCount(); } })
      .catch(() => {});
  }
  function violation(jenis, detail) {
    if (!S.examActive || S.submitting) return;
    const t = Date.now();
    if (S.lastViol[jenis] && t - S.lastViol[jenis] < 3000) return;
    // satu kejadian sering memicu beberapa event (blur + hidden + exit FS): gabungkan dalam 1,5 detik
    if (S.lastViol._any && t - S.lastViol._any < 1500) return;
    S.lastViol[jenis] = t; S.lastViol._any = t;
    S.violCount++;
    report(jenis, detail);
    $('viol-text').textContent = VIOL_TEXT[jenis] || 'Aktivitas mencurigakan terdeteksi.';
    updateViolCount();
    $('ov-violation').classList.remove('hidden');
  }
  function updateViolCount() {
    $('viol-count').innerHTML = 'Tercatat sebagai <b>pelanggaran ke-' + S.violCount + '</b> dan langsung terlihat di dashboard dosen.';
  }

  function bindGuards() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) violation('PINDAH_TAB', 'Halaman ujian tersembunyi (tab lain/minimize)');
    });
    window.addEventListener('blur', () => {
      setTimeout(() => {
        if (S.examActive && !document.hidden && !document.hasFocus()) violation('FOKUS_HILANG', 'Fokus jendela berpindah ke aplikasi/jendela lain');
      }, 400);
    });
    const onFs = () => { if (S.examActive && !isFS() && fsSupported()) violation('KELUAR_LAYAR_PENUH', 'Keluar dari mode layar penuh'); };
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);

    document.addEventListener('contextmenu', (e) => { if (S.examActive) e.preventDefault(); });
    ['copy', 'cut', 'paste'].forEach((ev) => document.addEventListener(ev, (e) => {
      if (!S.examActive) return;
      e.preventDefault(); violation('SALIN_TEMPEL', 'Percobaan ' + ev);
    }));
    document.addEventListener('dragstart', (e) => { if (S.examActive) e.preventDefault(); });

    document.addEventListener('keydown', (e) => {
      if (!S.examActive) return;
      const k = (e.key || '').toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const banned = k === 'f12' || k === 'printscreen' ||
        (ctrl && e.shiftKey && ['i', 'j', 'c', 'k', 's'].indexOf(k) >= 0) ||
        (ctrl && ['c', 'v', 'x', 'u', 's', 'p', 'a', 'f', 'g', 't', 'n', 'w', 'r', 'h', 'j', 'd', 'o', 'l', 'tab'].indexOf(k) >= 0) ||
        (e.altKey && ['tab', 'arrowleft', 'arrowright', 'f4', 'd'].indexOf(k) >= 0) ||
        k === 'f5' || k === 'f11' || k === 'contextmenu';
      if (banned) {
        e.preventDefault(); e.stopPropagation();
        violation('PINTASAN', 'Tombol: ' + (ctrl ? 'Ctrl+' : '') + (e.shiftKey ? 'Shift+' : '') + (e.altKey ? 'Alt+' : '') + e.key);
        return;
      }
      // Navigasi papan ketik yang diizinkan
      if (k === 'arrowright') go(S.pos + 1);
      else if (k === 'arrowleft') go(S.pos - 1);
    }, true);
    document.addEventListener('keyup', (e) => {
      if (S.examActive && (e.key || '').toLowerCase() === 'printscreen') violation('PINTASAN', 'Tombol: PrintScreen');
    });

    let rzTimer;
    window.addEventListener('resize', () => {
      clearTimeout(rzTimer);
      rzTimer = setTimeout(() => {
        if (!S.examActive || isFS()) return;
        if (window.innerWidth < screen.availWidth * 0.75 || window.innerHeight < screen.availHeight * 0.6) {
          violation('UKURAN_JENDELA', 'Jendela ' + window.innerWidth + '×' + window.innerHeight + ' dari layar ' + screen.availWidth + '×' + screen.availHeight);
        }
      }, 800);
    });

    window.addEventListener('beforeunload', (e) => { if (S.examActive) { e.preventDefault(); e.returnValue = ''; } });
    window.addEventListener('popstate', () => { if (S.examActive) { history.pushState(null, '', location.href); toast('Tombol kembali dinonaktifkan selama ujian.'); } });
    window.addEventListener('online', () => { if (S.examActive) heartbeat(); });
  }

  /* ------------------------------ INIT ------------------------------ */
  function bindUI() {
    $('form-login').addEventListener('submit', onLogin);
    $('in-kode').addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
    $('btn-start').onclick = onStart;
    $('btn-logout').onclick = () => { clearAll(); location.reload(); };
    $('btn-prev').onclick = () => go(S.pos - 1);
    $('btn-next').onclick = () => go(S.pos + 1);
    $('btn-ragu').onclick = toggleRagu;
    $('btn-finish').onclick = openFinish;
    $('btn-f-cancel').onclick = () => $('ov-finish').classList.add('hidden');
    $('f-sure').onchange = (e) => { $('btn-f-ok').disabled = !e.target.checked; };
    $('btn-f-ok').onclick = () => submit('MANUAL');
    $('btn-back-exam').onclick = async () => { $('ov-violation').classList.add('hidden'); if (fsSupported() && !isFS()) await requestFS(); };
    $('btn-exit').onclick = () => { clearAll(); clearInterval(S.timers.rank); location.reload(); };
    $('fs-minus').onclick = () => setFont(-1);
    $('fs-plus').onclick = () => setFont(1);
  }
  function setFont(d) { S.fs = Math.max(14, Math.min(24, S.fs + d)); document.documentElement.style.setProperty('--fs', S.fs + 'px'); }

  function init() {
    bindUI(); bindGuards(); loadInfo();
    const sess = loadSess();
    if (sess && sess.token) {
      S.sess = sess;
      if (sess.end && Date.now() > sess.end + 15 * 60000) { clearAll(); S.sess = null; return; }
      showWait();
    }
  }
  init();
})();
