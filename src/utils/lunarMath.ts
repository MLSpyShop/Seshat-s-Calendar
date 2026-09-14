import { LunarEvent, LunarDayInfo, MoonPhaseType } from '../types';
import {
  getSeshatYearStartDate,
  getSeshatYearTotalDays,
  gregorianToSeshat,
  formatGregorianISO,
  seshatToGregorian,
  EPOCH_GREGORIAN_YEAR,
} from './calendarMath';

const SYNODIC_MONTH = 29.530588853; // Mean synodic month in days

/**
 * Calculates the exact Julian Ephemeris Date (JDE) for a lunar phase index k
 * Using Jean Meeus Astronomical Algorithms Chapter 49 (accuracy to within minutes).
 * k is an integer for New Moon, and (integer + 0.5) for Full Moon.
 */
function calculatePhaseDate(k: number, isFull: boolean): Date {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;

  // Mean phase time
  const JDE = 2451549.74601 + 29.530588853 * k + 0.0001337 * T2 - 0.000000150 * T3 + 0.00000000073 * T4;

  const rad = Math.PI / 180;
  // Sun's mean anomaly
  const M = (2.5534 + 29.10535669 * k - 0.0000218 * T2 - 0.00000011 * T3) * rad;
  // Moon's mean anomaly
  const Mprime = (201.5643 + 385.81693528 * k + 0.0107438 * T2 + 0.00001239 * T3) * rad;
  // Moon's argument of latitude
  const F = (160.7108 + 390.67050646 * k - 0.0016341 * T2 - 0.00000227 * T3) * rad;
  // Longitude of the ascending node
  const Omega = (124.7746 - 1.56375580 * k + 0.0020691 * T2) * rad;

  let dJDE: number;
  if (!isFull) {
    // Periodic corrections for New Moon
    dJDE =
      -0.40720 * Math.sin(Mprime) +
      0.17241 * Math.sin(M) +
      0.01608 * Math.sin(2 * Mprime) +
      0.01039 * Math.sin(2 * F) +
      0.00739 * Math.sin(Mprime - M) -
      0.00514 * Math.sin(Mprime + M) +
      0.00208 * Math.sin(2 * M) -
      0.00111 * Math.sin(Mprime - 2 * F) -
      0.00057 * Math.sin(Mprime + 2 * F) +
      0.00056 * Math.sin(2 * Mprime + M) -
      0.00042 * Math.sin(3 * Mprime) +
      0.00042 * Math.sin(M + 2 * F) +
      0.00038 * Math.sin(M - 2 * F) -
      0.00024 * Math.sin(2 * Mprime - M) -
      0.00017 * Math.sin(Omega) -
      0.00007 * Math.sin(Mprime + 2 * M) +
      0.00004 * Math.sin(2 * Mprime - 2 * F) +
      0.00004 * Math.sin(3 * M);
  } else {
    // Periodic corrections for Full Moon
    dJDE =
      -0.40614 * Math.sin(Mprime) +
      0.17302 * Math.sin(M) +
      0.01614 * Math.sin(2 * Mprime) -
      0.00974 * Math.sin(2 * F) +
      0.00739 * Math.sin(Mprime - M) -
      0.00514 * Math.sin(Mprime + M) +
      0.00209 * Math.sin(2 * M) -
      0.00111 * Math.sin(Mprime - 2 * F) -
      0.00057 * Math.sin(Mprime + 2 * F) +
      0.00056 * Math.sin(2 * Mprime + M) -
      0.00042 * Math.sin(3 * Mprime) +
      0.00042 * Math.sin(M + 2 * F) +
      0.00038 * Math.sin(M - 2 * F) -
      0.00024 * Math.sin(2 * Mprime - M) -
      0.00017 * Math.sin(Omega) -
      0.00007 * Math.sin(Mprime + 2 * M) +
      0.00004 * Math.sin(2 * Mprime - 2 * F) +
      0.00004 * Math.sin(3 * M);
  }

  const jd = JDE + dJDE;
  const ms = (jd - 2440587.5) * 86400000;
  return new Date(ms);
}

/**
 * Traditional folklore and astronomical name for Full Moons by Gregorian month
 */
