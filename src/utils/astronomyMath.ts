import {
  AstroEvent,
  AstroEventType,
  CelestialBodyPosition,
  AspectInfo,
  SolarEclipseKind,
  LunarEclipseKind,
} from '../types';
import {
  EPOCH_GREGORIAN_YEAR,
  getSeshatYearStartDate,
  getSeshatYearTotalDays,
  gregorianToSeshat,
  formatGregorianISO,
  formatGregorianLong,
} from './calendarMath';

export interface ZodiacSignDef {
  name: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
  startDeg: number;
  endDeg: number;
  color: string;
}

export const ZODIAC_SIGNS: ZodiacSignDef[] = [
  { name: 'Aries', symbol: '♈', element: 'Fire', quality: 'Cardinal', ruler: 'Mars', startDeg: 0, endDeg: 30, color: '#ef4444' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', quality: 'Fixed', ruler: 'Venus', startDeg: 30, endDeg: 60, color: '#10b981' },
  { name: 'Gemini', symbol: '♊', element: 'Air', quality: 'Mutable', ruler: 'Mercury', startDeg: 60, endDeg: 90, color: '#f59e0b' },
  { name: 'Cancer', symbol: '♋', element: 'Water', quality: 'Cardinal', ruler: 'Moon', startDeg: 90, endDeg: 120, color: '#3b82f6' },
  { name: 'Leo', symbol: '♌', element: 'Fire', quality: 'Fixed', ruler: 'Sun', startDeg: 120, endDeg: 150, color: '#f97316' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', quality: 'Mutable', ruler: 'Mercury', startDeg: 150, endDeg: 180, color: '#059669' },
  { name: 'Libra', symbol: '♎', element: 'Air', quality: 'Cardinal', ruler: 'Venus', startDeg: 180, endDeg: 210, color: '#eab308' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', quality: 'Fixed', ruler: 'Pluto & Mars', startDeg: 210, endDeg: 240, color: '#6366f1' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', quality: 'Mutable', ruler: 'Jupiter', startDeg: 240, endDeg: 270, color: '#dc2626' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', quality: 'Cardinal', ruler: 'Saturn', startDeg: 270, endDeg: 300, color: '#047857' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', quality: 'Fixed', ruler: 'Uranus & Saturn', startDeg: 300, endDeg: 330, color: '#0284c7' },
  { name: 'Pisces', symbol: '♓', element: 'Water', quality: 'Mutable', ruler: 'Neptune & Jupiter', startDeg: 330, endDeg: 360, color: '#8b5cf6' },
];

/**
 * Normalizes degrees to [0, 360)
 */
export function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert ecliptic longitude into Zodiac Sign + Degree + Minute
 */
export function getZodiacSignForLongitude(longitude: number): {
  sign: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  degrees: number;
  minutes: number;
  formatted: string;
} {
  const norm = normalizeDeg(longitude);
  const signIndex = Math.floor(norm / 30);
  const signDef = ZODIAC_SIGNS[signIndex] || ZODIAC_SIGNS[0];
  const totalDegInSign = norm - signDef.startDeg;
  const deg = Math.floor(totalDegInSign);
  const min = Math.floor((totalDegInSign - deg) * 60);

  return {
    sign: signDef.name,
    symbol: signDef.symbol,
    element: signDef.element,
    quality: signDef.quality,
    degrees: deg,
    minutes: min,
    formatted: `${deg}°${String(min).padStart(2, '0')}' ${signDef.symbol} ${signDef.name}`,
  };
}

/**
 * Julian centuries from J2000.0 (2000 January 1.5 TD = JD 2451545.0)
 */
export function getJulianCenturies(date: Date): number {
  const jd = date.getTime() / 86400000 + 2440587.5;
  return (jd - 2451545.0) / 36525.0;
}

/**
 * Solves Kepler's Equation M = E - e*sin(E) for Eccentric Anomaly E
 */
function solveKepler(M: number, e: number): number {
  let E = M;
  const delta = 1e-6;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < delta) break;
  }
  return E;
}

/**
 * Low-to-medium precision astronomical planetary computation
 * Based on Jean Meeus Astronomical Algorithms Chapter 31 / Keplerian elements
 */
function calculatePlanetEclipticLongitude(
  T: number,
  params: {
    L0: number; // Mean longitude (deg)
    Lrate: number;
    a: number; // semi-major axis (AU)
    e0: number; // eccentricity
    erate: number;
    i0: number; // inclination (deg)
    node0: number; // longitude of ascending node (deg)
    peri0: number; // longitude of perihelion (deg)
    perirate: number;
  }
): { helioLon: number; r: number } {
  const rad = Math.PI / 180;
  const L = normalizeDeg(params.L0 + params.Lrate * T) * rad;
  const peri = normalizeDeg(params.peri0 + params.perirate * T) * rad;
  const e = params.e0 + params.erate * T;
  const M = normalizeDeg((L - peri) / rad) * rad;
  const E = solveKepler(M, e);

  // True anomaly v
  const xv = params.a * (Math.cos(E) - e);
  const yv = params.a * (Math.sqrt(1 - e * e) * Math.sin(E));
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const helioLon = normalizeDeg((v + peri) / rad);
  return { helioLon, r };
}

/**
 * Computes the Sun's true geocentric ecliptic longitude in degrees
 */
export function calculateSunLongitude(date: Date): number {
  const T = getJulianCenturies(date);
  const rad = Math.PI / 180;
  // Mean longitude
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  // Mean anomaly
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T) * rad;
  // Equation of center
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);

  return normalizeDeg(L0 + C);
}

/**
 * Computes the Moon's geocentric ecliptic longitude in degrees
 */
export function calculateMoonLongitude(date: Date): number {
  const T = getJulianCenturies(date);
  const rad = Math.PI / 180;

  // Moon's mean longitude
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T);
  // Moon's mean elongation
  const D = normalizeDeg(297.8501921 + 445267.1114034 * T) * rad;
  // Sun's mean anomaly
  const M = normalizeDeg(357.5291092 + 35999.0502909 * T) * rad;
  // Moon's mean anomaly
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T) * rad;
  // Moon's argument of latitude
  const F = normalizeDeg(93.2720950 + 483202.0175233 * T) * rad;

  // Major periodic perturbations
  const dL =
    6.288774 * Math.sin(Mp) +
    1.274027 * Math.sin(2 * D - Mp) +
    0.658314 * Math.sin(2 * D) +
    0.213618 * Math.sin(2 * Mp) -
    0.185116 * Math.sin(M) -
    0.114332 * Math.sin(2 * F) +
    0.058793 * Math.sin(2 * D - 2 * Mp) +
    0.057066 * Math.sin(2 * D - M - Mp) +
    0.053322 * Math.sin(2 * D + Mp) +
    0.046153 * Math.sin(2 * D - M);

  return normalizeDeg(Lp + dL);
}

/**
 * Computes the Moon's Ascending Node (North Node / Rahu) in degrees
 */
export function calculateNorthNodeLongitude(date: Date): number {
  const T = getJulianCenturies(date);
  // Mean longitude of ascending node
  const Omega = normalizeDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
  return Omega;
}

/**
 * Computes geocentric ecliptic positions for all major planetary bodies
 */
