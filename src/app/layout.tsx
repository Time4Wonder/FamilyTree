import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Familienstammbaum Akten',
  description: 'Ein digitales Ablagesystem für Familiendokumente.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body suppressHydrationWarning={true}>
        <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="page-container flex justify-between items-center" style={{ padding: '1rem 2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🌳 Familien-Akten
            </h2>
            <div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Die digitale Chronik</span>
            </div>
          </div>
        </nav>
        <main className="page-container">
          {children}
        </main>
      </body>
    </html>
  )
}
