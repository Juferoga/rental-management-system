export interface ZonaDTO {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  disponible: boolean;
}

export interface InquilinoDTO {
  id?: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  direccion?: string | null;
}

export interface ContratoDTO {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  montoMensual: number;
  zonaId: number;
  inquilinoId: number;
  casaId?: number;
}

export interface CasaDTO {
  id?: number;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  estado: string;
  usuarioId: number;
  zonaHabitacionalId?: number;
}

export interface PagoRentaDTO {
  id?: number;
  contratoId: number;
  anio: number;
  mes: number;
  montoEsperado: number;
  montoPagado?: number | null;
  fechaPago?: string | null;
  metodoPago?: string | null;
  estado?: string | null;
}

export interface DeudaDTO {
  id?: number;
  contratoId: number;
  fecha: string;
  montoTotal: number;
  saldoPendiente: number;
  motivo?: string | null;
  estado?: string | null;
}

export interface EntityRefPayload {
  id: number;
}

export interface ContratoPayload {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  montoMensual: number;
  zona: EntityRefPayload;
  inquilino: EntityRefPayload;
}

export interface CasaPayload {
  id?: number;
  nombre: string;
  direccion: string;
  barrio: string;
  ciudad: string;
  estado: string;
  usuario: EntityRefPayload;
}

export interface PagoRentaPayload {
  id?: number;
  anio: number;
  mes: number;
  montoEsperado: number;
  montoPagado?: number | null;
  fechaPago?: string | null;
  metodoPago?: string | null;
  estado?: string | null;
  contrato: EntityRefPayload;
}

export interface PrestamoPayload {
  id?: number;
  fecha: string;
  montoTotal: number;
  saldoPendiente: number;
  motivo?: string | null;
  estado?: string | null;
  contrato: EntityRefPayload;
}

export interface ContratoApiResponse {
  id?: number;
  fechaInicio: string;
  fechaFin: string;
  montoMensual?: number | null;
  valorPactado?: number | null;
  valorArriendo?: number | null;
  zona?: EntityRefPayload | null;
  zonaHabitacional?: EntityRefPayload | null;
  casa?: EntityRefPayload | null;
  casaId?: number | null;
  inquilino?: EntityRefPayload | null;
  inquilinoId?: number | null;
}

export interface CasaApiResponse {
  id?: number;
  nombre: string;
  direccion?: string | null;
  identificacion?: string | null;
  barrio: string;
  ciudad: string;
  estado: string;
  usuario?: EntityRefPayload | null;
  usuarioId?: number | null;
  zonaHabitacional?: EntityRefPayload | null;
  zonaHabitacionalId?: number | null;
}

export interface PagoRentaApiResponse {
  id?: number;
  anio: number;
  mes: number;
  montoEsperado: number;
  montoPagado?: number | null;
  fechaPago?: string | null;
  metodoPago?: string | null;
  estado?: string | null;
  contrato?: EntityRefPayload | null;
  contratoId?: number | null;
}

export interface PrestamoApiResponse {
  id?: number;
  fecha: string;
  montoTotal: number;
  saldoPendiente: number;
  motivo?: string | null;
  estado?: string | null;
  contrato?: EntityRefPayload | null;
  contratoId?: number | null;
}

export interface AdminFieldError {
  field: string;
  message: string;
}

export interface AdminApiError {
  status: number;
  message: string;
  fieldErrors: AdminFieldError[];
  details?: unknown;
}
