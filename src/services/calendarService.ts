import { getAccessToken } from './auth';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  htmlLink?: string;
  status?: string;
}

export interface GoogleCalendarListResponse {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
}

/**
 * Fetch calendar events within a given time range (ISO strings).
 */
export const fetchGoogleEvents = async (
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.append('singleEvents', 'true');
  url.searchParams.append('orderBy', 'startTime');
  url.searchParams.append('maxResults', '250');
  if (timeMin) {
    url.searchParams.append('timeMin', timeMin);
  }
  if (timeMax) {
    url.searchParams.append('timeMax', timeMax);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Google authorization expired. Please sign in again.');
    }
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to fetch events (${response.status})`);
  }

  const data: GoogleCalendarListResponse = await response.json();
  return data.items || [];
};

/**
 * Create a new event in the user's primary calendar.
 */
export const createGoogleEvent = async (event: {
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
}): Promise<GoogleCalendarEvent> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to create event (${response.status})`);
  }

  return response.json();
};

/**
 * Delete an event from user's primary calendar.
 * Requires explicit user confirmation beforehand in the UI.
 */
export const deleteGoogleEvent = async (eventId: string): Promise<void> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('No Google access token found. Please sign in with Google.');
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok && response.status !== 204) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Failed to delete event (${response.status})`);
  }
};
