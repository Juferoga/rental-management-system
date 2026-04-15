export interface GlobalSearchResult {
  type: string;
  title: string;
  subtitle: string;
  url: string;
}

export interface MenuTreeZoneDTO {
  id?: number | string;
  nombre?: string;
  name?: string;
  label?: string;
}

export interface MenuTreeHouseDTO {
  id?: number | string;
  nombre?: string;
  name?: string;
  label?: string;
  zonas?: MenuTreeZoneDTO[];
  zones?: MenuTreeZoneDTO[];
  children?: MenuTreeZoneDTO[];
}

export interface MenuTreeDTO {
  arriendos?: MenuTreeHouseDTO[];
  servicios?: MenuTreeHouseDTO[];
}

export interface DashboardAlertsDTO {
  earnings?: {
    collected?: number;
    recolected?: number;
    recolectado?: number;
    paid?: number;
    pending?: number;
    pendiente?: number;
    unpaid?: number;
  };
  debts: {
    id: string;
    type: 'DEBT' | 'CREDIT_CARD' | 'LOAN' | 'OTHER';
    referenceId: number;
    referenceType: 'RENT' | 'DEBT';
    description: string;
    amount: number;
    dueDate: string;
    status?: string;
    paid?: boolean;
    pendingAmount?: number;
  }[];
  rents: {
    zoneId: string;
    referenceId: number;
    referenceType: 'RENT' | 'DEBT';
    tenantName: string;
    value: number;
    cutoffDate: string;
  }[];
  services?: {
    total?: number;
    paid?: number;
    pending?: number;
  };
}

export interface ReportsSummaryDTO {
  occupancyRates: {
    month: number;
    occupiedZones: number;
    totalZones: number;
    occupancyRate: number;
  }[];
  incomeVsExpenses: {
    month: number;
    income: number;
    expenses: number;
  }[];
  debtStatus: {
    settled: number;
    pending: number;
    overdue: number;
    total: number;
    collectionRate: number;
  };
  generatedAt: string;
}

export interface CalendarEventDTO {
  date?: string;
  dueDate?: string;
  day?: number;
  type?: string;
  category?: string;
  kind?: string;
  count?: number;
  total?: number;
  amount?: number;
}

export interface CalendarMonthDTO {
  year?: number;
  month?: number;
  events?: CalendarEventDTO[];
  items?: CalendarEventDTO[];
  rentsDue?: CalendarEventDTO[];
  servicesDue?: CalendarEventDTO[];
  debtsDue?: CalendarEventDTO[];
  days?: Record<string, unknown>;
}

export interface Zone {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
  valorArriendo: number;
}

export interface RentListDTO {
  id: number;
  zoneName: string;
  tenantName: string;
  amount: number;
  status: string;
  date: string;
}

export interface ServiceListDTO {
  id: number;
  zoneName: string;
  tenantName: string;
  amount: number;
  status: string;
  date: string;
}

export interface RentCalendarDetailDTO {
  zoneId: number;
  zoneName: string;
  year: number;
  month: number;
  tenantName: string;
  rentValue: number;
  status: string;
  statusIcon: 'check' | 'warning' | 'times' | 'minus' | string;
  months: {
    year: number;
    month: number;
    status: string;
    statusIcon: string;
  }[];
  payments?: RentPaymentDetailDTO[];
}

export type PaymentType = 'NEQUI' | 'DAVIPLATA' | 'EFECTIVO';

export interface RentPaymentDetailDTO {
  id: number;
  estado: string;
  tipoPago: PaymentType | string;
  montoEsperado: number;
  montoPagado: number;
  fechaPago: string | null;
}

export interface ServiceDetailDTO {
  address: string;
  totalValue: number;
  services: {
    responsible: string;
    value: number;
    type: 'LIGHT' | 'WATER' | 'GAS' | 'OTHER';
    status: string;
    isShared: boolean;
    marker: string;
  }[];
}

export interface CreditsSummaryDTO {
  creditCards: CreditItemDTO[];
  loans: CreditItemDTO[];
  others: CreditItemDTO[];
}

export interface CreditItemDTO {
  id: string;
  description: string;
  pendingAmount: number;
  status: string;
}

export interface OwnerDebtDetailDTO {
  id: string;
  ownerId: number;
  type: string;
  description: string;
  totalAmount: number;
  pendingAmount: number;
  cutoffDate: string;
  dueDate: string;
  status: string;
  creditCardId: number | null;
}
