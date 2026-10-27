import { Routes } from '@angular/router';

/**
 * What this domain app exposes as './routes' (ADR-013). The shell mounts them under /platform for
 * `SUPER_ADMIN` only (FR-025); every screen is lazy, so the shell downloads only what is opened.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'summary' },
  { path: 'summary', title: 'Resumen', loadComponent: () =>
      import('./platform/summary-page.component').then((m) => m.SummaryPageComponent) },
  { path: 'barbershops', title: 'Barberías', loadComponent: () =>
      import('./platform/barbershops-page.component').then((m) => m.BarbershopsPageComponent) },
  { path: 'barbershops/:id', title: 'Barbería', loadComponent: () =>
      import('./platform/barbershop-detail-page.component').then((m) => m.BarbershopDetailPageComponent) },
  { path: 'plans', title: 'Planes', loadComponent: () =>
      import('./platform/plans-page.component').then((m) => m.PlansPageComponent) },
  { path: 'plans/new', title: 'Nuevo plan', loadComponent: () =>
      import('./platform/plan-form-page.component').then((m) => m.PlanFormPageComponent) },
  { path: 'payments', title: 'Pagos', loadComponent: () =>
      import('./platform/payments-page.component').then((m) => m.PaymentsPageComponent) },
  { path: 'plans/:id', title: 'Editar plan', loadComponent: () =>
      import('./platform/plan-form-page.component').then((m) => m.PlanFormPageComponent) },
];
