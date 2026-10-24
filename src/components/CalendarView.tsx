import React, { useState, useMemo } from 'react';
import { MONTHS, WEEKDAYS } from '../data';
import { Month, SeshatDate } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  isSeshatLeapYear,
  getSeshatYearTotalDays,
  gregorianToSeshat,
  seshatToGregorian,
  formatGregorianLong,
  formatGregorianISO,
} from '../utils/calendarMath';
import {
  getLunarEventsForSeshatYear,
  getLunarEventsMapForSeshatYear,
} from '../utils/lunarMath';
import {
  getAstroEventsForSeshatYear,
  getAstroEventsMapForSeshatYear,
} from '../utils/astronomyMath';
import { CosmicEphemerisPanel } from './CosmicEphemerisPanel';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Info,
  CalendarDays,
  Sun,
  ShieldCheck,
  CalendarCheck,
  Moon,
  FileText,
  Download,
  Compass,
  ArrowRight,
} from 'lucide-react';

interface CalendarViewProps {
  onSelectDate: (date: SeshatDate) => void;
  selectedDate: SeshatDate | null;
  onOpenPdfModal?: (year?: number) => void;
  onOpenClock?: (targetDate?: Date) => void;
}

export type AstroFilterType =
  | 'all'
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'cardinal'
  | 'planetary'
  | 'full_moon'
  | 'new_moon';

