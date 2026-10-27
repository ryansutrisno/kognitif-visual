import { SoundToggle } from '../components/SoundToggle'
import { SettingsSheet } from '../components/SettingsSheet'
import { PatientSelectScreen } from '../features/profiles/PatientSelectScreen'
import { ReportGate } from '../features/report/ReportGate'
import { ReportScreen } from '../features/report/ReportScreen'
import { BoardScreen } from '../features/session/BoardScreen'
import { InstructionScreen } from '../features/session/InstructionScreen'
import { LevelSelectScreen } from '../features/session/LevelSelectScreen'
import { PracticeScreen } from '../features/session/PracticeScreen'
import { RestScreen } from '../features/session/RestScreen'
import { ResultScreen } from '../features/session/ResultScreen'
import { useSession } from '../features/session/store'
import { useAutoPause } from '../features/session/useAutoPause'
import { useSessionPersistence } from '../features/session/useSessionPersistence'
import { id } from '../lib/i18n/id'

/** Diambil sekali saat modul dimuat supaya render tetap murni. */
const COPYRIGHT_YEAR = new Date().getFullYear()

/**
 * Shell aplikasi. Navigasi diturunkan dari status sesi di store:
 * pilih level → instruksi → papan latihan → papan → hasil → (istirahat) → papan berikutnya.
 */
export function App() {
  const status = useSession((state) => state.status)
  useAutoPause()
  useSessionPersistence()

  // Saat papan berjalan, chrome aplikasi disembunyikan supaya 11 baris
  // Level 3 tetap muat tanpa scroll di tablet landscape.
  const focusMode = status === 'running' || status === 'paused'

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {id.a11y.skipToContent}
      </a>

      {!focusMode && (
        <header className="flex items-center justify-between px-5 py-3 sm:px-8">
          <div className="flex items-center gap-2 text-ink-muted">
            <ReportGate />
            <span className="text-sm font-medium tracking-wide uppercase">{id.app.tagline}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-muted lg:inline">{id.footer.offline}</span>
            <SoundToggle />
            <SettingsSheet />
          </div>
        </header>
      )}

      <main
        id="konten"
        className={[
          'flex flex-1 justify-center px-4 sm:px-8',
          focusMode ? 'items-start py-2' : 'items-start py-4 sm:py-6',
        ].join(' ')}
      >
        {status === 'patient-select' && <PatientSelectScreen />}
        {status === 'level-select' && <LevelSelectScreen />}
        {status === 'instruction' && <InstructionScreen />}
        {status === 'practice' && <PracticeScreen />}
        {(status === 'running' || status === 'paused') && <BoardScreen />}
        {status === 'finished' && <ResultScreen />}
        {status === 'rest' && <RestScreen />}
        {status === 'report' && <ReportScreen />}
      </main>

      {!focusMode && (
        <footer className="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 pb-4 text-xs text-ink-muted sm:px-8">
          <p>
            {id.app.name} · {id.footer.version}
          </p>
          <span aria-hidden="true">·</span>
          <p>
            {id.footer.copyright(COPYRIGHT_YEAR)}{' '}
            <a
              href={id.footer.creditUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft underline decoration-2 underline-offset-2 hover:text-ink"
            >
              {id.footer.creditName}
              <span className="sr-only"> {id.footer.creditNewTab}</span>
            </a>
          </p>
        </footer>
      )}
    </div>
  )
}
