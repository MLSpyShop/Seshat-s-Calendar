import { MONTHS } from '../data';
import { Month, SeshatDate, SpecialDayType } from '../types';

export const EPOCH_GREGORIAN_YEAR = 2030;
export const EPOCH_GREGORIAN_MONTH = 3; // 0-indexed: 3 = April
export const EPOCH_GREGORIAN_DAY = 1;

/**
 * Checks if a Gregorian year is a leap year
 */
export function isGregorianLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Determines if a Seshat Year has 366 days (leap year).
 * Seshat Year Y starts April 1 of (2030 + Y) and ends March 31 of (2030 + Y + 1).
 * If (2030 + Y + 1) is a Gregorian leap year, February has 29 days, making the Seshat year 366 days.
 */
export function isSeshatLeapYear(seshatYear: number): boolean {
  const nextGregorianYear = EPOCH_GREGORIAN_YEAR + seshatYear + 1;
  return isGregorianLeapYear(nextGregorianYear);
}

/**
 * Gets the start of a Seshat year as a UTC Date
 */
export function getSeshatYearStartDate(seshatYear: number): Date {
  const gYear = EPOCH_GREGORIAN_YEAR + seshatYear;
  return new Date(Date.UTC(gYear, 3, 1, 0, 0, 0)); // April 1
}

/**
 * Gets total days in a Seshat Year (365 for common, 366 for leap)
 */
export function getSeshatYearTotalDays(seshatYear: number): number {
  return isSeshatLeapYear(seshatYear) ? 366 : 365;
}

const WEEKDAY_NAMES: Array<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Converts any Gregorian Date to full Seshat Coordinates
 */
export function gregorianToSeshat(dateInput: Date | string): SeshatDate {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth(); // 0 = Jan, 3 = April

  // Determine Seshat year
  let seshatYear: number;
  if (month >= 3) {
    // April to December
    seshatYear = year - EPOCH_GREGORIAN_YEAR;
  } else {
    // January to March belongs to previous Seshat Year
    seshatYear = year - EPOCH_GREGORIAN_YEAR - 1;
  }

  const yearStart = getSeshatYearStartDate(seshatYear);
  const diffMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - yearStart.getTime();
  const dayIndex = Math.floor(diffMs / (1000 * 60 * 60 * 24)); // 0-indexed day of year

  const isLeap = isSeshatLeapYear(seshatYear);
  const totalDays = isLeap ? 366 : 365;

  if (dayIndex < 0 || dayIndex >= totalDays) {
    // Fallback safeguard
    return createStandardSeshatDate(seshatYear, MONTHS[0], 1, 1, date, isLeap);
  }

  // Standard 13 months × 28 days = 364 days (indices 0 to 363)
  if (dayIndex < 364) {
    const monthNum = Math.floor(dayIndex / 28) + 1;
    const day = (dayIndex % 28) + 1;
    const monthObj = MONTHS[monthNum - 1];
    return createStandardSeshatDate(seshatYear, monthObj, day, dayIndex + 1, date, isLeap);
  }

  // Intercalary (Epagomenal) Days
  if (!isLeap) {
    // Common year: dayIndex 364 is Intercalaris 1 (March 31)
    return {
      year: seshatYear,
      isLeapYear: false,
      type: 'intercalaris_1',
      dayOfYear: 365,
      gregorianDate: date,
      formattedSeshat: `Year ${seshatYear}, Intercalaris 1 (Solar Epagomenal Eve)`,
    };
  } else {
    // Leap year:
    // dayIndex 364 is Intercalaris 1 (March 30)
    // dayIndex 365 is Intercalaris 2 (March 31)
    if (dayIndex === 364) {
      return {
        year: seshatYear,
        isLeapYear: true,
        type: 'intercalaris_1',
        dayOfYear: 365,
        gregorianDate: date,
        formattedSeshat: `Year ${seshatYear}, Intercalaris 1 (First Epagomenal Day)`,
      };
    } else {
      return {
        year: seshatYear,
        isLeapYear: true,
        type: 'intercalaris_2',
        dayOfYear: 366,
        gregorianDate: date,
        formattedSeshat: `Year ${seshatYear}, Intercalaris 2 (Second Epagomenal Day / Leap Solar Anchor)`,
      };
    }
  }
}

function createStandardSeshatDate(
  year: number,
  month: Month,
  day: number,
  dayOfYear: number,
  gregorianDate: Date,
  isLeap: boolean
): SeshatDate {
  // Day of week is strictly invariant:
  // 1 -> Sunday (index 0)
  // 2 -> Monday (index 1)
  // ...
  // 7 -> Saturday (index 6)
  const weekdayIndex = (day - 1) % 7;
  const weekdayName = WEEKDAY_NAMES[weekdayIndex];
  const weekdayNumber = weekdayIndex + 1;
  const weekOfYear = Math.floor((dayOfYear - 1) / 7) + 1;
  const quarter = Math.min(4, Math.floor((dayOfYear - 1) / 91) + 1);

  return {
    year,
    isLeapYear: isLeap,
    type: 'standard',
    month,
    day,
    dayOfYear,
    weekdayName,
    weekdayNumber,
    weekOfYear,
    quarter,
    gregorianDate,
    formattedSeshat: `Year ${year}, Month ${month.number} (${month.name}), Day ${day} (${weekdayName})`,
  };
}

/**
 * Converts Seshat Coordinates to a Gregorian Date
 */
export function seshatToGregorian(
  seshatYear: number,
  monthNumOrSpecial: number | Month | 'intercalaris_1' | 'intercalaris_2',
  day: number = 1
): Date {
  const yearStart = getSeshatYearStartDate(seshatYear);
  const isLeap = isSeshatLeapYear(seshatYear);

  let dayIndex = 0;
  if (typeof monthNumOrSpecial === 'number') {
    const safeMonth = Math.max(1, Math.min(13, monthNumOrSpecial));
    const safeDay = Math.max(1, Math.min(28, day));
    dayIndex = (safeMonth - 1) * 28 + (safeDay - 1);
  } else if (typeof monthNumOrSpecial === 'object' && monthNumOrSpecial !== null) {
    const safeMonth = Math.max(1, Math.min(13, (monthNumOrSpecial as Month).number));
    const safeDay = Math.max(1, Math.min(28, day));
    dayIndex = (safeMonth - 1) * 28 + (safeDay - 1);
  } else if (monthNumOrSpecial === 'intercalaris_1') {
    // Intercalaris 1 is always the 365th day of the Seshat year (index 364)
    // Common year: March 31 · Leap year: March 30
    dayIndex = 364;
  } else if (monthNumOrSpecial === 'intercalaris_2') {
    // Intercalaris 2 is the 366th day of the Seshat year (index 365, leap year only)
    // Leap year: March 31
    dayIndex = isLeap ? 365 : 364;
  }

  const result = new Date(yearStart.getTime());
  result.setUTCDate(result.getUTCDate() + dayIndex);
  return result;
}

/**
 * Generates all days in a Seshat Month for display
 */
export function getMonthDays(seshatYear: number, month: Month) {
  const days: SeshatDate[] = [];
  for (let d = 1; d <= 28; d++) {
    const greg = seshatToGregorian(seshatYear, month.number, d);
    days.push(gregorianToSeshat(greg));
  }
  return days;
}

/**
 * Formats a Gregorian Date to YYYY-MM-DD
 */
export function formatGregorianISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Formats Gregorian Date with month name and day
 */
export function formatGregorianLong(d: Date): string {
  return d.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
