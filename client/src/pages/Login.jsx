import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, KeyRound } from 'lucide-react';
import SectionTag from '../components/SectionTag';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, verifyOTP } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!showOTP) {
                const data = await login(email, password);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            } else {
                const data = await verifyOTP(email, otp);
                if (data.role === 'admin') navigate('/admin');
                else navigate('/dashboard');
            }
        } catch (err) {
            if (err.needsVerification) {
                setShowOTP(true);
                setError('Account not verified. A new OTP has been sent to your email.');
            } else {
                setError(err.message || err);
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
                <SectionTag>Account</SectionTag>
                <h1 className="font-heading text-4xl md:text-5xl font-semibold text-dark leading-tight mt-4 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-black/50 text-base mt-4">
                  Sign in to your Eventora account
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-black/10 p-8 lg:p-10">
                {error && (
                  <div className="flex items-start gap-3 bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {!showOTP ? (
                    <>
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
                    className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <LogIn size={16} />
                    {loading ? 'Processing...' : (showOTP ? 'Verify OTP & Log In' : 'Sign In')}
                  </button>
                </form>

                <p className="text-center mt-8 text-black/50 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:underline">Sign up</Link>
                </p>
              </div>
            </div>
          </section>
        </div>
    );
};

export default Login;
