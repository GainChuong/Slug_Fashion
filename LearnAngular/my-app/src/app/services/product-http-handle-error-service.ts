import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Product } from '../classes/IProduct';
import { catchError, map, Observable, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductHttpHandleErrorService {
  private _url: string = "dataset/product.json"

  constructor(private _http: HttpClient) {}

  getProductList(): Observable<Product[]> {
    return this._http.get<Product[]>(this._url)
      .pipe(
        retry(3),
        catchError(this.handleError)
      )
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.getProductList().pipe(
      map((products: Product[]) => products.find(p => p.id === id)),
      catchError(this.handleError)
    );
  }

handleError(error: HttpErrorResponse)
{
  let errorMessage = 'An unknown error occurred!';
  if (error.error instanceof ErrorEvent) {
    // 1. Client-side error (e.g., network issues, subscription errors)
    errorMessage = `Client-side error: ${error.error.message}`;
  } else {
    // 2. Server-side error (e.g., 404 Not Found, 500 Internal Server Error)
    errorMessage = `
      Error Status: ${error.status}
      Status Text: ${error.statusText}
      URL: ${error.url}
      Server Details: ${error.error ? JSON.stringify(error.error) : 'No details available'}
    `;
  }
  // Log to console for debugging purposes
  console.error(errorMessage);
  // Return detailed error message to be handled by the Component
  return throwError(() => new Error(errorMessage));
}
}