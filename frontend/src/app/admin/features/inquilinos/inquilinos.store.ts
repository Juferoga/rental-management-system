import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { InquilinoDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class InquilinosStore {
  private readonly api = inject(AdminApiService);

  private readonly _inquilinos = signal<InquilinoDTO[]>([]);
  private readonly _selectedInquilino = signal<InquilinoDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly inquilinos = this._inquilinos.asReadonly();
  readonly selectedInquilino = this._selectedInquilino.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._inquilinos().length);

  loadInquilinos() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listInquilinos()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (inquilinos) => this._inquilinos.set(inquilinos),
        error: (error: { message?: string }) =>
          this._error.set(error?.message ?? 'No se pudieron cargar los inquilinos.'),
      });
  }

  loadInquilinoById(
    id: number,
    handlers?: { onSuccess?: (inquilino: InquilinoDTO) => void; onError?: (error: unknown) => void },
  ) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getInquilinoById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (inquilino) => {
          this._selectedInquilino.set(inquilino);
          handlers?.onSuccess?.(inquilino);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar el inquilino seleccionado.'));
          handlers?.onError?.(error);
        },
      });
  }

  createInquilino(payload: InquilinoDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .createInquilino(payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (inquilino) => {
          this._inquilinos.update((current) => [inquilino, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear el inquilino.'));
          handlers?.onError?.(error);
        },
      });
  }

  updateInquilino(id: number, payload: InquilinoDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .updateInquilino(id, payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (inquilino) => {
          this._inquilinos.update((current) => current.map((item) => (item.id === inquilino.id ? inquilino : item)));
          this._selectedInquilino.set(inquilino);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar el inquilino.'));
          handlers?.onError?.(error);
        },
      });
  }

  deleteInquilino(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deleteInquilino(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._inquilinos.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar el inquilino.'));
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
