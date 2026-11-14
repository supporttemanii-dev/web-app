/* narasi.js — Laporan SKM LENGKAP: narasi komprehensif, analisis & pembahasan berbasis literatur, daftar pustaka.
 * Dipanggil oleh Report.build() bila jenis laporan = "lengkap".
 * Seluruh angka dihitung dari data; kalimat interpretasi disusun otomatis berdasarkan hasil.
 */
const Narasi = (() => {
  /* ---------- Pustaka (APA 7) ---------- */
  const REF = {
    uu25: 'Republik Indonesia. (2009). <i>Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik</i>. Lembaran Negara Republik Indonesia Tahun 2009 Nomor 112.',
    pp96: 'Republik Indonesia. (2012). <i>Peraturan Pemerintah Nomor 96 Tahun 2012 tentang Pelaksanaan Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik</i>.',
    uu17: 'Republik Indonesia. (2023). <i>Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan</i>. Lembaran Negara Republik Indonesia Tahun 2023 Nomor 105.',
    uu27: 'Republik Indonesia. (2022). <i>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi</i>.',
    panrb: 'Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi. (2017). <i>Peraturan Menteri PANRB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik</i>.',
    pmk30: 'Kementerian Kesehatan Republik Indonesia. (2022). <i>Peraturan Menteri Kesehatan Nomor 30 Tahun 2022 tentang Indikator Nasional Mutu Pelayanan Kesehatan Tempat Praktik Mandiri Dokter dan Dokter Gigi, Klinik, Pusat Kesehatan Masyarakat, Rumah Sakit, Laboratorium Kesehatan, dan Unit Transfusi Darah</i>.',
    pmk19: 'Kementerian Kesehatan Republik Indonesia. (2024). <i>Peraturan Menteri Kesehatan Nomor 19 Tahun 2024 tentang Penyelenggaraan Pusat Kesehatan Masyarakat</i>. Berita Negara Republik Indonesia Tahun 2024 Nomor 1039.',
    anderson: 'Anderson, R. T., Camacho, F. T., &amp; Balkrishnan, R. (2007). Willing to wait?: The influence of patient wait time on satisfaction with primary care. <i>BMC Health Services Research, 7</i>, 31. https://doi.org/10.1186/1472-6963-7-31',
    batbaatar: 'Batbaatar, E., Dorjdagva, J., Luvsannyam, A., Savino, M. M., &amp; Amenta, P. (2017). Determinants of patient satisfaction: A systematic review. <i>Perspectives in Public Health, 137</i>(2), 89–101. https://doi.org/10.1177/1757913916634136',
    bleich: 'Bleich, S. N., Özaltin, E., &amp; Murray, C. J. L. (2009). How does satisfaction with the health-care system relate to patient experience? <i>Bulletin of the World Health Organization, 87</i>(4), 271–278.',
    donabedian: 'Donabedian, A. (1988). The quality of care: How can it be assessed? <i>JAMA, 260</i>(12), 1743–1748.',
    doyle: 'Doyle, C., Lennox, L., &amp; Bell, D. (2013). A systematic review of evidence on the links between patient experience and clinical safety and effectiveness. <i>BMJ Open, 3</i>(1), e001570.',
    hall: 'Hall, J. A., &amp; Dornan, M. C. (1990). Patient sociodemographic characteristics as predictors of satisfaction with medical care: A meta-analysis. <i>Social Science &amp; Medicine, 30</i>(7), 811–818.',
    krejcie: 'Krejcie, R. V., &amp; Morgan, D. W. (1970). Determining sample size for research activities. <i>Educational and Psychological Measurement, 30</i>(3), 607–610.',
    kruk: 'Kruk, M. E., Gage, A. D., Arsenault, C., Jordan, K., Leslie, H. H., Roder-DeWan, S., et al. (2018). High-quality health systems in the Sustainable Development Goals era: Time for a revolution. <i>The Lancet Global Health, 6</i>(11), e1196–e1252.',
    mosadeghrad: 'Mosadeghrad, A. M. (2014). Factors influencing healthcare service quality. <i>International Journal of Health Policy and Management, 3</i>(2), 77–89.',
    oliver: 'Oliver, R. L. (1980). A cognitive model of the antecedents and consequences of satisfaction decisions. <i>Journal of Marketing Research, 17</i>(4), 460–469.',
    parasuraman: 'Parasuraman, A., Zeithaml, V. A., &amp; Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality. <i>Journal of Retailing, 64</i>(1), 12–40.',
    sitzia: 'Sitzia, J., &amp; Wood, N. (1997). Patient satisfaction: A review of issues and concepts. <i>Social Science &amp; Medicine, 45</i>(12), 1829–1843.',
    who: 'World Health Organization, Organisation for Economic Co-operation and Development, &amp; The World Bank. (2018). <i>Delivering quality health services: A global imperative for universal health coverage</i>. World Health Organization.'
  };
  const ORDER = ['anderson', 'batbaatar', 'bleich', 'donabedian', 'doyle', 'hall', 'panrb', 'pmk30', 'pmk19', 'krejcie', 'kruk', 'mosadeghrad', 'oliver', 'parasuraman', 'pp96', 'uu25', 'uu27', 'uu17', 'sitzia', 'who'];

  /* Pemetaan 9 unsur ke kerangka teori */
  const TEORI = {
    U1: { dims: 'Struktur (Donabedian); reliability', pembahasan: 'Persyaratan pelayanan merupakan pintu masuk pengalaman pasien. Persyaratan yang jelas, ringkas, dan dipublikasikan mengurangi ketidakpastian dan kunjungan berulang, sehingga selaras dengan dimensi <i>reliability</i> dalam kerangka SERVQUAL (Parasuraman et al., 1988).' },
    U2: { dims: 'Proses (Donabedian); responsiveness', pembahasan: 'Kemudahan prosedur mencerminkan mutu proses pelayanan (Donabedian, 1988). Alur yang berbelit menambah beban waktu dan kognitif pasien, terutama kelompok lansia dan berpendidikan rendah, sehingga penyederhanaan alur dan petunjuk visual menjadi intervensi yang relatif murah namun berdampak.' },
    U3: { dims: 'Proses; responsiveness', pembahasan: 'Waktu tunggu merupakan salah satu sumber ketidakpuasan yang paling sering dilaporkan pada layanan primer. Anderson et al. (2007) menemukan bahwa waktu tunggu yang lebih lama berhubungan dengan kepuasan yang lebih rendah, namun waktu yang diluangkan dokter bersama pasien merupakan prediktor kepuasan yang lebih kuat; kombinasi tunggu lama dan konsultasi singkat menghasilkan kepuasan paling rendah. Implikasinya, perbaikan tidak cukup dengan mempercepat layanan, tetapi perlu manajemen antrean (penjadwalan, antrean daring, pembagian beban loket) tanpa memangkas waktu konsultasi.' },
    U4: { dims: 'Struktur/akses finansial', pembahasan: 'Kewajaran biaya berkaitan erat dengan cakupan Jaminan Kesehatan Nasional. Akses finansial yang baik merupakan prasyarat cakupan kesehatan semesta, namun cakupan saja tidak cukup tanpa mutu yang memadai (WHO, OECD, &amp; World Bank, 2018).' },
    U5: { dims: 'Hasil (outcome); reliability', pembahasan: 'Kesesuaian produk layanan dengan standar pelayanan menunjukkan konsistensi antara janji layanan dan hasil yang diterima pasien. Menurut model diskonfirmasi harapan, kepuasan terbentuk dari perbandingan antara harapan dan kinerja yang dirasakan (Oliver, 1980).' },
    U6: { dims: 'Struktur & proses; assurance', pembahasan: 'Kompetensi petugas berkaitan dengan dimensi <i>assurance</i>, yaitu pengetahuan dan kemampuan petugas menumbuhkan rasa percaya (Parasuraman et al., 1988). Kajian sistematis menunjukkan bahwa kompetensi profesional termasuk determinan penting kepuasan pasien (Batbaatar et al., 2017).' },
    U7: { dims: 'Proses interpersonal; empathy', pembahasan: 'Perilaku petugas (kesopanan dan keramahan) mewakili mutu asuhan interpersonal. Batbaatar et al. (2017) menyimpulkan bahwa mutu asuhan interpersonal merupakan determinan paling esensial dari kepuasan pasien, sehingga capaian unsur ini perlu dijaga sebagai kekuatan organisasi.' },
    U8: { dims: 'Proses umpan balik; responsiveness', pembahasan: 'Penanganan pengaduan merupakan kewajiban penyelenggara pelayanan publik (UU No. 25 Tahun 2009). Mekanisme umpan balik yang tidak terlihat oleh masyarakat cenderung dinilai rendah walaupun kanal pengaduan sebenarnya tersedia; karena itu, publikasi tindak lanjut pengaduan sama pentingnya dengan penyediaan kanal.' },
    U9: { dims: 'Struktur; tangibles', pembahasan: 'Sarana dan prasarana termasuk komponen struktur dalam model Donabedian (1988) dan dimensi <i>tangibles</i> dalam SERVQUAL. Lingkungan fisik seperti kenyamanan ruang tunggu dan kebersihan toilet membentuk kesan pertama pasien dan berkontribusi terhadap kepuasan (Batbaatar et al., 2017; Mosadeghrad, 2014).' }
  };

  const RTL = {
    U1: ['Persyaratan belum dipahami merata', 'Publikasi persyaratan per jenis layanan (papan informasi, leaflet, media sosial); daftar periksa persyaratan di loket', '% pengunjung yang persyaratannya lengkap saat pertama datang', '≥ 90%'],
    U2: ['Alur pelayanan dirasa belum mudah', 'Penyederhanaan alur, penanda arah/warna lantai, petugas pemandu (<i>greeter</i>) pada jam sibuk', 'NRR unsur prosedur', '≥ 3,30'],
    U3: ['Waktu tunggu masih panjang', 'Antrean daring/nomor elektronik, penjadwalan kedatangan, penambahan loket pada jam puncak, pemantauan waktu tunggu harian', 'Rata-rata waktu tunggu pendaftaran–poli', '≤ 60 menit'],
    U4: ['Persepsi biaya', 'Publikasi tarif sesuai Perda dan ketentuan JKN; penegasan tidak ada pungutan di luar ketentuan', 'Jumlah pengaduan terkait biaya', '0 kasus'],
    U5: ['Hasil layanan belum sesuai standar', 'Evaluasi standar pelayanan; audit kepatuhan SOP; umpan balik ke tim klinis', '% kepatuhan SOP', '≥ 90%'],
    U6: ['Kompetensi petugas perlu ditingkatkan', 'Pelatihan teknis dan <i>in-house training</i>, supervisi klinis berkala, mentoring', '% petugas mengikuti pelatihan ≥ 20 JPL/tahun', '≥ 80%'],
    U7: ['Perilaku petugas', 'Pelatihan <i>service excellence</i> (budaya 5S), apresiasi petugas teladan, survei kepuasan rutin per unit', 'NRR unsur perilaku', '≥ 3,53'],
    U8: ['Pengaduan belum terkelola dan terlihat', 'Optimalisasi SP4N-LAPOR!, kanal WhatsApp, kotak saran; publikasi rekap pengaduan dan tindak lanjut bulanan', '% pengaduan ditindaklanjuti ≤ 5 hari kerja', '100%'],
    U9: ['Sarana prasarana belum optimal', 'Perbaikan ruang tunggu (kursi, ventilasi/AC), jadwal kebersihan toilet, penataan parkir, aksesibilitas disabilitas/lansia', 'Skor audit kebersihan dan kenyamanan', '≥ 85%']
  };

  const TEMA = [
    { k: 'Waktu tunggu & antrean', re: /antre|antri|lama|tunggu|lambat|terlambat|online|cepat keluar/i },
    { k: 'Obat & farmasi', re: /obat|farmasi|apotek|resep/i },
    { k: 'Kebersihan', re: /bersih|kotor|toilet|wc|sampah/i },
    { k: 'Sarana & kenyamanan ruang', re: /ruang|kursi|parkir|\bac\b|panas|sempit|air minum|kursi roda|laktasi|fasilitas/i },
    { k: 'Informasi & prosedur', re: /informasi|jadwal|alur|papan|penjelasan|petunjuk|sistem/i },
    { k: 'Pengaduan & tindak lanjut', re: /pengaduan|kotak saran|keluhan|whatsapp|tindak lanjut/i },
    { k: 'Apresiasi kepada petugas/layanan', re: /ramah|sabar|terima kasih|bagus|pertahankan|membantu|\bbaik\b/i }
  ];

  const P = (t) => `<p>${t}</p>`;
  const pc = (n, t) => fmt.n(t ? n / t * 100 : 0, 1) + '%';
  const nn = (x, d = 0) => fmt.n(x, d);

  function grade(konv) {
    const th = [{ m: 'A', v: 88.31 }, { m: 'B', v: 76.61 }, { m: 'C', v: 65.00 }];
    const cur = Core.mutuIKM(konv).mutu;
    const next = cur === 'A' ? null : th.find(t => t.v > konv && ['A', 'B', 'C'].indexOf(t.m) < ['A', 'B', 'C', 'D'].indexOf(cur));
    return { cur, next };
  }

  function themeSaran(list) {
    const res = TEMA.map(t => ({ k: t.k, n: 0, contoh: [] }));
    let lain = 0;
    list.forEach(x => {
      let hit = false;
      TEMA.forEach((t, i) => { if (t.re.test(x.t)) { res[i].n++; hit = true; if (res[i].contoh.length < 2 && !res[i].contoh.includes(x.t)) res[i].contoh.push(x.t); } });
      if (!hit) lain++;
    });
    return { tema: res.filter(r => r.n).sort((a, b) => b.n - a.n), lain };
  }

  /**
   * ctx: {form, agg, settings(s), faskes, units, meta(m), monthly:[{label, agg}]}
   * helpers: {kop, ttd, img, fig, images}
   */
  function build(ctx, H) {
    const { form, agg, meta: m } = ctx;
    const s = H.s;
    const res = Core.ikm(form, agg.all);
    const N = agg.total;
    const target = Core.sampelKrejcie(m.populasi || form.populasi);
    const fkSingle = m.faskes_id ? ctx.faskes.find(f => f.id === m.faskes_id) : null;
    const fkIds = Object.keys(agg.faskes).filter(k => k !== '-');
    const objek = fkSingle ? fkSingle.nama : (fkIds.length === 1 ? ((ctx.faskes.find(f => f.id === fkIds[0]) || {}).nama || s.instansi) : (s.instansi || 'Dinas Kesehatan'));
    const periodeTxt = m.periode || (fmt.date(m.dari) + ' s.d. ' + fmt.date(m.sampai));
    const tahun = (m.sampai || m.tanggal || fmt.today()).slice(0, 4);
    const sorted = res.unsur.slice().sort((a, b) => a.nrr - b.nrr);
    const low = sorted.slice(0, 3), high = sorted.slice(-3).reverse();
    const below = res.unsur.filter(u => u.nrr < res.ikm);
    const g = grade(res.konversi);
    const uName = id => (ctx.units.find(u => u.id === id) || {}).nama || id;
    const fName = id => (ctx.faskes.find(f => f.id === id) || {}).nama || id;
    let tno = 0, gno = 0;
    const T = cap => `<p class="ni"><b>Tabel ${++tno}.</b> ${cap}</p>`;
    const F = (id, cap) => H.images.some(i => i.id === id) ? `${H.img(id)}<div class="caption">Gambar ${++gno}. ${esc(cap)}</div>` : '';
    const lastF = () => gno, lastT = () => tno;
    const posPct = u => { const p = (u.c['3'] || 0) + (u.c['4'] || 0); return u.n ? p / u.n * 100 : 0; };
    const negPct = u => { const p = (u.c['1'] || 0) + (u.c['2'] || 0); return u.n ? p / u.n * 100 : 0; };
    const fkRows = fkIds.map(id => ({ id, nama: fName(id), r: Core.ikm(form, agg.faskes[id]) })).sort((a, b) => b.r.konversi - a.r.konversi);
    const unRows = Object.keys(agg.unit).filter(k => k !== '-').map(id => ({ id, nama: uName(id), fk: fName((ctx.units.find(u => u.id === id) || {}).faskes_id), r: Core.ikm(form, agg.unit[id]) })).sort((a, b) => b.r.konversi - a.r.konversi);
    const saranAll = Object.keys(agg.teks || {}).flatMap(k => agg.teks[k]);
    const tema = themeSaran(saranAll);
    const monthly = (ctx.monthly || []).filter(x => x.agg && x.agg.total);
    const modeCnt = ctx.modeCount || {};
    const profilQ = form.pertanyaan.filter(q => q.kategori === 'profil' && ['pilihan', 'dropdown', 'ya_tidak', 'kotakcentang'].includes(q.tipe));
    const bayarQ = form.pertanyaan.find(q => q.id === 'bayar');
    const jknPct = bayarQ ? (() => { const d = Dash.distrib(bayarQ, agg.all); const t = d.reduce((a, b) => a + b.n, 0); const j = d.filter(x => /bpjs|jkn|jamkesda/i.test(x.l)).reduce((a, b) => a + b.n, 0); return t ? j / t * 100 : null; })() : null;

    let h = '';
    /* ===== SAMPUL ===== */
    h += `<div class="cover">${s.logo ? `<img src="${esc(s.logo)}" style="width:5.5cm;max-height:4cm;height:auto;object-fit:contain">` : ''}
      <h1 style="margin-top:28pt">LAPORAN LENGKAP<br>SURVEI KEPUASAN MASYARAKAT (SKM)</h1>
      <p class="ni" style="text-align:center;font-size:13pt;margin-top:14pt"><b>${esc(String(objek).toUpperCase())}</b></p>
      <p class="ni" style="text-align:center">Periode ${esc(periodeTxt)}</p>
      ${m.nomor ? `<p class="ni" style="text-align:center">Nomor: ${esc(m.nomor)}</p>` : ''}
      ${s.logo_mitra ? `<img class="banner" src="${esc(s.logo_mitra)}" style="width:9cm;height:auto;display:block;margin:50pt auto 0">` : ''}
      <p class="ni" style="text-align:center;margin-top:${s.logo_mitra ? 40 : 90}pt"><b>${esc(String(s.instansi || '').toUpperCase())}<br>${esc(String(s.kota || '').toUpperCase())}<br>TAHUN ${tahun}</b></p></div>`;

    /* ===== KATA PENGANTAR ===== */
    h += H.kop + `<h2 class="first">KATA PENGANTAR</h2>
      ${P(`Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa karena atas rahmat-Nya Laporan Lengkap Survei Kepuasan Masyarakat (SKM) ${esc(objek)} periode ${esc(periodeTxt)} dapat diselesaikan. Survei ini merupakan pelaksanaan amanat Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik dan Peraturan Menteri PANRB Nomor 14 Tahun 2017, sekaligus bagian dari pemantauan Indikator Nasional Mutu kepuasan pasien sebagaimana diatur dalam Peraturan Menteri Kesehatan Nomor 30 Tahun 2022.`)}
      ${P(`Laporan ini tidak hanya menyajikan Indeks Kepuasan Masyarakat (IKM), tetapi juga menguraikan profil responden, sebaran penilaian setiap unsur, perbandingan antarunit, kecenderungan antarwaktu, analisis saran responden, serta pembahasan yang dikaitkan dengan literatur ilmiah tentang mutu pelayanan dan kepuasan pasien. Dengan demikian, hasil survei diharapkan dapat langsung diterjemahkan menjadi rencana tindak lanjut yang terukur.`)}
      ${P(`Kami menyampaikan terima kasih kepada seluruh responden, petugas pengumpul data, dan semua pihak yang telah berkontribusi. Kritik dan saran untuk penyempurnaan laporan ini sangat kami harapkan.`)}${H.ttd}`;

    /* ===== RINGKASAN EKSEKUTIF ===== */
    h += `<h2>RINGKASAN EKSEKUTIF</h2>
      ${P(`Survei Kepuasan Masyarakat ${esc(objek)} periode ${esc(periodeTxt)} melibatkan <b>${nn(N)} responden</b>${target ? `, atau ${pc(N, target)} dari sampel minimum ${nn(target)} responden berdasarkan tabel Krejcie dan Morgan (1970)` : ''}. Pengukuran menggunakan ${res.k} unsur pelayanan sesuai Peraturan Menteri PANRB Nomor 14 Tahun 2017 dengan skala penilaian 1–4.`)}
      ${res.k ? P(`Nilai IKM yang diperoleh adalah <b>${nn(res.konversi, 2)}</b> (indeks ${nn(res.ikm, 3)}) dengan <b>mutu pelayanan ${res.mutu}</b> dan <b>kinerja ${res.kinerja.toLowerCase()}</b>. ${g.next ? `Untuk mencapai mutu ${g.next.m}, nilai IKM perlu meningkat sekitar ${nn(g.next.v - res.konversi, 2)} poin menjadi minimal ${nn(g.next.v, 2)}.` : 'Capaian ini telah berada pada kategori tertinggi.'}`) : ''}
      ${res.k ? P(`Tiga unsur dengan nilai tertinggi adalah ${high.map(u => `${esc(u.nama)} (${nn(u.konversi, 2)})`).join(', ')}, yang menjadi kekuatan pelayanan. Sebaliknya, tiga unsur dengan nilai terendah adalah ${low.map(u => `${esc(u.nama)} (${nn(u.konversi, 2)})`).join(', ')}; unsur-unsur ini menjadi prioritas perbaikan. ${low[0] ? `Unsur ${esc(low[0].nama)} mendapat penilaian negatif (nilai 1–2) dari ${nn(negPct(low[0]), 1)}% responden.` : ''}`) : ''}
      ${unRows.length > 1 ? P(`Antarunit layanan, IKM tertinggi dicapai ${esc(unRows[0].nama)} (${nn(unRows[0].r.konversi, 2)}) dan terendah ${esc(unRows[unRows.length - 1].nama)} (${nn(unRows[unRows.length - 1].r.konversi, 2)}), dengan rentang ${nn(unRows[0].r.konversi - unRows[unRows.length - 1].r.konversi, 2)} poin.`) : ''}
      ${tema.tema.length ? P(`Dari ${nn(saranAll.length)} saran tertulis, tema yang paling sering muncul adalah ${tema.tema.slice(0, 3).map(t => `${t.k.toLowerCase()} (${t.n} saran)`).join(', ')}.`) : ''}
      ${res.k ? P(`Rekomendasi utama: (1) ${esc((RTL[low[0].kode] || ['', 'perbaikan unsur ' + low[0].nama])[1])}; (2) ${esc((RTL[(low[1] || low[0]).kode] || ['', 'perbaikan unsur'])[1])}; dan (3) mempertahankan kekuatan pada unsur ${esc((high.find(u => u.kode !== 'U4') || high[0]).nama.toLowerCase())} melalui apresiasi dan standardisasi praktik baik.`.replace(/&lt;i&gt;|&lt;\/i&gt;/g, '')) : ''}`;

    /* ===== BAB I ===== */
    h += `<h2>BAB I<br>PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang</h3>
      ${P(`Pelayanan publik yang berkualitas merupakan hak setiap warga negara dan kewajiban penyelenggara negara. Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik beserta Peraturan Pemerintah Nomor 96 Tahun 2012 mewajibkan penyelenggara pelayanan untuk melibatkan masyarakat dalam menilai kinerja pelayanan secara berkala. Di bidang kesehatan, Undang-Undang Nomor 17 Tahun 2023 menegaskan bahwa pelayanan kesehatan harus diselenggarakan secara bermutu, aman, dan berorientasi pada pasien.`)}
      ${P(`Pusat Kesehatan Masyarakat (Puskesmas) dan rumah sakit merupakan garda terdepan sistem pelayanan kesehatan. Peraturan Menteri Kesehatan Nomor 19 Tahun 2024 menempatkan Puskesmas sebagai penyelenggara pelayanan kesehatan promotif, preventif, kuratif, rehabilitatif, dan paliatif di wilayah kerjanya, sementara Peraturan Menteri Kesehatan Nomor 30 Tahun 2022 menetapkan kepuasan pasien sebagai salah satu Indikator Nasional Mutu yang wajib diukur dan dilaporkan oleh fasilitas pelayanan kesehatan.`)}
      ${P(`Secara global, mutu pelayanan dipandang sebagai unsur yang tidak terpisahkan dari cakupan kesehatan semesta. Laporan bersama WHO, OECD, dan Bank Dunia (2018) menegaskan bahwa perluasan akses tanpa mutu yang memadai tidak akan menghasilkan perbaikan derajat kesehatan yang diharapkan. Kruk et al. (2018) bahkan menyimpulkan bahwa pelayanan bermutu rendah kini menjadi hambatan yang lebih besar bagi penurunan kematian yang dapat dicegah dibandingkan kurangnya akses, sehingga sistem kesehatan perlu mengukur mutu dari sudut pandang pengguna layanan.`)}
      ${P(`Kepuasan pasien merupakan salah satu ukuran hasil (<i>outcome</i>) dari mutu pelayanan (Donabedian, 1988). Pengalaman pasien yang positif juga berhubungan dengan keselamatan dan efektivitas klinis (Doyle et al., 2013), sehingga pengukuran kepuasan tidak hanya bermakna administratif tetapi juga mencerminkan mutu klinis. Atas dasar itu, ${esc(objek)} melaksanakan Survei Kepuasan Masyarakat (SKM) secara periodik dengan instrumen terstandar, dan hasilnya disajikan dalam laporan ini.`)}
      <h3>1.2 Dasar Hukum</h3>
      <ol><li>Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik;</li><li>Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi;</li><li>Undang-Undang Nomor 17 Tahun 2023 tentang Kesehatan;</li><li>Peraturan Pemerintah Nomor 96 Tahun 2012 tentang Pelaksanaan Undang-Undang Nomor 25 Tahun 2009 tentang Pelayanan Publik;</li><li>Peraturan Menteri PANRB Nomor 14 Tahun 2017 tentang Pedoman Penyusunan Survei Kepuasan Masyarakat Unit Penyelenggara Pelayanan Publik;</li><li>Peraturan Menteri Kesehatan Nomor 30 Tahun 2022 tentang Indikator Nasional Mutu Pelayanan Kesehatan;</li><li>Peraturan Menteri Kesehatan Nomor 19 Tahun 2024 tentang Penyelenggaraan Pusat Kesehatan Masyarakat.</li></ol>
      <h3>1.3 Maksud dan Tujuan</h3>
      ${P(`Survei ini dimaksudkan untuk memperoleh gambaran objektif tentang tingkat kepuasan masyarakat terhadap pelayanan di ${esc(objek)}. Secara khusus, survei bertujuan untuk: (a) mengukur nilai IKM dan mutu pelayanan; (b) mengidentifikasi kekuatan dan kelemahan pada setiap unsur pelayanan; (c) membandingkan capaian antarunit layanan dan antarwaktu; (d) menggali aspirasi masyarakat melalui saran tertulis; serta (e) merumuskan rencana tindak lanjut perbaikan yang terukur.`)}
      <h3>1.4 Manfaat</h3>
      ${P(`Bagi pimpinan, hasil survei menjadi dasar pengambilan keputusan dan penyusunan program peningkatan mutu. Bagi petugas, hasil survei menjadi umpan balik kinerja. Bagi masyarakat, publikasi hasil survei merupakan wujud transparansi dan akuntabilitas penyelenggara pelayanan publik.`)}
      <h3>1.5 Landasan Teori</h3>
      ${P(`<b>Konsep kepuasan.</b> Model diskonfirmasi harapan menjelaskan bahwa kepuasan terbentuk dari perbandingan antara harapan sebelum menerima layanan dan kinerja layanan yang dirasakan; kepuasan muncul bila kinerja memenuhi atau melampaui harapan (Oliver, 1980). Sitzia dan Wood (1997) mengingatkan bahwa kepuasan pasien merupakan konsep multidimensi yang dipengaruhi harapan, pengalaman sebelumnya, dan karakteristik individu, sehingga hasil survei kepuasan perlu ditafsirkan secara hati-hati.`)}
      ${P(`<b>Mutu pelayanan kesehatan.</b> Donabedian (1988) mengusulkan penilaian mutu melalui tiga komponen yang saling terkait, yaitu struktur (sumber daya, sarana, organisasi), proses (interaksi dan tindakan pelayanan), dan hasil (dampak pada status kesehatan dan kepuasan). Parasuraman et al. (1988) melalui kerangka SERVQUAL merumuskan lima dimensi mutu layanan, yakni <i>tangibles</i>, <i>reliability</i>, <i>responsiveness</i>, <i>assurance</i>, dan <i>empathy</i>, dengan mutu dipahami sebagai kesenjangan antara harapan dan persepsi pengguna.`)}
      ${P(`<b>Determinan kepuasan pasien.</b> Kajian sistematis atas studi tahun 1980–2014 menyimpulkan bahwa indikator mutu pelayanan merupakan determinan kepuasan yang paling berpengaruh, terutama mutu asuhan interpersonal petugas, disusul kompetensi profesional, lingkungan fisik, dan aksesibilitas; sementara pengaruh karakteristik sosiodemografi tidak konsisten antarstudi (Batbaatar et al., 2017). Meta-analisis Hall dan Dornan (1990) menunjukkan bahwa usia yang lebih tua cenderung berasosiasi dengan kepuasan yang sedikit lebih tinggi, dengan ukuran efek yang kecil. Mosadeghrad (2014) menambahkan bahwa mutu pelayanan dipengaruhi faktor pasien, petugas, organisasi, dan lingkungan secara bersamaan.`)}
      ${P(`<b>Keterkaitan dengan unsur SKM.</b> Sembilan unsur SKM dalam Peraturan Menteri PANRB Nomor 14 Tahun 2017 dapat dipetakan ke kerangka Donabedian dan SERVQUAL sebagaimana Tabel ${tno + 1}. Pemetaan ini membantu menafsirkan hasil survei sebagai cerminan mutu struktur, proses, dan hasil pelayanan.`)}
      ${T('Pemetaan unsur SKM terhadap kerangka mutu pelayanan')}
      <table><tr><th>Kode</th><th>Unsur SKM</th><th>Kerangka Donabedian / dimensi SERVQUAL</th></tr>
      ${Core.UNSUR.map(u => `<tr><td style="text-align:center">${u.kode}</td><td>${esc(u.nama)}</td><td>${esc(TEORI[u.kode].dims)}</td></tr>`).join('')}</table>`;

    /* ===== BAB II ===== */
    const modeTxt = Object.keys(modeCnt).length ? Object.entries(modeCnt).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${({ enumerator: 'wawancara oleh enumerator', responden: 'pengisian mandiri melalui tautan/QR code', kiosk: 'tablet kiosk di ruang tunggu', impor: 'impor data dari platform lain' })[k] || k} sebanyak ${nn(v)} responden (${pc(v, N)})`).join('; ') : '';
    h += `<h2>BAB II<br>PENGUMPULAN DATA SKM</h2>
      <h3>2.1 Pelaksana SKM</h3>
      ${P(`Survei dilaksanakan secara mandiri oleh ${esc(s.instansi || 'penyelenggara pelayanan')} melalui tim pelaksana SKM. Pengumpulan, validasi, pengolahan, dan pelaporan data dilakukan menggunakan aplikasi ${esc(s.app_nama || 'Survey Master')} yang terintegrasi dengan basis data daring sehingga proses berlangsung terdokumentasi dan dapat ditelusuri.`)}
      <h3>2.2 Desain dan Metode Pengumpulan Data</h3>
      ${P(`Survei menggunakan desain deskriptif kuantitatif dengan pendekatan potong lintang (<i>cross-sectional</i>). Data dikumpulkan menggunakan kuesioner ${form.tipe === 'standar' ? 'standar sesuai Peraturan Menteri PANRB Nomor 14 Tahun 2017' : 'yang disusun sesuai kebutuhan dan memuat unsur-unsur pelayanan'}. Kuesioner diisi melalui beberapa moda, yaitu ${modeTxt || (form.mode_input || []).join(', ')}. Penggunaan beberapa moda dimaksudkan untuk menjangkau responden dengan karakteristik yang beragam, termasuk responden lansia dan berpendidikan rendah yang dibantu oleh enumerator.`)}
      <h3>2.3 Instrumen</h3>
      ${P(`Instrumen terdiri atas bagian profil responden (umur, jenis kelamin, pendidikan, pekerjaan, dan jenis pembayaran), ${res.k} pertanyaan unsur pelayanan, serta pertanyaan terbuka untuk saran dan masukan. Setiap unsur dinilai dengan skala ordinal empat tingkat (1 = tidak baik, 2 = kurang baik, 3 = baik, 4 = sangat baik) tanpa pilihan netral, sehingga responden terdorong menyatakan kecenderungan penilaiannya.`)}
      <h3>2.4 Lokasi dan Waktu Pelaksanaan</h3>
      ${P(`Pengumpulan data dilaksanakan di ${fkRows.length > 1 ? `${fkRows.length} fasilitas pelayanan kesehatan, yaitu ${fkRows.map(f => esc(f.nama)).join('; ')}` : esc(objek)}${unRows.length ? `, meliputi ${unRows.length} unit layanan (${unRows.map(u => esc(u.nama)).join(', ')})` : ''}. Survei berlangsung pada periode ${esc(periodeTxt)}.`)}
      <h3>2.5 Populasi dan Sampel</h3>
      ${P(`Populasi survei adalah seluruh pengguna layanan pada periode survei${(m.populasi || form.populasi) ? `, yang diperkirakan sebanyak ${nn(m.populasi || form.populasi)} orang` : ''}. Penentuan sampel minimum mengacu pada Krejcie dan Morgan (1970) sebagaimana dirujuk dalam Peraturan Menteri PANRB Nomor 14 Tahun 2017, dengan rumus s = X²NP(1−P) / [d²(N−1) + X²P(1−P)], di mana X² = 3,841 (tingkat kepercayaan 95%), P = 0,5, dan d = 0,05. ${target ? `Dengan demikian, sampel minimum adalah ${nn(target)} responden, sedangkan realisasi sebanyak ${nn(N)} responden (${pc(N, target)}), sehingga ${N >= target ? 'jumlah sampel telah memenuhi syarat minimum.' : 'jumlah sampel belum memenuhi syarat minimum dan hasil perlu ditafsirkan dengan hati-hati.'}` : `Realisasi responden sebanyak ${nn(N)} orang.`} Responden dipilih secara aksidental, yaitu pengguna layanan yang telah selesai menerima pelayanan dan bersedia mengisi kuesioner.`)}
      <h3>2.6 Teknik Pengolahan dan Analisis Data</h3>
      ${P(`Nilai rata-rata (NRR) setiap unsur dihitung dengan membagi jumlah nilai dengan jumlah responden yang menjawab unsur tersebut. NRR tertimbang diperoleh dengan mengalikan NRR dengan bobot yang sama untuk setiap unsur, yaitu 1/${res.k || 9} = ${nn(res.bobot || 1 / 9, 3)}. Indeks Kepuasan Masyarakat merupakan jumlah NRR tertimbang, kemudian dikonversi ke skala 25–100 dengan mengalikannya dengan 25. Mutu dan kinerja pelayanan ditetapkan berdasarkan interval nilai pada Tabel ${tno + 1}. Selain itu, dilakukan analisis deskriptif distribusi frekuensi (n dan %), perbandingan antarunit dan antarwaktu, analisis kesenjangan terhadap ambang mutu A, serta analisis tematik terhadap saran tertulis.`)}
      ${T('Nilai persepsi, interval, interval konversi, mutu, dan kinerja pelayanan (PermenPAN-RB 14/2017)')}
      <table><tr><th>Nilai Persepsi</th><th>Nilai Interval (NI)</th><th>Nilai Interval Konversi (NIK)</th><th>Mutu</th><th>Kinerja</th></tr>
      <tr><td style="text-align:center">1</td><td style="text-align:center">1,00 – 2,5996</td><td style="text-align:center">25,00 – 64,99</td><td style="text-align:center">D</td><td>Tidak Baik</td></tr>
      <tr><td style="text-align:center">2</td><td style="text-align:center">2,60 – 3,064</td><td style="text-align:center">65,00 – 76,60</td><td style="text-align:center">C</td><td>Kurang Baik</td></tr>
      <tr><td style="text-align:center">3</td><td style="text-align:center">3,0644 – 3,532</td><td style="text-align:center">76,61 – 88,30</td><td style="text-align:center">B</td><td>Baik</td></tr>
      <tr><td style="text-align:center">4</td><td style="text-align:center">3,5324 – 4,00</td><td style="text-align:center">88,31 – 100,00</td><td style="text-align:center">A</td><td>Sangat Baik</td></tr></table>
      <h3>2.7 Etika dan Pelindungan Data</h3>
      ${P(`Partisipasi responden bersifat sukarela dan didahului pernyataan persetujuan. Survei tidak mengumpulkan nama responden, dan data diolah secara agregat sesuai prinsip Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi. Data yang dipublikasikan hanya berupa ringkasan statistik yang tidak memungkinkan identifikasi individu.`)}`;

    /* ===== BAB III ===== */
    h += `<h2>BAB III<br>HASIL PENGOLAHAN DATA SKM</h2>
      <h3>3.1 Gambaran Umum Responden</h3>
      ${P(`Jumlah responden yang datanya diolah adalah ${nn(N)} orang. ${unRows.length ? `Distribusi responden menurut unit layanan disajikan pada Tabel ${tno + 1}. Unit dengan responden terbanyak adalah ${esc(unRows.slice().sort((a, b) => b.r.n - a.r.n)[0].nama)} (${nn(unRows.slice().sort((a, b) => b.r.n - a.r.n)[0].r.n)} responden; ${pc(unRows.slice().sort((a, b) => b.r.n - a.r.n)[0].r.n, N)}), yang mencerminkan unit dengan volume kunjungan terbesar.` : ''}`)}
      ${unRows.length ? T('Distribusi responden menurut unit layanan') + `<table><tr><th>No</th><th>Unit Layanan</th>${fkRows.length > 1 ? '<th>Fasilitas</th>' : ''}<th>n</th><th>%</th></tr>
        ${unRows.slice().sort((a, b) => b.r.n - a.r.n).map((u, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.nama)}</td>${fkRows.length > 1 ? `<td>${esc(u.fk)}</td>` : ''}<td style="text-align:center">${nn(u.r.n)}</td><td style="text-align:center">${pc(u.r.n, N)}</td></tr>`).join('')}
        <tr><th colspan="${fkRows.length > 1 ? 3 : 2}">Jumlah</th><th>${nn(N)}</th><th>100%</th></tr></table>` : ''}
      <h3>3.2 Profil Responden</h3>
      ${profilQ.map(q => {
        const d = Dash.distrib(q, agg.all); const t = d.reduce((a, b) => a + b.n, 0) || 1; const sd = d.slice().sort((a, b) => b.n - a.n);
        const txt = P(`Berdasarkan ${esc(q.label.toLowerCase())}, responden terbanyak adalah kategori <b>${esc(sd[0].l)}</b> (${nn(sd[0].n)} orang; ${pc(sd[0].n, t)})${sd[1] ? `, diikuti ${esc(sd[1].l)} (${nn(sd[1].n)}; ${pc(sd[1].n, t)})` : ''}${sd[2] && sd[2].n ? ` dan ${esc(sd[2].l)} (${nn(sd[2].n)}; ${pc(sd[2].n, t)})` : ''}. Rincian disajikan pada Tabel ${tno + 1} dan Gambar ${gno + 1}.`);
        return txt + T('Profil responden berdasarkan ' + esc(q.label.toLowerCase())) + `<table><tr><th style="width:8%">No</th><th>${esc(q.label)}</th><th style="width:18%">n</th><th style="width:18%">%</th></tr>
          ${d.map((x, j) => `<tr><td style="text-align:center">${j + 1}</td><td>${esc(x.l)}</td><td style="text-align:center">${nn(x.n)}</td><td style="text-align:center">${pc(x.n, t)}</td></tr>`).join('')}
          <tr><th colspan="2">Jumlah</th><th>${nn(t)}</th><th>100%</th></tr></table>${F('img_p_' + q.id, 'Profil responden berdasarkan ' + q.label.toLowerCase() + ' (n dan %)')}`;
      }).join('')}
      ${Object.keys(agg.umur || {}).length ? (() => {
        const order = ['< 20', '20–29', '30–39', '40–49', '50–59', '≥ 60'].filter(k => agg.umur[k]); const t = order.reduce((a, k) => a + agg.umur[k], 0) || 1; const top = order.slice().sort((a, b) => agg.umur[b] - agg.umur[a])[0];
        return P(`Menurut kelompok umur, responden terbanyak berada pada kelompok <b>${esc(top)} tahun</b> (${nn(agg.umur[top])} orang; ${pc(agg.umur[top], t)}). Responden berusia 60 tahun ke atas berjumlah ${nn(agg.umur['≥ 60'] || 0)} orang (${pc(agg.umur['≥ 60'] || 0, t)}), kelompok yang memerlukan perhatian khusus dalam desain alur dan sarana pelayanan.`) +
          T('Profil responden berdasarkan kelompok umur') + `<table><tr><th style="width:8%">No</th><th>Kelompok umur (tahun)</th><th style="width:18%">n</th><th style="width:18%">%</th></tr>
          ${order.map((k, j) => `<tr><td style="text-align:center">${j + 1}</td><td>${esc(k)}</td><td style="text-align:center">${nn(agg.umur[k])}</td><td style="text-align:center">${pc(agg.umur[k], t)}</td></tr>`).join('')}
          <tr><th colspan="2">Jumlah</th><th>${nn(t)}</th><th>100%</th></tr></table>${F('img_umur', 'Profil responden berdasarkan kelompok umur (n dan %)')}`;
      })() : ''}
      ${res.k ? `<h3>3.3 Indeks Kepuasan Masyarakat per Unsur</h3>
      ${P(`Hasil perhitungan NRR, NRR tertimbang, dan nilai konversi setiap unsur disajikan pada Tabel ${tno + 1} dan Gambar ${gno + 1}. Secara keseluruhan, nilai IKM ${esc(objek)} adalah <b>${nn(res.konversi, 2)}</b> dengan mutu <b>${res.mutu}</b> (${res.kinerja.toLowerCase()}). Dari ${res.k} unsur, ${res.unsur.filter(u => u.mutu === 'A').length} unsur bermutu A, ${res.unsur.filter(u => u.mutu === 'B').length} unsur bermutu B, ${res.unsur.filter(u => u.mutu === 'C').length} unsur bermutu C, dan ${res.unsur.filter(u => u.mutu === 'D').length} unsur bermutu D.`)}
      ${T('Nilai rata-rata, nilai tertimbang, dan mutu per unsur pelayanan')}
      <table><tr><th>No</th><th>Unsur Pelayanan</th><th>n</th><th>NRR</th><th>NRR Tertimbang</th><th>Konversi</th><th>Mutu</th><th>Kinerja</th></tr>
      ${res.unsur.map((u, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.kode)} ${esc(u.nama)}</td><td style="text-align:center">${nn(u.n)}</td><td style="text-align:center">${nn(u.nrr, 3)}</td><td style="text-align:center">${nn(u.tertimbang, 3)}</td><td style="text-align:center">${nn(u.konversi, 2)}</td><td style="text-align:center">${u.mutu}</td><td>${u.kinerja}</td></tr>`).join('')}
      <tr><th colspan="4">IKM</th><th>${nn(res.ikm, 3)}</th><th>${nn(res.konversi, 2)}</th><th>${res.mutu}</th><th>${res.kinerja}</th></tr></table>
      ${F('img_unsur', 'Nilai rata-rata (NRR), nilai konversi, dan jumlah responden (n) per unsur pelayanan')}
      <h3>3.4 Sebaran Penilaian per Unsur</h3>
      ${P(`Untuk melengkapi nilai rata-rata, Tabel ${tno + 1} dan Gambar ${gno + 1} menyajikan jumlah dan persentase responden pada setiap nilai. Proporsi penilaian positif (nilai 3–4) dan negatif (nilai 1–2) memberikan gambaran yang lebih rinci daripada rata-rata, karena dua unsur dengan NRR serupa dapat memiliki pola sebaran yang berbeda.`)}
      ${T('Sebaran jawaban responden per unsur (n dan %)')}
      <table><tr><th>Unsur</th><th>Nilai 1</th><th>Nilai 2</th><th>Nilai 3</th><th>Nilai 4</th><th>Positif (3–4)</th><th>Negatif (1–2)</th></tr>
      ${res.unsur.map(u => `<tr><td>${esc(u.kode)} ${esc(u.nama)}</td>${[1, 2, 3, 4].map(k => `<td style="text-align:center">${nn(u.c[String(k)] || 0)}<br><span style="font-size:9.5pt">(${pc(u.c[String(k)] || 0, u.n)})</span></td>`).join('')}<td style="text-align:center"><b>${nn(posPct(u), 1)}%</b></td><td style="text-align:center">${nn(negPct(u), 1)}%</td></tr>`).join('')}</table>
      ${F('img_sebaran', 'Sebaran jawaban per unsur pelayanan (n dan %)')}
      ${res.unsur.map(u => P(`<b>${esc(u.kode)} ${esc(u.nama)}.</b> Unsur ini memperoleh NRR ${nn(u.nrr, 3)} (konversi ${nn(u.konversi, 2)}; mutu ${u.mutu}, ${u.kinerja.toLowerCase()}). Sebanyak ${nn(posPct(u), 1)}% responden memberikan penilaian positif, termasuk ${pc(u.c['4'] || 0, u.n)} yang memberi nilai tertinggi, sedangkan ${nn(negPct(u), 1)}% memberikan penilaian negatif. ${u.nrr >= res.ikm ? `Nilai unsur ini berada di atas rata-rata indeks keseluruhan (${nn(res.ikm, 3)}).` : `Nilai unsur ini berada di bawah rata-rata indeks keseluruhan (${nn(res.ikm, 3)}) sehingga berkontribusi menurunkan IKM.`}`)).join('')}` : ''}
      ${fkRows.length > 1 ? `<h3>3.5 IKM per Fasilitas</h3>${P(`Perbandingan IKM antarfasilitas disajikan pada Tabel ${tno + 1}. IKM tertinggi dicapai ${esc(fkRows[0].nama)} (${nn(fkRows[0].r.konversi, 2)}) dan terendah ${esc(fkRows[fkRows.length - 1].nama)} (${nn(fkRows[fkRows.length - 1].r.konversi, 2)}).`)}
        ${T('IKM per fasilitas pelayanan kesehatan')}<table><tr><th>No</th><th>Fasilitas</th><th>n</th><th>%</th><th>IKM</th><th>Mutu</th></tr>${fkRows.map((f, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(f.nama)}</td><td style="text-align:center">${nn(f.r.n)}</td><td style="text-align:center">${pc(f.r.n, N)}</td><td style="text-align:center">${nn(f.r.konversi, 2)}</td><td style="text-align:center">${f.r.mutu}</td></tr>`).join('')}</table>${F('img_fk', 'Perbandingan IKM antarfasilitas')}` : ''}
      ${unRows.length > 1 && res.k ? `<h3>3.${fkRows.length > 1 ? 6 : 5} IKM per Unit Layanan</h3>
        ${P(`Tabel ${tno + 1} menyajikan IKM setiap unit layanan beserta unsur dengan nilai terendah di unit tersebut. Informasi ini membantu menentukan unit yang memerlukan pendampingan dan jenis intervensi yang paling relevan.`)}
        ${T('IKM per unit layanan dan unsur terendah di setiap unit')}<table><tr><th>No</th><th>Unit</th><th>n</th><th>IKM</th><th>Mutu</th><th>Unsur terendah (NRR)</th></tr>
        ${unRows.map((u, i) => { const lo = u.r.unsur.filter(x => x.n).sort((a, b) => a.nrr - b.nrr)[0]; return `<tr><td style="text-align:center">${i + 1}</td><td>${esc(u.nama)}</td><td style="text-align:center">${nn(u.r.n)}</td><td style="text-align:center">${nn(u.r.konversi, 2)}</td><td style="text-align:center">${u.r.mutu}</td><td>${lo ? esc(lo.nama) + ' (' + nn(lo.nrr, 2) + ')' : '-'}</td></tr>`; }).join('')}</table>
        ${F('img_unit', 'IKM per unit layanan')}` : ''}
      ${monthly.length > 1 && res.k ? `<h3>3.${(fkRows.length > 1 ? 6 : 5) + (unRows.length > 1 ? 1 : 0)} Kecenderungan Antarwaktu</h3>
        ${(() => { const ms = monthly.map(x => ({ l: x.label, n: x.agg.total, r: Core.ikm(form, x.agg.all) })); const first = ms[0], last = ms[ms.length - 1]; const hi = ms.slice().sort((a, b) => b.r.konversi - a.r.konversi)[0], lo = ms.slice().sort((a, b) => a.r.konversi - b.r.konversi)[0]; const diff = last.r.konversi - first.r.konversi;
          return P(`Perkembangan IKM per bulan disajikan pada Tabel ${tno + 1} dan Gambar ${gno + 1}. IKM bergerak dari ${nn(first.r.konversi, 2)} pada ${esc(first.l)} menjadi ${nn(last.r.konversi, 2)} pada ${esc(last.l)}, atau ${diff >= 0 ? 'meningkat' : 'menurun'} ${nn(Math.abs(diff), 2)} poin. Nilai tertinggi tercatat pada ${esc(hi.l)} (${nn(hi.r.konversi, 2)}) dan terendah pada ${esc(lo.l)} (${nn(lo.r.konversi, 2)}). ${Math.abs(diff) < 1 ? 'Perubahan yang kecil menunjukkan kinerja relatif stabil sepanjang periode.' : diff > 0 ? 'Kecenderungan meningkat ini perlu dipertahankan dan ditelaah faktor pendorongnya.' : 'Kecenderungan menurun ini perlu segera ditelusuri penyebabnya.'} Jumlah responden per bulan yang berbeda perlu diperhatikan saat menafsirkan perubahan.`) +
            T('IKM dan jumlah responden per bulan') + `<table><tr><th>Bulan</th><th>n</th><th>%</th><th>IKM</th><th>Mutu</th></tr>${ms.map(x => `<tr><td>${esc(x.l)}</td><td style="text-align:center">${nn(x.n)}</td><td style="text-align:center">${pc(x.n, N)}</td><td style="text-align:center">${nn(x.r.konversi, 2)}</td><td style="text-align:center">${x.r.mutu}</td></tr>`).join('')}</table>${F('img_bulan', 'Kecenderungan IKM dan jumlah responden per bulan')}`; })()}` : ''}`;

    /* ===== BAB IV ===== */
    const gapRows = res.unsur.map(u => ({ u, gapA: Math.max(0, 3.5324 - u.nrr), gapAvg: u.nrr - res.ikm })).sort((a, b) => b.gapA - a.gapA);
    h += `<h2>BAB IV<br>ANALISIS DAN PEMBAHASAN</h2>
      ${res.k ? `<h3>4.1 Posisi Capaian Kinerja Pelayanan</h3>
      ${P(`Nilai IKM ${nn(res.konversi, 2)} menempatkan pelayanan ${esc(objek)} pada mutu ${res.mutu} (${res.kinerja.toLowerCase()}). ${g.next ? `Selisih terhadap ambang mutu ${g.next.m} (${nn(g.next.v, 2)}) adalah ${nn(g.next.v - res.konversi, 2)} poin.` : ''} Perlu dicatat bahwa survei kepuasan cenderung menghasilkan penilaian positif yang tinggi karena faktor kesungkanan, rasa terima kasih, dan rendahnya harapan sebagian pengguna (Sitzia &amp; Wood, 1997). Oleh karena itu, perhatian utama sebaiknya diarahkan pada unsur dengan proporsi penilaian negatif yang relatif besar, bukan hanya pada angka rata-rata.`)}
      ${P(`Bleich et al. (2009) juga menunjukkan bahwa kepuasan terhadap layanan kesehatan hanya sebagian dijelaskan oleh pengalaman pelayanan, sedangkan sebagian lain dipengaruhi faktor di luar layanan seperti harapan dan karakteristik individu. Dengan demikian, IKM paling tepat dimanfaatkan sebagai alat pemantauan kecenderungan dan penentuan prioritas perbaikan, serta perlu dilengkapi indikator mutu lain sebagaimana diatur dalam Peraturan Menteri Kesehatan Nomor 30 Tahun 2022.`)}
      <h3>4.2 Analisis Kesenjangan dan Prioritas Perbaikan</h3>
      ${P(`Analisis kesenjangan membandingkan NRR setiap unsur dengan ambang mutu A (3,5324) dan dengan rata-rata indeks keseluruhan. Unsur dengan kesenjangan terbesar dan berada di bawah rata-rata ditetapkan sebagai prioritas utama (Tabel ${tno + 1}).`)}
      ${T('Analisis kesenjangan unsur pelayanan terhadap ambang mutu A')}
      <table><tr><th>Prioritas</th><th>Unsur</th><th>NRR</th><th>Kesenjangan ke mutu A</th><th>Selisih dari rata-rata</th><th>Kategori</th></tr>
      ${gapRows.map((x, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(x.u.kode)} ${esc(x.u.nama)}</td><td style="text-align:center">${nn(x.u.nrr, 3)}</td><td style="text-align:center">${x.gapA ? nn(x.gapA, 3) : '—'}</td><td style="text-align:center">${x.gapAvg >= 0 ? '+' : ''}${nn(x.gapAvg, 3)}</td><td>${x.gapA === 0 ? 'Pertahankan' : x.gapAvg < 0 ? 'Prioritas perbaikan' : 'Tingkatkan'}</td></tr>`).join('')}</table>
      <h3>4.3 Pembahasan Unsur yang Perlu Diperbaiki</h3>
      ${low.map(u => P(`<b>${esc(u.nama)} (NRR ${nn(u.nrr, 3)}; ${nn(negPct(u), 1)}% penilaian negatif).</b> ${TEORI[u.kode] ? TEORI[u.kode].pembahasan : ''} ${(() => { const t = tema.tema.find(t => (u.kode === 'U3' && /waktu/i.test(t.k)) || (u.kode === 'U9' && /(sarana|kebersihan)/i.test(t.k)) || (u.kode === 'U8' && /pengaduan/i.test(t.k)) || (u.kode === 'U2' && /informasi/i.test(t.k))); return t ? `Temuan ini sejalan dengan saran responden, di mana tema ${t.k.toLowerCase()} muncul dalam ${t.n} saran, misalnya: “${esc(t.contoh[0])}”.` : ''; })()} ${(() => { const us = unRows.map(x => ({ nama: x.nama, v: (x.r.unsur.find(y => y.kode === u.kode) || {}).nrr || 0, n: (x.r.unsur.find(y => y.kode === u.kode) || {}).n || 0 })).filter(x => x.n >= 10).sort((a, b) => a.v - b.v); return us.length > 1 ? `Pada tingkat unit, nilai terendah untuk unsur ini terdapat di ${esc(us[0].nama)} (NRR ${nn(us[0].v, 2)}) dan tertinggi di ${esc(us[us.length - 1].nama)} (NRR ${nn(us[us.length - 1].v, 2)}), sehingga praktik di unit terbaik dapat dijadikan rujukan pembelajaran.` : ''; })()}`)).join('')}
      <h3>4.4 Pembahasan Kekuatan Pelayanan</h3>
      ${high.map(u => P(`<b>${esc(u.nama)} (NRR ${nn(u.nrr, 3)}; ${nn(posPct(u), 1)}% penilaian positif).</b> ${TEORI[u.kode] ? TEORI[u.kode].pembahasan : ''} ${u.kode === 'U4' && jknPct !== null ? `Tingginya nilai unsur ini konsisten dengan profil pembiayaan responden, di mana ${nn(jknPct, 1)}% responden menggunakan BPJS Kesehatan atau jaminan pemerintah daerah.` : ''}`)).join('')}
      ${unRows.length > 1 ? `<h3>4.5 Analisis Antarunit Layanan</h3>
      ${P(`Rentang IKM antarunit sebesar ${nn(unRows[0].r.konversi - unRows[unRows.length - 1].r.konversi, 2)} poin menunjukkan ${unRows[0].r.konversi - unRows[unRows.length - 1].r.konversi < 3 ? 'variasi yang relatif kecil, yang mengindikasikan standar pelayanan yang cukup seragam' : 'variasi yang cukup berarti antarunit, sehingga intervensi perlu disesuaikan dengan kondisi masing-masing unit'}. Unit dengan IKM di bawah nilai keseluruhan adalah ${unRows.filter(x => x.r.konversi < res.konversi).map(x => `${esc(x.nama)} (${nn(x.r.konversi, 2)})`).join(', ') || 'tidak ada'}. Mosadeghrad (2014) menekankan bahwa mutu pelayanan dipengaruhi faktor organisasi dan lingkungan kerja; karena itu, perbedaan antarunit perlu ditelaah dari aspek beban kerja, jumlah petugas, alur, dan sarana di unit tersebut.`)}` : ''}
      <h3>4.${unRows.length > 1 ? 6 : 5} Analisis Saran dan Masukan Responden</h3>
      ${saranAll.length ? P(`Sebanyak ${nn(saranAll.length)} responden (${pc(saranAll.length, N)}) menuliskan saran atau masukan. Saran dikelompokkan secara tematik menggunakan kata kunci; satu saran dapat masuk ke lebih dari satu tema. Hasil pengelompokan disajikan pada Tabel ${tno + 1}.`) + T('Tema saran dan masukan responden') +
        `<table><tr><th>No</th><th>Tema</th><th>n</th><th>%</th><th>Contoh saran</th></tr>${tema.tema.map((t, i) => `<tr><td style="text-align:center">${i + 1}</td><td>${esc(t.k)}</td><td style="text-align:center">${t.n}</td><td style="text-align:center">${pc(t.n, saranAll.length)}</td><td style="font-size:10pt">${t.contoh.map(c => '“' + esc(c) + '”').join('<br>')}</td></tr>`).join('')}${tema.lain ? `<tr><td></td><td>Lainnya</td><td style="text-align:center">${tema.lain}</td><td style="text-align:center">${pc(tema.lain, saranAll.length)}</td><td></td></tr>` : ''}</table>` +
        P(`Tema yang paling dominan adalah ${tema.tema.slice(0, 2).map(t => t.k.toLowerCase()).join(' dan ')}. Saran yang bersifat apresiatif menunjukkan bahwa aspek interpersonal petugas dirasakan baik oleh sebagian responden, sejalan dengan temuan bahwa asuhan interpersonal merupakan determinan penting kepuasan (Batbaatar et al., 2017). Sementara itu, keluhan umumnya berkaitan dengan aspek struktur dan proses, seperti waktu tunggu dan kondisi sarana, yang dapat diperbaiki melalui perbaikan sistem dan bukan semata-mata perubahan perilaku petugas.`) : P('Tidak terdapat saran tertulis dari responden pada periode ini.')}
      <h3>4.${unRows.length > 1 ? 7 : 6} Rencana Tindak Lanjut</h3>
      ${P(`Berdasarkan analisis kesenjangan, pembahasan, dan saran responden, rencana tindak lanjut disusun dengan indikator dan target yang terukur sebagaimana Tabel ${tno + 1}. Rencana ini perlu dipantau melalui siklus <i>Plan–Do–Check–Act</i> dan dievaluasi kembali pada survei periode berikutnya.`)}
      ${T('Rencana tindak lanjut perbaikan pelayanan')}
      <table><tr><th>No</th><th>Unsur (NRR)</th><th>Permasalahan</th><th>Program/Kegiatan</th><th>Indikator</th><th>Target</th><th>Waktu</th><th>Penanggung Jawab</th></tr>
      ${gapRows.filter(x => x.gapAvg < 0 || x.u.mutu === 'C' || x.u.mutu === 'D').slice(0, 5).concat(gapRows.filter(x => x.gapAvg < 0).length ? [] : gapRows.slice(0, 3)).map((x, i) => { const r = RTL[x.u.kode] || ['—', 'Evaluasi dan perbaikan unsur ' + x.u.nama, 'NRR unsur', '≥ 3,30']; return `<tr><td style="text-align:center">${i + 1}</td><td>${esc(x.u.nama)} (${nn(x.u.nrr, 2)})</td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td style="text-align:center">${r[3]}</td><td>Triwulan berikutnya</td><td>${esc(fkSingle ? 'Kepala ' + fkSingle.nama : 'Kepala Fasyankes')} &amp; Tim Mutu</td></tr>`; }).join('')}</table>
      <h3>4.${unRows.length > 1 ? 8 : 7} Keterbatasan</h3>
      ${P(`Hasil survei ini perlu ditafsirkan dengan mempertimbangkan beberapa keterbatasan. Pertama, desain potong lintang hanya menggambarkan kondisi pada periode survei dan tidak dapat menjelaskan hubungan sebab-akibat. Kedua, pemilihan responden secara aksidental berpotensi menimbulkan bias seleksi. Ketiga, penilaian bersifat laporan diri sehingga dapat dipengaruhi bias keinginan sosial (<i>social desirability</i>), terutama pada pengisian yang didampingi petugas (Sitzia &amp; Wood, 1997). Keempat, skala empat tingkat cenderung menghasilkan efek langit-langit sehingga perbedaan kecil antarunit perlu ditafsirkan secara hati-hati. Kelima, karakteristik sosiodemografi responden dapat memengaruhi penilaian (Hall &amp; Dornan, 1990), sehingga perbandingan antarunit dengan komposisi responden yang berbeda perlu memperhatikan faktor tersebut.`)}` : P('Instrumen ini tidak memuat unsur IKM sehingga analisis indeks tidak dilakukan.')}`;

    /* ===== BAB V ===== */
    h += `<h2>BAB V<br>KESIMPULAN DAN REKOMENDASI</h2>
      <h3>5.1 Kesimpulan</h3>
      <ol>
        <li>Survei Kepuasan Masyarakat ${esc(objek)} periode ${esc(periodeTxt)} melibatkan ${nn(N)} responden${target ? ` (${pc(N, target)} dari sampel minimum ${nn(target)})` : ''}, sehingga ${!target || N >= target ? 'jumlah sampel memadai untuk menggambarkan kepuasan pengguna layanan' : 'jumlah sampel belum mencapai syarat minimum'}.</li>
        ${res.k ? `<li>Nilai IKM sebesar <b>${nn(res.konversi, 2)}</b> dengan mutu pelayanan <b>${res.mutu}</b> (${res.kinerja.toLowerCase()}).${g.next ? ` Diperlukan peningkatan sekitar ${nn(g.next.v - res.konversi, 2)} poin untuk mencapai mutu ${g.next.m}.` : ''}</li>
        <li>Unsur dengan nilai tertinggi adalah ${high.map(u => esc(u.nama)).join(', ')}, yang mencerminkan kekuatan pada aspek ${high.some(u => u.kode === 'U7' || u.kode === 'U6') ? 'interpersonal dan kompetensi petugas' : 'pelayanan tersebut'}.</li>
        <li>Unsur dengan nilai terendah adalah ${low.map(u => `${esc(u.nama)} (${nn(u.konversi, 2)})`).join(', ')}, yang terutama berkaitan dengan aspek ${low.some(u => ['U3', 'U2', 'U8'].includes(u.kode)) ? 'proses pelayanan' : ''}${low.some(u => ['U3', 'U2', 'U8'].includes(u.kode)) && low.some(u => ['U9', 'U1'].includes(u.kode)) ? ' dan ' : ''}${low.some(u => ['U9', 'U1'].includes(u.kode)) ? 'struktur atau sarana' : ''}.</li>` : ''}
        ${unRows.length > 1 && res.k ? `<li>IKM antarunit berkisar antara ${nn(unRows[unRows.length - 1].r.konversi, 2)} (${esc(unRows[unRows.length - 1].nama)}) dan ${nn(unRows[0].r.konversi, 2)} (${esc(unRows[0].nama)}).</li>` : ''}
        ${tema.tema.length ? `<li>Saran responden didominasi tema ${tema.tema.slice(0, 3).map(t => t.k.toLowerCase()).join(', ')}.</li>` : ''}
      </ol>
      <h3>5.2 Rekomendasi</h3>
      ${P(`<b>Jangka pendek (≤ 3 bulan):</b> ${res.k ? low.slice(0, 2).map(u => (RTL[u.kode] || ['', ''])[1]).join('; ') : 'menindaklanjuti saran responden'}; serta mempublikasikan hasil SKM dan rencana tindak lanjut kepada masyarakat melalui papan informasi dan media daring.`)}
      ${P(`<b>Jangka menengah (3–12 bulan):</b> mengintegrasikan hasil SKM ke dalam siklus peningkatan mutu dan Indikator Nasional Mutu (Peraturan Menteri Kesehatan Nomor 30 Tahun 2022); melaksanakan survei per unit secara berkala untuk memantau dampak intervensi; serta memperkuat mekanisme pengaduan yang terlihat dan responsif.`)}
      ${P(`<b>Penguatan metodologi:</b> menambahkan pertanyaan pengalaman pasien yang spesifik (misalnya lama waktu tunggu aktual dan lama konsultasi) agar penyebab ketidakpuasan dapat diukur lebih objektif, mengingat waktu konsultasi merupakan prediktor kepuasan yang kuat (Anderson et al., 2007).`)}
      ${H.ttd}`;

    /* ===== DAFTAR PUSTAKA ===== */
    h += `<h2>DAFTAR PUSTAKA</h2>${ORDER.map(k => `<p class="ni" style="padding-left:1.0cm;text-indent:-1.0cm;text-align:left">${REF[k]}</p>`).join('')}`;

    /* ===== LAMPIRAN ===== */
    h += `<h2>LAMPIRAN</h2><h3>Lampiran 1. Daftar Pertanyaan Kuesioner</h3><ol>${form.pertanyaan.filter(q => !Core.NON_INPUT[q.tipe]).map(q => `<li>${esc(q.label)}${q.opsi ? ' <i>(' + q.opsi.map(o => esc(o.v) + ' = ' + esc(o.l)).join('; ') + ')</i>' : ''}</li>`).join('')}</ol>
      ${saranAll.length ? `<h3>Lampiran 2. Daftar Saran Responden</h3><ol>${saranAll.slice(0, 200).map(x => `<li>${esc(x.t)}${x.u ? ` <i>(${esc(uName(x.u))})</i>` : ''}</li>`).join('')}</ol>` : ''}`;

    return { html: h, res, fkRows, unRows };
  }

  return { build, REF };
})();
