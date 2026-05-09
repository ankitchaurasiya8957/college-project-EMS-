import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Ticket, Sparkles, Share2, Heart } from 'lucide-react';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch (err) {
                setError('Failed to load event details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleBooking = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        setBookingLoading(true);
        setError('');
        setSuccessMsg('');

        try {
            if (!showOTP) {
                await api.post('/bookings/send-otp');
                setShowOTP(true);
                setSuccessMsg('OTP sent to your email. Please verify to confirm booking.');
            } else {
                await api.post('/bookings', { eventId: event._id, otp });
                setSuccessMsg('Booking requested! Awaiting admin confirmation.');
                setShowOTP(false);
                setEvent({ ...event, availableSeats: event.availableSeats - 1 });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking failed');
        } finally {
            setBookingLoading(false);
        }
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

    const features = [
      { title: 'OTP Verified', desc: 'Your booking is secured with two-factor OTP verification.' },
      { title: 'Admin Confirmed', desc: 'Each booking is reviewed and confirmed by the organizer.' },
      { title: 'Instant Updates', desc: 'Get real-time booking status updates on your dashboard.' },
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
                    <span className="text-sm font-medium">{event.ticketPrice === 0 ? 'Free Entry' : `₹${event.ticketPrice}`}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <h3 className="font-heading text-xl font-semibold text-dark mb-4">About this event</h3>
                  <p className="text-black/50 leading-relaxed">{event.description}</p>
                  <p className="text-black/50 leading-relaxed mt-4">
                    Join us for an incredible experience! This event offers a unique opportunity to connect, learn, and celebrate.
                    Secure your spot today with our OTP-verified booking system and get your booking confirmed by the organizer.
                  </p>
                </div>

                {/* Key Features */}
                <div className="mt-12">
                  <h3 className="font-heading text-xl font-semibold text-dark mb-6">Booking Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-black/10 hover:border-primary/20 hover:shadow-sm transition-all">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                          <Sparkles size={18} className="text-primary" />
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
                      {event.ticketPrice === 0 ? <span className="text-emerald-500">Free</span> : `₹${event.ticketPrice}`}
                    </p>
                    <p className="text-sm text-black/50 mt-1">Ticket price</p>
                  </div>

                  {/* Seats Bar */}
                  <div className="mb-6">
                    <div className="w-full bg-black/5 rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(event.availableSeats / event.totalSeats) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-black/50">
                      {event.availableSeats} of {event.totalSeats} seats remaining
                    </p>
                  </div>

                  {/* OTP Input */}
                  {showOTP && (
                    <div className="mb-4">
                      <label className="text-sm font-medium text-dark block mb-2">Enter OTP to Confirm</label>
                      <input
                        type="text"
                        required
                        placeholder="6-digit code"
                        className="w-full px-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold tracking-widest text-center text-lg"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <button
                      onClick={handleBooking}
                      disabled={isSoldOut || bookingLoading || (showOTP && !otp)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-medium text-sm transition-all ${
                        isSoldOut || (successMsg && !showOTP)
                          ? 'bg-black/10 text-black/40 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      <Ticket size={16} />
                      {bookingLoading ? 'Processing...' : (showOTP ? 'Verify OTP & Confirm' : (successMsg && !showOTP ? 'Request Sent ✓' : (isSoldOut ? 'Sold Out' : 'Book Now')))}
                    </button>
                  </div>

                  {error && <p className="text-red-500 mt-4 text-center text-sm font-medium bg-red-50 p-3 rounded-xl">{error}</p>}
                  {successMsg && <p className="text-emerald-600 mt-4 text-center text-sm font-medium bg-emerald-50 p-3 rounded-xl">{successMsg}</p>}

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
        </div>
    );
};

export default EventDetail;
