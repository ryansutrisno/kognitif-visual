import { useState } from 'react'
import { LogoMark } from '../components/LogoMark'
import { BoardScreen } from '../features/session/BoardScreen'
import { WelcomeScreen } from '../features/session/WelcomeScreen'
import { id } from '../lib/i18n/id'

type View = 'welcome' | 'board'

/**
 * Shell aplikasi. Navigasi masih minimal (buka papan L1) — alur penuh
 * (profil → level → instruksi → papan → hasil) masuk di F2.
 */
export function App() {
  const [view, setView] = useState<View>('welcome')

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        {id.a11y.skipToContent}
      </a>

      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <div className="flex items-center gap-2 text-ink-muted">
          <LogoMark className="size-7 text-ink" />
          <span className="text-sm font-medium tracking-wide uppercase">
            {id.app.tagline}
          </span>
        </div>
        <span className="text-sm text-ink-muted">{id.footer.offline}</span>
      </header>

      <main
        id="konten"
        className="flex flex-1 items-start justify-center px-6 py-6 sm:px-10 sm:py-10"
      >
        {view === 'welcome' ? (
          <WelcomeScreen onStart={() => setView('board')} />
        ) : (
          <BoardScreen levelId={1} onExit={() => setView('welcome')} />
        )}
      </main>

      <footer className="px-6 pb-6 sm:px-10">
        <p className="text-xs text-ink-muted">
          {id.app.name} · {id.footer.version}
        </p>
      </footer>
    </div>
  )
}
