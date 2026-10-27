/**
 * Versi aplikasi diambil dari `package.json` saat build (lihat `vite.config.ts`).
 * Semantik rilis diatur semantic-release: commit `feat:`/`fix:` menaikkan versi,
 * lalu footer ikut menampilkan versi baru pada deploy berikutnya.
 */
export const APP_VERSION: string =
  typeof __APP_VERSION__ === 'undefined' ? '0.0.0-dev' : __APP_VERSION__

/** `1.0.0` → `v1.0.0` */
export function versionLabel(version: string = APP_VERSION): string {
  return `v${version}`
}
