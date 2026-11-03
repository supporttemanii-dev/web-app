/* RCA TB-HIV 2026 · Dashboard Mapping
   Peta wilayah (atas) + diagram cerita (tengah) + rincian bukti (bawah).
   Semua tampilan dibangun dari keterkaitan antarformulir:
   - C3 (unit telaah) dan C6 (kasus kematian): apa yang terjadi pada individu (titik putus, linimasa) dan mengapa (penjelasan, faktor),
   - C4 (14 CP per fasyankes), C5 (kecocokan data sentinel), C7 (tema wawancara), C1 (dugaan penyebab): bukti tingkat layanan/wilayah.
   Setiap bukti digolongkan ke "akar masalah" (ranah faktor F1–F7, pasien/komunitas, keparahan) sehingga dapat dijumlahkan per wilayah.
   Klik wilayah, fasyankes, simpul, alur, tulang ikan, atau peristiwa: rincian bukti tampil di bawah diagram. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const DB = RCA.dash;
  const filt = RCA.state.filters = RCA.state.filters || {};
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, attrs, ...kids) => { const el = document.createElementNS(NS, tag); Object.entries(attrs || {}).forEach(([k, v]) => { if (v === null || v === undefined || v === false) return; if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v); else el.setAttribute(k, v); }); kids.flat(Infinity).forEach(c => { if (c === null || c === undefined || c === false) return; el.appendChild(c.nodeType ? c : document.createTextNode(String(c))); }); return el; };
  const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const pct = (n, N) => N ? Math.round(n / N * 100) : 0;
  const uniq = a => [...new Set(a)];

  /* ================= akar masalah: ranah faktor ================= */
  const DOMAIN = [
    { k: 'layanan', l: 'Proses layanan dan koordinasi', f: ['F1 Penyelenggaraan pelayanan'], c: '#d9480f' },
    { k: 'sdm', l: 'SDM dan tata kelola', f: ['F2 Tenaga kesehatan', 'F7 Kepemimpinan dan tata kelola'], c: '#7048e8' },
    { k: 'data', l: 'Sistem informasi dan pencatatan', f: ['F3 Sistem informasi'], c: '#1971c2' },
    { k: 'logistik', l: 'Diagnostik, obat, dan logistik', f: ['F4 Diagnostik', 'F5 Obat dan teknologi lain'], c: '#0c8599' },
    { k: 'biaya', l: 'Pembiayaan dan akses', f: ['F6 Pembiayaan'], c: '#e67700' },
    { k: 'pasien', l: 'Pasien dan komunitas', f: ['Faktor pasien/komunitas'], c: '#c2255c' },
    { k: 'klinis', l: 'Keparahan klinis', f: ['Keparahan penyakit'], c: '#5c6b70' }];
  const NONE = { k: 'belum', l: 'Belum ditelusuri', c: '#adb5bd' };
  const domOf = f => DOMAIN.find(d => d.f.includes(f)) || null;
  const domByK = k => DOMAIN.find(d => d.k === k) || NONE;
  const FORMS = { C1: 'Profil dan dugaan', C3: 'Telaah catatan', C4: 'Penilaian fasilitas (14 CP)', C5: 'Verifikasi data', C6: 'Telaah kematian', C7: 'Wawancara dan diskusi' };
  const FCOL = { C1: '#868e96', C3: '#1c7ed6', C4: '#2f9e44', C5: '#7048e8', C6: '#e03131', C7: '#f08c00' };
  const CPL = {}; try { RCA.S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp').rows.forEach(r => { CPL[r.k] = r.l.replace(/^\S+\s/, ''); }); } catch (e) { }

  /* ================= model: cerita + bukti lintas formulir ================= */
  function buildModel(V, D) {
    const stories = RCA.story.build(V).concat(RCA.story.buildC6(V, (D.C2 && D.C2.calon) || []));
    stories.forEach(s => {
      s.kk = s.kk || (RCA.reg.fac(s.fac).kk || ''); s.prov = s.prov || (RCA.reg.kk(s.kk).prov || '');
      s.doms = uniq(s.faktor.map(x => (domOf(x.f) || {}).k).filter(Boolean));
      s.gapCount = s.gaps.length;
    });
    const ev = [];   // {id, form, sub, unit, fac, kk, prov, kind, cp, langkah, teks, faktor:[], dom:[], story, rec}
    const add = o => { o.id = ev.length; o.dom = uniq((o.faktor || []).map(f => (domOf(f) || {}).k).filter(Boolean)); if (!o.dom.length && o.kind === 'gap') o.dom = ['belum']; ev.push(o); };
    const loc = r => ({ fac: r.fac || '', kk: r.kk || RCA.reg.fac(r.fac).kk || '', prov: r.prov || RCA.reg.kk(r.kk || RCA.reg.fac(r.fac).kk).prov || '' });
    // C3 dan C6: setiap titik putus = bukti "apa", setiap penjelasan berfaktor = bukti "mengapa"
    stories.forEach(s => {
      const fk = s.faktor.map(x => x.f);
      s.gaps.forEach(g => add({ form: s.form, sub: s.sub, unit: s.unit, fac: s.fac, kk: s.kk, prov: s.prov, kind: 'gap', cp: g.cp, langkah: g.langkah, jenis: g.jenis, teks: g.teks, bukti: g.bukti, faktor: fk, story: s }));
      s.why.forEach(w => { const f = (w.faktor && w.faktor.length) ? w.faktor : (w.kelas || w.jenis === 'penelaah' ? RCA.story.klasifikasi(w.teks) : []); if (f.length) add({ form: s.form, sub: s.sub, unit: s.unit, fac: s.fac, kk: s.kk, prov: s.prov, kind: 'why', cp: (s.gaps[0] || {}).cp || '', langkah: w.sumber, teks: w.teks, faktor: f, story: s }); });
    });
    // C4: CP dengan kesenjangan (penilai menetapkan faktor)
    ((V.C4 || {}).C4 || []).forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, row]) => {
      if (!/sebagian|tidak terlaksana/i.test(row.klasifikasi || '')) return;
      const f = (row.faktor || []).length ? row.faktor : RCA.story.klasifikasi([row.masalah, row.dugaan].join(' '));
      add(Object.assign(loc(r), { form: 'C4', sub: 'C4', unit: r.unit, kind: 'cp', cp, langkah: CPL[cp] || cp, jenis: row.klasifikasi, teks: [row.masalah, row.dugaan ? 'dugaan: ' + row.dugaan : ''].filter(Boolean).join(' · ') || row.klasifikasi, bukti: row.kode_bukti || '', faktor: f, rec: r }));
    }));
    // C5: baris pencocokan yang tidak sesuai (sistem informasi)
    ['C5_5', 'C5_6', 'C5_41a'].forEach(sub => ((V.C5 || {})[sub] || []).forEach(r => (r.data.cocok || []).forEach(x => {
      if (!x.jenis || x.jenis === 'Sesuai') return;
      add(Object.assign(loc(r), { form: 'C5', sub, unit: r.unit, kind: 'data', cp: 'R6', langkah: ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[sub], jenis: x.jenis, teks: [x.jenis, x.penjelasan].filter(Boolean).join(' · '), bukti: x.kode_baris || '', faktor: ['F3 Sistem informasi'].concat(RCA.story.klasifikasi(x.penjelasan || '').filter(f => f !== 'F3 Sistem informasi')), rec: r, unitC3: x.kode_unit_c3 || '' }));
    })));
    // C7: tema wawancara
    ((V.C7 || {}).C7S || []).forEach(r => (r.data.tema || []).forEach(x => {
      const f = RCA.story.klasifikasi([x.tema, x.kutipan, x.catatan].join(' '));
      add(Object.assign(loc(r), { form: 'C7', sub: 'C7S', unit: r.unit, kind: 'tema', cp: x.cp || '', langkah: 'Tema wawancara', jenis: x.tema || '', teks: [x.tema, x.kutipan ? '“' + x.kutipan + '”' : ''].filter(Boolean).join(' · '), faktor: f, rec: r }));
    }));
    // C1: dugaan penyebab dan status pengujiannya
    ((V.C1 || {}).C1 || []).forEach(r => (r.data.dugaan || []).forEach(x => {
      const f = RCA.story.klasifikasi([x.dugaan, x.fokus].join(' '));
      add({ form: 'C1', sub: 'C1', unit: r.unit, fac: '', kk: r.unit, prov: RCA.reg.kk(r.unit).prov || r.prov || '', kind: 'dugaan', cp: x.cp || '', langkah: 'Dugaan C1', jenis: x.status || 'Belum diuji', teks: x.dugaan || '', faktor: f, rec: r });
    }));
    // foto bergeotag dari semua rekaman
    const photos = [];
    Object.keys(V).forEach(fm => Object.keys(V[fm] || {}).forEach(sub => (V[fm][sub] || []).forEach(r => ((r.data || {}).foto || []).forEach(p => { if (p && p.id) photos.push({ p, r, form: fm, sub }); }))));
    return { stories, ev, photos, V, D };
  }

  /* ================= cakupan (wilayah terpilih) ================= */
  const inScope = (sc, x) => (!sc.prov || x.prov === sc.prov) && (!sc.kk || x.kk === sc.kk) && (!sc.fac || x.fac === sc.fac || (x.form === 'C1' && x.kk === RCA.reg.fac(sc.fac).kk) || (x.form === 'C7' && !x.fac && x.kk === RCA.reg.fac(sc.fac).kk));
  const scopeLabel = sc => sc.fac ? sc.fac + ' · ' + RCA.reg.facName(sc.fac) : sc.kk ? RCA.reg.kkName(sc.kk) : sc.prov ? RCA.reg.prov(sc.prov).name : 'Semua wilayah';
  function metricsFor(M, pred) {
    const st = M.stories.filter(pred), ev = M.ev.filter(pred);
    const c3 = st.filter(s => s.form === 'C3'), c6 = st.filter(s => s.form === 'C6');
    const gapU = c3.filter(s => s.gapCount);
    const dom = {}; ev.filter(e => e.kind !== 'gap').forEach(e => e.dom.forEach(d => { dom[d] = (dom[d] || 0) + 1; }));
    const top = Object.entries(dom).sort((a, b) => b[1] - a[1])[0];
    return { st, ev, c3: c3.length, gapU: gapU.length, rate: pct(gapU.length, c3.length), c6: c6.length, c5: ev.filter(e => e.form === 'C5').length, c4: ev.filter(e => e.form === 'C4').length, dom, top: top ? top[0] : '' };
  }

  RCA.mapModel = { buildModel, metricsFor, DOMAIN, NONE, domOf, domByK, FORMS, FCOL, CPL };

  /* ================= Leaflet (dimuat saat dibutuhkan) ================= */
  let leafletP = null;
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leafletP) return leafletP;
    leafletP = new Promise((res, rej) => {
      document.head.appendChild(h('link', { rel: 'stylesheet', href: 'vendor/leaflet/leaflet.css' }));
      const load = src => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('Berkas peta tidak dapat dimuat: ' + src)); document.head.appendChild(s); });
      Promise.all([load('vendor/leaflet/leaflet.js'), window.RCA_GEO ? null : load('js/wilayah-geo.js')]).then(() => res(window.L)).catch(e => { leafletP = null; rej(e); });
    });
    return leafletP;
  }
  const RAMP = ['#e9f6ef', '#ffe8b3', '#ffc078', '#fa8c4a', '#e8590c', '#c92a2a'];
  const rampOf = (v, max) => v === null || v === undefined ? '#dee2e6' : RAMP[Math.min(RAMP.length - 1, Math.floor(v / Math.max(1, max) * (RAMP.length - 1) + 0.0001))];

  /* ================= halaman ================= */
  DB.mapping = async function (main) {
    main.innerHTML = '';
    const f = filt._map = filt._map || { sc: {}, tab: 'sankey', metric: 'rate', layers: { fac: true, foto: true } };
    const canRaw = RCA.can.raw(), canSent = RCA.can.fill(), isCoord = RCA.can.review();
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, 'Dashboard Mapping'),
      h('p', null, 'Peta dan diagram cerita yang merangkai C1–C7: apa yang terjadi, mengapa terjadi, dan akar masalahnya, menurut wilayah, layanan, dan individu. Klik wilayah, fasyankes, atau bagian diagram; rincian bukti tampil di bawah diagram.'))));
    const box = h('div', null, h('p', { class: 'muted' }, 'Menyusun peta dan diagram…')); main.appendChild(box);
    let D;
    const key = 'analysis' + (f.dikirim ? '+dikirim' : '');
    try { D = await RCA.api('analysis.data', { sertakanDikirim: !!(f.dikirim && canSent) }); RCA.idb.set('cache', key, D); }
    catch (e) { if (e.code === 'OFFLINE') D = await RCA.idb.get('cache', key); if (!D) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; } }
    const V = {}; Object.keys(D).forEach(fm => { if (fm !== 'C2') V[fm] = D[fm]; });
    let M; try { M = buildModel(V, D); } catch (e) { console.error(e); box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, 'Gagal menyusun model: ' + e.message)); return; }
    let precise = {};
    if (isCoord && RCA.state.online) { try { (await RCA.api('photo.geo', {})).forEach(x => { precise[x.id] = x; }); } catch (e) { } }
    box.innerHTML = '';

    // ---- kontrol
    const dk = h('input', { type: 'checkbox', checked: !!f.dikirim }); dk.addEventListener('change', () => { f.dikirim = dk.checked; DB.mapping(main); });
    const metSel = h('select', { 'aria-label': 'Warna peta menurut' }, [['rate', '% unit C3 dengan titik putus'], ['c6', 'Jumlah kasus kematian C6'], ['c5', 'Ketidaksesuaian data C5'], ['dom', 'Akar masalah dominan'], ['cap', 'Capaian program (pemilihan lokasi)']].map(([v, l]) => h('option', { value: v, selected: f.metric === v }, l)));
    metSel.addEventListener('change', () => { f.metric = metSel.value; drawMap(); });
    const crumbs = h('nav', { class: 'crumbs', 'aria-label': 'Cakupan wilayah' });
    f.cmp = f.cmp || [];
    const cmpBtn = h('button', { type: 'button', class: 'btn small' + (f.cmpOn ? ' primary' : ''), 'aria-pressed': f.cmpOn ? 'true' : 'false', onclick: () => { f.cmpOn = !f.cmpOn; if (f.cmpOn) f.tab = 'cmp'; else if (f.tab === 'cmp') f.tab = 'sankey'; cmpBtn.classList.toggle('primary', f.cmpOn); cmpBtn.setAttribute('aria-pressed', String(f.cmpOn)); refresh('cmp'); } }, '⇄ Bandingkan wilayah');
    box.appendChild(h('div', { class: 'filters no-print mapctl' }, h('label', { class: 'row' }, h('span', null, 'Warna peta:'), metSel),
      canSent ? h('label', { class: 'row' }, dk, h('span', null, 'Sertakan isian Dikirim (pratinjau)')) : null, cmpBtn));
    const cmpBox = h('div', { class: 'cmpbox' });
    box.appendChild(cmpBox);
    const CMP = RCA.compare;
    const cmpIdx = code => f.cmpOn ? f.cmp.indexOf(code) : -1;
    const cmpToggle = code => { const i = f.cmp.indexOf(code); if (i >= 0) f.cmp.splice(i, 1); else if (f.cmp.length < CMP.MAX) f.cmp.push(code); else { RCA.toast('Maksimal ' + CMP.MAX + ' kab/kota. Hapus salah satu dulu.', 'err'); return; } refresh('cmp'); };
    function drawCmpBox() {
      cmpBox.innerHTML = ''; cmpBox.hidden = !f.cmpOn;
      if (!f.cmpOn) return;
      cmpBox.appendChild(CMP.picker(f.cmp, v => { f.cmp.splice(0, f.cmp.length, ...v); refresh('cmp'); }));
      cmpBox.appendChild(h('p', { class: 'small muted' }, 'Mode bandingkan: klik kab/kota di peta untuk menambah atau melepasnya (maksimal 4). Hasil perbandingan tampil di bawah peta; klik batang atau sel untuk rincian bukti.'));
    }
    if (f.dikirim && canSent) box.appendChild(h('div', { class: 'notice warn', style: { marginBottom: '10px' } }, 'Pratinjau: memuat isian yang belum divalidasi koordinator.'));
    box.appendChild(crumbs);
    const story = h('section', { class: 'mstory', 'aria-live': 'polite' });
    const mapWrap = h('div', { class: 'mapwrap' });
    const mapEl = h('div', { class: 'mapcanvas', role: 'region', 'aria-label': 'Peta wilayah RCA TB-HIV' });
    const legend = h('div', { class: 'maplegend' });
    const layerBox = h('div', { class: 'maplayers' });
    mapWrap.appendChild(mapEl); mapWrap.appendChild(legend); mapWrap.appendChild(layerBox);
    const tabs = h('div', { class: 'tabs no-print', role: 'tablist' });
    const diag = h('section', { class: 'mdiag' });
    const detail = h('section', { class: 'mdetail', id: 'mapDetail', tabindex: '-1', 'aria-live': 'polite' });
    box.appendChild(h('div', { class: 'maptop' }, mapWrap, story));
    box.appendChild(tabs); box.appendChild(diag); box.appendChild(detail);

    const sc = f.sc;
    const pred = x => inScope(sc, x);
    const setScope = (o, from) => { Object.assign(sc, { prov: o.prov || '', kk: o.kk || '', fac: o.fac || '' }); f.sc = sc; refresh(from || 'crumb'); };

    /* ---------- rincian bukti (bawah) */
    function showDetail(title, sub, opts) {
      opts = opts || {};
      detail.innerHTML = '';
      const st = uniq(opts.stories || []), ev = opts.ev || [];
      const head = h('div', { class: 'mdetail-head' }, h('div', { class: 'grow' }, h('h2', null, title), sub ? h('p', { class: 'muted' }, sub) : null),
        h('button', { class: 'btn small ghost', type: 'button', onclick: () => { detail.innerHTML = ''; detail.appendChild(hint()); } }, 'Tutup'));
      detail.appendChild(head);
      const byForm = {}; ev.forEach(e => { (byForm[e.form] = byForm[e.form] || []).push(e); });
      st.forEach(s => { if (!ev.some(e => e.story === s)) (byForm[s.form] = byForm[s.form] || []); });
      detail.appendChild(h('div', { class: 'evchips' }, Object.keys(FORMS).filter(k => (byForm[k] || []).length || st.some(s => s.form === k)).map(k => {
        const n = k === 'C3' || k === 'C6' ? st.filter(s => s.form === k).length : (byForm[k] || []).length;
        return h('span', { class: 'evchip', style: { '--fc': FCOL[k] } }, h('b', null, k), ' ', n + (k === 'C3' ? ' unit' : k === 'C6' ? ' kasus' : ' bukti'), ' · ', FORMS[k]);
      })));
      if (opts.extra) detail.appendChild(opts.extra);
      if (!canRaw) {
        detail.appendChild(h('div', { class: 'notice' }, 'Rincian bukti per unit (teks, data mentah, foto) hanya untuk Enumerator, Koordinator, dan Super Admin. Peran Pembaca melihat jumlah dan kategori.'));
        detail.appendChild(aggTable(st, ev));
        return focusDetail();
      }
      // bukti tingkat layanan/wilayah (C4, C5, C7, C1)
      ['C4', 'C5', 'C7', 'C1'].forEach(k => {
        const L = (byForm[k] || []).filter(e => !e.story); if (!L.length) return;
        const sec = h('div', { class: 'evsec' }, h('h3', null, h('i', { class: 'fdot', style: { background: FCOL[k] } }), k + ' · ' + FORMS[k] + ' (' + L.length + ')'));
        const recs = new Map();
        L.slice(0, 60).forEach(e => {
          sec.appendChild(h('div', { class: 'evitem' },
            h('div', { class: 'evh' }, h('b', null, e.unit), e.cp ? h('span', { class: 'chip cp' }, e.cp) : null, e.jenis ? h('span', { class: 'chip' }, clip(e.jenis, 60)) : null,
              e.dom.map(d => h('span', { class: 'chip dom', style: { '--dc': domByK(d).c } }, domByK(d).l)),
              h('a', { class: 'small', href: '#/edit/' + e.form + '/' + e.sub + '/' + encodeURIComponent(e.unit) }, 'Buka ' + e.sub)),
            h('p', null, clip(e.teks, 400)), e.bukti ? h('small', { class: 'muted' }, 'Kode bukti: ' + e.bukti) : null));
          if (e.rec) recs.set(e.rec, e);
        });
        if (L.length > 60) sec.appendChild(h('p', { class: 'muted small' }, '… dan ' + (L.length - 60) + ' bukti lainnya.'));
        recs.forEach((e, r) => { const g = RCA.photo.gallery((r.data || {}).foto, 'Foto ' + r.sub + ' ' + r.unit); if (g) sec.appendChild(g); });
        detail.appendChild(sec);
      });
      // cerita individu (C3/C6) dengan sorotan
      if (st.length) {
        const sec = h('div', { class: 'evsec' }, h('h3', null, h('i', { class: 'fdot', style: { background: FCOL.C3 } }), 'Cerita individu: apa yang terjadi dan mengapa (' + st.length + ')'));
        st.slice(0, 40).forEach((s, i) => sec.appendChild(RCA.anlPanel.storyCard(s, { open: st.length <= 2 || i === 0, rawOpen: st.length === 1, highlight: opts.highlight })));
        if (st.length > 40) sec.appendChild(h('p', { class: 'muted small' }, '… dan ' + (st.length - 40) + ' unit lainnya. Persempit wilayah untuk melihat semuanya.'));
        detail.appendChild(sec);
      }
      if (opts.photos) opts.photos.forEach(g => g && detail.appendChild(g));
      focusDetail();
    }
    function focusDetail() { if (!detail.dataset.quiet) detail.scrollIntoView({ behavior: 'smooth', block: 'start' }); detail.dataset.quiet = ''; }
    function aggTable(st, ev) {
      const dom = {}; ev.forEach(e => e.dom.forEach(d => { dom[d] = (dom[d] || 0) + 1; }));
      return RCA.anl.tbl(['Akar masalah', 'Bukti'], Object.entries(dom).sort((a, b) => b[1] - a[1]).map(([k, n]) => [domByK(k).l, n]), { num: true });
    }
    const hint = () => h('div', { class: 'mhint' }, h('b', null, 'Rincian bukti. '), 'Klik wilayah atau fasyankes di peta, simpul atau alur pada diagram, tulang ikan, atau peristiwa pada perjalanan pasien untuk menampilkan bukti pendukungnya di sini: cerita unit, data mentah, kutipan, dan foto.');

    /* ---------- peta */
    let map = null, geoLayer = null, facLayer = null, kkLayer = null, fotoLayer = null, placing = null;
    const kkStats = {};
    const facPos = {};
    function computePositions() {
      // posisi fasyankes: koordinat koordinator > median geotag foto > titik tengah kab/kota (RS kiri, PKM kanan)
      const geo = window.RCA_GEO;
      const cent = {}; (geo ? geo.features : []).forEach(ft => { const b = L.geoJSON(ft).getBounds(); cent[ft.properties.code] = b.getCenter(); kkStats[ft.properties.code] = kkStats[ft.properties.code] || {}; kkStats[ft.properties.code].bounds = b; });
      const fp = {}; M.photos.forEach(({ p, r }) => { const g = precise[p.id] || p.geo; if (g && r.fac) (fp[r.fac] = fp[r.fac] || []).push([+g.lat, +g.lng]); });
      const med = a => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
      RCA.state.regions.fac.forEach(fc => {
        if (fc.lat !== undefined && fc.lat !== '' && !isNaN(+fc.lat) && fc.lng !== '') { facPos[fc.code] = { ll: [+fc.lat, +fc.lng], src: 'koordinat koordinator' }; return; }
        if (fp[fc.code] && fp[fc.code].length) { facPos[fc.code] = { ll: [med(fp[fc.code].map(x => x[0])), med(fp[fc.code].map(x => x[1]))], src: 'geotag foto' + (isCoord ? '' : ' (±1 km)') }; return; }
        const c = cent[fc.kk]; if (!c) return;
        const b = kkStats[fc.kk].bounds, dx = (b.getEast() - b.getWest()) * 0.12;
        facPos[fc.code] = { ll: [c.lat, c.lng + (fc.type === 'RS' ? -dx : dx)], src: 'perkiraan (tengah kab/kota)' };
      });
    }
    async function initMap() {
      let L0;
      try { L0 = await loadLeaflet(); } catch (e) { mapEl.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
      window.L = L0;
      map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: false, attributionControl: true, minZoom: 4 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap · batas wilayah: geoBoundaries (CC BY 4.0)' }).addTo(map);
      map.setView([-2.5, 118], 5); RCA._map = map;
      computePositions();
      drawMap(); fitScope();
      map.on('click', e => {
        if (!placing) return;
        const code = placing; placing = null; mapEl.classList.remove('placing');
        RCA.confirm('Simpan lokasi ' + code, 'Tetapkan titik ' + e.latlng.lat.toFixed(5) + ', ' + e.latlng.lng.toFixed(5) + ' sebagai lokasi fasyankes ' + code + '? Lokasi tepat hanya terlihat oleh koordinator.', 'Simpan').then(async ok => {
          if (!ok) return;
          try { const R = await RCA.api('fac.update', { code, lat: e.latlng.lat, lng: e.latlng.lng }); RCA.state.regions = R; RCA.toast('Lokasi ' + code + ' disimpan', 'ok'); computePositions(); drawMap(); } catch (er) { RCA.toast(er.message, 'err'); }
        });
      });
    }
    function drawMap() {
      if (!map) return;
      if (geoLayer) geoLayer.remove(); if (facLayer) facLayer.remove(); if (fotoLayer) fotoLayer.remove();
      const met = f.metric;
      const stats = {};
      RCA.state.regions.kk.forEach(k => { stats[k.code] = metricsFor(M, x => x.kk === k.code); });
      const maxV = Math.max(1, ...Object.values(stats).map(s => met === 'rate' ? 100 : met === 'c6' ? s.c6 : met === 'c5' ? s.c5 : 0));
      const valOf = s => met === 'rate' ? (s.c3 ? s.rate : null) : met === 'c6' ? s.c6 : met === 'c5' ? s.c5 : null;
      const colorOf = (code, s) => met === 'dom' ? (s.top ? domByK(s.top).c : '#dee2e6') : met === 'cap' ? (RCA.reg.kk(code).capaian === 'Rendah' ? '#ffa94d' : '#74c0fc') : rampOf(valOf(s), maxV);
      geoLayer = L.geoJSON(window.RCA_GEO, {
        style: ft => { const code = ft.properties.code, s = stats[code], on = sc.kk === code || (sc.fac && RCA.reg.fac(sc.fac).kk === code) || (sc.prov && RCA.reg.kk(code).prov === sc.prov);
          if (f.cmpOn) { const ci = cmpIdx(code); return ci >= 0 ? { color: CMP.SLOT[ci], weight: 4, fillColor: CMP.SLOT[ci], fillOpacity: 0.45 } : { color: '#868e96', weight: 1, fillColor: '#ced4da', fillOpacity: 0.25, dashArray: '3 4' }; }
          return { color: on ? '#0b3d42' : '#495057', weight: on ? 3 : 1, fillColor: colorOf(code, s), fillOpacity: met === 'dom' || met === 'cap' ? 0.55 : 0.72, dashArray: s.c3 || s.c6 ? null : '4 4' }; },
        onEachFeature: (ft, lyr) => {
          const code = ft.properties.code, s = stats[code];
          lyr.bindTooltip(h('div', { class: 'mtip' }, h('b', null, RCA.reg.kkName(code)), h('div', null, s.c3 ? s.gapU + '/' + s.c3 + ' unit C3 dengan titik putus (' + s.rate + '%)' : 'Belum ada unit C3 dalam data'),
            h('div', null, s.c6 + ' kasus C6 · ' + s.c5 + ' baris C5 tidak sesuai · ' + s.c4 + ' CP bermasalah'), s.top ? h('div', null, 'Akar masalah dominan: ', h('b', null, domByK(s.top).l)) : null,
            h('small', null, 'Capaian program: ' + (RCA.reg.kk(code).capaian || '–') + ' · klik untuk memfokuskan')), { sticky: true });
          lyr.on('click', ev => { L.DomEvent.stopPropagation(ev); if (placing) return; if (f.cmpOn) return cmpToggle(code); setScope({ prov: RCA.reg.kk(code).prov, kk: code }, 'map'); });
          lyr.on('mouseover', () => lyr.setStyle({ weight: 3 })); lyr.on('mouseout', () => geoLayer.resetStyle(lyr));
        }
      }).addTo(map);
      // tingkat nasional/provinsi (zoom kecil): satu lingkaran per kab/kota; zoom besar: lingkaran per fasyankes
      if (kkLayer) kkLayer.remove();
      kkLayer = L.layerGroup();
      RCA.state.regions.kk.forEach(k => {
        const s = stats[k.code], b = kkStats[k.code] && kkStats[k.code].bounds; if (!b) return;
        const r = 9 + Math.min(18, Math.sqrt(s.c3 + s.c6) * 2.6);
        const ci = cmpIdx(k.code);
        const mk = L.circleMarker(b.getCenter(), { radius: r, color: ci >= 0 ? CMP.SLOT[ci] : '#ffffff', weight: ci >= 0 ? 4 : 2, fillColor: s.c3 ? rampOf(s.rate, 100) : '#adb5bd', fillOpacity: 0.95 });
        mk.bindTooltip(RCA.reg.kkName(k.code) + (s.c3 ? ' · ' + s.rate + '% unit dengan titik putus' : ' · belum ada unit C3'), { direction: 'top' });
        mk.on('click', ev => { L.DomEvent.stopPropagation(ev); if (f.cmpOn) return cmpToggle(k.code); setScope({ prov: k.prov, kk: k.code }, 'map'); });
        kkLayer.addLayer(mk);
        kkLayer.addLayer(L.marker(b.getCenter(), { icon: L.divIcon({ className: 'kklbl', html: (ci >= 0 ? '<span class="cmpn" style="background:' + CMP.SLOT[ci] + '">' + (ci + 1) + '</span>' : '') + RCA.esc(RCA.reg.kkName(k.code).replace(/^(Kabupaten|Kota) /, '')) + (s.c3 ? ' <b>' + s.rate + '%</b>' : ''), iconSize: [130, 16], iconAnchor: [65, -r - 2] }), interactive: false }));
      });
      // fasyankes
      facLayer = L.layerGroup();
      if (f.layers.fac) RCA.state.regions.fac.forEach(fc => {
        const pos = facPos[fc.code]; if (!pos) return;
        const s = metricsFor(M, x => x.fac === fc.code);
        const r = 7 + Math.min(14, Math.sqrt(s.c3 + s.c6) * 3), on = sc.fac === fc.code;
        const mk = L.circleMarker(pos.ll, { radius: r, color: on ? '#0b3d42' : '#ffffff', weight: on ? 4 : 2, fillColor: s.c3 ? rampOf(s.rate, 100) : '#adb5bd', fillOpacity: 0.95 });
        mk.bindTooltip(h('div', { class: 'mtip' }, h('b', null, fc.code + ' · ' + RCA.reg.facName(fc.code)), h('div', null, s.c3 ? s.gapU + '/' + s.c3 + ' unit C3 dengan titik putus (' + s.rate + '%)' : 'Belum ada unit C3'),
          h('div', null, s.c6 + ' kasus C6 · ' + s.c4 + ' CP bermasalah (C4) · ' + s.c5 + ' baris C5'), s.top ? h('div', null, 'Akar masalah dominan: ', h('b', null, domByK(s.top).l)) : null, h('small', null, 'Posisi: ' + pos.src)), { direction: 'top' });
        mk.on('click', ev => { L.DomEvent.stopPropagation(ev); setScope({ prov: RCA.reg.kk(fc.kk).prov, kk: fc.kk, fac: fc.code }, 'map'); });
        facLayer.addLayer(mk);
        facLayer.addLayer(L.marker(pos.ll, { icon: L.divIcon({ className: 'faclbl', html: RCA.esc(fc.type === 'RS' ? 'RS' : 'PKM'), iconSize: [30, 14], iconAnchor: [15, -r] }), interactive: false }));
      });
      const zoomSwap = () => { const z = map.getZoom(); if (z >= 8) { kkLayer.remove(); if (!map.hasLayer(facLayer)) facLayer.addTo(map); } else { facLayer.remove(); if (!map.hasLayer(kkLayer)) kkLayer.addTo(map); } };
      map.off('zoomend', map._rcaSwap); map._rcaSwap = zoomSwap; map.on('zoomend', zoomSwap); zoomSwap();
      // foto bergeotag
      fotoLayer = L.layerGroup();
      if (f.layers.foto && canRaw) {
        // foto di titik yang sama digabung menjadi satu penanda bernomor
        const grp = new Map();
        M.photos.forEach(x => { const g = precise[x.p.id] || x.p.geo; if (!g || !inScope(sc, { fac: x.r.fac, kk: x.r.kk, prov: x.r.prov, form: x.form })) return; const k = (+g.lat).toFixed(4) + ',' + (+g.lng).toFixed(4); if (!grp.has(k)) grp.set(k, { ll: [+g.lat, +g.lng], items: [] }); grp.get(k).items.push(x); });
        grp.forEach(({ ll, items }) => {
          const units = uniq(items.map(x => x.sub + ' ' + x.r.unit));
          const mk = L.marker(ll, { icon: L.divIcon({ className: 'fotopin', html: '📷' + (items.length > 1 ? '<b>' + items.length + '</b>' : ''), iconSize: [items.length > 1 ? 36 : 24, 24], iconAnchor: [12, 12] }), title: items.length + ' foto · ' + units.join(', '), keyboard: true });
          mk.on('click', ev => { L.DomEvent.stopPropagation(ev);
            const recs = uniq(items.map(x => x.r));
            const st = M.stories.filter(s => recs.some(r => s.unit === r.unit && (s.form === 'C3' || s.form === 'C6')));
            showDetail('Foto ' + units.join(', '), items.length + ' foto · ' + RCA.photo.metaLine(items[0].p, precise[items[0].p.id]), { stories: st, ev: M.ev.filter(e => recs.includes(e.rec)),
              photos: recs.map(r => RCA.photo.gallery(items.filter(x => x.r === r).map(x => x.p), 'Foto ' + r.sub + ' ' + r.unit)) });
          });
          fotoLayer.addLayer(mk);
        });
      }
      fotoLayer.addTo(map);
      // keterangan
      legend.innerHTML = '';
      if (met === 'dom') legend.appendChild(h('div', null, h('b', null, 'Akar masalah dominan'), DOMAIN.map(d => h('div', { class: 'lg' }, h('i', { style: { background: d.c } }), d.l)), h('div', { class: 'lg' }, h('i', { style: { background: '#dee2e6' } }), 'Belum ada bukti')));
      else if (met === 'cap') legend.appendChild(h('div', null, h('b', null, 'Capaian program'), h('div', { class: 'lg' }, h('i', { style: { background: '#ffa94d' } }), 'Rendah'), h('div', { class: 'lg' }, h('i', { style: { background: '#74c0fc' } }), 'Tinggi')));
      else legend.appendChild(h('div', null, h('b', null, met === 'rate' ? '% unit dengan titik putus' : met === 'c6' ? 'Kasus kematian C6' : 'Baris C5 tidak sesuai'),
        h('div', { class: 'ramp' }, RAMP.map(c => h('i', { style: { background: c } }))), h('div', { class: 'rampl' }, h('span', null, '0'), h('span', null, met === 'rate' ? '100%' : String(maxV))),
        h('div', { class: 'lg' }, h('i', { style: { background: '#dee2e6' } }), 'Belum ada data')));
      legend.appendChild(h('div', { class: 'lg small' }, h('i', { class: 'dotm' }), 'Lingkaran = kab/kota; perbesar peta untuk fasyankes (besar = jumlah unit)'));
      // lapisan
      layerBox.innerHTML = '';
      const cb = (k, l) => { const i = h('input', { type: 'checkbox', checked: !!f.layers[k] }); i.addEventListener('change', () => { f.layers[k] = i.checked; drawMap(); }); return h('label', null, i, ' ', l); };
      layerBox.appendChild(cb('fac', 'Fasyankes'));
      if (canRaw) layerBox.appendChild(cb('foto', 'Lokasi foto (' + M.photos.filter(x => precise[x.p.id] || x.p.geo).length + ')'));
      if (isCoord) {
        const sel = h('select', { 'aria-label': 'Atur lokasi fasyankes' }, h('option', { value: '' }, 'Atur lokasi fasyankes…'), RCA.state.regions.fac.map(x => h('option', { value: x.code }, x.code)));
        sel.addEventListener('change', () => { if (!sel.value) return; placing = sel.value; mapEl.classList.add('placing'); RCA.toast('Klik peta pada lokasi ' + sel.value + '. Hanya koordinator yang melihat titik tepatnya.', null, 7000); sel.value = ''; });
        layerBox.appendChild(sel);
      }
    }
    function fitScope() {
      if (!map) return;
      try {
        if (f.cmpOn && f.cmp.length) { const bs = f.cmp.map(c => kkStats[c] && kkStats[c].bounds).filter(Boolean); if (bs.length) { const b = L.latLngBounds(bs[0].getSouthWest(), bs[0].getNorthEast()); bs.slice(1).forEach(x => b.extend(x)); map.fitBounds(b, { padding: [30, 30], maxZoom: 9 }); return; } }
        if (sc.fac && facPos[sc.fac]) map.setView(facPos[sc.fac].ll, 11);
        else if (sc.kk && kkStats[sc.kk] && kkStats[sc.kk].bounds) map.fitBounds(kkStats[sc.kk].bounds, { padding: [20, 20] });
        else { const ks = RCA.state.regions.kk.filter(k => !sc.prov || k.prov === sc.prov).map(k => kkStats[k.code] && kkStats[k.code].bounds).filter(Boolean); if (ks.length) { const b = ks[0].pad(0); ks.slice(1).forEach(x => b.extend(x)); map.fitBounds(b, { padding: [20, 20] }); } }
      } catch (e) { }
    }

    /* ---------- cerita wilayah (di samping peta) */
    function drawStory() {
      story.innerHTML = '';
      if (f.cmpOn) {
        story.appendChild(h('div', { class: 'mstory-h' }, h('small', null, 'Bandingkan wilayah'), h('h2', null, f.cmp.length ? f.cmp.length + ' kab/kota dipilih' : 'Pilih kab/kota')));
        if (!f.cmp.length) { story.appendChild(h('p', { class: 'muted' }, 'Klik 2–4 kab/kota di peta atau pilih di atas peta.')); return; }
        f.cmp.forEach((code, i) => {
          const m = metricsFor(M, x => x.kk === code), d = m.top ? domByK(m.top) : null;
          story.appendChild(h('div', { class: 'cmp-srow', style: { '--sc': CMP.SLOT[i] } }, h('i', null, i + 1),
            h('div', { class: 'grow' }, h('b', null, RCA.reg.kkName(code)), h('div', { class: 'small muted' }, 'capaian ' + (RCA.reg.kk(code).capaian || '–').toLowerCase() + ' · ' + m.c3 + ' unit C3 · ' + m.c6 + ' kasus C6'),
              h('div', { class: 'cmp-rate' }, h('span', { class: 'track' }, h('i', { style: { width: m.rate + '%' } })), h('b', null, m.c3 ? m.rate + '%' : '–'), h('small', null, ' titik putus')),
              d ? h('div', { class: 'small' }, 'Akar masalah dominan: ', h('b', { style: { color: d.c } }, d.l)) : null),
            h('button', { type: 'button', class: 'iconbtn', 'aria-label': 'Lepas ' + RCA.reg.kkName(code), onclick: () => cmpToggle(code) }, '✕')));
        });
        return;
      }
      const m = metricsFor(M, pred);
      const gapsBy = {}; m.ev.filter(e => e.kind === 'gap').forEach(e => { const k = e.langkah; (gapsBy[k] = gapsBy[k] || []).push(e); });
      const topGaps = Object.entries(gapsBy).sort((a, b) => b[1].length - a[1].length).slice(0, 3);
      const doms = Object.entries(m.dom).sort((a, b) => b[1] - a[1]);
      const link = (txt, fn) => { const b = h('button', { class: 'linkbtn strong', type: 'button' }, txt); b.addEventListener('click', fn); return b; };
      story.appendChild(h('div', { class: 'mstory-h' }, h('small', null, 'Cerita wilayah'), h('h2', null, scopeLabel(sc))));
      if (!m.st.length && !m.ev.length) { story.appendChild(h('p', { class: 'muted' }, 'Belum ada data ' + (f.dikirim ? 'Valid/Dikirim' : 'Valid') + ' untuk wilayah ini.')); return; }
      story.appendChild(h('div', { class: 'mkpis' },
        h('div', null, h('b', null, m.c3), h('span', null, 'unit C3 ditelaah')), h('div', { class: m.rate >= 50 ? 'bad' : '' }, h('b', null, m.rate + '%'), h('span', null, 'dengan titik putus')),
        h('div', null, h('b', null, m.c6), h('span', null, 'kasus kematian C6')), h('div', null, h('b', null, m.c4 + m.c5), h('span', null, 'bukti layanan/data (C4, C5)'))));
      story.appendChild(h('h3', { class: 'q' }, h('span', null, '1'), 'Apa yang terjadi'));
      story.appendChild(h('p', null, m.c3 ? m.gapU + ' dari ' + m.c3 + ' unit telaah mengalami titik putus pada kaskade layanan TB-HIV' : 'Belum ada unit telaah C3.',
        topGaps.length ? [', terutama pada ', topGaps.map(([k, L], i) => [i ? (i === topGaps.length - 1 ? ' dan ' : ', ') : '', link(k + ' (' + uniq(L.map(e => e.story)).length + ' unit)', () => showDetail('Titik putus · ' + k, scopeLabel(sc), { stories: uniq(L.map(e => e.story)), ev: [], highlight: g => g.langkah === k }))]), '.'] : '.',
        m.c6 ? [' Tercatat ', link(m.c6 + ' kasus kematian', () => showDetail('Kasus kematian C6', scopeLabel(sc), { stories: m.st.filter(s => s.form === 'C6'), ev: [] })), ' yang ditelaah.'] : ''));
      story.appendChild(h('h3', { class: 'q' }, h('span', null, '2'), 'Mengapa terjadi'));
      story.appendChild(doms.length ? h('ul', { class: 'mwhy' }, doms.slice(0, 4).map(([k, n]) => {
        const L = m.ev.filter(e => e.kind !== 'gap' && e.dom.includes(k)); const fs = uniq(L.map(e => e.form));
        return h('li', null, h('i', { class: 'fdot', style: { background: domByK(k).c } }), link(domByK(k).l, () => showDetail('Penyebab · ' + domByK(k).l, scopeLabel(sc), { stories: uniq(L.map(e => e.story).filter(Boolean)), ev: L })),
          h('span', { class: 'muted' }, ' · ' + n + ' bukti dari ' + fs.join(', ')));
      })) : h('p', { class: 'notice warn' }, 'Penjelasan belum cukup untuk digolongkan. Lengkapi P22 (C3), faktor matriks CP (C4), dan B4 (C6).'));
      story.appendChild(h('h3', { class: 'q' }, h('span', null, '3'), 'Akar masalah'));
      if (doms.length) {
        const [k, n] = doms[0]; const L = m.ev.filter(e => e.kind !== 'gap' && e.dom.includes(k)); const fs = uniq(L.map(e => e.form));
        const tri = fs.length >= 2;
        story.appendChild(h('div', { class: 'mroot', style: { '--dc': domByK(k).c } }, h('b', null, domByK(k).l),
          h('p', null, 'Ranah penyebab paling sering (' + n + ' bukti). ' + (tri ? 'Dikuatkan oleh ' + fs.length + ' sumber berbeda (' + fs.join(', ') + '): triangulasi memadai.' : 'Baru dari satu sumber (' + fs.join(', ') + '): perlu dikonfirmasi dengan formulir lain.')),
          link('Lihat bukti akar masalah', () => showDetail('Akar masalah · ' + domByK(k).l, scopeLabel(sc), { stories: uniq(L.map(e => e.story).filter(Boolean)), ev: L }))));
      }
    }

    /* ---------- diagram */
    const TABS = [['sankey', 'Alur kaskade'], ['fishbone', 'Tulang ikan (fishbone)'], ['journey', 'Perjalanan pasien'], ['network', 'Jejaring bukti antar-form']];
    function drawTabs() {
      tabs.innerHTML = '';
      (f.cmpOn ? [['cmp', '⇄ Bandingkan wilayah']] : []).concat(TABS).forEach(([k, l]) => tabs.appendChild(h('button', { role: 'tab', 'aria-selected': f.tab === k ? 'true' : 'false', onclick: () => { f.tab = k; drawTabs(); drawDiag(); } }, l)));
    }
    function drawDiag() {
      diag.innerHTML = '';
      try {
        if (f.tab === 'cmp' && f.cmpOn) diag.appendChild(CMP.view(M, f.cmp, { dikirim: f.dikirim, onPick: (t, sub, o) => showDetail(t, sub, o) }));
        else if (f.tab === 'cmp') { f.tab = 'sankey'; diag.appendChild(sankey()); }
        else if (f.tab === 'fishbone') diag.appendChild(fishbone());
        else if (f.tab === 'journey') diag.appendChild(journey());
        else if (f.tab === 'network') diag.appendChild(network());
        else diag.appendChild(sankey());
      } catch (e) { console.error(e); diag.appendChild(h('div', { class: 'notice err' }, 'Diagram gagal disusun: ' + e.message)); }
    }

    /* ---- 1. alur kaskade (Sankey): wilayah → fasyankes → titik putus → faktor → akar masalah */
    function sankey() {
      const st = M.stories.filter(pred).filter(s => s.gaps.length);
      const wrap = h('div', { class: 'stack' }, h('p', { class: 'muted small' }, 'Tebal alur = jumlah titik putus. Setiap titik putus dibagi rata ke faktor penyumbang unitnya; tanpa faktor masuk "Belum ditelusuri". Klik simpul atau alur untuk melihat unit dan buktinya.'));
      if (!st.length) { wrap.appendChild(h('div', { class: 'placeholder' }, 'Belum ada unit dengan titik putus pada wilayah ini.')); return wrap; }
      const COLS = ['Kab/kota', 'Fasyankes', 'Titik putus', 'Faktor penyumbang', 'Akar masalah'];
      const nodes = new Map(), links = new Map();
      const node = (col, key, label, color) => { const id = col + '|' + key; if (!nodes.has(id)) nodes.set(id, { id, col, key, label, color, in: 0, out: 0, items: new Set() }); return nodes.get(id); };
      const link = (a, b, v, s) => { const id = a.id + '>' + b.id; if (!links.has(id)) links.set(id, { id, a, b, v: 0, items: new Set() }); const l = links.get(id); l.v += v; l.items.add(s); a.out += v; b.in += v; a.items.add(s); b.items.add(s); };
      st.forEach(s => {
        const fk = s.faktor.length ? s.faktor.map(x => x.f) : ['—'];
        s.gaps.forEach(g => {
          const n0 = node(0, s.kk, RCA.reg.kkName(s.kk).replace(/^(Kabupaten|Kota) /, ''), '#495057');
          const n1 = node(1, s.fac || '—', s.fac || '—', '#495057');
          const n2 = node(2, g.langkah, g.langkah, '#e03131');
          link(n0, n1, 1, s); link(n1, n2, 1, s);
          fk.forEach(fx => {
            const d = fx === '—' ? NONE : (domOf(fx) || NONE);
            const n3 = node(3, fx, fx === '—' ? 'Belum ditelusuri' : fx.replace(/^F\d /, ''), d.c);
            const n4 = node(4, d.k, d.l, d.c);
            link(n2, n3, 1 / fk.length, s); link(n3, n4, 1 / fk.length, s);
          });
        });
      });
      const W = 1080, H = Math.max(360, Math.min(900, 24 * Math.max(...[0, 1, 2, 3, 4].map(c => [...nodes.values()].filter(n => n.col === c).length)) + 120));
      const nw = 14, pad = 10, colX = c => 10 + c * (W - 230 - nw) / 4;   // ruang label di kanan setiap kolom
      const byCol = [0, 1, 2, 3, 4].map(c => [...nodes.values()].filter(n => n.col === c).map(n => Object.assign(n, { v: Math.max(n.in, n.out) })).sort((a, b) => b.v - a.v));
      const scale = Math.min(...byCol.map(L => (H - 60 - pad * (L.length - 1)) / Math.max(1e-6, L.reduce((t, n) => t + n.v, 0))));
      byCol.forEach(L => { let y = 30; L.forEach(n => { n.x = colX(n.col); n.y = y; n.h = Math.max(2, n.v * scale); y += n.h + pad; n.oy = n.y; n.iy = n.y; }); });
      const svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'sankey', role: 'img', 'aria-label': 'Alur kaskade dari wilayah ke akar masalah' });
      COLS.forEach((t, c) => svg.appendChild(sv('text', { x: colX(c), y: 16, class: 'colh' }, t)));
      const LS = [...links.values()].sort((p, q) => p.a.y - q.a.y || p.b.y - q.b.y);
      const g1 = sv('g', { class: 'links' });
      LS.forEach(l => {
        const w = Math.max(1, l.v * scale), y0 = l.a.oy + w / 2, y1 = l.b.iy + w / 2; l.a.oy += w; l.b.iy += w;
        const x0 = l.a.x + nw, x1 = l.b.x, xm = (x0 + x1) / 2;
        const p = sv('path', { d: `M${x0},${y0} C${xm},${y0} ${xm},${y1} ${x1},${y1}`, 'stroke-width': w, stroke: l.b.col >= 3 ? l.b.color : l.a.col === 1 ? '#e03131' : '#868e96', class: 'lk', tabindex: 0 },
          sv('title', null, l.a.label + ' → ' + l.b.label + ': ' + (Math.round(l.v * 10) / 10) + ' titik putus · ' + l.items.size + ' unit'));
        const go = () => pick(p, l.a.label + ' → ' + l.b.label, [...l.items], g => matchGap(l.a, g) && matchGap(l.b, g));
        p.addEventListener('click', go); p.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        g1.appendChild(p);
      });
      svg.appendChild(g1);
      const g2 = sv('g', { class: 'nodes' });
      [...nodes.values()].forEach(n => {
        const gr = sv('g', { class: 'nd', tabindex: 0 },
          sv('rect', { x: n.x, y: n.y, width: nw, height: n.h, fill: n.color, rx: 2 }),
          sv('text', { x: n.x + nw + 6, y: n.y + n.h / 2, 'dominant-baseline': 'middle', class: 'ndl' }, clip(n.label, n.col === 4 ? 32 : 24) + ' · ' + n.items.size),
          sv('title', null, n.label + ': ' + (Math.round(n.v * 10) / 10) + ' titik putus · ' + n.items.size + ' unit'));
        const go = () => pick(gr, COLS[n.col] + ' · ' + n.label, [...n.items], g => matchGap(n, g));
        gr.addEventListener('click', go); gr.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        g2.appendChild(gr);
      });
      svg.appendChild(g2);
      function matchGap(n, g) { return n.col === 2 ? g.langkah === n.key : true; }
      function pick(el, title, items, hl) {
        svg.querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on');
        const st2 = uniq(items);
        const ev = M.ev.filter(pred).filter(e => e.kind !== 'gap' && st2.includes(e.story));
        showDetail(title, st2.length + ' unit · ' + scopeLabel(sc), { stories: st2, ev, highlight: hl });
      }
      wrap.appendChild(h('div', { class: 'svgwrap' }, svg));
      return wrap;
    }

    /* ---- 2. tulang ikan: masalah utama di kepala, ranah penyebab sebagai tulang, CP/langkah sebagai duri */
    function fishbone() {
      const m = metricsFor(M, pred);
      const evw = m.ev.filter(e => e.kind !== 'gap');
      const wrap = h('div', { class: 'stack' }, h('p', { class: 'muted small' }, 'Kepala ikan = masalah utama wilayah. Tulang = ranah akar masalah; duri = CP/langkah dengan bukti terbanyak (jumlah bukti per formulir). Klik tulang atau duri untuk melihat buktinya.'));
      if (!evw.length) { wrap.appendChild(h('div', { class: 'placeholder' }, 'Belum ada penjelasan berfaktor pada wilayah ini.')); return wrap; }
      const W = 1080, H = 520, sy = H / 2, headW = 230, x0 = 30, x1 = W - headW - 20;
      const svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'fishbone', role: 'img', 'aria-label': 'Diagram tulang ikan akar masalah' });
      svg.appendChild(sv('line', { x1: x0, y1: sy, x2: x1, y2: sy, class: 'spine' }));
      svg.appendChild(sv('path', { d: `M${x1},${sy} L${x1 + 24},${sy - 70} L${W - 10},${sy - 70} L${W - 10},${sy + 70} L${x1 + 24},${sy + 70} Z`, class: 'head' }));
      const headTxt = m.c3 ? [m.gapU + ' dari ' + m.c3 + ' unit', 'mengalami titik putus', 'kaskade TB-HIV'] : [m.c6 + ' kasus kematian', 'dengan masalah mutu', 'layanan TB-HIV'];
      headTxt.concat([scopeLabel(sc)]).forEach((t, i) => svg.appendChild(sv('text', { x: x1 + 34, y: sy - 34 + i * 22, class: i === 3 ? 'headsub' : 'headtxt' }, clip(t, 26))));
      const doms = DOMAIN.map(d => ({ d, L: evw.filter(e => e.dom.includes(d.k)) })).filter(x => x.L.length).sort((a, b) => b.L.length - a.L.length).slice(0, 6);
      const slots = Math.ceil(doms.length / 2), step = (x1 - x0 - 60) / Math.max(1, slots);
      doms.forEach((x, i) => {
        const top = i % 2 === 0, k = Math.floor(i / 2), bx = x1 - 40 - k * step, by = top ? 40 : H - 40, ax = bx - (top ? 1 : 1) * 120;
        const g = sv('g', { class: 'bone', tabindex: 0, style: '--dc:' + x.d.c });
        g.appendChild(sv('line', { x1: ax, y1: by, x2: bx, y2: sy, stroke: x.d.c }));
        g.appendChild(sv('rect', { x: ax - 110, y: top ? by - 30 : by + 2, width: 220, height: 28, rx: 14, fill: x.d.c }));
        g.appendChild(sv('text', { x: ax, y: top ? by - 11 : by + 21, 'text-anchor': 'middle', class: 'bonelbl' }, clip(x.d.l, 28) + ' · ' + x.L.length));
        g.appendChild(sv('title', null, x.d.l + ': ' + x.L.length + ' bukti'));
        const go = () => sel(g, 'Akar masalah · ' + x.d.l, x.L);
        g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        svg.appendChild(g);
        // duri: CP/langkah terbanyak
        const by2 = {}; x.L.forEach(e => { const kk = e.cp ? e.cp + (CPL[e.cp] ? ' ' + CPL[e.cp] : '') : e.langkah; (by2[kk] = by2[kk] || []).push(e); });
        Object.entries(by2).sort((a, b) => b[1].length - a[1].length).slice(0, 4).forEach(([lab, L2], j) => {
          const t = (j + 1) / 5, px = ax + (bx - ax) * t, py = by + (sy - by) * t, len = 150;
          const forms = uniq(L2.map(e => e.form)).map(fm => fm + ' ' + L2.filter(e => e.form === fm).length).join(' · ');
          const rg = sv('g', { class: 'rib', tabindex: 0 },
            sv('line', { x1: px - len, y1: py, x2: px, y2: py, stroke: x.d.c }),
            sv('text', { x: px - len, y: py - 5, class: 'riblbl' }, clip(lab, 30)),
            sv('text', { x: px - len, y: py + 13, class: 'ribsub' }, forms),
            sv('title', null, lab + ' — ' + forms));
          const go2 = () => sel(rg, x.d.l + ' · ' + lab, L2);
          rg.addEventListener('click', go2); rg.addEventListener('keydown', e => { if (e.key === 'Enter') go2(); });
          svg.appendChild(rg);
        });
      });
      function sel(el, title, L) {
        svg.querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on');
        showDetail(title, L.length + ' bukti · ' + scopeLabel(sc), { stories: uniq(L.map(e => e.story).filter(Boolean)), ev: L });
      }
      wrap.appendChild(h('div', { class: 'svgwrap' }, svg));
      return wrap;
    }

    /* ---- 3. perjalanan pasien: linimasa individu dengan titik putus dan penjelasan */
    function journey() {
      const st = M.stories.filter(pred).sort((a, b) => b.gapCount - a.gapCount || String(a.unit).localeCompare(String(b.unit)));
      const wrap = h('div', { class: 'journey' });
      if (!st.length) { wrap.appendChild(h('div', { class: 'placeholder' }, 'Belum ada unit C3 atau kasus C6 pada wilayah ini.')); return wrap; }
      if (!f.jsel || !st.some(s => s.key === f.jsel)) f.jsel = st[0].key;
      const list = h('div', { class: 'jlist', role: 'listbox', 'aria-label': 'Pilih individu' });
      const view = h('div', { class: 'jview' });
      st.slice(0, 200).forEach(s => {
        const b = h('button', { type: 'button', role: 'option', class: 'jopt', 'aria-selected': s.key === f.jsel ? 'true' : 'false' },
          h('b', null, s.unit), h('small', null, [s.form === 'C6' ? 'Kematian' : s.frame, s.fac, s.profil].filter(Boolean).join(' · ')),
          s.gapCount ? h('span', { class: 'jn bad' }, s.gapCount + ' titik putus') : h('span', { class: 'jn ok' }, 'tanpa titik putus'));
        b.addEventListener('click', () => { f.jsel = s.key; list.querySelectorAll('.jopt').forEach(x => x.setAttribute('aria-selected', 'false')); b.setAttribute('aria-selected', 'true'); draw(s); });
        list.appendChild(b);
      });
      function draw(s) {
        view.innerHTML = '';
        view.appendChild(h('div', { class: 'jhead' }, h('h3', null, s.unit), h('p', { class: 'muted' }, [s.form === 'C6' ? 'Kasus kematian C6' : 'Unit telaah ' + s.frame, s.fac + ' · ' + RCA.reg.kkName(s.kk), s.profil].filter(Boolean).join(' · ')), h('p', null, s.ringkas)));
        const tl = s.timeline.filter(t => t.tgl && !isNaN(new Date(t.tgl)));
        const W = 1000, H = 310, x0 = 50, x1 = W - 60, yA = 130, yG = 225;
        const svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'jsvg', role: 'img', 'aria-label': 'Linimasa ' + s.unit });
        svg.appendChild(sv('text', { x: 0, y: 24, class: 'lane' }, 'Peristiwa layanan'));
        svg.appendChild(sv('text', { x: 0, y: yG - 34, class: 'lane' }, 'Titik putus dan penyebab'));
        if (tl.length) {
          const t0 = new Date(tl[0].tgl).getTime(), t1 = new Date(tl[tl.length - 1].tgl).getTime(), span = Math.max(1, t1 - t0);
          const X = d => tl.length === 1 ? (x0 + x1) / 2 : x0 + (new Date(d).getTime() - t0) / span * (x1 - x0);
          svg.appendChild(sv('line', { x1: x0, y1: yA, x2: x1, y2: yA, class: 'axis' }));
          // peristiwa pada tanggal yang sama digabung; label disusun bertingkat agar tidak bertumpuk
          const grp = []; tl.forEach(t => { const g = grp.find(x => x.tgl.slice(0, 10) === String(t.tgl).slice(0, 10)); if (g) g.L.push(t); else grp.push({ tgl: String(t.tgl), L: [t] }); });
          const rowEnd = [-1e9, -1e9, -1e9, -1e9]; let lastDate = -1e9;
          grp.forEach(G => {
            const x = X(G.tgl), t = G.L[0], lab = clip(t.label, 22) + (G.L.length > 1 ? ' +' + (G.L.length - 1) : '');
            const wLab = lab.length * 6.2, anc = x > x1 - wLab / 2 ? 'end' : x < x0 + wLab / 2 ? 'start' : 'middle';
            const left = anc === 'end' ? x - wLab : anc === 'start' ? x : x - wLab / 2;
            let row = rowEnd.findIndex(e => left > e + 6); if (row < 0) row = rowEnd.indexOf(Math.min(...rowEnd));
            rowEnd[row] = left + wLab;
            const bad = G.L.some(e => /mati|meninggal/i.test(e.label)), weak = G.L.some(e => e.st && e.st !== 'Y');
            const showDate = x - lastDate > 86; if (showDate) lastDate = x;
            const g = sv('g', { class: 'jev' + (bad ? ' death' : '') + (weak ? ' weak' : ''), tabindex: 0 },
              sv('line', { x1: x, y1: yA, x2: x, y2: yA - 18 - row * 19, class: 'stem' }),
              sv('circle', { cx: x, cy: yA, r: bad ? 9 : G.L.length > 1 ? 8 : 6 }),
              G.L.length > 1 ? sv('text', { x, y: yA + 4, 'text-anchor': 'middle', class: 'cnt' }, G.L.length) : null,
              sv('text', { x, y: yA - 22 - row * 19, 'text-anchor': anc }, lab),
              showDate ? sv('text', { x, y: yA + 24, 'text-anchor': anc, class: 'date' }, RCA.story.fmt(G.tgl) + (t.hari !== '' && t.hari !== undefined ? ' · H' + (t.hari >= 0 ? '+' : '') + t.hari : '')) : null,
              sv('title', null, G.L.map(e => e.label + ' · ' + RCA.story.fmt(e.tgl) + (e.st ? ' · St ' + e.st : '') + (e.src ? ' · ' + e.src : '')).join('\n')));
            const go = () => { svg.querySelectorAll('.on').forEach(z => z.classList.remove('on')); g.classList.add('on');
              showDetail(s.unit + ' · ' + RCA.story.fmt(G.tgl), G.L.map(e => e.label + (e.kode ? ' (' + e.kode + ')' : '') + (e.st ? ' · St ' + e.st + ' ' + (RCA.story.ST[e.st] || '') : '') + (e.src ? ' · sumber ' + e.src : '')).join(' · '), { stories: [s], ev: M.ev.filter(e => e.story === s && e.kind !== 'gap') }); };
            g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
            svg.appendChild(g);
          });
        } else svg.appendChild(sv('text', { x: x0, y: yA, class: 'muted' }, 'Tanggal layanan tidak tercatat.'));
        const gw = (x1 - x0) / Math.max(1, s.gaps.length);
        s.gaps.forEach((gp, i) => {
          const x = x0 + gw * i + gw / 2;
          const g = sv('g', { class: 'jgap', tabindex: 0 },
            sv('rect', { x: x - Math.min(gw, 180) / 2 + 4, y: yG - 20, width: Math.min(gw, 180) - 8, height: 46, rx: 8 }),
            sv('text', { x, y: yG - 2, 'text-anchor': 'middle', class: 'gl' }, clip(gp.cp + ' · ' + gp.langkah, 26)),
            sv('text', { x, y: yG + 15, 'text-anchor': 'middle', class: 'gj' }, clip(gp.jenis, 28)),
            sv('title', null, gp.langkah + ': ' + gp.teks));
          const go = () => { svg.querySelectorAll('.on').forEach(x => x.classList.remove('on')); g.classList.add('on'); showDetail(s.unit + ' · titik putus ' + gp.cp, gp.langkah + ' · ' + gp.jenis, { stories: [s], ev: M.ev.filter(e => e.story === s && e.kind !== 'gap'), highlight: g2 => g2 === gp }); };
          g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
          svg.appendChild(g);
        });
        if (!s.gaps.length) svg.appendChild(sv('text', { x: x0, y: yG, class: 'okt' }, 'Tidak ada titik putus pada langkah yang dinilai.'));
        view.appendChild(h('div', { class: 'svgwrap' }, svg));
        view.appendChild(h('div', { class: 'jwhy' }, h('b', null, 'Mengapa: '), s.faktor.length ? s.faktor.map(x => h('span', { class: 'chip dom', style: { '--dc': (domOf(x.f) || NONE).c } }, x.f)) : h('span', { class: 'muted' }, 'belum ada penjelasan berfaktor'),
          s.kasusC6 ? h('span', { class: 'chip' }, 'terkait kasus kematian ' + s.kasusC6) : null, s.unitC3 ? h('span', { class: 'chip' }, 'terkait unit C3 ' + s.unitC3) : null,
          canRaw && RCA.anlPanel.fotoOf(s) ? h('span', { class: 'chip' }, '📷 ' + RCA.anlPanel.fotoOf(s) + ' foto') : null,
          h('button', { class: 'btn small', type: 'button', onclick: () => showDetail('Cerita lengkap · ' + s.unit, scopeLabel(sc), { stories: [s], ev: M.ev.filter(e => e.story === s && e.kind !== 'gap') }) }, 'Lihat bukti lengkap')));
      }
      draw(st.find(s => s.key === f.jsel));
      wrap.appendChild(list); wrap.appendChild(view);
      return wrap;
    }

    /* ---- 4. jejaring bukti antarformulir: formulir di lingkar dalam, ranah akar masalah di luar */
    function network() {
      const m = metricsFor(M, pred);
      const evw = m.ev.filter(e => e.kind !== 'gap');
      const wrap = h('div', { class: 'stack' }, h('p', { class: 'muted small' }, 'Lingkar dalam = formulir sumber bukti; lingkar luar = ranah akar masalah. Garis formulir–ranah = jumlah bukti; garis antarformulir = rekaman yang saling tertaut (pasien, CP, atau fasyankes yang sama). Klik simpul atau garis.'));
      if (!m.ev.length && !m.st.length) { wrap.appendChild(h('div', { class: 'placeholder' }, 'Belum ada bukti pada wilayah ini.')); return wrap; }
      const W = 1000, H = 600, cx = W / 2, cy = H / 2;
      const svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'netsvg', role: 'img', 'aria-label': 'Jejaring bukti antarformulir' });
      const fms = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
      const fpos = {}; fms.forEach((k, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / fms.length; fpos[k] = [cx + 150 * Math.cos(a), cy + 150 * Math.sin(a)]; });
      const doms = DOMAIN.filter(d => evw.some(e => e.dom.includes(d.k)));
      const dpos = {}; doms.forEach((d, i) => { const a = -Math.PI / 2 + (i + 0.5) * 2 * Math.PI / Math.max(1, doms.length); dpos[d.k] = [cx + 285 * Math.cos(a), cy + 250 * Math.sin(a)]; });
      const fcount = k => k === 'C3' || k === 'C6' ? m.st.filter(s => s.form === k).length : m.ev.filter(e => e.form === k).length;
      // garis formulir–ranah
      const gl = sv('g', { class: 'nlinks' });
      const edge = (p, q, w, color, title, go, cls) => { const e = sv('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], 'stroke-width': Math.max(1.5, Math.min(14, w)), stroke: color, class: 'nl ' + (cls || ''), tabindex: 0 }, sv('title', null, title)); e.addEventListener('click', () => go(e)); e.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(e); }); gl.appendChild(e); };
      fms.forEach(k => doms.forEach(d => {
        const L = evw.filter(e => e.form === k && e.dom.includes(d.k)); if (!L.length) return;
        edge(fpos[k], dpos[d.k], 1.5 + Math.sqrt(L.length) * 2, d.c, k + ' → ' + d.l + ': ' + L.length + ' bukti', el => sel(el, k + ' → ' + d.l, L));
      }));
      // garis antarformulir (tautan rekaman)
      const st = m.st;
      const x36 = st.filter(s => s.form === 'C3' && s.kasusC6);
      const x35 = m.ev.filter(e => e.form === 'C5' && e.unitC3 && st.some(s => s.unit === e.unitC3));
      const cpGap = new Set(m.ev.filter(e => e.kind === 'gap' && e.form === 'C3').map(e => e.fac + '|' + e.cp));
      const x34 = m.ev.filter(e => e.form === 'C4' && cpGap.has(e.fac + '|' + e.cp));
      const x14 = m.ev.filter(e => e.form === 'C1' && m.ev.some(c => c.form === 'C4' && c.cp && c.cp === e.cp));
      const x74 = m.ev.filter(e => e.form === 'C7' && e.cp && m.ev.some(c => c.form === 'C4' && c.cp === e.cp));
      [['C3', 'C6', x36.length, 'pasien yang sama', () => ({ stories: x36.concat(st.filter(s => s.form === 'C6' && x36.some(a => a.kasusC6 === s.unit))), ev: [] })],
        ['C3', 'C5', x35.length, 'baris data pasien yang sama', () => ({ stories: st.filter(s => x35.some(e => e.unitC3 === s.unit)), ev: x35 })],
        ['C3', 'C4', x34.length, 'CP yang sama di fasyankes yang sama', () => ({ stories: uniq(m.ev.filter(e => e.kind === 'gap' && x34.some(c => c.fac === e.fac && c.cp === e.cp)).map(e => e.story)), ev: x34 })],
        ['C1', 'C4', x14.length, 'dugaan C1 diuji pada CP C4', () => ({ stories: [], ev: x14.concat(m.ev.filter(c => c.form === 'C4' && x14.some(e => e.cp === c.cp))) })],
        ['C7', 'C4', x74.length, 'tema wawancara pada CP yang sama', () => ({ stories: [], ev: x74.concat(m.ev.filter(c => c.form === 'C4' && x74.some(e => e.cp === c.cp))) })]
      ].forEach(([a, b, n, lab, get]) => { if (n) edge(fpos[a], fpos[b], 1.5 + Math.sqrt(n) * 2, '#343a40', a + ' ↔ ' + b + ': ' + n + ' ' + lab, el => { const o = get(); sel(el, a + ' ↔ ' + b + ' · ' + lab, o.ev, o.stories); }, 'x'); });
      svg.appendChild(gl);
      // simpul
      const gn = sv('g', { class: 'nnodes' });
      svg.appendChild(sv('circle', { cx, cy, r: 46, class: 'ncenter' })); svg.appendChild(sv('text', { x: cx, y: cy - 4, 'text-anchor': 'middle', class: 'nct' }, clip(scopeLabel(sc), 18))); svg.appendChild(sv('text', { x: cx, y: cy + 14, 'text-anchor': 'middle', class: 'ncs' }, m.ev.length + ' bukti'));
      fms.forEach(k => {
        const n = fcount(k), r = 18 + Math.min(18, Math.sqrt(n) * 3), [x, y] = fpos[k];
        const g = sv('g', { class: 'nn' + (n ? '' : ' off'), tabindex: 0 }, sv('circle', { cx: x, cy: y, r, fill: FCOL[k] }), sv('text', { x, y: y + 4, 'text-anchor': 'middle', class: 'nk' }, k),
          sv('text', { x, y: y + r + 14, 'text-anchor': 'middle', class: 'nl2' }, n + (k === 'C3' ? ' unit' : k === 'C6' ? ' kasus' : ' bukti')), sv('title', null, k + ' · ' + FORMS[k]));
        const go = () => sel(g, k + ' · ' + FORMS[k], m.ev.filter(e => e.form === k && !e.story), m.st.filter(s => s.form === k));
        g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        gn.appendChild(g);
      });
      doms.forEach(d => {
        const L = evw.filter(e => e.dom.includes(d.k)), [x, y] = dpos[d.k], wdt = 168;
        const g = sv('g', { class: 'nd2', tabindex: 0 }, sv('rect', { x: x - wdt / 2, y: y - 20, width: wdt, height: 40, rx: 20, fill: d.c }),
          sv('text', { x, y: y - 2, 'text-anchor': 'middle', class: 'dl' }, clip(d.l, 24)), sv('text', { x, y: y + 13, 'text-anchor': 'middle', class: 'ds' }, L.length + ' bukti · ' + uniq(L.map(e => e.form)).length + ' formulir'),
          sv('title', null, d.l));
        const go = () => sel(g, 'Akar masalah · ' + d.l, L);
        g.addEventListener('click', go); g.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        gn.appendChild(g);
      });
      svg.appendChild(gn);
      function sel(el, title, L, stories) {
        svg.querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on');
        showDetail(title, scopeLabel(sc), { stories: stories || uniq((L || []).map(e => e.story).filter(Boolean)), ev: L || [] });
      }
      wrap.appendChild(h('div', { class: 'svgwrap' }, svg));
      return wrap;
    }

    /* ---------- remah wilayah */
    function drawCrumbs() {
      crumbs.innerHTML = '';
      const parts = [['Semua wilayah', {}]];
      if (sc.prov) parts.push([RCA.reg.prov(sc.prov).name, { prov: sc.prov }]);
      if (sc.kk) parts.push([RCA.reg.kkName(sc.kk), { prov: sc.prov, kk: sc.kk }]);
      if (sc.fac) parts.push([sc.fac, { prov: sc.prov, kk: sc.kk, fac: sc.fac }]);
      parts.forEach(([l, o], i) => { if (i) crumbs.appendChild(h('span', { class: 'sep' }, '›')); crumbs.appendChild(i === parts.length - 1 ? h('b', null, l) : h('button', { class: 'linkbtn', type: 'button', onclick: () => setScope(o) }, l)); });
      const provSel = h('select', { 'aria-label': 'Provinsi' }, h('option', { value: '' }, 'Pilih provinsi…'), RCA.state.regions.prov.map(p => h('option', { value: p.code, selected: sc.prov === p.code }, p.name)));
      provSel.addEventListener('change', () => setScope({ prov: provSel.value }));
      crumbs.appendChild(provSel);
    }
    function refresh(from) {
      drawCmpBox(); drawTabs(); drawCrumbs(); drawStory(); drawDiag();
      if (map) { drawMap(); if (from !== 'map' || sc.kk) fitScope(); }
      if (from === 'cmp') return;
      if (from === 'map' || from === 'crumb') { detail.dataset.quiet = '1'; const m = metricsFor(M, pred); showDetail('Wilayah · ' + scopeLabel(sc), m.c3 + ' unit C3 · ' + m.c6 + ' kasus C6 · ' + m.ev.filter(e => e.kind !== 'gap').length + ' bukti penyebab', { stories: m.st.filter(s => s.gapCount).slice(0, 40), ev: m.ev.filter(e => !e.story) }); }
    }
    drawCmpBox(); drawTabs(); drawCrumbs(); drawStory(); drawDiag();
    detail.appendChild(hint());
    initMap();
  };
})();
