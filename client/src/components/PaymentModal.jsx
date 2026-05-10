import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { CreditCard, Shield, Loader2, XCircle, IndianRupee, CheckCircle, Zap, Smartphone, QrCode, Copy, Check, RefreshCw, ArrowLeft } from 'lucide-react';

/* ──────────────────────────────────────────────
   QR Code URL Generator — Uses api.qrserver.com
   Returns a URL for a real, scannable QR image.
   Zero external dependencies required.
   ────────────────────────────────────────────── */
function generateQRImageUrl(text, size = 280) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=10`;
}

/**
 * PaymentModal — Opens Razorpay checkout and handles payment verification.
 * Now includes UPI payment with QR code option.
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
    const [step, setStep] = useState('confirm'); // confirm → method → upi-qr → processing → success/error
    const [paymentMethod, setPaymentMethod] = useState(null); // 'upi' | 'card'
    const [upiData, setUpiData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [copied, setCopied] = useState(false);
    const [qrImage, setQrImage] = useState('');
    const [pollTimer, setPollTimer] = useState(null);
    const [countdown, setCountdown] = useState(600); // 10 min countdown
    const countdownRef = useRef(null);
    const pollRef = useRef(null);

    const isFree = event.ticketPrice === 0;

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            if (countdownRef.current) clearInterval(countdownRef.current);
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, []);

    // Start countdown when on QR screen
    useEffect(() => {
        if (step === 'upi-qr') {
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        setError('Payment session expired. Please try again.');
                        setStep('error');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(countdownRef.current);
        }
    }, [step]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const copyUpiId = () => {
        if (upiData?.upiId) {
            navigator.clipboard.writeText(upiData.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    // Create order on backend
    const createPaymentOrder = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await paymentService.createOrder(event._id, bookingType);
            if (data.isFree) {
                setStep('success');
                setTimeout(() => {
                    if (onSuccess) onSuccess(data.booking);
                    navigate('/payment-success', {
                        state: { booking: data.booking, isFree: true, eventTitle: event.title }
                    });
                }, 1500);
                return null;
            }
            setOrderData(data);
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create payment order');
            setStep('error');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Handle method selection
    const handleSelectMethod = async (method) => {
        setPaymentMethod(method);
        setLoading(true);

        // Create the order first if not already created
        let order = orderData;
        if (!order) {
            order = await createPaymentOrder();
            if (!order) return;
        }

        if (method === 'upi') {
            await handleUpiFlow(order);
        } else {
            handleRazorpayCheckout(order);
        }
    };

    // UPI Flow — generate QR
    const handleUpiFlow = async (order) => {
        try {
            const data = await paymentService.generateUpiQr(order.orderId, order.amount);
            setUpiData(data);
            setQrImage(generateQRImageUrl(data.upiString, 280));
            setStep('upi-qr');
            setCountdown(600);

            // Start polling for payment status
            startPaymentPolling(order);
        } catch (err) {
            setError('Failed to generate UPI QR code. Try Card/Netbanking instead.');
            setStep('error');
        } finally {
            setLoading(false);
        }
    };

    // Poll Razorpay order status to detect UPI payment completion
    const startPaymentPolling = (order) => {
        if (pollRef.current) clearInterval(pollRef.current);
        // We can't poll Razorpay directly from frontend, so we'll rely on
        // the user clicking "I've Paid" or using Razorpay checkout for UPI
    };

    // Launch Razorpay checkout (for card/netbanking or UPI via Razorpay)
    const handleRazorpayCheckout = (order, preferredMethod) => {
        const options = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: 'Eventora',
            description: `${bookingType === 'participation' ? 'Participation' : 'Booking'}: ${order.eventTitle}`,
            order_id: order.orderId,
            prefill: {
                name: order.userName,
                email: order.userEmail,
            },
            theme: { color: '#6366f1' },
            handler: async (response) => {
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
                            state: { booking: verifyData.booking, payment: verifyData.payment, eventTitle: event.title }
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
                    setStep('method');
                },
            },
        };

        // Note: Do NOT restrict to UPI-only via config.display in test mode —
        // it causes 'No appropriate payment method found'. Open normally;
        // all methods including UPI are shown by default in Razorpay checkout.

        if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setError(response.error.description || 'Payment failed');
                setStep('error');
            });
            rzp.open();
            setStep('processing');
        } else {
            setError('Razorpay SDK not loaded. Please refresh the page.');
            setStep('error');
        }
        setLoading(false);
    };

    // Handle "Pay via UPI App" — opens Razorpay with UPI method
    const handlePayViaUpiApp = () => {
        if (orderData) {
            handleRazorpayCheckout(orderData, 'upi');
        }
    };

    // Legacy direct flow for free events
    const handleFreeBooking = async () => {
        setLoading(true);
        setStep('processing');
        await createPaymentOrder();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }}>
            <div className="bg-white rounded-2xl border border-black/10 w-full max-w-md shadow-2xl overflow-hidden" style={{ animation: 'slideUp 0.3s ease-out' }}>

                {/* Header */}
                <div className="p-6 border-b border-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {(step === 'method' || step === 'upi-qr') && (
                                <button
                                    onClick={() => { setStep(step === 'upi-qr' ? 'method' : 'confirm'); setError(''); }}
                                    className="text-black/40 hover:text-dark transition-colors"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                            )}
                            <h3 className="font-heading text-xl font-semibold text-dark">
                                {step === 'upi-qr' ? 'Scan & Pay via UPI' :
                                    step === 'method' ? 'Choose Payment Method' :
                                        isFree ? 'Confirm Registration' : 'Complete Payment'}
                            </h3>
                        </div>
                        <button onClick={onClose} className="text-black/40 hover:text-dark transition-colors">
                            <XCircle size={22} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">

                    {/* ═══ Step: Confirm ═══ */}
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
                                    <Smartphone size={14} className="text-blue-500" />
                                    <span>UPI / Card / Netbanking</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={isFree ? handleFreeBooking : () => setStep('method')}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full font-semibold text-sm transition-all bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                                ) : isFree ? (
                                    <><Zap size={18} /> Confirm Free Registration</>
                                ) : (
                                    <><CreditCard size={18} /> Proceed to Pay ₹{event.ticketPrice}</>
                                )}
                            </button>
                        </div>
                    )}

                    {/* ═══ Step: Choose Payment Method ═══ */}
                    {step === 'method' && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* Amount Badge */}
                            <div className="text-center mb-6">
                                <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-lg">
                                    <IndianRupee size={18} />{event.ticketPrice}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {/* UPI Option */}
                                <button
                                    onClick={() => handleSelectMethod('upi')}
                                    disabled={loading}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-black/10 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group disabled:opacity-50"
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #4A7CFF 0%, #8B5CF6 100%)' }}>
                                        <Smartphone size={22} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-dark text-sm">UPI Payment</span>
                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Recommended</span>
                                        </div>
                                        <p className="text-xs text-black/50 mt-1">Pay using GPay, PhonePe, Paytm or scan QR code</p>
                                    </div>
                                    <QrCode size={20} className="text-black/20 group-hover:text-indigo-400 transition-colors mt-1 shrink-0" />
                                </button>

                                {/* Card / Netbanking Option */}
                                <button
                                    onClick={() => handleSelectMethod('card')}
                                    disabled={loading}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl border-2 border-black/10 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-left group disabled:opacity-50"
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)' }}>
                                        <CreditCard size={22} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-semibold text-dark text-sm">Card / Netbanking</span>
                                        <p className="text-xs text-black/50 mt-1">Credit card, debit card or internet banking</p>
                                    </div>
                                </button>
                            </div>

                            {loading && (
                                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-indigo-500">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Creating payment order...</span>
                                </div>
                            )}

                            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-black/30">
                                <Shield size={12} className="text-emerald-400" />
                                <span>100% Secure — Powered by Razorpay</span>
                            </div>
                        </div>
                    )}

                    {/* ═══ Step: UPI QR Code ═══ */}
                    {step === 'upi-qr' && upiData && (
                        <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            {/* QR Code Display */}
                            <div className="flex flex-col items-center">
                                <div className="relative p-4 bg-white rounded-2xl border-2 border-indigo-100 shadow-lg shadow-indigo-500/10 mb-4">
                                    <img
                                        src={qrImage}
                                        alt="UPI QR Code"
                                        className="w-56 h-56 rounded-lg"
                                    />
                                    {/* UPI Logo overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-indigo-100">
                                            <span className="text-indigo-600 font-bold text-xs">UPI</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-center gap-1 text-xl font-bold text-dark mb-1">
                                    <IndianRupee size={18} />{upiData.amount}
                                </div>
                                <p className="text-xs text-black/40 mb-4">Scan with any UPI app to pay</p>

                                {/* Timer */}
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium mb-4">
                                    <RefreshCw size={12} className={countdown <= 60 ? 'animate-spin' : ''} />
                                    Expires in {formatTime(countdown)}
                                </div>

                                {/* UPI ID Copy */}
                                <div className="w-full p-3 rounded-xl bg-black/[0.03] border border-black/5 mb-4">
                                    <p className="text-[10px] text-black/40 uppercase tracking-wider font-medium mb-1.5">UPI ID</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-mono font-medium text-dark">{upiData.upiId}</span>
                                        <button
                                            onClick={copyUpiId}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-medium hover:bg-indigo-100 transition-colors"
                                        >
                                            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                        </button>
                                    </div>
                                </div>

                                {/* Divider with OR */}
                                <div className="w-full flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-px bg-black/10" />
                                    <span className="text-xs text-black/30 font-medium">OR</span>
                                    <div className="flex-1 h-px bg-black/10" />
                                </div>

                                {/* Pay via UPI App button */}
                                <button
                                    onClick={handlePayViaUpiApp}
                                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full font-semibold text-sm transition-all bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                                >
                                    <Smartphone size={16} />
                                    Pay ₹{upiData.amount} via UPI App
                                </button>

                                {/* UPI Apps row */}
                                <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-black/30 font-medium">
                                    <span>GPay</span>
                                    <span className="w-px h-3 bg-black/10" />
                                    <span>PhonePe</span>
                                    <span className="w-px h-3 bg-black/10" />
                                    <span>Paytm</span>
                                    <span className="w-px h-3 bg-black/10" />
                                    <span>BHIM</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══ Step: Processing ═══ */}
                    {step === 'processing' && (
                        <div className="text-center py-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                                <Loader2 size={28} className="text-indigo-500 animate-spin" />
                            </div>
                            <h4 className="font-heading text-lg font-semibold text-dark mb-2">Processing Payment</h4>
                            <p className="text-sm text-black/50">Please complete the payment in the Razorpay window...</p>
                        </div>
                    )}

                    {/* ═══ Step: Success ═══ */}
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

                    {/* ═══ Step: Error ═══ */}
                    {step === 'error' && (
                        <div className="text-center py-8" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                                <XCircle size={28} className="text-red-500" />
                            </div>
                            <h4 className="font-heading text-lg font-semibold text-dark mb-2">Payment Failed</h4>
                            <p className="text-sm text-red-500 mb-4 bg-red-50 p-3 rounded-xl">{error}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('confirm'); setError(''); setOrderData(null); }}
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
                {(step === 'confirm' || step === 'method') && (
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
