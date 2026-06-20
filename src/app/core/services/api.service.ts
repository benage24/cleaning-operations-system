import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { parseHttpError } from '../utils/http-error.util';

type QueryParams = Record<string, string | number | boolean>;

/**
 * Thin HTTP abstraction over Angular HttpClient.
 * All feature services should use this class for API calls so errors
 * are handled consistently in one place.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Sends a GET request to the API. */
  get<T>(endpoint: string, params?: QueryParams): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(endpoint), { params: this.toHttpParams(params) })
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Sends a POST request to the API. */
  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(endpoint), body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Sends a PUT request to the API. */
  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(endpoint), body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Sends a PATCH request to the API. */
  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(endpoint), body)
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Sends a DELETE request to the API. */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(endpoint))
      .pipe(catchError((error) => this.handleError(error)));
  }

  /** Builds a full API URL from a relative endpoint path. */
  private buildUrl(endpoint: string): string {
    const normalized = endpoint.replace(/^\//, '');
    return `${this.baseUrl}/${normalized}`;
  }

  /** Converts a plain object into HttpParams for query strings. */
  private toHttpParams(params?: QueryParams): HttpParams | undefined {
    if (!params) {
      return undefined;
    }

    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }

  /** Maps HTTP failures to a standard Error observable. */
  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error(parseHttpError(error)));
  }
}
