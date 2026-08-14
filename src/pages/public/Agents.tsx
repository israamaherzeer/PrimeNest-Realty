import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import './Agents.css';

type Agent = Database['public']['Tables']['agents']['Row'];

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAgents(data);
      } else {
        setAgents([]);
      }
      setLoading(false);
    };

    fetchAgents();
  }, []);

  useEffect(() => {
    if (!loading && agents.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from('.fade-up', {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, agents]);

  return (
    <div className="agents-page" ref={containerRef}>
      <div className="agents-header fade-up">
        <h1 className="agents-title">Our Expert Agents</h1>
        <p className="agents-subtitle">
          Meet the dedicated professionals who will guide you through your real estate journey with expertise and care.
        </p>
      </div>

      {loading ? (
        <div className="agents-loading">
          <div className="agents-spinner"></div>
        </div>
      ) : (
        <div className="agents-grid">
          {agents.map((agent) => (
            <article key={agent.id} className="fade-up bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              {agent.photo_url ? (
                <img src={agent.photo_url} alt={agent.name} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-400">No Photo</div>
              )}
              <div className="p-6">
                <h2 className="text-xl font-bold text-primary">{agent.name}</h2>
                <p className="text-gold font-medium mt-1">{agent.position || 'Real Estate Agent'}</p>
                <p className="text-sm text-gray-600 mt-3 line-clamp-3">{agent.bio || 'Contact our team for more information.'}</p>
                <div className="mt-4 text-sm text-gray-500">{agent.years_experience} years of experience</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Agents;
