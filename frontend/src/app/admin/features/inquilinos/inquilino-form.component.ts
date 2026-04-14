import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { InquilinosStore } from './inquilinos.store';

@Component({
  selector: 'app-inquilino-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, AdminToolbarComponent],
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
          <span>No encontramos el inquilino solicitado. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="nombres">Nombres *</label>
            <input id="nombres" type="text" pInputText formControlName="nombres" placeholder="Ej: Juan Carlos" />
            @if (showError('nombres', 'required')) {
              <small class="admin-field-error">Los nombres son obligatorios.</small>
            }
            @if (showError('nombres', 'maxlength')) {
              <small class="admin-field-error">Los nombres deben tener como máximo 120 caracteres.</small>
            }
            @if (showError('nombres', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('nombres') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="apellidos">Apellidos *</label>
            <input id="apellidos" type="text" pInputText formControlName="apellidos" placeholder="Ej: Pérez" />
            @if (showError('apellidos', 'required')) {
              <small class="admin-field-error">Los apellidos son obligatorios.</small>
            }
            @if (showError('apellidos', 'maxlength')) {
              <small class="admin-field-error">Los apellidos deben tener como máximo 120 caracteres.</small>
            }
            @if (showError('apellidos', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('apellidos') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="telefono">Teléfono *</label>
            <input id="telefono" type="text" pInputText formControlName="telefono" placeholder="Ej: +54 11 5555-5555" />
            @if (showError('telefono', 'required')) {
              <small class="admin-field-error">El teléfono es obligatorio.</small>
            }
            @if (showError('telefono', 'maxlength')) {
              <small class="admin-field-error">El teléfono debe tener como máximo 40 caracteres.</small>
            }
            @if (showError('telefono', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('telefono') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="email">Email *</label>
            <input id="email" type="email" pInputText formControlName="email" placeholder="Ej: juan@email.com" />
            @if (showError('email', 'required')) {
              <small class="admin-field-error">El email es obligatorio.</small>
            }
            @if (showError('email', 'email')) {
              <small class="admin-field-error">Ingresá un email válido.</small>
            }
            @if (showError('email', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('email') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="direccion">Dirección</label>
            <textarea
              id="direccion"
              formControlName="direccion"
              rows="4"
              class="admin-textarea"
              placeholder="Dirección opcional"
            ></textarea>
            @if (showError('direccion', 'maxlength')) {
              <small class="admin-field-error">La dirección debe tener como máximo 255 caracteres.</small>
            }
            @if (showError('direccion', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('direccion') }}</small>
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
          <button pButton type="submit" [label]="isEditMode() ? 'Guardar cambios' : 'Crear inquilino'" [loading]="store.saving()"></button>
        </footer>
      </form>
    </section>
  `,
})
export class InquilinoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(InquilinosStore);

  readonly inquilinoId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.inquilinoId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar inquilino' : 'Nuevo inquilino'));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualizá los datos del inquilino y guardá los cambios.'
      : 'Completá los campos para registrar un nuevo inquilino.',
  );

  readonly form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(120)]],
    apellidos: ['', [Validators.required, Validators.maxLength(120)]],
    telefono: ['', [Validators.required, Validators.maxLength(40)]],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', [Validators.maxLength(255)]],
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

    this.inquilinoId.set(id);
    this.store.loadInquilinoById(id, {
      onSuccess: (inquilino) => {
        this.form.patchValue({
          nombres: inquilino.nombres,
          apellidos: inquilino.apellidos,
          telefono: inquilino.telefono,
          email: inquilino.email,
          direccion: inquilino.direccion ?? '',
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
      nombres: this.form.controls.nombres.value.trim(),
      apellidos: this.form.controls.apellidos.value.trim(),
      telefono: this.form.controls.telefono.value.trim(),
      email: this.form.controls.email.value.trim(),
      direccion: this.form.controls.direccion.value.trim() || null,
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updateInquilino(this.inquilinoId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createInquilino(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/inquilinos');
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
    for (const fieldError of fieldErrors) {
      this.applyFieldError(fieldError);
    }
  }

  private applyFieldError(fieldError: AdminFieldError) {
    const field = fieldError.field?.toLowerCase();
    const message = fieldError.message ?? 'Dato inválido';

    if (field === 'nombres') {
      this.addBackendError('nombres', message);
      return;
    }

    if (field === 'apellidos') {
      this.addBackendError('apellidos', message);
      return;
    }

    if (field === 'telefono') {
      this.addBackendError('telefono', message);
      return;
    }

    if (field === 'email') {
      this.addBackendError('email', message);
      return;
    }

    if (field === 'direccion') {
      this.addBackendError('direccion', message);
    }
  }

  private addBackendError(controlName: FormControlName, message: string) {
    const control = this.form.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), backend: message });
  }

  private clearBackendErrors() {
    this.removeErrorKey('nombres', 'backend');
    this.removeErrorKey('apellidos', 'backend');
    this.removeErrorKey('telefono', 'backend');
    this.removeErrorKey('email', 'backend');
    this.removeErrorKey('direccion', 'backend');
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

type FormControlName = 'nombres' | 'apellidos' | 'telefono' | 'email' | 'direccion';
