import { Month, PriorArtItem, ComparisonRow, RoadmapPhase } from './types';

export const SESHAT_METADATA = {
  title: "Seshat's 13-Month 28-Day Calendar System",
  subtitle: "Strategic OSINT, Architectural Blueprint, and Global Financial Integration",
  author: "Marie-Soleil Seshat Landry",
  titleAndRole: "CEO, Landry Industries & Marie Landry Spy Shop",
  orcid: "0009-0008-5027-3337",
  publicationDate: "August 28, 2026",
  epochGregorian: "2030-04-01",
  epochLabel: "Year 0, Month 1 (Wa), Day 1",
  abstract:
    "A deterministic 13-month, 28-day temporal infrastructure. By standardising every month to four 7-day weeks, the system eliminates structural anomalies and forecasting errors inherent in the Gregorian calendar. A temporal reset is executed on April 1, 2030 CE, establishing Year 0, Month 1 (Wa), Day 1 as the new epoch.",
};

export const MONTHS: Month[] = [
  {
    number: 1,
    name: 'Wa',
    days: 28,
    egyptianNumeral: '𓏺 (1)',
    significance: 'Start of the year; unity and new beginnings.',
    theme: 'Foundational Unity',
  },
  {
    number: 2,
    name: 'Sen',
    days: 28,
    egyptianNumeral: '𓏻 (2)',
    significance: 'Duality, balance, and partnership.',
    theme: 'Equilibrium & Polarity',
  },
  {
    number: 3,
    name: 'Khem',
    days: 28,
    egyptianNumeral: '𓏼 (3)',
    significance: 'Harmony, structural foundation, and earth synthesis.',
    theme: 'Structure & Grounding',
  },
  {
    number: 4,
    name: 'Ftu',
    days: 28,
    egyptianNumeral: '𓏽 (4)',
    significance: 'Stability, order, and core framework.',
    theme: 'Order & Governance',
  },
  {
    number: 5,
    name: 'Di',
    days: 28,
    egyptianNumeral: '𓏾 (5)',
    significance: 'Dynamism, change, and the gift of time.',
    theme: 'Temporal Momentum',
  },
  {
    number: 6,
    name: 'Sisu',
    days: 28,
    egyptianNumeral: '𓏿 (6)',
    significance: 'Completeness, systemic cycles, and equilibrium.',
    theme: 'Harmonic Equilibrium',
  },
  {
    number: 7,
    name: 'Sefekh',
    days: 28,
    egyptianNumeral: '𓐀 (7)',
    significance: 'Knowledge acquisition, intelligence, and analysis.',
    theme: 'Strategic Intelligence',
  },
  {
    number: 8,
    name: 'Khemenu',
    days: 28,
    egyptianNumeral: '𓐁 (8)',
    significance: 'Continuity, infinity, and scale.',
    theme: 'Infinite Scale',
  },
  {
    number: 9,
    name: 'Pesedjet',
    days: 28,
    egyptianNumeral: '𓐂 (9)',
    significance: 'Culmination, fruition, and harvest.',
    theme: 'Harvest & Yield',
  },
  {
    number: 10,
    name: 'Med',
    days: 28,
    egyptianNumeral: '𓎆 (10)',
    significance: 'Wholeness, communication, and synthesis.',
    theme: 'Systemic Synthesis',
  },
  {
    number: 11,
    name: 'Asar',
    days: 28,
    egyptianNumeral: '𓎇 (11)',
    significance: 'Transition, progress, and elevation.',
    theme: 'Ascendance & Evolution',
  },
  {
    number: 12,
    name: 'Dwa',
    days: 28,
    egyptianNumeral: '𓎈 (12)',
    significance: 'Systemic order, alignment, and harmony.',
    theme: 'Cosmic Order',
  },
  {
    number: 13,
    name: 'Seba',
    days: 28,
    egyptianNumeral: '𓎉 (13)',
    significance: 'Transformation, discovery, and cosmic rebirth.',
    theme: 'Rebirth & Re-Epoch',
  },
];

export const PRIOR_ART_COMPARISONS: ComparisonRow[] = [
  {
    metric: 'Grid Mathematics',
    priorArt: '13 × 28 = 364 days [Cotsworth, Comte]',
    seshatStandard: '13 × 28 = 364 days invariant matrix',
  },
  {
    metric: 'Solar Synchronisation',
    priorArt: 'Uncounted "Year Days" / Secular Festivals',
    seshatStandard: 'Intercalaris 1 & 2 (epagomenal buffer pre-Wa 1)',
  },
  {
    metric: 'Linguistic Nomenclature',
    priorArt: 'Gregorian carryovers, "Sol", or Western historical figures',
    seshatStandard: 'Ancient Egyptian Numerals (Wa, Sen, Khem...)',
  },
  {
    metric: 'Epoch Benchmark',
    priorArt: 'Gregorian year numbering or 1789 CE French Revolution',
    seshatStandard: 'April 1, 2030 CE = Year 0, Month 1 (Wa), Day 1',
  },
  {
    metric: 'Vernal Alignment',
    priorArt: 'Arbitrary January 1 start (mid-winter drift)',
    seshatStandard: 'April 1 (Vernal astronomical realignment)',
  },
];