function getTraditionalFullMoonName(date: Date, seshatMonthName?: string): string {
  const gMonth = date.getUTCMonth(); // 0 = Jan, 11 = Dec
  const names = [
    'Wolf Moon',
    'Snow Moon',
    'Worm Moon',
    'Pink Moon',
    'Flower Moon',
    'Strawberry Moon',
    'Buck Moon',
    'Sturgeon Moon',
    'Harvest Moon',
    'Hunter’s Moon',
    'Beaver Moon',
    'Cold Moon',
  ];
  const baseName = names[gMonth] || 'Full Moon';
  if (seshatMonthName) {
    return `${baseName} (${seshatMonthName})`;
  }
  return baseName;
}

// Memory cache for year events
const yearEventsCache = new Map<number, LunarEvent[]>();

/**
 * Computes all Full Moons and New Moons occurring within a given Seshat Year.
 */
export function getLunarEventsForSeshatYear(seshatYear: number): LunarEvent[] {
  if (yearEventsCache.has(seshatYear)) {
    return yearEventsCache.get(seshatYear)!;
  }

  const yearStart = getSeshatYearStartDate(seshatYear);
  const totalDays = getSeshatYearTotalDays(seshatYear);
  const yearEnd = new Date(yearStart.getTime() + totalDays * 24 * 60 * 60 * 1000 - 1);

  // Approximate range of k based on Gregorian year of start
  const gYearStart = EPOCH_GREGORIAN_YEAR + seshatYear;
  const kMin = Math.floor((gYearStart - 2000) * 12.3685) - 3;
  const kMax = Math.ceil((gYearStart + 1.25 - 2000) * 12.3685) + 3;

  const events: LunarEvent[] = [];

  for (let k = kMin; k <= kMax; k++) {
    // New Moon (k integer)
    const newMoonDate = calculatePhaseDate(k, false);
    if (newMoonDate >= yearStart && newMoonDate <= yearEnd) {
      const seshatCoords = gregorianToSeshat(newMoonDate);
      const isoDate = formatGregorianISO(newMoonDate);
      const hours = String(newMoonDate.getUTCHours()).padStart(2, '0');
      const mins = String(newMoonDate.getUTCMinutes()).padStart(2, '0');

      events.push({
        id: `nm-${k}`,
        type: 'new_moon',
        utcDate: newMoonDate,
        isoDate,
        timeStr: `${hours}:${mins} UTC`,
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        name: seshatCoords.month ? `New Moon (${seshatCoords.month.name})` : 'New Moon',
        illumination: 0,
      });
    }

    // Full Moon (k + 0.5)
    const fullMoonDate = calculatePhaseDate(k + 0.5, true);
    if (fullMoonDate >= yearStart && fullMoonDate <= yearEnd) {
      const seshatCoords = gregorianToSeshat(fullMoonDate);
      const isoDate = formatGregorianISO(fullMoonDate);
      const hours = String(fullMoonDate.getUTCHours()).padStart(2, '0');
      const mins = String(fullMoonDate.getUTCMinutes()).padStart(2, '0');
      const moonName = getTraditionalFullMoonName(fullMoonDate, seshatCoords.month?.name);

      events.push({
        id: `fm-${k}`,
        type: 'full_moon',
        utcDate: fullMoonDate,
        isoDate,
        timeStr: `${hours}:${mins} UTC`,
        seshatYear: seshatCoords.year,
        seshatFormatted: seshatCoords.formattedSeshat,
        seshatMonthNum: seshatCoords.month?.number,
        seshatDayNum: seshatCoords.day,
        isIntercalaris1: seshatCoords.type === 'intercalaris_1',
        isIntercalaris2: seshatCoords.type === 'intercalaris_2',
        name: moonName,
        illumination: 100,
      });
    }
  }

  events.sort((a, b) => a.utcDate.getTime() - b.utcDate.getTime());
  yearEventsCache.set(seshatYear, events);
  return events;
}

/**
 * Returns a map of ISO date (YYYY-MM-DD) -> LunarEvent for fast calendar grid lookups.
 */
export function getLunarEventsMapForSeshatYear(seshatYear: number): Map<string, LunarEvent> {
  const events = getLunarEventsForSeshatYear(seshatYear);
  const map = new Map<string, LunarEvent>();
  for (const ev of events) {
    map.set(ev.isoDate, ev);
  }
  return map;
}

