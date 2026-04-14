import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { filter } from 'rxjs';
import { AdminSidebarComponent } from './admin-sidebar.component';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    BreadcrumbModule,
    AdminSidebarComponent,
  ],
  template: `
    <div class="admin-shell">
      <app-admin-sidebar />

      <section class="admin-shell__main">
        <header class="admin-shell__topbar">
          <div>
            <h1>Panel de Administración</h1>
            <p>Gestión de Zonas, Inquilinos, Contratos, Casas y Pagos de Renta</p>
          </div>

          <p-breadcrumb [home]="homeBreadcrumb" [model]="breadcrumbs" styleClass="admin-shell__breadcrumb" />
        </header>

        <main class="admin-shell__content">
          <router-outlet />
        </main>
      </section>
    </div>
  `,
})
export class AdminShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly homeBreadcrumb: MenuItem = {
    label: 'Home',
    routerLink: '/admin',
  };

  protected breadcrumbs: MenuItem[] = [];

  constructor() {
    this.breadcrumbs = this.buildBreadcrumbs(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.breadcrumbs = this.buildBreadcrumbs(event.urlAfterRedirects);
      });
  }

  private buildBreadcrumbs(url: string): MenuItem[] {
    const [path] = url.split(/[?#]/);
    const segments = path.split('/').filter(Boolean);
    const adminIndex = segments.indexOf('admin');
    const adminSegments = adminIndex >= 0 ? segments.slice(adminIndex + 1) : segments;

    const breadcrumbItems: MenuItem[] = [];
    const fullPathSegments: string[] = [];

    for (const segment of adminSegments) {
      fullPathSegments.push(segment);

      if (/^\d+$/.test(segment)) {
        continue;
      }

      breadcrumbItems.push({
        label: this.resolveLabel(segment),
        routerLink: `/admin/${fullPathSegments.join('/')}`,
      });
    }

    return breadcrumbItems;
  }

  private resolveLabel(segment: string): string {
    const labels: Record<string, string> = {
      zonas: 'Zonas',
      inquilinos: 'Inquilinos',
      contratos: 'Contratos',
      casas: 'Casas',
      'pagos-renta': 'Pagos de renta',
      nueva: 'Nueva',
      editar: 'Editar',
    };

    return labels[segment] ?? this.capitalize(segment);
  }

  private capitalize(value: string): string {
    if (!value) {
      return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
