import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cleaner } from '../models';
import { PaginatedResponse } from '../models/api.model';
import { ApiService } from './api.service';

type ApiCleaner = Omit<Cleaner, 'id' | 'supervisorId'> & {
  id: number;
  supervisorId?: number | null;
};

/** Maps a cleaner payload from the API into the app Cleaner model. */
function mapCleaner(cleaner: ApiCleaner): Cleaner {
  return {
    ...cleaner,
    id: String(cleaner.id),
    supervisorId: cleaner.supervisorId != null ? String(cleaner.supervisorId) : undefined,
  };
}

/**
 * Loads and manages cleaner profiles from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class CleanerService {
  private readonly api = inject(ApiService);

  /** Returns all cleaners from the API. */
  getAll(): Observable<Cleaner[]> {
    return this.api.get<PaginatedResponse<ApiCleaner>>('cleaners/').pipe(
      map((response) => response.results.map(mapCleaner)),
    );
  }

  /** Returns a single cleaner by user id. */
  getById(id: string): Observable<Cleaner | undefined> {
    return this.api.get<ApiCleaner>(`cleaners/${id}/`).pipe(map(mapCleaner));
  }

  /** Creates a new cleaner profile. */
  create(cleaner: Partial<Cleaner>): Observable<Cleaner> {
    return this.api
      .post<ApiCleaner>('cleaners/', {
        email: cleaner.email,
        firstName: cleaner.firstName,
        lastName: cleaner.lastName,
        phone: cleaner.phone ?? '',
        employeeId: cleaner.employeeId ?? `CLN-${Date.now()}`,
        hireDate: cleaner.hireDate ?? new Date().toISOString().split('T')[0],
        supervisorId: cleaner.supervisorId ? Number(cleaner.supervisorId) : undefined,
      })
      .pipe(map(mapCleaner));
  }

  /** Updates an existing cleaner profile. */
  update(id: string, updates: Partial<Cleaner>): Observable<Cleaner> {
    return this.api
      .patch<ApiCleaner>(`cleaners/${id}/`, {
        email: updates.email,
        firstName: updates.firstName,
        lastName: updates.lastName,
        phone: updates.phone,
        employmentStatus: updates.employmentStatus,
        supervisorId: updates.supervisorId ? Number(updates.supervisorId) : undefined,
      })
      .pipe(map(mapCleaner));
  }

  /** Deactivates a cleaner via the backend deactivate action. */
  deactivate(id: string): Observable<Cleaner> {
    return this.api.post<ApiCleaner>(`cleaners/${id}/deactivate/`, {}).pipe(map(mapCleaner));
  }
}
