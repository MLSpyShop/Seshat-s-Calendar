import { jsPDF } from 'jspdf';
import { MONTHS, WEEKDAYS, SESHAT_METADATA } from '../data';
import {
  isSeshatLeapYear,
  getSeshatYearStartDate,
  getSeshatYearTotalDays,
  seshatToGregorian,
  formatGregorianISO,
  formatGregorianLong,
  EPOCH_GREGORIAN_YEAR,
} from './calendarMath';
import { getLunarEventsMapForSeshatYear } from './lunarMath';

/**
 * Generates the Perpetual 1000-Year Master Calendar PDF (2030–3030 CE / Years 0 to 1000)
 */
export function generateMillennialMasterPdf(): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // -------------------------------------------------------------
  // PAGE 1: TITLE & PERPETUAL ORDINANCE COVER
  // -------------------------------------------------------------
  // Header accent bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setFillColor(217, 119, 6); // amber-600 gold strip
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text("THE SESHAT 1000-YEAR PERPETUAL CALENDAR", margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text("INVARIANT 13-MONTH · 28-DAY CHRONOMETRICAL MASTER ORDINANCE", margin, 26);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFontSize(8.5);
  doc.text(`Official Standard · Epoch 2030–3030 CE (Seshat Years 0 to 1000) · Valid for the Next 1,000 Years`, margin, 34);

  // Author & Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, 52, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(`Architectural Authority: ${SESHAT_METADATA.author}, ${SESHAT_METADATA.titleAndRole}`, margin + 5, 59);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`ORCID: ${SESHAT_METADATA.orcid}  |  Universal Epoch Datum: April 1, 2030 CE (00:00:00 UTC = Year 0, Wa 1)`, margin + 5, 66);
  doc.text(`Scope of Validity: 1000 Solar Tropical Years (2030 CE through 3030 CE)  |  Mathematical Drift: 0.0000000000%`, margin + 5, 72);

  // Invariant Core Principle Statement
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.roundedRect(margin, 82, contentWidth, 26, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14); // amber-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("THE INVARIANT WEEKDAY LAW (PERPETUAL AXIOM)", margin + 5, 89);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(120, 53, 15);
  doc.text(
    "Unlike the Gregorian calendar, where weekdays perpetually drift across months and years, every single month in\n" +
    "the Seshat Calendar is permanently identical: Month 1 Day 1 (Wa 1) is ALWAYS Sunday, and Day 28 is ALWAYS Saturday.\n" +
    "This calendar requires no re-printing: the 28-day matrix below remains eternally accurate for the next 1,000 years.",
    margin + 5,
    95
  );

  // Perpetual Month Matrix Overview Table
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("The Perpetual Invariant Month Grid (Applies to All 13 Months)", margin, 116);

  // Render the Master 28-day Perpetual Grid
  const gridX = margin;
  const gridY = 121;
  const colW = contentWidth / 7;
  const rowH = 9.5;

  // Table header
  const weekdays = ['Sun (Day 1)', 'Mon (Day 2)', 'Tue (Day 3)', 'Wed (Day 4)', 'Thu (Day 5)', 'Fri (Day 6)', 'Sat (Day 7)'];
  for (let c = 0; c < 7; c++) {
    doc.setFillColor(30, 41, 59); // slate-800
    doc.rect(gridX + c * colW, gridY, colW, rowH, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(weekdays[c], gridX + c * colW + colW / 2, gridY + 6, { align: 'center' });
  }

  // Table rows for 4 weeks (28 days)
  for (let row = 0; row < 4; row++) {
    const yPos = gridY + rowH + row * rowH;
    for (let c = 0; c < 7; c++) {
      const dayNum = row * 7 + c + 1;
      const isWeekend = c === 0 || c === 6;

      if (isWeekend) {
        doc.setFillColor(241, 245, 249); // slate-100
      } else {
        doc.setFillColor(row % 2 === 0 ? 255 : 250, row % 2 === 0 ? 255 : 250, row % 2 === 0 ? 255 : 252);
      }
      doc.rect(gridX + c * colW, yPos, colW, rowH, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(gridX + c * colW, yPos, colW, rowH, 'S');

      doc.setTextColor(isWeekend ? 15 : 51, isWeekend ? 23 : 65, isWeekend ? 42 : 85);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Day ${dayNum}`, gridX + c * colW + colW / 2, yPos + 6.5, { align: 'center' });
    }
  }

  // 13 Months Nomenclature Table
  const tableTopY = 176;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("The 13 Canonical Months of the Perpetual Seshat Standard", margin, tableTopY);

  // Month summary table
  const mColW = [14, 26, 28, 48, contentWidth - 116];
  const mHeaders = ['No.', 'Month Name', 'Egyptian Numeral', 'Thematic Arc', 'Significance & Cosmological Resonance'];
  
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, tableTopY + 4, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  let curX = margin;
  for (let i = 0; i < mHeaders.length; i++) {
    doc.text(mHeaders[i], curX + 2, tableTopY + 8);
    curX += mColW[i];
  }

  let curY = tableTopY + 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);

  for (let m = 0; m < MONTHS.length; m++) {
    const month = MONTHS[m];
    doc.setFillColor(m % 2 === 0 ? 255 : 248, m % 2 === 0 ? 255 : 250, m % 2 === 0 ? 255 : 252);
    doc.rect(margin, curY, contentWidth, 5.2, 'F');
    doc.setDrawColor(241, 245, 249);
    doc.rect(margin, curY, contentWidth, 5.2, 'S');

    doc.setTextColor(15, 23, 42);
    let xOff = margin;

    // No.
    doc.setFont('helvetica', 'bold');
    doc.text(`M${month.number}`, xOff + 2, curY + 3.8);
    xOff += mColW[0];

    // Name
    doc.text(month.name, xOff + 2, curY + 3.8);
    xOff += mColW[1];

    // Numeral
    doc.setFont('helvetica', 'normal');
    doc.text(month.egyptianNumeral, xOff + 2, curY + 3.8);
    xOff += mColW[2];

    // Theme
    doc.text(month.theme, xOff + 2, curY + 3.8);
    xOff += mColW[3];

    // Significance
    doc.text(month.significance.slice(0, 52) + '...', xOff + 2, curY + 3.8);

    curY += 5.2;
  }

  // Epagomenal Solar Days Box at bottom of Page 1
  const epagBoxY = curY + 4;
  doc.setFillColor(243, 232, 255); // purple-100
  doc.setDrawColor(192, 132, 252); // purple-400
  doc.roundedRect(margin, epagBoxY, contentWidth, 23, 2, 2, 'FD');

  doc.setTextColor(88, 28, 135); // purple-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text("EPAGOMENAL SOLAR SYNCHRONIZATION DAYS (INTERCALARIS 1 & 2)", margin + 4, epagBoxY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 33, 168);
  doc.text(
    "• Common Years (365 Days): Month 13 ends on March 30. Day 365 is INTERCALARIS 1 (I₁) on March 31 (Epagomenal Solar Eve).\n" +
    "• Leap Years (366 Days): Month 13 ends on March 29. Day 365 is INTERCALARIS 1 (I₁) on March 30, and Day 366 is INTERCALARIS 2 (I₂)\n" +
    "  on March 31 (Quadrennial Solar Leap Anchor). Both days exist outside the 7-day weekly sequence, ensuring Wa 1 is always Sunday.",
    margin + 4,
    epagBoxY + 11
  );

  // Footer Page 1
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text("The Seshat 1000-Year Perpetual Master Ordinance  ·  Page 1 of 3", pageWidth / 2, pageHeight - 6, { align: 'center' });

  // -------------------------------------------------------------
  // PAGE 2: 1000-YEAR MILLENNIUM LEAP TABLE (2030–3030 CE)
  // -------------------------------------------------------------
  doc.addPage('a4', 'portrait');

  // Top header bar Page 2
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 24, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 24, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text("1,000-YEAR MILLENNIUM LEAP CYCLE & CENTURY ANCHOR TABLE", margin, 12);
  doc.setFontSize(8);
  doc.setTextColor(217, 119, 6);
  doc.text("EXACT RECKONING FROM APRIL 1, 2030 CE (YEAR 0) TO MARCH 31, 3030 CE (YEAR 1000)", margin, 18);

  // Mathematical Framework Overview
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, 30, contentWidth, 20, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("Astronomical Leap Synchronization Formula for 1000 Years:", margin + 4, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "A Seshat Year is a Leap Year (366 days, activating Intercalaris 2 on March 31) if the Gregorian year containing its conclusion\n" +
    "is divisible by 4, EXCEPT century years unless divisible by 400. In 1,000 years there are exactly 242 leap years and 758 common years.\n" +
    "Total days across the millennium = (758 × 365) + (242 × 366) = 365,242 days, maintaining absolute astronomical equilibrium.",
    margin + 4,
    41
  );

  // Century-by-Century Master Table (11 centuries covering 2030 to 3030 CE)
  const cTableY = 55;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Millennium Century Breakdown (Seshat Years 0 to 1000 / 2030–3030 CE)", margin, cTableY);

  const centHeaders = ['Century', 'Gregorian Span', 'Seshat Years', 'Leap Years', 'Century Rule', 'Sample Leap Years (Activating I₂)'];
  const centColW = [22, 28, 25, 22, 25, contentWidth - 122];

  doc.setFillColor(30, 41, 59);
  doc.rect(margin, cTableY + 4, contentWidth, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);

  let cX = margin;
  for (let i = 0; i < centHeaders.length; i++) {
    doc.text(centHeaders[i], cX + 2, cTableY + 8);
    cX += centColW[i];
  }

  const centuriesData = [
    { name: '21st Century', greg: '2030–2099 CE', sesh: 'Years 0–69', leaps: '17 leaps', rule: 'Standard /4', sample: '2032, 2036, 2040, 2044, 2048, 2096' },
    { name: '22nd Century', greg: '2100–2199 CE', sesh: 'Years 70–169', leaps: '24 leaps', rule: '2100 Common', sample: '2104, 2108, 2112, ..., 2192, 2196' },
    { name: '23rd Century', greg: '2200–2299 CE', sesh: 'Years 170–269', leaps: '24 leaps', rule: '2200 Common', sample: '2204, 2208, 2212, ..., 2292, 2296' },
    { name: '24th Century', greg: '2300–2399 CE', sesh: 'Years 270–369', leaps: '24 leaps', rule: '2300 Common', sample: '2304, 2308, 2312, ..., 2392, 2396' },
    { name: '25th Century', greg: '2400–2499 CE', sesh: 'Years 370–469', leaps: '25 leaps', rule: '2400 LEAP (/400)', sample: '2400, 2404, 2408, ..., 2492, 2496' },
    { name: '26th Century', greg: '2500–2599 CE', sesh: 'Years 470–569', leaps: '24 leaps', rule: '2500 Common', sample: '2504, 2508, 2512, ..., 2592, 2596' },
    { name: '27th Century', greg: '2600–2699 CE', sesh: 'Years 570–669', leaps: '24 leaps', rule: '2600 Common', sample: '2604, 2608, 2612, ..., 2692, 2696' },
    { name: '28th Century', greg: '2700–2799 CE', sesh: 'Years 670–769', leaps: '24 leaps', rule: '2700 Common', sample: '2704, 2708, 2712, ..., 2792, 2796' },
    { name: '29th Century', greg: '2800–2899 CE', sesh: 'Years 770–869', leaps: '25 leaps', rule: '2800 LEAP (/400)', sample: '2800, 2804, 2808, ..., 2892, 2896' },
    { name: '30th Century', greg: '2900–2999 CE', sesh: 'Years 870–969', leaps: '24 leaps', rule: '2900 Common', sample: '2904, 2908, 2912, ..., 2992, 2996' },
    { name: '31st Century', greg: '3000–3030 CE', sesh: 'Years 970–1000', leaps: '7 leaps', rule: '3000 Common', sample: '3004, 3008, 3012, 3016, 3020, 3024, 3028' },
  ];

  let centY = cTableY + 10;
  doc.setFontSize(7);

  for (let idx = 0; idx < centuriesData.length; idx++) {
    const item = centuriesData[idx];
    const isSpecial = item.rule.includes('LEAP');

    doc.setFillColor(isSpecial ? 254 : idx % 2 === 0 ? 255 : 248, isSpecial ? 243 : idx % 2 === 0 ? 255 : 250, isSpecial ? 199 : idx % 2 === 0 ? 255 : 252);
    doc.rect(margin, centY, contentWidth, 6, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(margin, centY, contentWidth, 6, 'S');

    let colX = margin;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(item.name, colX + 2, centY + 4.2);
    colX += centColW[0];

    doc.setFont('helvetica', 'normal');
    doc.text(item.greg, colX + 2, centY + 4.2);
    colX += centColW[1];

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175); // blue-800
    doc.text(item.sesh, colX + 2, centY + 4.2);
    colX += centColW[2];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(item.leaps, colX + 2, centY + 4.2);
    colX += centColW[3];

    doc.setFont('helvetica', isSpecial ? 'bold' : 'normal');
    doc.setTextColor(isSpecial ? 180 : 15, isSpecial ? 83 : 23, isSpecial ? 9 : 42);
    doc.text(item.rule, colX + 2, centY + 4.2);
    colX += centColW[4];

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.sample, colX + 2, centY + 4.2);

    centY += 6;
  }

  // Financial & Enterprise Advantages Table
  const finY = centY + 8;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("The 91-Day Financial Quarter Law for 1000 Years", margin, finY);

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(margin, finY + 4, contentWidth, 38, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52); // emerald-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("Harmonized 91-Day Invariant Corporate Quarters (13 Weeks Each):", margin + 4, finY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  doc.text(
    "• Quarter 1: Month 1 (Wa), Month 2 (Sen), Month 3 (Khem) + Week 1 of Month 4 (Fdw) = Exactly 91 Days (13 Weeks)\n" +
    "• Quarter 2: Weeks 2–4 of Month 4 (Fdw), Month 5 (Diw), Month 6 (Sas), Month 7 (Sfn) = Exactly 91 Days (13 Weeks)\n" +
    "• Quarter 3: Month 8 (Khem-2), Month 9 (Pesedjet), Month 10 (Med) + Week 1 of Month 11 (Asar) = Exactly 91 Days (13 Weeks)\n" +
    "• Quarter 4: Weeks 2–4 of Month 11 (Asar), Month 12 (Dwa), Month 13 (Seba) = Exactly 91 Days (13 Weeks) + Epagomenal Days\n" +
    "\n" +
    "FINANCIAL BENEFIT: Under Gregorian timekeeping, February has 28 days while March has 31 (a 10.7% variance),\n" +
    "distorting interest calculations, payroll amortization, revenue recognition, and retail comparables.\n" +
    "The Seshat standard delivers exactly 0.00% intra-annual variance for the entire millennium.",
    margin + 4,
    finY + 16
  );

  // Footer Page 2
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text("The Seshat 1000-Year Perpetual Master Ordinance  ·  Page 2 of 3", pageWidth / 2, pageHeight - 6, { align: 'center' });

  // -------------------------------------------------------------
  // PAGE 3: 13-MONTH FULL ANNUAL CALENDAR DISPLAY (ALL MONTHS)
  // -------------------------------------------------------------
  doc.addPage('a4', 'portrait');

  // Top header bar Page 3
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 20, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 20, pageWidth, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text("THE INVARIANT 13-MONTH WALL CALENDAR ARCHETYPE", margin, 11);
  doc.setFontSize(7.5);
  doc.setTextColor(217, 119, 6);
  doc.text("PERPETUAL TEMPLATE VALID FOR ANY YEAR FROM YEAR 0 (2030 CE) TO YEAR 1000 (3030 CE)", margin, 16);

  // Render 13 small monthly calendars on one page
  // Layout: 3 columns x 4 rows = 12 months + 1 month at bottom with Intercalaris box
  const calMargin = 12;
  const calWidth = pageWidth - calMargin * 2;
  const numCols = 3;
  const colGap = 4;
  const rowGap = 3.5;
  const monthCardW = (calWidth - (numCols - 1) * colGap) / numCols; // ~58mm
  const monthCardH = 43; // ~43mm

  let startGridY = 26;

  for (let m = 0; m < 12; m++) {
    const month = MONTHS[m];
    const col = m % numCols;
    const row = Math.floor(m / numCols);
    const cardX = calMargin + col * (monthCardW + colGap);
    const cardY = startGridY + row * (monthCardH + rowGap);

    renderMiniMonth(doc, month, cardX, cardY, monthCardW, monthCardH);
  }

  // Row 5: Month 13 + Intercalaris Showcase Box
  const row5Y = startGridY + 4 * (monthCardH + rowGap);
  const m13 = MONTHS[12];
  renderMiniMonth(doc, m13, calMargin, row5Y, monthCardW, monthCardH);

  // Beside Month 13: Intercalaris 1 & 2 Explanatory Panel
  const sideBoxX = calMargin + monthCardW + colGap;
  const sideBoxW = calWidth - (monthCardW + colGap);
  const sideBoxH = monthCardH;

  doc.setFillColor(245, 243, 255); // violet-50
  doc.setDrawColor(167, 139, 250); // violet-400
  doc.roundedRect(sideBoxX, row5Y, sideBoxW, sideBoxH, 1.5, 1.5, 'FD');

  doc.setTextColor(76, 29, 149); // violet-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text("SOLAR SYNCHRONIZATION DAYS (CLOSING EACH SESHAT YEAR)", sideBoxX + 4, row5Y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(109, 40, 217);
  doc.text("• INTERCALARIS 1 (I₁) · Present in Every Year", sideBoxX + 4, row5Y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    "  Common Years: March 31 (Solar Epagomenal Eve, precedes Wa 1)\n" +
    "  Leap Years: March 30 (First Epagomenal Day, precedes Intercalaris 2)",
    sideBoxX + 4,
    row5Y + 16
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(109, 40, 217);
  doc.text("• INTERCALARIS 2 (I₂) · Quadrennial Leap Years Only", sideBoxX + 4, row5Y + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    "  Leap Years: March 31 (Second Epagomenal Day / Leap Solar Anchor, precedes Wa 1)\n" +
    "  Both days sit outside the 7-day weekly sequence, ensuring that Month 1, Day 1 (Wa 1)\n" +
    "  is permanently, unconditionally, without exception: SUNDAY.",
    sideBoxX + 4,
    row5Y + 28
  );

  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(sideBoxX + 4, row5Y + 34, sideBoxW - 8, 7, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(49, 46, 129);
  doc.text("VERIFIED PERPETUAL CONGRUENCE: 2030 CE – 3030 CE (1,000 YEARS)", sideBoxX + sideBoxW / 2, row5Y + 38.5, { align: 'center' });

  // Bottom Ordinance Validation
  const valY = row5Y + monthCardH + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(calMargin, valY, calWidth, 14, 1.5, 1.5, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("OFFICIAL PROMULGATION & ARCHIVAL SPECIFICATION", calMargin + 4, valY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Authored by ${SESHAT_METADATA.author}, ${SESHAT_METADATA.titleAndRole} (ORCID: ${SESHAT_METADATA.orcid}).\n` +
    `Certified for civil administration, corporate accounting, computational standards, and astronomical chronometry for the next 1000 years.`,
    calMargin + 4,
    valY + 9
  );

  // Footer Page 3
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text("The Seshat 1000-Year Perpetual Master Ordinance  ·  Page 3 of 3", pageWidth / 2, pageHeight - 6, { align: 'center' });

  return doc;
}

/**
 * Helper to render a compact 28-day month block inside a PDF page
 */
function renderMiniMonth(
  doc: jsPDF,
  month: { number: number; name: string; egyptianNumeral: string; theme: string },
  x: number,
  y: number,
  w: number,
  h: number
) {
  // Border container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(x, y, w, h, 1, 1, 'FD');

  // Month Header Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(x, y, w, 7, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`M${month.number}: ${month.name}`, x + 2.5, y + 4.8);

  doc.setTextColor(217, 119, 6); // amber-500
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(month.egyptianNumeral, x + w - 2.5, y + 4.8, { align: 'right' });

  // Subtitle (Theme)
  doc.setFillColor(248, 250, 252);
  doc.rect(x, y + 7, w, 3.5, 'F');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(5.5);
  doc.text(month.theme, x + 2.5, y + 9.5);

  // Weekday initials
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayColW = w / 7;
  const dayHeaderY = y + 10.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(x, dayHeaderY, w, 3.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);

  for (let d = 0; d < 7; d++) {
    doc.setTextColor(d === 0 || d === 6 ? 180 : 71, d === 0 || d === 6 ? 83 : 85, d === 0 || d === 6 ? 9 : 105);
    doc.text(weekDays[d], x + d * dayColW + dayColW / 2, dayHeaderY + 2.4, { align: 'center' });
  }

  // Days 1 through 28 (4 rows of 7 days)
  const daysStartY = dayHeaderY + 3.2;
  const dayRowH = (h - (daysStartY - y)) / 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const dayNum = r * 7 + c + 1;
      const cellX = x + c * dayColW;
      const cellY = daysStartY + r * dayRowH;
      const isWeekend = c === 0 || c === 6;

      if (isWeekend) {
        doc.setFillColor(248, 250, 252);
        doc.rect(cellX, cellY, dayColW, dayRowH, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.rect(cellX, cellY, dayColW, dayRowH, 'S');

      doc.setTextColor(isWeekend ? 15 : 51, isWeekend ? 23 : 65, isWeekend ? 42 : 85);
      doc.text(String(dayNum), cellX + dayColW / 2, cellY + dayRowH / 2 + 1.8, { align: 'center' });
    }
  }
}

/**
 * Generates an Annual Calendar PDF for a specific Seshat Year (Year 0 through Year 1000)
 */
export function generateSpecificYearPdf(seshatYear: number): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const isLeap = isSeshatLeapYear(seshatYear);
  const gregorianStartYear = EPOCH_GREGORIAN_YEAR + seshatYear;
  const lunarEventsMap = getLunarEventsMapForSeshatYear(seshatYear);

  // Top Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setFillColor(217, 119, 6);
  doc.rect(0, 28, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`SESHAT CALENDAR · YEAR ${seshatYear}`, margin, 13);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(217, 119, 6);
  doc.text(
    `CIVIL RECKONING: APRIL 1, ${gregorianStartYear} CE – MARCH 31, ${gregorianStartYear + 1} CE · ${
      isLeap ? 'LEAP YEAR (366 DAYS · 2 EPAGOMENAL DAYS)' : 'COMMON YEAR (365 DAYS · 1 EPAGOMENAL DAY)'
    }`,
    margin,
    20
  );

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.text(
    `Perpetual Invariant Weekly Cadence · Every Month Starts on Sunday (Day 1) and Ends on Saturday (Day 28)`,
    margin,
    25
  );

  // 12 months grid (3 cols x 4 rows)
  const numCols = 3;
  const colGap = 4;
  const rowGap = 3.5;
  const monthCardW = (contentWidth - (numCols - 1) * colGap) / numCols;
  const monthCardH = 43;
  const startGridY = 33;

  for (let m = 0; m < 12; m++) {
    const month = MONTHS[m];
    const col = m % numCols;
    const row = Math.floor(m / numCols);
    const cardX = margin + col * (monthCardW + colGap);
    const cardY = startGridY + row * (monthCardH + rowGap);

    renderSpecificMonth(doc, seshatYear, month, cardX, cardY, monthCardW, monthCardH, lunarEventsMap);
  }

  // Row 5: Month 13 + Intercalaris Card
  const row5Y = startGridY + 4 * (monthCardH + rowGap);
  const m13 = MONTHS[12];
  renderSpecificMonth(doc, seshatYear, m13, margin, row5Y, monthCardW, monthCardH, lunarEventsMap);

  // Intercalaris Box
  const sideBoxX = margin + monthCardW + colGap;
  const sideBoxW = contentWidth - (monthCardW + colGap);
  const sideBoxH = monthCardH;

  doc.setFillColor(245, 243, 255);
  doc.setDrawColor(167, 139, 250);
  doc.roundedRect(sideBoxX, row5Y, sideBoxW, sideBoxH, 1.5, 1.5, 'FD');

  doc.setTextColor(76, 29, 149);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(`SOLAR SYNCHRONIZATION DAYS · YEAR ${seshatYear}`, sideBoxX + 4, row5Y + 6);

  const i1Greg = seshatToGregorian(seshatYear, 'intercalaris_1');
  const i2Greg = seshatToGregorian(seshatYear, 'intercalaris_2');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(109, 40, 217);
  doc.text(`• INTERCALARIS 1 (I₁): ${formatGregorianLong(i1Greg)}`, sideBoxX + 4, row5Y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(
    isLeap
      ? `  Day 365 of 366. First Epagomenal Day (Precedes Intercalaris 2). Outside weekly cycle.`
      : `  Day 365 of 365. Annual Solar Epagomenal Eve (Precedes Wa 1). Outside weekly cycle.`,
    sideBoxX + 4,
    row5Y + 16
  );

  if (isLeap) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(109, 40, 217);
    doc.text(`• INTERCALARIS 2 (I₂): ${formatGregorianLong(i2Greg)}`, sideBoxX + 4, row5Y + 23);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(
      `  Day 366 of 366. Second Epagomenal Day (Quadrennial Solar Leap Anchor). Precedes Wa 1.`,
      sideBoxX + 4,
      row5Y + 27
    );
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`• INTERCALARIS 2 (I₂): Dormant in Common Years (Year ${seshatYear} = 365 days)`, sideBoxX + 4, row5Y + 23);
  }

  doc.setFillColor(238, 242, 255);
  doc.setDrawColor(199, 210, 254);
  doc.roundedRect(sideBoxX + 4, row5Y + 34, sideBoxW - 8, 7, 1, 1, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(49, 46, 129);
  doc.text(
    `NEXT EPOCH: Year ${seshatYear + 1}, Month 1 (Wa 1) begins Sunday, April 1, ${gregorianStartYear + 1} CE`,
    sideBoxX + sideBoxW / 2,
    row5Y + 38.5,
    { align: 'center' }
  );

  // Footer
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.text(
    `Seshat Calendar Year ${seshatYear} (${gregorianStartYear}–${gregorianStartYear + 1} CE) · Authored by ${SESHAT_METADATA.author}`,
    pageWidth / 2,
    pageHeight - 6,
    { align: 'center' }
  );

  return doc;
}

/**
 * Helper to render a month with Gregorian date mapping & lunar indicators
 */
function renderSpecificMonth(
  doc: jsPDF,
  seshatYear: number,
  month: { number: number; name: string; egyptianNumeral: string; theme: string },
  x: number,
  y: number,
  w: number,
  h: number,
  lunarMap: Map<string, any>
) {
  // Container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(x, y, w, h, 1, 1, 'FD');

  // Month Header Bar
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(x, y, w, 7, 1, 1, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text(`M${month.number}: ${month.name}`, x + 2.5, y + 4.8);

  // Gregorian span subtitle
  const mStartGreg = seshatToGregorian(seshatYear, month.number, 1);
  const mEndGreg = seshatToGregorian(seshatYear, month.number, 28);
  const startMonthStr = mStartGreg.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endMonthStr = mEndGreg.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  doc.setFillColor(248, 250, 252);
  doc.rect(x, y + 7, w, 3.5, 'F');
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text(`${startMonthStr} – ${endMonthStr}`, x + 2.5, y + 9.5);

  doc.setTextColor(217, 119, 6);
  doc.text(month.egyptianNumeral, x + w - 2.5, y + 9.5, { align: 'right' });

  // Weekday initials
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const dayColW = w / 7;
  const dayHeaderY = y + 10.5;

  doc.setFillColor(241, 245, 249);
  doc.rect(x, dayHeaderY, w, 3.2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);

  for (let d = 0; d < 7; d++) {
    doc.setTextColor(d === 0 || d === 6 ? 180 : 71, d === 0 || d === 6 ? 83 : 85, d === 0 || d === 6 ? 9 : 105);
    doc.text(weekDays[d], x + d * dayColW + dayColW / 2, dayHeaderY + 2.4, { align: 'center' });
  }

  // Days 1 through 28
  const daysStartY = dayHeaderY + 3.2;
  const dayRowH = (h - (daysStartY - y)) / 4;

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 7; c++) {
      const dayNum = r * 7 + c + 1;
      const cellX = x + c * dayColW;
      const cellY = daysStartY + r * dayRowH;
      const isWeekend = c === 0 || c === 6;

      const gregDay = seshatToGregorian(seshatYear, month.number, dayNum);
      const iso = formatGregorianISO(gregDay);
      const lunar = lunarMap.get(iso);

      if (lunar?.type === 'full_moon') {
        doc.setFillColor(254, 243, 199); // amber-100 full moon highlight
      } else if (lunar?.type === 'new_moon') {
        doc.setFillColor(241, 245, 249); // slate-100 new moon
      } else if (isWeekend) {
        doc.setFillColor(248, 250, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(cellX, cellY, dayColW, dayRowH, 'F');

      doc.setDrawColor(241, 245, 249);
      doc.rect(cellX, cellY, dayColW, dayRowH, 'S');

      // Seshat day number
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.setTextColor(isWeekend ? 15 : 51, isWeekend ? 23 : 65, isWeekend ? 42 : 85);
      doc.text(String(dayNum), cellX + dayColW / 2, cellY + 3.5, { align: 'center' });

      // Gregorian day subscript
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.2);
      doc.setTextColor(148, 163, 184);
      doc.text(String(gregDay.getUTCDate()), cellX + dayColW / 2, cellY + dayRowH - 1.2, { align: 'center' });
    }
  }
}
