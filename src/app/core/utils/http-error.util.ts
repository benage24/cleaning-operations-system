import { HttpErrorResponse } from '@angular/common/http';

const FIELD_LABELS: Record<string, string> = {
  roomId: 'Room',
  room_id: 'Room',
  roomIds: 'Rooms',
  room_ids: 'Rooms',
  cleanerId: 'Cleaner',
  cleaner_id: 'Cleaner',
  assignmentId: 'Assignment',
  assignment_id: 'Assignment',
  estimatedDurationMinutes: 'Estimated duration',
  estimated_duration_minutes: 'Estimated duration',
  status: 'Status',
  action: 'Action',
  reason: 'Reason',
  rating: 'Rating',
  email: 'Email',
  firstName: 'First name',
  first_name: 'First name',
  lastName: 'Last name',
  last_name: 'Last name',
  number: 'Room number',
  building: 'Building',
  floor: 'Floor',
};

/**
 * Converts an HTTP error response into a user-friendly message.
 * Supports Django REST Framework validation and detail payloads.
 */
export function parseHttpError(error: HttpErrorResponse): string {
  const body = error.error;

  if (typeof body === 'string' && body.trim()) {
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
      .map(([field, value]) => formatFieldError(field, value as string[]));

    if (fieldMessages.length) {
      if (isMissingRequiredFieldsError(body)) {
        return 'Please complete all required fields before continuing.';
      }

      if (fieldMessages.length === 1) {
        return fieldMessages[0];
      }

      return fieldMessages.join(' ');
    }
  }

  if (error.status === 0) {
    return 'Unable to reach the server. Check that the backend is running.';
  }

  if (error.status === 401) {
    return 'Your session has expired. Please sign in again.';
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }

  if (error.status === 404) {
    return 'The requested item could not be found.';
  }

  if (error.status >= 500) {
    return 'The server encountered an error. Please try again in a moment.';
  }

  return 'Something went wrong. Please try again.';
}

function formatFieldError(field: string, messages: string[]): string {
  const label = FIELD_LABELS[field] ?? 'This field';
  const message = messages[0]?.toLowerCase() ?? 'is invalid';

  if (message.includes('required')) {
    return `${label} is required.`;
  }

  if (message.includes('valid choice')) {
    return `Please choose a valid ${label.toLowerCase()}.`;
  }

  if (message.includes('already exists') || message.includes('unique')) {
    return `${label} is already in use.`;
  }

  return `${label}: ${messages.join(' ')}`;
}

function isMissingRequiredFieldsError(body: Record<string, unknown>): boolean {
  const entries = Object.entries(body).filter(
    ([, value]) => Array.isArray(value) && value.length,
  );

  if (entries.length < 2) {
    return false;
  }

  return entries.every(([, value]) =>
    (value as string[]).some((message) => message.toLowerCase().includes('required')),
  );
}
