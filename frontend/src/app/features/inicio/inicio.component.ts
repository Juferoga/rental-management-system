import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { DashboardAlertsDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, ChartModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss',
})
export class InicioComponent {
  private readonly api = inject(RentalApiService);
  private readonly router = inject(Router);
  readonly alerts = signal<DashboardAlertsDTO | null>(null);

  readonly barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  readonly pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  constructor() {
    this.api.getDashboardAlerts().subscribe({
      next: (data) => this.alerts.set(data),
      error: () => this.alerts.set({ debts: [], rents: [], services: { total: 0, paid: 0, pending: 0 } }),
    });
  }

  alertRoute(alert: { referenceType: 'RENT' | 'DEBT'; referenceId: number }) {
    return alert.referenceType === 'DEBT'
      ? ['/admin/deudas', alert.referenceId]
      : ['/arriendos', alert.referenceId];
  }

  onAlertKeydown(event: KeyboardEvent, alert: { referenceType: 'RENT' | 'DEBT'; referenceId: number }) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onAlertClick(alert);
    }
  }

  onAlertClick(alert: { referenceType: 'RENT' | 'DEBT'; referenceId: number }) {
    this.router.navigate(this.alertRoute(alert));
  }

  servicesSummary() {
    const services = this.alerts()?.services;
    return {
      total: this.toNumber(services?.total),
      paid: this.toNumber(services?.paid),
      pending: this.toNumber(services?.pending),
    };
  }

  earningsChartData() {
    const earnings = this.alerts()?.earnings;
    const collected = this.toNumber(
      earnings?.collected ?? earnings?.recolected ?? earnings?.recolectado ?? earnings?.paid
    );
    const pending = this.toNumber(earnings?.pending ?? earnings?.pendiente ?? earnings?.unpaid);

    return {
      labels: ['Recolectado', 'Pendiente'],
      datasets: [
        {
          label: 'Ganancias',
          backgroundColor: ['#22c55e', '#f59e0b'],
          data: [collected, pending],
        },
      ],
    };
  }

  debtsChartData() {
    const debts = this.alerts()?.debts ?? [];
    const paid = debts.filter((debt) => this.isPaid(debt)).length;
    const unpaid = Math.max(debts.length - paid, 0);

    return {
      labels: ['Pagado', 'No Pagado'],
      datasets: [
        {
          backgroundColor: ['#3b82f6', '#ef4444'],
          data: [paid, unpaid],
        },
      ],
    };
  }

  private isPaid(debt: DashboardAlertsDTO['debts'][number]) {
    if (typeof debt.paid === 'boolean') {
      return debt.paid;
    }

    if (typeof debt.pendingAmount === 'number') {
      return debt.pendingAmount <= 0;
    }

    const normalizedStatus = String(debt.status ?? '').toLowerCase();
    if (['paid', 'pagado', 'cancelled', 'cancelado'].some((value) => normalizedStatus.includes(value))) {
      return true;
    }
    if (['pending', 'pendiente', 'overdue', 'vencido'].some((value) => normalizedStatus.includes(value))) {
      return false;
    }

    return false;
  }

  private toNumber(value: unknown) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
