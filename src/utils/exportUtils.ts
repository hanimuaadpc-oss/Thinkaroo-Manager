/**
 * CSV Export utility
 */

export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers
        .map(fieldName => {
          let value = row[fieldName] ?? '';
          if (typeof value === 'string') {
            value = `"${value.replace(/"/g, '""')}"`;
          } else if (typeof value === 'object') {
            value = `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
