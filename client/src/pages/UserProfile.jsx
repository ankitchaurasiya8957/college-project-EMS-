import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Lock, Info, ArrowRight, Edit2, ArrowLeft, Camera, Trash2, Loader2, CheckCircle } from 'lucide-react';

const UserProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);     // Current photo data URL
  const [newPhoto, setNewPhoto] = useState(undefined);         // undefined = no change, null = remove, string = new photo
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setName(user.name);
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user, navigate]);

  // Handle file selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    setError('');

    // Convert to base64 data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setProfilePhoto(dataUrl);
      setNewPhoto(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setNewPhoto(null);  // null signals "remove photo"
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Check if anything changed
  const hasChanges = name !== (user?.name || '') || newPhoto !== undefined;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await updateProfile(name, newPhoto);
      setNewPhoto(undefined);  // Reset "changed" state
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setName(user.name);
      setProfilePhoto(user.profilePhoto || null);
      setNewPhoto(undefined);
    }
    setMessage('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

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
              <div className="relative mb-6 group">
                {/* Avatar Display */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20 relative">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center text-white text-4xl font-bold">
                      {initials}
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer rounded-2xl"
                  >
                    <Camera size={24} className="text-white" />
                  </div>
                </div>

                {/* Edit button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-black/5 text-black/60 hover:text-blue-500 hover:border-blue-200 transition-all cursor-pointer"
                  title="Change profile photo"
                >
                  <Edit2 size={16} />
                </button>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </div>

              {/* Photo action buttons */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-medium text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1"
                >
                  <Camera size={12} />
                  {profilePhoto ? 'Change Photo' : 'Upload Photo'}
                </button>
                {profilePhoto && (
                  <>
                    <span className="text-black/10">|</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-medium text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="text-[10px] text-black/30 mb-4">JPEG, PNG or WebP • Max 2MB</p>
              
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
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-sm font-medium border border-emerald-100 flex items-center gap-2">
                  <CheckCircle size={16} />
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
                    disabled={loading || !hasChanges}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all shadow-lg ${
                      loading || !hasChanges
                        ? 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:opacity-90 shadow-emerald-500/25'
                    }`}
                  >
                    {loading ? (
                      <><Loader2 size={16} className="animate-spin" /> Saving...</>
                    ) : (
                      <>Save Changes <ArrowRight size={16} /></>
                    )}
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
