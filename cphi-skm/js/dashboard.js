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

  /* ---------- Label n & % di atas/di dalam grafik (plugin tanpa pustaka tambahan) ---------- */
  const pct = (n, t) => t ? fmt.n(n / t * 100, 1) + '%' : '0%';
  const NLabel = {
    id: 'nlabel',
    afterDatasetsDraw(ch, args, opt) {
      if (!opt || !opt.text) return;
      const c = ch.ctx, size = Math.round((opt.size || 11) * (ch.options.labelScale || 1)), lh = size + 2;
      c.save();
      c.font = `${opt.weight || 700} ${size}px "Plus Jakarta Sans", system-ui, sans-serif`;
      ch.data.datasets.forEach((ds, di) => {
        const meta = ch.getDatasetMeta(di);
        if (meta.hidden) return;
        meta.data.forEach((el, i) => {
          if (ch.getDataVisibility && !ch.getDataVisibility(i) && (meta.type === 'doughnut' || meta.type === 'pie')) return;
          const t = opt.text(ds.data[i], i, di, ch);
          if (t === null || t === undefined || t === '') return;
          const lines = Array.isArray(t) ? t : [t];
          const round = meta.type === 'doughnut' || meta.type === 'pie';
          let x, y, centered = false;
          if (round || opt.pos === 'center') { const p = !round && el.getCenterPoint ? el.getCenterPoint() : el.tooltipPosition(); x = p.x; y = p.y; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = opt.color || '#fff'; centered = true; }
          else if (ch.options.indexAxis === 'y') { x = el.x + 6; y = el.y; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillStyle = opt.color || '#0f172a'; centered = true; }
          else { x = el.x; y = el.y - 6; c.textAlign = 'center'; c.textBaseline = 'bottom'; c.fillStyle = opt.color || '#0f172a'; }
          const off = centered ? (lines.length - 1) * lh / 2 : (lines.length - 1) * lh;
          lines.forEach((ln, k) => c.fillText(ln, x, y - off + k * lh));
        });
      });
      c.restore();
    }
  };
  const truncTick = function (v) { const l = this.getLabelForValue(v); const n = window.innerWidth < 600 ? 20 : 34; return l.length > n ? l.slice(0, n - 1) + '…' : l; };

  function chartCfgUnsur(res) {
    return {
      type: 'bar', plugins: [NLabel],
      data: { labels: res.unsur.map(u => u.kode + ' ' + u.nama), datasets: [{ label: 'NRR', data: res.unsur.map(u => Core.round(u.nrr, 2)), backgroundColor: res.unsur.map(u => MUTU_C[u.mutu]), borderRadius: 6, maxBarThickness: 26 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, layout: { padding: { right: 92 } },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => { const u = res.unsur[c.dataIndex]; return [`NRR ${fmt.n(u.nrr, 3)} · konversi ${fmt.n(u.konversi, 2)}`, `${u.kinerja} · n = ${fmt.n(u.n)}`]; } } },
          nlabel: { text: (v, i) => { const u = res.unsur[i]; return `${fmt.n(u.nrr, 2)} (${fmt.n(u.konversi, 1)}) · n=${fmt.n(u.n)}`; } }
        },
        scales: { x: { min: 0, max: 4, ticks: { stepSize: 1 } }, y: { ticks: { font: { size: 11 }, callback: truncTick } } }
      }
    };
  }

  /* Sebaran jawaban 1–4 per unsur (100% bertumpuk) */
  function chartCfgSebaran(res, big) {
    const COL = ['#dc2626', '#f59e0b', '#38bdf8', '#16a34a'];
    const LBL = ['1 (terendah)', '2', '3', '4 (tertinggi)'];
    const cnt = k => res.unsur.map(u => u.c[String(k)] || 0);
    return {
      type: 'bar', plugins: [NLabel],
      data: {
        labels: res.unsur.map(u => u.kode + ' ' + u.nama),
        datasets: [1, 2, 3, 4].map((k, j) => ({ label: 'Nilai ' + LBL[j], data: res.unsur.map(u => u.n ? (u.c[String(k)] || 0) / u.n * 100 : 0), _n: cnt(k), backgroundColor: COL[j], maxBarThickness: 26 }))
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: big ? 15 : 11 } } },
          tooltip: { callbacks: { label: c => `${c.dataset.label}: n = ${fmt.n(c.dataset._n[c.dataIndex])} (${fmt.n(c.raw, 1)}%)` } },
          nlabel: { pos: 'center', size: 10, text: (v, i, di, ch) => v >= 9 ? [fmt.n(ch.data.datasets[di]._n[i]), fmt.n(v, 0) + '%'] : (v >= 5 ? fmt.n(v, 0) + '%' : '') }
        },
        scales: { x: { stacked: true, min: 0, max: 100, ticks: { callback: v => v + '%' } }, y: { stacked: true, ticks: { font: { size: 11 }, callback: truncTick } } }
      }
    };
  }

  function chartCfgTrend(tr, total) {
    return {
      type: 'line', plugins: [NLabel],
      data: { labels: tr.labels, datasets: [{ label: 'Respons', data: tr.data, borderColor: PAL[0], backgroundColor: 'rgba(5,114,181,.12)', fill: true, tension: .35, pointRadius: 3 }] },
      options: {
        responsive: true, maintainAspectRatio: false, layout: { padding: { top: 18 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `n = ${fmt.n(c.raw)} (${pct(c.raw, total)})` } }, nlabel: { size: 10, text: v => fmt.n(v) } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grace: '12%' } }
      }
    };
  }

  /* batang vertikal dengan label "n" dan "%" */
  function chartCfgBarNP(labels, values, color, total) {
    const t = total || values.reduce((a, b) => a + b, 0);
    return {
      type: 'bar', plugins: [NLabel],
      data: { labels, datasets: [{ data: values, backgroundColor: color, borderRadius: 6, maxBarThickness: 48 }] },
      options: {
        responsive: true, maintainAspectRatio: false, layout: { padding: { top: 30 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `n = ${fmt.n(c.raw)} (${pct(c.raw, t)})` } }, nlabel: { size: 10, text: v => v ? [fmt.n(v), pct(v, t)] : '' } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 }, grace: '15%' }, x: { ticks: { font: { size: 11 }, callback: truncTick } } }
      }
    };
  }

  function chartCfgDonut(labels, values, big) {
    const t = values.reduce((a, b) => a + b, 0);
    const narrow = !big && window.innerWidth < 700;
    return {
      type: 'doughnut', plugins: [NLabel],
      data: { labels, datasets: [{ data: values, backgroundColor: PAL, borderColor: '#fff', borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '52%',
        plugins: {
          legend: {
            position: narrow ? 'bottom' : 'right',
            labels: { boxWidth: big ? 18 : 12, font: { size: big ? 16 : 11 }, generateLabels: ch => Chart.overrides.doughnut.plugins.legend.labels.generateLabels(ch).map((l, i) => Object.assign(l, { text: `${l.text}: ${fmt.n(values[i])} (${pct(values[i], t)})` })) }
          },
          tooltip: { callbacks: { label: c => `${c.label}: n = ${fmt.n(c.raw)} (${pct(c.raw, t)})` } },
          nlabel: { size: 11, text: v => (v / t >= 0.06 ? pct(v, t) : '') }
        }
      }
    };
  }

  function chartCfgFk(fkRows) {
    return {
      type: 'bar', plugins: [NLabel],
      data: { labels: fkRows.map(f => f.nama), datasets: [{ data: fkRows.map(f => Core.round(f.r.konversi, 2)), backgroundColor: fkRows.map(f => MUTU_C[f.r.mutu]), borderRadius: 6, maxBarThickness: 24 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false, layout: { padding: { right: 96 } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `IKM ${fmt.n(c.raw, 2)} · mutu ${fkRows[c.dataIndex].r.mutu} · n = ${fmt.n(fkRows[c.dataIndex].r.n)}` } }, nlabel: { text: (v, i) => `${fmt.n(v, 2)} (${fkRows[i].r.mutu}) · n=${fmt.n(fkRows[i].r.n)}` } },
        scales: { x: { min: 0, max: 100 }, y: { ticks: { font: { size: 11 }, callback: truncTick } } }
      }
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
    cfg = Object.assign({}, cfg); cfg.options = Object.assign({}, cfg.options, { animation: false, responsive: false, devicePixelRatio: 2, labelScale: 1.3 });
    const fs = Chart.defaults.font.size; Chart.defaults.font.size = 14;
    const plugin = { id: 'bgwhite', beforeDraw: ch => { const x = ch.ctx; x.save(); x.fillStyle = '#fff'; x.fillRect(0, 0, ch.width, ch.height); x.restore(); } };
    cfg.plugins = (cfg.plugins || []).concat(plugin);
    const c = new Chart(cv, cfg);
    const url = cv.toDataURL('image/png');
    c.destroy(); cv.remove(); Chart.defaults.font.size = fs;
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
        <tr><th>IKM</th><th class="num">${fmt.n(res.ikm, 3)}</th><th class="num">${fmt.n(res.konversi, 2)}</th><th>${UI.mutu(res.mutu)} ${esc(res.kinerja)}</th></tr></table></div></div>
      <div class="card mt"><h3>Sebaran jawaban per unsur (n &amp; %)</h3><div class="chart-box" style="height:${Math.max(320, res.k * 40 + 90)}px"><canvas id="d-sebaran"></canvas></div></div>` : ''}
      <div class="grid2 mt">
        <div class="card"><h3>Tren respons ${trend(agg.harian).weekly ? '(mingguan)' : '(harian)'}</h3><div class="chart-box"><canvas id="d-trend"></canvas></div></div>
        ${Object.keys(agg.umur || {}).length ? `<div class="card"><h3>Kelompok umur</h3><div class="chart-box"><canvas id="d-umur"></canvas></div></div>` : ''}
      </div>
      ${fkRows.length > 1 ? `<div class="card mt"><h3>Perbandingan fasilitas</h3>${hasIkm ? `<div class="chart-box" style="height:${Math.max(200, fkRows.length * 34 + 40)}px"><canvas id="d-fk"></canvas></div>` : ''}
        <div class="tbl-wrap mt" style="box-shadow:none;border:1px solid var(--line)"><table class="tbl"><tr><th>#</th><th>Fasilitas</th><th class="num">n (%)</th>${hasIkm ? '<th class="num">IKM</th><th>Mutu</th>' : ''}</tr>
        ${fkRows.map((f, i) => `<tr><td>${i + 1}</td><td>${esc(f.nama)}</td><td class="num">${fmt.n(f.r.n)} <span class="small muted">(${pct(f.r.n, agg.total)})</span></td>${hasIkm ? `<td class="num">${fmt.n(f.r.konversi, 2)}</td><td>${UI.mutu(f.r.mutu)}</td>` : ''}</tr>`).join('')}</table></div></div>` : ''}
      ${unRows.length ? `<div class="card mt"><h3>Per unit layanan</h3><div class="tbl-wrap" style="box-shadow:none;border:1px solid var(--line);max-height:360px"><table class="tbl"><tr><th>Unit</th>${fkRows.length > 1 ? '<th>Fasilitas</th>' : ''}<th class="num">n (%)</th>${hasIkm ? '<th class="num">IKM</th><th>Mutu</th>' : ''}</tr>
        ${unRows.map(u => `<tr><td>${esc(u.nama)}</td>${fkRows.length > 1 ? `<td class="small">${esc(u.fk)}</td>` : ''}<td class="num">${fmt.n(u.r.n)} <span class="small muted">(${pct(u.r.n, agg.total)})</span></td>${hasIkm ? `<td class="num">${fmt.n(u.r.konversi, 2)}</td><td>${UI.mutu(u.r.mutu)}</td>` : ''}</tr>`).join('')}</table></div></div>` : ''}
      ${profilQ.length ? `<div class="sec-title"><h3>Profil responden</h3></div><div class="grid2">${profilQ.map(q => `<div class="card"><h3>${esc(q.label)} <span class="chip gray">n=${fmt.n((agg.all.q[q.id] || {}).n || 0)}</span></h3><div class="chart-box" style="height:${window.innerWidth < 700 ? 230 + Math.min((q.opsi || []).length, 9) * 20 : 280}px"><canvas data-pq="${q.id}"></canvas></div></div>`).join('')}</div>` : ''}
      ${otherQ.length ? `<div class="sec-title"><h3>Pertanyaan lainnya</h3></div><div class="grid2">${otherQ.map(q => `<div class="card"><h3>${esc(q.label)} <span class="chip gray">n=${fmt.n((agg.all.q[q.id] || {}).n || 0)}</span></h3><div class="chart-box"><canvas data-oq="${q.id}"></canvas></div></div>`).join('')}</div>` : ''}
      ${!ctx.publik && Object.keys(agg.teks || {}).length ? `<div class="sec-title"><h3>Saran & masukan</h3></div>${Object.keys(agg.teks).map(qid => { const q = form.pertanyaan.find(x => x.id === qid) || { label: qid }; const arr = agg.teks[qid].slice().reverse(); return `<div class="card"><h3>${esc(q.label)} <span class="chip gray">${arr.length}</span></h3><div style="max-height:320px;overflow:auto">${arr.slice(0, 100).map(t => `<div style="padding:9px 0;border-bottom:1px solid var(--line)"><div>${esc(t.t)}</div><div class="small muted">${esc(fName(t.fk))}${t.u ? ' · ' + esc(uName(t.u)) : ''} · ${fmt.dt(t.ts)}</div></div>`).join('')}</div></div>`; }).join('')}` : ''}
      `}`;

    if (!agg.total) return;
    try {
      if (hasIkm) { await mk($('#d-unsur', el), chartCfgUnsur(res)); await mk($('#d-sebaran', el), chartCfgSebaran(res)); }
      const tr = trend(agg.harian);
      await mk($('#d-trend', el), chartCfgTrend(tr, agg.total));
      if ($('#d-umur', el)) {
        const order = ['< 20', '20–29', '30–39', '40–49', '50–59', '≥ 60'].filter(k => agg.umur[k]);
        await mk($('#d-umur', el), chartCfgBarNP(order, order.map(k => agg.umur[k]), PAL[1]));
      }
      if ($('#d-fk', el)) await mk($('#d-fk', el), chartCfgFk(fkRows));
      for (const q of profilQ) {
        const d = distrib(q, agg.all).filter(x => x.n);
        await mk($(`[data-pq="${q.id}"]`, el), chartCfgDonut(d.map(x => x.l), d.map(x => x.n)));
      }
      for (const q of otherQ) {
        const d = distrib(q, agg.all);
        await mk($(`[data-oq="${q.id}"]`, el), chartCfgBarNP(d.map(x => x.l), d.map(x => x.n), PAL[4], (agg.all.q[q.id] || {}).n));
      }
    } catch (e) { UI.toast(e.message, 'bad'); }
  }

  return { render, destroy, chartImage, chartCfgUnsur, chartCfgSebaran, chartCfgFk, chartCfgDonut, chartCfgBarNP, chartCfgTrend, NLabel, distrib, optLabel, trend, PAL, MUTU_C };
})();
