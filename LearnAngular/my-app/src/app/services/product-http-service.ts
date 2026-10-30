import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Product } from '../classes/IProduct';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable()
export class ProductHttpService {
    private _url = 'dataset/product.json';

    constructor(private http: HttpClient) { }

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this._url);
    }
    handleError(error: HttpErrorResponse) {
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
    getProductById(id: number): Observable<Product | undefined> {
        return this.getProducts().pipe(
            map((products: Product[]) => products.find(p => p.id === id)),
            catchError(this.handleError)
        );
    }
}
