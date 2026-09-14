import React, { useState } from 'react';
import { PRIOR_ART_COMPARISONS, PRIOR_ART_ITEMS } from '../data';
import { BookOpen, History, Award, CheckCircle2, ChevronRight, Layers } from 'lucide-react';

export const PriorArtView: React.FC = () => {
  const [selectedPrecedent, setSelectedPrecedent] = useState<string>(PRIOR_ART_ITEMS[2].id); // default to Cotsworth

  const activeItem = PRIOR_ART_ITEMS.find((item) => item.id === selectedPrecedent) || PRIOR_ART_ITEMS[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg">
            <History className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Section 8: Prior Art & Conceptual Chronometry Precedents
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Seshat's Calendar synthesises three centuries of chronometrical innovation, enterprise audits,
          and millennia-old Egyptian solar epagomenal mathematics into a unified temporal standard.
        </p>
      </div>

      {/* Table 3: Comparative Synthesis Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Table 3: Comparative Synthesis of Prior Art vs. Seshat's Calendar Standard
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Official Specification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-1/4">Architectural Metric</th>
                <th className="py-3 px-4 w-5/12 text-slate-500">Prior Art Models</th>
                <th className="py-3 px-4 w-5/12 text-emerald-900 bg-emerald-50/60">
                  Seshat's Calendar Standard
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRIOR_ART_COMPARISONS.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {row.metric}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono">
                    {row.priorArt}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-800 bg-emerald-50/30">
                    {row.seshatStandard}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Precedent Explorers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Precedents List */}
        <div className="lg:col-span-5 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Chronometrical Precedents (1745 – 2026)
          </h3>
          {PRIOR_ART_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedPrecedent(item.id)}
              className={`w-full p-4 text-left rounded-2xl border transition-all flex items-center justify-between ${
                selectedPrecedent === item.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                      selectedPrecedent === item.id
                        ? 'bg-amber-400 text-slate-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.year}
                  </span>
                  <h4 className="text-sm font-extrabold">{item.title}</h4>
                </div>
                <p
                  className={`text-xs mt-1 ${
                    selectedPrecedent === item.id ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {item.authorOrEntity}
                </p>
              </div>
              <ChevronRight
                className={`w-4 h-4 shrink-0 ${
                  selectedPrecedent === item.id ? 'text-amber-400' : 'text-slate-400'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Precedent Detail View */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {activeItem.year}
                </span>
                <span className="text-xs text-slate-500 font-medium">Historical Case Precedent</span>
              </div>
              <h3 className="text-xl font-black text-slate-900">{activeItem.title}</h3>
              <p className="text-xs text-slate-600 font-semibold">{activeItem.authorOrEntity}</p>
            </div>
            <Award className="w-8 h-8 text-amber-500 shrink-0" />
          </div>

          <p className="text-xs leading-relaxed text-slate-700">
            {activeItem.description}
          </p>

          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Key Architectural Limitations Resolved by Seshat's Calendar:
            </h4>
            <div className="space-y-2">
              {activeItem.differences.map((diff, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{diff}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
