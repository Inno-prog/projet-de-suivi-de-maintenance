import { Component, ViewChild, HostListener, ElementRef, OnDestroy, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ToastService } from '../../../core/services/toast.service';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { NotificationBellComponent } from '../notification/notification.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SidebarComponent, ToastComponent, ConfirmationComponent, NotificationBellComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./modal-fix.css', './modal-visibility-fix.css'],
  styles: [`
    .app-layout {
      position: fixed !important;
      top: -2 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      display: grid !important;
      grid-template-columns: 290px 1fr !important;
      grid-template-rows: 3fr !important;
      grid-gap: 0 !important;
      gap: 0 !important;
      margin: 0!important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    app-sidebar {
      grid-column: 1 !important;
      grid-row: 1 !important;
      width: 260px !important;
      height: 100vh !important;
      overflow-y: auto !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .main-content {
      grid-column: 2 !important;
      grid-row: 1 !important;
      display: grid !important;
      grid-template-rows: 64px 1fr !important;
      grid-gap: 0 !important;
      gap: 0 !important;
      height: 100vh !important;
      overflow: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .navbar {
      grid-row: 1 !important;
      width: 100% !important;
      height: 64px !important;
      background: #0f172a !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .content {
      grid-row: 2 !important;
      overflow-y: auto !important;
      padding: 0 !important;
      height: calc(100vh - 64px) !important;
      margin: 30px 0 0 0!important;
      width: 100% !important;
      min-height: calc(100vh - 64px) !important;
      background: #f8fafc !important;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sidebar-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #e2e8f0;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .sidebar-toggle:hover {
      background: rgba(255,255,255,0.1);
    }

    .sidebar-toggle-nav {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: #e2e8f0;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-toggle-nav:hover {
      background: rgba(255,255,255,0.1);
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

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 6px;
      background: white;
      object-fit: contain;
    }

    .nav-text h1 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #e2e8f0;
    }

    .nav-user {
      display: flex;
      align-items: center;
    }

    .notification-container {
      margin-right: 0.75rem;
      display: flex;
      align-items: center;
    }

    .profile-section {
      position: relative;
    }

    .profile-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .profile-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 500;
      color: #e2e8f0;
      margin: 0;
    }

    .user-role {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }

    .dropdown-icon {
      color: #94a3b8;
      transition: transform 0.2s;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .profile-dropdown {
      position: absolute;
      top: 100%;
      /* Open the profile dropdown to the left side of the avatar to avoid clipping on the right */
      left: 0;
      right: auto;
      width: 280px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      margin-top: 0.5rem;
    }

    .profile-header {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 0.75rem;
    }

    .user-avatar-large {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.125rem;
    }

    .user-details h4 {
      margin: 0 0 0.25rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-details p {
      margin: 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .role-badge.admin {
      background: #fef3c7;
      color: #d97706;
    }

    .role-badge.prestataire {
      background: #dbeafe;
      color: #2563eb;
    }

    .role-badge.agent {
      background: #dcfce7;
      color: #16a34a;
    }

    .profile-menu {
      padding: 0.5rem 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      color: #374151;
      transition: background 0.2s;
    }

    .menu-item:hover {
      background: #f9fafb;
    }

    .menu-item.logout {
      color: #dc2626;
    }

    .menu-item.logout:hover {
      background: #fef2f2;
    }

    .menu-icon {
      width: 16px;
      height: 16px;
    }

    .menu-divider {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }

.content {
      flex: 1;
      /* Suppression complète du padding pour éliminer l'espace blanc */
      padding: 0;
      overflow-y: auto;
    }

    .modal-overlay {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      background: rgba(0,0,0,0.5) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
      visibility: visible !important;
      opacity: 1 !important;
    }

    .modal {
      background: white !important;
      border: 2px solid #1e293b !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3) !important;
      max-width: 500px !important;
      width: 90% !important;
      max-height: 90vh !important;
      min-height: 400px !important;
      overflow-y: auto !important;
      visibility: visible !important;
      opacity: 1 !important;
      z-index: 10000 !important;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: #64748b;
      padding: 0.25rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: #f1f5f9;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .profile-avatar-section {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .profile-avatar-large {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: white;
      color: #f97316;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 1.5rem;
      margin: 0 auto 1rem auto;
    }

    .profile-avatar-section h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
    }

    .profile-avatar-section p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }

    .btn-primary {
      background: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }


  `]
})
export class LayoutComponent implements AfterViewInit {
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('confirmation') confirmation!: ConfirmationComponent;

