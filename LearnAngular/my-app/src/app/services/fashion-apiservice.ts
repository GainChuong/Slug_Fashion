import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Fashion } from '../classes/Fashion';

@Injectable({
  providedIn: 'root',
})
export class FashionAPIService {
  constructor(private _http: HttpClient) {}

  getFashions(style?: string): Observable<Fashion[]> {
    const url = style ? `/fashions?style=${encodeURIComponent(style)}` : '/fashions';
    return this._http.get<Fashion[]>(url).pipe(
      map((fashions) => fashions.map((fashion) => Object.assign(new Fashion(), fashion))),
      retry(3),
      catchError(this.handleError)
    );
  }

  getStyles(): Observable<string[]> {
    return this._http.get<string[]>('/fashions/styles/all').pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  getFashion(id: string): Observable<Fashion> {
    return this._http.get<Fashion>(`/fashions/${encodeURIComponent(id)}`).pipe(
      map((fashion) => Object.assign(new Fashion(), fashion)),
      retry(3),
      catchError(this.handleError)
    );
  }

  postFashion(fashion: Fashion): Observable<Fashion> {
    return this._http.post<Fashion>('/fashions', fashion).pipe(
      map((savedFashion) => Object.assign(new Fashion(), savedFashion)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }

  putFashion(fashion: Fashion): Observable<Fashion> {
    return this._http.put<Fashion>('/fashions', fashion).pipe(
      map((savedFashion) => Object.assign(new Fashion(), savedFashion)),
      retry(3),
      catchError(this.handleError)
    );
  }

  deleteFashion(id: string): Observable<Fashion> {
    return this._http.delete<Fashion>(`/fashions/${encodeURIComponent(id)}`).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
}
