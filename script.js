// Global State
let totalScore = 0;
let totalStars = 0;
let highScore = parseInt(localStorage.getItem('wq_hiscore') || '0');
let starsAll = parseInt(localStorage.getItem('wq_stars') || '0');
let currentMode = '';
let currentLevel = 'easy';
let pendingCallback = null;

// Audio System
let bgMusic = null;
let currentBgKey = null;
let soundEnabled = false;

const audioFiles = {
  landing: 'assets/bg-music-landing.mp3',
  level: 'assets/bg-music-level.mp3',
  anagram: 'assets/bg-music-susunkata.mp3',
  match: 'assets/bg-music-cocokkata.mp3',
  quiz: 'assets/bg-music-kuis.mp3',
  click: 'assets/click.mp3',
  win: 'assets/win.mp3',
  fail: 'assets/wrong.mp3',
  winner: 'assets/winner.mp3',
  gameover: 'assets/fail.mp3'
};

function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById('sound-toggle');

  if (soundEnabled) {
    btn.textContent = '🔊 ON';
    btn.classList.add('active');
    // suara click sebagai feedback
    try {
      const testSound = new Audio('click.mp3');
      testSound.volume = 0.5;
      testSound.play().catch(e => console.log('Test sound:', e));
    } catch (e) { }
    // play background music sesuai screen aktif
    if (document.getElementById('screen-home').classList.contains('active')) {
      playBackgroundMusic('landing');
    } else if (document.getElementById('screen-level-select').classList.contains('active')) {
      playBackgroundMusic('level');
    } else if (document.getElementById('screen-anagram').classList.contains('active')) {
      playBackgroundMusic('anagram');
    } else if (document.getElementById('screen-match').classList.contains('active')) {
      playBackgroundMusic('match');
    } else if (document.getElementById('screen-quiz').classList.contains('active')) {
      playBackgroundMusic('quiz');
    }
  } else {
    btn.textContent = '🔇 OFF';
    btn.classList.remove('active');
    stopBackgroundMusic();
  }
}

function playBackgroundMusic(musicKey, loop = true) {
  if (!soundEnabled) return;

  const musicFile = audioFiles[musicKey];
  if (!musicFile) {
    console.log('File not found:', musicKey);
    return;
  }

  if (currentBgKey === musicKey && bgMusic && !bgMusic.paused) {
    return;
  }

  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }

  try {
    bgMusic = new Audio(musicFile);
    bgMusic.loop = loop;
    bgMusic.volume = 0.3;
    bgMusic.play().catch(e => console.log('Play error:', e));
    currentBgKey = musicKey;
    console.log('Playing:', musicFile);
  } catch (e) {
    console.log('Audio error:', e);
  }
}

function stopBackgroundMusic() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
    currentBgKey = null;
  }
}

function playSfx(sfxKey) {
  if (!soundEnabled) return;

  const sfxFile = audioFiles[sfxKey];
  if (!sfxFile) {
    console.log('SFX file not found:', sfxKey);
    return;
  }

  try {
    const sfx = new Audio(sfxFile);
    sfx.volume = 0.6;
    sfx.play().catch(e => console.log('SFX error:', e));
  } catch (e) {
    console.log('SFX error:', e);
  }
}

// 10 Levels
const LEVELS = [
  { num: 1, diff: 'easy', emoji: '🌱', stars: '⭐', label: 'Pemula', timeBonus: 0 },
  { num: 2, diff: 'easy', emoji: '🌿', stars: '⭐', label: 'Dasar', timeBonus: 0 },
  { num: 3, diff: 'easy', emoji: '🍀', stars: '⭐⭐', label: 'Mendasar', timeBonus: 0 },
  { num: 4, diff: 'medium', emoji: '🔥', stars: '⭐⭐', label: 'Menengah', timeBonus: 5 },
  { num: 5, diff: 'medium', emoji: '💥', stars: '⭐⭐', label: 'Cukup Sulit', timeBonus: 5 },
  { num: 6, diff: 'medium', emoji: '⚡', stars: '⭐⭐⭐', label: 'Tangguh', timeBonus: 8 },
  { num: 7, diff: 'hard', emoji: '🧠', stars: '⭐⭐⭐', label: 'Ahli', timeBonus: 10 },
  { num: 8, diff: 'hard', emoji: '🏆', stars: '⭐⭐⭐', label: 'Ekspres', timeBonus: 10 },
  { num: 9, diff: 'hard', emoji: '💎', stars: '⭐⭐⭐⭐', label: 'Mahir', timeBonus: 15 },
  { num: 10, diff: 'hard', emoji: '👑', stars: '⭐⭐⭐⭐⭐', label: 'Master', timeBonus: 20 },
];

let currentLevelNum = 1;

// Data Anagram
const anagramData = {
  1: [ // Level 1
    { word: 'BUKU', hint: 'Lembar kertas berjilid yang berisi tulisan' },
    { word: 'PENA', hint: 'Alat tulis yang menggunakan tinta' },
    { word: 'TAS', hint: 'Wadah untuk membawa barang' },
    { word: 'ROTI', hint: 'Makanan berbahan dasar tepung terigu' },
    { word: 'KUCING', hint: 'Hewan peliharaan yang suka mengeong' },
    { word: 'BOLA', hint: 'Benda bulat untuk bermain' },
    { word: 'GURU', hint: 'Orang yang pekerjaannya mengajar' },
    { word: 'PADI', hint: 'Tanaman yang menghasilkan beras' },
  ],
  2: [ // Level 2
    { word: 'MEJA', hint: 'Perkakas rumah berbentuk papan berkaki' },
    { word: 'PETA', hint: 'Gambar permukaan bumi pada kertas' },
    { word: 'BUNGA', hint: 'Bagian tumbuhan yang berwarna-warni' },
    { word: 'HUJAN', hint: 'Titik-titik air yang jatuh dari langit' },
    { word: 'LEMARI', hint: 'Tempat menyimpan pakaian' },
    { word: 'PINTU', hint: 'Jalan masuk ke dalam ruangan' },
    { word: 'JENDELA', hint: 'Lubang pada dinding untuk cahaya dan udara' },
    { word: 'KURSI', hint: 'Tempat duduk dengan sandaran' },
  ],
  3: [ // Level 3
    { word: 'SISWA', hint: 'Orang yang belajar di sekolah' },
    { word: 'SEHAT', hint: 'Keadaan tubuh yang baik' },
    { word: 'KAYA', hint: 'Banyak memiliki harta' },
    { word: 'RAJIN', hint: 'Selalu bekerja keras dan tekun' },
    { word: 'CERDAS', hint: 'Memiliki kecerdasan atau kepintaran yang baik' },
    { word: 'JUJUR', hint: 'Berkata apa adanya, tidak berbohong' },
    { word: 'SABAR', hint: 'Kemampuan menahan emosi dan tidak mudah marah' },
    { word: 'PEMAIN', hint: 'Orang yang bermain dalam suatu permainan' },
  ],
  4: [ // Level 4
    { word: 'MERDEKA', hint: 'Keadaan bebas dari penjajahan' },
    { word: 'BUDAYA', hint: 'Adat istiadat atau kesenian suatu daerah' },
    { word: 'SEMANGAT', hint: 'Gairah atau dorongan untuk berbuat sesuatu' },
    { word: 'BANGSA', hint: 'Kelompok manusia dengan satu identitas negara' },
    { word: 'KOTA', hint: 'Wilayah perkotaan yang padat penduduk' },
    { word: 'KAMPUNG', hint: 'Wilayah pedesaan atau perkampungan' },
    { word: 'SEJARAH', hint: 'Catatan peristiwa masa lalu' },
    { word: 'PRESTASI', hint: 'Hasil yang dicapai dari usaha' },
  ],
  5: [ // Level 5
    { word: 'LESTARI', hint: 'Tetap seperti keadaan semula; tidak berubah' },
    { word: 'TEKNOLOGI', hint: 'Ilmu yang berkaitan dengan alat dan mesin' },
    { word: 'INFORMASI', hint: 'Data atau berita yang diketahui' },
    { word: 'KOMPUTER', hint: 'Alat elektronik untuk mengolah data' },
    { word: 'KOMUNIKASI', hint: 'Proses penyampaian pesan antara dua orang atau lebih' },
    { word: 'PERADABAN', hint: 'Tingkat kemajuan kehidupan suatu masyarakat' },
    { word: 'PENDIDIKAN', hint: 'Proses belajar mengajar untuk menambah ilmu' },
    { word: 'KESEHATAN', hint: 'Keadaan fisik dan mental yang baik' },
  ],
  6: [ // Level 6
    { word: 'KOLABORASI', hint: 'Kerjasama untuk membuat atau menyelesaikan sesuatu' },
    { word: 'PARTISIPASI', hint: 'Peran serta dalam suatu kegiatan' },
    { word: 'INOVASI', hint: 'Pembaruan atau penemuan baru' },
    { word: 'KREATIVITAS', hint: 'Kemampuan menciptakan sesuatu yang baru' },
    { word: 'PRODUKTIF', hint: 'Mampu menghasilkan banyak karya' },
    { word: 'EFISIEN', hint: 'Dapat menyelesaikan tugas dengan cepat dan tepat' },
    { word: 'EFEKTIF', hint: 'Tepat sasaran dan berhasil mencapai tujuan' },
    { word: 'INTEGRITAS', hint: 'Mutu yang menunjukkan kesatuan yang utuh' },
  ],
  7: [ // Level 7 
    { word: 'TRANSPARAN', hint: 'Bersifat terbuka dan mudah dipahami' },
    { word: 'AKUNTABEL', hint: 'Dapat dipertanggungjawabkan' },
    { word: 'KONSISTEN', hint: 'Tetap dan tidak berubah-ubah dalam tindakan' },
    { word: 'TANGGUNGJAWAB', hint: 'Kewajiban untuk melakukan sesuatu' },
    { word: 'KOMPREHENSIF', hint: 'Menyeluruh dan mencakup semua aspek' },
    { word: 'PRIORITAS', hint: 'Hal yang diutamakan atau didahulukan' },
    { word: 'STRATEGI', hint: 'Rencana atau cara untuk mencapai tujuan' },
    { word: 'MANDIRI', hint: 'Keadaan dapat berdiri sendiri; tidak bergantung' },
  ],
  8: [ // Level 8
    { word: 'PROKLAMASI', hint: 'Pernyataan resmi kepada seluruh rakyat' },
    { word: 'PANCASILA', hint: 'Dasar negara Republik Indonesia' },
    { word: 'NUSANTARA', hint: 'Sebutan untuk seluruh wilayah kepulauan Indonesia' },
    { word: 'PATRIOTISME', hint: 'Semangat cinta tanah air' },
    { word: 'NASIONALISME', hint: 'Rasa cinta dan bangga terhadap bangsa sendiri' },
    { word: 'DEMOKRASI', hint: 'Sistem pemerintahan dari rakyat oleh rakyat' },
    { word: 'REPUBLIK', hint: 'Bentuk negara yang dipimpin oleh presiden' },
    { word: 'KEDAULATAN', hint: 'Kekuasaan tertinggi atas suatu wilayah' },
  ],
  9: [ // Level 9
    { word: 'PENGUSAHA', hint: 'Orang yang berwirausaha atau memulai bisnis' },
    { word: 'MANAJEMEN', hint: 'Proses mengelola dan mengatur sesuatu' },
    { word: 'ORGANISASI', hint: 'Kelompok orang yang bekerja sama untuk tujuan tertentu' },
    { word: 'KOORDINASI', hint: 'Pengaturan dan penyelarasan kegiatan' },
    { word: 'PELIMPAHAN', hint: 'Penyerahan wewenang atau tanggung jawab' },
    { word: 'PENILAIAN', hint: 'Peninjauan terhadap sesuatu' },
    { word: 'PELAKSANAAN', hint: 'Penerapan suatu kebijakan' },
    { word: 'PENGAWASAN', hint: 'Proses pemantauan dan pengawasan' },
  ],
  10: [ // Level 10
    { word: 'KEWIRAUSAHAAN', hint: 'Jiwa berbisnis dan inovasi' },
    { word: 'KELESTARIAN', hint: 'Keadaan bertahan dalam jangka panjang' },
    { word: 'PERUBAHAN', hint: 'Proses mengubah bentuk atau struktur' },
    { word: 'PENYELESAIAN', hint: 'Proses menyelesaikan suatu masalah' },
    { word: 'PENGEMBANGAN', hint: 'Proses mengembangkan sesuatu menjadi lebih baik' },
    { word: 'PEMBARUAN', hint: 'Perkenalan sesuatu yang baru' },
    { word: 'KEMAMPUAN', hint: 'Kekuatan untuk melakukan sesuatu' },
    { word: 'KECERDASAN', hint: 'Kepintaran dalam berpikir' },
  ]
};

