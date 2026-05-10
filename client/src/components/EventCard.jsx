import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react'
import { getCategoryConfig } from '../utils/categories'

export default function EventCard({ event, featured = false }) {
  const isFree = event.ticketPrice === 0
  const catConfig = getCategoryConfig(event.category)

  return (
    <Link
      to={`/events/${event._id}`}
      className={`group block rounded-2xl border border-black/10 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        featured ? 'shadow-lg' : ''
      }`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-56 lg:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-56 lg:h-64 bg-gradient-to-br from-dark to-dark/80 flex items-center justify-center">
            <span className="text-white/30 text-4xl font-heading font-bold uppercase tracking-widest">
              {event.category || 'Event'}
            </span>
          </div>
        )}
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-medium shadow-md ${
            isFree
              ? 'bg-emerald-500 text-white'
              : 'bg-white text-dark'
          }`}>
            {isFree ? 'FREE' : `₹${event.ticketPrice}`}
          </span>
        </div>
        {featured && (
          <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md">
            <ArrowRight size={18} className="text-dark -rotate-45" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 bg-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: catConfig?.color || 'var(--color-primary)' }}>
              {event.category}
            </span>
            <h3 className="font-heading font-semibold text-lg text-dark leading-tight mt-1">
              {event.title}
            </h3>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center gap-3 text-sm text-dark">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-black/40" />
            <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="w-px h-4 bg-black/10" />
          <div className="flex items-center gap-1.5">
            <MapPin size={14} className="text-black/40" />
            <span className="truncate max-w-[120px]">{event.location}</span>
          </div>
        </div>

        {/* Seats Bar */}
        <div className="mt-4">
          <div className="w-full bg-black/5 rounded-full h-1.5 mb-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-black/40">
              <Users size={12} className="inline mr-1" />
              {event.availableSeats} of {event.totalSeats} seats
            </p>
            {event.availableSeats <= 0 && (
              <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">SEAT FULL</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
