import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { ArriendosListComponent } from './features/arriendos/arriendos-list.component';
import { ArriendosDetailComponent } from './features/arriendos/arriendos-detail.component';
import { ServiciosListComponent } from './features/servicios/servicios-list.component';
import { ServiciosDetailComponent } from './features/servicios/servicios-detail.component';
import { CreditosListComponent } from './features/creditos/creditos-list.component';
import { CreditosDetailComponent } from './features/creditos/creditos-detail.component';
import { CreditosCreateComponent } from './features/creditos/creditos-create.component';
import { CalendarioComponent } from './features/calendario/calendario.component';
import { ReportesComponent } from './features/reportes/reportes.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      { path: 'inicio', component: InicioComponent },
      { path: 'arriendos', component: ArriendosListComponent },
      { path: 'arriendos/:id', component: ArriendosDetailComponent },
      { path: 'servicios', component: ServiciosListComponent },
      { path: 'servicios/:id', component: ServiciosDetailComponent },
      { path: 'creditos', component: CreditosListComponent },
      { path: 'creditos/nuevo', component: CreditosCreateComponent },
      { path: 'creditos/:id', component: CreditosDetailComponent },
      { path: 'calendario', component: CalendarioComponent },
      { path: 'reportes', component: ReportesComponent },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes').then((module) => module.adminRoutes),
      },
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
