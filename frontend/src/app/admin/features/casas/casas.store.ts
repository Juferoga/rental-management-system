import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { CasaDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class CasasStore {
  private readonly api = inject(AdminApiService);

  private readonly _casas = signal<CasaDTO[]>([]);
  private readonly _selectedCasa = signal<CasaDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly casas = this._casas.asReadonly();
  readonly selectedCasa = this._selectedCasa.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._casas().length);

  loadCasas() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listCasas()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (casas) => this._casas.set(casas),
        error: (error: { message?: string }) => this._error.set(error?.message ?? 'No se pudieron cargar las casas.'),
      });
  }

  loadCasaById(id: number, handlers?: { onSuccess?: (casa: CasaDTO) => void; onError?: (error: unknown) => void }) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getCasaById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (casa) => {
          this._selectedCasa.set(casa);
          handlers?.onSuccess?.(casa);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar la casa seleccionada.'));
          handlers?.onError?.(error);
        },
      });
  }

  createCasa(dto: CasaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .createCasa(dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (casa) => {
          this._casas.update((current) => [casa, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear la casa.'));
          handlers?.onError?.(error);
        },
      });
  }

  updateCasa(id: number, dto: CasaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .updateCasa(id, dto)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (casa) => {
          this._casas.update((current) => current.map((item) => (item.id === casa.id ? casa : item)));
          this._selectedCasa.set(casa);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar la casa.'));
          handlers?.onError?.(error);
        },
      });
  }

  deleteCasa(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deleteCasa(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._casas.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar la casa.'));
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
