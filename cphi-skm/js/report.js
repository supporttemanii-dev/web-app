/* report.js — laporan SKM otomatis (sistematika Bab I–V) + ekspor PDF, Word, Excel */
const Report = (() => {
  const RTL = {
    U1: 'Menyederhanakan dan mempublikasikan persyaratan layanan melalui papan informasi, leaflet, dan media sosial.',
    U2: 'Menyusun alur pelayanan yang ringkas, memasang alur di titik strategis, dan menyediakan petugas pemandu.',
    U3: 'Menerapkan sistem antrean (online/nomor elektronik), menetapkan standar waktu, dan memantau waktu tunggu.',
    U4: 'Mengumumkan tarif secara transparan sesuai Perda/BPJS dan memastikan tidak ada pungutan di luar ketentuan.',
    U5: 'Menyesuaikan produk layanan dengan standar pelayanan yang dipublikasikan dan melakukan evaluasi berkala.',
    U6: 'Meningkatkan kompetensi petugas melalui pelatihan teknis, in-house training, dan supervisi klinis.',
    U7: 'Melaksanakan pelatihan service excellence (budaya 5S: senyum, salam, sapa, sopan, santun) dan monitoring perilaku.',
    U8: 'Menyediakan kanal pengaduan (kotak saran, WhatsApp, SP4N-LAPOR!), menindaklanjuti, dan mengumumkan hasil tindak lanjut.',
    U9: 'Memperbaiki sarana prasarana prioritas (ruang tunggu, toilet, parkir, aksesibilitas disabilitas) dan pemeliharaan rutin.'
  };
  const romawi = ['I', 'II', 'III', 'IV', 'V'];

  function kop(s, fk) {
    return `<div class="kop"><img src="${esc(s.logo || 'icons/logo.png')}" alt="">
      <div class="kt">${fk ? `<div>${esc(String(s.instansi || '').toUpperCase())}</div><b>${esc(String(fk.nama).toUpperCase())}</b><div style="font-size:10.5pt">${esc(fk.alamat || '')}${fk.telepon ? ' · Telp. ' + esc(fk.telepon) : ''}</div>` :
        `<div>PEMERINTAH ${esc(String(s.kota || '').toUpperCase())}</div><b>${esc(String(s.instansi || '').toUpperCase())}</b><div style="font-size:10.5pt">${esc(s.alamat || '')}${s.telepon ? ' · Telp. ' + esc(s.telepon) : ''}${s.email ? ' · ' + esc(s.email) : ''}</div>`}</div></div>`;
  }

  function ttd(m) {
    return `<div class="ttd"><div>${esc(m.kota)}, ${esc(fmt.date(m.tanggal))}</div><div>${esc(m.jabatan)}</div><div style="height:64pt"></div><div><b><u>${esc(m.penandatangan || '........................................')}</u></b></div><div>NIP. ${esc(m.nip || '........................')}</div></div>`;
  }

  function profilTables(form, G) {
    const qs = form.pertanyaan.filter(q => q.kategori === 'profil' && ['pilihan', 'dropdown', 'ya_tidak', 'kotakcentang'].includes(q.tipe));
    return qs.map((q, i) => {
      const d = Dash.distrib(q, G); const tot = d.reduce((a, b) => a + b.n, 0) || 1;
      return `<p class="ni"><b>Tabel 3.${i + 1}</b> Profil responden berdasarkan ${esc(q.label.toLowerCase())}</p>
      <table><tr><th style="width:8%">No</th><th>${esc(q.label)}</th><th style="width:18%">Jumlah</th><th style="width:18%">Persentase</th></tr>
      ${d.map((x, j) => `<tr><td style="text-align:center">${j + 1}</td><td>${esc(x.l)}</td><td style="text-align:center">${x.n}</td><td style="text-align:center">${fmt.n(x.n / tot * 100, 2)}%</td></tr>`).join('')}
      <tr><th colspan="2">Jumlah</th><th>${tot}</th><th>100%</th></tr></table>`;
    }).join('');
  }

  /**
   * ctx: {form, agg, settings, faskes:[], units:[], meta:{...}}
   * returns {html, images:[{id,data}]}
   */
  async function build(ctx) {
    const { form, agg, meta: m } = ctx;
    const s = Object.assign({}, ctx.settings);
    s.logo = await logoPng(s.logo || 'icons/logo.png');   // PNG tertanam → aman untuk PDF & Word
    if (s.logo_mitra) s.logo_mitra = await logoPng(s.logo_mitra);
    const res = Core.ikm(form, agg.all);
    const target = Core.sampelKrejcie(m.populasi || form.populasi);
    const fkSingle = m.faskes_id ? ctx.faskes.find(f => f.id === m.faskes_id) : null;
    const lokasi = fkSingle ? fkSingle.nama : (Object.keys(agg.faskes).filter(k => k !== '-').map(id => (ctx.faskes.find(f => f.id === id) || {}).nama || id));
    const objek = fkSingle ? fkSingle.nama : (s.instansi || 'Dinas Kesehatan');
    const sorted = res.unsur.slice().sort((a, b) => a.nrr - b.nrr);
    const low = sorted.slice(0, 3), high = sorted.slice(-3).reverse();
    const images = [];

    if (res.k) images.push({ id: 'img_unsur', data: await Dash.chartImage(Dash.chartCfgUnsur(res), 900, Math.max(360, res.k * 44 + 60)) });
    const fkRows = Object.keys(agg.faskes).filter(k => k !== '-').map(id => ({ nama: (ctx.faskes.find(f => f.id === id) || {}).nama || id, r: Core.ikm(form, agg.faskes[id]) })).sort((a, b) => b.r.konversi - a.r.konversi);
    const unRows = Object.keys(agg.unit).filter(k => k !== '-').map(id => { const u = ctx.units.find(x => x.id === id) || {}; return { nama: u.nama || id, fk: (ctx.faskes.find(f => f.id === u.faskes_id) || {}).nama || '', r: Core.ikm(form, agg.unit[id]) }; }).sort((a, b) => b.r.konversi - a.r.konversi);
    if (res.k && fkRows.length > 1) images.push({ id: 'img_fk', data: await Dash.chartImage({ type: 'bar', data: { labels: fkRows.map(f => f.nama), datasets: [{ data: fkRows.map(f => Core.round(f.r.konversi, 2)), backgroundColor: fkRows.map(f => Dash.MUTU_C[f.r.mutu]) }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { min: 0, max: 100 } } } }, 900, Math.max(300, fkRows.length * 40 + 60)) });
    const img = id => { const x = images.find(i => i.id === id); return x ? `<img class="chart-img" data-img="${id}" src="${x.data}">` : ''; };

    const saran = Object.keys(agg.teks || {}).flatMap(k => agg.teks[k]).slice(-15).reverse();
    const periodeTxt = m.periode || (fmt.date(m.dari) + ' s.d. ' + fmt.date(m.sampai));
    const tahun = (m.sampai || m.tanggal || fmt.today()).slice(0, 4);

    let h = '';
    /* Sampul */
    h += `<div class="cover">${s.logo ? `<img src="${esc(s.logo)}" style="width:5.5cm;max-height:4cm;height:auto;object-fit:contain">` : ''}
      <h1 style="margin-top:28pt">LAPORAN HASIL<br>SURVEI KEPUASAN MASYARAKAT (SKM)</h1>
      <p class="ni" style="text-align:center;font-size:13pt;margin-top:14pt"><b>${esc(String(objek).toUpperCase())}</b></p>
      <p class="ni" style="text-align:center">Periode ${esc(periodeTxt)}</p>
      ${m.nomor ? `<p class="ni" style="text-align:center">Nomor: ${esc(m.nomor)}</p>` : ''}
      ${s.logo_mitra ? `<img class="banner" src="${esc(s.logo_mitra)}" style="width:9cm;height:auto;display:block;margin:50pt auto 0">` : ''}
      <p class="ni" style="text-align:center;margin-top:${s.logo_mitra ? 40 : 90}pt"><b>${esc(String(s.instansi || '').toUpperCase())}<br>${esc(String(s.kota || '').toUpperCase())}<br>TAHUN ${tahun}</b></p></div>`;

    /* Kata pengantar (diawali kop surat di halaman baru) */
    h += kop(s, fkSingle) + `<h2 class="first">KATA PENGANTAR</h2>
      <p>Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas tersusunnya Laporan Hasil Survei Kepuasan Masyarakat (SKM) ${esc(objek)} periode ${esc(periodeTxt)}. Survei ini dilaksanakan sebagai amanat Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik dan Peraturan Menteri PANRB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</p>
      <p>Hasil survei diharapkan menjadi bahan evaluasi dan dasar perumusan kebijakan peningkatan mutu pelayanan kesehatan. Kami menyampaikan terima kasih kepada seluruh responden, petugas, dan pihak yang telah membantu pelaksanaan survei ini.</p>${ttd(m)}`;

    /* BAB I */
    h += `<h2>BAB I<br>PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang</h3>
      <p>Pelayanan publik yang berkualitas merupakan hak setiap warga negara. Fasilitas pelayanan kesehatan, baik Puskesmas maupun Rumah Sakit, dituntut memberikan pelayanan yang cepat, tepat, ramah, dan terjangkau. Untuk mengetahui tingkat kepuasan masyarakat secara objektif dan berkala, penyelenggara pelayanan wajib melaksanakan Survei Kepuasan Masyarakat (SKM).</p>
      <p>SKM adalah kegiatan pengukuran secara komprehensif tentang tingkat kepuasan masyarakat terhadap kualitas layanan yang diberikan oleh penyelenggara pelayanan publik. Hasilnya dinyatakan dalam Indeks Kepuasan Masyarakat (IKM) yang menjadi tolok ukur kinerja pelayanan dan dasar perbaikan berkelanjutan.</p>
      <h3>1.2 Dasar Hukum</h3>
      <ol><li>Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik;</li><li>Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan;</li><li>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi;</li><li>Peraturan Pemerintah Nomor 96 Tahun 2012 tentang Pelaksanaan UU Nomor 25 Tahun 2009 tentang Pelayanan Publik;</li><li>Peraturan Menteri PANRB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik.</li></ol>
      <h3>1.3 Maksud dan Tujuan</h3>
      <p>Survei ini dimaksudkan untuk mengukur tingkat kepuasan masyarakat terhadap pelayanan di ${esc(objek)}. Tujuannya adalah: (a) mengetahui kelemahan dan kekuatan setiap unsur pelayanan; (b) mengetahui kinerja pelayanan secara periodik; (c) menjadi bahan penetapan kebijakan perbaikan; dan (d) mendorong partisipasi masyarakat dalam menilai kinerja pelayanan.</p>
      <h3>1.4 Manfaat</h3>
      <p>Hasil SKM bermanfaat sebagai indikator kinerja pelayanan, bahan evaluasi bagi pimpinan, dasar penyusunan rencana tindak lanjut perbaikan, serta wujud transparansi dan akuntabilitas kepada masyarakat.</p>`;

    /* BAB II */
    h += `<h2>BAB II<br>PENGUMPULAN DATA SKM</h2>
      <h3>2.1 Pelaksana SKM</h3>
      <p>Survei dilaksanakan secara mandiri oleh ${esc(s.instansi || 'penyelenggara pelayanan')} melalui tim pelaksana SKM dengan memanfaatkan aplikasi ${esc(s.app_nama || 'SKM')} berbasis web.</p>
      <h3>2.2 Metode Pengumpulan Data</h3>
      <p>Pengumpulan data menggunakan kuesioner ${form.tipe === 'standar' ? 'standar sesuai PermenPAN-RB Nomor 14 Tahun 2017' : 'yang disusun sesuai kebutuhan'} yang terdiri atas ${res.k} unsur pelayanan dengan skala penilaian 1 sampai 4. Kuesioner diisi melalui ${(form.mode_input || []).map(x => ({ enumerator: 'wawancara oleh enumerator', responden: 'pengisian mandiri melalui tautan/QR code', kiosk: 'tablet kiosk di ruang tunggu' }[x])).join(', ')}.</p>
      <h3>2.3 Lokasi Pengumpulan Data</h3>
      <p>${Array.isArray(lokasi) ? 'Pengumpulan data dilaksanakan di ' + lokasi.length + ' fasilitas pelayanan kesehatan, yaitu: ' + lokasi.map(esc).join('; ') + '.' : 'Pengumpulan data dilaksanakan di ' + esc(lokasi) + '.'}</p>
      <h3>2.4 Waktu Pelaksanaan</h3>
      <p>Survei dilaksanakan pada periode ${esc(periodeTxt)}.</p>
      <h3>2.5 Penentuan Jumlah Responden</h3>
      <p>${target ? `Dengan populasi penerima layanan sebanyak ${fmt.n(m.populasi || form.populasi)} orang, jumlah sampel minimum berdasarkan tabel Krejcie dan Morgan adalah ${fmt.n(target)} responden. Realisasi responden sebanyak ${fmt.n(agg.total)} orang (${fmt.pct(agg.total, target)} dari target).` : `Jumlah responden yang berhasil dihimpun sebanyak ${fmt.n(agg.total)} orang.`}</p>`;

    /* BAB III */
    h += `<h2>BAB III<br>HASIL PENGOLAHAN DATA SKM</h2>
      <h3>3.1 Jumlah Responden dan Profil Responden</h3>
      <p>Jumlah responden yang menjadi dasar pengolahan data adalah ${fmt.n(agg.total)} orang, dengan profil sebagai berikut.</p>
      ${profilTables(form, agg.all)}
      <h3>3.2 Indeks Kepuasan Masyarakat (IKM)</h3>
      ${res.k ? `<p>Nilai IKM dihitung dengan rata-rata tertimbang dari ${res.k} unsur pelayanan, dengan bobot setiap unsur sebesar 1/${res.k} = ${fmt.n(res.bobot, 3)}. Hasil perhitungan nilai rata-rata (NRR) per unsur disajikan pada tabel berikut.</p>
      <p class="ni"><b>Tabel 3.${form.pertanyaan.filter(q => q.kategori === 'profil').length + 1}</b> Nilai per unsur pelayanan</p>
      <table><tr><th>No</th><th>Unsur Pelayanan</th><th>NRR</th><th>NRR Tertimbang</th><th>Nilai Konversi</th><th>Mutu</th><th>Kinerja</th></tr>
      ${res.unsur.map((u, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.kode)} ${esc(u.nama)}</td><td style="text-align:center">${fmt.n(u.nrr, 3)}</td><td style="text-align:center">${fmt.n(u.tertimbang, 3)}</td><td style="text-align:center">${fmt.n(u.konversi, 2)}</td><td style="text-align:center">${u.mutu}</td><td>${u.kinerja}</td></tr>`).join('')}
      <tr><th colspan="3">IKM</th><th>${fmt.n(res.ikm, 3)}</th><th>${fmt.n(res.konversi, 2)}</th><th>${res.mutu}</th><th>${res.kinerja}</th></tr></table>
      ${img('img_unsur')}<div class="caption">Gambar 3.1 Nilai rata-rata per unsur pelayanan</div>
      <p>Berdasarkan hasil perhitungan, nilai IKM ${esc(objek)} adalah <b>${fmt.n(res.konversi, 2)}</b> dengan mutu pelayanan <b>${res.mutu}</b> dan kinerja unit pelayanan <b>${res.kinerja}</b>.</p>
      <p class="ni"><b>Tabel 3.${form.pertanyaan.filter(q => q.kategori === 'profil').length + 2}</b> Nilai persepsi, interval, dan mutu pelayanan</p>
      <table><tr><th>Nilai Persepsi</th><th>Nilai Interval (NI)</th><th>Nilai Interval Konversi (NIK)</th><th>Mutu</th><th>Kinerja</th></tr>
      <tr><td style="text-align:center">1</td><td style="text-align:center">1,00 – 2,5996</td><td style="text-align:center">25,00 – 64,99</td><td style="text-align:center">D</td><td>Tidak Baik</td></tr>
      <tr><td style="text-align:center">2</td><td style="text-align:center">2,60 – 3,064</td><td style="text-align:center">65,00 – 76,60</td><td style="text-align:center">C</td><td>Kurang Baik</td></tr>
      <tr><td style="text-align:center">3</td><td style="text-align:center">3,0644 – 3,532</td><td style="text-align:center">76,61 – 88,30</td><td style="text-align:center">B</td><td>Baik</td></tr>
      <tr><td style="text-align:center">4</td><td style="text-align:center">3,5324 – 4,00</td><td style="text-align:center">88,31 – 100,00</td><td style="text-align:center">A</td><td>Sangat Baik</td></tr></table>` : '<p>Instrumen ini tidak memuat unsur IKM sehingga nilai IKM tidak dihitung.</p>'}
      ${fkRows.length > 1 ? `<h3>3.3 IKM per Fasilitas Pelayanan Kesehatan</h3>
      <table><tr><th>No</th><th>Fasilitas</th><th>Responden</th><th>IKM</th><th>Mutu</th><th>Kinerja</th></tr>
      ${fkRows.map((f, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(f.nama)}</td><td style="text-align:center">${f.r.n}</td><td style="text-align:center">${fmt.n(f.r.konversi, 2)}</td><td style="text-align:center">${f.r.mutu}</td><td>${f.r.kinerja}</td></tr>`).join('')}</table>
      ${img('img_fk')}<div class="caption">Gambar 3.2 Perbandingan IKM antarfasilitas</div>` : ''}
      ${unRows.length > 1 ? `<h3>3.${fkRows.length > 1 ? 4 : 3} IKM per Unit Layanan</h3>
      <table><tr><th>No</th><th>Unit Layanan</th>${fkRows.length > 1 ? '<th>Fasilitas</th>' : ''}<th>Responden</th><th>IKM</th><th>Mutu</th></tr>
      ${unRows.map((u, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.nama)}</td>${fkRows.length > 1 ? `<td>${esc(u.fk)}</td>` : ''}<td style="text-align:center">${u.r.n}</td><td style="text-align:center">${fmt.n(u.r.konversi, 2)}</td><td style="text-align:center">${u.r.mutu}</td></tr>`).join('')}</table>` : ''}`;

    /* BAB IV */
    h += `<h2>BAB IV<br>ANALISIS HASIL SKM</h2>
      ${res.k ? `<h3>4.1 Analisis Kelemahan dan Kelebihan Unsur Layanan</h3>
      <p>Unsur pelayanan dengan nilai terendah yang perlu menjadi prioritas perbaikan adalah: ${low.map(u => `<b>${esc(u.nama)}</b> (NRR ${fmt.n(u.nrr, 3)})`).join(', ')}.</p>
      <p>Unsur pelayanan dengan nilai tertinggi yang perlu dipertahankan adalah: ${high.map(u => `<b>${esc(u.nama)}</b> (NRR ${fmt.n(u.nrr, 3)})`).join(', ')}.</p>
      <h3>4.2 Rencana Tindak Lanjut</h3>
      <table><tr><th>No</th><th>Prioritas Unsur</th><th>Program/Kegiatan</th><th>Waktu</th><th>Penanggung Jawab</th></tr>
      ${low.map((u, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.nama)}</td><td>${esc(RTL[u.kode] || 'Melakukan evaluasi dan perbaikan pada unsur ' + u.nama + '.')}</td><td>Triwulan berikutnya</td><td>${esc(fkSingle ? 'Kepala ' + fkSingle.nama : 'Kepala Fasyankes')}</td></tr>`).join('')}</table>` : ''}
      <h3>4.${res.k ? 3 : 1} Saran dan Masukan Responden</h3>
      ${saran.length ? `<p>Beberapa saran dan masukan yang disampaikan responden antara lain:</p><ol>${saran.map(x => `<li>${esc(x.t)}</li>`).join('')}</ol>` : '<p>Tidak terdapat saran tertulis dari responden pada periode ini.</p>'}`;

    /* BAB V */
    h += `<h2>BAB V<br>KESIMPULAN</h2>
      <ol>
        <li>Survei Kepuasan Masyarakat ${esc(objek)} periode ${esc(periodeTxt)} melibatkan ${fmt.n(agg.total)} responden${target ? ` (${fmt.pct(agg.total, target)} dari sampel minimum ${fmt.n(target)})` : ''}.</li>
        ${res.k ? `<li>Nilai IKM sebesar <b>${fmt.n(res.konversi, 2)}</b> dengan mutu pelayanan <b>${res.mutu}</b> (${res.kinerja}).</li>
        <li>Unsur dengan nilai terendah: ${low.map(u => esc(u.nama)).join(', ')}; unsur ini menjadi prioritas perbaikan.</li>
        <li>Unsur dengan nilai tertinggi: ${high.map(u => esc(u.nama)).join(', ')}; kinerja pada unsur ini perlu dipertahankan.</li>` : ''}
        <li>Hasil survei dan rencana tindak lanjut perlu dipublikasikan kepada masyarakat sebagai wujud transparansi pelayanan publik.</li>
      </ol>${ttd(m)}`;

    /* Lampiran */
    if (res.k) {
      h += `<h2>LAMPIRAN</h2><h3>Rekapitulasi Jawaban per Unsur</h3>
      <table><tr><th>Unsur</th><th>Nilai 1</th><th>Nilai 2</th><th>Nilai 3</th><th>Nilai 4</th><th>Jumlah Nilai</th><th>n</th></tr>
      ${res.unsur.map(u => `<tr><td>${esc(u.kode)} ${esc(u.nama)}</td>${[1, 2, 3, 4].map(k => `<td style="text-align:center">${u.c[String(k)] || 0}</td>`).join('')}<td style="text-align:center">${u.jumlah}</td><td style="text-align:center">${u.n}</td></tr>`).join('')}</table>
      <h3>Daftar Pertanyaan Kuesioner</h3><ol>${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).map(q => `<li>${esc(q.label)}${q.opsi ? ' <i>(' + q.opsi.map(o => esc(o.l)).join(' / ') + ')</i>' : ''}</li>`).join('')}</ol>`;
    }

    const html = h;
    return { html, images, res, fkRows, unRows };
  }

  async function logoPng(src) {
    try {
      const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
      const box = 900, nw = img.naturalWidth || box, nh = img.naturalHeight || box, r = Math.min(box / nw, box / nh, 3);
      const c = document.createElement('canvas'); c.width = Math.round(nw * r); c.height = Math.round(nh * r);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      return c.toDataURL('image/png');
    } catch (e) { return src; }
  }

  /* Ubah logo (SVG/URL) menjadi PNG dataURL agar ikut tertanam di PDF & Word */
  async function rasterize(root) {
    for (const im of $$('img', root)) {
      if (im.classList.contains('chart-img')) continue;
      const src = im.getAttribute('src') || '';
      if (src.startsWith('data:image/png') || src.startsWith('data:image/jpeg')) continue;
      try {
        const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; });
        const box = 300;
        const c = document.createElement('canvas'); c.width = box; c.height = box;
        const nw = img.naturalWidth || box, nh = img.naturalHeight || box;
        const r = Math.min(box / nw, box / nh);
        c.getContext('2d').drawImage(img, (box - nw * r) / 2, (box - nh * r) / 2, nw * r, nh * r);
        im.setAttribute('src', c.toDataURL('image/png')); im.style.objectFit = 'fill';
      } catch (e) { }
    }
  }

  /* ---------- PDF ---------- */
  async function toPDF(el, name) {
    await Lib.pdf();
    const clone = el.cloneNode(true);
    clone.style.cssText = 'width:165mm;min-height:0;padding:0;box-shadow:none;margin:0';
    const holder = document.createElement('div'); holder.style.cssText = 'position:fixed;left:-10000px;top:0;background:#fff'; holder.appendChild(clone); document.body.appendChild(holder);
    try {
      await html2pdf().set({
        margin: [20, 20, 20, 25], filename: name + '.pdf', image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.chart-img', '.ttd'] }
      }).from(clone).save();
    } finally { holder.remove(); }
  }

  /* ---------- Word (.docx asli via pustaka docx) ---------- */
  async function toWord(el, name) {
    await Lib.docx();
    const D = window.docx;
    const FONT = 'Times New Roman';
    const TW = 9354; // lebar area tulis A4 (twip) dengan margin 2,5 / 2 cm
    const imgCache = new Map();
    async function imgRun(src, maxWcm) {
      const m = String(src).match(/^data:image\/(\w+);base64,(.*)$/);
      if (!m) return null;
      const bin = atob(m[2]); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      let dim = imgCache.get(src);
      if (!dim) { dim = await new Promise(r => { const i = new Image(); i.onload = () => r([i.naturalWidth, i.naturalHeight]); i.onerror = () => r([300, 300]); i.src = src; }); imgCache.set(src, dim); }
      const wpx = maxWcm * 37.8; const hpx = wpx * dim[1] / dim[0];
      return new D.ImageRun({ data: u8, transformation: { width: Math.round(wpx), height: Math.round(hpx) } });
    }
    function runs(node, st = {}) {
      const out = [];
      node.childNodes.forEach(n => {
        if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' '); if (t.trim() || t === ' ') out.push(new D.TextRun({ text: t, bold: st.b, italics: st.i, underline: st.u ? {} : undefined, font: FONT, size: st.size })); return; }
        if (n.nodeType !== 1) return;
        const tg = n.tagName;
        if (tg === 'BR') { out.push(new D.TextRun({ text: '', break: 1 })); return; }
        if (tg === 'IMG') return;
        const ns = Object.assign({}, st);
        if (tg === 'B' || tg === 'STRONG' || tg === 'TH') ns.b = true;
        if (tg === 'I' || tg === 'EM') ns.i = true;
        if (tg === 'U') ns.u = true;
        if (tg === 'DIV' && out.length) out.push(new D.TextRun({ text: '', break: 1 }));
        out.push(...runs(n, ns));
      });
      return out;
    }
    const P = (children, o = {}) => new D.Paragraph(Object.assign({ children, spacing: { after: 120, line: 360 } }, o));
    const cellBorder = { style: D.BorderStyle.SINGLE, size: 4, color: '000000' };
    const none = { style: D.BorderStyle.NONE, size: 0, color: 'FFFFFF' };
    function table(t) {
      // lebar kolom proporsional terhadap panjang teks (rapi di Word, WPS, LibreOffice, Google Docs)
      const trs = Array.from(t.rows);
      const ncol = Math.max(...trs.map(tr => Array.from(tr.cells).reduce((a, c) => a + (c.colSpan || 1), 0)));
      const len = Array(ncol).fill(7);
      trs.forEach(tr => { let k = 0; Array.from(tr.cells).forEach(c => { if ((c.colSpan || 1) === 1) len[k] = Math.max(len[k], Math.min(30, c.textContent.trim().length)); k += c.colSpan || 1; }); });
      const tot = len.reduce((a, b) => a + b, 0);
      const cw = len.map(l => Math.round(TW * l / tot));
      const rows = trs.map(tr => {
        let k = 0;
        return new D.TableRow({
          cantSplit: true,
          children: Array.from(tr.cells).map(td => {
            const sp = td.colSpan || 1; const w = cw.slice(k, k + sp).reduce((a, b) => a + b, 0); k += sp;
            return new D.TableCell({
              columnSpan: sp, width: { size: w, type: D.WidthType.DXA },
              shading: td.tagName === 'TH' ? { fill: 'E5E7EB', type: D.ShadingType.CLEAR, color: 'auto' } : undefined,
              borders: { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder },
              margins: { top: 40, bottom: 40, left: 80, right: 80 },
              children: [new D.Paragraph({ alignment: (td.style.textAlign === 'center' || td.tagName === 'TH') ? D.AlignmentType.CENTER : D.AlignmentType.LEFT, children: runs(td, { size: 22, b: td.tagName === 'TH' }) })]
            });
          })
        });
      });
      return new D.Table({ rows, columnWidths: cw, width: { size: TW, type: D.WidthType.DXA }, layout: D.TableLayoutType.FIXED });
    }
    const body = [];
    async function walk(node) {
      for (const n of Array.from(node.children)) {
        const tg = n.tagName, cl = n.classList;
        if (cl.contains('cover')) {
          for (const c of Array.from(n.childNodes)) {
            if (c.nodeType !== 1) continue;
            if (c.tagName === 'IMG') { const r = await imgRun(c.getAttribute('src'), c.classList.contains('banner') ? 10 : 5.5); if (r) { const ban = c.classList.contains('banner'); body.push(P([r], { alignment: D.AlignmentType.CENTER, spacing: { before: ban ? 900 : 1200, after: ban ? 200 : 400 } })); } }
            else body.push(P(runs(c, { b: c.tagName === 'H1', size: c.tagName === 'H1' ? 36 : 26 }), { alignment: D.AlignmentType.CENTER, spacing: { after: 240, before: /TAHUN/.test(c.textContent) ? 900 : 0 } }));
          }
          continue;
        }
        if (cl.contains('kop')) {
          const im = n.querySelector('img'); const r = im ? await imgRun(im.getAttribute('src'), 2.8) : null;
          const lines = Array.from(n.querySelector('.kt').children).map((d, i) => P([new D.TextRun({ text: d.textContent, bold: d.tagName === 'B', size: d.tagName === 'B' ? 30 : 22, font: FONT })], { alignment: D.AlignmentType.CENTER, spacing: { after: 0 } }));
          body.push(new D.Paragraph({ children: [], pageBreakBefore: true, spacing: { after: 0 } }));
          body.push(new D.Table({
            width: { size: TW, type: D.WidthType.DXA }, columnWidths: [1900, TW - 1900], layout: D.TableLayoutType.FIXED,
            borders: { top: none, left: none, right: none, insideHorizontal: none, insideVertical: none, bottom: { style: D.BorderStyle.DOUBLE, size: 6, color: '000000' } },
            rows: [new D.TableRow({ children: [
              new D.TableCell({ width: { size: 1900, type: D.WidthType.DXA }, borders: { top: none, left: none, right: none, bottom: none }, verticalAlign: D.VerticalAlign.CENTER, children: [P(r ? [r] : [], { spacing: { after: 60 } })] }),
              new D.TableCell({ width: { size: TW - 1900, type: D.WidthType.DXA }, borders: { top: none, left: none, right: none, bottom: none }, verticalAlign: D.VerticalAlign.CENTER, children: lines })
            ] })]
          }));
          body.push(P([]));
          continue;
        }
        if (tg === 'H1' || tg === 'H2') { body.push(P(runs(n, { b: true, size: 26 }), { alignment: D.AlignmentType.CENTER, pageBreakBefore: tg === 'H2' && !cl.contains('first'), spacing: { before: 120, after: 240 } })); continue; }
        if (tg === 'H3') { body.push(P(runs(n, { b: true }), { spacing: { before: 200, after: 100 }, keepNext: true })); continue; }
        if (tg === 'P') { body.push(P(runs(n), { alignment: cl.contains('ni') ? D.AlignmentType.LEFT : D.AlignmentType.JUSTIFIED, indent: cl.contains('ni') ? undefined : { firstLine: 567 }, keepNext: cl.contains('ni') })); continue; }
        if (tg === 'OL' || tg === 'UL') { Array.from(n.children).forEach((li, i) => body.push(P([new D.TextRun({ text: (tg === 'OL' ? (i + 1) + '.' : '•') + '\t', font: FONT })].concat(runs(li)), { alignment: D.AlignmentType.JUSTIFIED, indent: { left: 567, hanging: 397 }, spacing: { after: 60, line: 320 } }))); continue; }
        if (tg === 'TABLE') { body.push(table(n)); body.push(P([], { spacing: { after: 120 } })); continue; }
        if (tg === 'IMG') { const r = await imgRun(n.getAttribute('src'), 15); if (r) body.push(P([r], { alignment: D.AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 60 } })); continue; }
        if (cl.contains('caption')) { body.push(P(runs(n, { i: true, size: 21 }), { alignment: D.AlignmentType.CENTER })); continue; }
        if (cl.contains('ttd')) { Array.from(n.children).forEach(d => body.push(P(runs(d, { b: !!d.querySelector('b') }), { alignment: D.AlignmentType.CENTER, indent: { left: 4800 }, spacing: { after: 0, before: d.textContent.trim() ? 0 : 1100 } }))); continue; }
        if (n.children.length) await walk(n);
      }
    }
    await walk(el);
    const doc = new D.Document({
      creator: 'Survey Master — PUI-PT CPHI Universitas Udayana', title: name,
      styles: { default: { document: { run: { font: FONT, size: 24 } } } },
      sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1418 } } }, children: body }]
    });
    UI.download(name + '.docx', await D.Packer.toBlob(doc));
  }

  /* ---------- Excel ---------- */
  async function toExcel(ctx, built, rows, name) {
    await Lib.xlsx();
    const { form, agg } = ctx; const res = built.res;
    const wb = XLSX.utils.book_new();
    const ring = [['LAPORAN SKM — ' + form.judul], ['Periode', ctx.meta.periode || (ctx.meta.dari + ' s.d. ' + ctx.meta.sampai)], ['Jumlah responden', agg.total], [],
      ['Kode', 'Unsur', 'n', 'Jumlah nilai', 'NRR', 'NRR tertimbang', 'Konversi', 'Mutu', 'Kinerja']];
    res.unsur.forEach(u => ring.push([u.kode, u.nama, u.n, u.jumlah, Core.round(u.nrr, 3), Core.round(u.tertimbang, 3), Core.round(u.konversi, 2), u.mutu, u.kinerja]));
    ring.push([], ['IKM', '', '', '', '', Core.round(res.ikm, 3), Core.round(res.konversi, 2), res.mutu, res.kinerja]);
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ring), 'Ringkasan IKM');
    if (built.fkRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Fasilitas', 'Responden', 'IKM', 'Mutu', 'Kinerja']].concat(built.fkRows.map(f => [f.nama, f.r.n, Core.round(f.r.konversi, 2), f.r.mutu, f.r.kinerja]))), 'Per Fasilitas');
    if (built.unRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['Unit', 'Fasilitas', 'Responden', 'IKM', 'Mutu']].concat(built.unRows.map(u => [u.nama, u.fk, u.r.n, Core.round(u.r.konversi, 2), u.r.mutu]))), 'Per Unit');
    const prof = [['Variabel', 'Kategori', 'Jumlah', '%']];
    form.pertanyaan.filter(q => q.kategori === 'profil' && q.opsi).forEach(q => { const d = Dash.distrib(q, agg.all); const t = d.reduce((a, b) => a + b.n, 0) || 1; d.forEach(x => prof.push([q.label, x.l, x.n, Core.round(x.n / t * 100, 2)])); });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prof), 'Profil Responden');
    if (rows && rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(flatRows(form, rows, ctx)), 'Data Mentah');
    XLSX.writeFile(wb, name + '.xlsx');
  }

  function flatRows(form, rows, ctx) {
    const qs = form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]);
    const fn = id => (ctx.faskes.find(f => f.id === id) || {}).nama || id;
    const un = id => (ctx.units.find(f => f.id === id) || {}).nama || id;
    return rows.map(r => {
      const o = { ID: r.id, Waktu: r.ts, Fasilitas: fn(r.faskes_id), Unit: un(r.unit_id), Mode: r.mode, Petugas: r.petugas, Status: r.status };
      qs.forEach(q => {
        const v = r.data[q.id];
        let out = v;
        if (Array.isArray(v)) out = v.map(x => Dash.optLabel(q, x)).join(', ');
        else if (v && typeof v === 'object') out = JSON.stringify(v);
        else if (q.opsi && q.tipe !== 'skala_ikm' && v !== undefined) out = Dash.optLabel(q, v);
        o[q.id] = out === undefined ? '' : out;
      });
      return o;
    });
  }

  return { build, toPDF, toWord, toExcel, flatRows, romawi };
})();
