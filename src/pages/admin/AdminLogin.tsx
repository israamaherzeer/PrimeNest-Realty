import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Building, Lock, Mail } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log('LOGIN ERROR:', error);
      setError(error.message);
    } else if (data.user) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profile?.role === 'admin') {
        navigate('/admin');
      } else {
        await supabase.auth.signOut();
        setError('Access denied. Admin privileges required.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-header">
        <Building className="admin-login-icon" />
        <h2 className="admin-login-title">
          Admin Portal
        </h2>
        <p className="admin-login-subtitle">
          Sign in to manage PrimeNest Realty
        </p>
      </div>

      <div className="admin-login-form-container">
        <div className="admin-login-card">
          <form className="admin-login-form" onSubmit={handleLogin}>
            {error && (
              <div className="admin-login-error">
                {error}
              </div>
            )}

            <div>
              <label className="admin-login-label">Email address</label>
              <div className="admin-login-input-wrapper">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="admin-login-input"
                />
                <Mail className="admin-login-input-icon" />
              </div>
            </div>

            <div>
              <label className="admin-login-label">Password</label>
              <div className="admin-login-input-wrapper">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="admin-login-input"
                />
                <Lock className="admin-login-input-icon" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="admin-login-btn"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
