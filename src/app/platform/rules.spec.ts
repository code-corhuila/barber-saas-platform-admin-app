import { describe, expect, it } from 'vitest';
import { allowedMoves, formatCop, pesosToCents, validatePlan } from './rules';

describe('lifecycle', () => {
  it('offers only the transitions of the contract', () => {
    expect(allowedMoves('TRIAL')).toEqual(['ACTIVE', 'SUSPENDED']);
    expect(allowedMoves('ACTIVE')).toEqual(['SUSPENDED', 'CANCELLED']);
    expect(allowedMoves('SUSPENDED')).toEqual(['ACTIVE', 'CANCELLED']);
  });

  it('never moves a cancelled barbershop', () => {
    expect(allowedMoves('CANCELLED')).toEqual([]);
  });
});

describe('money', () => {
  it('shows cents as whole pesos', () => {
    expect(formatCop(4990000)).toBe('$ 49.900');
  });

  it('reads typed pesos as cents, with or without thousands dots', () => {
    expect(pesosToCents('49900')).toBe(4990000);
    expect(pesosToCents('49.900')).toBe(4990000);
    expect(pesosToCents('49,9')).toBeNull();
    expect(pesosToCents('-1')).toBeNull();
  });
});

describe('plan form', () => {
  it('builds the request of a valid form', () => {
    expect(validatePlan({ name: ' Pro ', pesos: '89.900', maxBarbers: '5' }))
      .toEqual({ errors: {}, request: { name: 'Pro', priceCents: 8990000, maxBarbers: 5 } });
  });

  it('reports every invalid field and sends nothing', () => {
    const { errors, request } = validatePlan({ name: '', pesos: 'gratis', maxBarbers: '0' });
    expect(request).toBeNull();
    expect(Object.keys(errors).sort()).toEqual(['maxBarbers', 'name', 'pesos']);
  });

  it('keeps the name within the 50 characters of the column', () => {
    expect(validatePlan({ name: 'x'.repeat(51), pesos: '1', maxBarbers: '1' }).errors.name).toBeDefined();
  });
});
