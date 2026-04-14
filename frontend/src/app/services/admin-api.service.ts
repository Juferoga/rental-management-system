import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {
  CasaApiResponse,
  CasaDTO,
  CasaPayload,
  ContratoApiResponse,
  ContratoDTO,
  ContratoPayload,
  DeudaDTO,
  InquilinoDTO,
  PagoRentaApiResponse,
  PagoRentaDTO,
  PagoRentaPayload,
  PrestamoApiResponse,
  PrestamoPayload,
  ZonaDTO,
} from '../models/admin.models';
import {
  casaApiListToDto,
  casaApiToDto,
  casaDtoToPayload,
  deudaDtoToPayload,
  contratoApiListToDto,
  contratoApiToDto,
  contratoDtoToPayload,
  pagoRentaApiListToDto,
  pagoRentaApiToDto,
  pagoRentaDtoToPayload,
  prestamoApiListToDto,
  prestamoApiToDto,
} from '../admin/shared/utils/mapper.utils';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly api = '/api/v1';

  listZonas() {
    return this.http.get<ZonaDTO[]>(`${this.api}/zonas`);
  }

  getZonaById(id: number) {
    return this.http.get<ZonaDTO>(`${this.api}/zonas/${id}`);
  }

  createZona(payload: ZonaDTO) {
    return this.http.post<ZonaDTO>(`${this.api}/zonas`, payload);
  }

  updateZona(id: number, payload: ZonaDTO) {
    return this.http.put<ZonaDTO>(`${this.api}/zonas/${id}`, payload);
  }

  deleteZona(id: number) {
    return this.http.delete<void>(`${this.api}/zonas/${id}`);
  }

  listInquilinos() {
    return this.http.get<InquilinoDTO[]>(`${this.api}/inquilinos`);
  }

  getInquilinoById(id: number) {
    return this.http.get<InquilinoDTO>(`${this.api}/inquilinos/${id}`);
  }

  createInquilino(payload: InquilinoDTO) {
    return this.http.post<InquilinoDTO>(`${this.api}/inquilinos`, payload);
  }

  updateInquilino(id: number, payload: InquilinoDTO) {
    return this.http.put<InquilinoDTO>(`${this.api}/inquilinos/${id}`, payload);
  }

  deleteInquilino(id: number) {
    return this.http.delete<void>(`${this.api}/inquilinos/${id}`);
  }

  listContratos() {
    return this.http
      .get<ContratoApiResponse[]>(`${this.api}/contratos`)
      .pipe(map((items) => contratoApiListToDto(items)));
  }

  getContratoById(id: number) {
    return this.http
      .get<ContratoApiResponse>(`${this.api}/contratos/${id}`)
      .pipe(map((item) => contratoApiToDto(item)));
  }

  createContrato(dto: ContratoDTO) {
    return this.createContratoPayload(contratoDtoToPayload(dto));
  }

  updateContrato(id: number, dto: ContratoDTO) {
    return this.updateContratoPayload(id, contratoDtoToPayload(dto));
  }

  createContratoPayload(payload: ContratoPayload) {
    return this.http
      .post<ContratoApiResponse>(`${this.api}/contratos`, payload)
      .pipe(map((item) => contratoApiToDto(item)));
  }

  updateContratoPayload(id: number, payload: ContratoPayload) {
    return this.http
      .put<ContratoApiResponse>(`${this.api}/contratos/${id}`, payload)
      .pipe(map((item) => contratoApiToDto(item)));
  }

  deleteContrato(id: number) {
    return this.http.delete<void>(`${this.api}/contratos/${id}`);
  }

  listCasas() {
    return this.http
      .get<CasaApiResponse[]>(`${this.api}/casas`)
      .pipe(map((items) => casaApiListToDto(items)));
  }

  getCasaById(id: number) {
    return this.http
      .get<CasaApiResponse>(`${this.api}/casas/${id}`)
      .pipe(map((item) => casaApiToDto(item)));
  }

  createCasa(dto: CasaDTO) {
    return this.createCasaPayload(casaDtoToPayload(dto));
  }

  updateCasa(id: number, dto: CasaDTO) {
    return this.updateCasaPayload(id, casaDtoToPayload(dto));
  }

  createCasaPayload(payload: CasaPayload) {
    return this.http
      .post<CasaApiResponse>(`${this.api}/casas`, payload)
      .pipe(map((item) => casaApiToDto(item)));
  }

  updateCasaPayload(id: number, payload: CasaPayload) {
    return this.http
      .put<CasaApiResponse>(`${this.api}/casas/${id}`, payload)
      .pipe(map((item) => casaApiToDto(item)));
  }

  deleteCasa(id: number) {
    return this.http.delete<void>(`${this.api}/casas/${id}`);
  }

  listPagosRenta() {
    return this.http
      .get<PagoRentaApiResponse[]>(`${this.api}/pagos-renta`)
      .pipe(map((items) => pagoRentaApiListToDto(items)));
  }

  getPagoRentaById(id: number) {
    return this.http
      .get<PagoRentaApiResponse>(`${this.api}/pagos-renta/${id}`)
      .pipe(map((item) => pagoRentaApiToDto(item)));
  }

  createPagoRenta(dto: PagoRentaDTO) {
    return this.createPagoRentaPayload(pagoRentaDtoToPayload(dto));
  }

  updatePagoRenta(id: number, dto: PagoRentaDTO) {
    return this.updatePagoRentaPayload(id, pagoRentaDtoToPayload(dto));
  }

  createPagoRentaPayload(payload: PagoRentaPayload) {
    return this.http
      .post<PagoRentaApiResponse>(`${this.api}/pagos-renta`, payload)
      .pipe(map((item) => pagoRentaApiToDto(item)));
  }

  updatePagoRentaPayload(id: number, payload: PagoRentaPayload) {
    return this.http
      .put<PagoRentaApiResponse>(`${this.api}/pagos-renta/${id}`, payload)
      .pipe(map((item) => pagoRentaApiToDto(item)));
  }

  deletePagoRenta(id: number) {
    return this.http.delete<void>(`${this.api}/pagos-renta/${id}`);
  }

  listPrestamos() {
    return this.http
      .get<PrestamoApiResponse[]>(`${this.api}/prestamos`)
      .pipe(map((items) => prestamoApiListToDto(items)));
  }

  getPrestamoById(id: number) {
    return this.http
      .get<PrestamoApiResponse>(`${this.api}/prestamos/${id}`)
      .pipe(map((item) => prestamoApiToDto(item)));
  }

  createPrestamo(dto: DeudaDTO) {
    return this.createPrestamoPayload(deudaDtoToPayload(dto));
  }

  updatePrestamo(id: number, dto: DeudaDTO) {
    return this.updatePrestamoPayload(id, deudaDtoToPayload(dto));
  }

  createPrestamoPayload(payload: PrestamoPayload) {
    return this.http
      .post<PrestamoApiResponse>(`${this.api}/prestamos`, payload)
      .pipe(map((item) => prestamoApiToDto(item)));
  }

  updatePrestamoPayload(id: number, payload: PrestamoPayload) {
    return this.http
      .put<PrestamoApiResponse>(`${this.api}/prestamos/${id}`, payload)
      .pipe(map((item) => prestamoApiToDto(item)));
  }

  deletePrestamo(id: number) {
    return this.http.delete<void>(`${this.api}/prestamos/${id}`);
  }
}
