/* RCA TB-HIV 2026 · dikte suara (Bahasa Indonesia) dan "Rapikan teks" untuk isian panjang (alasan, keterangan, uraian).
   - Dikte memakai pengenal suara bawaan browser (Web Speech API, id-ID). Chrome/Edge mengirim suara ke layanan Google,
     Safari ke layanan Apple, untuk diubah menjadi teks; perlu internet.
   - Rapikan teks berjalan di perangkat (aturan bahasa Indonesia + istilah TB-HIV). Bila Super Admin mengaktifkan
     layanan AI di server, tersedia juga "Lebih natural (AI)".
   - Nomor panjang (mungkin NIK/telepon/no. RM) tidak pernah dimasukkan ke isian. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const V = RCA.voice = {};
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  V.supported = !!SR;

  /* ---------------- isian yang mendapat fitur: textarea + isian teks yang menggali alasan/uraian */
  const LONG_RE = /alasan|keterangan|catatan|uraian|penjelasan|mengapa|hambatan|kendala|temuan|rantai sebab|bukti yang|ringkasan|titik rawan|deskripsi|kronologi|narasi|pendapat|saran|rekomendasi|tindak lanjut|faktor|penyebab|cerita/i;
  const NOT_RE = /lokator|kode|tanggal|halaman|nomor|jumlah|^no\.|sumber data/i;
  V.wants = f => !!f && (f.t === 'textarea' || ((!f.t || f.t === 'text') && LONG_RE.test(f.l || '') && !NOT_RE.test(f.l || '')));

  /* ---------------- kamus perapian */
  const ACR = { 'tebe': 'TB', 'tbc': 'TBC', 'tb': 'TB', 'hiv': 'HIV', 'aids': 'AIDS', 'arv': 'ARV', 'oat': 'OAT', 'tcm': 'TCM', 'sitb': 'SITB', 'siha': 'SIHA',
    'pkm': 'PKM', 'rs': 'RS', 'rsud': 'RSUD', 'dinkes': 'Dinkes', 'tpt': 'TPT', 'ipt': 'IPT', 'pdp': 'PDP', 'vct': 'VCT', 'pitc': 'PITC', 'ppia': 'PPIA', 'odhiv': 'ODHIV', 'odha': 'ODHA',
    'ltfu': 'LTFU', 'mdr': 'MDR', 'tb ro': 'TB RO', 'tb so': 'TB SO', 'bpjs': 'BPJS', 'kie': 'KIE', 'sop': 'SOP', 'cd4': 'CD4', 'ims': 'IMS', 'ppk': 'PPK', 'ctx': 'CTX', 'kmk': 'KMK',
    'fasyankes': 'fasyankes', 'faskes': 'faskes', 'puskesmas': 'puskesmas', 'si tb': 'SITB', 'si ha': 'SIHA', 'ha i ve': 'HIV', 'h i v': 'HIV', 't b': 'TB', 'te be': 'TB', 'te ce em': 'TCM', 'a er ve': 'ARV', 'o a te': 'OAT' };
  const BAKU = { 'gak': 'tidak', 'ga': 'tidak', 'nggak': 'tidak', 'ngga': 'tidak', 'enggak': 'tidak', 'engga': 'tidak', 'tdk': 'tidak', 'udah': 'sudah', 'udh': 'sudah', 'sdh': 'sudah',
    'blm': 'belum', 'belom': 'belum', 'aja': 'saja', 'kalo': 'kalau', 'klo': 'kalau', 'gimana': 'bagaimana', 'tau': 'tahu', 'dapet': 'dapat', 'dateng': 'datang', 'dtg': 'datang', 'ketemu': 'bertemu', 'nunggu': 'menunggu', 'ngambil': 'mengambil', 'minum obat': 'minum obat', 'karna': 'karena', 'krn': 'karena',
    'yg': 'yang', 'dgn': 'dengan', 'utk': 'untuk', 'dg': 'dengan', 'dlm': 'dalam', 'sm': 'sama', 'jd': 'jadi', 'tp': 'tapi', 'bgt': 'sekali', 'banget': 'sekali', 'emang': 'memang',
    'gitu': 'begitu', 'gini': 'begini', 'kayak': 'seperti', 'kaya': 'seperti', 'cuma': 'hanya', 'cuman': 'hanya', 'nyampe': 'sampai', 'sampe': 'sampai', 'abis': 'habis', 'bilang': 'mengatakan',
    'ngomong': 'berbicara', 'nanya': 'bertanya', 'ngerti': 'mengerti', 'pengen': 'ingin', 'pingin': 'ingin', 'mesti': 'harus', 'gede': 'besar', 'gampang': 'mudah', 'biar': 'agar' };
  const NO_DUP = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'itu', 'ini', 'dia', 'saya', 'kami', 'kita', 'mereka', 'tidak', 'sudah', 'belum', 'ada', 'untuk', 'dengan', 'karena', 'jadi',
    'pasien', 'petugas', 'obat', 'tapi', 'atau', 'juga', 'akan', 'bisa', 'harus', 'sebagai', 'pada', 'oleh', 'dalam', 'the', 'TB', 'HIV']);
  const FILLER = /(^|[\s,])(?:e+h*m*|e+m+|h+m+|anu|apa ya|apa namanya|gimana ya)(?=[\s,.?!]|$)[,]?/gi;
  const caseLike = (src, out) => /^[A-Z]/.test(src) && !/^[A-Z]{2,}$/.test(out) ? out.charAt(0).toUpperCase() + out.slice(1) : out;
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ACR_RE = new RegExp('\\b(' + Object.keys(ACR).sort((a, b) => b.length - a.length).map(esc).join('|') + ')\\b', 'gi');
  const BAKU_RE = new RegExp('\\b(' + Object.keys(BAKU).map(esc).join('|') + ')\\b', 'gi');

  /** nomor panjang (≥ 10 angka: NIK, telepon, no. RM) tidak boleh masuk isian */
  V.maskIds = function (t) {
    let n = 0;
    const out = String(t || '').replace(/(\+?\d[\d\s.\-]{8,}\d)/g, m => (m.replace(/\D/g, '').length >= 10 ? (n++, '[nomor dihapus]') : m));
    return { text: out, masked: n };
  };
  /** perintah tanda baca yang diucapkan */
  function spokenPunct(t, endOnly) {
    t = t.replace(/\s*\b(?:baris baru|garis baru|paragraf baru)\b\s*/gi, '\n')
      .replace(/\s*\btanda tanya\b/gi, '?').replace(/\s*\btanda seru\b/gi, '!').replace(/\s*\btitik dua\b/gi, ':').replace(/\s*\btitik koma\b/gi, ';')
      .replace(/\s*\bbuka kurung\b\s*/gi, ' (').replace(/\s*\btutup kurung\b/gi, ')');
    // "titik"/"koma" tunggal hanya di akhir ucapan (agar istilah "titik putus", "titik rawan" tetap)
    if (endOnly) t = t.replace(/\s+titik\s*$/i, '.').replace(/\s+koma\s*$/i, ',');
    return t;
  }
  function words(t) {
    t = t.replace(FILLER, '$1');
    t = t.replace(ACR_RE, m => ACR[m.toLowerCase()] || m);
    t = t.replace(BAKU_RE, m => caseLike(m, BAKU[m.toLowerCase()]));
    t = t.replace(/(\w)\s+nya\b/gi, '$1nya');
    // kata berulang: ucapan tersendat dibuang; kata ulang (bentuk jamak) diberi tanda hubung
    t = t.replace(/\b([A-Za-z]{2,})(?:\s+\1\b)+/gi, (m, w) => (NO_DUP.has(w) || NO_DUP.has(w.toLowerCase()) || w.length < 4 ? w : w + '-' + w.toLowerCase()));
    return t;
  }
  function spacing(t) {
    return t.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\s+([.,;:?!)])/g, '$1').replace(/\(\s+/g, '(')
      .replace(/([,;:])(?=[^\s\d])/g, '$1 ').replace(/([.?!])(?=[A-Za-z])/g, '$1 ').replace(/([.,;:?!])\1+/g, '$1').replace(/,\s*\./g, '.').replace(/^\s+|\s+$/g, '');
  }
  function sentenceCase(t) {
    return t.replace(/(^|[.?!]\s+|\n\s*)([a-z])/g, (m, a, b) => a + b.toUpperCase());
  }
  /** perapian ringan untuk setiap potongan dikte */
  V.polishChunk = function (t) { return spacing(words(spokenPunct(String(t || '').trim(), true))); };
  /** rapikan teks lengkap (lokal, tanpa mengubah fakta/angka/kode) */
  V.tidy = function (text) {
    const m = V.maskIds(text);
    let t = spacing(words(spokenPunct(m.text, false)));
    t = t.split('\n').map(p => { p = sentenceCase(p.trim()); if (p && /[A-Za-z0-9)\]]$/.test(p)) p += '.'; return p; }).join('\n');
    return { text: t, masked: m.masked };
  };

  /* ---------------- dikte */
  let cur = null;
  function insert(ta, chunk) {
    const mk = V.maskIds(chunk); chunk = mk.text;
    if (mk.masked) RCA.toast('Nomor panjang (mungkin NIK, telepon, atau no. RM) tidak dimasukkan ke isian.', 'err', 6000);
    if (!chunk) return;
    const v = ta.value, at = document.activeElement === ta && typeof ta.selectionStart === 'number' ? ta.selectionStart : v.length;
    const end = document.activeElement === ta && typeof ta.selectionEnd === 'number' ? ta.selectionEnd : at;
    const before = v.slice(0, at), after = v.slice(end);
    const startSentence = !before.trim() || /[.?!]\s*$|\n\s*$/.test(before);
    if (startSentence) chunk = chunk.charAt(0).toUpperCase() + chunk.slice(1);
    const sep = before && !/\s$/.test(before) && !/^[.,;:?!)]/.test(chunk) ? ' ' : '';
    const ins = sep + chunk + (after && !/^\s/.test(after) ? ' ' : '');
    ta.value = before + ins + after;
    const pos = (before + ins).length; try { ta.setSelectionRange(pos, pos); } catch (e) { }
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.style.height = ''; ta.style.height = Math.min(ta.scrollHeight + 2, 420) + 'px';
  }
  function ui(st, on) {
    st.btn.classList.toggle('on', on); st.btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    st.btn.querySelector('.vl').textContent = on ? 'Berhenti' : 'Bicara';
    st.wrap.classList.toggle('listening', on);
    if (!on) st.live.textContent = '';
  }
  V.stop = function () {
    const st = cur; if (!st) return;
    st.want = false; cur = null; clearTimeout(st.idle);
    try { st.rec.stop(); } catch (e) { }
    ui(st, false);
  };
  V.start = function (ta, btn, live, wrap) {
    if (cur && cur.ta === ta) return V.stop();
    V.stop();
    if (!SR) {
      RCA.modal('Dikte suara belum didukung', h('div', null,
        h('p', null, 'Browser ini belum menyediakan pengenal suara. Gunakan Google Chrome atau Microsoft Edge (laptop/Android), atau Safari terbaru (iPhone/iPad).'),
        h('p', null, 'Alternatif: ketuk isian lalu tekan ikon mikrofon pada keyboard ponsel (Gboard/iOS) untuk mendikte.')));
      return;
    }
    if (navigator.onLine === false) { RCA.toast('Dikte suara memerlukan koneksi internet. Isian tetap bisa diketik.', 'err', 6000); return; }
    const st = cur = { ta, btn, live, wrap, want: true, restarts: 0, rec: null, idle: null };
    const bump = () => { clearTimeout(st.idle); st.idle = setTimeout(() => { if (cur === st) { V.stop(); RCA.toast('Dikte dihentikan karena tidak ada suara selama 45 detik.', null, 5000); } }, 45000); };
    const begin = () => {
      const rec = st.rec = new SR();
      rec.lang = 'id-ID'; rec.interimResults = true; rec.maxAlternatives = 1;
      rec.continuous = false;   // dimulai ulang otomatis setelah jeda: stabil di Android dan desktop
      rec.onresult = e => {
        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) { insert(ta, V.polishChunk(r[0].transcript)); bump(); } else interim += r[0].transcript;
        }
        live.textContent = interim ? '… ' + interim : 'Mendengarkan…';
      };
      rec.onerror = e => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') { st.want = false; RCA.toast('Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi.', 'err', 9000); }
        else if (e.error === 'network') { st.want = false; RCA.toast('Dikte suara memerlukan koneksi internet yang stabil.', 'err', 6000); }
        else if (e.error === 'audio-capture') { st.want = false; RCA.toast('Mikrofon tidak ditemukan atau sedang dipakai aplikasi lain.', 'err', 6000); }
      };
      rec.onend = () => {
        if (st.want && cur === st && st.restarts++ < 400) { setTimeout(() => { if (st.want && cur === st) { try { begin(); } catch (e) { V.stop(); } } }, 120); }
        else if (cur === st) V.stop(); else ui(st, false);
      };
      rec.start();
    };
    try { begin(); } catch (e) { cur = null; RCA.toast('Dikte tidak dapat dimulai: ' + e.message, 'err'); return; }
    ui(st, true); live.textContent = 'Mendengarkan… silakan bicara'; bump();
  };
  window.addEventListener('hashchange', () => V.stop());
  document.addEventListener('visibilitychange', () => { if (document.hidden) V.stop(); });

  /* ---------------- rapikan teks (pratinjau sebelum dipakai) */
  V.tidyDialog = async function (ta) {
    const src = ta.value;
    if (!src.trim()) { RCA.toast('Isian masih kosong.'); return; }
    V.stop();
    const loc = V.tidy(src);
    const out = h('textarea', { rows: 8, class: 'vt-out', 'aria-label': 'Hasil rapikan (dapat diedit)' }); out.value = loc.text;
    const note = h('p', { class: 'muted small' }, loc.text === src.trim() ? 'Teks sudah rapi menurut aturan perapian.' : 'Diperbaiki: tanda baca, huruf kapital, kata pengisi (eh, em, anu), kata tidak baku, dan istilah (TB, HIV, ARV, OAT, SITB…). Fakta, angka, dan kode tidak diubah.');
    if (loc.masked) note.appendChild(h('b', null, ' ' + loc.masked + ' nomor panjang dihapus (mungkin NIK/telepon).'));
    const aiBtn = RCA.state.ai ? h('button', { class: 'btn small', type: 'button', onclick: async () => {
      aiBtn.disabled = true; const old = aiBtn.textContent; aiBtn.textContent = 'Memproses…';
      try { const r = await RCA.api('text.tidy', { text: V.maskIds(out.value).text }); out.value = r.text; note.textContent = 'Dirapikan dengan AI. Periksa kembali: pastikan makna, angka, dan kode tidak berubah.'; }
      catch (e) { RCA.toast(e.message, 'err', 8000); }
      aiBtn.disabled = false; aiBtn.textContent = old;
    } }, '✨ Lebih natural (AI)') : null;
    const body = h('div', { class: 'vt-dlg' },
      h('div', { class: 'vt-col' }, h('div', { class: 'lbl' }, 'Sebelum'), h('div', { class: 'ro vt-src' }, src)),
      h('div', { class: 'vt-col' }, h('div', { class: 'lbl row' }, h('span', { class: 'grow' }, 'Sesudah (boleh diedit)'), aiBtn), out), note);
    const ok = await RCA.modal('Rapikan teks', body, [{ label: 'Batal', value: false }, { label: 'Pakai teks ini', value: true, cls: 'primary' }], { wide: true });
    if (!ok) return;
    ta.value = out.value; ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.style.height = ''; ta.style.height = Math.min(ta.scrollHeight + 2, 420) + 'px';
    RCA.toast('Teks dirapikan', 'ok', 2500);
  };

  /** bungkus textarea dengan tombol Bicara dan Rapikan */
  V.wrap = function (ta) {
    const live = h('span', { class: 'vlive', 'aria-live': 'polite' });
    const btn = h('button', { type: 'button', class: 'btn small vmic', 'aria-pressed': 'false', title: 'Dikte suara (Bahasa Indonesia)' }, h('span', { class: 'vdot', 'aria-hidden': 'true' }), h('span', { class: 'vl' }, 'Bicara'));
    const tidyBtn = h('button', { type: 'button', class: 'btn small ghost vtidy', title: 'Rapikan tanda baca, huruf kapital, dan ejaan' }, '✨ Rapikan');
    const wrap = h('div', { class: 'vwrap' }, ta, h('div', { class: 'vbar' }, btn, tidyBtn, live));
    btn.addEventListener('click', () => V.start(ta, btn, live, wrap));
    tidyBtn.addEventListener('click', () => V.tidyDialog(ta));
    const grow = () => { if (ta.scrollHeight > ta.clientHeight + 4) { ta.style.height = ''; ta.style.height = Math.min(ta.scrollHeight + 2, 420) + 'px'; } };
    ta.addEventListener('input', grow); setTimeout(grow, 0);
    return wrap;
  };
})();
