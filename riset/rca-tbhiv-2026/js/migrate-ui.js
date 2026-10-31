/* RCA TB-HIV 2026 · Admin › Impor data aplikasi lama (khusus Super Admin) */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const UI = RCA.migrateUI = {};
  const FORMNAME = { C1: 'C1 Profil kab/kota', C3: 'C3 Telaah catatan', C4: 'C4 Penilaian fasilitas', C5: 'C5 Verifikasi sentinel', C6: 'C6 Telaah kematian', C7: 'C7 Wawancara' };
  let state = null;   // { pkg, file, preview, done: {step: result}, log: [] }

  UI.render = function (box) {
    box.innerHTML = '';
    box.appendChild(h('div', { class: 'card stack', style: { marginTop: '6px' } },
      h('h2', null, 'Impor data dari aplikasi lama'),
      h('p', null, 'Pilih berkas Excel hasil ekspor server aplikasi lama (misalnya ', h('b', null, 'RCA_TB-HIV_Server_1.xlsx'), '). Berkas dibaca di perangkat ini; yang dikirim ke server hanya data yang sudah dipetakan ke formulir baru.'),
      h('ul', { class: 'small' },
        h('li', null, 'Undian C2 lama dibekukan: unit yang sudah ditelaah tetap sama (kode unit, pilihan acak/purposif).'),
        h('li', null, 'Isian yang sudah dikirim masuk berstatus ', h('b', null, 'Dikirim'), ' untuk diperiksa Koordinator. Draf yang belum dikirim masuk sebagai ', h('b', null, 'Draf'), '.'),
        h('li', null, 'Draf yang berbeda dari versi kiriman disimpan sebagai ', h('b', null, 'versi cadangan'), ' (menu Dashboard Progress › Konflik) untuk dipilih Koordinator.'),
        h('li', null, 'Isian tanpa padanan persis di formulir baru tetap disimpan dan tampil hanya-baca di unit (panel "Data dari aplikasi lama").'),
        h('li', null, 'Rekaman yang sudah ada di aplikasi baru tidak ditimpa, kecuali Anda memilih menimpa; versi impor disimpan sebagai versi cadangan.')),
      fileRow(box)));
    if (state && state.pkg) showPlan(box);
  };

  function fileRow(box) {
    const inp = h('input', { type: 'file', accept: '.xlsx,.xls', 'aria-label': 'Berkas ekspor aplikasi lama' });
    inp.addEventListener('change', async () => {
      const f = inp.files[0]; if (!f) return;
      if (!RCA.needXLSX()) return;
      const t = RCA.toast('Membaca dan memetakan berkas…', '', 60000);
      try {
        const wb = XLSX.read(await f.arrayBuffer(), { cellNF: true });
        if (!window.RCA_MIGRATE.isOldExport(wb)) throw new Error('Berkas ini bukan ekspor server aplikasi lama (lembar Unit_A, C2_A_TBHIV, atau Titipan tidak ditemukan).');
        const pkg = window.RCA_MIGRATE.convert(XLSX, wb, RCA.S, { fileName: f.name });
        state = { pkg, file: f.name, done: {}, log: [] };
        await loadPreview();
        UI.render(box);
      } catch (e) { RCA.toast(e.message, 'err', 8000); }
      finally { if (t && t.remove) t.remove(); }
    });
    return h('label', { class: 'f' }, h('span', { class: 'lbl' }, 'Berkas ekspor (.xlsx)'), inp);
  }

  async function loadPreview() {
    const p = state.pkg;
    state.preview = await RCA.api('migrate.preview', {
      records: p.records.map(r => ({ form: r.form, sub: r.sub, unit: r.unit })),
      frames: p.frames.map(f => ({ fac: f.fac, frame: f.frame })), calon: p.calon.map(c => c.kode_calon || c.kode_pasien),
      sessions: p.sessions.map(s => s.code), fac: p.fac.map(f => f.code) });
  }

  function kpi(label, val, sub) { return h('div', { class: 'kpi' }, h('b', null, val), h('span', null, label), sub ? h('small', { class: 'muted', style: { display: 'block' } }, sub) : null); }

  function showPlan(box) {
    const p = state.pkg, pv = state.preview || { records: {}, frames: {}, calon: {}, sessions: {}, fac: {} }, L = p.laporan;
    const main = p.records.filter(r => r.mode === 'main'), bak = p.records.filter(r => r.mode === 'backup');
    const exist = main.filter(r => pv.records[r.form + '|' + r.sub + '|' + r.unit]);
    const byForm = {}; p.records.forEach(r => { const k = r.form; const o = byForm[k] = byForm[k] || { kirim: 0, draf: 0, cad: 0 }; if (r.mode === 'backup') o.cad++; else if (r.status === 'Draf') o.draf++; else o.kirim++; });
    const frExist = p.frames.filter(f => (pv.frames[f.fac + '|' + f.frame] || {}).rows);
    const wrap = h('div', { class: 'stack', style: { marginTop: '16px' } });
    wrap.appendChild(h('h2', null, 'Rencana impor · ' + state.file));
    wrap.appendChild(h('div', { class: 'kpis' },
      kpi('Kerangka C2', p.frames.length, p.frames.reduce((a, f) => a + f.rows.length, 0) + ' baris'),
      kpi('Calon C6', p.calon.length), kpi('Sesi C7 baru', p.sessions.filter(s => !pv.sessions[s.code]).length),
      Object.keys(byForm).sort().map(f => kpi(FORMNAME[f] || f, byForm[f].kirim + byForm[f].draf, byForm[f].kirim + ' dikirim · ' + byForm[f].draf + ' draf' + (byForm[f].cad ? ' · ' + byForm[f].cad + ' cadangan' : ''))),
      kpi('Versi cadangan', bak.length, 'draf berbeda dari kiriman'), kpi('Sudah ada di aplikasi baru', exist.length)));
    const fac = p.fac.filter(f => pv.fac[f.code] && pv.fac[f.code].sentinel !== f.sentinel);
    if (fac.length) wrap.appendChild(h('div', { class: 'notice' }, 'Status sentinel akan disesuaikan: ', fac.map(f => f.code + ' → ' + (f.sentinel === 'Ya' ? 'sentinel' : 'bukan sentinel')).join(', ') + '.'));
    if (frExist.length) wrap.appendChild(h('div', { class: 'notice warn' }, 'Kerangka berikut sudah ada di aplikasi baru: ' + frExist.map(f => f.fac + ' ' + f.frame).join(', ') + '. Kerangka yang sudah diundi tidak diubah kecuali Anda mencentang "Ganti kerangka".'));
    if (exist.length) wrap.appendChild(h('div', { class: 'notice warn' }, exist.length + ' rekaman sudah ada di aplikasi baru (mis. ' + exist.slice(0, 4).map(r => r.sub + ' ' + r.unit).join(', ') + '). Tanpa centang "Timpa", versi impor disimpan sebagai versi cadangan.'));
    if (L.peringatan.length) wrap.appendChild(h('details', { class: 'relpanel', open: true }, h('summary', null, h('b', null, 'Perlu perhatian (' + L.peringatan.length + ')')), h('ul', { class: 'small' }, L.peringatan.map(x => h('li', null, x)))));
    if (L.catatan.length) wrap.appendChild(h('details', { class: 'relpanel' }, h('summary', null, h('b', null, 'Catatan (' + L.catatan.length + ')')), h('ul', { class: 'small' }, L.catatan.map(x => h('li', null, x)))));
    const tp = Object.entries(L.tanpaPadanan).sort((a, b) => b[1] - a[1]);
    wrap.appendChild(h('details', { class: 'relpanel' }, h('summary', null, h('b', null, 'Nilai perlu diperiksa (' + L.anomali.length + ') · isian tanpa padanan (' + tp.length + ' jenis)')),
      h('p', { class: 'small muted' }, 'Nilai ini tetap disimpan apa adanya dan juga tampil di panel "Data dari aplikasi lama" pada unit terkait. Unduh laporan untuk daftar lengkap.'),
      h('div', { class: 'table-wrap', style: { maxHeight: '320px' } }, h('table', { class: 't' }, h('thead', null, h('tr', null, ['Formulir', 'Unit', 'Isian', 'Nilai', 'Keterangan'].map(x => h('th', null, x)))),
        h('tbody', null, L.anomali.slice(0, 200).map(a => h('tr', null, h('td', null, a.formulir), h('td', null, a.unit), h('td', null, a.isian), h('td', null, a.nilai), h('td', null, a.keterangan))))))));
    const over = h('input', { type: 'checkbox' }), repl = h('input', { type: 'checkbox' });
    wrap.appendChild(h('div', { class: 'stack' },
      h('label', { class: 'row' }, over, h('span', null, 'Timpa rekaman yang sudah ada di aplikasi baru (versi yang tertimpa tetap ada di Riwayat)')),
      h('label', { class: 'row' }, repl, h('span', null, 'Ganti kerangka C2 yang sudah diundi di aplikasi baru'))));
    const prog = h('div', { class: 'stack' });
    const go = h('button', { class: 'btn primary', type: 'button' }, 'Mulai impor');
    go.addEventListener('click', async () => {
      if (!await RCA.confirm('Mulai impor', 'Impor ' + p.records.length + ' rekaman, ' + p.frames.length + ' kerangka, dan ' + p.calon.length + ' calon C6 ke aplikasi baru? Proses berjalan bertahap; jangan tutup halaman sampai selesai.', 'Impor')) return;
      go.disabled = true; await run(prog, over.checked, repl.checked); go.disabled = false; go.textContent = 'Lanjutkan impor yang belum selesai';
    });
    wrap.appendChild(h('div', { class: 'row' }, go, h('button', { class: 'btn', type: 'button', onclick: () => downloadReport() }, 'Unduh laporan migrasi (Excel)')));
    wrap.appendChild(prog);
    box.appendChild(wrap);
  }

  async function run(prog, overwrite, replace) {
    const p = state.pkg, D = state.done;
    const steps = [];
    steps.push(['fac', 'Status sentinel fasyankes', () => RCA.api('migrate.fac', { fac: p.fac })]);
    p.frames.forEach(f => steps.push(['frame|' + f.fac + '|' + f.frame, 'Kerangka ' + f.frame + ' ' + f.fac + ' (' + f.rows.length + ' baris)', () => RCA.api('migrate.frames', { fac: f.fac, frame: f.frame, rows: f.rows, undian: f.undian, replace })]));
    if (p.calon.length) steps.push(['calon', 'Calon kematian C6', () => RCA.api('migrate.calon', { rows: p.calon })]);
    if (p.sessions.length) steps.push(['sesi', 'Sesi C7', () => RCA.api('migrate.sessions', { sessions: p.sessions })]);
    const order = { C1: 1, C3: 2, C4: 3, C5: 4, C6: 5, C7: 6 };
    const recs = p.records.slice().sort((a, b) => (order[a.form] - order[b.form]) || (a.mode === 'backup') - (b.mode === 'backup'));
    for (let i = 0; i < recs.length; i += 6) {
      const part = recs.slice(i, i + 6);
      steps.push(['rec|' + i, 'Rekaman ' + (i + 1) + '–' + (i + part.length) + ' dari ' + recs.length + ' (' + [...new Set(part.map(r => r.sub))].join(', ') + ')', () => RCA.api('migrate.records', { records: part, overwrite })]);
    }
    prog.innerHTML = '';
    const bar = h('div', { class: 'stackbar' }, h('i', { style: { width: '0%', background: 'var(--primary)' } }));
    const status = h('p', { class: 'small' });
    prog.appendChild(bar); prog.appendChild(status);
    let n = 0;
    for (const [key, label, fn] of steps) {
      n++;
      bar.firstChild.style.width = Math.round(n / steps.length * 100) + '%';
      if (D[key]) continue;
      status.textContent = 'Langkah ' + n + ' dari ' + steps.length + ': ' + label + '…';
      try { D[key] = { label, res: await fn() }; }
      catch (e) {
        status.textContent = '';
        prog.appendChild(h('div', { class: 'notice err' }, 'Berhenti di langkah "' + label + '": ' + e.message + '. Tekan "Lanjutkan impor yang belum selesai" untuk mencoba lagi; langkah yang sudah berhasil tidak diulang.'));
        return;
      }
    }
    status.textContent = 'Impor selesai.';
    prog.appendChild(result());
    RCA.state.unitCache = {};
  }

  function result() {
    const D = state.done, p = state.pkg;
    const rec = Object.keys(D).filter(k => k.startsWith('rec|')).map(k => D[k].res);
    const sum = rec.reduce((a, r) => ({ ditulis: a.ditulis + r.ditulis, cadangan: a.cadangan + r.cadangan, konflik: a.konflik + r.konflik }), { ditulis: 0, cadangan: 0, konflik: 0 });
    const warn = [].concat(...rec.map(r => r.peringatan || []));
    const frames = Object.keys(D).filter(k => k.startsWith('frame|')).map(k => {
      const [, fac, fr] = k.split('|'), r = D[k].res, f = p.frames.find(x => x.fac === fac && x.frame === fr);
      const lama = f.rows.filter(x => Number(x.m_terpilih) && x.m_kode_unit).map(x => x.m_kode_unit).sort().join(',');
      const baru = (r.terpilih || []).slice().sort().join(',');
      return { fac, fr, r, cocok: !r.skipped && lama === baru, nlama: lama ? lama.split(',').length : 0 };
    });
    const bad = frames.filter(f => !f.r.skipped && !f.cocok);
    return h('div', { class: 'stack' },
      h('div', { class: 'notice ok' }, h('b', null, 'Selesai. '), sum.ditulis + ' rekaman ditulis, ' + sum.cadangan + ' versi cadangan dari draf, ' + sum.konflik + ' versi cadangan karena rekaman sudah ada.'),
      h('div', { class: bad.length ? 'notice err' : 'notice ok' }, bad.length ? 'Unit terpilih berbeda dari aplikasi lama pada: ' + bad.map(f => f.fac + ' ' + f.fr).join(', ') + '. Hubungi pengembang sebelum melanjutkan.'
        : 'Unit terpilih C2 sama persis dengan aplikasi lama (' + frames.reduce((a, f) => a + f.nlama, 0) + ' unit).' + (frames.some(f => f.r.beda_baru) ? ' Catatan: undian aplikasi baru akan memberi hasil berbeda pada ' + frames.filter(f => f.r.beda_baru).length + ' kerangka; hasil lama yang dipakai.' : '')),
      frames.filter(f => f.r.skipped).length ? h('div', { class: 'notice warn' }, frames.filter(f => f.r.skipped).map(f => f.r.skipped).join(' ')) : null,
      warn.length ? h('details', { class: 'relpanel', open: true }, h('summary', null, h('b', null, 'Peringatan dari server (' + warn.length + ')')), h('ul', { class: 'small' }, warn.map(x => h('li', null, x)))) : null,
      h('p', null, 'Langkah berikut: buka ', h('a', { href: '#/progress/C3' }, 'Dashboard Progress'), ' untuk memeriksa rekaman berstatus Dikirim dan versi cadangan, lalu tandai Valid.'));
  }

  function downloadReport() {
    if (!RCA.needXLSX() || !state) return;
    const p = state.pkg, L = p.laporan, wb = XLSX.utils.book_new();
    const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows.length ? rows : [{ keterangan: '(kosong)' }]), name);
    add('Ringkasan', [{ butir: 'Berkas', nilai: state.file }, { butir: 'Dibuat', nilai: p.dibuat }].concat(Object.entries(L.hitung).map(([k, v]) => ({ butir: k, nilai: v }))));
    add('Peringatan', L.peringatan.map(x => ({ peringatan: x })).concat(L.catatan.map(x => ({ catatan: x }))));
    add('Nilai perlu diperiksa', L.anomali);
    add('Tanpa padanan', Object.entries(L.tanpaPadanan).map(([k, v]) => ({ 'lembar › kolom': k, jumlah: v })));
    add('Rekaman', p.records.map(r => ({ formulir: r.form, sub: r.sub, unit: r.unit, status: r.status, jenis: r.mode === 'backup' ? 'versi cadangan' : 'utama', oleh: r.by, waktu: r.at, catatan: r.note || '', isian_tanpa_padanan: (r.data._lama || []).length })));
    add('Kerangka C2', [].concat(...p.frames.map(f => f.rows.filter(x => x.m_status).map(x => ({ fasyankes: f.fac, kerangka: f.frame, kode_lokal: x.C, kode_pasien: x.B, status_pemilihan: x.m_status, terpilih: x.m_terpilih, kode_unit: x.m_kode_unit || '' })))));
    add('Calon C6', p.calon);
    if (state.done && Object.keys(state.done).length) add('Hasil impor', Object.keys(state.done).map(k => ({ langkah: state.done[k].label, hasil: JSON.stringify(state.done[k].res).slice(0, 30000) })));
    XLSX.writeFile(wb, 'Laporan_migrasi_RCA_TBHIV_' + RCA.today() + '.xlsx');
  }

  /* panel di editor: data dari aplikasi lama */
  UI.legacyPanel = function (ed) {
    const d = ed.data || {}, imp = d._impor, lama = d._lama || [];
    if (!imp && !lama.length) return null;
    return h('details', { class: 'relpanel legacy' },
      h('summary', null, h('b', null, 'Data dari aplikasi lama'), lama.length ? h('span', { class: 'muted' }, ' · ' + lama.length + ' isian tanpa padanan langsung') : null),
      imp ? h('p', { class: 'small' }, (imp.sumber || 'Impor') + (imp.oleh ? ' · ' + imp.oleh : '') + (imp.waktu ? ' · ' + imp.waktu : '') + (imp.aplikasi ? ' · ' + imp.aplikasi : '')) : null,
      imp && imp.berbeda && imp.berbeda.length ? h('p', { class: 'small' }, 'Isian yang berbeda dari versi kiriman: ' + imp.berbeda.join(', ')) : null,
      lama.length ? h('div', { class: 'table-wrap no-cards', style: { maxHeight: '360px' } }, h('table', { class: 't' },
        h('thead', null, h('tr', null, ['Lembar lama', 'Baris', 'Kolom', 'Nilai'].map(x => h('th', null, x)))),
        h('tbody', null, lama.map(x => h('tr', null, h('td', null, x.lembar), h('td', null, String(x.baris || '')), h('td', null, x.label), h('td', { style: { whiteSpace: 'pre-wrap' } }, x.nilai)))))) : null,
      h('p', { class: 'small muted' }, 'Hanya-baca. Salin ke isian yang sesuai bila diperlukan; nilai di luar format (mis. tanggal "TT" atau "--/12/2025") perlu diperbaiki di isian formulir.'));
  };
})();
