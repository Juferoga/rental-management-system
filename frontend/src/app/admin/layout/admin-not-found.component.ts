import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-admin-not-found',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  template: `
    <section class="admin-not-found">
      <i class="pi pi-exclamation-triangle"></i>
      <h2>Página de administración no encontrada</h2>
      <p>La ruta que intentaste abrir no existe o todavía no está habilitada.</p>
      <a pButton routerLink="/admin/zonas" label="Volver a Zonas" class="p-button-primary"></a>
    </section>
  `,
})
export class AdminNotFoundComponent {}
