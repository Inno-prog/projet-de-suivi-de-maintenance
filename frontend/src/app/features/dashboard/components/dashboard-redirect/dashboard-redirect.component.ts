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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Wait for user data to be loaded before redirecting
    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && user.role) {
        this.redirectToAppropriateDashboard(user);
      } else if (!this.authService.isAuthenticated()) {
        // If not authenticated, redirect to public ordres-commande page
        this.router.navigate(['/ordres-commande']);
      }
      // If authenticated but no user data yet, wait for it
    });
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }

  private redirectToAppropriateDashboard(user: User): void {
    console.log('DashboardRedirect: Redirecting user with role:', user.role);

    switch (user.role) {
      case 'ADMINISTRATEUR':
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'PRESTATAIRE':
        console.log('DashboardRedirect: Redirecting PRESTATAIRE to /prestataire-dashboard');
        this.router.navigate(['/prestataire-dashboard']);
        break;
      case 'AGENT_DGSI':
        this.router.navigate(['/dashboard/ci']);
        break;
      default:
        // Default to admin dashboard if role is unknown
        console.log('DashboardRedirect: Unknown role, defaulting to admin dashboard');
        this.router.navigate(['/dashboard/admin']);
    }
  }
}
