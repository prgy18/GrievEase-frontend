
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'grievease_token';
  private readonly REFRESH_TOKEN_KEY = 'grievease_refresh_token';
  private readonly USER_KEY = 'grievease_user';

  constructor() {}

  /**
   * Save JWT token to localStorage or sessionStorage
   */
  saveToken(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get JWT token from storage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Remove token from storage
   */
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  /**
   * Save refresh token
   */
  saveRefreshToken(refreshToken: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    } else {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY) || sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Save user data to storage
   */
  saveUser(user: any, rememberMe: boolean = false): void {
    const userStr = JSON.stringify(user);
    if (rememberMe) {
      localStorage.setItem(this.USER_KEY, userStr);
    } else {
      sessionStorage.setItem(this.USER_KEY, userStr);
    }
  }

  /**
   * Get user data from storage
   */
  getUser(): any | null {
    const userStr = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token?: string): any | null {
    const tokenToUse = token || this.getToken();
    if (!tokenToUse) return null;

    try {
      const payload = tokenToUse.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);

    return expirationDate < new Date();
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(token?: string): Date | null {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);
    return expirationDate;
  }
}