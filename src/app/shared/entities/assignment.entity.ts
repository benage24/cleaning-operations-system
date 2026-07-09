/**
 * Entity representing assignment form data before posting to the API.
 */
export class AssignmentEntity {
  cleanerId = '';
  roomId: string[] = [];
  assignedBy?: string;

  constructor(init?: Partial<AssignmentEntity>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  /** Returns a new entity with empty field values. */
  static empty(): AssignmentEntity {
    return new AssignmentEntity();
  }

  /** True when required fields for bulk assignment are filled. */
  isValid(): boolean {
    return Boolean(this.cleanerId && this.roomId.length > 0);
  }

  /**
   * Builds the JSON body for POST /api/assignments/bulk-assign/.
   * The API expects roomIds (array) and cleanerId — not roomId.
   * assignedBy is set server-side from the authenticated user.
   */
  toBulkAssignPayload(): Record<string, number | number[]> {
    return {
      roomIds: this.roomId.map(Number),
      cleanerId: Number(this.cleanerId),
    };
  }

  /** Resets all fields to their default empty values. */
  reset(): void {
    this.cleanerId = '';
    this.roomId = [];
    this.assignedBy = undefined;
  }
}
