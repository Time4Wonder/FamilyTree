"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PersonForm from '@/components/PersonForm';

export default function PersonAkte({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [person, setPerson] = useState<any>(null);
  const [allPersons, setAllPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(data => {
      if (!data.path) {
        router.push('/setup');
      } else {
        fetchPerson();
        fetchAllPersons();
      }
    });
  }, [params.id, router]);

  const fetchPerson = async () => {
    try {
      const res = await fetch(`/api/persons/${params.id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setPerson(data);
    } catch (e) {
      console.error(e);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPersons = async () => {
    try {
      const res = await fetch('/api/persons');
      const data = await res.json();
      setAllPersons(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('personId', params.id);
    formData.append('title', file.name);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchPerson();
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Dokument wirklich löschen?')) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) fetchPerson();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !person) return <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
    <div className="loader"></div>
  </div>;

  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="flex justify-between items-center mb-2">
        <button className="btn" onClick={() => router.push('/')}>← Zurück zum Baum</button>
        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={() => setShowEditForm(true)}>✏️ Bearbeiten</button>
        </div>
      </div>

      <div className="flex gap-6 flex-wrap" style={{ alignItems: 'flex-start' }}>
        {/* Seiten-Panel: Personendaten */}
        <div className="glass-panel" style={{ flex: '1 1 300px' }}>
          <div className="flex gap-4 items-center mb-6" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>
              {person.firstName?.[0]}{person.lastName?.[0]}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{person.firstName} {person.lastName}</h3>
              <p style={{ fontSize: '14px' }}>Persönliche Akte</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mb-6">
            <p><strong>Geboren:</strong> {person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'Unbekannt'}</p>
            <p><strong>Gestorben:</strong> {person.deathDate ? new Date(person.deathDate).toLocaleDateString() : 'Lebt'}</p>
          </div>
          
          <div className="pt-4" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <h4 style={{ marginBottom: '12px' }}>Familienverknüpfungen</h4>
            {person.mother ? (
              <p className="flex items-center gap-2 mb-2">👩‍👧 Mutter: <span onClick={() => router.push(`/person/${person.mother.id}`)} style={{color:'var(--accent)', cursor:'pointer', fontWeight: 500}}>{person.mother.firstName} {person.mother.lastName}</span></p>
            ) : <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Mutter unbekannt</p>}
            
            {person.father ? (
              <p className="flex items-center gap-2 mb-2">👨‍👦 Vater: <span onClick={() => router.push(`/person/${person.father.id}`)} style={{color:'var(--accent)', cursor:'pointer', fontWeight: 500}}>{person.father.firstName} {person.father.lastName}</span></p>
            ) : <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>Vater unbekannt</p>}
          </div>

          <div className="mt-8 pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
             <button className="btn btn-danger" onClick={async () => {
               if(confirm('Akte dieser Person wirklich löschen?')) {
                 await fetch(`/api/persons/${person.id}`, { method: 'DELETE' });
                 router.push('/');
               }
             }}>Person löschen</button>
          </div>
        </div>

        {/* Haupt-Panel: Dokumente */}
        <div className="glass-panel" style={{ flex: '2 1 500px' }}>
          <div className="flex justify-between items-center mb-6 pb-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>Dokumente & Anhänge</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>Dateien, Bilder, Textdokumente der Akte hinzufügen</p>
            </div>
            <div>
              <input 
                ref={fileInputRef} 
                type="file"
                onChange={handleUpload} 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn btn-primary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Wird hochgeladen...' : '📄 + Hinzufügen'}
              </button>
            </div>
          </div>

          <div style={{ minHeight: '20vh' }}>
            {person.documents && person.documents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {person.documents.map((doc: any) => (
                  <div key={doc.id} className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s', ...{ ':hover': { background: 'rgba(255,255,255,0.05)' } } as any }}>
                    <div className="flex items-center gap-4">
                      <div style={{ fontSize: '2rem', padding: '12px', background: 'var(--glass-border)', borderRadius: '12px' }}>
                        {doc.fileType.includes('image') ? '🖼️' : '📄'}
                      </div>
                      <div>
                        <a href={doc.filePath} target="_blank" rel="noreferrer" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '16px' }}>
                          {doc.title}
                        </a>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Hochgeladen am {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="btn btn-danger" style={{ padding: '8px 16px', fontSize: '13px', border: 'none', background: 'rgba(239, 68, 68, 0.1)' }} onClick={() => handleDeleteDoc(doc.id)}>
                      Löschen
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📂</span>
                <h4>Keine Dokumente vorhanden</h4>
                <p>Klicke auf Hinzufügen, um das erste Dokument in die Akte hochzuladen.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showEditForm && (
        <PersonForm 
          persons={allPersons} 
          personToEdit={person}
          onClose={() => setShowEditForm(false)} 
          onSaved={() => {
            setShowEditForm(false);
            fetchPerson();
          }} 
        />
      )}
    </div>
  );
}
