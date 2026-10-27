import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { formatCop } from './rules';
import { SectionsComponent } from './sections.component';
import type { PlatformMetrics } from './types';

/** FR-023 (DEC-PLAT-09): what the operator reads first, the barbershops by status and this month's money. */
@Component({
  selector: 'pa-summary-page',
  imports: [RouterLink, IonButton, IonSpinner, SectionsComponent],
  template: `
    <section class="page">
      <h1>Plataforma</h1>
      <p class="sub">Cómo va BarberSaaS este mes.</p>
      <pa-sections active="summary" />
      @switch (load.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="load.run()">Intentar de nuevo</ion-button></div>
        }
        @case ('data') {
          @if (metrics(); as m) {
            <div class="grid">
              <div class="card tile wide"><p class="muted">Ingresos del mes</p><p class="value gold">{{ money(m.revenueThisMonthCents) }}</p>
                <p class="muted">{{ m.paymentsThisMonth === 1 ? '1 pago aprobado' : m.paymentsThisMonth + ' pagos aprobados' }}
                  · {{ money(m.revenueTotalCents) }} en total</p></div>
              <a class="card tile" routerLink="/platform/barbershops"><p class="muted">Barberías</p><p class="value">{{ m.barbershops }}</p>
                <p class="muted">{{ m.newThisMonth === 1 ? '1 nueva este mes' : m.newThisMonth + ' nuevas este mes' }}</p></a>
              <div class="card tile"><p class="muted">Pruebas que vencen en 7 días</p><p class="value">{{ m.trialsEndingIn7Days }}</p></div>
            </div>
            <h2 class="section">Por estado</h2>
            <div class="card">
              <div class="row"><span class="badge TRIAL">En prueba</span><strong>{{ m.trial }}</strong></div>
              <div class="row"><span class="badge ACTIVE">Activa</span><strong>{{ m.active }}</strong></div>
              <div class="row"><span class="badge SUSPENDED">Suspendida</span><strong>{{ m.suspended }}</strong></div>
              <div class="row"><span class="badge CANCELLED">Cancelada</span><strong>{{ m.cancelled }}</strong></div>
            </div>
          }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES + `
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
    .tile { margin: 0; color: inherit; text-decoration: none; }
    .tile.wide { grid-column: 1 / -1; border: 1px solid #d4af37; }
    .value { font-size: 1.6rem; font-weight: 700; margin: .25rem 0; }
    .section { font-size: 1.05rem; margin: 1.25rem 0 .5rem; }
    .row + .row { margin-top: .6rem; }
  `,
})
export class SummaryPageComponent {
  private readonly api = inject(PlatformApi);
  readonly money = formatCop;
  readonly load = loader(() => this.api.metrics(), () => false);

  constructor() {
    void this.load.run();
  }

  metrics(): PlatformMetrics | null {
    const s = this.load.state();
    return s.kind === 'data' ? s.value : null;
  }

  errorText(): string {
    const s = this.load.state();
    return s.kind === 'error' ? s.message : '';
  }
}
