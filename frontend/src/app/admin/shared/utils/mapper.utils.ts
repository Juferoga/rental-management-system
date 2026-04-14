import {
  CasaApiResponse,
  CasaDTO,
  CasaPayload,
  ContratoApiResponse,
  ContratoDTO,
  ContratoPayload,
  DeudaDTO,
  PagoRentaApiResponse,
  PagoRentaDTO,
  PagoRentaPayload,
  PrestamoApiResponse,
  PrestamoPayload,
} from '../../../models/admin.models';

export function contratoDtoToPayload(dto: ContratoDTO): ContratoPayload {
  return {
    id: dto.id,
    fechaInicio: dto.fechaInicio,
    fechaFin: dto.fechaFin,
    montoMensual: dto.montoMensual,
    zona: { id: dto.zonaId },
    inquilino: { id: dto.inquilinoId },
  };
}

export function contratoApiToDto(response: ContratoApiResponse): ContratoDTO {
  const montoMensual = response.valorPactado ?? response.valorArriendo ?? response.montoMensual ?? 0;
  const zonaId = response.zonaHabitacional?.id ?? response.zona?.id ?? 0;
  const inquilinoId = response.inquilino?.id ?? response.inquilinoId ?? 0;
  const casaId = response.casa?.id ?? response.casaId ?? undefined;

  return {
    id: response.id,
    fechaInicio: response.fechaInicio,
    fechaFin: response.fechaFin,
    montoMensual,
    zonaId,
    inquilinoId,
    casaId,
  };
}

export function contratoApiListToDto(items: ContratoApiResponse[]): ContratoDTO[] {
  return items.map(contratoApiToDto);
}

export function casaDtoToPayload(dto: CasaDTO): CasaPayload {
  return {
    id: dto.id,
    nombre: dto.nombre,
    direccion: dto.direccion,
    barrio: dto.barrio,
    ciudad: dto.ciudad,
    estado: dto.estado,
    usuario: { id: dto.usuarioId },
  };
}

export function casaApiToDto(response: CasaApiResponse): CasaDTO {
  const direccion = response.identificacion ?? response.direccion ?? '';
  const usuarioId = response.usuario?.id ?? response.usuarioId ?? 0;
  const zonaHabitacionalId = response.zonaHabitacional?.id ?? response.zonaHabitacionalId ?? undefined;

  return {
    id: response.id,
    nombre: response.nombre,
    direccion,
    barrio: response.barrio,
    ciudad: response.ciudad,
    estado: response.estado,
    usuarioId,
    zonaHabitacionalId,
  };
}

export function casaApiListToDto(items: CasaApiResponse[]): CasaDTO[] {
  return items.map(casaApiToDto);
}

export function pagoRentaDtoToPayload(dto: PagoRentaDTO): PagoRentaPayload {
  return {
    id: dto.id,
    anio: dto.anio,
    mes: dto.mes,
    montoEsperado: dto.montoEsperado,
    montoPagado: dto.montoPagado,
    fechaPago: dto.fechaPago,
    metodoPago: dto.metodoPago,
    estado: dto.estado,
    contrato: { id: dto.contratoId },
  };
}

export function pagoRentaApiToDto(response: PagoRentaApiResponse): PagoRentaDTO {
  return {
    id: response.id,
    contratoId: response.contrato?.id ?? response.contratoId ?? 0,
    anio: response.anio,
    mes: response.mes,
    montoEsperado: response.montoEsperado,
    montoPagado: response.montoPagado,
    fechaPago: response.fechaPago,
    metodoPago: response.metodoPago,
    estado: response.estado,
  };
}

export function pagoRentaApiListToDto(items: PagoRentaApiResponse[]): PagoRentaDTO[] {
  return items.map(pagoRentaApiToDto);
}

export function deudaDtoToPayload(dto: DeudaDTO): PrestamoPayload {
  return {
    id: dto.id,
    fecha: dto.fecha,
    montoTotal: dto.montoTotal,
    saldoPendiente: dto.saldoPendiente,
    motivo: dto.motivo,
    estado: dto.estado,
    contrato: { id: dto.contratoId },
  };
}

export function prestamoApiToDto(response: PrestamoApiResponse): DeudaDTO {
  return {
    id: response.id,
    contratoId: response.contrato?.id ?? response.contratoId ?? 0,
    fecha: response.fecha,
    montoTotal: response.montoTotal,
    saldoPendiente: response.saldoPendiente,
    motivo: response.motivo,
    estado: response.estado,
  };
}

export function prestamoApiListToDto(items: PrestamoApiResponse[]): DeudaDTO[] {
  return items.map(prestamoApiToDto);
}