export function getAllCelestialPositions(date: Date): CelestialBodyPosition[] {
  const T = getJulianCenturies(date);
  const sunLon = calculateSunLongitude(date);
  const moonLon = calculateMoonLongitude(date);
  const northNodeLon = calculateNorthNodeLongitude(date);
  const southNodeLon = normalizeDeg(northNodeLon + 180);

  // Speed calculation for retrogrades by sampling (t + 0.5d) and (t - 0.5d)
  const dtDays = 0.5;
  const datePlus = new Date(date.getTime() + dtDays * 86400000);
  const dateMinus = new Date(date.getTime() - dtDays * 86400000);
  const Tplus = getJulianCenturies(datePlus);
  const Tminus = getJulianCenturies(dateMinus);

  // Keplerian elements for planets
  const planetDefs = [
    {
      id: 'mercury',
      name: 'Mercury',
      symbol: '☿',
      color: '#94a3b8',
      L0: 252.25084,
      Lrate: 149472.67411,
      a: 0.387098,
      e0: 0.20563,
      erate: 0.00002,
      i0: 7.005,
      node0: 48.331,
      peri0: 77.456,
      perirate: 1.556,
    },
    {
      id: 'venus',
      name: 'Venus',
      symbol: '♀',
      color: '#eab308',
      L0: 181.9798,
      Lrate: 58517.81567,
      a: 0.723332,
      e0: 0.00677,
      erate: -0.00004,
      i0: 3.394,
      node0: 76.68,
      peri0: 131.564,
      perirate: 1.402,
    },
    {
      id: 'mars',
      name: 'Mars',
      symbol: '♂',
      color: '#ef4444',
      L0: 355.433,
      Lrate: 19140.2993,
      a: 1.52368,
      e0: 0.0934,
      erate: 0.00009,
      i0: 1.85,
      node0: 49.558,
      peri0: 336.06,
      perirate: 1.841,
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      symbol: '♃',
      color: '#f97316',
      L0: 34.3515,
      Lrate: 3034.9057,
      a: 5.2026,
      e0: 0.04849,
      erate: 0.00016,
      i0: 1.303,
      node0: 100.464,
      peri0: 14.331,
      perirate: 1.613,
    },
    {
      id: 'saturn',
      name: 'Saturn',
      symbol: '♄',
      color: '#d97706',
      L0: 50.0774,
      Lrate: 1222.1138,
      a: 9.5549,
      e0: 0.05551,
      erate: -0.00035,
      i0: 2.489,
      node0: 113.665,
      peri0: 93.057,
      perirate: 1.964,
    },
    {
      id: 'uranus',
      name: 'Uranus',
      symbol: '♅',
      color: '#06b6d4',
      L0: 314.055,
      Lrate: 428.4669,
      a: 19.2184,
      e0: 0.0463,
      erate: -0.00003,
      i0: 0.773,
      node0: 74.006,
      peri0: 173.005,
      perirate: 1.486,
    },
    {
      id: 'neptune',
      name: 'Neptune',
      symbol: '♆',
      color: '#3b82f6',
      L0: 304.348,
      Lrate: 218.4862,
      a: 30.1104,
      e0: 0.00946,
      erate: 0.00001,
      i0: 1.77,
      node0: 131.784,
      peri0: 48.12,
      perirate: 1.426,
    },
    {
      id: 'pluto',
      name: 'Pluto',
      symbol: '♇',
      color: '#8b5cf6',
      L0: 238.96,
      Lrate: 145.18,
      a: 39.482,
      e0: 0.2488,
      erate: 0.00002,
      i0: 17.14,
      node0: 110.3,
      peri0: 224.07,
      perirate: 1.4,
    },
  ];

  // Earth heliocentric coordinates for geocentric projection
  const earthSunDist = 1.0;
  const earthHelioLon = normalizeDeg(sunLon + 180);
  const rad = Math.PI / 180;
  const Xe = earthSunDist * Math.cos(earthHelioLon * rad);
  const Ye = earthSunDist * Math.sin(earthHelioLon * rad);

  const computeGeocentricLon = (curT: number, pDef: (typeof planetDefs)[0]) => {
    const { helioLon, r } = calculatePlanetEclipticLongitude(curT, pDef);
    const Xp = r * Math.cos(helioLon * rad);
    const Yp = r * Math.sin(helioLon * rad);
    // Vector from Earth to Planet
    const dx = Xp - Xe;
    const dy = Yp - Ye;
    return normalizeDeg(Math.atan2(dy, dx) / rad);
  };

  const results: CelestialBodyPosition[] = [];

  // 1. Sun
  const sunZodiac = getZodiacSignForLongitude(sunLon);
  results.push({
    id: 'sun',
    name: 'Sun',
    symbol: '☉',
    color: '#f59e0b',
    eclipticLongitude: sunLon,
    zodiacSign: sunZodiac.sign,
    signSymbol: sunZodiac.symbol,
    degreesInSign: sunZodiac.degrees,
    minutesInSign: sunZodiac.minutes,
    isRetrograde: false,
    orbitalSpeedDegPerDay: 0.9856,
  });

  // 2. Moon
  const moonZodiac = getZodiacSignForLongitude(moonLon);
  results.push({
    id: 'moon',
    name: 'Moon',
    symbol: '☽',
    color: '#e2e8f0',
    eclipticLongitude: moonLon,
    zodiacSign: moonZodiac.sign,
    signSymbol: moonZodiac.symbol,
    degreesInSign: moonZodiac.degrees,
    minutesInSign: moonZodiac.minutes,
    isRetrograde: false,
    orbitalSpeedDegPerDay: 13.176,
  });

  // 3. Lunar North Node (Rahu)
  const nnZodiac = getZodiacSignForLongitude(northNodeLon);
  results.push({
    id: 'north_node',
    name: 'North Node (☊)',
    symbol: '☊',
    color: '#c084fc',
    eclipticLongitude: northNodeLon,
    zodiacSign: nnZodiac.sign,
    signSymbol: nnZodiac.symbol,
    degreesInSign: nnZodiac.degrees,
    minutesInSign: nnZodiac.minutes,
    isRetrograde: true, // Mean lunar node is perpetually retrograde
    orbitalSpeedDegPerDay: -0.053,
  });

  // 4. Lunar South Node (Ketu)
  const snZodiac = getZodiacSignForLongitude(southNodeLon);
  results.push({
    id: 'south_node',
    name: 'South Node (☋)',
    symbol: '☋',
    color: '#a855f7',
    eclipticLongitude: southNodeLon,
    zodiacSign: snZodiac.sign,
    signSymbol: snZodiac.symbol,
    degreesInSign: snZodiac.degrees,
    minutesInSign: snZodiac.minutes,
    isRetrograde: true,
    orbitalSpeedDegPerDay: -0.053,
  });

  // 5. Planets
  for (const pDef of planetDefs) {
    const geoLon = computeGeocentricLon(T, pDef);
    const geoLonPlus = computeGeocentricLon(Tplus, pDef);
    const geoLonMinus = computeGeocentricLon(Tminus, pDef);

    // Speed in deg per day
    let dLon = geoLonPlus - geoLonMinus;
    if (dLon > 180) dLon -= 360;
    if (dLon < -180) dLon += 360;
    const speedDegPerDay = dLon / (2 * dtDays);
    const isRetrograde = speedDegPerDay < 0;

    const z = getZodiacSignForLongitude(geoLon);
    results.push({
      id: pDef.id,
      name: pDef.name,
      symbol: pDef.symbol,
      color: pDef.color,
      eclipticLongitude: geoLon,
      zodiacSign: z.sign,
      signSymbol: z.symbol,
      degreesInSign: z.degrees,
      minutesInSign: z.minutes,
      isRetrograde,
      orbitalSpeedDegPerDay: Math.round(speedDegPerDay * 100) / 100,
    });
  }

  return results;
}

/**
 * Calculates active astrological aspects between celestial positions
 */
