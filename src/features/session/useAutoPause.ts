import { useEffect } from 'react'
import { useSession } from './store'

/**
 * Pause otomatis saat aplikasi masuk ke background atau kehilangan fokus.
 * Timer berhenti karena `pause()` menyimpan waktu yang sudah berjalan.
 */
export function useAutoPause() {
  const pause = useSession((state) => state.pause)

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'hidden') pause()
    }

    function handleBlur() {
      pause()
    }

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
    }
  }, [pause])
}
