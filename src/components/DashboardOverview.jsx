import React from 'react';
import { UsersRound, ClipboardCheck, TrendingUp, Eye, HeartPulse } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import MetricCard from './MetricCard';
import ProgressBar from './ProgressBar';
import StudentListPanel from './StudentListPanel';

const STATUSES = [
  { name: 'On Track', color: '#10b981' },
  { name: 'Monitor Closely', color: '#f59e0b' },
  { name: 'Intervention Needed', color: '#f43f5e' },
  { name: 'Assessment Incomplete', color: '#6366f1' },
];
export default function DashboardOverview({ summary, termLabel, sectionLabel, onProfile, onClassificationClick }) {
  const { rows, counts } = summary;
  const flagged = rows.filter((r) => r.classification === 'Monitor Closely' || r.classification === 'Intervention Needed')
    .sort((a, b) => (a.standing ?? 101) - (b.standing ?? 101));
  const others = rows.filter((r) => r.classification === 'On Track' || r.classification === 'Assessment Incomplete')
    .sort((a, b) => a.classification.localeCompare(b.classification) || (b.standing ?? -1) - (a.standing ?? -1));
  const data = STATUSES.map((status) => ({ ...status, value: counts[status.name] }));
  const totalAtRisk = counts['Intervention Needed'] + counts['Monitor Closely'];
  const fullyEncoded = rows.filter((r) => r.complete).length;
  const display = (value) => value === null ? '—' : `${value.toFixed(1)}%`;
  return <div className="space-y-6">
    <div><p className="eyebrow">Academic performance / {termLabel}</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Dashboard Overview</h1><p className="subtle mt-1">{sectionLabel} · Synthetic learner analytics · Selected term only</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard title="Total Demo Learners" value={summary.total} description="Synthetic records" icon={UsersRound} onClick={() => onClassificationClick?.('All')} actionLabel="View all demo learners" />
      <MetricCard title="Encoding Completion" value={`${summary.completion.toFixed(1)}%`} description="All required assessment slots" icon={ClipboardCheck} onClick={() => onClassificationClick?.('Assessment Incomplete')} actionLabel="View learners with incomplete assessments" />
      <MetricCard title="Avg. Standing" value={display(summary.averageStanding)} description="Available-record weighted standing" icon={TrendingUp} onClick={() => onClassificationClick?.('All')} actionLabel="View learner standings" />
      <MetricCard title="Monitoring Count" value={counts['Monitor Closely']} description="75–79.99%, fully encoded" icon={Eye} color="text-amber-600" onClick={() => onClassificationClick?.('Monitor Closely')} actionLabel="View learners to monitor closely" />
      <MetricCard title="Intervention Count" value={counts['Intervention Needed']} description="Below 75%, fully encoded" icon={HeartPulse} color="text-rose-600" onClick={() => onClassificationClick?.('Intervention Needed')} actionLabel="View learners needing intervention" />
    </div>
    <div className="grid gap-4 xl:grid-cols-3">
      <section className="panel"><h2 className="panel-title">Assessment Encoding Completion</h2><p className="subtle mt-1">Encoded assessments / required slots</p>
        <div className="mt-7 space-y-6"><ProgressBar label="Written Works (5)" value={summary.encoding.ww} color="bg-blue-600" />
          <ProgressBar label="Performance Tasks (3)" value={summary.encoding.pt} color="bg-emerald-500" />
          <ProgressBar label="Summative Tests (2)" value={summary.encoding.st} color="bg-violet-500" />
          <ProgressBar label="Term Exam (1)" value={summary.encoding.te} color="bg-fuchsia-500" /></div>
      </section>
      <section className="panel"><h2 className="panel-title">Classification Distribution</h2><p className="subtle mt-1">Click a slice or category to view its learners for {termLabel}.</p>
        <div className="mt-3 h-[250px]" role="img" aria-label="Donut chart of learner classification distribution">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={57} outerRadius={85} paddingAngle={2} stroke="none" onClick={(entry) => { if (entry?.name && entry.value > 0) onClassificationClick?.(entry.name); }} className="cursor-pointer">
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Pie><Tooltip formatter={(v) => [`${v} learners (${summary.total ? (v / summary.total * 100).toFixed(1) : '0.0'}%)`, 'Count']} /></PieChart></ResponsiveContainer>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2" aria-label="Classification distribution categories">
          {data.map((item) => <button type="button" key={item.name} disabled={item.value === 0} onClick={() => onClassificationClick?.(item.name)} aria-label={`View ${item.name} learners (${item.value} learners, ${summary.total ? (item.value / summary.total * 100).toFixed(1) : '0.0'}%)`} className="rounded-lg border border-slate-100 p-2 text-left text-xs transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
            <span className="mt-1 block pl-4 text-slate-500">{summary.total ? (item.value / summary.total * 100).toFixed(1) : '0.0'}% · {item.value} learners</span>
          </button>)}
        </div>
      </section>
      <section className="panel"><h2 className="panel-title">Executive Summary</h2><p className="subtle mt-1">Rule-based, no generative AI or external calls</p>
        <div className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
          <p>Across <strong>{summary.total}</strong> demo learners in <strong>{sectionLabel}</strong>, the average available-record standing for <strong>{termLabel}</strong> is <strong>{display(summary.averageStanding)}</strong>.</p>
          <p><strong>{fullyEncoded}</strong> learner(s) have all 11 assessments encoded. Overall encoding completion is <strong>{summary.completion.toFixed(1)}%</strong>.</p>
          <p><strong className="text-rose-600">{counts['Intervention Needed']}</strong> require intervention and <strong className="text-amber-600">{counts['Monitor Closely']}</strong> require monitoring ({totalAtRisk} combined). <strong className="text-indigo-600">{counts['Assessment Incomplete']}</strong> have incomplete assessments and cannot yet be assigned a performance band.</p>
          <p className="rounded-xl bg-blue-50 p-3 text-blue-900">Priority: {counts['Assessment Incomplete'] > 0 ? 'complete missing assessment encoding before interpreting incomplete records.' : totalAtRisk > 0 ? 'review low-standing learners and plan targeted follow-up.' : 'maintain progress and review diagnostic learning gaps.'}</p>
        </div>
      </section>
    </div>
    <div className="grid gap-4 xl:grid-cols-2">
      <StudentListPanel title="Intervention & Monitoring" subtitle="Learners with complete records needing support" rows={flagged} onProfile={onProfile} emptyText="No learners currently classified for intervention or monitoring." />
      <StudentListPanel title="On Track & Incomplete" subtitle="Meeting benchmarks or awaiting assessment encoding" rows={others} onProfile={onProfile} emptyText="No learners in these categories." />
    </div>
  </div>;
}
