import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ServiceDetailDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-servicios-detail',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    @if (notFound()) {
      <p class="empty-state">Zona de servicios no encontrada.</p>
    } @else if (detail(); as model) {
      <section>
        <h2>Detalle de Servicios</h2>
        <p><strong>Dirección:</strong> {{ model.address }}</p>
        <p><strong>Total:</strong> {{ model.totalValue | number:'1.0-0' }}</p>

        <p-table [value]="model.services" [tableStyle]="{ 'min-width': '100%' }">
          <ng-template pTemplate="header">
            <tr>
              <th>Responsable</th>
              <th>Valor</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Compartido</th>
              <th>Calendario</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-service>
            <tr>
              <td>{{ service.responsible }}</td>
              <td>{{ service.value | number:'1.0-0' }}</td>
              <td>{{ normalizeType(service.type) }}</td>
              <td>{{ service.status }}</td>
              <td>{{ service.isShared ? 'Sí' : 'No' }}</td>
              <td>{{ service.marker }}</td>
            </tr>
          </ng-template>
        </p-table>
      </section>
    }
  `,
})
export class ServiciosDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(RentalApiService);

  readonly detail = signal<ServiceDetailDTO | null>(null);
  readonly notFound = signal(false);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api
      .getServiceDetail(id, new Date().getFullYear(), new Date().getMonth() + 1)
      .subscribe({
        next: (value) => {
          this.notFound.set(false);
          this.detail.set(value);
        },
        error: () => {
          this.notFound.set(true);
          this.detail.set(null);
        },
      });
  }

  normalizeType(type: string) {
    return {
      LIGHT: 'Luz',
      WATER: 'Agua',
      GAS: 'Gas',
      OTHER: 'Otro',
    }[type] ?? 'Otro';
  }
}
