import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Building2,
  DollarSign,
  PieChart,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const FinancialVarianceView: React.FC = () => {
  const [annualBudget, setAnnualBudget] = useState<number>(1300000);

  // Seshat: 13 months, identical $ budget per month
  const seshatMonthlyBudget = annualBudget / 13;

  // Gregorian: 12 months, day distribution [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const gregorianDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const gregorianMonths = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  // Daily budget rate based on 365 days
  const dailyRate = annualBudget / 365;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <TrendingUp className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Global Financial & OSINT Computation Variance
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-3xl">
              Eliminating multi-million dollar quarter-over-quarter forecasting distortion, payroll anomalies,
              and industrial scheduling shifts through Seshat’s 0% monthly variance framework.
            </p>
          </div>

          <div className="px-4 py-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>0% Monthly Standard Variance</span>
          </div>
        </div>
      </div>

      {/* Interactive Simulator Controller */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-4 pb-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label htmlFor="budget-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Simulate Enterprise Annual Operating Budget / Payroll
              </label>
              <p className="text-xs text-slate-500">
                Adjust budget to observe linear payroll normalization vs Gregorian quarter distortion.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <input
                id="budget-input"
                type="number"
                step={50000}
                min={100000}
                max={100000000}
                value={annualBudget}
                onChange={(e) => setAnnualBudget(Math.max(10000, parseInt(e.target.value, 10) || 0))}
                className="w-44 px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Slider and Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={130000}
                max={26000000}
                step={130000}
                value={annualBudget}
                onChange={(e) => setAnnualBudget(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                aria-label="Annual Budget Slider"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Quick Presets:</span>
              {[
                { label: '$650K (Startup)', value: 650000 },
                { label: '$1.3M (Baseline)', value: 1300000 },
                { label: '$5.2M (Mid-Market)', value: 5200000 },
                { label: '$26M (Enterprise)', value: 26000000 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setAnnualBudget(preset.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all min-h-[32px] ${
                    annualBudget === preset.value
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side-by-side Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Gregorian Defect Card */}
          <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="text-sm font-bold text-rose-950 uppercase tracking-wider">
                  Legacy Gregorian Architecture
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs font-bold rounded-md">
                10.7% Variance
              </span>
            </div>

            <div className="space-y-3 text-xs text-rose-950">
              <div className="flex justify-between py-1.5 border-b border-rose-200/60">
                <span className="text-rose-800 font-medium">Month Lengths:</span>
                <span className="font-bold font-mono text-rose-950">28, 29, 30, 31 Days (Unstable)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rose-200/60">
                <span className="text-rose-800 font-medium">Workdays per Month:</span>
                <span className="font-bold font-mono text-rose-950">20 to 23 Days (~15% Workday Fluctuation)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-rose-200/60">
                <span className="text-rose-800 font-medium">Quarter Durations:</span>
                <span className="font-bold font-mono text-rose-950">90, 91, 92 Days (Unequal Baselines)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-rose-800 font-medium">Payroll Run-rate Variance:</span>
                <span className="font-bold text-rose-700">
                  ${Math.round(dailyRate * 28).toLocaleString()} – ${Math.round(dailyRate * 31).toLocaleString()} / mo
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200/80 text-[11px] text-rose-900 leading-relaxed">
              <strong>Enterprise Impact:</strong> Corrupts monthly inventory turnover, sales quotas, and
              manufacturing run-rates due to arbitrary calendar-day discrepancies.
            </div>
          </div>

          {/* Seshat Deterministic Standard Card */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                  Seshat Deterministic Standard
                </h3>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                0.0% Variance
              </span>
            </div>

            <div className="space-y-3 text-xs text-emerald-950">
              <div className="flex justify-between py-1.5 border-b border-emerald-200/60">
                <span className="text-emerald-800 font-medium">Month Lengths:</span>
                <span className="font-bold font-mono text-emerald-900">Exactly 28 Days (Invariant)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-200/60">
                <span className="text-emerald-800 font-medium">Workdays per Month:</span>
                <span className="font-bold font-mono text-emerald-900">Exactly 20 Days (Mon–Fri Static)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-emerald-200/60">
                <span className="text-emerald-800 font-medium">Quarter Durations:</span>
                <span className="font-bold font-mono text-emerald-900">Exactly 91 Days / 13 Wks (Balanced)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-emerald-800 font-medium">Payroll Run-rate Variance:</span>
                <span className="font-bold text-emerald-700">
                  ${Math.round(seshatMonthlyBudget).toLocaleString()} / mo (Zero Variance)
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/80 text-[11px] text-emerald-900 leading-relaxed">
              <strong>Enterprise Impact:</strong> 100% linear budgeting, consistent 4-week production sprints,
              and deterministic quarter-over-quarter analytics without statistical smoothing hacks.
            </div>
          </div>
        </div>

        {/* Visual Monthly Budget Distribution Bar Comparison */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            Monthly Budget Disparity Simulation
          </h4>

          {/* Gregorian Fluctuating Line */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Gregorian 12-Month Fluctuating Allocation</span>
              <span className="text-rose-600 font-bold">±$10,000+ monthly variance</span>
            </div>
            <div className="grid grid-cols-12 gap-1 h-12 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              {gregorianDays.map((days, idx) => {
                const heightPct = (days / 31) * 100;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end h-full group relative"
                  >
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-xs transition-all ${
                        days === 28
                          ? 'bg-amber-400'
                          : days === 31
                          ? 'bg-rose-400'
                          : 'bg-slate-300'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 mt-1">
                      {gregorianMonths[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Seshat Flat Invariant Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Seshat 13-Month Invariant Allocation</span>
              <span className="text-emerald-700 font-bold">0.00% variance across all 13 periods</span>
            </div>
            <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1 h-12 bg-emerald-50/50 p-1.5 rounded-xl border border-emerald-200">
              {Array.from({ length: 13 }, (_, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full">
                  <div className="w-full h-full bg-emerald-500 rounded-xs" />
                  <span className="text-[9px] font-mono text-emerald-900 mt-1">M{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Case Study: Eastman Kodak & Industrial Precedent */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Industrial Case Study: Eastman Kodak Co. (1928–1989)
              </h3>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 text-xs font-bold rounded-md">
                60-Year Empirical Audit
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Industrialist George Eastman adopted Moses Cotsworth's 13-month, 28-day architecture for
              Eastman Kodak Company in 1928. Kodak operated internally on this exact 13-period accounting
              cycle for over six decades, demonstrating that uniform 4-week months completely resolved
              inventory forecasting drift, payroll allocation mismatches, and manufacturing queue scheduling.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-700">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Q-o-Q day variance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Deterministic supply chain orders</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Direct payroll reconciliation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OSINT & Global Risk Assessment (Section 10 of paper) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Lock className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider">
            Section 10: OSINT & Global Risk Assessment Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <h4 className="font-bold text-white text-sm mb-1">
              Financial Systems & Legacy Code Risk
            </h4>
            <p className="leading-relaxed text-slate-300">
              Legacy database schemas hardcoded for 12 months present system exception risks during enterprise cutover.
            </p>
            <div className="mt-2 text-emerald-400 font-mono text-[11px]">
              <strong>Resolution:</strong> Deploy middleware normalisation layers converting Seshat temporal tokens directly into standard ISO Unix timestamps natively.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <h4 className="font-bold text-white text-sm mb-1">
              Geopolitical & Disinformation Vectors
            </h4>
            <p className="leading-relaxed text-slate-300">
              Potential cultural resistance regarding non-standard intercalary days and epoch reset alignment.
            </p>
            <div className="mt-2 text-amber-400 font-mono text-[11px]">
              <strong>Resolution:</strong> Frame the transition primarily as an opt-in enterprise efficiency layer and financial standard prior to civic calendar migration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
