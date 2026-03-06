"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PersonForm from '@/components/PersonForm';
import FamilyTree from '@/components/FamilyTree';

export default function Home() {
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<'list'|'tree'>('tree');
  const router = useRouter();

  useEffect(() => {
    fetchPersons();
  }, []);

  const fetchPersons = async () => {
    try {
      const res = await fetch('/api/persons');
      const data = await res.json();
      setPersons(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaved = () => {
    setShowForm(false);
    fetchPersons();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: '2rem' }}>Stammbaum Übersicht</h2>
        <div className="flex gap-4 items-center">
          <div style={{ background: 'var(--glass-bg)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => setViewMode('tree')} 
              style={{ background: viewMode === 'tree' ? 'var(--accent)' : 'transparent', color: 'var(--text-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
            >🌳 Baum</button>
            <button 
              onClick={() => setViewMode('list')} 
              style={{ background: viewMode === 'list' ? 'var(--accent)' : 'transparent', color: 'var(--text-primary)', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s' }}
            >📄 Liste</button>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Person hinzufügen
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center" style={{ flex: 1, minHeight: '400px' }}>
            <div className="loader"></div>
          </div>
        ) : persons.length === 0 ? (
          <div className="flex flex-col items-center justify-center" style={{ flex: 1, minHeight: '400px', color: 'var(--text-secondary)' }}>
            <div className="bounce-icon">🍃</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Der Stammbaum ist noch leer.</h3>
            <p>Füge deine erste Person hinzu, um zu beginnen.</p>
          </div>
        ) : viewMode === 'tree' ? (
          <FamilyTree persons={persons} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {persons.map((p: any) => (
              <div 
                key={p.id} 
                className="glass-panel person-card" 
                onClick={() => router.push(`/person/${p.id}`)}
                style={{ cursor: 'pointer', borderLeft: '4px solid var(--accent)', padding: '20px' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{p.firstName} {p.lastName}</h3>
                <p style={{ fontSize: '0.875rem' }}>
                  {p.birthDate ? new Date(p.birthDate).toLocaleDateString('de-DE') : '?'} - 
                  {p.deathDate ? new Date(p.deathDate).toLocaleDateString('de-DE') : 'Heute'}
                </p>
                <div className="mt-4 flex justify-between items-center" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    📄 {p.documents?.length || 0} Dokumente
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>Akte öffnen →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <PersonForm persons={persons} onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}
    </div>
  );
}
