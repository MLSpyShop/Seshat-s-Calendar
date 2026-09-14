import React, { useState } from 'react';
import { LunarEvent, SeshatDate } from '../types';
import { formatGregorianLong, seshatToGregorian, gregorianToSeshat } from '../utils/calendarMath';
import { Moon, Sparkles, Clock, Calendar, ArrowRight, Check } from 'lucide-react';

interface LunarEphemerisPanelProps {
  year: number;
  events: LunarEvent[];
  onSelectDate: (date: SeshatDate) => void;
  onClose?: () => void;
}

export const LunarEphemerisPanel: React.FC<LunarEphemerisPanelProps> = ({
  year,
  events,
  onSelectDate,
}) => {
  const [filter, setFilter] = useState<'all' | 'full' | 'new'>('all');

  const fullMoons = events.filter((e) => e.type === 'full_moon');
  const newMoons = events.filter((e) => e.type === 'new_moon');

  const displayedEvents = events.filter((e) => {
    if (filter === 'full') return e.type === 'full_moon';
    if (filter === 'new') return e.type === 'new_moon';
    return true;
  });

  const handleInspect = (event: LunarEvent) => {
    const seshatObj = gregorianToSeshat(event.utcDate);
    onSelectDate(seshatObj);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
              <Moon className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-black tracking-tight">
              Astronomical Lunar Ephemeris · Year {year}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Complete sequence of all {fullMoons.length} Full Moons and {newMoons.length} New Moons
            calculated via Jean Meeus Astronomical Syzygy Algorithms.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All ({events.length})
          </button>
          <button
            onClick={() => setFilter('full')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'full'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                : 'text-amber-300 hover:text-amber-200'
            }`}
          >
            <span>🌕</span>
            <span>Full Moons ({fullMoons.length})</span>
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'new'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-indigo-300 hover:text-indigo-200'
            }`}
          >
            <span>🌑</span>
            <span>New Moons ({newMoons.length})</span>
          </button>
        </div>
      </div>

      {/* Grid of Lunar Events */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {displayedEvents.map((ev) => {
          const isFull = ev.type === 'full_moon';

          return (
            <div
              key={ev.id}
              onClick={() => handleInspect(ev)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between group ${
                isFull
                  ? 'bg-linear-to-br from-amber-50/70 to-orange-50/50 border-amber-200/90 hover:border-amber-400'
                  : 'bg-linear-to-br from-slate-50 to-indigo-50/40 border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl select-none">{isFull ? '🌕' : '🌑'}</span>
                    <div>
                      <div className="text-xs font-black text-slate-900 tracking-tight">
                        {isFull ? 'Full Moon' : 'New Moon'}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500">
                        {ev.name}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                      isFull
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-indigo-100 text-indigo-900'
                    }`}
                  >
                    {ev.timeStr}
                  </span>
                </div>

                {/* Seshat Coordinate Badge */}
                <div className="mt-2 text-xs font-semibold text-slate-800 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/70">
                  {ev.seshatFormatted}
                </div>

                {/* Gregorian Date */}
                <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{formatGregorianLong(ev.utcDate)}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-indigo-600 font-semibold">
                <span>Inspect Day Details</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
