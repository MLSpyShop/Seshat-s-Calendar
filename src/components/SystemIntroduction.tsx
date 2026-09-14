import React, { useState } from 'react';
import { SESHAT_METADATA } from '../data';
import {
  BookOpen,
  Calendar,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Moon,
  ArrowRightLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Globe,
  Award,
  Layers,
} from 'lucide-react';
import { ActiveTab } from './Header';

interface SystemIntroductionProps {
  onNavigateTab?: (tab: ActiveTab) => void;
  activeTab?: ActiveTab;
}

export const SystemIntroduction: React.FC<SystemIntroductionProps> = ({
  onNavigateTab,
  activeTab = 'calendar',
}) => {
  // Allow user to collapse/expand for comfort. Default expanded on calendar, collapsible on all tabs.
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleModuleSelect = (tab: ActiveTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
    // If selecting a non-calendar tool, collapse the deep guide so the tool is instantly front-and-center
    if (tab !== 'calendar') {
      setIsExpanded(false);
    }
    // Smooth scroll directly to the module
    setTimeout(() => {
      const el = document.getElementById('active-module-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const keyPillars = [
    {
      title: '13 Equal Months of 28 Days',
      description:
        'Every month has exactly 4 complete 7-day weeks (Day 1 is always Sunday; Day 28 is always Saturday). Days of the month never shift across days of the week.',
      icon: Calendar,
      badge: '364 Synchronous Days',
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      title: 'Intercalaris Days (Epagomenal)',
      description:
        'In leap years, Intercalaris 1 (March 30) and Intercalaris 2 (March 31) provide the sequential epagomenal buffer. In common years, Intercalaris 1 (March 31) resets the solar year without disrupting the weekly cycle.',
      icon: ShieldCheck,
      badge: 'Zero Day-Shift',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      title: 'Astronomical Lunar Tracking',
      description:
        'High-precision Jean Meeus syzygy calculation computes exact UTC New Moons, Full Moons, and continuous illumination percentages for every single day.',
      icon: Moon,
      badge: 'Jean Meeus Algorithms',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
    },
    {
      title: '0% Financial Forecasting Variance',
      description:
        'Eliminates the 11% quarterly day variance and payroll skew of Gregorian months (28 to 31 days), saving enterprise budgets from arbitrary fiscal distortions.',
      icon: TrendingUp,
      badge: 'Enterprise Auditing',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  const quickFaqs = [
    {
      question: 'What is Seshat’s 13-Month Calendar System?',
      answer:
        'It is an immutable, perpetual chronometrical standard created by Marie-Soleil Seshat Landry (ORCID 0009-0008-5027-3337). It normalizes the civil year into thirteen 28-day months named after ancient Egyptian numerals and philosophies (Wa, Sen, Khem, Ftu, Di, Sisu, Sefekh, Khemenu, Pesedju, Medju, Wadj, Djehut, Men), plus 1 or 2 epagomenal anchor days.',
    },
    {
      question: 'When is the Epoch and how do years number?',
      answer:
        'The Epoch officially begins on April 1, 2030 CE at 00:00:00 UTC, designated as Year 0, Month 1 (Wa), Day 1. The Gregorian year beginning April 1, 2026 corresponds to Seshat Year -4; April 1, 2030 begins Year 0.',
    },
    {
      question: 'What happens to the 365th day (and 366th in leap years)?',
      answer:
        '13 months × 28 days = 364 days. In common years, the 365th day is Intercalaris 1 (I₁), celebrated on March 31 as Epagomenal New Year’s Eve. In leap years, Month 13 completes on March 29, followed sequentially by Intercalaris 1 (I₁) on March 30 and Intercalaris 2 (I₂) on March 31. Because these epagomenal days sit outside the 7-day weekly cycle, every single month in every year perpetually starts on Sunday (Day 1) and ends on Saturday (Day 28).',
    },
    {
      question: 'How do I use this interactive platform?',
      answer:
        'Explore the 13-month grid, click on any day to open the Day Inspector for astronomical moon illumination and Google Calendar sync, toggle lunar ephemeris highlights, or jump to the Temporal Converter and Financial Variance simulator using the navigation tabs above.',
    },
  ];

  return (
    <section
      id="system-introduction-section"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-8 transition-all"
    >
      {/* Top Banner with Core Summary */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Comprehensive Architectural Overview
              </span>
              <span className="text-xs text-slate-300 font-mono">
                Epoch Launch: April 1, 2030 CE (Year 0, Wa 1)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Seshat’s 13-Month 28-Day Calendar System
            </h1>

            <p className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed">
              A deterministic civil and astronomical chronometry created by{' '}
              <strong className="text-white font-semibold">{SESHAT_METADATA.author}</strong>. By
              standardizing every year into thirteen 28-day months of exactly four 7-day weeks, the
              system permanently eliminates the mathematical irregularities, shifting weekdays, and
              multi-billion-dollar forecasting distortions of the Gregorian calendar.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
            <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl text-right sm:text-left lg:text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Author & Specification
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                {SESHAT_METADATA.titleAndRole}
              </div>
              <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                ORCID: {SESHAT_METADATA.orcid}
              </div>
            </div>

            <button
              id="toggle-system-intro-btn"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
            >
              <span>{isExpanded ? 'Collapse System Guide' : 'Read Full System Guide'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Deep-Dive Content */}
      {isExpanded && (
        <div className="p-6 sm:p-8 space-y-8 bg-slate-50/50 border-t border-slate-100">
          {/* 4 Core Pillars */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                  The Four Pillars of the Seshat Standard
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">Mathematical Invariance</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyPillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`p-2 rounded-xl border ${pillar.color}`}>
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {pillar.badge}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {pillar.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Platform Navigation Shortcuts */}
          {onNavigateTab && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Explore The Five Dedicated Platform Modules
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">Click to navigate instantly</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                <button
                  id="intro-module-calendar"
                  onClick={() => handleModuleSelect('calendar')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border min-h-[56px] text-left transition-all active:scale-95 group ${
                    activeTab === 'calendar'
                      ? 'bg-slate-900 text-white shadow-md border-slate-800 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${activeTab === 'calendar' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
                        1. 13-Month Grid
                      </span>
                      {activeTab === 'calendar' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">Active</span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${activeTab === 'calendar' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Perpetual calendar & moons
                    </div>
                  </div>
                  <Calendar className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'calendar' ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </button>

                <button
                  id="intro-module-converter"
                  onClick={() => handleModuleSelect('converter')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border min-h-[56px] text-left transition-all active:scale-95 group ${
                    activeTab === 'converter'
                      ? 'bg-slate-900 text-white shadow-md border-slate-800 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${activeTab === 'converter' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
                        2. Date Converter
                      </span>
                      {activeTab === 'converter' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">Active</span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${activeTab === 'converter' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Bidirectional calculation
                    </div>
                  </div>
                  <ArrowRightLeft className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'converter' ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </button>

                <button
                  id="intro-module-financial"
                  onClick={() => handleModuleSelect('financial')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border min-h-[56px] text-left transition-all active:scale-95 group ${
                    activeTab === 'financial'
                      ? 'bg-slate-900 text-white shadow-md border-slate-800 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${activeTab === 'financial' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
                        3. Financial Variance
                      </span>
                      {activeTab === 'financial' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">Active</span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${activeTab === 'financial' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Interactive budget simulator
                    </div>
                  </div>
                  <TrendingUp className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'financial' ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </button>

                <button
                  id="intro-module-priorArt"
                  onClick={() => handleModuleSelect('priorArt')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border min-h-[56px] text-left transition-all active:scale-95 group ${
                    activeTab === 'priorArt'
                      ? 'bg-slate-900 text-white shadow-md border-slate-800 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${activeTab === 'priorArt' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
                        4. Prior Art & History
                      </span>
                      {activeTab === 'priorArt' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">Active</span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${activeTab === 'priorArt' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Chronometry comparative matrix
                    </div>
                  </div>
                  <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'priorArt' ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </button>

                <button
                  id="intro-module-roadmap"
                  onClick={() => handleModuleSelect('roadmap')}
                  className={`flex items-center justify-between p-3.5 rounded-xl border min-h-[56px] text-left transition-all active:scale-95 group ${
                    activeTab === 'roadmap'
                      ? 'bg-slate-900 text-white shadow-md border-slate-800 ring-2 ring-indigo-500'
                      : 'bg-slate-50 hover:bg-indigo-50/70 border-slate-200/80 hover:border-indigo-300 text-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${activeTab === 'roadmap' ? 'text-white' : 'text-slate-900 group-hover:text-indigo-950'}`}>
                        5. 2030 Epoch Roadmap
                      </span>
                      {activeTab === 'roadmap' && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400 text-slate-950">Active</span>
                      )}
                    </div>
                    <div className={`text-[11px] mt-0.5 ${activeTab === 'roadmap' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Live countdown & timeline
                    </div>
                  </div>
                  <Sparkles className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'roadmap' ? 'text-amber-400' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                </button>
              </div>
            </div>
          )}

          {/* Interactive FAQs Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Frequently Asked Questions & Conceptual Guide
              </h2>
            </div>

            <div className="space-y-3">
              {quickFaqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200/80 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full text-left p-4 flex items-center justify-between gap-3 bg-slate-50/60 hover:bg-slate-100/70 transition-colors"
                    >
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
