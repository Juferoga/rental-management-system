import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ReportsSummaryDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, CardModule, ChartModule, ToolbarModule, ButtonModule, ToastModule],
  templateUrl: './reportes.component.html',
  styles: [
    `
      .reportes-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .reportes-toolbar {
        border-radius: 1rem;
        border: 1px solid var(--p-surface-200);
        background: linear-gradient(120deg, #0f172a 0%, #1e293b 60%, #1d4ed8 100%);
        box-shadow: 0 16px 40px rgb(15 23 42 / 0.25);
      }

      .reportes-toolbar :is(h2, p) {
        margin: 0;
      }

      .reportes-toolbar h2 {
        font-size: clamp(1.1rem, 1.25vw, 1.6rem);
        color: #f8fafc;
      }

      .reportes-subtitle {
        color: rgb(226 232 240 / 0.9);
        margin-top: 0.25rem;
        font-size: 0.9rem;
      }

      .reportes-toolbar .p-toolbar {
        border: 0;
        border-radius: 1rem;
        background: transparent;
        padding: 1rem 1.25rem;
      }

      .reportes-grid {
        margin: 0;
      }

      .reportes-card {
        height: 100%;
        border-radius: 1rem;
        border: 1px solid var(--p-surface-200);
        box-shadow: 0 12px 25px rgb(15 23 42 / 0.08);
      }

      .reportes-card-header {
        padding: 1rem 1rem 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .reportes-card-header h3 {
        margin: 0;
        color: var(--p-surface-900);
      }

      .reportes-card-header p {
        margin: 0.2rem 0 0;
        color: var(--p-surface-500);
        font-size: 0.88rem;
      }

      .reportes-card-icon {
        width: 2.3rem;
        height: 2.3rem;
        border-radius: 0.75rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--p-primary-700);
        background: color-mix(in srgb, var(--p-primary-100), white 40%);
        border: 1px solid var(--p-primary-200);
      }

      .reportes-chart {
        height: 22rem;
      }

      .reportes-chart--small {
        height: 20rem;
      }

      .reportes-summary {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
      }

      .reportes-kpi {
        border: 1px solid var(--p-surface-200);
        border-radius: 0.8rem;
        padding: 0.75rem;
        background: var(--p-surface-50);
      }

      .reportes-kpi span {
        color: var(--p-surface-500);
        font-size: 0.8rem;
      }

      .reportes-kpi strong {
        display: block;
        margin-top: 0.25rem;
        font-size: 1rem;
        color: var(--p-surface-900);
      }

      @media (max-width: 1024px) {
        .reportes-summary {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 768px) {
        .reportes-toolbar .p-toolbar {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .reportes-summary {
          grid-template-columns: 1fr;
        }

        .reportes-chart,
        .reportes-chart--small {
          height: 18rem;
        }
      }
    `,
  ],
})
export class ReportesComponent implements OnInit {
  private readonly api = inject(RentalApiService);
  private readonly messageService = inject(MessageService);

  public reportSummary: ReportsSummaryDTO | null = null;