export const CalendarView: React.FC<CalendarViewProps> = ({
  onSelectDate,
  selectedDate,
  onOpenPdfModal,
  onOpenClock,
}) => {
  const { user, getEventsForDate } = useAuth();
  // Today's actual date
  const todaySeshat = gregorianToSeshat(new Date());

  // Current viewed year (default to Year 0 or current)
  const [viewYear, setViewYear] = useState<number>(0);
  const [quarterFilter, setQuarterFilter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'intercalaris'>('all');
  const [astroFilter, setAstroFilter] = useState<AstroFilterType>('all');
  const [showEphemeris, setShowEphemeris] = useState<boolean>(false);

  const isLeap = isSeshatLeapYear(viewYear);
  const totalDays = getSeshatYearTotalDays(viewYear);
  const gregorianStartYear = 2030 + viewYear;

  // Astronomical lunar phases for current Seshat year
  const lunarEvents = useMemo(() => getLunarEventsForSeshatYear(viewYear), [viewYear]);
  const lunarEventsMap = useMemo(() => getLunarEventsMapForSeshatYear(viewYear), [viewYear]);
  const fullMoonsCount = useMemo(() => lunarEvents.filter((e) => e.type === 'full_moon').length, [lunarEvents]);
  const newMoonsCount = useMemo(() => lunarEvents.filter((e) => e.type === 'new_moon').length, [lunarEvents]);

  // Full-Spectrum Astronomical & Astrological Events
  const astroEvents = useMemo(() => getAstroEventsForSeshatYear(viewYear), [viewYear]);
  const astroEventsMap = useMemo(() => getAstroEventsMapForSeshatYear(viewYear), [viewYear]);

  const solarEclipses = useMemo(() => astroEvents.filter((e) => e.type === 'solar_eclipse'), [astroEvents]);
  const lunarEclipses = useMemo(() => astroEvents.filter((e) => e.type === 'lunar_eclipse'), [astroEvents]);
  const cardinalEvents = useMemo(() => astroEvents.filter((e) => e.type === 'solstice' || e.type === 'equinox'), [astroEvents]);
  const planetaryStations = useMemo(() => astroEvents.filter((e) => e.type === 'planetary_station'), [astroEvents]);

  // Filter months based on quarter
  const filteredMonths = MONTHS.filter((m) => {
    if (quarterFilter === 'all') return true;
    if (quarterFilter === 'Q1') return m.number <= 4;
    if (quarterFilter === 'Q2') return m.number >= 4 && m.number <= 7;
    if (quarterFilter === 'Q3') return m.number >= 7 && m.number <= 10;
    if (quarterFilter === 'Q4') return m.number >= 10 && m.number <= 13;
    if (quarterFilter === 'intercalaris') return false;
    return true;
  });

  const handleIntercalarisClick = (type: 'intercalaris_1' | 'intercalaris_2') => {
    const gregDate = seshatToGregorian(viewYear, type);
    const seshatObj = gregorianToSeshat(gregDate);
    onSelectDate(seshatObj);
  };

  const handleDayClick = (month: Month, day: number) => {
    const gregDate = seshatToGregorian(viewYear, month.number, day);
    const seshatObj = gregorianToSeshat(gregDate);
    onSelectDate(seshatObj);
  };

  const isDayToday = (monthNum: number, dayNum: number) => {
    return (
      todaySeshat.year === viewYear &&
      todaySeshat.type === 'standard' &&
      todaySeshat.month?.number === monthNum &&
      todaySeshat.day === dayNum
    );
  };

  const isDaySelected = (monthNum: number, dayNum: number) => {
    return (
      selectedDate &&
      selectedDate.year === viewYear &&
      selectedDate.type === 'standard' &&
      selectedDate.month?.number === monthNum &&
      selectedDate.day === dayNum
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Year Controls & Astronomical Status */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Year Switcher (Mobile First with min-h-[44px] touch targets) */}
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <button
              id="prev-year-btn"
              onClick={() => setViewYear((y) => y - 1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 transition-all"
              title="Previous Year"
              aria-label="Previous Year"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center flex-1 sm:flex-initial">
              <div className="flex items-center gap-2 justify-center">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Year {viewYear}
                </span>
                {viewYear === 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                    Epoch Launch
                  </span>
                )}
                {viewYear === todaySeshat.year && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-900 rounded-full border border-emerald-300">
                    Current Era
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Gregorian Span: April 1, {gregorianStartYear} – March 31, {gregorianStartYear + 1}
              </p>
            </div>

            <button
              id="next-year-btn"
              onClick={() => setViewYear((y) => y + 1)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 transition-all"
              title="Next Year"
              aria-label="Next Year"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Jump Buttons, Mathematical Clock Trigger & 1,000-Yr PDF Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mathematical Astrological Clock Trigger */}
            {onOpenClock && (
              <button
                id="calendar-open-clock-btn"
                onClick={() => onOpenClock()}
                className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black bg-slate-950 hover:bg-indigo-950 active:scale-95 text-amber-400 border border-amber-400/30 flex items-center gap-1.5 shadow-xs transition-all"
                title="Open Full-Spectrum Mathematical Astrological Clock"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Mathematical Clock</span>
              </button>
            )}

            {/* 1,000-Year PDF Trigger Button */}
            <button
              id="calendar-pdf-download-btn"
              onClick={() => onOpenPdfModal?.(viewYear)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-extrabold bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 flex items-center gap-1.5 shadow-xs transition-all"
              title="Download 1,000-Year Perpetual Master PDF (2030–3030 CE)"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              <span>1,000-Yr PDF</span>
            </button>

            <button
              id="jump-epoch-btn"
              onClick={() => setViewYear(0)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                viewYear === 0
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Year 0 (2030)</span>
            </button>

            <button
              id="jump-today-btn"
              onClick={() => setViewYear(todaySeshat.year)}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                viewYear === todaySeshat.year
                  ? 'bg-emerald-800 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Current ({todaySeshat.year})</span>
            </button>

            {/* Astronomical Formula Badge */}
            <div className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              {isLeap ? (
                <span>
                  <strong>Yleap</strong>: (13 × 28) + 2 = 366d (I₁ + I₂)
                </span>
              ) : (
                <span>
                  <strong>Ycommon</strong>: (13 × 28) + 1 = 365d (I₁)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Invariance Reminder & Quarter Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Universal Invariance:</strong> Every month contains 28 days (4 full 7-day weeks).
              Day 1 is always Sunday; Day 28 is always Saturday.
            </span>
          </div>

          {/* Quarter Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-stretch md:self-auto">
            <button
              id="filter-all"
              onClick={() => setQuarterFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All (13)
            </button>
            <button
              id="filter-q1"
              onClick={() => setQuarterFilter('Q1')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'Q1' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q1
            </button>
            <button
              id="filter-q2"
              onClick={() => setQuarterFilter('Q2')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'Q2' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q2
            </button>
            <button
              id="filter-q3"
              onClick={() => setQuarterFilter('Q3')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'Q3' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q3
            </button>
            <button
              id="filter-q4"
              onClick={() => setQuarterFilter('Q4')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'Q4' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Q4
            </button>
            <button
              id="filter-intercalaris"
              onClick={() => setQuarterFilter('intercalaris')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                quarterFilter === 'intercalaris'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-800 hover:text-amber-900'
              }`}
            >
              Intercalaris
            </button>
          </div>
        </div>

        {/* Solar Eclipses & Astrological Events Filter Toolbar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Cosmic Filters:
            </span>

            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                id="astro-filter-all"
                onClick={() => setAstroFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  astroFilter === 'all'
                    ? 'bg-white shadow-xs text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Days
              </button>

              {/* Solar Eclipses Filter Button */}
              <button
                id="astro-filter-solar"
                onClick={() => setAstroFilter('solar_eclipse')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'solar_eclipse'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-amber-900 hover:bg-amber-200/50'
                }`}
                title={`Highlight all ${solarEclipses.length} Solar Eclipses in Year ${viewYear}`}
              >
                <span>☀️🌑</span>
                <span>Solar Eclipses ({solarEclipses.length})</span>
              </button>

              {/* Lunar Eclipses Filter Button */}
              <button
                id="astro-filter-lunar"
                onClick={() => setAstroFilter('lunar_eclipse')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'lunar_eclipse'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-red-800 hover:bg-red-100/60'
                }`}
                title={`Highlight all ${lunarEclipses.length} Lunar Eclipses in Year ${viewYear}`}
              >
                <span>🌕🔴</span>
                <span>Lunar Eclipses ({lunarEclipses.length})</span>
              </button>

              {/* Solstices & Equinoxes Filter Button */}
              <button
                id="astro-filter-cardinal"
                onClick={() => setAstroFilter('cardinal')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'cardinal'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-100/60'
                }`}
                title={`Highlight all ${cardinalEvents.length} Solstices & Equinoxes in Year ${viewYear}`}
              >
                <span>⚖️</span>
                <span>Solstices / Equinoxes ({cardinalEvents.length})</span>
              </button>

              {/* Planetary Retrogrades Filter Button */}
              <button
                id="astro-filter-planetary"
                onClick={() => setAstroFilter('planetary')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'planetary'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-purple-800 hover:bg-purple-100/60'
                }`}
                title={`Highlight all ${planetaryStations.length} Planetary Stations in Year ${viewYear}`}
              >
                <span>℞</span>
                <span>Retrogrades ({planetaryStations.length})</span>
              </button>

              {/* Full Moons */}
              <button
                id="astro-filter-full-moon"
                onClick={() => setAstroFilter('full_moon')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'full_moon'
                    ? 'bg-amber-100 text-amber-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🌕</span>
                <span>Full ({fullMoonsCount})</span>
              </button>

              {/* New Moons */}
              <button
                id="astro-filter-new-moon"
                onClick={() => setAstroFilter('new_moon')}
                className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                  astroFilter === 'new_moon'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🌑</span>
                <span>New ({newMoonsCount})</span>
              </button>
            </div>
          </div>

          {/* Ephemeris Schedule Toggle Button */}
          <button
            id="toggle-ephemeris-btn"
            onClick={() => setShowEphemeris((s) => !s)}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              showEphemeris
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{showEphemeris ? 'Hide Cosmic Ephemeris' : `Cosmic Ephemeris (${astroEvents.length + lunarEvents.length})`}</span>
          </button>
        </div>
      </div>

      {/* Expanded Cosmic Ephemeris Panel */}
      {showEphemeris && (
        <CosmicEphemerisPanel
          year={viewYear}
          astroEvents={astroEvents}
          lunarEvents={lunarEvents}
          onSelectDate={onSelectDate}
          onOpenClock={onOpenClock}
          onClose={() => setShowEphemeris(false)}
        />
      )}

      {/* Full-Spectrum Astrological Clock Banner */}
      {onOpenClock && (
        <div className="bg-linear-to-r from-slate-950 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-indigo-900/60 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/30 shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Full-Spectrum Mathematical Clock (Astrological & Astronomical)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400 text-slate-950">
                  Interactive Dial
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Concentric astrolabe with 24h Solar cycle, 13-Month Seshat ring, 360° Zodiac wheel, active aspect beams, and eclipse nodal radar.
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenClock()}
            className="min-h-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <span>Launch Mathematical Clock</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 13-Month Grid */}
      {quarterFilter !== 'intercalaris' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredMonths.map((month) => {
            // Gregorian start date for this month
            const firstDayGreg = seshatToGregorian(viewYear, month.number, 1);
            const lastDayGreg = seshatToGregorian(viewYear, month.number, 28);

            return (
              <div
                key={month.number}
                id={`month-card-${month.number}`}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                {/* Month Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {month.number}
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                        {month.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200/60">
                      {month.egyptianNumeral}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1 italic mb-1" title={month.significance}>
                    {month.significance}
                  </p>

                  <div className="text-[11px] text-slate-400 font-mono mb-3">
                    {formatGregorianLong(firstDayGreg).slice(4)} – {formatGregorianLong(lastDayGreg).slice(4)}
                  </div>
                </div>

                {/* 28-Day Invariant Grid */}
                <div className="border border-slate-100 rounded-xl p-2.5 bg-slate-50/50">
                  {/* Weekday Column Headers */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                    {WEEKDAYS.map((wd) => (
                      <div
                        key={wd.short}
                        className={`text-[11px] font-bold py-0.5 ${
                          wd.short === 'Sun' || wd.short === 'Sat'
                            ? 'text-indigo-600 font-extrabold'
                            : 'text-slate-500'
                        }`}
                        title={`${wd.full} (Invariant Day ${wd.dayIndices.join(', ')})`}
                      >
                        {wd.short}
                      </div>
                    ))}
                  </div>

                  {/* 28 Days: 4 Weeks × 7 Days */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 28 }, (_, i) => {
                      const dayNum = i + 1;
                      const isToday = isDayToday(month.number, dayNum);
                      const isSelected = isDaySelected(month.number, dayNum);
                      const dayEvents = user
                        ? getEventsForDate(viewYear, month.number, dayNum)
                        : [];

                      const gregDate = seshatToGregorian(viewYear, month.number, dayNum);
                      const isoDate = formatGregorianISO(gregDate);
                      const lunarEv = lunarEventsMap.get(isoDate);
                      const isFullMoon = lunarEv?.type === 'full_moon';
                      const isNewMoon = lunarEv?.type === 'new_moon';

                      const dayAstroList = astroEventsMap.get(isoDate) || [];
                      const solarEv = dayAstroList.find((e) => e.type === 'solar_eclipse');
                      const lunarEclipseEv = dayAstroList.find((e) => e.type === 'lunar_eclipse');
                      const cardinalEv = dayAstroList.find((e) => e.type === 'solstice' || e.type === 'equinox');
                      const stationEv = dayAstroList.find((e) => e.type === 'planetary_station');
                      const ingressEv = dayAstroList.find((e) => e.type === 'zodiac_ingress');

                      // Dimming logic based on active filter
                      let isDimmed = false;
                      if (astroFilter === 'solar_eclipse') {
                        isDimmed = !solarEv;
                      } else if (astroFilter === 'lunar_eclipse') {
                        isDimmed = !lunarEclipseEv;
                      } else if (astroFilter === 'cardinal') {
                        isDimmed = !cardinalEv;
                      } else if (astroFilter === 'planetary') {
                        isDimmed = !stationEv;
                      } else if (astroFilter === 'full_moon') {
                        isDimmed = !isFullMoon;
                      } else if (astroFilter === 'new_moon') {
                        isDimmed = !isNewMoon;
                      }

                      // Build tooltip
                      let tooltip = `Month ${month.number} (${month.name}) Day ${dayNum} · ${formatGregorianLong(gregDate)}`;
                      if (solarEv) {
                        tooltip += ` · ☀️🌑 ${solarEv.title} (${solarEv.timeStr})`;
                      }
                      if (lunarEclipseEv) {
                        tooltip += ` · 🌕🔴 ${lunarEclipseEv.title} (${lunarEclipseEv.timeStr})`;
                      } else if (isFullMoon) {
                        tooltip += ` · 🌕 Full Moon (${lunarEv.name}) at ${lunarEv.timeStr}`;
                      } else if (isNewMoon) {
                        tooltip += ` · 🌑 New Moon (${lunarEv.name}) at ${lunarEv.timeStr}`;
                      }
                      if (cardinalEv) {
                        tooltip += ` · ⚖️ ${cardinalEv.title}`;
                      }
                      if (stationEv) {
                        tooltip += ` · ℞ ${stationEv.title}`;
                      }
                      if (ingressEv) {
                        tooltip += ` · ♈ ${ingressEv.title}`;
                      }
                      if (dayEvents.length > 0) {
                        tooltip += ` · ${dayEvents.length} Google Calendar event(s)`;
                      }

                      return (
                        <button
                          key={dayNum}
                          id={`day-btn-${month.number}-${dayNum}`}
                          onClick={() => handleDayClick(month, dayNum)}
                          className={`py-1 rounded-lg text-xs font-semibold transition-all relative flex flex-col items-center justify-center min-h-[44px] sm:min-h-[40px] active:scale-95 touch-manipulation ${
                            isDimmed ? 'opacity-20 hover:opacity-100' : ''
                          } ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300'
                              : isToday
                              ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-300'
                              : solarEv
                              ? 'bg-linear-to-b from-amber-200 to-amber-300 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black border-2 border-amber-500 shadow-md ring-2 ring-amber-300/80 animate-pulse'
                              : lunarEclipseEv
                              ? 'bg-linear-to-b from-red-100 to-rose-200 hover:from-red-200 hover:to-rose-300 text-red-950 font-black border-2 border-red-500 shadow-md ring-2 ring-red-300/80'
                              : cardinalEv
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold border border-emerald-300 shadow-xs'
                              : stationEv
                              ? 'bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold border border-purple-300 shadow-xs'
                              : isFullMoon
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold border border-amber-300 shadow-xs'
                              : isNewMoon
                              ? 'bg-slate-100 hover:bg-slate-200 text-indigo-950 font-bold border border-indigo-200 shadow-xs'
                              : 'hover:bg-slate-200 text-slate-800 bg-white border border-slate-100/80'
                          }`}
                          title={tooltip}
                        >
                          <div className="flex items-center gap-0.5 leading-none">
                            <span className={solarEv ? 'font-black' : ''}>{dayNum}</span>

                            {/* Solar Eclipse Icon */}
                            {solarEv && (
                              <span
                                className="text-[10px] leading-none select-none drop-shadow-xs"
                                aria-label="Solar Eclipse"
                              >
                                ☀️🌑
                              </span>
                            )}

                            {/* Lunar Eclipse Icon */}
                            {lunarEclipseEv && !solarEv && (
                              <span
                                className="text-[10px] leading-none select-none drop-shadow-xs"
                                aria-label="Lunar Eclipse"
                              >
                                🌕🔴
                              </span>
                            )}

                            {/* Standard Full / New Moon if not eclipse */}
                            {!solarEv && !lunarEclipseEv && isFullMoon && (
                              <span
                                className="text-[10px] leading-none select-none drop-shadow-xs"
                                aria-label="Full Moon"
                              >
                                🌕
                              </span>
                            )}
                            {!solarEv && !lunarEclipseEv && isNewMoon && (
                              <span
                                className="text-[10px] leading-none select-none"
                                aria-label="New Moon"
                              >
                                🌑
                              </span>
                            )}
                          </div>

                          {/* Secondary Astrological Glyphs (Solstice, Equinox, Retrograde) */}
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {cardinalEv && (
                              <span className="text-[9px] leading-none text-emerald-700 font-bold" title={cardinalEv.title}>
                                {cardinalEv.type === 'solstice' ? '☀️' : '⚖️'}
                              </span>
                            )}
                            {stationEv && (
                              <span className="text-[9px] leading-none text-purple-700 font-black" title={stationEv.title}>
                                ℞
                              </span>
                            )}
                            {ingressEv && (
                              <span className="text-[9px] leading-none text-indigo-700 font-bold" title={ingressEv.title}>
                                {ingressEv.icon}
                              </span>
                            )}
                          </div>

                          {isToday && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-white" />
                          )}
                          {dayEvents.length > 0 && (
                            <span
                              className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                                isSelected || isToday ? 'bg-amber-300' : 'bg-indigo-600'
                              }`}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Card Summary */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Theme: {month.theme}</span>
                  <span className="font-semibold text-slate-700">28 Days / 4 Wks</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Intercalaris Insertion Section (Always prominent or focused) */}
      <div
        id="intercalaris-section"
        className="bg-linear-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 border border-amber-200 rounded-2xl p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-amber-500 text-white rounded-xl shadow-xs">
              <Sun className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  Intercalaris Solar Synchronization Days (Pre-Wa 1)
                </h3>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-full text-xs font-bold">
                  {isLeap ? '2 Epagomenal Days (Leap)' : '1 Epagomenal Day (Common)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Adapting the ancient Egyptian civil model of epagomenal days. Inserted outside the standard
                28-day matrix directly before Wa 1 to maintain absolute solar synchronization without disturbing the
                7-day weekly alignment.
              </p>
            </div>
          </div>
        </div>

        {/* The Intercalaris Days Cards */}
        {(() => {
          const i1Greg = seshatToGregorian(viewYear, 'intercalaris_1');
          const i1Iso = formatGregorianISO(i1Greg);
          const i1Lunar = lunarEventsMap.get(i1Iso);
          const i1Astro = astroEventsMap.get(i1Iso) || [];
          const i1SolarEclipse = i1Astro.find((e) => e.type === 'solar_eclipse');
          const i1LunarEclipse = i1Astro.find((e) => e.type === 'lunar_eclipse');

          const i2Greg = seshatToGregorian(viewYear, 'intercalaris_2');
          const i2Iso = formatGregorianISO(i2Greg);
          const i2Lunar = isLeap ? lunarEventsMap.get(i2Iso) : null;
          const i2Astro = isLeap ? astroEventsMap.get(i2Iso) || [] : [];
          const i2SolarEclipse = i2Astro.find((e) => e.type === 'solar_eclipse');

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Intercalaris 1 (Present in ALL years: March 30 in leap years, March 31 in common years) */}
              <div
                id="card-intercalaris-1"
                onClick={() => handleIntercalarisClick('intercalaris_1')}
                className="bg-white p-4 rounded-xl border border-amber-300 shadow-xs cursor-pointer hover:border-amber-500 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-md">
                      Intercalaris 1 (I₁)
                    </span>
                    <span className="text-xs font-semibold text-amber-700">
                      {isLeap ? 'First Epagomenal Day' : 'Annual Solar Anchor'}
                    </span>
                    {i1SolarEclipse && (
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-md flex items-center gap-1 shadow-xs">
                        <span>☀️🌑</span>
                        <span>Solar Eclipse</span>
                      </span>
                    )}
                    {i1LunarEclipse && (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-bold text-xs rounded-md flex items-center gap-1 shadow-xs">
                        <span>🌕🔴</span>
                        <span>Lunar Eclipse</span>
                      </span>
                    )}
                    {!i1SolarEclipse && !i1LunarEclipse && i1Lunar && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-xs rounded-md flex items-center gap-1">
                        <span>{i1Lunar.type === 'full_moon' ? '🌕' : '🌑'}</span>
                        <span>{i1Lunar.type === 'full_moon' ? 'Full Moon' : 'New Moon'}</span>
                      </span>
                    )}
                    {user && getEventsForDate(viewYear, undefined, undefined, true, false).length > 0 && (
                      <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                        {getEventsForDate(viewYear, undefined, undefined, true, false).length} event(s)
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mt-1">
                    {isLeap ? 'Solar Epagomenal Day 1' : 'Epagomenal New Year Eve'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isLeap
                      ? `Precedes Intercalaris 2 · March 30, ${gregorianStartYear + 1}`
                      : `Precedes Wa 1 · March 31, ${gregorianStartYear + 1}`}
                  </p>
                </div>
                <button
                  className="min-h-[44px] px-3.5 py-2 bg-amber-50 group-hover:bg-amber-600 group-hover:text-white active:scale-95 text-amber-900 text-xs font-bold rounded-xl transition-all shadow-2xs"
                  aria-label="Inspect Intercalaris 1"
                >
                  Inspect
                </button>
              </div>

              {/* Intercalaris 2 (Second Epagomenal Day, activated on Leap Years: March 31) */}
              {isLeap ? (
                <div
                  id="card-intercalaris-2"
                  onClick={() => handleIntercalarisClick('intercalaris_2')}
                  className="bg-white p-4 rounded-xl border border-purple-300 shadow-xs cursor-pointer hover:border-purple-500 transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-xs rounded-md">
                        Intercalaris 2 (I₂)
                      </span>
                      <span className="text-xs font-semibold text-purple-700">Leap Solar Anchor</span>
                      {i2SolarEclipse && (
                        <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-md flex items-center gap-1 shadow-xs">
                          <span>☀️🌑</span>
                          <span>Solar Eclipse</span>
                        </span>
                      )}
                      {!i2SolarEclipse && i2Lunar && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold text-xs rounded-md flex items-center gap-1">
                          <span>{i2Lunar.type === 'full_moon' ? '🌕' : '🌑'}</span>
                          <span>{i2Lunar.type === 'full_moon' ? 'Full Moon' : 'New Moon'}</span>
                        </span>
                      )}
                      {user && getEventsForDate(viewYear, undefined, undefined, false, true).length > 0 && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-full">
                          {getEventsForDate(viewYear, undefined, undefined, false, true).length} event(s)
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      Solar Epagomenal Day 2
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Precedes Wa 1 · March 31, {gregorianStartYear + 1}
                    </p>
                  </div>
                  <button
                    className="min-h-[44px] px-3.5 py-2 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white active:scale-95 text-purple-800 text-xs font-bold rounded-xl transition-all shadow-2xs"
                    aria-label="Inspect Intercalaris 2"
                  >
                    Inspect
                  </button>
                </div>
              ) : (
                <div className="bg-slate-100/80 p-4 rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-slate-400">
                  <div>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-bold text-xs rounded-md">
                      Intercalaris 2 (I₂)
                    </span>
                    <h4 className="text-sm font-semibold mt-1">Dormant in Common Years</h4>
                    <p className="text-xs mt-0.5">
                      Activated on quadrennial leap years (March 31, Yleap = 366 days)
                    </p>
                  </div>
                  <Info className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* 1,000-Year Perpetual PDF Banner */}
      <div className="bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-amber-400/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Download the 1,000-Year Master Calendar PDF
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Good for 2030 – 3030 CE
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Permanent invariant wall calendar and millennial astronomical almanac. Because every month in the Seshat standard perpetually starts on Sunday and ends on Saturday, this archival vector document remains 100% accurate for the next 10 centuries.
            </p>
          </div>
        </div>

        <button
          id="banner-pdf-download-btn"
          onClick={() => onOpenPdfModal?.(viewYear)}
          className="min-h-[48px] px-5 py-3 w-full md:w-auto bg-amber-500 hover:bg-amber-600 active:scale-98 text-slate-950 font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4 text-slate-950" />
          <span>Get 1,000-Year PDF</span>
        </button>
      </div>
    </div>
  );
};
