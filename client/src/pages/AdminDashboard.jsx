import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, XCircle, Calendar, Users, IndianRupee, Clock, Sparkles } from 'lucide-react';
import SectionTag from '../components/SectionTag';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showEventForm, setShowEventForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: ''
    });

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [eventsRes, bookingsRes] = await Promise.all([
                api.get('/events'),
                api.get('/bookings/my')
            ]);
            setEvents(eventsRes.data);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                totalSeats: Number(formData.totalSeats),
                ticketPrice: Number(formData.ticketPrice) || 0
            };
            await api.post('/events', payload);
            setShowEventForm(false);
            setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
            fetchData();
        } catch (error) {
            console.error('Event creation error:', error.response?.data || error.message);
            alert(error.response?.data?.message || 'Error creating event');
        }
    };

    const handleDeleteEvent = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await api.delete(`/events/${id}`);
                fetchData();
            } catch (error) {
                alert('Error deleting event');
            }
        }
    };

    const handleConfirmBooking = async (id, paymentStatus) => {
        try {
            await api.put(`/bookings/${id}/confirm`, { paymentStatus });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error confirming booking');
        }
    };

    const handleCancelBooking = async (id) => {
        if (window.confirm('Cancel this user\'s booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error cancelling booking');
            }
        }
    };

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

    const totalRevenue = bookings.reduce((sum, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? sum + b.amount : sum, 0);
    const paidClients = new Set(bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)).size;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;

    return (
        <div className="pt-28 pb-20">
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            {/* Admin Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div>
                <SectionTag>Admin</SectionTag>
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-dark tracking-tight mt-2">
                  Admin Dashboard
                </h1>
                <p className="text-black/50 text-base mt-2">Manage events and confirm bookings.</p>
              </div>
              <button
                onClick={() => setShowEventForm(!showEventForm)}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm transition-all ${
                  showEventForm
                    ? 'bg-black/10 text-dark hover:bg-black/20'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                <Plus size={18} />
                {showEventForm ? 'Cancel' : 'Create Event'}
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-2xl border border-black/10 p-6 flex items-center justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Total Revenue</p>
                  <h3 className="text-3xl font-heading font-bold text-emerald-500">₹{totalRevenue}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <IndianRupee size={22} className="text-emerald-500" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 p-6 flex items-center justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Paid Clients</p>
                  <h3 className="text-3xl font-heading font-bold text-primary">{paidClients}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users size={22} className="text-primary" />
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-black/10 p-6 flex items-center justify-between hover:shadow-md transition-all">
                <div>
                  <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mb-1">Pending Requests</p>
                  <h3 className="text-3xl font-heading font-bold text-amber-500">{pendingCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock size={22} className="text-amber-500" />
                </div>
              </div>
            </div>

            {/* Create Event Form */}
            {showEventForm && (
              <div className="bg-white rounded-2xl border border-black/10 p-8 lg:p-10 mb-10">
                <h2 className="font-heading text-2xl font-semibold text-dark mb-8">Create New Event</h2>
                <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Event Title</label>
                    <input required type="text" placeholder="e.g., Tech Summit 2025" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Category</label>
                    <input required type="text" placeholder="e.g., Tech, Music, Workshop" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Date</label>
                    <input required type="date" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Location</label>
                    <input required type="text" placeholder="e.g., Mumbai, India" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Total Seats</label>
                    <input required type="number" placeholder="e.g., 100" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark block mb-2">Ticket Price (₹)</label>
                    <input type="number" placeholder="0 for free" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-dark block mb-2">Image URL</label>
                    <input type="text" placeholder="Paste any direct image link" className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-dark block mb-2">Description</label>
                    <textarea required placeholder="Describe the event..." className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none h-32" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all w-full md:w-auto">
                      <Sparkles size={16} />
                      Publish Event
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Events Section */}
              <div>
                <h2 className="font-heading text-xl font-semibold text-dark mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">{events.length}</span>
                  All Events
                </h2>
                <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
                  <ul className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
                    {events.length === 0 ? (
                      <li className="p-8 text-black/40 text-center text-sm">No events created yet.</li>
                    ) : events.map(event => (
                      <li key={event._id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-black/[0.02] transition">
                        <div>
                          <h4 className="font-heading font-semibold text-dark mb-1 leading-tight">{event.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-black/40">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              <span className={event.availableSeats > 0 ? 'text-emerald-500' : 'text-red-500'}>
                                {event.availableSeats}
                              </span>/{event.totalSeats} seats
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(event._id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-500 hover:bg-red-500 hover:text-white text-xs font-semibold transition-all shrink-0"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bookings Section */}
              <div>
                <h2 className="font-heading text-xl font-semibold text-dark mb-6 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600 text-sm font-bold">{bookings.length}</span>
                  Booking Requests
                </h2>
                <div className="bg-white rounded-2xl border border-black/10 overflow-hidden">
                  <ul className="divide-y divide-black/5 max-h-[600px] overflow-y-auto">
                    {bookings.length === 0 ? (
                      <li className="p-8 text-black/40 text-center text-sm">No bookings yet.</li>
                    ) : bookings.map(booking => (
                      <li
                        key={booking._id}
                        className={`p-6 hover:bg-black/[0.02] transition border-l-4 ${
                          booking.status === 'pending' ? 'border-l-amber-400' :
                          booking.status === 'confirmed' ? 'border-l-emerald-400' :
                          'border-l-red-400'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-heading font-semibold text-dark leading-tight">{booking.eventId?.title || 'Deleted Event'}</h4>
                          <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                              booking.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>{booking.status}</span>
                            {booking.status !== 'cancelled' && (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                booking.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-black/5 text-black/50'
                              }`}>{booking.paymentStatus.replace('_', ' ')}</span>
                            )}
                          </div>
                        </div>
                        <div className="bg-black/[0.02] rounded-xl p-3 mb-3 text-sm space-y-1">
                          <p className="text-black/60">
                            <span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">User:</span>
                            <span className="font-medium text-dark">{booking.userId?.name}</span>
                            <span className="text-black/30 ml-1">({booking.userId?.email})</span>
                          </p>
                          <p className="text-black/60">
                            <span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">Amount:</span>
                            <span className={`font-medium ${booking.amount === 0 ? 'text-emerald-500' : 'text-dark'}`}>
                              {booking.amount === 0 ? 'Free' : `₹${booking.amount}`}
                            </span>
                          </p>
                          <p className="text-black/60">
                            <span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">Date:</span>
                            {new Date(booking.bookedAt).toLocaleString()}
                          </p>
                        </div>

                        {booking.status === 'pending' && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => handleConfirmBooking(booking._id, 'paid')}
                              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 text-xs font-semibold transition-all"
                            >
                              <CheckCircle size={14} /> Approve Paid
                            </button>
                            <button
                              onClick={() => handleConfirmBooking(booking._id, 'not_paid')}
                              className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-black/5 text-dark hover:bg-dark hover:text-white border border-black/10 text-xs font-semibold transition-all"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-semibold transition-all"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
    );
};

export default AdminDashboard;
