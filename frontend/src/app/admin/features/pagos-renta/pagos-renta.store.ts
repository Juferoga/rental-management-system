import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ContratoDTO, PagoRentaDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class PagosRentaStore {
  private readonly api = inject(AdminApiService);

  private readonly _pagosRenta = signal<PagoRentaDTO[]>([]);
  private readonly _contratos = signal<ContratoDTO[]>([]);
  private readonly _selectedPagoRenta = signal<PagoRentaDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly pagosRenta = this._pagosRenta.asReadonly();
  readonly contratos = this._contratos.asReadonly();
  readonly selectedPagoRenta = this._selectedPagoRenta.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._pagosRenta().length);

  loadPagosRenta() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listPagosRenta()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (pagosRenta) => this._pagosRenta.set(pagosRenta),
        error: (error: { message?: string }) =>
          this._error.set(error?.message ?? 'No se pudieron cargar los pagos de renta.'),
      });
  }

  loadCatalogs() {
    this.api.listContratos().subscribe({
      next: (contratos) => this._contratos.set(contratos),
      error: (error) => {
        this._error.set(readErrorMessage(error, 'No se pudieron cargar los contratos disponibles.'));
      },
    });
  }

  loadPagoRentaById(
    id: number,
    handlers?: { onSuccess?: (pagoRenta: PagoRentaDTO) => void; onError?: (error: unknown) => void },
  ) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getPagoRentaById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (pagoRenta) => {
          this._selectedPagoRenta.set(pagoRenta);
          handlers?.onSuccess?.(pagoRenta);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar el pago de renta seleccionado.'));
          handlers?.onError?.(error);
        },
      });
  }

  createPagoRenta(dto: PagoRentaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .createPagoRenta(dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (pagoRenta) => {
          this._pagosRenta.update((current) => [pagoRenta, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear el pago de renta.'));
          handlers?.onError?.(error);
        },
      });
  }

  updatePagoRenta(id: number, dto: PagoRentaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .updatePagoRenta(id, dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (pagoRenta) => {
          this._pagosRenta.update((current) => current.map((item) => (item.id === pagoRenta.id ? pagoRenta : item)));
          this._selectedPagoRenta.set(pagoRenta);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar el pago de renta.'));
          handlers?.onError?.(error);
        },
      });
  }

  deletePagoRenta(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deletePagoRenta(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._pagosRenta.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar el pago de renta.'));
          handlers?.onError?.(error);
        },
      });
  }
}

function readErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback;
}
