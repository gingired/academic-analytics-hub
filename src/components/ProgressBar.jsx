import React from 'react';
export default function ProgressBar({ label, value = 0, color = 'bg-blue-600', detail }) {
  const safe = Math.min(100, Math.max(0, value ?? 0));
  return <div>
    <div className="mb-2 flex items-center justify-between gap-2 text-sm"><span className="font-medium text-slate-700">{label}</span><span className="shrink-0 font-bold tabular-nums text-slate-700">{detail ?? `${safe.toFixed(1)}%`}</span></div>
    <div className="h-3 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${safe}%` }} />
    </div>
  </div>;
}
