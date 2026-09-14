import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SeshatDate } from '../types';
import { formatGregorianLong, formatGregorianISO } from '../utils/calendarMath';
import { GoogleCalendarEvent } from '../services/calendarService';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  ExternalLink,
  MapPin,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleEventsSectionProps {
  selectedDate: SeshatDate;
}

export const GoogleEventsSection: React.FC<GoogleEventsSectionProps> = ({ selectedDate }) => {
  const {
    user,
    token,
    login,
    isLoggingIn,
    getEventsForDate,
    addEvent,
    removeEvent,
    eventsLoading,
  } = useAuth();

  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Deletion confirmation state (MANDATORY explicit confirmation modal/dialog)
  const [eventPendingDelete, setEventPendingDelete] = useState<GoogleCalendarEvent | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const isIntercalary1 = selectedDate.type === 'intercalaris_1';
  const isIntercalary2 = selectedDate.type === 'intercalaris_2';
  const monthNum = selectedDate.type === 'standard' ? selectedDate.month?.number : undefined;
  const dayNum = selectedDate.type === 'standard' ? selectedDate.day : undefined;

  const dayEvents = getEventsForDate(
    selectedDate.year,
    monthNum,
    dayNum,
    isIntercalary1,
    isIntercalary2
  );

  const dateIsoString = formatGregorianISO(selectedDate.gregorianDate); // YYYY-MM-DD

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) return;

    setIsSubmitting(true);
    setActionError(null);
    try {
      let startPayload: { dateTime?: string; date?: string };
      let endPayload: { dateTime?: string; date?: string };

      if (isAllDay) {
        startPayload = { date: dateIsoString };
        endPayload = { date: dateIsoString };
      } else {
        const startIso = new Date(`${dateIsoString}T${startTime}:00`).toISOString();
        const endIso = new Date(`${dateIsoString}T${endTime}:00`).toISOString();
        startPayload = { dateTime: startIso };
        endPayload = { dateTime: endIso };
      }

      await addEvent({
        summary: summary.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        start: startPayload,
        end: endPayload,
      });

      // Reset form
      setSummary('');
      setDescription('');
      setLocation('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Failed to create event:', err);
      setActionError(err.message || 'Failed to create Google Calendar event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteEvent = async () => {
    if (!eventPendingDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await removeEvent(eventPendingDelete.id);
      setEventPendingDelete(null);
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      setActionError(err.message || 'Failed to delete event');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">
            Google Calendar Events
          </h4>
          {user && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
            </span>
          )}
        </div>

        {user && !showAddForm && (
          <button
            id="add-google-event-toggle-btn"
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Event
          </button>
        )}
      </div>

      {actionError && (
        <div className="p-2.5 mb-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{actionError}</span>
        </div>
      )}

      {/* When user is not logged into Google */}
      {!user ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2.5">
          <p className="text-xs text-slate-600 max-w-sm mx-auto">
            Connect your Google Account to view, schedule, and sync events directly mapped onto
            this Seshat temporal day ({formatGregorianLong(selectedDate.gregorianDate)}).
          </p>
          <div className="flex justify-center pt-1">
            <GoogleSignInButton onClick={login} loading={isLoggingIn} />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Add Event Form */}
          {showAddForm && (
            <form
              onSubmit={handleCreateEvent}
              className="p-3.5 bg-slate-50 border border-indigo-200 rounded-xl space-y-3 text-xs"
            >
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>New Event for {formatGregorianISO(selectedDate.gregorianDate)}</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-slate-600 font-normal"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Fiscal Review"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={isAllDay}
                    onChange={(e) => setIsAllDay(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  All-day event
                </label>
              </div>

              {!isAllDay && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Start Time</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">End Time</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Location (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Virtual / Boardroom A"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional notes or meeting agenda..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving to Google...' : 'Save Event'}
                </button>
              </div>
            </form>
          )}

          {/* Events List */}
          {dayEvents.length === 0 ? (
            <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-slate-100">
              No Google Calendar events scheduled for this day.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {dayEvents.map((ev) => {
                const isAllDayEv = !ev.start.dateTime && !!ev.start.date;
                const timeLabel = isAllDayEv
                  ? 'All day'
                  : ev.start.dateTime
                  ? new Date(ev.start.dateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {ev.summary || '(Untitled Event)'}
                        </span>
                        {isAllDayEv && (
                          <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded">
                            All-Day
                          </span>
                        )}
                      </div>

                      {timeLabel && !isAllDayEv && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{timeLabel}</span>
                        </div>
                      )}

                      {ev.location && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      )}

                      {ev.description && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {ev.htmlLink && (
                        <a
                          href={ev.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                          title="Open in Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setEventPendingDelete(ev)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Explicit User Confirmation Dialog for Destructive Operations */}
      {eventPendingDelete && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Calendar Event?
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-900">"{eventPendingDelete.summary || 'Untitled'}"</strong> from
                  your Google Calendar? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEventPendingDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
