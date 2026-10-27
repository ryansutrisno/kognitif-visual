/**
 * Seluruh teks yang dilihat pasien / terapis ada di sini.
 * Aturan: Bahasa Indonesia, kalimat pendek, tanpa istilah teknis.
 * (Multi-bahasa belum masuk MVP — lihat non-goals blueprint.)
 */
export const id = {
  app: {
    name: 'Kognitif',
    tagline: 'Latihan visual',
    logoLabel: 'Kognitif, latihan visual pasca stroke',
  },

  levels: {
    title: 'Latihan mencari gambar',
    body:
      'Pasien mencari lingkaran di antara bentuk lain, didampingi terapis. ' +
      'Satu papan kira-kira dua sampai lima menit.',
    choose: 'Pilih level',
    chooseHint: 'Mulai dari level yang paling sesuai. Menaikkan level dilakukan terapis.',
    targetNote: (targets: number, cells: number) =>
      `${targets} lingkaran di antara ${cells} kotak`,
    midlineNote: 'Ada garis pemisah di tengah',
    start: (label: string) => `Mulai ${label}`,
    suggest: (level: number) => `Dua sesi terakhir bagus. Siap naik ke Level ${level}.`,
  },

  patients: {
    title: 'Pilih profil',
    body:
      'Profil hanya berisi kode dan inisial, tanpa nama lengkap. ' +
      'Semua data tersimpan di perangkat ini.',
    empty: 'Belum ada profil. Tambahkan satu untuk memulai.',
    loading: 'Memuat profil…',
    formTitle: 'Pasien baru',
    code: 'Kode pasien',
    codePlaceholder: 'PS-001',
    initials: 'Inisial',
    initialsPlaceholder: 'A. S.',
    birthYear: 'Tahun lahir (opsional)',
    add: 'Tambah profil',
    addError: 'Kode ini sudah dipakai. Coba kode lain.',
    use: (label: string) => `Pilih ${label}`,
    current: 'Pasien',
    change: 'Ganti pasien',
  },

  report: {
    open: 'Laporan terapis',
    pinTitle: 'Khusus terapis',
    pinBody: 'Masukkan PIN 4 angka untuk membuka laporan klinis.',
    pinLabel: 'PIN',
    pinSubmit: 'Buka laporan',
    pinWrong: 'PIN belum tepat. Coba lagi.',
    cancel: 'Batal',
    title: 'Laporan sesi',
    pick: 'Pasien',
    count: (total: number) => `${total} sesi tersimpan`,
    noPatients: 'Belum ada profil pasien. Tambahkan profil dulu di layar awal.',
    patient: (code: string, initials: string) => (initials ? `${code} · ${initials}` : code),
    empty: 'Belum ada sesi tersimpan untuk pasien ini.',
    columns: {
      date: 'Tanggal',
      level: 'Level',
      hits: 'Kena',
      omissions: 'Terlewat',
      split: 'Kiri / kanan',
      neglect: 'Indeks neglect',
      duration: 'Durasi',
      status: 'Status',
    },
    duration: (seconds: number) => `${Math.round(seconds)} detik`,
    completed: 'Selesai',
    incomplete: 'Ditinggalkan',
    noValue: '—',
    trend: 'Tren omisi kiri vs kanan',
    trendHint: 'Sesi lama di kiri, sesi terbaru di kanan.',
    trendEmpty: 'Belum cukup data untuk tren.',
    legendLeft: 'kiri',
    legendRight: 'kanan',
    export: 'Ekspor CSV',
    close: 'Tutup',
    manage: 'Kelola data',
    manageHint: 'Penghapusan bersifat permanen dan tidak bisa dibatalkan.',
    deletePatient: 'Hapus pasien ini',
    deleteAll: 'Hapus semua data',
    deletePatientTitle: 'Hapus profil ini?',
    deletePatientBody: (code: string) =>
      `Profil ${code} beserta seluruh riwayat sesinya akan dihapus permanen dari perangkat ini.`,
    deleteAllTitle: 'Hapus semua data?',
    deleteAllBody:
      'Semua profil pasien dan seluruh riwayat sesi akan dihapus permanen dari perangkat ini.',
    deleteConfirm: 'Ya, hapus',
    deleteCancel: 'Batal',
  },

  guide: {
    title: 'Cara bermain',
    step1: 'Cari semua lingkaran di papan.',
    step2: 'Tap sekali untuk menandai lingkaran.',
    step3: 'Tap lagi kalau ingin membatalkan.',
    demo: 'Contoh: lingkaran yang sudah ditandai',
    start: 'Siap, mulai',
    listenAgain: 'Dengar lagi',
    listenUnavailable: 'Suara Bahasa Indonesia belum tersedia di perangkat ini.',
  },

  practice: {
    title: 'Coba dulu, ya',
    body: 'Tap satu bentuk untuk melihat tandanya. Bagian ini tidak dinilai.',
    done: 'Bagus, itu caranya.',
    hint: 'Kalau sudah siap, lanjut ke papan yang dinilai.',
    next: 'Lanjut ke papan',
  },

  board: {
    instruction: 'Tandai semua lingkaran.',
    hint: 'Tap sekali untuk menandai. Tap lagi untuk membatalkan.',
    finish: 'Selesai',
    back: 'Kembali',
    pause: 'Jeda',
    boardOf: (index: number, total: number) => `Papan ${index} dari ${total}`,
    progress: (found: number, total: number) => `${found} dari ${total} lingkaran ditandai`,
  },

  pauseOverlay: {
    title: 'Latihan dijeda',
    body: 'Waktu berhenti selama latihan dijeda. Siap dilanjutkan kapan saja.',
    resume: 'Lanjutkan',
    exit: 'Keluar',
  },

  exit: {
    title: 'Keluar dari latihan?',
    body: 'Papan yang sedang dikerjakan akan ditinggalkan.',
    confirm: 'Ya, keluar',
    cancel: 'Lanjut latihan',
  },

  result: {
    title: 'Papan selesai',
    stars: (count: number) => `${count} dari 3 bintang`,
    message: {
      1: 'Terima kasih sudah berlatih. Ayo coba lagi pelan-pelan.',
      2: 'Bagus! Sebagian besar lingkaran sudah ketemu.',
      3: 'Kerja bagus! Hampir semua lingkaran ketemu.',
    },
    progress: (done: number, total: number) => `Papan ${done} dari ${total} selesai`,
    restSuggest: 'Sudah cukup lama berlatih. Istirahat sebentar, yuk.',
    rest: 'Istirahat sebentar',
    next: 'Papan berikutnya',
    finish: 'Selesai',
  },

  rest: {
    title: 'Istirahat sebentar',
    body: 'Lihat sesuatu yang jauh, tarik napas pelan, lalu lanjut.',
    seconds: (value: number) => `${value} detik`,
    skip: 'Sudah siap',
  },

  shape: {
    circle: 'lingkaran',
    square: 'kotak',
    triangle: 'segitiga',
    star: 'bintang',
  },

  sound: {
    on: 'Suara aktif',
    off: 'Suara mati',
    mute: 'Matikan suara',
    unmute: 'Nyalakan suara',
    label: 'Suara',
  },

  settings: {
    open: 'Pengaturan tampilan',
    title: 'Pengaturan',
    body: 'Berlaku di perangkat ini dan tersimpan otomatis.',
    largeText: 'Teks besar',
    largeTextHint: 'Semua tulisan dan tombol ikut membesar.',
    contrast: 'Kontras tinggi',
    contrastHint: 'Latar putih, garis dan tulisan lebih tegas.',
    sound: 'Suara',
    soundHint: 'Nada saat menandai dan suara instruksi.',
    on: 'Nyala',
    off: 'Mati',
    install: 'Pasang di tablet',
    installHint:
      'Setelah dipasang, aplikasi punya ikon sendiri dan bisa dibuka tanpa internet.',
    installManual:
      'Buka aplikasi ini lewat Chrome di tablet, lalu menu ⋮ → "Tambahkan ke layar utama".',
    installed: 'Sudah terpasang di perangkat ini.',
    close: 'Tutup',
  },

  footer: {
    version: 'Versi awal',
    offline: 'Bisa dipakai tanpa internet',
    copyright: (year: number) => `© ${year}`,
    creditName: 'Trazmedia',
    creditUrl: 'https://trazmedia.com',
    creditNewTab: '(buka di tab baru)',
  },

  a11y: {
    skipToContent: 'Langsung ke isi',
    cell: (row: number, col: number, shape: string, marked: boolean) =>
      `Baris ${row}, kolom ${col}, ${shape}${marked ? ', sudah ditandai' : ''}`,
  },
} as const

export type Strings = typeof id
