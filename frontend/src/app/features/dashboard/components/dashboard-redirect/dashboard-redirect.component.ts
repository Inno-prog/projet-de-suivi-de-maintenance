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
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(28,82,118)] mx-auto mb-4"></div>
        <p class="text-gray-600">Mise à jour de la session...</p>
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
    
    // Récupérer la page précédente depuis le localStorage
    let previousUrl = localStorage.getItem('previousUrl');
    // Extraire seulement le pathname pour éviter les paramètres OAuth
    if (previousUrl) {
      const urlObj = new URL(previousUrl, window.location.origin);
      previousUrl = urlObj.pathname;
    }
    console.log('DashboardRedirect: Previous URL:', previousUrl);
    
    // Éviter les boucles infinies - si on arrive sur /login avec un utilisateur déjà chargé
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.role) {
      console.log('DashboardRedirect: User data already available');
      
      // Si on a une page précédente valide (pas /login), rediriger vers elle
      if (previousUrl && previousUrl !== '/login') {
        console.log('DashboardRedirect: Redirecting to previous page:', previousUrl);
        this.router.navigateByUrl(previousUrl);
      } else {
        // Sinon, vérifier si le silent refresh est en cours
        const isSilentRefresh = window.location.search.includes('prompt=none');
        if (isSilentRefresh) {
          console.log('DashboardRedirect: Silent refresh in progress, staying on current page');
          // Ne pas rediriger pour le silent refresh
          this.hasRedirected = true;
        } else {
          console.log('DashboardRedirect: No valid previous page, redirecting to dashboard');
          this.redirectToAppropriateDashboard(currentUser);
        }
      }
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
        console.log('DashboardRedirect: Timeout waiting for user data');
        if (previousUrl) {
          this.router.navigateByUrl(previousUrl);
        } else {
          this.hasRedirected = true;
        }
      }
    }, 3000); // 3 secondes de timeout

    // Wait for user data to be loaded before redirecting
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.role && !this.hasRedirected) {
        console.log('DashboardRedirect: User data received:', user);
        this.hasRedirected = true;
        
        // Nettoyer les données OAuth avant redirection pour éviter les problèmes
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
          if (previousUrl) {
            console.log('DashboardRedirect: Redirecting to previous page after user data received:', previousUrl);
            this.router.navigateByUrl(previousUrl);
          } else {
            console.log('DashboardRedirect: No previous page, staying on current');
          }
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
}
