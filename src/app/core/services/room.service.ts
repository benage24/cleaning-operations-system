import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room, RoomStatus } from '../models';
import { PaginatedResponse } from '../models/api.model';
import { RoomEntity } from '../../shared/entities';
import { ApiService } from './api.service';

type ApiRoom = Omit<Room, 'id' | 'locationId'> & { id: number; locationId: number };

/** Maps a room payload from the API into the app Room model. */
function mapRoom(room: ApiRoom): Room {
  return {
    ...room,
    id: String(room.id),
    locationId: String(room.locationId),
  };
}

/**
 * Loads and manages room data from the backend API.
 */
@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly api = inject(ApiService);

  /** GET /api/rooms/ */
  getAll(): Observable<Room[]> {
    return this.api.get<PaginatedResponse<ApiRoom>>('rooms/').pipe(
      map((response) => response.results.map(mapRoom)),
    );
  }

  /** GET /api/rooms/{id}/ */
  getById(id: string): Observable<Room> {
    return this.api.get<ApiRoom>(`rooms/${id}/`).pipe(map(mapRoom));
  }

  /** GET /api/rooms/by-qr/{qr_code}/ */
  getByQrCode(qrCode: string): Observable<Room> {
    return this.api
      .get<ApiRoom>(`rooms/by-qr/${encodeURIComponent(qrCode)}/`)
      .pipe(map(mapRoom));
  }

  /** POST /api/rooms/ */
  create(room: RoomEntity): Observable<Room> {
    return this.api.post<ApiRoom>('rooms/', room.toCreatePayload()).pipe(map(mapRoom));
  }

  /** PUT /api/rooms/{id}/ */
  update(id: string, room: RoomEntity): Observable<Room> {
    return this.api.put<ApiRoom>(`rooms/${id}/`, room.toUpdatePayload()).pipe(map(mapRoom));
  }

  /** PATCH /api/rooms/{id}/ */
  partialUpdate(id: string, room: Partial<RoomEntity>): Observable<Room> {
    const payload: Record<string, string | number> = {};

    if (room.number !== undefined) payload['number'] = room.number;
    if (room.name !== undefined) payload['name'] = room.name;
    if (room.building !== undefined) payload['building'] = room.building;
    if (room.floor !== undefined) payload['floor'] = room.floor;
    if (room.department !== undefined) payload['department'] = room.department;
    if (room.status !== undefined) payload['status'] = room.status;
    if (room.qrCode !== undefined) payload['qrCode'] = room.qrCode;
    if (room.locationId !== undefined) payload['locationId'] = Number(room.locationId);
    if (room.deadline !== undefined) payload['deadline'] = room.deadline;

    return this.api.patch<ApiRoom>(`rooms/${id}/`, payload).pipe(map(mapRoom));
  }

  /** DELETE /api/rooms/{id}/ */
  delete(id: string): Observable<void> {
    return this.api.delete<void>(`rooms/${id}/`);
  }

  /** PATCH /api/rooms/{id}/status/ */
  updateStatus(id: string, status: RoomStatus): Observable<Room> {
    return this.api.patch<ApiRoom>(`rooms/${id}/status/`, { status }).pipe(map(mapRoom));
  }
}
