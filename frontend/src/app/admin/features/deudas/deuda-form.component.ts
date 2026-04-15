import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { DeudasStore } from './deudas.store';

@Component({
  selector: 'app-deuda-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
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
          <span>No encontramos la deuda solicitada. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field admin-field--full">
            <label for="fecha">Fecha *</label>
            <input id="fecha" type="date" class="p-inputtext p-component" formControlName="fecha" />
            @if (showError('fecha', 'required')) {
              <small class="admin-field-error">La fecha es obligatoria.</small>
            }
            @if (showError('fecha', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('fecha') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="estado">Estado *</label>
            <input id="estado" type="text" pInputText formControlName="estado" placeholder="Ej: Pendiente" />
            @if (showError('estado', 'required')) {
              <small class="admin-field-error">El estado es obligatorio.</small>
            }
            @if (showError('estado', 'maxlength')) {
              <small class="admin-field-error">Máximo 60 caracteres.</small>
            }
            @if (showError('estado', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('estado') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="montoTotal">Monto total *</label>
            <p-inputnumber
              inputId="montoTotal"
              formControlName="montoTotal"
              mode="decimal"
              [min]="0.01"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
            @if (showError('montoTotal', 'required')) {
              <small class="admin-field-error">El monto total es obligatorio.</small>
            }
            @if (showError('montoTotal', 'min')) {
              <small class="admin-field-error">El monto total debe ser mayor a cero.</small>
            }
            @if (showError('montoTotal', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('montoTotal') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="saldoPendiente">Saldo pendiente *</label>
            <p-inputnumber
              inputId="saldoPendiente"
              formControlName="saldoPendiente"
              mode="decimal"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
            @if (showError('saldoPendiente', 'required')) {
              <small class="admin-field-error">El saldo pendiente es obligatorio.</small>
            }
            @if (showError('saldoPendiente', 'min')) {
              <small class="admin-field-error">El saldo pendiente no puede ser negativo.</small>
            }
            @if (showError('saldoPendiente', 'pendingGreaterThanTotal')) {
              <small class="admin-field-error">El saldo pendiente no puede superar el monto total.</small>
            }
            @if (showError('saldoPendiente', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('saldoPendiente') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="motivo">Motivo</label>
            <input id="motivo" type="text" pInputText formControlName="motivo" placeholder="Ej: Reparación de urgencia" />
            @if (showError('motivo', 'maxlength')) {
              <small class="admin-field-error">Máximo 180 caracteres.</small>
            }
            @if (showError('motivo', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('motivo') }}</small>
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
            [label]="isEditMode() ? 'Guardar cambios' : 'Crear deuda'"
            [loading]="store.saving()"
          ></button>
        </footer>
      </form>
    </section>
  `,
})
export class DeudaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(DeudasStore);

  readonly deudaId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.deudaId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar deuda' : 'Nueva deuda'));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualizá montos y estado de la deuda.'
      : 'Completá los campos para registrar un nuevo préstamo/deuda.',
  );

  readonly form = this.fb.nonNullable.group({
    fecha: ['', [Validators.required]],
    montoTotal: [0, [Validators.required, Validators.min(0.01)]],
    saldoPendiente: [0, [Validators.required, Validators.min(0)]],
    motivo: ['', [Validators.maxLength(180)]],
    estado: ['Pendiente', [Validators.required, Validators.maxLength(60)]],
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.notFound.set(true);
      return;
    }

    this.deudaId.set(id);
    this.store.loadDeudaById(id, {
      onSuccess: (deuda) => {
        this.form.patchValue({
          fecha: deuda.fecha,
          montoTotal: deuda.montoTotal,
          saldoPendiente: deuda.saldoPendiente,
          motivo: deuda.motivo ?? '',
          estado: deuda.estado ?? 'Pendiente',
        });
      },
      onError: () => {
        this.notFound.set(true);
      },
    });
  }

  save() {
    this.clearBackendErrors();
    this.validateAmounts();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      fecha: this.form.controls.fecha.value,
      montoTotal: Number(this.form.controls.montoTotal.value),
      saldoPendiente: Number(this.form.controls.saldoPendiente.value),
      motivo: this.form.controls.motivo.value.trim() || null,
      estado: this.form.controls.estado.value.trim() || null,
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updateDeuda(this.deudaId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createDeuda(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/deudas');
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

  private validateAmounts() {
    this.removeErrorKey('saldoPendiente', 'pendingGreaterThanTotal');

    const montoTotal = Number(this.form.controls.montoTotal.value);
    const saldoPendiente = Number(this.form.controls.saldoPendiente.value);

    if (!Number.isFinite(montoTotal) || !Number.isFinite(saldoPendiente)) {
      return;
    }

    if (saldoPendiente > montoTotal) {
      this.form.controls.saldoPendiente.setErrors({
        ...(this.form.controls.saldoPendiente.errors ?? {}),
        pendingGreaterThanTotal: true,
      });
    }
  }

  private applyBackendErrors(error: Partial<AdminApiError>) {
    const fieldErrors = Array.isArray(error.fieldErrors) ? error.fieldErrors : [];
    for (const fieldError of fieldErrors) {
      this.applyFieldError(fieldError);
    }
  }

  private applyFieldError(fieldError: AdminFieldError) {
    const field = fieldError.field?.toLowerCase();
    const message = fieldError.message ?? 'Dato inválido';

    if (field === 'fecha') {
      this.addBackendError('fecha', message);
      return;
    }

    if (field === 'montototal') {
      this.addBackendError('montoTotal', message);
      return;
    }

    if (field === 'saldopendiente') {
      this.addBackendError('saldoPendiente', message);
      return;
    }

    if (field === 'motivo') {
      this.addBackendError('motivo', message);
      return;
    }

    if (field === 'estado') {
      this.addBackendError('estado', message);
    }
  }

  private addBackendError(controlName: FormControlName, message: string) {
    const control = this.form.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), backend: message });
  }

  private clearBackendErrors() {
    this.removeErrorKey('fecha', 'backend');
    this.removeErrorKey('montoTotal', 'backend');
    this.removeErrorKey('saldoPendiente', 'backend');
    this.removeErrorKey('motivo', 'backend');
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

type FormControlName = 'fecha' | 'montoTotal' | 'saldoPendiente' | 'motivo' | 'estado';