// Data Match
const matchData = {
  1: [ // Level 1
    [
      { word: 'Pohon', def: 'Tumbuhan berkayu yang tinggi' },
      { word: 'Rumah', def: 'Tempat tinggal manusia' },
      { word: 'Air', def: 'Cairan jernih yang sangat dibutuhkan makhluk hidup' },
      { word: 'Bulan', def: 'Satelit alami yang mengitari bumi' },
      { word: 'Bintang', def: 'Benda langit yang bersinar di malam hari' },
    ]
  ],
  2: [ // Level 2
    [
      { word: 'Sore', def: 'Waktu hari setelah siang sampai matahari terbenam' },
      { word: 'Angin', def: 'Udara yang bergerak dari tekanan tinggi ke rendah' },
      { word: 'Hujan', def: 'Titik-titik air yang jatuh dari awan' },
      { word: 'Awan', def: 'Kumpulan uap air yang mengembun di langit' },
      { word: 'Pelangi', def: 'Busur warna yang muncul setelah hujan' },
    ]
  ],
  3: [ // Level 3
    [
      { word: 'Kucing', def: 'Hewan peliharaan yang suka mengeong' },
      { word: 'Anjing', def: 'Hewan peliharaan yang suka menggonggong' },
      { word: 'Ikan', def: 'Hewan yang hidup di air dan bernapas dengan insang' },
      { word: 'Burung', def: 'Hewan yang memiliki sayap dan bisa terbang' },
      { word: 'Kuda', def: 'Hewan berkaki empat yang bisa berlari cepat' },
    ]
  ],
  4: [ // Level 4
    [
      { word: 'Abadi', def: 'Kekal, tidak pernah berakhir' },
      { word: 'Bersahaja', def: 'Sederhana, tidak berlebihan' },
      { word: 'Cakap', def: 'Pandai dan terampil dalam suatu hal' },
      { word: 'Daring', def: 'Dalam jaringan; terhubung internet' },
      { word: 'Luring', def: 'Luar jaringan; tidak terhubung internet' },
    ]
  ],
  5: [ // Level 5
    [
      { word: 'Giat', def: 'Rajin, aktif, dan bersemangat melakukan sesuatu' },
      { word: 'Kritis', def: 'Bersifat tidak lekas percaya; tajam dalam analisis' },
      { word: 'Luhur', def: 'Mulia, terhormat, dan bernilai tinggi' },
      { word: 'Mandiri', def: 'Keadaan dapat berdiri sendiri; tidak bergantung' },
      { word: 'Nalar', def: 'Kekuatan berpikir untuk mengambil kesimpulan' },
    ]
  ],
  6: [ // Level 6
    [
      { word: 'Inovatif', def: 'Bersifat memperkenalkan sesuatu yang baru' },
      { word: 'Produktif', def: 'Mampu menghasilkan banyak karya' },
      { word: 'Efektif', def: 'Tepat sasaran dan berhasil mencapai tujuan' },
      { word: 'Efisien', def: 'Dapat menyelesaikan tugas dengan cepat dan tepat' },
      { word: 'Kreatif', def: 'Memiliki daya cipta dan imajinasi tinggi' },
    ]
  ],
  7: [ // Level 7
    [
      { word: 'Wacana', def: 'Pembicaraan atau tulisan yang luas' },
      { word: 'Nirkabel', def: 'Tanpa menggunakan kabel' },
      { word: 'Paduan', def: 'Campuran atau gabungan beberapa hal' },
      { word: 'Andal', def: 'Dapat dipercaya kemampuannya' },
      { word: 'Kukuh', def: 'Kuat dan tidak mudah goyah' },
    ]
  ],
  8: [ // Level 8
    [
      { word: 'Keindahan', def: 'Cabang filsafat yang membahas keindahan' },
      { word: 'Kekurangan', def: 'Kekurangan dalam anggaran belanja atau uang' },
      { word: 'Penjatahan', def: 'Penentuan penggunaan dana' },
      { word: 'Turun-naik', def: 'Gejala turun-naiknya harga atau nilai' },
      { word: 'Ketertarikan', def: 'Gaya tarik-menarik antara molekul sejenis' },
    ]
  ],
  9: [ // Level 9
    [
      { word: 'Pelaksanaan', def: 'Penerapan suatu kebijakan' },
      { word: 'Perubahan', def: 'Perubahan secara bertahap menuju bentuk yang lebih baik' },
      { word: 'Perubahan besar', def: 'Perubahan besar dan mendasar dalam waktu singkat' },
      { word: 'Kemunduran', def: 'Keadaan berhenti atau tidak berkembang' },
      { word: 'Pergerakan', def: 'Gerak atau perubahan yang terus terjadi' },
    ]
  ],
  10: [ // Level 10
    [
      { word: 'Pengusaha', def: 'Orang yang berwirausaha atau memulai bisnis' },
      { word: 'Kelestarian', def: 'Keadaan bertahan dalam jangka panjang' },
      { word: 'Perubahan bentuk', def: 'Perubahan bentuk atau struktur secara menyeluruh' },
      { word: 'Perubahan digital', def: 'Proses mengubah informasi menjadi bentuk digital' },
      { word: 'Penyebaran', def: 'Proses menyebar ke seluruh dunia' },
    ]
  ]
};

