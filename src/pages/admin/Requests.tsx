import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PageHeader, Alert, formatTime, formatDate } from './AdminShared';
import type { Slot, Request } from './AdminShared';

type RequestView = Request & {
  property?: { title: string } | null;
  viewing_slot?: Slot | null;
};

export const ViewingRequests = () => {
  const [requests, setRequests] = useState<RequestView[]>([]);
  const [filter, setFilter] = useState('');
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    const { data, error: fetchError } = await supabase
      .from('viewing_requests')
      .select('*, properties(title), viewing_slots(id, property_id, viewing_date, start_time, end_time, is_available, created_at)')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    const mapped = (data ?? []).map(row => {
      const raw = row as unknown as Request & {
        properties: { title: string } | null;
        viewing_slots: Slot | null;
      };
      return { ...raw, property: raw.properties, viewing_slot: raw.viewing_slots };
    });

    setRequests(mapped);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = requests.filter(request => {
    const text = `${request.customer_name} ${request.customer_email} ${request.customer_phone} ${request.property?.title ?? ''}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (!filter || request.status === filter);
  });

  const handleStatusUpdate = async (
    request: RequestView,
    status: 'confirmed' | 'cancelled'
  ) => {
    if (updatingId) return;

    setError('');
    setUpdatingId(request.id);

    try {
      const { data: updatedRequest, error: requestError } = await supabase
        .from('viewing_requests')
        .update({ status })
        .eq('id', request.id)
        .eq('status', 'pending')
        .select('id, status')
        .maybeSingle();

      if (requestError) {
        setError(requestError.message);
        return;
      }

      if (!updatedRequest) {
        setError('This request has already been processed. Refresh the requests list.');
        await fetchRequests();
        return;
      }

      if (status === 'cancelled') {
        // Reuse the original slot. Never create a replacement slot.
        const { error: slotError } = await supabase
          .from('viewing_slots')
          .update({ is_available: true })
          .eq('id', request.slot_id);

        if (slotError) {
          setError(slotError.message);
          return;
        }
      }

      if (status === 'confirmed') {
        // The request is confirmed first. The notification is sent only after
        // that database update succeeds and is handled by the existing Supabase project.
        const { error: notificationError } = await supabase.functions.invoke(
          'send-viewing-confirmation',
          { body: { requestId: request.id } }
        );

        if (notificationError) {
          setError('The request was confirmed, but the customer confirmation message could not be sent. Check the notification service configuration.');
        }
      }

      await fetchRequests();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Viewing Requests"
        description={`${requests.length} requests from Supabase`}
        action={
          <button onClick={fetchRequests} className="admin-secondary-btn">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="admin-request-filters bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search customer, email, phone or property"
          className="admin-input admin-request-search"
          aria-label="Search viewing requests"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="admin-input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-data-table min-w-[1200px]">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email / Phone</th>
                <th>Visitors</th>
                <th>Property</th>
                <th>Viewing Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Message</th>
                <th>Status</th>
                <th>Created At</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(request => (
                <tr key={request.id}>
                  <td className="font-semibold">{request.customer_name}</td>
                  <td>
                    <div>{request.customer_email}</div>
                    <div className="text-xs text-gray-500">{request.customer_phone}</div>
                  </td>
                  <td>{request.visitors}</td>
                  <td>{request.property?.title ?? '—'}</td>
                  <td>{request.viewing_slot ? formatDate(request.viewing_slot.viewing_date) : '—'}</td>
                  <td>{request.viewing_slot ? formatTime(request.viewing_slot.start_time) : '—'}</td>
                  <td>{request.viewing_slot ? formatTime(request.viewing_slot.end_time) : '—'}</td>
                  <td className="max-w-[220px] truncate" title={request.message ?? ''}>
                    {request.message ?? '—'}
                  </td>
                  <td>
                    <span className={`admin-badge ${
                      request.status === 'pending'
                        ? 'admin-badge-yellow'
                        : request.status === 'confirmed'
                          ? 'admin-badge-green'
                          : 'admin-badge-red'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.created_at).toLocaleString()}</td>
                  <td className="text-right whitespace-nowrap">
                    {request.status === 'pending' && (
                      <>
                        <button
                          title="Confirm"
                          disabled={updatingId === request.id}
                          onClick={() => handleStatusUpdate(request, 'confirmed')}
                          className="admin-icon-btn admin-icon-success disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          title="Cancel"
                          disabled={updatingId === request.id}
                          onClick={() => handleStatusUpdate(request, 'cancelled')}
                          className="admin-icon-btn admin-icon-danger disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}

              {!filtered.length && (
                <tr>
                  <td colSpan={11} className="admin-empty-cell">No viewing requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
