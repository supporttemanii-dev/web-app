/* dashboard.js — dashboard hasil (internal & publik/embed) */
const Dash = (() => {
  const charts = [];
  const PAL = ['#0572b5', '#0ea5e9', '#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#ef4444', '#64748b', '#14b8a6', '#eab308'];
  const MUTU_C = { A: '#16a34a', B: '#0ea5e9', C: '#f59e0b', D: '#dc2626', '-': '#94a3b8' };

  function destroy() { while (charts.length) { try { charts.pop().destroy(); } catch (e) { } } }

  function optLabel(q, v) {
    if (q.tipe === 'ya_tidak') return v === '1' ? 'Ya' : v === '0' ? 'Tidak' : v;
    const o = (q.opsi || []).find(x => String(x.v) === String(v));
    return o ? o.l : (v === 'lainnya' ? 'Lainnya' : v);
  }
  function distrib(q, G) {
    const s = (G.q || {})[q.id];
    if (!s) return [];
    let keys;
    if (q.opsi && q.tipe !== 'matriks') keys = q.opsi.map(o => String(o.v)).concat(Object.keys(s.c).filter(k => !q.opsi.some(o => String(o.v) === k)));
    else if (q.tipe === 'rating' || q.tipe === 'skala_linear') { const a = q.tipe === 'rating' ? 1 : (parseInt(q.min, 10) || 0); const b = parseInt(q.max, 10) || (q.tipe === 'rating' ? 5 : 10); keys = []; for (let i = a; i <= b; i++) keys.push(String(i)); }
    else keys = Object.keys(s.c);
    return keys.map(k => ({ k, l: optLabel(q, k), n: s.c[k] || 0 }));
  }

  /* weekly buckets */
  function trend(harian) {
    const days = Object.keys(harian).sort();
    if (!days.length) return { labels: [], data: [] };
    const weekly = days.length > 45;
    const map = {};
    days.forEach(d => {
      let k = d;
      if (weekly) { const dt = new Date(d + 'T00:00:00'); const dow = (dt.getDay() + 6) % 7; dt.setDate(dt.getDate() - dow); k = dt.toISOString().slice(0, 10); }
      map[k] = (map[k] || 0) + harian[d];
    });
    const labels = Object.keys(map).sort();
    return { labels: labels.map(l => new Date(l + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })), data: labels.map(l => map[l]), weekly };
  }

  function chartCfgUnsur(res) {
    return {
      type: 'bar',
      data: { labels: res.unsur.map(u => u.kode + ' ' + u.nama), datasets: [{ label: 'NRR', data: res.unsur.map(u => Core.round(u.nrr, 2)), backgroundColor: res.unsur.map(u => MUTU_C[u.mutu]), borderRadius: 6, maxBarThickness: 26 }] },
      options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => 'NRR ' + c.raw + ' · ' + res.unsur[c.dataIndex].kinerja } } }, scales: { x: { min: 0, max: 4, ticks: { stepSize: 1 } }, y: { ticks: { font: { size: 11 }, callback: function (v) { const l = this.getLabelForValue(v); const n = window.innerWidth < 600 ? 20 : 34; return l.length > n ? l.slice(0, n - 1) + '…' : l; } } } } }
    };
  }

  async function mk(canvas, cfg) {
    await Lib.chart();
    const c = new Chart(canvas, cfg);
    charts.push(c);
    return c;
  }

  /* gambar grafik offscreen → dataURL (untuk laporan) */
  async function chartImage(cfg, w = 900, h = 460) {
    await Lib.chart();
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    cv.style.cssText = 'position:fixed;left:-9999px;top:0;width:' + w + 'px;height:' + h + 'px';
    document.body.appendChild(cv);
    cfg = Object.assign({}, cfg); cfg.options = Object.assign({}, cfg.options, { animation: false, responsive: false, devicePixelRatio: 2 });
    const plugin = { id: 'bgwhite', beforeDraw: ch => { const x = ch.ctx; x.save(); x.fillStyle = '#fff'; x.fillRect(0, 0, ch.width, ch.height); x.restore(); } };
    cfg.plugins = (cfg.plugins || []).concat(plugin);
    const c = new Chart(cv, cfg);
    const url = cv.toDataURL('image/png');
    c.destroy(); cv.remove();
    return url;
  }

  /**
   * ctx: { form, agg, faskes, units, publik, filter }
   */
  async function render(el, ctx) {
    destroy();
    const { form, agg } = ctx;
    const res = Core.ikm(form, agg.all);
    const hasIkm = res.k > 0;
    const target = Core.sampelKrejcie(form.populasi);
    const fName = id => (ctx.faskes.find(f => f.id === id) || {}).nama || id;
    const uName = id => (ctx.units.find(u => u.id === id) || {}).nama || id;

    const profilQ = form.pertanyaan.filter(q => q.kategori === 'profil' && ['pilihan', 'dropdown', 'ya_tidak', 'kotakcentang'].includes(q.tipe));
    const otherQ = form.pertanyaan.filter(q => q.kategori !== 'profil' && !q.ikm && ['pilihan', 'dropdown', 'ya_tidak', 'kotakcentang', 'rating', 'skala_linear', 'skala_ikm'].includes(q.tipe));

    const fkRows = Object.keys(agg.faskes).filter(k => k !== '-').map(id => ({ id, nama: fName(id), r: Core.ikm(form, agg.faskes[id]) })).sort((a, b) => b.r.konversi - a.r.konversi);
    const unRows = Object.keys(agg.unit).filter(k => k !== '-').map(id => ({ id, nama: uName(id), fk: fName((ctx.units.find(u => u.id === id) || {}).faskes_id), r: Core.ikm(form, agg.unit[id]) })).sort((a, b) => b.r.konversi - a.r.konversi);

    el.innerHTML = `
      <div class="kpis">
        <div class="kpi"><div class="k-lbl">Responden</div><div class="k-val">${fmt.n(agg.total)}</div><div class="k-sub">${target ? 'Target min. ' + fmt.n(target) + ' (' + fmt.pct(agg.total, target) + ')' : 'total masuk'}</div></div>
        ${hasIkm ? `<div class="kpi"><div class="k-lbl">Nilai IKM</div><div class="k-val">${fmt.n(res.konversi, 2)}</div><div class="k-sub">Indeks ${fmt.n(res.ikm, 3)}</div></div>
        <div class="kpi"><div class="k-lbl">Mutu pelayanan</div><div class="row" style="margin-top:6px">${UI.mutu(res.mutu)}<b>${esc(res.kinerja)}</b></div></div>
        <div class="kpi"><div class="k-lbl">Unsur terendah</div>${(() => { const lo = res.unsur.slice().sort((a, b) => a.nrr - b.nrr)[0]; return lo ? `<div style="font-weight:700;margin-top:4px">${esc(lo.nama)}</div><div class="k-sub">NRR ${fmt.n(lo.nrr, 2)} · ${esc(lo.kinerja)}</div>` : '-'; })()}</div>` :
        `<div class="kpi"><div class="k-lbl">Fasilitas</div><div class="k-val">${fkRows.length}</div></div><div class="kpi"><div class="k-lbl">Unit</div><div class="k-val">${unRows.length}</div></div>`}
      </div>
      ${!agg.total ? `<div class="card mt">${UI.empty('Belum ada respons untuk filter ini.', 'pie')}</div>` : `
      ${hasIkm ? `<div class="card mt"><h3>Nilai per unsur pelayanan</h3><div class="chart-box tall"><canvas id="d-unsur"></canvas></div>
        <div class="tbl-wrap mt" style="box-shadow:none;border:1px solid var(--line)"><table class="tbl"><tr><th>Unsur</th><th class="num">NRR</th><th class="num">Konversi</th><th>Mutu</th></tr>
        ${res.unsur.map(u => `<tr><td>${esc(u.kode)} ${esc(u.nama)}</td><td class="num">${fmt.n(u.nrr, 3)}</td><td class="num">${fmt.n(u.konversi, 2)}</td><td>${UI.mutu(u.mutu)} <span class="small">${esc(u.kinerja)}</span></td></tr>`).join('')}
        <tr><th>IKM</th><th class="num">${fmt.n(res.ikm, 3)}</th><th class="num">${fmt.n(res.konversi, 2)}</th><th>${UI.mutu(res.mutu)} ${esc(res.kinerja)}</th></tr></table></div></div>` : ''}
      <div class="grid2 mt">
        <div class="card"><h3>Tren respons ${trend(agg.harian).weekly ? '(mingguan)' : '(harian)'}</h3><div class="chart-box"><canvas id="d-trend"></canvas></div></div>
        ${Object.keys(agg.umur || {}).length ? `<div class="card"><h3>Kelompok umur</h3><div class="chart-box"><canvas id="d-umur"></canvas></div></div>` : ''}
      </div>
      ${fkRows.length > 1 ? `<div class="card mt"><h3>Perbandingan fasilitas</h3>${hasIkm ? `<div class="chart-box" style="height:${Math.max(200, fkRows.length * 34 + 40)}px"><canvas id="d-fk"></canvas></div>` : ''}
        <div class="tbl-wrap mt" style="box-shadow:none;border:1px solid var(--line)"><table class="tbl"><tr><th>#</th><th>Fasilitas</th><th class="num">Resp.</th>${hasIkm ? '<th class="num">IKM</th><th>Mutu</th>' : ''}</tr>
        ${fkRows.map((f, i) => `<tr><td>${i + 1}</td><td>${esc(f.nama)}</td><td class="num">${fmt.n(f.r.n)}</td>${hasIkm ? `<td class="num">${fmt.n(f.r.konversi, 2)}</td><td>${UI.mutu(f.r.mutu)}</td>` : ''}</tr>`).join('')}</table></div></div>` : ''}
      ${unRows.length ? `<div class="card mt"><h3>Per unit layanan</h3><div class="tbl-wrap" style="box-shadow:none;border:1px solid var(--line);max-height:360px"><table class="tbl"><tr><th>Unit</th>${fkRows.length > 1 ? '<th>Fasilitas</th>' : ''}<th class="num">Resp.</th>${hasIkm ? '<th class="num">IKM</th><th>Mutu</th>' : ''}</tr>
        ${unRows.map(u => `<tr><td>${esc(u.nama)}</td>${fkRows.length > 1 ? `<td class="small">${esc(u.fk)}</td>` : ''}<td class="num">${fmt.n(u.r.n)}</td>${hasIkm ? `<td class="num">${fmt.n(u.r.konversi, 2)}</td><td>${UI.mutu(u.r.mutu)}</td>` : ''}</tr>`).join('')}</table></div></div>` : ''}
      ${profilQ.length ? `<div class="sec-title"><h3>Profil responden</h3></div><div class="grid2">${profilQ.map(q => `<div class="card"><h3>${esc(q.label)}</h3><div class="chart-box"><canvas data-pq="${q.id}"></canvas></div></div>`).join('')}</div>` : ''}
      ${otherQ.length ? `<div class="sec-title"><h3>Pertanyaan lainnya</h3></div><div class="grid2">${otherQ.map(q => `<div class="card"><h3>${esc(q.label)}</h3><div class="chart-box"><canvas data-oq="${q.id}"></canvas></div></div>`).join('')}</div>` : ''}
      ${!ctx.publik && Object.keys(agg.teks || {}).length ? `<div class="sec-title"><h3>Saran & masukan</h3></div>${Object.keys(agg.teks).map(qid => { const q = form.pertanyaan.find(x => x.id === qid) || { label: qid }; const arr = agg.teks[qid].slice().reverse(); return `<div class="card"><h3>${esc(q.label)} <span class="chip gray">${arr.length}</span></h3><div style="max-height:320px;overflow:auto">${arr.slice(0, 100).map(t => `<div style="padding:9px 0;border-bottom:1px solid var(--line)"><div>${esc(t.t)}</div><div class="small muted">${esc(fName(t.fk))}${t.u ? ' · ' + esc(uName(t.u)) : ''} · ${fmt.dt(t.ts)}</div></div>`).join('')}</div></div>`; }).join('')}` : ''}
      `}`;

    if (!agg.total) return;
    try {
      if (hasIkm) await mk($('#d-unsur', el), chartCfgUnsur(res));
      const tr = trend(agg.harian);
      await mk($('#d-trend', el), { type: 'line', data: { labels: tr.labels, datasets: [{ label: 'Respons', data: tr.data, borderColor: PAL[0], backgroundColor: 'rgba(5,114,181,.12)', fill: true, tension: .35, pointRadius: 2 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      if ($('#d-umur', el)) {
        const order = ['< 20', '20–29', '30–39', '40–49', '50–59', '≥ 60'].filter(k => agg.umur[k]);
        await mk($('#d-umur', el), { type: 'bar', data: { labels: order, datasets: [{ data: order.map(k => agg.umur[k]), backgroundColor: PAL[1], borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      }
      if ($('#d-fk', el)) await mk($('#d-fk', el), { type: 'bar', data: { labels: fkRows.map(f => f.nama), datasets: [{ data: fkRows.map(f => Core.round(f.r.konversi, 2)), backgroundColor: fkRows.map(f => MUTU_C[f.r.mutu]), borderRadius: 6, maxBarThickness: 24 }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 100 } } } });
      for (const q of profilQ) {
        const d = distrib(q, agg.all).filter(x => x.n);
        await mk($(`[data-pq="${q.id}"]`, el), { type: 'doughnut', data: { labels: d.map(x => x.l), datasets: [{ data: d.map(x => x.n), backgroundColor: PAL }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '58%', plugins: { legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } } } } });
      }
      for (const q of otherQ) {
        const d = distrib(q, agg.all);
        await mk($(`[data-oq="${q.id}"]`, el), { type: 'bar', data: { labels: d.map(x => x.l), datasets: [{ data: d.map(x => x.n), backgroundColor: PAL[4], borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      }
    } catch (e) { UI.toast(e.message, 'bad'); }
  }

  return { render, destroy, chartImage, chartCfgUnsur, distrib, optLabel, trend, PAL, MUTU_C };
})();
