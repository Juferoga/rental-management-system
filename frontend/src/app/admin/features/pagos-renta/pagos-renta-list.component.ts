import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ContratoDTO, PagoRentaDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { PagosRentaStore } from './pagos-renta.store';

@Component({
  selector: 'app-pagos-renta-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Pagos de renta"
        subtitle="Gestioná mensualidades, montos y estado de cobro por contrato."
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
        [value]="store.pagosRenta()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="7"
        emptyMessage="Todavía no hay pagos de renta registrados."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Contrato</th>
          <th>Período</th>
          <th>Monto esperado</th>
          <th>Monto pagado</th>
          <th>Fecha de pago</th>
          <th>Estado</th>
          <th style="width: 130px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-pago>
        <tr>
          <td>{{ resolveContratoLabel(pago.contratoId) }}</td>
          <td>{{ pago.mes }}/{{ pago.anio }}</td>
          <td>{{ pago.montoEsperado | number: '1.2-2' }}</td>
          <td>{{ (pago.montoPagado ?? 0) | number: '1.2-2' }}</td>
          <td>{{ pago.fechaPago || '—' }}</td>
          <td>
            <p-tag [value]="pago.estado || 'Pendiente'" [severity]="resolveEstadoSeverity(pago.estado)"></p-tag>
          </td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(pago)"
                aria-label="Editar pago de renta"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deletePagoRenta(pago)"
                aria-label="Eliminar pago de renta"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class PagosRentaListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(PagosRentaStore);

  ngOnInit() {
    this.store.loadCatalogs();
    this.store.loadPagosRenta();
  }

  reload() {
    this.store.loadCatalogs();
    this.store.loadPagosRenta();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/pagos-renta/nueva');
  }

  goToEdit(pagoRenta: PagoRentaDTO) {
    if (!pagoRenta.id) {
      return;
    }

    this.router.navigate(['/admin/pagos-renta', pagoRenta.id, 'editar']);
  }

  deletePagoRenta(pagoRenta: PagoRentaDTO) {
    if (!pagoRenta.id) {
      return;
    }

    const pagoRentaId = pagoRenta.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar pago de renta',
      message: `¿Querés eliminar el pago de ${pagoRenta.mes}/${pagoRenta.anio} del contrato #${pagoRenta.contratoId}?`,
      accept: () => {
        this.store.deletePagoRenta(pagoRentaId, {
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

    if (value === 'pagado' || value === 'al día') {
      return 'success';
    }

    if (value === 'parcial' || value === 'vencido') {
      return 'warn';
    }

    return 'contrast';
  }
}
