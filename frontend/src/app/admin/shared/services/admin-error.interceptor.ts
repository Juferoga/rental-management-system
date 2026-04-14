import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AdminApiError, AdminFieldError } from '../../../models/admin.models';

export const adminErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const messageService = inject(MessageService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        const fallback = normalizeError(0, error);
        return throwError(() => fallback);
      }

      const normalized = normalizeError(error.status, error.error);

      const shouldToast = shouldShowToast(error.status, normalized.fieldErrors.length);
      if (shouldToast) {
        messageService.add({
          severity: error.status >= 500 ? 'error' : 'warn',
          summary: error.status >= 500 ? 'Error del servidor' : 'Atención',
          detail: normalized.message,
          life: 5000,
        });
      }

      return throwError(() => ({ ...normalized, status: error.status } as AdminApiError));
    }),
  );
};

function shouldShowToast(status: number, fieldErrorsCount: number): boolean {
  if (status >= 500) {
    return true;
  }

  if ((status === 400 || status === 409) && fieldErrorsCount > 0) {
    return false;
  }

  return status >= 400;
}

function normalizeError(status: number, raw: unknown): AdminApiError {
  const fallbackMessage =
    status >= 500
      ? 'Tuvimos un problema procesando la solicitud. Intentá nuevamente en unos minutos.'
      : 'No se pudo completar la operación. Revisá los datos e intentá nuevamente.';

  if (typeof raw === 'string') {
    return { status, message: raw || fallbackMessage, fieldErrors: [], details: raw };
  }

  if (!isRecord(raw)) {
    return { status, message: fallbackMessage, fieldErrors: [], details: raw };
  }

  const message = resolveMessage(raw, fallbackMessage);
  const fieldErrors = resolveFieldErrors(raw);

  return {
    status,
    message,
    fieldErrors,
    details: raw,
  };
}

function resolveMessage(raw: Record<string, unknown>, fallback: string): string {
  const candidates = [raw['message'], raw['error'], raw['detail'], raw['title']];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  const violations = raw['violations'];
  if (Array.isArray(violations) && violations.length > 0) {
    const first = violations[0];
    if (isRecord(first) && typeof first['message'] === 'string') {
      return first['message'];
    }
  }

  return fallback;
}

function resolveFieldErrors(raw: Record<string, unknown>): AdminFieldError[] {
  const fromArray = resolveFieldErrorsArray(raw['fieldErrors'])
    .concat(resolveFieldErrorsArray(raw['errors']))
    .concat(resolveFieldErrorsArray(raw['violations']));

  if (fromArray.length > 0) {
    return fromArray;
  }

  const objectFieldErrors = raw['fieldErrors'];
  if (isRecord(objectFieldErrors)) {
    return Object.entries(objectFieldErrors)
      .filter(([, value]) => typeof value === 'string' && value.trim())
      .map(([field, value]) => ({ field, message: String(value) }));
  }

  return [];
}

function resolveFieldErrorsArray(value: unknown): AdminFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const fieldCandidate = item['field'] ?? item['path'] ?? item['property'];
      const messageCandidate = item['message'] ?? item['error'] ?? item['detail'];

      if (typeof fieldCandidate !== 'string' || typeof messageCandidate !== 'string') {
        return null;
      }

      const field = fieldCandidate.trim();
      const message = messageCandidate.trim();

      if (!field || !message) {
        return null;
      }

      return { field, message } as AdminFieldError;
    })
    .filter((item): item is AdminFieldError => item !== null);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
