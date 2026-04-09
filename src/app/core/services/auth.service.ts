import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API_URL = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Re-normalise on init — covers the refresh case where stale
    // integer signInType may have been stored in a previous session.
    const storedUser = this.tokenService.getUser();
    const safeUser   = storedUser ? this.normaliseUser(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<User | null>(safeUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string, rememberMe: boolean = false): Observable<AuthResponse> {
    const loginData: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData).pipe(
      tap(response => {
        const { token, user } = response.data;

        // ── KEY FIX ──────────────────────────────────────────────
        // Backend sends signInType as integer: 0 or 1
        // Our User interface and all comparisons expect the string:
        // 'LocalityMember' or 'GovernmentOfficial'
        // We normalise it here before saving so every consumer
        // (sidebar, overview, guards) gets the correct string value.
        const normalisedUser = this.normaliseUser(user);

        this.tokenService.saveToken(token, rememberMe);
        this.tokenService.saveUser(normalisedUser, rememberMe);
        this.currentUserSubject.next(normalisedUser);

        console.log('Login successful. Role:', normalisedUser.signInType);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData).pipe(
      tap(response => {
        const { token, user } = response.data;
        const normalisedUser = this.normaliseUser(user);

        this.tokenService.saveToken(token, false);
        this.tokenService.saveUser(normalisedUser, false);
        this.currentUserSubject.next(normalisedUser);

        console.log('Registration successful. Role:', normalisedUser.signInType);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.tokenService.removeToken();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    if (!token) return false;
    return !this.tokenService.isTokenExpired(token);
  }

  isGovernmentOfficial(): boolean {
    return this.currentUserValue?.signInType === 'GovernmentOfficial';
  }

  isLocalityMember(): boolean {
    return this.currentUserValue?.signInType === 'LocalityMember';
  }

  // ── Normalise user from backend ──────────────────────────────
  // Backend sends SignInType as an integer enum value (0 or 1).
  // We convert it to the string form our frontend uses everywhere.
  // Called at login, register, AND on init (refresh safety).
  normaliseUser(user: any): User {
    let signInType: 'LocalityMember' | 'GovernmentOfficial';

    if (user.signInType === 1 || user.signInType === 'GovernmentOfficial') {
      signInType = 'GovernmentOfficial';
    } else {
      signInType = 'LocalityMember';
    }

    return {
      ...user,
      signInType
    } as User;
  }
}