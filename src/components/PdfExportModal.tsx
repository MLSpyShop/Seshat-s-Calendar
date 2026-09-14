import React, { useState, useEffect } from 'react';
import { generateMillennialMasterPdf, generateSpecificYearPdf } from '../utils/pdfGenerator';
import { isSeshatLeapYear } from '../utils/calendarMath';
import {
  Download,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultYear?: number;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultYear = 0,
}) => {
  const [activeMode, setActiveMode] = useState<'millennial' | 'yearly'>('millennial');
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Sync selectedYear if defaultYear changes
  useEffect(() => {
    if (typeof defaultYear === 'number') {
      setSelectedYear(defaultYear);
    }
  }, [defaultYear]);

  // Close on Escape key and lock body scroll while modal is active
  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const gregorianStart = 2030 + selectedYear;
  const isLeap = isSeshatLeapYear(selectedYear);

  const handleDownloadMaster = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      try {
        const doc = generateMillennialMasterPdf();
        doc.save('Seshat-1000-Year-Perpetual-Master-Calendar-2030-3030CE.pdf');
        setDownloadSuccess('1,000-Year Master Calendar PDF downloaded successfully!');
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handlePreviewMaster = () => {
    try {
      const doc = generateMillennialMasterPdf();
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadYearly = () => {
    setIsGenerating(true);
    setDownloadSuccess(null);
    setTimeout(() => {
      try {
        const doc = generateSpecificYearPdf(selectedYear);
        const filename = `Seshat-Calendar-Year-${selectedYear}-${gregorianStart}-${gregorianStart + 1}CE.pdf`;
        doc.save(filename);
        setDownloadSuccess(`Year ${selectedYear} (${gregorianStart} CE) PDF downloaded successfully!`);
      } catch (err) {
        console.error(err);
      } finally {
        setIsGenerating(false);
      }
    }, 100);
  };

  const handlePreviewYearly = () => {
    try {
      const doc = generateSpecificYearPdf(selectedYear);
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      id="pdf-export-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div
        id="pdf-export-modal-dialog"
        className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-linear-to-r from-slate-950 via-slate-900 to-indigo-950 text-white flex items-start justify-between shrink-0">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Millennial Chronometry Standard
            </span>
            <h2 id="pdf-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Download 1,000-Year Calendar PDF
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Perpetual invariant format valid across the next 10 centuries (2030–3030 CE).
            </p>
          </div>
          <button
            id="close-pdf-modal-btn"
            onClick={onClose}
            className="p-2 -mr-2 -mt-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Mobile First) */}
        <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5 shrink-0">
          <button
            id="tab-millennial-pdf"
            onClick={() => {
              setActiveMode('millennial');
              setDownloadSuccess(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeMode === 'millennial'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeMode === 'millennial' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span>1,000-Year Master Edition</span>
          </button>

          <button
            id="tab-yearly-pdf"
            onClick={() => {
              setActiveMode('yearly');
              setDownloadSuccess(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeMode === 'yearly'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className={`w-4 h-4 ${activeMode === 'yearly' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>Specific Year Edition</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {downloadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2 text-xs sm:text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {activeMode === 'millennial' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 text-amber-950">
                <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Why is this PDF good for the next 1,000 years?
                </h4>
                <p className="text-xs text-amber-900/90 mt-1.5 leading-relaxed">
                  The Seshat calendar is mathematically <strong>invariant</strong>: every single year,
                  each of the 13 months consists of exactly 28 days where Day 1 is always Sunday and
                  Day 28 is always Saturday. Solar synchronization is preserved via the epagomenal Intercalaris days.
                </p>
              </div>

              {/* Master PDF Inclusions Checklist */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Included in the 3-Page Master PDF:
                </div>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>The Perpetual Invariant 13-Month Matrix:</strong> Universal month grid, canonical Egyptian names, glyph numerals, and weekly mapping.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>1,000-Year Century Leap Schedule (2030–3030 CE):</strong> Complete breakdown of all 242 quadrennial leap years across 11 centuries.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>91-Day Financial Quarter Law:</strong> Invariant 13-week quarters with zero intra-annual accounting variance.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Epagomenal Solar Ordinance:</strong> Exact placement of Intercalaris 1 (March 30/31) and Intercalaris 2 (March 31).
                    </span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  id="download-master-pdf-btn"
                  onClick={handleDownloadMaster}
                  disabled={isGenerating}
                  className="flex-1 min-h-[48px] px-5 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
                  <span>{isGenerating ? 'Compiling Vector PDF...' : 'Download 1000-Year Master PDF'}</span>
                </button>

                <button
                  id="preview-master-pdf-btn"
                  onClick={handlePreviewMaster}
                  className="min-h-[48px] px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  title="Open PDF preview in new browser tab"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/90 text-indigo-950">
                <h4 className="font-bold text-sm text-indigo-950 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-700" />
                  Select Any Year (Year 0 through Year 1000)
                </h4>
                <p className="text-xs text-indigo-900/90 mt-1 leading-relaxed">
                  Generates an annual wall calendar with exact Gregorian day dates mapped to each Seshat day, Full Moon / New Moon indicators, and Intercalaris days.
                </p>
              </div>

              {/* Year Selector Control (Touch Friendly) */}
              <div className="space-y-2">
                <label htmlFor="pdf-year-select" className="block text-xs font-bold text-slate-700">
                  Seshat Year:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedYear((y) => Math.max(0, y - 1))}
                    className="min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-base flex items-center justify-center transition-colors"
                  >
                    -
                  </button>

                  <input
                    id="pdf-year-select"
                    type="number"
                    min={0}
                    max={1000}
                    value={selectedYear}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) setSelectedYear(Math.max(0, Math.min(1000, val)));
                    }}
                    className="flex-1 min-h-[44px] text-center font-mono font-bold text-lg bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />

                  <button
                    onClick={() => setSelectedYear((y) => Math.min(1000, y + 1))}
                    className="min-h-[44px] min-w-[44px] p-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-base flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Selected Year Meta Pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <div>
                    <span className="font-bold text-slate-900">
                      Gregorian: April 1, {gregorianStart} – March 31, {gregorianStart + 1} CE
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                      isLeap
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isLeap ? 'Leap Year (366 days · I₁ & I₂)' : 'Common Year (365 days · I₁)'}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="text-[11px] text-slate-400 self-center mr-1">Quick Presets:</span>
                  <button
                    onClick={() => setSelectedYear(0)}
                    className="px-2.5 py-1.5 min-h-[36px] bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Epoch (Year 0 / 2030)
                  </button>
                  <button
                    onClick={() => setSelectedYear(1)}
                    className="px-2.5 py-1.5 min-h-[36px] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold text-purple-800 transition-colors"
                  >
                    First Leap (Year 1 / 2031-32)
                  </button>
                  <button
                    onClick={() => setSelectedYear(70)}
                    className="px-2.5 py-1.5 min-h-[36px] bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Year 70 (2100 Century)
                  </button>
                  <button
                    onClick={() => setSelectedYear(370)}
                    className="px-2.5 py-1.5 min-h-[36px] bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold text-purple-800 transition-colors"
                  >
                    Year 370 (2400 Leap Century)
                  </button>
                  <button
                    onClick={() => setSelectedYear(1000)}
                    className="px-2.5 py-1.5 min-h-[36px] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-semibold text-amber-800 transition-colors"
                  >
                    Millennium End (Year 1000 / 3030)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  id="download-yearly-pdf-btn"
                  onClick={handleDownloadYearly}
                  disabled={isGenerating}
                  className="flex-1 min-h-[48px] px-5 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isGenerating ? 'animate-bounce' : ''}`} />
                  <span>{isGenerating ? 'Generating PDF...' : `Download Year ${selectedYear} PDF`}</span>
                </button>

                <button
                  id="preview-yearly-pdf-btn"
                  onClick={handlePreviewYearly}
                  className="min-h-[48px] px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  title="Open PDF preview in new browser tab"
                >
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-mono">PDF Standard: ISO 32000-1 · Vector A4</span>
          <button
            id="dismiss-pdf-modal-btn"
            onClick={onClose}
            className="px-4 py-2 min-h-[40px] text-slate-700 hover:text-slate-900 font-semibold rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
