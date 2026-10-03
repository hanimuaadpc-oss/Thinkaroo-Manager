import React, { useState } from 'react';
import { Lock, ShieldAlert, LogIn } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

// ─── Main Login Component ─────────────────────────────────────────────────────
export const LoginModal: React.FC = () => {
  const { authStage, login } = useDatabase();

  const [email, setEmail]       = useState('');
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email.trim().toLowerCase(), pin.trim());
      if (!result.success) {
        setError(result.message);
        setPin('');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Shared layout styles ───────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  };

  const boxStyle: React.CSSProperties = {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-xl)',
    maxWidth: '400px',
    width: '100%',
    padding: '36px 28px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)',
    textAlign: 'center',
    border: '1px solid var(--border-subtle)',
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (authStage === 'loading') {
    return (
      <div style={cardStyle}>
        <div style={boxStyle}>
          <div style={{ width: '68px', height: '68px', borderRadius: '16px', background: '#FFF7ED', border: '2px solid #FED7AA', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)' }}>
            <img src="/thinkaroo-logo.png" alt="Thinkaroo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-orange)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
            THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '16px' }}>Loading…</div>
        </div>
      </div>
    );
  }

  // ── Login form ─────────────────────────────────────────────────────────────
  return (
    <div style={cardStyle}>
      <div style={boxStyle}>
        {/* Branding */}
        <div style={{ width: '68px', height: '68px', borderRadius: '16px', background: '#FFF7ED', border: '2px solid #FED7AA', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(255, 107, 0, 0.2)' }}>
          <img src="/thinkaroo-logo.png" alt="Thinkaroo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-orange)', letterSpacing: '-0.02em', marginBottom: '2px' }}>
          THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
        </h2>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '28px' }}>
          Caliph Life School • Enterprise ERP
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Email field */}
          <div style={{ textAlign: 'left', marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="off"
              placeholder="name@caliphschool.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13.5px',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxSizing: 'border-box',
                color: 'var(--text-main)',
                background: loading ? '#F8FAFC' : '#FFFFFF',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>

          {/* PIN field */}
          <div style={{ textAlign: 'left', marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Lock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              PIN
            </label>
            <input
              id="login-pin"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              autoComplete="off"
              placeholder="••••"
              value={pin}
              onChange={e => { const v = e.target.value.replace(/\D/g, ''); setPin(v); setError(''); }}
              disabled={loading}
              maxLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '18px',
                letterSpacing: '0.2em',
                border: '1.5px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                boxSizing: 'border-box',
                color: 'var(--text-main)',
                background: loading ? '#F8FAFC' : '#FFFFFF',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--primary-blue)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>

          {/* Error message */}
          {error && (
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
              gap: '6px',
            }}>
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !email || !pin}
            style={{
              width: '100%',
              padding: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: loading || !email || !pin ? '#F1F5F9' : 'var(--primary-blue)',
              color: loading || !email || !pin ? 'var(--text-muted)' : '#FFFFFF',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading || !email || !pin ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #CBD5E1', borderTopColor: 'var(--primary-blue)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <LogIn size={16} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};
