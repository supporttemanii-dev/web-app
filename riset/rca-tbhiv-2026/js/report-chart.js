/* RCA TB-HIV 2026 · grafik laporan. Satu penggambar (kanvas) untuk tampilan layar, PDF, dan Word,
   sehingga grafik di ketiganya sama persis. Jenis: hbar, stack, funnel, range, dot, group, heat, heatnum. */
(function () {
  'use strict';
  const RCA = window.RCA;
  const C = RCA.rchart = {};
  const INK = '#1e2a2c', MUTED = '#5d6b6e', GRID = '#dfe5e6', TEAL = '#0f5c63';
  const FONT = '"Segoe UI", "Helvetica Neue", Arial, sans-serif';
  const W = 1000;

  const tr = (s, lang) => lang === 'en' && RCA.reportEN ? (RCA.reportEN.fixed(String(s)) || String(s)) : String(s);
  function wrap(ctx, text, maxW, maxLines) {
    const words = String(text).split(/\s+/), lines = []; let cur = '';
    words.forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { const keep = lines.slice(0, maxLines); let last = keep[maxLines - 1]; while (ctx.measureText(last + '…').width > maxW && last.length > 1) last = last.slice(0, -1); keep[maxLines - 1] = last + '…'; return keep; }
    return lines;
  }
  function canvas(h) {
    const c = document.createElement('canvas'), s = 2;
    c.width = W * s; c.height = Math.ceil(h) * s; c.style.width = '100%'; c.style.maxWidth = W + 'px'; c.style.height = 'auto';
    const x = c.getContext('2d'); x.scale(s, s); x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, h); x.textBaseline = 'middle';
    c._w = W; c._h = Math.ceil(h);
    return [c, x];
  }
  const font = (x, px, bold) => { x.font = (bold ? '600 ' : '') + px + 'px ' + FONT; };
  function legend(x, items, y, lang) {
    font(x, 13); let cx = 20, cy = y;
    items.forEach(([lab, col, hollow]) => {
      const t = tr(lab, lang), w = x.measureText(t).width + 34;
      if (cx + w > W - 20) { cx = 20; cy += 22; }
      x.fillStyle = col; if (hollow) { x.strokeStyle = col; x.lineWidth = 2; x.strokeRect(cx, cy - 6, 12, 12); } else x.fillRect(cx, cy - 6, 12, 12);
      x.fillStyle = INK; x.textAlign = 'left'; x.fillText(t, cx + 18, cy); cx += w;
    });
    return cy + 22;
  }
  function legendH(items, lang) { const [, x] = canvas(10); font(x, 13); let cx = 20, rows = 1; items.forEach(([lab]) => { const w = x.measureText(tr(lab, lang)).width + 34; if (cx + w > W - 20) { cx = 20; rows++; } cx += w; }); return rows * 22 + 8; }
  function axis(x, x0, x1, y0, y1, max, pct, ticks) {
    font(x, 12); x.strokeStyle = GRID; x.lineWidth = 1; x.fillStyle = MUTED; x.textAlign = 'center';
    const n = ticks || 5;
    for (let i = 0; i <= n; i++) { const v = max * i / n, px = x0 + (x1 - x0) * i / n; x.beginPath(); x.moveTo(px, y0); x.lineTo(px, y1); x.stroke(); x.fillText((Math.round(v * 10) / 10) + (pct ? '%' : ''), px, y1 + 14); }
  }
  const nice = v => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };

  /* ---------- batang mendatar */
  function hbar(ch, lang) {
    const it = ch.items || [], LW = 340, X0 = LW + 30, X1 = W - 110, RH = 34;
    const max = ch.max || nice(Math.max(1, ...it.map(i => i.value)));
    const H = 20 + it.length * RH + 34;
    const [c, x] = canvas(H);
    axis(x, X0, X1, 10, 10 + it.length * RH, max, ch.pct);
    it.forEach((i, k) => {
      const y = 10 + k * RH + RH / 2;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right';
      const ls = wrap(x, tr(i.label, lang), LW, 2); ls.forEach((l, j) => x.fillText(l, LW + 20, y + (j - (ls.length - 1) / 2) * 15));
      const w = Math.max(0, (X1 - X0) * Math.min(i.value, max) / max);
      x.globalAlpha = i.warn ? 0.4 : 1; x.fillStyle = i.color || TEAL; x.fillRect(X0, y - 10, w, 20); x.globalAlpha = 1;
      font(x, 13, true); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(i.txt !== undefined ? i.txt : String(i.value) + (ch.pct ? '%' : ''), X0 + w + 6, y);
    });
    return c;
  }
  /* ---------- batang bertumpuk (100% atau jumlah) */
  function stack(ch, lang) {
    const rows = ch.rows || [], ser = ch.series || [], LW = 200, X0 = LW + 30, X1 = W - 70, RH = 36;
    const lh = legendH(ser.map(s => [s.label, s.color]), lang);
    const tot = rows.map(r => r.parts.reduce((a, b) => a + b, 0)), max = ch.pct ? 100 : nice(Math.max(1, ...tot));
    const H = lh + 10 + rows.length * RH + 34;
    const [c, x] = canvas(H);
    legend(x, ser.map(s => [s.label, s.color]), 14, lang);
    const y0 = lh + 6;
    axis(x, X0, X1, y0, y0 + rows.length * RH, max, ch.pct);
    rows.forEach((r, k) => {
      const y = y0 + k * RH + RH / 2, T = tot[k] || 1;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right'; const ls = wrap(x, tr(r.label, lang), LW, 2); ls.forEach((l, j) => x.fillText(l, LW + 20, y + (j - (ls.length - 1) / 2) * 15));
      let cx = X0;
      r.parts.forEach((v, j) => {
        if (!v) return; const w = (X1 - X0) * (ch.pct ? v / T : v / max);
        x.fillStyle = ser[j].color; x.fillRect(cx, y - 12, w, 24);
        if (w > 26) { font(x, 12, true); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(String(v), cx + w / 2, y); }
        cx += w;
      });
      font(x, 12); x.fillStyle = MUTED; x.textAlign = 'left'; x.fillText('n=' + tot[k], (ch.pct ? X1 : cx) + 6, y);
    });
    return c;
  }
  /* ---------- kaskade */
  function funnel(ch, lang) {
    const st = ch.steps || [], LW = 360, X0 = LW + 30, X1 = W - 150, RH = 38;
    const max = Math.max(1, ...st.map(s => s.n));
    const H = 16 + st.length * RH + 12;
    const [c, x] = canvas(H);
    st.forEach((s, k) => {
      const y = 12 + k * RH + RH / 2, w = (X1 - X0) * s.n / max;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right'; const ls = wrap(x, tr(s.label, lang), LW, 2); ls.forEach((l, j) => x.fillText(l, LW + 20, y + (j - (ls.length - 1) / 2) * 15));
      x.fillStyle = k === 0 ? TEAL : 'rgba(15,92,99,' + Math.max(0.35, 1 - k * 0.09) + ')'; x.fillRect(X0 + (X1 - X0 - w) / 2, y - 13, w, 26);
      font(x, 13, true); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(String(s.n), X1 + 8, y);
      if (k && st[k - 1].n) { const r = s.n / st[k - 1].n; font(x, 12); x.fillStyle = r < 0.7 ? '#c0503d' : MUTED; x.fillText((r <= 1 ? '↓ ' : '') + Math.round(r * 100) + '%', X1 + 56, y); }
    });
    return c;
  }
  /* ---------- median dan IQR */
  function range(ch, lang) {
    const it = ch.items || [], LW = 340, X0 = LW + 30, X1 = W - 170, RH = 34;
    const max = nice(Math.max(1, ...it.map(i => i.q3 || i.med || 0)) * 1.05);
    const H = 20 + it.length * RH + 34;
    const [c, x] = canvas(H);
    axis(x, X0, X1, 10, 10 + it.length * RH, max, false);
    const px = v => X0 + (X1 - X0) * Math.min(v, max) / max;
    it.forEach((i, k) => {
      const y = 10 + k * RH + RH / 2;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right'; const ls = wrap(x, tr(i.label, lang), LW, 2); ls.forEach((l, j) => x.fillText(l, LW + 20, y + (j - (ls.length - 1) / 2) * 15));
      x.fillStyle = 'rgba(15,92,99,.28)'; x.fillRect(px(i.q1), y - 8, Math.max(2, px(i.q3) - px(i.q1)), 16);
      x.fillStyle = TEAL; x.beginPath(); x.arc(px(i.med), y, 6, 0, Math.PI * 2); x.fill();
      font(x, 12); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(i.med + ' (' + i.q1 + '–' + i.q3 + ') n=' + i.n, X1 + 8, y);
    });
    font(x, 12); x.fillStyle = MUTED; x.textAlign = 'right'; x.fillText(lang === 'en' ? 'days' : 'hari', X1, H - 6);
    return c;
  }
  /* ---------- titik dengan pita batas (faktor verifikasi) */
  function dot(ch, lang) {
    const it = ch.items || [], LW = 300, X0 = LW + 30, X1 = W - 80, RH = 28;
    const lo = Math.min(0.5, ...it.map(i => i.value)) , hi = Math.max(1.5, ...it.map(i => i.value));
    const a = Math.floor(lo * 10) / 10, b = Math.ceil(hi * 10) / 10;
    const H = 20 + it.length * RH + 34;
    const [c, x] = canvas(H);
    const px = v => X0 + (X1 - X0) * (v - a) / (b - a);
    const band = ch.band || [0.9, 1.1];
    x.fillStyle = 'rgba(46,139,87,.14)'; x.fillRect(px(band[0]), 10, px(band[1]) - px(band[0]), it.length * RH);
    x.strokeStyle = '#2e8b57'; x.setLineDash([4, 4]); x.beginPath(); x.moveTo(px(1), 10); x.lineTo(px(1), 10 + it.length * RH); x.stroke(); x.setLineDash([]);
    font(x, 12); x.fillStyle = MUTED; x.textAlign = 'center';
    for (let v = a; v <= b + 1e-9; v += (b - a) / 5) x.fillText(v.toFixed(2), px(v), 10 + it.length * RH + 14);
    it.forEach((i, k) => {
      const y = 10 + k * RH + RH / 2;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right'; x.fillText(tr(i.label, lang), LW + 20, y);
      const col = i.value < band[0] || i.value > band[1] ? '#c0503d' : '#2e8b57';
      x.beginPath(); x.arc(px(i.value), y, 7, 0, Math.PI * 2);
      if (i.sah === false) { x.strokeStyle = col; x.lineWidth = 2.5; x.stroke(); } else { x.fillStyle = col; x.fill(); }
      font(x, 12, true); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(i.value.toFixed(2), px(i.value) + 11, y);
    });
    return c;
  }
  /* ---------- batang berkelompok (kategori × seri) */
  function group(ch, lang) {
    const cats = ch.cats || [], ser = ch.series || [], LW = 260, X0 = LW + 30, X1 = W - 70, BH = 14, GAP = 14;
    const lh = legendH(ser.map(s => [s.label, s.color]), lang);
    const GH = ser.length * BH + GAP;
    const max = ch.max || nice(Math.max(1, ...ser.flatMap(s => s.values)));
    const H = lh + 10 + cats.length * GH + 34;
    const [c, x] = canvas(H);
    legend(x, ser.map(s => [s.label, s.color]), 14, lang);
    const y0 = lh + 6;
    axis(x, X0, X1, y0, y0 + cats.length * GH, max, ch.pct);
    cats.forEach((cat, k) => {
      const gy = y0 + k * GH + GAP / 2;
      font(x, 13); x.fillStyle = INK; x.textAlign = 'right'; const ls = wrap(x, tr(cat, lang), LW, 2); ls.forEach((l, j) => x.fillText(l, LW + 20, gy + ser.length * BH / 2 + (j - (ls.length - 1) / 2) * 15));
      ser.forEach((s, j) => { const v = s.values[k] || 0, w = (X1 - X0) * Math.min(v, max) / max, y = gy + j * BH;
        x.fillStyle = s.color; x.fillRect(X0, y + 1, w, BH - 2); if (v) { font(x, 11); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(String(v) + (ch.pct ? '%' : ''), X0 + w + 4, y + BH / 2); } });
    });
    return c;
  }
  /* ---------- peta panas kategori */
  function heat(ch, lang) {
    const cols = ch.cols || [], rows = ch.rows || [], LW = 120, CW = Math.min(56, (W - LW - 40) / Math.max(1, cols.length)), RH = 26;
    const lg = (ch.legend || []).map(([l, c2]) => [l, c2]);
    const lh = legendH(lg, lang);
    const H = lh + 30 + rows.length * RH + 10;
    const [c, x] = canvas(H);
    legend(x, lg, 14, lang);
    const y0 = lh + 26, colMap = {}; lg.forEach(([l, c2]) => { colMap[l] = c2; });
    font(x, 12, true); x.fillStyle = INK; x.textAlign = 'center';
    cols.forEach((cl, j) => x.fillText(cl, LW + 20 + j * CW + CW / 2, y0 - 12));
    rows.forEach((r, k) => {
      const y = y0 + k * RH;
      font(x, 12); x.fillStyle = INK; x.textAlign = 'right'; x.fillText(tr(r.label, lang), LW + 12, y + RH / 2);
      r.cells.forEach((v, j) => { x.fillStyle = colMap[v] || '#f4f6f6'; x.fillRect(LW + 20 + j * CW + 1, y + 1, CW - 2, RH - 2); });
    });
    return c;
  }
  /* ---------- peta panas angka */
  function heatnum(ch, lang) {
    const cols = ch.cols || [], rows = ch.rows || [], LW = 90, CW = Math.min(110, (W - LW - 40) / Math.max(1, cols.length)), RH = 28;
    const max = Math.max(1, ...rows.flatMap(r => r.cells));
    const lab = (ch.colLabels || cols).map(l => tr(l, lang));
    const [m] = canvas(10), mx = m.getContext('2d'); font(mx, 11);
    const headLines = lab.map(l => wrap(mx, l, CW - 6, 3));
    const HH = Math.max(...headLines.map(l => l.length)) * 13 + 10;
    const H = HH + rows.length * RH + 16;
    const [c, x] = canvas(H);
    font(x, 11); x.fillStyle = INK; x.textAlign = 'center';
    headLines.forEach((ls, j) => ls.forEach((l, i) => x.fillText(l, LW + 20 + j * CW + CW / 2, 10 + i * 13)));
    rows.forEach((r, k) => {
      const y = HH + k * RH;
      font(x, 12, true); x.fillStyle = INK; x.textAlign = 'right'; x.fillText(r.label, LW + 12, y + RH / 2);
      r.cells.forEach((v, j) => { const a = v ? 0.15 + 0.75 * v / max : 0; x.fillStyle = v ? 'rgba(15,92,99,' + a + ')' : '#f4f6f6'; x.fillRect(LW + 20 + j * CW + 1, y + 1, CW - 2, RH - 2);
        if (v) { font(x, 12, true); x.fillStyle = a > 0.5 ? '#fff' : INK; x.textAlign = 'center'; x.fillText(String(v), LW + 20 + j * CW + CW / 2, y + RH / 2); } });
    });
    return c;
  }

  /* ---------- alur pasien: tahap berurutan + kotak bukti C1–C7 + status akhir */
  const FC = { C1: '#00897b', C3: '#0f5c63', C4: '#6d8f12', C5: '#1a8fa3', C6: '#b0453a', C7: '#7a5aa8' };
  function journey(ch, lang) {
    const M = ch.model, L = lang === 'en' ? 1 : 0, F = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
    const RH = 50, GAP = 16, TOP = 46, n = M.nodes.length;
    const BX = 20, BW = 470, EX = 560, EW = 64, EG = 6;
    const yOut = TOP + n * (RH + GAP) + 20, OH = 104;
    const H = yOut + OH + 20 + 56 + 10;
    const [c, x] = canvas(H);
    // judul kolom
    font(x, 12, true); x.fillStyle = MUTED; x.textAlign = 'left'; x.fillText(L ? 'Stage (protocol checkpoints)' : 'Tahap (titik penilaian protokol)', BX, 22);
    x.textAlign = 'center'; x.fillText(L ? 'C3 units' : 'Unit C3', 520, 22);
    F.forEach((f, i) => { x.fillStyle = FC[f]; x.fillText(f, EX + i * (EW + EG) + EW / 2, 22); });
    font(x, 11); x.fillStyle = MUTED; x.fillText(L ? 'evidence items per form' : 'jumlah bukti per formulir', EX + (6 * (EW + EG) - EG) / 2, 37);
    const rr = (x0, y0, w, h, r) => { x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r); x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath(); };
    M.nodes.forEach((nd, k) => {
      const y = TOP + k * (RH + GAP);
      // panah ke tahap berikut
      if (k < n - 1) { x.strokeStyle = '#9fb3b6'; x.lineWidth = 2; x.beginPath(); x.moveTo(BX + 30, y + RH); x.lineTo(BX + 30, y + RH + GAP); x.stroke(); x.fillStyle = '#9fb3b6'; x.beginPath(); x.moveTo(BX + 25, y + RH + GAP - 6); x.lineTo(BX + 35, y + RH + GAP - 6); x.lineTo(BX + 30, y + RH + GAP); x.fill(); }
      rr(BX, y, BW, RH, 8); x.fillStyle = nd.gaps ? '#fdf0ee' : '#eef6f6'; x.fill(); x.lineWidth = nd.gaps ? 2 : 1; x.strokeStyle = nd.gaps ? '#c0503d' : '#b9cfd1'; x.stroke();
      x.fillStyle = '#009c8e'; x.beginPath(); x.arc(BX + 30, y + RH / 2, 14, 0, Math.PI * 2); x.fill();
      font(x, 13, true); x.fillStyle = '#fff'; x.textAlign = 'center'; x.fillText(String(k + 1), BX + 30, y + RH / 2);
      x.textAlign = 'left'; x.fillStyle = INK; font(x, 13, true);
      const ls = wrap(x, nd.t[L], BW - 70, 1); x.fillText(ls[0], BX + 54, y + 17);
      font(x, 11); x.fillStyle = MUTED; x.fillText(nd.cps.join(', ') + (nd.gaps ? (L ? ' · breakdowns in ' : ' · titik putus pada ') + nd.gaps + (L ? ' units' : ' unit') : ''), BX + 54, y + 35);
      if (nd.gaps) { x.fillStyle = '#c0503d'; x.fillRect(BX + BW - 6, y + 8, 3, RH - 16); }
      font(x, 16, true); x.fillStyle = INK; x.textAlign = 'center'; x.fillText(String(nd.reach), 520, y + RH / 2);
      F.forEach((f, i) => {
        const ex = EX + i * (EW + EG), v = nd.ev[f] || 0;
        rr(ex, y + 6, EW, RH - 12, 6); x.fillStyle = v ? FC[f] : '#f2f5f5'; x.globalAlpha = v ? Math.min(1, 0.35 + v / 12) : 1; x.fill(); x.globalAlpha = 1;
        x.strokeStyle = v ? FC[f] : GRID; x.lineWidth = 1; x.stroke();
        font(x, 15, true); x.fillStyle = v ? '#fff' : '#a3b1b3'; x.fillText(String(v), ex + EW / 2, y + RH / 2);
      });
    });
    // pencabangan ke status akhir
    const ow = (W - 40 - 3 * 14) / 4, lastY = TOP + (n - 1) * (RH + GAP) + RH;
    x.strokeStyle = '#9fb3b6'; x.lineWidth = 2; x.beginPath(); x.moveTo(BX + 30, lastY); x.lineTo(BX + 30, yOut - 10); x.lineTo(20 + 3 * (ow + 14) + ow / 2, yOut - 10); x.stroke();
    M.outcomes.forEach((o, i) => {
      const ox = 20 + i * (ow + 14);
      x.beginPath(); x.moveTo(ox + ow / 2, yOut - 10); x.lineTo(ox + ow / 2, yOut); x.stroke();
      rr(ox, yOut, ow, OH, 8); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 2; x.strokeStyle = o.color; x.stroke();
      x.fillStyle = o.color; rr(ox, yOut, ow, 6, 3); x.fill();
      font(x, 12, true); x.fillStyle = INK; x.textAlign = 'left'; wrap(x, o.t[L], ow - 64, 3).forEach((l, j) => x.fillText(l, ox + 10, yOut + 22 + j * 15));
      font(x, 22, true); x.fillStyle = o.color; x.textAlign = 'right'; x.fillText(String(o.reach), ox + ow - 10, yOut + 26);
      font(x, 10); x.fillStyle = MUTED; x.fillText(L ? 'C3 units' : 'unit C3', ox + ow - 10, yOut + 44);
      const ev = F.filter(f => o.ev[f]).map(f => f + ' ' + o.ev[f]).join(' · ');
      font(x, 11); x.textAlign = 'left'; x.fillStyle = MUTED; x.fillText(wrap(x, (L ? 'Evidence: ' : 'Bukti: ') + (ev || '–'), ow - 20, 1)[0], ox + 10, yOut + OH - 14);
    });
    // lintas tahap
    const cy = yOut + OH + 20, cr = M.cross;
    rr(20, cy, W - 40, 50, 8); x.setLineDash([6, 4]); x.strokeStyle = '#1fb3c4'; x.lineWidth = 1.5; x.stroke(); x.setLineDash([]);
    font(x, 13, true); x.fillStyle = INK; x.textAlign = 'left'; x.fillText(cr.t[L] + ' (' + cr.cps.join(', ') + ')', 34, cy + 18);
    font(x, 12); x.fillStyle = MUTED; x.fillText((L ? 'Evidence: ' : 'Bukti: ') + (F.filter(f => cr.ev[f]).map(f => f + ' ' + cr.ev[f]).join(' · ') || '–') + (L ? ' · applies to all stages' : ' · berlaku di semua tahap'), 34, cy + 36);
    return c;
  }
  const KINDS = { hbar, stack, funnel, range, dot, group, heat, heatnum, journey };
  /** gambar grafik; mengembalikan kanvas (lebar logis 1000 px, resolusi 2×) */
  C.draw = function (ch, lang) { const fn = KINDS[ch.kind]; if (!fn) return null; try { return fn(ch, lang); } catch (e) { console.warn('grafik', ch.id, e); return null; } };
  /** PNG untuk PDF/Word: { dataUrl, bytes (Uint8Array), w, h } */
  C.png = function (ch, lang, jpeg) {
    const c = C.draw(ch, lang); if (!c) return null;
    const url = jpeg ? c.toDataURL('image/jpeg', 0.9) : c.toDataURL('image/png'), b = atob(url.split(',')[1]), u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return { dataUrl: url, bytes: u, w: c._w, h: c._h };
  };

  /* ---------- seni sampul (palet bernuansa toska–hijau limau; tanpa logo) */
  C.KMK = { tealD: '#006E68', teal: '#00A39A', aqua: '#00B2C4', lime: '#C9DD03', grey: '#5E5F5F', mist: '#E6F5F3' };
  C.coverArt = function (w, hgt) {
    w = w || 1000; hgt = hgt || 600;
    const c = document.createElement('canvas'), sc = 2; c.width = w * sc; c.height = hgt * sc;
    const x = c.getContext('2d'); x.scale(sc, sc);
    const g = x.createLinearGradient(0, 0, w, hgt); g.addColorStop(0, '#00655F'); g.addColorStop(0.55, '#008F86'); g.addColorStop(1, '#00A9B5');
    x.fillStyle = g; x.fillRect(0, 0, w, hgt);
    // lingkaran tembus pandang
    [[w * 0.86, hgt * 0.18, hgt * 0.55, 'rgba(0,178,196,.35)'], [w * 0.98, hgt * 0.78, hgt * 0.42, 'rgba(201,221,3,.22)'], [w * 0.62, hgt * 1.05, hgt * 0.36, 'rgba(255,255,255,.08)']].forEach(([cx, cy, r, col]) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); });
    // pita diagonal hijau limau
    x.fillStyle = C.KMK.lime; x.beginPath(); x.moveTo(0, hgt - 26); x.lineTo(w, hgt - 70); x.lineTo(w, hgt - 58); x.lineTo(0, hgt - 14); x.closePath(); x.fill();
    x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.moveTo(0, hgt - 14); x.lineTo(w, hgt - 58); x.lineTo(w, hgt); x.lineTo(0, hgt); x.closePath(); x.fill();
    // motif alur pasien: sepuluh titik bersambung lalu bercabang ke empat status akhir
    const y0 = hgt * 0.80, x0 = w * 0.06, step = w * 0.052;
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + step * 9, y0); x.stroke();
    const outs = ['#7fd6a3', '#9cc3f0', '#f3b37a', '#f08a7c'];
    outs.forEach((col, i) => { const ty = y0 - 54 + i * 36, tx = x0 + step * 11.2; x.strokeStyle = 'rgba(255,255,255,.45)'; x.beginPath(); x.moveTo(x0 + step * 9, y0); x.bezierCurveTo(x0 + step * 10, y0, x0 + step * 10.2, ty, tx, ty); x.stroke(); x.fillStyle = col; x.beginPath(); x.arc(tx, ty, 7, 0, Math.PI * 2); x.fill(); });
    for (let i = 0; i < 10; i++) { x.fillStyle = i % 3 === 2 ? C.KMK.lime : '#ffffff'; x.beginPath(); x.arc(x0 + step * i, y0, i % 3 === 2 ? 7 : 5.5, 0, Math.PI * 2); x.fill(); }
    const url = c.toDataURL('image/jpeg', 0.92), b = atob(url.split(',')[1]), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return { dataUrl: url, bytes: u, w, h: hgt };
  };

  /* ---------- sampul halaman penuh (gaya laporan kinerja: latar terang bertekstur, lingkaran toska–limau, gelombang bawah) */
  C.COVER = { ink: '#0E5A54', teal: '#1BB3A7', lime: '#C9D831', paper: '#F1F1EE', sub: '#0E8F86' };
  C.coverPage = function (opt) {
    opt = opt || {}; const PX = opt.pxmm || 5.905, Wm = 210, Hm = 297, K = C.COVER;
    const c = document.createElement('canvas'); c.width = Math.round(Wm * PX); c.height = Math.round(Hm * PX);
    const x = c.getContext('2d'); x.scale(PX, PX);
    const circ = (cx, cy, r, col) => { x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); };
    x.fillStyle = K.paper; x.fillRect(0, 0, Wm, Hm);
    // tekstur kertas (acak tetap)
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 2600; i++) { x.fillStyle = 'rgba(80,80,70,' + (0.03 + rnd() * 0.07) + ')'; x.fillRect(rnd() * Wm, rnd() * Hm, 0.25 + rnd() * 0.35, 0.25 + rnd() * 0.35); }
    // kanan atas
    circ(212, 27, 104, K.teal);
    x.strokeStyle = '#ffffff'; x.lineWidth = 2.6; x.beginPath(); x.arc(212, 5, 95, 0, Math.PI * 2); x.stroke();
    circ(131, 47, 27, K.lime); circ(128, 96, 4.5, K.teal); circ(147, 93, 9, K.lime); circ(172, 106, 13.5, K.lime); circ(208, 116, 20, K.lime); circ(193, 128, 7, K.teal);
    // gelombang bawah
    x.fillStyle = K.lime; x.beginPath(); x.moveTo(0, 262); x.bezierCurveTo(70, 262, 140, 236, 210, 212); x.lineTo(210, 297); x.lineTo(0, 297); x.closePath(); x.fill();
    x.fillStyle = K.teal; x.beginPath(); x.moveTo(0, 281); x.bezierCurveTo(60, 276, 140, 262, 210, 247); x.lineTo(210, 297); x.lineTo(0, 297); x.closePath(); x.fill();
    circ(176, 235, 6.3, K.teal); circ(197, 231, 6.3, K.teal);
    circ(14, 266, 3.6, '#fff'); circ(25, 281, 2.7, '#fff'); circ(1, 289, 9, '#fff');
    // penanda kecil kiri atas (tiga titik alur)
    circ(20, 22.5, 2.6, K.teal); circ(26.5, 22.5, 2.6, K.lime); circ(33, 22.5, 2.6, K.teal);
    x.strokeStyle = K.teal; x.lineWidth = 0.7; x.beginPath(); x.moveTo(20, 22.5); x.lineTo(33, 22.5); x.stroke();
    // tahun bergaris tepi
    if (opt.year) { x.font = '900 25px "Arial Black", "Segoe UI", Arial, sans-serif'; x.textBaseline = 'alphabetic'; x.strokeStyle = K.ink; x.lineWidth = 0.55; x.strokeText(opt.year, 18, 113); }
    // teks (pratinjau layar); PDF dan Word menulis teksnya sendiri agar dapat dipilih dan diedit
    if (opt.text) opt.text.forEach(t => { x.font = (t.bold ? '700 ' : '400 ') + (t.pt * 0.3528) + 'px Helvetica, Arial, sans-serif'; x.fillStyle = t.color; x.textBaseline = 'alphabetic'; x.fillText(t.t, t.x, t.y); });
    return c;
  };
  /** tata letak teks sampul (mm, pt) — dipakai pratinjau layar dan PDF */
  C.coverText = function (cv, L, meta, measure) {
    const K = C.COVER, out = [], M = 18, maxW = 150, pick = a => a ? a[L] : '';
    out.push({ t: 'RCA TB-HIV 2026', x: 39, y: 21.2, pt: 9, bold: true, color: K.ink }, { t: pick(cv.kicker), x: 39, y: 25.6, pt: 7.5, bold: true, color: K.sub });
    const big = pick(cv.big) || [];
    let pt = 40; while (pt > 22 && big.some(l => measure(l, pt, true) > maxW)) pt -= 1;
    let y = 133; big.forEach(l => { out.push({ t: l, x: M, y, pt, bold: true, color: K.ink }); y += pt * 0.3528 * 1.08; });
    y += 3; const sp = 13; (pick(cv.subl) || []).forEach(l => { out.push({ t: l, x: M + 1, y, pt: sp, bold: true, color: K.sub }); y += sp * 0.3528 * 1.35; });
    y += 9; out.push({ t: pick(cv.scope), x: M + 1, y, pt: 11, bold: true, color: K.ink }); y += 6;
    out.push({ t: pick(cv.by), x: M + 1, y, pt: 9.5, bold: false, color: '#2E3B3D' }); y += 4.8;
    out.push({ t: pick(cv.to), x: M + 1, y, pt: 9.5, bold: false, color: '#2E3B3D' }); y += 4.8;
    out.push({ t: pick(cv.date), x: M + 1, y, pt: 9.5, bold: true, color: K.sub }); y += 7;
    (meta || []).forEach(([a, b]) => { out.push({ t: a + ': ' + b, x: M + 1, y, pt: 7.5, bold: false, color: '#5E5F5F' }); y += 3.8; });
    return out;
  };
  /** teks alternatif ringkas untuk pembaca layar */
  C.alt = function (ch, lang) {
    const t = Array.isArray(ch.title) ? ch.title[lang === 'en' ? 1 : 0] : ch.title;
    if (ch.items) return t + ': ' + ch.items.slice(0, 8).map(i => tr(i.label, lang) + ' ' + (i.txt || i.value)).join('; ');
    if (ch.kind === 'journey' && ch.model) return t + ': ' + ch.model.nodes.map((n, k) => (k + 1) + ' ' + n.t[lang === 'en' ? 1 : 0] + ' (' + n.reach + ' unit, ' + n.total + ' bukti)').join('; ') + '; ' + ch.model.outcomes.map(o => o.t[lang === 'en' ? 1 : 0] + ' ' + o.reach).join('; ');
    if (ch.steps) return t + ': ' + ch.steps.map(s => tr(s.label, lang) + ' ' + s.n).join('; ');
    return t;
  };
})();
