import React, { useEffect, useRef } from 'react';
import { X, Info } from 'lucide-react';
import { calculateTerm, ASSESSMENT_CONFIG } from '../utils/gradeCalculations';
import { individualRemediation } from '../utils/remediationEngine';
import { DIAGNOSTIC_BY_ID } from '../data/mockData';
import ProgressBar from './ProgressBar';
import StatusBadge from './StatusBadge';
const style = { ww: 'bg-blue-600', pt: 'bg-emerald-500', st: 'bg-violet-500', te: 'bg-fuchsia-500' };
const componentLabels = { ww: 'Written Work', pt: 'Performance Task', st: 'Summative Test', te: 'Term Exam' };
const headerStyles = { ww: 'bg-blue-50 text-blue-900', pt: 'bg-emerald-50 text-emerald-900', st: 'bg-violet-50 text-violet-900', te: 'bg-fuchsia-50 text-fuchsia-900' };
function AssessmentBreakdown({ type, records, summary }) {
  const label = componentLabels[type];
  return <section className="overflow-hidden rounded-xl border border-slate-200" aria-label={`${label} score breakdown`}>
    <div className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 ${headerStyles[type]}`}>
      <h4 className="text-sm font-bold">{type === 'te' ? 'Term Exam' : `${label}s`}</h4>
      <span className="text-xs font-semibold">{summary.completed}/{summary.count} encoded · {summary.percent === null ? 'No recorded scores' : `${summary.percent.toFixed(1)}% of recorded points`}</span>
    </div>
    <div className="overflow-x-auto"><table aria-label={`${label} score breakdown`} className="w-full min-w-[390px] text-left text-sm">
      <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th scope="col" className="px-3 py-2 font-semibold">Assessment</th><th scope="col" className="px-3 py-2 font-semibold">Score / Max</th><th scope="col" className="px-3 py-2 font-semibold">Percentage</th><th scope="col" className="px-3 py-2 font-semibold">Status</th></tr></thead>
      <tbody className="divide-y divide-slate-100">
        {records.map((record, index) => <tr key={index}><th scope="row" className="px-3 py-2 font-medium text-slate-700">{label} {index + 1}</th><td className="px-3 py-2 tabular-nums">{record.score === null ? `— / ${record.max}` : `${record.score} / ${record.max}`}</td><td className="px-3 py-2 tabular-nums">{record.score === null ? '—' : `${(100 * record.score / record.max).toFixed(1)}%`}</td><td className="px-3 py-2">{record.score === null ? <span className="font-semibold text-indigo-700">Missing</span> : <span className="text-emerald-700">Encoded</span>}</td></tr>)}
      </tbody>
      <tfoot className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-800"><tr><th scope="row" className="px-3 py-2">Recorded total</th><td className="px-3 py-2 tabular-nums">{summary.earned} / {summary.possible}</td><td className="px-3 py-2 tabular-nums">{summary.percent === null ? '—' : `${summary.percent.toFixed(1)}%`}</td><td className="px-3 py-2 text-xs">{summary.completed}/{summary.count} encoded</td></tr></tfoot>
    </table></div>
  </section>;
}
export default function StudentProfileModal({ student, termKey, termLabel, onClose }) {
  const closeButtonRef = useRef(null);
  useEffect(() => {
    if (!student) return undefined;
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    function keydown(event) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const focusables = [...document.querySelectorAll('[data-profile-modal] button:not([disabled])')];
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', keydown);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', keydown); document.body.style.overflow = oldOverflow; previousFocus?.focus?.(); };
  }, [student, onClose]);
  if (!student) return null;
  const calc = calculateTerm(student.terms[termKey]);
  const diagnostics = DIAGNOSTIC_BY_ID[student.id];
  const gaps = diagnostics ? individualRemediation(diagnostics) : null;
  const followup = !calc.complete ? 'Complete missing assessment records before assigning a final classification.'
    : calc.classification === 'Intervention Needed' ? 'Schedule individual support and check mastery after intervention.'
    : calc.classification === 'Monitor Closely' ? 'Monitor performance and use diagnostic evidence for short focused practice.'
    : 'Maintain current learning support and review specific diagnostic gaps.';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div data-profile-modal role="dialog" aria-modal="true" aria-labelledby="profile-heading" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Synthetic learner profile / {termLabel}</p><h2 id="profile-heading" className="mt-1 text-2xl font-extrabold">{student.name}</h2><p className="mt-1 text-sm text-slate-500">{student.id} · {student.section}</p></div><button ref={closeButtonRef} onClick={onClose} aria-label="Close learner profile" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"><X size={22} /></button></div>
      <div className="my-5"><StatusBadge status={calc.classification} /></div>
      <div className="space-y-5 rounded-2xl border border-slate-100 p-4 sm:p-5"><h3 className="font-bold">Grade Components</h3>
        {Object.entries(ASSESSMENT_CONFIG).map(([key, conf]) => <ProgressBar key={key} label={`${conf.label} · ${calc.groups[key].completed}/${conf.count} encoded`} value={calc.groups[key].percent ?? 0} color={style[key]} detail={calc.groups[key].percent === null ? 'Not encoded' : `${calc.groups[key].percent.toFixed(1)}%`} />)}
        <div className="space-y-3"><h4 className="text-sm font-bold text-slate-800">Individual Assessment Scores</h4>
          <p className="text-xs text-slate-500">Each score is shown against its own maximum. Missing scores are displayed as “—” and excluded from recorded totals; an encoded 0 remains a valid score.</p>
          {Object.keys(ASSESSMENT_CONFIG).map((key) => <AssessmentBreakdown key={key} type={key} records={student.terms[termKey][key]} summary={calc.groups[key]} />)}
        </div>
        <p className="text-xs text-slate-500">Component bars and totals use only recorded maximum points. Summative Tests and Term Exam combine into one 30% weighted grading component, rather than each receiving 30%.</p>
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5"><h3 className="font-bold">Grade Summary</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div><p className="text-xs text-slate-500">Recorded Standing</p><p className="mt-1 text-2xl font-extrabold text-blue-900">{calc.standing === null ? '—' : `${calc.standing.toFixed(2)}%`}</p></div>
          <div><p className="text-xs text-slate-500">Final Weighted Grade</p><p className="mt-1 text-2xl font-extrabold text-slate-800">{calc.finalWeightedGrade === null ? 'Pending' : `${calc.finalWeightedGrade.toFixed(2)}%`}</p></div>
          <div><p className="text-xs text-slate-500">Encoding Completion</p><p className="mt-1 text-2xl font-extrabold text-slate-800">{calc.completion.toFixed(1)}%</p></div>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-950"><Info size={18} className="mt-0.5 shrink-0" /><p><strong>Suggested Follow-up:</strong> {followup}</p></div>
      </div>
      <section className="mt-6"><h3 className="font-bold">Targeted Remediation</h3><p className="subtle mt-1">Diagnostic test learning gaps · Separate from term grade</p>
        {!gaps ? <p className="mt-3 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">No synthetic diagnostic response included for this demo learner.</p>
          : gaps.length === 0 ? <p className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">All 20 diagnostic questions answered correctly.</p>
          : <div className="mt-3 space-y-2">{gaps.map((gap) => <div key={gap.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-semibold">{gap.title}</p><p className="mt-1 text-xs text-slate-500">Missed item(s): {gap.missedItems.join(', ')}</p></div><span className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{gap.missed}/{gap.items.length} missed</span></div>)}</div>}
      </section>
      <div className="mt-6 flex justify-end"><button onClick={onClose} className="rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">Close Profile</button></div>
    </div>
  </div>;
}
