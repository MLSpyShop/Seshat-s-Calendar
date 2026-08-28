export interface Month {
  number: number;
  name: string;
  days: number;
}

export interface CalendarDate {
  year: number;
  month: Month;
  day: number;
}
