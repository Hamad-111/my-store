import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { User, Lock, Save, Loader } from 'lucide-react';

export default function AdminSettings({ user }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Profile State
  const [profile, setProfile] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
    website: '',
  });

  // Password State
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) getProfile();
    // eslint-disable-next-line
  }, [user]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, website')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({
          username: data.username || '',
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          website: data.website || '',
        });
      }
    } catch (err) {
      console.error('Error in getProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword,
      });

      if (error) throw error;

      setMessage('Password updated successfully!');
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-settings"
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}
    >
      <h2 style={{ marginBottom: '2rem' }}>Account Settings</h2>

      {message && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#d1fae5',
            color: '#065f46',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            borderRadius: '8px',
            marginBottom: '2rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '2rem' }}>
        {/* Profile Section */}
        <div
          className="settings-card"
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '1.5rem',
            }}
          >
            <User className="text-gray-500" />
            <h3 style={{ margin: 0 }}>Profile Information</h3>
          </div>

          <form
            onSubmit={handleProfileUpdate}
            style={{ display: 'grid', gap: '1.5rem' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Email
              </label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, full_name: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={profile.username}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, username: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Avatar URL
              </label>
              <input
                type="text"
                value={profile.avatar_url}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, avatar_url: e.target.value }))
                }
                placeholder="https://example.com/avatar.jpg"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#1f2937',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: 'fit-content',
              }}
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              Save Changes
            </button>
          </form>
        </div>

        {/* Security Section */}
        <div
          className="settings-card"
          style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '1.5rem',
            }}
          >
            <Lock className="text-gray-500" />
            <h3 style={{ margin: 0 }}>Security</h3>
          </div>

          <form
            onSubmit={handlePasswordUpdate}
            style={{ display: 'grid', gap: '1.5rem' }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '500',
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords((p) => ({
                      ...p,
                      confirmPassword: e.target.value,
                    }))
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passwords.newPassword}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor:
                  loading || !passwords.newPassword ? 'not-allowed' : 'pointer',
                width: 'fit-content',
              }}
            >
              {loading ? (
                <Loader size={18} className="animate-spin" />
              ) : (
                <Lock size={18} />
              )}
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
