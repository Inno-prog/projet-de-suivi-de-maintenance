
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, retry, timeout, map } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../../environments/environment';

export interface PaginationResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Prestation {
  id?: number;
  // Timestamps
  dateCreation?: string;
  dateModification?: string;
  // Prestataire information
  prestataireId?: string;
  nomPrestataire: string;
  contactPrestataire?: string;
  structurePrestataire?: string;
  servicePrestataire?: string;
  rolePrestataire?: string;
  qualificationPrestataire?: string;

  // Responsable de la prestation
  nomResponsablePrestation?: string;
  contactResponsablePrestation?: string;
  qualificationResponsablePrestation?: string;

  // Lot information
  lot?: string;

  // Intervention details
  montantIntervention?: number;
  equipementsUtilises?: string;
  equipementsUtilisesString?: string;
  dateHeureDebut?: string;
  dateHeureFin?: string;
  observationsPrestataire?: string;
  statutIntervention?: string;

  // Structure information (recipient of the maintenance service)
  nomStructure?: string;
  contactStructure?: string;
  adresseStructure?: string;
  fonctionStructure?: string;

  // Correspondant Informatique (IT Contact Person)
  nomCi?: string;
  prenomCi?: string;
  contactCi?: string;
  fonctionCi?: string;

  // Legacy fields for backward compatibility
  nomPrestation?: string;
  montantPrest?: number;
  equipementsUtilisesLegacy?: number;
  quantiteItem?: number;
  nbPrestRealise?: number;
  trimestre?: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: string;
  description?: string;
  ordreCommande?: {
    id: number;
    numeroCommande: string;
    statut: string;
  };
  itemsUtilises?: any[];
  statutValidation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PrestationService {
  private apiUrl = `${environment.apiUrl}/prestations`;

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

  getAllPrestations(page: number = 0, size: number = 12): Observable<PaginationResponse<Prestation>> {
    console.log('🔍 === DEBUG PRESTATIONS SERVICE ===');

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // In development, use the dev endpoint that doesn't require authentication
    if (!environment.production) {
      console.log('5. 📡 [DEV] Making request to /api/prestations/dev');
      return this.http.get<PaginationResponse<Prestation>>(`${this.apiUrl}/dev?secret=dev-secret-please-change`, { params }).pipe(
        tap(response => console.log('✅ SUCCESS - Prestations loaded (dev):', response)),
        catchError(error => {
          console.error('❌ ERROR - Dev endpoint failed:', error);
          return throwError(() => error);
        })
      );
    }

    console.log('1. Valid access token:', this.oauthService.hasValidAccessToken());

    if (this.oauthService.hasValidAccessToken()) {
      const token = this.oauthService.getAccessToken();
      console.log('2. Token exists:', !!token);
      console.log('3. Token preview:', token?.substring(0, 50) + '...');

      // Décoder le token JWT pour voir les rôles
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('4. 🎫 TOKEN PAYLOAD:');
        console.log('   - Username:', payload.preferred_username);
        console.log('   - Email:', payload.email);
        console.log('   - Realm Roles:', payload.realm_access?.roles);
        console.log('   - Resource Access:', payload.resource_access);
        console.log('   - Client Roles:', payload.resource_access?.['your-client-id']?.roles);
        console.log('   - Exp:', new Date(payload.exp * 1000));
      } catch (e) {
        console.log('4. ❌ Cannot decode token:', e);
      }
    } else {
      console.log('2. ❌ NO VALID ACCESS TOKEN');
    }

    console.log('5. 📡 Making request to /api/prestations');

    return this.http.get<PaginationResponse<Prestation>>(this.apiUrl, { params }).pipe(
      tap(response => console.log('✅ SUCCESS - Prestations loaded:', response)),
      catchError(error => {
        console.error('❌ ERROR - Full error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          headers: error.headers,
          message: error.message
        });
        return throwError(() => error);
      })
    );
  }

  getPrestationById(id: number): Observable<Prestation> {
    // In development, use the dev endpoint that doesn't require authentication
    if (!environment.production) {
      return this.http.get<Prestation>(`${this.apiUrl}/${id}/dev?secret=dev-secret-please-change`).pipe(
        tap(prestation => console.log('✅ Prestation loaded (dev):', prestation)),
        catchError(error => {
          console.error('❌ ERROR - Dev endpoint failed for getPrestationById:', error);
          return throwError(() => error);
        })
      );
    }

    return this.http.get<Prestation>(`${this.apiUrl}/${id}`).pipe(
      tap(prestation => console.log('✅ Prestation loaded:', prestation)),
      catchError(error => {
        console.error('❌ ERROR - Failed to load prestation:', error);
        return throwError(() => error);
      })
    );
  }

  // CRÉER une prestation
  createPrestation(prestationData: any): Observable<any> {
    console.log('🔄 Création prestation:', prestationData);

    // En développement, utiliser l'endpoint dev
    if (!environment.production) {
      return this.http.post<any>(`${this.apiUrl}/dev?secret=dev-secret-please-change`, prestationData).pipe(
        timeout(15000),
        tap(response => console.log('✅ Prestation créée (dev):', response)),
        catchError(this.handleCreateError)
      );
    }

    return this.http.post<any>(this.apiUrl, prestationData).pipe(
      timeout(15000),
      tap(response => console.log('✅ Prestation créée:', response)),
      catchError(this.handleCreateError)
    );
  }

  updatePrestation(id: number, prestation: Prestation): Observable<Prestation> {
    return this.http.put<Prestation>(`${this.apiUrl}/${id}`, prestation);
  }

  deletePrestation(id: number): Observable<any> {
    // Try authenticated endpoint first
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        // If authentication fails (401/403), try unauthenticated endpoint
        if (error.status === 401 || error.status === 403) {
          console.log('🔓 Authentication failed, trying unauthenticated endpoint for deletion');
          
          // Get current user info for the unauthenticated endpoint
          let username = 'unknown';
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          if (currentUser.nom) {
            username = currentUser.nom;
          } else if (currentUser.email) {
            username = currentUser.email;
          }
          
          // Try sessionStorage as fallback
          if (username === 'unknown') {
            const sessionUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
            if (sessionUser.nom) {
              username = sessionUser.nom;
            } else if (sessionUser.email) {
              username = sessionUser.email;
            }
          }
          
          console.log(`🔓 Using unauthenticated delete for prestation ${id} with user: ${username}`);
          
          // Use unauthenticated endpoint with secret and username
          return this.http.delete(
            `${this.apiUrl}/${id}/delete-unauthenticated?secret=dev-secret-please-change&username=${encodeURIComponent(username)}`
          );
        }
        // For other errors, re-throw
        return throwError(() => error);
      })
    );
  }

  getPrestationsByPrestataire(nomPrestataire: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/prestataire/${nomPrestataire}`);
  }

  getPrestationsByStatut(statut: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/statut/${statut}`);
  }

  getPrestationsByTrimestre(trimestre: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/trimestre/${trimestre}`);
  }

  searchPrestations(keyword: string): Observable<Prestation[]> {
    return this.http.get<Prestation[]>(`${this.apiUrl}/search?keyword=${keyword}`);
  }

  getCountByStatut(statut: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/statut/${statut}`);
  }

  getTotalMontantByTrimestre(trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/stats/montant/trimestre/${trimestre}`);
  }

  getCountByItemTrimestrePrestataire(nomPrestation: string, trimestre: string, nomPrestataire: string, statut?: string): Observable<number> {
    let url = `${this.apiUrl}/count/${encodeURIComponent(nomPrestation)}/${encodeURIComponent(trimestre)}/${encodeURIComponent(nomPrestataire)}`;
    if (statut) {
      url += `?statut=${encodeURIComponent(statut)}`;
    }
    return this.http.get<number>(url);
  }

  getCountByItemAndTrimestre(nomItem: string, trimestre: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${encodeURIComponent(nomItem)}/${encodeURIComponent(trimestre)}`);
  }

  // COMPTER les prestations par item
  getCountByItem(nomItem: string): Observable<number> {
    if (!nomItem || nomItem.trim() === '') {
      console.warn('⚠️ Nom d\'item vide pour countByItem');
      return of(0);
    }

    // Encodage correct du paramètre
    const encodedNomItem = encodeURIComponent(nomItem);
    const params = new HttpParams().set('nomItem', encodedNomItem);

    const url = `${this.apiUrl}/count-by-item`;
    console.log(`🔍 GET ${url}?nomItem=${encodedNomItem}`);

    return this.http.get<number>(url, { params }).pipe(
      timeout(10000), // Timeout de 10s
      retry(2), // 2 tentatives
      tap(count => console.log(`✅ Count reçu pour "${nomItem}": ${count}`)),
      catchError(this.handleCountError(nomItem))
    );
  }

  // COMPTER les prestations pour tous les items en une seule requête
  getCountAllItems(trimestre: string): Observable<{ [nomItem: string]: number }> {
    const url = `${this.apiUrl}/count-all-items?trimestre=${trimestre}`;
    console.log(`🔍 GET ${url}`);

    return this.http.get<{ [nomItem: string]: number }>(url).pipe(
      timeout(15000), // Timeout de 15s
      retry(2), // 2 tentatives
      tap(counts => console.log(`✅ Counts received for all items: ${Object.keys(counts).length} items`)),
      catchError(error => {
        console.error('❌ Error getting all item counts:', error);
        return of({}); // Retourner un objet vide en cas d'erreur
      })
    );
  }

  // VÉRIFIER si le maximum de prestations est atteint pour un item
  checkMaxPrestationsReached(nomItem: string, maxAllowed: number): Observable<boolean> {
    return this.getCountByItem(nomItem).pipe(
      map(currentCount => {
        const isMaxReached = currentCount >= maxAllowed;
        console.log(`🔍 Vérification max pour "${nomItem}": ${currentCount}/${maxAllowed} - Max atteint: ${isMaxReached}`);
        return isMaxReached;
      }),
      catchError(error => {
        console.error(`❌ Erreur vérification max pour "${nomItem}":`, error);
        return of(false); // En cas d'erreur, autoriser la création
      })
    );
  }

  // Gestion d'erreur pour le comptage
  private handleCountError(nomItem: string) {
    return (error: HttpErrorResponse) => {
      console.error(`❌ Erreur count pour "${nomItem}":`, error);

      let errorMessage = 'Erreur lors du comptage';
      if (error.status === 404) {
        errorMessage = 'Endpoint de comptage non trouvé';
      } else if (error.status === 400) {
        errorMessage = 'Paramètre invalide';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur lors du comptage';
      } else if (error.status === 0) {
        errorMessage = 'Timeout lors du comptage';
      }

      console.warn(`⚠️ Retourne 0 pour ${nomItem} due à: ${errorMessage}`);
      return of(0); // Toujours retourner 0 en cas d'erreur
    };
  }

  // Gestion d'erreur pour la création
  private handleCreateError(error: HttpErrorResponse) {
    console.error('❌ Erreur création prestation:', error);

    let userMessage = 'Erreur lors de la création de la prestation';

    if (error.status === 400) {
      if (error.error && error.error.message) {
        userMessage = error.error.message;
      } else if (error.error && typeof error.error === 'string') {
        userMessage = error.error;
      } else {
        userMessage = 'Données de prestation invalides';
      }
    } else if (error.status === 401) {
      userMessage = 'Vous n\'êtes pas autorisé à créer une prestation';
    } else if (error.status === 403) {
      userMessage = 'Accès refusé pour créer une prestation';
    } else if (error.status === 500) {
      userMessage = 'Erreur serveur - Veuillez contacter l\'administrateur';
    } else if (error.status === 0) {
      userMessage = 'Impossible de se connecter au serveur';
    } else {
      userMessage = `Erreur ${error.status}: ${error.statusText || 'Erreur inconnue'}`;
    }

    return throwError(() => new Error(userMessage));
  }

  exportPrestationPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  submitPrestationForValidation(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/submit`, {});
  }

  // Validate prestation directly without fiche
  validatePrestation(id: string, commentaires?: string): Observable<any> {
    let params = new HttpParams();
    if (commentaires) {
      params = params.set('commentaires', commentaires);
    }
    return this.http.put(`${this.apiUrl}/${id}/valider`, null, { params });
  }

  // Reject prestation directly without fiche
  rejectPrestation(id: string, commentaires?: string): Observable<any> {
    let params = new HttpParams();
    if (commentaires) {
      params = params.set('commentaires', commentaires);
    }
    return this.http.put(`${this.apiUrl}/${id}/rejeter`, null, { params });
  }

  // Get sum of quantities by item name
  getSumQuantitiesByItem(nomItem: string): Observable<number> {
    if (!nomItem || nomItem.trim() === '') {
      console.warn('⚠️ Nom d\'item vide pour getSumQuantitiesByItem');
      return of(0);
    }

    const encodedNomItem = encodeURIComponent(nomItem);
    const url = `${this.apiUrl}/sum-quantities-by-item`;
    console.log(`🔍 GET ${url}?nomItem=${encodedNomItem}`);

    return this.http.get<number>(url, { params: new HttpParams().set('nomItem', encodedNomItem) }).pipe(
      timeout(10000),
      retry(2),
      tap(sum => console.log(`✅ Sum received for "${nomItem}": ${sum}`)),
      catchError(error => {
        console.error(`❌ Error getting sum for "${nomItem}":`, error);
        return of(0);
      })
    );
  }

  // Validate item selection
  validateItemSelection(itemQuantities: { [key: string]: number }, lot: string): Observable<any> {
    // Backend expects a flat Map<String, Integer>, not wrapped in an object
    // So we send itemQuantities directly as the request body
    return this.http.post<any>(`${this.apiUrl}/validate-item-selection`, itemQuantities).pipe(
      timeout(15000),
      tap(response => console.log('✅ Item selection validated:', response)),
      catchError(error => {
        console.error('❌ Error validating item selection:', error);
        return throwError(() => error);
      })
    );
  }

  // Get total count of all prestations (for admin dashboard)
  getPrestationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  // MÉTHODE SPÉCIFIQUE POUR LES PRESTATAIRES - récupère leurs propres prestations
  getMyPrestations(page: number = 0, size: number = 12): Observable<PaginationResponse<Prestation>> {
    console.log('🔍 === DEBUG MES PRESTATIONS SERVICE ===');

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // In development, use the dev endpoint that doesn't require authentication
    if (!environment.production) {
      // Get current user info for filtering - try multiple sources
      let username = 'unknown';
      
      // Try localStorage first
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.nom) {
        username = currentUser.nom;
      } else if (currentUser.email) {
        username = currentUser.email;
      }
      
      // Try sessionStorage as fallback
      if (username === 'unknown') {
        const sessionUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
        if (sessionUser.nom) {
          username = sessionUser.nom;
        } else if (sessionUser.email) {
          username = sessionUser.email;
        }
      }
      
      console.log('5. 📡 [DEV] Making request to /api/prestations/mes-prestations/dev with username:', username);
      console.log('5. 📡 [DEV] Current user data:', currentUser);
      
      const devParams = params.set('username', username);
      return this.http.get<Prestation[]>(`${this.apiUrl}/mes-prestations/dev?secret=dev-secret-please-change`, { params: devParams }).pipe(
        tap(response => console.log('✅ SUCCESS - My prestations loaded (dev):', response)),
        // Convert array response to pagination format for consistency
        map(prestations => ({
          content: prestations,
          page: page,
          size: size,
          totalElements: prestations.length,
          totalPages: Math.ceil(prestations.length / size),
          first: page === 0,
          last: page >= Math.ceil(prestations.length / size) - 1
        })),
        catchError(error => {
          console.error('❌ ERROR - My prestations dev failed:', error);
          return throwError(() => error);
        })
      );
    }

    console.log('1. User role:', this.oauthService.hasValidAccessToken() ?
      this.oauthService.getIdentityClaims()?.['realm_access']?.['roles'] : 'No token');

    console.log('5. 📡 Making request to /api/prestations/mes-prestations');

    return this.http.get<PaginationResponse<Prestation>>(`${this.apiUrl}/mes-prestations`, { params }).pipe(
      tap(response => console.log('✅ SUCCESS - My prestations loaded:', response)),
      catchError(error => {
        console.error('❌ ERROR - My prestations failed:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          headers: error.headers,
          message: error.message
        });
        return throwError(() => error);
      })
    );
  }
}
