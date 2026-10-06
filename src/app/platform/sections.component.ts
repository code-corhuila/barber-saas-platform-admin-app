import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonLabel, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { PAGE_STYLES } from '../ui/styles';

/** The two sections of the platform: barbershops and plans. */
@Component({
  selector: 'pa-sections',
  imports: [IonSegment, IonSegmentButton, IonLabel, RouterLink],
  template: `
    <ion-segment [value]="active()">
      <ion-segment-button value="barbershops" routerLink="/platform/barbershops"><ion-label>Barberías</ion-label></ion-segment-button>
      <ion-segment-button value="plans" routerLink="/platform/plans"><ion-label>Planes</ion-label></ion-segment-button>
    </ion-segment>
  `,
  styles: PAGE_STYLES,
})
export class SectionsComponent {
  readonly active = input.required<'barbershops' | 'plans'>();
}
