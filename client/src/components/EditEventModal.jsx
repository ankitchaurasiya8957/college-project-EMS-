import React, { useState, useEffect } from 'react';
import { X, Save, Users, CalendarDays, IndianRupee } from 'lucide-react';

export default function EditEventModal({ event, eventBookings = [], onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', location: '', category: '',
    totalSeats: '', ticketPrice: '', image: ''
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

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
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 60 }}>
      <div className="modal-content !max-w-3xl" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex flex-col border-b border-black/5">
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="font-heading text-xl font-semibold text-dark">Manage Event: <span className="text-primary">{event?.title}</span></h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
              <X size={16} />
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 px-6 pt-2">
            <button 
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-black/40 hover:text-dark'}`}
              onClick={() => setActiveTab('details')}
            >
              <CalendarDays size={16} /> Edit Details
            </button>
            <button 
              className={`pb-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'attendees' ? 'border-primary text-primary' : 'border-transparent text-black/40 hover:text-dark'}`}
              onClick={() => setActiveTab('attendees')}
            >
              <Users size={16} /> Attendees <span className="bg-black/10 text-dark px-2 py-0.5 rounded-full text-xs">{eventBookings.length}</span>
            </button>
          </div>
        </div>

        {/* Tab Content: Details */}
        {activeTab === 'details' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
        )}

        {/* Tab Content: Attendees */}
        {activeTab === 'attendees' && (
          <div className="p-6 max-h-[70vh] overflow-y-auto bg-gray-50/50">
            {eventBookings.length === 0 ? (
              <div className="text-center py-12 text-black/40">
                <Users size={32} className="mx-auto mb-3 opacity-20" />
                <p>No bookings yet for this event.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventBookings.map((booking, idx) => (
                  <div key={booking._id} className="bg-white border border-black/5 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dark text-sm">{booking.userId?.name || 'Unknown User'}</h4>
                        <p className="text-xs text-black/50">{booking.userId?.email || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                          {booking.status}
                        </span>
                        {booking.status !== 'cancelled' && (
                          <span className={`px-2 py-0.5 rounded-full uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-black/5 text-black/50'}`}>
                            {booking.paymentStatus.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right border-l border-black/10 pl-4">
                        <p className="text-black/40 uppercase tracking-wider text-[10px] mb-0.5">Amount</p>
                        <p className="flex items-center justify-end text-dark font-semibold text-sm">
                          {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
