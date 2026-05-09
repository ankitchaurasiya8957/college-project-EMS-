import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, KeyRound, Lock, AlertCircle, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import SectionTag from '../components/SectionTag';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { forgotPassword, verifyResetOTP, resetPassword } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await forgotPassword(email);
            setStep('otp');
            setSuccess(data.message || 'If an account exists with this email, an OTP has been sent.');
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await verifyResetOTP(email, otp);
            setResetToken(data.resetToken);
            setStep('reset');
            setSuccess('OTP verified! Set your new password below.');
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'OTP verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const data = await resetPassword(resetToken, newPassword);
            setStep('done');
            setSuccess(data.message || 'Password reset successfully!');
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const data = await forgotPassword(email);
            setSuccess('A new OTP has been sent to your email.');
            setOtp('');
        } catch (err) {
            setError(typeof err === 'string' ? err : err?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const stepConfig = {
        email: {
            title: 'Forgot Password',
            subtitle: 'Enter your email to receive a password reset OTP',
            icon: <Mail size={20} />,
        },
        otp: {
            title: 'Verify OTP',
            subtitle: `Enter the 6-digit code sent to ${email}`,
            icon: <KeyRound size={20} />,
        },
        reset: {
            title: 'Set New Password',
            subtitle: 'Choose a strong password for your account',
            icon: <Lock size={20} />,
        },
        done: {
            title: 'Password Reset!',
            subtitle: 'Your password has been updated successfully',
            icon: <ShieldCheck size={20} />,
        },
    };

    const currentStep = stepConfig[step];

    return (
        <div className="pt-28 pb-20 min-h-screen">
          <section className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-10">
                <SectionTag>Account Recovery</SectionTag>
                <h1 className="font-heading text-4xl md:text-5xl font-semibold text-dark leading-tight mt-4 tracking-tight">
                  {currentStep.title}
                </h1>
                <p className="text-black/50 text-base mt-4">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {['email', 'otp', 'reset'].map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step === s ? 'bg-primary text-white scale-110' :
                      ['email', 'otp', 'reset'].indexOf(step) > i || step === 'done' ? 'bg-emerald-500 text-white' :
                      'bg-black/10 text-black/40'
                    }`}>
                      {['email', 'otp', 'reset'].indexOf(step) > i || step === 'done' ? '✓' : i + 1}
                    </div>
                    {i < 2 && (
                      <div className={`w-12 h-0.5 transition-all duration-300 ${
                        ['email', 'otp', 'reset'].indexOf(step) > i || step === 'done' ? 'bg-emerald-500' : 'bg-black/10'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
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

                {/* Step 1: Email */}
                {step === 'email' && (
                  <form onSubmit={handleSendOTP} className="space-y-6">
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
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      <Mail size={16} />
                      {loading ? 'Sending...' : 'Send Reset OTP'}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Verification */}
                {step === 'otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div>
                      <div className="bg-blue-50 p-4 mb-5 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-700">
                          A verification code has been sent to <strong>{email}</strong>. Check your email (or server console if email is not configured).
                        </p>
                      </div>
                      <label className="text-sm font-medium text-dark block mb-2">Verification Code (OTP)</label>
                      <div className="relative">
                        <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                        <input
                          type="text"
                          required
                          placeholder="6-digit code"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold tracking-widest text-center text-lg"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength="6"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      <KeyRound size={16} />
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-primary text-sm font-semibold hover:underline transition"
                      >
                        Didn't receive the code? Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: New Password */}
                {step === 'reset' && (
                  <form onSubmit={handleResetPassword} className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-dark block mb-2">New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          minLength={6}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-dark block mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={6}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all disabled:opacity-50 mt-2"
                    >
                      <ShieldCheck size={16} />
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                )}

                {/* Step 4: Success */}
                {step === 'done' && (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck size={32} className="text-emerald-600" />
                    </div>
                    <p className="text-black/60 text-sm mb-8">
                      Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="w-full flex items-center justify-center gap-2 px-8 py-3.5 bg-primary text-white rounded-full font-medium text-sm hover:bg-primary/90 transition-all"
                    >
                      Go to Login
                    </button>
                  </div>
                )}

                {step !== 'done' && (
                  <p className="text-center mt-8 text-black/50 text-sm">
                    <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                      <ArrowLeft size={14} />
                      Back to Login
                    </Link>
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
    );
};

export default ForgotPassword;
