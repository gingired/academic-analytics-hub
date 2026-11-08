import React, { useCallback, useMemo, useState } from 'react';
import { Activity, BookOpenCheck, ChartNoAxesCombined, LayoutDashboard, Menu, RefreshCw, ShieldCheck, Users, X } from 'lucide-react';
import { calculateSection, TERM_KEYS } from './utils/gradeCalculations';
import { SECTIONS, STUDENTS } from './data/mockData';
import DashboardOverview from './components/DashboardOverview';
import AllLearners from './components/AllLearners';
import ItemAnalysisView from './components/ItemAnalysisView';
import StudentProfileModal from './components/StudentProfileModal';
const PAGES = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'learners', label: 'All Learners', icon: Users },
  { key: 'items', label: 'Item Analysis', icon: ChartNoAxesCombined },
];
const TERMS = { term1: 'Term 1', term2: 'Term 2', term3: 'Term 3' };
export default function App() {
  const [term, setTerm] = useState('term1');
  const [section, setSection] = useState('All Sections');
  const [page, setPage] = useState('dashboard');
  const [activeStudent, setActiveStudent] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [learnerFilter, setLearnerFilter] = useState('All');
  const selectedStudents = useMemo(() => STUDENTS.filter((s) => section === 'All Sections' || s.section === section), [section]);
  const summary = useMemo(() => calculateSection(selectedStudents, term), [selectedStudents, term]);
  const closeProfile = useCallback(() => setActiveStudent(null), []);
  function reset() { setTerm('term1'); setSection('All Sections'); setPage('dashboard'); setLearnerFilter('All'); setActiveStudent(null); setMobileMenu(false); }
  function viewClassification(classification) { setLearnerFilter(classification); setPage('learners'); setMobileMenu(false); }
  return <div className="min-h-screen bg-gray-50">
    <header className="sticky top-0 z-30 border-b border-blue-800 bg-blue-900 text-white shadow-sm"><div className="mx-auto flex min-h-[80px] max-w-[1800px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="flex min-w-0 items-center gap-3"><button onClick={() => setMobileMenu((v) => !v)} aria-label="Toggle navigation" className="rounded-lg p-2 hover:bg-blue-800 lg:hidden">{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button><span className="hidden rounded-xl bg-white/10 p-2 sm:block"><Activity size={24} /></span><div><p className="text-base font-extrabold tracking-tight sm:text-lg">DepEd SHS — Academic Analytics Hub</p><p className="text-xs text-blue-200">Three-term grading · Diagnostic insights · Targeted remediation</p></div></div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3"><label className="sr-only" htmlFor="term-selector">Global term selector</label><select id="term-selector" className="max-w-[100px] rounded-lg border border-blue-600 bg-blue-800 px-2 py-2 text-sm font-semibold text-white sm:max-w-none sm:px-3" value={term} onChange={(e) => setTerm(e.target.value)}>{TERM_KEYS.map((value) => <option value={value} key={value}>{TERMS[value]}</option>)}</select>
        <span className="hidden rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-100 ring-1 ring-inset ring-emerald-300/30 sm:inline-flex">Synthetic Demo Data</span>
        <button title="Reset synthetic demo filters" aria-label="Refresh demo to defaults" onClick={reset} className="rounded-lg border border-blue-700 p-2 hover:bg-blue-800"><RefreshCw size={19} /></button></div>
    </div></header>
    <div className="mx-auto flex max-w-[1800px]"><aside className={`${mobileMenu ? 'block' : 'hidden'} fixed inset-x-0 top-[80px] z-20 border-b border-slate-200 bg-white p-4 shadow-lg lg:sticky lg:top-[80px] lg:block lg:h-[calc(100vh-80px)] lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:p-5 lg:shadow-none`}>
      <p className="eyebrow mb-3">Navigation</p><nav aria-label="Main navigation" className="space-y-1">{PAGES.map(({ key, label, icon: Icon }) => <button key={key} aria-current={page === key ? 'page' : undefined} onClick={() => { setPage(key); if (key === 'learners') setLearnerFilter('All'); setMobileMenu(false); }} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold ${page === key ? 'bg-blue-50 text-blue-800' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={19} />{label}</button>)}</nav>
      <div className="mt-7"><label htmlFor="section-filter" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Section</label><select id="section-filter" value={section} onChange={(e) => { setSection(e.target.value); setMobileMenu(false); }} className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm"><option>All Sections</option>{SECTIONS.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div className="mt-8 rounded-xl bg-gray-100 p-4 lg:absolute lg:bottom-6 lg:left-5 lg:right-5"><div className="flex items-center gap-2 font-bold text-slate-800"><ShieldCheck size={19} className="text-emerald-600" /><span className="text-sm">Privacy Safe</span></div><p className="mt-2 text-xs leading-5 text-slate-600">Synthetic data only. No records sent externally.</p></div>
    </aside>
    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-800"><ShieldCheck size={16} /><span>Privacy Safe. Synthetic data only. No records sent externally.</span><span className="ml-auto inline-flex items-center gap-1 text-emerald-700"><BookOpenCheck size={14} /> Portfolio demo</span></div>
      {page === 'dashboard' && <DashboardOverview summary={summary} termLabel={TERMS[term]} sectionLabel={section} onProfile={setActiveStudent} onClassificationClick={viewClassification} />}
      {page === 'learners' && <AllLearners summary={summary} termLabel={TERMS[term]} onProfile={setActiveStudent} initialFilter={learnerFilter} onFilterChange={setLearnerFilter} />}
      {page === 'items' && <ItemAnalysisView />}
      <footer className="mt-8 border-t border-slate-200 pt-4 text-xs text-slate-400">Portfolio prototype · Synthetic data · Raw weighted percentages are not official transmuted DepEd report-card grades.</footer>
    </main></div>
    {activeStudent && <StudentProfileModal student={activeStudent} termKey={term} termLabel={TERMS[term]} onClose={closeProfile} />}
  </div>;
}
