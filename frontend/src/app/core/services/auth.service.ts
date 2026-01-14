import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private confirmationService?: any;

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService
  ) {
    this.initializeOAuth();
    this.loadCurrentUser();
  }

  private initializeOAuth(): void {
    // Configuration pour client public - pas d'initialisation automatique
    const isProduction = window.location.protocol === 'https:';
    const authConfig: AuthConfig = {
      issuer: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI'
        : 'http://localhost:8080/realms/Maintenance-DGSI',
      redirectUri: window.location.origin + '/login',
      clientId: 'maintenance-app',
      responseType: 'code',
      scope: 'openid roles',
      showDebugInformation: !isProduction, // Désactiver les informations de débogage en production
      requireHttps: isProduction, // Exiger HTTPS en production
      skipIssuerCheck: !isProduction, // Vérification stricte de l'émetteur en production
      strictDiscoveryDocumentValidation: isProduction, // Validation stricte en production
  oidc: true,
  // Désactiver silent refresh pour éviter la déconnexion automatique
  useSilentRefresh: false,
  // silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
      disableAtHashCheck: false, // Activer la vérification de hachage pour la sécurité
      loginUrl: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/auth'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/auth',
      logoutUrl: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/logout'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/logout',
      postLogoutRedirectUri: window.location.origin,
      tokenEndpoint: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/token'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token',
      userinfoEndpoint: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/userinfo'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/userinfo',
      // Configuration spécifique pour client public
      dummyClientSecret: '', // Important pour les clients publics
      useHttpBasicAuth: false // Désactiver l'authentification HTTP Basic
    };

  // Certaines versions de angular-oauth2-oidc peuvent ne pas exposer `usePkce` sur le type AuthConfig
  // L'assigner défensivement via un cast pour que TS ne échoue pas tout en activant PKCE.
  (authConfig as any).usePkce = true;
  this.oauthService.configure(authConfig);

  // Persister les tokens dans localStorage pour que le vérificateur de code / état PKCE survive aux redirections
  try {
    this.oauthService.setStorage(localStorage);
  } catch (e) {
    // Certaines versions de bibliothèque peuvent ne pas exposer setStorage ; ignorer si non disponible
    console.warn('oauthService.setStorage not available, falling back to default storage', e);
  }
    console.log('Environnement production:', environment.production);

    // Utiliser uniquement Keycloak en temps réel

    // Vérifier la connectivité réseau vers Keycloak
    this.checkKeycloakConnectivity().then(isReachable => {
      console.log('Keycloak reachable:', isReachable);
      if (!isReachable) {
        console.warn('Keycloak n\'est pas accessible sur http://localhost:8080');
      }
    });

    // Effacer les tokens invalides des sessions précédentes sans déclencher une redirection de déconnexion
    if (!this.oauthService.hasValidAccessToken() && (localStorage.getItem('access_token') || localStorage.getItem('id_token'))) {
      console.log('Effacement des tokens invalides du stockage local (pas de déconnexion distante)');
      try {
        // ne pas appeler oauthService.logOut() ici car cela peut rediriger le navigateur.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } catch (e) {
        console.warn('Erreur lors de l\'effacement des tokens du stockage', e);
      }
      this.currentUserSubject.next(null);
    }

    // Vérifier si nous venons de nous déconnecter (AVANT de charger le document de découverte)
    const justLoggedOut = sessionStorage.getItem('justLoggedOut') === 'true';
    if (justLoggedOut) {
      console.log('Détection de déconnexion récente - nettoyage et arrêt');
      sessionStorage.removeItem('justLoggedOut');
      // Nettoyer complètement
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      this.currentUserSubject.next(null);
      return;
    }

    // Charger le document de découverte et essayer de se connecter s'il y a des tokens
    console.log('Chargement du document de découverte...');

    // Charger d'abord le document de découverte sans essayer de traiter le code
    this.oauthService.loadDiscoveryDocument().then(() => {
      console.log('Document de découverte chargé avec succès');

      // Essayer de traiter le code d'autorisation seulement si nous ne sommes pas déjà authentifiés
      // et seulement une fois pour éviter les erreurs de code déjà utilisé
      if (!this.oauthService.hasValidAccessToken()) {
        console.log('Tentative de traitement du code d\'autorisation OAuth...');
        this.oauthService.tryLoginCodeFlow().then(() => {
          console.log('Code d\'autorisation traité avec succès');
          if (this.oauthService.hasValidAccessToken()) {
            this.updateUserFromToken();
          }
        }).catch(err => {
          console.log('Aucun code d\'autorisation valide trouvé ou traitement échoué:', err);
        });
      } else {
        console.log('Token d\'accès valide trouvé, mise à jour de l\'utilisateur depuis le token');
        this.updateUserFromToken();
      }
    }).catch(err => {
      console.error('Erreur de chargement du document de découverte:', err);
      console.error('Vérifiez si Keycloak fonctionne sur http://localhost:8080');

      // Essayer un retry basique de la découverte après un délai court
      setTimeout(() => {
        console.log('Réessai du chargement du document de découverte OAuth...');
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Retry discovery succeed');
          if (!this.oauthService.hasValidAccessToken()) {
            this.oauthService.tryLoginCodeFlow().then(() => {
              if (this.oauthService.hasValidAccessToken()) this.updateUserFromToken();
            }).catch(() => {
              console.log('Aucun code d\'autorisation valide trouvé lors du retry');
            });
          } else {
            this.updateUserFromToken();
          }
        }).catch(err2 => {
          console.error('Second échec du chargement du document de découverte:', err2);
        });
      }, 1500);
    });
  }



  login(credentials?: LoginRequest): void {
    if (credentials) {
      // Utiliser le flux de mot de passe pour la connexion directe. Certaines configurations Keycloak nécessitent
      // que le corps de la requête soit application/x-www-form-urlencoded et que
      // le client soit configuré pour les subventions d'accès direct. Si l'aide de bibliothèque
      // échoue, revenir à une requête HTTP manuelle vers le point de terminaison du token
      // avec les en-têtes appropriés.
      console.log('Utilisation du flux de mot de passe pour la connexion...');
      this.oauthService.fetchTokenUsingPasswordFlow(credentials.email, credentials.password).then(() => {
        console.log('Connexion par mot de passe réussie');
        this.updateUserFromToken();
      }).catch(err => {
        console.warn('fetchTokenUsingPasswordFlow a échoué, tentative de requête de token manuelle. Erreur:', err);

        // Requête de token manuelle de secours
        // Essayer de lire le point de terminaison du token configuré depuis les options oauthService, revenir à la constante
        // Le type OAuthService peut exposer la config sous `options` ou `_config`, donc nous vérifions défensivement
        // les propriétés communes. Sinon, utiliser le point de terminaison Keycloak connu.
        const tokenUrl = (
          (this.oauthService as any).options?.tokenEndpoint ||
          (this.oauthService as any)._config?.tokenEndpoint ||
          'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token'
        );
        const body = new URLSearchParams();
        // Keycloak attend 'username' (pas email) sauf si le realm est configuré pour loginWithEmail
        // Nous envoyons à la fois username et email comme username si l'entrée ressemble à un email.
        const username = credentials.email;
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', credentials.password);
        body.set('client_id', this.oauthService.clientId || 'maintenance-app');

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        this.http.post<any>(tokenUrl, body.toString(), { headers }).toPromise().then(response => {
          console.log('Requête de token manuelle réussie', response);
          // L'oauthService attend les tokens dans son stockage ; les stocker de manière cohérente
          if (response['access_token']) {
            this.oauthService.setStorage(localStorage);
            localStorage.setItem('access_token', response['access_token']);
            if (response['refresh_token']) localStorage.setItem('refresh_token', response['refresh_token']);
            if (response['id_token']) localStorage.setItem('id_token', response['id_token']);
            this.updateUserFromToken();
          } else {
            console.error('La réponse du token ne contenait pas access_token:', response);
          }
        }).catch(httpErr => {
          console.error(`Connexion par mot de passe échouée: ${httpErr.message || httpErr.statusText || httpErr}`);
          console.error('Réponse d\'erreur complète:', httpErr);
        }).finally(() => {
          this.loadingCleanup();
        });
      });
    } else {
      // La connexion est maintenant initiée en redirigeant vers Keycloak.
      // Le callback sera géré automatiquement par `loadDiscoveryDocumentAndTryLogin`.
      console.log('Initiation du flux de connexion OAuth (code d\'autorisation + PKCE)');
      console.log('URI de redirection:', window.location.origin + '/login');

      // S'assurer toujours que le document de découverte est chargé puis démarrer le flux de code.
      const startCodeFlow = () => {
        try {
          this.oauthService.initCodeFlow();
          console.log('OAuth initCodeFlow appelé avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'initiation du flux OAuth:', error);
        }
      };

      if (!this.oauthService.discoveryDocumentLoaded) {
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Document de découverte chargé, démarrage du flux de code');
          startCodeFlow();
        }).catch(err => {
          console.error('Échec du chargement du document de découverte - impossible de démarrer le flux de code:', err);
        });
      } else {
        startCodeFlow();
      }
    }
  }

  private loadingCleanup(): void {
    // Espace réservé pour tout nettoyage comme basculer l'état de chargement dans l'UI ; laissé vide
    // car AuthService ne possède pas les indicateurs de chargement des composants. Les composants doivent
    // écouter l'état d'authentification et mettre à jour leurs propres indicateurs de chargement.
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout(): void {
    console.log('Initialisation de la déconnexion...', {
      hasValidToken: this.oauthService.hasValidAccessToken(),
      currentUser: this.getCurrentUser()
    });

    // 1. Marquer la session comme déconnectée
    sessionStorage.setItem('justLoggedOut', 'true');
    console.log('Marquage de session de déconnexion défini');

    // 2. Effacer l'utilisateur actuel
    this.currentUserSubject.next(null);
    console.log('Utilisateur actuel effacé');

    // 3. Obtenir l'id_token avant de nettoyer (fallback depuis localStorage si nécessaire)
    let idToken: string | null = this.oauthService.getIdToken() || null;
    if (!idToken) {
      try {
        idToken = localStorage.getItem('id_token') || null;
      } catch (e) {
        idToken = null;
      }
    }
    console.log('ID Token pour logout:', idToken ? 'présent' : 'absent');

    // Helper: vérifier si un id_token JWT est encore valide (exp > now)
    const isJwtValid = (token: string | null): boolean => {
      if (!token) return false;
      try {
        const parts = token.split('.');
        if (parts.length < 2) return false;
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (!payload.exp) return false;
        const now = Math.floor(Date.now() / 1000);
        return payload.exp > now + 5; // small leeway
      } catch (e) {
        return false;
      }
    };

    const performLogoutRequest = (tokenHint: string | null) => {
      const logoutBase = (this.oauthService as any)._config?.logoutUrl ||
        'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/logout';
      const redirectUri = window.location.origin;

      const params = new URLSearchParams();
      // Use post_logout_redirect_uri (configured in Keycloak) and include id_token_hint only if available
      params.set('post_logout_redirect_uri', redirectUri);
      if (tokenHint) params.set('id_token_hint', tokenHint);
      params.set('client_id', this.oauthService.clientId || 'maintenance-app');

      const logoutUrl = logoutBase + '?' + params.toString();
      console.log('URL de logout:', logoutUrl);

      // Nettoyage manuel des tokens locaux en dernier, après avoir capturé id_token
      this.manualTokenCleanup();
      window.location.href = logoutUrl;
    };

    console.log('Démarrage de la déconnexion Keycloak...');

    if (idToken && isJwtValid(idToken)) {
      // Token présent et valide
      performLogoutRequest(idToken);
      return;
    }

    // Si token absent ou expiré, tenter un refresh si possible
    const refreshFn: (() => Promise<any>) | undefined = (this.oauthService as any).refreshToken?.bind(this.oauthService);
    if (refreshFn) {
      try {
        console.log('Tentative de refresh du token avant logout...');
        (refreshFn() as Promise<any>).then(() => {
          // Après refresh, récupérer id_token et exécuter logout
          const newId = this.oauthService.getIdToken() || localStorage.getItem('id_token') || null;
          if (newId && isJwtValid(newId)) {
            performLogoutRequest(newId);
          } else {
            // Si refresh n'a pas fourni de id_token valide, fallback sans id_token_hint
            console.warn('Refresh n\'a pas fourni d\'id_token valide, logout sans id_token_hint');
            performLogoutRequest(null);
          }
        }).catch((err: any) => {
          console.warn('Refresh token failed, falling back to logout without id_token_hint', err);
          performLogoutRequest(null);
        });
        return;
      } catch (e) {
        console.warn('Erreur lors de l\'appel de refreshToken:', e);
      }
    }

    // Dernier fallback : exécuter logout sans id_token_hint
    console.warn('Pas d\'id_token valide et refresh non disponible. Déconnexion sans id_token_hint');
    try {
      performLogoutRequest(null);
    } catch (err) {
      console.warn('Échec du logout manuel, utilisation du logout de la librairie', err);
      try {
        this.oauthService.logOut();
      } catch (e) {
        console.warn('Fallback oauthService.logOut() failed, redirecting locally', e);
        window.location.href = window.location.origin;
      }
    }
  }

  private manualTokenCleanup(): void {
    // Nettoyage manuel des tokens en cas de fallback
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('id_token');
      console.log('Nettoyage manuel des tokens terminé');
    } catch (error) {
      console.warn('Erreur lors du nettoyage manuel:', error);
    }
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.token);

    // Normaliser le rôle (supprimer "ROLE_" si présent)
    let role = authResult.role;
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
    }

    const user: User = {
      id: authResult.id,
      nom: authResult.nom,
      email: authResult.email,
      role: role
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('currentUser');

    if (userStr) {
      const user = JSON.parse(userStr);

      if (user.role === 'PRESTATAIRE') {
        // Récupérer les données complètes du prestataire depuis la liste des utilisateurs
        this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
          next: (users) => {
            const prestataireData = users.find(u => u.id === user.id || u.nom === user.nom);
            if (prestataireData) {
              const fullUser = { ...user, ...prestataireData };
              this.currentUserSubject.next(fullUser);
              localStorage.setItem('currentUser', JSON.stringify(fullUser));
            } else {
              this.currentUserSubject.next(user);
            }
          },
          error: () => {
            this.currentUserSubject.next(user);
          }
        });
      } else {
        this.currentUserSubject.next(user);
      }

      return;
    }

    if (this.oauthService.hasValidAccessToken()) {
      this.updateUserFromToken();
    }
  }

  updateUserFromToken(): void {
    const user = this.getUserFromToken();

    if (!user) return;

    if (user.role === 'PRESTATAIRE') {
      // Récupérer les données complètes du prestataire depuis la liste des utilisateurs
      this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
        next: (users) => {
          const prestataireData = users.find(u => u.id === user.id || u.nom === user.nom);
          if (prestataireData) {
            const fullUser = { ...user, ...prestataireData };
            this.currentUserSubject.next(fullUser);
            localStorage.setItem('currentUser', JSON.stringify(fullUser));
          } else {
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
        },
        error: () => {
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      });
    } else {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private getUserFromToken(): User | null {
    // Essayer d'obtenir les rôles depuis le token d'accès en premier
    const accessToken = this.oauthService.getAccessToken();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Charge utile du token d\'accès:', payload);

        const roles = payload['realm_access']?.['roles'] || [];
        console.log('Rôles extraits du token d\'accès:', roles);

        let role = 'USER'; // rôle par défaut

        if (roles.includes('PRESTATAIRE')) {
          role = 'PRESTATAIRE';
        } else if (roles.includes('ADMINISTRATEUR')) {
          role = 'ADMINISTRATEUR';
        } else if (roles.includes('AGENT_DGSI')) {
          role = 'AGENT_DGSI';
        }

        console.log('Rôle déterminé:', role);

        return {
          id: payload['sub'] || '',
          nom: payload['name'] || payload['preferred_username'] || '',
          email: payload['email'] || '',
          role: role
        };
      } catch (error) {
        console.error('Erreur lors de l\'analyse du token d\'accès:', error);
      }
    }

    // Revenir aux claims du token ID
    const claims = this.oauthService.getIdentityClaims();
    console.log('Claims du token ID:', claims);

    if (!claims) return null;

    const roles = claims['realm_access']?.['roles'] || [];
    console.log('Rôles extraits du token ID:', roles);

    let role = 'USER'; // rôle par défaut

    if (roles.includes('PRESTATAIRE')) {
      role = 'PRESTATAIRE';
    } else if (roles.includes('ADMINISTRATEUR')) {
      role = 'ADMINISTRATEUR';
    } else if (roles.includes('AGENT_DGSI')) {
      role = 'AGENT_DGSI';
    }

    console.log('Rôle déterminé depuis le token ID:', role);

    return {
      id: claims['sub'] || '',
      nom: claims['name'] || claims['preferred_username'] || '',
      email: claims['email'] || '',
      role: role
    };
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    // Retourner le token d'accès OAuth réel
    return this.oauthService.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken() && !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMINISTRATEUR');
  }

  isPrestataire(): boolean {
    return this.hasRole('PRESTATAIRE');
  }

  isAgentDGSI(): boolean {
    return this.hasRole('AGENT_DGSI');
  }

  isAdminOrPrestataire(): boolean {
    return this.isAdmin() || this.isPrestataire();
  }

  updateUserProfile(profileData: any): Observable<any> {
    console.log('AuthService: Updating profile with data:', profileData);
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }
    
    return this.http.put<any>(`${environment.apiUrl}/users/${currentUser.id}`, profileData).pipe(
      map(updatedUser => {
        console.log('AuthService: Profile updated successfully:', updatedUser);
        // Fusionner les données mises à jour avec l'utilisateur actuel
        const mergedUser = { ...currentUser, ...updatedUser };
        this.currentUserSubject.next(mergedUser);
        localStorage.setItem('currentUser', JSON.stringify(mergedUser));
        return mergedUser;
      })
    );
  }

  private fetchUserProfile(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/users/me`);
  }

  // Méthodes pour gérer le flow OAuth2
  initLoginFlow(): void {
    this.oauthService.initCodeFlow();
  }

  handleLoginCallback(): void {
    this.oauthService.tryLoginCodeFlow();
  }

  setConfirmationComponent(component: any): void {
    this.confirmationService = component;
  }

  private async checkKeycloakConnectivity(): Promise<boolean> {
    try {
      // Use a simple HEAD request to check connectivity without triggering CORS issues
      const response = await fetch('http://localhost:8080/realms/Maintenance-DGSI/.well-known/openid_connect_configuration', {
        method: 'HEAD',
        mode: 'no-cors' // Avoid CORS issues during connectivity check
      });
      return true; // If we get here without exception, it's reachable
    } catch (error: any) {
      // Only log connectivity issues in development, not as errors
      if (!environment.production) {
        console.debug('Keycloak connectivity check:', error?.message || 'Service may not be available');
      }
      return false;
    }
  }
  handleOAuthCallback(): Promise<boolean> {
    if (this.oauthService.hasValidAccessToken()) {
      console.log('Token valide trouvé lors du callback, mise à jour de l\'utilisateur');
      this.updateUserFromToken();
      return Promise.resolve(true);
    }

    // Vérifier s'il y a des paramètres d'URL indiquant un callback OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('error');

    if (!hasAuthParams) {
      console.log('Aucun paramètre d\'authentification trouvé dans l\'URL');
      return Promise.resolve(false);
    }

    console.log('Tentative de traitement du callback OAuth...');
    return this.oauthService.tryLoginCodeFlow().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        console.log('Callback OAuth traité avec succès');
        this.updateUserFromToken();
        return true;
      }
      console.log('Callback OAuth traité mais aucun token valide');
      return false;
    }).catch(err => {
      console.error('Échec du callback OAuth:', err);
      return false;
    });
  }
}
