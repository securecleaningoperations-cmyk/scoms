import { describe, it, expect, vi } from 'vitest';
import { verifyRole, verifyTwilioSignature } from '@/lib/rbac';
import { NextRequest } from 'next/server';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '123', user_metadata: { role: 'super_admin' } } },
        error: null
      })
    }
  }))
}));

describe('RBAC Utility', () => {
  it('should authorize if user has allowed role', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer token' }
    });
    
    const result = await verifyRole(req, ['super_admin']);
    expect(result.authorized).toBe(true);
    expect(result.role).toBe('super_admin');
  });

  it('should deny if user does not have allowed role', async () => {
    const req = new NextRequest('http://localhost/api/test', {
      headers: { authorization: 'Bearer token' }
    });
    
    const result = await verifyRole(req, ['field_employee']);
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('Forbidden');
  });
});
