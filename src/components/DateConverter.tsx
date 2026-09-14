import React, { useState } from 'react';
import { MONTHS, WEEKDAYS } from '../data';
import {
  gregorianToSeshat,
  seshatToGregorian,
  formatGregorianISO,
  formatGregorianLong,
  isSeshatLeapYear,
} from '../utils/calendarMath';
import { getLunarDayInfo } from '../utils/lunarMath';
import { LunarPhaseCard } from './LunarPhaseCard';
import { SeshatDate } from '../types';
import {
  ArrowRightLeft,
  Calendar,
  Sparkles,
  Clock,
  Shield,
  Layers,
  Calculator,
  Compass,
  Copy,
  Check,
} from 'lucide-react';

export const DateConverter: React.FC = () => {
  const [activeDirection, setActiveDirection] = useState<'gregToSeshat' | 'seshatToGreg'>('gregToSeshat');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Gregorian -> Seshat state
  const [gregorianInput, setGregorianInput] = useState<string>(
    formatGregorianISO(new Date())
  );
  const [convertedSeshat, setConvertedSeshat] = useState<SeshatDate>(() =>
    gregorianToSeshat(new Date())
  );

  // Seshat -> Gregorian state
  const [seshatYearInput, setSeshatYearInput] = useState<number>(0);
  const [seshatMonthInput, setSeshatMonthInput] = useState<string>('1'); // '1'..'13' or 'intercalaris_1', 'intercalaris_2'
  const [seshatDayInput, setSeshatDayInput] = useState<number>(1);
  const [convertedGregorian, setConvertedGregorian] = useState<Date>(() =>
    seshatToGregorian(0, 1, 1)
  );

  const copyToClipboard = async (text: string, key: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey(null);
      }, 2000);
    } catch {
      // ignore
    }
  };

  const handleSwapDirection = () => {
    if (activeDirection === 'gregToSeshat') {
      // Transfer current calculated Seshat date to Seshat input form
      setSeshatYearInput(convertedSeshat.year);
      if (convertedSeshat.type === 'intercalaris_1') {
        setSeshatMonthInput('intercalaris_1');
      } else if (convertedSeshat.type === 'intercalaris_2') {
        setSeshatMonthInput('intercalaris_2');
      } else {
        setSeshatMonthInput(convertedSeshat.month ? convertedSeshat.month.number.toString() : '1');
        setSeshatDayInput(convertedSeshat.day || 1);
      }
      setConvertedGregorian(convertedSeshat.gregorianDate);
      setActiveDirection('seshatToGreg');
    } else {
      // Transfer current calculated Gregorian date to Gregorian input
      const iso = formatGregorianISO(convertedGregorian);
      setGregorianInput(iso);
      setConvertedSeshat(gregorianToSeshat(convertedGregorian));
      setActiveDirection('gregToSeshat');
    }
  };

  // Handle Gregorian change
  const handleGregorianChange = (val: string) => {
    setGregorianInput(val);
    if (!val) return;
    try {
      const parts = val.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        const parsedDate = new Date(Date.UTC(y, m, d, 12, 0, 0));
        if (!isNaN(parsedDate.getTime())) {
          setConvertedSeshat(gregorianToSeshat(parsedDate));
        }
      }
    } catch {
      // ignore
    }
  };

  const handleQuickPreset = (presetDate: string) => {
    handleGregorianChange(presetDate);
  };

  // Handle Seshat change
  const handleSeshatConvert = (
    year: number,
    monthOrSpecial: string,
    day: number
  ) => {
    const isLeap = isSeshatLeapYear(year);
    // If year is not leap and intercalaris_2 was chosen, fallback to intercalaris_1
    const safeMonthOrSpecial = !isLeap && monthOrSpecial === 'intercalaris_2' ? 'intercalaris_1' : monthOrSpecial;

    setSeshatYearInput(year);
    setSeshatMonthInput(safeMonthOrSpecial);
    setSeshatDayInput(day);

    let targetMonth: number | 'intercalaris_1' | 'intercalaris_2';
    if (safeMonthOrSpecial === 'intercalaris_1' || safeMonthOrSpecial === 'intercalaris_2') {
      targetMonth = safeMonthOrSpecial;
    } else {
      targetMonth = parseInt(safeMonthOrSpecial, 10);
    }

    const calculatedGreg = seshatToGregorian(year, targetMonth, day);
    setConvertedGregorian(calculatedGreg);
  };

  const isSelectedYearLeap = isSeshatLeapYear(seshatYearInput);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                <ArrowRightLeft className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Deterministic Temporal Coordinate Converter
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-2xl">
              Bidirectional mathematical translation between the legacy Gregorian calendar and
              the 13-month, 28-day invariant Seshat timekeeping architecture anchored at Epoch April 1, 2030 CE.
            </p>
          </div>

          {/* Toggle Direction Tabs & Quick Swap */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl flex-1 sm:flex-initial">
              <button
                id="tab-greg-to-seshat"
                onClick={() => setActiveDirection('gregToSeshat')}
                className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
                  activeDirection === 'gregToSeshat'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gregorian ➔ Seshat
              </button>
              <button
                id="tab-seshat-to-greg"
                onClick={() => setActiveDirection('seshatToGreg')}
                className={`flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-lg transition-all active:scale-95 ${
                  activeDirection === 'seshatToGreg'
                    ? 'bg-white text-indigo-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Seshat ➔ Gregorian
              </button>
            </div>

            <button
              id="swap-converter-direction-btn"
              onClick={handleSwapDirection}
              className="min-h-[44px] min-w-[44px] p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all shadow-2xs shrink-0"
              title="Reverse direction and transfer current converted date"
              aria-label="Reverse direction and transfer converted date"
            >
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Converter Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            {activeDirection === 'gregToSeshat' ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Gregorian Input
                  </h3>
                </div>

                <div>
                  <label htmlFor="gregorian-date-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Gregorian Date (UTC)
                  </label>
                  <input
                    id="gregorian-date-input"
                    type="date"
                    value={gregorianInput}
                    onChange={(e) => handleGregorianChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                    Key Historical & Epoch Reference Presets
                  </label>
                  <div className="flex flex-col gap-1.5">
                    <button
                      id="preset-today"
                      onClick={() => handleQuickPreset(formatGregorianISO(new Date()))}
                      className="px-3 py-2 text-left text-xs bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-800 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>Today's Date</span>
                      <span className="text-slate-400 font-mono">{formatGregorianISO(new Date())}</span>
                    </button>

                    <button
                      id="preset-epoch"
                      onClick={() => handleQuickPreset('2030-04-01')}
                      className="px-3 py-2 text-left text-xs bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-amber-950 font-medium transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <strong>Epoch Reset (Year 0, Wa 1)</strong>
                      </span>
                      <span className="text-amber-800 font-mono">2030-04-01</span>
                    </button>

                    <button
                      id="preset-intercalaris-1"
                      onClick={() => handleQuickPreset('2030-03-31')}
                      className="px-3 py-2 text-left text-xs bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 text-purple-950 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>Inaugural Intercalaris 1 (Pre-Wa 1)</span>
                      <span className="text-purple-800 font-mono">2030-03-31</span>
                    </button>

                    <button
                      id="preset-leap-intercalaris-1"
                      onClick={() => handleQuickPreset('2032-03-30')}
                      className="px-3 py-2 text-left text-xs bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 text-amber-950 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>Leap Intercalaris 1 (Year 1)</span>
                      <span className="text-amber-700 font-mono">2032-03-30</span>
                    </button>

                    <button
                      id="preset-leap-intercalaris-2"
                      onClick={() => handleQuickPreset('2032-03-31')}
                      className="px-3 py-2 text-left text-xs bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 text-purple-950 font-medium transition-colors flex items-center justify-between"
                    >
                      <span>Leap Intercalaris 2 (Year 1)</span>
                      <span className="text-purple-700 font-mono">2032-03-31</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Seshat Coordinates Input
                  </h3>
                </div>

                {/* Year Input */}
                <div>
                  <label htmlFor="seshat-year-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Seshat Year (Relative to April 1, 2030 CE)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="seshat-year-input"
                      type="number"
                      value={seshatYearInput}
                      onChange={(e) =>
                        handleSeshatConvert(parseInt(e.target.value, 10) || 0, seshatMonthInput, seshatDayInput)
                      }
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      Gregorian {2030 + seshatYearInput}
                    </span>
                  </div>
                </div>

                {/* Month or Intercalaris Select */}
                <div>
                  <label htmlFor="seshat-month-input" className="block text-xs font-bold text-slate-700 mb-1">
                    Month / Epagomenal Day
                  </label>
                  <select
                    id="seshat-month-input"
                    value={seshatMonthInput}
                    onChange={(e) =>
                      handleSeshatConvert(seshatYearInput, e.target.value, seshatDayInput)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <optgroup label="Standard 13 Months (28 Days Each)">
                      {MONTHS.map((m) => (
                        <option key={m.number} value={m.number.toString()}>
                          Month {m.number}: {m.name} ({m.egyptianNumeral})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Solar Epagomenal Buffer Days">
                      <option value="intercalaris_1">
                        Intercalaris 1 ({isSelectedYearLeap ? 'First Epagomenal Day · March 30' : 'Annual Solar Anchor · March 31'})
                      </option>
                      {isSelectedYearLeap && (
                        <option value="intercalaris_2">Intercalaris 2 (Second Epagomenal Day · March 31)</option>
                      )}
                    </optgroup>
                  </select>
                </div>

                {/* Day Input (only for standard months) */}
                {seshatMonthInput !== 'intercalaris_1' && seshatMonthInput !== 'intercalaris_2' && (
                  <div>
                    <label htmlFor="seshat-day-input" className="block text-xs font-bold text-slate-700 mb-1">
                      Day of Month (1 – 28)
                    </label>
                    <input
                      id="seshat-day-input"
                      type="number"
                      min={1}
                      max={28}
                      value={seshatDayInput}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(28, parseInt(e.target.value, 10) || 1));
                        handleSeshatConvert(seshatYearInput, seshatMonthInput, val);
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 font-mono text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Invariant weekday: {WEEKDAYS[(seshatDayInput - 1) % 7].full}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100 text-xs text-slate-400">
            Mathematical basis: Standard 13 × 28 grid anchored at April 1, 2030 UTC.
          </div>
        </div>

        {/* Right Column: Converted Results & Intelligence Cards */}
        <div className="lg:col-span-7 space-y-4">
          {activeDirection === 'gregToSeshat' ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
                    <Sparkles className="w-3 h-3" />
                    Calculated Seshat Coordinate
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {convertedSeshat.type === 'standard'
                      ? `Year ${convertedSeshat.year}, Month ${convertedSeshat.month?.number} (${convertedSeshat.month?.name}), Day ${convertedSeshat.day}`
                      : convertedSeshat.formattedSeshat}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Input Gregorian: {formatGregorianLong(convertedSeshat.gregorianDate)}
                  </p>
                </div>

                <button
                  id="copy-seshat-coord-btn"
                  onClick={() => {
                    const text = convertedSeshat.type === 'standard'
                      ? `Year ${convertedSeshat.year}, Month ${convertedSeshat.month?.number} (${convertedSeshat.month?.name}), Day ${convertedSeshat.day} (${convertedSeshat.weekdayName})`
                      : `Year ${convertedSeshat.year}, ${convertedSeshat.formattedSeshat}`;
                    copyToClipboard(text, 'seshat-coord');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all min-h-[44px] shrink-0"
                  aria-label="Copy Seshat Coordinate to clipboard"
                >
                  {copiedKey === 'seshat-coord' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Coordinate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Coordinates Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Seshat Year</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    Year {convertedSeshat.year}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {convertedSeshat.year === 0
                      ? 'Epoch Year'
                      : convertedSeshat.year < 0
                      ? `${Math.abs(convertedSeshat.year)} yrs pre-epoch`
                      : `${convertedSeshat.year} yrs post-epoch`}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Day of Year</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    Day {convertedSeshat.dayOfYear}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    of {convertedSeshat.isLeapYear ? '366 (Yleap)' : '365 (Ycommon)'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Weekday</div>
                  <div className="text-lg font-extrabold text-indigo-700">
                    {convertedSeshat.weekdayName || 'Epagomenal'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {convertedSeshat.weekdayNumber ? `Invariant #${convertedSeshat.weekdayNumber}` : 'Non-weekly day'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Week of Year</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {convertedSeshat.weekOfYear ? `Week ${convertedSeshat.weekOfYear}` : 'Year Buffer'}
                  </div>
                  <div className="text-[10px] text-slate-400">Standard 52 Weeks</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Fiscal Quarter</div>
                  <div className="text-lg font-extrabold text-slate-900">
                    {convertedSeshat.quarter ? `Quarter ${convertedSeshat.quarter}` : 'Year-End'}
                  </div>
                  <div className="text-[10px] text-slate-400">91 Days Invariant</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500">Solar Epoch Sync</div>
                  <div className="text-lg font-extrabold text-emerald-700">0.0% Variance</div>
                  <div className="text-[10px] text-slate-400">Zero Drift Buffer</div>
                </div>
              </div>

              {/* Month Significance Callout */}
              {convertedSeshat.type === 'standard' && convertedSeshat.month && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
                  <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Linguistic & Symbolic Archetype
                  </div>
                  <div className="text-sm text-amber-950 font-medium">
                    Month {convertedSeshat.month.number} ({convertedSeshat.month.name} ·{' '}
                    {convertedSeshat.month.egyptianNumeral}): {convertedSeshat.month.significance}
                  </div>
                </div>
              )}

              {/* Astronomical Lunar Phase Card */}
              <LunarPhaseCard
                lunarInfo={getLunarDayInfo(convertedSeshat.gregorianDate, convertedSeshat.year)}
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                    <Calendar className="w-3 h-3" />
                    Calculated Gregorian Equivalent
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatGregorianLong(convertedGregorian)}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    ISO Format: {formatGregorianISO(convertedGregorian)}
                  </p>
                </div>

                <button
                  id="copy-greg-coord-btn"
                  onClick={() => {
                    const text = `${formatGregorianLong(convertedGregorian)} (${formatGregorianISO(convertedGregorian)})`;
                    copyToClipboard(text, 'greg-coord');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 transition-all min-h-[44px] shrink-0"
                  aria-label="Copy Gregorian Date to clipboard"
                >
                  {copiedKey === 'greg-coord' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Date</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold text-slate-700">Unix Timestamp:</span>
                  <span className="font-mono text-slate-900">
                    {Math.floor(convertedGregorian.getTime() / 1000)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="font-semibold text-slate-700">Gregorian Day of Week:</span>
                  <span className="text-slate-900">
                    {convertedGregorian.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Solar Calibration Status:</span>
                  <span className="text-emerald-700 font-bold">Synchronized</span>
                </div>
              </div>

              {/* Astronomical Lunar Phase Card */}
              <LunarPhaseCard
                lunarInfo={getLunarDayInfo(convertedGregorian, seshatYearInput)}
              />
            </div>
          )}

          {/* Mathematical Formulation Reference Card */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <Calculator className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Section 4: Mathematical Architecture Formulation
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div>
                <span className="text-slate-400">Common Year:</span>
                <div className="text-slate-200 font-bold mt-0.5">
                  Ycommon = (13 × 28) + I₁ = 365 days
                </div>
              </div>
              <div>
                <span className="text-slate-400">Leap Year:</span>
                <div className="text-slate-200 font-bold mt-0.5">
                  Yleap = (13 × 28) + I₁ + I₂ = 366 days
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 mt-2">
              Every month Mm maintains an invariant cardinality of exactly 28 days (|Mm| = 28 ∀m ∈ {'{1,...,13}'}).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
