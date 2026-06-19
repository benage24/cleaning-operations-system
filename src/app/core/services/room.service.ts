import { Injectable, inject } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Room, RoomStatus } from '../models';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private readonly mockData = inject(MockDataService);

  getAll(): Observable<Room[]> {
    return of([...this.mockData.rooms]).pipe(delay(200));
  }

  getById(id: string): Observable<Room | undefined> {
    return of(this.mockData.rooms.find((r) => r.id === id)).pipe(delay(150));
  }

  getByQrCode(qrCode: string): Observable<Room | undefined> {
    return of(this.mockData.rooms.find((r) => r.qrCode === qrCode)).pipe(delay(150));
  }

  create(room: Partial<Room>): Observable<Room> {
    const newRoom: Room = {
      id: `r${Date.now()}`,
      number: room.number ?? '',
      name: room.name ?? `Room ${room.number}`,
      building: room.building ?? 'Main Building',
      floor: room.floor ?? 'Floor 1',
      department: room.department,
      status: 'dirty' as RoomStatus,
      qrCode: `QR-R${room.number}`,
      locationId: room.locationId ?? 'loc2',
      deadline: room.deadline,
    };
    this.mockData.rooms.push(newRoom);
    return of(newRoom).pipe(delay(300));
  }

  updateStatus(id: string, status: RoomStatus): Observable<Room> {
    const room = this.mockData.rooms.find((r) => r.id === id);
    if (!room) throw new Error('Room not found');
    room.status = status;
    return of(room).pipe(delay(200));
  }
}
