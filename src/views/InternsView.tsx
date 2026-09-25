import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Trash2,
  Activity,
  Mail,
  User,
  X,
  Lock
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { formatDate, formatDateTime } from '../utils/formatters';

export const InternsView: React.FC = () => {
  const {
    interns,
    addIntern,
    toggleInternStatus,
    deleteIntern,
    activityLogs,
    currentIntern
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'interns' | 'activity'>('interns');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [gmailInput, setGmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [roleInput, setRoleInput] = useState<'INTERN' | 'COORDINATOR' | 'ADMIN'>('INTERN');
  const [formError, setFormError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddIntern = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const res = addIntern(gmailInput, nameInput, roleInput);
    if (!res.success) {
      setFormError(res.message);
      return;
    }

    setIsModalOpen(false);
    setGmailInput('');
    setNameInput('');
  };

  const filteredInterns = interns.filter(i => {
    return i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           i.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredLogs = activityLogs.filter(l => {
    return l.internName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
           l.action.toLowerCase().includes(searchQuery.toLowerCase());
  });

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
            Intern Access & Activity History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Approved Gmail accounts for Caliph Life School student interns
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

          <button onClick={() => { setIsModalOpen(true); setFormError(''); }} className="btn-primary">
            <Plus size={16} strokeWidth={2.5} />
            <span>Approve Intern</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <div style={{ position: 'relative', width: '260px' }}>
          <input
            type="text"
            placeholder={activeTab === 'interns' ? "Search intern or email..." : "Search action or keyword..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', fontSize: '13px' }}
          />
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
        </div>
      </div>

      {activeTab === 'interns' ? (
        /* Approved Interns Whitelist Table */
        <div className="tk-table-container">
          <table className="tk-table">
            <thead>
              <tr>
                <th>Intern Name</th>
                <th>Approved Gmail</th>
                <th>Role</th>
                <th>Access Status</th>
                <th>Added Date</th>
                <th>Last Login</th>
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
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {intern.email}
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '10.5px' }}>
                        {intern.role}
                      </span>
                    </td>
                    <td>
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
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatDate(intern.addedDate)}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {intern.lastLogin ? formatDateTime(intern.lastLogin) : 'Never'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
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
                      <div style={{ fontSize: '10.5px', color: 'var(--text-light)' }}>{log.internEmail}</div>
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
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Approve Intern Account</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Whitelist a student's Gmail address to grant application access
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
                  <label className="form-label">Gmail Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="student.name@caliphschool.com or @gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="form-input"
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
                    Only whitelisted Gmail addresses can sign in.
                  </span>
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
    </div>
  );
};
