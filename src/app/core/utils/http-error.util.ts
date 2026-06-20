import { HttpErrorResponse } from '@angular/common/http';

/**
 * Converts an HTTP error response into a user-friendly message.
 * Supports Django REST Framework validation and detail payloads.
 */
export function parseHttpError(error: HttpErrorResponse): string {
  const body = error.error;
  let message = 'Something went wrong. Please try again.';

  if (typeof body === 'string') {
    return body;
  }

  if (body?.non_field_errors?.[0]) {
    return body.non_field_errors[0];
  }

  if (body?.detail) {
    return typeof body.detail === 'string' ? body.detail : body.detail[0];
  }

  if (typeof body === 'object' && body !== null) {
    const firstKey = Object.keys(body)[0];
    if (firstKey && Array.isArray(body[firstKey])) {
      return body[firstKey][0];
    }
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check that the backend is running.';
  }

  return message;
}
