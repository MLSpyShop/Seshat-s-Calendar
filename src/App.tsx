/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { MONTHS } from './data';

export default function App() {
  return (
    <div className="p-8 font-sans bg-slate-50 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">Seshat's Calendar</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          The deterministic 13-month, 28-day temporal infrastructure.
          Epoch: April 1, 2030 CE (Year 0, Month 1, Day 1).
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {MONTHS.map((month) => (
          <div key={month.number} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              Month {month.number}: {month.name}
            </h2>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="font-semibold pb-2">{day}</div>
              ))}
              {Array.from({ length: 28 }).map((_, i) => (
                <div key={i} className="py-1.5 rounded hover:bg-slate-100 cursor-default">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
