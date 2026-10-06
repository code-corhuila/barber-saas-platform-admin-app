import { Observable, firstValueFrom } from 'rxjs';
import type { BarbershopStatus, Page, PlanRequest, PlatformBarbershop, SubscriptionPlan, TrialStatus } from './types';

/** The part of HttpClient this app uses: plain params and headers, so the calls test without Angular. */
export interface Http {
  get<T>(url: string, options?: { params?: Record<string, string | number> }): Observable<T>;
  post<T>(url: string, body: unknown, options?: { headers?: Record<string, string> }): Observable<T>;
  put<T>(url: string, body: unknown): Observable<T>;
  patch<T>(url: string, body: unknown): Observable<T>;
  delete<T>(url: string): Observable<T>;
}

const BASE = '/api/v1/platform';
const id = (value: string) => encodeURIComponent(value);

/**
 * The calls of `platform-admin-service.yaml`, all for `SUPER_ADMIN`. Relative '/api/...' URLs: the
 * shell's interceptor adds the gateway, the token and X-Correlation-Id.
 */
export class PlatformCalls {
  constructor(private readonly http: Http) {}

  listPlans(): Promise<Page<SubscriptionPlan>> {
    return firstValueFrom(this.http.get<Page<SubscriptionPlan>>(`${BASE}/plans`, {
      params: { limit: 100 },
    }));
  }

  getPlan(planId: string): Promise<SubscriptionPlan> {
    return firstValueFrom(this.http.get<SubscriptionPlan>(`${BASE}/plans/${id(planId)}`));
  }

  /** Creation is idempotent: a retried form sends the same key (norm 5.3.8). */
  createPlan(request: PlanRequest, idempotencyKey: string): Promise<SubscriptionPlan> {
    return firstValueFrom(this.http.post<SubscriptionPlan>(`${BASE}/plans`, request, {
      headers: { 'Idempotency-Key': idempotencyKey },
    }));
  }

  updatePlan(planId: string, request: PlanRequest): Promise<SubscriptionPlan> {
    return firstValueFrom(this.http.put<SubscriptionPlan>(`${BASE}/plans/${id(planId)}`, request));
  }

  /** `422` while barbershops still use it (DEC-PLAT-02). */
  deactivatePlan(planId: string): Promise<unknown> {
    return firstValueFrom(this.http.delete<unknown>(`${BASE}/plans/${id(planId)}`));
  }

  listBarbershops(status: BarbershopStatus | null, page: number): Promise<Page<PlatformBarbershop>> {
    const params: Record<string, string | number> = { page, limit: 20, ...(status ? { status } : {}) };
    return firstValueFrom(this.http.get<Page<PlatformBarbershop>>(`${BASE}/barbershops`, { params }));
  }

  getBarbershop(barbershopId: string): Promise<PlatformBarbershop> {
    return firstValueFrom(this.http.get<PlatformBarbershop>(`${BASE}/barbershops/${id(barbershopId)}`));
  }

  getTrial(barbershopId: string): Promise<TrialStatus> {
    return firstValueFrom(this.http.get<TrialStatus>(`${BASE}/barbershops/${id(barbershopId)}/trial`));
  }

  changeStatus(barbershopId: string, status: Exclude<BarbershopStatus, 'TRIAL'>): Promise<PlatformBarbershop> {
    return firstValueFrom(this.http.patch<PlatformBarbershop>(`${BASE}/barbershops/${id(barbershopId)}/status`, { status }));
  }

  assignPlan(barbershopId: string, planId: string): Promise<PlatformBarbershop> {
    return firstValueFrom(this.http.put<PlatformBarbershop>(`${BASE}/barbershops/${id(barbershopId)}/plan`, { planId }));
  }
}

