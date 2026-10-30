import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

export interface AuthUser {
  username: string;
  role?: string;
}

interface SessionResponse {
  user: AuthUser | null;
}

interface LoginResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<AuthUser | null>(null);

  constructor(private http: HttpClient) {}

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/user-login', credentials)
      .pipe(tap((response) => {
        sessionStorage.setItem('access_token', response.accessToken);
        this.currentUser.set(response.user);
      }));
  }

  restoreSession(): Observable<SessionResponse> {
    if (!sessionStorage.getItem('access_token')) {
      this.currentUser.set(null);
      return of({ user: null });
    }

    return this.http
      .get<SessionResponse>('/user-session')
      .pipe(
        tap((response) => this.currentUser.set(response.user)),
        catchError((error: unknown) => {
          sessionStorage.removeItem('access_token');
          this.currentUser.set(null);
          return throwError(() => error);
        })
      );
  }

  logout(): Observable<void> {
    if (!sessionStorage.getItem('access_token')) {
      this.currentUser.set(null);
      return of(void 0);
    }

    return this.http.post<void>('/user-logout', {}).pipe(
      tap(() => {
        sessionStorage.removeItem('access_token');
        this.currentUser.set(null);
      })
    );
  }
}
