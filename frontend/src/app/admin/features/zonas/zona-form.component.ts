import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';
import { AdminToolbarComponent } from '../../shared/components/admin-toolbar.component';
import { ZonasStore } from './zonas.store';

@Component({
  selector: 'app-zona-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
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
        <button toolbar-actions pButton type="button" severity="secondary" [outlined]="true" icon="pi pi-arrow-left" label="Volver" (click)="goBack()"></button>
      </app-admin-toolbar>

      @if (notFound()) {
        <div class="admin-error-banner">
          <i class="pi pi-exclamation-circle"></i>
          <span>No encontramos la zona solicitada. Verificá el identificador e intentá nuevamente.</span>
        </div>
      }

      <form class="admin-form-card" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="admin-form-grid">
          <div class="admin-field">
            <label for="nombre">Nombre *</label>
            <input id="nombre" type="text" pInputText formControlName="nombre" placeholder="Ej: Zona Centro" />

            @if (showError('nombre', 'required')) {
              <small class="admin-field-error">El nombre es obligatorio.</small>
            }
            @if (showError('nombre', 'maxlength')) {
              <small class="admin-field-error">El nombre debe tener como máximo 120 caracteres.</small>
            }
            @if (showError('nombre', 'duplicate')) {
              <small class="admin-field-error">Ya existe una zona con ese nombre.</small>
            }
            @if (showError('nombre', 'backend')) {
              <small class="admin-field-error">{{ getBackendError('nombre') }}</small>
            }
          </div>

          <div class="admin-field admin-field--full">
            <label for="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              formControlName="descripcion"
              rows="4"
              class="admin-textarea"
              placeholder="Detalles de la zona habitacional"
            ></textarea>
          </div>

          <div class="admin-field admin-field--inline">
            <label for="disponible">Disponible</label>
            <p-toggleswitch inputId="disponible" formControlName="disponible" />
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
          <button pButton type="submit" [label]="isEditMode() ? 'Guardar cambios' : 'Crear zona'" [loading]="store.saving()"></button>
        </footer>
      </form>
    </section>
  `,
})
export class ZonaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(ZonasStore);

  readonly zonaId = signal<number | null>(null);
  readonly notFound = signal(false);

  readonly isEditMode = computed(() => this.zonaId() !== null);
  readonly title = computed(() => (this.isEditMode() ? 'Editar zona' : 'Nueva zona'));
  readonly subtitle = computed(() =>
    this.isEditMode()
      ? 'Actualizá la información operativa y guardá los cambios.'
      : 'Completá los campos para registrar una nueva zona.',
  );

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: [''],
    disponible: [true],
  });

  ngOnInit() {
    this.store.loadZonas();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      return;
    }

    const id = Number(idParam);
    if (Number.isNaN(id)) {
      this.notFound.set(true);
      return;
    }

    this.zonaId.set(id);
    this.store.loadZonaById(id, {
      onSuccess: (zona) => {
        this.form.patchValue({
          nombre: zona.nombre,
          descripcion: zona.descripcion ?? '',
          disponible: zona.disponible,
        });
      },
      onError: () => {
        this.notFound.set(true);
      },
    });
  }

  save() {
    this.clearBackendErrors();
    this.validateNombreUnico();

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.form.controls.nombre.value.trim(),
      descripcion: this.form.controls.descripcion.value.trim() || null,
      disponible: this.form.controls.disponible.value,
    };

    const onError = (error: unknown) => {
      this.applyBackendErrors(error as Partial<AdminApiError>);
      this.form.markAllAsTouched();
    };

    if (this.isEditMode()) {
      this.store.updateZona(this.zonaId()!, payload, {
        onSuccess: () => this.goBack(),
        onError,
      });
      return;
    }

    this.store.createZona(payload, {
      onSuccess: () => this.goBack(),
      onError,
    });
  }

  goBack() {
    this.router.navigateByUrl('/admin/zonas');
  }

  showError(controlName: 'nombre' | 'descripcion' | 'disponible', errorKey: string) {
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorKey);
  }

  getBackendError(controlName: 'nombre' | 'descripcion' | 'disponible') {
    const control = this.form.controls[controlName];
    const backendError = control.getError('backend');
    return typeof backendError === 'string' ? backendError : 'Revisá este campo.';
  }

  hasFieldErrors() {
    return Object.values(this.form.controls).some((control) => control.hasError('backend'));
  }

  private validateNombreUnico() {
    const currentValue = this.form.controls.nombre.value.trim().toLowerCase();
    if (!currentValue) {
      return;
    }

    const duplicated = this.store
      .zonas()
      .filter((zona) => zona.id !== this.zonaId())
      .some((zona) => zona.nombre.trim().toLowerCase() === currentValue);

    if (duplicated) {
      this.form.controls.nombre.setErrors({ ...(this.form.controls.nombre.errors ?? {}), duplicate: true });
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

    if (field === 'nombre') {
      this.form.controls.nombre.setErrors({ ...(this.form.controls.nombre.errors ?? {}), backend: message });
      return;
    }

    if (field === 'descripcion') {
      this.form.controls.descripcion.setErrors({ ...(this.form.controls.descripcion.errors ?? {}), backend: message });
    }
  }

  private clearBackendErrors() {
    this.removeErrorKey('nombre', 'backend');
    this.removeErrorKey('nombre', 'duplicate');
    this.removeErrorKey('descripcion', 'backend');
  }

  private removeErrorKey(controlName: 'nombre' | 'descripcion', key: string) {
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
