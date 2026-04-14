import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CalendarMonthDTO,
  CreditsSummaryDTO,
  DashboardAlertsDTO,
  GlobalSearchResult,
  MenuTreeDTO,
  OwnerDebtDetailDTO,
  RentListDTO,
  RentCalendarDetailDTO,
  ServiceListDTO,
  ServiceDetailDTO,
  Zone,
} from '../models/rental.models';

@Injectable({ providedIn: 'root' })
export class RentalApiService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';

  getDashboardAlerts() {
    return this.http.get<DashboardAlertsDTO>(`${this.api}/dashboard/alerts`);
  }

  search(q: string) {
    return this.http.get<GlobalSearchResult[]>(`${this.api}/search`, {
      params: { q },
    });
  }

  getMenuTree() {
    return this.http.get<MenuTreeDTO>(`${this.api}/menu/tree`);
  }

  listZones() {
    return this.http.get<Zone[]>(`${this.api}/zonas`);
  }

  getRentDetailByPeriod(zoneId: number, year: number, month: number) {
    return this.http.get<RentCalendarDetailDTO>(`${this.api}/arriendos/${zoneId}/detalle`, {
      params: { year, month },
    });
  }

  getRentList() {
    return this.http.get<RentListDTO[]>(`${this.api}/arriendos/list`);
  }

  getServiceDetail(zoneId: number, year: number, month: number) {
    return this.http.get<ServiceDetailDTO>(`${this.api}/servicios/${zoneId}/detalle`, {
      params: { year, month },
    });
  }

  getServiceList() {
    return this.http.get<ServiceListDTO[]>(`${this.api}/servicios/list`);
  }

  getCreditsSummary() {
    return this.http.get<CreditsSummaryDTO>(`${this.api}/creditos`);
  }

  getDebtDetail(id: string) {
    return this.http.get<OwnerDebtDetailDTO>(`${this.api}/creditos/${id}`);
  }

  getCalendarMonth(year: number, month: number, zoneId?: number) {
    const params: Record<string, string | number> = { year, month };
    if (typeof zoneId === 'number' && Number.isFinite(zoneId) && zoneId > 0) {
      params['zoneId'] = zoneId;
    }

    return this.http.get<CalendarMonthDTO>(`${this.api}/calendar`, {
      params,
    });
  }
}
