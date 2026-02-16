import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { StructureMefpService, RegionHierarchy, VilleHierarchy, StructureInfo } from '../../../core/services/structure-mefp.service';
import { User } from '../../../core/models/auth.models';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="sidebar" [class.open]="isOpen" [class.collapsed]="!isOpen" [class.mobile-open]="isOpen">


      <!-- Header -->
      <div class="sidebar-header">
        <!-- Logo at the top -->
        <div class="logo-container">
          <a href="https://it.finances.bf/" target="_blank">
            <img src="assets/logoFinal.png" alt="DGSI Logo" class="logo-img-top" />
          </a>
        </div>

        <!-- App title and role -->
        <div class="app-info">
          <h3>SUMIO DGSI</h3>
          <small *ngIf="currentUser$ | async as user">{{ getRoleLabel(user.role) }}</small>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">{{ 'dashboard' | translate }}</span>
        </a>

        <!-- Prestataire Section -->
        <div *ngIf="authService.isPrestataire()" class="nav-section" data-section="prestataire">
          <div class="section-header" (click)="toggleSection('prestataire')">
            <span>{{ 'my_services' | translate }}</span>
            <svg [class.expanded]="sections['prestataire']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['prestataire']">
            <a routerLink="/prestataire-prestation-list" routerLinkActive="active" class="nav-item">📋 {{ 'my_prestation_sheets' | translate }}</a>
            <a routerLink="/my-items" routerLinkActive="active" class="nav-item">🧰 {{ 'my_items' | translate }}</a>
            <a [routerLink]="['/user', getCurrentUserId(), 'contrats']" routerLinkActive="active" class="nav-item">📝 {{ 'my_contracts' | translate }}</a>
            <a [routerLink]="['/user', getCurrentUserId(), 'rapports-suivi']" routerLinkActive="active" class="nav-item">📊 {{ 'follow_up_reports' | translate }}</a>
          </div>
        </div>

        <!-- Administrator Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section" data-section="admin">
          <div class="section-header" (click)="toggleSection('admin')">
            <span>{{ 'administration' | translate }}</span>
            <svg [class.expanded]="sections['admin']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['admin']">
            <a routerLink="/users" routerLinkActive="active" class="nav-item">👥 {{ 'user_management' | translate }}</a>
            <a routerLink="/contrats" routerLinkActive="active" class="nav-item">📄 {{ 'contract_management' | translate }}</a>
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 {{ 'item_management' | translate }}</a>

            <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">📦 {{ 'orders' | translate }}</a>
            
            <!-- Simple Structures du MEFP link -->
            <a routerLink="/structures-mefp" routerLinkActive="active" class="nav-item structures-link">
              <span class="nav-icon">🏢</span>
              <span class="nav-text">{{ 'structures_mefp' | translate }}</span>
            </a>
          </div>
        </div>

        <!-- Rapports et Statistiques Section -->
        <div *ngIf="authService.isAdmin()" class="nav-section" data-section="rapports">
          <div class="section-header" (click)="toggleSection('rapports')">
            <span>{{ 'reports_stats' | translate }}</span>
            <svg [class.expanded]="sections['rapports']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['rapports']">
            <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">📊 {{ 'follow_up_reports' | translate }}</a>
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📉 {{ 'statistics' | translate }}</a>
            <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">⭐ {{ 'evaluations' | translate }}</a>
          </div>
        </div>

        <!-- Agent DGSI Section -->
        <div *ngIf="authService.isAgentDGSI()" class="nav-section" data-section="agent-dgsi">
          <div class="section-header" (click)="toggleSection('agent-dgsi')">
            <span>{{ 'supervision' | translate }}</span>
            <svg [class.expanded]="sections['agent-dgsi']" class="arrow-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="sub-nav" [class.expanded]="sections['agent-dgsi']">
            <a routerLink="/items" routerLinkActive="active" class="nav-item">🧰 {{ 'items_lots' | translate }}</a>
            <a routerLink="/équipements" routerLinkActive="active" class="nav-item">️ {{ 'equipment' | translate }}</a>
            
            <!-- Simple Structures du MEFP link -->
            <a routerLink="/structures-mefp" routerLinkActive="active" class="nav-item structures-link">
              <span class="nav-icon">🏢</span>
              <span class="nav-text">{{ 'structures_mefp' | translate }}</span>
            </a>
            
            <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">📊 {{ 'statistics' | translate }}</a>
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
      width: 260px;
      background: rgb(28, 82, 118);
      color: #e2e8f0;
      z-index: 1100;
      overflow-y: auto;
      margin: 0;
      padding: 0;
      border: none;
    }

    .sidebar.collapsed {
      width: 220px;
      overflow: visible;
    }



    .sidebar:hover {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .sidebar:not(.mobile-open) {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .sidebar-header {
      padding: 1rem;
      border-bottom: 1px solid #1e293b;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin: 0;
      background: rgb(28, 82, 118);
    }

    .logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      padding: 0.5rem 0;
    }

    .logo-img-top {
      width: 60px;
      height: 60px;
      object-fit: contain;
      display: block;
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      max-height: 2000px;
    }

    .sub-nav .nav-item {
      padding-left: 3rem;
      font-size: 0.875rem;
    }

    /* Structures MEFP Navigation Styles */
    .structures-mefp-nav {
      margin: 0.5rem 0;
    }

    .structures-header {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: #f97316;
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      border-left: 3px solid #f97316;
      background: rgba(249, 115, 22, 0.1);
    }

    .structures-header:hover {
      background: rgba(249, 115, 22, 0.15);
    }

    .structures-header.active {
      background: rgba(249, 115, 22, 0.2);
    }

    .structures-icon {
      margin-right: 0.5rem;
      font-size: 1rem;
    }

    .structures-text {
      flex: 1;
      font-weight: 600;
    }

    .mef-arrow-svg {
      transition: transform 0.3s ease;
    }

    .mef-arrow-svg.expanded {
      transform: rotate(90deg);
    }

    .mef-hierarchy {
      display: none;
      background: rgba(0, 0, 0, 0.2);
    }

    .mef-hierarchy.expanded {
      display: block;
    }

    .mef-regions {
      display: none;
      background: rgba(0, 0, 0, 0.2);
    }

    .mef-regions.expanded {
      display: block;
    }

    .regions-content {
      padding: 0.25rem 0;
    }

    .region-link {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem 0.5rem 2rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
    }

    .region-link:hover {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
      border-left-color: #f97316;
    }

    .hierarchy-loading {
      display: flex;
      align-items: center;
      padding: 0.75rem 2rem;
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid #94a3b8;
      border-top-color: #f97316;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .hierarchy-content {
      padding: 0.25rem 0;
    }

    /* Region styles */
    .region-node {
      margin: 2px 0;
    }

    .region-row {
      display: flex;
      align-items: center;
      padding: 0.5rem 1rem 0.5rem 2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #cbd5e1;
    }

    .region-row:hover {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }

    .row-arrow {
      margin-right: 0.5rem;
      transition: transform 0.2s ease;
      opacity: 0.7;
    }

    .row-arrow.expanded {
      transform: rotate(90deg);
    }

    .region-marker {
      margin-right: 0.5rem;
      font-size: 0.85rem;
    }

    .region-label {
      flex: 1;
      font-weight: 500;
      font-size: 0.85rem;
    }

    .structure-count {
      background: rgba(249, 115, 22, 0.2);
      color: #f97316;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    /* Villes styles */
    .villes-node {
      padding-left: 0.5rem;
    }

    .ville-node {
      margin: 1px 0;
    }

    .ville-row {
      display: flex;
      align-items: center;
      padding: 0.4rem 0.75rem 0.4rem 2.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #94a3b8;
      font-size: 0.8rem;
    }

    .ville-row:hover {
      background: rgba(249, 115, 22, 0.08);
      color: #f97316;
    }

    .ville-marker {
      margin-right: 0.5rem;
      font-size: 0.75rem;
    }

    .ville-label {
      flex: 1;
    }

    .structure-count-small {
      background: rgba(249, 115, 22, 0.15);
      color: #f97316;
      padding: 0.1rem 0.3rem;
      border-radius: 8px;
      font-size: 0.65rem;
      font-weight: 600;
    }

    /* Structures styles */
    .structures-node {
      padding-left: 0.5rem;
      margin-left: 1.5rem;
      border-left: 1px solid rgba(249, 115, 22, 0.2);
    }

    .structure-row {
      display: flex;
      align-items: center;
      padding: 0.35rem 0.5rem 0.35rem 2rem;
      cursor: pointer;
      transition: all 0.2s ease;
      color: #64748b;
      font-size: 0.75rem;
      text-decoration: none;
      border-radius: 4px;
      margin: 1px 0;
    }

    .structure-row:hover {
      background: rgba(249, 115, 22, 0.05);
      color: #f97316;
    }

    .structure-marker {
      margin-right: 0.5rem;
      font-size: 0.7rem;
    }

    .structure-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .no-structures {
      padding: 0.35rem 0.5rem 0.35rem 2rem;
      color: #475569;
      font-size: 0.7rem;
      font-style: italic;
    }

    .no-data {
      padding: 0.75rem 2rem;
      color: #64748b;
      font-size: 0.8rem;
      text-align: center;
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
        position: fixed;
        top: 0;
        left: 0;
        transform: translateX(-100%);
        z-index: 1200;
        transition: transform 0.3s ease;
      }

      .sidebar.mobile-open {
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

  constructor(
    public authService: AuthService,
    private structureService: StructureMefpService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.authService.updateUserFromToken();
    }

    console.log('Sidebar - User authenticated:', this.authService.isAuthenticated());
    console.log('Sidebar - isAdmin():', this.authService.isAdmin());
    console.log('Sidebar - isAgentDGSI():', this.authService.isAgentDGSI());
    console.log('Sidebar - Initial isOpen value:', this.isOpen);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      this.isOpen = changes['isOpen'].currentValue;
      console.log('Sidebar - isOpen changed to:', this.isOpen);
    }
  }

   toggleSidebar(): void {
    console.log('SidebarComponent - toggleSidebar called, current isOpen:', this.isOpen);
    this.isOpen = !this.isOpen;
    this.toggleChange.emit(this.isOpen);
  }

  toggleSection(section: string): void {
    const wasExpanded = this.sections[section];
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





  /**
   * Get total structures count for a region
   */
  getTotalStructuresForRegion(region: RegionHierarchy): number {
    return region.villes.reduce((total, ville) => total + ville.structures.length, 0);
  }

  /**
   * Handle structure click - navigate to structures page with ville filter
   */
  onStructureClick(structure: StructureInfo): void {
    // Navigate to structures page with region and ville filters
    // The structure info contains the region and ville information
    console.log('Structure clicked:', structure);
  }
}
