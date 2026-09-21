import { describe, it, expect } from 'vitest';
import { auditLogEngine } from '../src/engines/auditLogEngine';

describe('Emergency Kill Switch Tests', () => {
  it('should record an immutable audit log entry when kill switch is engaged', () => {
    const entry = auditLogEngine.recordEntry({
      action: 'KILL_SWITCH_ACTIVATED',
      summary: 'EMERGENCY KILL SWITCH ENGAGED',
      details: 'User initiated emergency halt. All orders frozen.',
      actor: 'HUMAN_USER',
      isDemo: true,
    });

    expect(entry).toBeDefined();
    expect(entry.action).toBe('KILL_SWITCH_ACTIVATED');
    expect(entry.actor).toBe('HUMAN_USER');

    const logs = auditLogEngine.getLogs();
    expect(logs.some((l) => l.action === 'KILL_SWITCH_ACTIVATED')).toBe(true);
  });
});