// Data Quiz
const quizData = {
  1: [ // Level 1
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Besar" adalah...', options: ['Kecil', 'Agung', 'Sempit', 'Tipis'], answer: 1, explanation: 'Sinonim dari "Besar" yang bermakna mulia/luas adalah "Agung".' },
    { category: '📚 Kosakata', question: 'Lawan kata (antonim) dari "Siang" adalah...', options: ['Pagi', 'Malam', 'Sore', 'Fajar'], answer: 1, explanation: 'Lawan kata dari siang hari adalah malam hari.' },
    { category: '📚 Kosakata', question: 'Sinonim dari "Rajin" adalah...', options: ['Giat', 'Malas', 'Bosan', 'Santai'], answer: 0, explanation: '"Giat" berarti bersungguh-sungguh dan rajin bekerja.' },
    { category: '📚 Kosakata', question: 'Lawan kata (antonim) dari "Panas" adalah...', options: ['Hangat', 'Dingin', 'Sejuk', 'Gersang'], answer: 1, explanation: 'Lawan kata dari panas adalah dingin.' },
    { category: '🇮🇩 Pengetahuan', question: 'Warna bendera Indonesia adalah...', options: ['Merah-Putih', 'Merah-Kuning', 'Putih-Biru', 'Hijau-Putih'], answer: 0, explanation: 'Bendera Indonesia berwarna Merah-Putih.' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Cantik" adalah...', options: ['Jelek', 'Indah', 'Kotor', 'Kusam'], answer: 1, explanation: '"Indah" adalah sinonim dari "Cantik".' },
    { category: '📚 Kosakata', question: 'Lawan kata dari "Terang" adalah...', options: ['Gelap', 'Cerah', 'Benderang', 'Silau'], answer: 0, explanation: 'Lawan kata dari terang adalah gelap.' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Sedih" adalah...', options: ['Gembira', 'Senang', 'Duka', 'Suka'], answer: 2, explanation: '"Duka" memiliki arti yang sama dengan "Sedih".' },
  ],
  2: [ // Level 2
    { category: '🇮🇩 Pengetahuan', question: 'Ibu kota negara Republik Indonesia adalah...', options: ['Surabaya', 'Jakarta', 'Bandung', 'Medan'], answer: 1, explanation: 'Ibu kota Indonesia adalah Jakarta.' },
    { category: '🔤 EYD', question: 'Penulisan kata yang benar adalah...', options: ['Apotik', 'Apotek', 'Apotec', 'Apotiq'], answer: 1, explanation: 'Kata baku yang tepat adalah "Apotek".' },
    { category: '✍️ Tata Bahasa', question: 'Awalan pada kata "membaca" adalah...', options: ['mem-', 'me-', 'm-', 'memba-'], answer: 1, explanation: '"Baca" + "me-" = "membaca".' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat "Tolong buka pintunya!" termasuk kalimat...', options: ['Tanya', 'Perintah', 'Berita', 'Seruan'], answer: 1, explanation: 'Kalimat tersebut meminta seseorang melakukan sesuatu (perintah).' },
    { category: '✍️ Tata Bahasa', question: 'Subjek dalam kalimat "Kucing makan ikan" adalah...', options: ['Kucing', 'Makan', 'Ikan', 'Kucing makan'], answer: 0, explanation: 'Subjek pelaku dalam kalimat tersebut adalah "Kucing".' },
    { category: '✍️ Tata Bahasa', question: 'Kata tanya untuk menanyakan waktu adalah...', options: ['Siapa', 'Di mana', 'Kapan', 'Mengapa'], answer: 2, explanation: '"Kapan" digunakan untuk menanyakan waktu.' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Pandai" adalah...', options: ['Bodoh', 'Cerdas', 'Malas', 'Kurang'], answer: 1, explanation: '"Cerdas" memiliki arti yang sama dengan "Pandai".' },
    { category: '🔤 EYD', question: 'Kata baku dari "nafas" adalah...', options: ['nafas', 'napas', 'nafaz', 'napaz'], answer: 1, explanation: 'Kata baku yang tepat adalah "napas".' },
  ],
  3: [ // Level 3
    { category: '🔤 EYD', question: 'Penulisan kata yang baku adalah...', options: ['Kwalitas', 'Kualitas', 'Kwalitas', 'Kualitass'], answer: 1, explanation: 'Penulisan yang benar adalah "Kualitas".' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat yang menggunakan imbuhan "me-" dengan benar adalah...', options: ['Dia menulisi surat', 'Mereka memasuki gedung', 'Saya menjual-jualkan', 'Semua benar'], answer: 1, explanation: '"Memasuki" = me- + masuk + -i (benar).' },
    { category: '📚 Kosakata', question: 'Sinonim kata "Gigih" adalah...', options: ['Malas', 'Tekun', 'Lemah', 'Bingung'], answer: 1, explanation: '"Gigih" dan "Tekun" sama-sama berarti bersungguh-sungguh.' },
    { category: '🔤 EYD', question: 'Penulisan kata yang benar adalah...', options: ['Aktifitas', 'Aktivitas', 'Aktifiti', 'Aktibitas'], answer: 1, explanation: 'Penulisan yang benar adalah "Aktivitas".' },
    { category: '✍️ Tata Bahasa', question: 'Kata "berlari" terdiri dari...', options: ['ber- + lari', 'Kata dasar', 'be- + rlari', 'b- + erlari'], answer: 0, explanation: '"Berlari" = ber- (awalan) + lari (kata dasar).' },
    { category: '📚 Kosakata', question: 'Antonim kata "Keras" adalah...', options: ['Padat', 'Kaku', 'Lembut', 'Tebal'], answer: 2, explanation: 'Antonim dari "Keras" adalah "Lembut".' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Berkat" adalah...', options: ['Kutukan', 'Anugerah', 'Hukuman', 'Bencana'], answer: 1, explanation: '"Anugerah" adalah sinonim dari "Berkat".' },
    { category: '✍️ Tata Bahasa', question: 'Kata ganti untuk orang ketiga tunggal adalah...', options: ['Saya', 'Kamu', 'Dia', 'Mereka'], answer: 2, explanation: '"Dia" adalah kata ganti orang ketiga tunggal.' },
  ],
  4: [ // Level 4
    { category: '📚 Kosakata', question: 'Apa arti kata "Inovatif"?', options: ['Memperkenalkan hal baru', 'Takut berlebihan', 'Meniru orang lain', 'Kurang semangat'], answer: 0, explanation: '"Inovatif" berarti bersifat memperkenalkan sesuatu yang baru.' },
    { category: '📖 Sastra', question: 'Puisi lama yang terdiri dari 4 baris per bait adalah...', options: ['Gurindam', 'Pantun', 'Syair', 'Seloka'], answer: 1, explanation: 'Pantun terdiri dari 4 baris: 2 sampiran dan 2 isi.' },
    { category: '🔤 EYD', question: 'Tanda baca untuk memisahkan anak kalimat adalah...', options: ['Titik (.)', 'Tanya (?)', 'Koma (,)', 'Titik dua (:)'], answer: 2, explanation: 'Koma (,) memisahkan anak kalimat dari induk kalimat.' },
    { category: '📚 Kosakata', question: 'Kata "Pragmatis" berarti...', options: ['Berteori panjang', 'Berorientasi hasil nyata', 'Bermimpi tanpa aksi', 'Idealis'], answer: 1, explanation: '"Pragmatis" berarti mengutamakan segi kepraktisan.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat aktif yang benar adalah...', options: ['Buku dibaca oleh Andi', 'Andi membaca buku', 'Buku dibacakan Andi', 'Andi terbaca'], answer: 1, explanation: 'Kalimat aktif: Subjek + Predikat aktif + Objek.' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Progresif" adalah...', options: ['Mundur', 'Maju', 'Diam', 'Berhenti'], answer: 1, explanation: '"Progresif" berarti maju atau berkembang.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat pasif yang benar adalah...', options: ['Andi memakan nasi', 'Nasi dimakan Andi', 'Andi makan nasi', 'Nasi memakan Andi'], answer: 1, explanation: '"Nasi dimakan Andi" adalah kalimat pasif.' },
    { category: '📚 Kosakata', question: 'Arti kata "Adaptasi" adalah...', options: ['Penolakan', 'Penyesuaian', 'Perubahan total', 'Kebekuan'], answer: 1, explanation: '"Adaptasi" berarti penyesuaian terhadap lingkungan.' },
  ],
  5: [ // Level 5
    { category: '📚 Kosakata', question: 'Arti kata "Efektif" adalah...', options: ['Tepat sasaran', 'Boros waktu', 'Tidak berguna', 'Merugikan'], answer: 0, explanation: '"Efektif" berarti tepat sasaran dan berhasil mencapai tujuan.' },
    { category: '🔤 EYD', question: 'Penulisan kata yang baku adalah...', options: ['Sistim', 'Sistem', 'Sisitem', 'Sistiem'], answer: 1, explanation: 'Kata baku yang tepat adalah "Sistem".' },
    { category: '💬 Peribahasa', question: 'Arti ungkapan "Buah tangan" adalah...', options: ['Hasil curian', 'Oleh-oleh', 'Makanan penutup', 'Tangan yang kuat'], answer: 1, explanation: '"Buah tangan" berarti oleh-oleh atau hadiah.' },
    { category: '📚 Kosakata', question: 'Sinonim dari kata "Kompeten" adalah...', options: ['Tidak mampu', 'Ahli', 'Bodoh', 'Malas'], answer: 1, explanation: '"Kompeten" berarti ahli atau mampu dalam suatu bidang.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat yang menggunakan kata baku adalah...', options: ['Saya pengen makan', 'Aku ingin makan', 'Saya ingin makan', 'Aku pengen makan'], answer: 2, explanation: '"Saya ingin makan" adalah kalimat baku.' },
    { category: '📚 Kosakata', question: 'Arti kata "Dinamis" adalah...', options: ['Statis', 'Bergerak aktif', 'Berhenti', 'Membeku'], answer: 1, explanation: '"Dinamis" berarti bergerak aktif dan terus berkembang.' },
    { category: '💬 Peribahasa', question: 'Arti "Gulung tikar" adalah...', options: ['Pindah rumah', 'Bangkrut', 'Merapikan tempat tidur', 'Usaha baru'], answer: 1, explanation: '"Gulung Tikar" menggambarkan usaha yang bangkrut.' },
    { category: '🔤 EYD', question: 'Penulisan kata "nasihat" yang benar adalah...', options: ['nasehat', 'nasihat', 'nasehatt', 'nasihatt'], answer: 1, explanation: 'Penulisan yang benar adalah "nasihat".' },
  ],
  6: [ // Level 6
    { category: '📚 Kosakata', question: 'Arti kata "Komprehensif" adalah...', options: ['Terperinci dan luas', 'Singkat dan padat', 'Khusus', 'Sementara'], answer: 0, explanation: '"Komprehensif" berarti luas dan menyeluruh.' },
    { category: '🔤 EYD', question: 'Kata baku yang tepat adalah...', options: ['Hirarki', 'Hierarki', 'Hierarki', 'Herarki'], answer: 1, explanation: 'Kata baku yang tepat adalah "Hierarki".' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat majemuk bertingkat adalah...', options: ['Saya dan Andi pergi', 'Saya pergi ke pasar', 'Saya pergi karena hujan', 'Saya membaca buku'], answer: 2, explanation: 'Kalimat majemuk bertingkat = induk + anak kalimat.' },
    { category: '💬 Peribahasa', question: 'Arti "Buah bibir" adalah...', options: ['Rahasia', 'Bahan pembicaraan', 'Makanan', 'Gosip palsu'], answer: 1, explanation: '"Buah bibir" berarti topik yang sedang dibicarakan.' },
    { category: '📚 Kosakata', question: 'Arti kata "Ambigu" adalah...', options: ['Jelas', 'Bermakna ganda', 'Mendalam', 'Sulit dimengerti'], answer: 1, explanation: '"Ambigu" berarti bermakna ganda atau mendua.' },
    { category: '📖 Sastra', question: 'Syair memiliki sajak...', options: ['a-a-a-a', 'a-b-a-b', 'a-a-b-b', 'a-b-c-d'], answer: 0, explanation: 'Syair menggunakan sajak a-a-a-a di setiap baitnya.' },
    { category: '🔤 EYD', question: 'Penulisan yang baku adalah...', options: ['Sistimatis', 'Sistematis', 'Sistemik', 'Sistematika'], answer: 1, explanation: 'Kata dasar "Sistem" → kata sifat "Sistematis".' },
    { category: '📚 Kosakata', question: 'Arti kata "Integritas" adalah...', options: ['Pecahan', 'Keutuhan', 'Perpecahan', 'Kerusakan'], answer: 1, explanation: '"Integritas" berarti keutuhan dan kesatuan yang utuh.' },
  ],
  7: [ // Level 7
    { category: '📚 Kosakata', question: 'Arti kata "Eksistensi" adalah...', options: ['Keberadaan', 'Penghilangan', 'Pengurangan', 'Ketidakpastian'], answer: 0, explanation: '"Eksistensi" berarti keberadaan atau kehadiran.' },
    { category: '🔤 EYD', question: 'Kata baku menurut KBBI adalah...', options: ['Analisa', 'Analisis', 'Analyze', 'Analisia'], answer: 1, explanation: 'Kata baku yang tepat adalah "Analisis".' },
    { category: '📚 Kosakata', question: 'Arti kata "Transparan" adalah...', options: ['Tertutup', 'Terbuka', 'Gelap', 'Rahasia'], answer: 1, explanation: '"Transparan" berarti terbuka dan mudah dipahami.' },
    { category: '💬 Peribahasa', question: 'Arti "Rendah hati" adalah...', options: ['Bersikap sombong', 'Bersikap sederhana', 'Bersikap marah', 'Bersikap acuh'], answer: 1, explanation: '"Rendah hati" berarti tidak sombong dan sederhana.' },
    { category: '📚 Kosakata', question: 'Arti kata "Konsisten" adalah...', options: ['Berubah-ubah', 'Tetap', 'Tidak tentu', 'Kacau'], answer: 1, explanation: '"Konsisten" berarti tetap dan tidak berubah-ubah.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat yang menggunakan konjungsi "karena" adalah...', options: ['Saya dan Andi', 'Saya pergi ke sekolah', 'Saya tidak masuk karena sakit', 'Saya belajar'], answer: 2, explanation: '"Karena" adalah konjungsi yang menunjukkan sebab-akibat.' },
    { category: '📚 Kosakata', question: 'Arti kata "Akuntabel" adalah...', options: ['Dapat dipercaya', 'Dapat dipertanggungjawabkan', 'Tidak jelas', 'Rahasia'], answer: 1, explanation: '"Akuntabel" berarti dapat dipertanggungjawabkan.' },
    { category: '🔤 EYD', question: 'Penulisan yang benar adalah...', options: ['Ilustrasi', 'Ilustasi', 'Illustrasi', 'Ilustrasii'], answer: 0, explanation: 'Penulisan yang benar adalah "Ilustrasi".' },
  ],
  8: [ // Level 8
    { category: '📚 Kosakata', question: 'Arti kata "Keberlanjutan" adalah...', options: ['Kemunduran', 'Berlangsung terus', 'Keterbatasan', 'Perubahan sementara'], answer: 1, explanation: '"Keberlanjutan" berarti terus berlangsung dalam jangka panjang.' },
    { category: '🔤 EYD', question: 'Penulisan kata yang baku adalah...', options: ['Kualitas', 'Kwalitas', 'Kualitas', 'Kwalitas'], answer: 0, explanation: 'Penulisan yang benar adalah "Kualitas".' },
    { category: '💬 Peribahasa', question: 'Arti "Besar kepala" adalah...', options: ['Sombong', 'Bijaksana', 'Kaya raya', 'Berani mati'], answer: 0, explanation: '"Besar kepala" berarti sombong atau angkuh.' },
    { category: '📚 Kosakata', question: 'Arti kata "Efisiensi" adalah...', options: ['Pemborosan tenaga', 'Ketepatan dalam menyelesaikan tugas', 'Kemudahan tanpa usaha', 'Kecepatan tanpa hasil'], answer: 1, explanation: '"Efisiensi" berarti ketepatan dalam menyelesaikan tugas.' },
    { category: '📖 Sastra', question: 'Puisi rakyat yang berisi nasihat dan memiliki sajak a-a-a-a adalah...', options: ['Pantun', 'Syair', 'Gurindam', 'Karmina'], answer: 1, explanation: 'Syair menggunakan sajak a-a-a-a dan berisi nasihat.' },
    { category: '📚 Kosakata', question: 'Arti kata "Kolaborasi" adalah...', options: ['Perpecahan', 'Kerjasama', 'Persaingan', 'Pengasingan'], answer: 1, explanation: '"Kolaborasi" berarti kerjasama untuk mencapai tujuan.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat tanya yang benar adalah...', options: ['Saya makan nasi', 'Kamu pergi ke mana?', 'Dia membaca buku', 'Mereka sudah tiba'], answer: 1, explanation: '"Kamu pergi ke mana?" adalah kalimat tanya yang benar.' },
    { category: '🔤 EYD', question: 'Kata baku dari "kwitansi" adalah...', options: ['kwitansi', 'kuitansi', 'kwitans', 'kuitansii'], answer: 1, explanation: 'Kata baku yang tepat adalah "kuitansi".' },
  ],
  9: [ // Level 9
    { category: '📚 Kosakata', question: 'Arti kata "Implementasi" adalah...', options: ['Perencanaan', 'Pelaksanaan', 'Penundaan', 'Pembatalan'], answer: 1, explanation: '"Implementasi" berarti pelaksanaan atau penerapan.' },
    { category: '🔤 EYD', question: 'Kata baku yang tepat adalah...', options: ['Praktek', 'Praktik', 'Praktek', 'Praktik'], answer: 1, explanation: 'Kata baku yang tepat adalah "Praktik".' },
    { category: '💬 Peribahasa', question: 'Arti "Kaki tangan" adalah...', options: ['Bagian tubuh', 'Orang suruhan', 'Anggota keluarga', 'Pemimpin'], answer: 1, explanation: '"Kaki tangan" berarti orang suruhan atau pembantu.' },
    { category: '📚 Kosakata', question: 'Arti kata "Revolusi" adalah...', options: ['Perubahan kecil', 'Perubahan besar', 'Perubahan tetap', 'Perubahan lambat'], answer: 1, explanation: '"Revolusi" berarti perubahan besar dan mendasar.' },
    { category: '📖 Sastra', question: 'Karya sastra berbentuk prosa lama yang berisi cerita rakyat adalah...', options: ['Hikayat', 'Pantun', 'Syair', 'Gurindam'], answer: 0, explanation: 'Hikayat adalah prosa lama yang berisi cerita rakyat.' },
    { category: '📚 Kosakata', question: 'Arti kata "Evolusi" adalah...', options: ['Perubahan tiba-tiba', 'Perubahan bertahap', 'Perubahan tetap', 'Tidak berubah'], answer: 1, explanation: '"Evolusi" berarti perubahan secara bertahap.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat yang menggunakan kata "yang" sebagai kata penghubung adalah...', options: ['Saya pergi', 'Buku yang saya baca', 'Saya dan Andi', 'Dia datang'], answer: 1, explanation: '"Yang" berfungsi sebagai kata penghubung dalam kalimat.' },
    { category: '🔤 EYD', question: 'Penulisan yang benar adalah...', options: ['Diskusi', 'Diskusi', 'Diskusi', 'Diskusii'], answer: 0, explanation: 'Penulisan yang benar adalah "Diskusi".' },
  ],
  10: [ // Level 10
    { category: '📚 Kosakata', question: 'Arti kata "Mendunia" adalah...', options: ['Terbatas', 'Meluas ke seluruh dunia', 'Tertutup', 'Stagnan'], answer: 1, explanation: '"Mendunia" berarti meluas ke seluruh dunia.' },
    { category: '🔤 EYD', question: 'Kata baku yang tepat adalah...', options: ['Kwalifikasi', 'Kualifikasi', 'Kwalifikasi', 'Kualifikasii'], answer: 1, explanation: 'Kata baku yang tepat adalah "Kualifikasi".' },
    { category: '💬 Peribahasa', question: 'Arti "Berat sebelah" adalah...', options: ['Tidak adil', 'Kuat', 'Ringan', 'Sama rata'], answer: 0, explanation: '"Berat sebelah" berarti tidak adil atau memihak.' },
    { category: '📚 Kosakata', question: 'Arti kata "Transformasi" adalah...', options: ['Perubahan bentuk', 'Tetap', 'Hilang', 'Membeku'], answer: 0, explanation: '"Transformasi" berarti perubahan bentuk atau struktur.' },
    { category: '📖 Sastra', question: 'Pengarang yang terkenal dengan karya "Laskar Pelangi" adalah...', options: ['Andrea Hirata', 'Tere Liye', 'Dee Lestari', 'Risa Saraswati'], answer: 0, explanation: 'Andrea Hirata adalah penulis "Laskar Pelangi".' },
    { category: '📚 Kosakata', question: 'Arti kata "Digitalisasi" adalah...', options: ['Proses manual', 'Proses digital', 'Proses penghapusan', 'Proses pembekuan'], answer: 1, explanation: '"Digitalisasi" berarti proses mengubah informasi ke bentuk digital.' },
    { category: '✍️ Tata Bahasa', question: 'Kalimat yang menggunakan kata "meskipun" adalah...', options: ['Saya pergi ke pasar', 'Meskipun hujan, saya tetap pergi', 'Saya dan dia', 'Dia membaca'], answer: 1, explanation: '"Meskipun" adalah konjungsi yang menunjukkan konsesi.' },
    { category: '📚 Kosakata', question: 'Arti kata "Kewirausahaan" adalah...', options: ['Kemampuan berbisnis', 'Kebodohan', 'Kemalasan', 'Keterbatasan'], answer: 0, explanation: '"Kewirausahaan" berarti kemampuan dalam berbisnis dan berinovasi.' },
  ]
};

//  Credit Screen
function openCreditModal() {
  if (soundEnabled) playSfx('click');
  showScreen('credit');
  if (soundEnabled) stopBackgroundMusic();
}

function closeCredit() {
  if (soundEnabled) playSfx('click');
  showScreen('home');
  if (soundEnabled) playBackgroundMusic('landing');
}

// Navigation
function showScreen(id) {
  if (id !== 'anagram' && window.anagramKeyHandler) {
    document.removeEventListener('keydown', window.anagramKeyHandler);
    window.anagramKeyHandler = null;
  }

  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
}

function goHome() {
  if (window.currentResultSound) {
    window.currentResultSound.pause();
    window.currentResultSound = null;
  }

  const currentScreen = document.querySelector('.screen.active');
  const isInGame = currentScreen &&
    (currentScreen.id === 'screen-anagram' ||
      currentScreen.id === 'screen-match' ||
      currentScreen.id === 'screen-quiz');

  if (isInGame) {
    showConfirmModal('Tinggalkan Permainan?', 'Apakah kamu yakin ingin keluar? Skor saat ini tidak akan disimpan.', function () {
      if (quizTimer) {
        clearInterval(quizTimer);
        quizTimer = null;
      }
      stopBackgroundMusic();
      updateHomeStats();
      if (soundEnabled) playBackgroundMusic('level');
      showScreen('level-select');
    });
  } else {
    if (quizTimer) {
      clearInterval(quizTimer);
      quizTimer = null;
    }
    updateHomeStats();
    if (soundEnabled) playBackgroundMusic('landing');
    showScreen('home');
  }
}

function goToNextLevel() {
  if (soundEnabled) playSfx('click');

  const nextLevel = currentLevelNum + 1;
  if (nextLevel <= 10) {
    currentLevelNum = nextLevel;
    if (nextLevel <= 3) currentLevel = 'easy';
    else if (nextLevel <= 6) currentLevel = 'medium';
    else currentLevel = 'hard';

    startMode(currentMode);
  } else {
    showConfirmModal('🏆 Selamat!', 'Kamu telah menyelesaikan semua level! Kembali ke pilihan level?', function () {
      goToLevelSelect();
    });
  }
}

function updateHomeStats() {
  document.getElementById('home-hiscore').textContent = highScore;
  document.getElementById('home-stars').textContent = starsAll;
}

function openLevelSelect(mode) {
  if (soundEnabled) playSfx('click');
  currentMode = mode;

  const tutorialSeenKey = 'wq_tutorial_seen_' + mode;
  const hasSeenThisTutorial = localStorage.getItem(tutorialSeenKey) === 'true';

  if (!hasSeenThisTutorial) {
    showTutorialForMode(mode);
  } else {
    goToLevelSelect();
  }
}

function goToLevelSelect() {
  const modeNames = {
    anagram: 'Susun Kata',
    match: 'Cocokkan Kata',
    quiz: 'Kuis Kilat'
  };

  const modeIcons = {
    anagram: 'assets/ikon-sunta.png',
    match: 'assets/ikon-cokta.png',
    quiz: 'assets/ikon-kuis.png'
  };

  document.getElementById('selected-mode-text').innerHTML = '';

  const textSpan = document.createElement('span');
  textSpan.id = 'level-mode-text';
  textSpan.textContent = 'Mode: ' + (modeNames[currentMode] || currentMode);

  const iconImg = document.createElement('img');
  iconImg.id = 'level-mode-icon';
  iconImg.className = 'level-mode-icon';
  iconImg.src = modeIcons[currentMode];
  iconImg.alt = modeNames[currentMode];
  iconImg.onerror = function () {
    this.style.display = 'none';
  };

  const container = document.getElementById('selected-mode-text');
  container.appendChild(iconImg);
  container.appendChild(textSpan);

  renderLevelGrid();
  if (soundEnabled) playBackgroundMusic('level');
  showScreen('level-select');
}

function renderLevelGrid() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';
  LEVELS.forEach(lv => {
    const btn = document.createElement('button');
    btn.className = 'level-btn ' + lv.diff;
    btn.innerHTML = `
      <span class="lvl-emoji">${lv.emoji}</span>
      <span class="lvl-number">${lv.num}</span>
      <span class="lvl-diff">${lv.label}</span>
      <span class="lvl-stars">${lv.stars}</span>
    `;
    btn.onclick = () => selectLevel(lv.num, lv.diff);
    grid.appendChild(btn);
  });
}

function selectLevel(num, diff) {
  if (soundEnabled) playSfx('click');
  currentLevelNum = num;
  currentLevel = diff;
  startMode(currentMode);
}

function startMode(mode) {
  if (window.currentResultSound) {
    window.currentResultSound.pause();
    window.currentResultSound = null;
  }

  currentMode = mode;
  totalScore = 0;

  if (soundEnabled) {
    if (mode === 'anagram') {
      playBackgroundMusic('anagram');
    } else if (mode === 'match') {
      playBackgroundMusic('match');
    } else if (mode === 'quiz') {
      playBackgroundMusic('quiz');
    }
  }

  if (mode === 'anagram') initAnagram();
  else if (mode === 'match') initMatch();
  else if (mode === 'quiz') initQuiz();
}

function playAgain() {
  if (soundEnabled) playSfx('click');

  stopBackgroundMusic();

  if (currentMode === 'anagram') {
    if (soundEnabled) playBackgroundMusic('anagram');
    initAnagram();
  } else if (currentMode === 'match') {
    if (soundEnabled) playBackgroundMusic('match');
    initMatch();
  } else if (currentMode === 'quiz') {
    if (soundEnabled) playBackgroundMusic('quiz');
    initQuiz();
  }
}

//  Anagram Mode
let anagramQueue = [];
let anagramCurrent = 0;
let anagramScore = 0;
let anagramCorrect = 0;
let selectedLetters = [];
let availableLetters = [];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initAnagram() {
  const data = anagramData[currentLevelNum] || anagramData[1];
  anagramQueue = shuffle(data).slice(0, Math.min(8, data.length));
  anagramCurrent = 0;
  anagramScore = 0;
  anagramCorrect = 0;
  document.getElementById('anagram-score').textContent = '0';
  const levelBadge = document.getElementById('anagram-level');
  levelBadge.textContent = 'Level ' + currentLevelNum;
  levelBadge.setAttribute('data-level', currentLevelNum);
  showScreen('anagram');
  setTimeout(() => {
    resetLives();
  }, 100);
  loadAnagramQuestion();
}

function loadAnagramQuestion() {
  const q = anagramQueue[anagramCurrent];
  const letters = q.word.split('');
  selectedLetters = new Array(letters.length).fill(null);
  availableLetters = shuffle(letters);

  document.getElementById('anagram-hint').textContent = '💡 Petunjuk: ' + q.hint;
  document.getElementById('scrambled-display').textContent = availableLetters.join(' ');
  document.getElementById('anagram-feedback').textContent = '';
  document.getElementById('anagram-feedback').className = 'feedback-box';

  updateAnagramProgress();
  renderAnswerSlots();
  renderLetterBank();

  if (window.anagramKeyHandler) {
    document.removeEventListener('keydown', window.anagramKeyHandler);
  }

  window.anagramKeyHandler = function (e) {
    const anagramScreen = document.getElementById('screen-anagram');
    if (!anagramScreen.classList.contains('active')) return;

    const feedback = document.getElementById('anagram-feedback');
    if (feedback.classList.contains('show-ok')) return;

    const key = e.key.toUpperCase();
    if (key.length === 1 && key >= 'A' && key <= 'Z') {
      e.preventDefault();

      const bankIdx = availableLetters.indexOf(key);
      if (bankIdx !== -1) {
        addToSlot(bankIdx);
        if (soundEnabled) playSfx('click');
      } else {
        const scrambled = document.getElementById('scrambled-display');
        scrambled.style.color = '#EF4444';
        scrambled.style.transform = 'scale(0.95)';
        setTimeout(() => {
          scrambled.style.color = '#C96A3E';
          scrambled.style.transform = 'scale(1)';
        }, 200);
      }
    }

    // Tombol backspace untuk menghapus huruf terakhir
    if (e.key === 'Backspace') {
      e.preventDefault();
      // Cari slot terisi dari kanan
      for (let i = selectedLetters.length - 1; i >= 0; i--) {
        if (selectedLetters[i] !== null) {
          removeFromSlot(i);
          if (soundEnabled) playSfx('click');
          break;
        }
      }
    }

    // Tombol enter untuk cek jawaban
    if (e.key === 'Enter') {
      e.preventDefault();
      checkAnagram();
    }

    // Tombol R untuk reset
    if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      resetAnagram();
    }
  };

  document.addEventListener('keydown', window.anagramKeyHandler);
}

function updateAnagramProgress() {
  const total = anagramQueue.length;
  const pct = (anagramCurrent / total) * 100;
  document.getElementById('anagram-progress').style.width = pct + '%';
  document.getElementById('anagram-qnum').textContent = (anagramCurrent + 1) + '/' + total;
}

function renderAnswerSlots() {
  const q = anagramQueue[anagramCurrent];
  const container = document.getElementById('answer-slots');
  container.innerHTML = '';
  for (let i = 0; i < q.word.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'answer-slot' + (selectedLetters[i] ? '' : ' empty');
    slot.textContent = selectedLetters[i] || '';
    slot.dataset.idx = i;
    if (selectedLetters[i]) slot.onclick = () => removeFromSlot(i);
    container.appendChild(slot);
  }
}

function renderLetterBank() {
  const container = document.getElementById('letter-bank');
  container.innerHTML = '';
  availableLetters.forEach((letter, i) => {
    const tile = document.createElement('div');
    tile.className = 'letter-tile' + (letter === null ? ' used' : '');
    tile.textContent = letter || '';
    tile.dataset.idx = i;
    if (letter !== null) tile.onclick = () => addToSlot(i);
    container.appendChild(tile);
  });
}

function addToSlot(bankIdx) {
  const letter = availableLetters[bankIdx];
  if (!letter) return;
  const emptySlot = selectedLetters.indexOf(null);
  if (emptySlot === -1) return;
  selectedLetters[emptySlot] = letter;
  availableLetters[bankIdx] = null;
  renderAnswerSlots();
  renderLetterBank();
}

function removeFromSlot(slotIdx) {
  const letter = selectedLetters[slotIdx];
  if (!letter) return;
  const emptyBank = availableLetters.indexOf(null);
  if (emptyBank !== -1) availableLetters[emptyBank] = letter;
  else availableLetters.push(letter);
  selectedLetters[slotIdx] = null;
  renderAnswerSlots();
  renderLetterBank();
}

function resetAnagram() {
  if (soundEnabled) playSfx('click');
  const q = anagramQueue[anagramCurrent];
  selectedLetters = new Array(q.word.length).fill(null);
  availableLetters = shuffle(q.word.split(''));
  document.getElementById('anagram-feedback').textContent = '';
  document.getElementById('anagram-feedback').className = 'feedback-box';
  renderAnswerSlots();
  renderLetterBank();
}

function checkAnagram() {
  if (selectedLetters.includes(null)) {
    showFeedback('anagram-feedback', '⚠️ Isi semua kotak terlebih dahulu!', false);
    return;
  }
  const answer = selectedLetters.join('');
  const correct = anagramQueue[anagramCurrent].word;

  if (answer === correct) {
    const pts = 120 + (currentLevelNum - 1) * 10;
    anagramScore += pts;
    anagramCorrect++;
    document.getElementById('anagram-score').textContent = anagramScore;
    showFeedback('anagram-feedback', '🎉 Benar! +' + pts + ' poin', true);
    if (soundEnabled) playSfx('win');
    setTimeout(() => nextAnagram(), 1200);
  } else {
    showFeedback('anagram-feedback', '❌ Belum tepat. Coba lagi!', false);
    if (soundEnabled) playSfx('fail');
    // Kurangi Nyawa
    if (!reduceLife()) {
      // Game Over
      return;
    }
  }
}

function nextAnagram() {
  anagramCurrent++;
  if (anagramCurrent >= anagramQueue.length) {
    showResult('anagram', anagramScore, anagramCorrect, anagramQueue.length);
  } else {
    loadAnagramQuestion();
  }
}

//  Match Mode
let matchPairs = [];
let selectedWord = null;
let selectedDef = null;
let matchedCount = 0;
let matchScore = 0;
let matchCorrect = 0;

function initMatch() {
  const sets = matchData[currentLevelNum] || matchData[1];
  const setIdx = Math.floor(Math.random() * sets.length);
  matchPairs = shuffle(sets[setIdx]);
  matchedCount = 0;
  matchScore = 0;
  matchCorrect = 0;
  selectedWord = null;
  selectedDef = null;
  document.getElementById('match-score').textContent = '0';
  const levelBadge = document.getElementById('match-level');
  levelBadge.textContent = 'Level ' + currentLevelNum;
  levelBadge.setAttribute('data-level', currentLevelNum);
  document.getElementById('match-feedback').textContent = '';
  document.getElementById('match-feedback').className = 'feedback-box';
  showScreen('match');
  setTimeout(function () {
    resetLives();
  }, 150);
  renderMatchItems();
}

function renderMatchItems() {
  const wordsContainer = document.getElementById('match-words');
  const defsContainer = document.getElementById('match-defs');
  wordsContainer.innerHTML = '';
  defsContainer.innerHTML = '';
  document.getElementById('match-svg').innerHTML = '';

  const shuffledDefs = shuffle(matchPairs.map((p, i) => ({ ...p, origIdx: i })));

  matchPairs.forEach((pair, i) => {
    const el = document.createElement('div');
    el.className = 'match-item match-word';
    el.textContent = pair.word;
    el.dataset.idx = i;
    el.id = 'mw-' + i;
    el.onclick = () => selectMatchWord(i);
    wordsContainer.appendChild(el);
  });

  shuffledDefs.forEach((pair, i) => {
    const el = document.createElement('div');
    el.className = 'match-item match-def';
    el.textContent = pair.def;
    el.dataset.origIdx = pair.origIdx;
    el.id = 'md-' + i;
    el.onclick = () => selectMatchDef(i, pair.origIdx);
    defsContainer.appendChild(el);
  });
}

function selectMatchWord(idx) {
  if (soundEnabled) playSfx('click');
  if (document.getElementById('mw-' + idx).classList.contains('matched-ok')) return;
  document.querySelectorAll('.match-word').forEach(e => e.classList.remove('selected'));
  selectedWord = idx;
  document.getElementById('mw-' + idx).classList.add('selected');
  if (selectedDef !== null) tryMatch();
}

function selectMatchDef(pos, origIdx) {
  if (soundEnabled) playSfx('click');
  if (document.getElementById('md-' + pos).classList.contains('matched-ok')) return;
  document.querySelectorAll('.match-def').forEach(e => e.classList.remove('selected'));
  selectedDef = { pos, origIdx };
  document.getElementById('md-' + pos).classList.add('selected');
  if (selectedWord !== null) tryMatch();
}

function tryMatch() {
  const wEl = document.getElementById('mw-' + selectedWord);
  const dEl = document.getElementById('md-' + selectedDef.pos);
  if (selectedWord === selectedDef.origIdx) {
    wEl.classList.remove('selected'); wEl.classList.add('matched-ok');
    dEl.classList.remove('selected'); dEl.classList.add('matched-ok');
    matchedCount++;
    const pts = 100 + (currentLevelNum - 1) * 10;
    matchScore += pts;
    matchCorrect++;
    document.getElementById('match-score').textContent = matchScore;
    const pct = (matchedCount / matchPairs.length) * 100;
    document.getElementById('match-progress').style.width = pct + '%';
    if (soundEnabled) playSfx('win');
  } else {
    wEl.classList.add('matched-wrong'); dEl.classList.add('matched-wrong');
    setTimeout(() => {
      wEl.classList.remove('matched-wrong', 'selected');
      dEl.classList.remove('matched-wrong', 'selected');
    }, 600);
    matchScore = Math.max(0, matchScore - 20);
    document.getElementById('match-score').textContent = matchScore;
    if (soundEnabled) playSfx('fail');
    reduceLife();
  }
  selectedWord = null; selectedDef = null;
}

function resetMatch() {
  if (soundEnabled) playSfx('click');
  initMatch();
}

function checkMatch() {
  if (matchedCount < matchPairs.length) {
    showFeedback('match-feedback', '⚠️ Belum semua terpasang! Masih ada ' + (matchPairs.length - matchedCount) + ' kata tersisa.', false);
    return;
  }
  if (soundEnabled) playSfx('win');
  showResult('match', matchScore, matchCorrect, matchPairs.length);
}

//  Quiz Mode
let quizQueue = [];
let quizCurrent = 0;
let quizScore = 0;
let quizCorrect = 0;
let quizTimer = null;
let quizTimeLeft = 15;
const TIMER_FULL = 213.6;

function initQuiz() {
  const data = quizData[currentLevelNum] || quizData[1];
  quizQueue = shuffle(data);
  quizCurrent = 0;
  quizScore = 0;
  quizCorrect = 0;
  document.getElementById('quiz-score').textContent = '0';
  const levelBadge = document.getElementById('quiz-level');
  levelBadge.textContent = 'Level ' + currentLevelNum;
  levelBadge.setAttribute('data-level', currentLevelNum);
  showScreen('quiz');
  setTimeout(() => {
    resetLives();
  }, 100);
  loadQuizQuestion();
}

function getQuizTime() {
  const lv = LEVELS.find(l => l.num === currentLevelNum);
  const base = 15;
  const reduction = lv ? Math.floor(lv.timeBonus / 2) : 0;
  return Math.max(5, base - reduction);
}

function loadQuizQuestion() {
  clearInterval(quizTimer);
  const maxTime = getQuizTime();
  quizTimeLeft = maxTime;
  const q = quizQueue[quizCurrent];

  document.getElementById('quiz-category').textContent = q.category;
  document.getElementById('quiz-question').textContent = q.question;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'feedback-box';
  document.getElementById('quiz-qnum').textContent = (quizCurrent + 1) + '/' + quizQueue.length;

  const pct = (quizCurrent / quizQueue.length) * 100;
  document.getElementById('quiz-progress').style.width = pct + '%';

  const optsContainer = document.getElementById('quiz-options');
  optsContainer.innerHTML = '';
  shuffle(q.options.map((opt, i) => ({ opt, origIdx: i }))).forEach(({ opt, origIdx }) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = opt;
    btn.onclick = () => answerQuiz(origIdx, btn, q);
    optsContainer.appendChild(btn);
  });

  updateTimerRing(maxTime, maxTime);
  document.getElementById('quiz-timer-text').textContent = maxTime;
  quizTimer = setInterval(() => {
    quizTimeLeft--;
    updateTimerRing(quizTimeLeft, maxTime);
    document.getElementById('quiz-timer-text').textContent = quizTimeLeft;
    if (quizTimeLeft <= 0) {
      clearInterval(quizTimer);
      timeoutQuiz(q);
    }
  }, 1000);
}

function updateTimerRing(val, max) {
  const offset = TIMER_FULL * (1 - val / max);
  const ring = document.getElementById('timer-ring');
  ring.style.strokeDashoffset = offset;
  if (val > max * 0.5) ring.style.stroke = '#22C55E';
  else if (val > max * 0.25) ring.style.stroke = '#F59E0B';
  else ring.style.stroke = '#EF4444';
}

function answerQuiz(selectedIdx, btn, q) {
  clearInterval(quizTimer);
  const allBtns = document.querySelectorAll('.quiz-opt');
  allBtns.forEach(b => b.disabled = true);

  if (selectedIdx === q.answer) {
    btn.classList.add('correct');
    const maxTime = getQuizTime();
    const bonus = Math.ceil(quizTimeLeft / maxTime * 80) + 50 + (currentLevelNum - 1) * 5;
    quizScore += bonus;
    quizCorrect++;
    document.getElementById('quiz-score').textContent = quizScore;
    showFeedback('quiz-feedback', '✅ Benar! +' + bonus + ' poin — ' + q.explanation, true);
    if (soundEnabled) playSfx('win');
  } else {
    btn.classList.add('wrong');
    allBtns.forEach(b => {
      if (b.textContent === q.options[q.answer]) b.classList.add('correct');
    });
    showFeedback('quiz-feedback', '❌ Salah. ' + q.explanation, false);
    if (soundEnabled) playSfx('fail');
    reduceLife();
  }
  setTimeout(() => nextQuiz(), 2200);
}

function timeoutQuiz(q) {
  const allBtns = document.querySelectorAll('.quiz-opt');
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.options[q.answer]) b.classList.add('correct');
  });
  showFeedback('quiz-feedback', '⏰ Waktu habis! Jawaban: ' + q.options[q.answer], false);
  if (soundEnabled) playSfx('fail');
  setTimeout(() => nextQuiz(), 2200);
  reduceLife();
}

function nextQuiz() {
  quizCurrent++;
  if (quizCurrent >= quizQueue.length) {
    showResult('quiz', quizScore, quizCorrect, quizQueue.length);
  } else {
    loadQuizQuestion();
  }
}

function showResult(mode, score, correct, total) {
  clearInterval(quizTimer);
  totalScore = score;

  const pct = correct / total;
  const livesRemaining = currentLives;
  let stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : 1;
  if (livesRemaining === 1 && stars === 3) {
    stars = 2;
  }

  if (livesRemaining === 0) {
    stars = 1;
  }

  let iconFile = '';
  let title = '';

  if (stars === 3) {
    iconFile = 'assets/ikon-sempurna.png';
    title = 'Luar Biasa!';
  } else if (stars === 2) {
    iconFile = 'assets/ikon-bagus.png';
    title = 'Bagus Sekali!';
  } else {
    iconFile = 'assets/ikon-kalah.png';
    title = 'Tetap Semangat!';
  }

  const sub = pct >= 0.9 ? 'Kamu menguasai materi ini dengan sempurna!' :
    pct >= 0.6 ? 'Kamu sudah memahami sebagian besar materi.' :
      'Jangan menyerah, coba lagi dan kamu pasti bisa!';

  const resultIcon = document.getElementById('result-icon');
  resultIcon.src = iconFile;
  resultIcon.alt = title;
  resultIcon.onerror = function () {
    const fallback = pct >= 0.9 ? '🏆' : pct >= 0.6 ? '🥳' : '😢';
    this.style.display = 'none';
    document.getElementById('result-emoji-wrap').innerHTML = `<span style="font-size:80px;">${fallback}</span>`;
  };

  const emojiWrap = document.getElementById('result-emoji-wrap');
  emojiWrap.style.animation = 'none';
  setTimeout(() => {
    emojiWrap.style.animation = 'resultPop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
  }, 10);

  document.getElementById('result-title').textContent = title;
  document.getElementById('result-subtitle').textContent = sub;
  document.getElementById('res-score').textContent = score;
  document.getElementById('res-stars').textContent = '⭐'.repeat(stars);
  document.getElementById('res-correct').textContent = correct + '/' + total;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('wq_hiscore', highScore);
  }
  starsAll += stars;
  localStorage.setItem('wq_stars', starsAll);

  spawnConfetti();

  if (bgMusic) {
    bgMusic.pause();
    bgMusic = null;
  }

  if (window.currentResultSound) {
    window.currentResultSound.pause();
    window.currentResultSound = null;
  }

  if (soundEnabled) {
    let resultSound = null;

    if (pct >= 0.6) {
      resultSound = new Audio(audioFiles.winner);
    } else {
      resultSound = new Audio(audioFiles.gameover);
    }

    resultSound.volume = 0.6;
    window.currentResultSound = resultSound;

    resultSound.play().catch(e => console.log('Result sound error:', e));

    resultSound.onended = function () {
      if (window.currentResultSound === resultSound) {
        window.currentResultSound = null;
      }
    };
  }

  const btnNext = document.getElementById('btn-next-level');
  if (btnNext) {
    if (stars >= 2) {
      btnNext.style.display = 'inline-block';
    } else {
      btnNext.style.display = 'none';
    }
  }

  showScreen('result');
}

function spawnConfetti() {
  const wrap = document.getElementById('confetti-wrap');
  wrap.innerHTML = '';
  const colors = ['#FF6B35', '#FFE66D', '#4ECDC4', '#A855F7', '#22C55E', '#F59E0B', '#EF4444'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width = (6 + Math.random() * 10) + 'px';
    el.style.height = (6 + Math.random() * 10) + 'px';
    el.style.animationDuration = (2 + Math.random() * 3) + 's';
    el.style.animationDelay = (Math.random() * 1.5) + 's';
    wrap.appendChild(el);
  }
}

//  Helpers
function showFeedback(id, msg, ok) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'feedback-box ' + (ok ? 'show-ok' : 'show-err');
}

