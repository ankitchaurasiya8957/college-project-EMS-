import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { register, verifyOTP, resendOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            if (!showOTP) {
                const data = await register(name, email, password);
                setShowOTP(true);
                setSuccess(data.message || 'OTP sent! Check your email (or server console).');
            } else {
                await verifyOTP(email, otp);
                navigate('/dashboard');
            }
        } catch (err) {
            if (typeof err === 'string') {
                setError(err);
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await resendOTP(email);
            setSuccess(data.message || 'A new OTP has been sent!');
            setOtp('');
        } catch (err) {
            if (typeof err === 'string') {
                setError(err);
            } else {
                setError(err?.message || 'Failed to resend OTP');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-28 pb-20 min-h-screen">
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <h1 className="font-heading text-4xl md:text-5xl font-semibold text-dark leading-tight mt-4 tracking-tight">
                  Create account
                </h1>
                <p className="text-black/50 text-base mt-4">
                  Join Eventora today
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-black/10 p-8 lg:p-10">
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="flex items-start gap-3 bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-6 border border-emerald-100">
                    <CheckCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm">{success}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {!showOTP ? (
                    <>
                      <div>
                        <label className="text-sm font-medium text-dark block mb-2">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dark block mb-2">Email Address</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                          <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-dark block mb-2">Password</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <div className="bg-emerald-50 p-4 mb-5 rounded-xl border border-emerald-100">
                        <p className="text-sm text-emerald-700">
                          An OTP has been sent to <strong>{email}</strong>. Enter it below to verify your account.
                        </p>
                      </div>
                      <label className="text-sm font-medium text-dark block mb-2">Verification Code (OTP)</label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                        <input
                          type="text"
                          required
                          placeholder="6-digit code"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold tracking-widest text-center"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength="6"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                  >
                    <UserPlus size={16} />
                    {loading ? 'Processing...' : (showOTP ? 'Verify & Complete' : 'Sign Up')}
                  </button>
                </form>

                {showOTP && (
                  <div className="text-center mt-5">
                    <button
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-primary text-sm font-semibold hover:underline transition"
                    >
                      Didn't receive the code? Resend OTP
                    </button>
                  </div>
                )}

                {!showOTP && (
                  <p className="text-center mt-8 text-black/50 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
    );
};

export default Register;
