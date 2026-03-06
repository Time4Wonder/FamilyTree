import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

import { getDataPath } from '@/lib/config'

export const metadata: Metadata = {
  title: 'Familienstammbaum Akten',
  description: 'Ein digitales Ablagesystem für Familiendokumente.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentPath = getDataPath();

  return (
    <html lang="de">
      <body suppressHydrationWarning={true}>
        <nav className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="page-container flex justify-between items-center" style={{ padding: '1rem 2rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', background: 'linear-gradient(45deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🌳 Familien-Akten
            </h2>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'block' }}>Die digitale Chronik</span>
              {currentPath && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', letterSpacing: '0.05em' }}>
                    📂 {currentPath}
                  </span>
                  <Link href="/setup" style={{ fontSize: '10px', color: 'var(--accent)', textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '12px', transition: '0.2s' }}>
                    ⚙️ Ändern
                  </Link>
                </div>
              )}
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
