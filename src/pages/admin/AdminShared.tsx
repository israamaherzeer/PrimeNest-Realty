import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import type { Database } from '../../types/database.types';

export type Property = Database['public']['Tables']['properties']['Row'];
export type Slot = Database['public']['Tables']['viewing_slots']['Row'];
export type Request = Database['public']['Tables']['viewing_requests']['Row'];
export type Amenity = Database['public']['Tables']['amenities']['Row'];
export type PropertyImage = Database['public']['Tables']['property_images']['Row'];

export const emptyProperty = { title: '', description: '', property_type: 'house' as Property['property_type'], listing_type: 'sale' as Property['listing_type'], price: 0, location: '', address: '', bedrooms: 0, bathrooms: 0, area: 0, year_built: null as number | null, featured: false, latitude: null as number | null, longitude: null as number | null, agent_id: null as string | null };
export const emptyAgent = { name: '', email: '', phone: '', photo_url: '', position: '', bio: '', years_experience: 0 };
export const emptySlot = { property_id: '', viewing_date: '', start_time: '', end_time: '', is_available: true };
export const formatTime = (value: string) => value?.slice(0, 5) || '';
export const formatDate = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export const PageHeader = ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
  <div className="admin-page-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>
);
export const Field = ({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) => (
  <label className={`admin-field ${full ? 'admin-field-full' : ''}`}><span>{label}{required && ' *'}</span>{children}</label>
);
export const Alert = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="admin-alert"><span>{message}</span><button onClick={onClose}><X className="w-4 h-4" /></button></div>
);
export const Modal = ({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) => (
  <div className="admin-modal-backdrop"><div className={`admin-modal ${wide ? 'admin-modal-wide' : ''}`}><div className="admin-modal-header"><h3>{title}</h3><button onClick={onClose} className="admin-icon-button"><X className="w-5 h-5" /></button></div><div className="admin-modal-body">{children}</div></div></div>
);
