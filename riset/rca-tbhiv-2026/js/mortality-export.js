/* RCA TB-HIV 2026 · Dashboard Kematian: unduh PDF ringkasan kasus, unduh Excel (rangkuman + satu lembar per kasus
   dengan blok penilaian yang dapat diisi), dan unggah kembali penilaian dari Excel. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, M = RCA.mort;
  const X = RCA.mortx = {};
  const esc = v => (v === undefined || v === null) ? '' : Array.isArray(v) ? v.join(', ') : String(v);
  const has = v => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length);
  const facName = c => c ? (RCA.reg.fac(c).name ? RCA.reg.facName(c) : c) : '';
  const fdp = p => p ? (p.approx ? '±' : '') + p.d.toLocaleDateString('id-ID', p.approx ? { month: 'short', year: 'numeric' } : { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  const stamp = () => RCA.today();
  const asc = t => String(t == null ? '' : t).replace(/[–—]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/→/g, '->').replace(/±/g, '+/-').replace(/…/g, '...').replace(/·/g, '-').replace(/[^\x09\x0A\x0D\x20-\xFF]/g, '');

  /** ambil berkas beberapa kasus (berurutan; dengan kemajuan) */
  X.bulk = async function (cases, kind) {
    if (!cases.length) return RCA.toast('Tidak ada kasus untuk diunduh.', 'info');
    if (cases.length > 60 && !await RCA.confirm('Unduh ' + cases.length + ' kasus', 'Menyusun berkas untuk ' + cases.length + ' kasus dapat memakan waktu beberapa menit. Lanjutkan?', 'Lanjutkan')) return;
    const L = []; let k = 0;
    const t = h('div', { class: 'toast info', role: 'status' }, 'Menyiapkan berkas…'); (RCA.$('#toasts') || document.body).appendChild(t);
    try {
      for (const c of cases) { k++; t.textContent = 'Mengambil berkas kasus ' + k + '/' + cases.length + '…'; L.push(await RCA.api('mort.case', { key: c.key })); }
      t.textContent = 'Menyusun ' + (kind === 'pdf' ? 'PDF' : 'Excel') + '…';
      await (kind === 'pdf' ? X.pdf(L) : X.excel(L));
    } catch (e) { RCA.toast('Gagal: ' + e.message, 'err', 8000); } finally { t.remove(); }
  };

  /* ================================================================ PDF */
  X.pdf = async function (list) {
    if (!window.jspdf || !window.jspdf.jsPDF) return RCA.toast('Pustaka PDF belum termuat. Coba lagi sebentar.', 'err');
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' }), W = 210, Hh = 297, Mg = 14, teal = [14, 90, 84], ink = [30, 40, 44];
    let y = 0;
    const need = n => { if (y + n > Hh - 16) { doc.addPage(); y = 18; } };
    const H2 = t => { need(12); y += 3; doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5); doc.setTextColor(...teal); doc.text(asc(t), Mg, y); y += 5.5; doc.setTextColor(...ink); };
    const P = (t, sz, st) => { doc.setFont('helvetica', st || 'normal'); doc.setFontSize(sz || 9); const L = doc.splitTextToSize(asc(t), W - 2 * Mg); L.forEach(l => { need(4.6); doc.text(l, Mg, y); y += (sz || 9) * 0.45; }); y += 1.2; };
    const T = (head, body, opts) => { if (!body.length) return; doc.autoTable(Object.assign({ startY: y, head: head ? [head.map(asc)] : undefined, body: body.map(r => r.map(asc)), margin: { left: Mg, right: Mg, top: 16, bottom: 16 }, theme: 'grid',
      styles: { fontSize: 7.8, cellPadding: 1.3, overflow: 'linebreak', textColor: ink, lineColor: [205, 222, 220] }, headStyles: { fillColor: teal, textColor: 255 }, alternateRowStyles: { fillColor: [242, 248, 247] } }, opts || {})); y = doc.lastAutoTable.finalY + 3; };
    list.forEach((D, idx) => {
      if (idx) doc.addPage();
      const c = D.case, E = M.events(D);
      doc.setFillColor(...teal); doc.rect(0, 0, W, 26, 'F'); doc.setFillColor(201, 216, 49); doc.rect(0, 26, W, 1.4, 'F');
      doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.text('BERKAS KASUS KEMATIAN · PANEL TELAAH KEMATIAN RCA TB-HIV 2026'.replace(/·/g, '-'), Mg, 9);
      doc.setFontSize(16); doc.text(asc('Kasus ' + c.key), Mg, 18); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(asc([facName(c.fac), c.kk_name, c.umur ? c.umur + ' th' : '', c.jk, 'Sumber: ' + c.sumber.join(', ')].filter(Boolean).join(' - ')), Mg, 23.5);
      y = 33; doc.setTextColor(...ink);
      H2('Ringkasan pasien'); T(null, M.profileRows(D), { columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } } });
      H2('Kematian dan sebabnya'); T(null, M.causeRows(D), { columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } } });
      T(['Waktu antartahap', 'Hari'], M.intervals(E).map(([l, d]) => [l, d === null ? '-' : String(d)]), { columnStyles: { 1: { cellWidth: 25, halign: 'right' } } });
      H2('Perjalanan pasien: kronologi terpadu (' + E.length + ' kejadian)');
      T(['#', 'Tanggal', 'Fasilitas', 'Fase', 'Kejadian', 'Sumber'], E.map(e => [String(e.n), fdp(e.p), facName(e.fac) || '-', e.ph, e.label, e.src]), { columnStyles: { 0: { cellWidth: 7 }, 1: { cellWidth: 20 }, 2: { cellWidth: 30 }, 3: { cellWidth: 10 }, 5: { cellWidth: 32 } } });
      const B = (D.rec.C6B || {}).data || {}, Cc = (D.rec.C6C || {}).data || {};
      if (D.rec.C6B || D.rec.C6C) {
        H2('Penilaian penelaah (C6B dan C6C)');
        T(['Fase', 'Skor 1', 'Alasan penelaah 1', 'Skor 2', 'Alasan penelaah 2'], M.PHASE.map((p, i) => { const k = 'T' + (i + 1), a = (B.B1 || {})[k] || {}, b = (Cc.C1 || {})[k] || {}; return [p, a.skor || '-', esc(a.alasan), b.skor || '-', esc(b.alasan)]; }), { columnStyles: { 0: { cellWidth: 32 }, 1: { cellWidth: 12, halign: 'center' }, 3: { cellWidth: 12, halign: 'center' } } });
        T(['Keterlambatan', 'Penelaah 1', 'Penelaah 2'], [['d1 Mencari pelayanan', 'd1'], ['d2 Mencapai layanan yang tepat', 'd2'], ['d3 Tata laksana di fasyankes', 'd3']].map(([l, k]) => { const a = (B.B2 || {})[k] || {}, b = (Cc.C2 || {})[k] || {}; return [l, [a.nilai, a.bukti].filter(Boolean).join(': '), [b.nilai, b.bukti].filter(Boolean).join(': ')]; }));
        const b4 = (B.B4 || []).filter(r => has(r.masalah)); if (b4.length) T(['Masalah', 'Fase', 'Faktor penyumbang', 'Kategori', 'Klasifikasi', 'Peluang perbaikan'], b4.map(r => [r.masalah, r.fase, r.penyumbang, r.faktor, r.klas, r.peluang].map(esc)));
        if (B.panel_q || Cc.panel_q) P('Pertanyaan untuk panel: ' + [B.panel_q, Cc.panel_q].filter(Boolean).join(' / '), 9, 'italic');
      }
      H2('Faktor penyumbang dari semua formulir (bahan diskusi)');
      const G = M.factorData(D); T(['Kelompok', 'Catatan', 'Sumber'], [].concat(...Object.keys(G).map(g => G[g].map(x => [g, x.t, x.src]))), { columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 30 } } });
      if ((D.photos || []).length) { H2('Foto dan dokumen pendukung'); T(['#', 'Keterangan', 'Formulir', 'Unit'], D.photos.map((p, i) => [String(i + 1), p.caption || 'Dokumen', p.form + ' ' + p.sub, p.unit])); P('Foto dapat dilihat di aplikasi: Dashboard Kematian > Kasus ' + c.key + ' > Foto dan dokumen pendukung.', 8, 'italic'); }
      H2('Lembar penilaian panelis');
      const mine = (D.me && D.me.data) || {};
      T(null, M.FIELDS.map(f => [f.l, esc(mine[f.k]) || ' \n \n ']), { columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } }, styles: { fontSize: 8.4, cellPadding: 2, minCellHeight: 9 } });
      const fk = (mine.faktor || []).filter(r => r.uraian || r.kelompok);
      T(['Kelompok', 'Fase', 'Masalah / faktor penyumbang', 'Kategori', 'Klasifikasi', 'Peluang perbaikan'], fk.length ? fk.map(r => [r.kelompok, r.fase, r.uraian, r.faktor, r.klas, r.peluang].map(esc)) : [1, 2, 3, 4].map(() => ['', '', '', '', '', '']), { styles: { fontSize: 7.8, minCellHeight: fk.length ? 0 : 10 } });
      if (D.konsensus && M.isFilled(D.konsensus) && D.konsensus_meta && D.konsensus_meta.final_at) { H2('Kesimpulan konsensus panel'); T(null, M.FIELDS.concat([{ k: 'implikasi', l: 'Implikasi program' }]).map(f => [f.l, esc(D.konsensus[f.k])]).filter(r => r[1]), { columnStyles: { 0: { cellWidth: 55, fontStyle: 'bold' } } }); }
    });
    const n = doc.getNumberOfPages();
    for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(120, 130, 134); doc.text('Rahasia - untuk panel telaah kematian. Data berkode tanpa identitas pasien.', Mg, Hh - 8); doc.text('Halaman ' + i + ' dari ' + n, W - Mg, Hh - 8, { align: 'right' }); }
    doc.save(list.length === 1 ? 'Kasus_Kematian_' + list[0].case.key.replace(/[^\w-]+/g, '_') + '_' + stamp() + '.pdf' : 'Kasus_Kematian_' + list.length + '_kasus_' + stamp() + '.pdf');
  };

  /* ================================================================ Excel (ExcelJS dimuat saat dibutuhkan) */
  let exP = null;
  const needExcel = () => exP || (exP = new Promise((res, rej) => { if (window.ExcelJS) return res(window.ExcelJS); const sc = document.createElement('script'); sc.src = 'vendor/exceljs.min.js'; sc.onload = () => window.ExcelJS ? res(window.ExcelJS) : rej(new Error('ExcelJS')); sc.onerror = () => { exP = null; rej(new Error('Pustaka Excel tidak dapat dimuat (periksa koneksi).')); }; document.head.appendChild(sc); }));
  const TEAL = 'FF0E5A54', LIME = 'FFC9D831', INPUT = 'FFFFF6D6', GREYF = 'FFF2F6F5';
  const sheetName = (key, used) => { let b = String(key).replace(/[\\\/\?\*\[\]:]/g, '-').slice(0, 28) || 'Kasus', n = b, i = 2; while (used.has(n.toLowerCase())) n = b.slice(0, 26) + '~' + i++; used.add(n.toLowerCase()); return n; };
  X.excel = async function (list) {
    const ExcelJS = await needExcel();
    const wb = new ExcelJS.Workbook(); wb.creator = 'RCA TB-HIV 2026'; wb.created = new Date();
    const used = new Set(['rangkuman', 'petunjuk', 'pilihan', '_meta']);
    const sumWs = wb.addWorksheet('Rangkuman', { views: [{ state: 'frozen', ySplit: 3 }] });
    const help = wb.addWorksheet('Petunjuk'), pil = wb.addWorksheet('Pilihan'), meta = wb.addWorksheet('_meta', { state: 'veryHidden' });
    // daftar pilihan
    const LISTS = {}; let col = 1;
    M.FIELDS.filter(f => f.o).map(f => [f.k, f.o]).concat(M.FCOLS().filter(c => c.o).map(c => ['f_' + c.k, c.o])).forEach(([k, o]) => {
      pil.getCell(1, col).value = k; o.forEach((v, i) => { pil.getCell(i + 2, col).value = v; });
      const L = pil.getColumn(col).letter; LISTS[k] = 'Pilihan!$' + L + '$2:$' + L + '$' + (o.length + 1); pil.getColumn(col).width = 30; col++; });
    meta.addRow(['versi', 'rca-mort-1', new Date().toISOString(), RCA.state.user.email]);
    // rangkuman
    sumWs.mergeCells('A1:P1'); sumWs.getCell('A1').value = 'Rangkuman kasus kematian · panel telaah kematian RCA TB-HIV 2026 · diunduh ' + new Date().toLocaleString('id-ID');
    sumWs.getCell('A1').font = { bold: true, size: 13, color: { argb: 'FFFFFFFF' } }; sumWs.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } };
    sumWs.getCell('A2').value = 'Data berkode tanpa identitas pasien. Klik kode kasus untuk membuka lembar kasusnya. Isi penilaian di lembar masing-masing kasus (sel kuning).'; sumWs.getCell('A2').font = { italic: true, size: 9 };
    const SH = ['Kode kasus', 'Fasyankes', 'Kab/kota', 'Provinsi', 'Umur', 'JK', 'Tanggal meninggal', 'Sumber', 'Sebab kematian tercatat', 'Skor T1–T5 penelaah 1', 'Skor T1–T5 penelaah 2', 'Keterlambatan (d1/d2/d3, penelaah 1)', 'Penilaian berbeda', 'Status panel', 'Panelis mengirim', 'Penilaian saya'];
    const hr = sumWs.getRow(3); SH.forEach((t, i) => { const c = hr.getCell(i + 1); c.value = t; c.font = { bold: true, color: { argb: 'FFFFFFFF' } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }; c.alignment = { wrapText: true, vertical: 'middle' }; }); hr.height = 30;
    [14, 24, 16, 10, 7, 6, 14, 12, 44, 18, 18, 18, 10, 14, 10, 12].forEach((w, i) => { sumWs.getColumn(i + 1).width = w; });
    list.forEach(D => {
      const c = D.case, B = (D.rec.C6B || {}).data || {}, sn = sheetName(c.key, used), ws = wb.addWorksheet(sn, { views: [{ showGridLines: false }] }), addr = {};
      const sc = t => ['T1', 'T2', 'T3', 'T4', 'T5'].map(k => (t || {})[k] || '-').join(' ');
      const r = sumWs.addRow([c.key, facName(c.fac), c.kk_name, c.prov, c.umur, c.jk, c.tgl_mati, c.sumber.join(', '), c.sebab, sc(c.skor1), sc(c.skor2), ['d1', 'd2', 'd3'].map(k => ((B.B2 || {})[k] || {}).nilai || '-').join('/'), c.beda ? 'Ya' : '', c.panel.status, c.panel.dikirim + '/' + (c.panel.nama || c.panel.panelis || []).length, (D.me || {}).status || '']);
      r.getCell(1).value = { text: c.key, hyperlink: "#'" + sn + "'!A1" }; r.getCell(1).font = { color: { argb: 'FF0B6FB8' }, underline: true }; r.alignment = { wrapText: true, vertical: 'top' };
      if (c.beda) r.getCell(13).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE2DD' } };
      // lembar kasus
      ws.getColumn(1).width = 36; ws.getColumn(2).width = 62; ws.getColumn(3).width = 18; ws.getColumn(4).width = 22; ws.getColumn(5).width = 22; ws.getColumn(6).width = 26; ws.getColumn(7).width = 22;
      const title = (t, row) => { ws.mergeCells(row, 1, row, 7); const x = ws.getCell(row, 1); x.value = t; x.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }; x.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TEAL } }; ws.getRow(row).height = 20; };
      const sub = (t) => { const rr = ws.addRow([t]); rr.getCell(1).font = { bold: true, color: { argb: TEAL } }; rr.getCell(1).border = { bottom: { style: 'medium', color: { argb: LIME } } }; return rr; };
      const kvRow = (a, b) => { const rr = ws.addRow([a, b]); rr.getCell(1).font = { bold: true }; rr.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREYF } }; rr.getCell(2).alignment = { wrapText: true, vertical: 'top' }; ws.mergeCells(rr.number, 2, rr.number, 7); return rr; };
      title('Kasus ' + c.key + ' · ' + [facName(c.fac), c.kk_name].filter(Boolean).join(' · '), 1);
      ws.addRow(['Sumber: ' + c.sumber.join(', ') + ' · Status panel: ' + c.panel.status + ' · Kembali ke Rangkuman']).getCell(1).value = { text: 'Sumber: ' + c.sumber.join(', ') + ' · Status panel: ' + c.panel.status + ' · ‹ kembali ke Rangkuman', hyperlink: "#'Rangkuman'!A1" };
      ws.mergeCells(2, 1, 2, 7);
      // blok penilaian (dapat diisi)
      ws.addRow([]); const bh = ws.addRow(['PENILAIAN PANELIS (isi sel kuning)']); bh.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF6B4A00' } }; ws.mergeCells(bh.number, 1, bh.number, 7);
      const mine = (D.me && D.me.data) || {};
      M.FIELDS.forEach(f => { const rr = ws.addRow([f.l, esc(mine[f.k])]); ws.mergeCells(rr.number, 2, rr.number, 7); const cc = rr.getCell(2);
        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT } }; cc.border = { top: { style: 'thin', color: { argb: 'FFE0C060' } }, bottom: { style: 'thin', color: { argb: 'FFE0C060' } }, left: { style: 'thin', color: { argb: 'FFE0C060' } }, right: { style: 'thin', color: { argb: 'FFE0C060' } } };
        cc.alignment = { wrapText: true, vertical: 'top' }; cc.protection = { locked: false }; rr.getCell(1).font = { bold: true }; rr.height = f.t === 'textarea' ? 48 : 18;
        if (f.o) cc.dataValidation = { type: 'list', allowBlank: true, formulae: [LISTS[f.k]], showErrorMessage: true, errorTitle: 'Pilihan', error: 'Pilih dari daftar' };
        addr[f.k] = 'B' + rr.number; });
      const FC = M.FCOLS(); const fh = ws.addRow(FC.map(x => x.l)); fh.eachCell(cl => { cl.font = { bold: true, color: { argb: 'FFFFFFFF' } }; cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8A6D1E' } }; cl.alignment = { wrapText: true }; });
      const fk = (mine.faktor || []).filter(x => x.uraian || x.kelompok); addr.faktor = [];
      for (let i = 0; i < Math.max(6, fk.length + 2); i++) { const v = fk[i] || {}; const rr = ws.addRow(FC.map(x => esc(v[x.k]))); rr.height = 32; addr.faktor.push(rr.number);
        FC.forEach((x, j) => { const cc = rr.getCell(j + 1); cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: INPUT } }; cc.alignment = { wrapText: true, vertical: 'top' }; cc.protection = { locked: false }; cc.border = { bottom: { style: 'hair', color: { argb: 'FFE0C060' } } };
          if (x.o) cc.dataValidation = { type: 'list', allowBlank: true, formulae: [LISTS['f_' + x.k]] }; }); }
      // isi berkas (hanya dibaca)
      ws.addRow([]); sub('1. Ringkasan pasien'); M.profileRows(D).forEach(([a, b]) => kvRow(a, b));
      sub('Kematian dan sebabnya'); M.causeRows(D).forEach(([a, b]) => kvRow(a, b));
      const E = M.events(D); M.intervals(E).forEach(([l, d]) => kvRow(l, d === null ? '–' : d + ' hari'));
      ws.addRow([]); sub('2. Perjalanan pasien: kronologi terpadu (' + E.length + ' kejadian)');
      const th = ws.addRow(['Tanggal', 'Kejadian', 'Fasilitas', 'Fase', 'Sumber', '#']); th.font = { bold: true }; th.eachCell(cl => { cl.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: GREYF } }; });
      E.forEach(e => { const rr = ws.addRow([fdp(e.p), e.label, facName(e.fac) || '–', e.ph, e.src, e.n]); rr.alignment = { wrapText: true, vertical: 'top' }; if (e.kind === 'mati') rr.font = { bold: true, color: { argb: 'FFB0453A' } }; });
      const Cc = (D.rec.C6C || {}).data || {};
      if (D.rec.C6B || D.rec.C6C) { ws.addRow([]); sub('3. Penilaian penelaah (C6B dan C6C)');
        const t3 = ws.addRow(['Fase', 'Alasan penelaah 1', 'Skor 1', 'Skor 2', 'Alasan penelaah 2']); t3.font = { bold: true };
        M.PHASE.forEach((p, i) => { const k = 'T' + (i + 1), a = (B.B1 || {})[k] || {}, b = (Cc.C1 || {})[k] || {}; const rr = ws.addRow([p, esc(a.alasan), a.skor || '–', b.skor || '–', esc(b.alasan)]); rr.alignment = { wrapText: true, vertical: 'top' };
          if (a.skor && b.skor && ((a.skor === 'BD') !== (b.skor === 'BD') || Math.abs(+a.skor - +b.skor) >= 2)) [3, 4].forEach(j => { rr.getCell(j).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE2DD' } }; }); });
        [['d1', 'Keterlambatan 1 · mencari pelayanan'], ['d2', 'Keterlambatan 2 · mencapai layanan yang tepat'], ['d3', 'Keterlambatan 3 · tata laksana di fasyankes']].forEach(([k, l]) => { const a = (B.B2 || {})[k] || {}, b = (Cc.C2 || {})[k] || {}; kvRow(l, ['Penelaah 1: ' + [a.nilai, a.bukti].filter(Boolean).join(' · '), D.rec.C6C ? 'Penelaah 2: ' + [b.nilai, b.bukti].filter(Boolean).join(' · ') : ''].filter(Boolean).join('\n')); });
        (B.B4 || []).filter(r => has(r.masalah)).forEach((r, i) => kvRow('Masalah ' + (i + 1) + (r.fase ? ' (' + r.fase.slice(0, 2) + ')' : ''), [r.masalah, r.penyumbang && 'Penyumbang: ' + r.penyumbang, r.faktor && 'Kategori: ' + r.faktor, r.klas && 'Klasifikasi: ' + r.klas, r.peluang && 'Peluang: ' + r.peluang].filter(Boolean).join('\n')));
        if (B.panel_q || Cc.panel_q) kvRow('Pertanyaan untuk panel', [B.panel_q, Cc.panel_q].filter(Boolean).join('\n')); }
      ws.addRow([]); sub('4. Faktor penyumbang dari semua formulir (bahan diskusi)'); const G = M.factorData(D); Object.keys(G).forEach(g => G[g].forEach(x => kvRow(g, x.t + ' · ' + x.src)));
      if ((D.photos || []).length) { ws.addRow([]); sub('5. Foto dan dokumen pendukung (lihat di aplikasi)'); D.photos.forEach((p, i) => kvRow('Dokumen ' + (i + 1), (p.caption || 'Dokumen') + ' · ' + p.form + ' ' + p.unit)); }
      ws.eachRow(rr => { if (!rr.height) rr.alignment = Object.assign({ wrapText: true, vertical: 'top' }, rr.alignment || {}); });
      ws.protect('', { selectLockedCells: true, selectUnlockedCells: true, formatColumns: true, formatRows: true });
      meta.addRow(['kasus', c.key, sn, JSON.stringify(addr)]);
    });
    sumWs.autoFilter = { from: 'A3', to: 'P' + (list.length + 3) };
    // petunjuk
    help.getColumn(1).width = 110;
    ['Cara memakai berkas ini', '', '1. Lembar "Rangkuman" berisi satu baris per kasus. Klik kode kasus untuk membuka lembarnya.', '2. Setiap lembar kasus berisi blok PENILAIAN PANELIS (sel kuning) di bagian atas, lalu berkas kasus: ringkasan, kronologi, penilaian penelaah, faktor penyumbang, dan daftar dokumen.',
      '3. Isi hanya sel kuning. Untuk butir pilihan, gunakan daftar (dropdown). Lembar dikunci agar baris tidak bergeser; sel kuning tetap dapat diisi.', '4. Setelah selesai, buka aplikasi > Dashboard Kematian > "Unggah penilaian dari Excel" dan pilih berkas ini. Penilaian disimpan atas nama akun yang mengunggah, hanya untuk kasus yang ditugaskan kepadanya.',
      '5. Data kasus di berkas ini tidak dapat mengubah data di aplikasi; yang dibaca hanya blok penilaian.', '', 'Kerahasiaan: berkas berisi data berkode tanpa identitas pasien. Simpan dan bagikan hanya kepada anggota panel.'].forEach((t, i) => { const c = help.getCell(i + 1, 1); c.value = t; c.alignment = { wrapText: true }; if (!i) c.font = { bold: true, size: 13, color: { argb: TEAL } }; });
    const buf = await wb.xlsx.writeBuffer();
    RCA.download(list.length === 1 ? 'Kasus_Kematian_' + list[0].case.key.replace(/[^\w-]+/g, '_') + '_' + stamp() + '.xlsx' : 'Kasus_Kematian_' + list.length + '_kasus_' + stamp() + '.xlsx', new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  };

  /** baca blok penilaian dari berkas Excel hasil unduhan */
  X.readExcel = async function (file) {
    const ExcelJS = await needExcel(); const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await file.arrayBuffer());
    const meta = wb.getWorksheet('_meta'); if (!meta) throw new Error('Berkas ini bukan unduhan Excel Dashboard Kematian (lembar _meta tidak ada).');
    const val = c => { const v = c.value; if (v === null || v === undefined) return ''; if (typeof v === 'object') { if (v.richText) return v.richText.map(x => x.text).join(''); if (v.text) return String(v.text); if (v.result !== undefined) return String(v.result); if (v instanceof Date) return v.toISOString().slice(0, 10); } return String(v).trim(); };
    const out = [], FC = M.FCOLS();
    meta.eachRow(r => { if (val(r.getCell(1)) !== 'kasus') return; const key = val(r.getCell(2)), ws = wb.getWorksheet(val(r.getCell(3))); let addr; try { addr = JSON.parse(val(r.getCell(4))); } catch (e) { return; } if (!ws) return;
      const d = {}; M.FIELDS.forEach(f => { if (addr[f.k]) { const v = val(ws.getCell(addr[f.k])); if (v) d[f.k] = f.o ? (f.o.find(o => o.toLowerCase() === v.toLowerCase()) || v) : v; } });
      d.faktor = (addr.faktor || []).map(rn => { const o = {}; FC.forEach((c, j) => { const v = val(ws.getRow(rn).getCell(j + 1)); if (v) o[c.k] = c.o ? (c.o.find(x => x.toLowerCase() === v.toLowerCase()) || v) : v; }); return o; }).filter(o => Object.keys(o).length);
      out.push({ key, data: d, filled: M.isFilled(d) }); });
    return out;
  };
  X.importDialog = function () {
    const inp = h('input', { type: 'file', accept: '.xlsx' }), prev = h('div', { class: 'stack' }), sub = h('input', { type: 'checkbox' });
    const go = h('button', { type: 'button', class: 'btn primary', disabled: true }, 'Simpan penilaian');
    let rows = [];
    inp.onchange = async () => { prev.innerHTML = ''; go.disabled = true; const f = inp.files[0]; if (!f) return; prev.appendChild(h('p', { class: 'muted' }, 'Membaca berkas…'));
      try { rows = (await X.readExcel(f)).filter(x => x.filled); prev.innerHTML = '';
        if (!rows.length) { prev.appendChild(h('div', { class: 'notice warn' }, 'Tidak ada blok penilaian yang terisi di berkas ini.')); return; }
        prev.appendChild(h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Kasus', 'Sebab paling mungkin', 'Dapat dicegah', 'Faktor'].map(x => h('th', null, x)))),
          h('tbody', null, rows.map(r => h('tr', null, h('td', null, r.key), h('td', null, (r.data.sebab || '–').slice(0, 80)), h('td', null, r.data.dicegah || '–'), h('td', { class: 'n' }, String((r.data.faktor || []).length))))))));
        go.disabled = false; } catch (e) { prev.innerHTML = ''; prev.appendChild(h('div', { class: 'notice err' }, e.message)); } };
    go.onclick = async () => {
      go.disabled = true; const res = []; const cur = {};
      for (const r of rows) {
        try { const D = await RCA.api('mort.case', { key: r.key }); cur[r.key] = D.me;
          if (D.me && M.isFilled(D.me.data) && JSON.stringify(D.me.data) !== JSON.stringify(r.data) && !await RCA.confirm('Ganti penilaian ' + r.key + '?', 'Anda sudah memiliki penilaian di aplikasi untuk kasus ' + r.key + ' (' + D.me.status + '). Ganti dengan isi dari Excel?', 'Ganti')) { res.push(r.key + ': dilewati'); continue; }
          await RCA.api('mort.assess.save', { key: r.key, data: r.data, submit: sub.checked, sumber: 'excel' }); res.push(r.key + ': ' + (sub.checked ? 'terkirim' : 'tersimpan sebagai draf')); }
        catch (e) { res.push(r.key + ': gagal (' + e.message + ')'); }
      }
      prev.appendChild(h('div', { class: 'notice ok' }, h('ul', null, res.map(t => h('li', null, t)))));
      RCA.toast('Unggah penilaian selesai', 'ok');
    };
    RCA.modal('Unggah penilaian dari Excel', h('div', { class: 'stack' }, h('p', null, 'Pilih berkas Excel hasil "Unduh Excel" yang blok penilaiannya (sel kuning) sudah Anda isi. Penilaian disimpan atas nama Anda untuk kasus yang ditugaskan kepada Anda; data kasus di berkas tidak dibaca.'), inp,
      h('label', { class: 'row', style: { gap: '8px' } }, sub, 'Langsung kirim (bukan draf)'), prev, h('div', { class: 'row' }, go)), [{ label: 'Tutup', value: null }], { wide: true }).then(() => { if (location.hash.startsWith('#/kematian')) window.dispatchEvent(new HashChangeEvent('hashchange')); });
  };
})();
