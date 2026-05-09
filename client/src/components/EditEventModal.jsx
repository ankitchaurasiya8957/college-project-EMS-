import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

export default function EditEventModal({ event, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', category: '',
    totalSeats: '', ticketPrice: '', image: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        location: event.location || '',
        category: event.category || '',
        totalSeats: event.totalSeats || '',
        ticketPrice: event.ticketPrice || 0,
        image: event.image || ''
      });
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(event._id, {
        ...form,
        totalSeats: Number(form.totalSeats),
        ticketPrice: Number(form.ticketPrice) || 0
      });
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const inputCls = "w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5">
          <h2 className="font-heading text-xl font-semibold text-dark">Edit Event</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Title</label>
              <input required className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Category</label>
              <input required className={inputCls} value={form.category} onChange={e => set('category', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Date</label>
              <input required type="date" className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Location</label>
              <input required className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Total Seats</label>
              <input required type="number" className={inputCls} value={form.totalSeats} onChange={e => set('totalSeats', e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Ticket Price (₹)</label>
              <input type="number" className={inputCls} value={form.ticketPrice} onChange={e => set('ticketPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Image URL</label>
            <input className={inputCls} value={form.image} onChange={e => set('image', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Description</label>
            <textarea required className={`${inputCls} resize-none h-24`} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50">
              <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 rounded-xl border border-black/10 text-sm font-medium hover:bg-black/5 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
