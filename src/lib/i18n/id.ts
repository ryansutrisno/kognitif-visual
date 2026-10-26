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
  },

  guide: {
    title: 'Cara bermain',
    step1: 'Cari semua lingkaran di papan.',
    step2: 'Tap sekali untuk menandai lingkaran.',
    step3: 'Tap lagi kalau ingin membatalkan.',
    demo: 'Contoh: lingkaran yang sudah ditandai',
    start: 'Siap, mulai',
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

  footer: {
    version: 'Versi awal',
    offline: 'Bisa dipakai tanpa internet',
  },

  a11y: {
    skipToContent: 'Langsung ke isi',
    cell: (row: number, col: number, shape: string, marked: boolean) =>
      `Baris ${row}, kolom ${col}, ${shape}${marked ? ', sudah ditandai' : ''}`,
  },
} as const

export type Strings = typeof id