  currentUser: any;
  sidebarOpen = true;
  profileMenuOpen = false;
  showProfileModal = false;
  showSettingsModal = false;
  profileLoading = false;
  isMobile = false;

  // Prevent sidebar from being closed on desktop, allow on mobile
  private preventSidebarClose = true;

  profileForm: FormGroup;

  private routerEventsSub?: Subscription;
  private stabilizeInterval?: any;

  constructor(private fb: FormBuilder, public authService: AuthService, private confirmationService: ConfirmationService, private toastService: ToastService, private elementRef: ElementRef, private router: Router) {
    this.currentUser = this.authService.getCurrentUser();
    this.checkScreenSize();
    this.profileForm = this.fb.group({
      nom: [this.currentUser?.nom || ''],
      email: [this.currentUser?.email || ''],
      contact: [''],
      adresse: [''],
      // Prestataire-specific fields
      structure: [''],
      direction: [''],
      qualification: ['']
    });

  // Stabiliser le layout immédiatement (single pass). Avoid periodic inline style mutations.
  setTimeout(() => this.stabilizeLayout(), 0);

    // Initialize services
    setTimeout(() => {
      if (this.toast) {
        this.toastService.setComponent(this.toast);
      }
      if (this.confirmation) {
        this.confirmationService.setComponent(this.confirmation);
      }
    });

    // Close profile menu when navigating
    this.routerEventsSub = this.router.events.subscribe((ev: any) => {
      this.profileMenuOpen = false;
    });
  }

  ngOnDestroy(): void {
    this.routerEventsSub?.unsubscribe();
    // No periodic stabilization to clear (we avoid continuous inline style mutation)
  }

  ngAfterViewInit(): void {
    // Stabiliser le layout immédiatement
    this.stabilizeLayout();
  }

  private stabilizeLayout(): void {
    // Prefer CSS class based stabilization to avoid frequent inline style mutations.
    // The `.stable-layout` class (defined in styles.css) enforces fixed sidebar/navbar
    // and correct offsets. We also update navbar-dependent CSS variables.
    try {
      const root = document.querySelector('.app-layout');
      if (root && !root.classList.contains('stable-layout')) {
        root.classList.add('stable-layout');
      }
      // Update CSS variables (navbar height) for accurate layout
      this.updateNavbarCssVars();
    } catch (e) {
      console.warn('stabilizeLayout: failed to apply stable-layout class', e);
    }
  }



  toggleSidebar() {
    if (this.isMobile) {
      // Allow toggling on mobile
      this.sidebarOpen = !this.sidebarOpen;
      if (this.sidebar) {
        this.sidebar.isOpen = this.sidebarOpen;
      }
    } else {
      // Keep open on desktop
      this.sidebarOpen = true;
      if (this.sidebar) {
        this.sidebar.isOpen = true;
      }
    }
  }

  onSidebarToggle(isOpen: boolean) {
    if (this.isMobile) {
      this.sidebarOpen = isOpen;
    } else {
      // Always keep open on desktop
      this.sidebarOpen = true;
      if (this.sidebar && !isOpen) {
        this.sidebar.isOpen = true;
      }
    }
  }

  getUserInitials(): string {
    if (!this.currentUser?.nom) return '';
    return this.currentUser.nom.split(' ').map((n: string) => n[0]).join('').toUpperCase();
  }

