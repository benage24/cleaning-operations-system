/** Standard paginated list shape returned by Django REST Framework. */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
