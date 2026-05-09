import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventService from '../services/eventService';
import bookingService from '../services/bookingService';
import { AuthContext } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Ticket, Sparkles, Share2, Heart, CreditCard, Zap, Shield, Clock } from 'lucide-react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [bookingType, setBookingType] = useState('booking');
    const [hasBooked, setHasBooked] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await eventService.getById(id);
                setEvent(data);

                if (user) {
                    const myBookings = await bookingService.getMine();
                    const currentUserId = user._id || user.id;
                    const alreadyBooked = myBookings.some(b => {
                        const isThisEvent = (b.eventId?._id === id || b.eventId === id);
                        const isActive = (b.status === 'confirmed' || b.status === 'pending');
                        const isThisUser = (b.userId?._id === currentUserId || b.userId === currentUserId);
                        return isThisEvent && isActive && isThisUser;
                    });
                    setHasBooked(alreadyBooked);
                }
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, user]);

    const handleBookAction = (type) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingType(type);
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (booking) => {
        // Re-fetch event to update seat count and hasBooked state
        try {
            const data = await eventService.getById(id);
            setEvent(data);
            setHasBooked(true);
        } catch (err) {}
    };

    if (loading) return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
    if (error && !event) return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">{error || 'Event not found'}</p>
      </div>
    );

    const isSoldOut = event.availableSeats <= 0;
    const isFree = event.ticketPrice === 0;
    const seatsPercent = (event.availableSeats / event.totalSeats) * 100;

    const features = [
      { icon: Shield, title: 'Secure Payment', desc: 'Payments processed via Razorpay with bank-grade encryption.' },
      { icon: Zap, title: 'Instant Confirmation', desc: 'Get immediate booking confirmation after successful payment.' },
      { icon: Clock, title: 'Real-time Updates', desc: 'Track your booking status live from your dashboard.' },
    ];

    return (
        <div className="pt-20">
          {/* Hero Image */}
          <section className="relative h-[50vh] lg:h-[60vh] min-h-[400px]">
            {event.image ? (
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-dark to-dark/70 flex items-center justify-center">
                <span className="text-white/20 text-8xl font-heading font-bold uppercase tracking-widest">{event.category}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
              <div className="flex gap-2">
                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <Share2 size={20} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <Heart size={20} />
                </button>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left - Details */}
              <div className="lg:col-span-2">
                <Link to="/" className="inline-flex items-center gap-2 text-sm text-black/50 hover:text-primary transition-colors mb-6">
                  <ArrowLeft size={16} /> Back to events
                </Link>

                <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                  {event.category}
                </span>

                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-semibold text-dark tracking-tight">
                  {event.title}
                </h1>
                <div className="flex items-center gap-2 mt-3 text-black/50">
                  <MapPin size={16} />
                  <span className="text-sm">{event.location}</span>
                </div>

                {/* Features Row */}
                <div className="flex flex-wrap items-center gap-6 mt-8 py-6 border-y border-black/10">
                  <div className="flex items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    <span className="text-sm font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    <span className="text-sm font-medium">{event.availableSeats}/{event.totalSeats} Seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ticket size={20} className="text-primary" />
                    <span className="text-sm font-medium">{isFree ? 'Free Entry' : `₹${event.ticketPrice}`}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <h3 className="font-heading text-xl font-semibold text-dark mb-4">About this event</h3>
                  <p className="text-black/50 leading-relaxed">{event.description}</p>
                  <p className="text-black/50 leading-relaxed mt-4">
                    Join us for an incredible experience! This event offers a unique opportunity to connect, learn, and celebrate.
                    Secure your spot today with our secure payment system and get instant booking confirmation.
                  </p>
                </div>

                {/* Key Features */}
                <div className="mt-12">
                  <h3 className="font-heading text-xl font-semibold text-dark mb-6">Booking Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-sm transition-all">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <feature.icon size={18} className="text-primary" />
                        </div>
                        <h4 className="font-medium text-dark mb-2">{feature.title}</h4>
                        <p className="text-sm text-black/50">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-white rounded-2xl border border-black/10 p-8">
                  <div className="mb-6">
                    <p className="text-3xl font-heading font-semibold text-dark">
                      {isFree ? <span className="text-emerald-500">Free</span> : `₹${event.ticketPrice}`}
                    </p>
                    <p className="text-sm text-black/50 mt-1">Ticket price</p>
                  </div>

                  {/* Seats Bar */}
                  {!hasBooked && (
                    <div className="mb-6">
                      <div className="w-full bg-black/5 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all ${seatsPercent > 30 ? 'bg-primary' : seatsPercent > 10 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${seatsPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-black/50">
                        {event.availableSeats} of {event.totalSeats} seats remaining
                        {seatsPercent <= 20 && event.availableSeats > 0 && (
                          <span className="text-red-500 font-medium ml-1">— Filling fast!</span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {/* Book Now Button */}
                    <button
                      onClick={() => handleBookAction('booking')}
                      disabled={isSoldOut || hasBooked}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm transition-all ${
                        isSoldOut || hasBooked
                          ? 'bg-black/10 text-black/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                      }`}
                    >
                      {hasBooked ? (
                        <>✓ Booked</>
                      ) : isSoldOut ? (
                        <>Sold Out</>
                      ) : (
                        <>{isFree ? <Zap size={16} /> : <CreditCard size={16} />} {isFree ? 'Register Free' : `Book Now — ₹${event.ticketPrice}`}</>
                      )}
                    </button>

                    {/* Participate Button */}
                    {!isSoldOut && !hasBooked && (
                      <button
                        onClick={() => handleBookAction('participation')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm transition-all border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Sparkles size={16} /> Participate
                      </button>
                    )}
                  </div>

                  {/* Payment methods */}
                  {!isFree && !isSoldOut && (
                    <div className="mt-4 flex items-center justify-center gap-3 text-[10px] text-black/30 font-medium uppercase tracking-wider">
                      <span>UPI</span>
                      <span className="w-px h-3 bg-black/10" />
                      <span>Cards</span>
                      <span className="w-px h-3 bg-black/10" />
                      <span>NetBanking</span>
                      <span className="w-px h-3 bg-black/10" />
                      <span>Wallet</span>
                    </div>
                  )}

                  {/* Organizer Info */}
                  <div className="mt-8 pt-6 border-t border-black/10">
                    <p className="text-sm text-black/50 mb-2">Organized by</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">E</span>
                      </div>
                      <div>
                        <p className="font-medium text-dark text-sm">{event.createdBy?.name || 'Eventora Organizer'}</p>
                        <p className="text-xs text-black/50">{event.createdBy?.email || 'hello@eventora.com'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Payment Modal */}
          {showPaymentModal && (
            <PaymentModal
              event={event}
              user={user}
              bookingType={bookingType}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={handlePaymentSuccess}
            />
          )}
        </div>
    );
};

export default EventDetail;
