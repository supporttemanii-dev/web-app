/* RCA TB-HIV 2026 · alur pasien (patient journey) dan keterkaitan bukti antar-formulir C1–C7.
   Simpul mengikuti urutan 14 titik penilaian (CP) Protokol V13, fase telaah kematian C6 (T1–T5, tiga keterlambatan),
   dan indikator verifikasi C5. Setiap simpul menghitung bukti per formulir:
   C1 dugaan awal kab/kota (kolom CP) · C3 unit dengan titik putus pada CP simpul · C4 penilaian proses CP yang bermasalah (sebagian/terlambat, tidak terlaksana, belum dapat dipastikan, atau ada masalah/dugaan) ·
   C5 baris pencocokan yang tidak sesuai untuk indikator terkait · C6 masalah/mutu kurang/keterlambatan pada fase terkait ·
   C7 tema wawancara/diskusi yang dikaitkan dengan CP simpul. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  const J = RCA.journey = {};

  // ---- simpul alur (urutan pelayanan) dan pemetaan instrumen
  J.STAGES = [
    { id: 'kontak', t: ['Kontak pertama dan akses ke layanan', 'First contact and access to care'], cps: ['CP1'], c6: { delay: ['d1', 'd2'] },
      reach: { A: d => has(d.P02) || has(d.A00) }, ket: ['Gejala atau terduga TB pertama tercatat (C3 P02/A00); keterlambatan mencari dan mencapai layanan (C6 B2 d1–d2).', 'First recorded symptoms or presumptive TB (C3 P02/A00); delays in seeking and reaching care (C6 B2 d1–d2).'] },
    { id: 'skrining', t: ['Skrining TB pada ODHIV', 'TB screening of people living with HIV'], cps: ['CP2'],
      reach: { B: d => has(d.B03) || has(d.B04) }, ket: ['Skrining TB saat mulai ARV (C3 B03–B04).', 'TB screening at ART start (C3 B03–B04).'] },
    { id: 'diagnosis', t: ['Pemeriksaan dan diagnosis TB', 'TB investigation and diagnosis'], cps: ['CP4'], c6: { phase: ['T1'] },
      reach: { A: d => has(d.A01), CP3: d => has(d.R_E) }, ket: ['Diagnosis TB (C3 A01, CP3 R_E); fase T1 akses dan diagnosis (C6).', 'TB diagnosis (C3 A01, CP3 R_E); phase T1 access and diagnosis (C6).'] },
    { id: 'hiv', t: ['Penetapan status HIV', 'HIV status ascertainment'], cps: ['CP3'], c5: ['C5_5'],
      reach: { A: d => has(d.A06) || has(d.A07), CP3: d => has(d.R_F) || has(d.R_H) || has(d.R_D) }, ket: ['Tes HIV pada episode TB (C3 A06–A07, kerangka CP3); indikator TB/HIV-5 (C5).', 'HIV testing in the TB episode (C3 A06–A07, CP3 frame); indicator TB/HIV-5 (C5).'] },
    { id: 'terapi', t: ['Mulai pengobatan: OAT dan ARV', 'Treatment start: TB treatment and ART'], cps: ['CP6'], c5: ['C5_6'], c6: { phase: ['T2'], delay: ['d3'] },
      reach: { A: d => has(d.A08) || has(d.A11), B: d => has(d.B01) }, ket: ['Mulai OAT dan ARV (C3 A08, A10–A11, B01); fase T2 awal terapi dan keterlambatan tata laksana (C6); indikator TB/HIV-6 (C5).', 'TB treatment and ART start (C3 A08, A10–A11, B01); phase T2 treatment start and management delay (C6); indicator TB/HIV-6 (C5).'] },
    { id: 'tpt', t: ['Kelayakan dan pemberian TPT', 'TPT eligibility and initiation'], cps: ['CP5', 'CP7'], c5: ['C5_41a'],
      reach: { B: d => has(d.B08) || has(d.B11) }, ket: ['Penilaian kelayakan, penawaran, dan mulai TPT (C3 B08–B13); indikator TB/HIV-4.1a (C5).', 'Eligibility assessment, offer, and TPT start (C3 B08–B13); indicator TB/HIV-4.1a (C5).'] },
    { id: 'rujukan', t: ['Koordinasi rujukan', 'Referral coordination'], cps: ['CP8'], c6: { phase: ['T4'] },
      reach: { A: d => (d.rujukan || []).length > 0, B: d => (d.rujukan || []).length > 0 }, ket: ['Rujukan dan kehadiran di tujuan (C3 tabel rujukan); fase T4 rujukan (C6).', 'Referrals and arrival at destination (C3 referral table); phase T4 referral (C6).'] },
    { id: 'pantau', t: ['Kepatuhan, pemantauan, dan penyelesaian pengobatan', 'Adherence, monitoring, and treatment completion'], cps: ['CP9', 'CP10', 'CP11'], c6: { phase: ['T3'] },
      reach: { A: d => has(d.A13), B: d => has(d.B16) }, ket: ['Luaran TB dan penyelesaian TPT (C3 A13–A14, B16); fase T3 pemantauan (C6).', 'TB outcome and TPT completion (C3 A13–A14, B16); phase T3 monitoring (C6).'] },
    { id: 'kembali', t: ['Interupsi, penelusuran, dan kembali berobat', 'Interruption, tracing, and return to care'], cps: ['CP12'],
      reach: { A: d => (d.interupsi || []).length > 0, B: d => (d.interupsi || []).length > 0 }, ket: ['Interupsi dan kembali berobat (C3 tabel interupsi).', 'Interruptions and return to treatment (C3 interruption table).'] },
    { id: 'retensi', t: ['Retensi jangka panjang (status 30 Juni 2026)', 'Long-term retention (status at 30 June 2026)'], cps: ['CP14'],
      reach: { A: d => has(d.T03), B: d => has(d.T03) }, ket: ['Status pelayanan terakhir (C3 T01–T06).', 'Latest care status (C3 T01–T06).'] }
  ];
  J.OUTCOMES = [
    { id: 'berhasil', t: ['Berhasil: sembuh, pengobatan lengkap, atau tetap ARV', 'Successful: cured, completed, or retained on ART'], color: '#2e8b57', cps: [] },
    { id: 'lanjut', t: ['Masih berobat atau pindah', 'Still on treatment or transferred'], color: '#5b8fd4', cps: [] },
    { id: 'putus', t: ['Putus berobat atau hilang kontak', 'Lost to follow-up or interrupted'], color: '#e08a3c', cps: ['CP12'] },
    { id: 'meninggal', t: ['Meninggal', 'Died'], color: '#c0503d', cps: ['CP13'], c6: { phase: ['T5'], all: true } }
  ];
  J.CROSS = { id: 'informasi', t: ['Lintas tahap: informasi dan akuntabilitas', 'Cross-cutting: information and accountability'], cps: ['R6'], c5: ['C5_5', 'C5_6', 'C5_41a'], ket: ['Kesesuaian SITB/SIHA dan verifikasi data sentinel.', 'SITB/SIHA agreement and sentinel data verification.'] };
  J.FORMS = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
  J.FORM_LBL = { C1: ['Dugaan awal C1', 'C1 hypotheses'], C3: ['Unit C3 dengan titik putus', 'C3 units with a breakdown'], C4: ['Penilaian proses C4', 'C4 process assessments'], C5: ['Baris C5 tidak sesuai', 'C5 discrepant rows'], C6: ['Temuan telaah kematian C6', 'C6 death-review findings'], C7: ['Tema C7', 'C7 themes'] };

  /** hasil akhir satu unit C3 (A atau B) */
  J.outcomeOf = (frame, d) => {
    if (d.A13 === 'Meninggal' || d.T03 === 'Meninggal' || has(d.T06)) return 'meninggal';
    if (d.A13 === 'Putus berobat' || /Terputus|hilang kontak/i.test(d.T03 || '') || d.B16 === 'Putus') return 'putus';
    if (d.A13 === 'Sembuh' || d.A13 === 'Pengobatan lengkap' || (frame === 'B' && d.T03 === 'Aktif ARV')) return 'berhasil';
    if (d.A13 === 'Masih berobat' || d.A13 === 'Pindah' || has(d.T03)) return 'lanjut';
    return '';
  };
  // isian tanpa kolom CP/fase: dikaitkan ke tahap dari kata kunci teks (ditandai 'otomatis')
  J.KW = { kontak: /gejala|akses|jarak|transport|ongkos|menyangkal|stigma|mencari (pengobatan|layanan|pelayanan)|penemuan kasus|komunitas|kader/i, skrining: /skrining|penapisan/i,
    diagnosis: /diagnos|\bTCM\b|rontgen|dahak|spesimen|pemeriksaan (TB|dahak|lab)|laboratorium/i, hiv: /tes HIV|status HIV|konseling HIV|\bVCT\b|\bPITC\b/i,
    terapi: /\bARV\b|\bOAT\b|inisiasi|mulai (obat|pengobatan|terapi)|\bPDP\b|integrasi layanan/i, tpt: /\bTPT\b|\bINH\b|\b3HP\b|pencegahan TB/i,
    rujukan: /rujuk|pindah layanan|rumah sakit|\bRSUD\b|jejaring/i, pantau: /kepatuhan|patuh|pemantauan|\bPMO\b|efek samping|luaran/i,
    kembali: /putus (berobat|obat)|mangkir|hilang kontak|lacak|pelacakan|kunjungan rumah|\bLTFU\b|kembali berobat/i, retensi: /retensi|jangka panjang|populasi bergerak|pindah domisili/i,
    informasi: /\bSITB\b|\bSIHA\b|pencatatan|tercatat|register|entri|pelaporan|catatan manual/i };
  J.infer = t => Object.keys(J.KW).filter(k => J.KW[k].test(String(t || '')));
  const cpsIn = s => (String(s || '').match(/\b(CP\d{1,2}|R6)\b/gi) || []).map(x => x.toUpperCase());

  /**
   * V: rekaman per formulir {C1:{C1:[..]}, C3:{C3A:[..]}, ...}; stories: RCA.story.build(V); c6: RCA.story.buildC6(...)
   * hasil: { nodes, outcomes, cross, totals }
   */
  J.build = function (V, stories, c6stories) {
    V = V || {}; stories = stories || []; c6stories = c6stories || [];
    const recs = (fm, sub) => ((V[fm] || {})[sub] || []);
    const frameOf = sub => ({ C3A: 'A', C3B: 'B', C3CP3: 'CP3' })[sub];
    const C3 = ['C3A', 'C3B', 'C3CP3'].flatMap(sub => recs('C3', sub).map(r => ({ r, frame: frameOf(sub), d: r.data || {} })));
    const sBy = {}; stories.forEach(s => { sBy[s.sub + '|' + s.unit] = s; });
    const c6By = {}; c6stories.forEach(s => { c6By[s.unit] = s; });
    const c6B = recs('C6', 'C6B');
    const mkNode = (st) => {
      const ev = {}; J.FORMS.forEach(f => { ev[f] = []; });
      const cps = st.cps || [];
      // C1: dugaan awal yang menyebut CP simpul
      const hitTxt = (cpTxt, txt) => { const c = cpsIn(cpTxt); return c.length ? (c.some(x => cps.includes(x)) ? 1 : 0) : (J.infer(txt).includes(st.id) ? 2 : 0); };
      recs('C1', 'C1').forEach(r => (r.data.dugaan || []).forEach(x => { const hit = hitTxt(x.cp, [x.dugaan, x.fokus].join(' ')); if (hit) ev.C1.push({ form: 'C1', sub: 'C1', unit: r.unit, kk: r.unit, auto: hit === 2, label: x.dugaan || '(dugaan)', detail: (hit === 2 ? 'Dikaitkan dari kata kunci (kolom CP kosong)' : [x.cp, x.status].filter(Boolean).join(' · ')) + (x.bukti ? ' · bukti: ' + x.bukti : '') }); }));
      // C3: unit dengan titik putus pada CP simpul
      stories.forEach(s => { const g = (s.gaps || []).filter(x => cps.includes(x.cp)); if (g.length) ev.C3.push({ form: 'C3', sub: s.sub, unit: s.unit, fac: s.fac, story: s, cps, label: g.map(x => x.langkah + ': ' + x.jenis).join('; '), detail: g.map(x => x.teks).join(' · ') }); });
      // C4: penilaian proses CP di fasyankes (klasifikasi/masalah/dugaan terisi)
      recs('C4', 'C4').forEach(r => cps.forEach(cp => { const m = (r.data.matriks_cp || {})[cp]; if (m && ((has(m.klasifikasi) && !/^(Terlaksana dan terverifikasi|Tidak berlaku)/.test(m.klasifikasi)) || has(m.masalah) || has(m.dugaan))) ev.C4.push({ form: 'C4', sub: 'C4', unit: r.unit, fac: r.unit, label: cp + (m.klasifikasi ? ' · ' + m.klasifikasi : ''), detail: [m.masalah && 'Masalah: ' + m.masalah, m.dugaan && 'Dugaan: ' + m.dugaan, (m.faktor || []).length && 'Faktor: ' + m.faktor.join(', '), m.keyakinan && 'Keyakinan: ' + m.keyakinan].filter(Boolean).join(' · ') }); }));
      // C5: baris pencocokan tidak sesuai untuk indikator terkait
      (st.c5 || []).forEach(sub => recs('C5', sub).forEach(r => (r.data.cocok || []).forEach((x, i) => { const j = x.jenis || ''; if (j && j !== 'Sesuai') ev.C5.push({ form: 'C5', sub, unit: r.unit, fac: r.unit, label: ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[sub] + ' · ' + j, detail: [x.kode_baris && 'Baris ' + x.kode_baris, x.kode_unit_c3 && 'Unit C3 ' + x.kode_unit_c3, x.penjelasan].filter(Boolean).join(' · '), row: i }); })));
      // C6: masalah B4 pada fase, mutu kurang (skor 1–2), atau keterlambatan B2
      const c6 = st.c6 || {};
      c6B.forEach(r => {
        const b = r.data || {}, hit = [];
        (c6.phase || []).forEach(t => { const x = (b.B1 || {})[t] || {}; if (/^[12]$/.test(String(x.skor))) hit.push(t + ' mutu kurang (skor ' + x.skor + ')'); (b.B4 || []).forEach(m => { if (String(m.fase || '').indexOf(t) === 0) hit.push(t + ' masalah: ' + (m.masalah || '')); }); });
        (b.B4 || []).forEach(m => { if (!m.fase && st.id !== 'meninggal' && J.infer([m.masalah, m.penyumbang].join(' ')).includes(st.id)) hit.push('Masalah (fase kosong, dikaitkan dari kata kunci): ' + (m.masalah || '')); });
        (c6.delay || []).forEach(k => { if (((b.B2 || {})[k] || {}).nilai === 'Ada') hit.push({ d1: 'Keterlambatan mencari pelayanan', d2: 'Keterlambatan mencapai layanan tepat', d3: 'Keterlambatan tata laksana di fasyankes' }[k]); });
        if (c6.all) hit.push('Kasus kematian ditelaah' + (b.peluang ? ' · peluang perbaikan: ' + b.peluang : ''));
        if (hit.length) ev.C6.push({ form: 'C6', sub: 'C6B', unit: r.unit, fac: r.fac, story: c6By[r.unit], label: hit[0], detail: hit.slice(1).join(' · ') });
      });
      // C7: tema yang dikaitkan dengan CP simpul
      recs('C7', 'C7S').forEach(r => (r.data.tema || []).forEach(x => { const hit = hitTxt(x.cp, [x.tema, x.catatan].join(' ')); if (hit) ev.C7.push({ form: 'C7', sub: 'C7S', unit: r.unit, auto: hit === 2, label: x.tema || '(tema)', detail: [hit === 2 ? 'Dikaitkan dari kata kunci (kolom CP kosong)' : x.cp, x.kutipan && '“' + x.kutipan + '”'].filter(Boolean).join(' · ') }); }));
      // jangkauan C3
      const reached = st.reach ? C3.filter(o => st.reach[o.frame] && st.reach[o.frame](o.d)) : [];
      return { id: st.id, t: st.t, cps, ket: st.ket, color: st.color, ev, reach: reached.map(o => sBy[o.r.sub + '|' + o.r.unit] || { form: 'C3', sub: o.r.sub, unit: o.r.unit, fac: o.r.fac, _raw: true }), gaps: ev.C3.length,
        total: J.FORMS.reduce((a, f) => a + ev[f].length, 0) };
    };
    const nodes = J.STAGES.map(mkNode);
    const outcomes = J.OUTCOMES.map(o => {
      const n = mkNode(o);
      n.reach = C3.filter(x => x.frame !== 'CP3' && J.outcomeOf(x.frame, x.d) === o.id).map(x => sBy[x.r.sub + '|' + x.r.unit] || { form: 'C3', sub: x.r.sub, unit: x.r.unit, fac: x.r.fac, _raw: true });
      if (o.id === 'meninggal') n.cases = c6stories.length;
      return n;
    });
    const cross = mkNode(J.CROSS);
    const AB = C3.filter(x => x.frame !== 'CP3');
    return { nodes, outcomes, cross, totals: { units: C3.length, ab: AB.length, known: AB.filter(x => J.outcomeOf(x.frame, x.d)).length, c6: c6stories.length } };
  };

  /** blok grafik untuk laporan (digambar RCA.rchart jenis 'journey') */
  J.summary = M => { const sm = n => ({ id: n.id, t: n.t, cps: n.cps, color: n.color, reach: n.reach.length, gaps: n.gaps, total: n.total, ev: J.FORMS.reduce((o, f) => (o[f] = n.ev[f].length, o), {}) });
    return { nodes: M.nodes.map(sm), outcomes: M.outcomes.map(sm), cross: sm(M.cross), totals: M.totals }; };
  J.chart = (M, id) => ({ type: 'chart', id: id || 'G0.1', kind: 'journey', title: ['Alur pasien dari kontak pertama sampai status akhir, dengan jumlah bukti per formulir', 'Patient journey from first contact to final status, with evidence counts by form'], model: J.summary(M),
    note: ['Angka di kanan setiap tahap: unit C3 yang mencapai tahap; kotak C1–C7: jumlah bukti per formulir yang dikaitkan dengan CP tahap tersebut (lihat Bagian Metode). Garis merah: titik putus.', 'Number at right of each stage: C3 units reaching the stage; C1–C7 boxes: evidence items per form linked to the stage checkpoints (see Methods). Red line: breakdown points.'] });

  /* ================================================================ tampilan Dashboard Analisis */
  function evList(items, canRaw) {
    if (!canRaw) return h('p', { class: 'muted' }, 'Rincian unit hanya dapat dilihat Super Admin, Koordinator, dan Enumerator.');
    const byForm = {}; items.forEach(x => { (byForm[x.form] = byForm[x.form] || []).push(x); });
    const wrap = h('div', { class: 'stack' });
    Object.keys(byForm).forEach(fm => {
      const L = byForm[fm];
      if (fm === 'C3' && RCA.anlPanel && L.every(x => x.story)) { wrap.appendChild(h('h4', null, J.FORM_LBL.C3[0] + ' (' + L.length + ')')); wrap.appendChild(RCA.anlPanel.storyList(L.map(x => x.story), { highlight: g => (L[0].cps || []).includes(g.cp) })); return; }
      wrap.appendChild(h('h4', null, (J.FORM_LBL[fm] || [fm])[0] + ' (' + L.length + ')'));
      wrap.appendChild(h('ul', { class: 'jr-evlist' }, L.map(x => h('li', null,
        h('a', { href: '#/edit/' + x.form + '/' + x.sub + '/' + encodeURIComponent(x.unit) }, h('b', null, x.unit)), ' · ', x.label, x.auto ? h('span', { class: 'chip', title: 'Kolom CP/fase kosong; dikaitkan dari kata kunci teks' }, ' otomatis') : null, x.detail ? h('div', { class: 'small muted' }, x.detail) : null))));
    });
    return wrap;
  }
  function openList(title, sub, items) {
    const canRaw = RCA.can.raw();
    const content = evList(items, canRaw);
    if (RCA.anlPanel && RCA.anlPanel.show) RCA.anlPanel.show(title, sub, content);
    else RCA.modal(title, content, [{ label: 'Tutup', value: null }], { wide: true });
  }
  const chip = (fm, list, title) => h('button', { type: 'button', class: 'jr-ev f-' + fm, disabled: !list.length, title: (J.FORM_LBL[fm] || [fm])[0] + ': ' + list.length,
    onclick: () => openList(title + ' · ' + fm, (J.FORM_LBL[fm] || [fm])[0] + ' · ' + list.length + ' bukti', list) }, h('span', { class: 'jr-f' }, fm), h('b', null, String(list.length)));
  function nodeCard(n, k, M, kind) {
    const title = n.t[0];
    const head = h('div', { class: 'jr-head' }, kind === 'stage' ? h('span', { class: 'jr-no' }, String(k + 1)) : null, h('div', { class: 'grow' }, h('b', null, title), h('div', { class: 'jr-cps' }, n.cps.map(c => h('span', { class: 'chip' }, c)))));
    const reachBtn = h('button', { type: 'button', class: 'jr-reach', disabled: !n.reach.length, onclick: () => openList(title, 'Unit C3 yang ' + (kind === 'out' ? 'berstatus akhir ini' : 'mencapai tahap ini') + ' · ' + n.reach.length, n.reach.map(s => ({ form: 'C3', sub: s.sub, unit: s.unit, story: s._raw ? null : s, label: s._raw ? '' : (s.ringkas || ''), cps: n.cps }))) },
      h('b', null, String(n.reach.length)), h('small', null, kind === 'out' ? ' unit' : ' unit mencapai'));
    const evRow = h('div', { class: 'jr-evs' }, J.FORMS.map(fm => chip(fm, n.ev[fm], title)));
    const card = h('div', { class: 'jr-node ' + (kind || 'stage') + (n.gaps ? ' has-gap' : ''), style: n.color ? { '--jc': n.color } : null }, head,
      h('div', { class: 'jr-metrics' }, reachBtn, n.gaps ? h('button', { type: 'button', class: 'jr-gap', onclick: () => openList(title, 'Titik putus pada ' + n.cps.join(', ') + ' · ' + n.gaps + ' unit', n.ev.C3) }, '⚠ ' + n.gaps + ' titik putus') : null,
        n.cases ? h('span', { class: 'small muted' }, n.cases + ' kasus ditelaah di C6') : null),
      evRow, h('p', { class: 'jr-ket small muted' }, n.ket ? n.ket[0] : ''));
    return card;
  }
  /** elemen DOM alur pasien untuk Dashboard Analisis */
  J.view = function (M) {
    const wrap = h('div', { class: 'pjourney' });
    wrap.appendChild(h('p', { class: 'muted' }, 'Alur pelayanan dari kontak pertama sampai status akhir. Setiap tahap mengikuti titik penilaian (CP) Protokol V13. Angka di kotak C1–C7 adalah jumlah bukti per formulir yang dikaitkan dengan CP tahap itu; ketuk angka untuk melihat unitnya. Unit C3 yang mencapai tahap dihitung dari isian tanggal/kegiatan pada C3.'));
    wrap.appendChild(h('div', { class: 'jr-legend' }, J.FORMS.map(fm => h('span', { class: 'jr-ev f-' + fm, 'aria-hidden': 'true' }, h('span', { class: 'jr-f' }, fm), h('small', null, ' ' + J.FORM_LBL[fm][0])))));
    const flow = h('div', { class: 'jr-flow' });
    M.nodes.forEach((n, k) => { flow.appendChild(nodeCard(n, k, M, 'stage')); if (k < M.nodes.length - 1) flow.appendChild(h('div', { class: 'jr-arrow', 'aria-hidden': 'true' }, '↓')); });
    flow.appendChild(h('div', { class: 'jr-arrow', 'aria-hidden': 'true' }, '↓'));
    wrap.appendChild(h('div', { class: 'jr-grid' }, flow, h('aside', { class: 'jr-side' }, h('div', { class: 'small muted' }, 'Berlaku di semua tahap'), nodeCard(M.cross, 0, M, 'cross'))));
    wrap.appendChild(h('h3', null, 'Status akhir (' + M.totals.known + ' dari ' + M.totals.ab + ' unit A/B diketahui)'));
    wrap.appendChild(h('div', { class: 'jr-outs' }, M.outcomes.map(o => nodeCard(o, 0, M, 'out'))));
    return wrap;
  };
})();
