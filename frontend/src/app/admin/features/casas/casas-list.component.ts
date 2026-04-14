import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CasaDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { CasasStore } from './casas.store';

@Component({
  selector: 'app-casas-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Casas"
        subtitle="Gestioná las casas asociadas a los usuarios del sistema."
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
        [value]="store.casas()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="6"
        emptyMessage="Todavía no hay casas registradas."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Nombre</th>
          <th>Dirección</th>
          <th>Barrio</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th style="width: 130px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-casa>
        <tr>
          <td>{{ casa.nombre }}</td>
          <td>{{ casa.direccion }}</td>
          <td>{{ casa.barrio }}</td>
          <td>{{ casa.ciudad }}</td>
          <td>
            <p-tag [value]="casa.estado || '—'" [severity]="resolveEstadoSeverity(casa.estado)"></p-tag>
          </td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(casa)"
                aria-label="Editar casa"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deleteCasa(casa)"
                aria-label="Eliminar casa"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class CasasListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(CasasStore);

  ngOnInit() {
    this.store.loadCasas();
  }

  reload() {
    this.store.loadCasas();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/casas/nueva');
  }

  goToEdit(casa: CasaDTO) {
    if (!casa.id) {
      return;
    }

    this.router.navigate(['/admin/casas', casa.id, 'editar']);
  }

  deleteCasa(casa: CasaDTO) {
    if (!casa.id) {
      return;
    }

    const casaId = casa.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar casa',
      message: `¿Querés eliminar la casa "${casa.nombre}"?`,
      accept: () => {
        this.store.deleteCasa(casaId, {
          onError: () => {
            // el interceptor + store ya exponen feedback consistente
          },
        });
      },
    });
  }

  resolveEstadoSeverity(estado: string | null | undefined): 'success' | 'warn' | 'contrast' {
    const value = (estado ?? '').trim().toLowerCase();

    if (value === 'disponible' || value === 'activa' || value === 'activo') {
      return 'success';
    }

    if (value === 'mantenimiento' || value === 'pendiente') {
      return 'warn';
    }

    return 'contrast';
  }
}
