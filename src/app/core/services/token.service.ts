
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
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    if (rememberMe) {
      console.log("Inside save Token and remeber me true");
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      console.log("Inside save Token and remeber me false");
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Get JWT token from storage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY)
        ?? sessionStorage.getItem(this.TOKEN_KEY);
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
    localStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.USER_KEY);
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
  /**
 * Get user data from storage
 */
getUser(): any | null {
  const userStr = localStorage.getItem(this.USER_KEY)
             ?? sessionStorage.getItem(this.USER_KEY);
  
  // Check if userStr exists and is not 'undefined' string
  if (userStr && userStr !== 'undefined' && userStr !== 'null') {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data, clearing corrupted data:', error);
      // Clear corrupted data
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
  return null;
}

  /**
   * Decode JWT token payload
   */
  // decodeToken(token?: string): any | null {
  //   const tokenToUse = token || this.getToken();
  //   if (!tokenToUse) return null;

  //   try {
  //     const payload = tokenToUse.split('.')[1];
  //     return JSON.parse(atob(payload));
  //   } catch (error) {
  //     console.error('Error decoding token:', error);
  //     return null;
  //   }
  // }
   /**
 * Decode JWT token payload
 */
/**
 * Decode JWT token payload - ENHANCED VERSION
 */
decodeToken(token?: string): any | null {
  let tokenToUse = token || this.getToken();
  
  // Check if token exists
  if (!tokenToUse) {
    console.log('No token found in storage');
    return null;
  }
  
  // Check for corrupted token strings
  if (tokenToUse === 'undefined' || tokenToUse === 'null' || tokenToUse.trim() === '') {
    console.warn('Corrupted token detected, clearing storage');
    this.removeToken();
    return null;
  }

  try {
    // Remove 'Bearer ' prefix if present
    tokenToUse = tokenToUse.replace('Bearer ', '').trim();
    
    // Log token for debugging (first 20 chars only for security)
    console.log('Decoding token:', tokenToUse.substring(0, 20) + '...');
    
    // Split token and get payload (middle part)
    const parts = tokenToUse.split('.');
    
    if (parts.length !== 3) {
      console.error('Invalid JWT token format. Expected 3 parts, got:', parts.length);
      console.error('Token parts:', parts);
      // Clear invalid token
      this.removeToken();
      return null;
    }
    
    const payload = parts[1];
    
    // Decode base64url to base64 (handle URL-safe characters)
    let base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    
    // Decode and parse
    const decoded = atob(base64);
    const parsed = JSON.parse(decoded);
    
    console.log('Token decoded successfully:', parsed);
    return parsed;
  } catch (error) {
    console.error('Error decoding token:', error);
    console.error('Token that failed:', tokenToUse);
    // Clear corrupted token
    this.removeToken();
    return null;
  }
}
  /**
   * Check if token is expired
   */
 /**
 * Check if token is expired
 */
isTokenExpired(token?: string): boolean {
  const decoded = this.decodeToken(token);
  
  // If decoding failed or no expiry, consider expired
  if (!decoded || !decoded.exp) {
    return true;
  }

  try {
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decoded.exp);
    const isExpired = expirationDate < new Date();
    
    console.log('Token expiry check:', {
      expiresAt: expirationDate.toISOString(),
      isExpired: isExpired
    });
    
    return isExpired;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    return true;
  }
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