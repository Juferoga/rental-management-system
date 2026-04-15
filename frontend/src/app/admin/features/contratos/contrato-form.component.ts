import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { ContratosStore } from './contratos.store';

@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    InputNumberModule,
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
          <span>No encontramos el contrato solicitado. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="inquilinoId">Inquilino *</label>
            <p-select
              inputId="inquilinoId"
              formControlName="inquilinoId"
              [options]="inquilinoOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccioná un inquilino"
              [filter]="true"
              filterBy="label"
              appendTo="body"
            />
            @if (showError('inquilinoId', 'required')) {
              <small class="admin-field-error">Seleccioná un inquilino.</small>
            }
            @if (showError('inquilinoId', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('inquilinoId') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="zonaId">Zona *</label>
            <p-select
              inputId="zonaId"
              formControlName="zonaId"
              [options]="zonaOptions()"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccioná una zona"
              [filter]="true"
              filterBy="label"
              appendTo="body"
            />
            @if (showError('zonaId', 'required')) {
              <small class="admin-field-error">Seleccioná una zona.</small>
            }
            @if (showError('zonaId', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('zonaId') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="fechaInicio">Fecha de inicio *</label>
            <input id="fechaInicio" type="date" class="p-inputtext p-component" formControlName="fechaInicio" />
            @if (showError('fechaInicio', 'required')) {
              <small class="admin-field-error">La fecha de inicio es obligatoria.</small>
            }
            @if (showError('fechaInicio', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('fechaInicio') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="fechaFin">Fecha de fin *</label>
            <input id="fechaFin" type="date" class="p-inputtext p-component" formControlName="fechaFin" />
            @if (showError('fechaFin', 'required')) {
              <small class="admin-field-error">La fecha de fin es obligatoria.</small>
            }
            @if (showError('fechaFin', 'dateRange')) {
              <small class="admin-field-error">La fecha de fin debe ser mayor o igual a la fecha de inicio.</small>
            }
            @if (showError('fechaFin', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('fechaFin') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="montoMensual">Monto mensual *</label>
            <p-inputnumber
              inputId="montoMensual"
              formControlName="montoMensual"
              mode="decimal"
              [min]="0"
              [minFractionDigits]="2"
              [maxFractionDigits]="2"
            />
            @if (showError('montoMensual', 'required')) {
              <small class="admin-field-error">El monto mensual es obligatorio.</small>
            }
            @if (showError('montoMensual', 'min')) {
              <small class="admin-field-error">El monto mensual debe ser mayor a cero.</small>
            }
            @if (showError('montoMensual', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('montoMensual') }}</small>
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
          <button pButton type="submit" [label]="isEditMode() ? 'Guardar cambios' : 'Crear contrato'" [loading]="store.saving()"></button>
        </footer>
      </form>
    </section>
  `,
})
export class ContratoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(ContratosStore);

  readonly contratoId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.contratoId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar contrato' : 'Nuevo contrato'));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualizá la vigencia y relaciones del contrato.'
      : 'Completá los campos para registrar un nuevo contrato.',
  );

  readonly zonaOptions = computed(() =>
    this.store.zonas().map((zona) => ({ value: zona.id!, label: zona.nombre })),
  );
  readonly inquilinoOptions = computed(() =>
    this.store
      .inquilinos()
      .map((inquilino) => ({ value: inquilino.id!, label: `${inquilino.nombre} ${inquilino.apellido}` })),
  );

  readonly form = this.fb.nonNullable.group({
    inquilinoId: [0, [Validators.required, Validators.min(1)]],
    zonaId: [0, [Validators.required, Validators.min(1)]],
    fechaInicio: ['', [Validators.required]],
    fechaFin: ['', [Validators.required]],
    montoMensual: [0, [Validators.required, Validators.min(0.01)]],
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

    this.contratoId.set(id);
    this.store.loadContratoById(id, {
      onSuccess: (contrato) => {
        this.form.patchValue({
          inquilinoId: contrato.inquilinoId,
          zonaId: contrato.zonaId,
          fechaInicio: contrato.fechaInicio,
          fechaFin: contrato.fechaFin,
          montoMensual: contrato.montoMensual,
        });
      },
      onError: () => {
        this.notFound.set(true);
      },
    });
  }

  save() {
    this.clearBackendErrors();
    this.validateDateRange();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      inquilinoId: this.form.controls.inquilinoId.value,
      zonaId: this.form.controls.zonaId.value,
      fechaInicio: this.form.controls.fechaInicio.value,
      fechaFin: this.form.controls.fechaFin.value,
      montoMensual: Number(this.form.controls.montoMensual.value),
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updateContrato(this.contratoId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createContrato(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/contratos');
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

  private validateDateRange() {
    this.removeErrorKey('fechaFin', 'dateRange');

    const start = this.form.controls.fechaInicio.value;
    const end = this.form.controls.fechaFin.value;
    if (!start || !end) {
      return;
    }

    if (end < start) {
      this.form.controls.fechaFin.setErrors({ ...(this.form.controls.fechaFin.errors ?? {}), dateRange: true });
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

    if (field === 'fechainicio') {
      this.addBackendError('fechaInicio', message);
      return;
    }

    if (field === 'fechafin') {
      this.addBackendError('fechaFin', message);
      return;
    }

    if (field === 'montomensual') {
      this.addBackendError('montoMensual', message);
      return;
    }

    if (field === 'zona' || field === 'zonaid') {
      this.addBackendError('zonaId', message);
      return;
    }

    if (field === 'inquilino' || field === 'inquilinoid') {
      this.addBackendError('inquilinoId', message);
    }
  }

  private addBackendError(controlName: FormControlName, message: string) {
    const control = this.form.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), backend: message });
  }

  private clearBackendErrors() {
    this.removeErrorKey('inquilinoId', 'backend');
    this.removeErrorKey('zonaId', 'backend');
    this.removeErrorKey('fechaInicio', 'backend');
    this.removeErrorKey('fechaFin', 'backend');
    this.removeErrorKey('montoMensual', 'backend');
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

type FormControlName = 'inquilinoId' | 'zonaId' | 'fechaInicio' | 'fechaFin' | 'montoMensual';
