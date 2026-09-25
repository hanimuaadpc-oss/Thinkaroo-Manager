import React, { useState } from 'react';
import { ShieldCheck, Mail, ArrowRight, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const LoginModal: React.FC = () => {
  const { loginWithGmail, interns } = useDatabase();
  const [emailInput, setEmailInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter your Gmail address');
      return;
    }
    const result = loginWithGmail(emailInput);
    if (!result.success) {
      setErrorMessage(result.message);
    }
  };

  const handleQuickLogin = (email: string) => {
    loginWithGmail(email);
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
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '440px',
        width: '100%',
        padding: '36px 32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        textAlign: 'center'
      }}>
        {/* Brand Logo */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '16px',
          background: '#FFF7ED',
          border: '2px solid #FED7AA',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          boxShadow: '0 4px 10px rgba(255, 107, 0, 0.18)'
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
          marginBottom: '4px'
        }}>
          THINK<span style={{ color: 'var(--primary-blue)' }}>AROO</span>
        </h2>
        <p style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '16px'
        }}>
          Caliph Life School • Intern Management
        </p>

        <div style={{
          background: '#F8FAFC',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          marginBottom: '22px',
          textAlign: 'left',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <Lock size={18} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
          <span>Internal access only. Sign in with an approved Gmail account.</span>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ textAlign: 'left', marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Approved Gmail Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="intern.name@caliphschool.com"
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
            {errorMessage && (
              <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '5px', fontWeight: 500 }}>
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '11px', justifyContent: 'center', fontSize: '14px', borderRadius: 'var(--radius-md)' }}
          >
            <span>Sign In to Terminal</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick select test accounts */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-light)', textAlign: 'left' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-light)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Approved Interns (Quick Sign In)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {interns.filter(i => i.status === 'ENABLED').slice(0, 3).map(intern => (
              <button
                key={intern.id}
                onClick={() => handleQuickLogin(intern.email)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  background: '#F8FAFC',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  width: '100%'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-blue-light)'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#F8FAFC'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <CheckCircle2 size={13} color="var(--primary-blue)" />
                  <span style={{ fontWeight: 600 }}>{intern.name.split(' (')[0]}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>({intern.email})</span>
                </div>
                <span style={{ color: 'var(--primary-blue)', fontWeight: 600, fontSize: '11px' }}>Enter &rarr;</span>
              </button>
            ))}

            {/* Test unapproved button */}
            <button
              onClick={() => loginWithGmail('stranger@gmail.com')}
              style={{
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed #CBD5E1',
                background: '#FFFFFF',
                fontSize: '11px',
                color: 'var(--text-muted)',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEF2F2';
                e.currentTarget.style.color = 'var(--danger)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <span>Test Unauthorized Account (stranger@gmail.com)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
