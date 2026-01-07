import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-dashboard-redirect',
  standalone: true,
  template: `
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Redirection vers votre tableau de bord...</p>
      </div>
    </div>
  `
})
export class DashboardRedirectComponent implements OnInit, OnDestroy {

  private userSub?: Subscription;
  private redirectTimeout?: any;
  private hasRedirected = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('DashboardRedirect: Component initialized');
    
    // Éviter les boucles infinies - si on arrive sur /login avec un utilisateur déjà chargé
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.role) {
      console.log('DashboardRedirect: User data already available, redirecting immediately');
      this.redirectToAppropriateDashboard(currentUser);
      return;
    }

    // Si pas d'utilisateur, vérifier l'authentification
    if (!this.authService.isAuthenticated()) {
      console.log('DashboardRedirect: Not authenticated, redirecting to ordres-commande');
      this.router.navigate(['/ordres-commande']);
      return;
    }

    // Timeout de sécurité pour éviter les attentes infinies
    this.redirectTimeout = setTimeout(() => {
      if (!this.hasRedirected) {
        console.log('DashboardRedirect: Timeout waiting for user data, redirecting to default dashboard');
        this.redirectToDefaultDashboard();
      }
    }, 3000); // 3 secondes de timeout

    // Wait for user data to be loaded before redirecting
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.role && !this.hasRedirected) {
        console.log('DashboardRedirect: User data received:', user);
        this.hasRedirected = true;
        
        // Nettoyer les données OAuth avant redirection pour éviter les problèmes
        // Utiliser manualTokenCleanup pour nettoyer les tokens manuellement
        try {
          localStorage.removeItem('nonce');
          localStorage.removeItem('state');
          localStorage.removeItem('pkce_code_verifier');
          console.log('DashboardRedirect: OAuth cleanup completed');
        } catch (error) {
          console.warn('DashboardRedirect: Error during OAuth cleanup:', error);
        }
        
        // Petit délai pour s'assurer que le nettoyage est terminé
        setTimeout(() => {
          this.redirectToAppropriateDashboard(user);
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  private redirectToAppropriateDashboard(user: User): void {
    console.log('DashboardRedirect: Redirecting user with role:', user.role);

    switch (user.role) {
      case 'ADMINISTRATEUR':
        console.log('DashboardRedirect: Redirecting ADMINISTRATEUR to /dashboard/admin');
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'PRESTATAIRE':
        console.log('DashboardRedirect: Redirecting PRESTATAIRE to /prestataire-dashboard');
        this.router.navigate(['/prestataire-dashboard']);
        break;
      case 'AGENT_DGSI':
        console.log('DashboardRedirect: Redirecting AGENT_DGSI to /dashboard/ci');
        this.router.navigate(['/dashboard/ci']);
        break;
      default:
        console.log('DashboardRedirect: Unknown role, defaulting to admin dashboard');
        this.router.navigate(['/dashboard/admin']);
    }
  }

  private redirectToDefaultDashboard(): void {
    console.log('DashboardRedirect: Redirecting to default dashboard due to timeout');
    this.router.navigate(['/dashboard/admin']);
  }
}
