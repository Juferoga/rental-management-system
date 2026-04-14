import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CalendarEventDTO, CalendarMonthDTO } from '../../models/rental.models';
import { RentalApiService } from '../../services/rental-api.service';

type DayType = 'rent' | 'service' | 'debt';

interface DayCell {
  date: Date;
  dayNumber: number;
  inCurrentMonth: boolean;
  counts: Record<DayType, number>;
}

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './calendario.component.html',
})
export class CalendarioComponent implements OnInit, OnChanges {
  private readonly api = inject(RentalApiService);
  private readonly route = inject(ActivatedRoute);

  @Input() zoneId?: number;

  readonly monthCursor = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly calendarData = signal<CalendarMonthDTO | null>(null);

  readonly loading = signal(false);
  readonly error = signal(false);

  readonly monthLabel = computed(() => {
    const value = this.monthCursor();
    return value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
  });

  readonly weeks = computed(() => this.buildWeeks());

  ngOnInit() {
    this.loadMonth();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['zoneId'] && !changes['zoneId'].firstChange) {
      this.loadMonth();
    }
  }

  prevMonth() {
    this.shiftMonth(-1);
  }

  nextMonth() {
    this.shiftMonth(1);
  }

  private shiftMonth(delta: number) {
    const current = this.monthCursor();
    this.monthCursor.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
    this.loadMonth();
  }

  private loadMonth() {
    const current = this.monthCursor();
    const year = current.getFullYear();
    const month = current.getMonth() + 1;

    this.loading.set(true);
    this.error.set(false);

    this.api.getCalendarMonth(year, month, this.resolveZoneId()).subscribe({
      next: (value) => {
        this.calendarData.set(value ?? { year, month, events: [] });
        this.loading.set(false);
      },
      error: () => {
        this.calendarData.set({ year, month, events: [] });
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private buildWeeks() {
    const cursor = this.monthCursor();
    const year = cursor.getFullYear();
    const month = cursor.getMonth();

    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const startDate = new Date(year, month, 1 - startOffset);

    const dayMap = this.buildDayMap(this.calendarData());

    const cells: DayCell[] = [];
    for (let index = 0; index < 42; index += 1) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + index);
      const key = this.dateKey(date);
      cells.push({
        date,
        dayNumber: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
        counts: dayMap.get(key) ?? { rent: 0, service: 0, debt: 0 },
      });
    }

    const weeks: DayCell[][] = [];
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7));
    }
    return weeks;
  }

  private buildDayMap(payload: CalendarMonthDTO | null) {
    const map = new Map<string, Record<DayType, number>>();

    const merged = [
      ...(payload?.events ?? []),
      ...(payload?.items ?? []),
      ...(payload?.rentsDue ?? []).map((item) => ({ ...item, type: 'RENT' })),
      ...(payload?.servicesDue ?? []).map((item) => ({ ...item, type: 'SERVICE' })),
      ...(payload?.debtsDue ?? []).map((item) => ({ ...item, type: 'DEBT' })),
    ];

    for (const raw of merged) {
      const normalized = this.normalizeEvent(raw, payload);
      if (!normalized) {
        continue;
      }
      const current = map.get(normalized.dateKey) ?? { rent: 0, service: 0, debt: 0 };
      current[normalized.kind] += normalized.count;
      map.set(normalized.dateKey, current);
    }

    return map;
  }

  private normalizeEvent(raw: CalendarEventDTO, payload: CalendarMonthDTO | null) {
    const kind = this.resolveType(raw);
    if (!kind) {
      return null;
    }

    const count = this.resolveCount(raw);
    const date = this.resolveDate(raw, payload);
    if (!date) {
      return null;
    }

    return {
      kind,
      count,
      dateKey: this.dateKey(date),
    };
  }

  private resolveDate(raw: CalendarEventDTO, payload: CalendarMonthDTO | null) {
    if (raw.date || raw.dueDate) {
      const parsed = new Date(raw.date ?? raw.dueDate ?? '');
      if (!Number.isNaN(parsed.getTime())) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
    }

    if (typeof raw.day === 'number') {
      const year = payload?.year ?? this.monthCursor().getFullYear();
      const month = (payload?.month ?? this.monthCursor().getMonth() + 1) - 1;
      return new Date(year, month, raw.day);
    }

    return null;
  }

  private resolveType(raw: CalendarEventDTO): DayType | null {
    const type = String(raw.type ?? raw.category ?? raw.kind ?? '').toLowerCase();

    if (type.includes('rent') || type.includes('arriendo')) {
      return 'rent';
    }
    if (type.includes('service') || type.includes('servicio')) {
      return 'service';
    }
    if (type.includes('debt') || type.includes('deuda') || type.includes('credit')) {
      return 'debt';
    }

    return null;
  }

  private resolveCount(raw: CalendarEventDTO) {
    const count = Number(raw.count ?? raw.total ?? raw.amount ?? 1);
    if (!Number.isFinite(count) || count < 0) {
      return 1;
    }
    return Math.max(1, Math.trunc(count));
  }

  private dateKey(date: Date) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private resolveZoneId() {
    if (typeof this.zoneId === 'number' && Number.isFinite(this.zoneId) && this.zoneId > 0) {
      return this.zoneId;
    }

    for (const snapshot of this.route.snapshot.pathFromRoot) {
      const rawId = snapshot.paramMap.get('id');
      if (!rawId) {
        continue;
      }
      const parsed = Number(rawId);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }

    return undefined;
  }
}
