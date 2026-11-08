import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';
// Recharts ResponsiveContainer needs actual geometry; isolate chart layout for component behavior tests.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>, PieChart: ({ children }) => <div>{children}</div>,
  Pie: ({ children }) => <div>{children}</div>, Cell: () => null, Tooltip: () => null, Legend: () => null,
  BarChart: ({ children }) => <div>{children}</div>, Bar: () => null, CartesianGrid: () => null,
  XAxis: () => null, YAxis: () => null, ReferenceLine: () => null,
}));
describe('dashboard UI', () => {
  it('shows a permanent privacy notice and allows global term changes', () => {
    render(<App />);
    expect(screen.getByText(/Privacy Safe\. Synthetic data only\. No records sent externally\./)).toBeInTheDocument();
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Global term selector'), { target: { value: 'term3' } });
    expect(screen.getByText(/Academic performance \/ Term 3/)).toBeInTheDocument();
  });
  it('opens a demo learner profile and displays remediation', () => {
    render(<App />);
    fireEvent.click(screen.getAllByText('Profile')[0]);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Targeted Remediation')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /Written Work score breakdown/i })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Written Work 1' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Performance Task 3' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Summative Test 2' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Term Exam 1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close learner profile' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
  it('opens a classification-filtered learner directory from the distribution', () => {
    render(<App />);
    const categoryButton = screen.getAllByRole('button', { name: /View .* learners \(\d+ learners, / }).find((button) => !button.disabled);
    expect(categoryButton).toBeDefined();
    const classification = categoryButton.textContent.match(/^(On Track|Monitor Closely|Intervention Needed|Assessment Incomplete)/)[0];
    fireEvent.click(categoryButton);
    expect(screen.getByRole('heading', { name: 'All Learners' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(`Showing learners classified as ${classification}`);
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue(classification);
    fireEvent.click(screen.getByRole('button', { name: 'Clear filter' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('All');
  });
  it('filters learners using clickable metric cards and can clear the filter', () => {
    render(<App />);
    expect(screen.getAllByRole('button', { name: 'View learners needing intervention' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'View learners needing intervention' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('Intervention Needed');
    expect(screen.getByRole('status')).toHaveTextContent('Intervention Needed');
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'View learners to monitor closely' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('Monitor Closely');
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'View learners with incomplete assessments' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('Assessment Incomplete');
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'View learner standings' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('All');
    fireEvent.click(screen.getByRole('button', { name: 'Dashboard' }));
    fireEvent.click(screen.getByRole('button', { name: 'View all demo learners' }));
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('All');
  });
  it('preserves selected term and section when clicking a metric', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Global term selector'), { target: { value: 'term2' } });
    fireEvent.change(screen.getByLabelText('Section'), { target: { value: 'Honesty' } });
    expect(screen.getAllByRole('button', { name: 'View learners needing intervention' })).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'View learners needing intervention' }));
    expect(screen.getByLabelText('Global term selector')).toHaveValue('term2');
    expect(screen.getByLabelText('Section')).toHaveValue('Honesty');
    expect(screen.getByRole('combobox', { name: 'Filter by classification' })).toHaveValue('Intervention Needed');
  });
  it('shows the scores and maximum points for the selected term and preserves missing scores', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Global term selector'), { target: { value: 'term2' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Profile' })[0]);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('Individual Assessment Scores');
    expect(screen.getByRole('rowheader', { name: 'Written Work 5' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Performance Task 3' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Term Exam 1' })).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Recorded total');
  });
  it('navigates to item analysis and validates bundled synthetic CSV', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Item Analysis' }));
    expect(screen.getByText('Item-Level Details')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Validate Bundled CSV/ }));
    expect(screen.getByRole('status')).toHaveTextContent(/passed schema/);
  });
});
