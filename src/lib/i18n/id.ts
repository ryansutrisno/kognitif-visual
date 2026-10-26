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

  welcome: {
    title: 'Latihan mencari gambar',
    body:
      'Pasien mencari lingkaran di antara bentuk lain. Didampingi terapis, ' +
      'satu papan kira-kira dua sampai lima menit.',
    start: 'Mulai latihan',
    startHint: 'Level 1: tiga lingkaran di antara sembilan kotak.',
    therapistNote: 'Untuk terapis: laporan dan riwayat sesi ada di menu terapis.',
  },

  board: {
    instruction: 'Tandai semua lingkaran.',
    hint: 'Tap sekali untuk menandai. Tap lagi untuk membatalkan.',
    finish: 'Selesai',
    back: 'Kembali',
    progress: (found: number, total: number) => `${found} dari ${total} lingkaran ditandai`,
  },

  shape: {
    circle: 'lingkaran',
    square: 'kotak',
    triangle: 'segitiga',
    star: 'bintang',
  },

  result: {
    title: 'Papan selesai',
    temporaryNote: 'Layar hasil untuk pasien disusun pada tahap berikutnya.',
    playAgain: 'Main lagi',
    finish: 'Selesai',
    temporaryLabel: 'Hasil sementara',
    targets: 'Target',
    hits: 'Benar',
    falsePositives: 'Salah tekan',
    omissions: 'Terlewat',
    omissionsSplit: 'Terlewat kiri / kanan',
    neglect: 'Indeks neglect',
    neglectEmpty: 'tidak ada omisi',
    accuracy: 'Akurasi',
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
