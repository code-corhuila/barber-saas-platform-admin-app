/** Types of `platform-admin-service.yaml` 1.2.0 (`barber-saas-docs`). */

export interface Page<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceCents: number;
  maxBarbers: number;
  featuresJson: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface PlanRequest {
  name: string;
  priceCents: number;
  maxBarbers: number;
  featuresJson?: string | null;
}

export type BarbershopStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';

export interface PlatformBarbershop {
  id: string;
  name: string;
  address: string | null;
  city: string;
  phone: string | null;
  status: BarbershopStatus;
  planId: string | null;
  timezone: string;
  trialEndsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrialStatus {
  barbershopId: string;
  status: BarbershopStatus;
  trialStartedAt: string;
  trialEndsAt: string;
  daysRemaining: number;
  expired: boolean;
}
