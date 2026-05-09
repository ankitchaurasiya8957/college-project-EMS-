import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Ticket, Home } from 'lucide-react';

const PaymentSuccess = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl border border-black/10 p-10 lg:p-12">
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-emerald-500" />
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-semibold text-dark tracking-tight mb-4">
                Booking Confirmed!
              </h1>
              <p className="text-black/50 text-base mb-8 leading-relaxed">
                Your ticket has been booked successfully. A confirmation email has been sent to your registered email address.
              </p>
              <div className="space-y-4">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                >
                  <Ticket size={16} />
                  View My Tickets
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
    );
};

export default PaymentSuccess;
