import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ZonaDTO } from '../../../models/admin.models';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class ZonasStore {
  private readonly api = inject(AdminApiService);

  private readonly _zonas = signal<ZonaDTO[]>([]);
  private readonly _selectedZona = signal<ZonaDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly zonas = this._zonas.asReadonly();
  readonly selectedZona = this._selectedZona.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._zonas().length);

  loadZonas() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listZonas()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (zonas) => this._zonas.set(zonas),
        error: (error: { message?: string }) => this._error.set(error?.message ?? 'No se pudieron cargar las zonas.'),
      });
  }

  loadZonaById(id: number, handlers?: { onSuccess?: (zona: ZonaDTO) => void; onError?: (error: unknown) => void }) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getZonaById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (zona) => {
          this._selectedZona.set(zona);
          handlers?.onSuccess?.(zona);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar la zona seleccionada.'));
          handlers?.onError?.(error);
        },
      });
  }

  createZona(payload: ZonaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .createZona(payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (zona) => {
          this._zonas.update((current) => [zona, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear la zona.'));
          handlers?.onError?.(error);
        },
      });
  }

  updateZona(id: number, payload: ZonaDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .updateZona(id, payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (zona) => {
          this._zonas.update((current) => current.map((item) => (item.id === zona.id ? zona : item)));
          this._selectedZona.set(zona);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar la zona.'));
          handlers?.onError?.(error);
        },
      });
  }

  deleteZona(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deleteZona(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._zonas.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar la zona.'));
          handlers?.onError?.(error);
        },
      });
  }

  clearSelectedZona() {
    this._selectedZona.set(null);
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
