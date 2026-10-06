import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { type Http, PlatformCalls } from './platform-calls';

function fakeHttp() {
  const http = {
    get: vi.fn(() => of({})),
    post: vi.fn(() => of({})),
    put: vi.fn(() => of({})),
    patch: vi.fn(() => of({})),
    delete: vi.fn(() => of(null)),
  };
  return { http, calls: new PlatformCalls(http as unknown as Http) };
}

const params = (call: unknown[]) => (call[1] as { params: Record<string, unknown> }).params;

describe('platform-admin calls', () => {
  it('lists plans through the relative /api path the shell completes', async () => {
    const { http, calls } = fakeHttp();
    await calls.listPlans();
    expect(http.get.mock.calls[0]![0]).toBe('/api/v1/platform/plans');
    expect(params(http.get.mock.calls[0]!)).toEqual({ limit: 100 });
  });

  it('creates a plan with the Idempotency-Key of the form', async () => {
    const { http, calls } = fakeHttp();
    await calls.createPlan({ name: 'Pro', priceCents: 8990000, maxBarbers: 5 }, 'key-12345678');
    const [url, body, options] = http.post.mock.calls[0]! as unknown as [string, unknown, { headers: Record<string, string> }];
    expect(url).toBe('/api/v1/platform/plans');
    expect(body).toEqual({ name: 'Pro', priceCents: 8990000, maxBarbers: 5 });
    expect(options.headers['Idempotency-Key']).toBe('key-12345678');
  });

  it('filters barbershops by status only when one is chosen', async () => {
    const { http, calls } = fakeHttp();
    await calls.listBarbershops(null, 1);
    await calls.listBarbershops('TRIAL', 2);
    expect(params(http.get.mock.calls[0]!)).toEqual({ page: 1, limit: 20 });
    expect(params(http.get.mock.calls[1]!)).toEqual({ page: 2, limit: 20, status: 'TRIAL' });
  });

  it('changes the status and the plan with the bodies of the contract', async () => {
    const { http, calls } = fakeHttp();
    await calls.changeStatus('shop/1', 'SUSPENDED');
    await calls.assignPlan('shop-1', 'plan-1');
    expect(http.patch).toHaveBeenCalledWith('/api/v1/platform/barbershops/shop%2F1/status', { status: 'SUSPENDED' });
    expect(http.put).toHaveBeenCalledWith('/api/v1/platform/barbershops/shop-1/plan', { planId: 'plan-1' });
  });

  it('reads the trial and deactivates a plan', async () => {
    const { http, calls } = fakeHttp();
    await calls.getTrial('shop-1');
    await calls.deactivatePlan('plan-1');
    expect(http.get).toHaveBeenCalledWith('/api/v1/platform/barbershops/shop-1/trial');
    expect(http.delete).toHaveBeenCalledWith('/api/v1/platform/plans/plan-1');
  });
});
