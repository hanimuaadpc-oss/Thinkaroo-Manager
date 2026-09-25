import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Calendar,
  X,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const CATEGORIES: ExpenseCategory[] = [
  'Packaging',
  'Printing',
  'Delivery',
  'Transport',
  'Supplies',
  'Marketing',
  'Maintenance',
  'Other'
];

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, currentIntern } = useDatabase();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Packaging');
  const [amount, setAmount] = useState<number>(100);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    addExpense({
      category,
      amount: Number(amount),
      date,
      note: note.trim() || 'General expense'
    });

    setIsModalOpen(false);
    setAmount(100);
    setNote('');
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter(e => {
    return e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
           e.note.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)' }}>
            Business Expenses
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Operational costs for packaging, transport, and supplies
          </p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '20px'
      }}>
        <div className="tk-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Total Expenses</span>
            <TrendingDown size={16} color="var(--danger)" />
          </div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--danger)' }}>
            {formatCurrency(totalExpenseAmount)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
            {expenses.length} expense entries recorded
          </div>
        </div>

        <div className="tk-card" style={{ padding: '16px', gridColumn: 'span 2' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
            Expense Breakdown by Category
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => {
              const catTotal = expenses
                .filter(e => e.category === cat)
                .reduce((s, e) => s + e.amount, 0);
              if (catTotal === 0) return null;

              return (
                <div
                  key={cat}
                  style={{
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    padding: '6px 10px',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>{cat}:</span>
                  <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(catTotal)}</strong>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <div style={{ position: 'relative', width: '240px' }}>
          <input
            type="text"
            placeholder="Search note or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="tk-table-container">
        <table className="tk-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Description / Note</th>
              <th>Recorded By</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                  No expense records found
                </td>
              </tr>
            ) : (
              filteredExpenses.map(exp => (
                <tr key={exp.id}>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {formatDate(exp.date)}
                  </td>
                  <td>
                    <span className="badge badge-neutral" style={{ fontSize: '11px' }}>
                      {exp.category}
                    </span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '13.5px', color: 'var(--danger)' }}>
                      {formatCurrency(exp.amount)}
                    </strong>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>
                    {exp.note}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {exp.recordedByIntern}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete expense "${exp.note}" (₹${exp.amount})?`)) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="btn-ghost"
                      style={{ color: 'var(--danger)', padding: '4px 8px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Record Business Expense</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleAddExpense}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="form-select"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Note / Purpose *</label>
                  <input
                    type="text"
                    required
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 50 paper carry bags for packaging"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
