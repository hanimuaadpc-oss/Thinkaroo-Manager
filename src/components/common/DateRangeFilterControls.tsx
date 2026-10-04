import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import {
  DateFilterPreset,
  getActivePeriodLabel,
  formatDateDisplay
} from '../../utils/dateFilterUtils';

interface DateRangeFilterControlsProps {
  preset: DateFilterPreset;
  onPresetChange: (preset: DateFilterPreset) => void;
  customStartDate: string;
  onStartDateChange: (date: string) => void;
  customEndDate: string;
  onEndDateChange: (date: string) => void;
  showPeriodBadge?: boolean;
  compact?: boolean;
}

const PRESET_OPTIONS: { id: DateFilterPreset; label: string }[] = [
  { id: 'all', label: 'All Time' },
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'thisWeek', label: 'This Week' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'lastMonth', label: 'Last Month' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const DateRangeFilterControls: React.FC<DateRangeFilterControlsProps> = ({
  preset,
  onPresetChange,
  customStartDate,
  onStartDateChange,
  customEndDate,
  onEndDateChange,
  showPeriodBadge = true,
  compact = false,
}) => {
  const isInvalidRange = preset === 'custom' && customStartDate && customEndDate && customEndDate < customStartDate;
  const activeLabel = getActivePeriodLabel(preset, customStartDate, customEndDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {/* Presets List */}
        <div style={{
          display: 'flex',
          background: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          flexWrap: 'wrap',
          gap: '2px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          {PRESET_OPTIONS.map(opt => {
            const active = preset === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => onPresetChange(opt.id)}
                style={{
                  padding: compact ? '3px 8px' : '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: compact ? '11px' : '11.5px',
                  fontWeight: active ? 600 : 500,
                  background: active
                    ? (opt.id === 'custom' ? 'var(--primary-orange)' : 'var(--primary-blue)')
                    : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap'
                }}
              >
                {opt.id === 'custom' && <Calendar size={12} />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Currently Selected Active Period Badge */}
        {showPeriodBadge && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: isInvalidRange ? '#FEF2F2' : '#F1F5F9',
            border: `1px solid ${isInvalidRange ? '#FECACA' : '#E2E8F0'}`,
            color: isInvalidRange ? 'var(--danger)' : 'var(--text-main)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '12px',
            fontWeight: 600
          }}>
            <Calendar size={13} color={isInvalidRange ? 'var(--danger)' : 'var(--primary-orange)'} />
            <span>Selected Period: <strong>{activeLabel}</strong></span>
          </div>
        )}
      </div>

      {/* Custom Date Range Picker Inputs */}
      {preset === 'custom' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: '#F8FAFC',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Start Date (Inclusive)
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '12.5px',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '16px', color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
              to
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                End Date (Inclusive)
              </label>
              <input
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(e) => onEndDateChange(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isInvalidRange ? 'var(--danger)' : 'var(--border-subtle)'}`,
                  fontSize: '12.5px',
                  fontWeight: 500,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: 'var(--text-main)'
                }}
              />
            </div>

            {customStartDate && customEndDate && !isInvalidRange && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                paddingTop: '16px',
                fontSize: '12px',
                color: 'var(--primary-blue)',
                fontWeight: 600
              }}>
                ✓ Range: {formatDateDisplay(customStartDate)} – {formatDateDisplay(customEndDate)}
              </div>
            )}
          </div>

          {/* Validation Error Message */}
          {isInvalidRange && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--danger)',
              fontWeight: 600,
              marginTop: '2px'
            }}>
              <AlertCircle size={14} />
              <span>Invalid date range: End Date cannot be earlier than Start Date. Please select a valid End Date.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