//  Modal Konfirm
function showConfirmModal(title, message, onConfirm) {
  let modal = document.getElementById('confirm-modal');
  if (modal) {
    modal.remove();
  }

  modal = document.createElement('div');
  modal.id = 'confirm-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-confirm">
      <h3 id="modal-title"></h3>
      <p id="modal-message"></p>
      <div class="modal-buttons">
        <button class="modal-btn cancel" id="modal-cancel-btn">Batal</button>
        <button class="modal-btn confirm" id="modal-confirm-btn">Ya, Keluar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-message').textContent = message;

  document.getElementById('modal-cancel-btn').onclick = function () {
    hideConfirmModal(false);
  };
  document.getElementById('modal-confirm-btn').onclick = function () {
    hideConfirmModal(true);
  };

  window.confirmCallback = onConfirm;

  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
}

function hideConfirmModal(confirmed) {
  const modal = document.getElementById('confirm-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.remove();
      }
    }, 300);
  }

  if (confirmed && window.confirmCallback) {
    window.confirmCallback();
  }
  window.confirmCallback = null;
}

function hideConfirmModal(confirmed) {
  const modal = document.getElementById('confirm-modal');
  modal.classList.remove('show');

  if (confirmed && window.confirmCallback) {
    window.confirmCallback();
  }
  window.confirmCallback = null;
}


