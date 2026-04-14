import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { CreditsSummaryDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-creditos-list',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <section class="credits-page">
      <header class="credits-page__header">
        <h2>Créditos y Deudas</h2>
        <p>Gestioná tus compromisos con una vista clara y ordenada.</p>
      </header>

      @if (!summary()) {
        <p class="empty-state"><span>Cargando información de créditos...</span></p>
      } @else if (!hasItems(summary()!)) {
        <p-card styleClass="credits-card credits-card--empty">
          <p class="empty-state">
            <span>No existen deudas registradas por el momento.</span>
          </p>
          <button type="button" class="debt-link debt-link--primary" (click)="goToAddDebt()">
            <i class="pi pi-plus-circle"></i>
            <span>Agregar deuda</span>
          </button>
        </p-card>
      } @else {
        <div class="credits-grid">
          <p-card styleClass="credits-card">
            <ng-template pTemplate="header">
              <div class="credits-card__header">
                <i class="pi pi-credit-card"></i>
                <h3>Tarjetas</h3>
              </div>
            </ng-template>
            <div class="debt-list">
              @for (item of summary()!.creditCards; track item.id) {
                <button type="button" class="debt-link" (click)="openDetail(item.id)">
                  <span class="debt-link__description">{{ item.description }}</span>
                  <span class="debt-link__amount">{{ item.pendingAmount | number:'1.0-0' }}</span>
                </button>
              } @empty {
                <p class="empty-state empty-state--compact"><span>Sin tarjetas activas.</span></p>
              }
            </div>
          </p-card>

          <p-card styleClass="credits-card">
            <ng-template pTemplate="header">
              <div class="credits-card__header">
                <i class="pi pi-wallet"></i>
                <h3>Préstamos</h3>
              </div>
            </ng-template>
            <div class="debt-list">
              @for (item of summary()!.loans; track item.id) {
                <button type="button" class="debt-link" (click)="openDetail(item.id)">
                  <span class="debt-link__description">{{ item.description }}</span>
                  <span class="debt-link__amount">{{ item.pendingAmount | number:'1.0-0' }}</span>
                </button>
              } @empty {
                <p class="empty-state empty-state--compact"><span>Sin préstamos registrados.</span></p>
              }
            </div>
          </p-card>

          <p-card styleClass="credits-card">
            <ng-template pTemplate="header">
              <div class="credits-card__header">
                <i class="pi pi-briefcase"></i>
                <h3>Otros</h3>
              </div>
            </ng-template>
            <div class="debt-list">
              @for (item of summary()!.others; track item.id) {
                <button type="button" class="debt-link" (click)="openDetail(item.id)">
                  <span class="debt-link__description">{{ item.description }}</span>
                  <span class="debt-link__amount">{{ item.pendingAmount | number:'1.0-0' }}</span>
                </button>
              } @empty {
                <p class="empty-state empty-state--compact"><span>Sin otros compromisos.</span></p>
              }
            </div>
          </p-card>
        </div>
      }
    </section>
  `,
})
export class CreditosListComponent {
  private readonly api = inject(RentalApiService);
  private readonly router = inject(Router);

  readonly summary = signal<CreditsSummaryDTO | null>(null);

  constructor() {
    this.api.getCreditsSummary().subscribe((value) => this.summary.set(value));
  }

  hasItems(summary: CreditsSummaryDTO) {
    return summary.creditCards.length + summary.loans.length + summary.others.length > 0;
  }

  openDetail(id: string) {
    this.router.navigate(['/creditos', id]);
  }

  goToAddDebt() {
    this.router.navigateByUrl('/creditos/nuevo');
  }
}
