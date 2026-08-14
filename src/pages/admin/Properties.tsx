import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, Image as ImageIcon, MapPin, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageHeader, Field, Alert, Modal, emptyProperty } from './AdminShared';
import type { Property, Amenity, PropertyImage } from './AdminShared';

export const PropertiesManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [listingFilter, setListingFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [details, setDetails] = useState<Property | null>(null);
  const [editing, setEditing] = useState<Property | null>(null);
  const [form, setForm] = useState(emptyProperty);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const [propertyRes, amenityRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('agents').select('*').order('name'),
      supabase.from('amenities').select('*').order('name')
    ]);
    if (!propertyRes.error) setProperties(propertyRes.data ?? []);
    if (!amenityRes.error) setAmenities(amenityRes.data ?? []);
    if (propertyRes.error) setError(propertyRes.error.message);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => properties.filter(p => {
    const text = `${p.title} ${p.location} ${p.address}`.toLowerCase();
    return text.includes(query.toLowerCase()) &&
      (!typeFilter || p.property_type === typeFilter) &&
      (!listingFilter || p.listing_type === listingFilter);
  }), [properties, query, typeFilter, listingFilter]);

  const openCreate = () => {
    setEditing(null); setForm(emptyProperty); setSelectedAmenities([]); setError(''); setFormOpen(true);
  };

  const openEdit = async (property: Property) => {
    setEditing(property); setForm({ ...property, description: property.description ?? '' });
    const { data } = await supabase.from('property_amenities').select('amenity_id').eq('property_id', property.id);
    setSelectedAmenities((data ?? []).map(row => row.amenity_id));
    setError(''); setFormOpen(true);
  };

  const saveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const payload = {
      title: form.title.trim(), description: form.description || null,
      property_type: form.property_type, listing_type: form.listing_type,
      price: Number(form.price), location: form.location.trim(), address: form.address.trim(),
      bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms), area: Number(form.area),
      year_built: form.year_built === null || form.year_built === undefined ? null : Number(form.year_built),
      featured: Boolean(form.featured), latitude: form.latitude === null ? null : Number(form.latitude),
      longitude: form.longitude === null ? null : Number(form.longitude), agent_id: form.agent_id || null
    };

    const result = editing
      ? await supabase.from('properties').update(payload).eq('id', editing.id).select().single()
      : await supabase.from('properties').insert(payload).select().single();

    if (result.error || !result.data) {
      setError(result.error?.message ?? 'Unable to save property.');
      setSaving(false);
      return;
    }

    const propertyId = result.data.id;
    const { error: deleteRelationError } = await supabase.from('property_amenities').delete().eq('property_id', propertyId);
    if (deleteRelationError) {
      setError(deleteRelationError.message);
      setSaving(false);
      return;
    }
    if (selectedAmenities.length) {
      const { error: relationError } = await supabase.from('property_amenities').insert(
        selectedAmenities.map(amenity_id => ({ property_id: propertyId, amenity_id }))
      );
      if (relationError) {
        setError(relationError.message);
        setSaving(false);
        return;
      }
    }
    await fetchData();
    setFormOpen(false);
    setSaving(false);
  };

  const deleteProperty = async (property: Property) => {
    if (!window.confirm(`Delete "${property.title}"? This may fail if existing records still reference it.`)) return;
    setError('');
    const { error } = await supabase.from('properties').delete().eq('id', property.id);
    if (error) setError(error.message);
    else await fetchData();
  };




  return (
    <div className="space-y-6">
      <PageHeader title="Properties" description={`${properties.length} properties from Supabase`}
        action={<button onClick={openCreate} className="admin-primary-btn"><Plus className="w-4 h-4" /> Add Property</button>} />

      {error && <Alert message={error} onClose={() => setError('')} />}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search properties..." className="admin-input pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="admin-input w-auto">
          <option value="">All Types</option><option value="house">House</option><option value="apartment">Apartment</option>
          <option value="villa">Villa</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option>
        </select>
        <select value={listingFilter} onChange={e => setListingFilter(e.target.value)} className="admin-input w-auto">
          <option value="">All Listings</option><option value="sale">Sale</option><option value="rent">Rent</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-data-table">
            <thead><tr><th>Property</th><th>Type</th><th>Listing</th><th>Price</th><th>Featured</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {filtered.map(property => (
                <tr key={property.id}>
                  <td><div className="font-semibold text-gray-900">{property.title}</div><div className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{property.location}</div></td>
                  <td className="capitalize">{property.property_type ?? '—'}</td>
                  <td className="capitalize">{property.listing_type ?? '—'}</td>
                  <td>{Number(property.price).toLocaleString()}</td>
                
                  <td>{property.featured ? <span className="admin-badge admin-badge-green">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td >
                    <button title="View" onClick={() => setDetails(property)} className="admin-icon-btn"><Eye className="w-4 h-4" /></button>
                    <button title="Edit" onClick={() => openEdit(property)} className="admin-icon-btn"><Pencil className="w-4 h-4" /></button>
                    <button title="Delete" onClick={() => deleteProperty(property)} className="admin-icon-btn admin-icon-danger"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={7} className="admin-empty-cell">No properties found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>


 

      {formOpen && (
        <Modal title={editing ? 'Edit Property' : 'Add Property'} onClose={() => setFormOpen(false)} wide>
          <form onSubmit={saveProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Title" required><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="admin-input" /></Field>
            <Field label="Description" full><textarea rows={3} value={form.description ?? ''} onChange={e => setForm({ ...form, description: e.target.value })} className="admin-input" /></Field>
            <Field label="Property Type"><select value={form.property_type ?? ''} onChange={e => setForm({ ...form, property_type: (e.target.value || null) as Property['property_type'] })} className="admin-input"><option value="house">House</option><option value="apartment">Apartment</option><option value="villa">Villa</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option></select></Field>
            <Field label="Listing Type"><select value={form.listing_type ?? ''} onChange={e => setForm({ ...form, listing_type: (e.target.value || null) as Property['listing_type'] })} className="admin-input"><option value="sale">Sale</option><option value="rent">Rent</option></select></Field>
            <Field label="Price"><input type="number" min="0" required value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="admin-input" /></Field>
            <Field label="Location"><input required value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="admin-input" /></Field>
            <Field label="Address"><input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="admin-input" /></Field>
            <Field label="Bedrooms"><input type="number" min="0" value={form.bedrooms} onChange={e => setForm({ ...form, bedrooms: Number(e.target.value) })} className="admin-input" /></Field>
            <Field label="Bathrooms"><input type="number" min="0" value={form.bathrooms} onChange={e => setForm({ ...form, bathrooms: Number(e.target.value) })} className="admin-input" /></Field>
            <Field label="Area"><input type="number" min="0" value={form.area} onChange={e => setForm({ ...form, area: Number(e.target.value) })} className="admin-input" /></Field>
            <Field label="Year Built"><input type="number" value={form.year_built ?? ''} onChange={e => setForm({ ...form, year_built: e.target.value ? Number(e.target.value) : null })} className="admin-input" /></Field>
            <Field label="Latitude"><input type="number" step="any" value={form.latitude ?? ''} onChange={e => setForm({ ...form, latitude: e.target.value ? Number(e.target.value) : null })} className="admin-input" /></Field>
            <Field label="Longitude"><input type="number" step="any" value={form.longitude ?? ''} onChange={e => setForm({ ...form, longitude: e.target.value ? Number(e.target.value) : null })} className="admin-input" /></Field>
            <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} /> Featured property</label>
            <div className="md:col-span-2 border-t pt-4">
              <label className="block text-sm font-semibold mb-2">Amenities</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                {amenities.map(a => <label key={a.id} className="flex items-center gap-2 text-sm border rounded-lg px-3 py-2"><input type="checkbox" checked={selectedAmenities.includes(a.id)} onChange={e => setSelectedAmenities(prev => e.target.checked ? [...prev, a.id] : prev.filter(id => id !== a.id))} />{a.name}</label>)}
              </div>
            </div>
            {error && <div className="md:col-span-2"><Alert message={error} onClose={() => setError('')} /></div>}
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setFormOpen(false)} className="admin-secondary-btn">Cancel</button>
              <button disabled={saving} className="admin-primary-btn"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Property'}</button>
            </div>
          </form>
        </Modal>
      )}

      {details && <PropertyDetailsModal property={details} onClose={() => setDetails(null)} onChanged={fetchData} />}
    </div>
  );
};

const PropertyDetailsModal = ({ property, onClose, onChanged }: { property: Property; onClose: () => void; onChanged: () => Promise<void> }) => {
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [primary, setPrimary] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [imagesRes, selectedRes, amenitiesRes] = await Promise.all([
      supabase.from('property_images').select('*').eq('property_id', property.id).order('created_at'),
      supabase.from('property_amenities').select('amenity_id').eq('property_id', property.id),
      supabase.from('amenities').select('*').order('name')
    ]);
    setImages(imagesRes.data ?? []);
    setAllAmenities(amenitiesRes.data ?? []);
    const ids = new Set((selectedRes.data ?? []).map(r => r.amenity_id));
    setAmenities((amenitiesRes.data ?? []).filter(a => ids.has(a.id)));
  };

  useEffect(() => { load(); }, [property.id]);

  const addImage = async () => {
    if (!imageUrl.trim()) return;
    setError('');
    const shouldBePrimary = primary || images.length === 0;
    if (shouldBePrimary) await supabase.from('property_images').update({ is_primary: false }).eq('property_id', property.id);
    const { error } = await supabase.from('property_images').insert({ property_id: property.id, image_url: imageUrl.trim(), is_primary: shouldBePrimary });
    if (error) setError(error.message);
    else { setImageUrl(''); setPrimary(false); await load(); await onChanged(); }
  };

  const removeImage = async (image: PropertyImage) => {
    const { error } = await supabase.from('property_images').delete().eq('id', image.id);
    if (error) setError(error.message); else await load();
  };

  const makePrimary = async (image: PropertyImage) => {
    const { error: resetError } = await supabase.from('property_images').update({ is_primary: false }).eq('property_id', property.id);
    if (resetError) { setError(resetError.message); return; }
    const { error } = await supabase.from('property_images').update({ is_primary: true }).eq('id', image.id);
    if (error) setError(error.message); else await load();
  };

  return (
    <Modal title={property.title} onClose={onClose} wide>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-bold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Property Images</h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {images.map(image => <div key={image.id} className="border rounded-xl overflow-hidden">
              <img src={image.image_url} alt={property.title} className="w-full h-28 object-cover" />
              <div className="p-2 flex items-center justify-between gap-2">
                <span className={`text-xs ${image.is_primary ? 'text-green-600 font-semibold' : 'text-gray-500'}`}>{image.is_primary ? 'Primary' : 'Image'}</span>
                <div className="flex gap-1">
                  {!image.is_primary && <button onClick={() => makePrimary(image)} className="text-xs px-2 py-1 border rounded">Set Primary</button>}
                  <button onClick={() => removeImage(image)} className="text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>)}
            {!images.length && <div className="col-span-2 text-sm text-gray-500">No images for this property.</div>}
          </div>
          <div className="space-y-2">
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" className="admin-input" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={primary} onChange={e => setPrimary(e.target.checked)} /> Set as primary</label>
            <button onClick={addImage} className="admin-primary-btn"><Plus className="w-4 h-4" /> Add Image</button>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-3">Property Details</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Location:</strong> {property.location}</p>
            <p><strong>Address:</strong> {property.address}</p>
            <p><strong>Type:</strong> {property.property_type ?? '—'}</p>
            <p><strong>Listing:</strong> {property.listing_type ?? '—'}</p>
            <p><strong>Price:</strong> {Number(property.price).toLocaleString()}</p>
            <p><strong>Bedrooms:</strong> {property.bedrooms} &nbsp; <strong>Bathrooms:</strong> {property.bathrooms}</p>
            <p><strong>Area:</strong> {property.area}</p>
            <p><strong>Year Built:</strong> {property.year_built ?? '—'}</p>
          </div>
          <h4 className="font-bold mt-6 mb-3">Selected Amenities</h4>
          <div className="flex flex-wrap gap-2">{amenities.map(a => <span key={a.id} className="bg-gray-100 rounded-full px-3 py-1 text-xs">{a.name}</span>)}{!amenities.length && <span className="text-sm text-gray-500">No amenities selected.</span>}</div>
          {error && <div className="mt-4"><Alert message={error} onClose={() => setError('')} /></div>}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">Amenities available in the existing database: {allAmenities.length}</div>
        </div>
      </div>
    </Modal>
  );
};

