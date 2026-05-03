import React, { useEffect, useState } from 'react';
import { useMemoryStore } from '../store/memoryStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, SparklesIcon, PencilIcon, TrashIcon } from '../components/icons/Icons';
import { AIService } from '../services/aiService';
import { speak } from '../utils/helpers';
import Button from '../components/ui/Button';

interface EditState {
  id: string;
  title: string;
  description: string;
  imageFile: File | null;
  imageUrl: string;
}

const MemoriesPage: React.FC = () => {
  const { memories, fetchMemories, updateMemory, deleteMemory } = useMemoryStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [narratingId, setNarratingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchMemories(); }, []);

  const handleNarrate = async (memory: any) => {
    if (!user) return;
    setNarratingId(memory.id);
    try {
      const story = await AIService.narrateMemory(memory, user.name);
      if (story) speak(story);
    } catch (e) {
      console.error(e);
    } finally {
      setNarratingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    await deleteMemory(id);
  };

  const openEdit = (m: any) => {
    setEditState({ id: m.id, title: m.title, description: m.description || '', imageFile: null, imageUrl: m.imageUrl || '' });
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 400;
          const scale = MAX / img.width;
          canvas.width = MAX;
          canvas.height = img.height * scale;
          canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
      reader.readAsDataURL(file);
    });

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editState) return;
    setEditState(prev => prev ? { ...prev, imageFile: file, imageUrl: URL.createObjectURL(file) } : prev);
  };

  const handleEditSave = async () => {
    if (!editState) return;
    setSaving(true);
    try {
      let imageUrl = editState.imageUrl;
      if (editState.imageFile) {
        imageUrl = await convertToBase64(editState.imageFile);
      }
      await updateMemory(editState.id, {
        title: editState.title,
        description: editState.description,
        imageUrl: imageUrl || null,
      });
      await fetchMemories();
      setEditState(null);
    } catch (err: any) {
      console.error('Update memory error:', err);
      alert(`Failed to update: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Photo Memories</h1>
        {user?.role === 'caretaker' && (
          <Button onClick={() => navigate('/memories/add')} className="transition-transform hover:scale-105 active:scale-95">
            + Add Memory
          </Button>
        )}
      </div>

      {/* GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
        {memories.map(m => (
          <div key={m.id} style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column' }}>
            {m.imageUrl ? (
              <img src={m.imageUrl} alt={m.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                <PhotoIcon />
              </div>
            )}
            <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: '#334155' }}>{m.title}</h3>
              <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: '#6366F1' }}>
                {new Date(m.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>&#34;{m.description}&#34;</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                <Button size="sm" className="p-1.5" onClick={() => handleNarrate(m)} loading={narratingId === m.id}><SparklesIcon /></Button>
                {user?.role === 'caretaker' && (
                  <>
                    <Button size="sm" variant="secondary" className="p-1.5" onClick={() => openEdit(m)}><PencilIcon /></Button>
                    <Button size="sm" variant="danger" className="p-1.5" onClick={() => handleDelete(m.id)}><TrashIcon /></Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {memories.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            <PhotoIcon />
            <p style={{ marginTop: '8px' }}>No memories yet</p>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-xl font-bold">Edit Memory</h2>

            <input
              value={editState.title}
              onChange={e => setEditState(prev => prev ? { ...prev, title: e.target.value } : prev)}
              placeholder="Title"
              className="form-input w-full"
            />

            <textarea
              value={editState.description}
              onChange={e => setEditState(prev => prev ? { ...prev, description: e.target.value } : prev)}
              placeholder="Description"
              className="form-input w-full h-28"
            />

            {/* Current photo */}
            {editState.imageUrl && (
              <img src={editState.imageUrl} alt="preview" className="w-full h-40 object-cover rounded-xl" />
            )}

            <input type="file" accept="image/*" onChange={handleEditImageChange} className="form-input w-full" />

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleEditSave} loading={saving}>Save</Button>
              <Button className="flex-1" variant="secondary" onClick={() => setEditState(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoriesPage;
