export type DateFilterPreset =
  | 'all'
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | '7days'
  | '30days'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisYear'
  | 'custom';

/** Formats a Date object or date string to YYYY-MM-DD in local time */
export const toLocalDateString = (input: Date | string | null | undefined): string => {
  if (!input) return '';
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return '';
    const yyyy = input.getFullYear();
    const mm = String(input.getMonth() + 1).padStart(2, '0');
    const dd = String(input.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  if (typeof input === 'string') {
    const trimmed = input.trim();
    // If it's strictly a calendar date YYYY-MM-DD without time components
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    // For ISO timestamps or date-time strings, parse and convert to local calendar date
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.slice(0, 10);
    }
  }
  return '';
};

/** Formats a YYYY-MM-DD string into a clean display label, e.g. "12 Jun 2026" */
export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const clean = toLocalDateString(dateStr);
  const parts = clean.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const d = new Date(year, monthIdx, day);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Determines if a given date string/ISO timestamp is within the selected range (INCLUSIVE) */
export const isDateInFilterRange = (
  recordDateStr: string | null | undefined,
  preset: DateFilterPreset,
  customStart?: string,
  customEnd?: string
): boolean => {
  if (preset === 'all') return true;
  if (!recordDateStr) return false;

  const recDate = toLocalDateString(recordDateStr);
  if (!recDate) return false;

  const now = new Date();
  const todayStr = toLocalDateString(now);

  if (preset === 'today') {
    return recDate === todayStr;
  }

  if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return recDate === toLocalDateString(y);
  }

  if (preset === 'thisWeek') {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    const monStr = toLocalDateString(mon);
    const sunStr = toLocalDateString(sun);
    return recDate >= monStr && recDate <= sunStr;
  }

  if (preset === '7days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return recDate >= toLocalDateString(start) && recDate <= todayStr;
  }

  if (preset === '30days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return recDate >= toLocalDateString(start) && recDate <= todayStr;
  }

  if (preset === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return recDate >= toLocalDateString(start) && recDate <= toLocalDateString(end);
  }

  if (preset === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return recDate >= toLocalDateString(start) && recDate <= toLocalDateString(end);
  }

  if (preset === 'thisYear') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return recDate >= toLocalDateString(start) && recDate <= toLocalDateString(end);
  }

  if (preset === 'custom') {
    const startStr = toLocalDateString(customStart);
    const endStr = toLocalDateString(customEnd);
    if (!startStr && !endStr) return true;
    if (startStr && endStr) {
      if (endStr < startStr) return false;
      return recDate >= startStr && recDate <= endStr;
    }
    if (startStr) return recDate >= startStr;
    if (endStr) return recDate <= endStr;
    return true;
  }

  return true;
};

/** Returns formatted text describing the currently active date range (e.g. "12 Jun 2026 – 24 Jun 2026") */
export const getActivePeriodLabel = (
  preset: DateFilterPreset,
  customStart?: string,
  customEnd?: string
): string => {
  const now = new Date();
  const todayStr = toLocalDateString(now);

  if (preset === 'all') return 'All Time';

  if (preset === 'today') {
    return formatDateDisplay(todayStr);
  }

  if (preset === 'yesterday') {
    const y = new Date(now);
    y.setDate(y.getDate() - 1);
    return formatDateDisplay(toLocalDateString(y));
  }

  if (preset === 'thisWeek') {
    const day = now.getDay();
    const diffToMon = day === 0 ? -6 : 1 - day;
    const mon = new Date(now);
    mon.setDate(now.getDate() + diffToMon);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return `${formatDateDisplay(toLocalDateString(mon))} – ${formatDateDisplay(toLocalDateString(sun))}`;
  }

  if (preset === '7days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    return `${formatDateDisplay(toLocalDateString(start))} – ${formatDateDisplay(todayStr)}`;
  }

  if (preset === '30days') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return `${formatDateDisplay(toLocalDateString(start))} – ${formatDateDisplay(todayStr)}`;
  }

  if (preset === 'thisMonth') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return `${formatDateDisplay(toLocalDateString(start))} – ${formatDateDisplay(toLocalDateString(end))}`;
  }

  if (preset === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return `${formatDateDisplay(toLocalDateString(start))} – ${formatDateDisplay(toLocalDateString(end))}`;
  }

  if (preset === 'thisYear') {
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    return `${formatDateDisplay(toLocalDateString(start))} – ${formatDateDisplay(toLocalDateString(end))}`;
  }

  if (preset === 'custom') {
    if (!customStart || !customEnd) return 'Custom Date Range';
    if (customEnd < customStart) return 'Invalid Range (End date is before Start date)';
    return `${formatDateDisplay(customStart)} – ${formatDateDisplay(customEnd)}`;
  }

  return 'All Time';
};