//  Tutorial System
let currentTutorialMode = '';

const tutorialContents = {
  anagram: {
    title: '🔀 Susun Kata',
    icon: 'assets/ikon-sunta.png',
    steps: [
      { icon: '1', title: 'Perhatikan Huruf Acak', desc: 'Lihat huruf-huruf yang tersusun acak di layar' },
      { icon: '2', title: 'Petunjuk', desc: 'Baca petunjuk untuk mengetahui kata yang dimaksud' },
      { icon: '3', title: 'Klik Huruf', desc: 'Klik huruf di bank huruf untuk memasukkannya ke kotak jawaban' },
      { icon: '4', title: 'Cek Jawaban', desc: 'Tekan tombol "Cek Jawaban" untuk memeriksa' }
    ],
    tip: '💡 Tip: Susun huruf dari kiri ke kanan! Setiap jawaban benar mendapat poin, salah akan mengurangi nyawa.'
  },
  match: {
    title: '🎯 Cocokkan Kata',
    icon: 'assets/ikon-cokta.png',
    steps: [
      { icon: '1', title: 'Kolom Kata & Arti', desc: 'Di kiri ada kata, di kanan ada arti/definisi' },
      { icon: '2', title: 'Klik Pasangan', desc: 'Klik satu kata, lalu klik satu arti yang menurutmu cocok' },
      { icon: '3', title: 'Pasangan Benar', desc: 'Jika cocok, pasangan akan berubah hijau dan tercoret' },
      { icon: '4', title: 'Cek Semua', desc: 'Setelah semua terpasang, tekan "Cek Semua" untuk menyelesaikan' }
    ],
    tip: '💡 Tip: Baca arti dengan teliti! Pasangan yang salah akan mengurangi poin 20 dan mengurangi nyawa.'
  },
  quiz: {
    title: '💡 Kuis Kilat',
    icon: 'assets/ikon-kuis.png',
    steps: [
      { icon: '1', title: 'Baca Pertanyaan', desc: 'Setiap soal memiliki pertanyaan dan 4 pilihan jawaban' },
      { icon: '2', title: 'Timer', desc: 'Kamu memiliki waktu terbatas untuk menjawab setiap soal' },
      { icon: '3', title: 'Pilih Jawaban', desc: 'Klik salah satu pilihan yang menurutmu benar' },
      { icon: '4', title: 'Penjelasan', desc: 'Setelah menjawab, akan muncul penjelasan singkat' }
    ],
    tip: '💡 Tip: Semakin cepat menjawab, semakin besar bonus poin yang didapat! Jawaban salah akan mengurangi nyawa.'
  }
};

