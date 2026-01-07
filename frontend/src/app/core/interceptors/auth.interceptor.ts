import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isLoggingOut = false;
  
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // L'intercepteur ne fait pas de vérification d'authentification
    // La vérification se fait au niveau des guards et des composants
    
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
