import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { RentCalendarDetailDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

type RentDetail = RentCalendarDetailDTO;

interface TimelinePeriod {
  year: number;
  month: number;
  status: string;
  statusIcon: string;
}

@Component({
  selector: 'app-arriendos-detail',
  standalone: true,
  imports: [CommonModule, TimelineModule, CardModule, TagModule],
  template: `
    @if (notFound()) {
      <p-card styleClass="empty-state-card">
        <h3 class="empty-title">Zona no encontrada</h3>
        <p class="empty-text">No pudimos cargar el detalle de este arriendo.</p>
      </p-card>
    } @else {
      <div class="timeline-layout">
        <section class="timeline-panel">
          <p-card styleClass="timeline-card">
            <ng-template pTemplate="header">
              <div class="panel-header">
                <div>
                  <p class="kicker">Historial</p>
                  <h3>Línea de tiempo mensual</h3>
                </div>
                @if (activeDetail(); as model) {
                  <p-tag severity="info" icon="pi pi-home" [value]="model.zoneName"></p-tag>
                }
              </div>
            </ng-template>

            <p-timeline [value]="timelineMonths()" align="left" styleClass="rent-timeline">
              <ng-template pTemplate="marker" let-period>
                <span class="timeline-dot" [ngClass]="statusClass(period.statusIcon)">
                  <i class="pi" [ngClass]="iconClass(period.statusIcon)"></i>
                </span>
              </ng-template>

              <ng-template pTemplate="content" let-period>
                <button
                  type="button"
                  class="timeline-node"
                  [class.timeline-node--active]="isSelected(period)"
                  (click)="onMonthClick(period)"
                >
                  <span class="month-label">{{ formatPeriod(period.year, period.month) }}</span>
                  <small>{{ period.status }}</small>
                </button>
              </ng-template>
            </p-timeline>
          </p-card>
        </section>

        <section class="detail-panel">
          @if (activeDetail(); as model) {
            <p-card styleClass="detail-card">
              <ng-template pTemplate="header">
                <div class="panel-header panel-header--detail">
                  <div>
                    <p class="kicker">Detalle activo</p>
                    <h3>{{ formatPeriod(model.year, model.month) }}</h3>
                  </div>
                  <p-tag
                    [icon]="iconClass(model.statusIcon)"
                    [value]="model.status"
                    [severity]="resolveStatusSeverity(model.statusIcon)"
                  ></p-tag>
                </div>
              </ng-template>

              <div class="detail-grid">
                <article class="detail-item">
                  <i class="pi pi-user"></i>
                  <div>
                    <h4>Inquilino</h4>
                    <p>{{ model.tenantName }}</p>
                  </div>
                </article>

                <article class="detail-item detail-item--money">
                  <i class="pi pi-wallet"></i>
                  <div>
                    <h4>Valor mensual</h4>
                    <p>{{ model.rentValue | number:'1.0-0' }}</p>
                  </div>
                </article>

                <article class="detail-item">
                  <i class="pi pi-map-marker"></i>
                  <div>
                    <h4>Zona</h4>
                    <p>{{ model.zoneName }}</p>
                  </div>
                </article>

                <article class="detail-item">
                  <i class="pi pi-calendar"></i>
                  <div>
                    <h4>Periodo</h4>
                    <p>{{ model.month }}/{{ model.year }}</p>
                  </div>
                </article>
              </div>
            </p-card>
          } @else {
            <p-card styleClass="detail-card detail-card--placeholder">
              <h3>Seleccioná un mes para ver el detalle</h3>
              <p>Elegí un punto en la línea de tiempo para cargar la información del periodo.</p>
            </p-card>
          }
        </section>
      </div>
    }
  `,
  styles: [
    `
      .timeline-layout {
        display: grid;
        grid-template-columns: 340px minmax(0, 1fr);
        gap: 1rem;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75rem;
        padding: 1rem 1rem 0;
      }

      .panel-header h3 {
        margin: 0;
      }

      .kicker {
        margin: 0;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--text-color-secondary, #64748b);
      }

      .timeline-node {
        border: 1px solid var(--surface-border, #dbe3eb);
        background: var(--surface-card, #ffffff);
        border-radius: 10px;
        width: 100%;
        text-align: left;
        padding: 0.65rem 0.85rem;
        display: grid;
        gap: 0.25rem;
        cursor: pointer;
        transition: all 160ms ease;
      }

      .timeline-node:hover {
        border-color: var(--primary-color, #4f46e5);
        transform: translateY(-1px);
      }

      .timeline-node--active {
        border-color: var(--primary-color, #4f46e5);
        box-shadow: 0 0 0 1px color-mix(in srgb, var(--primary-color, #4f46e5) 35%, transparent);
      }

      .month-label {
        font-weight: 600;
      }

      .timeline-dot {
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }

      .status-check {
        background: #16a34a;
      }

      .status-warning {
        background: #d97706;
      }

      .status-times {
        background: #dc2626;
      }

      .status-minus {
        background: #475569;
      }

      .detail-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.85rem;
      }

      .detail-item {
        display: flex;
        gap: 0.65rem;
        align-items: flex-start;
        padding: 0.75rem;
        border-radius: 10px;
        background: color-mix(in srgb, var(--surface-ground, #f8fafc) 70%, #fff);
      }

      .detail-item i {
        font-size: 1.1rem;
        color: var(--primary-color, #4f46e5);
      }

      .detail-item h4 {
        margin: 0;
        font-size: 0.8rem;
        color: var(--text-color-secondary, #64748b);
      }

      .detail-item p {
        margin: 0.1rem 0 0;
        font-weight: 600;
      }

      .detail-item--money p {
        color: #16a34a;
      }

      .empty-title {
        margin: 0;
      }

      .empty-text {
        margin: 0.4rem 0 0;
      }

      @media (max-width: 992px) {
        .timeline-layout {
          grid-template-columns: 1fr;
        }

        .detail-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ArriendosDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(RentalApiService);

  readonly selectedPeriod = signal<{ year: number; month: number } | null>(null);
  readonly activeDetail = signal<RentDetail | null>(null);
  readonly notFound = signal(false);

  private readonly rentId = Number(this.route.snapshot.paramMap.get('id'));
  private readonly detailCache = new Map<string, RentDetail>();
  private readonly timelinePeriods = signal<TimelinePeriod[]>([]);

  readonly timelineMonths = computed(() =>
    [...this.timelinePeriods()].sort((a, b) => a.year - b.year || a.month - b.month)
  );

  constructor() {
    if (!Number.isFinite(this.rentId) || this.rentId <= 0) {
      this.notFound.set(true);
      return;
    }

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    this.loadDetail(this.rentId, year, month);
  }

  onMonthClick(period: { year: number; month: number }) {
    this.selectedPeriod.set({ year: period.year, month: period.month });
    const cacheKey = this.getCacheKey(period.year, period.month);

    if (this.detailCache.has(cacheKey)) {
      this.notFound.set(false);
      this.activeDetail.set(this.detailCache.get(cacheKey) ?? null);
      return;
    }

    this.loadDetail(this.rentId, period.year, period.month);
  }

  isSelected(period: { year: number; month: number }) {
    const selected = this.selectedPeriod();
    return selected?.year === period.year && selected.month === period.month;
  }

  private loadDetail(id: number, year: number, month: number) {
    this.api.getRentDetailByPeriod(id, year, month).subscribe({
      next: (value) => {
        this.notFound.set(false);
        const cacheKey = this.getCacheKey(value.year, value.month);
        this.detailCache.set(cacheKey, value);
        this.activeDetail.set(value);
        this.selectedPeriod.set({ year: value.year, month: value.month });
        this.hydrateTimeline(value.months);
      },
      error: () => {
        this.notFound.set(true);
        this.activeDetail.set(null);
      },
    });
  }

  private hydrateTimeline(months: TimelinePeriod[]) {
    if (!Array.isArray(months) || months.length === 0) {
      this.timelinePeriods.set([]);
      return;
    }

    const deduped = new Map<string, TimelinePeriod>();
    for (const month of months) {
      deduped.set(this.getCacheKey(month.year, month.month), month);
    }
    this.timelinePeriods.set([...deduped.values()]);
  }

  private getCacheKey(year: number, month: number) {
    return `${year}-${month}`;
  }

  formatPeriod(year: number, month: number) {
    const date = new Date(year, Math.max(month - 1, 0), 1);
    const monthLabel = new Intl.DateTimeFormat('es-CO', { month: 'long' }).format(date);
    return `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)} ${year}`;
  }

  iconClass(icon: string) {
    return {
      check: 'pi-check-circle',
      warning: 'pi-exclamation-triangle',
      times: 'pi-times-circle',
      minus: 'pi-minus-circle',
    }[icon] ?? 'pi-minus-circle';
  }

  statusClass(icon: string) {
    return {
      check: 'status-check',
      warning: 'status-warning',
      times: 'status-times',
      minus: 'status-minus',
    }[icon] ?? 'status-minus';
  }

  resolveStatusSeverity(icon: string): 'success' | 'warn' | 'danger' | 'secondary' {
    return {
      check: 'success',
      warning: 'warn',
      times: 'danger',
      minus: 'secondary',
    }[icon] as 'success' | 'warn' | 'danger' | 'secondary' ?? 'secondary';
  }
}
