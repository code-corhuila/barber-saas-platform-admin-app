import { Routes } from '@angular/router';

/**
 * What this domain app exposes as './routes' (ADR-013). The shell mounts them under /platform for
 * `SUPER_ADMIN` only (FR-025); every screen is lazy, so the shell downloads only what is opened.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'barbershops' },
  { path: 'barbershops', title: 'Barberías', loadComponent: () =>
      import('./platform/barbershops-page.component').then((m) => m.BarbershopsPageComponent) },
  { path: 'barbershops/:id', title: 'Barbería', loadComponent: () =>
      import('./platform/barbershop-detail-page.component').then((m) => m.BarbershopDetailPageComponent) },
  { path: 'plans', title: 'Planes', loadComponent: () =>
      import('./platform/plans-page.component').then((m) => m.PlansPageComponent) },
  { path: 'plans/new', title: 'Nuevo plan', loadComponent: () =>
      import('./platform/plan-form-page.component').then((m) => m.PlanFormPageComponent) },
  { path: 'plans/:id', title: 'Editar plan', loadComponent: () =>
      import('./platform/plan-form-page.component').then((m) => m.PlanFormPageComponent) },
];