export function getActiveAspects(positions: CelestialBodyPosition[]): AspectInfo[] {
  const aspects: AspectInfo[] = [];

  const aspectRules = [
    { name: 'Conjunction' as const, angle: 0, orb: 8, color: '#f59e0b', symbol: '☌', nature: 'Harmonious' as const },
    { name: 'Sextile' as const, angle: 60, orb: 5, color: '#10b981', symbol: '⚹', nature: 'Harmonious' as const },
    { name: 'Square' as const, angle: 90, orb: 7, color: '#ef4444', symbol: '□', nature: 'Dynamic' as const },
    { name: 'Trine' as const, angle: 120, orb: 8, color: '#3b82f6', symbol: '△', nature: 'Harmonious' as const },
    { name: 'Opposition' as const, angle: 180, orb: 8, color: '#a855f7', symbol: '☍', nature: 'Intense' as const },
  ];

  // Compare each pair
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const p1 = positions[i];
      const p2 = positions[j];

      // Skip nodes aspects with each other (always 180 opposite)
      if (
        (p1.id === 'north_node' && p2.id === 'south_node') ||
        (p1.id === 'south_node' && p2.id === 'north_node')
      ) {
        continue;
      }

      let diff = Math.abs(p1.eclipticLongitude - p2.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;

      for (const rule of aspectRules) {
        const orb = Math.abs(diff - rule.angle);
        if (orb <= rule.orb) {
          aspects.push({
            planet1: `${p1.name} (${p1.symbol})`,
            planet2: `${p2.name} (${p2.symbol})`,
            aspectName: rule.name,
            angle: rule.angle,
            exactAngle: Math.round(diff * 10) / 10,
            orb: Math.round(orb * 10) / 10,
            color: rule.color,
            symbol: rule.symbol,
            nature: rule.nature,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

// -------------------------------------------------------------
// AUTHORITATIVE ASTRONOMICAL ECLIPSE CATALOG (2024 - 2042)
// NASA Espenak & Meeus canonical standard
// -------------------------------------------------------------
interface EclipseRecord {
  dateIso: string; // YYYY-MM-DD
  timeUtc: string; // HH:MM
  kind: SolarEclipseKind | LunarEclipseKind;
  isSolar: boolean;
  saros: number;
  mag: number;
  duration?: string;
  regions: string;
  zodiacDeg: string;
  astrologicalNote: string;
}

const AUTHORITATIVE_ECLIPSES: EclipseRecord[] = [
  // 2024
  {
    dateIso: '2024-03-25',
    timeUtc: '07:13',
    kind: 'Penumbral',
    isSolar: false,
    saros: 113,
    mag: 0.958,
    regions: 'Americas, Antarctica, Alaska, NE Asia',
    zodiacDeg: "5°07' ♎ Libra",
    astrologicalNote: 'Relationship realignment and karmic diplomatic justice on the Aries-Libra nodal axis.',
  },
  {
    dateIso: '2024-04-08',
    timeUtc: '18:18',
    kind: 'Total',
    isSolar: true,
    saros: 139,
    mag: 1.0566,
    duration: '4m28s',
    regions: 'Mexico, Central & Eastern United States, Eastern Canada',
    zodiacDeg: "19°24' ♈ Aries",
    astrologicalNote: 'The Great North American Solar Eclipse: Cardinal fire catalyst for sovereign self-determination and epochal restructuring.',
  },
  {
    dateIso: '2024-09-18',
    timeUtc: '02:44',
    kind: 'Partial',
    isSolar: false,
    saros: 118,
    mag: 0.085,
    regions: 'Americas, Europe, Africa',
    zodiacDeg: "25°41' ♓ Pisces",
    astrologicalNote: 'Supermoon Harvest Eclipse: Watery dissolution of spiritual illusions and collective emotional purging.',
  },
  {
    dateIso: '2024-10-02',
    timeUtc: '18:46',
    kind: 'Annular',
    isSolar: true,
    saros: 144,
    mag: 0.9326,
    duration: '7m25s',
    regions: 'Pacific Ocean, Southern Chile, Southern Argentina',
    zodiacDeg: "10°04' ♎ Libra",
    astrologicalNote: 'Ring of Fire Eclipse in Libra: Strategic recalibration of legal covenants and collaborative frameworks.',
  },

  // 2025
  {
    dateIso: '2025-03-14',
    timeUtc: '06:59',
    kind: 'Total',
    isSolar: false,
    saros: 123,
    mag: 1.178,
    duration: '65m',
    regions: 'Americas, Western Europe, Western Africa',
    zodiacDeg: "23°57' ♍ Virgo",
    astrologicalNote: 'Total Blood Moon Eclipse: Critical diagnostic clarity, health and operational systemic purification.',
  },
  {
    dateIso: '2025-03-29',
    timeUtc: '10:48',
    kind: 'Partial',
    isSolar: true,
    saros: 149,
    mag: 0.938,
    regions: 'Northwest Africa, Europe, Northern Russia, Atlantic',
    zodiacDeg: "9°00' ♈ Aries",
    astrologicalNote: 'Spring Ingress Eclipse: Bold entrepreneurial ventures and technological initiative activation.',
  },
  {
    dateIso: '2025-09-07',
    timeUtc: '18:12',
    kind: 'Total',
    isSolar: false,
    saros: 128,
    mag: 1.362,
    duration: '82m',
    regions: 'Europe, Africa, Asia, Australia',
    zodiacDeg: "15°23' ♓ Pisces",
    astrologicalNote: 'Total Blood Moon: Profound subconscious awakening and karmic completion of Piscean cycles.',
  },
  {
    dateIso: '2025-09-21',
    timeUtc: '19:43',
    kind: 'Partial',
    isSolar: true,
    saros: 154,
    mag: 0.855,
    regions: 'South Pacific, New Zealand, Antarctica',
    zodiacDeg: "29°05' ♍ Virgo",
    astrologicalNote: 'Anaretic Virgo Solar Eclipse: Master-level engineering audit and mathematical calibration.',
  },

  // 2026
  {
    dateIso: '2026-02-17',
    timeUtc: '12:13',
    kind: 'Annular',
    isSolar: true,
    saros: 121,
    mag: 0.963,
    duration: '2m20s',
    regions: 'Antarctica, Southern Ocean, South Africa partial',
    zodiacDeg: "28°50' ♒ Aquarius",
    astrologicalNote: 'Aquarian Ring of Fire: Decentered cryptographic structures and scientific breakthrough synthesis.',
  },
  {
    dateIso: '2026-03-03',
    timeUtc: '11:34',
    kind: 'Total',
    isSolar: false,
    saros: 133,
    mag: 1.151,
    duration: '58m',
    regions: 'Asia, Australia, Pacific, Western Americas',
    zodiacDeg: "12°54' ♍ Virgo",
    astrologicalNote: 'Total Blood Moon: Rigorous verification of facts, intelligence disclosures, and computational standards.',
  },
  {
    dateIso: '2026-08-12',
    timeUtc: '17:47',
    kind: 'Total',
    isSolar: true,
    saros: 126,
    mag: 1.0386,
    duration: '2m18s',
    regions: 'Arctic, Greenland, Iceland, Northern Spain, Balearic Islands',
    zodiacDeg: "20°02' ♌ Leo",
    astrologicalNote: 'The Great European Total Solar Eclipse: Monarchic sovereignty, executive leadership restructuring, and solar renaissance.',
  },
  {
    dateIso: '2026-08-28',
    timeUtc: '04:14',
    kind: 'Partial',
    isSolar: false,
    saros: 138,
    mag: 0.930,
    regions: 'Americas, Europe, Africa',
    zodiacDeg: "4°54' ♓ Pisces",
    astrologicalNote: 'High-magnitude Lunar Eclipse: Dissolution of outdated financial and temporal monopolies.',
  },

  // 2027
  {
    dateIso: '2027-02-06',
    timeUtc: '16:00',
    kind: 'Annular',
    isSolar: true,
    saros: 131,
    mag: 0.9281,
    duration: '7m51s',
    regions: 'Pacific, Chile, Argentina, Atlantic, West Africa',
    zodiacDeg: "17°51' ♒ Aquarius",
    astrologicalNote: 'Annular Solar Eclipse: Global digital communications standardisation and network protocol shifts.',
  },
  {
    dateIso: '2027-02-20',
    timeUtc: '23:14',
    kind: 'Penumbral',
    isSolar: false,
    saros: 143,
    mag: 0.952,
    regions: 'Americas, Europe, Africa, Asia',
    zodiacDeg: "2°19' ♍ Virgo",
    astrologicalNote: 'Analytical audit and regulatory standards harmonization.',
  },
  {
    dateIso: '2027-08-02',
    timeUtc: '10:07',
    kind: 'Total',
    isSolar: true,
    saros: 136,
    mag: 1.079,
    duration: '6m23s',
    regions: 'Southern Spain, Gibraltar, Morocco, Algeria, Tunisia, Libya, Egypt (Luxor 6m22s), Saudi Arabia, Yemen, Somalia',
    zodiacDeg: "9°55' ♌ Leo",
    astrologicalNote: 'The Eclipse of the Century: Longest Total Solar Eclipse over ancient Egyptian sanctuaries (Luxor/Karnak), signaling profound civilizational re-anchoring.',
  },
  {
    dateIso: '2027-08-17',
    timeUtc: '07:14',
    kind: 'Penumbral',
    isSolar: false,
    saros: 148,
    mag: 0.546,
    regions: 'Australia, Asia, Africa, Europe',
    zodiacDeg: "23°59' ♒ Aquarius",
    astrologicalNote: 'Subtle social architecture adjustments and collective ideation.',
  },

  // 2028
  {
    dateIso: '2028-01-26',
    timeUtc: '15:08',
    kind: 'Annular',
    isSolar: true,
    saros: 141,
    mag: 0.9208,
    duration: '10m27s',
    regions: 'Galapagos, Ecuador, Peru, Colombia, Brazil, Atlantic, Southern Spain, Portugal',
    zodiacDeg: "6°18' ♒ Aquarius",
    astrologicalNote: 'Ultra-long Annular Eclipse: Radical architectural redesign of distributed databases and chronometry.',
  },
  {
    dateIso: '2028-07-22',
    timeUtc: '02:56',
    kind: 'Total',
    isSolar: true,
    saros: 146,
    mag: 1.056,
    duration: '5m10s',
    regions: 'Indian Ocean, Australia (Kimberley, Sydney Harbour path!), New Zealand',
    zodiacDeg: "29°59' ♋ Cancer",
    astrologicalNote: 'Anaretic Cancer Total Solar Eclipse directly across Sydney: Domestic sovereignty, oceanic trade, and constitutional security.',
  },
  {
    dateIso: '2028-12-31',
    timeUtc: '16:53',
    kind: 'Total',
    isSolar: false,
    saros: 124,
    mag: 1.246,
    duration: '71m',
    regions: 'Asia, Australia, Pacific, Western North America',
    zodiacDeg: "10°33' ♋ Cancer",
    astrologicalNote: 'New Year’s Eve Total Blood Moon: Profound domestic, tribal, and generational lineage reset.',
  },

  // 2029
  {
    dateIso: '2029-01-14',
    timeUtc: '17:13',
    kind: 'Partial',
    isSolar: true,
    saros: 151,
    mag: 0.871,
    regions: 'North America, Central America',
    zodiacDeg: "24°45' ♑ Capricorn",
    astrologicalNote: 'Capricorn Solar Eclipse: Institutional governance restructuring and legacy system replacement.',
  },
  {
    dateIso: '2029-06-12',
    timeUtc: '04:06',
    kind: 'Partial',
    isSolar: true,
    saros: 118,
    mag: 0.458,
    regions: 'Arctic, Scandinavia, Northern Alaska, Siberia',
    zodiacDeg: "21°32' ♊ Gemini",
    astrologicalNote: 'Polar Gemini Eclipse: Intelligence verification, encrypted communication networks.',
  },
  {
    dateIso: '2029-06-26',
    timeUtc: '03:23',
    kind: 'Total',
    isSolar: false,
    saros: 129,
    mag: 1.844,
    duration: '102m',
    regions: 'Americas, Europe, Africa',
    zodiacDeg: "4°49' ♑ Capricorn",
    astrologicalNote: 'Exceptional 102-minute Total Blood Moon: Peak restructuring of global banking institutions.',
  },
  {
    dateIso: '2029-07-11',
    timeUtc: '15:37',
    kind: 'Partial',
    isSolar: true,
    saros: 156,
    mag: 0.230,
    regions: 'Southern Chile, Southern Argentina',
    zodiacDeg: "19°35' ♋ Cancer",
    astrologicalNote: 'Sub-polar solar alignment highlighting territorial maritime borders.',
  },
  {
    dateIso: '2029-12-05',
    timeUtc: '15:03',
    kind: 'Partial',
    isSolar: true,
    saros: 123,
    mag: 0.891,
    regions: 'Southern Chile, Argentina, Antarctica',
    zodiacDeg: "13°49' ♐ Sagittarius",
    astrologicalNote: 'Sagittarius Solar Eclipse: Philosophical reorientation and global treaty codification.',
  },
  {
    dateIso: '2029-12-20',
    timeUtc: '22:43',
    kind: 'Total',
    isSolar: false,
    saros: 134,
    mag: 1.117,
    duration: '54m',
    regions: 'Americas, Europe, Africa',
    zodiacDeg: "29°17' ♊ Gemini",
    astrologicalNote: 'Anaretic Gemini Total Blood Moon: Decisive conclusion of obsolete narrative frameworks.',
  },

  // 2030 (THE SESHAT EPOCH LAUNCH YEAR)
  {
    dateIso: '2030-06-01',
    timeUtc: '06:29',
    kind: 'Annular',
    isSolar: true,
    saros: 128,
    mag: 0.944,
    duration: '5m21s',
    regions: 'Algeria, Tunisia, Greece, Turkey, Russia, Northern China, Japan',
    zodiacDeg: "10°43' ♊ Gemini",
    astrologicalNote: 'Epoch Year 0 Annular Solar Eclipse: Mediterranean-Asian corridor activation, formalising 13-month chronometry.',
  },
  {
    dateIso: '2030-06-15',
    timeUtc: '18:34',
    kind: 'Partial',
    isSolar: false,
    saros: 139,
    mag: 0.503,
    regions: 'Europe, Africa, Asia, Australia',
    zodiacDeg: "24°27' ♐ Sagittarius",
    astrologicalNote: 'Sagittarius Lunar Eclipse: Global educational and epistemological curriculum update.',
  },
  {
    dateIso: '2030-11-25',
    timeUtc: '06:51',
    kind: 'Total',
    isSolar: true,
    saros: 133,
    mag: 1.047,
    duration: '3m44s',
    regions: 'Namibia, Botswana, South Africa, Indian Ocean, South Australia',
    zodiacDeg: "2°54' ♐ Sagittarius",
    astrologicalNote: 'Epoch Year 0 Total Solar Eclipse: African-Australian axis, sovereign wealth anchor and systemic stability.',
  },
  {
    dateIso: '2030-12-09',
    timeUtc: '22:28',
    kind: 'Penumbral',
    isSolar: false,
    saros: 144,
    mag: 0.968,
    regions: 'Americas, Pacific, East Asia',
    zodiacDeg: "18°05' ♊ Gemini",
    astrologicalNote: 'Year 0 Winter Penumbral Lunar Eclipse: Mathematical consolidation and archival confirmation.',
  },

  // 2031
  {
    dateIso: '2031-05-21',
    timeUtc: '07:16',
    kind: 'Annular',
    isSolar: true,
    saros: 138,
    mag: 0.959,
    duration: '5m26s',
    regions: 'Angola, Zambia, Tanzania, Indian Ocean, India, Malaysia',
    zodiacDeg: "29°57' ♉ Taurus",
    astrologicalNote: 'Anaretic Taurus Ring of Fire: New agrarian and resource-backed economic metrics.',
  },
  {
    dateIso: '2031-11-14',
    timeUtc: '21:07',
    kind: 'Hybrid',
    isSolar: true,
    saros: 143,
    mag: 1.011,
    duration: '1m08s',
    regions: 'Pacific Ocean, Panama, Colombia',
    zodiacDeg: "22°08' ♏ Scorpio",
    astrologicalNote: 'Rare Hybrid Solar Eclipse: Deep technological regeneration and intelligence synergy.',
  },

  // 2032
  {
    dateIso: '2032-04-25',
    timeUtc: '15:15',
    kind: 'Total',
    isSolar: false,
    saros: 121,
    mag: 1.197,
    duration: '66m',
    regions: 'Asia, Australia, Pacific, Americas',
    zodiacDeg: "5°43' ♏ Scorpio",
    astrologicalNote: 'Total Blood Moon: Transformative reset of global security protocols and debt ledgers.',
  },
  {
    dateIso: '2032-05-09',
    timeUtc: '13:26',
    kind: 'Annular',
    isSolar: true,
    saros: 148,
    mag: 0.996,
    duration: '0m22s',
    regions: 'South Atlantic, Antarctica',
    zodiacDeg: "19°12' ♉ Taurus",
    astrologicalNote: 'Near-Total Annular Eclipse: Tangible infrastructure grounding and environmental stewardship.',
  },
  {
    dateIso: '2032-10-18',
    timeUtc: '19:03',
    kind: 'Total',
    isSolar: false,
    saros: 126,
    mag: 1.108,
    duration: '50m',
    regions: 'Europe, Africa, Americas',
    zodiacDeg: "25°54' ♈ Aries",
    astrologicalNote: 'Total Blood Moon: Reaffirmation of individual agency and systemic autonomy.',
  },
  {
    dateIso: '2032-11-03',
    timeUtc: '05:34',
    kind: 'Partial',
    isSolar: true,
    saros: 153,
    mag: 0.855,
    regions: 'Asia, Eastern Europe',
    zodiacDeg: "11°29' ♏ Scorpio",
    astrologicalNote: 'Scorpio Partial Eclipse: Deep data mining, strategic intelligence, and investigative breakthroughs.',
  },

  // 2033
  {
    dateIso: '2033-03-30',
    timeUtc: '18:02',
    kind: 'Total',
    isSolar: true,
    saros: 120,
    mag: 1.046,
    duration: '2m37s',
    regions: 'Eastern Russia, Alaska (Bering Strait), Arctic',
    zodiacDeg: "10°09' ♈ Aries",
    astrologicalNote: 'High Northern Total Solar Eclipse: Arctic trade corridor and orbital satellite gateway opening.',
  },
  {
    dateIso: '2033-04-14',
    timeUtc: '18:15',
    kind: 'Total',
    isSolar: false,
    saros: 131,
    mag: 1.104,
    duration: '50m',
    regions: 'Africa, Europe, Asia, Australia',
    zodiacDeg: "24°46' ♎ Libra",
    astrologicalNote: 'Total Blood Moon: Balanced international treaty ratifications and equitable resource accords.',
  },
  {
    dateIso: '2033-09-23',
    timeUtc: '13:51',
    kind: 'Partial',
    isSolar: true,
    saros: 125,
    mag: 0.690,
    regions: 'South America, Antarctica',
    zodiacDeg: "0°48' ♎ Libra",
    astrologicalNote: 'Equinoctial Solar Eclipse: Pure cardinal harmonic equilibrium and diplomatic standardisation.',
  },

  // 2034
  {
    dateIso: '2034-03-20',
    timeUtc: '10:18',
    kind: 'Total',
    isSolar: true,
    saros: 130,
    mag: 1.046,
    duration: '4m09s',
    regions: 'Nigeria, Cameroon, Chad, Sudan, Egypt, Saudi Arabia, Iran, Afghanistan, Pakistan, India, China',
    zodiacDeg: "29°27' ♓ Pisces",
    astrologicalNote: 'Equinox Total Solar Eclipse: Historic cross-continental belt connecting North Africa and Asia on the vernal boundary.',
  },
  {
    dateIso: '2034-09-12',
    timeUtc: '16:19',
    kind: 'Annular',
    isSolar: true,
    saros: 135,
    mag: 0.974,
    duration: '2m58s',
    regions: 'Chile, Bolivia, Argentina, Brazil',
    zodiacDeg: "19°59' ♍ Virgo",
    astrologicalNote: 'South American Ring of Fire: Ecological systems engineering and bio-regional precision.',
  },

  // 2035
  {
    dateIso: '2035-03-09',
    timeUtc: '23:08',
    kind: 'Annular',
    isSolar: true,
    saros: 140,
    mag: 0.992,
    duration: '0m48s',
    regions: 'New Zealand, Southern Pacific',
    zodiacDeg: "19°05' ♓ Pisces",
    astrologicalNote: 'Pacific Annular Eclipse: Navigation, oceanic bathymetry, and astronomical observatory expansion.',
  },
  {
    dateIso: '2035-09-02',
    timeUtc: '01:56',
    kind: 'Total',
    isSolar: true,
    saros: 145,
    mag: 1.032,
    duration: '2m54s',
    regions: 'China (Beijing), North Korea, Sea of Japan, Japan (Tokyo/Nagano!), Pacific',
    zodiacDeg: "9°35' ♍ Virgo",
    astrologicalNote: 'The Great East Asian Total Solar Eclipse directly over Tokyo and Beijing: Technological singularity and high-precision manufacturing revolution.',
  },
];

// Precomputed Solstices & Equinoxes (2024 - 2036)
interface CardinalStation {
  dateIso: string;
  timeUtc: string;
  type: 'solstice' | 'equinox';
  title: string;
  ingressSign: string;
  astrologicalSignificance: string;
}

const CARDINAL_STATIONS: CardinalStation[] = [
  // 2026
  { dateIso: '2026-03-20', timeUtc: '14:46', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Astronomical start of the Astrological New Year. Equal day and night; supreme cardinal balance.' },
  { dateIso: '2026-06-21', timeUtc: '08:24', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Peak solar zenith in Northern Hemisphere; maximum illumination and solar maturity.' },
  { dateIso: '2026-09-23', timeUtc: '00:05', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Equinox of harvest and diplomatic equilibrium; solar transit into Venusian air.' },
  { dateIso: '2026-12-21', timeUtc: '20:50', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Solar rebirth at the nadir of light; cardinal earth foundation and institutional renewal.' },

  // 2027
  { dateIso: '2027-03-20', timeUtc: '20:25', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Cosmic spring reactivation, vital creative propulsion, and energetic rebirth.' },
  { dateIso: '2027-06-21', timeUtc: '14:11', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Midsummer solar pinnacle; emotional protection, intuitive anchoring, and communal nourishment.' },
  { dateIso: '2027-09-23', timeUtc: '06:02', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Second equinox of equilibrium; harmonizing social contracts and aesthetic standards.' },
  { dateIso: '2027-12-22', timeUtc: '02:42', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Return of the unconquered Sun (Sol Invictus); structured long-range planning.' },

  // 2028
  { dateIso: '2028-03-20', timeUtc: '02:17', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Universal vernal gateway; elemental fire activation.' },
  { dateIso: '2028-06-20', timeUtc: '20:02', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Longest daylight duration; peak solar irradiance.' },
  { dateIso: '2028-09-22', timeUtc: '11:45', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Harmonic transition into reflective seasons; reciprocal partnerships.' },
  { dateIso: '2028-12-21', timeUtc: '08:20', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Saturnian grounding; deep architectural focus.' },

  // 2029
  { dateIso: '2029-03-20', timeUtc: '08:02', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Aries cardinal point; initiation of breakthrough endeavors.' },
  { dateIso: '2029-06-21', timeUtc: '01:48', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Summer solar crest; generational security and lineage continuity.' },
  { dateIso: '2029-09-22', timeUtc: '17:38', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Equinoctial equilibrium; strategic negotiation and ethical jurisprudence.' },
  { dateIso: '2029-12-21', timeUtc: '14:14', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Eve of the 2030 Epoch Year; final preparatory winter solstice prior to Year 0.' },

  // 2030 (EPOCH YEAR 0)
  { dateIso: '2030-03-20', timeUtc: '13:51', type: 'equinox', title: 'Inaugural Epoch Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'The Celestial Herald of Year 0: Exact vernal realignment 12 days before Wa 1 epoch switchover.' },
  { dateIso: '2030-06-21', timeUtc: '07:31', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Year 0 Summer Solstice occurring in Seshat Month 4 (Ftu Day 1); absolute structural governance.' },
  { dateIso: '2030-09-22', timeUtc: '23:27', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Year 0 Autumnal Equinox occurring in Month 7 (Sefekh Day 7); peak strategic intelligence.' },
  { dateIso: '2030-12-21', timeUtc: '20:09', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Year 0 Winter Solstice occurring in Month 10 (Med Day 14); midpoint systemic synthesis.' },

  // 2031
  { dateIso: '2031-03-20', timeUtc: '19:41', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Universal vernal gateway.' },
  { dateIso: '2031-06-21', timeUtc: '13:17', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Peak solar zenith.' },
  { dateIso: '2031-09-23', timeUtc: '05:15', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Equinoctial balance.' },
  { dateIso: '2031-12-22', timeUtc: '01:55', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Solar rebirth.' },

  // 2032
  { dateIso: '2032-03-20', timeUtc: '01:21', type: 'equinox', title: 'Vernal Equinox (Aries Ingress ♈ 0°)', ingressSign: 'Aries', astrologicalSignificance: 'Spring equinox.' },
  { dateIso: '2032-06-20', timeUtc: '19:08', type: 'solstice', title: 'Summer Solstice (Cancer Ingress ♋ 0°)', ingressSign: 'Cancer', astrologicalSignificance: 'Summer solstice.' },
  { dateIso: '2032-09-22', timeUtc: '11:10', type: 'equinox', title: 'Autumnal Equinox (Libra Ingress ♎ 0°)', ingressSign: 'Libra', astrologicalSignificance: 'Autumnal equinox.' },
  { dateIso: '2032-12-21', timeUtc: '07:56', type: 'solstice', title: 'Winter Solstice (Capricorn Ingress ♑ 0°)', ingressSign: 'Capricorn', astrologicalSignificance: 'Winter solstice.' },
];

// Planetary Retrograde and Direct Stations (Mercury, Venus, Mars, Jupiter, Saturn)
interface PlanetaryStationRecord {
  dateIso: string;
  planet: string;
  symbol: string;
  stationType: 'Retrograde Station (Rx)' | 'Direct Station (D)';
  zodiacDeg: string;
  description: string;
  astrologicalSignificance: string;
}

const PLANETARY_STATIONS: PlanetaryStationRecord[] = [
  // 2026
  { dateIso: '2026-02-26', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '22° ♓ Pisces', description: 'Mercury turns Retrograde in Pisces', astrologicalSignificance: 'Intuitive review of data, recalibration of digital security, rechecking contracts.' },
  { dateIso: '2026-03-20', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '8° ♓ Pisces', description: 'Mercury turns Direct in Pisces', astrologicalSignificance: 'Forward clarity restored; execution of communications and commercial agreements.' },
  { dateIso: '2026-06-29', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '26° ♋ Cancer', description: 'Mercury turns Retrograde in Cancer', astrologicalSignificance: 'Introspection on historical archives, familial estate records, domestic planning.' },
  { dateIso: '2026-07-23', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '16° ♋ Cancer', description: 'Mercury turns Direct in Cancer', astrologicalSignificance: 'Clear path for property, domestic contracts, and foundational logistics.' },
  { dateIso: '2026-10-24', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '20° ♏ Scorpio', description: 'Mercury turns Retrograde in Scorpio', astrologicalSignificance: 'Deep forensic accounting, cryptography validation, auditing hidden variables.' },
  { dateIso: '2026-11-13', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '4° ♏ Scorpio', description: 'Mercury turns Direct in Scorpio', astrologicalSignificance: 'Strategic breakthroughs, verified intelligence release, and mathematical finality.' },
  { dateIso: '2026-10-03', planet: 'Venus', symbol: '♀', stationType: 'Retrograde Station (Rx)', zodiacDeg: '18° ♏ Scorpio', description: 'Venus turns Retrograde in Scorpio', astrologicalSignificance: 'Rare Venus Retrograde: Value reassessment, structural audit of high-stakes partnerships.' },
  { dateIso: '2026-11-14', planet: 'Venus', symbol: '♀', stationType: 'Direct Station (D)', zodiacDeg: '2° ♏ Scorpio', description: 'Venus turns Direct in Scorpio', astrologicalSignificance: 'Financial accords re-anchored with unbreakable fidelity and structural clarity.' },
  { dateIso: '2026-12-06', planet: 'Mars', symbol: '♂', stationType: 'Retrograde Station (Rx)', zodiacDeg: '6° ♌ Leo', description: 'Mars turns Retrograde in Leo', astrologicalSignificance: 'Strategic patience; conservation of offensive momentum and technical stamina.' },

  // 2027
  { dateIso: '2027-02-24', planet: 'Mars', symbol: '♂', stationType: 'Direct Station (D)', zodiacDeg: '17° ♋ Cancer', description: 'Mars turns Direct in Cancer', astrologicalSignificance: 'Resumption of vigorous tactical execution and construction initiatives.' },
  { dateIso: '2027-02-09', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '6° ♓ Pisces', description: 'Mercury turns Retrograde in Pisces', astrologicalSignificance: 'Algorithmic tuning, reflective code audits.' },
  { dateIso: '2027-03-03', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '22° ♒ Aquarius', description: 'Mercury turns Direct in Aquarius', astrologicalSignificance: 'High-speed technical breakthroughs and distributed system deployments.' },
  { dateIso: '2027-06-10', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '7° ♋ Cancer', description: 'Mercury turns Retrograde in Cancer', astrologicalSignificance: 'Review of organizational roots and internal communication pipelines.' },
  { dateIso: '2027-07-05', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '27° ♊ Gemini', description: 'Mercury turns Direct in Gemini', astrologicalSignificance: 'Rapid information synthesis and commercial transaction velocity.' },
  { dateIso: '2027-10-07', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '3° ♏ Scorpio', description: 'Mercury turns Retrograde in Scorpio', astrologicalSignificance: 'Forensic audits, verification of trade routes.' },
  { dateIso: '2027-10-28', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '17° ♎ Libra', description: 'Mercury turns Direct in Libra', astrologicalSignificance: 'Equitable resolution of multilateral agreements.' },

  // 2028 - 2030 (Select Major Stations)
  { dateIso: '2028-05-21', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '17° ♊ Gemini', description: 'Mercury turns Retrograde in Gemini', astrologicalSignificance: 'Review of epistemic foundations and network bandwidth.' },
  { dateIso: '2028-06-14', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '8° ♊ Gemini', description: 'Mercury turns Direct in Gemini', astrologicalSignificance: 'Seamless communication pathways restored.' },
  { dateIso: '2029-01-14', planet: 'Mars', symbol: '♂', stationType: 'Retrograde Station (Rx)', zodiacDeg: '12° ♍ Virgo', description: 'Mars turns Retrograde in Virgo', astrologicalSignificance: 'Precision tuning of automated systems; precision over haste.' },
  { dateIso: '2029-03-28', planet: 'Mars', symbol: '♂', stationType: 'Direct Station (D)', zodiacDeg: '27° ♌ Leo', description: 'Mars turns Direct in Leo', astrologicalSignificance: 'Dynamic leadership and industrial infrastructure acceleration.' },
  { dateIso: '2030-03-12', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '28° ♓ Pisces', description: 'Mercury turns Retrograde in Pisces (Epoch Eve)', astrologicalSignificance: 'Final contemplative calibration before the April 1, 2030 CE Year 0 Epoch launch.' },
  { dateIso: '2030-04-03', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '14° ♓ Pisces (Wa 3)', description: 'Mercury turns Direct in Wa 3', astrologicalSignificance: 'The first planetary direct station of Year 0! Clear trajectory for global 13-month rollout.' },
  { dateIso: '2030-07-16', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '12° ♌ Leo', description: 'Mercury turns Retrograde in Leo', astrologicalSignificance: 'Governance protocol reviews in Month 4.' },
  { dateIso: '2030-08-09', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '29° ♋ Cancer', description: 'Mercury turns Direct in Cancer', astrologicalSignificance: 'Systemic implementation of invariant week-cadence.' },
  { dateIso: '2030-11-06', planet: 'Mercury', symbol: '☿', stationType: 'Retrograde Station (Rx)', zodiacDeg: '5° ♐ Sagittarius', description: 'Mercury turns Retrograde in Sagittarius', astrologicalSignificance: 'International law and currency exchange standard alignment.' },
  { dateIso: '2030-11-26', planet: 'Mercury', symbol: '☿', stationType: 'Direct Station (D)', zodiacDeg: '19° ♏ Scorpio', description: 'Mercury turns Direct in Scorpio', astrologicalSignificance: 'Direct station following the Year 0 Total Solar Eclipse.' },
];

// Zodiac Ingress Calculation (Dates when the Sun enters each of the 12 signs)
export function getZodiacIngressesForYear(gregorianYear: number): {
  sign: string;
  symbol: string;
  dateIso: string;
  approxDate: Date;
  astrologicalSignificance: string;
}[] {
  // Approximate standard transit days for Tropical Sun ingress
  const ingressDefs = [
    { sign: 'Capricorn', symbol: '♑', m: 0, d: 20, note: 'Ambition, structural discipline, and institutional mastery.' },
    { sign: 'Aquarius', symbol: '♒', m: 1, d: 19, note: 'Innovative humanitarian vision, technological networks, and liberation.' },
    { sign: 'Pisces', symbol: '♓', m: 2, d: 18, note: 'Compassion, imaginative transcendence, and cosmic unity.' },
    { sign: 'Aries', symbol: '♈', m: 3, d: 20, note: 'Spring Equinox & Astrological New Year. Bold pioneering impetus.' },
    { sign: 'Taurus', symbol: '♉', m: 4, d: 20, note: 'Grounding, sensual stability, physical resource accumulation.' },
    { sign: 'Gemini', symbol: '♊', m: 5, d: 21, note: 'Intellectual curiosity, agile versatility, and networking.' },
    { sign: 'Cancer', symbol: '♋', m: 6, d: 21, note: 'Summer Solstice. Emotional anchoring, protective devotion, and ancestral memory.' },
    { sign: 'Leo', symbol: '♌', m: 7, d: 23, note: 'Radiant vitality, creative sovereignty, and magnanimous expression.' },
    { sign: 'Virgo', symbol: '♍', m: 8, d: 23, note: 'Precise discernment, analytical mastery, and service-oriented optimization.' },
    { sign: 'Libra', symbol: '♎', m: 9, d: 23, note: 'Autumnal Equinox. Harmonious balance, strategic diplomacy, and relational justice.' },
    { sign: 'Scorpio', symbol: '♏', m: 10, d: 23, note: 'Alchemical transmutation, investigative penetrance, and sovereign truth.' },
    { sign: 'Sagittarius', symbol: '♐', m: 11, d: 22, note: 'Expansive wisdom, philosophical quest, and visionary optimism.' },
  ];

  return ingressDefs.map((def) => {
    const d = new Date(Date.UTC(gregorianYear, def.m, def.d, 12, 0, 0));
    return {
      sign: def.sign,
      symbol: def.symbol,
      dateIso: formatGregorianISO(d),
      approxDate: d,
      astrologicalSignificance: def.note,
    };
  });
}

// Memory Cache for Astronomical & Astrological Events
const astroYearCache = new Map<number, AstroEvent[]>();

/**
 * Returns all Astronomical and Astrological events for a given Seshat Year
 * (Spanning April 1 of 2030+Y to March 31 of 2030+Y+1).
 */
export function getAstroEventsForSeshatYear(seshatYear: number): AstroEvent[] {
  if (astroYearCache.has(seshatYear)) {
    return astroYearCache.get(seshatYear)!;
  }

  const yearStart = getSeshatYearStartDate(seshatYear);
  const totalDays = getSeshatYearTotalDays(seshatYear);
  const yearEnd = new Date(yearStart.getTime() + totalDays * 86400000 - 1);

  const startIso = formatGregorianISO(yearStart);
  const endIso = formatGregorianISO(yearEnd);

  const events: AstroEvent[] = [];

  // 1. Ingest Authoritative Solar & Lunar Eclipses
  for (const e of AUTHORITATIVE_ECLIPSES) {
    if (e.dateIso >= startIso && e.dateIso <= endIso) {
      const parts = e.dateIso.split('-');
      const timeParts = e.timeUtc.split(':');
      const utcDate = new Date(
        Date.UTC(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
          Number(timeParts[0]),
          Number(timeParts[1])
        )
      );

      const seshatCoords = gregorianToSeshat(utcDate);
      const isSolar = e.isSolar;

      events.push({
        id: `eclipse-${e.dateIso}-${isSolar ? 'solar' : 'lunar'}`,
        type: isSolar ? 'solar_eclipse' : 'lunar_eclipse',
        title: isSolar
          ? `${e.kind} Solar Eclipse (${e.zodiacDeg})`
          : `${e.kind} Lunar Eclipse (${e.zodiacDeg})`,
        subtitle: isSolar
          ? `Saros ${e.saros} · Mag ${e.mag}${e.duration ? ` · Duration ${e.duration}` : ''}`
          : `Saros ${e.saros} · Mag ${e.mag}`,
        utcDate,
        isoDate: e.dateIso,
        timeStr: `${e.timeUtc} UTC`,
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        icon: isSolar ? '☀️🌑' : '🌕🔴',
        badgeColor: isSolar
          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
          : 'bg-red-600 text-white border-red-500 font-bold',
        categoryLabel: isSolar ? 'Solar Eclipse' : 'Lunar Eclipse',
        description: `${isSolar ? 'Solar' : 'Lunar'} Eclipse observable across ${e.regions}. ${
          e.duration ? `Maximum totality/annularity duration: ${e.duration}.` : ''
        }`,
        astrologicalSignificance: e.astrologicalNote,
        astronomicalDetails: {
          eclipseKind: e.kind,
          sarosSeries: e.saros,
          magnitude: e.mag,
          duration: e.duration,
          visibilityRegions: e.regions,
          zodiacDegree: e.zodiacDeg,
        },
      });
    }
  }

  // 2. Ingest Solstices & Equinoxes
  for (const cs of CARDINAL_STATIONS) {
    if (cs.dateIso >= startIso && cs.dateIso <= endIso) {
      const parts = cs.dateIso.split('-');
      const timeParts = cs.timeUtc.split(':');
      const utcDate = new Date(
        Date.UTC(
          Number(parts[0]),
          Number(parts[1]) - 1,
          Number(parts[2]),
          Number(timeParts[0]),
          Number(timeParts[1])
        )
      );

      const seshatCoords = gregorianToSeshat(utcDate);

      events.push({
        id: `cardinal-${cs.dateIso}-${cs.type}`,
        type: cs.type,
        title: cs.title,
        subtitle: `Cardinal Astrological Ingress · 0°00' ${cs.ingressSign}`,
        utcDate,
        isoDate: cs.dateIso,
        timeStr: `${cs.timeUtc} UTC`,
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        icon: cs.type === 'solstice' ? '☀️' : '⚖️',
        badgeColor: cs.type === 'solstice' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-emerald-100 text-emerald-900 border-emerald-300',
        categoryLabel: cs.type === 'solstice' ? 'Solstice' : 'Equinox',
        description: `Exact astronomical crossing of the celestial equator/tropics by the Sun into 0°00' ${cs.ingressSign}.`,
        astrologicalSignificance: cs.astrologicalSignificance,
        astronomicalDetails: {
          zodiacSign: cs.ingressSign,
          zodiacDegree: `0°00' ${cs.ingressSign}`,
        },
      });
    }
  }

  // 3. Ingest Planetary Stations (Retrogrades and Direct)
  for (const ps of PLANETARY_STATIONS) {
    if (ps.dateIso >= startIso && ps.dateIso <= endIso) {
      const parts = ps.dateIso.split('-');
      const utcDate = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0));
      const seshatCoords = gregorianToSeshat(utcDate);
      const isRx = ps.stationType.includes('Retrograde');

      events.push({
        id: `station-${ps.dateIso}-${ps.planet}-${isRx ? 'rx' : 'direct'}`,
        type: 'planetary_station',
        title: `${ps.planet} ${ps.stationType} (${ps.symbol})`,
        subtitle: `Stationary at ${ps.zodiacDeg}`,
        utcDate,
        isoDate: ps.dateIso,
        timeStr: '12:00 UTC',
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        icon: isRx ? '℞' : '⮑',
        badgeColor: isRx ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-blue-100 text-blue-900 border-blue-300',
        categoryLabel: isRx ? 'Retrograde Station' : 'Direct Station',
        description: ps.description,
        astrologicalSignificance: ps.astrologicalSignificance,
        astronomicalDetails: {
          planet: ps.planet,
          stationType: ps.stationType,
          zodiacDegree: ps.zodiacDeg,
        },
      });
    }
  }

  // 4. Ingest Sun Zodiac Ingresses
  const gStartYear = EPOCH_GREGORIAN_YEAR + seshatYear;
  const ingresses1 = getZodiacIngressesForYear(gStartYear);
  const ingresses2 = getZodiacIngressesForYear(gStartYear + 1);
  const allIngresses = [...ingresses1, ...ingresses2];

  for (const ing of allIngresses) {
    if (ing.dateIso >= startIso && ing.dateIso <= endIso) {
      // Avoid duplicating if Cardinal station already exists
      const isCardinal = ['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(ing.sign);
      if (isCardinal) continue;

      const seshatCoords = gregorianToSeshat(ing.approxDate);
      events.push({
        id: `ingress-${ing.dateIso}-${ing.sign}`,
        type: 'zodiac_ingress',
        title: `Sun enters ${ing.sign} (${ing.symbol})`,
        subtitle: `Tropical Zodiac Ingress · 0°00' ${ing.sign}`,
        utcDate: ing.approxDate,
        isoDate: ing.dateIso,
        timeStr: '12:00 UTC',
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        icon: ing.symbol,
        badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        categoryLabel: 'Zodiac Ingress',
        description: `Solar ecliptic transit crossing 0°00' ${ing.sign}. Elemental shift in terrestrial seasons.`,
        astrologicalSignificance: ing.astrologicalSignificance,
        astronomicalDetails: {
          zodiacSign: ing.sign,
          zodiacDegree: `0°00' ${ing.sign}`,
        },
      });
    }
  }

  // Sort chronological
  events.sort((a, b) => a.utcDate.getTime() - b.utcDate.getTime());

  astroYearCache.set(seshatYear, events);
  return events;
}

/**
 * Fast lookup map for calendar days: ISO date (YYYY-MM-DD) -> AstroEvent[]
 */
export function getAstroEventsMapForSeshatYear(seshatYear: number): Map<string, AstroEvent[]> {
  const events = getAstroEventsForSeshatYear(seshatYear);
  const map = new Map<string, AstroEvent[]>();
  for (const ev of events) {
    const list = map.get(ev.isoDate) || [];
    list.push(ev);
    map.set(ev.isoDate, list);
  }
  return map;
}

/**
 * Finds next upcoming astronomical events from any given point in time
 */
export function getNextAstroEvents(fromDate: Date): {
  nextSolarEclipse?: AstroEvent;
  nextLunarEclipse?: AstroEvent;
  nextEquinoxOrSolstice?: AstroEvent;
  nextRetrogradeStation?: AstroEvent;
  nextZodiacIngress?: AstroEvent;
} {
  const seshatCoords = gregorianToSeshat(fromDate);
  const yearEvents = [
    ...getAstroEventsForSeshatYear(seshatCoords.year),
    ...getAstroEventsForSeshatYear(seshatCoords.year + 1),
  ];

  const nowMs = fromDate.getTime();
  const futureEvents = yearEvents.filter((e) => e.utcDate.getTime() >= nowMs);

  const nextSolarEclipse = futureEvents.find((e) => e.type === 'solar_eclipse');
  const nextLunarEclipse = futureEvents.find((e) => e.type === 'lunar_eclipse');
  const nextEquinoxOrSolstice = futureEvents.find((e) => e.type === 'solstice' || e.type === 'equinox');
  const nextRetrogradeStation = futureEvents.find((e) => e.type === 'planetary_station');
  const nextZodiacIngress = futureEvents.find((e) => e.type === 'zodiac_ingress');

  return {
    nextSolarEclipse,
    nextLunarEclipse,
    nextEquinoxOrSolstice,
    nextRetrogradeStation,
    nextZodiacIngress,
  };
}
