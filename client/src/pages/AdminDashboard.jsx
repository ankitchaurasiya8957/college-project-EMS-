import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, XCircle, Calendar, Users, IndianRupee, Clock, Sparkles, Search, Edit3, MapPin, ChevronLeft, ChevronRight, Filter, BarChart3, TrendingUp, Award } from 'lucide-react';
import SectionTag from '../components/SectionTag';
import { CategoryPieChart, MonthlyBarChart, RevenueLineChart } from '../components/DashboardCharts';
import EditEventModal from '../components/EditEventModal';
import './AdminDashboard.css';

const ITEMS_PER_PAGE = 8;

const getEventStatus = (date) => {
  const now = new Date(); const d = new Date(date);
  const diff = d.getTime() - now.getTime();
  if (diff > 86400000) return 'upcoming';
  if (diff > -86400000) return 'ongoing';
  return 'completed';
};

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });

  useEffect(() => { if (!user || user.role !== 'admin') { navigate('/login'); return; } fetchData(); }, [user, navigate]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = async () => {
    try {
      const eventsRes = await api.get('/events');
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    try {
      const bookingsRes = await api.get('/bookings/my');
      setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', { ...formData, totalSeats: Number(formData.totalSeats), ticketPrice: Number(formData.ticketPrice) || 0 });
      setShowEventForm(false);
      setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
      showToast('Event created successfully!'); fetchData();
    } catch (error) { showToast(error.response?.data?.message || 'Error creating event', 'error'); }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try { await api.delete(`/events/${id}`); showToast('Event deleted'); fetchData(); } catch { showToast('Error deleting event', 'error'); }
    }
  };

  const handleEditSave = async (id, data) => {
    try { await api.put(`/events/${id}`, data); setEditEvent(null); showToast('Event updated successfully!'); fetchData(); }
    catch { showToast('Error updating event', 'error'); }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try { await api.put(`/bookings/${id}/confirm`, { paymentStatus }); showToast('Booking confirmed'); fetchData(); }
    catch (error) { showToast(error.response?.data?.message || 'Error confirming booking', 'error'); }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Cancel this user's booking request?")) {
      try { await api.delete(`/bookings/${id}`); showToast('Booking cancelled'); fetchData(); } catch { showToast('Error cancelling booking', 'error'); }
    }
  };

  const categories = useMemo(() => [...new Set(events.map(e => e.category))], [events]);

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || (e.createdBy?.name || '').toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') filtered = filtered.filter(e => getEventStatus(e.date) === statusFilter);
    if (categoryFilter !== 'all') filtered = filtered.filter(e => e.category === categoryFilter);
    return filtered;
  }, [events, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, categoryFilter]);

  const totalRevenue = bookings.reduce((s, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? s + b.amount : s, 0);
  const paidClients = new Set(bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').map(b => b.userId?._id)).size;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const upcomingCount = events.filter(e => getEventStatus(e.date) === 'upcoming').length;
  const ongoingCount = events.filter(e => getEventStatus(e.date) === 'ongoing').length;
  const completedCount = events.filter(e => getEventStatus(e.date) === 'completed').length;
  const totalAttendees = bookings.filter(b => b.status === 'confirmed').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inputCls = "w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
    { id: 'events', label: 'All Events', icon: <Calendar size={15} /> },
    { id: 'bookings', label: 'Bookings', icon: <Users size={15} /> },
  ];

  return (
    <div className="pt-28 pb-20">
      <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <SectionTag>Admin</SectionTag>
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-dark tracking-tight mt-2">Dashboard</h1>
            <p className="text-black/50 text-base mt-1">Manage events, track analytics, and handle bookings.</p>
          </div>
          <button onClick={() => { setShowEventForm(!showEventForm); setActiveTab('overview'); }}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm transition-all ${showEventForm ? 'bg-black/10 text-dark hover:bg-black/20' : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20'}`}>
            <Plus size={18} /> {showEventForm ? 'Cancel' : 'Create Event'}
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 stagger-children">
          {[
            { label: 'Total Events', value: events.length, icon: <Calendar size={20} />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' },
            { label: 'Upcoming', value: upcomingCount, icon: <TrendingUp size={20} />, color: 'green', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { label: 'Ongoing', value: ongoingCount, icon: <Clock size={20} />, color: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
            { label: 'Completed', value: completedCount, icon: <Award size={20} />, color: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
            { label: 'Attendees', value: totalAttendees, icon: <Users size={20} />, color: 'rose', bg: 'bg-rose-50', text: 'text-rose-500' },
          ].map((m, i) => (
            <div key={i} className={`metric-card ${m.color} bg-white rounded-2xl border border-black/6 p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${m.bg} flex items-center justify-center ${m.text}`}>{m.icon}</div>
              </div>
              <h3 className="text-2xl md:text-3xl font-heading font-bold text-dark">{m.value}</h3>
              <p className="text-black/40 text-xs font-semibold uppercase tracking-wider mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Revenue & Paid Clients mini cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2"><IndianRupee size={20} /><span className="text-sm font-medium opacity-80">Total Revenue</span></div>
            <h3 className="text-3xl font-heading font-bold">₹{totalRevenue.toLocaleString()}</h3>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-2"><Users size={20} /><span className="text-sm font-medium opacity-80">Paid Clients / Pending</span></div>
            <h3 className="text-3xl font-heading font-bold">{paidClients} <span className="text-base font-normal opacity-70">/ {pendingCount} pending</span></h3>
          </div>
        </div>

        {/* Create Event Form */}
        {showEventForm && (
          <div className="bg-white rounded-2xl border border-black/10 p-8 lg:p-10 mb-8" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <h2 className="font-heading text-2xl font-semibold text-dark mb-8">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm font-medium text-dark block mb-2">Event Title</label><input required type="text" placeholder="e.g., Tech Summit 2025" className={inputCls} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-dark block mb-2">Category</label><input required type="text" placeholder="e.g., Tech, Music" className={inputCls} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-dark block mb-2">Date</label><input required type="date" className={inputCls} value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-dark block mb-2">Location</label><input required type="text" placeholder="e.g., Mumbai" className={inputCls} value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-dark block mb-2">Total Seats</label><input required type="number" placeholder="100" className={inputCls} value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} /></div>
              <div><label className="text-sm font-medium text-dark block mb-2">Ticket Price (₹)</label><input type="number" placeholder="0 for free" className={inputCls} value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-dark block mb-2">Image URL</label><input type="text" placeholder="Paste image link" className={inputCls} value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-dark block mb-2">Description</label><textarea required placeholder="Describe the event..." className={`${inputCls} resize-none h-32`} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="md:col-span-2"><button type="submit" className="flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all w-full md:w-auto shadow-lg shadow-primary/20"><Sparkles size={16} />Publish Event</button></div>
            </form>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-black/5 mb-8 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`tab-btn flex items-center gap-2 ${activeTab === t.id ? 'active' : ''}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* TAB: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="chart-card"><h3 className="font-heading text-base font-semibold text-dark mb-4">Events by Category</h3><CategoryPieChart events={events} /></div>
            <div className="chart-card"><h3 className="font-heading text-base font-semibold text-dark mb-4">Monthly Events</h3><MonthlyBarChart events={events} /></div>
            <div className="chart-card"><h3 className="font-heading text-base font-semibold text-dark mb-4">Revenue Trend</h3><RevenueLineChart bookings={bookings} /></div>
          </div>
        )}

        {/* TAB: All Events */}
        {activeTab === 'events' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6 search-filters">
              <div className="search-bar flex-1">
                <Search size={16} className="text-black/30 shrink-0" />
                <input placeholder="Search by name, location, organizer..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              <select className="filter-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Events Table */}
            <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
              <div className="table-wrapper">
                <table className="events-table">
                  <thead><tr>
                    <th>Event Name</th><th>Date</th><th>Location</th><th>Category</th><th>Status</th><th>Seats</th><th>Organizer</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {paginatedEvents.length === 0 ? (
                      <tr><td colSpan="8" className="text-center text-black/30 py-12">No events found.</td></tr>
                    ) : paginatedEvents.map(event => {
                      const status = getEventStatus(event.date);
                      return (
                        <tr key={event._id}>
                          <td><span className="font-semibold text-dark">{event.title}</span></td>
                          <td className="text-black/60">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td><span className="flex items-center gap-1 text-black/60"><MapPin size={13} />{event.location}</span></td>
                          <td><span className="px-2.5 py-1 rounded-lg bg-black/5 text-xs font-medium">{event.category}</span></td>
                          <td><span className={`status-badge status-${status}`}>{status}</span></td>
                          <td><span className={event.availableSeats > 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{event.availableSeats}</span><span className="text-black/30">/{event.totalSeats}</span></td>
                          <td className="text-black/60 text-sm">{event.createdBy?.name || '—'}</td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button className="action-btn edit" title="Edit" onClick={() => setEditEvent(event)}><Edit3 size={14} /></button>
                              <button className="action-btn delete" title="Delete" onClick={() => handleDeleteEvent(event._id)}><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-black/5">
                  <p className="text-xs text-black/40">Showing {(currentPage-1)*ITEMS_PER_PAGE+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}</p>
                  <div className="pagination">
                    <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}><ChevronLeft size={14} /></button>
                    {Array.from({ length: totalPages }, (_, i) => i+1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1).map((p, i, arr) => (
                      <React.Fragment key={p}>
                        {i > 0 && arr[i-1] !== p-1 && <span className="text-black/20 px-1">…</span>}
                        <button className={`page-btn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                      </React.Fragment>
                    ))}
                    <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}><ChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: Bookings */}
        {activeTab === 'bookings' && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="bg-white rounded-2xl border border-black/6 overflow-hidden">
              <ul className="divide-y divide-black/5 max-h-[700px] overflow-y-auto">
                {bookings.length === 0 ? (
                  <li className="p-8 text-black/40 text-center text-sm">No bookings yet.</li>
                ) : bookings.map(booking => (
                  <li key={booking._id} className={`p-6 hover:bg-black/[0.02] transition border-l-4 ${booking.status === 'pending' ? 'border-l-amber-400' : booking.status === 'confirmed' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-heading font-semibold text-dark leading-tight">{booking.eventId?.title || 'Deleted Event'}</h4>
                      <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : booking.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{booking.status}</span>
                        {booking.status !== 'cancelled' && (
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${booking.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-black/5 text-black/50'}`}>{booking.paymentStatus.replace('_', ' ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-black/[0.02] rounded-xl p-3 mb-3 text-sm space-y-1">
                      <p className="text-black/60"><span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">User:</span><span className="font-medium text-dark">{booking.userId?.name}</span><span className="text-black/30 ml-1">({booking.userId?.email})</span></p>
                      <p className="text-black/60"><span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">Amount:</span><span className={`font-medium ${booking.amount === 0 ? 'text-emerald-500' : 'text-dark'}`}>{booking.amount === 0 ? 'Free' : `₹${booking.amount}`}</span></p>
                      <p className="text-black/60"><span className="font-semibold text-black/40 uppercase text-xs w-16 inline-block">Date:</span>{new Date(booking.bookedAt).toLocaleString()}</p>
                    </div>
                    {booking.status === 'pending' && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={() => handleConfirmBooking(booking._id, 'paid')} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-200 text-xs font-semibold transition-all"><CheckCircle size={14} /> Approve Paid</button>
                        <button onClick={() => handleConfirmBooking(booking._id, 'not_paid')} className="flex-1 min-w-[120px] flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full bg-black/5 text-dark hover:bg-dark hover:text-white border border-black/10 text-xs font-semibold transition-all"><CheckCircle size={14} /> Approve</button>
                        <button onClick={() => handleCancelBooking(booking._id)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-200 text-xs font-semibold transition-all"><XCircle size={14} /> Reject</button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editEvent && <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} onSave={handleEditSave} />}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
};

export default AdminDashboard;
