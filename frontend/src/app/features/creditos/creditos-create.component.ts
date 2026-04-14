import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-creditos-create',
  standalone: true,
  imports: [CommonModule, CardModule],
  template: `
    <p-card styleClass="credits-card credits-card--empty">
      <ng-template pTemplate="header">
        <div class="credits-card__header">
          <i class="pi pi-plus-circle"></i>
          <h2>Agregar Deuda</h2>
        </div>
      </ng-template>
      <p class="empty-state">
        <span>Próximamente vas a poder registrar una nueva deuda desde este formulario.</span>
      </p>
    </p-card>
  `,
})
export class CreditosCreateComponent {}
