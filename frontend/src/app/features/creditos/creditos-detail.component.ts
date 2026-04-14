import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { OwnerDebtDetailDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-creditos-detail',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    @if (notFound()) {
      <p-card styleClass="credits-card credits-card--empty">
        <p class="empty-state">
          <span>Detalle de deuda no encontrado.</span>
        </p>
      </p-card>
    } @else if (detail(); as debt) {
      <p-card styleClass="credits-card credits-detail-card">
        <ng-template pTemplate="header">
          <div class="credits-card__header">
            <i class="pi pi-file-edit"></i>
            <h2>Detalle de Crédito</h2>
          </div>
        </ng-template>
        <div class="credits-detail-grid">
          <p><strong>ID:</strong> {{ debt.id }}</p>
          <p><strong>Tipo:</strong> {{ debt.type }}</p>
          <p><strong>Descripción:</strong> {{ debt.description }}</p>
          <p><strong>Total:</strong> {{ debt.totalAmount | number:'1.0-0' }}</p>
          <p><strong>Pendiente:</strong> {{ debt.pendingAmount | number:'1.0-0' }}</p>
          <p><strong>Corte:</strong> {{ debt.cutoffDate || 'Sin fecha' }}</p>
          <p><strong>Vencimiento:</strong> {{ debt.dueDate || 'Sin fecha' }}</p>
          <p><strong>Estado:</strong> {{ debt.status }}</p>
        </div>
      </p-card>
    }
  `,
})
export class CreditosDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(RentalApiService);

  readonly detail = signal<OwnerDebtDetailDTO | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getDebtDetail(id).subscribe({
      next: (value) => {
        this.notFound.set(false);
        this.detail.set(value);
      },
      error: () => {
        this.notFound.set(true);
      },
    });
  }
}
