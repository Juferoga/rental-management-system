import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InquilinoDTO } from '../../../models/admin.models';
import { AdminTableComponent } from '../../shared/components/admin-table.component';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { AdminConfirmService } from '../../shared/services/admin-confirm.service';
import { InquilinosStore } from './inquilinos.store';

@Component({
  selector: 'app-inquilinos-list',
  standalone: true,
  imports: [CommonModule, ButtonModule, AdminToolbarComponent, AdminTableComponent],
  template: `
    <section class="admin-feature">
      <app-admin-toolbar
        title="Inquilinos"
        subtitle="Gestioná la base de inquilinos y sus datos de contacto."
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
        [value]="store.inquilinos()"
        [loading]="store.loading()"
        [rows]="10"
        [emptyColspan]="5"
        emptyMessage="Todavía no hay inquilinos registrados."
        [bodyTemplate]="bodyTemplate"
      >
        <tr table-header>
          <th>Nombre completo</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Dirección</th>
          <th style="width: 120px; text-align: right">Acciones</th>
        </tr>
      </app-admin-table>

      <ng-template #bodyTemplate let-inquilino>
        <tr>
          <td>{{ inquilino.nombre }} {{ inquilino.apellido }}</td>
          <td>{{ inquilino.telefono }}</td>
          <td>{{ inquilino.correo }}</td>
          <td>{{ inquilino.direccion || '—' }}</td>
          <td>
            <div class="admin-row-actions">
              <button
                pButton
                type="button"
                icon="pi pi-pencil"
                severity="secondary"
                [text]="true"
                (click)="goToEdit(inquilino)"
                aria-label="Editar inquilino"
              ></button>

              <button
                pButton
                type="button"
                icon="pi pi-trash"
                severity="danger"
                [text]="true"
                [disabled]="store.saving()"
                (click)="deleteInquilino(inquilino)"
                aria-label="Eliminar inquilino"
              ></button>
            </div>
          </td>
        </tr>
      </ng-template>
    </section>
  `,
})
export class InquilinosListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly adminConfirmService = inject(AdminConfirmService);
  readonly store = inject(InquilinosStore);

  ngOnInit() {
    this.store.loadInquilinos();
  }

  reload() {
    this.store.loadInquilinos();
  }

  goToCreate() {
    this.router.navigateByUrl('/admin/inquilinos/nueva');
  }

  goToEdit(inquilino: InquilinoDTO) {
    if (!inquilino.id) {
      return;
    }

    this.router.navigate(['/admin/inquilinos', inquilino.id, 'editar']);
  }

  deleteInquilino(inquilino: InquilinoDTO) {
    if (!inquilino.id) {
      return;
    }

    const inquilinoId = inquilino.id;

    this.adminConfirmService.confirm({
      title: 'Eliminar inquilino',
      message: `¿Querés eliminar a "${inquilino.nombre} ${inquilino.apellido}"?`,
      accept: () => {
        this.store.deleteInquilino(inquilinoId, {
          onError: () => {
            // el interceptor + store ya exponen feedback consistente
          },
        });
      },
    });
  }
}
