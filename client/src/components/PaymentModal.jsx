import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { CreditCard, Shield, Loader2, XCircle, IndianRupee, CheckCircle, Zap } from 'lucide-react';

/**
 * PaymentModal — Opens Razorpay checkout and handles payment verification.
 * Props:
 *   - event: Event object with _id, title, ticketPrice, etc.
 *   - user: Current logged-in user
 *   - bookingType: 'booking' or 'participation'
 *   - onClose: Callback to close modal
 *   - onSuccess: Callback after successful payment
 */
const PaymentModal = ({ event, user, bookingType = 'booking', onClose, onSuccess }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState('confirm'); // confirm → processing → success/error

    const isFree = event.ticketPrice === 0;

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        setStep('processing');

        try {
            // Step 1: Create order on backend
            const orderData = await paymentService.createOrder(event._id, bookingType);

            // If event is free, booking is created directly
            if (orderData.isFree) {
                setStep('success');
                setTimeout(() => {
                    if (onSuccess) onSuccess(orderData.booking);
                    navigate('/payment-success', {
                        state: {
                            booking: orderData.booking,
                            isFree: true,
                            eventTitle: event.title,
                        }
                    });
                }, 1500);
                return;
            }

            // Step 2: Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Eventora',
                description: `${bookingType === 'participation' ? 'Participation' : 'Booking'}: ${orderData.eventTitle}`,
                order_id: orderData.orderId,
                prefill: {
                    name: orderData.userName,
                    email: orderData.userEmail,
                },
                theme: {
                    color: '#6366f1',
                },
                handler: async (response) => {
                    // Step 3: Verify payment on backend
                    try {
                        const verifyData = await paymentService.verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            bookingType,
                        });

                        setStep('success');
                        setTimeout(() => {
                            if (onSuccess) onSuccess(verifyData.booking);
                            navigate('/payment-success', {
                                state: {
                                    booking: verifyData.booking,
                                    payment: verifyData.payment,
                                    eventTitle: event.title,
                                }
                            });
                        }, 1500);
                    } catch (verifyErr) {
                        setError(verifyErr.response?.data?.message || 'Payment verification failed');
                        setStep('error');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setStep('confirm');
                    },
                },
            };

            // Load and open Razorpay
            if (window.Razorpay) {
                const rzp = new window.Razorpay(options);
                rzp.on('payment.failed', (response) => {
                    setError(response.error.description || 'Payment failed');
                    setStep('error');
                });
                rzp.open();
            } else {
                setError('Razorpay SDK not loaded. Please refresh the page.');
                setStep('error');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create payment order';
            setError(msg);
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="bg-white rounded-2xl border border-black/10 w-full max-w-md shadow-2xl overflow-hidden" style={{ animation: 'slideUp 0.3s ease-out' }}>

                {/* Header */}
                <div className="p-6 border-b border-black/5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-heading text-xl font-semibold text-dark">
                            {isFree ? 'Confirm Registration' : 'Complete Payment'}
                        </h3>
                        <button onClick={onClose} className="text-black/40 hover:text-dark transition-colors">
                            <XCircle size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Step: Confirm */}
                    {step === 'confirm' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* Event Summary */}
                            <div className="bg-black/[0.02] rounded-xl p-4 mb-6">
                                <h4 className="font-semibold text-dark text-base mb-2">{event.title}</h4>
                                <div className="space-y-1.5 text-sm text-black/50">
                                    <p>📅 {new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    <p>📍 {event.location}</p>
                                    <p>🏷️ {event.category}</p>
                                    <p>🎫 Type: <span className="font-medium text-dark capitalize">{bookingType}</span></p>
                                </div>
                            </div>

                            {/* Price Display */}
                            <div className="flex items-center justify-between mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                                <span className="text-sm font-medium text-black/60">Amount to pay</span>
                                <span className="text-2xl font-heading font-bold text-dark flex items-center gap-1">
                                    {isFree ? (
                                        <span className="text-emerald-500">Free</span>
                                    ) : (
                                        <><IndianRupee size={20} />{event.ticketPrice}</>
                                    )}
                                </span>
                            </div>

                            {/* Security badges */}
                            <div className="flex items-center gap-4 mb-6 text-xs text-black/40">
                                <div className="flex items-center gap-1.5">
                                    <Shield size={14} className="text-emerald-500" />
                                    <span>Secure Payment</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CreditCard size={14} className="text-blue-500" />
                                    <span>UPI / Card / Netbanking</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handlePayment}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm transition-all bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : isFree ? (
                                    <><Zap size={18} /> Confirm Free Registration</>
                                ) : (
                                    <><CreditCard size={18} /> Pay ₹{event.ticketPrice}</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Step: Processing */}
                    {step === 'processing' && (
                        <div className="text-center py-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                                <Loader2 size={28} className="text-indigo-500 animate-spin" />
                            </div>
                            <h4 className="font-heading text-lg font-semibold text-dark mb-2">Processing Payment</h4>
                            <p className="text-sm text-black/50">Please complete the payment in the Razorpay window...</p>
                        </div>
                    )}

                    {/* Step: Success */}
                    {step === 'success' && (
                        <div className="text-center py-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={28} className="text-emerald-500" />
                            </div>
                            <h4 className="font-heading text-lg font-semibold text-dark mb-2">
                                {isFree ? 'Registered Successfully!' : 'Payment Successful!'}
                            </h4>
                            <p className="text-sm text-black/50">Redirecting to confirmation page...</p>
                        </div>
                    )}

                    {/* Step: Error */}
                    {step === 'error' && (
                        <div className="text-center py-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                <XCircle size={28} className="text-red-500" />
                            </div>
                            <h4 className="font-heading text-lg font-semibold text-dark mb-2">Payment Failed</h4>
                            <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-xl">{error}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('confirm'); setError(''); }}
                                    className="flex-1 px-4 py-3 rounded-full bg-indigo-500 text-white font-medium text-sm hover:bg-indigo-600 transition-all"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 rounded-full border border-black/10 text-dark font-medium text-sm hover:bg-black/5 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'confirm' && (
                    <div className="px-6 py-4 bg-black/[0.02] border-t border-black/5 text-center">
                        <p className="text-xs text-black/30">
                            Powered by <span className="font-semibold">Razorpay</span> — 100% Secure Payments
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
