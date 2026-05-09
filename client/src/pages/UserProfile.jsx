import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Save, ArrowLeft, Shield } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
          className="flex items-center gap-2 text-black/50 hover:text-dark transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-2xl border border-black/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="h-32 bg-gradient-to-r from-primary to-emerald-400" />
          
          <div className="px-8 pb-8 relative">
            {/* Avatar */}
            <div className="absolute -top-16 left-8">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff&size=128&bold=true`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-20">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-heading font-semibold text-dark">{user.name}</h1>
                {user.role === 'admin' && (
                  <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                    <Shield size={12} />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-black/50 flex items-center gap-2 mb-8">
                <Mail size={16} />
                {user.email}
              </p>

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

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-black/10 bg-white text-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40" />
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-black/10 bg-black/5 text-black/50 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-black/40 mt-2">Email address cannot be changed.</p>
                </div>

                <div className="pt-4 border-t border-black/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || name === user.name}
                    className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-medium transition-all ${
                      loading || name === user.name
                        ? 'bg-black/5 text-black/40 cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary/90 hover:shadow-md'
                    }`}
                  >
                    <Save size={18} />
                    {loading ? 'Saving...' : 'Save Changes'}
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
