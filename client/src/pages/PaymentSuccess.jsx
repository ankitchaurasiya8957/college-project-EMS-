import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Ticket, Home, Copy, IndianRupee, Calendar, CreditCard } from 'lucide-react';

const PaymentSuccess = () => {
    const location = useLocation();
    const { booking, payment, eventTitle, isFree } = location.state || {};

    const copyBookingId = () => {
        if (booking?.bookingId) {
            navigator.clipboard.writeText(booking.bookingId);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
          <div className="max-w-lg w-full text-center">
            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xl">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  {isFree ? 'Registration Confirmed!' : 'Payment Successful!'}
                </h1>
                <p className="text-white/80 text-sm mt-2">
                  {eventTitle ? `Your booking for "${eventTitle}" is confirmed.` : 'Your booking has been confirmed.'}
                </p>
              </div>

              {/* Booking Details */}
              <div className="p-6">
                {booking && (
                  <div className="bg-black/[0.02] rounded-xl p-5 mb-6 text-left">
                    <h3 className="font-heading font-semibold text-dark text-sm uppercase tracking-wider mb-3">Booking Details</h3>
                    <div className="space-y-3 text-sm">
                      {booking.bookingId && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/50">Booking ID</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-dark">{booking.bookingId}</span>
                            <button onClick={copyBookingId} className="text-black/30 hover:text-primary transition-colors" title="Copy">
                              <Copy size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-black/50">Type</span>
                        <span className="font-medium text-dark capitalize">{booking.bookingType || 'Booking'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-black/50">Status</span>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase">
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-black/50">Amount</span>
                        <span className="font-semibold text-dark flex items-center gap-0.5">
                          {booking.amount === 0 ? (
                            <span className="text-emerald-500">Free</span>
                          ) : (
                            <><IndianRupee size={14} />{booking.amount}</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Details (for paid events) */}
                {payment && (
                  <div className="bg-blue-50/50 rounded-xl p-5 mb-6 text-left border border-blue-100">
                    <h3 className="font-heading font-semibold text-dark text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CreditCard size={14} className="text-blue-500" /> Payment Info
                    </h3>
                    <div className="space-y-3 text-sm">
                      {payment.transactionId && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/50">Transaction ID</span>
                          <span className="font-mono font-medium text-dark text-xs">{payment.transactionId}</span>
                        </div>
                      )}
                      {payment.paymentMethod && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/50">Payment Method</span>
                          <span className="font-medium text-dark uppercase text-xs">{payment.paymentMethod}</span>
                        </div>
                      )}
                      {payment.paidAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-black/50">Paid At</span>
                          <span className="text-dark text-xs">{new Date(payment.paidAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-black/50 text-sm mb-6 leading-relaxed">
                  A confirmation email has been sent to your registered email address.
                </p>

                <div className="space-y-3">
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 w-full px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                  >
                    <Ticket size={16} />
                    View My Bookings
                  </Link>
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full px-8 py-3.5 border border-black/10 text-dark rounded-full font-medium text-sm hover:bg-black/5 transition-all"
                  >
                    <Home size={16} />
                    Discover More Events
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default PaymentSuccess;
