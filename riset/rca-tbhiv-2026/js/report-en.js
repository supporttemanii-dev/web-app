/* RCA TB-HIV 2026 · terjemahan Dashboard Laporan ke bahasa Inggris.
   1) kamus tetap untuk judul, kepala tabel, kategori, dan pilihan jawaban;
   2) pola untuk kalimat ringkasan yang berisi angka dan untuk nama wilayah/fasyankes;
   3) teks bebas hasil isian diterjemahkan lewat layanan AI di server bila diaktifkan (hasil disimpan di perangkat). */
(function () {
  'use strict';
  const RCA = window.RCA;
  const T = RCA.reportEN = {};

  const D = {
    // judul dan meta
    'Laporan Evaluasi Lapangan RCA TB-HIV 2026': 'RCA TB-HIV 2026 Field Evaluation Report',
    'Seluruh lokasi (6 provinsi, 12 kab/kota, 24 fasyankes)': 'All sites (6 provinces, 12 districts/cities, 24 health facilities)',
    'Dibuat': 'Generated', 'Oleh': 'By', 'Cakupan data': 'Data scope', 'Acuan': 'Reference',
    'Hanya rekaman berstatus Valid': 'Validated records only', 'Protokol RCA TB-HIV V13; Inception Report P4': 'RCA TB-HIV Protocol V13; Inception Report P4',
    'Daftar isi': 'Contents', 'Tabel': 'Table',
    // bagian
    'Ringkasan': 'Summary',
    'Ringkasan otomatis dari data berstatus Valid. Angka sampel menggambarkan pola dalam sampel, bukan prevalensi fasyankes atau estimasi nasional.': 'Automatic summary of validated data. Sample figures describe patterns within the sample, not facility prevalence or national estimates.',
    'Rekap CP dari C3 belum tersedia (belum ada unit Valid).': 'C3 checkpoint summary not yet available (no validated units).',
    '1. Pelaksanaan pengumpulan data dan kelengkapan': '1. Data collection and completeness',
    'Status pengisian per formulir, capaian sampel terhadap target Protokol V13 Bagian 10–12, dan pembedaan jumlah unit, dokumen, kasus, serta pasien unik.': 'Completion status by form, sample achievement against Protocol V13 Sections 10–12 targets, distinguishing units, documents, cases, and unique patients.',
    'Status pengisian per formulir': 'Completion status by form',
    'Sampel C3 per fasyankes (target inti 6 per kerangka; 18 per fasyankes)': 'C3 sample by facility (core target 6 per frame; 18 per facility)',
    'Telaah kematian, sesi kualitatif, dan sentinel per provinsi': 'Death reviews, qualitative sessions, and sentinel sites by province',
    '2. Q1 · Kapan dan pada tahap mana pelayanan terputus': '2. Q1 · When and at which stage care breaks down',
    'Rekonstruksi pelayanan dari telaah catatan C3 (WP4). n = unit dengan kesenjangan; N = unit yang dapat dinilai. Acak/sensus dan purposif disajikan terpisah; unit purposif menjelaskan mekanisme dan tidak dipakai untuk frekuensi.': 'Care reconstruction from C3 record reviews (WP4). n = units with a gap; N = assessable units. Random/census and purposive units are shown separately; purposive units explain mechanisms and are not used for frequencies.',
    'Rekap kesenjangan per titik penilaian (C3)': 'Gaps by checkpoint (C3)',
    'Waktu antartahap (hari; median dan rentang interkuartil, hanya tanggal sahih)': 'Time between stages (days; median and interquartile range, valid dates only)',
    'Inisiasi ARV pada episode TB-HIV yang belum/pernah terputus ARV (CP6; Juknis 2023: ≤14 hari TB SO, ≤56 hari TB RO)': 'ART initiation in TB-HIV episodes not on or interrupted ART (CP6; 2023 guideline: ≤14 days DS-TB, ≤56 days DR-TB)',
    'Kaskade pencegahan pada unit B (Protokol V13 Bagian 6)': 'Prevention cascade in B units (Protocol V13 Section 6)',
    'Persentase bersyarat N(j+1)/N(j). Penurunan diperiksa untuk membedakan ketidaklayakan klinis, penolakan, pengamatan belum cukup, dan status belum diketahui sebelum disebut kegagalan pelayanan.': 'Conditional percentage N(j+1)/N(j). Drops are examined to distinguish clinical ineligibility, refusal, insufficient follow-up, and unknown status before being called a service failure.',
    'Rujukan (CP8) dan kembali berobat (CP12)': 'Referral (CP8) and return to treatment (CP12)',
    'Luaran pengobatan TB unit A (sampai 30/06/2026)': 'TB treatment outcomes, A units (to 30/06/2026)',
    '3. Q2 · Kontribusi masalah pencatatan dan keterhubungan sistem': '3. Q2 · Contribution of recording and system-linkage problems',
    'Verifikasi dua arah di sentinel (C5) dan perbandingan butir sistem pada unit C3. Temuan sentinel menjelaskan mekanisme dan tidak diekstrapolasi menjadi estimasi kesalahan nasional.': 'Two-way verification at sentinel sites (C5) and comparison of system items in C3 units. Sentinel findings explain mechanisms and are not extrapolated to national error estimates.',
    'Penghitungan ulang dan faktor verifikasi per sentinel (N/D)': 'Recount and verification factor by sentinel site (N/D)',
    'FV = hitung ulang ÷ dilaporkan; batas kerja 0,90–1,10. FV hanya sah untuk model A, sensus periode efektif, kedua arah selesai, dan tanpa baris yang belum diperiksa.': 'VF = recount ÷ reported; working range 0.90–1.10. VF is valid only for model A, a census of the effective period, both directions completed, and no unchecked rows.',
    'Jenis ketidaksesuaian yang ditetapkan (jumlah baris)': 'Types of discrepancy assigned (number of rows)',
    'Kesesuaian butir sistem pada unit C3': 'Agreement of system items in C3 units',
    'CP3: mekanisme penetapan status HIV (pelayanan vs pencatatan)': 'CP3: mechanism of HIV status ascertainment (service vs recording)',
    '4. Q3 · Perbandingan pasangan kab/kota capaian rendah dan tinggi': '4. Q3 · Comparison of low- and high-performing district/city pairs',
    'Perbandingan dalam provinsi memerlukan periode, definisi, dan perspektif yang setara. Tabel ini menyandingkan bukti; penjelasan perbedaan diuji melalui WP7.': 'Within-province comparison requires equivalent periods, definitions, and perspectives. This table juxtaposes evidence; explanations of differences are tested in WP7.',
    'Perbandingan pasangan kab/kota': 'District/city pair comparison',
    '5. Profil proses fasilitas dan 14 titik penilaian (C4; masukan D3)': '5. Facility process profile and 14 checkpoints (C4; input to D3)',
    'Klasifikasi CP ditetapkan dari bukti proses dan unit acak/sensus. Keempat belas CP tidak dijumlahkan menjadi skor fasilitas.': 'Checkpoint classifications are based on process evidence and random/census units. The fourteen checkpoints are not summed into a facility score.',
    'Klasifikasi akhir per CP dan fasyankes': 'Final classification by checkpoint and facility',
    'Rekap klasifikasi per CP (jumlah fasyankes)': 'Classification summary by checkpoint (number of facilities)',
    'Faktor sistem yang dikaitkan dengan temuan CP (WHO building blocks)': 'Health-system factors linked to checkpoint findings (WHO building blocks)',
    'Hasil uji dugaan penyebab awal C1 di fasyankes': 'Results of testing initial C1 hypotheses at facilities',
    'Praktik yang berjalan baik': 'Practices that work well',
    '6. Q4 · Tahap kematian dan peluang perbaikan pelayanan (C6; WP5)': '6. Q4 · Stage of death and opportunities to improve care (C6; WP5)',
    'Telaah berbasis catatan untuk pembelajaran program, tanpa menyalahkan. Sampel purposif hingga 60 kasus tidak dipakai untuk angka mortalitas, kekurangan pelaporan, atau proporsi kematian yang dapat dicegah.': 'Record-based, no-blame review for programme learning. The purposive sample of up to 60 cases is not used for mortality rates, under-reporting, or the proportion of preventable deaths.',
    'Waktu kematian sejak mulai OAT': 'Time to death since TB treatment start',
    'Mutu pelayanan per fase dan kesepakatan antarpenelaah': 'Quality of care by phase and inter-reviewer agreement',
    'Peluang perbaikan dan tiga keterlambatan (penilaian pertama; akhir bila sudah dipanelkan)': 'Improvement opportunities and the three delays (first review; final when paneled)',
    'Masalah, faktor penyumbang, dan peluang perbaikan (B4)': 'Problems, contributing factors, and improvement opportunities (B4)',
    '7. Q5 · Kelompok yang belum mencapai tahap berikutnya dan hambatan yang dialami': '7. Q5 · Groups not reaching the next stage and barriers experienced',
    'Pemilahan sampel C3 menurut jenis kelamin dan umur, serta tema pengalaman pasien, komunitas, dan petugas (C7). Jumlah informan menunjukkan partisipasi, bukan prevalensi hambatan.': 'C3 sample disaggregated by sex and age, and themes from patient, community, and provider experiences (C7). Informant counts show participation, not prevalence of barriers.',
    'Kesenjangan pada unit acak/sensus menurut jenis kelamin': 'Gaps in random/census units by sex',
    'Kesenjangan pada unit acak/sensus menurut kelompok umur': 'Gaps in random/census units by age group',
    'Tema berkode dari wawancara dan diskusi (C7)': 'Coded themes from interviews and discussions (C7)',
    'Cakupan perspektif per kab/kota': 'Coverage of perspectives by district/city',
    '8. Q6 · Bahan sintesis akar masalah dan tindakan (masukan WP7)': '8. Q6 · Material for root-cause and action synthesis (input to WP7)',
    'Daftar dugaan penyebab beserta bukti dan keyakinannya untuk diuji pada lokakarya akar masalah 2027. Suatu penyebab baru ditetapkan sebagai akar masalah bila: (1) mekanismenya terhadap titik putus didukung bukti dengan keyakinan sekurang-kurangnya sedang; (2) berada dalam kendali program, fasilitas, atau sektor; (3) bila diatasi, titik putus diperkirakan berkurang bermakna; dan (4) memenuhi kriteria lain Protokol V13 Bagian 13.': 'List of hypothesised causes with their evidence and confidence, to be tested at the 2027 root-cause workshop. A cause is only designated a root cause when: (1) its mechanism for the breakdown point is supported by evidence with at least moderate confidence; (2) it is within the control of the programme, facility, or sector; (3) addressing it is expected to reduce the breakdown meaningfully; and (4) it meets the other criteria of Protocol V13 Section 13.',
    'Matriks dugaan penyebab dari C4': 'Hypothesised-cause matrix from C4',
    'Pola lintas fasyankes: CP × faktor sistem': 'Cross-facility patterns: checkpoint × system factor',
    'Usulan perbaikan dari peserta dan temuan utama fasyankes': 'Improvement proposals from participants and key facility findings',
    '9. Keterbatasan dan catatan penafsiran': '9. Limitations and notes on interpretation',
    'Data berasal dari sampel purposif enam provinsi, dua belas kab/kota, dan 24 fasyankes; hasil menjelaskan mekanisme dan tidak mengestimasi besaran nasional.': 'Data come from a purposive sample of six provinces, twelve districts/cities, and 24 facilities; results explain mechanisms and do not estimate national magnitudes.',
    'Isian kosong atau TC tidak berarti pelayanan tidak diberikan; TC menjadi kesenjangan hanya setelah penelusuran sumber selesai.': 'A blank or "not recorded" (TC) entry does not mean care was not provided; TC becomes a gap only after source tracing is complete.',
    'Unit purposif dipilih karena ada kesenjangan sehingga tidak dipakai untuk frekuensi; frekuensi hanya dari unit acak/sensus.': 'Purposive units were selected because of a gap and are therefore not used for frequencies; frequencies come from random/census units only.',
    'Kondisi saat kunjungan (Oktober–November 2026) tidak langsung dianggap penyebab kejadian 2024–Juni 2026; tanggal perubahan ditelusuri.': 'Conditions at the time of the visit (October–November 2026) are not assumed to have caused events in 2024–June 2026; dates of change are traced.',
    'Keterangan petugas tanpa bukti tertulis dicatat sebagai hipotesis; keyakinan "Sedang" yang hanya bersandar pada keterangan tidak menyatakan pelayanan terverifikasi.': 'Staff statements without written evidence are recorded as hypotheses; "Moderate" confidence resting only on statements does not mean the service is verified.',
    'Faktor verifikasi C5 hanya berlaku untuk indikator, periode, dan sumber yang dinilai di sentinel.': 'C5 verification factors apply only to the indicators, periods, and sources assessed at the sentinel site.',
    'Penetapan akar masalah dan prioritas tindakan dilakukan WP7 pada semester pertama 2027.': 'Root causes and action priorities will be determined by WP7 in the first half of 2027.',
    // kepala tabel
    'Formulir': 'Form', 'Unit': 'Units', 'Belum': 'Not started', 'Draf': 'Draft', 'Dikirim': 'Submitted', 'Dikembalikan': 'Returned', 'Valid': 'Valid', '% Valid': '% Valid',
    'Fasyankes': 'Facility', 'A terpilih': 'A selected', 'B terpilih': 'B selected', 'CP3 terpilih': 'CP3 selected', 'Total/target': 'Total/target', 'Unit Valid': 'Valid units',
    'Tidak berhasil ditelaah': 'Not reviewable', 'Pasien unik': 'Unique patients', 'Provinsi': 'Province', 'Calon C6': 'C6 candidates', 'Kasus C6 terpilih': 'C6 cases selected',
    'C6 Valid (target ≤10)': 'C6 valid (target ≤10)', 'Sesi C7 Valid (target)': 'Valid C7 sessions (target)', 'Sentinel': 'Sentinel site', 'Indikator C5 Valid (dari 3)': 'Valid C5 indicators (of 3)',
    'CP': 'CP', 'Ranah': 'Domain', 'Fokus': 'Focus', 'Acak/sensus n/N': 'Random/census n/N', 'Purposif n/N': 'Purposive n/N', 'BD / pengamatan belum cukup': 'ND / insufficient follow-up',
    'Selang': 'Interval', 'Median': 'Median', 'IQR': 'IQR', 'Kategori': 'Category', 'Jumlah': 'Count', 'Tahap': 'Stage', 'Jumlah unit': 'Units', 'Dari tahap sebelumnya': 'Of previous stage',
    'Ukuran': 'Measure', 'Hasil': 'Result', 'Median hari (IQR)': 'Median days (IQR)', 'Luaran': 'Outcome', 'Sentinel ': 'Sentinel', 'Indikator': 'Indicator', 'Metode': 'Method', 'Model': 'Model',
    'Dilaporkan N/D': 'Reported N/D', 'Sistem N/D': 'System N/D', 'Sumber N/D': 'Source N/D', 'FV pembilang': 'VF numerator', 'FV penyebut': 'VF denominator', 'Kesahihan': 'Validity',
    'Jenis': 'Type', 'Butir': 'Item', 'Ya, sesuai': 'Yes, matches', 'Ya, berbeda': 'Yes, differs', 'Tidak tercatat': 'Not recorded', 'Belum dicek': 'Not checked',
    'Mekanisme': 'Mechanism', 'Jumlah episode': 'Episodes', 'Kab/kota': 'District/city', 'Capaian': 'Performance', 'Skor kaskade C1': 'C1 cascade score',
    'Dugaan C1 didukung/dibantah/total': 'C1 hypotheses supported/refuted/total', 'CP3 acak n/N': 'CP3 random n/N', 'CP6 acak n/N': 'CP6 random n/N', 'CP7 acak n/N': 'CP7 random n/N', 'CP8 acak n/N': 'CP8 random n/N',
    'CP C4: terverifikasi/sebagian/tidak': 'C4 CPs: verified/partial/not done', 'Terverifikasi': 'Verified', 'Sebagian/terlambat': 'Partial/late', 'Tidak terlaksana': 'Not done', 'Belum pasti': 'Uncertain', 'TBL': 'N/A',
    'Faktor': 'Factor', 'Jumlah CP-fasyankes': 'CP–facility count', 'Dugaan': 'Hypothesis', 'Hasil akhir': 'Final result', 'Bukti penentu': 'Decisive evidence', 'Penjelasan alternatif': 'Alternative explanation',
    'Uraian': 'Description', 'Jumlah kasus': 'Cases', 'Fase': 'Phase', 'Dinilai (P1)': 'Rated (R1)', 'Mutu kurang (skor 1–2)': 'Poor quality (score 1–2)', 'Median skor': 'Median score',
    'Pasangan P1–P2': 'R1–R2 pairs', 'Sepakat tepat': 'Exact agreement', 'Kappa dikotomi': 'Dichotomous kappa', 'Kasus': 'Case', 'Masalah': 'Problem', 'Faktor sistem': 'System factors',
    'Klasifikasi': 'Classification', 'Peluang perbaikan': 'Improvement opportunity', 'Keyakinan': 'Confidence', 'Jenis kelamin': 'Sex', 'Umur': 'Age', 'Tema': 'Theme', 'Kemunculan': 'Occurrences',
    'Sesi': 'Sessions', 'CP/faktor terkait': 'Related CP/factor', 'Pengelola program Dinkes': 'District programme manager', 'Petugas/klinisi TB': 'TB staff/clinicians', 'Petugas/klinisi HIV': 'HIV staff/clinicians',
    'Pasien TB-HIV dalam pengobatan': 'TB-HIV patients on treatment', 'Pasien putus berobat atau menolak TPT': 'Patients lost to follow-up or declining TPT', 'Populasi kunci': 'Key populations',
    'Komunitas/pendamping': 'Community/peer supporters', 'Diskusi petugas': 'Staff discussion', 'Diskusi komunitas': 'Community discussion', 'Masalah utama': 'Main problem', 'Dugaan penyebab': 'Hypothesised cause',
    'Kode bukti': 'Evidence code', 'CP | faktor': 'CP | factor', 'Jumlah temuan': 'Findings', 'Keyakinan tinggi': 'High confidence', 'Sumber': 'Source', 'n': 'n',
    // isi tetap
    'Belum ada data Valid': 'No validated data yet', 'belum ditetapkan': 'not yet designated', 'n < 5': 'n < 5', 'Rendah': 'Low', 'Tinggi': 'High', 'Sedang': 'Moderate',
    'C1 Profil awal dan lembar pendalaman': 'C1 Initial profile and deep-dive sheet', 'C3 Telaah catatan pelayanan': 'C3 Care record review', 'C4 Penilaian fasilitas dan 14 CP': 'C4 Facility assessment and 14 CPs',
    'C5 Verifikasi data sentinel': 'C5 Sentinel data verification', 'C6 Telaah kematian': 'C6 Death review', 'C7 Wawancara mendalam dan diskusi kelompok': 'C7 In-depth interviews and group discussions',
    'Skrining TB': 'TB screening', 'Penetapan status HIV': 'HIV status ascertainment', 'Penilaian kelayakan TPT': 'TPT eligibility assessment', 'Memulai atau melanjutkan ARV': 'Starting or continuing ART',
    'Penawaran dan pemberian awal TPT': 'Offering and starting TPT', 'Koordinasi rujukan': 'Referral coordination', 'Pemantauan dan luaran pengobatan': 'Treatment monitoring and outcomes', 'Penyelesaian TPT': 'TPT completion',
    'Penelusuran pasien dan kembali berobat': 'Patient tracing and return to care', 'Retensi jangka lebih panjang': 'Longer-term retention', 'Informasi dan akuntabilitas (lintas CP)': 'Information and accountability (cross-CP)',
    'Akses awal dari komunitas': 'Initial access from the community', 'Penyelesaian pemeriksaan diagnostik': 'Completion of diagnostic work-up', 'Kepatuhan dan dukungan pengobatan': 'Adherence and treatment support',
    'Telaah kematian (proses organisasi)': 'Death review (organisational process)', 'Kesesuaian SITB/SIHA': 'SITB/SIHA agreement',
    'Terduga TB → diagnosis TB (A)': 'Presumptive TB → TB diagnosis (A)', 'Diagnosis TB → tes HIV (A)': 'TB diagnosis → HIV test (A)', 'Diagnosis TB → mulai OAT (A)': 'TB diagnosis → TB treatment start (A)',
    'Mulai OAT → mulai ARV (A, belum/putus ARV)': 'TB treatment start → ART start (A, not on/interrupted ART)', 'Mulai ARV → skrining TB (B)': 'ART start → TB screening (B)', 'Skrining → keputusan diagnostik (B)': 'Screening → diagnostic decision (B)',
    'Kelayakan → mulai TPT (B)': 'Eligibility → TPT start (B)', 'Diagnosis TB → tes HIV (CP3)': 'TB diagnosis → HIV test (CP3)',
    'Terjadi dalam batas': 'Occurred within limit', 'Kesenjangan: terlambat': 'Gap: late', 'Kesenjangan: tidak dimulai': 'Gap: not started', 'Terjadi, waktu dinilai klinis': 'Occurred, timing clinically judged',
    'Terjadi, waktu belum dapat dinilai': 'Occurred, timing not assessable', 'Jendela pengamatan belum cukup': 'Insufficient observation window', 'TC belum ditelusuri': 'Not recorded, not yet traced', 'BD': 'ND', 'St kosong': 'Evidence status blank',
    'Sensitivitas PNPK 2019: terlambat': 'Sensitivity (PNPK 2019): late', 'Unit B dapat ditelaah': 'B units reviewable', 'Skrining TB tercatat saat mulai ARV (St B03 = Y)': 'TB screening recorded at ART start (B03 St = Y)',
    'Skrining negatif atau TB disingkirkan': 'Screen negative or TB ruled out', 'Kelayakan TPT dinilai (B08 terisi)': 'TPT eligibility assessed (B08 filled)', 'Layak TPT': 'Eligible for TPT', 'TPT ditawarkan': 'TPT offered',
    'TPT dimulai (St B13 = Y)': 'TPT started (B13 St = Y)', 'TPT lengkap': 'TPT completed', 'Rujukan bertanggal, hadir di tujuan ≤30 hari': 'Dated referrals, arrived at destination ≤30 days',
    'Interupsi, kembali berobat ≤90 hari': 'Interruptions, returned to treatment ≤90 days',
    'Sembuh': 'Cured', 'Pengobatan lengkap': 'Treatment completed', 'Gagal': 'Failed', 'Putus berobat': 'Lost to follow-up', 'Meninggal': 'Died', 'Tidak dievaluasi': 'Not evaluated', 'Masih berobat': 'Still on treatment', 'Pindah': 'Transferred out', 'Belum diketahui': 'Unknown',
    'Sesuai': 'Matches', 'Pelayanan belum tercatat dalam sistem': 'Service not recorded in the system', 'Entri tanpa bukti sumber': 'Entry without source evidence', 'Perbedaan definisi atau periode': 'Definition or period difference',
    'Duplikasi': 'Duplicate', 'Perpindahan fasilitas': 'Facility transfer', 'Keterlambatan entri': 'Late entry', 'Perbedaan belum terselesaikan': 'Unresolved difference',
    'A15 Status HIV di SITB': 'A15 HIV status in SITB', 'A16 Pengobatan ARV di SITB': 'A16 ART in SITB', 'A17 Luaran TB di SITB': 'A17 TB outcome in SITB', 'B18 Tanggal mulai ARV di SIHA': 'B18 ART start date in SIHA',
    'B19 Pemberian TPT di SIHA': 'B19 TPT provision in SIHA', 'B20 Luaran TPT di SIHA': 'B20 TPT outcome in SIHA', 'T05 Status ARV per 30/06/2026 di SIHA': 'T05 ART status at 30/06/2026 in SIHA',
    'Sebelum OAT': 'Before TB treatment', '0–14 hari': '0–14 days', '15–30 hari': '15–30 days', '31–90 hari': '31–90 days', '91–180 hari': '91–180 days', 'Lebih dari 180 hari': 'More than 180 days',
    'Waktu OAT tidak diketahui': 'TB treatment timing unknown', 'Tanggal tidak diketahui': 'Date unknown', 'T1 Akses dan diagnosis': 'T1 Access and diagnosis', 'T2 Awal terapi': 'T2 Treatment start',
    'T3 Pemantauan': 'T3 Monitoring', 'T4 Rujukan': 'T4 Referral', 'T5 Penanganan saat memburuk': 'T5 Management of deterioration', 'Peluang perbaikan (P1 = Ya)': 'Improvement opportunity (R1 = Yes)',
    'Peluang perbaikan akhir setelah panel': 'Final improvement opportunity after panel', 'Keterlambatan 1: mencari pelayanan': 'Delay 1: seeking care', 'Keterlambatan 2: mencapai layanan tepat': 'Delay 2: reaching appropriate care',
    'Keterlambatan 3: tata laksana di fasyankes': 'Delay 3: management at the facility', 'Dugaan terkait TB (bukan sebab resmi)': 'Suspected TB-related (not official cause)',
    'Terverifikasi ': 'Verified', 'Sebagian': 'Partial', 'Tidak': 'No', 'Ya': 'Yes', 'Sah': 'Valid', 'Laki-laki': 'Male', 'Perempuan': 'Female', 'L': 'M', 'P': 'F', 'TC': 'Not recorded',
    '< 25 tahun': '< 25 years', '25–49 tahun': '25–49 years', '≥ 50 tahun': '≥ 50 years', 'tanpa faktor': 'no factor', 'Didukung': 'Supported', 'Dibantah': 'Refuted', 'Belum dapat disimpulkan': 'Inconclusive',
    'Pelayanan': 'Service', 'Pencatatan': 'Recording', 'Kesenjangan pelayanan': 'Service gap', 'Kesenjangan pencatatan': 'Recording gap',
    // halaman
    'Dashboard Laporan': 'Report Dashboard', 'Seluruh lokasi': 'All sites', 'Simpan PDF': 'Save PDF', 'Simpan Excel': 'Save Excel', 'Cetak': 'Print'
  };
  const WILAYAH = { 'Sumatera Utara': 'North Sumatra', 'Jawa Barat': 'West Java', 'Jawa Timur': 'East Java', 'DKI Jakarta': 'Jakarta', 'Bali': 'Bali', 'Papua': 'Papua' };
  const kk = s => s.replace(/\bKabupaten ([A-Z][\w ]+?)(?=$|[,;)·])/g, '$1 Regency').replace(/\bKota ([A-Z][\w ]+?)(?=$|[,;)·])/g, '$1 City');
  const PAT = [
    [/^Unit telaah C3 terpilih: (\d+) \(target inti (\d+)\); Valid: (\d+) unit A, (\d+) unit B, (\d+) episode CP3\.$/, m => `C3 review units selected: ${m[1]} (core target ${m[2]}); valid: ${m[3]} A units, ${m[4]} B units, ${m[5]} CP3 episodes.`],
    [/^Kesenjangan tertinggi pada unit acak\/sensus: (.+)\.$/, m => `Highest gaps in random/census units: ${m[1]}.`],
    [/^Penilaian fasilitas C4 Valid: (\d+) dari (\d+) fasyankes\.$/, m => `Valid C4 facility assessments: ${m[1]} of ${m[2]} facilities.`],
    [/^Verifikasi sentinel C5: (\d+) lembar indikator Valid dari (\d+) yang direncanakan\.$/, m => `C5 sentinel verification: ${m[1]} valid indicator sheets of ${m[2]} planned.`],
    [/^Telaah kematian C6: (\d+) kasus Valid; (\d+) dengan peluang perbaikan menurut penelaah pertama\.$/, m => `C6 death reviews: ${m[1]} valid cases; ${m[2]} with an improvement opportunity per the first reviewer.`],
    [/^Wawancara\/diskusi C7 Valid: (\d+) wawancara dan (\d+) diskusi kelompok\.$/, m => `Valid C7 interviews/discussions: ${m[1]} interviews and ${m[2]} group discussions.`],
    [/^(\d+) \((\d+) wawancara, (\d+) diskusi\)$/, m => `${m[1]} (${m[2]} interviews, ${m[3]} discussions)`],
    [/^Provinsi (.+)$/, m => (WILAYAH[m[1]] || m[1]) + ' Province'],
    [/^([A-Z]{3}-(?:RS|PKM)) · Rumah sakit (.+)$/, m => m[1] + ' · Hospital, ' + kk(m[2])],
    [/^([A-Z]{3}-(?:RS|PKM)) · Puskesmas (.+)$/, m => m[1] + ' · Primary health centre, ' + kk(m[2])],
    [/^(Kabupaten|Kota) [A-Z]/, m => null],
    [/^(\d+) \(([\d.]+)%\)$/, m => null]
  ];
  /** terjemahan tetap (tanpa AI); null bila tidak dikenal */
  T.fixed = function (s) {
    if (s === null || s === undefined) return s;
    const str = String(s);
    if (!str.trim() || /^[\d\s.,%/()–\-+:<>=≤≥|×÷]+$/.test(str) || /^[A-Z]{1,4}\d*[a-z]?$/.test(str) || /^[A-Z]{3}-(RS|PKM)[\w-]*$/.test(str)) return str;
    if (D[str] !== undefined) return D[str];
    if (WILAYAH[str]) return WILAYAH[str];
    if (/^(Kabupaten|Kota) /.test(str)) return kk(str);
    for (const [re, fn] of PAT) { const m = re.exec(str); if (m) { const r = fn(m); if (r !== null) return r; } }
    // gabungan "a; b" dari nilai yang dikenal
    if (/; /.test(str)) { const parts = str.split('; ').map(x => T.fixed(x)); if (parts.every(x => x !== null)) return parts.join('; '); }
    // "n/N (x%)" dan kode
    if (/^\d+\/\d+ \([\d.]+%\)$/.test(str)) return str;
    // nilai FV
    const fv = /^([\d.]+) \((pelaporan kurang|pelaporan lebih|dalam batas)\)$/.exec(str);
    if (fv) return fv[1] + ' (' + { 'pelaporan kurang': 'under-reporting', 'pelaporan lebih': 'over-reporting', 'dalam batas': 'within range' }[fv[2]] + ')';
    return null;
  };
  /** terjemahkan model laporan; teks bebas memakai cache/AI. Mengembalikan { rep, missing } */
  T.translate = async function (rep, useAI) {
    const need = new Set();
    const tr = s => { const r = T.fixed(s); if (r === null) need.add(String(s)); return r; };
    const walk = (fn) => ({
      title: fn(rep.title), subtitle: fn(rep.subtitle), prov: rep.prov,
      meta: rep.meta.map(([a, b], i) => [fn(a), i === 1 ? String(b).replace('(SuperAdmin)', '(Super Admin)').replace('(Koordinator)', '(Coordinator)') : i === 0 ? b : fn(b)]),
      sections: rep.sections.map(s => ({ id: s.id, title: fn(s.title), intro: s.intro ? fn(s.intro) : s.intro,
        blocks: s.blocks.map(b => b.type === 'table' ? Object.assign({}, b, { title: fn(b.title), note: b.note ? fn(b.note) : b.note, head: b.head.map(fn), rows: b.rows.map(r => r.map(c => typeof c === 'number' ? c : fn(c))) })
          : b.type === 'list' ? Object.assign({}, b, { items: b.items.map(fn) }) : Object.assign({}, b, { text: fn(b.text) })) }))
    });
    walk(tr);
    const cache = {};
    const list = [...need];
    for (const s of list) { const c = await RCA.idb.get('cache', 'tr|en|' + s); if (c) cache[s] = c; }
    let todo = list.filter(s => !cache[s]);
    let aiErr = '';
    if (useAI && todo.length) {
      for (let i = 0; i < todo.length; i += 40) {
        const batch = todo.slice(i, i + 40);
        try { const r = await RCA.api('text.translate', { texts: batch, to: 'en' }); (r.texts || []).forEach((t, j) => { if (t) { cache[batch[j]] = t; RCA.idb.set('cache', 'tr|en|' + batch[j], t); } }); }
        catch (e) { aiErr = e.message; break; }
      }
      todo = list.filter(s => !cache[s]);
    }
    const out = walk(s => { if (s === null || s === undefined) return s; const r = T.fixed(s); return r !== null ? r : (cache[String(s)] || String(s)); });
    out.lang = 'en';
    return { rep: out, missing: todo.length, aiErr };
  };
})();
