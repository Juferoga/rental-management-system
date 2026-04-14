import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ContratoDTO, InquilinoDTO, ZonaDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { ContratosStore } from './contratos.store';

@Component({
  selector: 'app-contratos-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Contratos"
        subtitle="Gestioná los contratos y sus relaciones con zonas e inquilinos."
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
        [value]="store.contratos()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="6"
        emptyMessage="Todavía no hay contratos registrados."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Inquilino</th>
          <th>Zona</th>
          <th>Inicio</th>
          <th>Fin</th>
          <th>Monto mensual</th>
          <th style="width: 120px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-contrato>
        <tr>
          <td>{{ resolveInquilinoName(contrato.inquilinoId) }}</td>
          <td>{{ resolveZonaName(contrato.zonaId) }}</td>
          <td>{{ contrato.fechaInicio }}</td>
          <td>{{ contrato.fechaFin }}</td>
          <td>{{ contrato.montoMensual | number: '1.2-2' }}</td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(contrato)"
                aria-label="Editar contrato"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deleteContrato(contrato)"
                aria-label="Eliminar contrato"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class ContratosListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(ContratosStore);

  ngOnInit() {
    this.store.loadCatalogs();
    this.store.loadContratos();
  }

  reload() {
    this.store.loadCatalogs();
    this.store.loadContratos();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/contratos/nueva');
  }

  goToEdit(contrato: ContratoDTO) {
    if (!contrato.id) {
      return;
    }

    this.router.navigate(['/admin/contratos', contrato.id, 'editar']);
  }

  deleteContrato(contrato: ContratoDTO) {
    if (!contrato.id) {
      return;
    }

    const contratoId = contrato.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar contrato',
      message: `¿Querés eliminar el contrato #${contratoId}?`,
      accept: () => {
        this.store.deleteContrato(contratoId, {
          onError: () => {
            // el interceptor + store ya exponen feedback consistente
          },
        });
      },
    });
  }

  resolveZonaName(zonaId: number): string {
    const zona = this.store.zonas().find((item: ZonaDTO) => item.id === zonaId);
    return zona?.nombre ?? `Zona #${zonaId}`;
  }

  resolveInquilinoName(inquilinoId: number): string {
    const inquilino = this.store
      .inquilinos()
      .find((item: InquilinoDTO) => item.id === inquilinoId);

    if (!inquilino) {
      return `Inquilino #${inquilinoId}`;
    }

    return `${inquilino.nombres} ${inquilino.apellidos}`;
  }
}
