import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Activity,
  X,
  Coins,
  Key,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Intern } from '../types';
import { formatDate, formatDateTime } from '../utils/formatters';

export const InternsView: React.FC = () => {
  const {
    interns,
    addIntern,
    updateInternPassword,
    toggleInternStatus,
    deleteIntern,
    activityLogs,
    currentIntern
  } = useDatabase();

  const isAdmin = currentIntern?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<'interns' | 'activity'>('interns');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('Caliph@2026');
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [roleInput, setRoleInput] = useState<'INTERN' | 'COORDINATOR' | 'ADMIN'>('INTERN');
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Individual Password Reset modal states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedInternForPassword, setSelectedInternForPassword] = useState<Intern | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleAddIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = await addIntern(emailInput, nameInput, roleInput, passwordInput);
    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsModalOpen(false);
    setEmailInput('');
    setNameInput('');
    setPasswordInput('Caliph@2026');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternForPassword) return;
    setResetError('');
    setResetSuccess('');
    setResetLoading(true);

    try {
      const res = await updateInternPassword(selectedInternForPassword.id, resetPasswordInput);
      if (res.success) {
        setResetSuccess(res.message);
        setTimeout(() => {
          setIsResetModalOpen(false);
          setSelectedInternForPassword(null);
          setResetPasswordInput('');
          setResetSuccess('');
        }, 1500);
      } else {
        setResetError(res.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const filteredInterns = interns.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLogs = activityLogs.filter(l =>
    l.internName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            Intern Access &amp; Activity History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            View approved intern accounts for Caliph Life School student interns
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sub-view toggle */}
          <div style={{
            display: 'flex',
            background: '#FFFFFF',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px'
          }}>
            <button
              onClick={() => setActiveTab('interns')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: activeTab === 'interns' ? 600 : 500,
                background: activeTab === 'interns' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'interns' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Approved Interns ({interns.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: activeTab === 'activity' ? 600 : 500,
                background: activeTab === 'activity' ? 'var(--primary-blue)' : 'transparent',
                color: activeTab === 'activity' ? '#FFFFFF' : 'var(--text-secondary)'
              }}
            >
              Activity Audit Log ({activityLogs.length})
            </button>
          </div>

          {isAdmin && (
            <button onClick={() => { setIsModalOpen(true); setFormError(''); }} className="btn-primary">
              <Plus size={16} strokeWidth={2.5} />
              <span>Approve Intern</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder={activeTab === 'interns' ? 'Search by name or role…' : 'Search action or keyword…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {activeTab === 'interns' ? (
        /* Approved Interns Table — no email column shown */
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Intern Name</th>
                <th>Role</th>
                <th>Access Status</th>
                <th>Commission Balance</th>
                <th>Added Date</th>
                <th>Last Activity</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                    No intern accounts found
                  </td>
                </tr>
              ) : (
                filteredInterns.map(intern => (
                  <tr key={intern.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: intern.role === 'ADMIN' ? 'var(--primary-orange-light)' : 'var(--primary-blue-light)',
                          color: intern.role === 'ADMIN' ? 'var(--primary-orange)' : 'var(--primary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}>
                          {intern.name.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{intern.name}</strong>
                          {currentIntern?.id === intern.id && (
                            <span className="badge badge-own" style={{ marginLeft: '6px', fontSize: '9px' }}>Current</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                        {intern.role}
                      </span>
                    </td>
                    <td>
                      {isAdmin ? (
                        <button
                          onClick={() => toggleInternStatus(intern.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: intern.status === 'ENABLED' ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
                            background: intern.status === 'ENABLED' ? 'var(--success-light)' : 'var(--danger-light)',
                            color: intern.status === 'ENABLED' ? 'var(--success)' : 'var(--danger)',
                            cursor: 'pointer'
                          }}
                        >
                          {intern.status === 'ENABLED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>{intern.status}</span>
                        </button>
                      ) : (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 600,
                            border: intern.status === 'ENABLED' ? '1px solid var(--success-border)' : '1px solid var(--danger-border)',
                            background: intern.status === 'ENABLED' ? 'var(--success-light)' : 'var(--danger-light)',
                            color: intern.status === 'ENABLED' ? 'var(--success)' : 'var(--danger)',
                          }}
                        >
                          {intern.status === 'ENABLED' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                          <span>{intern.status}</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Coins size={13} style={{ color: 'var(--primary-orange)', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: (intern.commissionBalance ?? 0) > 0 ? 'var(--success)' : 'var(--text-muted)'
                        }}>
                          ₹{(intern.commissionBalance ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(intern.addedDate)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {intern.lastLogin ? formatDateTime(intern.lastLogin) : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isAdmin ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => {
                              setSelectedInternForPassword(intern);
                              setResetPasswordInput('');
                              setResetError('');
                              setResetSuccess('');
                              setIsResetModalOpen(true);
                            }}
                            className="btn-ghost"
                            style={{ color: 'var(--primary-blue)', padding: '4px 8px' }}
                            title={`Reset password for ${intern.name}`}
                          >
                            <Key size={14} />
                          </button>
                          {intern.role !== 'ADMIN' && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Revoke access for intern "${intern.name}"?`)) {
                                  deleteIntern(intern.id);
                                }
                              }}
                              className="btn-ghost"
                              style={{ color: 'var(--danger)', padding: '4px 8px' }}
                              title="Revoke access"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Activity History Table */
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Intern</th>
                <th>Action</th>
                <th>Category</th>
                <th>Activity Description</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-light)' }}>
                    No activity logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td>
                      <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>{log.internName}</strong>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-own" style={{ fontSize: '10.5px' }}>
                        {log.entityType}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Approve Intern Modal */}
      {isAdmin && isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Approve Intern Account</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Add an approved Caliph account to grant application access
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleAddIntern}>
              <div className="modal-body">
                {formError && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: 'var(--danger)',
                    fontSize: '12px',
                    marginBottom: '12px'
                  }}>
                    {formError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Caliph Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@caliphschool.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student / Intern Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sara Ali (Grade 10)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="INTERN">Student Intern</option>
                    <option value="COORDINATOR">Student Lead / Coordinator</option>
                    <option value="ADMIN">Faculty Mentor / Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Initial Account Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      placeholder="e.g. Caliph@2026"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="form-input"
                      style={{ paddingRight: '36px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={showAddPassword ? 'Hide password' : 'Show password'}
                    >
                      {showAddPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    This user will sign in with this password. They can change it anytime in Settings.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Approve Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Intern Password Reset Modal */}
      {isAdmin && isResetModalOpen && selectedInternForPassword && (
        <div className="modal-overlay" onClick={() => { if (!resetLoading) setIsResetModalOpen(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'var(--primary-blue-light)',
                  color: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Key size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Reset User Password</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Set a new individual password for <strong>{selectedInternForPassword.name}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => { if (!resetLoading) setIsResetModalOpen(false); }}>
                <X size={18} color="var(--text-light)" />
              </button>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="modal-body">
                {resetError && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: 'var(--danger)',
                    fontSize: '12px',
                    marginBottom: '12px'
                  }}>
                    {resetError}
                  </div>
                )}

                {resetSuccess && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: 'var(--success)',
                    fontSize: '12px',
                    marginBottom: '12px',
                    fontWeight: 600
                  }}>
                    {resetSuccess}
                  </div>
                )}

                <div style={{
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '14px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  Account: <strong>{selectedInternForPassword.email}</strong> ({selectedInternForPassword.role})
                </div>

                <div className="form-group">
                  <label className="form-label">New Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      required
                      minLength={4}
                      autoFocus
                      placeholder="Enter new password (min. 4 characters)"
                      value={resetPasswordInput}
                      onChange={(e) => setResetPasswordInput(e.target.value)}
                      className="form-input"
                      style={{ paddingRight: '36px' }}
                      disabled={resetLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title={showResetPassword ? 'Hide password' : 'Show password'}
                    >
                      {showResetPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Only this intern will be able to log in with this password.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="btn-secondary"
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={resetLoading || !resetPasswordInput.trim()}
                >
                  {resetLoading ? 'Updating…' : 'Save New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