export const PRIOR_ART_ITEMS: PriorArtItem[] = [
  {
    id: 'jones-1745',
    title: 'The Georgian Calendar',
    authorOrEntity: 'Hugh Jones (Hirossa Ap-Iccim)',
    year: '1745',
    description:
      'Proposed a 13-month calendar of 28 days named after King George II. Established the 13 × 28 = 364 day grid, but lacked a recurring intercalary mechanism, resulting in cumulative solar drift over centuries.',
    differences: [
      'Lacked periodic intercalary days',
      'Named months after English monarchy',
      'No astronomical vernal anchor',
    ],
  },
  {
    id: 'comte-1849',
    title: 'The Positivist Calendar',
    authorOrEntity: 'Auguste Comte',
    year: '1849',
    description:
      'Formulated a 13-month secular calendar utilising 28-day months and an unassigned year-end day ("Festival of All the Dead") plus leap day. Proposed resetting epoch numbering, establishing the precedent for system-level temporal resets.',
    differences: [
      'Named months after historical philosophers and figures',
      'Epoch tied to 1789 French Revolutionary era',
      'Maintained mid-winter start',
    ],
  },
  {
    id: 'cotsworth-1902',
    title: 'The International Fixed Calendar',
    authorOrEntity: 'Moses B. Cotsworth (Cotsworth Plan)',
    year: '1902',
    description:
      'Formalised the International Fixed Calendar, standardising 13 months with a 13th month ("Sol") inserted arbitrarily in mid-year (between June and July) and a single year-end "Year Day".',
    differences: [
      'Inserted 13th month "Sol" irregularly in mid-summer',
      'Retained Roman/Gregorian month names',
      'Retained traditional AD/CE year numbering',
    ],
  },
  {
    id: 'kodak-1928',
    title: 'Industrial Enterprise Implementation',
    authorOrEntity: 'George Eastman / Eastman Kodak Company',
    year: '1928–1989',
    description:
      'Industrialist George Eastman adopted Cotsworth\'s 13-month architecture internally for Kodak. The company operated under an internal 13-month, 28-day accounting cycle for over 60 years, proving the real-world operational efficiency and 0% quarterly variance for enterprise forecasting.',
    differences: [
      'Purely internal corporate accounting standard',
      'Dual-tracked Gregorian dates for public reporting',
      'Empirical validation of zero financial variance over 6 decades',
    ],
  },
  {
    id: 'egyptian-ancient',
    title: 'Ancient Epagomenal Architecture',
    authorOrEntity: 'Ancient Egyptian Civil Calendar',
    year: 'c. 3000 BCE',
    description:
      'Adapted the ancient Egyptian model of epagomenal (intercalary) days inserted outside standard month matrices to synchronize celestial and solar orbits, providing the cultural and mathematical origin for Intercalaris.',
    differences: [
      'Original Egyptian calendar used twelve 30-day months + 5 epagomenal days',
      'Seshat refines this into thirteen 28-day months + 1-2 Intercalaris days',
      'Preserves the exact invariant 7-day weekly cadence',
    ],
  },
];

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: 1,
    title: 'Awareness & Open Standard Definition',
    timeline: '2024–2025',
    description:
      'Publish open-source specifications, host public intelligence briefings, and distribute SDKs to enterprise software vendors.',
    milestones: [
      'Publish Open Mathematical Specification & Whitepaper',
      'Release Seshat Chronometry TypeScript/Rust SDKs',
      'Enterprise briefing with tech and aerospace partners',
    ],
    status: 'completed',
  },
  {
    phase: 2,
    title: 'Regulatory & Legal Alignment',
    timeline: '2026–2027',
    description:
      'Engage international standards bodies (ISO 8601 update proposal), national legislatures, and global banking authorities to establish legal recognition of the 13-month structure and Intercalaris accounting rules.',
    milestones: [
      'ISO 8601 Extension Drafting Committee review',
      'Intercalaris non-banking day financial accounting standards',
      'Civil aviation & orbital launch chronometry consultation',
    ],
    status: 'active',
  },
  {
    phase: 3,
    title: 'Technical Integration & Sandbox Pilots',
    timeline: '2028–2029',
    description:
      'Patch POS software, ERP systems (SAP, Oracle), Unix timestamps, and cloud infrastructure. Execute pilot runs across specialised logistics networks, private intelligence pipelines, and financial clearinghouses.',
    milestones: [
      'ERP middleware connectors (SAP, Oracle NetSuite, Workday)',
      'Unix timestamp normalization layers (ISO/Seshat conversion)',
      'High-frequency trading sandbox testing on 28-day cycles',
    ],
    status: 'upcoming',
  },
  {
    phase: 4,
    title: 'Full Global Epoch Reset',
    timeline: 'April 1, 2030 CE',
    description:
      'Hard switch to Year 0, Month 1 (Wa), Day 1 across public and private infrastructure worldwide.',
    milestones: [
      'Global system clock epoch reset at 00:00:00 UTC',
      'Inaugural Intercalaris 1 celebration on March 31, 2030 CE',
      'Universal enterprise cutover to Year 0, Wa 1',
    ],
    status: 'upcoming',
  },
];

export const WEEKDAYS = [
  { short: 'Sun', full: 'Sunday', num: 1, dayIndices: [1, 8, 15, 22] },
  { short: 'Mon', full: 'Monday', num: 2, dayIndices: [2, 9, 16, 23] },
  { short: 'Tue', full: 'Tuesday', num: 3, dayIndices: [3, 10, 17, 24] },
  { short: 'Wed', full: 'Wednesday', num: 4, dayIndices: [4, 11, 18, 25] },
  { short: 'Thu', full: 'Thursday', num: 5, dayIndices: [5, 12, 19, 26] },
  { short: 'Fri', full: 'Friday', num: 6, dayIndices: [6, 13, 20, 27] },
  { short: 'Sat', full: 'Saturday', num: 7, dayIndices: [7, 14, 21, 28] },
];