  public ingresosMensualesData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ingresos',
        data: Array<number>(12).fill(0),
        borderRadius: 8,
        backgroundColor: '#3b82f6',
      },
      {
        label: 'Gastos',
        data: Array<number>(12).fill(0),
        borderRadius: 8,
        backgroundColor: '#ef4444',
      },
    ],
  };

  public morosidadPorZonaData = {
    labels: ['Saldado', 'Pendiente', 'Vencido'],
    datasets: [
      {
        data: [0, 0, 0],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        hoverBackgroundColor: ['#4ade80', '#fbbf24', '#f87171'],
      },
    ],
  };

  public ocupacionAnualData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ocupación %',
        data: Array<number>(12).fill(0),
        borderColor: '#14b8a6',
        backgroundColor: 'rgb(20 184 166 / 0.15)',
        pointBackgroundColor: '#0f766e',
        pointBorderColor: '#ffffff',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  public readonly defaultChartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#334155',
          usePointStyle: true,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
          drawBorder: false,
        },
      },
      y: {
        ticks: {
          color: '#64748b',
        },
        grid: {
          color: '#e2e8f0',
          drawBorder: false,
        },
      },
    },
  };

  public readonly donutChartOptions = {
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#334155',
          usePointStyle: true,
          padding: 16,
        },
      },
    },
  };

  public ngOnInit(): void {
    this.loadSummary();
  }

  public ingresoPromedioMensual(): number {
    const points = this.reportSummary?.incomeVsExpenses ?? [];
    if (points.length === 0) {
      return 0;
    }

    const totalIncome = points.reduce((acc, point) => acc + this.toNumber(point.income), 0);
    return totalIncome / points.length;
  }

  public morosidadTotalPorcentaje(): number {
    const status = this.reportSummary?.debtStatus;
    if (!status) {
      return 0;
    }
    const total = this.toNumber(status.total);
    if (total <= 0) {
      return 0;
    }
    const pendingAndOverdue = this.toNumber(status.pending) + this.toNumber(status.overdue);
    return (pendingAndOverdue / total) * 100;
  }

  public ocupacionPromedio(): number {
    const points = this.reportSummary?.occupancyRates ?? [];
    if (points.length === 0) {
      return 0;
    }
    const total = points.reduce((acc, point) => acc + this.toNumber(point.occupancyRate), 0);
    return total / points.length;
  }

  public proyeccionQ2(): number {
    const points = this.reportSummary?.incomeVsExpenses ?? [];
    const q2Months = [4, 5, 6];
    return points
      .filter((point) => q2Months.includes(point.month))
      .reduce((acc, point) => acc + this.toNumber(point.income) - this.toNumber(point.expenses), 0);
  }

  public async exportPdf(): Promise<void> {
    if (!this.reportSummary) {
      this.showError('No hay datos disponibles para exportar');
      return;
    }

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ]);

      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Reporte financiero', 14, 16);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, 14, 22);

      autoTable(doc, {
        startY: 28,
        head: [['Mes', 'Ingresos', 'Gastos', 'Ocupación %']],
        body: this.reportSummary.incomeVsExpenses.map((item) => {
          const occupancy = this.reportSummary?.occupancyRates.find((point) => point.month === item.month);
          return [
            this.monthLabel(item.month),
            this.currency(item.income),
            this.currency(item.expenses),
            `${this.toNumber(occupancy?.occupancyRate).toFixed(2)}%`,
          ];
        }),
      });

      const finalY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 40;
      doc.setFontSize(12);
      doc.text('Estado de deuda', 14, finalY + 12);
      doc.setFontSize(10);
      doc.text(`Saldado: ${this.currency(this.reportSummary.debtStatus.settled)}`, 14, finalY + 18);
      doc.text(`Pendiente: ${this.currency(this.reportSummary.debtStatus.pending)}`, 14, finalY + 24);
      doc.text(`Vencido: ${this.currency(this.reportSummary.debtStatus.overdue)}`, 14, finalY + 30);
      doc.text(`Tasa de recaudo: ${this.toNumber(this.reportSummary.debtStatus.collectionRate).toFixed(2)}%`, 14, finalY + 36);

      doc.save(`reporte-financiero-${new Date().toISOString().slice(0, 10)}.pdf`);
      this.messageService.add({
        severity: 'success',
        summary: 'Exportación completada',
        detail: 'PDF generado correctamente',
      });
    } catch {
      this.showError('No fue posible exportar el PDF');
    }
  }

  public async exportExcel(): Promise<void> {
    if (!this.reportSummary) {
      this.showError('No hay datos disponibles para exportar');
      return;
    }

    try {
      const XLSX = await import('xlsx');

      const monthlyRows = this.reportSummary.incomeVsExpenses.map((item) => {
        const occupancy = this.reportSummary?.occupancyRates.find((point) => point.month === item.month);
        return {
          Mes: this.monthLabel(item.month),
          Ingresos: this.toNumber(item.income),
          Gastos: this.toNumber(item.expenses),
          OcupacionPorcentaje: Number(this.toNumber(occupancy?.occupancyRate).toFixed(2)),
        };
      });

      const debtRows = [
        { Estado: 'Saldado', Monto: this.toNumber(this.reportSummary.debtStatus.settled) },
        { Estado: 'Pendiente', Monto: this.toNumber(this.reportSummary.debtStatus.pending) },
        { Estado: 'Vencido', Monto: this.toNumber(this.reportSummary.debtStatus.overdue) },
        { Estado: 'Total', Monto: this.toNumber(this.reportSummary.debtStatus.total) },
      ];

      const kpiRows = [
        { Indicador: 'Ingreso promedio mensual', Valor: Number(this.ingresoPromedioMensual().toFixed(2)) },
        { Indicador: 'Morosidad total (%)', Valor: Number(this.morosidadTotalPorcentaje().toFixed(2)) },
        { Indicador: 'Ocupación promedio (%)', Valor: Number(this.ocupacionPromedio().toFixed(2)) },
        { Indicador: 'Proyección Q2', Valor: Number(this.proyeccionQ2().toFixed(2)) },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(monthlyRows), 'Mensual');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(debtRows), 'Deudas');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(kpiRows), 'KPIs');

      XLSX.writeFile(workbook, `reporte-financiero-${new Date().toISOString().slice(0, 10)}.xlsx`);
      this.messageService.add({
        severity: 'success',
        summary: 'Exportación completada',
        detail: 'Excel generado correctamente',
      });
    } catch {
      this.showError('No fue posible exportar el Excel');
    }
  }

  private loadSummary(): void {
    const year = new Date().getFullYear();
    this.api.getReportsSummary(year).subscribe({
      next: (summary) => {
        this.reportSummary = summary;
        this.syncCharts(summary);
      },
      error: () => {
        this.showError('No se pudo cargar el resumen de reportes');
      },
    });
  }

  private syncCharts(summary: ReportsSummaryDTO): void {
    const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    this.ingresosMensualesData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Ingresos',
          data: monthLabels.map((_, index) => this.findMonth(summary.incomeVsExpenses, index + 1, 'income')),
          borderRadius: 8,
          backgroundColor: '#3b82f6',
        },
        {
          label: 'Gastos',
          data: monthLabels.map((_, index) => this.findMonth(summary.incomeVsExpenses, index + 1, 'expenses')),
          borderRadius: 8,
          backgroundColor: '#ef4444',
        },
      ],
    };

    this.morosidadPorZonaData = {
      labels: ['Saldado', 'Pendiente', 'Vencido'],
      datasets: [
        {
          data: [
            this.toNumber(summary.debtStatus?.settled),
            this.toNumber(summary.debtStatus?.pending),
            this.toNumber(summary.debtStatus?.overdue),
          ],
          backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
          hoverBackgroundColor: ['#4ade80', '#fbbf24', '#f87171'],
        },
      ],
    };

    this.ocupacionAnualData = {
      labels: monthLabels,
      datasets: [
        {
          label: 'Ocupación %',
          data: monthLabels.map((_, index) => this.findMonth(summary.occupancyRates, index + 1, 'occupancyRate')),
          borderColor: '#14b8a6',
          backgroundColor: 'rgb(20 184 166 / 0.15)',
          pointBackgroundColor: '#0f766e',
          pointBorderColor: '#ffffff',
          fill: true,
          tension: 0.35,
        },
      ],
    };
  }

  private findMonth<T extends { month: number }>(
    points: T[] | undefined,
    month: number,
    field: keyof Omit<T, 'month'>
  ): number {
    const point = points?.find((entry) => entry.month === month);
    return this.toNumber(point?.[field]);
  }

  private monthLabel(month: number): string {
    const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return labels[Math.max(0, Math.min(11, month - 1))];
  }

  private currency(value: unknown): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(this.toNumber(value));
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail,
    });
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
