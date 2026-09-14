import React, { useState, useEffect } from 'react';
import { ROADMAP_PHASES, SESHAT_METADATA } from '../data';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
  Server,
  Sparkles,
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  // Epoch target: April 1, 2030 00:00:00 UTC
  const epochTargetMs = Date.UTC(2030, 3, 1, 0, 0, 0);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = epochTargetMs - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [epochTargetMs]);

  return (
    <div className="space-y-6">
      {/* Epoch Countdown Hero Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Global Epoch Cutover
              </span>
              <span className="text-xs text-slate-400 font-mono">April 1, 2030 CE · 00:00:00 UTC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Countdown to Year 0, Month 1 (Wa), Day 1
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Target execution date for the structural temporal reset, synchronizing public and private
              financial infrastructure to the deterministic 13-month, 28-day standard.
            </p>
          </div>

          {/* Countdown Clock Grid */}
          <div className="grid grid-cols-4 gap-2 text-center shrink-0">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 min-w-16">
              <div className="text-2xl font-black font-mono text-amber-300">
                {timeLeft.days}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 min-w-16">
              <div className="text-2xl font-black font-mono text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 min-w-16">
              <div className="text-2xl font-black font-mono text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Mins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 min-w-16">
              <div className="text-2xl font-black font-mono text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4-Phase Implementation Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Rocket className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            Section 9: Global Business & Technical Implementation Strategy
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROADMAP_PHASES.map((phase) => {
            const isDone = phase.status === 'completed';
            const isActive = phase.status === 'active';

            return (
              <div
                key={phase.phase}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isActive
                    ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-200 shadow-xs'
                    : isDone
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-900 text-white">
                      Phase {phase.phase}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800'
                          : isActive
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isDone ? 'Completed' : isActive ? 'In Progress (2026)' : 'Scheduled'}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 mb-1">
                    {phase.title}
                  </h4>
                  <div className="text-xs font-semibold text-indigo-600 mb-2 font-mono">
                    {phase.timeline}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {phase.description}
                  </p>
                </div>

                <div className="border-t border-slate-200/80 pt-3 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Deliverables
                  </span>
                  {phase.milestones.map((m, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                      <CheckCircle2
                        className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          isDone
                            ? 'text-emerald-600'
                            : isActive
                            ? 'text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Enterprise Integration Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Server className="w-5 h-5 text-indigo-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              POSIX & ISO 8601 Extension Framework
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            To ensure zero friction during Phase 3 and Phase 4, the Seshat standard proposes an ISO 8601
            temporal extension syntax:
          </p>
          <div className="p-3 bg-slate-900 text-amber-300 font-mono text-xs rounded-xl overflow-x-auto space-y-1">
            <div># Standard Invariant Format:</div>
            <div className="text-white">YYYY-Mmm-DD (e.g. 0000-M01-01)</div>
            <div className="text-slate-400 mt-2"># Intercalaris Epagomenal Token:</div>
            <div className="text-white">YYYY-I1 (Intercalaris 1)</div>
            <div className="text-white">YYYY-I2 (Intercalaris 2 Leap Buffer)</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Executive OSINT Assurance
            </h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            By publishing deterministic open specifications and decoupling astronomical solar calibration
            via unassigned Intercalaris days, corporations can opt in to 13-period accounting cycles
            (matching Eastman Kodak’s historical model) immediately while legacy civic calendars operate in parallel.
          </p>
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
            Verified by deterministic human-in-the-loop audit; pure mathematical and contextual consistency.
          </div>
        </div>
      </div>
    </div>
  );
};
