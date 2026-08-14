import { useEffect, useState } from 'react';
import { Building, LayoutDashboard, Home, Calendar, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useLocation, useNavigate, Routes, Route, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Overview } from './Overview';
import { PropertiesManagement } from './Properties';
import { SlotsManagement } from './Slots';
import { ViewingRequests } from './Requests';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      if (mounted) setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-spinner" />
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Properties', path: '/admin/properties', icon: Home },
    { name: 'Viewing Slots', path: '/admin/slots', icon: Calendar },
    { name: 'Requests', path: '/admin/requests', icon: MessageSquare },
  ];

  const closeMobileSidebar = () => {
    if (window.innerWidth <= 760) setIsSidebarOpen(false);
  };

  return (
    <div className="admin-dashboard-container">
      <aside className={`admin-dashboard-sidebar ${isSidebarOpen ? 'admin-dashboard-sidebar-open' : 'admin-dashboard-sidebar-closed'}`}>
        <div className="admin-dashboard-logo-container">
          <Link to="/" className="admin-dashboard-logo-link">
            <Building className="admin-dashboard-logo-icon" />
            <span className="admin-dashboard-logo-text">
              PrimeNest<span className="admin-dashboard-logo-text-highlight">Admin</span>
            </span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="admin-mobile-close"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="admin-dashboard-nav">
          {navItems.map(item => (
            <Link
              key={item.name}
              to={item.path}
              onClick={closeMobileSidebar}
              className={`admin-dashboard-nav-item ${location.pathname === item.path ? 'admin-dashboard-nav-item-active' : 'admin-dashboard-nav-item-inactive'}`}
            >
              <item.icon className="admin-dashboard-nav-icon" />
              <span className="admin-dashboard-nav-text">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="admin-dashboard-logout-container">
          <button onClick={handleLogout} className="admin-dashboard-logout-btn">
            <LogOut className="admin-dashboard-nav-icon" />
            <span className="admin-dashboard-nav-text">Logout</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          className="admin-sidebar-backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close admin menu"
        />
      )}

      <div className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div className="admin-header-title-group">
            <p className="admin-header-eyebrow">PrimeNest Realty</p>
            <h1>Administration</h1>
          </div>

          <div className="admin-dashboard-user-info">
            <div className="admin-dashboard-user-name">Admin User</div>
            <div className="admin-dashboard-user-avatar">A</div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(v => !v)}
            className="admin-dashboard-toggle-btn"
            aria-label="Toggle sidebar"
            aria-expanded={isSidebarOpen}
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <main className="admin-dashboard-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/properties" element={<PropertiesManagement />} />
            <Route path="/slots" element={<SlotsManagement />} />
            <Route path="/requests" element={<ViewingRequests />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
