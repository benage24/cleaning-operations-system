import { Room, RoomStatus } from '../../core/models';

const ROOM_STATUSES: RoomStatus[] = [
  'clean',
  'dirty',
  'in_progress',
  'pending_verification',
  'overdue',
];

/**
 * Entity representing room form and create-request data.
 */
export class RoomEntity {
  number = '';
  name = '';
  building = 'Main Building';
  floor = 'Floor 1';
  department = '';
  status: RoomStatus = 'dirty';
  qrCode = '';
  locationId = '';
  deadline?: string;

  constructor(init?: Partial<RoomEntity>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  static empty(): RoomEntity {
    return new RoomEntity();
  }

  /** Creates an entity from an existing room for edit forms. */
  static fromRoom(room: Room): RoomEntity {
    return new RoomEntity({
      number: room.number,
      name: room.name,
      building: room.building,
      floor: room.floor,
      department: room.department ?? '',
      status: room.status,
      qrCode: room.qrCode,
      locationId: room.locationId,
      deadline: room.deadline,
    });
  }

  static statuses(): RoomStatus[] {
    return [...ROOM_STATUSES];
  }

  isValid(): boolean {
    return Boolean(this.number.trim() && this.building.trim() && this.floor.trim());
  }

  /**
   * Applies defaults required by POST /api/rooms/ before posting.
   */
  prepareForCreate(locationId?: string): this {
    this.number = this.number.trim();
    this.building = this.building.trim();
    this.floor = this.floor.trim();
    this.department = this.department?.trim() ?? '';
    this.name = this.name.trim() || `Room ${this.number}`;
    this.qrCode = this.qrCode.trim() || `QR-R${this.number}`;
    this.status = this.status || 'dirty';
    this.locationId = locationId ?? this.locationId;
    return this;
  }

  /** Normalizes values before PUT/PATCH /api/rooms/{id}/. */
  prepareForUpdate(): this {
    this.number = this.number.trim();
    this.building = this.building.trim();
    this.floor = this.floor.trim();
    this.department = this.department?.trim() ?? '';
    this.name = this.name.trim() || `Room ${this.number}`;
    this.qrCode = this.qrCode.trim() || `QR-R${this.number}`;
    return this;
  }

  /** Builds the JSON body for POST /api/rooms/. */
  toCreatePayload(): Record<string, string | number> {
    return this.toPayload();
  }

  /** Builds the JSON body for PUT/PATCH /api/rooms/{id}/. */
  toUpdatePayload(): Record<string, string | number> {
    return this.toPayload();
  }

  private toPayload(): Record<string, string | number> {
    const payload: Record<string, string | number> = {
      number: this.number,
      name: this.name,
      building: this.building,
      floor: this.floor,
      status: this.status,
      qrCode: this.qrCode,
      locationId: Number(this.locationId),
    };

    if (this.department) {
      payload['department'] = this.department;
    }

    if (this.deadline) {
      payload['deadline'] = this.deadline;
    }

    return payload;
  }

  reset(): void {
    this.number = '';
    this.name = '';
    this.building = 'Main Building';
    this.floor = 'Floor 1';
    this.department = '';
    this.status = 'dirty';
    this.qrCode = '';
    this.locationId = '';
    this.deadline = undefined;
  }
}
