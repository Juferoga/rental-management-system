import { Routes } from '@angular/router';
import { AdminNotFoundComponent } from './layout/admin-not-found.component';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'zonas' },
  {
    path: 'zonas',
    loadComponent: () =>
      import('./features/zonas/zonas-list.component').then((module) => module.ZonasListComponent),
  },
  {
    path: 'zonas/nueva',
    loadComponent: () => import('./features/zonas/zona-form.component').then((module) => module.ZonaFormComponent),
  },
  {
    path: 'zonas/:id/editar',
    loadComponent: () => import('./features/zonas/zona-form.component').then((module) => module.ZonaFormComponent),
  },
  {
    path: 'inquilinos',
    loadComponent: () =>
      import('./features/inquilinos/inquilinos-list.component').then((module) => module.InquilinosListComponent),
  },
  {
    path: 'inquilinos/nueva',
    loadComponent: () =>
      import('./features/inquilinos/inquilino-form.component').then((module) => module.InquilinoFormComponent),
  },
  {
    path: 'inquilinos/:id/editar',
    loadComponent: () =>
      import('./features/inquilinos/inquilino-form.component').then((module) => module.InquilinoFormComponent),
  },
  {
    path: 'contratos',
    loadComponent: () =>
      import('./features/contratos/contratos-list.component').then((module) => module.ContratosListComponent),
  },
  {
    path: 'contratos/nueva',
    loadComponent: () =>
      import('./features/contratos/contrato-form.component').then((module) => module.ContratoFormComponent),
  },
  {
    path: 'contratos/:id/editar',
    loadComponent: () =>
      import('./features/contratos/contrato-form.component').then((module) => module.ContratoFormComponent),
  },
  {
    path: 'casas',
    loadComponent: () => import('./features/casas/casas-list.component').then((module) => module.CasasListComponent),
  },
  {
    path: 'casas/nueva',
    loadComponent: () => import('./features/casas/casa-form.component').then((module) => module.CasaFormComponent),
  },
  {
    path: 'casas/:id/editar',
    loadComponent: () => import('./features/casas/casa-form.component').then((module) => module.CasaFormComponent),
  },
  {
    path: 'pagos-renta',
    loadComponent: () =>
      import('./features/pagos-renta/pagos-renta-list.component').then((module) => module.PagosRentaListComponent),
  },
  {
    path: 'pagos-renta/nueva',
    loadComponent: () =>
      import('./features/pagos-renta/pago-renta-form.component').then((module) => module.PagoRentaFormComponent),
  },
  {
    path: 'pagos-renta/:id/editar',
    loadComponent: () =>
      import('./features/pagos-renta/pago-renta-form.component').then((module) => module.PagoRentaFormComponent),
  },
  {
    path: 'deudas',
    loadComponent: () => import('./features/deudas/deudas-list.component').then((module) => module.DeudasListComponent),
  },
  {
    path: 'deudas/nueva',
    loadComponent: () => import('./features/deudas/deuda-form.component').then((module) => module.DeudaFormComponent),
  },
  {
    path: 'deudas/:id/editar',
    loadComponent: () => import('./features/deudas/deuda-form.component').then((module) => module.DeudaFormComponent),
  },
  {
    path: 'deudas/:id',
    loadComponent: () => import('./features/deudas/deuda-form.component').then((module) => module.DeudaFormComponent),
  },
  { path: '**', component: AdminNotFoundComponent },
];
