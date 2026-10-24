function toLocalDateString(input) {
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
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
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
}

function isDateInFilterRange(recordDateStr, preset, customStart, customEnd) {
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
  }

  return true;
}

const transactions = [
  { name: 'Sale A', date: '2026-06-20T00:05:00+05:30', amount: 100 },
  { name: 'Sale B', date: '2026-06-22T14:30:00+05:30', amount: 320 },
  { name: 'Sale C', date: '2026-06-24T23:55:00+05:30', amount: 180 },
  { name: 'Sale D', date: '2026-06-25T11:00:00+05:30', amount: 400 },
];

function calc(start, end) {
  return transactions
    .filter(t => isDateInFilterRange(t.date, 'custom', start, end))
    .reduce((sum, t) => sum + t.amount, 0);
}

console.log('20th-24th: Expected 600, Got:', calc('2026-06-20', '2026-06-24'));
console.log('22nd-24th: Expected 500, Got:', calc('2026-06-22', '2026-06-24'));
console.log('20th-22nd: Expected 420, Got:', calc('2026-06-20', '2026-06-22'));
console.log('25th-25th: Expected 400, Got:', calc('2026-06-25', '2026-06-25'));
console.log('Empty range (2026-06-26 to 2026-06-27): Expected 0, Got:', calc('2026-06-26', '2026-06-27'));
