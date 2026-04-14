import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ContratoDTO, DeudaDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class DeudasStore {
  private readonly api = inject(AdminApiService);

  private readonly _deudas = signal<DeudaDTO[]>([]);
  private readonly _contratos = signal<ContratoDTO[]>([]);
  private readonly _selectedDeuda = signal<DeudaDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly deudas = this._deudas.asReadonly();
  readonly contratos = this._contratos.asReadonly();
  readonly selectedDeuda = this._selectedDeuda.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._deudas().length);

  loadDeudas() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listPrestamos()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (deudas) => this._deudas.set(deudas),
        error: (error: { message?: string }) =>
          this._error.set(error?.message ?? 'No se pudieron cargar las deudas.'),
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

  loadDeudaById(id: number, handlers?: { onSuccess?: (deuda: DeudaDTO) => void; onError?: (error: unknown) => void }) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getPrestamoById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (deuda) => {
          this._selectedDeuda.set(deuda);
          handlers?.onSuccess?.(deuda);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar la deuda seleccionada.'));
          handlers?.onError?.(error);
        },
      });
  }

  createDeuda(dto: DeudaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .createPrestamo(dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (deuda) => {
          this._deudas.update((current) => [deuda, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear la deuda.'));
          handlers?.onError?.(error);
        },
      });
  }

  updateDeuda(id: number, dto: DeudaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .updatePrestamo(id, dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (deuda) => {
          this._deudas.update((current) => current.map((item) => (item.id === deuda.id ? deuda : item)));
          this._selectedDeuda.set(deuda);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar la deuda.'));
          handlers?.onError?.(error);
        },
      });
  }

  deleteDeuda(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deletePrestamo(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._deudas.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar la deuda.'));
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
