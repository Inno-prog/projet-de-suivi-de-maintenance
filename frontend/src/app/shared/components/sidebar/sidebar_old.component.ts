import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.open]="isOpen" [class.collapsed]="!isOpen">


      <!-- Header -->
      <div class="sidebar-header">
        <div class="logo">
          <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-img" />
          <div class="logo-text">
            <h3 style="padding-top: 6px; margin-left: -9px;">MainTrack Pro</h3>
            <small>{{ getRoleLabel() }}</small>
          </div>
        </div>
        <!-- Toggle Button -->
        <button class="sidebar-toggle-header" (click)="toggleSidebar()">
          <div class="hamburger">
            <span></span><span></span><span></span>
          </div>
        </button>
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
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📝 Mes contrats</a>
            <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">📊 Rapports de suivi</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de commande</a>
          </div>
        </div>

        <!-- Administration Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section">
          <div class="section-header" (click)="toggleSection('admin')">
            <span>Administration</span>
            <svg [class.expanded]="sections['admin']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['admin']">
            <a routerLink="/users" routerLinkActive="active" class="nav-item">👥 Utilisateurs</a>
            <a routerLink="/structures-mefp" routerLinkActive="active" class="nav-item">🏢 Structures du MEFP</a>
            <a routerLink="/prestations" routerLinkActive="active" class="nav-item">🧾 Gestion des prestations</a>
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📄 Contrats</a>
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 Items</a>
            <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">⭐ Évaluations</a>
            <a routerLink="/équipements" routerLinkActive="active" class="nav-item">🔧 Tableau des équipements</a>
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de commande</a>
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
            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 Ordres de commande</a>
            <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">📊 Rapports</a>
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📉 Statistiques</a>
          </div>
        </div>


      </nav>

      <!-- User info section placeholder for future extensions -->
      <div class="user-info-section" *ngIf="authService.getCurrentUser()">
        <div class="user-welcome">
          <small>Connecté en tant que:</small>
          <span class="user-email">{{ authService.getCurrentUser()?.email }}</span>
        </div>
      </div>

      <!-- Footer -->
      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">🚪 Déconnexion</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --bg: #0f172a;
      --bg-hover: #1e293b;
      --accent: #f97316;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --border: rgba(255,255,255,0.08);
    }

    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      width: 270px;
      height: 100vh;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      transition: transform 0.3s ease;
      box-shadow: 4px 0 12px rgba(0,0,0,0.3);
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar.collapsed {
      transform: translateX(-100%);
    }

    .sidebar-toggle-header {
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      color: var(--text);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: background 0.2s ease;
      margin-left: auto;
    }

    .sidebar-toggle-header:hover {
      background: var(--bg-hover);
    }


    .hamburger span {
      display: block;
      width: 20px;
      height: 2px;
      margin: 3px auto;
      background: var(--text);
      border-radius: 1px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-img {
      width: 3rem;
      height: 3rem;
      border-radius: 6px;
      background: white;
      object-fit: contain;
    }

    .logo-text h3 {
      margin: 0;
      font-size: 1.1rem;
      color: var(--text);
    }
    .logo-text small {
      color: var(--muted);
      font-size: 0.8rem;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.8rem 1.5rem;
      text-decoration: none;
      color: var(--text);
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      background: var(--bg-hover);
      border-left-color: var(--accent);
      color: var(--accent);
    }

    .nav-item.active {
      background: rgba(249, 115, 22, 0.1);
      border-left-color: var(--accent);
      color: var(--accent);
    }

    .nav-section {
      margin-bottom: 1rem;
    }

    .section-header {
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: var(--muted);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: color 0.2s;
    }

    .section-header:hover { color: var(--accent); }

    .arrow-svg {
      font-size: 0.8rem;
      transition: transform 0.3s;
    }
    .arrow-svg.expanded { transform: rotate(90deg); }

    .sub-nav {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }
    .sub-nav.expanded { max-height: 600px; }

    .sidebar-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
    }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.4);
      color: #f87171;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }

    .logout-btn:hover {
      background: rgba(239,68,68,0.2);
      color: #ef4444;
    }

    /* User info section */
    .user-info-section {
      padding: 1rem 1.5rem;
      border-top: 1px solid var(--border);
      background: rgba(249, 115, 22, 0.05);
    }

    .user-welcome {
      font-size: 0.75rem;
      color: var(--muted);
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.85rem;
      color: var(--accent);
      font-weight: 500;
      word-break: break-all;
    }
  `]
})
export class SidebarComponent implements OnChanges {
  @Input() open = true;
  @Output() toggleChange = new EventEmitter<boolean>();
  isOpen = true;

  sections: { [key: string]: boolean } = {
    admin: true,
    prestataire: true,
    'agent-dgsi': true,
    rapports: true
  };

  constructor(public authService: AuthService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) this.isOpen = this.open;
  }

  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.toggleChange.emit(this.isOpen);
  }

  toggleSection(section: string) {
    this.sections[section] = !this.sections[section];
  }

  getRoleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';
    switch (user.role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return user.role;
    }
  }



  logout() { this.authService.logout(); }
}
