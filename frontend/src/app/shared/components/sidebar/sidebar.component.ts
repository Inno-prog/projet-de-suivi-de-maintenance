import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.open]="isOpen" [class.collapsed]="!isOpen">


      <!-- Header -->
      <div class="sidebar-header">
        <!-- Logo at the top -->
        <div class="logo-container">
          <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-img-top" />
        </div>

        <!-- App title and role -->
        <div class="app-info">
          <h3>MainTrack Pro</h3>
          <small *ngIf="currentUser$ | async as user">{{ getRoleLabel(user.role) }}</small>
        </div>

        <!-- Hamburger menu at intersection - disabled to prevent sidebar from closing -->
        <!-- <button class="sidebar-toggle-intersection" (click)="toggleSidebar()">
          <div class="hamburger">
            <span></span><span></span><span></span>
          </div>
        </button> -->
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">Tableau de bord</span>
        </a>

        <!-- Prestataire Section -->
        <div *ngIf="authService.isPrestataire()" class="nav-section">
          <div class="section-header" (click)="toggleSection('prestataire')">
            <span>Mes Services</span>
            <svg [class.expanded]="sections['prestataire']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['prestataire']">
            <a routerLink="/prestataire-prestation-list" routerLinkActive="active" class="nav-item">📋 Mes fiches de prestations</a>
            <a [routerLink]="['/user', getCurrentUserId(), 'contrats']" routerLinkActive="active" class="nav-item">📝 Mes contrats</a>
            <a [routerLink]="['/user', getCurrentUserId(), 'rapports-suivi']" routerLinkActive="active" class="nav-item">📊 Rapports de suivi</a>
          </div>
        </div>

        <!-- Administrator Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section">
          <div class="section-header" (click)="toggleSection('admin')">
            <span>Administration</span>
            <svg [class.expanded]="sections['admin']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['admin']">
            <a routerLink="/users" routerLinkActive="active" class="nav-item">👥 Gestion des Utilisateurs</a>
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📄 Gestion des Contrats</a>
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 Gestion des Items</a>
            <a routerLink="/prestations" routerLinkActive="active" class="nav-item">📋 Prestations & Validation</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de Commande</a>
            <a routerLink="/structures-mefp" routerLinkActive="active" class="nav-item">🏢 Gestion des structures du MEFP</a>
          </div>
        </div>

        <!-- Rapports et Statistiques Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section">
          <div class="section-header" (click)="toggleSection('rapports')">
            <span>Rapports et Statistiques</span>
            <svg [class.expanded]="sections['rapports']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['rapports']">
            <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">📊 Rapports de suivi</a>
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📉 Statistiques</a>
            <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">⭐ Évaluations</a>
          </div>
        </div>

        <!-- Agent DGSI Section -->
        <div *ngIf="authService.isAgentDGSI()" class="nav-section">
          <div class="section-header" (click)="toggleSection('agent-dgsi')">
            <span>Supervision</span>
            <svg [class.expanded]="sections['agent-dgsi']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['agent-dgsi']">
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 Items</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de Commande</a>
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📋 Contrats</a>
            <a routerLink="/équipements" routerLinkActive="active" class="nav-item">🛠️ Équipements</a>
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📊 Statistiques</a>
          </div>
        </div>


      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 270px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #e2e8f0;
      transition: all 0.3s ease;
      z-index: 1000;
      overflow-y: auto;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .sidebar.collapsed {
      width: 270px; /* Keep full width even when "collapsed" */
      overflow: visible;
    }

    /* Ensure sidebar is always visible - never hide navigation elements */
    .sidebar, .sidebar.collapsed, .sidebar.open {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    /* Prevent any hover effects from hiding the sidebar */
    .sidebar:hover {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #334155;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      position: relative;
    }

    .logo-container {
      display: flex;
      justify-content: center;
      margin-bottom: 0.5rem;
    }

    .logo-img-top {
      width: 3rem;
      height: 3rem;
      border-radius: 8px;
      object-fit: contain;
    }

    .app-info {
      text-align: center;
    }

    .app-info h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 700;
      color: #f8fafc;
    }

    .app-info small {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .sidebar-toggle-intersection {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: none;
      border: none;
      color: #cbd5e1;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .sidebar-toggle-intersection:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .hamburger span {
      width: 18px;
      height: 2px;
      background: currentColor;
      transition: all 0.3s ease;
    }

    .sidebar-nav {
      padding: 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
      border-left-color: #f97316;
    }

    .nav-item.active {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
      border-left-color: #f97316;
    }

    .nav-icon {
      margin-right: 0.75rem;
      font-size: 1.125rem;
    }

    .nav-text {
      flex: 1;
    }

    .nav-section {
      margin-bottom: 0.5rem;
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .section-header:hover {
      background: rgba(249, 115, 22, 0.1);
      border-left-color: #f97316;
    }

    .section-header span {
      font-weight: 600;
      color: #e2e8f0;
    }

    .arrow-svg {
      transition: transform 0.3s ease;
    }

    .arrow-svg.expanded {
      transform: rotate(90deg);
    }

    .sub-nav {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .sub-nav.expanded {
      max-height: 500px;
    }

    .sub-nav .nav-item {
      padding-left: 3rem;
      font-size: 0.875rem;
    }

    /* Development User Switcher Styles */
    .dev-user-switcher {
      border-top: 2px solid #f97316;
      margin-top: 1rem;
      padding-top: 1rem;
    }

    .dev-user-switcher .section-header span {
      color: #f97316;
      font-weight: bold;
    }

    .dev-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0 1rem;
    }

    .dev-btn {
      padding: 0.5rem 1rem;
      border: 2px solid transparent;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
      font-weight: 600;
      text-align: center;
    }

    .dev-btn:hover {
      background: rgba(249, 115, 22, 0.2);
      border-color: #f97316;
      color: #f97316;
    }

    .dev-btn.active {
      background: rgba(249, 115, 22, 0.3);
      border-color: #f97316;
      color: #f97316;
      font-weight: bold;
    }

    .admin-btn.active {
      background: rgba(239, 68, 68, 0.3);
      border-color: #ef4444;
      color: #ef4444;
    }

    .presta-btn.active {
      background: rgba(34, 197, 94, 0.3);
      border-color: #22c55e;
      color: #22c55e;
    }

    .agent-btn.active {
      background: rgba(59, 130, 246, 0.3);
      border-color: #3b82f6;
      color: #3b82f6;
    }

    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(0); /* Always visible on mobile */
      }

      .sidebar.open {
        transform: translateX(0);
      }
    }
  `]
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;
  @Output() toggleChange = new EventEmitter<boolean>();

  sections: { [key: string]: boolean } = {
    prestataire: true,
    admin: true,
    rapports: true,
    'agent-dgsi': true
  };

  currentUser$: Observable<User | null>;

  constructor(public authService: AuthService) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    // Forcer la mise à jour des données utilisateur au chargement du composant
    if (this.authService.isAuthenticated()) {
      this.authService.updateUserFromToken();
    }

    // Debug logs pour vérifier les rôles
    console.log('Sidebar - User authenticated:', this.authService.isAuthenticated());
    console.log('Sidebar - Current user:', this.authService.getCurrentUser());
    console.log('Sidebar - isAdmin():', this.authService.isAdmin());
    console.log('Sidebar - isPrestataire():', this.authService.isPrestataire());
    console.log('Sidebar - isAgentDGSI():', this.authService.isAgentDGSI());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) this.isOpen = this.isOpen;
  }

  toggleSidebar(): void {
    // Prevent sidebar from being closed - always keep it open
    this.isOpen = true;
    this.toggleChange.emit(this.isOpen);
  }

  toggleSection(section: string): void {
    this.sections[section] = !this.sections[section];
  }

  getRoleLabel(role?: string): string {
    const r = role || '';
    switch (r) {
      case 'ADMINISTRATEUR':
        return 'Admin';
      case 'PRESTATAIRE':
        return 'Prestataire';
      case 'AGENT_DGSI':
        return 'Agent DGSI';
      default:
        return r;
    }
  }

  getCurrentUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role || '';
  }

  getCurrentUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?.id || '';
  }
}
