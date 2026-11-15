/* RCA TB-HIV 2026 · Unduh Dataset Lengkap (ZIP) untuk analisis di luar aplikasi.
   Hanya Koordinator dan Super Admin (server juga membatasi export.form untuk kedua peran ini).
   Isi: CSV per formulir/sub-formulir dan per tabel berulang, kunci penghubung C1–C7, bukti alur pasien,
   kamus data, data mentah JSON, dan README. Kode pasien diganti id_pasien (hash satu arah); kolom identitas dibuang. */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const DS = RCA.dataset = {};

  /* ---------------- ZIP (tanpa pustaka; deflate bawaan peramban bila tersedia) */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u => { let c = ~0; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (~c) >>> 0; };
  async function deflate(u) {
    if (typeof CompressionStream === 'undefined') return null;
    try { return new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); } catch (e) { return null; }
  }
  DS.zip = async function (files) {
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    const d = new Date(), tm = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), dt = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    for (const f of files) {
      const name = enc.encode(f.name), raw = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(raw);
      let comp = await deflate(raw), method = 8; if (!comp || comp.length >= raw.length) { comp = raw; method = 0; }
      const L = new DataView(new ArrayBuffer(30));
      L.setUint32(0, 0x04034b50, true); L.setUint16(4, 20, true); L.setUint16(6, 0x0800, true); L.setUint16(8, method, true); L.setUint16(10, tm, true); L.setUint16(12, dt, true);
      L.setUint32(14, crc, true); L.setUint32(18, comp.length, true); L.setUint32(22, raw.length, true); L.setUint16(26, name.length, true);
      parts.push(new Uint8Array(L.buffer), name, comp);
      const C = new DataView(new ArrayBuffer(46));
      C.setUint32(0, 0x02014b50, true); C.setUint16(4, 20, true); C.setUint16(6, 20, true); C.setUint16(8, 0x0800, true); C.setUint16(10, method, true); C.setUint16(12, tm, true); C.setUint16(14, dt, true);
      C.setUint32(16, crc, true); C.setUint32(20, comp.length, true); C.setUint32(24, raw.length, true); C.setUint16(28, name.length, true); C.setUint32(42, off, true);
      central.push(new Uint8Array(C.buffer), name);
      off += 30 + name.length + comp.length;
    }
    const cs = central.reduce((a, b) => a + b.length, 0), E = new DataView(new ArrayBuffer(22));
    E.setUint32(0, 0x06054b50, true); E.setUint16(8, files.length, true); E.setUint16(10, files.length, true); E.setUint32(12, cs, true); E.setUint32(16, off, true);
    return new Blob(parts.concat(central, [new Uint8Array(E.buffer)]), { type: 'application/zip' });
  };

  /* ---------------- CSV */
  const cell = v => { if (v === null || v === undefined) return ''; if (typeof v === 'object') v = JSON.stringify(v); v = String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
  DS.csv = function (rows, cols) {
    if (!cols) { const s = new Set(); rows.forEach(r => Object.keys(r).forEach(k => s.add(k))); cols = [...s]; }
    if (!cols.length) cols = ['keterangan'];
    return '﻿' + [cols.map(cell).join(',')].concat(rows.map(r => cols.map(c => cell(r[c])).join(','))).join('\r\n') + '\r\n';
  };

  /* ---------------- perlindungan identitas */
  const hc = {};
  async function pid(fac, kode) {
    kode = String(kode === undefined || kode === null ? '' : kode).trim(); fac = String(fac || '');
    if (!kode) return '';
    if (fac && kode.indexOf(fac + '-') === 0) kode = kode.slice(fac.length + 1);
    const k = fac + '|' + kode; if (hc[k]) return hc[k];
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('rca-tbhiv-2026|' + k));
    return (hc[k] = 'P' + [...new Uint8Array(b)].slice(0, 6).map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase());
  }
  DS.pid = pid;
  // butir isian yang memuat kode pasien (pre = patient_code di skema) → nilai diganti id_pasien
  const PCODE = new Set(); Object.keys(S.forms).forEach(fm => (S.forms[fm].sub || []).forEach(sub => sub.sections.forEach(s => (s.fields || []).concat(s.cols || []).forEach(f => { if (f.pre === 'patient_code') PCODE.add(f.k); }))));
  const DROP = /^(nama|nama_.*|nik|no_?hp|telepon|telp|alamat|email|owner|updated_by|kode_lokal|c_C)$/i;
  /** salin data rekaman: kode_pasien → id_pasien, kolom identitas dibuang, gambar base64 diganti tanda */
  async function scrub(v, fac, own) {
    if (Array.isArray(v)) { const o = []; for (const x of v) o.push(await scrub(x, fac, own)); return o; }
    if (v && typeof v === 'object') {
      const o = {};
      for (const k of Object.keys(v)) {
        if (DROP.test(k) || k === 'b64') continue;
        if (k === 'kode_pasien' || k === 'c_B') { o.id_pasien = await pid(fac, v[k]); continue; }
        if (PCODE.has(k)) { o[k] = await pid(fac, v[k]); continue; }
        o[k] = await scrub(v[k], fac, own);
      }
      return o;
    }
    if (own && typeof v === 'string' && v.trim() === own) return await pid(fac, own);
    if (typeof v === 'string' && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim())) return '';
    if (typeof v === 'string' && /^data:[a-z]+\/[\w.+-]+;base64,/.test(v)) return '[berkas gambar tidak disertakan]';
    return v;
  }

  /* ---------------- kamus data */
  function codebook() {
    const out = [], o = x => (x || []).join(' | ');
    Object.keys(S.forms).forEach(fm => (S.forms[fm].sub || []).forEach(sub => sub.sections.forEach(s => {
      const file = fm + '/' + sub.id + '.csv';
      if (s.type === 'fields') s.fields.forEach(f => { out.push({ berkas: file, kolom: f.k, label: (f.l || '') + (f.pre === 'patient_code' ? ' (berisi id_pasien hash, bukan kode asli)' : ''), tipe: f.t || '', pilihan: o(f.o), bagian: s.title || s.id }); if (f.st) out.push({ berkas: file, kolom: f.k + '__st', label: 'Status bukti ' + f.k + ' (Y/T/TC/TBL/BD …)', tipe: 'status', pilihan: '', bagian: s.title || s.id }, { berkas: file, kolom: f.k + '__src', label: 'Sumber bukti ' + f.k, tipe: 'text', pilihan: '', bagian: s.title || s.id }); });
      if (s.type === 'matrix') s.rows.forEach(r => s.cols.forEach(c => { if (c.t !== 'ro' && c.t !== 'auto') out.push({ berkas: file, kolom: s.k + '.' + r.k + '.' + c.k, label: (r.l || r.k) + ' · ' + (c.l || c.k), tipe: c.t || '', pilihan: o(c.o), bagian: s.title || s.id }); }));
      if (s.type === 'table') (s.cols || []).forEach(c => out.push({ berkas: fm + '/' + sub.id + '__' + s.k + '.csv', kolom: c.k === 'kode_pasien' ? 'id_pasien' : c.k, label: c.k === 'kode_pasien' ? 'ID pasien (hash dari kode pasien; penghubung antarformulir)' : (c.l || c.k), tipe: c.t || '', pilihan: o(c.o), bagian: s.title || s.id }));
      if (s.type === 'photos') out.push({ berkas: 'foto.csv', kolom: '(semua)', label: 'Metadata foto pendukung ' + sub.id, tipe: 'tabel', pilihan: '', bagian: s.title || s.id });
    })));
    return out;
  }
  const KEYDOC = [
    ['formulir', 'Kode formulir (C1, C3, C4, C5, C6, C7)'], ['subformulir', 'Kode sub-formulir (mis. C3A, C5_6, C6B)'], ['kode_unit', 'Kode rekaman/unit: kab/kota (C1), unit telaah (C3), fasyankes (C4, C5), kasus (C6), sesi (C7)'],
    ['kode_fasyankes', 'Kode fasyankes'], ['kode_kabkota', 'Kode kab/kota'], ['kode_provinsi', 'Kode provinsi'], ['status', 'Status rekaman (Draf, Dikirim, Dikembalikan, Valid)'],
    ['id_pasien', 'ID pasien anonim (SHA-256 dari kode fasyankes + kode pasien, 12 karakter). Sama di C2, C3, C5, C6 untuk pasien yang sama di fasyankes yang sama.'],
    ['kode_unit_c3', 'Kode unit C3 (penghubung C2 terpilih, C3, baris C5, kasus C6)'], ['kode_kasus_c6', 'Kode kasus telaah kematian C6'], ['kerangka', 'Kerangka sampel C3 (A, B, CP3)'], ['kelompok_sampel', 'Status pilih C2 (acak, sensus, purposif, cadangan …)'],
    ['baris', 'Nomor baris di tabel berulang']];

  /* ---------------- unduh */
  DS.download = async function (btn) {
    if (!RCA.can.review()) return RCA.toast('Dataset lengkap hanya untuk Koordinator dan Super Admin.', 'err');
    if (!RCA.state.online) return RCA.toast('Perlu koneksi internet untuk mengambil seluruh data dari server.', 'err');
    const label = btn ? btn.textContent : '', step = t => { if (btn) btn.textContent = t; };
    if (btn) btn.disabled = true;
    try {
      const FORMS = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'], E = {};
      for (const f of FORMS) { step('Mengambil ' + f + '…'); E[f] = await RCA.api('export.form', { form: f }); }
      step('Mengambil C2…');
      const C2 = await RCA.api('export.form', { form: 'C2' });
      let AD = null; try { AD = await RCA.api('analysis.data', { sertakanDikirim: true }); } catch (e) { }
      const calon = (AD && AD.C2 && AD.C2.calon) || C2.Calon_C6 || [];
      step('Menyusun dataset…');
      const files = [], DB = RCA.dash, add = (name, rows, cols) => files.push({ name, data: DS.csv(rows, cols) });
      // ---- C2: terpilih dan peta unit → pasien
      const sel = [];
      for (const s of (C2.Terpilih || [])) { const o = await scrub(s, s.fac); const p = o.petunjuk || {}; delete o.petunjuk; Object.assign(o, { petunjuk_tgl: p.tgl || '', petunjuk_jk: p.jk || '', petunjuk_umur: p.umur || '' }); sel.push(o); }
      const selBy = {}; sel.forEach(s => { selBy[s.kode_unit] = s; });
      const ownCode = {}; (C2.Terpilih || []).forEach(s => { if (s.kode_pasien) ownCode[s.kode_unit] = String(s.kode_pasien).trim(); });
      const cal = []; for (const c of calon) cal.push(await scrub(c, c.fasyankes));
      const c6ByUnitC3 = {}, calBy = {}; cal.forEach(c => { if (c.kode_kasus) calBy[c.kode_kasus] = c; if (c.kode_unit_c3 && c.kode_kasus) (c6ByUnitC3[c.kode_unit_c3] = c6ByUnitC3[c.kode_unit_c3] || []).push(c.kode_kasus); });
      const C2out = { Terpilih: sel, Calon_C6: cal, Undian: await scrub(C2.Undian || [], ''), Sesi_C7: await scrub(C2.Sesi_C7 || [], '') };
      const ker = []; for (const k of (C2.Kerangka || [])) ker.push(await scrub(k, k.fac)); C2out.Kerangka = ker;
      Object.keys(C2out).forEach(k => add('C2/C2_' + k + '.csv', C2out[k].map(r => { const o = Object.assign({}, r); Object.keys(o).forEach(x => { if (o[x] && typeof o[x] === 'object') o[x] = JSON.stringify(o[x]); }); return o; })));
      // ---- rekaman C1, C3–C7
      const V = {}, raw = {}, fotos = [];
      for (const fm of FORMS) {
        V[fm] = {}; raw[fm] = {};
        for (const sub of Object.keys(E[fm] || {})) {
          const sch = RCA.forms.subSchema(sub); if (!sch) continue;
          const recs = [];
          for (const r of E[fm][sub]) { const facOf = fm === 'C5' || fm === 'C4' ? r.unit : r.fac; recs.push(Object.assign({}, r, { owner: undefined, updated_by: undefined, data: await scrub(r.data || {}, facOf, ownCode[r.unit]) })); }
          V[fm][sub] = recs; raw[fm][sub] = recs;
          const keyOf = r => {
            const k = { formulir: fm, subformulir: sub, kode_unit: r.unit, kode_fasyankes: fm === 'C4' || fm === 'C5' ? r.unit : r.fac, kode_kabkota: fm === 'C1' ? r.unit : r.kk, kode_provinsi: r.prov, status: r.status };
            if (fm === 'C3') { const s = selBy[r.unit] || {}; Object.assign(k, { kode_unit_c3: r.unit, kerangka: ({ C3A: 'A', C3B: 'B', C3CP3: 'CP3' })[sub], id_pasien: s.id_pasien || '', kelompok_sampel: s.pilihan || '', kode_kasus_c6: (c6ByUnitC3[r.unit] || []).join('; ') }); }
            if (fm === 'C6') { const c = calBy[r.unit] || {}; Object.assign(k, { kode_kasus_c6: r.unit, kode_unit_c3: c.kode_unit_c3 || '', id_pasien: c.id_pasien || '' }); }
            if (fm === 'C7') Object.assign(k, { kode_sesi: r.unit, jenis_sesi: /-W/.test(r.unit) ? 'Wawancara' : /-F/.test(r.unit) ? 'Diskusi kelompok' : '' });
            return k;
          };
          const meta = r => ({ versi: r.version, pengisi: r.owner_name, diubah_oleh: r.updated_name, diubah: r.updated_at, dikirim: r.submitted_at, divalidasi: r.validated_at });
          const rows = recs.map(r => Object.assign(keyOf(r), meta(r), DB.flat(r.data), DB.autoCols(sub, r.data)));
          const ord = DB.orderedKeys(sub, rows.map(r => r));
          const head = Object.keys(Object.assign(keyOf(recs[0] || {}), meta(recs[0] || {})));
          const cols = [...new Set(head.concat(ord))].filter(k => head.includes(k) || rows.some(r => r[k] !== undefined && r[k] !== ''));
          add(fm + '/' + sub + '.csv', rows, cols.length ? cols : undefined);
          // tabel berulang
          sch.sections.filter(s => s.type === 'table').forEach(s => {
            const tr = [];
            recs.forEach(r => {
              const arr = r.data[s.k] || []; let calc = null;
              if (s.big && RCA.c5) { const id = ((V.C5 && V.C5.C5ID) || (E.C5.C5ID || [])).find(x => x.unit === r.unit); try { calc = RCA.c5.rows(arr, RCA.c5.ctx(sch.ind, (id && id.data) || {})); } catch (e) { } }
              arr.forEach((x, i) => {
                const o = Object.assign(keyOf(r), { baris: i + 1 }, DB.flat(x));
                if (fm === 'C5' && x.kode_unit_c3) o.kode_unit_c3 = x.kode_unit_c3;
                if (calc && calc[i]) Object.assign(o, { auto_D_sis: calc[i].D_sis, auto_D_src: calc[i].D_src, auto_N_sis: calc[i].N_sis, auto_N_src: calc[i].N_src, auto_status: calc[i].status, auto_terpilih: calc[i].terpilih, auto_lengkap: calc[i].lengkap });
                tr.push(o);
              });
            });
            if (tr.length) add(fm + '/' + sub + '__' + s.k + '.csv', tr);
          });
          recs.forEach(r => (r.data.foto || []).forEach((p, i) => fotos.push({ formulir: fm, subformulir: sub, kode_unit: r.unit, kode_fasyankes: fm === 'C4' || fm === 'C5' ? r.unit : r.fac, status: r.status, urutan: i + 1,
            id_foto: p.id || p._id || '', keterangan: p.caption || '', diunggah: p.ts || '', oleh: p.by || '', sumber: p.src || '', diambil: p.taken_at || '', lat_dibulatkan: p.geo ? p.geo.lat : '', lng_dibulatkan: p.geo ? p.geo.lng : '' })));
        }
      }
      // koordinat foto presisi (hanya Koordinator/Super Admin)
      if (fotos.length && RCA.photo && RCA.photo.preciseGeo) { try { const g = await RCA.photo.preciseGeo(fotos.map(f => f.id_foto).filter(Boolean)); fotos.forEach(f => { const x = g[f.id_foto]; f.lat_presisi = x ? x.lat : ''; f.lng_presisi = x ? x.lng : ''; f.akurasi_m = x && x.acc ? Math.round(x.acc) : ''; }); } catch (e) { } }
      add('foto.csv', fotos);
      // ---- cerita unit dan alur pasien
      step('Menautkan C1–C7…');
      let stories = [], c6s = [], JM = null;
      try { stories = RCA.story.build(V); c6s = RCA.story.buildC6(V, cal); if (RCA.journey) JM = RCA.journey.build(V, stories, c6s); } catch (e) { console.warn('dataset alur', e); }
      const stBy = {}; stories.forEach(s => { stBy[s.unit] = s; });
      const recBy = {}; ['C3A', 'C3B', 'C3CP3'].forEach(sub => (V.C3[sub] || []).forEach(r => { recBy[r.unit] = r; }));
      const c1 = new Set((V.C1.C1 || []).map(r => r.unit)), c4 = new Set((V.C4.C4 || []).map(r => r.unit));
      const c5rows = {}, c5fac = new Set(); ['C5_5', 'C5_6', 'C5_41a'].forEach(sub => (V.C5[sub] || []).forEach(r => { c5fac.add(r.unit); (r.data.cocok || []).forEach(x => { if (x.kode_unit_c3) (c5rows[x.kode_unit_c3] = c5rows[x.kode_unit_c3] || []).push(sub + ':' + (x.kode_baris || '')); }); }));
      const sesi = C2.Sesi_C7 || [], c7rec = new Set((V.C7.C7S || []).map(r => r.unit));
      const byPid = {}; sel.forEach(s => { if (s.id_pasien) (byPid[s.id_pasien] = byPid[s.id_pasien] || []).push(s.kode_unit); });
      const link = sel.map(s => {
        const r = recBy[s.kode_unit], st = stBy[s.kode_unit], fac = RCA.reg.fac(s.fac), kk = s.kk || fac.kk || '', prov = kk ? RCA.reg.kk(kk).prov : '';
        const ses = sesi.filter(x => x.kk ? x.kk === kk : x.prov === prov);
        return { id_pasien: s.id_pasien || '', kode_unit_c3: s.kode_unit, kerangka: s.frame, kelompok_sampel: s.pilihan, kode_fasyankes: s.fac, kode_kabkota: kk, kode_provinsi: prov,
          telaah_c2: s.telaah || '', status_c3: r ? r.status : 'Belum diisi', unit_c1: c1.has(kk) ? kk : '', unit_c4: c4.has(s.fac) ? s.fac : '', sentinel_c5: c5fac.has(s.fac) ? s.fac : '', baris_c5_terkait: (c5rows[s.kode_unit] || []).join('; '),
          kode_kasus_c6: (c6ByUnitC3[s.kode_unit] || []).join('; '), sesi_c7_wilayah: ses.map(x => x.code + (c7rec.has(x.code) ? '' : ' (belum ada rekaman)')).join('; '),
          unit_lain_pasien_sama: (byPid[s.id_pasien] || []).filter(u => u !== s.kode_unit).join('; '),
          status_akhir: r && RCA.journey && s.frame !== 'CP3' ? ({ berhasil: 'Berhasil', lanjut: 'Masih berobat/pindah', putus: 'Putus berobat/hilang kontak', meninggal: 'Meninggal' })[RCA.journey.outcomeOf(s.frame, r.data)] || '' : '',
          titik_putus_cp: st ? [...new Set((st.gaps || []).map(g => g.cp))].join('; ') : '', jumlah_titik_putus: st ? (st.gaps || []).length : '', faktor: st ? [...new Set((st.faktor || []).map(x => x && x.f ? x.f : x))].join('; ') : '' };
      });
      cal.filter(c => c.kode_kasus && !c.kode_unit_c3).forEach(c => link.push({ id_pasien: c.id_pasien || '', kode_unit_c3: '', kerangka: '', kelompok_sampel: '', kode_fasyankes: c.fasyankes || '', kode_kabkota: c.kk || '', kode_provinsi: c.kk ? RCA.reg.kk(c.kk).prov : '', telaah_c2: '', status_c3: 'Tidak ada unit C3', kode_kasus_c6: c.kode_kasus, status_akhir: 'Meninggal (kasus C6)' }));
      add('00_kunci_penghubung.csv', link);
      const ev = [];
      if (JM) JM.nodes.map((n, k) => [n, (k + 1) + '. ']).concat(JM.outcomes.map(n => [n, 'Akhir: ']), [[JM.cross, 'Lintas: ']]).forEach(([n, pre]) => RCA.journey.FORMS.forEach(fm => n.ev[fm].forEach(x => ev.push({
        tahap: pre + n.t[0], cp: n.cps.join('; '), formulir: fm, subformulir: x.sub, kode_unit: x.unit, kode_fasyankes: x.fac || '', bukti: x.label, rincian: x.detail || '', kaitan_otomatis: x.auto ? 'Ya' : '' }))));
      add('01_bukti_alur_pasien.csv', ev);
      if (JM) add('02_ringkasan_alur_pasien.csv', JM.nodes.concat(JM.outcomes, [JM.cross]).map(n => Object.assign({ tahap: n.t[0], cp: n.cps.join('; '), unit_c3_mencapai: n.reach.length, titik_putus_c3: n.gaps || 0 }, RCA.journey.FORMS.reduce((o, f) => (o['bukti_' + f] = n.ev[f].length, o), {}), { total_bukti: n.total })));
      add('kamus_data.csv', KEYDOC.map(([k, l]) => ({ berkas: '(semua)', kolom: k, label: l, tipe: 'kunci', pilihan: '', bagian: 'Kunci penghubung' })).concat(codebook()));
      files.push({ name: 'data_mentah.json', data: JSON.stringify({ dibuat: new Date().toISOString(), oleh_peran: RCA.state.user.role, catatan: 'Rekaman lengkap (semua status) dengan kode pasien diganti id_pasien.', C2: C2out, rekaman: raw }, null, 1) });
      const nRec = FORMS.reduce((a, f) => a + Object.values(V[f]).reduce((b, x) => b + x.length, 0), 0);
      files.unshift({ name: 'README.txt', data: readme(nRec, files.map(f => f.name)) });
      step('Mengemas ZIP…');
      const blob = await DS.zip(files);
      RCA.download('RCA_TBHIV_dataset_lengkap_' + RCA.today() + '.zip', blob);
      RCA.toast('Dataset lengkap diunduh (' + files.length + ' berkas, ' + Math.round(blob.size / 1024) + ' KB)', 'ok');
      return { files, blob };
    } catch (e) { RCA.toast('Gagal menyusun dataset: ' + e.message, 'err', 8000); throw e; }
    finally { if (btn) { btn.disabled = false; btn.textContent = label; } }
  };

  function readme(nRec, names) {
    return ['DATASET LENGKAP RCA TB-HIV 2026', '================================', '',
      'Dibuat: ' + new Date().toLocaleString('id-ID') + ' oleh ' + RCA.state.user.name + ' (' + RCA.state.user.role + ')', 'Jumlah rekaman formulir: ' + nRec + ' (semua status: Draf, Dikirim, Dikembalikan, Valid)', '',
      'PERLINDUNGAN DATA', '- Data berkode. Nama, NIK, alamat, nomor telepon, dan email tidak disertakan.', '- Kode pasien dari register diganti id_pasien (hash satu arah SHA-256 dari kode fasyankes + kode pasien). Pasien yang sama di fasyankes yang sama memiliki id_pasien yang sama di C2, C3, C5, dan C6.',
      '- Berkas foto tidak disertakan; foto.csv hanya berisi metadata (termasuk koordinat presisi, khusus Koordinator/Super Admin).', '- Simpan dengan akses terbatas sesuai Protokol V13 Bagian 17. Jangan dibagikan di luar tim evaluasi.', '',
      'CARA MEMAKAI', '- Untuk analisis utama, saring kolom status = "Valid" (sama dengan Dashboard Analisis dan Laporan).', '- CSV memakai pemisah koma dan UTF-8 (dengan BOM). Excel: Data > From Text/CSV; R: readr::read_csv(); Python: pandas.read_csv(); Stata: import delimited, encoding(utf8).',
      '- Kolom matriks ditulis sebagai bagian.baris.kolom (mis. matriks_cp.CP6.klasifikasi). Kolom __st = status bukti, __src = sumber bukti. Kolom auto_* dihitung aplikasi.',
      '- Arti setiap kolom ada di kamus_data.csv.', '',
      'KUNCI PENGHUBUNG ANTARFORMULIR', '- 00_kunci_penghubung.csv: satu baris per unit C3 terpilih (dan kasus C6 tanpa unit C3), memuat id_pasien, kode_unit_c3, kerangka, fasyankes, kab/kota, provinsi, status C3, unit C1 (kab/kota), unit C4 (fasyankes), sentinel dan baris C5 terkait, kode kasus C6, sesi C7 di wilayah yang sama, unit lain milik pasien yang sama, status akhir, CP titik putus, dan faktor.',
      '- C1 ↔ lainnya: kode_kabkota.   C4 ↔ C3/C5/C6: kode_fasyankes.   C3 ↔ C5: kode_unit_c3 (C5/*__cocok.csv).   C3 ↔ C6: kode_unit_c3 / kode_kasus_c6 / id_pasien.   C7 ↔ lainnya: kode_kabkota atau kode_provinsi (sesi tidak terkait pasien).',
      '- 01_bukti_alur_pasien.csv: setiap bukti yang dikaitkan dengan tahap alur pasien (formulir, unit, CP); 02_ringkasan_alur_pasien.csv: jumlah per tahap (sama dengan Dashboard Analisis > Alur pasien).', '',
      'CONTOH PENGGABUNGAN (R)', '  k  <- read_csv("00_kunci_penghubung.csv")', '  c3 <- read_csv("C3/C3A.csv") |> filter(status == "Valid")', '  c6 <- read_csv("C6/C6B.csv")', '  d  <- k |> left_join(c3, by = c("kode_unit_c3" = "kode_unit")) |> left_join(c6, by = c("kode_kasus_c6" = "kode_unit"))', '',
      'CONTOH PENGGABUNGAN (Python)', '  k = pd.read_csv("00_kunci_penghubung.csv"); c4 = pd.read_csv("C4/C4.csv")', '  d = k.merge(c4, left_on="unit_c4", right_on="kode_unit", how="left", suffixes=("", "_c4"))', '',
      'DAFTAR BERKAS', ...names.map(n => '- ' + n)].join('\r\n') + '\r\n';
  }

  /** tombol untuk halaman (hanya Koordinator/Super Admin) */
  DS.button = function (cls) {
    if (!RCA.can.review()) return null;
    const b = h('button', { type: 'button', class: 'btn ' + (cls || ''), title: 'Semua formulir C1–C7 dan C2 dalam CSV + kunci penghubung, kamus data, dan JSON (ZIP)', onclick: () => DS.download(b).catch(() => {}) }, 'Download Dataset Lengkap');
    return b;
  };
})();
