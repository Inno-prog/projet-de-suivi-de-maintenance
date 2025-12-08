import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Check if route is public
    const isPublic = route.data['public'];
    if (isPublic) {
      console.log('AuthGuard: Public route, allowing access');
      return true;
    }

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('AuthGuard: User not authenticated, initiating Keycloak login');
      this.authService.login();
      return false;
    }

    // Redirect authenticated prestataires to their dashboard from root
    if (route.routeConfig?.path === '') {
      const user = this.authService.getCurrentUser();
      if (user?.role === 'PRESTATAIRE') {
        console.log('AuthGuard: Prestataire accessing root, redirecting to dashboard');
        this.router.navigate(['/prestataire-dashboard']);
        return false;
      }
    }



    // Check if route allows all roles (component will handle redirects)
    const allowAllRoles = route.data['allowAllRoles'];
    if (allowAllRoles) {
      console.log('AuthGuard: Allowing all authenticated users (component handles redirects)');
      return true;
    }

    // Check role-based access for protected routes
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      console.log('AuthGuard: Checking role access', { requiredRole, userRole: user?.role });

      // Support both single role and array of roles
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!user || !allowedRoles.includes(user.role)) {
        console.log('AuthGuard: Role access denied, redirecting to user dashboard');
        // Redirect to user's own dashboard
        this.redirectToUserDashboard(user?.role);
        return false;
      }
    }

    console.log('AuthGuard: Access granted');
    return true;
  }

  private redirectToUserDashboard(userRole?: string): void {
    switch (userRole) {
      case 'ADMINISTRATEUR':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'PRESTATAIRE':
        this.router.navigate(['/prestataire-dashboard']);
        break;
      case 'AGENT_DGSI':
        this.router.navigate(['/dashboard/ci']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
}
