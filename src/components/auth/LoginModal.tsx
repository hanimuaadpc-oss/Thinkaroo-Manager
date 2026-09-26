import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, Lock, KeyRound, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const LoginModal: React.FC = () => {
  const { loginWithGmail, settings } = useDatabase();
  const [emailInput, setEmailInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your permitted Gmail address');
      return;
    }

    // Security PIN check: default 2026 or 1234
    if (pinInput.trim() && pinInput.trim() !== '2026' && pinInput.trim() !== '1234') {
      setErrorMessage('Invalid Access PIN code. Please verify with your system administrator.');
      return;
    }

    const result = loginWithGmail(cleanEmail);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '420px',
        width: '100%',
        padding: '36px 28px',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)',
        textAlign: 'center',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Lock Security Badge */}
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '16px',
          background: '#FFF7ED',
          border: '2px solid #FED7AA',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)'
        }}>
          <img 
            src="/thinkaroo-logo.png" 
            alt="Thinkaroo" 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        <h2 style={{
          fontSize: '22px',
          fontWeight: 800,
          color: 'var(--primary-orange)',
          letterSpacing: '-0.02em',
          marginBottom: '2px'
        }}>
          THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
        </h2>
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--primary-blue)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '16px'
        }}>
          {settings.schoolName || 'Caliph Life School'} • Enterprise ERP
        </div>

        {/* Protection Banner */}
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#991B1B',
          lineHeight: 1.4,
          marginBottom: '20px',
          textAlign: 'left',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <Lock size={18} color="#DC2626" style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '12px', color: '#7F1D1D' }}>RESTRICTED ACCESS SYSTEM</strong>
            <span>Only whitelisted & permitted accounts are allowed. Unauthorized entry is blocked.</span>
          </div>
        </div>

        <form onSubmit={handleLogin}>
          {errorMessage && (
            <div style={{
              background: 'var(--danger-light)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '12.5px',
              fontWeight: 600,
              marginBottom: '14px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldAlert size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ textAlign: 'left', marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Permitted Gmail Address *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="e.g. hiba@caliphschool.com"
                value={emailInput}
                onChange={(e) => {
                  setEmailInput(e.target.value);
                  setErrorMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px'
                }}
              />
              <Mail 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
              />
            </div>
          </div>

          <div style={{ textAlign: 'left', marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Security Access PIN (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                maxLength={6}
                placeholder="Enter 4-digit PIN (Default: 2026)"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setErrorMessage('');
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '13.5px'
                }}
              />
              <KeyRound 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} 
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '11px', justifyContent: 'center', fontSize: '14px', borderRadius: 'var(--radius-md)', fontWeight: 700 }}
          >
            <ShieldCheck size={18} />
            <span>Verify & Log In</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-light)', fontSize: '11px', color: 'var(--text-muted)' }}>
          Need access? Contact <strong>Hiba Karatt (Faculty Mentor)</strong> to whitelist your Gmail account.
        </div>
      </div>
    </div>
  );
};
