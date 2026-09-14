import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutUser,
  getAccessToken,
  setCachedAccessToken,
} from '../services/auth';
import {
  fetchGoogleEvents,
  createGoogleEvent,
  deleteGoogleEvent,
  GoogleCalendarEvent,
} from '../services/calendarService';
import { seshatToGregorian, formatGregorianISO } from '../utils/calendarMath';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  events: GoogleCalendarEvent[];
  eventsLoading: boolean;
  eventsError: string | null;
  refreshEvents: () => Promise<void>;
  addEvent: (eventData: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
  }) => Promise<GoogleCalendarEvent>;
  removeEvent: (eventId: string) => Promise<void>;
  getEventsForDate: (year: number, monthNum?: number, dayNum?: number, isIntercalaris1?: boolean, isIntercalaris2?: boolean) => GoogleCalendarEvent[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAccessToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  // Initialize listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setEvents([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch events whenever user is authenticated and token is available
  const loadEvents = async () => {
    if (!token) return;
    setEventsLoading(true);
    setEventsError(null);
    try {
      // Query events spanning a generous window around current year
      const now = new Date();
      const past = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const items = await fetchGoogleEvents(past, future);
      setEvents(items);
    } catch (err: any) {
      console.error('Error fetching calendar events:', err);
      setEventsError(err.message || 'Failed to load Google Calendar events.');
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      loadEvents();
    } else {
      setEvents([]);
    }
  }, [user, token]);

  const login = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setCachedAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setToken(null);
      setEvents([]);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to sign out.');
    }
  };

  const addEvent = async (eventData: {
    summary: string;
    description?: string;
    location?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
  }) => {
    const newEvent = await createGoogleEvent(eventData);
    setEvents((prev) => [...prev, newEvent]);
    return newEvent;
  };

  const removeEvent = async (eventId: string) => {
    await deleteGoogleEvent(eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  /**
   * Helper to retrieve events corresponding to a specific Seshat calendar date
   */
  const getEventsForDate = (
    year: number,
    monthNum?: number,
    dayNum?: number,
    isIntercalaris1?: boolean,
    isIntercalaris2?: boolean
  ): GoogleCalendarEvent[] => {
    if (!events.length) return [];

    let targetGregorian: Date;
    if (isIntercalaris1) {
      targetGregorian = seshatToGregorian(year, 'intercalaris_1');
    } else if (isIntercalaris2) {
      targetGregorian = seshatToGregorian(year, 'intercalaris_2');
    } else if (monthNum && dayNum) {
      targetGregorian = seshatToGregorian(year, monthNum, dayNum);
    } else {
      return [];
    }

    const targetDateStr = formatGregorianISO(targetGregorian); // YYYY-MM-DD

    return events.filter((ev) => {
      // Event start may be dateTime (e.g. 2026-09-14T14:00:00Z) or date (2026-09-14)
      const evDateStr = ev.start.dateTime
        ? ev.start.dateTime.slice(0, 10)
        : ev.start.date || '';
      return evDateStr === targetDateStr;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isLoggingIn,
        error,
        login,
        logout,
        events,
        eventsLoading,
        eventsError,
        refreshEvents: loadEvents,
        addEvent,
        removeEvent,
        getEventsForDate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