  toggleProfileMenu() {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu() {
    this.profileMenuOpen = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = (event as any).target as Node;
    if (!this.elementRef.nativeElement.contains(target)) {
      // Close profile menu when clicking outside
      this.profileMenuOpen = false;
    }
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.sidebarOpen = false; // Close sidebar on mobile by default
    } else {
      this.sidebarOpen = true; // Open sidebar on desktop
    }
    // Keep CSS variables up-to-date when screen size changes
    this.updateNavbarCssVars();
  }

  /** Measure the actual navbar height and write CSS variables so styles can
   * adapt (modal offsets, main-content padding, etc.). Called on init and
   * on resize.
   */
  private updateNavbarCssVars(): void {
    try {
      const navbar = document.querySelector('.navbar') as HTMLElement | null;
      const root = document.documentElement;
      if (navbar && root) {
        const rect = navbar.getBoundingClientRect();
        const height = Math.round(rect.height) || 64;
        root.style.setProperty('--app-navbar-height', `${height}px`);
        // Provide a reasonable overlay gap; can be adjusted later if needed
        root.style.setProperty('--app-overlay-gap', `16px`);
      }
    } catch (e) {
      // ignore
      console.warn('Could not update navbar CSS variables', e);
    }
  }

  openProfileModal() {
    // Refresh current user data
    this.currentUser = this.authService.getCurrentUser();
    // Update form with current user data
    this.profileForm.patchValue({
      nom: this.currentUser?.nom || '',
      email: this.currentUser?.email || '',
      contact: this.currentUser?.contact || '',
      adresse: this.currentUser?.adresse || '',
      // Prestataire-specific fields
      structure: this.currentUser?.structure || '',
      direction: this.currentUser?.direction || '',
      qualification: this.currentUser?.qualification || ''
    });
    this.showProfileModal = true;
    this.closeProfileMenu();
    
    // Force modal visibility
    this.forceModalVisibility();
  }

  openSettingsModal() {
    this.showSettingsModal = true;
    this.closeProfileMenu();
    
    // Force modal visibility
    this.forceModalVisibility();
  }

  logout() {
    console.log('LayoutComponent: Bouton de déconnexion cliqué');
    this.authService.logout();
  }

  getRoleLabel(role?: string): string {
    const r = role || this.currentUser?.role;
    switch (r) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return r || '';
    }
  }

  getRoleClass(): string {
    const role = this.currentUser?.role;
    switch (role) {
      case 'ADMINISTRATEUR': return 'admin';
      case 'PRESTATAIRE': return 'prestataire';
      case 'AGENT_DGSI': return 'agent';
      default: return '';
    }
  }

  updateProfile() {
    if (this.profileForm.valid) {
      this.profileLoading = true;
      const profileData = this.profileForm.value;

      this.authService.updateUserProfile(profileData).subscribe({
        next: (updatedUser) => {
          this.profileLoading = false;
          this.closeProfileModal();
          this.currentUser = updatedUser; // Update local currentUser
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Profil mis à jour avec succès' });
        },
        error: (error) => {
          this.profileLoading = false;
          console.error('Error updating profile:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la mise à jour du profil' });
        }
      });
    }
  }

  closeProfileModal() {
    this.showProfileModal = false;
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
  }

  /**
   * Force la visibilité des modals en cas de problème d'affichage
   */
  private forceModalVisibility(): void {
    setTimeout(() => {
      const modals = document.querySelectorAll('.modal-overlay, .modal, .modal-content');
      modals.forEach(modal => {
        const element = modal as HTMLElement;
        element.style.display = 'flex';
        element.style.visibility = 'visible';
        element.style.opacity = '1';
        element.style.zIndex = '9999';
      });
    }, 50);
  }

  /**
   * Public wrapper so the template can trigger toast messages without
   * accessing the private toastService directly.
   */
  showDemoMessage(message: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    try {
      this.toastService.show({ type: 'info', title: 'Info', message });
    } catch (e) {
      // If toast service isn't available yet, ignore silently.
      console.warn('Toast service unavailable for demo message', e);
    }
  }
}
