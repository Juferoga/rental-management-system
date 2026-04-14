import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface AdminNavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="admin-sidebar">
      <div class="admin-sidebar__header">
        <h2>Administración</h2>
        <p>Panel operativo</p>
      </div>

      <nav class="admin-sidebar__nav" aria-label="Navegación administración">
        <a
          *ngFor="let item of navItems"
          [routerLink]="item.route"
          routerLinkActive="admin-sidebar__link--active"
          [routerLinkActiveOptions]="{ exact: true }"
          class="admin-sidebar__link"
        >
          <i [class]="item.icon"></i>
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </aside>
  `,
})
export class AdminSidebarComponent {
  readonly navItems: AdminNavItem[] = [
    { label: 'Zonas', route: '/admin/zonas', icon: 'pi pi-map' },
    { label: 'Inquilinos', route: '/admin/inquilinos', icon: 'pi pi-users' },
    { label: 'Contratos', route: '/admin/contratos', icon: 'pi pi-file-edit' },
    { label: 'Casas', route: '/admin/casas', icon: 'pi pi-home' },
    { label: 'Pagos renta', route: '/admin/pagos-renta', icon: 'pi pi-wallet' },
    { label: 'Deudas', route: '/admin/deudas', icon: 'pi pi-credit-card' },
  ];
}
