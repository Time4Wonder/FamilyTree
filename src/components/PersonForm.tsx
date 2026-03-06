"use client";
import { useState, useEffect } from 'react';

export default function PersonForm({ persons, personToEdit, onClose, onSaved }: { persons: any[], personToEdit?: any, onClose: () => void, onSaved: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    deathDate: '',
    motherId: '',
    fatherId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (personToEdit) {
      setFormData({
        firstName: personToEdit.firstName || '',
        lastName: personToEdit.lastName || '',
        birthDate: personToEdit.birthDate ? new Date(personToEdit.birthDate).toISOString().split('T')[0] : '',
        deathDate: personToEdit.deathDate ? new Date(personToEdit.deathDate).toISOString().split('T')[0] : '',
        motherId: personToEdit.motherId || '',
        fatherId: personToEdit.fatherId || '',
      });
    }
  }, [personToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = personToEdit ? `/api/persons/${personToEdit.id}` : '/api/persons';
      const method = personToEdit ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSaved();
      } else {
        console.error("Failed to save person");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', animation: 'fadeIn 0.3s ease-out' }}>
        <h3 className="mb-4 text-2xl" style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          {personToEdit ? 'Person bearbeiten' : 'Person hinzufügen'}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Vorname</label>
              <input required className="input" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Nachname</label>
              <input required className="input" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Geburtsdatum</label>
              <input type="date" className="input" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Sterbedatum (optional)</label>
              <input type="date" className="input" value={formData.deathDate} onChange={(e) => setFormData({...formData, deathDate: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Mutter</label>
              <select className="input" value={formData.motherId} onChange={(e) => setFormData({...formData, motherId: e.target.value})}>
                <option value="">Keine Auswahl</option>
                {persons.filter(p => !personToEdit || p.id !== personToEdit.id).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">Vater</label>
              <select className="input" value={formData.fatherId} onChange={(e) => setFormData({...formData, fatherId: e.target.value})}>
                <option value="">Keine Auswahl</option>
                {persons.filter(p => !personToEdit || p.id !== personToEdit.id).map(p => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-between mt-6" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Speichere...' : '✨ Speichern'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
