import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { XCircle, Home, LayoutDashboard, RefreshCw, AlertTriangle } from 'lucide-react';

const PaymentFailed = () => {
    const location = useLocation();
    const { error, eventTitle, eventId } = location.state || {};

    return (
        <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-12">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl border border-black/10 overflow-hidden shadow-xl">
              {/* Error Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-8">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={40} className="text-white" />
                </div>
                <h1 className="font-heading text-2xl md:text-3xl font-semibold text-white tracking-tight">
                  Payment Failed
                </h1>
                {eventTitle && (
                  <p className="text-white/80 text-sm mt-2">
                    Booking for "{eventTitle}" could not be completed.
                  </p>
                )}
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                    <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <p className="text-black/50 text-sm mb-6 leading-relaxed">
                  We couldn't process your payment. No amount has been deducted from your account.
                  Please try again or contact support if the issue persists.
                </p>

                <div className="space-y-3">
                  {eventId && (
                    <Link
                      to={`/events/${eventId}`}
                      className="flex items-center justify-center gap-2 w-full px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                    >
                      <RefreshCw size={16} />
                      Try Again
                    </Link>
                  )}
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                  >
                    <Home size={16} />
                    Return to Events
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center gap-2 w-full px-8 py-3.5 border border-black/10 text-dark rounded-full font-medium text-sm hover:bg-black/5 transition-all"
                  >
                    <LayoutDashboard size={16} />
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

export default PaymentFailed;
