import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ServiceListDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-servicios-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TagModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './servicios-list.component.html',
})
export class ServiciosListComponent {
  private readonly api = inject(RentalApiService);

  readonly services = signal<ServiceListDTO[]>([]);

  constructor() {
    this.api.getServiceList().subscribe((rows) => this.services.set(rows));
  }

  getSeverity(status: string): 'success' | 'warn' | 'danger' {
    const normalized = (status ?? '').trim().toUpperCase();

    if (normalized === 'PAGADO') {
      return 'success';
    }

    if (normalized === 'PARCIAL') {
      return 'warn';
    }

    return 'danger';
  }
}
