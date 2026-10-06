import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonSpinner } from '@ionic/angular/standalone';
import { userMessage } from '../shell-context';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { barberCap, formatCop } from './rules';
import { SectionsComponent } from './sections.component';
import type { SubscriptionPlan } from './types';

/** Every subscription plan (FR-024): price, barber cap, active or not; deactivate one. */
@Component({
  selector: 'pa-plans-page',
  imports: [RouterLink, IonButton, IonSpinner, SectionsComponent],
  template: `
    <section class="page">
      <div class="head">
        <h1>Plataforma</h1>
        <ion-button routerLink="/platform/plans/new">+ Nuevo plan</ion-button>
      </div>
      <p class="sub">Los planes que una barbería puede tener.</p>
      <pa-sections active="plans" />
      @switch (list.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="list.run()">Intentar de nuevo</ion-button></div>
        }
        @case ('empty') { <p class="center">Todavía no hay planes.</p> }
        @case ('data') {
          @for (plan of plans(); track plan.id) {
            <div class="card">
              <div class="row">
                <div>
                  <h2>{{ plan.name }}</h2>
                  <p class="gold">{{ money(plan.priceCents) }} al mes</p>
                  <p class="muted">{{ cap(plan.maxBarbers) }}</p>
                </div>
                <span class="badge" [class.ACTIVE]="plan.isActive" [class.off]="!plan.isActive">{{ plan.isActive ? 'Activo' : 'Inactivo' }}</span>
              </div>
              <div class="actions">
                <ion-button fill="outline" size="small" [routerLink]="['/platform/plans', plan.id]">Editar</ion-button>
                @if (plan.isActive) {
                  <ion-button fill="outline" size="small" color="danger" [disabled]="busy()" (click)="deactivate(plan)">Desactivar</ion-button>
                }
              </div>
            </div>
          }
          @if (actionError()) { <p class="error" role="alert">{{ actionError() }}</p> }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES,
})
export class PlansPageComponent {
  private readonly api = inject(PlatformApi);
  readonly money = formatCop;
  readonly cap = barberCap;
  readonly busy = signal(false);
  readonly actionError = signal('');
  readonly list = loader(() => this.api.listPlans(), (p) => p.data.length === 0);

  constructor() {
    void this.list.run();
  }

  plans(): SubscriptionPlan[] {
    const s = this.list.state();
    return s.kind === 'data' ? s.value.data : [];
  }

  errorText(): string {
    const s = this.list.state();
    return s.kind === 'error' ? s.message : '';
  }

  /** `422` while barbershops still use it (DEC-PLAT-02): the shell's message explains it. */
  async deactivate(plan: SubscriptionPlan): Promise<void> {
    this.busy.set(true);
    this.actionError.set('');
    try {
      await this.api.deactivatePlan(plan.id);
      await this.list.run();
    } catch (err) {
      this.actionError.set(userMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
