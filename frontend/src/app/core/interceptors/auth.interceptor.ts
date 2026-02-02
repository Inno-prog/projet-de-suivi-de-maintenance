import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isLoggingOut = false;
  
  constructor(private authService: AuthService, private oauthService: OAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Ajouter le token d'accès aux requêtes API si disponible
    const accessToken = this.oauthService.getAccessToken();
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Éviter les déconnexions automatiques qui causent des boucles
        // La gestion des erreurs 401 sera faite par les composants individuels
        if (error.status === 401 && !this.isLoggingOut) {
          console.log('AuthInterceptor: Received 401 error, but avoiding automatic logout to prevent re-auth loops');
          // Ne pas déclencher logout automatiquement
          // this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Marquer qu'une déconnexion est en cours pour éviter les boucles
   */
  setLoggingOut(isLoggingOut: boolean) {
    this.isLoggingOut = isLoggingOut;
  }
}
