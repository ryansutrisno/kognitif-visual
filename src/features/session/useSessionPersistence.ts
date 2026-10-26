import { useEffect } from 'react'
import { useSession } from './store'

/**
 * Simpan sesi saat tab disembunyikan atau ditutup. Tanpa ini, terapis yang
 * menutup browser di tengah sesi akan kehilangan papan yang sudah selesai.
 * Penyimpanan idempoten, jadi aman dipanggil berkali-kali.
 */
export function useSessionPersistence(): void {
  const saveCurrentSession = useSession((state) => state.saveCurrentSession)

  useEffect(() => {
    const flush = () => saveCurrentSession()
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush()
    }

    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [saveCurrentSession])
}
