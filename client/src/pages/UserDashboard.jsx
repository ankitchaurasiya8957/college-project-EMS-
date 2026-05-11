import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import eventService from '../services/eventService';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, XCircle, Calendar, ArrowRight, ExternalLink, CreditCard, Copy, IndianRupee, MapPin, CheckCircle, Clock, Ban, Plus, X, Save, Image } from 'lucide-react';
import { getCategoryConfig, EVENT_CATEGORIES } from '../utils/categories';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [toast, setToast] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [eventForm, setEventForm] = useState({
        title: '', description: '', date: '', location: '', category: '',
        totalSeats: '', ticketPrice: '', image: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const data = await bookingService.getMine();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            try {
                await bookingService.cancel(id);
                showToast('Booking cancelled successfully');
                fetchBookings();
            } catch (error) {
                showToast(error.response?.data?.message || 'Error cancelling booking', 'error');
            }
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await eventService.userCreate(eventForm);
            showToast('Event created successfully! 🎉');
            setShowCreateModal(false);
            setEventForm({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
        } catch (error) {
            showToast(error.response?.data?.message || 'Error creating event', 'error');
        } finally {
            setCreating(false);
        }
    };

    const setField = (key, val) => setEventForm(f => ({ ...f, [key]: val }));

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

    const statusConfig = {
        confirmed: { icon: CheckCircle, color: 'emerald', label: 'Confirmed' },
        pending: { icon: Clock, color: 'amber', label: 'Pending' },
        cancelled: { icon: Ban, color: 'red', label: 'Cancelled' },
    };

    // BUG-8 FIX: Static class mappings so Tailwind purge detects them at build time
    const colorClasses = {
        blue: { text: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', borderL: 'border-l-blue-400' },
        emerald: { text: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', borderL: 'border-l-emerald-400' },
        amber: { text: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', borderL: 'border-l-amber-400' },
        red: { text: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', borderL: 'border-l-red-400' },
    };
    const statusTextClasses = {
        emerald: 'text-emerald-600',
        amber: 'text-amber-600',
        red: 'text-red-600',
    };

    const inputCls = "w-full px-4 py-3 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50/50";

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

    return (
        <div className="pt-28 pb-20">
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-heading font-bold uppercase shrink-0">
                {user?.name.charAt(0)}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-dark tracking-tight mt-2">
                  Welcome, {user?.name}
                </h1>
                <p className="text-black/50 text-base mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  User Dashboard
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Plus size={18} />
                Create Event
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total', value: bookings.length, color: 'blue' },
                { label: 'Confirmed', value: confirmedCount, color: 'emerald' },
                { label: 'Pending', value: pendingCount, color: 'amber' },
                { label: 'Cancelled', value: cancelledCount, color: 'red' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-black/6 p-4">
                  <p className={`text-2xl font-heading font-bold ${colorClasses[stat.color]?.text || 'text-gray-500'}`}>{stat.value}</p>
                  <p className="text-xs text-black/40 font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Filter Tabs + Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-black/10">
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-dark flex items-center gap-3">
                <Ticket size={22} className="text-primary" />
                My Bookings
              </h2>
              <div className="flex items-center gap-2">
                {['all', 'confirmed', 'pending', 'cancelled'].map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      filter === f
                        ? 'bg-primary text-white'
                        : 'bg-black/5 text-black/50 hover:bg-black/10'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/10">
                <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
                  <Ticket size={32} className="text-black/20" />
                </div>
                <p className="text-black/50 text-lg mb-6 font-medium">
                  {filter === 'all' ? "You haven't booked any events yet." : `No ${filter} bookings found.`}
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                >
                  Browse Events
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBookings.map((booking) => {
                  const config = statusConfig[booking.status] || statusConfig.pending;
                  const StatusIcon = config.icon;

                  return (
                    <div
                      key={booking._id}
                      className={`bg-white rounded-2xl border border-black/10 overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 ${colorClasses[config.color]?.borderL || 'border-l-gray-400'}`}
                    >
                      <div className="p-6">
                        {booking.eventId ? (
                          <>
                            <div className="flex items-start justify-between gap-3 mb-4">
                              <div className="flex flex-col gap-2">
                                <h3 className="font-heading font-semibold text-lg text-dark leading-tight">
                                  {booking.eventId.title}
                                </h3>
                                {booking.eventId.category && (() => {
                                  const cc = getCategoryConfig(booking.eventId.category);
                                  return (
                                    <span className="w-max px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: cc ? cc.bgColor : '#f3f4f6', color: cc ? cc.color : '#6b7280' }}>
                                      {cc ? cc.shortLabel : booking.eventId.category}
                                    </span>
                                  );
                                })()}
                              </div>
                              <div className="flex flex-col gap-1 items-end shrink-0">
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 ${colorClasses[config.color]?.bg || 'bg-gray-50'} ${statusTextClasses[config.color] || 'text-gray-600'} ${colorClasses[config.color]?.border || 'border-gray-200'} border`}>
                                  <StatusIcon size={10} />
                                  {booking.status}
                                </span>
                                {booking.status !== 'cancelled' && (
                                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                    booking.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-black/5 text-black/50 border border-black/10'
                                  }`}>
                                    {booking.paymentStatus?.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Booking Details */}
                            <div className="space-y-2 text-sm text-black/50 mb-4">
                              <p className="flex items-center gap-2">
                                <Calendar size={14} className="text-black/30" />
                                {new Date(booking.eventId.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                              {booking.eventId.location && (
                                <p className="flex items-center gap-2">
                                  <MapPin size={14} className="text-black/30" />
                                  {booking.eventId.location}
                                </p>
                              )}
                              <p className="flex items-center gap-2">
                                <IndianRupee size={14} className="text-black/30" />
                                <span className="text-dark font-medium">
                                  {booking.amount === 0 ? <span className="text-emerald-500">Free</span> : `₹${booking.amount}`}
                                </span>
                              </p>
                              {booking.bookingType && (
                                <p className="flex items-center gap-2">
                                  <Ticket size={14} className="text-black/30" />
                                  <span className="capitalize">{booking.bookingType}</span>
                                </p>
                              )}
                            </div>

                            {/* Booking ID & Transaction */}
                            <div className="bg-black/[0.02] rounded-xl p-3 space-y-2 text-xs">
                              {booking.bookingId && (
                                <div className="flex items-center justify-between">
                                  <span className="text-black/40">Booking ID</span>
                                  <button onClick={() => copyToClipboard(booking.bookingId)} className="font-mono font-bold text-dark flex items-center gap-1 hover:text-primary transition-colors">
                                    {booking.bookingId} <Copy size={10} />
                                  </button>
                                </div>
                              )}
                              {booking.transactionId && (
                                <div className="flex items-center justify-between">
                                  <span className="text-black/40">Transaction ID</span>
                                  <span className="font-mono text-dark">{booking.transactionId}</span>
                                </div>
                              )}
                              {booking.paymentMethod && (
                                <div className="flex items-center justify-between">
                                  <span className="text-black/40">Payment Method</span>
                                  <span className="font-medium text-dark uppercase">{booking.paymentMethod}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-black/40">Booked On</span>
                                <span className="text-dark">{new Date(booking.bookedAt).toLocaleDateString('en-IN')}</span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <p className="text-red-400 italic text-sm">Event details unavailable (might have been deleted)</p>
                        )}
                      </div>
                      <div className="px-6 py-4 bg-black/[0.02] border-t border-black/5 flex justify-between items-center">
                        {booking.eventId && booking.status !== 'cancelled' ? (
                          <>
                            <Link
                              to={`/events/${booking.eventId._id}`}
                              className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                            >
                              View Event <ExternalLink size={12} />
                            </Link>
                            <button
                              onClick={() => cancelBooking(booking._id)}
                              className="text-red-500 font-medium text-sm hover:text-red-600 transition flex items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                          </>
                        ) : (
                          <div className="w-full text-center text-sm text-black/30 italic">Booking Cancelled</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Create Event Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-black/5">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-dark flex items-center gap-2">
                      <Plus size={20} className="text-primary" />
                      Create New Event
                    </h2>
                    <p className="text-xs text-black/40 mt-1">Fill in the details to publish your event</p>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center hover:bg-black/10 transition">
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Form */}
                <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Event Title *</label>
                      <input required className={inputCls} placeholder="e.g. Tech Innovation Summit" value={eventForm.title} onChange={e => setField('title', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Category *</label>
                      <select required className={inputCls} value={eventForm.category} onChange={e => setField('category', e.target.value)}>
                        <option value="">Select Category</option>
                        {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Date *</label>
                      <input required type="date" className={inputCls} value={eventForm.date} onChange={e => setField('date', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Location *</label>
                      <input required className={inputCls} placeholder="e.g. Convention Center, Mumbai" value={eventForm.location} onChange={e => setField('location', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Total Seats *</label>
                      <input required type="number" min="1" className={inputCls} placeholder="e.g. 200" value={eventForm.totalSeats} onChange={e => setField('totalSeats', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Ticket Price (₹)</label>
                      <input type="number" min="0" className={inputCls} placeholder="0 for free events" value={eventForm.ticketPrice} onChange={e => setField('ticketPrice', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Image URL</label>
                    <div className="relative">
                      <Image size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" />
                      <input className={`${inputCls} pl-10`} placeholder="https://images.unsplash.com/..." value={eventForm.image} onChange={e => setField('image', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-black/50 uppercase tracking-wider block mb-1.5">Description *</label>
                    <textarea required className={`${inputCls} resize-none h-24`} placeholder="Describe your event..." value={eventForm.description} onChange={e => setField('description', e.target.value)} />
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" disabled={creating}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                      <Save size={15} /> {creating ? 'Publishing...' : 'Publish Event'}
                    </button>
                    <button type="button" onClick={() => setShowCreateModal(false)}
                      className="px-6 py-3 rounded-xl border border-black/10 text-sm font-medium hover:bg-black/5 transition">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Toast */}
          {toast && (
            <div className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
            }`} style={{ animation: 'slideUp 0.3s ease-out' }}>
              {toast.msg}
            </div>
          )}
        </div>
    );
};

export default UserDashboard;
