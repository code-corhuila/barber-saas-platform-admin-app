import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonButton, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular/standalone';
import { loader } from '../ui/load';
import { PAGE_STYLES } from '../ui/styles';
import { PlatformApi } from './platform-api';
import { formatDate, STATUS_LABEL } from './rules';
import { SectionsComponent } from './sections.component';
import type { BarbershopStatus } from './types';

/** Every barbershop of the platform, in any status (FR-023), filtered by status. */
@Component({
  selector: 'pa-barbershops-page',
  imports: [RouterLink, IonButton, IonSelect, IonSelectOption, IonSpinner, SectionsComponent],
  template: `
    <section class="page">
      <h1>Plataforma</h1>
      <p class="sub">Todas las barberías de BarberSaaS.</p>
      <pa-sections active="barbershops" />
      <div class="field">
        <ion-select label="Estado" labelPlacement="stacked" interface="popover" [value]="status()"
                    (ionChange)="filter($event.detail.value)">
          <ion-select-option [value]="null">Todas</ion-select-option>
          @for (s of statuses; track s) {
            <ion-select-option [value]="s">{{ label[s] }}</ion-select-option>
          }
        </ion-select>
      </div>
      @switch (list.state().kind) {
        @case ('loading') { <div class="center"><ion-spinner aria-label="Cargando" /></div> }
        @case ('error') {
          <div class="center"><p class="error">{{ errorText() }}</p><ion-button (click)="list.run()">Intentar de nuevo</ion-button></div>
        }
        @case ('empty') { <p class="center">No hay barberías con ese estado.</p> }
        @case ('data') {
          @for (shop of shops(); track shop.id) {
            <a class="card" [routerLink]="['/platform/barbershops', shop.id]">
              <div class="row">
                <div>
                  <h2>{{ shop.name }}</h2>
                  <p class="muted">{{ shop.city }}</p>
                  @if (shop.status === 'TRIAL') { <p class="muted">Prueba hasta {{ date(shop.trialEndsAt) }}</p> }
                </div>
                <span class="badge" [class]="shop.status">{{ label[shop.status] }}</span>
              </div>
            </a>
          }
          @if (pages() > 1) {
            <div class="actions">
              <ion-button fill="outline" [disabled]="page() <= 1" (click)="go(page() - 1)">Anterior</ion-button>
              <span class="muted">Página {{ page() }} de {{ pages() }}</span>
              <ion-button fill="outline" [disabled]="page() >= pages()" (click)="go(page() + 1)">Siguiente</ion-button>
            </div>
          }
        }
      }
    </section>
  `,
  styles: PAGE_STYLES,
})
export class BarbershopsPageComponent {
  private readonly api = inject(PlatformApi);
  readonly statuses: BarbershopStatus[] = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'];
  readonly label = STATUS_LABEL;
  readonly date = formatDate;
  readonly status = signal<BarbershopStatus | null>(null);
  readonly page = signal(1);
  readonly list = loader(() => this.api.listBarbershops(this.status(), this.page()), (p) => p.data.length === 0);

  constructor() {
    void this.list.run();
  }

  shops() {
    const s = this.list.state();
    return s.kind === 'data' ? s.value.data : [];
  }

  pages(): number {
    const s = this.list.state();
    return s.kind === 'data' ? s.value.meta.totalPages : 0;
  }

  errorText(): string {
    const s = this.list.state();
    return s.kind === 'error' ? s.message : '';
  }

  filter(value: BarbershopStatus | null): void {
    this.status.set(value);
    this.go(1);
  }

  go(page: number): void {
    this.page.set(page);
    void this.list.run();
  }
}
