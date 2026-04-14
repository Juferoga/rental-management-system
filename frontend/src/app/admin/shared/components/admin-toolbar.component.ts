import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-admin-toolbar',
  standalone: true,
  imports: [CommonModule, ToolbarModule, ButtonModule],
  template: `
    <p-toolbar styleClass="admin-toolbar">
      <ng-template pTemplate="start">
        <div class="admin-toolbar__heading">
          <h2>{{ title }}</h2>
          @if (subtitle) {
            <p>{{ subtitle }}</p>
          }
        </div>
      </ng-template>

      <ng-template pTemplate="end">
        <div class="admin-toolbar__actions">
          <ng-content select="[toolbar-actions]" />

          @if (showRefresh) {
            <button
              pButton
              type="button"
              severity="secondary"
              [icon]="refreshIcon"
              [label]="refreshLabel"
              [outlined]="true"
              [loading]="loading"
              (click)="refresh.emit()"
            ></button>
          }

          @if (showCreate) {
            <button
              pButton
              type="button"
              [icon]="createIcon"
              [label]="createLabel"
              (click)="create.emit()"
            ></button>
          }
        </div>
      </ng-template>
    </p-toolbar>
  `,
})
export class AdminToolbarComponent {
  @Input() title = 'Gestión';
  @Input() subtitle = '';
  @Input() createLabel = 'Nuevo';
  @Input() createIcon = 'pi pi-plus';
  @Input() refreshLabel = 'Actualizar';
  @Input() refreshIcon = 'pi pi-refresh';
  @Input() showCreate = true;
  @Input() showRefresh = true;
  @Input() loading = false;

  @Output() readonly create = new EventEmitter<void>();
  @Output() readonly refresh = new EventEmitter<void>();
}
