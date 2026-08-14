import { useEffect, useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, Mail, Phone, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import './ViewingModal.css';

type Property = Database['public']['Tables']['properties']['Row'];
type ViewingSlot = Database['public']['Tables']['viewing_slots']['Row'];

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property | null;
}

const formatDateLabel = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', options);

const ViewingModal = ({ isOpen, onClose, property }: ViewingModalProps) => {
  const [step, setStep] = useState(1);
  const [availableSlots, setAvailableSlots] = useState<ViewingSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<ViewingSlot | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [visitors, setVisitors] = useState(1);
  const [message, setMessage] = useState('');
  const [agree, setAgree] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fetchAvailableSlots = async (propertyId: string) => {
    setIsLoadingSlots(true);
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('viewing_slots')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_available', true)
      .gte('viewing_date', today)
      .order('viewing_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      setAvailableSlots([]);
    } else {
      // Only available slots are ever exposed to the customer.
      setAvailableSlots((data ?? []).filter(slot => slot.is_available));
    }

    setIsLoadingSlots(false);
  };

  useEffect(() => {
    if (!isOpen || !property?.id) return;

    setStep(1);
    setSelectedDate('');
    setSelectedSlot(null);
    setIsSuccess(false);
    setSubmitError('');
    setIsSubmitting(false);
    fetchAvailableSlots(property.id);
  }, [isOpen, property?.id]);

  const uniqueDates = Array.from(new Set(availableSlots.map(slot => slot.viewing_date)));
  const slotsForDate = availableSlots.filter(
    slot => slot.viewing_date === selectedDate && slot.is_available
  );

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  // Re-check the selected slot against Supabase before asking the customer
  // to enter any personal details. The initial list can become stale if
  // another customer books the slot while this modal is open.
  const handleTimeSelection = async (slot: ViewingSlot) => {
    if (!property?.id) return;

    setSubmitError('');

    const { data, error } = await supabase
      .from('viewing_slots')
      .select('id, is_available')
      .eq('id', slot.id)
      .eq('property_id', property.id)
      .maybeSingle();

    if (error || !data?.is_available) {
      setSelectedSlot(null);
      setStep(2);
      setSubmitError('This viewing time is no longer available. Please choose another time.');
      await fetchAvailableSlots(property.id);
      return;
    }

    setSelectedSlot(slot);
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSlot || !property || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const { error: requestError } = await supabase
        .from('viewing_requests')
        .insert({
          property_id: property.id,
          slot_id: selectedSlot.id,
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          visitors,
          message: message.trim() || null,
          status: 'pending'
        });

      if (requestError) {
        if (requestError.code === '23505') {
          // The database unique constraint is the final protection against races.
          setSelectedSlot(null);
          setSelectedDate('');
          setStep(1);
          await fetchAvailableSlots(property.id);
          setSubmitError('This viewing time is no longer available. Please choose another time.');
        } else {
          setSubmitError('An error occurred while submitting your request. Please try again.');
        }
        return;
      }

      // The existing database trigger marks the slot unavailable.
      // Refresh Supabase data so both the selected slot and any now-empty date disappear.
      await fetchAvailableSlots(property.id);
      setSelectedSlot(null);
      setSelectedDate('');
      setStep(1);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="viewing-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="viewing-modal-title"
    >
      <div className="viewing-modal">
        <button
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close viewing request"
          className="viewing-modal-close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="viewing-modal-content">
          <h2 id="viewing-modal-title" className="text-2xl font-heading font-bold text-primary mb-2">
            Schedule a Viewing
          </h2>
          <p className="text-muted mb-7 pr-8 break-words">{property?.title}</p>

          {isSuccess ? (
            <div className="text-center py-10 sm:py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2">
                Viewing Request Submitted!
              </h3>
              <p className="text-muted mb-8">
                We have received your request and will confirm shortly.
              </p>
              <button onClick={onClose} className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-gold transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="viewing-stepper" aria-label={`Step ${step} of 3`}>
                <div className={`viewing-step ${step >= 1 ? 'viewing-step-active' : ''}`}>1</div>
                <div className={`viewing-step-line ${step >= 2 ? 'viewing-step-line-active' : ''}`} />
                <div className={`viewing-step ${step >= 2 ? 'viewing-step-active' : ''}`}>2</div>
                <div className={`viewing-step-line ${step >= 3 ? 'viewing-step-line-active' : ''}`} />
                <div className={`viewing-step ${step >= 3 ? 'viewing-step-active' : ''}`}>3</div>
              </div>

              {submitError && (
                <div className="viewing-submit-error" role="alert">
                  {submitError}
                </div>
              )}

              {step === 1 && (
                <div className="step-container">
                  <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-gold" /> Select Date
                  </h3>

                  {isLoadingSlots ? (
                    <div className="text-center py-8 text-muted">Loading available dates...</div>
                  ) : uniqueDates.length > 0 ? (
                    <div className="viewing-date-grid">
                      {uniqueDates.map(date => (
                        <button
                          key={date}
                          onClick={() => { setSelectedDate(date); setStep(2); setSubmitError(''); }}
                          className="viewing-choice-btn"
                        >
                          <div className="font-bold text-primary">
                            {formatDateLabel(date, { weekday: 'short' })}
                          </div>
                          <div className="text-muted text-sm">
                            {formatDateLabel(date, { month: 'short', day: 'numeric' })}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-muted">No viewing slots currently available for this property.</p>
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="step-container">
                  <div className="viewing-step-heading">
                    <button onClick={() => setStep(1)} className="text-sm font-medium text-gold hover:underline">
                      ← Back to dates
                    </button>
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gold" /> Select Time
                    </h3>
                  </div>

                  <div className="mb-4 text-sm text-gray-500">
                    Selected Date:{' '}
                    <span className="font-bold text-primary">
                      {formatDateLabel(selectedDate, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>

                  {slotsForDate.length > 0 ? (
                    <div className="viewing-time-grid">
                      {slotsForDate.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => handleTimeSelection(slot)}
                          className="viewing-choice-btn viewing-time-btn"
                        >
                          <span className="font-bold text-primary">{slot.start_time.substring(0, 5)}</span>
                          <span className="text-gray-400">-</span>
                          <span className="text-muted">{slot.end_time.substring(0, 5)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-muted">This date is no longer available. Please choose another date.</p>
                      <button onClick={async () => { setStep(1); if (property) await fetchAvailableSlots(property.id); }} className="mt-3 text-gold font-medium hover:underline">
                        Refresh available dates
                      </button>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && selectedSlot && (
                <div className="step-container">
                  <div className="viewing-step-heading">
                    <button onClick={() => setStep(2)} className="text-sm font-medium text-gold hover:underline">
                      ← Back to times
                    </button>
                    <h3 className="text-lg font-bold text-primary flex items-center gap-2">Your Details</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <div className="relative">
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="viewing-form-input pl-10" />
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div className="viewing-form-grid">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="viewing-form-input pl-10" />
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="relative">
                          <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="viewing-form-input pl-10" />
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Visitors</label>
                      <div className="relative">
                        <input type="number" min="1" max="10" required value={visitors} onChange={e => setVisitors(Number(e.target.value))} className="viewing-form-input pl-10" />
                        <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message / Special Requests</label>
                      <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} className="viewing-form-input px-4 py-2.5 resize-none" />
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                      <input
                        type="checkbox"
                        id="agree"
                        required
                        checked={agree}
                        onChange={e => setAgree(e.target.checked)}
                        className="mt-1 w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold shrink-0"
                      />
                      <label htmlFor="agree" className="text-sm text-gray-600 leading-tight">
                        I agree to be contacted regarding this viewing request and accept the Privacy Policy.
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white py-3.5 rounded-lg font-medium hover:bg-gold transition-colors mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Viewing Request'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewingModal;
