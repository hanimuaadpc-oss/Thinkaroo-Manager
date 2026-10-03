import React from 'react';
import { ShieldX, AlertCircle } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

export const AccessDeniedModal: React.FC = () => {
  const { clearAccessDenied } = useDatabase();

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '420px',
        width: '100%',
        padding: '36px 30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        textAlign: 'center',
        border: '1px solid #FECACA'
      }}>
        {/* Warning icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#FEF2F2',
          border: '2px solid #FCA5A5',
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--danger)'
        }}>
          <ShieldX size={34} strokeWidth={2.2} />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '6px' }}>
          Access Denied
        </h2>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
          This account is not approved for Thinkaroo internal management access.
        </p>

        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          fontSize: '12px',
          color: '#92400E',
          textAlign: 'left',
          marginBottom: '24px',
          lineHeight: 1.4,
          display: 'flex',
          gap: '8px'
        }}>
          <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Caliph Life School Policy:</strong> Only approved student interns and faculty mentors can access this system.
          </div>
        </div>

        <button
          onClick={clearAccessDenied}
          className="btn-primary"
          style={{ width: '100%', padding: '10px', justifyContent: 'center', fontSize: '13.5px' }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
