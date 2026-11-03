/* RCA TB-HIV 2026 · tur aplikasi dan tips per halaman
   - Tur sambutan saat pertama kali masuk (sesuai peran).
   - Tips otomatis saat pertama kali membuka setiap formulir (daftar unit dan isian, per sub-formulir) dan setiap dashboard.
   - Setiap langkah menyorot bagian layar; tombol Sebelumnya / Lanjut / Lewati; centang "Jangan tampilkan lagi" mematikan semua tips otomatis.
   - Tombol 💡 di bilah atas menampilkan ulang tips halaman yang sedang dibuka kapan saja; Tampilan dan akun › Tur dan tips untuk mengatur ulang.
   - Status tersimpan per akun di server (berlaku di semua perangkat) dan di perangkat (cadangan saat offline). */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h;
  const T = RCA.tour = {};
  const KEY = () => 'rca.tour.' + ((RCA.state.user || {}).email || 'anon');
  let st = { off: false, seen: {} };
  const automationOff = () => { try { return navigator.webdriver && localStorage.getItem('rca.tour.force') !== '1'; } catch (e) { return false; } };

  /* ---------------- status */
  T.load = function (server) {
    let local = null; try { local = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch (e) { }
    const s = server && (server.seen || server.off !== undefined) ? server : null;
    st = { off: !!((s && s.off) || (local && local.off && !s)), seen: Object.assign({}, (local || {}).seen || {}, (s || {}).seen || {}) };
    if (s && s.off === false && local && local.off) st.off = false;
  };
  let saveT = null;
  function save() {
    try { localStorage.setItem(KEY(), JSON.stringify(st)); } catch (e) { }
    clearTimeout(saveT);
    saveT = setTimeout(() => { if (RCA.state.token && RCA.state.online) RCA.api('tour.save', { tour: st }).catch(() => {}); }, 800);
  }
  T.isOff = () => st.off;
  T.setOff = v => { st.off = !!v; save(); };
  T.reset = () => { st = { off: false, seen: {} }; save(); };
  const seen = id => !!st.seen[id];
  const markSeen = id => { st.seen[id] = new Date().toISOString().slice(0, 10); save(); };

  /* ---------------- isi tur */
  const role = () => (RCA.state.user || {}).role || '';
  const coord = () => ['Koordinator', 'SuperAdmin'].includes(role());
  const FORMINFO = {
    C1: ['C1 Profil awal dan pendalaman', 'Diisi sebelum kunjungan, satu unit per kab/kota: indikator program, masalah, dugaan penyebab awal, dan fokus pendalaman. Dugaan di sini akan diuji di C4 dan C7.'],
    C3: ['C3 Telaah catatan pelayanan', 'Satu unit = satu pasien sampel (Unit A episode TB-HIV, Unit B ARV/TPT, Unit CP3 penetapan status HIV). Hasil undian C2 menentukan daftar unitnya.'],
    C4: ['C4 Penilaian fasilitas dan 14 CP', 'Satu unit per fasyankes: layanan, alur, dokumen dan stok, observasi, wawancara, lalu matriks 14 CP yang merangkum bukti C3.'],
    C5: ['C5 Verifikasi data sentinel', 'Untuk fasyankes sentinel: identitas dan periode, lalu lembar pencocokan data sistem vs sumber untuk indikator TB/HIV-5, TB/HIV-6, dan TB/HIV-4.1a.'],
    C6: ['C6 Telaah kematian', 'Kasus kematian terpilih: Bagian A (kronologi), penilaian B dan C oleh dua penelaah secara tersamar, lalu Panel oleh koordinator.'],
    C7: ['C7 Wawancara dan diskusi', 'Sesi wawancara/diskusi per sasaran: daftar sesi, lembar catatan, peserta (kode), keterangan, dan tema temuan.']
  };
  const SUBTIP = {
    C1: ['Profil kab/kota', 'Isi indikator dan masalah dari data rutin. Tulis dugaan penyebab sebagai hal yang akan diuji (bukan kesimpulan), lengkap dengan CP terkait dan bukti yang perlu dicari. Templat Excel C1 bisa diunduh/diunggah dari daftar unit.'],
    C3A: ['Unit A · episode TB-HIV', 'Ikuti urutan bagian U → A → T → Z. Untuk setiap tanggal/isian pilih Status bukti (St: Y tercatat, TL tidak dilakukan, TC tidak ditemukan, TBL tidak berlaku, BD belum dapat dinilai) dan kode sumber (RM1, TB1, SITB…). Selisih hari dan pemicu dihitung otomatis; bila pemicu muncul, isi pendalaman P dan P22 mekanisme yang ditemukan.'],
    C3B: ['Unit B · ARV dan TPT', 'Telusuri riwayat ARV dan TPT pasien: kelayakan, penawaran, mulai, dan penyelesaian TPT. Isi St dan kode sumber pada setiap tanggal; kosong tanpa St dianggap belum dinilai.'],
    C3CP3: ['Unit CP3 · penetapan status HIV', 'Untuk pasien TB: apakah status HIV ditawarkan, dites, dan hasilnya tercatat. Bila tidak dites, tulis alasan yang tercatat (R_M) dan catatan penelaah (R_R).'],
    C4: ['Penilaian fasilitas', 'Kerjakan bagian A–D saat kunjungan. Di matriks 14 CP, tekan "Isi n/N dari C3" untuk menarik hasil telaah, lalu tetapkan klasifikasi dan faktor penyumbang (F1–F7). Klasifikasi dan faktor ini dipakai Dashboard Analisis dan Mapping sebagai bukti akar masalah.'],
    C5ID: ['Identitas sentinel', 'Pastikan periode triwulan dan metode per indikator benar sebelum mengisi lembar pencocokan; perhitungan D/N dan FV memakai parameter ini.'],
    C5_5: ['Pencocokan TB/HIV-5', 'Daftar baris berasal dari kerangka C2. Ketuk baris untuk mengisi data sistem vs sumber; tambah baris "telusur register" untuk pasien yang ada di sumber tetapi tidak di sistem. Status dan D/N dihitung otomatis.'],
    C5_6: ['Pencocokan TB/HIV-6', 'Ketuk baris untuk membandingkan data sistem dengan sumber. Jenis ketidaksesuaian dan penjelasan petugas menjadi bukti "sistem informasi" di dashboard.'],
    C5_41a: ['Pencocokan TB/HIV-4.1a', 'Perhatikan jendela mulai TPT pada identitas C5. Ketuk baris untuk mengisi; tambah baris telusur register bila perlu.'],
    C6A: ['Bagian A · kronologi', 'Susun kronologi dari rekam medis dengan tanggal kunci (diagnosis, OAT, ARV, rujukan, kematian). Catat informasi yang tidak tersedia di A5 beserta dampaknya.'],
    C6B: ['Penilaian penelaah 1 (tersamar)', 'Beri skor mutu T1–T5 (1–5 atau BD) dengan alasan dan bukti untuk setiap skor (wajib). Penilaian penelaah lain tidak terlihat sampai panel.'],
    C6C: ['Penilaian penelaah 2 (tersamar)', 'Nilai secara mandiri: skor T1–T5 beserta alasan wajib, lalu pernyataan dan peluang perbaikan.'],
    C6P: ['Panel koordinator', 'Bandingkan dua penilaian, sepakati masalah klinis/pelayanan, faktor penyumbang, peluang perbaikan, dan klasifikasi akhir.'],
    C7S: ['Sesi wawancara/diskusi', 'Peserta hanya dicatat dengan kode. Tuliskan tema temuan dengan CP terkait dan kutipan singkat tanpa nama; tema ini dipakai sebagai bukti di Dashboard Mapping.'],
    C7K: ['Cakupan C7', 'Rekap cakupan sesi per provinsi untuk memastikan semua sasaran sudah diwawancarai.']
  };
  const DASH = {
    progress: () => [
      { title: 'Dashboard Progress', body: 'Pantau kemajuan pengisian per formulir: jumlah unit per status, kemajuan per kelompok, unit yang sedang dikerjakan, dan antrean pemeriksaan koordinator.' },
      { sel: '.page-head + .tabs, .tabs', title: 'Pilih formulir', body: 'Pindah antar-formulir C1, C3–C7.' },
      { sel: '.filters', title: 'Saring', body: 'Saring menurut provinsi, kab/kota, fasyankes, sub-formulir, atau status (termasuk "Tugas saya").' },
      { sel: '.kpis', title: 'Angka ringkas', body: 'Jumlah unit Belum, Draf, Dikirim, Dikembalikan, Valid, dan yang sedang dikerjakan.' },
      coord() ? { sel: '.tiles', title: 'Antrean pemeriksaan', body: 'Unit berstatus Dikirim menunggu Anda: buka, periksa, lalu Kembalikan dengan catatan atau Tandai Valid. Hanya data Valid yang masuk analisis resmi.' } : null],
    analysis: () => [
      { title: 'Dashboard Analisis', body: 'Untuk setiap formulir: 1 apa yang terjadi dan 2 mengapa terjadi, sampai ke cerita tiap unit. Data yang dipakai adalah data Valid.' },
      { sel: '.filters', title: 'Saring wilayah', body: 'Pilih provinsi atau fasyankes. Pengisi dan koordinator dapat menyertakan isian Dikirim sebagai pratinjau.' },
      { sel: '.anl ~ .tabs, .tabs', title: 'Pilih formulir', body: 'Tab C2–C7, Lintas formulir, Bandingkan wilayah (2–4 kab/kota), dan Analisis tambahan.' },
      { sel: '.hbars.pickable, table.heat, .anl', title: 'Klik grafik', body: 'Ketuk batang atau sel: panel kanan menampilkan unit terkait, ceritanya, data mentah, dan foto pendukung untuk verifikasi.' },
      { sel: '.tabs button:nth-last-child(2)', title: 'Bandingkan wilayah', body: 'Bandingkan 2–4 kab/kota berdampingan dengan warna tetap per wilayah dan ringkasan perbedaan otomatis.' },
      { sel: '.page-head .btn', title: 'Cetak', body: 'Cetak tampilan analisis yang sedang dibuka.' }],
    mapping: () => [
      { title: 'Dashboard Mapping', body: 'Peta dan diagram cerita yang merangkai C1–C7: apa yang terjadi, mengapa, dan akar masalahnya, menurut wilayah, layanan, dan individu.' },
      { sel: '.mapwrap', title: 'Peta', body: 'Warna kab/kota menurut indikator pilihan. Klik kab/kota untuk memfokuskan; perbesar peta untuk melihat fasyankes; ikon 📷 = lokasi foto.' },
      { sel: '.mapctl select', title: 'Warna peta', body: '% unit dengan titik putus, kasus C6, data C5, akar masalah dominan, atau capaian program.' },
      coord() ? { sel: '.maplayers select', title: 'Lokasi fasyankes', body: 'Koordinator: pilih fasyankes lalu klik peta untuk menetapkan lokasinya. Titik tepat hanya terlihat koordinator.' } : null,
      { sel: '.mstory', title: 'Cerita wilayah', body: 'Ringkasan apa yang terjadi, mengapa, dan akar masalah dominan beserta status triangulasinya. Tautan biru menampilkan buktinya.' },
      { sel: '.mdiag', title: 'Empat diagram', body: 'Alur kaskade, tulang ikan, perjalanan pasien, dan jejaring bukti antar-form. Klik simpul, alur, tulang, atau peristiwa.' },
      { sel: '.mdetail', title: 'Rincian bukti', body: 'Bukti dari bagian yang diklik tampil di sini: cerita unit, kutipan, data mentah, foto, dan tautan ke formulir.' },
      { sel: '.mapctl .btn', title: 'Bandingkan wilayah', body: 'Aktifkan untuk membandingkan 2–4 kab/kota; klik kab/kota di peta untuk menambah atau melepasnya.' }],
    report: () => [
      { title: 'Dashboard Laporan', body: 'Rangkuman siap cetak dari data Valid: profil sampel, temuan per formulir, dan lampiran.' },
      { sel: '.rep-toc', title: 'Daftar isi', body: 'Lompat ke bagian laporan.' },
      { sel: '.page-head .row, .page-head .btn', title: 'Unduh', body: 'Unduh laporan (PDF/Excel) atau cetak. Ekspor data mentah hanya untuk koordinator.' }],
    c2: () => [
      { title: 'C2 Daftar sampel dan kode bukti', body: 'Sebelum kunjungan, koordinator menyiapkan kerangka sampel per fasyankes dan menjalankan undian. Hasilnya menjadi daftar unit C3, calon kasus C6, dan baris C5.' },
      { sel: 'select[aria-label=Fasyankes]', title: 'Pilih fasyankes', body: 'Semua langkah C2 dikerjakan per fasyankes.' },
      { sel: '.tabs', title: 'Langkah C2', body: 'Kerangka, undian, calon C6, daftar sentinel C5, dan sesi C7.' }],
    admin: () => [
      { title: 'Admin', body: 'Setujui pendaftaran akun dan tetapkan peran, atur fasyankes sentinel, lihat log aktivitas, dan impor data aplikasi lama.' },
      { sel: '.tabs', title: 'Bagian admin', body: 'Akun dan persetujuan, fasyankes dan sentinel, log aktivitas, impor data lama.' }]
  };
  function welcome() {
    const pembaca = role() === 'Pembaca';
    return [
      { title: 'Selamat datang di RCA TB-HIV 2026', body: 'Tur singkat ini (±1 menit) mengenalkan bagian utama aplikasi. Anda dapat melewatinya kapan saja, atau mencentang "Jangan tampilkan lagi" di bawah.' },
      { sel: ['#sidenav:not([hidden])', '#menuBtn'], title: 'Menu', body: pembaca ? 'Buka Dashboard Analisis, Mapping, dan Laporan dari menu ini.' : 'Formulir sebelum kunjungan (C1, C2), saat kunjungan (C3–C7), dan dashboard. Di HP, menu dibuka dengan tombol ☰.' },
      pembaca ? null : { sel: '#syncPill', title: 'Status sinkron', body: 'Isian selalu tersimpan di perangkat lalu dikirim ke server. Bila offline, pita kuning muncul; jangan hapus data peramban sampai tersinkron.' },
      { sel: '#notifBtn', title: 'Notifikasi', body: 'Lonceng berkedip bila ada pesan baru: tugas dari koordinator, serah terima, unit dikembalikan, atau divalidasi.' },
      pembaca ? null : { sel: ['#taskBox .card', '.grid'], title: 'Beranda', body: 'Kartu tiap formulir menampilkan kemajuan. Tugas untuk Anda dan unit yang dikembalikan tampil paling atas.' },
      { sel: '#tourBtn', title: 'Tips kapan saja', body: 'Tekan 💡 untuk menampilkan lagi tips halaman yang sedang dibuka. Saat pertama membuka tiap formulir dan dashboard, tips singkat akan muncul.' },
      { sel: '#prefsBtn', title: 'Tampilan dan akun', body: 'Atur ukuran huruf, tema, kontras, ganti PIN, dan nyalakan/matikan tur dan tips.' }];
  }
  function listTour(form) {
    const fi = FORMINFO[form] || [form, ''];
    return [
      { sel: '.page-head h1', title: fi[0], body: fi[1] },
      { sel: '.filters', title: 'Saring unit', body: 'Saring menurut wilayah, sub-formulir, atau status. Pilih "Tugas saya" untuk unit yang ditugaskan kepada Anda.' },
      { sel: '.legend', title: 'Arti warna dan tanda', body: 'Warna tepi = status. Inisial di pojok = orang yang sedang membuka (bisa lebih dari satu); ✓ = pengisi; → = ditugaskan kepada.' },
      { sel: '.tiles .tile', title: 'Buka unit', body: 'Ketuk ubin untuk membuka formulir unit itu. Satu unit dapat diisi beberapa orang sekaligus.' },
      coord() ? { sel: '[data-tour=assign]', title: 'Tugaskan pengisi', body: 'Pilih beberapa ubin lalu tentukan enumerator yang mengisi atau melanjutkan. Centang "khusus penerima tugas" hanya untuk ambil alih penuh.' } : null,
      { sel: '.page-head .row .btn', title: 'Progress dan tabel isian', body: 'Lihat kemajuan, antrean pemeriksaan, dan tabel isian formulir ini.' }];
  }
  function editorTour(sub, withGeneral) {
    const tip = SUBTIP[sub] || [sub, ''];
    const steps = [{ sel: '.editor-head h1', title: 'Tips · ' + tip[0], body: tip[1] }];
    if (!withGeneral) return steps;
    return steps.concat([
      { sel: '.presence', title: 'Mengisi bersama', body: 'Siapa yang sedang membuka formulir ini dan siapa pengisinya. Bingkai berwarna berkedip menandai isian yang sedang diisi orang lain.' },
      { sel: '.needlegend', title: 'Warna kelengkapan', body: 'Hijau ● sudah diisi; merah ○ wajib (*) belum diisi; coklat ○ belum diisi; abu-abu = opsional. Centang "Tampilkan hanya yang belum diisi" untuk fokus pada kekurangan.' },
      { sel: 'details.sec', title: 'Bagian formulir', body: 'Judul bagian menunjukkan lengkap/belum. Tekan ? di samping pertanyaan untuk penjelasan. ✓ Nama = siapa yang mengisi isian itu.' },
      { sel: '.footerbar .popwrap > button', title: 'Lainnya', body: 'Cek isian (wajib kosong dan anomali), Ajak mengisi/serahkan ke pengguna lain, Penugasan (koordinator), dan Riwayat.' },
      { sel: '.footerbar .btn.primary', title: 'Simpan dan kirim', body: 'Isian tersimpan otomatis di perangkat dan disinkronkan. Kirim menjalankan cek sebelum kirim; data Valid setelah diperiksa koordinator.' }]);
  }
  /** tur untuk rute saat ini: {id, steps, wait} */
  function forRoute(p) {
    const r = p[0] || '';
    if (!r) return { id: 'welcome', steps: welcome(), wait: '#main .grid, #main .card, #main a.btn' };
    if (r === 'form' && p[1] && p[1] !== 'C2') return { id: 'list', steps: listTour(p[1]), wait: '.tiles, .notice, .board', soft: 'list:' + p[1] };
    if (r === 'edit') { const general = !seen('editor'); return { id: general ? 'editor' : 'edit:' + p[2], also: 'edit:' + p[2], steps: editorTour(p[2], general), wait: '.footerbar' }; }
    if (r === 'c2' || (r === 'form' && p[1] === 'C2')) return { id: 'c2', steps: DASH.c2(), wait: 'select[aria-label=Fasyankes], .notice' };
    if (r === 'progress') return { id: 'progress', steps: DASH.progress(), wait: '.kpis, .notice' };
    if (r === 'analysis') return { id: 'analysis', steps: DASH.analysis(), wait: '.anl, .notice.err' };
    if (r === 'mapping') return { id: 'mapping', steps: DASH.mapping(), wait: '.mdiag svg, .mdiag .placeholder, .notice.err' };
    if (r === 'report') return { id: 'report', steps: DASH.report(), wait: '.report, .notice' };
    if (r === 'admin') return { id: 'admin', steps: DASH.admin(), wait: '.tabs' };
    return null;
  }

  /* ---------------- mesin tur */
  let cur = null, routeSeq = 0;
  const visible = el => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.closest('[hidden]') && getComputedStyle(el).visibility !== 'hidden'; };
  const find = sel => { if (!sel) return null; for (const s of [].concat(sel)) { for (const el of document.querySelectorAll(s)) if (visible(el)) return el; } return null; };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  async function waitFor(sel, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (find(sel)) return true; await sleep(250); } return false; }
  async function waitNoModal(ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (!document.querySelector('.modal-back')) return true; await sleep(300); } return false; }

  function close(how) {
    if (!cur) return;
    const c = cur; cur = null;
    c.root.remove(); document.removeEventListener('keydown', c.onKey); window.removeEventListener('resize', c.onResize); window.removeEventListener('scroll', c.onResize, true);
    if (c.target) c.target.classList.remove('tour-target');
    if (c.off.checked) { st.off = true; RCA.toast('Tur dan tips otomatis dimatikan. Tekan 💡 bila ingin melihatnya lagi.', null, 6000); }
    (c.ids || []).forEach(markSeen);
    if (c.onDone) c.onDone(how);
  }
  /** jalankan tur: steps [{sel?, title, body}] */
  T.run = function (steps, opts) {
    opts = opts || {};
    if (cur) close('ganti');
    steps = steps.filter(Boolean);
    const avail = steps.filter(s => !s.sel || find(s.sel));
    if (!avail.length) return false;
    const spot = h('div', { class: 'tour-spot', 'aria-hidden': 'true' });
    const shade = h('div', { class: 'tour-shade' });
    const ttl = h('h2', { id: 'tourTitle' }), body = h('p', { id: 'tourBody' }), cnt = h('span', { class: 'tour-cnt' });
    const prev = h('button', { type: 'button', class: 'btn small' }, 'Sebelumnya');
    const next = h('button', { type: 'button', class: 'btn small primary' }, 'Lanjut');
    const skip = h('button', { type: 'button', class: 'btn small ghost' }, 'Lewati');
    const off = h('input', { type: 'checkbox' });
    const dots = h('div', { class: 'tour-dots', 'aria-hidden': 'true' });
    const pop = h('div', { class: 'tour-pop', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'tourTitle', 'aria-describedby': 'tourBody', tabindex: '-1' },
      h('div', { class: 'tour-top' }, h('span', { class: 'tour-ic', 'aria-hidden': 'true' }, '💡'), cnt, h('button', { type: 'button', class: 'iconbtn tour-x', 'aria-label': 'Tutup tips', onclick: () => close('tutup') }, '✕')),
      ttl, body, dots,
      h('label', { class: 'tour-off' }, off, h('span', null, 'Jangan tampilkan lagi tur dan tips otomatis')),
      h('div', { class: 'tour-btns' }, skip, h('span', { class: 'grow' }), prev, next));
    const root = h('div', { class: 'tour-root' }, shade, spot, pop);
    document.body.appendChild(root);
    let i = 0;
    const place = () => {
      const s = avail[i], el = s.sel ? find(s.sel) : null;
      if (cur.target && cur.target !== el) cur.target.classList.remove('tour-target');
      cur.target = el;
      const vw = window.innerWidth, vh = window.innerHeight, mobile = vw <= 640;
      if (el) {
        el.classList.add('tour-target');
        const r = el.getBoundingClientRect(), pad = 6;
        const top = Math.max(4, r.top - pad), left = Math.max(4, r.left - pad), w = Math.min(vw - 8, r.width + pad * 2), hh = Math.min(vh - 8 - top, r.height + pad * 2);
        Object.assign(spot.style, { display: 'block', top: top + 'px', left: left + 'px', width: w + 'px', height: Math.max(24, hh) + 'px' });
        shade.style.background = 'transparent';
        if (mobile) { pop.className = 'tour-pop sheet' + (r.top > vh * 0.55 ? ' top' : ''); pop.style.cssText = ''; }
        else {
          pop.className = 'tour-pop';
          const pw = Math.min(380, vw - 24), ph = pop.offsetHeight || 220;
          let pt = r.bottom + 14, pl = Math.min(Math.max(12, r.left), vw - pw - 12);
          if (pt + ph > vh - 10) pt = r.top - ph - 14;
          if (pt < 10) { pt = Math.min(vh - ph - 10, Math.max(10, r.top + 10)); pl = r.right + 14 + pw < vw ? r.right + 14 : Math.max(12, r.left - pw - 14); }
          Object.assign(pop.style, { top: pt + 'px', left: pl + 'px', width: pw + 'px' });
        }
      } else {
        spot.style.display = 'none'; shade.style.background = '';
        pop.className = 'tour-pop center'; pop.style.cssText = '';
      }
    };
    const show = async n => {
      i = Math.max(0, Math.min(avail.length - 1, n));
      const s = avail[i], el = s.sel ? find(s.sel) : null;
      ttl.textContent = s.title; body.textContent = s.body;
      cnt.textContent = (opts.label ? opts.label + ' · ' : '') + (i + 1) + '/' + avail.length;
      prev.hidden = i === 0; next.textContent = i === avail.length - 1 ? 'Selesai' : 'Lanjut';
      dots.innerHTML = ''; avail.forEach((_, j) => dots.appendChild(h('i', { class: j === i ? 'on' : '' })));
      if (el) {
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight, head = 76;
        if (r.top < head || r.bottom > vh - 20) { window.scrollTo(0, Math.max(0, window.scrollY + r.top - (r.height > vh * 0.55 ? head + 4 : (vh - r.height) / 2))); await sleep(150); }
      }
      place(); pop.focus({ preventScroll: true });
    };
    prev.onclick = () => show(i - 1);
    next.onclick = () => { if (i >= avail.length - 1) close('selesai'); else show(i + 1); };
    skip.onclick = () => close('lewati');
    shade.addEventListener('click', () => {});
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); close('lewati'); } else if (e.key === 'ArrowRight' && document.activeElement && root.contains(document.activeElement)) next.click(); else if (e.key === 'ArrowLeft' && document.activeElement && root.contains(document.activeElement)) { if (i) show(i - 1); } };
    let raf = 0; const onResize = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => cur && place()); };
    cur = { root, target: null, off, onKey, onResize, ids: opts.ids || [], onDone: opts.onDone };
    document.addEventListener('keydown', onKey); window.addEventListener('resize', onResize); window.addEventListener('scroll', onResize, true);
    show(0);
    return true;
  };

  /* ---------------- pemicu */
  T.onRoute = async function (p) {
    const seq = ++routeSeq;
    if (cur) close('pindah');
    if (st.off || automationOff() || !RCA.state.user) return;
    const t = forRoute(p); if (!t) return;
    const ids = [t.id].concat(t.also ? [t.also] : []).concat(t.soft ? [t.soft] : []);
    if (t.soft ? seen(t.soft) : seen(t.id) && (!t.also || seen(t.also))) return;
    await waitFor(t.wait, 9000); if (seq !== routeSeq) return;
    // tunggu dialog lain (mis. pop-up notifikasi setelah masuk) ditutup lebih dulu
    for (let k = 0; k < 4; k++) { await waitNoModal(60000); if (seq !== routeSeq) return; await sleep(700); if (seq !== routeSeq) return; if (!document.querySelector('.modal-back')) break; }
    if (document.querySelector('.modal-back')) return;
    const label = t.id === 'welcome' ? 'Tur aplikasi' : t.id === 'editor' || t.id.startsWith('edit:') ? 'Tips formulir' : t.id === 'list' ? 'Tips daftar unit' : 'Tips dashboard';
    T.run(t.steps, { ids, label });
  };
  /** tombol 💡: tampilkan tips halaman ini (lengkap, walau sudah pernah dilihat atau dimatikan) */
  T.replay = function () {
    const p = (location.hash || '#/').slice(2).split('/').map(decodeURIComponent);
    let t = forRoute(p);
    if (p[0] === 'edit') t = { id: 'editor', steps: editorTour(p[2], true) };
    if (!t || !T.run(t.steps, { manual: true, label: 'Tips halaman ini' })) T.run([{ title: 'Tips', body: 'Belum ada tips khusus untuk halaman ini. Buka Panduan singkat di menu untuk penjelasan alur kerja.' }], { manual: true });
  };
  T.welcome = () => T.run(welcome(), { manual: true, label: 'Tur aplikasi' });
  T.current = () => !!cur;
})();
