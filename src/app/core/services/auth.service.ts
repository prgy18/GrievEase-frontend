import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { TokenService } from './token.service';
import { User, AuthResponse, LoginRequest, RegisterRequest, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({                                     //service decorations creating a global instance 
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Initialize current user from storage
    this.currentUserSubject = new BehaviorSubject<User | null>(
      this.tokenService.getUser()
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Get current user value
   */
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login user
   */
  // login(email: string, password: string, rememberMe: boolean = false): Observable<AuthResponse> {
  //   const loginData: LoginRequest = { email, password };

  //   return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData)
  //     .pipe(
  //       tap(response => {
  //         // Save token and user to storage
  //         this.tokenService.saveToken(response.token, rememberMe);
  //         this.tokenService.saveUser(response.user, rememberMe);
          
  //         if (response.refreshToken) {
  //           this.tokenService.saveRefreshToken(response.refreshToken, rememberMe);
  //         }

  //         // Update current user
  //         this.currentUserSubject.next(response.user);

  //         console.log('Login successful:', response.user.email);
  //       }),
  //       catchError(error => {
  //         console.error('Login error:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }
  /**
 * Login user
 */
login(email: string, password: string, rememberMe: boolean = false): Observable<AuthResponse> {
  const loginData: LoginRequest = { email, password };

  return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, loginData)
    .pipe(
      tap(response => {
        console.log('Login API Response:', response);
        
        // Extract data from wrapped response
        const { token, user } = response.data;
        
        // Save token and user to storage
        this.tokenService.saveToken(token, rememberMe);
        this.tokenService.saveUser(user, rememberMe);

        // Update current user
        this.currentUserSubject.next(user);

        console.log('Login successful:', user.email);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
}

  /**
   * Register new user
   */
  // register(registerData: RegisterRequest): Observable<AuthResponse> {
  //   return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData)
  //     .pipe(
  //       tap(response => {
  //         // Save token and user to storage
  //         this.tokenService.saveToken(response.token, false);
  //         this.tokenService.saveUser(response.user, false);
          
  //         if (response.refreshToken) {
  //           this.tokenService.saveRefreshToken(response.refreshToken, false);
  //         }

  //         // Update current user
  //         this.currentUserSubject.next(response.user);

  //         console.log('Registration successful:', response.user.email);
  //       }),
  //       catchError(error => {
  //         console.error('Registration error:', error);
  //         return throwError(() => error);
  //       })
  //     );
  // }
/**
 * Register new user
 */
register(registerData: RegisterRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, registerData)
    .pipe(
      tap(response => {
        console.log('Registration API Response:', response);
        
        // Extract data from wrapped response
        const { token, user } = response.data;
        
        // Save token and user to storage
        this.tokenService.saveToken(token, false);
        this.tokenService.saveUser(user, false);

        // Update current user
        this.currentUserSubject.next(user);

        console.log('Registration successful:', user.email);
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
}
  /**
   * Logout user
   */
  logout(): void {
    // Clear storage
    this.tokenService.removeToken();

    // Update current user
    this.currentUserSubject.next(null);

    console.log('User logged out');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.tokenService.getToken();
    if (!token) return false;

    // Check if token is expired
    return !this.tokenService.isTokenExpired(token);
  }

  /**
   * Get current user's role
   */
  getUserRole(): UserRole | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.Admin);
  }

  /**
   * Check if user is government official
   */
  isGovernmentOfficial(): boolean {
    return this.hasRole(UserRole.GovernmentOfficial);
  }

  /**
   * Check if user is locality member
   */
  isLocalityMember(): boolean {
    return this.hasRole(UserRole.LocalityMember);
  }

  /**
   * Get user profile from server
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/auth/profile`)
      .pipe(
        tap(user => {
          // Update stored user data
          this.tokenService.saveUser(user, true);
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Error fetching profile:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Refresh authentication token
   */
  // refreshToken(): Observable<AuthResponse> {
  //   const refreshToken = this.tokenService.getRefreshToken();
    
  //   if (!refreshToken) {
  //     return throwError(() => new Error('No refresh token available'));
  //   }

  //   return this.http.post<AuthResponse>(`${this.API_URL}/auth/refresh`, { refreshToken })
  //     .pipe(
  //       tap(response => {
  //         // Update token
  //         this.tokenService.saveToken(response.token, true);
          
  //         if (response.refreshToken) {
  //           this.tokenService.saveRefreshToken(response.refreshToken, true);
  //         }

  //         console.log('Token refreshed successfully');
  //       }),
  //       catchError(error => {
  //         console.error('Token refresh error:', error);
  //         this.logout();
  //         return throwError(() => error);
  //       })
  //     );
  // }

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/verify-email`, { token })
      .pipe(
        catchError(error => {
          console.error('Email verification error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Request password reset
   */
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/forgot-password`, { email })
      .pipe(
        catchError(error => {
          console.error('Forgot password error:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/reset-password`, { token, newPassword })
      .pipe(
        catchError(error => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }
}
