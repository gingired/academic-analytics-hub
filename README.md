# DepEd SHS — Academic Analytics Hub

A portfolio-ready **offline, frontend-only demonstration** of a three-term Senior High School grading and diagnostic analytics interface. Built with React, Vite, Tailwind CSS, Recharts, Papa Parse and Vitest.

> **PRIVACY SAFE — SYNTHETIC DATA ONLY. NO RECORDS SENT EXTERNALLY.**
>
> This is a demo, **not** an official DepEd information system, SIS, grading certification, or production deployment for actual learners.

## Quick start

Requirements: Node.js **18+** and npm.

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. Build a distributable with `npm run build`, run automated tests with `npm test`, or preview a build with `npm run preview`.

The design uses Tailwind CSS **v3** and Vite **v5**; no runtime CDN, backend, analytics SDK, storage, or external API calls. `npm install` downloads development dependencies through the package manager; the running application does not transmit student records.

## Architecture

```text
src/
  App.jsx                          Global term/section selectors and navigation
  main.jsx, index.css              App entry and styling
  components/
    DashboardOverview.jsx          Cards, completion, donut, executive summary, lists
    MetricCard.jsx                 KPI tile
    ProgressBar.jsx                Accessible progress
    StudentListPanel.jsx           Learner status groups
    StudentProfileModal.jsx        Grade details, suggestions, competencies
    StatusBadge.jsx                Classification styling
    AllLearners.jsx                Searchable, filterable synthetic directory
    ItemAnalysisView.jsx           Diagnostic charts, table, reteaching targets
  data/mockData.js                 60 synthetic learners, 50×20 synthetic OMR CSV
  utils/
    gradeCalculations.js           Term scoring, categories, aggregation
    itemAnalysis.js                Difficulty/discrimination & 27% partition
    remediationEngine.js           Competency mapping, individual/class flags
  tests/                            Unit and interface tests
```

## Three-term grading model

The **global Term Selector** controls only grades and dashboards. The Section selector narrows all learner views to 12 learners per section, or 60 total. Diagnostic Item Analysis is explicitly a separate 50-learner synthetic cohort, so changing terms/sections does not silently alter the diagnostic sample.

Every term has **5 Written Works (WW), 3 Performance Tasks (PT), 2 Summative Tests (ST), and 1 Term Exam (TE)** — 11 assessment records. Weight distribution:

| Component | Weight | Computation |
|---|---:|---|
| Written Works | 20% | recorded WW points / recorded WW max |
| Performance Tasks | 50% | recorded PT points / recorded PT max |
| ST + TE together | 30% | (recorded ST and TE points) / (recorded ST and TE maximums) |

A score of **`null`** is unencoded and excluded from the recorded maximum. A score of **`0`** is a real, fully encoded zero. Invalid scores and invalid assessment arrays are rejected.

**Recorded Standing** is the weighted average of *available assessment components*, with missing components' weights renormalized. If only WW is available, standing equals the recorded WW percentage; if no component has encoded scores, standing is null. A *partially recorded* component is based only on that component's encoded assessments. This standing is **provisional**, not a report-card grade. **Final Weighted Grade** is available only when all 11 assessments have been encoded. It is a raw weighted percentage, **not DepEd grade transmutation**.

Classification precedence is deliberately **Incomplete first** to avoid inferring pass/fail from partial grades:

1. Missing any required assessment → **Assessment Incomplete** (indigo)
2. Complete and grade < 75 → **Intervention Needed** (rose)
3. Complete and grade ≥ 75 and < 80 → **Monitor Closely** (amber)
4. Complete and grade ≥ 80 → **On Track** (emerald)

Dashboards show provisional standing averages across all learners with at least one score, and always distinguish incomplete cases. Scores can be considered indicative only; they do not automatically determine a formal intervention plan.

## Diagnostic item analysis

The 20 binary-scored items are analyzed for a fixed set of **50 synthetic learners**. Total scores rank the cohort descending. Ties are broken deterministically by synthetic ID ascending. The top and bottom **27%** each use `Math.round(0.27 × N)` learners (clamped to avoid overlap). For N=50: **14 upper, 22 middle, 14 lower**.

- **Difficulty p** = correct responses to item / total number of learners.
- p ∈ [0, .20] Very Difficult; (.20, .40] Difficult; (.40, .60] Moderate; (.60, .80] Easy; (.80, 1] Very Easy.
- **Discrimination D** = (upper correct − lower correct) / upper group size.
- D < .20 Poor (Drop); [.20, .30) Marginal (Revise); [.30, .40) Good; ≥ .40 Excellent (Keep).

Computations compare unrounded fractions; display rounds to two decimals. The generated 50×20 cohort intentionally contains very easy and very difficult items, plus negative discrimination for item review. The labels “Drop” and “Keep” are **heuristic flags**, never automatic validity judgments: educators should review item content, key correctness, curriculum alignment, and sample size.

