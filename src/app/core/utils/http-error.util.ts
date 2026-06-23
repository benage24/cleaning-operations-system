import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converts an HTTP error response into a user-friendly message.
 * Supports Django REST Framework validation and detail payloads.
 */
export function parseHttpError(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string') {
    return body;
  }

  if (body?.non_field_errors?.length) {
    return body.non_field_errors.join(' ');
  }

  if (body?.detail) {
    return typeof body.detail === 'string' ? body.detail : body.detail.join(' ');
  }

  if (typeof body === 'object' && body !== null) {
    const fieldMessages = Object.entries(body)
      .filter(([, value]) => Array.isArray(value) && value.length)
      .map(([field, value]) => `${field}: ${(value as string[]).join(' ')}`);

    if (fieldMessages.length) {
      return fieldMessages.join(' | ');
    }
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check that the backend is running.';
  }

  return 'Something went wrong. Please try again.';
}