function showTutorialForMode(mode) {
  const content = tutorialContents[mode];
  if (!content) return;

  currentTutorialMode = mode;

  const badgeContainer = document.getElementById('tutorial-mode-badge');
  badgeContainer.innerHTML = '';

  const iconImg = document.createElement('img');
  iconImg.src = content.icon;
  iconImg.className = 'tutorial-icon-img';
  iconImg.alt = content.title;
  iconImg.onerror = function () {
    this.style.display = 'none';
    badgeContainer.textContent = content.title;
  };

  badgeContainer.appendChild(iconImg);

  // Update steps
  const stepsContainer = document.getElementById('tutorial-steps');
  stepsContainer.innerHTML = '';
  content.steps.forEach(step => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'tutorial-step';
    stepDiv.innerHTML = `
      <div class="tutorial-step-icon">${step.icon}</div>
      <div class="tutorial-step-text">
        <strong>${step.title}</strong>
        ${step.desc}
      </div>
    `;
    stepsContainer.appendChild(stepDiv);
  });

  document.getElementById('tutorial-tip').textContent = content.tip;

  document.getElementById('dont-show-tutorial').checked = false;

  const tutorialModal = document.getElementById('tutorial-modal');
  tutorialModal.classList.add('show');

  tutorialModal.onclick = function (event) {
    if (event.target === tutorialModal) {
      closeTutorialAndGoHome();
    }
  };
}

