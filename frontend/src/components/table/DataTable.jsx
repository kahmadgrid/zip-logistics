import React from 'react';
import { Loader2 } from 'lucide-react';

export default function DataTable({ columns, data, loading, emptyMsg = 'No data found' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 gap-2">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">{emptyMsg}</div>
    );
  }

  return (
    <div className="table-wrapper animate-fade-in">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
