/* RCA TB-HIV 2026 · Bandingkan wilayah (2–4 kab/kota), dipakai Dashboard Analisis dan Dashboard Mapping.
   Setiap kab/kota punya warna tetap (slot 1–4). Tampilan:
   - kartu ringkas per kab/kota (unit, % titik putus, kasus C6, CP bermasalah, data C5, akar masalah dominan),
   - ringkasan perbedaan otomatis,
   - titik putus per langkah kaskade (batang berkelompok, % unit),
   - profil akar masalah (batang 100% bertumpuk),
   - 14 CP C4 (sel per kab/kota), kualitas data C5, kategori kematian C6.
   Setiap batang/sel dapat diklik: opts.onPick(judul, keterangan, {stories, ev, highlight}). */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const CMP = RCA.compare = {};
  const SLOT = ['#1c7ed6', '#e8590c', '#2f9e44', '#9c36b5'];
  const SLOTBG = ['#e7f5ff', '#fff4e6', '#ebfbee', '#f8f0fc'];
  CMP.SLOT = SLOT; CMP.MAX = 4;
  const uniq = a => [...new Set(a)];
  const pct = (n, N) => N ? Math.round(n / N * 100) : 0;
  const short = kk => RCA.reg.kkName(kk).replace(/^(Kabupaten|Kota) /, '');
  const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
  const cpNum = cp => { const m = /^CP(\d+)/.exec(cp || ''); return m ? +m[1] : /^R/.test(cp || '') ? 50 : /^T(\d)/.test(cp || '') ? 60 + +cp[1] : /^D\d/.test(cp || '') ? 70 : 90; };

  /* ---------------- pemilih wilayah (chip berwarna + daftar per provinsi) */
  CMP.picker = function (sel, onChange, opts) {
    opts = opts || {};
    const box = h('div', { class: 'cmp-pick', role: 'group', 'aria-label': 'Kab/kota yang dibandingkan' });
    const draw = () => {
      box.innerHTML = '';
      box.appendChild(h('b', { class: 'cmp-pick-l' }, 'Bandingkan (2–4 kab/kota):'));
      sel.forEach((kk, i) => box.appendChild(h('span', { class: 'cmp-chip', style: { '--sc': SLOT[i], '--sb': SLOTBG[i] } }, h('i', null, i + 1), short(kk),
        h('button', { type: 'button', 'aria-label': 'Hapus ' + RCA.reg.kkName(kk), onclick: () => { sel.splice(i, 1); onChange(sel.slice()); } }, '✕'))));
      if (sel.length < CMP.MAX) {
        const s = h('select', { 'aria-label': 'Tambah kab/kota' }, h('option', { value: '' }, sel.length ? '+ Tambah kab/kota' : 'Pilih kab/kota pertama…'),
          RCA.state.regions.prov.map(p => h('optgroup', { label: p.name }, RCA.state.regions.kk.filter(k => k.prov === p.code && !sel.includes(k.code)).map(k => h('option', { value: k.code }, k.name + (k.capaian ? ' (capaian ' + k.capaian.toLowerCase() + ')' : ''))))));
        s.addEventListener('change', () => { if (s.value) { sel.push(s.value); onChange(sel.slice()); } });
        box.appendChild(s);
      }
      const pairs = RCA.state.regions.prov.filter(p => RCA.state.regions.kk.filter(k => k.prov === p.code).length === 2);
      if (opts.presets !== false) {
        const pr = h('select', { 'aria-label': 'Pilihan cepat', class: 'cmp-preset' }, h('option', { value: '' }, 'Pilihan cepat…'),
          pairs.map(p => h('option', { value: 'p:' + p.code }, p.name + ': capaian rendah vs tinggi')),
          h('option', { value: 'low' }, 'Empat kab/kota capaian rendah pertama'), h('option', { value: 'high' }, 'Empat kab/kota capaian tinggi pertama'));
        pr.addEventListener('change', () => {
          const v = pr.value; if (!v) return;
          let L = v.startsWith('p:') ? RCA.state.regions.kk.filter(k => k.prov === v.slice(2)).sort((a, b) => (a.capaian === 'Rendah' ? 0 : 1) - (b.capaian === 'Rendah' ? 0 : 1)).map(k => k.code)
            : RCA.state.regions.kk.filter(k => k.capaian === (v === 'low' ? 'Rendah' : 'Tinggi')).map(k => k.code).slice(0, 4);
          sel.splice(0, sel.length, ...L); onChange(sel.slice());
        });
        box.appendChild(pr);
      }
      if (sel.length) box.appendChild(h('button', { type: 'button', class: 'linkbtn', onclick: () => { sel.splice(0); onChange([]); } }, 'Kosongkan'));
    };
    draw();
    return box;
  };

  /* ---------------- data per kab/kota */
  function stat(M, kk) {
    const MM = RCA.mapModel;
    const m = MM.metricsFor(M, x => x.kk === kk);
    const c3 = m.st.filter(s => s.form === 'C3'), c6 = m.st.filter(s => s.form === 'C6');
    const gapBy = {}; c3.forEach(s => uniq(s.gaps.map(g => g.langkah)).forEach(l => { (gapBy[l] = gapBy[l] || []).push(s); }));
    const cpOf = {}; c3.forEach(s => s.gaps.forEach(g => { if (!cpOf[g.langkah] || cpNum(g.cp) < cpNum(cpOf[g.langkah])) cpOf[g.langkah] = g.cp; }));
    const why = m.ev.filter(e => e.kind !== 'gap');
    const domEv = {}; why.forEach(e => e.dom.forEach(d => { (domEv[d] = domEv[d] || []).push(e); }));
    const c4 = ((M.V.C4 || {}).C4 || []).filter(r => (r.kk || RCA.reg.fac(r.unit).kk) === kk);
    const c5rows = ['C5_5', 'C5_6', 'C5_41a'].reduce((t, sub) => t + ((M.V.C5 || {})[sub] || []).filter(r => (r.kk || RCA.reg.fac(r.fac).kk) === kk).reduce((a, r) => a + ((r.data.cocok || []).length), 0), 0);
    const c5bad = m.ev.filter(e => e.form === 'C5');
    const kat = {}; c6.forEach(s => { const k = s.kategori || 'Tidak diketahui'; (kat[k] = kat[k] || []).push(s); });
    const forms = uniq(why.map(e => e.form));
    const top = Object.entries(domEv).sort((a, b) => b[1].length - a[1].length)[0];
    return { kk, m, c3, c6, gapBy, cpOf, why, domEv, c4, c5rows, c5bad, kat, forms, top: top ? top[0] : '', topForms: top ? uniq(top[1].map(e => e.form)) : [] };
  }

  /* ---------------- tampilan perbandingan */
  CMP.view = function (M, kks, opts) {
    opts = opts || {};
    const MM = RCA.mapModel;
    const pick = (title, sub, o, el) => { if (el) { el.closest('.cmp').querySelectorAll('.on').forEach(x => x.classList.remove('on')); el.classList.add('on'); } if (opts.onPick) opts.onPick(title, sub, o); };
    const wrap = h('div', { class: 'cmp' });
    if (kks.length < 2) {
      wrap.appendChild(h('div', { class: 'placeholder' }, kks.length ? 'Tambah satu kab/kota lagi untuk mulai membandingkan (maksimal 4).' : 'Pilih 2 sampai 4 kab/kota, atau gunakan Pilihan cepat (mis. capaian rendah vs tinggi dalam satu provinsi).'));
      return wrap;
    }
    const S = kks.map(kk => stat(M, kk));
    const col = i => ({ '--sc': SLOT[i], '--sb': SLOTBG[i] });
    wrap.style.setProperty('--n', S.length);

    /* 1. kartu */
    const cards = h('div', { class: 'cmp-cards' });
    const maxRate = Math.max(...S.map(x => x.m.rate));
    S.forEach((x, i) => {
      const k = RCA.reg.kk(x.kk), d = x.top ? MM.domByK(x.top) : null;
      const kpi = (label, val, sub, hl, fn) => { const b = h('button', { type: 'button', class: 'cmp-kpi' + (hl ? ' hl' : ''), disabled: !fn }, h('b', null, val), h('span', null, label), sub ? h('small', null, sub) : null); if (fn) b.addEventListener('click', () => fn(b)); return b; };
      cards.appendChild(h('div', { class: 'cmp-card', style: col(i) },
        h('div', { class: 'cmp-card-h' }, h('i', null, i + 1), h('div', null, h('b', null, k.name || x.kk), h('small', null, (RCA.reg.prov(k.prov).name || '') + (k.capaian ? ' · capaian ' + k.capaian.toLowerCase() : '')))),
        h('div', { class: 'cmp-kpis' },
          kpi('unit C3 ditelaah', x.m.c3, null, false, x.c3.length ? b => pick(short(x.kk) + ' · unit C3', x.m.c3 + ' unit', { stories: x.c3, ev: [] }, b) : null),
          kpi('dengan titik putus', x.m.c3 ? x.m.rate + '%' : '–', x.m.gapU + '/' + x.m.c3, x.m.c3 && x.m.rate === maxRate && S.length > 1, x.m.gapU ? b => pick(short(x.kk) + ' · unit dengan titik putus', x.m.gapU + ' dari ' + x.m.c3 + ' unit', { stories: x.c3.filter(s => s.gapCount), ev: [] }, b) : null),
          kpi('kasus kematian C6', x.m.c6, null, false, x.c6.length ? b => pick(short(x.kk) + ' · kasus kematian', x.c6.length + ' kasus', { stories: x.c6, ev: [] }, b) : null),
          kpi('CP bermasalah (C4)', x.m.c4, x.c4.length ? x.c4.length + ' fasyankes dinilai' : 'C4 belum ada', false, x.m.c4 ? b => pick(short(x.kk) + ' · CP bermasalah (C4)', x.m.c4 + ' CP', { stories: [], ev: x.m.ev.filter(e => e.form === 'C4') }, b) : null),
          kpi('baris data tidak sesuai (C5)', x.c5bad.length, x.c5rows ? 'dari ' + x.c5rows + ' baris (' + pct(x.c5bad.length, x.c5rows) + '%)' : 'C5 belum ada', false, x.c5bad.length ? b => pick(short(x.kk) + ' · data C5 tidak sesuai', x.c5bad.length + ' baris', { stories: [], ev: x.c5bad }, b) : null)),
        h('div', { class: 'cmp-root', style: d ? { '--dc': d.c } : null }, h('small', null, 'Akar masalah dominan'),
          d ? h('button', { type: 'button', class: 'linkbtn', onclick: e => pick(short(x.kk) + ' · ' + d.l, x.domEv[x.top].length + ' bukti', { stories: uniq(x.domEv[x.top].map(e => e.story).filter(Boolean)), ev: x.domEv[x.top] }, e.currentTarget) }, d.l) : h('span', { class: 'muted' }, 'belum cukup bukti'),
          d ? h('small', { class: 'muted' }, x.domEv[x.top].length + ' bukti · ' + x.topForms.join(', ') + (x.topForms.length >= 2 ? ' (triangulasi)' : ' (satu sumber)')) : null)));
    });
    wrap.appendChild(cards);

    /* 2. ringkasan perbedaan */
    const sum = [];
    const withC3 = S.filter(x => x.m.c3);
    if (withC3.length >= 2) {
      const hi = withC3.reduce((a, b) => b.m.rate > a.m.rate ? b : a), lo = withC3.reduce((a, b) => b.m.rate < a.m.rate ? b : a);
      if (hi !== lo) sum.push([h('b', null, short(hi.kk)), ' memiliki proporsi unit dengan titik putus tertinggi (' + hi.m.rate + '%), ', h('b', null, short(lo.kk)), ' terendah (' + lo.m.rate + '%); selisih ' + (hi.m.rate - lo.m.rate) + ' poin persentase.']);
      else sum.push('Proporsi unit dengan titik putus sama di semua wilayah (' + hi.m.rate + '%).');
      // langkah dengan selisih terbesar
      const steps = uniq(withC3.flatMap(x => Object.keys(x.gapBy)));
      const diff = steps.map(l => { const v = withC3.map(x => pct((x.gapBy[l] || []).length, x.m.c3)); return { l, v, d: Math.max(...v) - Math.min(...v), hi: withC3[v.indexOf(Math.max(...v))] }; }).sort((a, b) => b.d - a.d)[0];
      if (diff && diff.d >= 10) sum.push(['Perbedaan terbesar pada langkah ', h('b', null, diff.l), ': ' + withC3.map((x, i) => short(x.kk) + ' ' + diff.v[i] + '%').join(', ') + ' (tertinggi di ' + short(diff.hi.kk) + ').']);
    } else if (S.some(x => !x.m.c3)) sum.push('Sebagian wilayah belum memiliki unit C3 ' + (opts.dikirim ? 'Valid/Dikirim' : 'Valid') + ': ' + S.filter(x => !x.m.c3).map(x => short(x.kk)).join(', ') + '.');
    const tops = S.filter(x => x.top);
    if (tops.length >= 2) {
      const same = uniq(tops.map(x => x.top));
      sum.push(same.length === 1 ? ['Akar masalah dominan sama di semua wilayah: ', h('b', null, MM.domByK(same[0]).l), '. Ini mengarah pada masalah sistemik lintas wilayah.']
        : ['Akar masalah dominan berbeda: ' + tops.map(x => short(x.kk) + ' → ' + MM.domByK(x.top).l).join('; ') + '. Intervensi perlu disesuaikan per wilayah.']);
    }
    const capL = S.filter(x => RCA.reg.kk(x.kk).capaian === 'Rendah' && x.m.c3), capH = S.filter(x => RCA.reg.kk(x.kk).capaian === 'Tinggi' && x.m.c3);
    if (capL.length && capH.length) {
      const a = Math.round(capL.reduce((t, x) => t + x.m.rate, 0) / capL.length), b = Math.round(capH.reduce((t, x) => t + x.m.rate, 0) / capH.length);
      sum.push('Rata-rata titik putus wilayah capaian rendah ' + a + '% vs capaian tinggi ' + b + '%' + (a > b ? ': konsisten dengan dasar pemilihan lokasi.' : a < b ? ': berlawanan dengan dugaan awal, perlu ditelaah (mis. perbedaan kelengkapan pencatatan).' : '.'));
    }
    if (sum.length) wrap.appendChild(h('div', { class: 'cmp-sum' }, h('h3', null, 'Ringkasan perbandingan'), h('ul', null, sum.map(x => h('li', null, x)))));

    const legend = () => h('div', { class: 'cmp-legend' }, S.map((x, i) => h('span', { style: col(i) }, h('i'), short(x.kk))));
    const section = (title, note, body) => h('section', { class: 'cmp-sec' }, h('div', { class: 'cmp-sec-h' }, h('h3', null, title), legend()), note ? h('p', { class: 'muted small' }, note) : null, body);

    /* 3. titik putus per langkah kaskade (batang berkelompok) */
    const SC = S.map((x, i) => Object.assign(x, { i })).filter(x => x.m.c3);
    const steps = uniq(SC.flatMap(x => Object.keys(x.gapBy)));
    const cpOf = l => S.map(x => x.cpOf[l]).filter(Boolean).sort((a, b) => cpNum(a) - cpNum(b))[0] || '';
    steps.sort((a, b) => cpNum(cpOf(a)) - cpNum(cpOf(b)) || a.localeCompare(b));
    if (steps.length) {
      const grid = h('div', { class: 'cmp-gbars' });
      steps.forEach(l => {
        const vals = SC.map(x => pct((x.gapBy[l] || []).length, x.m.c3)), mx = Math.max(...vals);
        grid.appendChild(h('div', { class: 'cmp-gl' }, h('b', null, l), h('small', null, cpOf(l))));
        grid.appendChild(h('div', { class: 'cmp-gb' }, SC.map((x, j) => {
          const L = x.gapBy[l] || [], v = vals[j], i = x.i;
          const b = h('button', { type: 'button', class: 'cmp-bar' + (v === mx && v > 0 && SC.length > 1 ? ' max' : ''), style: col(i), disabled: !L.length, title: short(x.kk) + ': ' + L.length + '/' + x.m.c3 + ' unit (' + v + '%)', 'aria-label': short(x.kk) + ' ' + l + ' ' + v + ' persen' },
            h('span', { class: 'track' }, h('i', { style: { width: Math.max(v ? 2 : 0, v) + '%' } })), h('span', { class: 'v' }, x.m.c3 ? v + '% (' + L.length + ')' : '–'));
          if (L.length) b.addEventListener('click', () => pick(short(x.kk) + ' · titik putus ' + l, L.length + ' dari ' + x.m.c3 + ' unit', { stories: L, ev: [], highlight: g => g.langkah === l }, b));
          return b;
        })));
      });
      const miss = S.filter(x => !x.m.c3);
      wrap.appendChild(section('1 · Apa yang terjadi: titik putus per langkah kaskade', '% unit C3 di kab/kota itu yang terputus pada langkah tersebut (jumlah unit). Batang bergaris tebal = tertinggi di antara wilayah. Klik batang untuk melihat unitnya.' + (miss.length ? ' Belum ada unit C3: ' + miss.map(x => short(x.kk)).join(', ') + '.' : ''), grid));
    }

    /* 4. profil akar masalah (100% bertumpuk) */
    const doms = MM.DOMAIN.filter(d => S.some(x => (x.domEv[d.k] || []).length));
    if (doms.length) {
      const rows = h('div', { class: 'cmp-stack' });
      S.forEach((x, i) => {
        const tot = doms.reduce((t, d) => t + (x.domEv[d.k] || []).length, 0);
        const bar = h('div', { class: 'sbar' });
        doms.forEach(d => {
          const L = x.domEv[d.k] || []; if (!L.length) return;
          const p = L.length / tot * 100;
          const seg = h('button', { type: 'button', class: 'seg', style: { width: p + '%', background: d.c }, title: d.l + ': ' + L.length + ' bukti (' + Math.round(p) + '%)', 'aria-label': short(x.kk) + ' ' + d.l + ' ' + Math.round(p) + ' persen' }, p >= 9 ? Math.round(p) + '%' : '');
          seg.addEventListener('click', () => pick(short(x.kk) + ' · ' + d.l, L.length + ' bukti dari ' + uniq(L.map(e => e.form)).join(', '), { stories: uniq(L.map(e => e.story).filter(Boolean)), ev: L }, seg));
          bar.appendChild(seg);
        });
        rows.appendChild(h('div', { class: 'srow', style: col(i) }, h('span', { class: 'sl' }, h('i', null, i + 1), short(x.kk), h('small', null, tot + ' bukti')), tot ? bar : h('span', { class: 'muted small' }, 'belum ada penjelasan berfaktor')));
      });
      const key = h('div', { class: 'cmp-domkey' }, doms.map(d => h('span', null, h('i', { style: { background: d.c } }), d.l)));
      const tbl = RCA.anl.tbl(['Akar masalah'].concat(S.map(x => short(x.kk))), doms.map(d => [d.l].concat(S.map(x => { const L = x.domEv[d.k] || [], tot = x.why.length; return L.length ? L.length + ' (' + pct(L.length, tot) + '%)' : '–'; }))), { num: true, cls: 'cmp-t' });
      wrap.appendChild(section('2 · Mengapa: profil akar masalah', 'Komposisi bukti penyebab (C3 penjelasan, C4 faktor CP, C5 data, C6 masalah, C7 tema, C1 dugaan) per ranah. Klik segmen untuk buktinya.', h('div', null, rows, key, h('details', { class: 'cmp-more' }, h('summary', null, 'Tabel angka'), tbl))));
    }

    /* 5. 14 CP (C4) */
    const S4 = S.map((x, i) => Object.assign(x, { i })).filter(x => x.c4.length);
    const anyCls = S4.some(x => x.c4.some(rc => Object.values(rc.data.matriks_cp || {}).some(v => v && v.klasifikasi)));
    if (S4.length && !anyCls) wrap.appendChild(section('3 · Layanan: 14 CP hasil penilaian fasilitas (C4)', null, h('div', { class: 'placeholder' }, 'C4 sudah ada untuk ' + S4.map(x => short(x.kk)).join(', ') + ', tetapi klasifikasi CP belum diisi. Perbandingan 14 CP muncul setelah kolom klasifikasi pada matriks CP diisi.')));
    if (S4.length && anyCls) {
      const sec = RCA.S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp');
      const RANK = v => /tidak terlaksana/i.test(v) ? 3 : /sebagian/i.test(v) ? 2 : /Belum dapat/i.test(v) ? 1 : /terverifikasi/i.test(v) ? 0 : -1;
      const CLS = ['c-ok', 'c-unk', 'c-part', 'c-no'];
      const t = h('table', { class: 't heat cmp-cp' }, h('thead', null, h('tr', null, h('th', null, 'CP'), S4.map(x => h('th', { style: col(x.i) }, h('span', { class: 'cmp-th' }, h('i', null, x.i + 1), short(x.kk)))))));
      const tb = h('tbody'); t.appendChild(tb);
      sec.rows.forEach(r => {
        tb.appendChild(h('tr', null, h('th', { title: r.l }, h('b', null, r.k), ' ', h('small', null, clip(r.l.replace(/^\S+\s/, ''), 34))), S4.map(x => {
          const vals = x.c4.map(rc => ((rc.data.matriks_cp || {})[r.k] || {}).klasifikasi || '');
          const worst = Math.max(...vals.map(RANK)), bad = vals.filter(v => RANK(v) >= 2).length;
          const b = h('button', { type: 'button', class: 'cellpick', title: x.c4.map((rc, j) => rc.unit + ': ' + (vals[j] || 'belum diklasifikasi')).join('\n') }, bad ? bad + '/' + x.c4.length : worst === 0 ? '✓' : worst === 1 ? '?' : '·');
          b.addEventListener('click', () => {
            const ev = M.ev.filter(e => e.form === 'C4' && e.cp === r.k && e.kk === x.kk);
            const st = x.c3.filter(s => s.gaps.some(g => g.cp === r.k));
            pick(short(x.kk) + ' · ' + r.k, x.c4.map((rc, j) => rc.unit + ': ' + (vals[j] || 'belum diklasifikasi')).join(' · '), { stories: st, ev, highlight: g => g.cp === r.k }, b);
          });
          return h('td', { class: 'c ' + (worst >= 0 ? CLS[worst] : '') }, b);
        })));
      });
      wrap.appendChild(section('3 · Layanan: 14 CP hasil penilaian fasilitas (C4)', 'Angka = jumlah fasyankes dengan CP terlaksana sebagian/tidak terlaksana dari fasyankes yang dinilai; warna = keadaan terburuk. ✓ terverifikasi, ? belum dapat dipastikan. Klik sel: bukti C4 dan unit C3 yang terputus pada CP itu.',
        h('div', { class: 'table-wrap no-cards' }, t)));
    }

    /* 6. data (C5) dan kematian (C6) berdampingan */
    const pair = h('div', { class: 'cmp-pair' });
    if (S.some(x => x.c5rows)) {
      const jen = uniq(S.flatMap(x => x.c5bad.map(e => e.jenis))).filter(Boolean);
      const box = h('div', { class: 'cmp-mini' });
      S.forEach((x, i) => {
        const p = pct(x.c5bad.length, x.c5rows);
        const b = h('button', { type: 'button', class: 'cmp-bar', style: col(i), disabled: !x.c5bad.length }, h('span', { class: 'cl' }, short(x.kk)), h('span', { class: 'track' }, h('i', { style: { width: p + '%' } })), h('span', { class: 'v' }, x.c5rows ? p + '% (' + x.c5bad.length + '/' + x.c5rows + ')' : '–'));
        if (x.c5bad.length) b.addEventListener('click', () => pick(short(x.kk) + ' · data tidak sesuai (C5)', x.c5bad.length + ' baris', { stories: [], ev: x.c5bad }, b));
        box.appendChild(b);
      });
      if (jen.length) box.appendChild(RCA.anl.tbl(['Jenis ketidaksesuaian'].concat(S.map(x => short(x.kk))), jen.map(j => [j].concat(S.map(x => x.c5bad.filter(e => e.jenis === j).length || '–'))), { num: true, cls: 'cmp-t' }));
      pair.appendChild(section('4 · Data: ketidaksesuaian sistem vs sumber (C5)', '% baris pencocokan yang tidak sesuai.', box));
    }
    if (S.some(x => x.c6.length)) {
      const kats = uniq(S.flatMap(x => Object.keys(x.kat)));
      const box = h('div', { class: 'cmp-mini' });
      kats.forEach(k => {
        box.appendChild(h('div', { class: 'cmp-gl' }, h('b', null, k)));
        box.appendChild(h('div', { class: 'cmp-gb' }, S.map((x, i) => { const L = x.kat[k] || [], mx = Math.max(1, ...S.map(y => (y.kat[k] || []).length));
          const b = h('button', { type: 'button', class: 'cmp-bar', style: col(i), disabled: !L.length }, h('span', { class: 'cl' }, short(x.kk)), h('span', { class: 'track' }, h('i', { style: { width: (L.length / mx * 100) + '%' } })), h('span', { class: 'v' }, L.length ? L.length + ' kasus' : '–'));
          if (L.length) b.addEventListener('click', () => pick(short(x.kk) + ' · kematian ' + k, L.length + ' kasus', { stories: L, ev: [] }, b));
          return b; })));
      });
      pair.appendChild(section('5 · Kematian: waktu kematian terhadap OAT (C6)', 'Jumlah kasus per kategori waktu.', box));
    }
    if (pair.childNodes.length) wrap.appendChild(pair);
    return wrap;
  };

  /* ---------------- bukti untuk panel (Dashboard Analisis) */
  CMP.evidence = function (o) {
    const MM = RCA.mapModel;
    const wrap = h('div', { class: 'stack' });
    if (!RCA.can.raw()) {
      const ev = o.ev || [], dom = {}; ev.forEach(e => e.dom.forEach(d => { dom[d] = (dom[d] || 0) + 1; }));
      wrap.appendChild(h('div', { class: 'notice' }, 'Rincian per unit hanya untuk Enumerator, Koordinator, dan Super Admin. Ringkasan: ' + (o.stories || []).length + ' unit/kasus, ' + ev.length + ' bukti.'));
      if (Object.keys(dom).length) wrap.appendChild(RCA.anl.tbl(['Akar masalah', 'Bukti'], Object.entries(dom).sort((a, b) => b[1] - a[1]).map(([k, n]) => [MM.domByK(k).l, n]), { num: true }));
      return wrap;
    }
    const L = (o.ev || []).filter(e => !e.story);
    if (L.length) {
      const by = {}; L.forEach(e => { (by[e.form] = by[e.form] || []).push(e); });
      Object.keys(by).forEach(fm => {
        wrap.appendChild(h('h4', null, fm + ' · ' + MM.FORMS[fm] + ' (' + by[fm].length + ')'));
        by[fm].slice(0, 50).forEach(e => wrap.appendChild(h('div', { class: 'evitem' },
          h('div', { class: 'evh' }, h('b', null, e.unit), e.cp ? h('span', { class: 'chip cp' }, e.cp) : null, e.jenis ? h('span', { class: 'chip' }, clip(e.jenis, 50)) : null,
            RCA.can.raw() ? h('a', { class: 'small', href: '#/edit/' + e.form + '/' + e.sub + '/' + encodeURIComponent(e.unit) }, 'Buka ' + e.sub) : null),
          h('p', null, clip(e.teks, 360)))));
        if (RCA.can.raw()) uniq(by[fm].map(e => e.rec).filter(Boolean)).forEach(r => { const g = RCA.photo.gallery((r.data || {}).foto, 'Foto ' + r.sub + ' ' + r.unit); if (g) wrap.appendChild(g); });
      });
    }
    if ((o.stories || []).length) {
      wrap.appendChild(h('h4', null, 'Cerita unit (' + o.stories.length + ')'));
      wrap.appendChild(RCA.anlPanel.storyList(o.stories.slice(0, 40), { highlight: o.highlight }));
    }
    if (!wrap.childNodes.length) wrap.appendChild(h('p', { class: 'muted' }, 'Tidak ada bukti rinci.'));
    return wrap;
  };
})();
