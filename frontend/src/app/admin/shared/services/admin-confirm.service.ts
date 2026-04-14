import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface AdminConfirmOptions {
  title: string;
  message: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept: () => void;
  reject?: () => void;
}

@Injectable({ providedIn: 'root' })
export class AdminConfirmService {
  private readonly confirmationService = inject(ConfirmationService);

  confirm(options: AdminConfirmOptions): void {
    this.confirmationService.confirm({
      header: options.title,
      message: options.message,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: options.acceptLabel ?? 'Aceptar',
      rejectLabel: options.rejectLabel ?? 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: options.accept,
      reject: () => {
        options.reject?.();
      },
    });
  }
}
