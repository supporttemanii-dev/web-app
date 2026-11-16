/**
 * BANK SOAL UAS — HIV/AIDS dan IMS
 * 50 soal MCQ HOTS (C4–C5: analisis, evaluasi, penalaran) — 5 opsi, satu kunci.
 * File ini HANYA ditempel di Google Apps Script (JANGAN diunggah ke GitHub),
 * karena berisi kunci jawaban. Fungsi setup() di Code.gs menyalinnya ke sheet "Soal".
 */
const SOAL_DATA = [
  // ===================== TOPIK 1: HUBUNGAN GENDER DAN HIV =====================
  {
    id: 1, topik: 'Hubungan Gender dan HIV',
    stem: 'Di sebuah kabupaten, kasus HIV baru pada ibu rumah tangga terus meningkat, padahal sebagian besar dari mereka melaporkan hanya memiliki satu pasangan seksual, yaitu suaminya. Data program menunjukkan banyak suami bekerja sebagai pekerja migran dan sopir antarkota, dan para istri mengaku sulit meminta suami memakai kondom karena dianggap menuduh suami berselingkuh. Analisis yang paling tepat mengenai mekanisme kerentanan para ibu tersebut adalah ...',
    opsi: [
      'Para ibu kemungkinan memiliki perilaku seksual berisiko yang tidak dilaporkan jujur dalam survei',
      'Risiko bersumber dari perilaku pasangan dan relasi kuasa yang membatasi ibu menegosiasikan kondom',
      'Penularan terutama terjadi lewat jalur nonseksual, seperti alat cukur dan alat makan bersama',
      'Kerentanan terutama disebabkan rendahnya pengetahuan para ibu tentang cara penularan HIV yang dasar',
      'Kenaikan kasus semata mencerminkan perluasan cakupan tes, bukan perubahan risiko yang nyata'
    ], kunci: 'B'
  },
  {
    id: 2, topik: 'Hubungan Gender dan HIV',
    stem: 'Seorang pengelola program di puskesmas mencatat bahwa laki-laki di wilayahnya jarang datang untuk tes HIV dan umumnya baru terdiagnosis ketika sudah berada pada stadium lanjut. Sebaliknya, perempuan lebih banyak terdiagnosis lebih awal melalui skrining antenatal saat hamil. Interpretasi yang paling tepat terhadap pola tersebut adalah ...',
    opsi: [
      'Secara biologis laki-laki lebih lambat menunjukkan gejala sehingga mereka merasa tidak perlu dites',
      'Perempuan memiliki risiko penularan lebih tinggi sehingga wajar bila mereka lebih sering terdiagnosis',
      'Norma maskulinitas dan layanan yang berpusat pada ibu membuat laki-laki terlambat mengakses tes HIV',
      'Laki-laki memiliki pengetahuan HIV yang lebih baik sehingga mereka menilai diri tidak berisiko tertular',
      'Pola ini muncul karena tes HIV bagi laki-laki tidak tersedia di fasilitas layanan kesehatan primer'
    ], kunci: 'C'
  },
  {
    id: 3, topik: 'Hubungan Gender dan HIV',
    stem: 'Sebuah program membagikan kondom gratis kepada perempuan pekerja seks, tetapi angka penggunaan kondom tetap rendah. Wawancara mendalam menunjukkan bahwa pelanggan sering menawarkan bayaran lebih tinggi untuk seks tanpa kondom, dan sebagian pekerja seks mengalami kekerasan ketika menolak. Rekomendasi intervensi yang paling tepat berdasarkan temuan tersebut adalah ...',
    opsi: [
      'Menambah jumlah kondom yang dibagikan agar ketersediaan kondom tidak lagi menjadi hambatan utama',
      'Memberikan penyuluhan ulang tentang cara pemakaian kondom yang benar kepada seluruh pekerja seks',
      'Mengalihkan sasaran program sepenuhnya kepada pelanggan karena merekalah sumber masalah yang utama',
      'Mewajibkan tes HIV berkala bagi pekerja seks sebagai syarat agar mereka tetap boleh bekerja di lokasi',
      'Memadukan distribusi kondom dengan pemberdayaan kolektif, pencegahan kekerasan, dan opsi PrEP'
    ], kunci: 'E'
  },
  {
    id: 4, topik: 'Hubungan Gender dan HIV',
    stem: 'Program A menyediakan konseling HIV khusus perempuan pada jam yang disesuaikan dengan jadwal kerja domestik mereka. Program B mengajak pasangan suami-istri berdiskusi kritis tentang norma pengambilan keputusan seksual, pembagian peran rumah tangga, dan kekerasan dalam relasi. Jika dianalisis dengan kontinum integrasi gender, simpulan yang paling tepat adalah ...',
    opsi: [
      'Program A bersifat akomodatif, sedangkan Program B transformatif karena menggugat norma gender',
      'Program A bersifat transformatif karena berfokus langsung pada kebutuhan khusus kaum perempuan',
      'Kedua program bersifat eksploitatif karena memanfaatkan perbedaan gender demi mencapai target',
      'Program B bersifat akomodatif karena hanya menyesuaikan kegiatan dengan norma yang sudah ada',
      'Kedua program setara karena sama-sama mempertimbangkan perbedaan peran laki-laki dan perempuan'
    ], kunci: 'A'
  },
  {
    id: 5, topik: 'Hubungan Gender dan HIV',
    stem: 'Seorang perempuan ODHIV menolak membuka statusnya kepada suami karena takut dipukul dan diusir dari rumah. Untuk menyembunyikan status, ia sering melewatkan dosis ARV ketika suaminya berada di rumah. Konselor di layanan PDP menghadapi dilema antara kepentingan pencegahan pada pasangan dan keselamatan pasien. Langkah konselor yang paling tepat adalah ...',
    opsi: [
      'Segera memberitahukan status pasien kepada suami agar pasangan tersebut dapat langsung menjalani tes',
      'Menyarankan pasien menghentikan ARV sementara waktu hingga situasi rumah tangganya menjadi lebih baik',
      'Menegaskan bahwa pengungkapan status merupakan kewajiban mutlak sebelum terapi dapat dilanjutkan',
      'Menilai risiko kekerasan, menyusun rencana keselamatan, lalu membantu opsi pengungkapan yang aman',
      'Merujuk pasien ke layanan lain karena persoalan rumah tangga berada di luar kewenangan seorang konselor'
    ], kunci: 'D'
  },
  {
    id: 6, topik: 'Hubungan Gender dan HIV',
    stem: 'Survei terpadu biologis dan perilaku menunjukkan prevalensi HIV pada transpuan jauh lebih tinggi dibandingkan populasi umum. Banyak responden transpuan putus sekolah, ditolak keluarga sejak remaja, sulit memperoleh KTP sesuai domisili, dan akhirnya bekerja di sektor informal termasuk pekerjaan seks. Analisis yang paling tepat atas temuan ini adalah ...',
    opsi: [
      'Prevalensi yang tinggi terutama dijelaskan oleh faktor biologis yang khas pada kelompok transpuan',
      'Eksklusi sosial yang berlapis menciptakan kerentanan struktural yang meningkatkan risiko HIV mereka',
      'Risiko tinggi semata akibat pilihan perilaku individu yang tidak terkait dengan konteks sosial',
      'Prevalensi tinggi menunjukkan bahwa kelompok ini kurang terpapar informasi HIV dari media massa',
      'Masalah utama terletak pada rendahnya ketersediaan kondom di lokasi tempat para transpuan bekerja'
    ], kunci: 'B'
  },
  {
    id: 7, topik: 'Hubungan Gender dan HIV',
    stem: 'Dalam sebuah diskusi kelas, seorang mahasiswa berpendapat: “Perbedaan risiko HIV antara laki-laki dan perempuan semata-mata ditentukan oleh perilaku, sehingga faktor lain tidak perlu dipertimbangkan dalam program.” Argumen yang paling kuat untuk mengoreksi pendapat tersebut adalah ...',
    opsi: [
      'Laki-laki secara biologis lebih rentan sehingga perilaku tidak berperan dalam perbedaan risiko HIV',
      'Risiko kedua jenis kelamin identik sehingga perbedaan angka kasus hanya akibat bias pencatatan data',
      'Perbedaan risiko hanya ditentukan oleh jumlah pasangan seksual tanpa peran faktor lain apa pun juga',
      'Faktor biologis tidak relevan karena HIV hanya menular melalui jarum suntik dan transfusi darah saja',
      'Kerentanan juga dibentuk faktor biologis dan sosial, misalnya luas mukosa serta ketimpangan kuasa'
    ], kunci: 'E'
  },
  {
    id: 8, topik: 'Hubungan Gender dan HIV',
    stem: 'Sebuah pemerintah daerah merancang peraturan yang mewajibkan tes HIV bagi calon pengantin dan melarang pernikahan apabila salah satu calon diketahui positif HIV. Pendukung rancangan menyebut aturan ini akan “melindungi perempuan”. Evaluasi yang paling tepat terhadap rancangan tersebut dari perspektif gender dan hak asasi adalah ...',
    opsi: [
      'Aturan berisiko melanggar hak, memperkuat stigma, dan merugikan perempuan yang posisinya lemah',
      'Aturan efektif karena menjamin seluruh pasangan yang menikah terbebas dari risiko penularan HIV',
      'Aturan layak didukung karena melindungi perempuan dari suami yang menyembunyikan status HIV-nya',
      'Aturan bersifat netral gender karena diterapkan pada laki-laki dan perempuan dengan cara yang sama',
      'Aturan hanya bermasalah dari sisi anggaran, sedangkan dari sisi hak tidak menimbulkan persoalan'
    ], kunci: 'A'
  },
  {
    id: 9, topik: 'Hubungan Gender dan HIV',
    stem: 'Di suatu daerah, cakupan tes HIV pada ibu hamil sudah tinggi, tetapi banyak ibu yang positif berhenti minum ARV setelah melahirkan. Dalam wawancara, para ibu menyatakan bahwa keputusan berobat ditentukan oleh suami dan mertua, dan mereka khawatir dicap “perempuan tidak benar” bila terus datang ke klinik. Strategi yang paling tepat untuk mengatasi masalah ini adalah ...',
    opsi: [
      'Menghentikan tes HIV pada ibu hamil karena hasilnya tidak berdampak pada keberlanjutan terapi ibu',
      'Menyerahkan seluruh keputusan pengobatan kepada suami agar dukungan keluarga lebih terjamin',
      'Melibatkan pasangan secara sukarela sambil memperkuat otonomi ibu dan dukungan sebaya ODHIV',
      'Mewajibkan ibu menandatangani pernyataan sanksi apabila berhenti minum ARV setelah melahirkan',
      'Memfokuskan layanan pada bayi saja karena ibu dianggap tidak lagi berisiko menularkan virus'
    ], kunci: 'C'
  },
  {
    id: 10, topik: 'Hubungan Gender dan HIV',
    stem: 'Data surveilans menunjukkan bahwa pada kelompok usia 15–24 tahun, infeksi HIV baru pada perempuan lebih tinggi daripada laki-laki seusianya, sedangkan pola tersebut tidak tampak pada kelompok usia 25–49 tahun. Studi kualitatif menemukan banyak perempuan muda menjalin relasi dengan laki-laki yang jauh lebih tua dan lebih mapan secara ekonomi. Kesimpulan yang paling logis adalah ...',
    opsi: [
      'Perempuan muda lebih sering menggunakan napza suntik dibandingkan laki-laki pada usia yang sama',
      'Laki-laki muda lebih patuh memakai kondom sehingga infeksi barunya selalu jauh lebih rendah',
      'Perbedaan ini terjadi karena laki-laki muda tidak pernah menjalani tes HIV di layanan mana pun',
      'Relasi berjarak usia dan ketimpangan ekonomi meningkatkan kerentanan perempuan muda terhadap HIV',
      'Perempuan muda memiliki daya tahan tubuh paling lemah dibandingkan seluruh kelompok usia lainnya'
    ], kunci: 'D'
  },
  {
    id: 11, topik: 'Hubungan Gender dan HIV',
    stem: 'Seorang laki-laki yang berhubungan seks dengan laki-laki (LSL) menikahi perempuan karena tekanan keluarga dan norma sosial, tetapi tetap berhubungan seks dengan laki-laki secara tersembunyi tanpa kondom. Istrinya tidak mengetahui hal tersebut. Implikasi yang paling tepat bagi perencanaan program HIV adalah ...',
    opsi: [
      'Kasus ini murni urusan moral pribadi sehingga tidak relevan bagi perencanaan program HIV daerah',
      'Program cukup menyasar para istri karena merekalah pihak yang paling berisiko tertular dari suami',
      'Masalah ini dapat diselesaikan dengan mewajibkan seluruh calon pengantin laki-laki menjalani tes',
      'Program sebaiknya mengungkap orientasi seksual peserta kepada keluarga agar risiko dapat dikendalikan',
      'Tekanan norma gender menciptakan jejaring risiko tersembunyi sehingga layanan harus aman dan rahasia'
    ], kunci: 'E'
  },
  {
    id: 12, topik: 'Hubungan Gender dan HIV',
    stem: 'Dua program ditujukan bagi perempuan muda putus sekolah. Program X hanya memberikan edukasi HIV. Program Y memberikan edukasi HIV ditambah bantuan tunai bersyarat untuk kembali sekolah dan pelatihan keterampilan kerja. Evaluasi menunjukkan Program Y menurunkan praktik seks transaksional jauh lebih besar. Penjelasan yang paling tepat atas hasil tersebut adalah ...',
    opsi: [
      'Program Y lebih berhasil karena materi edukasi HIV-nya pasti lebih lengkap daripada Program X',
      'Program Y menyasar faktor struktural ekonomi yang mendorong seks transaksional dan risiko HIV',
      'Program X gagal karena edukasi HIV terbukti tidak pernah memberi manfaat bagi perempuan muda',
      'Perbedaan hasil hanya kebetulan karena intervensi ekonomi tidak berkaitan dengan perilaku seksual',
      'Program Y berhasil karena peserta takut kehilangan bantuan bila diketahui berstatus HIV positif'
    ], kunci: 'B'
  },
  {
    id: 13, topik: 'Hubungan Gender dan HIV',
    stem: 'Data sebuah klinik PDP menunjukkan pasien laki-laki lebih banyak yang putus berobat (loss to follow-up). Alasan yang dilaporkan antara lain jam layanan yang bentrok dengan jam kerja, perasaan “tidak jantan” bila terlihat sakit, dan rasa canggung harus antre bersama ibu hamil dan balita. Intervensi yang paling tepat adalah ...',
    opsi: [
      'Layanan ramah laki-laki: jam fleksibel, pengambilan obat multibulan, dan dukungan sebaya pria',
      'Memberikan teguran tertulis kepada pasien laki-laki yang terlambat mengambil obat ARV di klinik',
      'Memindahkan seluruh layanan pasien laki-laki ke rumah sakit rujukan agar penanganan lebih fokus',
      'Mengurangi layanan ibu hamil agar ruang tunggu tidak lagi didominasi oleh pasien perempuan',
      'Meminta istri pasien mengambilkan obat setiap bulan tanpa perlu melibatkan pasien secara langsung'
    ], kunci: 'A'
  },

  // ===================== TOPIK 2: REMAJA DAN HIV =====================
  {
    id: 14, topik: 'Remaja dan HIV',
    stem: 'Survei pada siswa SMA menunjukkan remaja enggan datang ke puskesmas untuk konseling dan tes HIV. Alasan yang paling banyak disebut: takut dilaporkan ke orang tua, khawatir dihakimi petugas, dan malu bertemu tetangga di ruang tunggu yang sama dengan pasien dewasa. Rekomendasi yang paling tepat untuk meningkatkan akses layanan bagi remaja adalah ...',
    opsi: [
      'Mewajibkan remaja datang bersama orang tua agar keputusan kesehatan tetap dikontrol keluarga',
      'Mengadakan razia kesehatan di sekolah agar seluruh siswa menjalani tes HIV secara serentak',
      'Menerapkan layanan peduli remaja yang rahasia, tidak menghakimi, dan memiliki jam fleksibel',
      'Menambah poster bahaya seks bebas di ruang tunggu puskesmas agar para remaja menjadi jera',
      'Memindahkan layanan remaja ke rumah sakit rujukan agar ditangani langsung oleh dokter spesialis'
    ], kunci: 'C'
  },
  {
    id: 15, topik: 'Remaja dan HIV',
    stem: 'Seorang remaja berusia 15 tahun yang terinfeksi HIV sejak lahir (perinatal) baru diberi tahu statusnya bulan lalu secara mendadak setelah bertanya mengapa harus minum obat setiap hari. Sejak itu ia marah kepada orang tuanya, menolak minum obat, dan hasil viral load terakhirnya meningkat tajam. Analisis yang paling tepat atas kasus ini adalah ...',
    opsi: [
      'Kenaikan viral load pasti akibat resistansi obat sehingga regimen ARV harus segera diganti total',
      'Remaja ini sengaja memberontak sehingga perlu diberi sanksi tegas oleh keluarga dan pihak klinik',
      'Kepatuhan menurun karena remaja telah memahami bahwa ARV tidak lagi diperlukan pada usianya',
      'Pengungkapan terlambat tanpa persiapan memicu krisis psikososial yang mengganggu kepatuhan',
      'Masalah utamanya adalah dosis obat yang terlalu rendah bagi berat badan remaja pada usia tersebut'
    ], kunci: 'D'
  },
  {
    id: 16, topik: 'Remaja dan HIV',
    stem: 'Sebuah rumah sakit memindahkan remaja ODHIV yang berusia 18 tahun langsung dari poli anak ke poli dewasa tanpa persiapan apa pun. Dalam satu tahun, sebagian besar remaja tersebut tidak lagi datang mengambil obat. Mereka menyatakan merasa asing, tidak mengenal petugas baru, dan bingung mengurus layanan sendiri. Rekomendasi yang paling tepat adalah ...',
    opsi: [
      'Mempertahankan semua remaja di poli anak seumur hidup agar mereka tidak perlu dipindahkan',
      'Mempercepat pemindahan ke poli dewasa sejak usia 13 tahun agar remaja cepat menjadi mandiri',
      'Menyerahkan tanggung jawab pengobatan sepenuhnya kepada orang tua hingga remaja menikah',
      'Menghentikan ARV sementara selama masa transisi agar remaja tidak terbebani jadwal minum obat',
      'Transisi bertahap dengan latihan kemandirian, pendampingan, dan koordinasi antarpoli'
    ], kunci: 'E'
  },
  {
    id: 17, topik: 'Remaja dan HIV',
    stem: 'Dua sekolah menerapkan pendekatan berbeda. Sekolah A hanya mengajarkan pesan “jangan berhubungan seks sebelum menikah” tanpa informasi lain. Sekolah B memberikan pendidikan kesehatan reproduksi dan seksualitas yang komprehensif dan sesuai usia, termasuk keterampilan menolak dan informasi layanan. Berdasarkan bukti ilmiah, evaluasi yang paling tepat adalah ...',
    opsi: [
      'Pendidikan komprehensif sesuai usia lebih efektif meningkatkan pengetahuan dan perilaku aman',
      'Pendidikan komprehensif terbukti mendorong para remaja memulai hubungan seksual lebih awal',
      'Pendekatan pantang saja terbukti paling efektif menurunkan infeksi HIV pada semua remaja',
      'Kedua pendekatan tidak berdampak sehingga materi HIV sebaiknya dihapus dari kurikulum sekolah',
      'Efektivitas program hanya ditentukan jumlah jam pelajaran, bukan isi materi yang diajarkan'
    ], kunci: 'A'
  },
  {
    id: 18, topik: 'Remaja dan HIV',
    stem: 'Kasus HIV baru pada LSL usia 18–24 tahun di sebuah kota meningkat tajam. Sebagian besar bertemu pasangan melalui aplikasi kencan daring, jarang mengunjungi layanan kesehatan, dan tidak terjangkau oleh petugas lapangan yang bekerja di lokasi fisik. Strategi penjangkauan yang paling tepat adalah ...',
    opsi: [
      'Meminta penyedia aplikasi memblokir seluruh akun remaja yang diduga memiliki orientasi sesama jenis',
      'Penjangkauan daring oleh pendidik sebaya, tes HIV mandiri, dan rujukan ke layanan yang ramah',
      'Menunggu remaja datang sendiri ke layanan karena penjangkauan daring dianggap melanggar privasi',
      'Menyebarkan foto pengguna aplikasi yang berisiko kepada sekolah agar orang tua dapat mengawasi',
      'Mengadakan ceramah moral di sekolah sebagai satu-satunya strategi pencegahan bagi para remaja'
    ], kunci: 'B'
  },
  {
    id: 19, topik: 'Remaja dan HIV',
    stem: 'Penelitian pada mahasiswa tingkat awal menunjukkan skor pengetahuan HIV mereka tinggi. Namun, banyak responden tetap melakukan hubungan seks tanpa kondom, terutama saat berada dalam kelompok teman dan setelah mengonsumsi alkohol di pesta. Penjelasan yang paling tepat atas kesenjangan antara pengetahuan dan perilaku tersebut adalah ...',
    opsi: [
      'Skor pengetahuan tinggi itu pasti keliru karena remaja yang paham tidak mungkin berperilaku berisiko',
      'Para remaja sengaja ingin tertular HIV agar mendapatkan perhatian dari keluarga dan teman sebaya',
      'Alkohol dipercaya menetralkan virus sehingga remaja merasa aman berhubungan seks tanpa kondom',
      'Pengaruh sebaya dan kontrol diri yang masih berkembang membuat pengetahuan tak selalu jadi perilaku',
      'Perilaku berisiko murni disebabkan ketiadaan kondom di toko-toko sekitar tempat tinggal mereka'
    ], kunci: 'D'
  },
  {
    id: 20, topik: 'Remaja dan HIV',
    stem: 'Sebuah kampus menjalankan program pendidik sebaya HIV selama satu tahun, tetapi partisipasi mahasiswa sangat rendah. Evaluasi menemukan bahwa pendidik sebaya dipilih dosen semata berdasarkan IPK tertinggi, sebagian besar tidak dikenal oleh kelompok sasaran, dan materi disampaikan dalam bentuk ceramah satu arah seperti kuliah. Analisis kegagalan yang paling tepat adalah ...',
    opsi: [
      'Mahasiswa memang tidak tertarik pada isu HIV sehingga program sebaiknya dihentikan sepenuhnya',
      'Pendekatan sebaya tidak pernah efektif bagi remaja dan dewasa muda di lingkungan perguruan tinggi',
      'Kegagalan disebabkan pendidik sebaya terlalu muda sehingga tidak dipercaya oleh kelompok sasaran',
      'Partisipasi rendah karena program tidak memberikan sanksi akademik bagi mahasiswa yang tidak hadir',
      'Pendidik sebaya kurang mewakili kelompok sasaran dan metode yang digunakan tidak partisipatif'
    ], kunci: 'E'
  },
  {
    id: 21, topik: 'Remaja dan HIV',
    stem: 'Seorang remaja berusia 17 tahun menggunakan napza suntik dan mengaku sering berbagi jarum dengan teman-temannya. Ia menolak datang ke layanan kesehatan karena takut ditangkap aparat dan dilaporkan kepada keluarga. Pendekatan yang paling tepat untuk menurunkan risiko HIV pada remaja ini adalah ...',
    opsi: [
      'Pendekatan pengurangan dampak buruk yang ramah remaja dengan jaminan kerahasiaan layanan',
      'Melaporkan remaja tersebut ke aparat agar segera mendapat efek jera dan berhenti memakai napza',
      'Menolak memberikan layanan hingga remaja terbukti sepenuhnya berhenti memakai napza suntik',
      'Memberikan ceramah keagamaan sebagai satu-satunya intervensi yang dianggap sesuai bagi remaja',
      'Menunda intervensi HIV karena remaja di bawah umur tidak termasuk kelompok berisiko tinggi'
    ], kunci: 'A'
  },
  {
    id: 22, topik: 'Remaja dan HIV',
    stem: 'Data kaskade layanan HIV sebuah provinsi menunjukkan bahwa remaja usia 15–19 tahun memiliki cakupan tes yang rendah. Di antara remaja yang sudah terdiagnosis, proporsi yang menjalani ARV dan proporsi yang mencapai supresi viral load juga lebih rendah dibandingkan kelompok dewasa. Kesimpulan yang paling tepat terkait target 95-95-95 adalah ...',
    opsi: [
      'Masalah remaja hanya ada pada tahap tes, sedangkan tahap pengobatan sudah setara dengan dewasa',
      'Remaja tertinggal di setiap tahap kaskade sehingga butuh intervensi khusus usia di setiap tahap',
      'Target 95-95-95 tidak berlaku bagi remaja karena hanya ditujukan pada kelompok populasi dewasa',
      'Rendahnya supresi menunjukkan bahwa ARV tidak efektif bila digunakan pada kelompok usia remaja',
      'Cukup meningkatkan tes pada remaja karena tahap berikutnya akan membaik dengan sendirinya'
    ], kunci: 'B'
  },
  {
    id: 23, topik: 'Remaja dan HIV',
    stem: 'Di sebuah grup percakapan daring, beberapa remaja ODHIV saling meyakinkan bahwa “HIV bisa sembuh total dengan ramuan herbal tertentu”. Dua anggota grup kemudian berhenti minum ARV. Petugas layanan ingin merespons persoalan ini. Intervensi komunikasi yang paling tepat adalah ...',
    opsi: [
      'Melaporkan semua anggota grup kepada polisi karena dianggap menyebarkan berita bohong',
      'Melarang remaja ODHIV memakai media sosial hingga terapi mereka dinyatakan telah selesai',
      'Melibatkan sebaya dan figur tepercaya menyampaikan info akurat dalam format digital remaja',
      'Menyebarkan pesan menakutkan tentang kematian akibat AIDS agar para remaja menjadi jera',
      'Membiarkan diskusi berlangsung karena remaja akan menemukan informasi yang benar sendiri'
    ], kunci: 'C'
  },
  {
    id: 24, topik: 'Remaja dan HIV',
    stem: 'Seorang siswa SMP dengan HIV perinatal dikeluarkan dari sekolah setelah sejumlah orang tua siswa lain mengancam akan memindahkan anak mereka bila siswa tersebut tetap bersekolah. Kepala sekolah beralasan keputusan itu diambil “demi ketenangan bersama”. Analisis yang paling tepat terhadap keputusan sekolah adalah ...',
    opsi: [
      'Pengeluaran dapat dibenarkan demi melindungi siswa lain dari risiko penularan di dalam kelas',
      'Keputusan sekolah tepat karena mengikuti suara mayoritas orang tua sebagai pemangku kepentingan',
      'Siswa sebaiknya ditempatkan di kelas terpisah agar tetap belajar tanpa kontak dengan siswa lain',
      'Keputusan itu diskriminatif, melanggar hak atas pendidikan, dan tak berdasar risiko penularan',
      'Sekolah tidak bersalah karena status HIV siswa seharusnya tidak pernah diketahui pihak sekolah'
    ], kunci: 'D'
  },
  {
    id: 25, topik: 'Remaja dan HIV',
    stem: 'Seorang remaja ODHIV berusia 16 tahun tampak murung, menarik diri dari teman, mengalami gangguan tidur, dan dalam tiga bulan terakhir sering lupa minum ARV. Hasil skrining awal menunjukkan gejala depresi sedang. Pendekatan tata laksana yang paling tepat adalah ...',
    opsi: [
      'Menambah dosis ARV agar efek terapi tetap tercapai walaupun remaja sering lupa minum obatnya',
      'Mengabaikan gejala depresi karena hal tersebut merupakan bagian wajar dari masa pubertas remaja',
      'Menghentikan ARV sampai gejala depresinya pulih agar beban psikologis remaja dapat berkurang',
      'Menyerahkan penanganan sepenuhnya kepada guru sekolah karena guru paling dekat dengan remaja',
      'Mengintegrasikan dukungan kesehatan jiwa dengan layanan ARV serta kelompok dukungan sebaya'
    ], kunci: 'E'
  },
  {
    id: 26, topik: 'Remaja dan HIV',
    stem: 'Di sebuah desa, angka perkawinan anak tergolong tinggi. Banyak anak perempuan usia 15–17 tahun dinikahkan dengan laki-laki dewasa yang memiliki riwayat bekerja sebagai pekerja migran. Seorang kepala desa berpendapat perkawinan anak justru “mencegah pergaulan bebas dan HIV”. Analisis yang paling tepat terhadap pendapat tersebut adalah ...',
    opsi: [
      'Perkawinan anak melemahkan daya tawar anak perempuan sehingga meningkatkan risiko HIV',
      'Perkawinan anak melindungi anak perempuan dari HIV karena mereka hanya memiliki satu pasangan',
      'Perkawinan anak tidak berkaitan dengan HIV karena merupakan isu budaya dan tradisi semata',
      'Risiko HIV hanya meningkat bila anak perempuan tersebut tidak menamatkan pendidikan dasar',
      'Risiko HIV justru lebih rendah karena suami dewasa umumnya berpengetahuan kesehatan lebih baik'
    ], kunci: 'A'
  },

  // ===================== TOPIK 3: STIGMA DAN DISKRIMINASI TERHADAP ODHIV =====================
  {
    id: 27, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Setelah status HIV seorang pegawai diketahui, rekan kerjanya menjulukinya “si AIDS”, menganggapnya pasti “orang tidak benar”, menolak makan satu meja dengannya, dan atasannya tidak lagi mengusulkan dia untuk promosi jabatan. Berdasarkan konseptualisasi stigma menurut Link dan Phelan, analisis yang paling tepat adalah ...',
    opsi: [
      'Kasus ini hanya menggambarkan stigma diri karena pegawai tersebut merasa malu atas statusnya',
      'Terjadi pelabelan, stereotip, pemisahan, hingga kehilangan status dan diskriminasi di tempat kerja',
      'Kasus ini tidak termasuk stigma karena tidak ada kekerasan fisik yang dialami oleh pegawai itu',
      'Kasus ini menggambarkan stigma antisipasi karena pegawai takut diperlakukan buruk di kemudian hari',
      'Tindakan rekan kerja dapat dimaklumi sebagai upaya pencegahan penularan di lingkungan kantor'
    ], kunci: 'B'
  },
  {
    id: 28, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Seorang ODHIV merasa dirinya “kotor”, yakin tidak layak menikah, dan menolak bergabung dengan kelompok dukungan sebaya, padahal keluarga dan lingkungan kerjanya menerima statusnya dengan baik. Identifikasi jenis stigma dan implikasi penanganan yang paling tepat adalah ...',
    opsi: [
      'Stigma yang dilakukan oleh keluarga sehingga keluarga tersebut perlu diberi sanksi sosial',
      'Stigma struktural akibat kebijakan sehingga intervensi cukup dilakukan oleh pemerintah pusat',
      'Stigma terinternalisasi yang perlu ditangani melalui konseling dan dukungan sebaya ODHIV',
      'Tidak termasuk stigma karena berasal dari diri sendiri dan bukan dari orang lain di sekitarnya',
      'Stigma asosiasi yang hanya dialami anggota keluarga, bukan oleh ODHIV yang bersangkutan'
    ], kunci: 'C'
  },
  {
    id: 29, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Seorang perawat memakai dua lapis sarung tangan dan masker hanya untuk mengukur tekanan darah pasien ODHIV, sedangkan untuk pasien lain ia tidak memakai pelindung apa pun. Ia juga menempelkan stiker merah pada sampul rekam medis pasien tersebut. Analisis yang paling tepat terhadap praktik ini adalah ...',
    opsi: [
      'Praktik ini tepat sebagai bentuk perlindungan tambahan bagi tenaga kesehatan yang berisiko',
      'Penandaan berkas wajib dilakukan agar petugas lain mengetahui risiko penularan dari pasien',
      'Praktik ini hanya keliru bila pasien merasa keberatan dan kemudian mengajukan keluhan resmi',
      'Praktik ini diskriminatif dan tidak sesuai kewaspadaan standar yang berlaku bagi semua pasien',
      'Praktik ini menunjukkan kepatuhan perawat yang baik terhadap prinsip kewaspadaan universal'
    ], kunci: 'D'
  },
  {
    id: 30, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Survei di sebuah kecamatan menunjukkan banyak warga dengan perilaku berisiko menolak tes HIV meskipun tes tersedia gratis di puskesmas. Alasan yang paling sering disebut adalah “nanti satu kampung tahu dan keluarga saya dikucilkan”. Analisis yang paling tepat atas temuan ini adalah ...',
    opsi: [
      'Rendahnya tes semata disebabkan warga tidak memahami manfaat pengobatan antiretroviral',
      'Kekhawatiran warga tidak berdasar karena kerahasiaan medis tidak pernah dilanggar di layanan',
      'Hambatan ini dapat diatasi dengan cara mewajibkan tes HIV bagi seluruh warga kampung tersebut',
      'Masalah utamanya adalah biaya tes sehingga cukup diatasi dengan menyediakan tes HIV gratis',
      'Stigma yang diantisipasi menjadi hambatan tes sehingga jaminan kerahasiaan layanan krusial'
    ], kunci: 'E'
  },
  {
    id: 31, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Seorang transpuan yang bekerja sebagai pekerja seks dan berstatus ODHIV mengalami penolakan di layanan kesehatan, diusir dari rumah keluarga, dan sulit mendapatkan pekerjaan lain. Ia menyatakan tidak tahu lagi penolakan mana yang terkait status HIV dan mana yang terkait identitasnya. Konsep yang paling tepat untuk menjelaskan pengalaman tersebut adalah ...',
    opsi: [
      'Stigma interseksional: identitas tersisih yang bertumpuk sehingga memperberat diskriminasi',
      'Stigma tunggal karena seluruh penolakan yang dialaminya disebabkan oleh status HIV semata',
      'Stigma asosiasi karena penolakan itu sebenarnya ditujukan kepada keluarganya, bukan dirinya',
      'Diskriminasi positif karena kelompok rentan memperoleh perlakuan berbeda di layanan publik',
      'Stigma terinternalisasi karena penolakan tersebut hanya ada dalam persepsi individu itu sendiri'
    ], kunci: 'A'
  },
  {
    id: 32, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Anak berstatus HIV-negatif dari seorang ibu ODHIV dijauhi teman-teman sekolahnya. Pada waktu yang sama, seorang konselor yang setiap hari mendampingi ODHIV juga mulai dijauhi oleh tetangganya. Konsep stigma yang paling tepat untuk menjelaskan kedua situasi tersebut adalah ...',
    opsi: [
      'Stigma terinternalisasi karena anak dan konselor merasa malu terhadap diri mereka sendiri',
      'Stigma asosiasi (courtesy stigma) yang menimpa orang terdekat atau pendamping para ODHIV',
      'Bukan bentuk stigma karena anak dan konselor tersebut tidak berstatus HIV positif sama sekali',
      'Stigma struktural karena perlakuan tersebut tercantum dalam peraturan resmi sekolah dan desa',
      'Stigma antisipasi karena perlakuan buruk tersebut belum benar-benar dialami oleh mereka berdua'
    ], kunci: 'B'
  },
  {
    id: 33, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Penelitian formatif di suatu komunitas menemukan tiga pendorong utama stigma HIV: rasa takut tertular melalui kontak sehari-hari, keyakinan bahwa HIV merupakan akibat perbuatan dosa, dan ketidaktahuan masyarakat bahwa sikap mereka merugikan ODHIV. Implikasi yang paling tepat bagi desain intervensi adalah ...',
    opsi: [
      'Cukup memberi informasi cara penularan karena rasa takut merupakan satu-satunya pendorong',
      'Intervensi tidak diperlukan karena pandangan moral masyarakat tidak mungkin dapat diubah',
      'Intervensi harus menyasar rasa takut, penilaian moral, serta kesadaran akan dampak stigma',
      'Fokus pada penegakan hukum karena pendorong stigma hanyalah ketiadaan aturan yang tegas',
      'Mengutamakan pengobatan ODHIV karena stigma akan hilang dengan sendirinya bila kasus turun'
    ], kunci: 'C'
  },
  {
    id: 34, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Dua kabupaten memiliki ketersediaan ARV dan jumlah tenaga kesehatan yang relatif sama. Kabupaten A memiliki skor indeks stigma yang tinggi dan retensi pengobatan ODHIV yang rendah, sedangkan Kabupaten B memiliki skor stigma rendah dan retensi yang tinggi. Kesimpulan yang paling logis dari data tersebut adalah ...',
    opsi: [
      'Perbedaan retensi pasti disebabkan oleh kualitas obat yang berbeda di kedua kabupaten tersebut',
      'Data ini membuktikan stigma adalah satu-satunya penyebab rendahnya retensi di Kabupaten A',
      'Stigma tidak berhubungan dengan retensi karena ketersediaan ARV di kedua daerah adalah sama',
      'Stigma kemungkinan berperan menghambat retensi meskipun ketersediaan obat sudah memadai',
      'Retensi rendah di Kabupaten A menunjukkan bahwa ODHIV di sana tidak memerlukan pengobatan'
    ], kunci: 'D'
  },
  {
    id: 35, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Sebuah portal berita lokal memuat judul “Wanita Penjaja Cinta Sebarkan AIDS ke Warga” disertai foto wajah perempuan tersebut tanpa disensor. Dalam beberapa hari, kunjungan tes HIV di puskesmas sekitar justru menurun. Analisis yang paling tepat atas dampak pemberitaan tersebut adalah ...',
    opsi: [
      'Pemberitaan bermanfaat karena memperingatkan warga agar menjauhi orang yang bersangkutan',
      'Pemberitaan bersifat netral karena hanya menyampaikan fakta yang terjadi di masyarakat',
      'Dampaknya terbatas karena masyarakat umumnya tidak terpengaruh oleh pemberitaan media',
      'Pemberitaan hanya bermasalah apabila nama lengkap perempuan tersebut ikut dicantumkan',
      'Pemberitaan melanggar privasi, memperkuat stereotip, dan membuat orang enggan menjalani tes'
    ], kunci: 'E'
  },
  {
    id: 36, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Sebuah perusahaan mensyaratkan hasil tes HIV bagi setiap calon karyawan dan menolak pelamar yang hasilnya positif, padahal posisi yang dilamar adalah staf administrasi. Manajer HRD beralasan kebijakan ini “melindungi karyawan lain dan produktivitas perusahaan”. Analisis yang paling tepat terhadap kebijakan tersebut adalah ...',
    opsi: [
      'Kebijakan diskriminatif karena status HIV tidak memengaruhi kemampuan kerja administrasi',
      'Penolakan sah karena perusahaan berhak melindungi karyawan lain dari risiko penularan',
      'Penolakan wajar karena ODHIV pasti sering absen sehingga merugikan produktivitas kantor',
      'Tes HIV wajib dapat dibenarkan asalkan hasilnya diumumkan secara terbuka dan jujur',
      'Penolakan hanya bermasalah apabila pelamar belum mengonsumsi ARV saat melamar kerja'
    ], kunci: 'A'
  },
  {
    id: 37, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Hasil survei People Living with HIV Stigma Index di sebuah provinsi menunjukkan bahwa hampir sepertiga responden pernah mengalami pembukaan status HIV tanpa persetujuan oleh tenaga kesehatan. Dinas kesehatan perlu menentukan prioritas tindak lanjut. Prioritas yang paling tepat adalah ...',
    opsi: [
      'Menghentikan pencatatan status HIV di rekam medis agar kebocoran data tidak terjadi lagi',
      'Memperkuat kerahasiaan, melatih petugas, dan menyediakan mekanisme pengaduan di fasyankes',
      'Mengabaikan temuan karena survei berbasis pengalaman ODHIV dianggap tidak cukup objektif',
      'Memindahkan seluruh layanan HIV ke luar fasilitas kesehatan untuk menjamin privasi pasien',
      'Meminta ODHIV tidak lagi memberitahukan status HIV-nya kepada petugas kesehatan mana pun'
    ], kunci: 'B'
  },
  {
    id: 38, topik: 'Stigma dan Diskriminasi terhadap ODHIV',
    stem: 'Seorang ODHIV yang patuh minum ARV dan viral load-nya tidak terdeteksi selama lebih dari satu tahun menolak lamaran kekasihnya karena yakin dirinya “pasti akan menularkan HIV”. Konselor ingin mengurangi stigma diri yang dialaminya dengan informasi berbasis bukti. Informasi yang paling tepat disampaikan adalah ...',
    opsi: [
      'Ia tetap tidak boleh menikah karena risiko penularan seksual sama sekali tidak dapat dikurangi',
      'Ia boleh menikah hanya bila pasangannya juga sudah berstatus HIV positif sejak awal hubungan',
      'Viral load tak terdeteksi yang konsisten berarti tidak menularkan HIV lewat hubungan seksual',
      'Viral load tidak terdeteksi berarti HIV sudah sembuh sehingga ARV boleh dihentikan sekarang',
      'Risiko penularan hanya hilang bila ia tidak pernah berhubungan seksual sepanjang hidupnya'
    ], kunci: 'C'
  },

  // ===================== TOPIK 4: STRATEGI DAN KEBIJAKAN MEREDUKSI STIGMA BAGI ODHIV =====================
  {
    id: 39, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Sebuah pemerintah kabupaten menargetkan penurunan stigma terhadap ODHIV dalam tiga tahun. Satu-satunya kegiatan yang direncanakan adalah mencetak dan membagikan leaflet tentang cara penularan HIV ke seluruh rumah tangga. Evaluasi dan rekomendasi yang paling tepat terhadap rencana tersebut adalah ...',
    opsi: [
      'Leaflet sudah memadai karena stigma terutama disebabkan oleh kurangnya informasi semata',
      'Intervensi sebaiknya hanya menyasar ODHIV agar mereka lebih tahan menghadapi diskriminasi',
      'Upaya penurunan stigma cukup diserahkan kepada LSM tanpa perlu keterlibatan pemerintah',
      'Perlu intervensi multilevel: individu, layanan, komunitas, dan kebijakan secara bersamaan',
      'Fokus utama sebaiknya pada hukuman bagi pelaku stigma tanpa disertai edukasi masyarakat'
    ], kunci: 'D'
  },
  {
    id: 40, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Dalam pelatihan antistigma bagi tenaga kesehatan, kelompok 1 hanya menerima ceramah tentang HIV, sedangkan kelompok 2 menerima ceramah yang sama ditambah dialog langsung dengan ODHIV dan latihan peran menghadapi pasien. Tiga bulan kemudian, sikap dan praktik kelompok 2 jauh lebih baik. Penjelasan yang paling tepat atas hasil tersebut adalah ...',
    opsi: [
      'Kelompok 2 lebih baik karena durasi ceramah yang diterimanya pasti lebih panjang dari kelompok 1',
      'Hasil ini kebetulan karena sikap tenaga kesehatan tidak dapat diubah melalui kegiatan pelatihan',
      'Kelompok 2 lebih baik karena petugas takut ditegur oleh ODHIV yang hadir dalam pelatihan itu',
      'Informasi tidak memiliki peran apa pun dalam upaya menurunkan stigma di layanan kesehatan',
      'Kontak langsung dengan ODHIV dan latihan keterampilan mengubah sikap melebihi informasi saja'
    ], kunci: 'E'
  },
  {
    id: 41, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Program antistigma di sebuah kota dirancang, dilaksanakan, dan dievaluasi sepenuhnya oleh dinas kesehatan tanpa melibatkan ODHIV maupun jaringan komunitasnya. Pesan kampanye dinilai komunitas tidak relevan dan partisipasi sangat rendah. Prinsip yang paling jelas diabaikan dalam program ini adalah ...',
    opsi: [
      'Prinsip GIPA/MIPA, yaitu pelibatan bermakna ODHIV sejak perencanaan hingga evaluasi program',
      'Prinsip efisiensi anggaran yang mengharuskan program dirancang oleh satu pihak saja',
      'Prinsip kerahasiaan yang melarang ODHIV terlibat dalam kegiatan program yang bersifat publik',
      'Prinsip desentralisasi yang menyerahkan program sepenuhnya kepada pemerintah desa setempat',
      'Prinsip universalitas yang mengharuskan isi program sama persis di seluruh wilayah Indonesia'
    ], kunci: 'A'
  },
  {
    id: 42, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Strategi AIDS Global 2021–2026 menetapkan target sosial “10-10-10”, antara lain kurang dari 10% negara memiliki lingkungan hukum dan kebijakan yang bersifat menghukum. Sebuah negara memberlakukan undang-undang yang mempidanakan setiap ODHIV yang tidak membuka statusnya kepada pasangan. Analisis yang paling tepat adalah ...',
    opsi: [
      'Kriminalisasi mendukung target 10-10-10 karena membuat ODHIV lebih berhati-hati dalam berelasi',
      'Kriminalisasi bertentangan dengan target lingkungan hukum yang suportif dan dapat menghambat tes',
      'Target 10-10-10 hanya mengatur cakupan pengobatan sehingga aspek hukum menjadi tidak relevan',
      'Kriminalisasi efektif menurunkan stigma karena masyarakat merasa lebih terlindungi oleh negara',
      'Undang-undang tersebut netral karena hanya berlaku bagi ODHIV yang sengaja menyembunyikan status'
    ], kunci: 'B'
  },
  {
    id: 43, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Sebuah puskesmas ingin meningkatkan cakupan tes HIV. Opsi pertama: menawarkan tes HIV secara rutin kepada semua pasien TB, pasien IMS, dan ibu hamil dengan informasi, persetujuan, dan kerahasiaan. Opsi kedua: melakukan tes kepada kelompok yang sama tanpa memberi tahu pasien. Evaluasi yang paling tepat terhadap kedua opsi tersebut adalah ...',
    opsi: [
      'Opsi kedua lebih tepat karena menjamin semua kasus HIV dapat ditemukan dalam waktu singkat',
      'Tes rutin pada pasien TB tidak diperlukan karena koinfeksi TB-HIV sangat jarang ditemukan',
      'Opsi pertama lebih etis, melindungi kepercayaan pasien, dan berkelanjutan untuk cakupan tes',
      'Persetujuan tidak diperlukan pada ibu hamil karena kepentingan janin selalu lebih diutamakan',
      'Tes sebaiknya hanya diberikan kepada pasien yang meminta sendiri agar tidak dianggap memaksa'
    ], kunci: 'C'
  },
  {
    id: 44, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Direktur sebuah rumah sakit ingin menjadikan rumah sakitnya “fasilitas kesehatan bebas stigma dan diskriminasi”. Asesmen awal menemukan petugas takut tertular, alat pelindung diri sering habis, belum ada SOP kerahasiaan, dan pasien tidak tahu cara menyampaikan keluhan. Paket langkah yang paling komprehensif adalah ...',
    opsi: [
      'Memisahkan ruang tunggu khusus ODHIV agar pasien lain merasa lebih nyaman dan lebih aman',
      'Memasang spanduk antistigma di lobi sebagai satu-satunya bentuk komitmen dari rumah sakit',
      'Menugaskan satu dokter khusus sehingga hanya ia yang berinteraksi langsung dengan ODHIV',
      'Pelatihan staf, SOP kerahasiaan, APD yang memadai, dan umpan balik pasien secara berkala',
      'Mewajibkan semua pasien rawat inap menjalani tes HIV demi melindungi tenaga kesehatan'
    ], kunci: 'D'
  },
  {
    id: 45, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Seorang ODHIV diberhentikan dari pekerjaannya setelah status HIV-nya bocor dari klinik perusahaan. Ia tidak tahu bahwa tindakan tersebut melanggar hak dan tidak tahu harus mengadu ke mana. Kasus serupa dilaporkan berulang di wilayah itu. Strategi kebijakan yang paling tepat agar kasus semacam ini tertangani adalah ...',
    opsi: [
      'Menyarankan ODHIV merahasiakan status seumur hidup agar tidak pernah mengalami pemecatan',
      'Menyerahkan penyelesaian kepada perusahaan karena urusan kepegawaian bersifat internal',
      'Memberi bantuan tunai bagi ODHIV yang dipecat tanpa menindaklanjuti pelanggaran haknya',
      'Membentuk daftar ODHIV terpusat agar pemerintah dapat memantau status pekerjaan mereka',
      'Memperkuat perlindungan hukum, literasi hak, dan akses bantuan hukum bagi para ODHIV'
    ], kunci: 'E'
  },
  {
    id: 46, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Di sebuah komunitas yang sangat religius, stigma terhadap ODHIV tinggi karena HIV dipandang sebagai hukuman atas dosa. Tokoh agama setempat sangat dihormati dan khotbahnya diikuti mayoritas warga. Strategi yang paling tepat untuk menurunkan stigma di komunitas ini adalah ...',
    opsi: [
      'Bermitra dengan tokoh agama untuk menyampaikan pesan kasih, inklusi, dan informasi HIV akurat',
      'Menghindari tokoh agama karena pandangan keagamaan selalu bertentangan dengan program HIV',
      'Melarang ceramah keagamaan yang membahas HIV agar tidak menimbulkan kontroversi di publik',
      'Meminta tokoh agama menyampaikan bahwa HIV adalah hukuman agar warga lebih berhati-hati',
      'Memusatkan program di media sosial karena tokoh agama tidak berpengaruh dalam komunitas'
    ], kunci: 'A'
  },
  {
    id: 47, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Dinas kesehatan telah menjalankan program penurunan stigma selama dua tahun dan diminta DPRD menunjukkan bukti keberhasilannya. Tim monitoring dan evaluasi perlu memilih indikator utama yang paling bermakna. Indikator yang paling tepat dipilih adalah ...',
    opsi: [
      'Jumlah leaflet yang dibagikan dan jumlah peserta yang menghadiri kegiatan sosialisasi',
      'Perubahan sikap dan praktik diskriminatif serta pengalaman stigma yang dilaporkan ODHIV',
      'Jumlah spanduk antistigma yang terpasang di fasilitas umum di seluruh wilayah kabupaten',
      'Besarnya anggaran yang terserap untuk kegiatan antistigma selama satu tahun anggaran',
      'Jumlah berita media yang meliput acara seremonial peluncuran program antistigma daerah'
    ], kunci: 'B'
  },
  {
    id: 48, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Banyak ODHIV di sebuah kecamatan enggan mengambil ARV di puskesmas dekat rumah karena takut bertemu tetangga, sehingga sebagian dari mereka putus berobat. Kepala dinas meminta solusi yang dapat mengurangi dampak stigma sekaligus mempertahankan retensi pengobatan. Solusi kebijakan yang paling tepat adalah ...',
    opsi: [
      'Mewajibkan ODHIV mengambil obat di puskesmas sesuai domisili agar pendataan tetap tertib',
      'Menghentikan layanan ARV di puskesmas dan memusatkannya di rumah sakit tingkat provinsi',
      'Layanan terdiferensiasi: obat multibulan, titik ambil komunitas, atau pilihan fasyankes',
      'Mengumumkan jadwal khusus layanan ODHIV agar mereka tidak bercampur dengan pasien umum',
      'Meminta ODHIV pindah domisili agar dapat berobat di wilayah yang tidak mengenal mereka'
    ], kunci: 'C'
  },
  {
    id: 49, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Sebuah peraturan daerah tentang penanggulangan HIV memuat pasal yang mewajibkan petugas kesehatan melaporkan nama warga yang positif HIV kepada ketua RT setempat “untuk pengawasan lingkungan”. Di sisi lain, kebijakan nasional menekankan kerahasiaan status HIV. Analisis yang paling tepat terhadap pasal tersebut adalah ...',
    opsi: [
      'Pasal tersebut tepat karena ketua RT memiliki kewenangan kesehatan atas lingkungan warganya',
      'Peraturan daerah selalu mengesampingkan kebijakan nasional sehingga pasal itu wajib dijalankan',
      'Pasal tersebut tidak bermasalah selama pelaporan dilakukan secara lisan, bukan secara tertulis',
      'Pasal itu berpotensi melanggar kerahasiaan sehingga perlu dikaji ulang agar selaras hak ODHIV',
      'Pasal tersebut efektif menekan stigma karena membuat status HIV menjadi hal yang dianggap biasa'
    ], kunci: 'D'
  },
  {
    id: 50, topik: 'Strategi dan Kebijakan Mereduksi Stigma',
    stem: 'Data Stigma Index di sebuah kabupaten menunjukkan bahwa sebagian besar pengalaman diskriminasi yang dilaporkan ODHIV terjadi di fasilitas kesehatan. Anggaran daerah untuk program antistigma sangat terbatas sehingga hanya satu kegiatan yang dapat didanai tahun ini. Pilihan kebijakan yang paling efektif adalah ...',
    opsi: [
      'Kampanye baliho antistigma di jalan protokol untuk menjangkau masyarakat seluas mungkin',
      'Seminar antistigma bagi pejabat daerah di hotel sebagai bentuk komitmen politik daerah',
      'Pelatihan antistigma petugas yang disertai SOP dan mekanisme pengaduan di fasyankes',
      'Pembuatan video profil daerah yang menampilkan keberhasilan program HIV di kabupaten',
      'Penambahan stok ARV di gudang farmasi meskipun stok saat ini sudah dalam kondisi cukup'
    ], kunci: 'C'
  }
];
