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

function testDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const localNoon = new Date(y, m - 1, d, 12, 0, 0);
  const iso = localNoon.toISOString();
  const restored = toLocalDateString(iso);
  console.log(dateStr, '-> ISO:', iso, '-> Restored:', restored, restored === dateStr ? 'PASS' : 'FAIL');
}
testDate('2026-06-20');
testDate('2026-06-22');
testDate('2026-06-24');
testDate('2026-06-25');
testDate('2026-01-01');
testDate('2026-12-31');
testDate('2026-02-28');