/**
 * Calculates continuous lunar phase parameters and illumination for any specific Date.
 */
export function getLunarDayInfo(date: Date, seshatYear?: number): LunarDayInfo {
  const targetYear = seshatYear !== undefined ? seshatYear : gregorianToSeshat(date).year;
  const yearEvents = getLunarEventsForSeshatYear(targetYear);
  const targetIso = formatGregorianISO(date);

  // Check if today is an exact Full Moon or New Moon day
  const exactEvent = yearEvents.find((e) => e.isoDate === targetIso);

  // Calculate age within synodic month relative to reference epoch (Jan 6, 2000 18:14 UTC)
  // Reference epoch Julian Day = 2451549.75972
  const jd = date.getTime() / 86400000 + 2440587.5;
  const daysSinceEpoch = jd - 2451549.75972;
  const ageDays = ((daysSinceEpoch % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // Phase angle 0 to 2*PI (0 = New Moon, PI = Full Moon)
  const phaseAngle = (ageDays / SYNODIC_MONTH) * 2 * Math.PI;

  // Illumination percentage from 0% to 100%
  const calculatedIllum = Math.round(((1 - Math.cos(phaseAngle)) / 2) * 1000) / 10;
  const illumination = exactEvent
    ? exactEvent.type === 'full_moon'
      ? 100
      : 0
    : calculatedIllum;

  // Find next full and new moons
  const nowMs = date.getTime();
  let nextFullMoonDays = 0;
  let nextNewMoonDays = 0;

  const nextFull = yearEvents.find((e) => e.type === 'full_moon' && e.utcDate.getTime() > nowMs);
  if (nextFull) {
    nextFullMoonDays = Math.max(0, Math.round((nextFull.utcDate.getTime() - nowMs) / (1000 * 60 * 60 * 24)));
  } else {
    // Estimate
    nextFullMoonDays = Math.round(((SYNODIC_MONTH / 2 - ageDays + SYNODIC_MONTH) % SYNODIC_MONTH));
  }

  const nextNew = yearEvents.find((e) => e.type === 'new_moon' && e.utcDate.getTime() > nowMs);
  if (nextNew) {
    nextNewMoonDays = Math.max(0, Math.round((nextNew.utcDate.getTime() - nowMs) / (1000 * 60 * 60 * 24)));
  } else {
    nextNewMoonDays = Math.round(((SYNODIC_MONTH - ageDays) % SYNODIC_MONTH));
  }

  // Determine phase classification & icon
  let phase: MoonPhaseType;
  let phaseName: string;
  let phaseIcon: string;

  if (exactEvent?.type === 'new_moon' || ageDays < 0.75 || ageDays > SYNODIC_MONTH - 0.75) {
    phase = 'new_moon';
    phaseName = 'New Moon';
    phaseIcon = '🌑';
  } else if (ageDays < 6.63) {
    phase = 'waxing_crescent';
    phaseName = 'Waxing Crescent';
    phaseIcon = '🌒';
  } else if (ageDays < 8.11) {
    phase = 'first_quarter';
    phaseName = 'First Quarter';
    phaseIcon = '🌓';
  } else if (ageDays < 14.02) {
    phase = 'waxing_gibbous';
    phaseName = 'Waxing Gibbous';
    phaseIcon = '🌔';
  } else if (exactEvent?.type === 'full_moon' || (ageDays >= 14.02 && ageDays < 15.51)) {
    phase = 'full_moon';
    phaseName = 'Full Moon';
    phaseIcon = '🌕';
  } else if (ageDays < 21.41) {
    phase = 'waning_gibbous';
    phaseName = 'Waning Gibbous';
    phaseIcon = '🌖';
  } else if (ageDays < 22.89) {
    phase = 'last_quarter';
    phaseName = 'Last Quarter';
    phaseIcon = '🌗';
  } else {
    phase = 'waning_crescent';
    phaseName = 'Waning Crescent';
    phaseIcon = '🌘';
  }

  return {
    phase,
    phaseName,
    phaseIcon,
    illumination,
    ageDays: Math.round(ageDays * 10) / 10,
    isExactFullMoon: exactEvent?.type === 'full_moon',
    isExactNewMoon: exactEvent?.type === 'new_moon',
    exactEvent,
    nextFullMoonDays,
    nextNewMoonDays,
  };
}
