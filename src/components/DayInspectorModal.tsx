import React, { useEffect, useMemo } from 'react';
import { SeshatDate, AstroEvent } from '../types';
import { formatGregorianLong, formatGregorianISO } from '../utils/calendarMath';
import { Calendar, Clock, Globe, Shield, Sparkles, X, Hash, Layers, Compass, Sun, Moon, ArrowRight } from 'lucide-react';
import { GoogleEventsSection } from './GoogleEventsSection';
import { LunarPhaseCard } from './LunarPhaseCard';
import { getLunarDayInfo } from '../utils/lunarMath';
import { getAstroEventsForSeshatYear } from '../utils/astronomyMath';

interface DayInspectorModalProps {
  selectedDate: SeshatDate | null;
  onClose: () => void;
  onOpenClock?: (targetDate: Date) => void;
}

export const DayInspectorModal: React.FC<DayInspectorModalProps> = ({
  selectedDate,
  onClose,
  onOpenClock,
}) => {
  // Close on Escape key and lock body scroll while modal is active
  useEffect(() => {
    if (!selectedDate) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedDate, onClose]);

  if (!selectedDate) return null;

  const isIntercalary = selectedDate.type !== 'standard';
  const unixTimestamp = Math.floor(selectedDate.gregorianDate.getTime() / 1000);
  const lunarInfo = getLunarDayInfo(selectedDate.gregorianDate, selectedDate.year);
  const targetIso = formatGregorianISO(selectedDate.gregorianDate);
  const yearAstroEvents = useMemo(() => getAstroEventsForSeshatYear(selectedDate.year), [selectedDate.year]);
  const astroEventsToday = useMemo(
    () => yearAstroEvents.filter((e) => e.isoDate === targetIso),
    [yearAstroEvents, targetIso]
  );

  return (
    <div
      id="day-inspector-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-dialog-title"
    >
      <div
        id="day-inspector-dialog"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isIntercalary ? 'Epagomenal Solar Buffer' : 'Deterministic 28-Day Standard'}
            </span>
            <h2 id="inspector-dialog-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {isIntercalary
                ? selectedDate.type === 'intercalaris_1'
                  ? 'Intercalaris 1'
                  : 'Intercalaris 2 (Leap Buffer)'
                : `${selectedDate.month?.name} Day ${selectedDate.day}`}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Seshat Temporal Coordinates: Year {selectedDate.year}
            </p>
          </div>
          <button
            id="close-inspector-btn"
            onClick={onClose}
            className="p-2 -mr-1 -mt-1 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details (Scrollable Body) */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Gregorian Equivalent
              </div>
              <div className="text-base font-bold text-slate-900">
                {formatGregorianLong(selectedDate.gregorianDate)}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5">
                ISO: {formatGregorianISO(selectedDate.gregorianDate)}
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Day of Seshat Year
              </div>
              <div className="text-base font-bold text-slate-900">
                Day {selectedDate.dayOfYear} of {selectedDate.isLeapYear ? 366 : 365}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {selectedDate.isLeapYear ? 'Leap Year (Yleap)' : 'Common Year (Ycommon)'}
              </div>
            </div>

            {!isIntercalary && (
              <>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" />
                    Invariant Weekday
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {selectedDate.weekdayName}
                  </div>
                  <div className="text-xs text-emerald-700 font-medium mt-0.5">
                    Day #{selectedDate.weekdayNumber} (Static sequence)
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    Quarter & Cadence
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    Quarter {selectedDate.quarter} · Week {selectedDate.weekOfYear}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    91-day balanced financial quarter
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Month Meaning / Intercalaris Explanation */}
          {!isIntercalary && selectedDate.month ? (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg font-serif font-bold text-amber-950">
                  Month {selectedDate.month.number}: {selectedDate.month.name}
                </span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-mono font-semibold rounded">
                  Numeral: {selectedDate.month.egyptianNumeral}
                </span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Significance:</strong> {selectedDate.month.significance}
              </p>
              <div className="text-xs text-amber-700 mt-2 font-medium">
                Theme: {selectedDate.month.theme}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base font-bold text-purple-950">
                  {selectedDate.type === 'intercalaris_1'
                    ? selectedDate.isLeapYear
                      ? 'Intercalaris 1 (First Epagomenal Day · March 30)'
                      : 'Intercalaris 1 (Annual Solar Anchor · March 31)'
                    : 'Intercalaris 2 (Second Epagomenal Day / Leap Solar Anchor · March 31)'}
                </span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                  Non-Month Epagomenal
                </span>
              </div>
              <p className="text-sm text-purple-900 leading-relaxed">
                {selectedDate.type === 'intercalaris_1'
                  ? selectedDate.isLeapYear
                    ? 'Intercalaris 1 is the 365th day of the Seshat leap year (March 30), occurring immediately after Month 13, Day 28 and preceding Intercalaris 2.'
                    : 'Intercalaris 1 is the 365th day of the Seshat common year (March 31), celebrated as Epagomenal New Year’s Eve immediately preceding Month 1, Day 1 (Wa 1).'
                  : 'Intercalaris 2 is the 366th day of the quadrennial leap year (March 31), providing the extra solar day buffer immediately preceding Month 1, Day 1 (Wa 1).'}
                {' '}Epagomenal days exist outside the 7-day weekly sequence, ensuring that every month perpetually starts on Sunday and ends on Saturday.
              </p>
            </div>
          )}

          {/* Astrological Alignments & Solar/Lunar Eclipses on this Day */}
          {astroEventsToday.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Astrological & Astronomical Alignments ({astroEventsToday.length})
                </span>
                {onOpenClock && (
                  <button
                    onClick={() => onOpenClock(selectedDate.gregorianDate)}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 underline underline-offset-2"
                  >
                    <Compass className="w-3 h-3" />
                    <span>View On Clock Dial</span>
                  </button>
                )}
              </div>

              {astroEventsToday.map((ev) => {
                const isSolar = ev.type === 'solar_eclipse';
                const isLunar = ev.type === 'lunar_eclipse';

                return (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-xl border ${
                      isSolar
                        ? 'bg-linear-to-r from-amber-50 to-orange-50/80 border-amber-300'
                        : isLunar
                        ? 'bg-linear-to-r from-red-50 to-rose-50/80 border-red-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{ev.icon}</span>
                        <div>
                          <div className="text-sm font-black text-slate-900">
                            {ev.title}
                          </div>
                          {ev.subtitle && (
                            <div className="text-xs font-semibold text-slate-600">
                              {ev.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {ev.timeStr}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                      {ev.description}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs text-slate-800">
                      <strong>Astrological Meaning: </strong>
                      <span>{ev.astrologicalSignificance}</span>
                    </div>

                    {ev.astronomicalDetails?.visibilityRegions && (
                      <div className="mt-1 text-[11px] text-slate-500 italic">
                        Path of Totality/Visibility: {ev.astronomicalDetails.visibilityRegions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Astronomical Lunar Phase Card */}
          <LunarPhaseCard lunarInfo={lunarInfo} />

          {/* Launch Mathematical Clock Shortcut */}
          {onOpenClock && (
            <div className="bg-linear-to-r from-slate-900 to-indigo-950 text-white p-3.5 rounded-xl border border-indigo-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Full-Spectrum Astrological Clock</div>
                  <div className="text-[10px] text-slate-300">Inspect 360° planetary aspects and celestial hands</div>
                </div>
              </div>
              <button
                onClick={() => onOpenClock(selectedDate.gregorianDate)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs transition-all flex items-center gap-1 shrink-0"
              >
                <span>Launch Clock</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Technical Metadata */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-slate-400" />
              Unix Timestamp: {unixTimestamp}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              UTC Synchronized
            </span>
          </div>

          {/* Integrated Google Calendar Events Section */}
          <GoogleEventsSection selectedDate={selectedDate} />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400 hidden sm:inline">Press Esc to dismiss</span>
          <button
            id="dismiss-inspector-btn"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs ml-auto"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
