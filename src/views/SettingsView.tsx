import React, { useState } from 'react';
import {
  Settings,
  Save,
  AlertTriangle,
  RotateCcw,
  Trash2,
  CheckCircle2,
  School,
  Percent,
  Receipt,
  Boxes,
  Plus,
  X
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { BusinessSettings } from '../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetDatabase } = useDatabase();

  const [formSettings, setFormSettings] = useState<BusinessSettings>(settings);
  const [newCatInput, setNewCatInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Data Reset Modal states
  const [resetModalMode, setResetModalMode] = useState<'DEMO' | 'SALES' | 'INVENTORY' | 'FULL' | null>(null);
  const [confirmInput, setConfirmInput] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleAddCategory = () => {
    if (!newCatInput.trim()) return;
    if (!formSettings.categories.includes(newCatInput.trim())) {
      setFormSettings({
        ...formSettings,
        categories: [...formSettings.categories, newCatInput.trim()]
      });
      setNewCatInput('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setFormSettings({
      ...formSettings,
      categories: formSettings.categories.filter(c => c !== catToRemove)
    });
  };

  const handleExecuteReset = () => {
    if (!resetModalMode) return;
    if (confirmInput.trim().toUpperCase() !== 'RESET') {
      alert('You must type RESET exactly to confirm.');
      return;
    }

    resetDatabase(resetModalMode);
    setResetModalMode(null);
    setConfirmInput('');
    alert('Database operation completed successfully.');
  };

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
            Settings & Business Profile
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Thinkaroo brand configuration, commission rates, and safe data management
          </p>
        </div>

        {saveSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success)', fontWeight: 600, fontSize: '13px' }}>
            <CheckCircle2 size={16} />
            <span>Settings saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Brand Identity & Logo Preview */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Brand Identity & Palette</span>
              <span className="badge badge-own" style={{ fontSize: '11px' }}>Thinkaroo Official</span>
            </div>
            <div className="tk-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '16px',
                  background: '#FFF7ED',
                  border: '2px solid #FED7AA',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(255, 107, 0, 0.15)'
                }}>
                  <img src="/thinkaroo-logo.png" alt="Thinkaroo Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary-orange)', margin: 0 }}>
                    THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Caliph Life School Student Enterprise
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', background: '#FFF7ED', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FED7AA' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-orange)' }} />
                      <span>Primary Orange: #FF6B00</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', background: '#F0F9FF', padding: '3px 8px', borderRadius: '4px', border: '1px solid #BAE6FD' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary-blue)' }} />
                      <span>Primary Blue: #0284C7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business & School Profile */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>School & Enterprise Information</span>
            </div>
            <div className="tk-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Enterprise Name</label>
                  <input
                    type="text"
                    value={formSettings.businessName}
                    onChange={(e) => setFormSettings({ ...formSettings, businessName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">School Name</label>
                  <input
                    type="text"
                    value={formSettings.schoolName}
                    onChange={(e) => setFormSettings({ ...formSettings, schoolName: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="text"
                    value={formSettings.phone}
                    onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    value={formSettings.email}
                    onChange={(e) => setFormSettings({ ...formSettings, email: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Campus Location / Address</label>
                  <input
                    type="text"
                    value={formSettings.address}
                    onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Commission & Inventory Defaults */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Commission & Inventory Defaults</span>
            </div>
            <div className="tk-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Default Commission Rate (%)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formSettings.defaultCommissionRate}
                      onChange={(e) => setFormSettings({ ...formSettings, defaultCommissionRate: Number(e.target.value) })}
                      className="form-input"
                      style={{ fontWeight: 700 }}
                    />
                    <Percent size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Thinkaroo earns this percentage from the TOTAL sale value of commission goods.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Default Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    value={formSettings.lowStockThreshold}
                    onChange={(e) => setFormSettings({ ...formSettings, lowStockThreshold: Number(e.target.value) })}
                    className="form-input"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Items at or below this count trigger dashboard alerts.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Categories Manager */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Product Categories</span>
            </div>
            <div className="tk-card-body">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', maxWidth: '400px' }}>
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCatInput}
                  onChange={(e) => setNewCatInput(e.target.value)}
                  className="form-input"
                />
                <button type="button" onClick={handleAddCategory} className="btn-secondary" style={{ flexShrink: 0 }}>
                  <Plus size={15} />
                  <span>Add</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {formSettings.categories.map(cat => (
                  <div
                    key={cat}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '5px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12.5px'
                    }}
                  >
                    <span>{cat}</span>
                    {formSettings.categories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat)}
                        style={{ color: 'var(--text-light)', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Receipt / Invoice Settings */}
          <div className="tk-card">
            <div className="tk-card-header">
              <span style={{ fontSize: '14px', fontWeight: 700 }}>Bill & Receipt Customization</span>
            </div>
            <div className="tk-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Bill Number Prefix</label>
                  <input
                    type="text"
                    value={formSettings.billPrefix}
                    onChange={(e) => setFormSettings({ ...formSettings, billPrefix: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Footer Message</label>
                  <input
                    type="text"
                    value={formSettings.billFooterMessage}
                    onChange={(e) => setFormSettings({ ...formSettings, billFooterMessage: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              <Save size={16} />
              <span>Save Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Extreme Safety Data Management & Reset Section */}
      <div className="tk-card" style={{ marginTop: '30px', border: '1px solid #FECACA' }}>
        <div className="tk-card-header" style={{ background: '#FEF2F2' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--danger)" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--danger)' }}>
              Data Management & Reset Safety Guards
            </span>
          </div>
          <span className="badge badge-danger">Strict Protection</span>
        </div>
        <div className="tk-card-body">
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
            To prevent catastrophic data loss, operations below require explicit confirmation typing. Choose specific targeted resets or restore initial demo data:
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            {/* Reset Demo Data */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Reset Demo Data
              </strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Restores standard Caliph Life School stationery products, purchases, and approved interns.
              </p>
              <button
                type="button"
                onClick={() => { setResetModalMode('DEMO'); setConfirmInput(''); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                <RotateCcw size={13} />
                <span>Reset Demo Data</span>
              </button>
            </div>

            {/* Clear Sales History */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Clear Sales Data Only
              </strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Wipes all completed bills and customer history while preserving catalogue and inventory.
              </p>
              <button
                type="button"
                onClick={() => { setResetModalMode('SALES'); setConfirmInput(''); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', color: '#B45309' }}
              >
                <span>Clear Sales Register</span>
              </button>
            </div>

            {/* Clear Inventory */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                Clear Inventory Data
              </strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Zeros out all stock quantities, clears purchases, and logs movements.
              </p>
              <button
                type="button"
                onClick={() => { setResetModalMode('INVENTORY'); setConfirmInput(''); }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px', color: '#B45309' }}
              >
                <span>Zero Inventory</span>
              </button>
            </div>

            {/* Full Data Reset */}
            <div style={{ border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', padding: '14px', background: '#FFF5F5' }}>
              <strong style={{ fontSize: '13px', color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>
                Full Factory Reset
              </strong>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Irrevocably clears everything: products, stock, sales, expenses, and logs.
              </p>
              <button
                type="button"
                onClick={() => { setResetModalMode('FULL'); setConfirmInput(''); }}
                style={{
                  width: '100%',
                  background: 'var(--danger)',
                  color: '#FFFFFF',
                  padding: '7px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Trash2 size={13} />
                <span>Full Wipe</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {resetModalMode && (
        <div className="modal-overlay" onClick={() => setResetModalMode(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header" style={{ background: '#FEF2F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--danger)" />
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger)' }}>
                  Confirm Data Action: {resetModalMode}
                </h3>
              </div>
              <button onClick={() => setResetModalMode(null)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                This is a permanent operation. To proceed, please type <strong>RESET</strong> in the box below:
              </p>

              <input
                type="text"
                placeholder='Type "RESET"'
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="form-input"
                style={{ textAlign: 'center', fontWeight: 700, letterSpacing: '0.1em' }}
              />
            </div>

            <div className="modal-footer">
              <button onClick={() => setResetModalMode(null)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleExecuteReset}
                disabled={confirmInput.trim().toUpperCase() !== 'RESET'}
                style={{
                  background: confirmInput.trim().toUpperCase() === 'RESET' ? 'var(--danger)' : '#CBD5E1',
                  color: '#FFFFFF',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: confirmInput.trim().toUpperCase() === 'RESET' ? 'pointer' : 'not-allowed'
                }}
              >
                Permanently Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