## Targeted remediation

| Items | Competency |
|---|---|
| 1–4 | Calculate wages and incomes |
| 5–7 | Percentage increase and decrease |
| 8–10 | Identify rules of patterns |
| 11–13 | Arithmetic and geometric sequences |
| 14–16 | Measurement conversions |
| 17–20 | Classify and sketch functions |

Learner profiles list the missed diagnostic items, grouped by competency. Class-wide reteaching targets list competencies containing at least one low-p item **p ≤ .40**. The engine produces **recommendations for educator review**, not authoritative judgments about learners. The last ten demo learners do not have diagnostic responses; their profiles explicitly show “not available.”

## Privacy boundaries

- Exactly **60** generated `Demo Learner ##` labels across five fictitious sections (12 each).
- Synthetic ID form: `DEMO-HON-001`, etc. Never use or import actual records.
- Built-in, deterministic synthetic generation with no Faker APIs, local storage, cookies, network calls, or browser data persistence.
- CSV download exports only the 50 bundled synthetic OMR responses. **No file-upload field** exists.
- The “Validate Bundled CSV” button uses Papa Parse on a built-in CSV only. The parser checks it matches the bundled demo records exactly and rejects altered/real identifiers and scores.
- Persistent green global warning and a secondary sidebar privacy card.

**Important:** Frontend demo-mode guards are *not* an access-control or security boundary. Any future deployment with actual education records needs a separate privacy impact assessment, lawful basis, consent/notice as applicable, access controls, encryption, retention and deletion policies, audit trails, and review against Philippine Data Privacy Act and applicable DepEd policies. Do **not** replace demo data with learner records in this prototype.

## Testing

`npm test` executes Vitest and React Testing Library tests covering null vs zero, 20/50/30 weights, incomplete precedence, term isolation, boundary classifications, malformed scores, 27% partitioning, negative discrimination, threshold labels, strict CSV validation, competency mapping, and main UI flows.

## Design notes and limitations

- Layout: dark navy fixed header, light-gray workspace, white sidebar, white cards, blue/green/violet/fuchsia progress bars, emerald/amber/rose/indigo status pills.
- Accessible text labels, keyboard focus styling, modal Escape/Tab behavior, and tabular data for chart interpretation. Responsive grids are mobile-friendly.
- The app avoids any official Department of Education logos or claims of institutional endorsement.
- No student login, school identity integration, actual report-card transmutation, or backend. This is **deliberate** given the strict demo-only policy.
- Grade computation uses **stipulated portfolio-project weights**, which may not correspond to a specific official DepEd policy. Validate against applicable subject/course grading guidance before designing any non-demo product.
- The academic-year three-term structure is a **project-specific model** and should not be presented as the universal DepEd grading calendar.

## Suggested portfolio showcase

Record a short walkthrough showing the term selector changing dashboard statistics, opening an incomplete learner profile, navigating to Item Analysis and discussing a negative-discrimination flag. Include a test run and explain why privacy-safe demo mode is a default engineering choice.

### Drill down from Classification Distribution

Select any non-empty donut slice or its labeled percentage/category button on the Dashboard. The app opens **All Learners**, prefiltered to that classification, preserving the global term and section. The destination shows the active category, matching learners, and a **Clear filter** action. Empty categories are disabled. Category buttons provide an accessible alternative to clicking chart slices.

### Click-through dashboard navigation

All five dashboard metric cards are interactive and keyboard-accessible:
- **Total Demo Learners**: open the complete learner directory.
- **Encoding Completion**: open learners classified as **Assessment Incomplete**, to review missing records.
- **Avg. Standing**: open all learner standings.
- **Monitoring Count**: open the **Monitor Closely** learner list.
- **Intervention Count**: open the **Intervention Needed** learner list.

The **Classification Distribution** donut segments and classification category labels also open the corresponding filtered list. Term and section selections carry through, and the learner directory offers **Clear filter**. The encoding percentage is a percentage of assessment slots, not the percentage of incomplete learners.

### Detailed assessment scores in learner profiles

Open any learner's **Profile** to see the individual Written Work 1–5, Performance Task 1–3, Summative Test 1–2, and Term Exam 1 records for the **currently selected term**. Each table includes score/maximum, the percent for that individual assessment, encoding status, and recorded-point totals. Missing values are visibly marked and excluded from totals; earned zero is kept as a completed 0. The existing 20% / 50% / combined 30% weighting is unchanged.

### Test isolation fix

`src/tests/setup.js` now explicitly calls React Testing Library's `cleanup()` after each Vitest test, preventing prior `App` renders from leaving duplicate identically labeled dashboard buttons in the DOM when Vitest globals are disabled. The UI test also asserts a unique intervention button and checks the assessment breakdown.