function closeTutorialAndGoHome() {
  const tutorialModal = document.getElementById('tutorial-modal');
  tutorialModal.classList.remove('show');

  // Kembali ke home screen
  showScreen('home');
  if (soundEnabled) playBackgroundMusic('landing');
} function closeTutorialAndGoHome() {
  const tutorialModal = document.getElementById('tutorial-modal');
  tutorialModal.classList.remove('show');

  // Hapus event listener
  tutorialModal.onclick = null;

  // Kembali ke home screen
  showScreen('home');
  if (soundEnabled) playBackgroundMusic('landing');
}


function closeTutorialAndStart() {
  const dontShowAgain = document.getElementById('dont-show-tutorial').checked;

  if (dontShowAgain) {
    const tutorialSeenKey = 'wq_tutorial_seen_' + currentTutorialMode;
    localStorage.setItem(tutorialSeenKey, 'true');
  }

  const tutorialModal = document.getElementById('tutorial-modal');
  tutorialModal.classList.remove('show');

  tutorialModal.onclick = null;

  goToLevelSelect();
}


//  Lives System
let currentLives = 3;
const MAX_LIVES = 3;

function initLives() {
  currentLives = MAX_LIVES;
  updateLivesDisplay();
}

function updateLivesDisplay() {
  let livesContainer = document.getElementById('lives-display');

  const activeScreen = document.querySelector('.screen.active');
  let headerRow = null;

  if (activeScreen) {
    headerRow = activeScreen.querySelector('.header-top-row');
  }

  if (!headerRow) {
    headerRow = document.querySelector('.header-top-row');
  }

  if (headerRow) {
    livesContainer = headerRow.querySelector('#lives-display');

    if (!livesContainer) {
      livesContainer = document.createElement('div');
      livesContainer.id = 'lives-display';
      livesContainer.className = 'lives-display';
      headerRow.appendChild(livesContainer);
    }
  }

  if (!livesContainer) {
    livesContainer = document.getElementById('lives-display');
  }

  if (!livesContainer) {
    console.log('Lives container not found');
    return;
  }

  livesContainer.innerHTML = '';
  for (let i = 0; i < MAX_LIVES; i++) {
    const heart = document.createElement('span');
    heart.className = 'life-icon' + (i < currentLives ? '' : ' lost');
    heart.textContent = i < currentLives ? '❤️' : '🖤';
    livesContainer.appendChild(heart);
  }
  console.log('Lives updated:', currentLives);
}

