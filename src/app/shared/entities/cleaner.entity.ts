/**
 * Entity representing cleaner form and create-request data.
 * Used when adding or editing a cleaner before it is persisted via the API.
 */
export class CleanerEntity {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  supervisorId?: string;
  employeeId?: string;
  hireDate?: string;

  constructor(init?: Partial<CleanerEntity>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  /** Returns a new entity with empty field values. */
  static empty(): CleanerEntity {
    return new CleanerEntity();
  }

  /** True when required fields for creation are filled. */
  isValid(): boolean {
    return Boolean(this.firstName.trim() && this.lastName.trim() && this.email.trim());
  }

  /**
   * Applies defaults required by the create API before posting.
   * Call this in the component after the form is filled.
   */
  prepareForCreate(supervisorId?: string): this {
    this.firstName = this.firstName.trim();
    this.lastName = this.lastName.trim();
    this.email = this.email.trim();
    this.phone = this.phone?.trim() ?? '';
    this.employeeId = this.employeeId?.trim() || `CLN-${Date.now()}`;
    this.hireDate = this.hireDate || new Date().toISOString().split('T')[0];
    this.supervisorId = supervisorId;
    return this;
  }

  /**
   * Builds the exact JSON body expected by POST /api/cleaners/.
   * Only includes whitelisted API fields with correct types.
   */
  toCreatePayload(): Record<string, string | number> {
    const payload: Record<string, string | number> = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone ?? '',
      employeeId: this.employeeId!,
      hireDate: this.hireDate!,
    };

    if (this.supervisorId) {
      payload['supervisorId'] = Number(this.supervisorId);
    }

    return payload;
  }

  /** Resets all fields to their default empty values. */
  reset(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.phone = '';
    this.supervisorId = undefined;
    this.employeeId = undefined;
    this.hireDate = undefined;
  }
}
