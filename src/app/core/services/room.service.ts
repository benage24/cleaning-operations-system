import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Room, RoomStatus } from '../models';
import { PaginatedResponse } from '../models/api.model';
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

  /** Returns all rooms from the API. */
  getAll(): Observable<Room[]> {
    return this.api.get<PaginatedResponse<ApiRoom>>('rooms/').pipe(
      map((response) => response.results.map(mapRoom)),
    );
  }

  /** Returns a single room by id. */
  getById(id: string): Observable<Room | undefined> {
    return this.api.get<ApiRoom>(`rooms/${id}/`).pipe(map(mapRoom));
  }

  /** Finds a room by its QR code. */
  getByQrCode(qrCode: string): Observable<Room | undefined> {
    return this.api.get<ApiRoom>(`rooms/by-qr/${encodeURIComponent(qrCode)}/`).pipe(map(mapRoom));
  }

  /** Creates a new room. */
  create(room: Partial<Room>): Observable<Room> {
    return this.api
      .post<ApiRoom>('rooms/', {
        number: room.number,
        name: room.name ?? `Room ${room.number}`,
        building: room.building ?? 'Main Building',
        floor: room.floor ?? 'Floor 1',
        department: room.department,
        status: room.status ?? 'dirty',
        qrCode: room.qrCode ?? `QR-R${room.number}`,
        locationId: room.locationId ? Number(room.locationId) : undefined,
        deadline: room.deadline,
      })
      .pipe(map(mapRoom));
  }

  /** Updates a room status. */
  updateStatus(id: string, status: RoomStatus): Observable<Room> {
    return this.api.patch<ApiRoom>(`rooms/${id}/status/`, { status }).pipe(map(mapRoom));
  }
}
