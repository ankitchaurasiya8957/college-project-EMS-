/**
 * Event Service — Centralized API layer for all event operations.
 * All event-related API calls go through this service so the UI components
 * never call axios directly. This makes error handling, logging, and
 * future changes (e.g., caching, optimistic updates) easy to add in one place.
 */
import api from '../utils/axios';

const eventService = {
    /**
     * Fetch all events, optionally filtered by category or search query.
     */
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);

        const { data } = await api.get(`/events?${params.toString()}`);
        return Array.isArray(data) ? data : [];
    },

    /**
     * Fetch a single event by its MongoDB _id.
     */
    getById: async (id) => {
        const { data } = await api.get(`/events/${id}`);
        return data;
    },

    /**
     * Create a new event (admin-only, JWT required).
     */
    create: async (eventData) => {
        const payload = {
            ...eventData,
            totalSeats: Number(eventData.totalSeats),
            ticketPrice: Number(eventData.ticketPrice) || 0,
        };
        const { data } = await api.post('/events', payload);
        return data;
    },

    /**
     * Update an existing event by its _id (admin-only, JWT required).
     */
    update: async (id, eventData) => {
        const { data } = await api.put(`/events/${id}`, eventData);
        return data;
    },

    /**
     * Delete an event by its _id (admin-only, JWT required).
     */
    delete: async (id) => {
        const { data } = await api.delete(`/events/${id}`);
        return data;
    },
};

export default eventService;
