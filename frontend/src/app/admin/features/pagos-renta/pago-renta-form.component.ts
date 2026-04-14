import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { PagosRentaStore } from './pagos-renta.store';

@Component({
  selector: 'app-pago-renta-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    InputNumberModule,
    InputTextModule,
    AdminToolbarComponent,
  ],
  template: `
    <section class="admin-feature admin-feature--form">
      <app-admin-toolbar
        [title]="title()"
        [subtitle]="subtitle()"
        [showCreate]="false"
        [showRefresh]="false"
      >
        <button
          toolbar-actions
          pButton
          type="button"
          severity="secondary"
          [outlined]="true"
          icon="pi pi-arrow-left"
          label="Volver"
          (click)="goBack()"
        ></button>
      </app-admin-toolbar>

      @if (notFound()) {
        <div class="admin-error-banner">
          <i class="pi pi-exclamation-circle"></i>
          <span>No encontramos el pago de renta solicitado. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field admin-field--full">
            <label for="contratoId">Contrato *</label>
            <p-select
              inputId="contratoId"
              formControlName="contratoId"
              [options]="contratoOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccioná un contrato"
              [filter]="true"
              filterBy="label"
              appendTo="body"
            />
            @if (showError('contratoId', 'required') || showError('contratoId', 'min')) {
              <small class="admin-field-error">Seleccioná un contrato válido.</small>
            }
            @if (showError('contratoId', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('contratoId') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="anio">Año *</label>
            <p-inputnumber inputId="anio" formControlName="anio" [min]="1900" [max]="9999" [useGrouping]="false" />
            @if (showError('anio', 'required')) {
              <small class="admin-field-error">El año es obligatorio.</small>
            }
            @if (showError('anio', 'min') || showError('anio', 'max')) {
              <small class="admin-field-error">Ingresá un año válido de 4 dígitos.</small>
            }
            @if (showError('anio', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('anio') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="mes">Mes *</label>
            <p-inputnumber inputId="mes" formControlName="mes" [min]="1" [max]="12" [useGrouping]="false" />
            @if (showError('mes', 'required')) {
              <small class="admin-field-error">El mes es obligatorio.</small>
            }
            @if (showError('mes', 'min') || showError('mes', 'max')) {
              <small class="admin-field-error">El mes debe estar entre 1 y 12.</small>
            }
            @if (showError('mes', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('mes') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="montoEsperado">Monto esperado *</label>
            <p-inputnumber
              inputId="montoEsperado"
              formControlName="montoEsperado"
              mode="decimal"
              [min]="0.01"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
            @if (showError('montoEsperado', 'required')) {
              <small class="admin-field-error">El monto esperado es obligatorio.</small>
            }
            @if (showError('montoEsperado', 'min')) {
              <small class="admin-field-error">El monto esperado debe ser mayor a cero.</small>
            }
            @if (showError('montoEsperado', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('montoEsperado') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="montoPagado">Monto pagado</label>
            <p-inputnumber
              inputId="montoPagado"
              formControlName="montoPagado"
              mode="decimal"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
            @if (showError('montoPagado', 'min')) {
              <small class="admin-field-error">El monto pagado no puede ser negativo.</small>
            }
            @if (showError('montoPagado', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('montoPagado') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="fechaPago">Fecha de pago *</label>
            <input id="fechaPago" type="date" class="p-inputtext p-component" formControlName="fechaPago" />
            @if (showError('fechaPago', 'required')) {
              <small class="admin-field-error">La fecha de pago es obligatoria.</small>
            }
            @if (showError('fechaPago', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('fechaPago') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="metodoPago">Método de pago</label>
            <input id="metodoPago" type="text" pInputText formControlName="metodoPago" placeholder="Ej: Transferencia" />
            @if (showError('metodoPago', 'maxlength')) {
              <small class="admin-field-error">Máximo 80 caracteres.</small>
            }
            @if (showError('metodoPago', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('metodoPago') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="estado">Estado</label>
            <input id="estado" type="text" pInputText formControlName="estado" placeholder="Ej: Pagado" />
            @if (showError('estado', 'maxlength')) {
              <small class="admin-field-error">Máximo 60 caracteres.</small>
            }
            @if (showError('estado', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('estado') }}</small>
            }
          </div>
        </div>

        @if (store.error() && !hasFieldErrors()) {
          <div class="admin-form-global-error">
            <i class="pi pi-info-circle"></i>
            <span>{{ store.error() }}</span>
          </div>
        }

        <footer class="admin-form-actions">
          <button pButton type="button" severity="secondary" [outlined]="true" label="Cancelar" (click)="goBack()"></button>
          <button
            pButton
            type="submit"
            [label]="isEditMode() ? 'Guardar cambios' : 'Crear pago de renta'"
            [loading]="store.saving()"
          ></button>
        </footer>
      </form>
    </section>
  `,
})
export class PagoRentaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(PagosRentaStore);

  readonly pagoRentaId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.pagoRentaId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar pago de renta' : 'Nuevo pago de renta'));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualizá período, contrato y estado del pago.'
      : 'Completá los campos para registrar una mensualidad de renta.',
  );

  readonly contratoOptions = computed(() =>
    this.store.contratos().map((contrato) => ({
      value: contrato.id!,
      label: `#${contrato.id} · ${contrato.fechaInicio} → ${contrato.fechaFin}`,
    })),
  );

  readonly form = this.fb.nonNullable.group({
    contratoId: [0, [Validators.required, Validators.min(1)]],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(9999)]],
    mes: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
    montoEsperado: [0, [Validators.required, Validators.min(0.01)]],
    montoPagado: [0, [Validators.min(0)]],
    fechaPago: ['', [Validators.required]],
    metodoPago: ['', [Validators.maxLength(80)]],
    estado: ['Pendiente', [Validators.maxLength(60)]],
  });

  ngOnInit() {
    this.store.loadCatalogs();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.notFound.set(true);
      return;
    }

    this.pagoRentaId.set(id);
    this.store.loadPagoRentaById(id, {
      onSuccess: (pagoRenta) => {
        this.form.patchValue({
          contratoId: pagoRenta.contratoId,
          anio: pagoRenta.anio,
          mes: pagoRenta.mes,
          montoEsperado: pagoRenta.montoEsperado,
          montoPagado: pagoRenta.montoPagado ?? 0,
          fechaPago: pagoRenta.fechaPago ?? '',
          metodoPago: pagoRenta.metodoPago ?? '',
          estado: pagoRenta.estado ?? 'Pendiente',
        });
      },
      onError: () => {
        this.notFound.set(true);
      },
    });
  }

  save() {
    this.clearBackendErrors();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      contratoId: this.form.controls.contratoId.value,
      anio: this.form.controls.anio.value,
      mes: this.form.controls.mes.value,
      montoEsperado: Number(this.form.controls.montoEsperado.value),
      montoPagado: Number(this.form.controls.montoPagado.value) || 0,
      fechaPago: this.form.controls.fechaPago.value,
      metodoPago: this.form.controls.metodoPago.value.trim() || null,
      estado: this.form.controls.estado.value.trim() || null,
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updatePagoRenta(this.pagoRentaId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createPagoRenta(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/pagos-renta');
  }

  showError(controlName: FormControlName, errorKey: string) {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorKey);
  }

  getBackendError(controlName: FormControlName) {
    const control = this.form.controls[controlName];
    const backendError = control.getError('backend');
    return typeof backendError === 'string' ? backendError : 'Revisá este campo.';
  }

  hasFieldErrors() {
    return Object.values(this.form.controls).some((control) => control.hasError('backend'));
  }

  private applyBackendErrors(error: Partial<AdminApiError>) {
    const fieldErrors = Array.isArray(error.fieldErrors) ? error.fieldErrors : [];
    const normalizedMessage = (error.message ?? '').toLowerCase();

    for (const fieldError of fieldErrors) {
      this.applyFieldError(fieldError);
    }

    // fallback explícito para constraints compuestas (contrato_id + anio + mes)
    if (fieldErrors.length === 0 && normalizedMessage.includes('contrato') && normalizedMessage.includes('mes')) {
      const conflictMessage = 'Ya existe un pago de renta para este contrato en ese año y mes.';
      this.addBackendError('contratoId', conflictMessage);
      this.addBackendError('anio', conflictMessage);
      this.addBackendError('mes', conflictMessage);
    }
  }

  private applyFieldError(fieldError: AdminFieldError) {
    const field = fieldError.field?.toLowerCase();
    const message = fieldError.message ?? 'Dato inválido';

    if (field === 'contrato' || field === 'contratoid') {
      this.addBackendError('contratoId', message);
      return;
    }

    if (field === 'anio') {
      this.addBackendError('anio', message);
      return;
    }

    if (field === 'mes') {
      this.addBackendError('mes', message);
      return;
    }

    if (field === 'montoesperado') {
      this.addBackendError('montoEsperado', message);
      return;
    }

    if (field === 'montopagado') {
      this.addBackendError('montoPagado', message);
      return;
    }

    if (field === 'fechapago') {
      this.addBackendError('fechaPago', message);
      return;
    }

    if (field === 'metodopago') {
      this.addBackendError('metodoPago', message);
      return;
    }

    if (field === 'estado') {
      this.addBackendError('estado', message);
      return;
    }

    // mapeo de constraint compuesta recibida como campo genérico
    if (field.includes('contrato') || field.includes('anio') || field.includes('mes')) {
      const conflictMessage = 'Ya existe un pago de renta para este contrato en ese año y mes.';
      this.addBackendError('contratoId', conflictMessage);
      this.addBackendError('anio', conflictMessage);
      this.addBackendError('mes', conflictMessage);
    }
  }

  private addBackendError(controlName: FormControlName, message: string) {
    const control = this.form.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), backend: message });
  }

  private clearBackendErrors() {
    this.removeErrorKey('contratoId', 'backend');
    this.removeErrorKey('anio', 'backend');
    this.removeErrorKey('mes', 'backend');
    this.removeErrorKey('montoEsperado', 'backend');
    this.removeErrorKey('montoPagado', 'backend');
    this.removeErrorKey('fechaPago', 'backend');
    this.removeErrorKey('metodoPago', 'backend');
    this.removeErrorKey('estado', 'backend');
  }

  private removeErrorKey(controlName: FormControlName, key: string) {
    const control = this.form.controls[controlName];
    const errors = control.errors;
    if (!errors || !errors[key]) {
      return;
    }

    const nextErrors = { ...errors };
    delete nextErrors[key];

    control.setErrors(Object.keys(nextErrors).length > 0 ? nextErrors : null);
  }
}

type FormControlName =
  | 'contratoId'
  | 'anio'
  | 'mes'
  | 'montoEsperado'
  | 'montoPagado'
  | 'fechaPago'
  | 'metodoPago'
  | 'estado';
