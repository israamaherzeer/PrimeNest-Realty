import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw, Users, Home, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';


export const Overview = () => {
  const [stats, setStats] = useState({
    properties: 0, agents: 0, slots: 0, pending: 0, confirmed: 0, cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    const [properties, agents, slots, pending, confirmed, cancelled] = await Promise.all([
      supabase.from('properties').select('id', { count: 'exact', head: true }),
      supabase.from('agents').select('id', { count: 'exact', head: true }),
      supabase.from('viewing_slots').select('id', { count: 'exact', head: true }).eq('is_available', true),
      supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('status', 'confirmed'),
      supabase.from('viewing_requests').select('id', { count: 'exact', head: true }).eq('status', 'cancelled')
    ]);
    setStats({
      properties: properties.count ?? 0, agents: agents.count ?? 0, slots: slots.count ?? 0,
      pending: pending.count ?? 0, confirmed: confirmed.count ?? 0, cancelled: cancelled.count ?? 0
    });
    setLoading(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const cards = [
    { title: 'Total Properties', value: stats.properties, icon: Home, color: 'bg-blue-500' },
    { title: 'Total Agents', value: stats.agents, icon: Users, color: 'bg-green-500' },
    { title: 'Available Viewing Slots', value: stats.slots, icon: Calendar, color: 'bg-indigo-500' },
    { title: 'Pending Requests', value: stats.pending, icon: MessageSquare, color: 'bg-yellow-500' },
    { title: 'Confirmed Viewings', value: stats.confirmed, icon: CheckCircle, color: 'bg-purple-500' },
    { title: 'Cancelled Requests', value: stats.cancelled, icon: XCircle, color: 'bg-red-500' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="admin-overview-title !mb-0">Dashboard Overview</h2>
        <button onClick={fetchStats} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>
      <div className="admin-overview-stats-grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3">
        {cards.map((stat) => (
          <div key={stat.title} className="admin-overview-stat-card">
            <div className={`admin-overview-stat-icon-wrapper ${stat.color}`}><stat.icon className="admin-overview-stat-icon" /></div>
            <div>
              <div className="admin-overview-stat-title">{stat.title}</div>
              <div className="admin-overview-stat-value">{loading ? '—' : stat.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="admin-overview-welcome-card">
        <h3 className="admin-overview-welcome-title">Welcome to PrimeNest Admin</h3>
        <p className="admin-overview-welcome-text">Manage the existing properties, agents, viewing slots, amenities, images and customer requests directly from Supabase.</p>
      </div>
    </div>
  );
};

