import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
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
    DialogModule,
    ButtonModule,
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
        </div>
        <div class="shell-actions">
          <button
            type="button"
            pButton
            class="p-button-outlined search-trigger"
            icon="pi pi-search"
            label="Buscar"
            (click)="openSearchDialog()"
          ></button>
          <span class="search-shortcut">CTRL+K</span>
        </div>
      </header>

      <main class="workspace">
        <router-outlet></router-outlet>
      </main>

      <p-dialog
        header="Búsqueda global"
        [modal]="true"
        [draggable]="false"
        [resizable]="false"
        [dismissableMask]="true"
        appendTo="body"
        [(visible)]="searchDialogVisible"
        styleClass="search-dialog"
        [style]="{ width: 'min(760px, 95vw)' }"
      >
        <div class="search-dialog-body">
          <p-autoComplete
            [(ngModel)]="selectedSearch"
            [suggestions]="suggestions()"
            [dropdown]="true"
            [forceSelection]="true"
            [emptyMessage]="noSearchResultsMessage"
            field="label"
            placeholder="Buscar arriendos, servicios o deudas"
            (completeMethod)="onSearch($event)"
            (onSelect)="onSelect($event.value)"
            styleClass="search-input"
          ></p-autoComplete>

          <button
            type="button"
            pButton
            label="Buscar"
            icon="pi pi-arrow-right"
            (click)="onSearchGo()"
            [disabled]="!selectedSearch"
          ></button>
        </div>
      </p-dialog>

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

      .shell-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .workspace {
        min-height: 0;
        padding: 1rem;
      }

      .search-dialog-body {
        display: flex;
        gap: 0.75rem;
        align-items: center;
      }

      .search-input {
        flex: 1;
      }

      .search-shortcut {
        color: var(--text-color-secondary, #64748b);
        font-size: 0.85rem;
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

        .shell-actions {
          justify-content: flex-end;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  private readonly router = inject(Router);
  private readonly api = inject(RentalApiService);

  readonly suggestions = signal<GlobalSearchResult[]>([]);
  readonly noSearchResultsMessage = 'No se encontraron resultados para tu búsqueda.';
  selectedSearch: GlobalSearchResult | null = null;
  searchDialogVisible = false;

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

  @HostListener('window:keydown', ['$event'])
  onWindowKeydown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearchDialog();
    }
  }

  openSearchDialog() {
    this.searchDialogVisible = true;
  }

  onSearch(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.suggestions.set([]);
      return;
    }
    this.api.search(query).subscribe((items) => this.suggestions.set(items));
  }

  onSelect(result: GlobalSearchResult) {
    if (!result?.route) {
      return;
    }
    this.searchDialogVisible = false;
    this.router.navigateByUrl(result.route);
  }

  onSearchGo() {
    if (!this.selectedSearch) {
      return;
    }
    this.onSelect(this.selectedSearch);
  }
}
