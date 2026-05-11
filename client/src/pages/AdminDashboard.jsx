import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, CheckCircle, XCircle, Calendar, Users, IndianRupee, Clock, Sparkles, Search, Edit3, MapPin, ChevronLeft, ChevronRight, Filter, BarChart3, TrendingUp, Award, CreditCard, Eye, ArrowLeft, Ticket, User, Settings } from 'lucide-react';
import { CategoryPieChart, MonthlyBarChart, RevenueLineChart } from '../components/DashboardCharts';
import EditEventModal from '../components/EditEventModal';
import { EVENT_CATEGORIES } from '../utils/categories';
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
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [participantSearch, setParticipantSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('all');
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [stateFilters, setStateFilters] = useState({ paid: true, pending: true, refunded: true });

  // BUG-12 FIX: Reset booking page when filters or search change
  useEffect(() => { setBookingPage(1); }, [bookingSearch, stateFilters]);

  useEffect(() => { if (!user || user.role !== 'admin') { navigate('/login'); return; } fetchData(); }, [user, navigate]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const fetchData = async () => {
    try {
      const eventsData = await eventService.getAll();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      showToast('Failed to load events from server', 'error');
    }
    try {
      const bookingsData = await bookingService.getAll();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await eventService.create(formData);
      setShowEventForm(false);
      setFormData({ title: '', description: '', date: '', location: '', category: '', totalSeats: '', ticketPrice: '', image: '' });
      showToast(`Event "${created.title}" created successfully!`);
      await fetchData(); // Re-fetch from MongoDB to ensure consistency
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Error creating event. Check server connection.';
      showToast(errMsg, 'error');
      console.error('Create event error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.delete(id);
        showToast('Event deleted');
        await fetchData();
      } catch (error) {
        showToast(error.response?.data?.message || 'Error deleting event', 'error');
      }
    }
  };

  const handleEditSave = async (id, data) => {
    try {
      await eventService.update(id, data);
      setEditEvent(null);
      showToast('Event updated successfully!');
      await fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating event', 'error');
    }
  };

  const handleConfirmBooking = async (id, paymentStatus) => {
    try {
      await bookingService.confirm(id, paymentStatus);
      showToast('Booking confirmed');
      await fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error confirming booking', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm("Cancel this user's booking request?")) {
      try {
        await bookingService.cancel(id);
        showToast('Booking cancelled');
        await fetchData();
      } catch (error) {
        showToast(error.response?.data?.message || 'Error cancelling booking', 'error');
      }
    }
  };

  const categories = useMemo(() => [...new Set(events.map(e => e.category))], [events]);

  const handleViewParticipants = async (eventId) => {
    setSelectedEventId(eventId);
    setLoadingParticipants(true);
    setActiveTab('participants');
    try {
      const data = await bookingService.getEventParticipants(eventId);
      setParticipants(data);
    } catch (error) {
      showToast('Failed to load participants', 'error');
      console.error(error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const filteredParticipants = useMemo(() => {
    if (!participants?.participants) return [];
    let list = participants.participants;
    if (participantSearch) {
      const q = participantSearch.toLowerCase();
      list = list.filter(p => p.user?.name?.toLowerCase().includes(q) || p.user?.email?.toLowerCase().includes(q) || p.bookingId?.toLowerCase().includes(q) || p.transactionId?.toLowerCase().includes(q));
    }
    if (participantFilter !== 'all') list = list.filter(p => p.status === participantFilter);
    return list;
  }, [participants, participantSearch, participantFilter]);

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

  const totalRevenue = bookings.reduce((s, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? s + (Number(b.amount) || 0) : s, 0);
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans pt-24">
      {/* Main Content Area */}
      <div className="w-full">
        {/* Content Scroll */}
        <main className="px-6 md:px-10 pb-16">
          <div className="max-w-6xl mx-auto">
            {/* Page Title & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
                <p className="text-sm text-gray-500">Manage events, track analytics, and handle bookings across your organization.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search events..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none w-56" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <button onClick={() => setShowEventForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition-colors">
                  <Plus size={14} /> Create Event
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-8 border-b border-gray-200 mb-8">
              <button onClick={() => setActiveTab('overview')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'overview' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                <TrendingUp size={16}/> Overview
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
              <button onClick={() => setActiveTab('events')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'events' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                <Calendar size={16}/> All Events
                {activeTab === 'events' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
              <button onClick={() => setActiveTab('bookings')} className={`pb-4 text-sm font-bold flex items-center gap-2 transition-colors relative ${activeTab === 'bookings' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                <Users size={16}/> Bookings
                {activeTab === 'bookings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
              </button>
            </div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                {/* Revenue Analysis - Full Width Line Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Revenue Analysis</h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Fiscal Performance</p>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Projection</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actual</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-72"><RevenueLineChart bookings={bookings} events={events} /></div>
                </div>

                {/* Monthly Event Frequency + Event Categories */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-1">
                      <h3 className="text-lg font-bold text-gray-900">Monthly Event Frequency</h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Sessions Hosted</p>
                    </div>
                    <div className="h-64"><MonthlyBarChart events={events} /></div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="mb-1">
                      <h3 className="text-lg font-bold text-gray-900">Event Categories</h3>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Distribution by Type</p>
                    </div>
                    <div className="h-64"><CategoryPieChart events={events} /></div>
                  </div>
                </div>

                {/* Bottom Stat Cards - 4 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Peak Performance */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <TrendingUp size={20} className="text-blue-600" />
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-wider">+12%</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Peak Performance</p>
                    <p className="text-3xl font-bold text-gray-900">₹{totalRevenue >= 1000 ? `${(totalRevenue / 1000).toFixed(1)}k` : totalRevenue}</p>
                    <div className="mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '72%' }} />
                    </div>
                  </div>

                  {/* Active Venues */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <MapPin size={20} className="text-emerald-600" />
                      <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Active</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Active Venues</p>
                    <p className="text-3xl font-bold text-gray-900">{events.length}</p>
                    <div className="mt-3 flex gap-1">
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                      <div className="h-1 flex-1 bg-emerald-500 rounded-full" />
                      <div className="h-1 flex-1 bg-gray-100 rounded-full" />
                    </div>
                  </div>

                  {/* Avg. Ticket Price */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <Ticket size={20} className="text-purple-600" />
                      <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md uppercase tracking-wider">Stable</span>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Avg. Ticket Price</p>
                    <p className="text-3xl font-bold text-gray-900">₹{bookings.length > 0 ? Math.round(totalRevenue / Math.max(paidClients, 1)) : 0}</p>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Last month avg: ₹{bookings.length > 0 ? Math.round((totalRevenue / Math.max(paidClients, 1)) * 0.97) : 0}</p>
                  </div>

                  {/* Attendees Online */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <Users size={20} className="text-gray-500" />
                      <div className="flex gap-0.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200" />
                        <div className="w-5 h-5 rounded-full bg-gray-200 -ml-1.5" />
                        <div className="w-5 h-5 rounded-full bg-gray-200 -ml-1.5" />
                      </div>
                    </div>
                    <p className="text-xs font-bold text-gray-500 mb-1">Total Attendees</p>
                    <p className="text-3xl font-bold text-gray-900">{totalAttendees}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] text-gray-400 font-medium">System fully operational</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: All Events */}
            {activeTab === 'events' && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Search by name, location..." className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  </div>
                  <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-500" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
                  </select>
                  <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 outline-none focus:border-blue-500" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                    <option value="all">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event Name</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Seats</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedEvents.length === 0 ? (
                          <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">No events found.</td></tr>
                        ) : paginatedEvents.map(event => {
                          const status = getEventStatus(event.date);
                          return (
                            <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-semibold text-gray-900">{event.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                              <td className="px-6 py-4"><span className="flex items-center gap-1.5 text-sm text-gray-600"><MapPin size={14} className="text-gray-400"/>{event.location}</span></td>
                              <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">{event.category}</span></td>
                              <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max ${status === 'upcoming' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}><div className={`w-1.5 h-1.5 rounded-full ${status === 'upcoming' ? 'bg-emerald-500' : 'bg-gray-400'}`}></div>{status}</span></td>
                              <td className="px-6 py-4 text-sm"><span className={event.availableSeats > 0 ? 'text-emerald-600 font-semibold' : 'text-red-500 font-semibold'}>{event.availableSeats}</span><span className="text-gray-400">/{event.totalSeats}</span></td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center hover:bg-indigo-100 transition-colors" title="Participants" onClick={() => handleViewParticipants(event._id)}><Eye size={14} /></button>
                                  <button className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors" title="Edit" onClick={() => setEditEvent(event)}><Edit3 size={14} /></button>
                                  <button className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors" title="Delete" onClick={() => handleDeleteEvent(event._id)}><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                      <p className="text-xs font-medium text-gray-500">Showing {(currentPage-1)*ITEMS_PER_PAGE+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length}</p>
                      <div className="flex gap-1">
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)}><ChevronLeft size={14} /></button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 disabled:opacity-50" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)}><ChevronRight size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Bookings */}
            {activeTab === 'bookings' && (() => {
              const BOOKINGS_PER_PAGE = 4;

              const toggleFilter = (key) => setStateFilters(prev => ({ ...prev, [key]: !prev[key] }));

              const filteredBookings = bookings.filter(b => {
                // Status filters
                const statusMatch =
                  (stateFilters.paid && b.paymentStatus === 'paid') ||
                  (stateFilters.pending && (b.paymentStatus === 'pending' || b.paymentStatus === 'not_paid')) ||
                  (stateFilters.refunded && b.status === 'cancelled');
                if (!statusMatch) return false;
                // Search
                if (bookingSearch.trim()) {
                  const q = bookingSearch.toLowerCase();
                  return (b.bookingId || '').toLowerCase().includes(q) ||
                    (b.eventId?.title || '').toLowerCase().includes(q) ||
                    (b.userId?.name || '').toLowerCase().includes(q) ||
                    (b.userId?.email || '').toLowerCase().includes(q);
                }
                return true;
              });

              const bookingTotalPages = Math.ceil(filteredBookings.length / BOOKINGS_PER_PAGE);
              const paginatedBookings = filteredBookings.slice((bookingPage - 1) * BOOKINGS_PER_PAGE, bookingPage * BOOKINGS_PER_PAGE);

              // Booking metrics
              const paidBookingsCount = bookings.filter(b => b.paymentStatus === 'paid' && b.status === 'confirmed').length;
              const bookingRevenue = bookings.reduce((s, b) => b.paymentStatus === 'paid' && b.status === 'confirmed' ? s + (Number(b.amount) || 0) : s, 0);
              const pendingExecCount = bookings.filter(b => b.status === 'pending').length;

              const active = selectedBooking;

              return (
                <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {/* Header Bar */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-wider">Data_Transactions</h2>
                      <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md uppercase tracking-widest animate-pulse">Live_Stream_Active</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Query_ID..."
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium w-48 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>
                      <button className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                        <Settings size={14} />
                      </button>
                    </div>
                  </div>

                  {/* 3-Panel Layout */}
                  <div className="grid grid-cols-12 gap-5">
                    {/* Left Sidebar - Metrics & Filters */}
                    <div className="col-span-3 space-y-4">
                      {/* Metric 1: Volume */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sys_Metric_01 // Vol</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-gray-900">{bookings.length.toLocaleString()}</p>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Delta +{((paidBookingsCount / Math.max(bookings.length, 1)) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(paidBookingsCount / Math.max(bookings.length, 1)) * 100}%` }} />
                        </div>
                      </div>

                      {/* Metric 2: Revenue */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sys_Metric_02 // Rev</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-emerald-600">₹{bookingRevenue >= 1000 ? `${(bookingRevenue / 1000).toFixed(1)}k` : bookingRevenue}</p>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Delta +8.4%</span>
                        </div>
                        <div className="mt-3 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }} />
                        </div>
                      </div>

                      {/* Metric 3: Queue Status */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Queue_Status // Alert</p>
                        <div className="flex items-end justify-between">
                          <p className="text-3xl font-bold text-gray-900">{pendingExecCount}</p>
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Pending_Exec</span>
                        </div>
                      </div>

                      {/* Query Parameters / Filters */}
                      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Query_Parameters</p>
                        <div className="space-y-3">
                          {[
                            { key: 'paid', label: 'STATE_PAID', color: 'text-blue-600' },
                            { key: 'pending', label: 'STATE_PENDING', color: 'text-blue-600' },
                            { key: 'refunded', label: 'STATE_REFUNDED', color: 'text-blue-600' },
                          ].map(f => (
                            <label key={f.key} className="flex items-center gap-3 cursor-pointer group">
                              <div
                                onClick={() => toggleFilter(f.key)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${stateFilters[f.key] ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
                              >
                                {stateFilters[f.key] && <CheckCircle size={12} className="text-white" />}
                              </div>
                              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider group-hover:text-gray-900 transition-colors">{f.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Center - Transactions Table */}
                    <div className="col-span-5 flex flex-col">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/80">
                          <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction_ID</div>
                          <div className="col-span-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Node_Target</div>
                          <div className="col-span-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entity_Ref</div>
                          <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</div>
                        </div>

                        {/* Table Rows */}
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                          {paginatedBookings.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-xs font-medium">No transactions match current query parameters.</div>
                          ) : paginatedBookings.map((booking) => {
                            const isActive = active?._id === booking._id;
                            return (
                              <div
                                key={booking._id}
                                onClick={() => setSelectedBooking(booking)}
                                className={`grid grid-cols-12 gap-2 px-5 py-4 cursor-pointer transition-all ${isActive ? 'bg-blue-50/50 border-l-2 border-l-blue-500' : 'hover:bg-gray-50/50 border-l-2 border-l-transparent'}`}
                              >
                                <div className="col-span-3">
                                  <p className={`text-sm font-bold ${isActive ? 'text-blue-600' : 'text-red-500'}`}>
                                    TXN-{(booking.bookingId || booking._id).slice(-4).toUpperCase()}
                                  </p>
                                </div>
                                <div className="col-span-4">
                                  <p className="text-xs font-semibold text-gray-900 truncate">{booking.eventId?.title || 'Deleted_Event'}</p>
                                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">Type: {booking.paymentStatus === 'paid' ? 'TIER_1_ACCESS' : 'BASE_ACCESS'}</p>
                                </div>
                                <div className="col-span-3">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0 ${
                                      booking.paymentStatus === 'paid' ? 'bg-blue-500' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'
                                    }`}>
                                      {(booking.userId?.name || 'U').substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700 truncate">USR_{(booking.userId?.name || 'Unknown').split(' ').pop().toUpperCase().substring(0, 8)}_{(booking.userId?.name || 'U')[0].toUpperCase()}</span>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <p className="text-[10px] text-gray-400 font-medium">{new Date(booking.bookedAt).getFullYear()}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Pagination Footer */}
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                            Offset_{bookingPage}_{bookingTotalPages} // Limit_{filteredBookings.length}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={bookingPage === 1}
                              onClick={() => setBookingPage(p => p - 1)}
                              className="px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                            >
                              {'< Prev'}
                            </button>
                            {(() => {
                              // BUG-11 FIX: Show pages around current page, not always 1-3
                              let startPage = Math.max(1, bookingPage - 1);
                              let endPage = Math.min(bookingTotalPages, startPage + 2);
                              startPage = Math.max(1, endPage - 2);
                              return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(p => (
                                <button
                                  key={p}
                                  onClick={() => setBookingPage(p)}
                                  className={`w-8 h-8 text-xs font-bold rounded-md transition-all ${bookingPage === p ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'border border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
                                >
                                  {String(p).padStart(2, '0')}
                                </button>
                              ));
                            })()}
                            {bookingTotalPages > 3 && <span className="text-gray-400 text-xs px-1">..</span>}
                            <button
                              disabled={bookingPage === bookingTotalPages || bookingTotalPages === 0}
                              onClick={() => setBookingPage(p => p + 1)}
                              className="px-3 py-1.5 text-[10px] font-bold text-gray-500 border border-gray-200 rounded-md bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors uppercase tracking-wider"
                            >
                              {'Next >'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Panel - Inspector View */}
                    <div className="col-span-4">
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* Inspector Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Inspector_View</h3>
                          {active && (
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                              <XCircle size={16} />
                            </button>
                          )}
                        </div>

                        {!active ? (
                          <div className="p-12 text-center">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                              <Eye size={20} className="text-gray-300" />
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Select a transaction to inspect</p>
                          </div>
                        ) : (
                          <div className="p-5 space-y-5">
                            {/* Selected Record */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Selected_Record</p>
                              <p className="text-lg font-bold text-blue-600">TXN-{(active.bookingId || active._id).slice(-4).toUpperCase()}</p>
                              <span className={`inline-block mt-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                                active.paymentStatus === 'paid' ? 'bg-gray-100 text-gray-700' : active.status === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {active.paymentStatus === 'paid' ? 'ACK_PAID' : active.status === 'cancelled' ? 'VOID' : 'PENDING'}
                              </span>
                            </div>

                            {/* Entity Data */}
                            <div className="border border-gray-100 rounded-xl p-4">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Entity_Data</p>
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                  {(active.userId?.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">USR_{(active.userId?.name || 'Unknown').split(' ').pop().toUpperCase().substring(0, 8)}_{(active.userId?.name || 'U')[0].toUpperCase()}</p>
                                  <p className="text-xs text-gray-500">{active.userId?.name || 'Unknown'}</p>
                                </div>
                              </div>
                              <div className="space-y-2 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-400 uppercase tracking-wider">Contact_ID:</span>
                                  <span className="text-gray-700 font-medium">{active.userId?.email || '—'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Latency Log */}
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Latency_Log</p>
                              <div className="bg-gray-50 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-gray-600 space-y-0.5 border border-gray-100">
                                <p>[{new Date(active.bookedAt).toLocaleTimeString('en-GB')}] INIT_REQ_RECEIVED</p>
                                <p>[{new Date(new Date(active.bookedAt).getTime() + 2000).toLocaleTimeString('en-GB')}] AUTH_TOKEN_VALIDATED</p>
                                {active.paymentStatus === 'paid' && (
                                  <>
                                    <p>[{new Date(new Date(active.bookedAt).getTime() + 5000).toLocaleTimeString('en-GB')}] PAYMENT_GATEWAY_PING</p>
                                    <p>[{new Date(new Date(active.bookedAt).getTime() + 10000).toLocaleTimeString('en-GB')}] PAYMENT_ACK_SUCCESS</p>
                                  </>
                                )}
                                {active.status === 'cancelled' && (
                                  <p>[{new Date(new Date(active.bookedAt).getTime() + 5000).toLocaleTimeString('en-GB')}] TXN_VOID_INITIATED</p>
                                )}
                                <p>[{new Date(new Date(active.bookedAt).getTime() + 50000).toLocaleTimeString('en-GB')}] DB_WRITE_COMMIT</p>
                                <p>[{new Date(new Date(active.bookedAt).getTime() + 109000).toLocaleTimeString('en-GB')}] TICKET_HASH_GEN_OK</p>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                              {/* BUG-14 FIX: Replaced non-functional Edit_Rec with working Confirm button */}
                              {active.status === 'pending' && (
                                <button
                                  onClick={() => { handleConfirmBooking(active._id, active.paymentStatus); setSelectedBooking(null); }}
                                  className="flex-1 py-3 text-xs font-bold uppercase tracking-widest border-2 border-emerald-500 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-colors"
                                >
                                  Confirm_Txn
                                </button>
                              )}
                              <button
                                onClick={() => { handleCancelBooking(active._id); setSelectedBooking(null); }}
                                className="flex-1 py-3 text-xs font-bold uppercase tracking-widest bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
                              >
                                Void_Txn
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* TAB: Participants */}
            {activeTab === 'participants' && participants && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <button onClick={() => { setActiveTab('events'); setSelectedEventId(null); setParticipants(null); }} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors mb-6">
                  <ArrowLeft size={16} /> Back to Events
                </button>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">{participants.event.title}</h2>
                     <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(participants.event.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin size={14}/> {participants.event.location}</span>
                        <span className="flex items-center gap-1.5"><Ticket size={14}/> {participants.event.availableSeats}/{participants.event.totalSeats} seats</span>
                     </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="bg-blue-50 text-blue-600 rounded-xl p-4 text-center min-w-[100px]">
                         <p className="text-3xl font-bold">{participants.participants.length}</p>
                         <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">Total</p>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 rounded-xl p-4 text-center min-w-[100px]">
                         <p className="text-3xl font-bold">{participants.totalParticipants}</p>
                         <p className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-80">Confirmed</p>
                      </div>
                   </div>
                </div>
                {/* Search participants */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Search participants..." className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 transition-all" value={participantSearch} onChange={e => setParticipantSearch(e.target.value)} />
                  </div>
                </div>
                {/* Participants table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Booking ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredParticipants.length === 0 ? (
                          <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-sm">No participants found.</td></tr>
                        ) : filteredParticipants.map((p, i) => (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                               <p className="font-semibold text-gray-900">{p.user?.name || '—'}</p>
                               <p className="text-xs text-gray-500 mt-0.5">{p.user?.email || '—'}</p>
                            </td>
                            <td className="px-6 py-4"><span className="font-mono text-xs font-bold text-gray-600">{p.bookingId || '—'}</span></td>
                            <td className="px-6 py-4"><span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${p.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span></td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{p.amount === 0 ? <span className="text-emerald-500">Free</span> : `₹${p.amount}`}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Toasts */}
      {showEventForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 lg:p-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
              <button type="button" onClick={() => setShowEventForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Event Title</label><input required type="text" placeholder="e.g., Tech Summit 2025" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Category</label><select required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}><option value="">Select Category</option>{EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Date</label><input required type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Location</label><input required type="text" placeholder="e.g., Mumbai" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Total Seats</label><input required type="number" placeholder="100" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.totalSeats} onChange={e => setFormData({ ...formData, totalSeats: e.target.value })} /></div>
              <div><label className="text-sm font-bold text-gray-700 block mb-2">Ticket Price (₹)</label><input type="number" placeholder="0 for free" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.ticketPrice} onChange={e => setFormData({ ...formData, ticketPrice: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 block mb-2">Image URL</label><input type="text" placeholder="Paste image link" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} /></div>
              <div className="md:col-span-2"><label className="text-sm font-bold text-gray-700 block mb-2">Description</label><textarea required placeholder="Describe the event..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-1 outline-none transition-all resize-none h-32" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div>
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowEventForm(false)} className="px-6 py-3 rounded-full font-bold text-sm text-gray-600 hover:bg-gray-100 transition-all">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</> : <><Sparkles size={16} /> Publish Event</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editEvent && <div className="z-[200] relative"><EditEventModal event={editEvent} eventBookings={bookings.filter(b => (b.eventId?._id || b.eventId) === editEvent._id)} onClose={() => setEditEvent(null)} onSave={handleEditSave} /></div>}

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold text-sm flex items-center gap-3 z-[300] ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gray-900 text-white'}`} style={{ animation: 'slideUp 0.3s ease-out' }}>
          {toast.type === 'error' ? <XCircle size={18}/> : <CheckCircle size={18} className="text-emerald-400"/>}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
