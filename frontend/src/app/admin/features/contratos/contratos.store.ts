import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { ContratoDTO, InquilinoDTO, ZonaDTO } from '../../../models/admin.models';
import { contratoDtoToPayload } from '../../shared/utils/mapper.utils';
import { AdminApiService } from '../../../services/admin-api.service';

@Injectable({ providedIn: 'root' })
export class ContratosStore {
  private readonly api = inject(AdminApiService);

  private readonly _contratos = signal<ContratoDTO[]>([]);
  private readonly _zonas = signal<ZonaDTO[]>([]);
  private readonly _inquilinos = signal<InquilinoDTO[]>([]);
  private readonly _selectedContrato = signal<ContratoDTO | null>(null);
  private readonly _loading = signal(false);
  private readonly _saving = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly contratos = this._contratos.asReadonly();
  readonly zonas = this._zonas.asReadonly();
  readonly inquilinos = this._inquilinos.asReadonly();
  readonly selectedContrato = this._selectedContrato.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly error = this._error.asReadonly();
  readonly total = computed(() => this._contratos().length);

  loadContratos() {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .listContratos()
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (contratos) => this._contratos.set(contratos),
        error: (error: { message?: string }) =>
          this._error.set(error?.message ?? 'No se pudieron cargar los contratos.'),
      });
  }

  loadCatalogs() {
    this.api.listZonas().subscribe({
      next: (zonas) => this._zonas.set(zonas),
      error: (error) => {
        this._error.set(readErrorMessage(error, 'No se pudieron cargar las zonas disponibles.'));
      },
    });

    this.api.listInquilinos().subscribe({
      next: (inquilinos) => this._inquilinos.set(inquilinos),
      error: (error) => {
        this._error.set(readErrorMessage(error, 'No se pudieron cargar los inquilinos disponibles.'));
      },
    });
  }

  loadContratoById(id: number, handlers?: { onSuccess?: (contrato: ContratoDTO) => void; onError?: (error: unknown) => void }) {
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getContratoById(id)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (contrato) => {
          this._selectedContrato.set(contrato);
          handlers?.onSuccess?.(contrato);
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo cargar el contrato seleccionado.'));
          handlers?.onError?.(error);
        },
      });
  }

  createContrato(dto: ContratoDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    // Mapping explícito flat -> nested requerido por el backend JPA.
    const payload = contratoDtoToPayload(dto);

    this.api
      .createContratoPayload(payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (contrato) => {
          this._contratos.update((current) => [contrato, ...current]);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo crear el contrato.'));
          handlers?.onError?.(error);
        },
      });
  }

  updateContrato(id: number, dto: ContratoDTO, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    // Mapping explícito flat -> nested requerido por el backend JPA.
    const payload = contratoDtoToPayload(dto);

    this.api
      .updateContratoPayload(id, payload)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: (contrato) => {
          this._contratos.update((current) => current.map((item) => (item.id === contrato.id ? contrato : item)));
          this._selectedContrato.set(contrato);
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo actualizar el contrato.'));
          handlers?.onError?.(error);
        },
      });
  }

  deleteContrato(id: number, handlers?: { onSuccess?: () => void; onError?: (error: unknown) => void }) {
    this._saving.set(true);
    this._error.set(null);

    this.api
      .deleteContrato(id)
      .pipe(finalize(() => this._saving.set(false)))
      .subscribe({
        next: () => {
          this._contratos.update((current) => current.filter((item) => item.id !== id));
          handlers?.onSuccess?.();
        },
        error: (error) => {
          this._error.set(readErrorMessage(error, 'No se pudo eliminar el contrato.'));
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
