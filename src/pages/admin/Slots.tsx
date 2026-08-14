import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageHeader, Field, Alert, Modal, emptySlot, formatTime, formatDate } from './AdminShared';
import type { Property, Slot } from './AdminShared';

export const SlotsManagement = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyFilter, setPropertyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [editing, setEditing] = useState<Slot | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptySlot);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [slotsRes, propsRes] = await Promise.all([
      supabase.from('viewing_slots').select('*').order('viewing_date').order('start_time'),
      supabase.from('properties').select('*').order('title')
    ]);
    if (slotsRes.error) setError(slotsRes.error.message); else setSlots(slotsRes.data ?? []);
    if (propsRes.error) setError(propsRes.error.message); else setProperties(propsRes.data ?? []);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = slots.filter(s =>
    (!propertyFilter || s.property_id === propertyFilter) &&
    (!dateFilter || s.viewing_date === dateFilter) &&
    (availabilityFilter === '' || String(s.is_available) === availabilityFilter)
  );

  const openCreate = () => { setEditing(null); setForm(emptySlot); setError(''); setFormOpen(true); };
  const openEdit = (slot: Slot) => { setEditing(slot); setForm({ property_id: slot.property_id, viewing_date: slot.viewing_date, start_time: formatTime(slot.start_time), end_time: formatTime(slot.end_time), is_available: slot.is_available }); setError(''); setFormOpen(true); };

  const saveSlot = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    const payload = { ...form, start_time: form.start_time, end_time: form.end_time };
    const result = editing ? await supabase.from('viewing_slots').update(payload).eq('id', editing.id) : await supabase.from('viewing_slots').insert(payload);
    if (result.error) setError(result.error.message);
    else { await fetchData(); setFormOpen(false); }
    setSaving(false);
  };

  const deleteSlot = async (slot: Slot) => {
    if (!window.confirm(`Delete this viewing slot on ${formatDate(slot.viewing_date)}?`)) return;
    const { error } = await supabase.from('viewing_slots').delete().eq('id', slot.id);
    if (error) setError(error.message); else await fetchData();
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Viewing Slots" description={`${slots.length} slots from Supabase`} action={<button onClick={openCreate} className="admin-primary-btn"><Plus className="w-4 h-4" /> Add Slot</button>} />
      {error && <Alert message={error} onClose={() => setError('')} />}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <select value={propertyFilter} onChange={e => setPropertyFilter(e.target.value)} className="admin-input w-auto"><option value="">All Properties</option>{properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="admin-input w-auto" />
        <select value={availabilityFilter} onChange={e => setAvailabilityFilter(e.target.value)} className="admin-input w-auto"><option value="">All Statuses</option><option value="true">Available</option><option value="false">Booked</option></select>
        <button onClick={() => { setPropertyFilter(''); setDateFilter(''); setAvailabilityFilter(''); }} className="admin-secondary-btn">Clear</button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="admin-data-table">
        <thead><tr><th>Property</th><th>Date</th><th>Start</th><th>End</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{filtered.map(slot => <tr key={slot.id}>
          <td className="font-semibold">{properties.find(p => p.id === slot.property_id)?.title ?? slot.property_id}</td><td>{formatDate(slot.viewing_date)}</td><td>{formatTime(slot.start_time)}</td><td>{formatTime(slot.end_time)}</td>
          <td>{slot.is_available ? <span className="admin-badge admin-badge-green">Available</span> : <span className="admin-badge admin-badge-red">Booked</span>}</td>
          <td className="text-right"><button onClick={() => openEdit(slot)} className="admin-icon-btn" title="Edit slot"><Pencil className="w-4 h-4" /></button>{slot.is_available && <button onClick={() => deleteSlot(slot)} className="admin-icon-btn admin-icon-danger" title="Delete available slot"><Trash2 className="w-4 h-4" /></button>}</td>
        </tr>)}{!filtered.length && <tr><td colSpan={6} className="admin-empty-cell">No viewing slots found.</td></tr>}</tbody>
      </table></div></div>
      {formOpen && <Modal title={editing ? 'Edit Viewing Slot' : 'Add Viewing Slot'} onClose={() => setFormOpen(false)}>
        <form onSubmit={saveSlot} className="space-y-4">
          <Field label="Property" required><select required value={form.property_id} onChange={e => setForm({ ...form, property_id: e.target.value })} className="admin-input"><option value="">Select Property</option>{properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
          <Field label="Viewing Date" required><input type="date" required value={form.viewing_date} onChange={e => setForm({ ...form, viewing_date: e.target.value })} className="admin-input" /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Start Time" required><input type="time" required value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} className="admin-input" /></Field><Field label="End Time" required><input type="time" required value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className="admin-input" /></Field></div>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_available} disabled={Boolean(editing && !editing.is_available)} onChange={e => setForm({ ...form, is_available: e.target.checked })} /> Available for customer booking</label>
          {editing && !editing.is_available && <p className="text-xs text-gray-500">Booked slots stay unavailable. Cancel the associated request to make this original slot available again.</p>}
          {error && <Alert message={error} onClose={() => setError('')} />}
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setFormOpen(false)} className="admin-secondary-btn">Cancel</button><button disabled={saving} className="admin-primary-btn"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Slot'}</button></div>
        </form>
      </Modal>}
    </div>
  );
};

