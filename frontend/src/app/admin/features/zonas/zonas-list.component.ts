import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ZonaDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { ZonasStore } from './zonas.store';

@Component({
  selector: 'app-zonas-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Zonas"
        subtitle="Gestioná las zonas habitacionales y su disponibilidad."
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
        [value]="store.zonas()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="4"
        emptyMessage="Todavía no hay zonas registradas."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th style="width: 130px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-zona>
        <tr>
          <td>{{ zona.nombre }}</td>
          <td>{{ zona.descripcion || '—' }}</td>
          <td>
            <p-tag
              [value]="zona.disponible ? 'Disponible' : 'No disponible'"
              [severity]="zona.disponible ? 'success' : 'contrast'"
            />
          </td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(zona)"
                aria-label="Editar zona"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deleteZona(zona)"
                aria-label="Eliminar zona"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class ZonasListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(ZonasStore);

  ngOnInit() {
    this.store.loadZonas();
  }

  reload() {
    this.store.loadZonas();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/zonas/nueva');
  }

  goToEdit(zona: ZonaDTO) {
    if (!zona.id) {
      return;
    }

    this.router.navigate(['/admin/zonas', zona.id, 'editar']);
  }

  deleteZona(zona: ZonaDTO) {
    if (!zona.id) {
      return;
    }

    const zonaId = zona.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar zona',
      message: `¿Querés eliminar la zona "${zona.nombre}"?`,
      accept: () => {
        this.store.deleteZona(zonaId, {
          onError: () => {
            // el interceptor + store ya exponen feedback consistente
          },
        });
      },
    });
  }
}
