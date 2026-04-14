import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ContratoDTO, DeudaDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { DeudasStore } from './deudas.store';

@Component({
  selector: 'app-deudas-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Deudas"
        subtitle="Gestioná préstamos, saldos pendientes y su estado operativo."
        [loading]="store.loading()"
        (create)="goToCreate()"
        (refresh)="reload()"
      />

      @if (store.error()) {
        <div class="admin-error-banner">
          <i class="pi pi-exclamation-triangle"></i>
          <span>{{ store.error() }}</span>
        </div>
      }

      <app-admin-table
        [value]="store.deudas()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="7"
        emptyMessage="Todavía no hay deudas registradas."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Contrato</th>
          <th>Fecha</th>
          <th>Monto total</th>
          <th>Saldo pendiente</th>
          <th>Motivo</th>
          <th>Estado</th>
          <th style="width: 130px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-deuda>
        <tr>
          <td>{{ resolveContratoLabel(deuda.contratoId) }}</td>
          <td>{{ deuda.fecha }}</td>
          <td>{{ deuda.montoTotal | number: '1.2-2' }}</td>
          <td>{{ deuda.saldoPendiente | number: '1.2-2' }}</td>
          <td>{{ deuda.motivo || '—' }}</td>
          <td>
            <p-tag [value]="deuda.estado || 'Pendiente'" [severity]="resolveEstadoSeverity(deuda.estado)"></p-tag>
          </td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(deuda)"
                aria-label="Editar deuda"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deleteDeuda(deuda)"
                aria-label="Eliminar deuda"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class DeudasListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(DeudasStore);

  ngOnInit() {
    this.store.loadCatalogs();
    this.store.loadDeudas();
  }

  reload() {
    this.store.loadCatalogs();
    this.store.loadDeudas();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/deudas/nueva');
  }

  goToEdit(deuda: DeudaDTO) {
    if (!deuda.id) {
      return;
    }

    this.router.navigate(['/admin/deudas', deuda.id, 'editar']);
  }

  deleteDeuda(deuda: DeudaDTO) {
    if (!deuda.id) {
      return;
    }

    const deudaId = deuda.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar deuda',
      message: `¿Querés eliminar la deuda #${deudaId}?`,
      accept: () => {
        this.store.deleteDeuda(deudaId, {
          onError: () => {
            // el interceptor + store ya exponen feedback consistente
          },
        });
      },
    });
  }

  resolveContratoLabel(contratoId: number): string {
    const contrato = this.store.contratos().find((item: ContratoDTO) => item.id === contratoId);
    if (!contrato) {
      return `Contrato #${contratoId}`;
    }

    return `#${contrato.id} · ${contrato.fechaInicio} → ${contrato.fechaFin}`;
  }

  resolveEstadoSeverity(estado: string | null | undefined): 'success' | 'warn' | 'contrast' {
    const value = (estado ?? '').trim().toLowerCase();

    if (value === 'pagado' || value === 'cancelado' || value === 'saldado') {
      return 'success';
    }

    if (value === 'pendiente' || value === 'vencido' || value === 'parcial') {
      return 'warn';
    }

    return 'contrast';
  }
}
