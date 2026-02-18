import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface KeycloakPrestataire {
  id: string;
  email: string;
  nom: string;
  firstName: string;
  lastName: string;
  username: string;
  enabled: boolean;
  displayName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private apiUrl = '/api/keycloak';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les prestataires depuis Keycloak
   */
  getPrestataires(): Observable<KeycloakPrestataire[]> {
    return this.http.get<KeycloakPrestataire[]>(`${this.apiUrl}/prestataires`);
  }

  /**
   * Récupère tous les utilisateurs depuis Keycloak
   */
  getUsers(): Observable<KeycloakPrestataire[]> {
    return this.http.get<KeycloakPrestataire[]>(`${this.apiUrl}/users`);
  }
}

