export interface Month {
  number: number;
  name: string;
  days: number;
  significance: string;
  egyptianNumeral: string;
  theme: string;
}

export type SpecialDayType = 'standard' | 'intercalaris_1' | 'intercalaris_2';

export interface SeshatDate {
  year: number; // e.g. 0, -4, 1
  isLeapYear: boolean;
  type: SpecialDayType;
  month?: Month;
  day?: number; // 1-28
  dayOfYear: number; // 1-365 or 366
  weekdayName?: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  weekdayNumber?: number; // 1-7 (1 = Sunday, 7 = Saturday)
  weekOfYear?: number; // 1-52
  quarter?: number; // 1-4
  gregorianDate: Date;
  formattedSeshat: string;
}

export interface PriorArtItem {
  id: string;
  title: string;
  authorOrEntity: string;
  year: string;
  description: string;
  differences: string[];
}

export interface ComparisonRow {
  metric: string;
  priorArt: string;
  seshatStandard: string;
}

export interface RoadmapPhase {
  phase: number;
  title: string;
  timeline: string;
  description: string;
  milestones: string[];
  status: 'completed' | 'active' | 'upcoming';
}

export type MoonPhaseType =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface LunarEvent {
  id: string;
  type: 'full_moon' | 'new_moon';
  utcDate: Date;
  isoDate: string; // YYYY-MM-DD
  timeStr: string; // e.g. "19:23 UTC"
  seshatYear: number;
  seshatFormatted: string;
  seshatMonthNum?: number;
  seshatDayNum?: number;
  isIntercalaris1?: boolean;
  isIntercalaris2?: boolean;
  name: string; // e.g. "Pink Moon", "Harvest Moon", "New Moon"
  illumination: number; // 0 or 100 for exact peak
}

export interface LunarDayInfo {
  phase: MoonPhaseType;
  phaseName: string;
  phaseIcon: string;
  illumination: number; // 0 to 100 %
  ageDays: number; // 0 to 29.53
  isExactFullMoon: boolean;
  isExactNewMoon: boolean;
  exactEvent?: LunarEvent;
  nextFullMoonDays: number;
  nextNewMoonDays: number;
}

export type AstroEventType =
  | 'solar_eclipse'
  | 'lunar_eclipse'
  | 'solstice'
  | 'equinox'
  | 'zodiac_ingress'
  | 'planetary_station'
  | 'planetary_aspect'
  | 'supermoon';

export type SolarEclipseKind = 'Total' | 'Annular' | 'Partial' | 'Hybrid';
export type LunarEclipseKind = 'Total' | 'Partial' | 'Penumbral';

export interface AstroEvent {
  id: string;
  type: AstroEventType;
  title: string;
  subtitle?: string;
  utcDate: Date;
  isoDate: string; // YYYY-MM-DD
  timeStr: string; // e.g. "14:28 UTC"
  seshatYear: number;
  seshatFormatted: string;
  seshatMonthNum?: number;
  seshatDayNum?: number;
  isIntercalaris1?: boolean;
  isIntercalaris2?: boolean;
  icon: string;
  badgeColor: string;
  categoryLabel: string;
  description: string;
  astrologicalSignificance: string;
  astronomicalDetails?: {
    eclipseKind?: SolarEclipseKind | LunarEclipseKind;
    sarosSeries?: number;
    magnitude?: number;
    duration?: string;
    visibilityRegions?: string;
    gamma?: number;
    zodiacSign?: string;
    zodiacDegree?: string;
    eclipticLongitude?: number;
    planet?: string;
    stationType?: 'Retrograde Station (Rx)' | 'Direct Station (D)';
    aspectName?: string;
    aspectAngle?: number;
  };
}

export interface CelestialBodyPosition {
  id: string;
  name: string;
  symbol: string;
  color: string;
  eclipticLongitude: number; // 0 to 360 degrees
  zodiacSign: string;
  signSymbol: string;
  degreesInSign: number; // 0 to 30
  minutesInSign: number; // 0 to 60
  isRetrograde: boolean;
  orbitalSpeedDegPerDay?: number;
  distanceAU?: number;
}

export interface AspectInfo {
  planet1: string;
  planet2: string;
  aspectName: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
  angle: number;
  exactAngle: number;
  orb: number;
  color: string;
  symbol: string;
  nature: 'Harmonious' | 'Dynamic' | 'Intense';
}

