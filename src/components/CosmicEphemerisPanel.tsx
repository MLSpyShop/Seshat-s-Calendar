import React, { useState } from 'react';
import { AstroEvent, LunarEvent, SeshatDate } from '../types';
import { formatGregorianLong, gregorianToSeshat } from '../utils/calendarMath';
import {
  Sparkles,
  Sun,
  Moon,
  Calendar,
  ArrowRight,
  Shield,
  Compass,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';

interface CosmicEphemerisPanelProps {
  year: number;
  astroEvents: AstroEvent[];
  lunarEvents: LunarEvent[];
  onSelectDate: (date: SeshatDate) => void;
  onOpenClock?: (targetDate?: Date) => void;
  onClose?: () => void;
}

export const CosmicEphemerisPanel: React.FC<CosmicEphemerisPanelProps> = ({
  year,
  astroEvents,
  lunarEvents,
  onSelectDate,
  onOpenClock,
  onClose,
}) => {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'solar_eclipse' | 'lunar_eclipse' | 'cardinal' | 'planetary' | 'ingress' | 'moon_phases'
  >('all');

  const solarEclipses = astroEvents.filter((e) => e.type === 'solar_eclipse');
  const lunarEclipses = astroEvents.filter((e) => e.type === 'lunar_eclipse');
  const cardinalEvents = astroEvents.filter((e) => e.type === 'solstice' || e.type === 'equinox');
  const planetaryStations = astroEvents.filter((e) => e.type === 'planetary_station');
  const ingresses = astroEvents.filter((e) => e.type === 'zodiac_ingress');

  const displayedAstro = astroEvents.filter((e) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'solar_eclipse') return e.type === 'solar_eclipse';
    if (activeFilter === 'lunar_eclipse') return e.type === 'lunar_eclipse';
    if (activeFilter === 'cardinal') return e.type === 'solstice' || e.type === 'equinox';
    if (activeFilter === 'planetary') return e.type === 'planetary_station';
    if (activeFilter === 'ingress') return e.type === 'zodiac_ingress';
    return false;
  });

  const handleInspect = (date: Date) => {
    const seshatObj = gregorianToSeshat(date);
    onSelectDate(seshatObj);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in">
      {/* Panel Header */}
      <div className="p-5 bg-linear-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-black tracking-tight text-white">
              Full-Spectrum Astronomical & Astrological Ephemeris · Year {year}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Mathematical celestial almanac tracking Solar Eclipses, Lunar Eclipses, Vernal/Autumnal Equinoxes,
            Summer/Winter Solstices, Tropical Zodiac Ingresses, and Planetary Stations.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {onOpenClock && (
            <button
              onClick={() => onOpenClock()}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View On Astrological Clock</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close ephemeris panel"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
          }`}
        >
          All Events ({astroEvents.length})
        </button>

        <button
          onClick={() => setActiveFilter('solar_eclipse')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'solar_eclipse'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-amber-800 hover:bg-amber-100/60'
          }`}
        >
          <span>☀️🌑</span>
          <span>Solar Eclipses ({solarEclipses.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('lunar_eclipse')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'lunar_eclipse'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-red-700 hover:bg-red-50'
          }`}
        >
          <span>🌕🔴</span>
          <span>Lunar Eclipses ({lunarEclipses.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('cardinal')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'cardinal'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-emerald-800 hover:bg-emerald-50'
          }`}
        >
          <span>⚖️</span>
          <span>Solstices & Equinoxes ({cardinalEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('planetary')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'planetary'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'text-purple-800 hover:bg-purple-50'
          }`}
        >
          <span>℞</span>
          <span>Planetary Stations ({planetaryStations.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('ingress')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'ingress'
              ? 'bg-indigo-700 text-white shadow-xs'
              : 'text-indigo-800 hover:bg-indigo-50'
          }`}
        >
          <span>♈</span>
          <span>Zodiac Ingresses ({ingresses.length})</span>
        </button>

        <button
          onClick={() => setActiveFilter('moon_phases')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeFilter === 'moon_phases'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>🌕🌑</span>
          <span>Moon Syzygies ({lunarEvents.length})</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="p-4 sm:p-5 max-h-[500px] overflow-y-auto">
        {activeFilter === 'moon_phases' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lunarEvents.map((ev) => {
              const isFull = ev.type === 'full_moon';
              return (
                <div
                  key={ev.id}
                  onClick={() => handleInspect(ev.utcDate)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between group ${
                    isFull
                      ? 'bg-linear-to-br from-amber-50/70 to-orange-50/50 border-amber-200 hover:border-amber-400'
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
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                        {ev.timeStr}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-semibold text-slate-800 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/70">
                      {ev.seshatFormatted}
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatGregorianLong(ev.utcDate)}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 group-hover:text-indigo-600 font-semibold">
                    <span>Inspect Day in Calendar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : displayedAstro.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            No events match this filter in Year {year}.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedAstro.map((ev) => {
              const isSolar = ev.type === 'solar_eclipse';
              const isLunar = ev.type === 'lunar_eclipse';

              return (
                <div
                  key={ev.id}
                  onClick={() => handleInspect(ev.utcDate)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md flex flex-col justify-between group ${
                    isSolar
                      ? 'bg-linear-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/50 border-amber-300 hover:border-amber-500'
                      : isLunar
                      ? 'bg-linear-to-br from-red-50/90 via-rose-50/60 to-pink-50/50 border-red-300 hover:border-red-500'
                      : ev.type === 'solstice' || ev.type === 'equinox'
                      ? 'bg-linear-to-br from-emerald-50/80 to-teal-50/40 border-emerald-200 hover:border-emerald-400'
                      : ev.type === 'planetary_station'
                      ? 'bg-linear-to-br from-purple-50/80 to-indigo-50/40 border-purple-200 hover:border-purple-400'
                      : 'bg-slate-50/80 hover:bg-slate-100/90 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${ev.badgeColor}`}>
                        <span>{ev.icon}</span>
                        <span>{ev.categoryLabel}</span>
                      </span>

                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-white/90 px-2 py-0.5 rounded-md border border-slate-200">
                        {ev.timeStr}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-sm font-black text-slate-900 tracking-tight leading-snug">
                      {ev.title}
                    </h4>

                    {ev.subtitle && (
                      <p className="text-xs font-semibold text-slate-600 mt-0.5">
                        {ev.subtitle}
                      </p>
                    )}

                    {/* Seshat Calendar Coordinates */}
                    <div className="mt-2.5 text-xs font-semibold text-slate-800 bg-white/90 px-2.5 py-1.5 rounded-lg border border-slate-200/80">
                      {ev.seshatFormatted}
                    </div>

                    {/* Gregorian Date */}
                    <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatGregorianLong(ev.utcDate)}</span>
                    </div>

                    {/* Astrological Significance */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-700 leading-relaxed">
                      <strong className="text-slate-900">Astrological Transit: </strong>
                      {ev.astrologicalSignificance}
                    </div>

                    {/* Astronomical Details if present */}
                    {ev.astronomicalDetails?.visibilityRegions && (
                      <div className="mt-1.5 text-[11px] text-slate-500 italic">
                        Visibility: {ev.astronomicalDetails.visibilityRegions}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-indigo-700 group-hover:text-indigo-900">
                    <span>Inspect on Calendar Day</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
