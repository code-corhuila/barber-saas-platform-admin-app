import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { formatCop, formatDate, PAYMENT_LABEL } from './rules';
import { SectionsComponent } from './sections.component';
import type { Payment } from './types';

/** Every plan payment of the platform, newest first (HU-SADMIN-003, Wompi in sandbox, ADR-017). */
@Component({
  selector: 'pa-payments-page',
  imports: [RouterLink, IonButton, IonSpinner, SectionsComponent],
  template: `
    <section class="page">
      <h1>Plataforma</h1>
      <p class="sub">Los pagos de los planes, aprobados por Wompi (modo de prueba).</p>
      <pa-sections active="payments" />
      @switch (list.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="list.run()">Intentar de nuevo</ion-button></div>
        }
        @case ('empty') { <p class="center">Todavía no hay pagos.</p> }
        @case ('data') {
          @for (p of payments(); track p.id) {
            <div class="card">
              <div class="row">
                <div>
                  <h2>{{ p.planName }} · <span class="gold">{{ money(p.amountCents) }}</span></h2>
                  <p class="muted">{{ date(p.createdAt) }} · ref. {{ p.reference }}</p>
                  @if (p.periodEnd) { <p class="muted">Pagado hasta el {{ date(p.periodEnd) }}</p> }
                </div>
                <span class="badge" [class.ACTIVE]="p.status === 'APPROVED'" [class.off]="p.status !== 'APPROVED'">{{ label[p.status] }}</span>
              </div>
              <ion-button fill="clear" size="small" [routerLink]="['/platform/barbershops', p.barbershopId]">Ver barbería</ion-button>
            </div>
          }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES,
})
export class PaymentsPageComponent {
  private readonly api = inject(PlatformApi);
  readonly money = formatCop;
  readonly date = formatDate;
  readonly label = PAYMENT_LABEL;
  readonly list = loader(() => this.api.listPayments(), (p) => p.data.length === 0);

  constructor() {
    void this.list.run();
  }

  payments(): Payment[] {
    const s = this.list.state();
    return s.kind === 'data' ? s.value.data : [];
  }

  errorText(): string {
    const s = this.list.state();
    return s.kind === 'error' ? s.message : '';
  }
}
