import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Cleaner, EmploymentStatus } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class CleanerService {
  private readonly mockData = inject(MockDataService);

  getAll(): Observable<Cleaner[]> {
    return of([...this.mockData.cleaners]).pipe(delay(200));
  }

  getById(id: string): Observable<Cleaner | undefined> {
    return of(this.mockData.cleaners.find((c) => c.id === id)).pipe(delay(150));
  }

  create(cleaner: Partial<Cleaner>): Observable<Cleaner> {
    const newCleaner: Cleaner = {
      id: `u${Date.now()}`,
      email: cleaner.email ?? '',
      firstName: cleaner.firstName ?? '',
      lastName: cleaner.lastName ?? '',
      role: 'cleaner',
      phone: cleaner.phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      employeeId: cleaner.employeeId ?? `CLN-${Date.now()}`,
      employmentStatus: cleaner.employmentStatus ?? 'active',
      hireDate: cleaner.hireDate ?? new Date().toISOString().split('T')[0],
      performanceScore: 0,
      supervisorId: cleaner.supervisorId,
    };
    this.mockData.cleaners.push(newCleaner);
    return of(newCleaner).pipe(delay(300));
  }

  update(id: string, updates: Partial<Cleaner>): Observable<Cleaner> {
    const index = this.mockData.cleaners.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Cleaner not found');
    this.mockData.cleaners[index] = { ...this.mockData.cleaners[index], ...updates };
    return of(this.mockData.cleaners[index]).pipe(delay(300));
  }

  deactivate(id: string): Observable<Cleaner> {
    return this.update(id, { employmentStatus: 'inactive' as EmploymentStatus, isActive: false });
  }
}