function reduceLife() {
  currentLives--;
  updateLivesDisplay();

  if (currentLives <= 0) {
    if (quizTimer) clearInterval(quizTimer);

    let finalScore = 0;
    let finalCorrect = 0;
    let totalQuestions = 0;

    if (currentMode === 'anagram') {
      finalScore = anagramScore;
      finalCorrect = anagramCorrect;
      totalQuestions = anagramQueue.length;
    } else if (currentMode === 'match') {
      finalScore = matchScore;
      finalCorrect = matchCorrect;
      totalQuestions = matchPairs.length;
    } else if (currentMode === 'quiz') {
      finalScore = quizScore;
      finalCorrect = quizCorrect;
      totalQuestions = quizQueue.length;
    }

    showResult(currentMode, finalScore, finalCorrect, totalQuestions);
    return false;
  }
  return true;
}

function resetLives() {
  currentLives = MAX_LIVES;
  setTimeout(() => {
    updateLivesDisplay();
  }, 150);
}


// Init
updateHomeStats();
console.log('Game ready! Click "Aktifkan Suara" button to enable sound!');

function addClickSoundToButtons() {
  const allButtons = document.querySelectorAll('button, .mode-card, .level-btn, .back-circle, .letter-tile, .answer-slot, .quiz-opt, .match-item');

  allButtons.forEach(btn => {
    if (!btn.hasClickSound) {
      btn.hasClickSound = true;
      const originalOnClick = btn.onclick;

      btn.addEventListener('click', function (e) {
        if (soundEnabled && window.playSfx) {
          const noSfxClasses = ['quiz-opt', 'letter-tile', 'answer-slot', 'match-item'];
          let shouldPlay = true;

          for (let cls of noSfxClasses) {
            if (btn.classList.contains(cls)) {
              shouldPlay = false;
              break;
            }
          }

          if (btn.classList.contains('mode-card') || btn.classList.contains('level-btn') ||
            btn.classList.contains('back-circle') || btn.classList.contains('btn-primary') ||
            btn.classList.contains('btn-secondary')) {
            shouldPlay = true;
          }

          if (shouldPlay) {
            playSfx('click');
          }
        }
      });
    }
  });
}

const observer = new MutationObserver(function () {
  addClickSoundToButtons();
});
observer.observe(document.body, { childList: true, subtree: true });

setTimeout(addClickSoundToButtons, 100);