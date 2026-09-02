import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN';
  avatarUrl?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');
  tokenKey = 'technyks_auth_token';
  userKey = 'technyks_auth_user';

  constructor() {
    this.loadInitialUser();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  private loadInitialUser() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem(this.userKey);
      if (savedUser) {
        try {
          this.currentUser.set(JSON.parse(savedUser));
        } catch (e) {}
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(res => this.setSession(res)),
    );
  }

  signup(data: { email: string; password: string; name: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/signup', data).pipe(
      tap(res => this.setSession(res)),
    );
  }

  getPublicAuthConfig(): Observable<{ googleClientId: string | null }> {
    return this.http.get<{ googleClientId: string | null }>('/api/auth/config');
  }

  loginWithGoogle(credential: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/google', { credential })
      .pipe(tap((response) => this.setSession(response)));
  }

  private setSession(res: AuthResponse) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, res.accessToken);
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string; resetToken?: string }>('/api/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword?: string) {
    return this.http.post<{ message: string }>('/api/auth/reset-password', { token, newPassword });
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
