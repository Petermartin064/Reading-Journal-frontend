import React, { useEffect, useState } from 'react';
import { fetchClient } from '../api/fetchClient';
import { Plus, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react';
import Modal from '../components/Modal';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const SESSION_TYPES = ['Career', 'Self-Dev'];

const to12h = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${ampm}`;
};

const EMPTY_FORM = { day_of_week: 0, session_type: 'Career', start_time: '05:00', end_time: '07:30' };

const ScheduleRow = ({ entry, onSave, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...entry });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(entry.id, { start_time: form.start_time, end_time: form.end_time, session_type: form.session_type });
      setEditing(false);
    } catch (e) {
      setError(e?.data?.non_field_errors?.[0] || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`surface-card p-4 transition-all ${editing ? 'ring-2 ring-primary' : ''}`}>
      {editing ? (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-text-muted mb-1">Type</label>
              <select
                value={form.session_type}
                onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))}
                className="input-field text-sm py-2"
              >
                {SESSION_TYPES.map(t => <option key={t} value={t}>{t === 'Career' ? '📚 Career' : '🌱 Self-Dev'}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-semibold text-text-muted mb-1">Start Time</label>
              <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="input-field text-sm py-2" />
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-semibold text-text-muted mb-1">End Time</label>
              <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="input-field text-sm py-2" />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setForm({ ...entry }); setError(''); }} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg border border-surface-border hover:border-primary transition-all">
              <X size={13} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-all disabled:opacity-60">
              <Check size={13} /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
              entry.session_type === 'Career' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {entry.session_type === 'Career' ? '📚 Career' : '🌱 Self-Dev'}
            </span>
            <span className="text-sm font-semibold text-text-primary">
              {to12h(entry.start_time)} – {to12h(entry.end_time)}
            </span>
            <span className="text-xs text-text-muted">
              ({Math.round((new Date(`1970-01-01T${entry.end_time}`) - new Date(`1970-01-01T${entry.start_time}`)) / 60000)} min)
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
              <Pencil size={14} />
            </button>
            <button onClick={() => onDelete(entry.id)} className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-all">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AddSessionForm = ({ dayIndex, onAdd, onCancel }) => {
  const [form, setForm] = useState({ ...EMPTY_FORM, day_of_week: dayIndex });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    setError('');
    try {
      await onAdd(form);
      onCancel();
    } catch (e) {
      const errs = e?.data;
      setError(errs?.non_field_errors?.[0] || errs?.start_time?.[0] || 'Failed to add.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="surface-card p-4 ring-2 ring-primary/40 space-y-3">
      <p className="text-xs font-bold text-primary uppercase tracking-widest">New Session</p>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-text-muted mb-1">Type</label>
          <select value={form.session_type} onChange={e => setForm(f => ({ ...f, session_type: e.target.value }))} className="input-field text-sm py-2">
            {SESSION_TYPES.map(t => <option key={t} value={t}>{t === 'Career' ? '📚 Career' : '🌱 Self-Dev'}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-text-muted mb-1">Start Time</label>
          <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="input-field text-sm py-2" />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-semibold text-text-muted mb-1">End Time</label>
          <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} className="input-field text-sm py-2" />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary px-3 py-1.5 rounded-lg border border-surface-border hover:border-primary transition-all">
          <X size={13} /> Cancel
        </button>
        <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-all disabled:opacity-60">
          <Check size={13} /> {saving ? 'Adding...' : 'Add Session'}
        </button>
      </div>
    </div>
  );
};

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState(null); // day index being added to
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  useEffect(() => {
    fetchClient('/schedule/')
      .then(res => { if (res?.status === 'success') setSchedules(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id, data) => {
    const res = await fetchClient(`/schedule/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
    if (res?.status === 'success') {
      setSchedules(prev => prev.map(s => s.id === id ? res.data : s));
    }
  };

  const requestDelete = (id) => {
    setDeleteModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await fetchClient(`/schedule/${deleteModal.id}/`, { method: 'DELETE' });
      setSchedules(prev => prev.filter(s => s.id !== deleteModal.id));
    } catch (e) {
      console.error('Failed to delete:', e);
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  const handleAdd = async (form) => {
    const res = await fetchClient('/schedule/', { method: 'POST', body: JSON.stringify(form) });
    if (res?.status === 'success') {
      setSchedules(prev => [...prev, res.data]);
    } else {
      throw res;
    }
  };

  const byDay = DAY_NAMES.map((_, i) => schedules.filter(s => s.day_of_week === i));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-text-primary mb-1">Weekly Schedule</h1>
        <p className="text-text-muted text-sm">Manage your reading sessions for each day of the week.</p>
      </div>

      <div className="space-y-6">
        {DAY_NAMES.map((day, dayIndex) => (
          <div key={day}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">{day}</h2>
              <button
                onClick={() => setAddingDay(addingDay === dayIndex ? null : dayIndex)}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Plus size={13} />
                Add Session
              </button>
            </div>

            <div className="space-y-2">
              {byDay[dayIndex].length === 0 && addingDay !== dayIndex && (
                <p className="text-text-muted text-sm italic py-3 px-4 surface-card opacity-60">
                  No sessions scheduled. Click "Add Session" to create one.
                </p>
              )}

              {byDay[dayIndex].map(entry => (
                <ScheduleRow key={entry.id} entry={entry} onSave={handleSave} onDelete={requestDelete} />
              ))}

              {addingDay === dayIndex && (
                <AddSessionForm dayIndex={dayIndex} onAdd={handleAdd} onCancel={() => setAddingDay(null)} />
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        title="Confirm Deletion"
        footer={
          <>
            <button
              onClick={() => setDeleteModal({ isOpen: false, id: null })}
              className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-6 py-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-600 shadow-md transition-all"
            >
              Delete Session
            </button>
          </>
        }
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-sm font-serif font-bold text-text-primary mb-1">Remove this session?</p>
            <p className="text-xs text-text-muted leading-relaxed">
              This will permanently delete this session from your weekly schedule. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Schedule;
