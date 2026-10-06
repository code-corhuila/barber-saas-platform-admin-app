import { Component, OnInit, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonButton, IonInput, IonSpinner } from '@ionic/angular/standalone';
import { userMessage } from '../shell-context';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { type PlanForm, validatePlan } from './rules';

/** Create a plan (`/platform/plans/new`) or edit one (`/platform/plans/:id`). */
@Component({
  selector: 'pa-plan-form-page',
  imports: [RouterLink, IonButton, IonInput, IonSpinner],
  template: `
    <section class="page">
      <a class="back" routerLink="/platform/plans">‹ Planes</a>
      <h1>{{ id() ? 'Editar plan' : 'Nuevo plan' }}</h1>
      @if (loading()) { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
      @else {
        <div class="field">
          <ion-input label="Nombre" labelPlacement="stacked" placeholder="Básico" [maxlength]="50"
                     [value]="form().name" (ionInput)="set('name', $event.detail.value)" />
          @if (errors().name) { <p class="field-error">{{ errors().name }}</p> }
        </div>
        <div class="field">
          <ion-input label="Precio mensual (pesos)" labelPlacement="stacked" inputmode="numeric" placeholder="49900"
                     [value]="form().pesos" (ionInput)="set('pesos', $event.detail.value)" />
          @if (errors().pesos) { <p class="field-error">{{ errors().pesos }}</p> }
        </div>
        <div class="field">
          <ion-input label="Máximo de barberos" labelPlacement="stacked" inputmode="numeric" placeholder="3"
                     [value]="form().maxBarbers" (ionInput)="set('maxBarbers', $event.detail.value)" />
          <p class="hint">999 significa ilimitado.</p>
          @if (errors().maxBarbers) { <p class="field-error">{{ errors().maxBarbers }}</p> }
        </div>
        @if (saveError()) { <p class="error" role="alert">{{ saveError() }}</p> }
        <ion-button expand="block" [disabled]="saving()" (click)="save()">Guardar</ion-button>
        <ion-button expand="block" fill="clear" routerLink="/platform/plans">Cancelar</ion-button>
      }
    </section>
  `,
  styles: PAGE_STYLES,
})
export class PlanFormPageComponent implements OnInit {
  private readonly api = inject(PlatformApi);
  private readonly router = inject(Router);
  /** The `:id` of the route; absent when creating. */
  readonly id = input<string>();
  readonly form = signal<PlanForm>({ name: '', pesos: '', maxBarbers: '' });
  readonly errors = signal<Partial<Record<keyof PlanForm, string>>>({});
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly saveError = signal('');
  /** One key per form: retrying the same creation does not create two plans (norm 5.3.8). */
  private readonly idempotencyKey = crypto.randomUUID();

  ngOnInit(): void {
    void this.load();
  }

  set(field: keyof PlanForm, value: string | null | undefined): void {
    this.form.update((f) => ({ ...f, [field]: value ?? '' }));
  }

  private async load(): Promise<void> {
    const planId = this.id();
    if (!planId) return;
    this.loading.set(true);
    try {
      const plan = await this.api.getPlan(planId);
      this.form.set({ name: plan.name, pesos: String(Math.round(plan.priceCents / 100)), maxBarbers: String(plan.maxBarbers) });
    } catch (err) {
      this.saveError.set(userMessage(err));
    } finally {
      this.loading.set(false);
    }
  }

  async save(): Promise<void> {
    const { errors, request } = validatePlan(this.form());
    this.errors.set(errors);
    if (!request) return;
    this.saving.set(true);
    this.saveError.set('');
    try {
      const planId = this.id();
      if (planId) await this.api.updatePlan(planId, request);
      else await this.api.createPlan(request, this.idempotencyKey);
      await this.router.navigateByUrl('/platform/plans');
    } catch (err) {
      this.saveError.set(userMessage(err));
    } finally {
      this.saving.set(false);
    }
  }
}
