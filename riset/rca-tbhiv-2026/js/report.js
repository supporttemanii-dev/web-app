/* RCA TB-HIV 2026 · Dashboard Laporan
 * Disusun menurut pertanyaan evaluasi Protokol V13 (Q1–Q6), ranah R1–R6, 14 CP, dan keluaran D3/WP7.
 * Satu model laporan → tampilan HTML, Excel (satu lembar per tabel), dan PDF (jsPDF + autotable).
 */
(function () {
  'use strict';
  const RCA = window.RCA, h = RCA.h, S = RCA.S;
  const R = RCA.report = {};
  const D_ = RCA.calc.D, days = RCA.calc.days, has = RCA.calc.has;
  const pct = (n, N) => N ? Math.round(n / N * 1000) / 10 : null;
  const nN = (n, N) => N ? n + '/' + N + ' (' + pct(n, N) + '%)' : '–';
  const q = (a, p) => { const x = a.filter(v => v !== '' && v !== null && !isNaN(v)).map(Number).sort((m, n) => m - n); if (!x.length) return null; const i = (x.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return Math.round((x[lo] + (x[hi] - x[lo]) * (i - lo)) * 10) / 10; };
  const medIqr = a => { const n = a.filter(v => v !== '' && v !== null && !isNaN(v)).length; return n ? [q(a, .5), q(a, .25) + '–' + q(a, .75), n] : ['–', '–', 0]; };
  const CP_INFO = {}; (S.forms.C4.sub[0].sections.find(s => s.id === 'matriks_cp') || { rows: [] }).rows.forEach(r => { CP_INFO[r.k] = { fokus: r.l.replace(/^\S+\s/, ''), ranah: (r.v || {}).ro_C || '' }; });
  const PROV = () => RCA.state.regions.prov;
  const STAT = ['Belum', 'Draf', 'Dikirim', 'Dikembalikan', 'Valid'];

  /* ================================================================ model */
  function build(D, U, f) {
    const inProv = r => !f.prov || r.prov === f.prov || (r.kk && RCA.reg.kk(r.kk).prov === f.prov);
    const V = {}; ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].forEach(fm => { V[fm] = {}; Object.keys(D[fm] || {}).forEach(s => { V[fm][s] = (D[fm][s] || []).filter(inProv); }); });
    const units = {}; Object.keys(U).forEach(fm => { units[fm] = (U[fm] || []).filter(inProv); });
    const c2 = D.C2 || {}; const sel = (c2.selected || []).filter(inProv);
    const A = (V.C3.C3A || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const B = (V.C3.C3B || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const C = (V.C3.C3CP3 || []).map(r => Object.assign({ _fac: r.fac, _kk: r.kk, _prov: r.prov }, r.data));
    const facs = RCA.state.regions.fac.filter(x => !f.prov || RCA.reg.kk(x.kk).prov === f.prov);
    const rk = RCA.c3Rekap(A, B, C);
    const sections = [];
    const sec = (id, title, intro) => { const s = { id, title, intro, blocks: [] }; sections.push(s); return s; };
    const T = (s, id, title, head, rows, note) => { s.blocks.push({ type: 'table', id, title, head, rows: rows.length ? rows : [head.map((x, i) => i ? '' : 'Belum ada data Valid')], note }); };
    const P = (s, text) => s.blocks.push({ type: 'p', text });
    const L = (s, items) => s.blocks.push({ type: 'list', items });
    // interpretasi dwibahasa dan grafik
    const I = (s, id, en, kind) => { if (id) s.blocks.push({ type: 'interp', id, en: en || id, kind: kind || 'interp' }); };
    const G = (s, o) => s.blocks.push(Object.assign({ type: 'chart' }, o));
    const E = x => (RCA.reportEN && RCA.reportEN.fixed(x)) || x;
    const pr = (n, N) => N ? Math.round(n / N * 1000) / 10 : 0;
    const fmt = (n, N) => N ? n + '/' + N + ' (' + pct(n, N) + '%)' : '0/0';
    const KEY = [];   // pesan kunci untuk ringkasan eksekutif
    const caution = N => N < 10 ? [' Jumlah unit masih kecil (N = ' + N + '), sehingga angka ini bersifat indikatif.', ' The number of units is still small (N = ' + N + '), so this figure is indicative.'] : ['', ''];
    const joinId = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' dan ' + a[a.length - 1];
    const joinEn = a => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
    const lc = t => /^[A-Z][A-Z]/.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
    const Hd = (s, id, en) => s.blocks.push({ type: 'h', id, en });          // subjudul dwibahasa
    const Pp = (s, id, en) => I(s, id, en, 'para');                           // paragraf naratif dwibahasa
    const TB2 = (s, o) => s.blocks.push(Object.assign({ type: 'table' }, o)); // tabel dengan versi EN (o.en)
    const LB = (s, items, itemsEn, title) => s.blocks.push({ type: 'list', items, itemsEn, title });

    /* ---------- 0 ringkasan */
    const s0 = sec('ringkasan', 'Ringkasan', 'Ringkasan otomatis dari data berstatus Valid. Angka sampel menggambarkan pola dalam sampel, bukan prevalensi fasyankes atau estimasi nasional.');
    const cpAcak = Object.keys(rk).filter(k => rk[k].acak_N).map(k => [k, rk[k].acak_n / rk[k].acak_N, rk[k]]).sort((a, b) => b[1] - a[1]);
    const c6B = V.C6.C6B || [];
    const ses = V.C7.C7S || [];
    const bullets = [
      `Unit telaah C3 terpilih: ${sel.length} (target inti ${facs.length * 18}); Valid: ${A.length} unit A, ${B.length} unit B, ${C.length} episode CP3.`,
      cpAcak.length ? `Kesenjangan tertinggi pada unit acak/sensus: ${cpAcak.slice(0, 3).map(x => x[0] + ' ' + nN(x[2].acak_n, x[2].acak_N)).join('; ')}.` : 'Rekap CP dari C3 belum tersedia (belum ada unit Valid).',
      `Penilaian fasilitas C4 Valid: ${(V.C4.C4 || []).length} dari ${facs.length} fasyankes.`,
      `Verifikasi sentinel C5: ${['C5_5', 'C5_6', 'C5_41a'].reduce((a, s) => a + (V.C5[s] || []).length, 0)} lembar indikator Valid dari ${facs.filter(x => x.sentinel === 'Ya').length * 3} yang direncanakan.`,
      `Telaah kematian C6: ${(V.C6.C6A || []).length} kasus Valid; ${c6B.filter(r => r.data.peluang === 'Ya').length} dengan peluang perbaikan menurut penelaah pertama.`,
      `Wawancara/diskusi C7 Valid: ${ses.filter(r => /-W/.test(r.unit)).length} wawancara dan ${ses.filter(r => /-F/.test(r.unit)).length} diskusi kelompok.`
    ];
    const covList = { type: 'list', items: bullets, title: ['Cakupan data', 'Data coverage'] };

    /* ---------- tujuan, desain, metode (Protokol V13) */
    const sP = sec('pendahuluan', 'Pendahuluan', ''); sP.titleEn = 'Introduction';
    Hd(sP, 'Latar belakang', 'Background');
    Pp(sP, 'Tuberkulosis (TB) dan HIV saling memperberat. Orang dengan HIV (ODHIV) memiliki risiko yang jauh lebih tinggi untuk sakit TB, dan TB tetap menjadi salah satu penyebab utama kematian pada ODHIV. Karena itu kolaborasi TB-HIV menuntut serangkaian langkah pelayanan yang bersambung: kontak pertama dan akses ke layanan, skrining TB pada ODHIV, pemeriksaan dan diagnosis TB, penetapan status HIV pada pasien TB, pengobatan TB dan ARV yang dimulai tepat waktu, terapi pencegahan TB (TPT), rujukan yang tuntas, serta pemantauan sampai pengobatan selesai dan pasien tetap berada dalam perawatan. Satu langkah yang terputus dapat berujung pada putus berobat atau kematian yang sebenarnya dapat dicegah.',
      'Tuberculosis (TB) and HIV worsen each other. People living with HIV (PLHIV) have a much higher risk of developing TB, and TB remains one of the leading causes of death among PLHIV. TB-HIV collaboration therefore requires a connected sequence of care steps: first contact and access to care, TB screening of PLHIV, TB investigation and diagnosis, HIV status ascertainment among TB patients, timely start of TB treatment and ART, TB preventive treatment (TPT), completed referrals, and monitoring until treatment is completed and the patient remains in care. A single broken step can end in loss to follow-up or a death that could have been prevented.');
    Pp(sP, 'Indikator rutin menunjukkan tahap dengan capaian rendah, tetapi tidak menjelaskan mengapa pasien tidak berpindah ke tahap berikutnya, dan tidak membedakan pelayanan yang memang tidak diberikan dari pelayanan yang diberikan tetapi tidak tercatat. Analisis akar masalah (root cause analysis, RCA) TB-HIV 2026 dirancang untuk menelusuri titik putus tersebut pada tingkat pasien, fasilitas, dan sistem, dengan menggabungkan telaah catatan, penilaian proses, verifikasi data, telaah kematian, dan pengalaman pasien serta petugas.',
      'Routine indicators show which stages perform poorly, but they do not explain why patients fail to move to the next stage, nor do they distinguish services that were not provided from services provided but not recorded. The 2026 TB-HIV root cause analysis (RCA) is designed to trace these breakdown points at patient, facility, and system levels by combining record review, process assessment, data verification, death review, and the experiences of patients and health workers.');
    Hd(sP, 'Tujuan', 'Objectives');
    Pp(sP, 'Tujuan umum evaluasi lapangan adalah menemukan pada tahap mana dan mengapa pelayanan TB-HIV terputus, serta menyiapkan bukti yang dapat diuji bagi analisis akar masalah dan penyusunan rencana tindakan. Tujuan khususnya adalah: (1) merekonstruksi perjalanan pelayanan pasien dan mengukur kesenjangan pada setiap titik penilaian; (2) menilai kontribusi masalah pencatatan dan keterhubungan SITB–SIHA; (3) membandingkan pasangan kab/kota capaian rendah dan tinggi; (4) memahami tahap terjadinya kematian dan peluang perbaikannya; (5) mengenali kelompok dan hambatan yang membuat pasien tidak mencapai tahap berikutnya; dan (6) merumuskan dugaan akar masalah beserta arah tindakan untuk diuji pada lokakarya WP7.',
      'The general objective of the field evaluation is to identify at which stage and why TB-HIV care breaks down, and to prepare testable evidence for root-cause analysis and action planning. The specific objectives are: (1) to reconstruct patients\' care journeys and measure gaps at each checkpoint; (2) to assess the contribution of recording problems and SITB–SIHA linkage; (3) to compare low- and high-performing district/city pairs; (4) to understand the stage at which deaths occur and the opportunities for improvement; (5) to identify the groups and barriers that keep patients from reaching the next stage; and (6) to formulate root-cause hypotheses and action directions to be tested at the WP7 workshop.');
    Hd(sP, 'Pertanyaan evaluasi', 'Evaluation questions');
    LB(sP, ['Q1 · Kapan dan pada tahap mana pelayanan TB-HIV terputus?', 'Q2 · Seberapa besar kontribusi masalah pencatatan dan keterhubungan sistem informasi?', 'Q3 · Apa yang membedakan kab/kota capaian rendah dan tinggi?', 'Q4 · Pada tahap mana kematian terjadi dan peluang perbaikan apa yang terlihat?', 'Q5 · Kelompok mana yang belum mencapai tahap berikutnya dan hambatan apa yang dialami?', 'Q6 · Dugaan akar masalah dan tindakan apa yang perlu diuji?'],
      ['Q1 · When and at which stage does TB-HIV care break down?', 'Q2 · How much do recording problems and information-system linkage contribute?', 'Q3 · What distinguishes low- and high-performing districts/cities?', 'Q4 · At which stage do deaths occur and what improvement opportunities are visible?', 'Q5 · Which groups do not reach the next stage and what barriers do they face?', 'Q6 · Which root causes and actions should be tested?']);
    Hd(sP, 'Ruang lingkup dan susunan laporan', 'Scope and structure of the report');
    Pp(sP, 'Evaluasi mencakup kejadian pelayanan sejak 2024 sampai 30 Juni 2026 yang ditelaah saat kunjungan lapangan Oktober–November 2026. ' + (f.prov ? 'Laporan ini dibatasi pada ' + 'Provinsi ' + RCA.reg.prov(f.prov).name + '. ' : 'Laporan ini mencakup seluruh lokasi evaluasi. ') + 'Setelah bagian Metode, laporan menyajikan pelaksanaan pengumpulan data, peta alur pasien beserta keterkaitan bukti dari formulir C1 sampai C7, jawaban atas setiap pertanyaan evaluasi (Q1–Q6), pembahasan triangulasi antarformulir, kesimpulan dan rekomendasi, serta keterbatasan. Lampiran memuat pemetaan setiap tahap alur pasien ke butir instrumen.',
      'The evaluation covers care events from 2024 to 30 June 2026, reviewed during field visits in October–November 2026. ' + (f.prov ? 'This report is limited to ' + ((RCA.reportEN && RCA.reportEN.fixed('Provinsi ' + RCA.reg.prov(f.prov).name)) || RCA.reg.prov(f.prov).name) + '. ' : 'This report covers all evaluation sites. ') + 'After the Methods, the report presents data collection, the patient-journey map with evidence links from forms C1 to C7, answers to each evaluation question (Q1–Q6), a discussion triangulating findings across forms, conclusions and recommendations, and limitations. The annex maps each journey stage to instrument items.');

    const sM = sec('metode', 'Metode', ''); sM.titleEn = 'Methods';
    Hd(sM, 'Tujuan dan desain', 'Objectives and design');
    I(sM, 'Evaluasi lapangan RCA TB-HIV 2026 bertujuan menemukan di tahap mana dan mengapa pelayanan TB-HIV terputus, serta menyiapkan bukti bagi analisis akar masalah dan rencana tindakan. Enam pertanyaan evaluasi Protokol V13 menjadi kerangka laporan ini: Q1 kapan dan pada tahap mana pelayanan terputus; Q2 seberapa besar kontribusi masalah pencatatan dan keterhubungan sistem; Q3 apa yang membedakan kab/kota capaian rendah dan tinggi; Q4 pada tahap mana kematian terjadi dan peluang perbaikan apa yang terlihat; Q5 kelompok mana yang belum mencapai tahap berikutnya dan hambatan apa yang dialami; Q6 dugaan akar masalah dan tindakan apa yang perlu diuji.',
      'The 2026 TB-HIV RCA field evaluation aims to identify at which stage and why TB-HIV care breaks down, and to prepare evidence for root-cause analysis and action planning. The six evaluation questions of Protocol V13 frame this report: Q1 when and at which stage care breaks down; Q2 how much recording and system-linkage problems contribute; Q3 what distinguishes low- and high-performing districts/cities; Q4 at which stage deaths occur and what improvement opportunities are visible; Q5 which groups do not reach the next stage and what barriers they face; Q6 which root causes and actions should be tested.', 'method');
    I(sM, 'Desain: studi kasus banyak lokasi dengan metode campuran di enam provinsi, dua belas kab/kota (pasangan capaian rendah dan tinggi), dan 24 fasyankes. Sumber bukti: C1 profil kab/kota dan dugaan awal; C2 kerangka sampel dan undian; C3 telaah catatan pelayanan per unit (kerangka A episode TB-HIV, B riwayat ARV/TPT, CP3 penetapan status HIV); C4 penilaian proses fasilitas pada 14 titik penilaian (CP); C5 verifikasi data dua arah di fasyankes sentinel; C6 telaah kematian tanpa menyalahkan; C7 wawancara mendalam dan diskusi kelompok.',
      'Design: multi-site, mixed-methods case study in six provinces, twelve districts/cities (low- and high-performing pairs), and 24 health facilities. Evidence sources: C1 district profile and initial hypotheses; C2 sampling frame and random draw; C3 care record review per unit (frame A TB-HIV episodes, B ART/TPT histories, CP3 HIV status ascertainment); C4 facility process assessment across 14 checkpoints (CPs); C5 two-way data verification at sentinel facilities; C6 no-blame death review; C7 in-depth interviews and group discussions.', 'method');
    I(sM, 'Aturan penafsiran: frekuensi kesenjangan hanya dihitung dari unit acak/sensus; unit purposif menjelaskan mekanisme. Isian "tidak tercatat" (TC) menjadi kesenjangan hanya setelah penelusuran sumber selesai. Klasifikasi 14 CP di C4 tidak dijumlahkan menjadi skor fasilitas. Faktor verifikasi C5 hanya sah untuk indikator, periode, dan sumber yang dinilai. Suatu penyebab baru menjadi akar masalah setelah diuji pada lokakarya WP7 menurut kriteria Protokol V13 Bagian 13. Laporan ini memakai rekaman berstatus Valid.',
      'Interpretation rules: gap frequencies are computed from random/census units only; purposive units explain mechanisms. "Not recorded" (TC) entries become gaps only after source tracing is complete. The 14 C4 checkpoint classifications are not summed into a facility score. C5 verification factors are valid only for the indicators, periods, and sources assessed. A cause becomes a root cause only after testing at the WP7 workshop against Protocol V13 Section 13 criteria. This report uses validated records only.', 'method');
    Hd(sM, 'Sampel dan unit analisis', 'Sample and units of analysis');
    Pp(sM, `Unit telaah C3 dipilih dari kerangka sampel C2 setiap fasyankes: kerangka A (episode TB pada ODHIV), kerangka B (ODHIV yang memulai ARV, untuk skrining TB dan TPT), dan kerangka CP3 (episode TB untuk penetapan status HIV). Target inti adalah enam unit per kerangka (tiga acak atau sensus dan tiga purposif), atau 18 unit per fasyankes. Saat laporan ini disusun, ${sel.length} unit telah terpilih dan ${A.length + B.length + C.length} unit berstatus Valid (${A.length} unit A, ${B.length} unit B, ${C.length} episode CP3). Satu pasien dapat muncul pada lebih dari satu kerangka atau episode, sehingga jumlah unit, dokumen, kasus, dan pasien unik dilaporkan terpisah. Kasus kematian C6 dipilih secara purposif dari daftar calon kematian dan tidak dipakai untuk menghitung angka kematian.`,
      `C3 review units are selected from each facility's C2 sampling frame: frame A (TB episodes among PLHIV), frame B (PLHIV starting ART, for TB screening and TPT), and frame CP3 (TB episodes for HIV status ascertainment). The core target is six units per frame (three random or census and three purposive), or 18 units per facility. At the time of this report, ${sel.length} units have been selected and ${A.length + B.length + C.length} units are validated (${A.length} A units, ${B.length} B units, ${C.length} CP3 episodes). One patient may appear in more than one frame or episode, so units, documents, cases, and unique patients are reported separately. C6 death cases are selected purposively from the list of candidate deaths and are not used to compute mortality rates.`);
    Hd(sM, 'Instrumen dan sumber bukti', 'Instruments and evidence sources');
    TB2(sM, { id: 'T98.1', title: 'Instrumen evaluasi dan perannya dalam alur pasien', head: ['Formulir', 'Isi', 'Unit analisis', 'Peran dalam alur pasien'],
      rows: [['C1', 'Profil kab/kota dan dugaan penyebab awal', 'Kab/kota', 'Dugaan awal yang dikaitkan dengan CP; diuji oleh formulir lain'], ['C2', 'Kerangka sampel, undian, lembar penghubung, calon kematian', 'Fasyankes', 'Menentukan unit C3 dan kasus C6 yang ditelaah'],
        ['C3', 'Telaah catatan pelayanan per unit (A, B, CP3)', 'Unit/episode pasien', 'Merekonstruksi tanggal dan langkah pelayanan; menandai titik putus per CP'], ['C4', 'Penilaian proses fasilitas pada 14 CP dan R6', 'Fasyankes', 'Menjelaskan proses dan faktor sistem di balik titik putus'],
        ['C5', 'Verifikasi data dua arah TB/HIV-5, TB/HIV-6, TB/HIV-4.1a', 'Sentinel × indikator', 'Memisahkan masalah pencatatan dari masalah pelayanan'], ['C6', 'Telaah kematian tanpa menyalahkan (fase T1–T5, tiga keterlambatan)', 'Kasus kematian', 'Menunjukkan fase dan keterlambatan menjelang kematian'],
        ['C7', 'Wawancara mendalam dan diskusi kelompok', 'Sesi/informan', 'Menjelaskan hambatan dan pengalaman pasien serta petugas']],
      en: { title: 'Evaluation instruments and their role in the patient journey', head: ['Form', 'Content', 'Unit of analysis', 'Role in the patient journey'],
        rows: [['C1', 'District profile and initial causal hypotheses', 'District/city', 'Initial hypotheses linked to checkpoints; tested by other forms'], ['C2', 'Sampling frame, draw, linkage sheet, candidate deaths', 'Facility', 'Determines which C3 units and C6 cases are reviewed'],
          ['C3', 'Care record review per unit (A, B, CP3)', 'Patient unit/episode', 'Reconstructs care dates and steps; flags breakdowns by checkpoint'], ['C4', 'Facility process assessment across 14 checkpoints and R6', 'Facility', 'Explains processes and system factors behind breakdowns'],
          ['C5', 'Two-way data verification for TB/HIV-5, TB/HIV-6, TB/HIV-4.1a', 'Sentinel × indicator', 'Separates recording problems from service problems'], ['C6', 'No-blame death review (phases T1–T5, three delays)', 'Death case', 'Shows the phase and delays leading to death'],
          ['C7', 'In-depth interviews and group discussions', 'Session/informant', 'Explains barriers and the experiences of patients and health workers']] } });
    Hd(sM, 'Analisis dan pemetaan alur pasien', 'Analysis and patient-journey mapping');
    Pp(sM, 'Analisis kuantitatif memakai frekuensi, proporsi bersyarat, serta median dan rentang interkuartil waktu antartahap; unit purposif dan data kualitatif dipakai untuk menjelaskan mekanisme. Untuk menyatukan bukti, perjalanan pasien dipetakan ke sepuluh tahap berurutan dan empat status akhir (berhasil, masih berobat atau pindah, putus berobat atau hilang kontak, dan meninggal), ditambah satu ranah lintas tahap (informasi dan akuntabilitas, R6). Setiap tahap dikaitkan dengan CP Protokol V13, fase telaah kematian C6 (T1 akses dan diagnosis, T2 awal terapi, T3 pemantauan, T4 rujukan, T5 penanganan saat kondisi memburuk) beserta tiga keterlambatan, dan indikator C5 yang relevan. Sebuah bukti dihitung pada suatu tahap bila: dugaan C1 atau tema C7 menyebut CP tahap itu; unit C3 memiliki titik putus pada CP tahap itu; penilaian C4 untuk CP itu berklasifikasi bermasalah atau memuat masalah atau dugaan penyebab; baris C5 untuk indikator terkait tidak sesuai; atau kasus C6 memiliki masalah, skor mutu 1–2, atau keterlambatan pada fase terkait. Bila kolom CP pada dugaan C1 atau tema C7, atau kolom fase pada masalah C6, belum diisi, bukti dikaitkan ke tahap melalui kata kunci teks (misalnya \u201crujukan\u201d, \u201cTPT\u201d, \u201cSITB\u201d) dan ditandai sebagai kaitan otomatis di Dashboard Analisis. Jumlah bukti menunjukkan di mana bukti terkumpul dan seberapa banyak sumber yang saling menguatkan, bukan besaran masalah.',
      'Quantitative analysis uses frequencies, conditional proportions, and medians with interquartile ranges for time between stages; purposive units and qualitative data explain mechanisms. To bring the evidence together, the patient journey is mapped to ten sequential stages and four final statuses (successful, still on treatment or transferred, lost to follow-up or interrupted, and died), plus one cross-cutting domain (information and accountability, R6). Each stage is linked to Protocol V13 checkpoints, the C6 death-review phases (T1 access and diagnosis, T2 treatment start, T3 monitoring, T4 referral, T5 management when the condition worsens) with the three delays, and the relevant C5 indicators. An evidence item counts towards a stage when: a C1 hypothesis or C7 theme names a checkpoint of that stage; a C3 unit has a breakdown at that checkpoint; the C4 assessment of that checkpoint is classified as problematic or records a problem or causal hypothesis; a C5 row for the related indicator is discrepant; or a C6 case has a problem, a quality score of 1–2, or a delay in the related phase. Where the checkpoint column of a C1 hypothesis or C7 theme, or the phase column of a C6 problem, is blank, the item is linked to a stage through keywords in its text (for example \u201creferral\u201d, \u201cTPT\u201d, \u201cSITB\u201d) and flagged as an automatic link in the Analysis Dashboard. Evidence counts show where evidence accumulates and how many sources corroborate each other, not the size of the problem.');
    Hd(sM, 'Etika dan perlindungan data', 'Ethics and data protection');
    Pp(sM, 'Pengumpulan data mengikuti ketentuan etik Protokol V13. Pasien hanya dicatat dengan kode anonim; nama, NIK, dan alamat tidak dimasukkan ke aplikasi, dan foto dokumen pendukung disamarkan sebelum diunggah. Akses dibatasi menurut peran: pembaca hanya melihat ringkasan agregat, koordinat rinci dan ekspor data hanya untuk Super Admin dan Koordinator. Telaah kematian dilakukan tanpa menyalahkan petugas atau fasilitas, dan temuan dipakai untuk pembelajaran program.',
      'Data collection follows the ethical provisions of Protocol V13. Patients are recorded only by anonymous codes; names, national ID numbers, and addresses are not entered into the application, and photos of supporting documents are blurred before upload. Access is role-based: readers see aggregate summaries only, while precise coordinates and data export are limited to the Super Admin and Coordinators. Death reviews are conducted without blaming health workers or facilities, and findings are used for programme learning.');


    /* ---------- 1 pelaksanaan */
    const s1 = sec('pelaksanaan', '1. Pelaksanaan pengumpulan data dan kelengkapan', 'Status pengisian per formulir, capaian sampel terhadap target Protokol V13 Bagian 10–12, dan pembedaan jumlah unit, dokumen, kasus, serta pasien unik.');
    T(s1, 'T1.1', 'Status pengisian per formulir', ['Formulir', 'Unit'].concat(STAT).concat(['% Valid']),
      ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].map(fm => { const us = units[fm] || []; const c = s => us.filter(u => u.status === s).length; return [S.forms[fm].title, us.length].concat(STAT.map(c)).concat([us.length ? pct(c('Valid'), us.length) + '%' : '–']); }));
    T(s1, 'T1.2', 'Sampel C3 per fasyankes (target inti 6 per kerangka; 18 per fasyankes)', ['Fasyankes', 'A terpilih', 'B terpilih', 'CP3 terpilih', 'Total/target', 'Unit Valid', 'Tidak berhasil ditelaah', 'Pasien unik'],
      facs.map(fc => { const s = sel.filter(x => x.fac === fc.code); const v = A.concat(B, C).filter(x => x._fac === fc.code).length;
        return [RCA.reg.facLabel(fc), s.filter(x => x.frame === 'A').length, s.filter(x => x.frame === 'B').length, s.filter(x => x.frame === 'CP3').length, s.length + '/18', v, s.filter(x => x.telaah === 'Tidak berhasil').length, new Set(s.map(x => x.pid)).size]; }));
    const provs = PROV().filter(p => !f.prov || p.code === f.prov);
    const T7 = S.c7.target;
    const P7 = { SUT: 'SUT', DKI: 'DKI', JBR: 'JBR', JTM: 'JTM', BAL: 'BAL', PPA: 'PPA' };
    T(s1, 'T1.3', 'Telaah kematian, sesi kualitatif, dan sentinel per provinsi', ['Provinsi', 'Calon C6', 'Kasus C6 terpilih', 'C6 Valid (target ≤10)', 'Sesi C7 Valid (target)', 'Sentinel', 'Indikator C5 Valid (dari 3)'],
      provs.map(p => { const cal = (c2.calon || []).filter(x => RCA.reg.kk(x.kk).prov === p.code); const sent = RCA.state.regions.fac.filter(x => x.sentinel === 'Ya' && RCA.reg.kk(x.kk).prov === p.code);
        return [p.name, cal.length, cal.filter(x => x.dipilih === 'Ya').length, (V.C6.C6A || []).filter(r => r.prov === p.code).length,
          ses.filter(r => r.unit.startsWith(P7[p.code] + '-')).length + ' (' + (T7[p.code] || '') + ')', sent.map(x => x.code).join(', ') || 'belum ditetapkan',
          sent.length ? ['C5_5', 'C5_6', 'C5_41a'].filter(s => (V.C5[s] || []).some(r => r.unit === sent[0].code)).length : '–']; }));
    {
      const FM = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
      G(s1, { id: 'G1.1', kind: 'stack', title: ['Status pengisian per formulir', 'Completion status by form'], pct: true,
        series: STAT.map(x => ({ label: x, color: { Belum: '#b8c2c4', Draf: '#e2b33c', Dikirim: '#3d8bd4', Dikembalikan: '#d0603d', Valid: '#2e8b57' }[x] })),
        rows: FM.map(fm => ({ label: fm, parts: STAT.map(x => (units[fm] || []).filter(u => u.status === x).length) })) });
      const tot = FM.reduce((a, fm) => a + (units[fm] || []).length, 0), val = FM.reduce((a, fm) => a + (units[fm] || []).filter(u => u.status === 'Valid').length, 0);
      const lag = FM.filter(fm => (units[fm] || []).length && pr((units[fm] || []).filter(u => u.status === 'Valid').length, (units[fm] || []).length) < 50);
      const under = facs.filter(fc => sel.filter(x => x.fac === fc.code).length < 18).length;
      const uniq = new Set(sel.map(x => x.fac + '|' + x.pid)).size;
      I(s1, `Dari ${tot} unit di semua formulir, ${fmt(val, tot)} sudah Valid. ${lag.length ? 'Formulir dengan kurang dari separuh unit Valid: ' + joinId(lag) + '; temuan dari formulir ini perlu dibaca hati-hati sampai validasi selesai. ' : 'Semua formulir sudah mencapai sekurang-kurangnya separuh unit Valid. '}${under ? under + ' dari ' + facs.length + ' fasyankes belum mencapai 18 unit C3 terpilih (target inti 6 per kerangka), biasanya karena kerangka kecil (sensus) atau undian belum dijalankan. ' : ''}${sel.length && uniq < sel.length ? sel.length - uniq + ' unit C3 merupakan pasien yang sama di kerangka atau episode lain; jumlah pasien unik (' + uniq + ') lebih kecil dari jumlah unit.' : ''}`,
        `Of ${tot} units across all forms, ${fmt(val, tot)} are validated. ${lag.length ? 'Forms with fewer than half of units validated: ' + joinEn(lag) + '; findings from these forms should be read with caution until validation is complete. ' : 'All forms have at least half of units validated. '}${under ? under + ' of ' + facs.length + ' facilities have not reached 18 selected C3 units (core target 6 per frame), usually because of small frames (census) or a draw not yet run. ' : ''}${sel.length && uniq < sel.length ? sel.length - uniq + ' C3 units are the same patient in another frame or episode; unique patients (' + uniq + ') are fewer than units.' : ''}`);
    }

    /* ---------- alur pasien dan bukti C1–C7 */
    let JM = null;
    try { if (RCA.journey && RCA.story) JM = RCA.journey.build(V, RCA.story.build(V), RCA.story.buildC6(V, (c2.calon || []).filter(inProv))); } catch (e) { console.warn('alur pasien', e); }
    const sJ = sec('alur', 'Alur pasien dan keterkaitan bukti antarformulir (C1–C7)', 'Perjalanan pasien dari kontak pertama sampai status akhir, dipetakan ke CP Protokol V13, fase telaah kematian C6, dan indikator C5. Angka per formulir adalah jumlah bukti yang dikaitkan dengan CP tahap tersebut (lihat Metode).');
    sJ.titleEn = 'Patient journey and cross-form evidence links (C1–C7)'; sJ.introEn = 'The patient journey from first contact to final status, mapped to Protocol V13 checkpoints, C6 death-review phases, and C5 indicators. Figures per form are the number of evidence items linked to the checkpoints of each stage (see Methods).';
    const FJ = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'];
    const jAll = JM ? JM.nodes.concat(JM.outcomes, [JM.cross]) : [];
    if (JM) {
      G(sJ, RCA.journey.chart(JM, 'G99.1'));
      const row = (n, k, lang) => [(k !== null ? (k + 1) + '. ' : '') + n.t[lang], n.cps.join(', ') || '–', n.reach.length, n.gaps || 0].concat(FJ.map(fm => n.ev[fm].length)).concat([n.total]);
      const rowsBy = lang => JM.nodes.map((n, k) => row(n, k, lang)).concat(JM.outcomes.map(n => row(n, null, lang)), [row(JM.cross, null, lang)]);
      TB2(sJ, { id: 'T99.1', title: 'Jumlah unit dan bukti per tahap alur pasien dan per formulir', head: ['Tahap / status akhir', 'CP', 'Unit C3', 'Titik putus C3'].concat(FJ).concat(['Total bukti']), rows: rowsBy(0),
        note: 'Unit C3 = unit yang mencapai tahap (atau berstatus akhir tersebut) menurut isian C3. Satu unit atau fasyankes dapat menyumbang bukti di lebih dari satu tahap. Rincian setiap angka dapat dibuka di Dashboard Analisis › Alur pasien.',
        en: { title: 'Units and evidence items by patient-journey stage and form', head: ['Stage / final status', 'Checkpoints', 'C3 units', 'C3 breakdowns'].concat(FJ).concat(['Total evidence']), rows: rowsBy(1),
          note: 'C3 units = units reaching the stage (or with that final status) according to C3 entries. One unit or facility may contribute evidence to more than one stage. The details behind each figure can be opened in Analysis Dashboard › Patient journey.' } });
      const ranked = jAll.filter(n => n.total).sort((a, b) => b.total - a.total);
      const nf = n => FJ.filter(fm => n.ev[fm].length).length;
      const tri = JM.nodes.filter(n => nf(n) >= 3), one = JM.nodes.filter(n => nf(n) === 1), none = JM.nodes.filter(n => !n.total);
      if (!ranked.length) Pp(sJ, 'Belum ada bukti berstatus Valid yang dapat dikaitkan dengan tahap alur pasien. Peta alur akan terisi setelah formulir C1, C3, C4, C5, C6, dan C7 divalidasi.', 'No validated evidence can yet be linked to the patient-journey stages. The map will fill in once forms C1, C3, C4, C5, C6, and C7 are validated.');
      else {
        const t3 = ranked.slice(0, 3);
        Pp(sJ, `Gambar dan tabel di atas menyatukan seluruh formulir dalam satu perjalanan pasien. Bukti paling banyak terkumpul pada ${joinId(t3.map(n => lc(n.t[0]) + ' (' + n.total + ' bukti dari ' + nf(n) + ' formulir)'))}. ${tri.length ? 'Tahap dengan bukti dari tiga formulir atau lebih, sehingga temuannya saling menguatkan, adalah ' + joinId(tri.map(n => lc(n.t[0]))) + '. ' : 'Belum ada tahap yang didukung tiga formulir atau lebih; triangulasi masih terbatas. '}${one.length ? 'Tahap yang baru didukung satu formulir (' + joinId(one.map(n => lc(n.t[0]))) + ') perlu dikonfirmasi dengan sumber lain sebelum disimpulkan. ' : ''}${none.length ? 'Belum ada bukti yang terkait dengan ' + joinId(none.map(n => lc(n.t[0]))) + '; hal ini dapat berarti pelayanan berjalan baik atau tahap tersebut belum cukup ditelaah.' : ''}`,
          `The figure and table above bring all forms together in one patient journey. Evidence accumulates most at ${joinEn(t3.map(n => lc(n.t[1]) + ' (' + n.total + ' items from ' + nf(n) + ' forms)'))}. ${tri.length ? 'Stages with evidence from three or more forms, so that findings corroborate each other, are ' + joinEn(tri.map(n => lc(n.t[1]))) + '. ' : 'No stage is yet supported by three or more forms; triangulation is still limited. '}${one.length ? 'Stages supported by a single form (' + joinEn(one.map(n => lc(n.t[1]))) + ') should be confirmed with other sources before conclusions are drawn. ' : ''}${none.length ? 'No evidence is yet linked to ' + joinEn(none.map(n => lc(n.t[1]))) + '; this may mean care works well there or that the stage has not been reviewed enough.' : ''}`);
        const o = id => JM.outcomes.find(x => x.id === id).reach.length, T_ = JM.totals;
        Pp(sJ, `Status akhir diketahui pada ${T_.known} dari ${T_.ab} unit A dan B: ${o('berhasil')} berhasil (sembuh, pengobatan lengkap, atau tetap ARV), ${o('lanjut')} masih berobat atau pindah, ${o('putus')} putus berobat atau hilang kontak, dan ${o('meninggal')} meninggal. Secara terpisah dari sampel C3, telaah kematian C6 menelaah ${T_.c6} kasus. Unit yang putus berobat dan meninggal menjadi titik masuk untuk menelusuri kembali tahap-tahap sebelumnya: titik putus yang tercatat pada unit tersebut dan bukti C4, C6, dan C7 pada tahap yang sama menunjukkan rantai kejadian yang paling mungkin. Status akhir menggambarkan sampel, bukan angka keberhasilan atau kematian fasyankes.`,
          `Final status is known for ${T_.known} of ${T_.ab} A and B units: ${o('berhasil')} successful (cured, completed, or retained on ART), ${o('lanjut')} still on treatment or transferred, ${o('putus')} lost to follow-up or interrupted, and ${o('meninggal')} died. Separately from the C3 sample, the C6 death review examined ${T_.c6} cases. Units lost to follow-up or deceased are the entry point for tracing back through earlier stages: the breakdowns recorded for those units and the C4, C6, and C7 evidence at the same stages show the most likely chain of events. Final statuses describe the sample, not facility success or mortality rates.`);
        const ts = JM.nodes.filter(n => n.total).sort((a, b) => b.total - a.total)[0];
        if (ts) KEY.push([`Alur pasien: di antara sepuluh tahap pelayanan, bukti paling banyak terkumpul pada tahap ${lc(ts.t[0])} (${ts.total} bukti dari ${nf(ts)} formulir).`, `Patient journey: among the ten care stages, evidence accumulates most at ${lc(ts.t[1])} (${ts.total} items from ${nf(ts)} forms).`]);
      }
    } else Pp(sJ, 'Peta alur pasien tidak dapat disusun dari data saat ini.', 'The patient-journey map could not be compiled from the current data.');

    /* ---------- 2 Q1 */
    const s2 = sec('q1', '2. Q1 · Kapan dan pada tahap mana pelayanan terputus', 'Rekonstruksi pelayanan dari telaah catatan C3 (WP4). n = unit dengan kesenjangan; N = unit yang dapat dinilai. Acak/sensus dan purposif disajikan terpisah; unit purposif menjelaskan mekanisme dan tidak dipakai untuk frekuensi.');
    const CPS = ['CP2', 'CP3', 'CP5', 'CP6', 'CP7', 'CP8', 'CP10', 'CP11', 'CP12', 'CP14', 'R6'];
    T(s2, 'T2.1', 'Rekap kesenjangan per titik penilaian (C3)', ['CP', 'Ranah', 'Fokus', 'Acak/sensus n/N', 'Purposif n/N', 'BD / pengamatan belum cukup'],
      CPS.map(cp => { const o = rk[cp] || { acak_n: 0, acak_N: 0, purp_n: 0, purp_N: 0, bd: 0 }; const i = CP_INFO[cp] || {}; return [cp, i.ranah || (cp === 'R6' ? 'R6' : ''), i.fokus || 'Kesesuaian SITB/SIHA', nN(o.acak_n, o.acak_N), nN(o.purp_n, o.purp_N), o.bd]; }));
    {
      const it = CPS.map(cp => ({ cp, o: rk[cp] || { acak_n: 0, acak_N: 0, purp_n: 0, purp_N: 0, bd: 0 } })).filter(x => x.o.acak_N);
      G(s2, { id: 'G2.1', kind: 'hbar', title: ['Persentase unit acak/sensus dengan kesenjangan per CP', 'Share of random/census units with a gap, by checkpoint'], pct: true, max: 100,
        items: it.map(x => ({ label: x.cp + ' ' + ((CP_INFO[x.cp] || {}).fokus || 'SITB/SIHA'), value: pr(x.o.acak_n, x.o.acak_N), txt: x.o.acak_n + '/' + x.o.acak_N, warn: x.o.acak_N < 10 })),
        note: ['Batang pucat = N < 10 (presisi rendah).', 'Pale bars = N < 10 (low precision).'] });
      const top = it.slice().sort((a, b) => pr(b.o.acak_n, b.o.acak_N) - pr(a.o.acak_n, a.o.acak_N)).filter(x => x.o.acak_n);
      const grpStage = { 'akses dan diagnosis': ['CP2', 'CP3'], 'awal terapi dan pencegahan': ['CP5', 'CP6', 'CP7'], 'kesinambungan (rujukan, pemantauan, TPT, kembali berobat)': ['CP8', 'CP10', 'CP11', 'CP12'], 'retensi jangka panjang': ['CP14'] };
      const grpEn = { 'akses dan diagnosis': 'access and diagnosis', 'awal terapi dan pencegahan': 'treatment initiation and prevention', 'kesinambungan (rujukan, pemantauan, TPT, kembali berobat)': 'continuity (referral, monitoring, TPT, return to care)', 'retensi jangka panjang': 'long-term retention' };
      const gs = Object.entries(grpStage).map(([g, cps]) => { const n = cps.reduce((a, c) => a + ((rk[c] || {}).acak_n || 0), 0), N = cps.reduce((a, c) => a + ((rk[c] || {}).acak_N || 0), 0); return { g, n, N }; }).filter(x => x.N);
      const worst = gs.slice().sort((a, b) => pr(b.n, b.N) - pr(a.n, a.N))[0];
      if (!it.length) I(s2, 'Belum ada unit C3 acak/sensus berstatus Valid, sehingga Q1 belum dapat dijawab secara kuantitatif.', 'No validated random/census C3 units yet, so Q1 cannot be answered quantitatively.');
      else {
        const t3 = top.slice(0, 3);
        I(s2, `Kesenjangan paling sering pada unit acak/sensus terdapat di ${joinId(t3.map(x => x.cp + ' (' + (CP_INFO[x.cp] || {}).fokus + ', ' + fmt(x.o.acak_n, x.o.acak_N) + ')'))}. ${worst ? 'Dikelompokkan menurut tahap, putusnya pelayanan paling banyak terjadi pada tahap ' + worst.g + ' (' + fmt(worst.n, worst.N) + ' penilaian CP). ' : ''}${it.filter(x => x.o.acak_N < 10).length ? 'CP dengan N < 10 (' + it.filter(x => x.o.acak_N < 10).map(x => x.cp).join(', ') + ') belum cukup untuk perbandingan antar-CP. ' : ''}Unit purposif (${it.reduce((a, x) => a + x.o.purp_N, 0)} penilaian) dipakai untuk memahami mekanisme di tabel C3 dan C4, bukan untuk frekuensi.`,
          `The most frequent gaps in random/census units are at ${joinEn(t3.map(x => x.cp + ' (' + E((CP_INFO[x.cp] || {}).fokus) + ', ' + fmt(x.o.acak_n, x.o.acak_N) + ')'))}. ${worst ? 'Grouped by stage, care breaks down most often at ' + grpEn[worst.g] + ' (' + fmt(worst.n, worst.N) + ' checkpoint assessments). ' : ''}${it.filter(x => x.o.acak_N < 10).length ? 'Checkpoints with N < 10 (' + it.filter(x => x.o.acak_N < 10).map(x => x.cp).join(', ') + ') are not yet sufficient for comparison across checkpoints. ' : ''}Purposive units (${it.reduce((a, x) => a + x.o.purp_N, 0)} assessments) are used to understand mechanisms in the C3 and C4 tables, not for frequencies.`);
        if (t3[0]) KEY.push([`Titik putus tersering: ${t3[0].cp} ${(CP_INFO[t3[0].cp] || {}).fokus} (${fmt(t3[0].o.acak_n, t3[0].o.acak_N)} unit acak/sensus).`, `Most frequent breakdown point: ${t3[0].cp} ${E((CP_INFO[t3[0].cp] || {}).fokus)} (${fmt(t3[0].o.acak_n, t3[0].o.acak_N)} random/census units).`]);
      }
    }
    const AU = RCA.AUTO;
    const iv = (lab, arr) => { const m = medIqr(arr); return [lab, m[0], m[1], m[2]]; };
    T(s2, 'T2.2', 'Waktu antartahap (hari; median dan rentang interkuartil, hanya tanggal sahih)', ['Selang', 'Median', 'IQR', 'n'], [
      iv('Terduga TB → diagnosis TB (A)', A.map(AU.hari_terduga_dx)), iv('Diagnosis TB → tes HIV (A)', A.map(AU.hari_dx_teshiv)), iv('Diagnosis TB → mulai OAT (A)', A.map(AU.hari_dx_oat)),
      iv('Mulai OAT → mulai ARV (A, belum/putus ARV)', A.filter(d => d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus').map(AU.hari_oat_arv)),
      iv('Mulai ARV → skrining TB (B)', B.map(AU.hari_arv_skr)), iv('Skrining → keputusan diagnostik (B)', B.map(AU.hari_skr_dx)), iv('Kelayakan → mulai TPT (B)', B.map(AU.hari_layak_tpt)),
      iv('Diagnosis TB → tes HIV (CP3)', C.map(AU.hari_dx_tes))]);
    {
      const ivs = [['Terduga TB → diagnosis TB (A)', A.map(AU.hari_terduga_dx)], ['Diagnosis TB → tes HIV (A)', A.map(AU.hari_dx_teshiv)], ['Diagnosis TB → mulai OAT (A)', A.map(AU.hari_dx_oat)],
        ['Mulai OAT → mulai ARV (A, belum/putus ARV)', A.filter(d => d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus').map(AU.hari_oat_arv)], ['Mulai ARV → skrining TB (B)', B.map(AU.hari_arv_skr)],
        ['Skrining → keputusan diagnostik (B)', B.map(AU.hari_skr_dx)], ['Kelayakan → mulai TPT (B)', B.map(AU.hari_layak_tpt)], ['Diagnosis TB → tes HIV (CP3)', C.map(AU.hari_dx_tes)]]
        .map(([l, a]) => { const v = a.filter(x => x !== '' && x !== null && !isNaN(x)).map(Number); return { label: l, n: v.length, med: q(v, .5), q1: q(v, .25), q3: q(v, .75) }; }).filter(x => x.n);
      if (ivs.length) {
        G(s2, { id: 'G2.2', kind: 'range', title: ['Waktu antartahap: median dan rentang interkuartil (hari)', 'Time between stages: median and interquartile range (days)'], items: ivs });
        const lg = ivs.slice().sort((a, b) => b.med - a.med)[0], oa = ivs.find(x => /OAT → mulai ARV/.test(x.label));
        I(s2, `Selang terpanjang adalah ${lg.label} dengan median ${lg.med} hari (IQR ${lg.q1}–${lg.q3}; n = ${lg.n}).${oa ? ' Median mulai OAT sampai mulai ARV ' + oa.med + ' hari; ' + (oa.med > 14 ? 'melebihi batas 14 hari Juknis 2023 untuk TB SO, sehingga inisiasi ARV perlu ditelusuri lebih lanjut pada CP6.' : 'masih dalam batas 14 hari Juknis 2023 untuk TB SO pada separuh unit, tetapi ekor distribusi (kuartil atas ' + oa.q3 + ' hari) tetap perlu diperhatikan.') : ''} Selang hanya dihitung dari tanggal yang sahih; unit dengan tanggal tidak tercatat tidak masuk perhitungan sehingga n berbeda antar-selang.`,
          `The longest interval is ${E(lg.label)} with a median of ${lg.med} days (IQR ${lg.q1}–${lg.q3}; n = ${lg.n}).${oa ? ' Median time from TB treatment start to ART start is ' + oa.med + ' days; ' + (oa.med > 14 ? 'this exceeds the 14-day limit of the 2023 guideline for DS-TB, so ART initiation should be traced further at CP6.' : 'half of units are within the 14-day limit of the 2023 guideline for DS-TB, but the tail of the distribution (upper quartile ' + oa.q3 + ' days) still warrants attention.') : ''} Intervals use valid dates only; units with unrecorded dates are excluded, so n differs between intervals.`);
      }
    }
    const arvNeed = A.filter(d => d.A10 === 'Belum pernah ARV' || d.A10 === 'Pernah ARV, terputus');
    const cp6 = arvNeed.map(AU.cp6);
    T(s2, 'T2.3', 'Inisiasi ARV pada episode TB-HIV yang belum/pernah terputus ARV (CP6; Juknis 2023: ≤14 hari TB SO, ≤56 hari TB RO)', ['Kategori', 'Jumlah'],
      ['Terjadi dalam batas', 'Kesenjangan: terlambat', 'Kesenjangan: tidak dimulai', 'Terjadi, waktu dinilai klinis', 'Terjadi, waktu belum dapat dinilai', 'Jendela pengamatan belum cukup', 'TC belum ditelusuri', 'BD', 'St kosong'].map(k => [k, cp6.filter(x => x === k).length]).concat([['Sensitivitas PNPK 2019: terlambat', arvNeed.map(AU.cp6_pnpk).filter(x => /^Terlambat/.test(x)).length]]));
    {
      const ok6 = cp6.filter(x => x === 'Terjadi dalam batas').length, late = cp6.filter(x => x === 'Kesenjangan: terlambat').length, nos = cp6.filter(x => x === 'Kesenjangan: tidak dimulai').length;
      const ass = ok6 + late + nos + cp6.filter(x => /^Terjadi, waktu/.test(x)).length, pn = arvNeed.map(AU.cp6_pnpk).filter(x => /^Terlambat/.test(x)).length;
      if (arvNeed.length) I(s2, `Di antara ${arvNeed.length} episode TB-HIV yang belum pernah atau pernah terputus ARV saat mulai OAT, ${fmt(ok6, ass)} episode yang dapat dinilai memulai ARV dalam batas Juknis 2023, ${late} terlambat, dan ${nos} tidak dimulai. ${cp6.filter(x => /TC belum|BD|St kosong|Jendela/.test(x)).length} episode belum dapat dinilai (TC belum ditelusuri, BD, St kosong, atau jendela pengamatan belum cukup) dan tidak dihitung sebagai kegagalan. Dengan batas PNPK 2019, ${pn} episode tergolong terlambat; perbedaan kedua acuan menunjukkan sensitivitas temuan terhadap standar yang dipakai.${caution(ass)[0]}`,
        `Among ${arvNeed.length} TB-HIV episodes not on or with interrupted ART at TB treatment start, ${fmt(ok6, ass)} of assessable episodes started ART within the 2023 guideline limit, ${late} were late, and ${nos} did not start. ${cp6.filter(x => /TC belum|BD|St kosong|Jendela/.test(x)).length} episodes could not yet be assessed (not recorded and not traced, ND, blank evidence status, or insufficient observation window) and are not counted as failures. Using the 2019 PNPK limit, ${pn} episodes are late; the difference shows how sensitive the finding is to the standard used.${caution(ass)[1]}`);
      if (late + nos) KEY.push([`CP6: ${late + nos} dari ${ass} episode yang dapat dinilai terlambat atau tidak memulai ARV.`, `CP6: ${late + nos} of ${ass} assessable episodes were late or did not start ART.`]);
    }
    const cnt = (arr, fn) => arr.filter(fn).length;
    T(s2, 'T2.4', 'Kaskade pencegahan pada unit B (Protokol V13 Bagian 6)', ['Tahap', 'Jumlah unit', 'Dari tahap sebelumnya'], (() => {
      const st = [['Unit B dapat ditelaah', cnt(B, d => d.U09 !== 'Tidak dapat ditelaah')], ['Skrining TB tercatat saat mulai ARV (St B03 = Y)', cnt(B, d => d.B03__st === 'Y')],
        ['Skrining negatif atau TB disingkirkan', cnt(B, d => d.B04 === 'Negatif' || d.B05 === 'Bukan TB')], ['Kelayakan TPT dinilai (B08 terisi)', cnt(B, d => has(d.B08) && d.B08 !== 'Tidak tercatat')],
        ['Layak TPT', cnt(B, d => d.B08 === 'Layak')], ['TPT ditawarkan', cnt(B, d => /^Ditawarkan/.test(d.B11 || ''))], ['TPT dimulai (St B13 = Y)', cnt(B, d => d.B13__st === 'Y')],
        ['TPT lengkap', cnt(B, d => d.B16 === 'Lengkap')]];
      return st.map((x, i) => [x[0], x[1], i ? nN(x[1], st[i - 1][1]) : '']);
    })(), 'Persentase bersyarat N(j+1)/N(j). Penurunan diperiksa untuk membedakan ketidaklayakan klinis, penolakan, pengamatan belum cukup, dan status belum diketahui sebelum disebut kegagalan pelayanan.');
    {
      const st = [['Unit B dapat ditelaah', cnt(B, d => d.U09 !== 'Tidak dapat ditelaah')], ['Skrining TB tercatat saat mulai ARV (St B03 = Y)', cnt(B, d => d.B03__st === 'Y')],
        ['Skrining negatif atau TB disingkirkan', cnt(B, d => d.B04 === 'Negatif' || d.B05 === 'Bukan TB')], ['Kelayakan TPT dinilai (B08 terisi)', cnt(B, d => has(d.B08) && d.B08 !== 'Tidak tercatat')],
        ['Layak TPT', cnt(B, d => d.B08 === 'Layak')], ['TPT ditawarkan', cnt(B, d => /^Ditawarkan/.test(d.B11 || ''))], ['TPT dimulai (St B13 = Y)', cnt(B, d => d.B13__st === 'Y')], ['TPT lengkap', cnt(B, d => d.B16 === 'Lengkap')]];
      if (st[0][1]) {
        G(s2, { id: 'G2.3', kind: 'funnel', title: ['Kaskade pencegahan pada unit B', 'Prevention cascade in B units'], steps: st.map(x => ({ label: x[0], n: x[1] })) });
        let drop = null; for (let i = 1; i < st.length; i++) { if (st[i - 1][1] && (!drop || st[i][1] / st[i - 1][1] < drop.r)) drop = { i, r: st[i][1] / st[i - 1][1] }; }
        if (drop) I(s2, `Penurunan bersyarat terbesar pada kaskade pencegahan terjadi dari "${st[drop.i - 1][0]}" ke "${st[drop.i][0]}" (${fmt(st[drop.i][1], st[drop.i - 1][1])} melanjutkan). Sebelum disebut kegagalan pelayanan, penurunan ini perlu dipilah menurut ketidaklayakan klinis, penolakan pasien, pengamatan yang belum cukup, dan status yang belum diketahui. ${st[7][1] && st[6][1] ? 'Dari pasien yang memulai TPT, ' + fmt(st[7][1], st[6][1]) + ' tercatat lengkap.' : ''}`,
          `The largest conditional drop in the prevention cascade is from "${E(st[drop.i - 1][0])}" to "${E(st[drop.i][0])}" (${fmt(st[drop.i][1], st[drop.i - 1][1])} continue). Before calling this a service failure, the drop should be separated into clinical ineligibility, patient refusal, insufficient follow-up, and unknown status. ${st[7][1] && st[6][1] ? 'Of patients who started TPT, ' + fmt(st[7][1], st[6][1]) + ' are recorded as completed.' : ''}`);
      }
    }
    const ruj = [], intr = [];
    A.concat(B).forEach(d => { (d.rujukan || []).forEach(r => ruj.push(r)); (d.interupsi || []).forEach(r => intr.push(r)); });
    const rujT = ruj.filter(r => r.tanggal_rujuk), rujOk = rujT.filter(r => { const x = days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan); return x !== '' && x <= 30; });
    const intI = intr.filter(r => r.jenis === 'Interupsi'), intOk = intI.filter(r => { const x = days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat); return x !== '' && x <= 90; });
    T(s2, 'T2.5', 'Rujukan (CP8) dan kembali berobat (CP12)', ['Ukuran', 'Hasil', 'Median hari (IQR)'], [
      ['Rujukan bertanggal, hadir di tujuan ≤30 hari', nN(rujOk.length, rujT.length), (m => m[0] + ' (' + m[1] + ')')(medIqr(rujT.map(r => days(r.tanggal_rujuk, r.tanggal_hadir_di_tujuan))))],
      ['Interupsi, kembali berobat ≤90 hari', nN(intOk.length, intI.length), (m => m[0] + ' (' + m[1] + ')')(medIqr(intI.map(r => days(r.tanggal_jadwal_terlewat, r.tanggal_kembali_berobat))))]]);
    if (rujT.length || intI.length) I(s2, `${rujT.length ? 'Dari ' + rujT.length + ' rujukan bertanggal, ' + fmt(rujOk.length, rujT.length) + ' tercatat hadir di tujuan dalam 30 hari; rujukan tanpa konfirmasi kedatangan menunjukkan lemahnya umpan balik antar-fasyankes (CP8). ' : ''}${intI.length ? 'Dari ' + intI.length + ' interupsi pengobatan, ' + fmt(intOk.length, intI.length) + ' kembali berobat dalam 90 hari (CP12); sisanya perlu dikaitkan dengan bukti upaya penelusuran di C4.' : ''}`,
      `${rujT.length ? 'Of ' + rujT.length + ' dated referrals, ' + fmt(rujOk.length, rujT.length) + ' are recorded as arriving at the destination within 30 days; referrals without arrival confirmation point to weak feedback between facilities (CP8). ' : ''}${intI.length ? 'Of ' + intI.length + ' treatment interruptions, ' + fmt(intOk.length, intI.length) + ' returned to treatment within 90 days (CP12); the rest should be linked to evidence of tracing efforts in C4.' : ''}`);
    T(s2, 'T2.6', 'Luaran pengobatan TB unit A (sampai 30/06/2026)', ['Luaran', 'Jumlah'], (S.forms.C3.sub[0].sections.flatMap(s => s.fields || []).find(x => x.k === 'A13') || { o: [] }).o.map(o => [o, cnt(A, d => d.A13 === o)]));
    {
      const OUT = (S.forms.C3.sub[0].sections.flatMap(s => s.fields || []).find(x => x.k === 'A13') || { o: [] }).o.map(o => ({ label: o, value: cnt(A, d => d.A13 === o) })).filter(x => x.value);
      const N = OUT.reduce((a, x) => a + x.value, 0);
      if (N) {
        G(s2, { id: 'G2.4', kind: 'hbar', title: ['Luaran pengobatan TB unit A', 'TB treatment outcomes, A units'], items: OUT.map(x => ({ label: x.label, value: x.value, txt: x.value + ' (' + pct(x.value, N) + '%)', color: /Sembuh|lengkap/.test(x.label) ? '#2e8b57' : /Gagal|Putus|Meninggal|Tidak dievaluasi/.test(x.label) ? '#c0503d' : '#8a979a' })) });
        const fav = OUT.filter(x => /Sembuh|lengkap/.test(x.label)).reduce((a, x) => a + x.value, 0), unf = OUT.filter(x => /Gagal|Putus|Meninggal|Tidak dievaluasi/.test(x.label)).reduce((a, x) => a + x.value, 0);
        I(s2, `Luaran berhasil (sembuh atau pengobatan lengkap) tercatat pada ${fmt(fav, N)} unit A dengan luaran terisi; luaran tidak berhasil (gagal, putus berobat, meninggal, tidak dievaluasi) pada ${fmt(unf, N)}. Luaran "masih berobat" dan "pindah" belum menunjukkan hasil akhir. Angka ini menggambarkan sampel episode TB-HIV, bukan angka keberhasilan pengobatan fasyankes.`,
          `Successful outcomes (cured or treatment completed) are recorded in ${fmt(fav, N)} A units with an outcome; unsuccessful outcomes (failed, lost to follow-up, died, not evaluated) in ${fmt(unf, N)}. "Still on treatment" and "transferred out" do not yet show a final outcome. These figures describe the sample of TB-HIV episodes, not facility treatment success rates.`);
        if (unf) KEY.push([`Luaran tidak berhasil pada ${fmt(unf, N)} episode TB-HIV dalam sampel.`, `Unsuccessful outcomes in ${fmt(unf, N)} TB-HIV episodes in the sample.`]);
      }
    }

    /* ---------- 3 Q2 */
    const s3 = sec('q2', '3. Q2 · Kontribusi masalah pencatatan dan keterhubungan sistem', 'Verifikasi dua arah di sentinel (C5) dan perbandingan butir sistem pada unit C3. Temuan sentinel menjelaskan mekanisme dan tidak diekstrapolasi menjadi estimasi kesalahan nasional.');
    const ids = {}; (V.C5.C5ID || []).forEach(r => { ids[r.unit] = r.data; });
    const fvT = v => v === undefined ? '–' : v.toFixed(2) + (v > 1.1 ? ' (pelaporan kurang)' : v < 0.9 ? ' (pelaporan lebih)' : ' (dalam batas)');
    const rows31 = [], jenis = {};
    [['5', 'C5_5', 'TB/HIV-5'], ['6', 'C5_6', 'TB/HIV-6'], ['41a', 'C5_41a', 'TB/HIV-4.1a']].forEach(([ind, sub, nm]) => (V.C5[sub] || []).forEach(r => {
      const id = ids[r.unit] || {}; const c = RCA.c5.ctx(ind, id); const x = RCA.c5.recap(r.data.cocok || [], c, id);
      Object.entries(x.jenis).forEach(([k, v]) => { jenis[nm] = jenis[nm] || {}; jenis[nm][k] = (jenis[nm][k] || 0) + v; });
      rows31.push([r.unit, nm, c.met || '–', c.model || '–', (x.lapN !== null ? x.lapN : '–') + '/' + (x.lapD !== null ? x.lapD : '–'), x.N_sis + '/' + x.D_sis, x.N_src + '/' + x.D_src, fvT(x.FV_N), fvT(x.FV_D), x.alasan || 'Sah']);
    }));
    T(s3, 'T3.1', 'Penghitungan ulang dan faktor verifikasi per sentinel (N/D)', ['Sentinel', 'Indikator', 'Metode', 'Model', 'Dilaporkan N/D', 'Sistem N/D', 'Sumber N/D', 'FV pembilang', 'FV penyebut', 'Kesahihan'], rows31,
      'FV = hitung ulang ÷ dilaporkan; batas kerja 0,90–1,10. FV hanya sah untuk model A, sensus periode efektif, kedua arah selesai, dan tanpa baris yang belum diperiksa.');
    {
      const fvs = []; [['5', 'C5_5', 'TB/HIV-5'], ['6', 'C5_6', 'TB/HIV-6'], ['41a', 'C5_41a', 'TB/HIV-4.1a']].forEach(([ind, sub, nm]) => (V.C5[sub] || []).forEach(r => {
        const id = ids[r.unit] || {}; const x = RCA.c5.recap(r.data.cocok || [], RCA.c5.ctx(ind, id), id);
        if (x.FV_N !== undefined) fvs.push({ label: r.unit + ' ' + nm + ' (N)', value: x.FV_N, sah: !x.alasan }); if (x.FV_D !== undefined) fvs.push({ label: r.unit + ' ' + nm + ' (D)', value: x.FV_D, sah: !x.alasan }); }));
      if (fvs.length) {
        G(s3, { id: 'G3.1', kind: 'dot', title: ['Faktor verifikasi per sentinel dan indikator', 'Verification factor by sentinel and indicator'], items: fvs, band: [0.9, 1.1], note: ['Pita hijau = batas kerja 0,90–1,10; titik berongga = FV belum sah.', 'Green band = working range 0.90–1.10; hollow dots = VF not yet valid.'] });
        const out = fvs.filter(x => x.sah && (x.value < 0.9 || x.value > 1.1));
        I(s3, `${fvs.filter(x => x.sah).length} dari ${fvs.length} faktor verifikasi memenuhi syarat sah. ${out.length ? 'Di luar batas kerja: ' + out.map(x => x.label + ' = ' + x.value.toFixed(2) + (x.value > 1.1 ? ' (pelaporan kurang)' : ' (pelaporan lebih)')).join('; ') + '. Pelaporan kurang berarti layanan yang ditemukan di sumber tidak seluruhnya masuk laporan; pelaporan lebih berarti laporan memuat entri tanpa bukti sumber atau duplikasi.' : 'Semua FV sah berada dalam batas kerja 0,90–1,10.'} Temuan ini menjelaskan mekanisme di sentinel dan tidak diekstrapolasi ke tingkat nasional.`,
          `${fvs.filter(x => x.sah).length} of ${fvs.length} verification factors meet validity conditions. ${out.length ? 'Outside the working range: ' + out.map(x => x.label + ' = ' + x.value.toFixed(2) + (x.value > 1.1 ? ' (under-reporting)' : ' (over-reporting)')).join('; ') + '. Under-reporting means services found in source documents are not all in the report; over-reporting means the report contains entries without source evidence or duplicates.' : 'All valid VFs are within the 0.90–1.10 working range.'} These findings explain mechanisms at sentinel sites and are not extrapolated nationally.`);
        if (out.length) KEY.push([`C5: ${out.length} faktor verifikasi sah di luar batas 0,90–1,10.`, `C5: ${out.length} valid verification factors outside 0.90–1.10.`]);
      }
    }
    const JN = ['Sesuai', 'Pelayanan belum tercatat dalam sistem', 'Entri tanpa bukti sumber', 'Perbedaan definisi atau periode', 'Duplikasi', 'Perpindahan fasilitas', 'Keterlambatan entri', 'Perbedaan belum terselesaikan'];
    T(s3, 'T3.2', 'Jenis ketidaksesuaian yang ditetapkan (jumlah baris)', ['Jenis'].concat(['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a']), JN.map(j => [j].concat(['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a'].map(n => (jenis[n] || {})[j] || 0))));
    {
      const IN = ['TB/HIV-5', 'TB/HIV-6', 'TB/HIV-4.1a'], JX = JN.filter(j => j !== 'Sesuai'), COL = ['#c0503d', '#e08a3c', '#9467bd', '#5b8fd4', '#2aa198', '#e2b33c', '#8a979a'];
      const tot = JX.reduce((a, j) => a + IN.reduce((b, n) => b + ((jenis[n] || {})[j] || 0), 0), 0), ses = IN.reduce((b, n) => b + ((jenis[n] || {}).Sesuai || 0), 0);
      if (tot) {
        G(s3, { id: 'G3.2', kind: 'stack', title: ['Jenis ketidaksesuaian per indikator (baris)', 'Types of discrepancy by indicator (rows)'], series: JX.map((j, i) => ({ label: j, color: COL[i] })), rows: IN.map(n => ({ label: n, parts: JX.map(j => (jenis[n] || {})[j] || 0) })).filter(r => r.parts.some(Boolean)) });
        const rank = JX.map(j => [j, IN.reduce((b, n) => b + ((jenis[n] || {})[j] || 0), 0)]).filter(x => x[1]).sort((a, b) => b[1] - a[1]);
        const svc = rank.filter(x => /Pelayanan belum tercatat/.test(x[0])).reduce((a, x) => a + x[1], 0);
        I(s3, `Dari ${tot + ses} baris yang dicocokkan, ${fmt(tot, tot + ses)} tidak sesuai. Jenis terbanyak: ${joinId(rank.slice(0, 3).map(x => x[0].toLowerCase() + ' (' + x[1] + ')'))}. ${svc ? 'Pelayanan yang ada di dokumen sumber tetapi belum tercatat di sistem (' + svc + ' baris) menunjukkan masalah alur entri data, bukan pelayanan yang tidak diberikan.' : ''}`,
          `Of ${tot + ses} matched rows, ${fmt(tot, tot + ses)} do not match. Most common types: ${joinEn(rank.slice(0, 3).map(x => E(x[0]).toLowerCase() + ' (' + x[1] + ')'))}. ${svc ? 'Services present in source documents but not recorded in the system (' + svc + ' rows) indicate data-entry workflow problems rather than services not provided.' : ''}`);
      }
    }
    const sysItems = [['A15 Status HIV di SITB', A, 'A15'], ['A16 Pengobatan ARV di SITB', A, 'A16'], ['A17 Luaran TB di SITB', A, 'A17'], ['B18 Tanggal mulai ARV di SIHA', B, 'B18'], ['B19 Pemberian TPT di SIHA', B, 'B19'], ['B20 Luaran TPT di SIHA', B, 'B20'], ['T05 Status ARV per 30/06/2026 di SIHA', A.concat(B), 'T05']];
    T(s3, 'T3.3', 'Kesesuaian butir sistem pada unit C3', ['Butir', 'Ya, sesuai', 'Ya, berbeda', 'Tidak tercatat', 'Belum dicek'], sysItems.map(([l, arr, k]) => [l].concat(['Ya, sesuai', 'Ya, berbeda', 'Tidak tercatat', 'Belum dicek'].map(v => cnt(arr, d => d[k] === v)))));
    {
      const rows = sysItems.map(([l, arr, k]) => ({ label: l.split(' ')[0], full: l, parts: ['Ya, sesuai', 'Ya, berbeda', 'Tidak tercatat', 'Belum dicek'].map(v => cnt(arr, d => d[k] === v)) })).filter(r => r.parts.some(Boolean));
      if (rows.length) {
        G(s3, { id: 'G3.3', kind: 'stack', pct: true, title: ['Kesesuaian butir sistem (SITB/SIHA) pada unit C3', 'Agreement of system items (SITB/SIHA) in C3 units'], series: [{ label: 'Ya, sesuai', color: '#2e8b57' }, { label: 'Ya, berbeda', color: '#e08a3c' }, { label: 'Tidak tercatat', color: '#c0503d' }, { label: 'Belum dicek', color: '#b8c2c4' }], rows });
        const ck = rows.map(r => ({ r, chk: r.parts[0] + r.parts[1] + r.parts[2], bad: r.parts[1] + r.parts[2] })).filter(x => x.chk).sort((a, b) => b.bad / b.chk - a.bad / a.chk);
        if (ck.length) I(s3, `Butir sistem dengan ketidaksesuaian tertinggi (berbeda atau tidak tercatat di sistem) adalah ${joinId(ck.slice(0, 2).map(x => x.r.full + ' ' + fmt(x.bad, x.chk)))}. ${rows.reduce((a, r) => a + r.parts[3], 0)} isian masih "belum dicek" dan perlu dilengkapi sebelum kesimpulan tentang keterhubungan SITB–SIHA dibuat.`,
          `System items with the highest discrepancy (differing or not recorded in the system) are ${joinEn(ck.slice(0, 2).map(x => E(x.r.full) + ' ' + fmt(x.bad, x.chk)))}. ${rows.reduce((a, r) => a + r.parts[3], 0)} entries are still "not checked" and should be completed before drawing conclusions on SITB–SIHA linkage.`);
      }
    }
    const mek = {}; C.forEach(d => { const m = AU.cp3_mek(d); if (m) mek[m] = (mek[m] || 0) + 1; });
    T(s3, 'T3.4', 'CP3: mekanisme penetapan status HIV (pelayanan vs pencatatan)', ['Mekanisme', 'Jumlah episode'], Object.entries(mek).sort((a, b) => b[1] - a[1]));
    {
      const tm = Object.values(mek).reduce((a, b) => a + b, 0), sv = Object.entries(mek).filter(([k]) => /^Pelayanan/.test(k)).reduce((a, x) => a + x[1], 0), rc = Object.entries(mek).filter(([k]) => /^Pencatatan/.test(k)).reduce((a, x) => a + x[1], 0);
      if (tm) {
        G(s3, { id: 'G3.4', kind: 'hbar', title: ['CP3: mekanisme penetapan status HIV', 'CP3: mechanism of HIV status ascertainment'], items: Object.entries(mek).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v, txt: String(v), color: /^Pelayanan/.test(k) ? '#c0503d' : /^Pencatatan/.test(k) ? '#e08a3c' : /^Sesuai|tercatat sesuai/.test(k) ? '#2e8b57' : '#8a979a' })) });
        I(s3, `Pada ${tm} episode CP3, ${fmt(sv, tm)} menunjukkan masalah pelayanan (tes tidak ditawarkan, ditawarkan tetapi tidak dites, atau ditolak) dan ${fmt(rc, tm)} masalah pencatatan (sudah dites atau status lama diketahui, tetapi SITB kosong atau berbeda). ${rc > sv ? 'Masalah pencatatan lebih dominan, sehingga angka status HIV di sistem kemungkinan lebih rendah daripada pelayanan yang sebenarnya.' : sv > rc ? 'Masalah pelayanan lebih dominan, sehingga perbaikan perlu menyasar penawaran dan pelaksanaan tes HIV.' : ''}`,
          `In ${tm} CP3 episodes, ${fmt(sv, tm)} show service problems (test not offered, offered but not tested, or declined) and ${fmt(rc, tm)} recording problems (tested or previously known, but SITB blank or different). ${rc > sv ? 'Recording problems dominate, so system HIV status figures likely understate actual services.' : sv > rc ? 'Service problems dominate, so improvement should target offering and performing HIV tests.' : ''}`);
        KEY.push([`CP3: ${sv} masalah pelayanan dan ${rc} masalah pencatatan dari ${tm} episode.`, `CP3: ${sv} service and ${rc} recording problems out of ${tm} episodes.`]);
      }
    }

    /* ---------- 4 Q3 */
    const s4 = sec('q3', '4. Q3 · Perbandingan pasangan kab/kota capaian rendah dan tinggi', 'Perbandingan dalam provinsi memerlukan periode, definisi, dan perspektif yang setara. Tabel ini menyandingkan bukti; penjelasan perbedaan diuji melalui WP7.');
    const kkRow = k => {
      const c1 = (V.C1.C1 || []).find(r => r.unit === k.code); const du = (c1 && c1.data.dugaan) || [];
      const a = A.filter(d => d._kk === k.code), b = B.filter(d => d._kk === k.code), cc = C.filter(d => d._kk === k.code);
      const r = RCA.c3Rekap(a, b, cc); const g = cp => r[cp] ? nN(r[cp].acak_n, r[cp].acak_N) : '–';
      const c4 = (V.C4.C4 || []).filter(x => x.kk === k.code); const kl = c4.flatMap(x => Object.values(x.data.matriks_cp || {}).map(m => m.klasifikasi || ''));
      return [k.name, k.capaian, c1 ? (c1.data.skor || '–') : '–', du.length ? du.filter(x => x.status === 'Didukung').length + '/' + du.filter(x => x.status === 'Dibantah').length + '/' + du.length : '–',
        g('CP3'), g('CP6'), g('CP7'), g('CP8'), kl.filter(x => /terverifikasi/i.test(x)).length + '/' + kl.filter(x => /sebagian/i.test(x)).length + '/' + kl.filter(x => /tidak terlaksana/i.test(x)).length];
    };
    T(s4, 'T4.1', 'Perbandingan pasangan kab/kota', ['Kab/kota', 'Capaian', 'Skor kaskade C1', 'Dugaan C1 didukung/dibantah/total', 'CP3 acak n/N', 'CP6 acak n/N', 'CP7 acak n/N', 'CP8 acak n/N', 'CP C4: terverifikasi/sebagian/tidak'],
      RCA.state.regions.kk.filter(k => !f.prov || k.prov === f.prov).sort((a, b) => a.prov.localeCompare(b.prov) || a.capaian.localeCompare(b.capaian)).map(kkRow));
    {
      const KK = RCA.state.regions.kk.filter(k => !f.prov || k.prov === f.prov);
      const gap = (k, cp) => { const r = RCA.c3Rekap(A.filter(d => d._kk === k.code), B.filter(d => d._kk === k.code), C.filter(d => d._kk === k.code))[cp]; return r && r.acak_N ? { p: pr(r.acak_n, r.acak_N), N: r.acak_N } : null; };
      const cps4 = ['CP3', 'CP6', 'CP7', 'CP8'];
      const cats = KK.filter(k => cps4.some(c => gap(k, c)));
      if (cats.length) G(s4, { id: 'G4.1', kind: 'group', title: ['Kesenjangan unit acak/sensus per kab/kota (%)', 'Gaps in random/census units by district/city (%)'], pct: true, max: 100,
        cats: cats.map(k => k.name + (k.capaian ? ' (' + k.capaian + ')' : '')), series: cps4.map((c, i) => ({ label: c, color: ['#0f5c63', '#3d8bd4', '#e2b33c', '#c0503d'][i], values: cats.map(k => (gap(k, c) || {}).p || 0) })) });
      const lines = [[], []];
      [...new Set(KK.map(k => k.prov))].forEach(pv => {
        const lo = KK.find(k => k.prov === pv && /rendah/i.test(k.capaian)), hi = KK.find(k => k.prov === pv && /tinggi/i.test(k.capaian)); if (!lo || !hi) return;
        const diffs = cps4.map(c => ({ c, a: gap(lo, c), b: gap(hi, c) })).filter(x => x.a && x.b && x.a.N >= 3 && x.b.N >= 3 && Math.abs(x.a.p - x.b.p) >= 15);
        const pn = RCA.reg.prov(pv).name;
        if (diffs.length) { lines[0].push(`${pn}: ${diffs.map(x => x.c + ' ' + lo.name + ' ' + x.a.p + '% vs ' + hi.name + ' ' + x.b.p + '%').join('; ')}`); lines[1].push(`${E(pn)}: ${diffs.map(x => x.c + ' ' + E(lo.name) + ' ' + x.a.p + '% vs ' + E(hi.name) + ' ' + x.b.p + '%').join('; ')}`); }
      });
      I(s4, lines[0].length ? 'Perbedaan kesenjangan sekurang-kurangnya 15 poin persentase antara pasangan kab/kota (dengan N ≥ 3 di kedua sisi): ' + lines[0].join(' · ') + '. Perbedaan ini menjadi titik masuk untuk membandingkan proses fasilitas (C4), faktor sistem, dan dugaan C1; penjelasannya diuji pada WP7, bukan disimpulkan dari angka saja.'
        : 'Belum ada perbedaan kesenjangan yang cukup besar (≥ 15 poin persentase) dengan jumlah unit memadai antara pasangan kab/kota capaian rendah dan tinggi. Perbandingan dilanjutkan setelah lebih banyak unit Valid.',
        lines[1].length ? 'Gap differences of at least 15 percentage points between district/city pairs (with N ≥ 3 on both sides): ' + lines[1].join(' · ') + '. These differences are entry points for comparing facility processes (C4), system factors, and C1 hypotheses; explanations are tested in WP7 rather than concluded from the numbers alone.'
          : 'No sufficiently large gap differences (≥ 15 percentage points) with adequate unit numbers have yet emerged between low- and high-performing district/city pairs. The comparison continues as more units are validated.');
    }

    /* ---------- 5 profil proses fasilitas */
    const s5 = sec('c4', '5. Profil proses fasilitas dan 14 titik penilaian (C4; masukan D3)', 'Klasifikasi CP ditetapkan dari bukti proses dan unit acak/sensus. Keempat belas CP tidak dijumlahkan menjadi skor fasilitas.');
    const c4r = V.C4.C4 || []; const cpk = Object.keys(CP_INFO);
    const ab = v => /terverifikasi/i.test(v) ? 'Terverifikasi' : /sebagian/i.test(v) ? 'Sebagian' : /tidak terlaksana/i.test(v) ? 'Tidak' : /Tidak berlaku/.test(v) ? 'TBL' : /Belum/.test(v) ? 'Belum pasti' : '';
    T(s5, 'T5.1', 'Klasifikasi akhir per CP dan fasyankes', ['Fasyankes'].concat(cpk), c4r.map(r => [r.unit].concat(cpk.map(c => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')))));
    if (c4r.some(r => cpk.some(c => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')))) G(s5, { id: 'G5.1', kind: 'heat', title: ['Klasifikasi 14 CP per fasyankes (C4)', 'Classification of the 14 CPs by facility (C4)'], cols: cpk, rows: c4r.map(r => ({ label: r.unit, cells: cpk.map(c => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')) })),
      legend: [['Terverifikasi', '#2e8b57'], ['Sebagian', '#e2b33c'], ['Tidak', '#c0503d'], ['Belum pasti', '#9aa5a8'], ['TBL', '#e6ebec']] });
    T(s5, 'T5.2', 'Rekap klasifikasi per CP (jumlah fasyankes)', ['CP', 'Fokus', 'Terverifikasi', 'Sebagian/terlambat', 'Tidak terlaksana', 'Belum pasti', 'TBL'],
      cpk.map(c => { const v = c4r.map(r => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')); return [c, (CP_INFO[c] || {}).fokus].concat(['Terverifikasi', 'Sebagian', 'Tidak', 'Belum pasti', 'TBL'].map(k => v.filter(x => x === k).length)); }));
    if (c4r.length) {
      const sc = cpk.map(c => { const v = c4r.map(r => ab(((r.data.matriks_cp || {})[c] || {}).klasifikasi || '')); return { c, t: v.filter(x => x === 'Tidak').length, s: v.filter(x => x === 'Sebagian').length, ok: v.filter(x => x === 'Terverifikasi').length }; });
      const wk = sc.filter(x => x.t + x.s).sort((a, b) => (b.t * 2 + b.s) - (a.t * 2 + a.s)).slice(0, 4), st = sc.filter(x => x.ok && !x.t).sort((a, b) => b.ok - a.ok).slice(0, 3);
      I(s5, `Dari ${c4r.length} fasyankes yang dinilai, CP dengan proses paling lemah adalah ${wk.length ? joinId(wk.map(x => x.c + ' ' + (CP_INFO[x.c] || {}).fokus + ' (' + x.t + ' tidak terlaksana, ' + x.s + ' sebagian)')) : '–'}. ${st.length ? 'Proses yang paling sering terverifikasi: ' + joinId(st.map(x => x.c + ' (' + x.ok + ' fasyankes)')) + '. ' : ''}Klasifikasi ini menggambarkan proses pada periode telaah dan tidak dijumlahkan menjadi skor fasilitas.`,
        `Of ${c4r.length} facilities assessed, the weakest processes are at ${wk.length ? joinEn(wk.map(x => x.c + ' ' + E((CP_INFO[x.c] || {}).fokus) + ' (' + x.t + ' not done, ' + x.s + ' partial)')) : '–'}. ${st.length ? 'Most often verified processes: ' + joinEn(st.map(x => x.c + ' (' + x.ok + ' facilities)')) + '. ' : ''}These classifications describe processes during the review period and are not summed into a facility score.`);
      if (wk[0]) KEY.push([`C4: proses terlemah di ${wk[0].c} ${(CP_INFO[wk[0].c] || {}).fokus} (${wk[0].t} fasyankes tidak terlaksana).`, `C4: weakest process at ${wk[0].c} ${E((CP_INFO[wk[0].c] || {}).fokus)} (${wk[0].t} facilities not done).`]);
    }
    const fk = {}; c4r.forEach(r => Object.values(r.data.matriks_cp || {}).forEach(m => (m.faktor || []).forEach(x => { fk[x] = (fk[x] || 0) + 1; })));
    T(s5, 'T5.3', 'Faktor sistem yang dikaitkan dengan temuan CP (WHO building blocks)', ['Faktor', 'Jumlah CP-fasyankes'], Object.entries(fk).sort());
    if (Object.keys(fk).length) {
      G(s5, { id: 'G5.2', kind: 'hbar', title: ['Faktor sistem pada temuan CP (C4)', 'Health-system factors in checkpoint findings (C4)'], items: Object.entries(fk).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k, value: v, txt: String(v) })) });
      const fr = Object.entries(fk).sort((a, b) => b[1] - a[1]);
      I(s5, `Faktor sistem yang paling sering dikaitkan dengan temuan CP adalah ${joinId(fr.slice(0, 3).map(x => x[0] + ' (' + x[1] + ' CP-fasyankes)'))}. Hitungan ini menunjukkan seberapa sering penilai mengaitkan faktor dengan temuan, bukan besarnya pengaruh faktor tersebut.`,
        `The health-system factors most often linked to checkpoint findings are ${joinEn(fr.slice(0, 3).map(x => E(x[0]) + ' (' + x[1] + ' CP–facility)'))}. This count shows how often assessors linked a factor to a finding, not the size of its effect.`);
    }
    const dug = []; c4r.forEach(r => (r.data.dugaan || []).forEach(d => dug.push([r.unit, d.dugaan_penyebab_awal || '', d.cp_terkait || '', d.hasil_akhir || '', d.bukti_penentu || '', d.penjelasan_alternatif_yang || ''])));
    T(s5, 'T5.4', 'Hasil uji dugaan penyebab awal C1 di fasyankes', ['Fasyankes', 'Dugaan', 'CP', 'Hasil akhir', 'Bukti penentu', 'Penjelasan alternatif'], dug);
    if (dug.length) { const hc = {}; dug.forEach(d => { const k = d[3] || 'Belum diisi'; hc[k] = (hc[k] || 0) + 1; });
      I(s5, `Dari ${dug.length} dugaan C1 yang diuji di fasyankes: ${Object.entries(hc).map(([k, v]) => v + ' ' + k.toLowerCase()).join(', ')}. Dugaan yang dibantah tetap penting karena menyingkirkan penjelasan yang tidak didukung bukti.`,
        `Of ${dug.length} C1 hypotheses tested at facilities: ${Object.entries(hc).map(([k, v]) => v + ' ' + E(k).toLowerCase()).join(', ')}. Refuted hypotheses remain important because they rule out explanations not supported by evidence.`); }
    const pb = []; c4r.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, m]) => { if (m.praktik_baik) pb.push([r.unit, cp, m.praktik_baik]); }));
    T(s5, 'T5.5', 'Praktik yang berjalan baik', ['Fasyankes', 'CP', 'Uraian'], pb);

    /* ---------- 6 Q4 */
    const s6 = sec('q4', '6. Q4 · Tahap kematian dan peluang perbaikan pelayanan (C6; WP5)', 'Telaah berbasis catatan untuk pembelajaran program, tanpa menyalahkan. Sampel purposif hingga 60 kasus tidak dipakai untuk angka mortalitas, kekurangan pelaporan, atau proporsi kematian yang dapat dicegah.');
    const A6 = {}, B6 = {}, C6 = {}, P6 = {};
    (V.C6.C6A || []).forEach(r => { A6[r.unit] = r.data; }); (V.C6.C6B || []).forEach(r => { B6[r.unit] = r.data; }); (V.C6.C6C || []).forEach(r => { C6[r.unit] = r.data; }); (V.C6.C6P || []).forEach(r => { P6[r.unit] = r.data; });
    const kat = {}; Object.values(A6).forEach(d => { const k = AU.c6_kategori(d); kat[k] = (kat[k] || 0) + 1; });
    T(s6, 'T6.1', 'Waktu kematian sejak mulai OAT', ['Kategori', 'Jumlah kasus'], ['Sebelum OAT', '0–14 hari', '15–30 hari', '31–90 hari', '91–180 hari', 'Lebih dari 180 hari', 'Waktu OAT tidak diketahui', 'Tanggal tidak diketahui'].map(k => [k, kat[k] || 0]));
    {
      const KT = ['Sebelum OAT', '0–14 hari', '15–30 hari', '31–90 hari', '91–180 hari', 'Lebih dari 180 hari', 'Waktu OAT tidak diketahui', 'Tanggal tidak diketahui'];
      const nk = KT.slice(0, 6).reduce((a, k) => a + (kat[k] || 0), 0), early = ['Sebelum OAT', '0–14 hari', '15–30 hari'].reduce((a, k) => a + (kat[k] || 0), 0);
      if (Object.keys(kat).length) {
        G(s6, { id: 'G6.1', kind: 'hbar', title: ['Waktu kematian sejak mulai OAT (kasus C6)', 'Time to death since TB treatment start (C6 cases)'], items: KT.map(k => ({ label: k, value: kat[k] || 0, txt: String(kat[k] || 0), color: /Sebelum|0–14|15–30/.test(k) ? '#c0503d' : /tidak diketahui/.test(k) ? '#b8c2c4' : '#3d8bd4' })) });
        I(s6, `Dari ${nk} kasus dengan waktu yang diketahui, ${fmt(early, nk)} meninggal sebelum OAT atau dalam 30 hari pertama pengobatan. Kematian dini mengarah pada keterlambatan diagnosis TB/HIV dan inisiasi terapi, sedangkan kematian setelah 90 hari lebih terkait dengan pemantauan, kepatuhan, dan penanganan saat memburuk. Sampel C6 purposif sehingga distribusi ini tidak menggambarkan angka kematian.${caution(nk)[0]}`,
          `Of ${nk} cases with known timing, ${fmt(early, nk)} died before TB treatment or within the first 30 days. Early deaths point to delays in TB/HIV diagnosis and treatment initiation, while deaths after 90 days relate more to monitoring, adherence, and management of deterioration. The C6 sample is purposive, so this distribution does not represent mortality rates.${caution(nk)[1]}`);
        if (early) KEY.push([`C6: ${fmt(early, nk)} kematian terjadi sebelum OAT atau ≤30 hari pengobatan.`, `C6: ${fmt(early, nk)} deaths occurred before TB treatment or within 30 days.`]);
      }
    }
    const TT = [['T1', 'Akses dan diagnosis'], ['T2', 'Awal terapi'], ['T3', 'Pemantauan'], ['T4', 'Rujukan'], ['T5', 'Penanganan saat memburuk']];
    T(s6, 'T6.2', 'Mutu pelayanan per fase dan kesepakatan antarpenelaah', ['Fase', 'Dinilai (P1)', 'Mutu kurang (skor 1–2)', 'Median skor', 'Pasangan P1–P2', 'Sepakat tepat', 'Kappa dikotomi'],
      TT.map(([t, l]) => { const s1 = Object.values(B6).map(b => ((b.B1 || {})[t] || {}).skor).filter(v => /^[1-5]$/.test(v));
        const pr = Object.keys(C6).map(u => [(((B6[u] || {}).B1 || {})[t] || {}).skor, ((C6[u].C1 || {})[t] || {}).skor]).filter(p => /^[1-5]$/.test(p[0]) && /^[1-5]$/.test(p[1])); const k = RCA.kappa(pr);
        return [t + ' ' + l, s1.length, nN(s1.filter(v => v <= 2).length, s1.length), q(s1, .5) === null ? '–' : q(s1, .5), pr.length, nN(pr.filter(p => p[0] === p[1]).length, pr.length), k.kappa === null ? (pr.length < 5 ? 'n < 5' : '–') : k.kappa.toFixed(2)]; }));
    {
      const ph = TT.map(([t, l]) => { const s1 = Object.values(B6).map(b => ((b.B1 || {})[t] || {}).skor).filter(v => /^[1-5]$/.test(v)); return { label: t + ' ' + l, n: s1.length, poor: s1.filter(v => v <= 2).length }; }).filter(x => x.n);
      const kp = TT.map(([t]) => { const p2 = Object.keys(C6).map(u => [(((B6[u] || {}).B1 || {})[t] || {}).skor, ((C6[u].C1 || {})[t] || {}).skor]).filter(p => /^[1-5]$/.test(p[0]) && /^[1-5]$/.test(p[1])); return RCA.kappa(p2).kappa; }).filter(k => k !== null);
      if (ph.length) {
        G(s6, { id: 'G6.2', kind: 'hbar', pct: true, max: 100, title: ['Mutu pelayanan kurang (skor 1–2) per fase', 'Poor quality of care (score 1–2) by phase'], items: ph.map(x => ({ label: x.label, value: pr(x.poor, x.n), txt: x.poor + '/' + x.n })) });
        const w = ph.slice().sort((a, b) => b.poor / b.n - a.poor / a.n)[0];
        const kd = kp.length ? kp.reduce((a, b) => a + b, 0) / kp.length : null, kl = kd === null ? null : kd < 0.2 ? ['lemah', 'slight'] : kd < 0.4 ? ['cukup', 'fair'] : kd < 0.6 ? ['sedang', 'moderate'] : kd < 0.8 ? ['baik', 'substantial'] : ['sangat baik', 'almost perfect'];
        I(s6, `Fase dengan proporsi mutu kurang tertinggi adalah ${w.label} (${fmt(w.poor, w.n)} kasus dinilai skor 1–2 oleh penelaah pertama). ${kd !== null ? 'Rata-rata kappa antarpenelaah ' + kd.toFixed(2) + ' (kesepakatan ' + kl[0] + ' menurut Landis–Koch); ' + (kd < 0.6 ? 'kasus dengan perbedaan penilaian perlu dibahas di panel sebelum disimpulkan.' : 'penilaian cukup konsisten.') : 'Kesepakatan antarpenelaah belum dapat dihitung (pasangan penilaian < 5).'}`,
          `The phase with the highest share of poor quality is ${E(w.label)} (${fmt(w.poor, w.n)} cases rated 1–2 by the first reviewer). ${kd !== null ? 'Mean inter-reviewer kappa ' + kd.toFixed(2) + ' (' + kl[1] + ' agreement per Landis–Koch); ' + (kd < 0.6 ? 'cases with differing ratings should be discussed at the panel before conclusions are drawn.' : 'ratings are reasonably consistent.') : 'Inter-reviewer agreement cannot yet be computed (fewer than 5 rating pairs).'}`);
      }
    }
    const bs = Object.values(B6);
    T(s6, 'T6.3', 'Peluang perbaikan dan tiga keterlambatan (penilaian pertama; akhir bila sudah dipanelkan)', ['Ukuran', 'Hasil'], [
      ['Peluang perbaikan (P1 = Ya)', nN(bs.filter(b => b.peluang === 'Ya').length, bs.length)],
      ['Peluang perbaikan akhir setelah panel', nN(Object.values(P6).filter(p => p.peluang_akhir === 'Ya').length, Object.keys(P6).length)],
      ['Keterlambatan 1: mencari pelayanan', nN(bs.filter(b => ((b.B2 || {}).d1 || {}).nilai === 'Ada').length, bs.length)],
      ['Keterlambatan 2: mencapai layanan tepat', nN(bs.filter(b => ((b.B2 || {}).d2 || {}).nilai === 'Ada').length, bs.length)],
      ['Keterlambatan 3: tata laksana di fasyankes', nN(bs.filter(b => ((b.B2 || {}).d3 || {}).nilai === 'Ada').length, bs.length)],
      ['Dugaan terkait TB (bukan sebab resmi)', bs.filter(b => b.hubungan === 'Terkait TB').length]]);
    if (bs.length) {
      const dl = [['Keterlambatan 1: mencari pelayanan', 'd1'], ['Keterlambatan 2: mencapai layanan tepat', 'd2'], ['Keterlambatan 3: tata laksana di fasyankes', 'd3']].map(([l, k]) => ({ label: l, n: bs.filter(b => ((b.B2 || {})[k] || {}).nilai === 'Ada').length }));
      const po = bs.filter(b => b.peluang === 'Ya').length;
      G(s6, { id: 'G6.3', kind: 'hbar', pct: true, max: 100, title: ['Peluang perbaikan dan tiga keterlambatan (penilaian pertama)', 'Improvement opportunities and the three delays (first review)'],
        items: [{ label: 'Peluang perbaikan (P1 = Ya)', value: pr(po, bs.length), txt: po + '/' + bs.length, color: '#0f5c63' }].concat(dl.map(x => ({ label: x.label, value: pr(x.n, bs.length), txt: x.n + '/' + bs.length, color: '#e08a3c' }))) });
      const md = dl.slice().sort((a, b) => b.n - a.n)[0];
      I(s6, `Penelaah pertama menilai ada peluang perbaikan pelayanan pada ${fmt(po, bs.length)} kasus. Keterlambatan yang paling sering adalah ${md.label.toLowerCase()} (${fmt(md.n, bs.length)}). ${dl[2].n >= dl[0].n ? 'Keterlambatan di dalam fasyankes sama atau lebih sering daripada keterlambatan mencari pelayanan, sehingga perbaikan tata laksana dan rujukan berada dalam kendali program.' : 'Keterlambatan sebelum mencapai fasyankes lebih sering, sehingga penemuan kasus dan akses komunitas perlu mendapat perhatian.'} Penilaian akhir mengikuti hasil panel.`,
        `The first reviewer judged an improvement opportunity in ${fmt(po, bs.length)} cases. The most frequent delay is ${E(md.label).toLowerCase()} (${fmt(md.n, bs.length)}). ${dl[2].n >= dl[0].n ? 'Delays within facilities are as frequent as or more frequent than delays in seeking care, so improving management and referral is within programme control.' : 'Delays before reaching a facility are more frequent, so case finding and community access need attention.'} Final judgements follow the panel.`);
    }
    const mas = []; Object.entries(B6).forEach(([u, b]) => (b.B4 || []).forEach(x => mas.push([u, x.fase || '', x.masalah || '', (x.faktor || []).join('; '), x.klas || '', x.peluang || '', x.keyakinan || ''])));
    T(s6, 'T6.4', 'Masalah, faktor penyumbang, dan peluang perbaikan (B4)', ['Kasus', 'Fase', 'Masalah', 'Faktor sistem', 'Klasifikasi', 'Peluang perbaikan', 'Keyakinan'], mas);
    if (mas.length) { const f6 = {}; mas.forEach(m => String(m[3]).split('; ').filter(Boolean).forEach(x => { f6[x] = (f6[x] || 0) + 1; })); const r6 = Object.entries(f6).sort((a, b) => b[1] - a[1]);
      if (r6.length) I(s6, `Pada ${mas.length} masalah yang diidentifikasi di telaah kematian, faktor penyumbang tersering adalah ${joinId(r6.slice(0, 3).map(x => x[0] + ' (' + x[1] + ')'))}. Pola ini perlu dibandingkan dengan faktor yang muncul di C4 untuk melihat apakah masalah yang sama terjadi pada pasien yang masih hidup.`,
        `Across ${mas.length} problems identified in death reviews, the most frequent contributing factors are ${joinEn(r6.slice(0, 3).map(x => E(x[0]) + ' (' + x[1] + ')'))}. This pattern should be compared with the factors emerging in C4 to see whether the same problems affect living patients.`); }

    /* ---------- 7 Q5 */
    const s7 = sec('q5', '7. Q5 · Kelompok yang belum mencapai tahap berikutnya dan hambatan yang dialami', 'Pemilahan sampel C3 menurut jenis kelamin dan umur, serta tema pengalaman pasien, komunitas, dan petugas (C7). Jumlah informan menunjukkan partisipasi, bukan prevalensi hambatan.');
    const grp = (d, by) => by === 'jk' ? (d.U12 || 'Tidak tercatat') : (d.U11 === undefined || d.U11 === '' ? 'Tidak tercatat' : Number(d.U11) < 25 ? '< 25 tahun' : Number(d.U11) < 50 ? '25–49 tahun' : '≥ 50 tahun');
    ['jk', 'umur'].forEach(by => {
      const keys = [...new Set(A.concat(B).map(d => grp(d, by)))].sort();
      T(s7, by === 'jk' ? 'T7.1' : 'T7.2', 'Kesenjangan pada unit acak/sensus menurut ' + (by === 'jk' ? 'jenis kelamin' : 'kelompok umur'), [by === 'jk' ? 'Jenis kelamin' : 'Umur', 'CP2', 'CP5', 'CP6', 'CP7', 'CP10'],
        keys.map(k => { const r = RCA.c3Rekap(A.filter(d => grp(d, by) === k), B.filter(d => grp(d, by) === k), []); return [k].concat(['CP2', 'CP5', 'CP6', 'CP7', 'CP10'].map(cp => r[cp] ? nN(r[cp].acak_n, r[cp].acak_N) : '–')); }));
      {
        const ks = keys.filter(k => k !== 'Tidak tercatat'), CPg = ['CP2', 'CP5', 'CP6', 'CP7', 'CP10'];
        const RR = {}; ks.forEach(k => { RR[k] = RCA.c3Rekap(A.filter(d => grp(d, by) === k), B.filter(d => grp(d, by) === k), []); });
        if (ks.length > 1 && CPg.some(cp => ks.some(k => (RR[k][cp] || {}).acak_N))) {
          G(s7, { id: by === 'jk' ? 'G7.1' : 'G7.2', kind: 'group', pct: true, max: 100, title: by === 'jk' ? ['Kesenjangan menurut jenis kelamin (%)', 'Gaps by sex (%)'] : ['Kesenjangan menurut kelompok umur (%)', 'Gaps by age group (%)'],
            cats: CPg, series: ks.map((k, i) => ({ label: k, color: ['#0f5c63', '#e08a3c', '#9467bd', '#8a979a'][i % 4], values: CPg.map(cp => { const o = RR[k][cp]; return o && o.acak_N ? pr(o.acak_n, o.acak_N) : 0; }) })) });
          const df = [];
          CPg.forEach(cp => { const v = ks.map(k => ({ k, o: RR[k][cp] })).filter(x => x.o && x.o.acak_N >= 5); if (v.length < 2) return; v.sort((a, b) => pr(b.o.acak_n, b.o.acak_N) - pr(a.o.acak_n, a.o.acak_N)); const d = pr(v[0].o.acak_n, v[0].o.acak_N) - pr(v[v.length - 1].o.acak_n, v[v.length - 1].o.acak_N); if (d >= 15) df.push({ cp, hi: v[0], lo: v[v.length - 1], d }); });
          I(s7, df.length ? `Menurut ${by === 'jk' ? 'jenis kelamin' : 'kelompok umur'}, perbedaan kesenjangan ≥ 15 poin persentase (N ≥ 5 per kelompok) terlihat pada ${df.map(x => x.cp + ': ' + x.hi.k + ' ' + pr(x.hi.o.acak_n, x.hi.o.acak_N) + '% vs ' + x.lo.k + ' ' + pr(x.lo.o.acak_n, x.lo.o.acak_N) + '%').join('; ')}. Kelompok dengan kesenjangan lebih tinggi perlu dikaitkan dengan hambatan yang dilaporkan di C7.`
            : `Menurut ${by === 'jk' ? 'jenis kelamin' : 'kelompok umur'}, belum terlihat perbedaan kesenjangan ≥ 15 poin persentase dengan jumlah unit memadai (N ≥ 5 per kelompok).`,
            df.length ? `By ${by === 'jk' ? 'sex' : 'age group'}, gap differences of ≥ 15 percentage points (N ≥ 5 per group) appear at ${df.map(x => x.cp + ': ' + E(x.hi.k) + ' ' + pr(x.hi.o.acak_n, x.hi.o.acak_N) + '% vs ' + E(x.lo.k) + ' ' + pr(x.lo.o.acak_n, x.lo.o.acak_N) + '%').join('; ')}. Groups with higher gaps should be linked to barriers reported in C7.`
              : `By ${by === 'jk' ? 'sex' : 'age group'}, no gap differences of ≥ 15 percentage points with adequate numbers (N ≥ 5 per group) are yet visible.`);
        }
      }
    });
    const tema = {}; ses.forEach(r => (r.data.tema || []).forEach(t => { if (t.tema) { tema[t.tema] = tema[t.tema] || { n: 0, cp: new Set(), ses: new Set() }; tema[t.tema].n++; if (t.cp) tema[t.tema].cp.add(t.cp); tema[t.tema].ses.add(r.unit); } }));
    T(s7, 'T7.3', 'Tema berkode dari wawancara dan diskusi (C7)', ['Tema', 'Kemunculan', 'Sesi', 'CP/faktor terkait'], Object.entries(tema).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.ses.size, [...v.cp].join(', ')]));
    if (Object.keys(tema).length) {
      const tr = Object.entries(tema).sort((a, b) => b[1].ses.size - a[1].ses.size || b[1].n - a[1].n);
      G(s7, { id: 'G7.3', kind: 'hbar', title: ['Tema C7 menurut jumlah sesi', 'C7 themes by number of sessions'], items: tr.slice(0, 12).map(([k, v]) => ({ label: k, value: v.ses.size, txt: v.ses.size + ' sesi · ' + v.n + '×' })) });
      I(s7, `Tema yang muncul di sesi terbanyak: ${joinId(tr.slice(0, 3).map(([k, v]) => '"' + k + '" (' + v.ses.size + ' sesi' + (v.cp.size ? ', ' + [...v.cp].join('/') : '') + ')'))}. Jumlah sesi menunjukkan seberapa luas tema dibicarakan lintas informan, bukan prevalensi hambatan; tema perlu ditriangulasi dengan temuan C3 dan C4 pada CP yang sama.`,
        `Themes raised in the most sessions: ${joinEn(tr.slice(0, 3).map(([k, v]) => '"' + k + '" (' + v.ses.size + ' sessions' + (v.cp.size ? ', ' + [...v.cp].join('/') : '') + ')'))}. Session counts show how widely a theme was discussed across informants, not the prevalence of barriers; themes should be triangulated with C3 and C4 findings at the same checkpoint.`);
    }
    const K7 = V.C7.C7K || []; const ccols = (S.forms.C7.sub[1].sections[0].fields || []).filter(x => x.t === 'select');
    T(s7, 'T7.4', 'Cakupan perspektif per kab/kota', ['Kab/kota'].concat(ccols.map(c => c.l)), K7.map(r => [RCA.reg.kkName(r.unit)].concat(ccols.map(c => r.data[c.k] || ''))));

    /* ---------- 8 sintesis */
    const s8 = sec('q6', '8. Q6 · Bahan sintesis akar masalah dan tindakan (masukan WP7)', 'Daftar dugaan penyebab beserta bukti dan keyakinannya untuk diuji pada lokakarya akar masalah 2027. Suatu penyebab baru ditetapkan sebagai akar masalah bila: (1) mekanismenya terhadap titik putus didukung bukti dengan keyakinan sekurang-kurangnya sedang; (2) berada dalam kendali program, fasilitas, atau sektor; (3) bila diatasi, titik putus diperkirakan berkurang bermakna; dan (4) memenuhi kriteria lain Protokol V13 Bagian 13.');
    const mat = [];
    c4r.forEach(r => Object.entries(r.data.matriks_cp || {}).forEach(([cp, m]) => { if (m.dugaan || m.masalah) mat.push([r.unit, cp, (CP_INFO[cp] || {}).ranah || '', m.masalah || '', m.dugaan || '', (m.faktor || []).join('; '), m.keyakinan || '', m.kode_bukti || '', m.alternatif || '']); }));
    T(s8, 'T8.1', 'Matriks dugaan penyebab dari C4', ['Fasyankes', 'CP', 'Ranah', 'Masalah utama', 'Dugaan penyebab', 'Faktor sistem', 'Keyakinan', 'Kode bukti', 'Penjelasan alternatif'], mat);
    const kf = {}; mat.forEach(m => { const k = m[1] + ' | ' + (m[5] || 'tanpa faktor'); kf[k] = kf[k] || { n: 0, tinggi: 0, fas: new Set() }; kf[k].n++; if (m[6] === 'Tinggi') kf[k].tinggi++; kf[k].fas.add(m[0]); });
    T(s8, 'T8.2', 'Pola lintas fasyankes: CP × faktor sistem', ['CP | faktor', 'Jumlah temuan', 'Fasyankes', 'Keyakinan tinggi'], Object.entries(kf).sort((a, b) => b[1].n - a[1].n).map(([k, v]) => [k, v.n, v.fas.size, v.tinggi]));
    const ACT = { 'F1 Penyelenggaraan pelayanan': ['alur layanan terpadu TB-HIV, satu pintu dan jadwal yang selaras', 'integrated one-stop TB-HIV service flow with aligned schedules'], 'F2 Tenaga kesehatan': ['pembagian tugas, pelatihan berbasis kasus, dan supervisi suportif', 'task sharing, case-based training, and supportive supervision'],
      'F3 Sistem informasi': ['interoperabilitas SITB–SIHA, pencocokan rutin, dan umpan balik data', 'SITB–SIHA interoperability, routine matching, and data feedback'], 'F4 Diagnostik': ['jejaring rujukan spesimen dan ketersediaan tes cepat', 'specimen referral networks and availability of rapid tests'],
      'F5 Obat dan teknologi lain': ['perencanaan stok OAT/ARV/TPT dan pemantauan kekosongan', 'OAT/ART/TPT stock planning and stock-out monitoring'], 'F6 Pembiayaan': ['pembiayaan transport, pemeriksaan penunjang, dan dukungan pasien', 'financing for transport, diagnostics, and patient support'],
      'F7 Kepemimpinan dan tata kelola': ['penanggung jawab kolaborasi TB-HIV, kesepakatan rujukan, dan telaah kinerja berkala', 'accountable TB-HIV collaboration leads, referral agreements, and periodic performance review'] };
    const cand = Object.entries(kf).filter(([k, v]) => v.fas.size >= 2 && v.tinggi >= 1 && !/tanpa faktor/.test(k)).sort((a, b) => b[1].fas.size - a[1].fas.size || b[1].tinggi - a[1].tinggi);
    {
      const cpL = [...new Set(mat.map(m => m[1]))].sort((a, b) => cpk.indexOf(a) - cpk.indexOf(b)), fL = Object.keys(ACT);
      if (mat.length) G(s8, { id: 'G8.1', kind: 'heatnum', title: ['Temuan C4 menurut CP dan faktor sistem', 'C4 findings by checkpoint and health-system factor'], cols: fL.map(x => x.split(' ')[0]), colLabels: fL, rows: cpL.map(cp => ({ label: cp, cells: fL.map(fx => mat.filter(m => m[1] === cp && String(m[5]).split('; ').includes(fx)).length) })) });
      T(s8, 'T8.4', 'Kandidat akar masalah untuk diuji di WP7 (pola di ≥ 2 fasyankes dengan sekurang-kurangnya satu temuan berkeyakinan tinggi)', ['CP | faktor', 'Fasyankes', 'Temuan', 'Keyakinan tinggi', 'Arah tindakan yang dapat diuji'],
        cand.map(([k, v]) => { const fx = k.split(' | ')[1] || ''; const a = fx.split('; ').map(x => (ACT[x] || [''])[0]).filter(Boolean).join('; '); return [k, v.fas.size, v.n, v.tinggi, a]; }),
        'Daftar ini memenuhi kriteria awal (berulang dan didukung bukti kuat). Penetapan sebagai akar masalah tetap melalui uji kriteria Protokol V13 Bagian 13 pada lokakarya WP7.');
      I(s8, cand.length ? `${cand.length} pola CP × faktor memenuhi kriteria awal untuk diuji sebagai akar masalah, terutama ${joinId(cand.slice(0, 3).map(([k, v]) => k + ' (' + v.fas.size + ' fasyankes)'))}. Arah tindakan di tabel T8.4 bersifat usulan untuk diuji, bukan rekomendasi akhir; kelayakan, kendali program, dan dampaknya dinilai bersama pemangku kepentingan pada WP7.`
        : 'Belum ada pola CP × faktor yang berulang di sekurang-kurangnya dua fasyankes dengan bukti berkeyakinan tinggi. Matriks C4 perlu dilengkapi (dugaan, faktor, keyakinan, kode bukti) agar kandidat akar masalah dapat diidentifikasi.',
        cand.length ? `${cand.length} checkpoint × factor patterns meet the initial criteria to be tested as root causes, especially ${joinEn(cand.slice(0, 3).map(([k, v]) => k.split(' | ')[0] + ' | ' + k.split(' | ')[1].split('; ').map(E).join('; ') + ' (' + v.fas.size + ' facilities)'))}. Action directions in Table T8.4 are proposals to be tested, not final recommendations; feasibility, programme control, and impact are assessed with stakeholders in WP7.`
          : 'No checkpoint × factor pattern yet recurs in at least two facilities with high-confidence evidence. The C4 matrix should be completed (hypotheses, factors, confidence, evidence codes) so that root-cause candidates can be identified.');
      if (cand[0]) KEY.push([`Kandidat akar masalah terkuat: ${cand[0][0]} (${cand[0][1].fas.size} fasyankes).`, `Strongest root-cause candidate: ${cand[0][0].split(' | ')[0]} | ${(cand[0][0].split(' | ')[1] || '').split('; ').map(E).join('; ')} (${cand[0][1].fas.size} facilities).`]);
    }
    const us = []; ses.forEach(r => { if (r.data.usulan) us.push([r.unit, r.data.usulan]); }); c4r.forEach(r => { if (r.data.tiga_temuan_utama) us.push([r.unit + ' (C4)', r.data.tiga_temuan_utama]); });
    T(s8, 'T8.3', 'Usulan perbaikan dari peserta dan temuan utama fasyankes', ['Sumber', 'Uraian'], us);

    /* ---------- pembahasan: triangulasi antarformulir */
    const sD = sec('pembahasan', 'Pembahasan: triangulasi temuan antarformulir', 'Setiap tahap alur pasien dibaca dengan menyandingkan bukti dari formulir yang berbeda. Semakin banyak formulir yang menunjuk tahap yang sama, semakin kuat dasar untuk menguji dugaan akar masalah pada tahap itu.');
    sD.titleEn = 'Discussion: triangulating findings across forms'; sD.introEn = 'Each patient-journey stage is read by setting evidence from different forms side by side. The more forms point to the same stage, the stronger the basis for testing root-cause hypotheses at that stage.';
    {
      const nf = n => FJ.filter(fm => n.ev[fm].length);
      const lst = JM ? JM.nodes.concat(JM.outcomes.filter(x => x.id === 'putus' || x.id === 'meninggal'), [JM.cross]).filter(n => n.total) : [];
      if (!lst.length) Pp(sD, 'Belum ada bukti Valid yang cukup untuk triangulasi antarformulir.', 'There is not yet enough validated evidence for triangulation across forms.');
      const KL = { 'Terlaksana sebagian atau terlambat': ['terlaksana sebagian atau terlambat', 'partly done or late'], 'Dipastikan tidak terlaksana': ['dipastikan tidak terlaksana', 'confirmed not done'], 'Belum dapat dipastikan': ['belum dapat dipastikan', 'not yet determinable'] };
      lst.forEach(n => {
        const fs = nf(n), m = fs.length;
        const gj = {}; n.ev.C3.forEach(x => ((x.story && x.story.gaps) || []).filter(g => n.cps.includes(g.cp)).forEach(g => { gj[g.jenis] = (gj[g.jenis] || 0) + 1; }));
        const gTop = Object.entries(gj).sort((a, b) => b[1] - a[1]).slice(0, 3);
        const kl = {}; n.ev.C4.forEach(x => { const k = (x.label.split(' · ')[1] || ''); if (KL[k]) kl[k] = (kl[k] || 0) + 1; });
        const kTop = Object.entries(kl).sort((a, b) => b[1] - a[1]);
        const fac4 = new Set(n.ev.C4.map(x => x.unit)).size, kk1 = new Set(n.ev.C1.map(x => x.unit)).size;
        const strId = m >= 3 ? 'Bukti dari ' + m + ' formulir saling menguatkan, sehingga tahap ini layak diprioritaskan untuk diuji pada WP7.' : m === 2 ? 'Bukti dari dua formulir memberi dasar sedang; satu sumber tambahan (misalnya C4 atau C7) akan memperkuat kesimpulan.' : 'Bukti baru berasal dari satu formulir, sehingga temuan masih bersifat dugaan dan perlu dikonfirmasi.';
        const strEn = m >= 3 ? 'Evidence from ' + m + ' forms corroborates each other, so this stage merits priority testing at WP7.' : m === 2 ? 'Evidence from two forms provides a moderate basis; one additional source (for example C4 or C7) would strengthen the conclusion.' : 'Evidence comes from a single form, so the finding remains a hypothesis that needs confirmation.';
        const cT = n.ev.C7.slice(0, 2).map(x => '“' + x.label + '”');
        Pp(sD, `${fs.map(fm => fm + ' ' + n.ev[fm].length).join(', ')}. ${strId} ${n.ev.C3.length ? 'Pada telaah catatan C3, ' + n.ev.C3.length + ' unit menunjukkan titik putus' + (gTop.length ? ', terutama ' + joinId(gTop.map(([k, v]) => k.toLowerCase() + ' (' + v + ')')) : '') + '. ' : ''}${n.ev.C4.length ? 'Penilaian proses C4 di ' + fac4 + ' fasyankes mencatat ' + n.ev.C4.length + ' temuan' + (kTop.length ? ' (' + kTop.map(([k, v]) => KL[k][0] + ' ' + v).join(', ') + ')' : '') + ', yang menjelaskan proses fasilitas di balik titik putus tersebut. ' : n.ev.C3.length ? 'Penilaian C4 belum mencatat masalah pada CP ini meskipun ada titik putus pada unit C3; kesenjangan ini perlu dibahas dengan penilai fasilitas. ' : ''}${n.ev.C5.length ? n.ev.C5.length + ' baris verifikasi C5 tidak sesuai, sehingga sebagian kesenjangan mungkin merupakan masalah pencatatan. ' : ''}${n.ev.C6.length ? n.ev.C6.length + ' kasus kematian C6 menunjukkan masalah atau keterlambatan pada fase terkait. ' : ''}${n.ev.C1.length ? 'Temuan ini ' + (n.ev.C3.length || n.ev.C4.length ? 'sejalan dengan' : 'baru berupa') + ' ' + n.ev.C1.length + ' dugaan awal C1 di ' + kk1 + ' kab/kota. ' : ''}${cT.length ? 'Wawancara dan diskusi C7 mengangkat tema ' + joinId(cT) + '.' : ''}`,
          `${fs.map(fm => fm + ' ' + n.ev[fm].length).join(', ')}. ${strEn} ${n.ev.C3.length ? 'In the C3 record review, ' + n.ev.C3.length + ' units show a breakdown' + (gTop.length ? ', mainly ' + joinEn(gTop.map(([k, v]) => (E(k) || k).toLowerCase() + ' (' + v + ')')) : '') + '. ' : ''}${n.ev.C4.length ? 'The C4 process assessment at ' + fac4 + ' facilities recorded ' + n.ev.C4.length + ' findings' + (kTop.length ? ' (' + kTop.map(([k, v]) => KL[k][1] + ' ' + v).join(', ') + ')' : '') + ', explaining the facility processes behind these breakdowns. ' : n.ev.C3.length ? 'The C4 assessment has not recorded problems at this checkpoint despite breakdowns in C3 units; this discrepancy should be discussed with facility assessors. ' : ''}${n.ev.C5.length ? n.ev.C5.length + ' C5 verification rows are discrepant, so some gaps may be recording problems. ' : ''}${n.ev.C6.length ? n.ev.C6.length + ' C6 death cases show problems or delays in the related phase. ' : ''}${n.ev.C1.length ? 'This ' + (n.ev.C3.length || n.ev.C4.length ? 'is consistent with' : 'so far rests on') + ' ' + n.ev.C1.length + ' initial C1 hypotheses in ' + kk1 + ' districts/cities. ' : ''}${cT.length ? 'C7 interviews and discussions raised ' + cT.length + ' related theme' + (cT.length > 1 ? 's' : '') + '.' : ''}`);
        const lb = sD.blocks[sD.blocks.length - 1]; lb.lead = n.t[0] + ' (' + (n.cps.join(', ') || 'status akhir') + ').'; lb.leadEn = n.t[1] + ' (' + (n.cps.join(', ') || 'final status') + ').';
      });
      if (lst.length) Pp(sD, 'Secara keseluruhan, triangulasi ini tidak menjumlahkan bukti menjadi skor. Ia menunjukkan tahap mana yang didukung oleh berbagai sumber (catatan pasien, proses fasilitas, data sistem, telaah kematian, dan pengalaman pasien serta petugas) sehingga paling siap diuji sebagai lokasi akar masalah, dan tahap mana yang masih memerlukan penelusuran tambahan.',
        'Overall, this triangulation does not sum evidence into a score. It shows which stages are supported by several sources (patient records, facility processes, system data, death reviews, and the experiences of patients and health workers) and are therefore most ready to be tested as root-cause locations, and which stages still need further tracing.');
    }

    /* ---------- 9 kesimpulan */
    const sK = sec('kesimpulan', 'Kesimpulan dan rekomendasi', ''); sK.titleEn = 'Conclusions and recommendations';
    Hd(sK, 'Kesimpulan per pertanyaan evaluasi', 'Conclusions by evaluation question');
    const qa = [
      ['Q1', 'Q1'], ['Q2', 'Q2'], ['Q3', 'Q3'], ['Q4', 'Q4'], ['Q5', 'Q5'], ['Q6', 'Q6']];
    const firstI = id => { const sx = sections.find(x => x.id === id); const b = sx && sx.blocks.find(x => x.type === 'interp'); return b ? [b.id, b.en] : ['Belum cukup data Valid untuk menjawab pertanyaan ini.', 'Not enough validated data yet to answer this question.']; };
    [['q1', 'Q1 · Kapan dan pada tahap mana pelayanan terputus', 'Q1 · When and at which stage care breaks down'], ['q2', 'Q2 · Kontribusi pencatatan dan keterhubungan sistem', 'Q2 · Contribution of recording and system linkage'], ['q3', 'Q3 · Perbedaan kab/kota capaian rendah dan tinggi', 'Q3 · Differences between low- and high-performing districts'],
      ['q4', 'Q4 · Tahap kematian dan peluang perbaikan', 'Q4 · Stage of death and improvement opportunities'], ['q5', 'Q5 · Kelompok dan hambatan', 'Q5 · Groups and barriers'], ['q6', 'Q6 · Dugaan akar masalah dan tindakan', 'Q6 · Root-cause hypotheses and actions']].forEach(([id, ti, te]) => {
      const sx = sections.find(x => x.id === id), bs2 = sx ? sx.blocks.filter(x => x.type === 'interp') : [];
      I(sK, ti + '. ' + (bs2.length ? bs2.map(b => b.id).join(' ') : 'Belum cukup data Valid untuk menjawab pertanyaan ini.'), te + '. ' + (bs2.length ? bs2.map(b => b.en).join(' ') : 'Not enough validated data yet to answer this question.'), 'concl');
    });
    Hd(sK, 'Rekomendasi', 'Recommendations');
    {
      const ranked = jAll.filter(n => n.cps.length && n.total && JM.nodes.includes(n)).sort((a, b) => FJ.filter(fm => b.ev[fm].length).length - FJ.filter(fm => a.ev[fm].length).length || b.total - a.total).slice(0, 3);
      const fx = cand.slice(0, 3).map(([k]) => (k.split(' | ')[1] || '').split('; ')).flat().filter((x, i, a) => x && a.indexOf(x) === i && ACT[x]);
      const recId = [], recEn = [];
      if (ranked.length) { recId.push('Prioritaskan pengujian akar masalah pada tahap ' + joinId(ranked.map(n => lc(n.t[0]) + ' (' + n.cps.join(', ') + ')')) + ', yang didukung bukti dari paling banyak formulir.'); recEn.push('Prioritise root-cause testing at ' + joinEn(ranked.map(n => lc(n.t[1]) + ' (' + n.cps.join(', ') + ')')) + ', which are supported by evidence from the most forms.'); }
      if (fx.length) { recId.push('Rancang tindakan yang dapat diuji untuk faktor sistem yang berulang: ' + joinId(fx.map(x => ACT[x][0])) + '.'); recEn.push('Design testable actions for recurring system factors: ' + joinEn(fx.map(x => ACT[x][1])) + '.'); }
      recId.push('Perkuat keterhubungan dan pencocokan rutin SITB–SIHA agar kesenjangan pelayanan dapat dibedakan dari masalah pencatatan, terutama untuk status HIV, mulai ARV, dan TPT.'); recEn.push('Strengthen SITB–SIHA linkage and routine matching so that service gaps can be distinguished from recording problems, particularly for HIV status, ART start, and TPT.');
      recId.push('Gunakan unit yang putus berobat dan meninggal sebagai kasus pembelajaran dalam telaah berkala di fasyankes dan kab/kota, dengan menelusuri titik putus pertama pada alur pasien.'); recEn.push('Use units lost to follow-up or deceased as learning cases in periodic facility and district reviews, tracing the first breakdown point along the patient journey.');
      LB(sK, recId, recEn);
      Pp(sK, 'Rekomendasi ini bersifat usulan berbasis bukti untuk dibahas dan diuji bersama pemangku kepentingan pada lokakarya WP7. Penetapan akar masalah, prioritas, penanggung jawab, dan indikator keberhasilan tindakan dilakukan pada tahap tersebut.',
        'These recommendations are evidence-based proposals for discussion and testing with stakeholders at the WP7 workshop. Root causes, priorities, responsible parties, and success indicators for actions are determined at that stage.');
    }
    I(sK, 'Langkah berikutnya: (1) lengkapi validasi formulir yang masih di bawah separuh unit Valid; (2) telusuri isian TC, BD, dan "belum dicek" agar kesenjangan dapat dibedakan dari masalah pencatatan; (3) bahas kasus C6 dengan perbedaan penilaian di panel; (4) bawa kandidat akar masalah (T8.4), perbedaan pasangan kab/kota (Q3), dan tema C7 ke lokakarya WP7 untuk diuji dengan kriteria Protokol V13 Bagian 13 dan disusun menjadi rencana tindakan.',
      'Next steps: (1) complete validation of forms still below half of units validated; (2) trace TC, ND, and "not checked" entries so that gaps can be distinguished from recording problems; (3) discuss C6 cases with differing ratings at the panel; (4) bring root-cause candidates (T8.4), district-pair differences (Q3), and C7 themes to the WP7 workshop to be tested against Protocol V13 Section 13 criteria and developed into an action plan.', 'next');

    /* ---------- 10 keterbatasan */
    const s9 = sec('keterbatasan', '10. Keterbatasan dan catatan penafsiran', '');
    L(s9, ['Data berasal dari sampel purposif enam provinsi, dua belas kab/kota, dan 24 fasyankes; hasil menjelaskan mekanisme dan tidak mengestimasi besaran nasional.',
      'Isian kosong atau TC tidak berarti pelayanan tidak diberikan; TC menjadi kesenjangan hanya setelah penelusuran sumber selesai.',
      'Unit purposif dipilih karena ada kesenjangan sehingga tidak dipakai untuk frekuensi; frekuensi hanya dari unit acak/sensus.',
      'Kondisi saat kunjungan (Oktober–November 2026) tidak langsung dianggap penyebab kejadian 2024–Juni 2026; tanggal perubahan ditelusuri.',
      'Keterangan petugas tanpa bukti tertulis dicatat sebagai hipotesis; keyakinan "Sedang" yang hanya bersandar pada keterangan tidak menyatakan pelayanan terverifikasi.',
      'Faktor verifikasi C5 hanya berlaku untuk indikator, periode, dan sumber yang dinilai di sentinel.',
      'Penetapan akar masalah dan prioritas tindakan dilakukan WP7 pada semester pertama 2027.']);
    const s9t = s9; s9t.titleEn = 'Limitations and notes on interpretation';
    const sL = sec('lampiran', 'Lampiran. Pemetaan tahap alur pasien ke butir instrumen', 'Acuan pengelompokan bukti pada Gambar dan Tabel alur pasien.'); sL.titleEn = 'Annex. Mapping of patient-journey stages to instrument items'; sL.introEn = 'Reference for how evidence is grouped in the patient-journey figure and table.';
    if (RCA.journey) {
      const J = RCA.journey, c5n = a => (a || []).map(x => ({ C5_5: 'TB/HIV-5', C5_6: 'TB/HIV-6', C5_41a: 'TB/HIV-4.1a' })[x]).join(', ') || '–';
      const c6n = (o, en) => { if (!o) return '–'; const a = (o.phase || []).concat((o.delay || []).map(d => ({ d1: en ? 'delay 1' : 'keterlambatan 1', d2: en ? 'delay 2' : 'keterlambatan 2', d3: en ? 'delay 3' : 'keterlambatan 3' })[d])); if (o.all) a.push(en ? 'all reviewed deaths' : 'semua kasus kematian'); return a.join(', '); };
      const rws = en => J.STAGES.map((st, k) => [(k + 1) + '. ' + st.t[en ? 1 : 0], st.cps.join(', '), c6n(st.c6, en), c5n(st.c5), st.ket[en ? 1 : 0]])
        .concat(J.OUTCOMES.map(o => [o.t[en ? 1 : 0], o.cps.join(', ') || '–', c6n(o.c6, en), '–', en ? 'C3 A13 outcome, T03 ART status, T06 death' : 'C3 A13 luaran, T03 status ARV, T06 kematian']))
        .concat([[J.CROSS.t[en ? 1 : 0], 'R6', '–', c5n(J.CROSS.c5), J.CROSS.ket[en ? 1 : 0]]]);
      TB2(sL, { id: 'T97.1', title: 'Tahap alur pasien, CP, fase C6, indikator C5, dan butir C3', head: ['Tahap', 'CP (C1, C3, C4, C7)', 'Fase/keterlambatan C6', 'Indikator C5', 'Butir C3 dan keterangan'], rows: rws(false),
        en: { title: 'Patient-journey stages, checkpoints, C6 phases, C5 indicators, and C3 items', head: ['Stage', 'Checkpoints (C1, C3, C4, C7)', 'C6 phase/delay', 'C5 indicator', 'C3 items and notes'], rows: rws(true) } });
    }
    if (KEY.length) { s0.blocks.push({ type: 'list', items: KEY.map(k => k[0]), itemsEn: KEY.map(k => k[1]), kind: 'key', title: ['Pesan kunci', 'Key messages'] }); }
    I(s0, 'Laporan ini menjawab enam pertanyaan evaluasi Protokol V13 berdasarkan data Valid saat laporan dibuat. Setiap bagian menyajikan tabel, grafik, dan interpretasi otomatis yang mengikuti aturan penafsiran protokol: frekuensi dari unit acak/sensus, mekanisme dari unit purposif dan wawancara, dan kesimpulan akar masalah yang ditunda sampai diuji di WP7. Interpretasi perlu dibaca bersama tim lapangan sebelum dipakai untuk keputusan.',
      'This report answers the six Protocol V13 evaluation questions using validated data at the time of generation. Each section presents tables, charts, and automatic interpretation following the protocol\'s interpretation rules: frequencies from random/census units, mechanisms from purposive units and interviews, and root-cause conclusions deferred until tested in WP7. The interpretation should be reviewed with the field team before being used for decisions.');
    // ---- ringkasan eksekutif naratif
    s0.title = 'Ringkasan eksekutif'; s0.titleEn = 'Executive summary'; s0.intro = ''; 
    {
      const closing = s0.blocks.filter(b => b.type === 'interp'), keyL = s0.blocks.filter(b => b.kind === 'key');
      s0.blocks = [];
      const tot = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].reduce((a, fm) => a + (units[fm] || []).length, 0), val = ['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].reduce((a, fm) => a + (units[fm] || []).filter(u => u.status === 'Valid').length, 0);
      const scopeId = f.prov ? 'Provinsi ' + RCA.reg.prov(f.prov).name : 'enam provinsi, dua belas kab/kota, dan 24 fasyankes', scopeEn = f.prov ? ((RCA.reportEN && RCA.reportEN.fixed('Provinsi ' + RCA.reg.prov(f.prov).name)) || RCA.reg.prov(f.prov).name) : 'six provinces, twelve districts/cities, and 24 health facilities';
      Pp(s0, `Laporan ini menyajikan hasil evaluasi lapangan analisis akar masalah (RCA) TB-HIV 2026 di ${scopeId}. Evaluasi menelusuri pada tahap mana dan mengapa pelayanan TB-HIV terputus, dari kontak pertama pasien dengan layanan sampai status akhirnya. Analisis memakai ${val} dari ${tot} unit isian formulir C1–C7 yang telah divalidasi koordinator, termasuk ${A.length + B.length + C.length} unit telaah catatan C3, ${(V.C4.C4 || []).length} penilaian fasilitas C4, ${(V.C6.C6A || []).length} kasus telaah kematian C6, dan ${ses.length} sesi wawancara atau diskusi C7.`,
        `This report presents the results of the 2026 TB-HIV root cause analysis (RCA) field evaluation in ${scopeEn}. The evaluation traces at which stage and why TB-HIV care breaks down, from the patient's first contact with services to their final status. The analysis uses ${val} of ${tot} form entries from C1–C7 validated by coordinators, including ${A.length + B.length + C.length} C3 record-review units, ${(V.C4.C4 || []).length} C4 facility assessments, ${(V.C6.C6A || []).length} C6 death-review cases, and ${ses.length} C7 interview or discussion sessions.`);
      if (KEY.length) Pp(s0, 'Temuan utama: ' + KEY.map(k => k[0]).join(' '), 'Main findings: ' + KEY.map(k => k[1]).join(' '));
      else Pp(s0, 'Data berstatus Valid belum cukup untuk merumuskan temuan utama. Ringkasan ini akan terisi setelah validasi berjalan.', 'Validated data are not yet sufficient to formulate main findings. This summary will fill in as validation progresses.');
      if (JM && jAll.some(n => n.total)) {
        const top = JM.nodes.filter(n => n.total).sort((a, b) => FJ.filter(fm => b.ev[fm].length).length - FJ.filter(fm => a.ev[fm].length).length || b.total - a.total).slice(0, 2), o = id => JM.outcomes.find(x => x.id === id).reach.length;
        Pp(s0, `Pemetaan alur pasien menyatukan bukti dari ketujuh formulir. Tahap dengan dukungan bukti terluas adalah ${joinId(top.map(n => lc(n.t[0])))}. Dari ${JM.totals.known} unit A/B dengan status akhir diketahui, ${o('putus')} putus berobat atau hilang kontak dan ${o('meninggal')} meninggal; jalur mundur dari status akhir ini ke titik putus pertama menjadi bahan utama analisis akar masalah.`,
          `The patient-journey map brings together evidence from all seven forms. The stages with the broadest evidence support are ${joinEn(top.map(n => lc(n.t[1])))}. Of ${JM.totals.known} A/B units with a known final status, ${o('putus')} were lost to follow-up or interrupted and ${o('meninggal')} died; tracing back from these final statuses to the first breakdown point is the core material for root-cause analysis.`);
      }
      Pp(s0, 'Temuan ini menggambarkan pola dalam sampel, bukan prevalensi fasyankes atau estimasi nasional. Dugaan penyebab dan arah tindakan dalam laporan ini akan diuji bersama pemangku kepentingan pada lokakarya akar masalah (WP7) sebelum ditetapkan sebagai akar masalah dan rencana tindakan.',
        'These findings describe patterns within the sample, not facility prevalence or national estimates. The causal hypotheses and action directions in this report will be tested with stakeholders at the root-cause workshop (WP7) before being adopted as root causes and an action plan.');
      keyL.forEach(b => s0.blocks.push(b)); s0.blocks.push(covList); closing.forEach(b => { b.kind = 'para'; s0.blocks.push(b); });
    }
    // ---- penomoran bab, tabel, dan gambar
    {
      const idMap = {}; let k = 0;
      sections.forEach(sx => {
        const base = sx.title.replace(/^\d+\.\s*/, ''), enRaw = sx.titleEn || (E(sx.title) !== sx.title ? E(sx.title) : null), baseEn = enRaw ? enRaw.replace(/^\d+\.\s*/, '') : null;
        if (sx.id === 'ringkasan' || sx.id === 'lampiran') { sx.title = base; if (baseEn) sx.titleEn = baseEn; } else { k++; sx.title = k + '. ' + base; if (baseEn) sx.titleEn = k + '. ' + baseEn; }
        if (sx.intro && !sx.introEn && E(sx.intro) !== sx.intro) sx.introEn = E(sx.intro);
        const num = sx.id === 'lampiran' ? 'L' : String(k);
        sx.blocks.forEach(b => { const m = b.id && (b.type === 'table' || b.type === 'chart') && /^([TG])(\d+)\.(\d+)$/.exec(b.id); if (m) { const nid = m[1] + num + '.' + m[3]; idMap[b.id] = nid; b.id = nid; } });
      });
      const fix = t => typeof t === 'string' ? t.replace(/\b([TG]\d+\.\d+)\b/g, x => idMap[x] ? idMap[x] : x) : t;
      sections.forEach(sx => sx.blocks.forEach(b => { if (b.type === 'interp') { b.id = fix(b.id); b.en = fix(b.en); } if (b.type === 'table') b.note = fix(b.note); }));
    }
    return { title: 'Laporan Evaluasi Lapangan RCA TB-HIV 2026', titleEn: 'RCA TB-HIV 2026 Field Evaluation Report', subtitle: f.prov ? 'Provinsi ' + RCA.reg.prov(f.prov).name : 'Seluruh lokasi (6 provinsi, 12 kab/kota, 24 fasyankes)',
      cover: { year: '2026', big: [['LAPORAN EVALUASI', 'LAPANGAN'], ['FIELD EVALUATION', 'REPORT']], subl: [['ANALISIS AKAR MASALAH (RCA)', 'PELAYANAN TB-HIV'], ['ROOT CAUSE ANALYSIS (RCA)', 'OF TB-HIV CARE']], kicker: ['LAPORAN EVALUASI LAPANGAN', 'FIELD EVALUATION REPORT'], title: ['Analisis Akar Masalah (RCA) Pelayanan TB-HIV 2026', 'Root Cause Analysis (RCA) of TB-HIV Care 2026'],
        sub: ['Titik putus pelayanan dari kontak pertama sampai status akhir pasien', 'Breakdowns in care from first contact to the patient\'s final status'],
        scope: [f.prov ? 'Provinsi ' + RCA.reg.prov(f.prov).name : 'Enam provinsi · dua belas kab/kota · 24 fasyankes', f.prov ? ((RCA.reportEN && RCA.reportEN.fixed('Provinsi ' + RCA.reg.prov(f.prov).name)) || RCA.reg.prov(f.prov).name) : 'Six provinces · twelve districts/cities · 24 health facilities'],
        by: ['Disusun oleh Tim Evaluasi RCA TB-HIV 2026', 'Prepared by the RCA TB-HIV 2026 Evaluation Team'], to: ['Untuk Kementerian Kesehatan Republik Indonesia', 'For the Ministry of Health of the Republic of Indonesia'],
        date: [new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })] },
      meta: [['Dibuat', new Date().toLocaleString('id-ID')], ['Oleh', RCA.state.user.name + ' (' + RCA.state.user.role + ')'], ['Cakupan data', 'Hanya rekaman berstatus Valid'], ['Acuan', 'Protokol RCA TB-HIV V13; Inception Report P4']],
      sections };
  }

  /* ================================================================ tampilan */
  const L2 = (rep, a) => Array.isArray(a) ? a[rep.lang === 'en' ? 1 : 0] : a;
  const txtOf = (rep, b) => rep.lang === 'en' ? (b.en || b.id) : b.id;
  const INTERP_LBL = { interp: ['Interpretasi', 'Interpretation'], method: ['', ''], concl: ['', ''], next: ['Langkah berikutnya', 'Next steps'] };
  function renderHTML(rep) {
    const en = rep.lang === 'en', TB = en ? 'Table ' : 'Tabel ', FG = en ? 'Figure ' : 'Gambar ';
    const wrap = h('article', { class: 'report', lang: en ? 'en' : 'id' });
    const cv = rep.cover, Lc = a => a ? a[en ? 1 : 0] : '';
    let cvs = null;
    if (cv && RCA.rchart && RCA.rchart.coverPage) { const mc = document.createElement('canvas').getContext('2d'); const meas = (t, pt, b) => { mc.font = (b ? '700 ' : '400 ') + pt + 'px Helvetica, Arial, sans-serif'; return mc.measureText(t).width * 0.3528; };
      cvs = RCA.rchart.coverPage({ year: cv.year, pxmm: 3, text: RCA.rchart.coverText(cv, en ? 1 : 0, null, meas) }); cvs.className = 'rep-cover-img'; cvs.setAttribute('role', 'img'); cvs.setAttribute('aria-label', (en ? 'Cover: ' : 'Sampul: ') + Lc(cv.title)); }
    wrap.appendChild(h('header', { class: 'rep-head rep-cover' }, cvs,
      h('div', { class: 'rep-cover-body' }, h('span', { class: 'rep-kicker' }, Lc(cv && cv.kicker)), h('h1', null, cv ? Lc(cv.title) : rep.title), h('p', { class: 'rep-scope' }, cv ? Lc(cv.scope) : rep.subtitle),
        cv ? h('p', { class: 'small' }, Lc(cv.by) + ' · ' + Lc(cv.to) + ' · ' + Lc(cv.date)) : null,
        h('dl', { class: 'kv' }, rep.meta.map(([a, b]) => [h('dt', null, a), h('dd', null, b)])))));
    const toc = h('nav', { class: 'rep-toc no-print', 'aria-label': 'Daftar isi laporan' }, h('b', null, en ? 'Contents' : 'Daftar isi'), h('ol', { style: { listStyle: 'none', paddingLeft: '0' } }, rep.sections.map(s => h('li', null, h('a', { href: '#', onclick: e => { e.preventDefault(); document.getElementById('rep-' + s.id).scrollIntoView({ behavior: 'smooth' }); } }, s.title)))));
    wrap.appendChild(toc);
    rep.sections.forEach(s => {
      const se = h('section', { class: 'rep-sec', id: 'rep-' + s.id }, h('h2', null, s.title), s.intro ? h('p', { class: 'muted' }, s.intro) : null);
      s.blocks.forEach(b => {
        if (b.type === 'p') se.appendChild(h('p', null, b.text));
        if (b.type === 'h') se.appendChild(h('h3', { class: 'rep-h3' }, en ? (b.en || b.id) : b.id));
        if (b.type === 'list') { if (b.title) se.appendChild(h('h3', null, L2(rep, b.title))); se.appendChild(h('ul', { class: b.kind === 'key' ? 'rep-key' : null }, (en && b.itemsEn ? b.itemsEn : b.items).map(x => h('li', null, x)))); }
        if (b.type === 'interp') {
          const lb = L2(rep, INTERP_LBL[b.kind] || INTERP_LBL.interp), t = txtOf(rep, b);
          if (b.kind === 'concl') { const m = /^(Q\d · [^.]+)\. ([\s\S]*)$/.exec(t); se.appendChild(h('p', { class: 'rep-interp rep-para concl' }, m ? [h('b', null, m[1] + '. '), m[2]] : t)); }
          else if (b.kind === 'next') se.appendChild(h('p', { class: 'rep-interp rep-para next' }, h('b', null, lb + '. '), t.replace(/^(Langkah berikutnya|Next steps): /, '')));
          else se.appendChild(h('p', { class: b.kind === 'method' ? 'rep-method rep-para' : 'rep-interp rep-para ' + (b.kind || '') }, b.lead ? h('b', null, (en ? b.leadEn : b.lead) + ' ') : null, t));
        }
        if (b.type === 'chart') {
          const cv = RCA.rchart && RCA.rchart.draw(b, rep.lang);
          if (cv) { cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', RCA.rchart.alt(b, rep.lang));
            se.appendChild(h('figure', { class: 'rep-fig rep-chart' }, h('figcaption', null, h('b', null, FG + b.id.slice(1) + '. '), L2(rep, b.title)), cv, b.note ? h('p', { class: 'muted small' }, L2(rep, b.note)) : null)); }
        }
        if (b.type === 'table') se.appendChild(h('figure', { class: 'rep-fig' }, h('figcaption', null, h('b', null, TB + b.id.slice(1) + '. '), b.title),
          h('div', { class: 'table-wrap' }, h('table', { class: 't' }, h('thead', null, h('tr', null, b.head.map(x => h('th', null, x)))), h('tbody', null, b.rows.map(r => h('tr', null, r.map((v, i) => h('td', { class: i && typeof v === 'number' ? 'n' : '' }, v === null || v === undefined ? '' : String(v)))))))),
          b.note ? h('p', { class: 'muted small' }, b.note) : null));
      });
      wrap.appendChild(se);
    });
    return wrap;
  }

  /* ================================================================ Excel */
  function toExcel(rep) {
    if (!RCA.needXLSX()) return;
    const wb = XLSX.utils.book_new();
    const sum = [[rep.title], [rep.subtitle], []].concat(rep.meta).concat([[]]);
    rep.sections.forEach(s => { sum.push([s.title]); if (s.intro) sum.push([s.intro]); s.blocks.forEach(b => { if (b.type === 'p') sum.push([b.text]); if (b.type === 'h') sum.push([rep.lang === 'en' ? (b.en || b.id) : b.id]); if (b.type === 'interp') sum.push([txtOf(rep, b)]); if (b.type === 'list') (rep.lang === 'en' && b.itemsEn ? b.itemsEn : b.items).forEach(x => sum.push(['• ' + x])); if (b.type === 'table') sum.push([(rep.lang === 'en' ? 'Table ' : 'Tabel ') + b.id.slice(1) + ': ' + b.title + (rep.lang === 'en' ? ' (sheet ' : ' (lembar ') + b.id + ')']); }); sum.push([]); });
    const ws0 = XLSX.utils.aoa_to_sheet(sum); ws0['!cols'] = [{ wch: 120 }];
    XLSX.utils.book_append_sheet(wb, ws0, rep.lang === 'en' ? 'Summary' : 'Ringkasan');
    rep.sections.forEach(s => s.blocks.filter(b => b.type === 'table').forEach(b => {
      const aoa = [[(rep.lang === 'en' ? 'Table ' : 'Tabel ') + b.id.slice(1) + '. ' + b.title], [s.title], [], b.head].concat(b.rows).concat(b.note ? [[], [b.note]] : []);
      const ws = XLSX.utils.aoa_to_sheet(aoa); ws['!cols'] = b.head.map((x, i) => ({ wch: i === 0 ? 34 : Math.max(12, Math.min(40, String(x).length + 4)) }));
      XLSX.utils.book_append_sheet(wb, ws, b.id.replace(/[^A-Za-z0-9.]/g, '_').slice(0, 31));
    }));
    XLSX.writeFile(wb, fileName(rep, 'xlsx'));
  }

  /* ================================================================ PDF */
  const asc = s => String(s === null || s === undefined ? '' : s).replace(/≤/g, '<=').replace(/≥/g, '>=').replace(/→/g, '->').replace(/›/g, '>').replace(/×/g, 'x').replace(/÷/g, '/').replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, '...').replace(/[^\x00-\xFF–—•·±µ]/g, '');
  function fileName(rep, ext) { return (rep.lang === 'en' ? 'Report_RCA_TBHIV_' + (rep.prov || 'all') + '_EN_' : 'Laporan_RCA_TBHIV_' + (rep.prov || 'semua') + '_') + RCA.today() + '.' + ext; }
  /** PDF lengkap: sampul, daftar isi bernomor halaman, interpretasi, grafik, tabel */
  function toPDF(rep) {
    if (!window.jspdf || !window.jspdf.jsPDF) return RCA.toast('Pustaka PDF belum termuat. Coba lagi sebentar.', 'err');
    const en = rep.lang === 'en', cv = rep.cover, Lc = a => a ? a[en ? 1 : 0] : '';
    const { jsPDF } = window.jspdf; const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 18; let y = 20;
    const teal = [0, 110, 104], tealL = [0, 163, 154], lime = [201, 221, 3], ink = [30, 40, 44], grey = [94, 95, 95];
    const need = n => { if (y + n > H - 18) { doc.addPage(); y = 20; } };
    const LH = sz => sz * 0.47;
    // paragraf rata kiri-kanan (baris terakhir rata kiri)
    const justify = (t, size, opt) => {
      opt = opt || {}; size = size || 10.2; const ind = opt.indent || 0, w = W - 2 * M - ind;
      doc.setFont('helvetica', opt.style || 'normal'); doc.setFontSize(size); doc.setTextColor.apply(doc, opt.color || ink);
      let lead = opt.lead ? asc(opt.lead) + ' ' : '';
      let extra = 0; if (lead) { const nw = doc.getTextWidth(lead); doc.setFont('helvetica', 'bold'); extra = Math.max(0, doc.getTextWidth(lead) - nw); doc.setFont('helvetica', opt.style || 'normal'); }
      const lines = doc.splitTextToSize(lead + asc(t), w - extra);
      lines.forEach((l, k) => {
        need(LH(size) + 1);
        const last = k === lines.length - 1, words = l.trim().split(/\s+/);
        let x = M + ind;
        if (k === 0 && lead) { doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, teal); }
        if (last || words.length < 2 || opt.left) {
          if (k === 0 && lead) { doc.text(lead.trim(), x, y); const lw = doc.getTextWidth(lead); doc.setFont('helvetica', opt.style || 'normal'); doc.setTextColor.apply(doc, opt.color || ink); doc.text(l.slice(lead.length), x + lw, y); }
          else doc.text(l, x, y);
        } else {
          let leadWords = k === 0 && lead ? lead.trim().split(/\s+/).length : 0;
          const ws = words.map((wd, i) => { doc.setFont('helvetica', i < leadWords ? 'bold' : (opt.style || 'normal')); return doc.getTextWidth(wd); }), gap = (w - ws.reduce((m, n) => m + n, 0)) / (words.length - 1);
          doc.setFont('helvetica', leadWords ? 'bold' : (opt.style || 'normal'));
          words.forEach((wd, i) => { if (i === leadWords && leadWords) { doc.setFont('helvetica', opt.style || 'normal'); doc.setTextColor.apply(doc, opt.color || ink); } doc.text(wd, x, y); x += ws[i] + gap; });
          if (leadWords) { doc.setFont('helvetica', opt.style || 'normal'); doc.setTextColor.apply(doc, opt.color || ink); }
        }
        y += LH(size);
      });
      y += opt.after !== undefined ? opt.after : 2.6;
    };
    const b2lead = bl => bl.lead ? { lead: en ? bl.leadEn : bl.lead } : undefined;
    const para = (t, size, style, color, indent) => justify(t, size || 10, { style, color, indent, left: true, after: 1.8 });
    // ---------------- sampul (latar gambar + teks PDF yang dapat dipilih)
    {
      const RC = RCA.rchart; const pg = RC && RC.coverPage ? RC.coverPage({ year: cv && cv.year, pxmm: 5.2 }) : null;
      if (pg) doc.addImage(pg.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, W, H, 'coverpage', 'FAST'); else { doc.setFillColor.apply(doc, teal); doc.rect(0, 0, W, 80, 'F'); }
      const meas = (t, pt, bold) => { doc.setFont('helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(pt); return doc.getTextWidth(asc(t)); };
      if (cv && RC && RC.coverText) RC.coverText(cv, en ? 1 : 0, rep.meta, meas).forEach(t => { doc.setFont('helvetica', t.bold ? 'bold' : 'normal'); doc.setFontSize(t.pt); doc.setTextColor(t.color); doc.text(asc(t.t), t.x, t.y); });
      else { doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text(asc(rep.title), M, 40); }
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(255, 255, 255);
      doc.text(asc(en ? 'Coded data, restricted access. Do not distribute outside the evaluation team without approval.' : 'Data berkode, akses terbatas. Jangan disebarkan di luar tim evaluasi tanpa persetujuan.'), M, H - 7);
    }
    // ---------------- isi
    const tocE = [];
    rep.sections.forEach((sx) => {
      doc.addPage(); y = 22;
      tocE.push([sx.title, doc.getNumberOfPages()]);
      doc.setFillColor.apply(doc, lime); doc.rect(M, y - 4, 14, 1.6, 'F'); y += 4;
      justify(sx.title, 16, { style: 'bold', color: teal, left: true, after: 2 });
      doc.setDrawColor(200, 222, 220); doc.setLineWidth(0.3); doc.line(M, y - 1, W - M, y - 1); y += 3;
      if (sx.intro) justify(sx.intro, 9.6, { style: 'italic', color: [80, 90, 94] });
      sx.blocks.forEach(bl => {
        if (bl.type === 'p') justify(bl.text);
        if (bl.type === 'h') { need(16); y += 1.5; justify(en ? (bl.en || bl.id) : bl.id, 12, { style: 'bold', color: teal, left: true, after: 1.2 }); }
        if (bl.type === 'list') { if (bl.title) { need(12); y += 1; justify(L2(rep, bl.title), 11.5, { style: 'bold', color: teal, left: true, after: 1.2 }); } (en && bl.itemsEn ? bl.itemsEn : bl.items).forEach(x => { need(6); doc.setFillColor.apply(doc, bl.kind === 'key' ? lime : tealL); doc.circle(M + 1.6, y - 1.2, 0.9, 'F'); justify(x, 10, { indent: 5, left: true, after: 1.4 }); }); y += 1.2; }
        if (bl.type === 'interp') {
          const t = txtOf(rep, bl);
          if (bl.kind === 'concl') { const m = /^(Q\d · [^.]+)\. ([\s\S]*)$/.exec(t); if (m) { need(14); justify(m[1], 11, { style: 'bold', color: teal, left: true, after: 1 }); justify(m[2]); } else justify(t); }
          else if (bl.kind === 'next') justify(t.replace(/^(Langkah berikutnya|Next steps): /, ''), 10.2, { lead: L2(rep, INTERP_LBL.next) + '.' });
          else justify(t, 10.2, b2lead(bl));
        }
        if (bl.type === 'chart') {
          const im = RCA.rchart && RCA.rchart.png(bl, rep.lang, true); if (!im) return;
          let iw = W - 2 * M, ih = iw * im.h / im.w; const maxH = H - 50; if (ih > maxH) { ih = maxH; iw = ih * im.w / im.h; }
          need(ih + 16);
          justify((en ? 'Figure ' : 'Gambar ') + bl.id.slice(1) + '. ' + L2(rep, bl.title), 10, { style: 'bold', left: true, after: 1.4 });
          doc.addImage(im.dataUrl, 'JPEG', M + (W - 2 * M - iw) / 2, y, iw, ih, bl.id, 'FAST'); y += ih + 2;
          if (bl.note) justify(L2(rep, bl.note), 8.5, { style: 'italic', color: [90, 100, 104], left: true });
          y += 2;
        }
        if (bl.type === 'table') {
          need(24); justify((en ? 'Table ' : 'Tabel ') + bl.id.slice(1) + '. ' + bl.title, 10, { style: 'bold', left: true, after: 1.4 });
          const wide = bl.head.length > 7;
          doc.autoTable({ startY: y, head: [bl.head.map(asc)], body: bl.rows.map(r => r.map(asc)), margin: { left: M, right: M, top: 18, bottom: 18 }, theme: 'grid',
            styles: { fontSize: wide ? 6.5 : 8, cellPadding: 1.4, overflow: 'linebreak', textColor: ink, lineColor: [205, 222, 220] }, headStyles: { fillColor: teal, textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [240, 248, 246] } });
          y = doc.lastAutoTable.finalY + 3;
          if (bl.note) justify(bl.note, 8.5, { style: 'italic', color: [90, 100, 104], left: true });
          y += 2;
        }
      });
    });
    // daftar isi di halaman 2
    doc.insertPage(2); doc.setPage(2); y = 26;
    doc.setFillColor.apply(doc, lime); doc.rect(M, y - 8, 14, 1.6, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor.apply(doc, teal); doc.text(en ? 'Contents' : 'Daftar isi', M, y); y += 11;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, ink);
    tocE.forEach(([t, pg]) => { const lines = doc.splitTextToSize(asc(t), W - 2 * M - 16); lines.forEach((l, k) => { doc.text(l, M, y); if (k === lines.length - 1) { doc.text(String(pg + 1), W - M, y, { align: 'right' }); doc.setDrawColor(200, 208, 210); doc.setLineDashPattern([0.5, 1], 0); doc.line(M + doc.getTextWidth(l) + 2, y, W - M - 8, y); doc.setLineDashPattern([], 0); } y += 6.2; }); y += 1; });
    const n = doc.getNumberOfPages();
    for (let i = 2; i <= n; i++) { doc.setPage(i); doc.setFillColor.apply(doc, tealL); doc.rect(0, 0, W, 2.2, 'F'); doc.setFillColor.apply(doc, lime); doc.rect(0, 2.2, W * 0.18, 0.9, 'F');
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(120, 130, 134);
      doc.text(asc(en ? 'RCA TB-HIV 2026 Field Evaluation Report · coded data, restricted access' : 'Laporan Evaluasi Lapangan RCA TB-HIV 2026 · data berkode, akses terbatas'), M, H - 9); doc.text(en ? 'Page ' + i + ' of ' + n : 'Halaman ' + i + ' dari ' + n, W - M, H - 9, { align: 'right' }); }
    doc.save(fileName(rep, 'pdf'));
  }

  /* ================================================================ Word (.docx) */
  function loadDocx() {
    if (window.docx) return Promise.resolve(window.docx);
    return new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'vendor/docx.min.js'; sc.onload = () => window.docx ? res(window.docx) : rej(new Error('docx')); sc.onerror = () => rej(new Error('Pustaka Word tidak dapat dimuat (periksa koneksi).')); document.head.appendChild(sc); });
  }
  async function toWord(rep) {
    let X; try { X = await loadDocx(); } catch (e) { return RCA.toast(e.message, 'err'); }
    const en = rep.lang === 'en';
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType, ImageRun, Footer, Header, PageNumber, TableOfContents, PageBreak } = X;
    const TEAL = '006E68', LIME = 'C9DD03', TEAL_L = '00A39A', cv = rep.cover, Lc = a => a ? a[en ? 1 : 0] : '';
    const P = (t, o) => new Paragraph(Object.assign({ children: [new TextRun(String(t === null || t === undefined ? '' : t))], spacing: { after: 120 } }, o || {}));
    const kids = [];
    // sampul: gambar latar satu halaman penuh di belakang teks yang dapat diedit
    const coverKids = [];
    const pgC = RCA.rchart && RCA.rchart.coverPage ? RCA.rchart.coverPage({ year: cv && cv.year, pxmm: 5.2 }) : null;
    const mm = v => Math.round(v * 56.7);
    const bgRun = pgC ? new ImageRun({ type: 'jpg', data: (u => { const b = atob(u.split(',')[1]), a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; })(pgC.toDataURL('image/jpeg', 0.9)),
      transformation: { width: 794, height: 1123 }, altText: { title: 'Sampul', description: 'Latar sampul', name: 'cover' },
      floating: { horizontalPosition: { relative: X.HorizontalPositionRelativeFrom.PAGE, offset: 0 }, verticalPosition: { relative: X.VerticalPositionRelativeFrom.PAGE, offset: 0 }, behindDocument: true, allowOverlap: true } }) : null;
    const pick = a => a ? a[en ? 1 : 0] : '';
    coverKids.push(new Paragraph({ indent: { left: mm(21) }, spacing: { before: 0, after: 0, line: 240 }, children: (bgRun ? [bgRun] : []).concat([new TextRun({ text: 'RCA TB-HIV 2026', bold: true, size: 18, color: '0E5A54' })]) }));
    coverKids.push(new Paragraph({ indent: { left: mm(21) }, spacing: { after: 0 }, children: [new TextRun({ text: pick(cv && cv.kicker), bold: true, size: 15, color: '0E8F86' })] }));
    (pick(cv && cv.big) || [rep.title]).forEach((l, i) => coverKids.push(new Paragraph({ spacing: { before: i ? 0 : mm(92), after: 0, line: 260 * 3.2, lineRule: 'exact' }, children: [new TextRun({ text: l, bold: true, size: 76, color: '0E5A54', font: 'Arial' })] })));
    (pick(cv && cv.subl) || []).forEach((l, i) => coverKids.push(new Paragraph({ spacing: { before: i ? 0 : mm(4), after: 0 }, children: [new TextRun({ text: l, bold: true, size: 26, color: '0E8F86', font: 'Arial' })] })));
    coverKids.push(new Paragraph({ spacing: { before: mm(9), after: 60 }, children: [new TextRun({ text: pick(cv && cv.scope), bold: true, size: 22, color: '0E5A54' })] }));
    [[pick(cv && cv.by), false, '2E3B3D'], [pick(cv && cv.to), false, '2E3B3D'], [pick(cv && cv.date), true, '0E8F86']].forEach(([t, b, c]) => coverKids.push(new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: t, bold: b, size: 19, color: c })] })));
    coverKids.push(new Paragraph({ spacing: { before: 160 }, children: [] }));
    rep.meta.forEach(([a, b]) => coverKids.push(new Paragraph({ spacing: { after: 0 }, children: [new TextRun({ text: a + ': ' + b, size: 15, color: '5E5F5F' })] })));
    coverKids.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: en ? 'Coded data, restricted access. Do not distribute outside the evaluation team without approval.' : 'Data berkode, akses terbatas. Jangan disebarkan di luar tim evaluasi tanpa persetujuan.', italics: true, color: '5E5F5F', size: 15 })] }));
    kids.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: en ? 'Contents' : 'Daftar isi', color: TEAL })] }));
    kids.push(new TableOfContents(en ? 'Contents' : 'Daftar isi', { hyperlink: true, headingStyleRange: '1-2' }));
    kids.push(P(en ? '(If the contents list is empty, right-click it in Word and choose "Update field".)' : '(Bila daftar isi kosong, klik kanan di Word lalu pilih "Update field".)', { children: [new TextRun({ text: en ? '(If the contents list is empty, right-click it in Word and choose "Update field".)' : '(Bila daftar isi kosong, klik kanan di Word lalu pilih "Update field".)', italics: true, size: 16, color: '6E7C7F' })] }));
    const cell = (t, head, wide) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t === null || t === undefined ? '' : t), bold: !!head, color: head ? 'FFFFFF' : '1E2A2C', size: wide ? 14 : 16 })] })],
      shading: head ? { type: ShadingType.CLEAR, color: 'auto', fill: TEAL } : undefined, margins: { top: 40, bottom: 40, left: 60, right: 60 } });
    rep.sections.forEach((s, si) => {
      kids.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C8DEDC', space: 4 } }, children: [new TextRun({ text: s.title, color: TEAL })] }));
      if (s.intro) kids.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: s.intro, italics: true, color: '50605F' })] }));
      s.blocks.forEach(b => {
        if (b.type === 'p') kids.push(P(b.text, { alignment: AlignmentType.JUSTIFIED }));
        if (b.type === 'h') kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun({ text: en ? (b.en || b.id) : b.id, color: TEAL })] }));
        if (b.type === 'list') { if (b.title) kids.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: L2(rep, b.title), color: TEAL })] })); (en && b.itemsEn ? b.itemsEn : b.items).forEach(x => kids.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [new TextRun(String(x))] }))); }
        if (b.type === 'interp') {
          const t = txtOf(rep, b);
          if (b.kind === 'method') kids.push(P(t, { alignment: AlignmentType.JUSTIFIED, spacing: { after: 160, line: 300 } }));
          else if (b.kind === 'concl') { const m = /^(Q\d · [^.]+)\. ([\s\S]*)$/.exec(t); if (m) { kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: m[1], color: TEAL })] })); kids.push(P(m[2], { alignment: AlignmentType.JUSTIFIED })); } else kids.push(P(t)); }
          else if (b.kind === 'next') kids.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { before: 120, after: 160 }, children: [new TextRun({ text: L2(rep, INTERP_LBL.next) + '. ', bold: true, color: TEAL }), new TextRun(t.replace(/^(Langkah berikutnya|Next steps): /, ''))] }));
          else kids.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 160, line: 300 }, children: (b.lead ? [new TextRun({ text: (en ? b.leadEn : b.lead) + ' ', bold: true, color: TEAL })] : []).concat([new TextRun(t)]) }));
        }
        if (b.type === 'chart') {
          const im = RCA.rchart && RCA.rchart.png(b, rep.lang); if (!im) return;
          let w = 620, hgt = Math.round(w * im.h / im.w); if (hgt > 860) { hgt = 860; w = Math.round(hgt * im.w / im.h); }
          kids.push(new Paragraph({ keepNext: true, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: (en ? 'Figure ' : 'Gambar ') + b.id.slice(1) + '. ', bold: true }), new TextRun(L2(rep, b.title))] }));
          kids.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: im.bytes, transformation: { width: w, height: hgt }, altText: { title: L2(rep, b.title), description: RCA.rchart.alt(b, rep.lang), name: b.id } })] }));
          if (b.note) kids.push(new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: L2(rep, b.note), italics: true, size: 16, color: '5D6B6E' })] }));
        }
        if (b.type === 'table') {
          const wide = b.head.length > 7;
          kids.push(new Paragraph({ keepNext: true, spacing: { before: 200, after: 60 }, children: [new TextRun({ text: (en ? 'Table ' : 'Tabel ') + b.id.slice(1) + '. ', bold: true }), new TextRun(b.title)] }));
          kids.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ tableHeader: true, children: b.head.map(x => cell(x, true, wide)) })].concat(b.rows.map(r => new TableRow({ children: b.head.map((_, i) => cell(r[i], false, wide)) }))) }));
          if (b.note) kids.push(new Paragraph({ spacing: { before: 60, after: 160 }, children: [new TextRun({ text: b.note, italics: true, size: 16, color: '5D6B6E' })] }));
          else kids.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
        }
      });
    });
    const doc = new Document({
      creator: RCA.state.user.name, title: rep.title, description: rep.subtitle, features: { updateFields: true },
      styles: { default: { document: { run: { font: 'Calibri', size: 21 } } },
        paragraphStyles: [{ id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: TEAL }, paragraph: { spacing: { before: 240, after: 160 } } },
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 25, bold: true, color: TEAL }, paragraph: { spacing: { before: 220, after: 100 } } },
          { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 22, bold: true, color: TEAL }, paragraph: { spacing: { before: 160, after: 80 } } }] },
      sections: [{ properties: { page: { margin: { top: mm(18), bottom: mm(10), left: mm(18), right: mm(18) } } }, children: coverKids },
        { properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
        headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: en ? 'RCA TB-HIV 2026 · coded data, restricted access' : 'RCA TB-HIV 2026 · data berkode, akses terbatas', size: 16, color: '8A979A' })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [en ? 'Page ' : 'Halaman ', PageNumber.CURRENT, en ? ' of ' : ' dari ', PageNumber.TOTAL_PAGES], size: 16, color: '6E7C7F' })] })] }) },
        children: kids }]
    });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName(rep, 'docx'); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    RCA.toast(en ? 'Word report saved' : 'Laporan Word tersimpan', 'ok');
  }
  R.toWord = toWord; R.toPDF = toPDF;

  /* ================================================================ halaman */
  R.page = async function (main) {
    main.innerHTML = '';
    const f = RCA.state.filters._rep = RCA.state.filters._rep || {};
    const en = f.lang === 'en';
    main.appendChild(h('div', { class: 'page-head' }, h('div', { class: 'grow' }, h('h1', null, en ? 'Report Dashboard' : 'Dashboard Laporan'),
      h('p', null, en ? 'A detailed report compiled automatically from all validated data according to the Protocol V13 evaluation questions (Q1–Q6), domains R1–R6, and the 14 checkpoints, with protocol-based interpretation and charts. Save as PDF or Word for D3 and the WP7 workshop, or Excel for the tables.'
        : 'Laporan detail tersusun otomatis dari seluruh data Valid menurut pertanyaan evaluasi Protokol V13 (Q1–Q6), ranah R1–R6, dan 14 CP, lengkap dengan interpretasi berbasis protokol dan grafik. Simpan sebagai PDF atau Word untuk bahan D3 dan lokakarya WP7, atau Excel untuk tabelnya.'))));
    const provSel = h('select', { 'aria-label': en ? 'Report scope' : 'Cakupan laporan' }); provSel.appendChild(h('option', { value: '' }, en ? 'All sites' : 'Seluruh lokasi'));
    PROV().forEach(p => provSel.appendChild(h('option', { value: p.code, selected: f.prov === p.code }, en ? (RCA.reportEN.fixed('Provinsi ' + p.name) || p.name) : 'Provinsi ' + p.name)));
    provSel.addEventListener('change', () => { f.prov = provSel.value; R.page(main); });
    // ID / EN
    const langSw = h('div', { class: 'seg', role: 'group', 'aria-label': 'Bahasa laporan / Report language' },
      ['id', 'en'].map(l => h('button', { type: 'button', class: 'btn small' + ((f.lang || 'id') === l ? ' primary' : ''), 'aria-pressed': (f.lang || 'id') === l ? 'true' : 'false', onclick: () => { if ((f.lang || 'id') !== l) { f.lang = l; R.page(main); } } }, l === 'id' ? 'Tampilkan dalam ID' : 'Show in EN')));
    const bar = h('div', { class: 'row no-print rep-bar', style: { marginBottom: '14px' } }, provSel, langSw);
    main.appendChild(bar);
    const box = h('div', null, h('p', { class: 'muted' }, en ? 'Compiling the report from validated data…' : 'Menyusun laporan dari data Valid…')); main.appendChild(box);
    let D, U = {};
    try {
      [D] = await Promise.all([RCA.api('analysis.data', {}), ...['C1', 'C3', 'C4', 'C5', 'C6', 'C7'].map(async fm => { try { U[fm] = await RCA.api('units.list', { form: fm }); } catch (e) { U[fm] = []; } })]);
      RCA.idb.set('cache', 'report', { D, U });
    } catch (e) {
      const c = await RCA.idb.get('cache', 'report'); if (!c) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, e.message)); return; }
      D = c.D; U = c.U; RCA.toast(en ? 'Offline: using the last saved data' : 'Offline: laporan memakai data tersimpan terakhir', 'err');
    }
    let rep;
    try { rep = build(D, U, f); rep.prov = f.prov; } catch (e) { box.innerHTML = ''; box.appendChild(h('div', { class: 'notice err' }, 'Gagal menyusun laporan: ' + e.message)); return; }
    let note = null;
    if (en) {
      box.innerHTML = ''; box.appendChild(h('p', { class: 'muted' }, 'Translating…'));
      const r = await RCA.reportEN.translate(rep, !!RCA.state.ai && RCA.state.online);
      rep = r.rep;
      if (r.missing) note = h('div', { class: 'notice warn no-print', style: { marginBottom: '12px' } }, r.missing + ' free-text entries remain in Indonesian (as entered in the forms). ' +
        (RCA.state.ai ? (r.aiErr ? 'AI translation failed: ' + r.aiErr : 'They will be translated when online.') : 'Ask the Super Admin to enable AI (Script Property AI_KEY) to translate free text automatically.'));
    }
    const busy = async (btn, fn) => { const t = btn.textContent; btn.disabled = true; btn.textContent = en ? 'Preparing…' : 'Menyiapkan…'; await new Promise(r => setTimeout(r, 30)); try { await fn(); } catch (e) { RCA.toast(e.message, 'err', 8000); } btn.disabled = false; btn.textContent = t; };
    const bP = h('button', { class: 'btn primary', onclick: () => busy(bP, () => toPDF(rep)) }, en ? 'Save PDF' : 'Simpan PDF');
    const bW = h('button', { class: 'btn primary', onclick: () => busy(bW, () => toWord(rep)) }, en ? 'Save Word' : 'Simpan Word');
    bar.appendChild(bP); bar.appendChild(bW);
    bar.appendChild(h('button', { class: 'btn', onclick: () => toExcel(rep) }, en ? 'Save Excel (tables)' : 'Simpan Excel (tabel)'));
    bar.appendChild(h('button', { class: 'btn ghost', onclick: () => window.print() }, en ? 'Print' : 'Cetak'));
    if (RCA.dataset && RCA.can.review()) bar.appendChild(RCA.dataset.button());
    box.innerHTML = ''; if (note) box.appendChild(note); box.appendChild(renderHTML(rep));
  };
  R.build = build;
})();
