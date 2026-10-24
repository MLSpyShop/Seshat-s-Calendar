/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header, ActiveTab } from './components/Header';
import { CalendarView } from './components/CalendarView';
import { DateConverter } from './components/DateConverter';
import { FinancialVarianceView } from './components/FinancialVarianceView';
import { PriorArtView } from './components/PriorArtView';
import { RoadmapView } from './components/RoadmapView';
import { DayInspectorModal } from './components/DayInspectorModal';
import { PdfExportModal } from './components/PdfExportModal';
import { SeshatDate } from './types';
import { SESHAT_METADATA } from './data';
import { gregorianToSeshat } from './utils/calendarMath';
import { SystemIntroduction } from './components/SystemIntroduction';
import { MathematicalClock } from './components/MathematicalClock';
import {
  ShieldCheck,
  Calendar,
  ArrowRightLeft,
  TrendingUp,
  BookOpen,
  Milestone,
  Layers,
  Compass,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [selectedDate, setSelectedDate] = useState<SeshatDate | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfTargetYear, setPdfTargetYear] = useState<number>(0);

  const handleOpenPdf = (year?: number) => {
    if (typeof year === 'number') {
      setPdfTargetYear(year);
    }
    setIsPdfModalOpen(true);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Smoothly scroll to the active module container
    setTimeout(() => {
      const el = document.getElementById('active-module-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 60);
  };

  const moduleItems: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'calendar', label: '1. 13-Month Calendar', icon: Calendar },
    { id: 'clock', label: '2. Mathematical Clock', icon: Compass },
    { id: 'converter', label: '3. Date Converter', icon: ArrowRightLeft },
    { id: 'financial', label: '4. Financial Variance', icon: TrendingUp },
    { id: 'priorArt', label: '5. Prior Art & History', icon: BookOpen },
    { id: 'roadmap', label: '6. 2030 Epoch Roadmap', icon: Milestone },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50/80 text-slate-900 font-sans flex flex-col selection:bg-amber-200 selection:text-slate-900">
        {/* Sticky Header with Live Coordinates, Nav Tabs, and PDF Export */}
        <Header
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onOpenPdfModal={() => handleOpenPdf()}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Comprehensive System Introduction Banner & Guide */}
          <SystemIntroduction
            activeTab={activeTab}
            onNavigateTab={handleTabChange}
          />

          {/* Dedicated Module Navigation Anchor & Toolbar */}
          <div id="active-module-container" className="scroll-mt-24 mb-6">
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Active Module
                  </h2>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  Switch between system tools
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {moduleItems.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeTab === mod.id;
                  return (
                    <button
                      key={mod.id}
                      id={`toolbar-module-btn-${mod.id}`}
                      onClick={() => handleTabChange(mod.id)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 justify-between active:scale-95 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-xs ring-2 ring-indigo-500'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="truncate">{mod.label}</span>
                      </div>
                      {isActive && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Module View Rendering */}
          {activeTab === 'calendar' && (
            <CalendarView
              onSelectDate={(date) => setSelectedDate(date)}
              selectedDate={selectedDate}
              onOpenPdfModal={(yr) => handleOpenPdf(yr)}
              onOpenClock={() => handleTabChange('clock')}
            />
          )}

          {activeTab === 'clock' && (
            <MathematicalClock
              onSelectDate={(gDate) => {
                const seshat = gregorianToSeshat(gDate);
                setSelectedDate(seshat);
              }}
            />
          )}

          {activeTab === 'converter' && <DateConverter />}

          {activeTab === 'financial' && <FinancialVarianceView />}

          {activeTab === 'priorArt' && <PriorArtView />}

          {activeTab === 'roadmap' && <RoadmapView />}
        </main>

        {/* Day Inspector Modal */}
        <DayInspectorModal
          selectedDate={selectedDate}
          onClose={() => setSelectedDate(null)}
          onOpenClock={() => {
            setSelectedDate(null);
            handleTabChange('clock');
          }}
        />

        {/* 1,000-Year Perpetual Master PDF Export Modal */}
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          defaultYear={pdfTargetYear}
        />

        {/* Footer */}
        <footer className="mt-20 bg-white border-t border-slate-200 text-slate-600 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Primary Author & Institutional Attribution */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm sm:text-base">
                  <span className="font-bold text-slate-900 tracking-tight">
                    {SESHAT_METADATA.author}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-medium text-slate-700">
                    {SESHAT_METADATA.titleAndRole}
                  </span>
                  <span className="text-slate-400">·</span>
                  <a
                    href={`https://orcid.org/${SESHAT_METADATA.orcid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 transition-colors"
                  >
                    ORCID: {SESHAT_METADATA.orcid}
                  </a>
                </div>
                <p className="text-xs text-slate-500">
                  {SESHAT_METADATA.title} · Strategic OSINT, Architectural Chronometrical Standard & Global Standards Blueprint
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mathematical Consistency Verified
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-slate-200/80 text-slate-700">
                  Epoch: April 1, 2030 CE
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <p>
                © 2026 {SESHAT_METADATA.author}. Perpetual 13-Month Chronometry Infrastructure.
              </p>
              <div className="flex items-center gap-3">
                <span>All 13 Months Standardized to 28 Days</span>
                <span>·</span>
                <span>Pure Weekday Synchrony</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
