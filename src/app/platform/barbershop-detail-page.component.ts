import { Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular/standalone';
import { userMessage } from '../shell-context';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { allowedMoves, formatCop, formatDate, MOVE_LABEL, STATUS_LABEL } from './rules';
import type { BarbershopStatus, PlatformBarbershop, SubscriptionPlan, TrialStatus } from './types';

interface Detail {
  shop: PlatformBarbershop;
  trial: TrialStatus;
  plans: SubscriptionPlan[];
}

/** One barbershop: its status, its plan and its trial; suspend, reactivate, cancel, change plan. */
@Component({
  selector: 'pa-barbershop-detail-page',
  imports: [RouterLink, IonButton, IonSelect, IonSelectOption, IonSpinner],
  template: `
    <section class="page">
      <a class="back" routerLink="/platform/barbershops">‹ Barberías</a>
      @switch (detail.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="detail.run()">Intentar de nuevo</ion-button></div>
        }
        @case ('data') {
          @if (value(); as d) {
            <div class="head">
              <h1>{{ d.shop.name }}</h1>
              <span class="badge" [class]="d.shop.status">{{ label[d.shop.status] }}</span>
            </div>
            <p class="sub">{{ d.shop.city }}@if (d.shop.address) { · {{ d.shop.address }} }</p>

            <div class="card">
              <h2>Periodo de prueba</h2>
              <p class="muted">Del {{ date(d.trial.trialStartedAt) }} al {{ date(d.trial.trialEndsAt) }}</p>
              @if (d.trial.expired) { <p class="error">Vencido</p> }
              @else { <p class="gold">{{ d.trial.daysRemaining }} días restantes</p> }
            </div>

            <div class="card">
              <h2>Plan</h2>
              <div class="field">
                <ion-select label="Plan asignado" labelPlacement="stacked" interface="popover"
                            [value]="d.shop.planId" [disabled]="busy() || d.shop.status === 'CANCELLED'"
                            (ionChange)="assign(d, $event.detail.value)">
                  @for (p of activePlans(d); track p.id) {
                    <ion-select-option [value]="p.id">{{ p.name }} · {{ money(p.priceCents) }}</ion-select-option>
                  }
                </ion-select>
              </div>
            </div>

            <div class="card">
              <h2>Estado</h2>
              @if (moves(d.shop.status).length === 0) { <p class="muted">Una barbería cancelada no cambia de estado.</p> }
              <div class="actions">
                @for (m of moves(d.shop.status); track m) {
                  <ion-button [color]="m === 'ACTIVE' ? 'primary' : 'danger'" [fill]="m === 'ACTIVE' ? 'solid' : 'outline'"
                              [disabled]="busy()" (click)="move(d, m)">{{ moveLabel[m] }}</ion-button>
                }
              </div>
            </div>
            @if (actionError()) { <p class="error" role="alert">{{ actionError() }}</p> }
          }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES,
})
export class BarbershopDetailPageComponent implements OnInit {
  private readonly api = inject(PlatformApi);
  /** The `:id` of the route (withComponentInputBinding in the shell). */
  readonly id = input.required<string>();
  readonly label = STATUS_LABEL;
  readonly moveLabel = MOVE_LABEL;
  readonly moves = allowedMoves;
  readonly date = formatDate;
  readonly money = formatCop;
  readonly busy = signal(false);
  readonly actionError = signal('');
  readonly detail = loader<Detail>(async () => {
    const [shop, trial, plans] = await Promise.all([
      this.api.getBarbershop(this.id()), this.api.getTrial(this.id()), this.api.listPlans(),
    ]);
    return { shop, trial, plans: plans.data };
  });

  ngOnInit(): void {
    void this.detail.run();
  }

  value(): Detail | null {
    const s = this.detail.state();
    return s.kind === 'data' ? s.value : null;
  }

  errorText(): string {
    const s = this.detail.state();
    return s.kind === 'error' ? s.message : '';
  }

  /** Only active plans can be assigned (INV-SHOP-003); the current one stays visible. */
  activePlans(d: Detail): SubscriptionPlan[] {
    return d.plans.filter((p) => p.isActive || p.id === d.shop.planId);
  }

  async move(d: Detail, status: Exclude<BarbershopStatus, 'TRIAL'>): Promise<void> {
    await this.act(() => this.api.changeStatus(d.shop.id, status));
  }

  async assign(d: Detail, planId: string | null): Promise<void> {
    if (!planId || planId === d.shop.planId) return;
    await this.act(() => this.api.assignPlan(d.shop.id, planId));
  }

  private async act(change: () => Promise<unknown>): Promise<void> {
    this.busy.set(true);
    this.actionError.set('');
    try {
      await change();
      await this.detail.run();
    } catch (err) {
      this.actionError.set(userMessage(err));
    } finally {
      this.busy.set(false);
    }
  }
}
