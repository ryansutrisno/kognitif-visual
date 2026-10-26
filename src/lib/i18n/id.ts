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
    startHint: 'Papan latihan disiapkan pada tahap berikutnya.',
    therapistNote: 'Untuk terapis: laporan dan riwayat sesi ada di menu terapis.',
  },

  footer: {
    version: 'Versi awal',
    offline: 'Bisa dipakai tanpa internet',
  },

  a11y: {
    skipToContent: 'Langsung ke isi',
  },
} as const

export type Strings = typeof id
