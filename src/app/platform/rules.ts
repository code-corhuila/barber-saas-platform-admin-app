import type { BarbershopStatus, PlanRequest } from './types';

/**
 * The barbershop lifecycle of `platform-admin-service.yaml`: barbershop-api enforces it (409), the
 * screen only offers the moves that exist.
 *   TRIAL → ACTIVE | SUSPENDED · ACTIVE → SUSPENDED | CANCELLED · SUSPENDED → ACTIVE | CANCELLED
 */
const MOVES: Record<BarbershopStatus, Exclude<BarbershopStatus, 'TRIAL'>[]> = {
  TRIAL: ['ACTIVE', 'SUSPENDED'],
  ACTIVE: ['SUSPENDED', 'CANCELLED'],
  SUSPENDED: ['ACTIVE', 'CANCELLED'],
  CANCELLED: [],
};

export function allowedMoves(status: BarbershopStatus): Exclude<BarbershopStatus, 'TRIAL'>[] {
  return MOVES[status];
}

export const STATUS_LABEL: Record<BarbershopStatus, string> = {
  TRIAL: 'En prueba',
  ACTIVE: 'Activa',
  SUSPENDED: 'Suspendida',
  CANCELLED: 'Cancelada',
};

/** What the button that moves a barbershop to that status says. */
export const MOVE_LABEL: Record<Exclude<BarbershopStatus, 'TRIAL'>, string> = {
  ACTIVE: 'Activar',
  SUSPENDED: 'Suspender',
  CANCELLED: 'Cancelar barbería',
};

/** Prices travel as integer cents of COP (ADR-010); people read and type whole pesos. */
const PESOS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

export function formatCop(cents: number): string {
  return `$ ${PESOS.format(Math.round(cents / 100))}`;
}

/** "25000" or "25.000" → 2500000; anything that is not a non-negative whole amount → null. */
export function pesosToCents(typed: string): number | null {
  const digits = typed.trim().replace(/\./g, '');
  if (!/^\d{1,9}$/.test(digits)) return null;
  return Number(digits) * 100;
}

export interface PlanForm {
  name: string;
  pesos: string;
  maxBarbers: string;
}

/** The plan form against the contract's limits; an error per field, or the request to send. */
export function validatePlan(form: PlanForm): { errors: Partial<Record<keyof PlanForm, string>>; request: PlanRequest | null } {
  const errors: Partial<Record<keyof PlanForm, string>> = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Escribe el nombre del plan.';
  else if (name.length > 50) errors.name = 'Máximo 50 caracteres.';
  const priceCents = pesosToCents(form.pesos);
  if (priceCents === null) errors.pesos = 'Escribe el precio mensual en pesos, sin decimales.';
  const maxBarbers = Number(form.maxBarbers);
  if (!Number.isInteger(maxBarbers) || maxBarbers < 1) errors.maxBarbers = 'Mínimo 1 barbero.';
  const ok = Object.keys(errors).length === 0;
  return { errors, request: ok ? { name, priceCents: priceCents as number, maxBarbers } : null };
}

/** "2026-12-04T15:00:00Z" → "4 dic 2026", in the phone's time zone. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
}
