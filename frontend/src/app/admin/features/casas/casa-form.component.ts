import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { CasasStore } from './casas.store';

@Component({
  selector: 'app-casa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputNumberModule, AdminToolbarComponent],
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
          <span>No encontramos la casa solicitada. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="nombre">Nombre *</label>
            <input id="nombre" type="text" pInputText formControlName="nombre" placeholder="Ej: Casa Rivera" />
            @if (showError('nombre', 'required')) {
              <small class="admin-field-error">El nombre es obligatorio.</small>
            }
            @if (showError('nombre', 'maxlength')) {
              <small class="admin-field-error">El nombre debe tener como máximo 120 caracteres.</small>
            }
            @if (showError('nombre', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('nombre') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="direccion">Dirección *</label>
            <textarea
              id="direccion"
              formControlName="direccion"
              rows="3"
              class="admin-textarea"
              placeholder="Ej: Av. Siempre Viva 742"
            ></textarea>
            @if (showError('direccion', 'required')) {
              <small class="admin-field-error">La dirección es obligatoria.</small>
            }
            @if (showError('direccion', 'maxlength')) {
              <small class="admin-field-error">La dirección debe tener como máximo 255 caracteres.</small>
            }
            @if (showError('direccion', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('direccion') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="barrio">Barrio *</label>
            <input id="barrio" type="text" pInputText formControlName="barrio" placeholder="Ej: Palermo" />
            @if (showError('barrio', 'required')) {
              <small class="admin-field-error">El barrio es obligatorio.</small>
            }
            @if (showError('barrio', 'maxlength')) {
              <small class="admin-field-error">El barrio debe tener como máximo 120 caracteres.</small>
            }
            @if (showError('barrio', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('barrio') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="ciudad">Ciudad *</label>
            <input id="ciudad" type="text" pInputText formControlName="ciudad" placeholder="Ej: CABA" />
            @if (showError('ciudad', 'required')) {
              <small class="admin-field-error">La ciudad es obligatoria.</small>
            }
            @if (showError('ciudad', 'maxlength')) {
              <small class="admin-field-error">La ciudad debe tener como máximo 120 caracteres.</small>
            }
            @if (showError('ciudad', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('ciudad') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="estado">Estado *</label>
            <input id="estado" type="text" pInputText formControlName="estado" placeholder="Ej: Disponible" />
            @if (showError('estado', 'required')) {
              <small class="admin-field-error">El estado es obligatorio.</small>
            }
            @if (showError('estado', 'maxlength')) {
              <small class="admin-field-error">El estado debe tener como máximo 60 caracteres.</small>
            }
            @if (showError('estado', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('estado') }}</small>
            }
          </div>

          <div class="admin-field">
            <label for="usuarioId">ID de usuario *</label>
            <p-inputnumber inputId="usuarioId" formControlName="usuarioId" [min]="1" [useGrouping]="false" />
            @if (showError('usuarioId', 'required')) {
              <small class="admin-field-error">El usuario es obligatorio.</small>
            }
            @if (showError('usuarioId', 'min')) {
              <small class="admin-field-error">El ID de usuario debe ser mayor a cero.</small>
            }
            @if (showError('usuarioId', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('usuarioId') }}</small>
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
          <button pButton type="submit" [label]="isEditMode() ? 'Guardar cambios' : 'Crear casa'" [loading]="store.saving()"></button>
        </footer>
      </form>
    </section>
  `,
})
export class CasaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(CasasStore);

  readonly casaId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.casaId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar casa' : 'Nueva casa'));
  readonly subtitle = computed(() =>
    this.isEditMode() ? 'Actualizá los datos de la casa seleccionada.' : 'Completá los campos para registrar una nueva casa.',
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    direccion: ['', [Validators.required, Validators.maxLength(255)]],
    barrio: ['', [Validators.required, Validators.maxLength(120)]],
    ciudad: ['', [Validators.required, Validators.maxLength(120)]],
    estado: ['', [Validators.required, Validators.maxLength(60)]],
    usuarioId: [0, [Validators.required, Validators.min(1)]],
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

    this.casaId.set(id);
    this.store.loadCasaById(id, {
      onSuccess: (casa) => {
        this.form.patchValue({
          nombre: casa.nombre,
          direccion: casa.direccion,
          barrio: casa.barrio,
          ciudad: casa.ciudad,
          estado: casa.estado,
          usuarioId: casa.usuarioId,
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
      nombre: this.form.controls.nombre.value.trim(),
      direccion: this.form.controls.direccion.value.trim(),
      barrio: this.form.controls.barrio.value.trim(),
      ciudad: this.form.controls.ciudad.value.trim(),
      estado: this.form.controls.estado.value.trim(),
      usuarioId: Number(this.form.controls.usuarioId.value),
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updateCasa(this.casaId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createCasa(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/casas');
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

    if (field === 'nombre') {
      this.addBackendError('nombre', message);
      return;
    }

    if (field === 'direccion') {
      this.addBackendError('direccion', message);
      return;
    }

    if (field === 'barrio') {
      this.addBackendError('barrio', message);
      return;
    }

    if (field === 'ciudad') {
      this.addBackendError('ciudad', message);
      return;
    }

    if (field === 'estado') {
      this.addBackendError('estado', message);
      return;
    }

    if (field === 'usuario' || field === 'usuarioid') {
      this.addBackendError('usuarioId', message);
    }
  }

  private addBackendError(controlName: FormControlName, message: string) {
    const control = this.form.controls[controlName];
    control.setErrors({ ...(control.errors ?? {}), backend: message });
  }

  private clearBackendErrors() {
    this.removeErrorKey('nombre', 'backend');
    this.removeErrorKey('direccion', 'backend');
    this.removeErrorKey('barrio', 'backend');
    this.removeErrorKey('ciudad', 'backend');
    this.removeErrorKey('estado', 'backend');
    this.removeErrorKey('usuarioId', 'backend');
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

type FormControlName = 'nombre' | 'direccion' | 'barrio' | 'ciudad' | 'estado' | 'usuarioId';
