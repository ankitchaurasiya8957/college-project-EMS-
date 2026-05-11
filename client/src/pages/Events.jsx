import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Calendar, MapPin, Users, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid, List, ArrowUpDown, X, Ticket } from 'lucide-react';
import eventService from '../services/eventService';
import EventCard from '../components/EventCard';
import { EVENT_CATEGORIES, getCategoryConfig } from '../utils/categories';

const ITEMS_PER_PAGE = 9;

const Events = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [showFilters, setShowFilters] = useState(!!searchParams.get('category'));

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const dayAfter = new Date(eventDate);
    dayAfter.setDate(dayAfter.getDate() + 1);
    if (now < eventDate) return 'upcoming';
    if (now >= eventDate && now <= dayAfter) return 'ongoing';
    return 'completed';
  };

  // Extract unique categories
  // Use the official category list for filters
  const categories = EVENT_CATEGORIES.map(c => c.value);

  // Filtered & sorted events
  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.title?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(e => e.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(e => getEventStatus(e.date) === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'price-asc':
          return (a.ticketPrice || 0) - (b.ticketPrice || 0);
        case 'price-desc':
          return (b.ticketPrice || 0) - (a.ticketPrice || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [events, search, categoryFilter, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: events.length,
    upcoming: events.filter(e => getEventStatus(e.date) === 'upcoming').length,
    ongoing: events.filter(e => getEventStatus(e.date) === 'ongoing').length,
    completed: events.filter(e => getEventStatus(e.date) === 'completed').length,
  }), [events]);

  const activeFilterCount = [
    categoryFilter !== 'all',
    statusFilter !== 'all',
    search.trim() !== ''
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setSortBy('date-asc');
  };

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Banner */}
      <section className="relative pt-32 pb-16 lg:pt-40 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center">
            <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.2em] mb-4">Discover & Book</p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Browse All Events
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Explore curated experiences from tech conferences to music festivals.
              Find your next unforgettable moment.
            </p>

            {/* Stats Row */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { label: 'Total Events', value: stats.total, color: 'text-blue-400' },
                { label: 'Upcoming', value: stats.upcoming, color: 'text-emerald-400' },
                { label: 'Ongoing', value: stats.ongoing, color: 'text-amber-400' },
                { label: 'Completed', value: stats.completed, color: 'text-gray-400' },
              ].map((s, i) => (
                <div key={i} className="text-center min-w-[80px]">
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search + Filters Bar */}
      <section className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, location, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <SlidersHorizontal size={16} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>

              {/* View Mode */}
              <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-3" style={{ animation: 'fadeIn 0.2s ease-out' }}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Categories</option>
                {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="date-asc">Date: Earliest First</option>
                <option value="date-desc">Date: Latest First</option>
                <option value="title-asc">Title: A → Z</option>
                <option value="title-desc">Title: Z → A</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <X size={14} /> Clear All
                </button>
              )}

              <div className="ml-auto text-xs font-medium text-gray-400">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Events Content */}
      <section className="py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {/* Active Filters Tags */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active:</span>
              {search.trim() && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                  Search: "{search}"
                  <button onClick={() => setSearch('')} className="hover:text-blue-800"><X size={12} /></button>
                </span>
              )}
              {categoryFilter !== 'all' && (() => {
                const cc = getCategoryConfig(categoryFilter);
                return (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: cc ? cc.bgColor : '#f3e8ff', color: cc ? cc.color : '#9333ea' }}>
                    {cc ? cc.shortLabel : categoryFilter}
                    <button onClick={() => setCategoryFilter('all')} className="hover:opacity-70 transition-opacity"><X size={12} /></button>
                  </span>
                );
              })()}
              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold capitalize">
                  {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="hover:text-emerald-800"><X size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-32">
              <div className="inline-block w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 mt-4 font-medium">Loading events...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            /* Empty State */
            <div className="text-center py-32">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any events matching your filters. Try adjusting your search or clearing the filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid View */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {paginatedEvents.map((event) => (
                    <EventCard key={event._id} event={event} />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-4" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                  {paginatedEvents.map((event) => {
                    const status = getEventStatus(event.date);
                    const isFree = event.ticketPrice === 0;
                    return (
                      <Link
                        to={`/events/${event._id}`}
                        key={event._id}
                        className="flex items-center gap-6 bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group"
                      >
                        {/* Image */}
                        <div className="w-32 h-24 rounded-xl overflow-hidden shrink-0">
                          {event.image ? (
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center">
                              <span className="text-white/30 text-xs font-bold uppercase">{event.category}</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              {(() => {
                                const cc = getCategoryConfig(event.category);
                                return (
                                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cc ? cc.color : '#3b82f6' }}>
                                    {cc ? cc.shortLabel : event.category}
                                  </span>
                                );
                              })()}
                              <h3 className="font-semibold text-gray-900 text-lg leading-tight mt-0.5 group-hover:text-blue-600 transition-colors">{event.title}</h3>
                            </div>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${isFree ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-700'}`}>
                              {isFree ? 'FREE' : `₹${event.ticketPrice}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-5 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {event.location}</span>
                            <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {event.availableSeats}/{event.totalSeats} seats</span>
                          </div>
                        </div>

                        {/* Status */}
                        <div className="hidden lg:flex items-center">
                          <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                            status === 'upcoming' ? 'bg-emerald-50 text-emerald-600' :
                            status === 'ongoing' ? 'bg-amber-50 text-amber-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              status === 'upcoming' ? 'bg-emerald-500' :
                              status === 'ongoing' ? 'bg-amber-500' :
                              'bg-gray-400'
                            }`} />
                            {status}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Results Info */}
                  <p className="text-sm text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span>–<span className="font-bold text-gray-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredEvents.length)}</span> of <span className="font-bold text-gray-900">{filteredEvents.length}</span> events
                  </p>

                  {/* Page Controls */}
                  <div className="flex items-center gap-1">
                    {/* Prev */}
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, i) => (
                      page === '...' ? (
                        <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-xl text-sm font-bold flex items-center justify-center transition-all ${
                            currentPage === page
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ))}

                    {/* Next */}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      className="w-10 h-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Quick Jump */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">Go to:</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val >= 1 && val <= totalPages) setCurrentPage(val);
                      }}
                      className="w-16 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center font-bold outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    />
                    <span className="text-gray-400">of {totalPages}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
