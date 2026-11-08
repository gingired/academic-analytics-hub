import React from 'react';
const styles = {
  'On Track': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'Monitor Closely': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Intervention Needed': 'bg-rose-50 text-rose-700 ring-rose-200',
  'Assessment Incomplete': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
};
export default function StatusBadge({ status }) {
  return <span className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status] || 'bg-slate-50 text-slate-600 ring-slate-200'}`}>{status}</span>;
}
