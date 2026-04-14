import { CommonModule } from '@angular/common';
import { Component, Input, TemplateRef } from '@angular/core';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-admin-table',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="admin-table">
      <p-table
        [value]="value"
        [loading]="loading"
        [paginator]="paginator"
        [rows]="rows"
        [rowsPerPageOptions]="rowsPerPageOptions"
        [responsiveLayout]="responsiveLayout"
        [tableStyle]="{ 'min-width': minWidth }"
      >
        <ng-template pTemplate="header">
          <ng-content select="[table-header]" />
        </ng-template>

        <ng-template pTemplate="body" let-rowData let-rowIndex="rowIndex">
          <ng-container
            [ngTemplateOutlet]="bodyTemplate"
            [ngTemplateOutletContext]="{ $implicit: rowData, rowIndex: rowIndex }"
          />
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="emptyColspan">
              <div class="admin-table__empty">{{ emptyMessage }}</div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class AdminTableComponent<T = unknown> {
  @Input() value: T[] = [];
  @Input() loading = false;
  @Input() paginator = true;
  @Input() rows = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Input() responsiveLayout: 'scroll' | 'stack' = 'scroll';
  @Input() minWidth = '56rem';
  @Input() emptyMessage = 'No hay datos disponibles.';
  @Input() emptyColspan = 1;
  @Input({ required: true }) bodyTemplate!: TemplateRef<{ $implicit: T; rowIndex: number }>;
}
