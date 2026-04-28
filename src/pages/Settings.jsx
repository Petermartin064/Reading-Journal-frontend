import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuthStore();
  
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    
    const result = await updateProfile(profileForm);
    if (result.success) {
      setProfileSuccess('Profile updated successfully!');
    } else {
      setProfileError(result.error);
    }
    setProfileLoading(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const result = await changePassword({
      old_password: passwordForm.old_password,
      new_password: passwordForm.new_password,
    });
    
    if (result.success) {
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } else {
      setPasswordError(result.error);
    }
    setPasswordLoading(false);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-serif text-text-primary mb-1">Account Settings</h1>
        <p className="text-text-muted text-sm">Manage your profile and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <section className="surface-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <User size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Profile Information</h2>
          </div>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1">Username</label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1">Email Address</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {profileError && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
                <CheckCircle size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Password Section */}
        <section className="surface-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-text-primary">Security</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-muted mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-green-500 text-sm mt-2">
                <CheckCircle size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              {passwordLoading ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Settings;
