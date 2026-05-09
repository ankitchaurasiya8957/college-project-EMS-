import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, Info, ArrowRight, Edit2, ArrowLeft } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(name);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (user) setName(user.name);
    setMessage('');
    setError('');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-28 pb-12 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
          className="flex items-center gap-2 text-black/40 hover:text-dark transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          {/* Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-emerald-400" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-10 md:p-14">
            
            {/* Left Column: Avatar & Info */}
            <div className="md:col-span-4 flex flex-col items-start">
              <div className="relative mb-6">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-emerald-500/20">
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <button className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-black/5 text-black/60 hover:text-dark transition-all">
                  <Edit2 size={16} />
                </button>
              </div>
              
              <h1 className="text-2xl font-semibold text-gray-900 mb-2 tracking-tight">{user.name}</h1>
              
              {user.role === 'admin' && (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-6">
                  <Shield size={12} />
                  Admin Role
                </div>
              )}

              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mt-2">
                Manage your personal information, security preferences, and account settings from one central dashboard.
              </p>
            </div>

            {/* Right Column: Form */}
            <div className="md:col-span-8 md:pl-10">
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Personal Details</h2>
                <p className="text-sm text-gray-500">Update your account information and how it appears to others.</p>
              </div>

              {message && (
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium border border-emerald-100">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pb-3 text-gray-900 font-medium text-base bg-transparent border-b border-gray-200 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-300"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pb-3 text-gray-500 font-medium text-base bg-transparent border-b border-gray-200 focus:outline-none cursor-not-allowed pr-8"
                    />
                    <Lock size={16} className="absolute right-0 top-1 text-gray-300" />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Info size={14} className="text-amber-500" />
                    <p className="text-xs text-gray-400 font-medium">Email address is managed by your organization.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-8 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="submit"
                    disabled={loading || name === user.name}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg ${
                      loading || name === user.name
                        ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:opacity-90 shadow-emerald-500/25'
                    }`}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                    {!loading && <ArrowRight size={16} />}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
