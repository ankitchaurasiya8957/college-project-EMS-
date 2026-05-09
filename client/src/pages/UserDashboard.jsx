import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axios';
import { Link, useNavigate } from 'react-router-dom';
import { Ticket, XCircle, Calendar, ArrowRight, ExternalLink } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate]);

    const fetchBookings = async () => {
        try {
            const { data } = await api.get('/bookings/my');
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            try {
                await api.delete(`/bookings/${id}`);
                fetchBookings();
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

    return (
        <div className="pt-28 pb-20">
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-heading font-bold uppercase shrink-0">
                {user?.name.charAt(0)}
              </div>
              <div className="text-center sm:text-left">
                <h1 className="font-heading text-3xl md:text-4xl font-semibold text-dark tracking-tight mt-2">
                  Welcome, {user?.name}
                </h1>
                <p className="text-black/50 text-base mt-2 flex items-center justify-center sm:justify-start gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  User Dashboard
                </p>
              </div>
            </div>

            {/* Bookings Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-black/10">
              <h2 className="font-heading text-xl md:text-2xl font-semibold text-dark flex items-center gap-3">
                <Ticket size={22} className="text-primary" />
                My Bookings
              </h2>
              <span className="text-sm text-black/40">{bookings.length} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-black/10">
                <div className="w-20 h-20 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-6">
                  <Ticket size={32} className="text-black/20" />
                </div>
                <p className="text-black/50 text-lg mb-6 font-medium">You haven't booked any events yet.</p>
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
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-2xl border border-black/10 overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-6">
                      {booking.eventId ? (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <h3 className="font-heading font-semibold text-lg text-dark leading-tight">
                              {booking.eventId.title}
                            </h3>
                            <div className="flex flex-col gap-1 items-end shrink-0">
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                booking.status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-200' :
                                'bg-amber-50 text-amber-600 border border-amber-200'
                              }`}>
                                {booking.status}
                              </span>
                              {booking.status !== 'cancelled' && (
                                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                                  booking.paymentStatus === 'paid' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-black/5 text-black/50 border border-black/10'
                                }`}>
                                  {booking.paymentStatus.replace('_', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2 text-sm text-black/50 mb-4">
                            <p className="flex items-center gap-2">
                              <Calendar size={14} className="text-black/30" />
                              {new Date(booking.eventId.date).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="text-dark font-medium">Amount:</span>{' '}
                              {booking.amount === 0 ? <span className="text-emerald-500 font-medium">Free</span> : `₹${booking.amount}`}
                            </p>
                            <p>
                              <span className="text-dark font-medium">Requested:</span>{' '}
                              {new Date(booking.bookedAt).toLocaleDateString()}
                            </p>
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
                ))}
              </div>
            )}
          </section>
        </div>
    );
};

export default UserDashboard;
