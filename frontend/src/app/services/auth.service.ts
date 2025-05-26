import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/users`;
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  private isBrowser: boolean;

  constructor(private http: HttpClient) {
    // Vérifier si le code s'exécute dans un navigateur
    this.isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

    if (this.isBrowser) {
      this.loadStoredUser();
    }
  }

  // Charger l'utilisateur stocké dans localStorage au démarrage
  private loadStoredUser(): void {
    if (!this.isBrowser) return;

    const storedToken = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);

    if (storedToken && storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Inscription d'un utilisateur
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { username, email, password }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Erreur d\'inscription:', error);
        return of(null);
      })
    );
  }

  // Connexion d'un utilisateur
  login(email: string, password: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => this.handleAuthentication(response)),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return of(null);
      })
    );
  }

  // Traitement de l'authentification réussie
  private handleAuthentication(response: AuthResponse): void {
    if (response && response.token) {
      // Stocker le token et les données utilisateur uniquement si on est dans un navigateur
      if (this.isBrowser) {
        localStorage.setItem(this.tokenKey, response.token);
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      }

      // Mettre à jour le subject
      this.userSubject.next(response.user);
    }
  }

  // Déconnexion
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.userSubject.next(null);
  }

  // Vérifier si l'utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.userSubject.value;
  }

  // Obtenir le token d'authentification
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.tokenKey);
  }

  // Obtenir l'utilisateur connecté
  getCurrentUser(): any {
    return this.userSubject.value;
  }
}
