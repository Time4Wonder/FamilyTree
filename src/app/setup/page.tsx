"use client";
import { useState } from 'react';

export default function SetupPage() {
  const [path, setPath] = useState('');
  const [mode, setMode] = useState<'create' | 'import'>('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataPath: path.trim(), mode })
      });
      if (res.ok) {
        window.location.href = '/'; // hard reload to load layout paths and restart components
      } else {
        const data = await res.json();
        setError(data.error || 'Fehler beim Speichern');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 fade-in">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '24px', textAlign: 'center' }}>Stammbaum einrichten</h2>
        
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '12px' }}>
          <button 
            type="button"
            onClick={() => { setMode('create'); setError(''); }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === 'create' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: mode === 'create' ? 600 : 400, transition: '0.2s' }}
          >Neu erstellen</button>
          <button 
            type="button"
            onClick={() => { setMode('import'); setError(''); }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === 'import' ? 'var(--accent)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: mode === 'import' ? 600 : 400, transition: '0.2s' }}
          >Bestehenden Importieren</button>
        </div>

        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6', textAlign: 'center' }}>
          {mode === 'create' 
            ? 'Bitte wähle aus, in welchem neuen Verzeichnis deine Familienstammbaum-Daten (Datenbank & Uploads) ab sofort sicher gespeichert werden sollen.' 
            : 'Füge den absoluten Pfad zu deinem bestehenden Familien-Daten-Ordner ein, um ihn mit dieser Applikation zu verbinden.'}
        </p>

        <form onSubmit={handleSave} className="flex flex-col gap-6">
          <div>
            <label className="form-label">Absoluter Ordner-Pfad</label>
            <input 
              required 
              className="input" 
              value={path} 
              onChange={e => setPath(e.target.value)} 
              placeholder={mode === 'create' ? "/home/t4w/neuer-stammbaum" : "/home/t4w/family-data"}
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>
              {mode === 'create' ? 'Tipp: Die nötigen Unterordner werden automatisch von uns erstellt.' : 'Tipp: Wähle den Überordner, in dem database/ und uploads/ liegen.'}
            </small>
          </div>
          {error && <div style={{ color: 'rgba(239, 68, 68, 0.9)', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '12px', justifyContent: 'center', fontSize: '1.1rem' }}>
            {loading ? 'Lade...' : (mode === 'create' ? 'Verzeichnis erstellen & Starten' : 'Stammbaum verknüpfen')}
          </button>
        </form>
      </div>
    </div>
  );
}
