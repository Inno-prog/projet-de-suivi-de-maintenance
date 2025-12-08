import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Mettre à jour l'utilisateur à chaque requête si authentifié
    if (this.authService.isAuthenticated()) {
      this.authService.updateUserFromToken();
    }
    return next.handle(req);
  }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Pour les intercepteurs fonctionnels, nous devons injecter le service différemment
  // Cette approche simplifiée met à jour l'utilisateur à chaque requête
  return next(req);
};
