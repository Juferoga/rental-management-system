import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { GlobalSearchResult } from '../models/rental.models';
import { RentalApiService } from '../services/rental-api.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MenubarModule,
    AutoCompleteModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  template: `
    <div class="shell-layout">
      <header class="shell-topbar">
        <div class="shell-nav-wrapper">
          <h2 class="shell-title">Rental Management</h2>
          <p-menubar [model]="menuItems()"></p-menubar>
          <p-autoComplete
            [(ngModel)]="searchQuery"
            [suggestions]="searchResults"
            (completeMethod)="onSearch($event)"
            (onSelect)="onResultSelect($event)"
            field="title"
            [dropdown]="true"
            placeholder="Buscar inquilinos, zonas o deudas"
            styleClass="topbar-search"
          >
            <ng-template let-result pTemplate="item">
              <div><b>{{ result.type }}:</b> {{ result.title }} <small>{{ result.subtitle }}</small></div>
            </ng-template>
          </p-autoComplete>
        </div>
      </header>

      <main class="workspace">
        <router-outlet></router-outlet>
      </main>

      <p-toast position="top-right"></p-toast>
      <p-confirmdialog />
    </div>
  `,
  styles: [
    `
      .shell-layout {
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr;
        background: var(--surface-ground, #f8fafc);
      }

      .shell-topbar {
        position: relative;
        z-index: 1200;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.75rem 1rem;
        border-bottom: 1px solid var(--surface-border, #e2e8f0);
        background: var(--surface-card, #ffffff);
      }

      .shell-nav-wrapper {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .shell-title {
        margin: 0;
        font-size: 1.1rem;
        white-space: nowrap;
      }

      .topbar-search {
        width: min(460px, 42vw);
      }

      .workspace {
        min-height: 0;
        padding: 1rem;
      }

      @media (max-width: 768px) {
        .shell-topbar {
          flex-direction: column;
          align-items: stretch;
        }

        .shell-nav-wrapper {
          flex-direction: column;
          align-items: stretch;
        }

      }
    `,
  ],
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly api = inject(RentalApiService);

  searchQuery = '';
  searchResults: GlobalSearchResult[] = [];

  readonly menuItems = signal<MenuItem[]>([
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: '/inicio',
    },
    {
      label: 'Arriendos',
      icon: 'pi pi-building',
      routerLink: '/arriendos',
    },
    {
      label: 'Servicios',
      icon: 'pi pi-bolt',
      routerLink: '/servicios',
    },
    {
      label: 'Deudas',
      icon: 'pi pi-wallet',
      routerLink: '/admin/deudas',
    },
    {
      label: 'Reportes',
      icon: 'pi pi-chart-line',
      routerLink: '/reportes',
    },
    {
      label: 'Gestión',
      icon: 'pi pi-cog',
      items: [
        { label: 'Zonas', routerLink: '/admin/zonas' },
        { label: 'Casas', routerLink: '/admin/casas' },
        { label: 'Inquilinos', routerLink: '/admin/inquilinos' },
        { label: 'Contratos', routerLink: '/admin/contratos' },
        { label: 'Pagos Renta', routerLink: '/admin/pagos-renta' },
      ],
    },
  ]);

  onSearch(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.searchResults = [];
      return;
    }
    this.api.globalSearch(query).subscribe((items) => (this.searchResults = items));
  }

  onResultSelect(event: { value?: GlobalSearchResult }) {
    const result = event.value;
    if (!result?.url) {
      return;
    }
    this.router.navigateByUrl(result.url);
  }
}
