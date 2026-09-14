import React from 'react';
import { LunarDayInfo } from '../types';
import { Sparkles, Moon, Clock, ArrowRight } from 'lucide-react';

interface LunarPhaseCardProps {
  lunarInfo: LunarDayInfo;
  onViewEventDate?: (date: Date) => void;
}

export const LunarPhaseCard: React.FC<LunarPhaseCardProps> = ({ lunarInfo }) => {
  const {
    phaseName,
    phaseIcon,
    illumination,
    ageDays,
    isExactFullMoon,
    isExactNewMoon,
    exactEvent,
    nextFullMoonDays,
    nextNewMoonDays,
  } = lunarInfo;

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        isExactFullMoon
          ? 'bg-linear-to-br from-amber-500/10 via-amber-50 to-orange-50 border-amber-300 ring-1 ring-amber-300/50 shadow-xs'
          : isExactNewMoon
          ? 'bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900 shadow-md'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Phase Icon & Title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 select-none ${
              isExactFullMoon
                ? 'bg-amber-100 border border-amber-300 text-amber-900'
                : isExactNewMoon
                ? 'bg-slate-800 border border-indigo-700/60 text-indigo-200'
                : 'bg-white border border-slate-200 text-slate-800'
            }`}
          >
            <span>{phaseIcon}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isExactFullMoon
                    ? 'bg-amber-200 text-amber-900 font-extrabold'
                    : isExactNewMoon
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-bold'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isExactFullMoon
                  ? '🌕 Full Moon Event'
                  : isExactNewMoon
                  ? '🌑 New Moon Event'
                  : 'Astronomical Lunar Phase'}
              </span>

              {exactEvent?.name && (
                <span
                  className={`text-xs font-semibold ${
                    isExactNewMoon ? 'text-indigo-300' : 'text-slate-600'
                  }`}
                >
                  {exactEvent.name}
                </span>
              )}
            </div>

            <h4
              className={`text-lg font-black tracking-tight mt-1 ${
                isExactNewMoon ? 'text-white' : 'text-slate-950'
              }`}
            >
              {phaseName}
            </h4>

            {exactEvent && (
              <p
                className={`text-xs font-medium flex items-center gap-1 mt-0.5 ${
                  isExactNewMoon ? 'text-indigo-200' : 'text-amber-800'
                }`}
              >
                <Clock className="w-3 h-3 shrink-0" />
                <span>Peak Syzygy Alignment at {exactEvent.timeStr}</span>
              </p>
            )}
          </div>
        </div>

        {/* Right Illumination Badge */}
        <div className="text-right shrink-0">
          <div
            className={`text-xl font-black font-mono ${
              isExactFullMoon
                ? 'text-amber-700'
                : isExactNewMoon
                ? 'text-indigo-300'
                : 'text-slate-900'
            }`}
          >
            {illumination}%
          </div>
          <div
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              isExactNewMoon ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Illumination
          </div>
        </div>
      </div>

      {/* Progress Bar & Synodic Metrics */}
      <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
        {/* Visual Illumination Bar */}
        <div>
          <div
            className={`w-full h-2 rounded-full overflow-hidden ${
              isExactNewMoon ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                isExactFullMoon
                  ? 'bg-amber-400'
                  : isExactNewMoon
                  ? 'bg-indigo-500'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.max(3, illumination)}%` }}
            />
          </div>
        </div>

        {/* Details Row */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 text-xs ${
            isExactNewMoon ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-semibold">Synodic Age:</span>
            <span className="font-mono font-medium">Day {ageDays} of 29.53</span>
          </div>

          <div className="flex items-center gap-3 font-medium text-[11px]">
            {!isExactFullMoon && (
              <span className="flex items-center gap-1">
                <span>🌕 Full Moon:</span>
                <span className="font-bold">
                  {nextFullMoonDays === 0 ? 'Today' : `in ${nextFullMoonDays}d`}
                </span>
              </span>
            )}
            {!isExactNewMoon && (
              <span className="flex items-center gap-1">
                <span>🌑 New Moon:</span>
                <span className="font-bold">
                  {nextNewMoonDays === 0 ? 'Today' : `in ${nextNewMoonDays}d`}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
