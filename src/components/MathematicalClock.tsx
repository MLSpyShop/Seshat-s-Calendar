import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  getAllCelestialPositions,
  getActiveAspects,
  getZodiacSignForLongitude,
  calculateSunLongitude,
  calculateMoonLongitude,
  calculateNorthNodeLongitude,
  ZODIAC_SIGNS,
  normalizeDeg,
  getNextAstroEvents,
  getAstroEventsForSeshatYear,
} from '../utils/astronomyMath';
import {
  gregorianToSeshat,
  seshatToGregorian,
  formatGregorianLong,
  formatGregorianISO,
  isSeshatLeapYear,
} from '../utils/calendarMath';
import { MONTHS } from '../data';
import { CelestialBodyPosition, AspectInfo, AstroEvent } from '../types';
import {
  Clock,
  Compass,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Layers,
  ArrowRight,
  FastForward,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';

interface MathematicalClockProps {
  onSelectDate?: (gregorianDate: Date) => void;
}

export const MathematicalClock: React.FC<MathematicalClockProps> = ({ onSelectDate }) => {
  // Current simulated or live time
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeedDaysPerSec, setPlaySpeedDaysPerSec] = useState<number>(1);
  const [selectedBody, setSelectedBody] = useState<CelestialBodyPosition | null>(null);
  const [filterAspect, setFilterAspect] = useState<string>('all');

  const animationRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());

  // Real-time ticking if live
  useEffect(() => {
    if (!isLive || isPlaying) return;
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive, isPlaying]);

  // Animation loop when playing forward
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    lastTickTimeRef.current = Date.now();

    const loop = () => {
      const now = Date.now();
      const dtSec = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      setCurrentDate((prev) => {
        const addedMs = dtSec * playSpeedDaysPerSec * 86400000;
        return new Date(prev.getTime() + addedMs);
      });

      animationRef.current = requestAnimationFrame(loop);
    };

    animationRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, playSpeedDaysPerSec]);

  // Celestial Calculations
  const celestialBodies = useMemo(() => getAllCelestialPositions(currentDate), [currentDate]);
  const activeAspects = useMemo(() => getActiveAspects(celestialBodies), [celestialBodies]);
  const seshatDate = useMemo(() => gregorianToSeshat(currentDate), [currentDate]);
  const nextEvents = useMemo(() => getNextAstroEvents(currentDate), [currentDate]);

  const sun = useMemo(() => celestialBodies.find((b) => b.id === 'sun'), [celestialBodies]);
  const moon = useMemo(() => celestialBodies.find((b) => b.id === 'moon'), [celestialBodies]);
  const northNode = useMemo(() => celestialBodies.find((b) => b.id === 'north_node'), [celestialBodies]);
  const southNode = useMemo(() => celestialBodies.find((b) => b.id === 'south_node'), [celestialBodies]);

  // Eclipse proximity detection (Angle between Sun and nearest node)
  const nodeProximityDeg = useMemo(() => {
    if (!sun || !northNode) return 999;
    const diffN = Math.abs(sun.eclipticLongitude - northNode.eclipticLongitude);
    const diffN360 = diffN > 180 ? 360 - diffN : diffN;
    const diffS = Math.abs(sun.eclipticLongitude - ((northNode.eclipticLongitude + 180) % 360));
    const diffS360 = diffS > 180 ? 360 - diffS : diffS;
    return Math.min(diffN360, diffS360);
  }, [sun, northNode]);

  const isEclipseWindowOpen = nodeProximityDeg <= 18.5; // Eclipse season window

  // Clock Dial Geometry
  const size = 640;
  const center = size / 2;
  const rOuter = 295;
  const r24h = 280;
  const rMonths = 245;
  const rZodiac = 195;
  const rInner = 145;

  // Convert longitude (0° at Aries) to Clock Angle in Radians/Degrees.
  // Standard astrological charts place 0° Aries at Left (9 o'clock) or Top (12 o'clock).
  // Here 0° Aries is at Top (0° / -90° standard polar) and runs counter-clockwise to match natural celestial motion.
  const lonToAngle = (lon: number) => {
    // 0° at top (12 o'clock), counter-clockwise
    return (270 - lon) * (Math.PI / 180);
  };

  const lonToClockDeg = (lon: number) => {
    // Top is 0°, clockwise coordinate for SVG rotation:
    return normalizeDeg(lon + 90);
  };

  // Jump handlers
  const handleJumpToDate = (targetDate: Date) => {
    setIsLive(false);
    setIsPlaying(false);
    setCurrentDate(new Date(targetDate));
  };

  const handleJumpToNow = () => {
    setIsPlaying(false);
    setIsLive(true);
    setCurrentDate(new Date());
  };

  const handleJumpToEpoch = () => {
    setIsLive(false);
    setIsPlaying(false);
    setCurrentDate(new Date(Date.UTC(2030, 3, 1, 0, 0, 0))); // April 1, 2030 CE
  };

  // 24 Hour ticks (UTC)
  const hours24 = Array.from({ length: 24 }, (_, i) => i);

  // Time scrubber handler (slider from 2026 to 2035)
  const epochSliderStart = new Date(Date.UTC(2026, 0, 1)).getTime();
  const epochSliderEnd = new Date(Date.UTC(2035, 11, 31)).getTime();
  const currentSliderVal = Math.min(
    epochSliderEnd,
    Math.max(epochSliderStart, currentDate.getTime())
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLive(false);
    setIsPlaying(false);
    setCurrentDate(new Date(Number(e.target.value)));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Chronometric Status & Eclipse Warning */}
      <div className="bg-linear-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-indigo-900/60 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Full-Spectrum Mathematical Clock
              </span>
              {isEclipseWindowOpen ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 animate-pulse flex items-center gap-1 shadow-xs">
                  <span>☀️🌑</span>
                  <span>ECLIPSE SEASON ACTIVE (Nodal Orb {nodeProximityDeg.toFixed(1)}°)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Nodal Axis: {nodeProximityDeg.toFixed(1)}° from Sun
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Astrological & Astronomical Dial</span>
              <span className="text-amber-400 font-mono text-xl sm:text-2xl">
                {currentDate.toISOString().slice(11, 19)} UTC
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
              <span className="font-semibold text-emerald-300">
                Seshat: {seshatDate.formattedSeshat}
              </span>
              <span>·</span>
              <span>Gregorian: {formatGregorianLong(currentDate)}</span>
              <span>·</span>
              <span className="font-mono text-amber-300">
                Sun: {sun ? `${sun.degreesInSign}°${String(sun.minutesInSign).padStart(2, '0')}' ${sun.signSymbol} ${sun.zodiacSign}` : ''}
              </span>
              <span>·</span>
              <span className="font-mono text-indigo-300">
                Moon: {moon ? `${moon.degreesInSign}°${String(moon.minutesInSign).padStart(2, '0')}' ${moon.signSymbol} ${moon.zodiacSign}` : ''}
              </span>
            </div>
          </div>

          {/* Controls: Play/Pause, Speed, Jump to Epoch */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={() => {
                setIsLive(false);
                setIsPlaying(!isPlaying);
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs active:scale-95 ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-500 text-slate-950'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Motion' : 'Simulate Orbits'}</span>
            </button>

            {/* Speed Multiplier */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {[
                { label: '1d/s', val: 1 },
                { label: '7d/s', val: 7 },
                { label: '30d/s', val: 30 },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setPlaySpeedDaysPerSec(s.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    playSpeedDaysPerSec === s.val
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleJumpToNow}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 ${
                isLive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Sync with Live Real-Time Clock"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isLive ? 'Live Real-Time' : 'Sync to Now'}</span>
            </button>

            <button
              onClick={handleJumpToEpoch}
              className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-extrabold bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 text-slate-950 flex items-center gap-1.5 shadow-xs transition-all"
              title="Jump to Seshat Year 0 Epoch Launch (April 1, 2030 CE)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Year 0 Epoch</span>
            </button>
          </div>
        </div>

        {/* Time Travel Scrubber Slider */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Historical & Future Orbit Scrubber (2026 – 2035 CE)</span>
            <span className="font-mono text-amber-300 font-bold">
              {formatGregorianLong(currentDate)}
            </span>
          </div>
          <input
            type="range"
            min={epochSliderStart}
            max={epochSliderEnd}
            step={86400000} // 1 day steps
            value={currentSliderVal}
            onChange={handleSliderChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>
      </div>

      {/* Main Astrolabe Dial & Live Telemetry Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center: Interactive SVG Clock Astrolabe (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-50 text-amber-600 rounded-lg">
                <Sun className="w-4 h-4" />
              </span>
              <span className="font-bold text-slate-900 uppercase tracking-wide">
                Astronomical Geocentric Ecliptic Sphere
              </span>
            </div>
            <span className="text-slate-500 font-mono text-[11px]">
              Invariant 13-Month & 360° Zodiac Syncretism
            </span>
          </div>

          {/* SVG Dial */}
          <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full drop-shadow-md select-none"
            >
              <defs>
                {/* Radial Gradients */}
                <radialGradient id="clockCenterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="70%" stopColor="#020617" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
                <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fef08a" stopOpacity="1" />
                  <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="eclipseHalo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Background Outer Ring */}
              <circle
                cx={center}
                cy={center}
                r={rOuter}
                fill="#0b0f19"
                stroke="#1e293b"
                strokeWidth="4"
              />

              {/* 24-Hour Dial Ring */}
              <circle
                cx={center}
                cy={center}
                r={r24h}
                fill="none"
                stroke="#334155"
                strokeWidth="1.5"
                strokeDasharray="2,4"
              />

              {/* 24 Hour Numbers & Ticks */}
              {hours24.map((h) => {
                const angle = (h / 24) * 2 * Math.PI - Math.PI / 2; // 0 at top
                const x1 = center + (r24h - 6) * Math.cos(angle);
                const y1 = center + (r24h - 6) * Math.sin(angle);
                const x2 = center + (r24h + 6) * Math.cos(angle);
                const y2 = center + (r24h + 6) * Math.sin(angle);
                const xt = center + (r24h - 14) * Math.cos(angle);
                const yt = center + (r24h - 14) * Math.sin(angle);

                return (
                  <g key={`hour-${h}`}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="1" />
                    {h % 3 === 0 && (
                      <text
                        x={xt}
                        y={yt}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {h}h
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Seshat 13 Months Ring: 13 equal segments of (364 / 13 = 28 days = 27.69° each) + Intercalaris gateway */}
              {MONTHS.map((m, idx) => {
                const startAngle = (idx / 13) * 2 * Math.PI - Math.PI / 2;
                const endAngle = ((idx + 1) / 13) * 2 * Math.PI - Math.PI / 2;
                const midAngle = (startAngle + endAngle) / 2;
                const isCurrentMonth =
                  seshatDate.type === 'standard' && seshatDate.month?.number === m.number;

                // Wedge Arc
                const r1 = rMonths;
                const r0 = rZodiac;
                const x1 = center + r1 * Math.cos(startAngle);
                const y1 = center + r1 * Math.sin(startAngle);
                const x2 = center + r1 * Math.cos(endAngle);
                const y2 = center + r1 * Math.sin(endAngle);
                const x3 = center + r0 * Math.cos(endAngle);
                const y3 = center + r0 * Math.sin(endAngle);
                const x4 = center + r0 * Math.cos(startAngle);
                const y4 = center + r0 * Math.sin(startAngle);

                const d = `M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 0 0 ${x4} ${y4} Z`;

                const xt = center + ((r1 + r0) / 2) * Math.cos(midAngle);
                const yt = center + ((r1 + r0) / 2) * Math.sin(midAngle);

                return (
                  <g key={`seshat-month-${m.number}`}>
                    <path
                      d={d}
                      fill={isCurrentMonth ? '#1e1b4b' : idx % 2 === 0 ? '#0f172a' : '#141e33'}
                      stroke={isCurrentMonth ? '#f59e0b' : '#334155'}
                      strokeWidth={isCurrentMonth ? '2' : '1'}
                      className="transition-colors hover:fill-indigo-900 cursor-pointer"
                    >
                      <title>{`Month ${m.number}: ${m.name} (28 Days) · ${m.theme}`}</title>
                    </path>
                    <text
                      x={xt}
                      y={yt}
                      fill={isCurrentMonth ? '#fbbf24' : '#cbd5e1'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      M{m.number}
                    </text>
                  </g>
                );
              })}

              {/* 12 Zodiac Houses / Constellations (rZodiac to rInner) */}
              {ZODIAC_SIGNS.map((z, idx) => {
                // 30 degrees per sign, counter-clockwise from Aries at Top
                const startDegAngle = idx * 30;
                const endDegAngle = (idx + 1) * 30;
                const startRad = (270 - startDegAngle) * (Math.PI / 180);
                const endRad = (270 - endDegAngle) * (Math.PI / 180);
                const midRad = (startRad + endRad) / 2;

                const r1 = rZodiac;
                const r0 = rInner;
                const x1 = center + r1 * Math.cos(startRad);
                const y1 = center + r1 * Math.sin(startRad);
                const x2 = center + r1 * Math.cos(endRad);
                const y2 = center + r1 * Math.sin(endRad);
                const x3 = center + r0 * Math.cos(endRad);
                const y3 = center + r0 * Math.sin(endRad);
                const x4 = center + r0 * Math.cos(startRad);
                const y4 = center + r0 * Math.sin(startRad);

                // Sweep flag 0 because angles are decreasing counter-clockwise
                const d = `M ${x1} ${y1} A ${r1} ${r1} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${r0} ${r0} 0 0 1 ${x4} ${y4} Z`;

                const xt = center + ((r1 + r0) / 2) * Math.cos(midRad);
                const yt = center + ((r1 + r0) / 2) * Math.sin(midRad);

                const isSunHere = sun?.zodiacSign === z.name;

                return (
                  <g key={`zodiac-sign-${z.name}`}>
                    <path
                      d={d}
                      fill={isSunHere ? `${z.color}33` : '#020617'}
                      stroke={z.color}
                      strokeWidth={isSunHere ? '2' : '1'}
                      strokeOpacity={isSunHere ? '1' : '0.4'}
                      className="transition-colors hover:fill-slate-800"
                    >
                      <title>{`${z.symbol} ${z.name} (${z.element} · ${z.quality}) · 0°-30°`}</title>
                    </path>
                    <text
                      x={xt}
                      y={yt}
                      fill={z.color}
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {z.symbol}
                    </text>
                  </g>
                );
              })}

              {/* Central Astrolabe Hub */}
              <circle
                cx={center}
                cy={center}
                r={rInner}
                fill="url(#clockCenterGlow)"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Eclipse Nodal Halo Warning in Hub if active */}
              {isEclipseWindowOpen && (
                <circle
                  cx={center}
                  cy={center}
                  r={rInner - 5}
                  fill="url(#eclipseHalo)"
                  className="animate-pulse"
                />
              )}

              {/* Aspect Lines / Geometric Chords across the Hub */}
              {activeAspects.map((asp, idx) => {
                if (filterAspect !== 'all' && asp.aspectName.toLowerCase() !== filterAspect) {
                  return null;
                }

                // Find the two bodies
                const p1Name = asp.planet1.split(' ')[0];
                const p2Name = asp.planet2.split(' ')[0];
                const b1 = celestialBodies.find((b) => b.name === p1Name);
                const b2 = celestialBodies.find((b) => b.name === p2Name);
                if (!b1 || !b2) return null;

                const a1 = lonToAngle(b1.eclipticLongitude);
                const a2 = lonToAngle(b2.eclipticLongitude);
                const x1 = center + (rInner - 8) * Math.cos(a1);
                const y1 = center + (rInner - 8) * Math.sin(a1);
                const x2 = center + (rInner - 8) * Math.cos(a2);
                const y2 = center + (rInner - 8) * Math.sin(a2);

                return (
                  <line
                    key={`aspect-line-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={asp.color}
                    strokeWidth={asp.orb < 2 ? '2' : '1'}
                    strokeDasharray={asp.aspectName === 'Square' || asp.aspectName === 'Opposition' ? '3,3' : 'none'}
                    opacity={Math.max(0.3, 1 - asp.orb / 8)}
                  >
                    <title>{`${asp.planet1} ${asp.symbol} ${asp.planet2} (${asp.aspectName}, orb ${asp.orb}°)`}</title>
                  </line>
                );
              })}

              {/* Nodal Axis Line (Ascending ☊ to Descending ☋) */}
              {northNode && (
                (() => {
                  const aNode = lonToAngle(northNode.eclipticLongitude);
                  const x1 = center + (rInner + 40) * Math.cos(aNode);
                  const y1 = center + (rInner + 40) * Math.sin(aNode);
                  const x2 = center - (rInner + 40) * Math.cos(aNode);
                  const y2 = center - (rInner + 40) * Math.sin(aNode);

                  return (
                    <g>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#c084fc"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        opacity="0.8"
                      />
                      {/* North Node Glyph */}
                      <circle cx={x1} cy={y1} r="9" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
                      <text
                        x={x1}
                        y={y1}
                        fill="#f3e8ff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        ☊
                      </text>
                      {/* South Node Glyph */}
                      <circle cx={x2} cy={y2} r="9" fill="#581c87" stroke="#c084fc" strokeWidth="1.5" />
                      <text
                        x={x2}
                        y={y2}
                        fill="#f3e8ff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        ☋
                      </text>
                    </g>
                  );
                })()
              )}

              {/* Planetary Bodies on the Dial */}
              {celestialBodies.map((b) => {
                if (b.id === 'north_node' || b.id === 'south_node') return null; // handled via nodal axis
                const isSun = b.id === 'sun';
                const isMoon = b.id === 'moon';
                const angle = lonToAngle(b.eclipticLongitude);
                const rBody = isSun ? rInner + 28 : isMoon ? rInner + 24 : rInner + 16;
                const bx = center + rBody * Math.cos(angle);
                const by = center + rBody * Math.sin(angle);

                const isSelected = selectedBody?.id === b.id;

                return (
                  <g
                    key={`body-${b.id}`}
                    onClick={() => setSelectedBody(b)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    {/* Beam to Center */}
                    <line
                      x1={center}
                      y1={center}
                      x2={bx}
                      y2={by}
                      stroke={b.color}
                      strokeWidth={isSun || isMoon ? '1.5' : '0.75'}
                      strokeOpacity={isSun || isMoon ? '0.7' : '0.4'}
                    />

                    {/* Outer Glow for Sun */}
                    {isSun && (
                      <circle cx={bx} cy={by} r="18" fill="url(#sunGlow)" />
                    )}

                    {/* Body Disc */}
                    <circle
                      cx={bx}
                      cy={by}
                      r={isSun ? 12 : isMoon ? 10 : 8}
                      fill={b.color}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth={isSelected ? '2' : '1'}
                    />

                    {/* Symbol */}
                    <text
                      x={bx}
                      y={by}
                      fill={isSun ? '#78350f' : isMoon ? '#0f172a' : '#ffffff'}
                      fontSize={isSun ? '12' : isMoon ? '10' : '9'}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      {b.symbol}
                    </text>

                    {/* Retrograde Marker */}
                    {b.isRetrograde && (
                      <text
                        x={bx + 8}
                        y={by - 8}
                        fill="#ef4444"
                        fontSize="8"
                        fontWeight="black"
                        fontFamily="sans-serif"
                      >
                        ℞
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Central Golden Solar Emblem */}
              <circle cx={center} cy={center} r="24" fill="#1e1b4b" stroke="#f59e0b" strokeWidth="2" />
              <text
                x={center}
                y={center - 2}
                fill="#fbbf24"
                fontSize="18"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
              >
                𓋹
              </text>
              <text
                x={center}
                y={center + 14}
                fill="#94a3b8"
                fontSize="7"
                fontFamily="monospace"
                textAnchor="middle"
              >
                SESHAT
              </text>
            </svg>
          </div>

          {/* Quick Dial Legend */}
          <div className="w-full mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Sun ☉</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span>Moon ☽</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Nodes ☊☋</span>
              </span>
              <span className="flex items-center gap-1 text-red-500 font-bold">
                <span>℞</span>
                <span>Retrograde</span>
              </span>
            </div>
            <span className="font-semibold text-slate-700">Click any planet to inspect coordinates</span>
          </div>
        </div>

        {/* Right: Live Astrological Telemetry, Eclipses & Aspect Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Next Cosmic Milestones Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-amber-100 text-amber-900 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Upcoming Cosmic Gateways
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Synchronized
              </span>
            </div>

            {/* Next Solar Eclipse */}
            {nextEvents.nextSolarEclipse && (
              <div
                onClick={() => handleJumpToDate(nextEvents.nextSolarEclipse!.utcDate)}
                className="p-3 bg-linear-to-r from-amber-50 to-orange-50/70 border border-amber-300/80 rounded-xl cursor-pointer hover:border-amber-500 transition-all group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <span>☀️🌑</span>
                    <span>Next Solar Eclipse</span>
                  </span>
                  <span className="px-2 py-0.5 bg-amber-200 text-amber-950 font-bold text-[10px] rounded">
                    {nextEvents.nextSolarEclipse.timeStr}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {nextEvents.nextSolarEclipse.title}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {formatGregorianLong(nextEvents.nextSolarEclipse.utcDate)} · {nextEvents.nextSolarEclipse.seshatFormatted}
                </div>
                <div className="mt-2 text-[11px] text-amber-800 group-hover:text-amber-950 flex items-center gap-1 font-semibold">
                  <span>Fast-travel clock to eclipse moment</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            )}

            {/* Next Lunar Eclipse */}
            {nextEvents.nextLunarEclipse && (
              <div
                onClick={() => handleJumpToDate(nextEvents.nextLunarEclipse!.utcDate)}
                className="p-3 bg-linear-to-r from-red-50 to-rose-50/70 border border-red-200 rounded-xl cursor-pointer hover:border-red-400 transition-all group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-red-950 flex items-center gap-1.5">
                    <span>🌕🔴</span>
                    <span>Next Lunar Eclipse</span>
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-900 font-bold text-[10px] rounded">
                    {nextEvents.nextLunarEclipse.timeStr}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900 mt-1">
                  {nextEvents.nextLunarEclipse.title}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {formatGregorianLong(nextEvents.nextLunarEclipse.utcDate)}
                </div>
              </div>
            )}

            {/* Next Cardinal Solstice or Equinox */}
            {nextEvents.nextEquinoxOrSolstice && (
              <div
                onClick={() => handleJumpToDate(nextEvents.nextEquinoxOrSolstice!.utcDate)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-400 transition-all group text-xs"
              >
                <div className="flex items-center justify-between text-slate-500 font-semibold mb-0.5">
                  <span>Next Cardinal Station</span>
                  <span className="font-mono">{nextEvents.nextEquinoxOrSolstice.timeStr}</span>
                </div>
                <div className="font-bold text-slate-900">
                  {nextEvents.nextEquinoxOrSolstice.title}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  {formatGregorianLong(nextEvents.nextEquinoxOrSolstice.utcDate)}
                </div>
              </div>
            )}
          </div>

          {/* Planetary Ephemeris Coordinates Table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-indigo-50 text-indigo-700 rounded-lg">
                  <Clock className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Ephemeris Coordinates ({celestialBodies.length} Bodies)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">J2000.0 Keplerian</span>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
              {celestialBodies.map((b) => {
                const isSelected = selectedBody?.id === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBody(b)}
                    className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{ backgroundColor: `${b.color}25`, color: b.color }}
                      >
                        {b.symbol}
                      </span>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span>{b.name}</span>
                          {b.isRetrograde && (
                            <span className="px-1 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700">
                              ℞ Retrograde
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {b.degreesInSign}°{String(b.minutesInSign).padStart(2, '0')}' {b.signSymbol} {b.zodiacSign}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold">
                        {b.eclipticLongitude.toFixed(2)}°
                      </div>
                      <div className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                        {b.orbitalSpeedDegPerDay !== undefined
                          ? `${b.orbitalSpeedDegPerDay > 0 ? '+' : ''}${b.orbitalSpeedDegPerDay}°/d`
                          : ''}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Astrological Aspects Matrix */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-purple-50 text-purple-700 rounded-lg">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Active Planetary Aspects ({activeAspects.length})
                </h3>
              </div>

              {/* Aspect Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px]">
                <button
                  onClick={() => setFilterAspect('all')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    filterAspect === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterAspect('conjunction')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    filterAspect === 'conjunction' ? 'bg-amber-400 text-slate-950' : 'text-slate-600'
                  }`}
                  title="Conjunction (0°)"
                >
                  ☌
                </button>
                <button
                  onClick={() => setFilterAspect('trine')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    filterAspect === 'trine' ? 'bg-blue-600 text-white' : 'text-slate-600'
                  }`}
                  title="Trine (120°)"
                >
                  △
                </button>
                <button
                  onClick={() => setFilterAspect('square')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    filterAspect === 'square' ? 'bg-red-600 text-white' : 'text-slate-600'
                  }`}
                  title="Square (90°)"
                >
                  □
                </button>
                <button
                  onClick={() => setFilterAspect('opposition')}
                  className={`px-1.5 py-0.5 rounded font-bold ${
                    filterAspect === 'opposition' ? 'bg-purple-600 text-white' : 'text-slate-600'
                  }`}
                  title="Opposition (180°)"
                >
                  ☍
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {activeAspects.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-4">
                  No aspects within active orbs at this instant.
                </div>
              ) : (
                activeAspects.map((asp, idx) => (
                  <div
                    key={`asp-${idx}`}
                    className="p-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: `${asp.color}20`, color: asp.color }}
                      >
                        {asp.symbol}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {asp.planet1} {asp.symbol} {asp.planet2}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {asp.aspectName} ({asp.exactAngle}° · orb {asp.orb}°)
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        asp.nature === 'Harmonious'
                          ? 'bg-blue-100 text-blue-800'
                          : asp.nature === 'Dynamic'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {asp.nature}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
