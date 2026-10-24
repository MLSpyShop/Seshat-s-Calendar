import React, { useState, useEffect } from 'react';
import { SESHAT_METADATA } from '../data';
import { gregorianToSeshat, formatGregorianLong } from '../utils/calendarMath';
import { getLunarDayInfo } from '../utils/lunarMath';
import { useAuth } from '../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  Calendar,
  Compass,
  ArrowRightLeft,
  TrendingUp,
  History,
  Rocket,
  Clock,
  Sparkles,
  LogOut,
  CheckCircle2,
  RefreshCw,
  User as UserIcon,
  FileText,
  Download,
} from 'lucide-react';

import { calculateSunLongitude, getZodiacSignForLongitude } from '../utils/astronomyMath';

export type ActiveTab = 'calendar' | 'clock' | 'converter' | 'financial' | 'priorArt' | 'roadmap';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenPdfModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onOpenPdfModal }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const { user, isLoggingIn, login, logout, events, eventsLoading, refreshEvents } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentSeshat = gregorianToSeshat(currentDate);
  const liveLunar = getLunarDayInfo(currentDate);
  const liveSunLon = calculateSunLongitude(currentDate);
  const liveSunZodiac = getZodiacSignForLongitude(liveSunLon);

  const navTabs = [
    { id: 'calendar' as ActiveTab, label: '13-Month Calendar', icon: Calendar },
    { id: 'clock' as ActiveTab, label: 'Mathematical Clock', icon: Compass },
    { id: 'converter' as ActiveTab, label: 'Temporal Converter', icon: ArrowRightLeft },
    { id: 'financial' as ActiveTab, label: 'Financial Variance', icon: TrendingUp },
    { id: 'priorArt' as ActiveTab, label: 'Prior Art & History', icon: History },
    { id: 'roadmap' as ActiveTab, label: '2030 Epoch Roadmap', icon: Rocket },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Meta Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="font-bold text-slate-800 tracking-tight">Seshat Calendar Standard</span>
          <span>·</span>
          <span>Universal Chronometry & Google Calendar Synchronization</span>
        </div>

        {/* Live Temporal Coordinates Badge & Lunar Phase & Clock */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-950 border border-amber-200/80 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Live Seshat:</span>
            <span className="font-mono text-amber-900 font-bold">
              {currentSeshat.type === 'standard'
                ? `Yr ${currentSeshat.year}, M${currentSeshat.month?.number} (${currentSeshat.month?.name}) D${currentSeshat.day}`
                : currentSeshat.formattedSeshat}
            </span>
          </div>

          {/* Live Astrological Sun Position Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/70 text-amber-950 border border-amber-300 rounded-full text-xs font-semibold"
            title={`Astrological Sun Ecliptic Longitude: ${liveSunLon.toFixed(2)}° in ${liveSunZodiac.sign} (${liveSunZodiac.element} · ${liveSunZodiac.quality})`}
          >
            <span className="text-amber-600 font-bold">☉</span>
            <span>Sun:</span>
            <span className="font-mono font-bold text-amber-900">
              {liveSunZodiac.degrees}°{String(liveSunZodiac.minutes).padStart(2, '0')}' {liveSunZodiac.symbol}
            </span>
          </div>

          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
              liveLunar.isExactFullMoon
                ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : liveLunar.isExactNewMoon
                ? 'bg-slate-900 text-white border-indigo-900 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title={`Astronomical Lunar Phase: ${liveLunar.phaseName} (${liveLunar.illumination}% illuminated, age ${liveLunar.ageDays}d)`}
          >
            <span className="text-sm select-none">{liveLunar.phaseIcon}</span>
            <span>{liveLunar.phaseName}</span>
            <span className="text-slate-400 font-mono text-[11px] font-normal">
              {liveLunar.illumination}%
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{currentDate.toISOString().slice(11, 19)} UTC</span>
          </div>
        </div>
      </div>

      {/* Main Brand, Nav Tabs, and Google Auth Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-slate-950 to-indigo-950 text-amber-400 flex items-center justify-center font-serif text-xl font-bold shadow-md border border-amber-400/20 shrink-0">
              𓋹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-950 tracking-tight">
                  Seshat's Calendar
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Standard & Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Deterministic 13-Month 28-Day Infrastructure · Google Calendar Synchronized
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Mobile-first horizontal scroll with touch targets) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: PDF Export & Google Logon Controls */}
          <div className="flex items-center gap-2 shrink-0 self-stretch sm:self-end lg:self-center justify-between sm:justify-end">
            {/* 1000-Year PDF Download Trigger */}
            <button
              id="header-pdf-download-btn"
              onClick={onOpenPdfModal}
              className="min-h-[44px] px-3.5 py-2 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
              title="Download 1,000-Year Perpetual Master Calendar PDF (2030–3030 CE)"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>1,000-Yr PDF</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2 p-1.5 pl-2.5 bg-slate-50 border border-slate-200 rounded-xl min-h-[44px]">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Account'}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full ring-1 ring-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left pr-1 hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {eventsLoading ? 'Syncing...' : `${events.length} Google Events`}
                  </div>
                </div>

                <button
                  id="refresh-google-events-btn"
                  onClick={() => refreshEvents()}
                  disabled={eventsLoading}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 transition-colors disabled:opacity-50"
                  title="Refresh Google Calendar events"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${eventsLoading ? 'animate-spin' : ''}`} />
                </button>

                <button
                  id="google-signout-btn"
                  onClick={logout}
                  className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Sign out of Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <GoogleSignInButton onClick={login} loading={isLoggingIn} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
