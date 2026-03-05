import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { PrestationFormComponent } from '../prestation-form/prestation-form.component';
import { ItemService } from '../../../../core/services/item.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { Item, FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { PrestationCardComponent } from "../../../../components/prestation-card/prestation-card.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-prestation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, PrestationCardComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800 p-6">

      <!-- HEADER -->
      <div class="flex items-center justify-center mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <svg class="w-7 h-7 text-[rgb(28,82,118)]" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V5a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v2l-3 6H6l-3-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 21H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Gestion des Prestations
        </h1>
      </div>

      <!-- STATISTICS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">Total</p>
            <h3 class="text-3xl font-bold text-[rgb(28,82,118)]">{{ displayItems.length }}</h3>
          </div>
          <i class="fas fa-clipboard-list text-3xl text-[rgb(28,82,118)]"></i>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">En attente de validation</p>
            <h3 class="text-3xl font-bold text-yellow-500">{{ getValidationCountByStatut('EN_ATTENTE') }}</h3>
          </div>
          <i class="fas fa-hourglass-half text-3xl text-yellow-400"></i>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">Validées</p>
            <h3 class="text-3xl font-bold text-green-600">{{ getValidationCountByStatut('VALIDE') }}</h3>
          </div>
          <i class="fas fa-check-circle text-3xl text-green-500"></i>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Recherche -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                placeholder="Nom prestataire, item, description..."
                class="w-full border border-gray-300 rounded-lg py-2 px-4 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-[rgb(28,82,118)] outline-none transition"
              />
              <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0z"/>
              </svg>
            </div>
          </div>

          <!-- Statut -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              [(ngModel)]="selectedStatut"
              (change)="onFilterChange()"
              class="w-full border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-blue-500 focus:border-[rgb(28,82,118)] outline-none transition"
            >
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente de validation</option>
              <option value="VALIDE">Validées</option>
              <option value="REJETE">Rejetées</option>
              <option value="BROUILLON">Brouillons</option>
            </select>
          </div>

          <!-- Effacer -->
          <div class="flex items-end">
            <button
              class="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
              (click)="clearFilters()"
              [disabled]="!searchTerm && !selectedStatut"
            >
              <i class="fas fa-times text-sm"></i>
              Effacer
            </button>
          </div>
        </div>
      </div>

      <!-- PRESTATIONS GRID -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Liste des prestations</h2>
          <button *ngIf="canCreatePrestation()" class="flex items-center gap-2 bg-[rgb(28,82,118)] text-white px-5 py-2 rounded-lg shadow hover:bg-[rgb(28,82,118)] transition" (click)="creerNouvellePrestation()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle Prestation
          </button>
        </div>

        <div *ngIf="loading; else cardsContent" class="flex flex-col items-center justify-center py-16 text-gray-600">
          <div class="loader mb-4 border-4 border-[rgba(28,82,118,0.3)] border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <p>Chargement des prestations...</p>
        </div>

        <ng-template #cardsContent>
          <div *ngIf="filteredDisplayItems.length > 0; else noData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <app-prestation-card
              *ngFor="let prestation of filteredDisplayItems; trackBy: trackByPrestationId"
              [titre]="getPrestationCardTitle(prestation)"
              [description]="getPrestationCardDescription(prestation)"
              [fichierUrl]="getPrestationPdfUrl(prestation)"
              [prestationId]="prestation.id?.toString() ?? ''"
              [userRoles]="getCurrentUserRoles()"
              [fiche]="getFicheForPrestation(prestation)"
              [statutValidation]="getStatutValidation(prestation)"
              (detailsClicked)="onDetailsClicked($event)"
              (submitClicked)="onSubmitClicked($event)"
              (validateClicked)="onValidateClicked($event)"
              (rejectClicked)="onRejectClicked($event)"
              (deleteClicked)="onDeleteClicked($event)">
            </app-prestation-card>
          </div>

          <ng-template #noData>
            <div class="text-center py-20 text-gray-500">
              <div class="text-6xl mb-3">📋</div>
              <h3 class="text-xl font-semibold mb-1">Aucune prestation trouvée</h3>
              <p>{{ searchTerm || selectedStatut ? 'Aucun résultat ne correspond à vos critères.' : 'Aucune prestation enregistrée pour le moment.' }}</p>
            </div>
          </ng-template>
        </ng-template>

        <!-- PAGINATION CONTROLS -->
        <div *ngIf="pagination.totalPages > 1" class="flex items-center justify-between mt-8 px-4 py-3 bg-white border-t border-gray-200">
          <div class="flex items-center text-sm text-gray-700">
            <span>Affichage de {{ (pagination.page * pagination.size) + 1 }} à {{ min((pagination.page + 1) * pagination.size, pagination.totalElements) }} sur {{ pagination.totalElements }} résultats</span>
          </div>

          <div class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              (click)="changePage(pagination.page - 1)"
              [disabled]="pagination.first"
              class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Précédent
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center space-x-1">
              <button
                *ngFor="let page of getPageNumbers()"
                (click)="changePage(page)"
                [class.bg-[rgb(28,82,118)]]="page === pagination.page"
                [class.text-white]="page === pagination.page"
                class="px-3 py-1 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50"
                [class.bg-white]="page !== pagination.page"
                [class.text-gray-700]="page !== pagination.page"
              >
                {{ page + 1 }}
              </button>
            </div>

            <!-- Next Button -->
            <button
              (click)="changePage(pagination.page + 1)"
              [disabled]="pagination.last"
              class="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

    </div>
  `,
})
export class PrestationListComponent implements OnInit {
  prestations: Prestation[] = [];
  filteredPrestations: Prestation[] = [];
  items: Item[] = [];
  fiches: FichePrestation[] = [];
  searchTerm = '';
  selectedStatut = '';

  // Loading state
  loading = false;

  // Use prestations as the primary data source for display
  displayItems: Prestation[] = [];
  filteredDisplayItems: Prestation[] = [];

  // Pagination
  pagination: any = {
    page: 0,
    size: 12,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true
  };

  // Fiche map for efficient lookup without method calls in template
  ficheMap: Map<string, FichePrestation> = new Map();

  // Cache user roles to avoid repeated processing
  cachedUserRoles: string[] = [];

  constructor(
    private authService: AuthService,
    private prestationService: PrestationService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private itemService: ItemService,
    private fichePrestationService: FichePrestationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPrestations();
  }

  loadPrestations(): void {
    this.loading = true;

    // Determine which prestation API to call based on user role
    const currentUser = this.authService.getCurrentUser();
    const isPrestataire = currentUser?.role === 'PRESTATAIRE';
    const prestationPromise = isPrestataire
      ? this.prestationService.getMyPrestations(this.pagination.page, this.pagination.size).toPromise()
      : this.prestationService.getAllPrestations(this.pagination.page, this.pagination.size).toPromise();

    Promise.all([
      prestationPromise,
      this.itemService.getAllItems().toPromise(),
      this.fichePrestationService.getAllFiches().toPromise()
    ]).then(([prestationResponse, items, fiches]) => {
      // Handle paginated response
      if (prestationResponse && typeof prestationResponse === 'object' && 'content' in prestationResponse) {
        this.prestations = prestationResponse.content || [];
        this.pagination = {
          page: prestationResponse.page,
          size: prestationResponse.size,
          totalElements: prestationResponse.totalElements,
          totalPages: prestationResponse.totalPages,
          first: prestationResponse.first,
          last: prestationResponse.last
        };
      } else {
        // Fallback for non-paginated response
        this.prestations = prestationResponse || [];
      }

      this.items = items || [];
      this.fiches = fiches || [];

      // Build fiche map for efficient lookup (normalize keys to string to avoid number/string mismatch)
      this.ficheMap.clear();
      this.fiches.forEach(fiche => {
        if (fiche.idPrestation !== undefined && fiche.idPrestation !== null) {
          this.ficheMap.set(String(fiche.idPrestation), fiche);
        }
      });

      // Filter prestations based on user role
      if (isPrestataire && currentUser) {
        // Prestataires see only their own prestations
        // Amélioration du filtrage côté client pour être plus flexible
        console.log('🔍 Filtrage prestataire - User:', currentUser.nom, 'Email:', currentUser.email);
        console.log('🔍 Prestations avant filtrage:', this.prestations.length);
        
        this.displayItems = this.prestations.filter(p => {
          // Correspondance par nom (insensible à la casse)
          const matchNom = p.nomPrestataire?.toLowerCase() === currentUser.nom?.toLowerCase();
          
          // Correspondance par email (insensible à la casse)
          const matchEmail = p.contactPrestataire?.toLowerCase() === currentUser.email?.toLowerCase();
          
          // Correspondance par ID prestataire
          const matchId = p.prestataireId === currentUser.id?.toString();
          
          // Correspondance par ID de l'utilisateur dans le champ id (si la prestation a un champ id d'utilisateur)
          const matchUserId = p.id && currentUser.id && p.id.toString() === currentUser.id.toString();
          
          console.log('🔍 Prestation:', p.nomPrestataire, 'Match nom:', matchNom, 'Match email:', matchEmail, 'Match ID:', matchId, 'Match User ID:', matchUserId);
          
          return matchNom || matchEmail || matchId || matchUserId;
        });
        
        console.log('🔍 Prestations après filtrage:', this.displayItems.length);
      } else {
        // Admins see all prestations
        this.displayItems = [...this.prestations];
      }

      this.filteredDisplayItems = [...this.displayItems];
      this.filteredPrestations = [...this.prestations]; // Keep for backward compatibility
      // Apply current filters to the new data
      this.filterFiches();
      this.loading = false;
    }).catch((error) => {
      if (error.status !== 401) {
        console.error('Erreur lors du chargement des données:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les données'
        });
      }
      this.loading = false;
    });
  }


  onSearch(): void {
    this.filterFiches();
  }

  onFilterChange(): void {
    this.filterFiches();
  }

  filterFiches(): void {
    let filtered = [...this.displayItems];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.nomPrestataire?.toLowerCase().includes(searchLower) ?? false) ||
        (p.nomPrestation?.toLowerCase().includes(searchLower) ?? false) ||
        (p.nomStructure?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Filter by validation status
    if (this.selectedStatut) {
      filtered = filtered.filter(p => (p as any).statutValidation === this.selectedStatut);
    }

    this.filteredDisplayItems = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = '';
    this.filteredDisplayItems = [...this.displayItems];
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.pagination.totalPages) {
      this.pagination.page = page;
      this.loadPrestations();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const totalPages = this.pagination.totalPages;
    const currentPage = this.pagination.page;

    // Show max 5 page numbers
    let startPage = Math.max(0, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < 4) {
      if (startPage === 0) {
        endPage = Math.min(totalPages - 1, startPage + 4);
      } else if (endPage === totalPages - 1) {
        startPage = Math.max(0, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  // TrackBy function for ngFor to prevent unnecessary re-renders during scrolling
  trackByPrestationId(index: number, prestation: Prestation): string {
    return prestation.id?.toString() || index.toString();
  }

  getCountByStatut(statut: string): number {
    return this.prestations.filter(p => p.statut === statut).length;
  }

  getFicheCountByStatut(statut: string): number {
    return this.displayItems.filter(p => p.statutIntervention === statut).length;
  }

  getValidationCountByStatut(statut: string): number {
    return this.displayItems.filter(p => (p as any).statutValidation === statut).length;
  }

  getRealizedCount(prestation: Prestation): { count: number; max: number } {
    const item = this.items.find(i => i.nomItem === prestation.nomPrestation);
    const max = item ? item.quantiteMaxTrimestre : 0;
    const count = this.prestations.filter(p => p.nomPrestataire === prestation.nomPrestataire && p.nomPrestation === prestation.nomPrestation && p.statut === 'terminé').length;
    return { count, max };
  }

  getRowClass(statut: string | undefined): string {
    if (!statut) return '';
    switch (statut.toLowerCase()) {
      case 'terminé': return 'row-completed';
      case 'en cours': return 'row-in-progress';
      case 'en attente': return 'row-pending';
      default: return '';
    }
  }

  editPrestation(prestation: Prestation): void {
    const dialogRef = this.dialog.open(PrestationFormComponent, {
      width: '800px',
      data: { prestation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPrestations();
      }
    });
  }

  creerNouvellePrestation(): void {
    const dialogRef = this.dialog.open(PrestationFormComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadPrestations();
      }
    });
  }

  async deletePrestation(prestation: Prestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la prestation',
      message: `Êtes-vous sûr de vouloir supprimer la prestation "${prestation.nomPrestation}" ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.prestationService.deletePrestation(prestation.id!).subscribe({
        next: () => {
          this.loadPrestations();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de supprimer la prestation'
          });
        }
      });
    }
  }

  refreshData(): void {
    this.loadPrestations();
  }

  formatPrestationName(name: string): string {
    if (!name) return '';

    const words = name.trim().split(/\s+/);
    if (words.length <= 4) return name;

    // Instead of line breaks, use a shorter format for better table display
    if (words.length <= 6) {
      return words.slice(0, 3).join(' ') + '\n' + words.slice(3).join(' ');
    } else {
      // For longer names, show first 3 words, then ellipsis
      return words.slice(0, 3).join(' ') + '\n...';
    }
  }

  formatDescription(description: string | undefined): string {
    if (!description) return '';

    const words = description.trim().split(/\s+/);
    if (words.length <= 3) return description;

    // Break after 3 or 4 words
    if (words.length <= 7) {
      return words.slice(0, 4).join(' ') + '\n' + words.slice(4).join(' ');
    } else {
      // For longer descriptions, break after 3 words and add ellipsis
      return words.slice(0, 3).join(' ') + '\n' + words.slice(3, 6).join(' ') + '\n...';
    }
  }

  // Helper method to get truncated prestation name for display
  getPrestationNameTruncated(name: string): string {
    if (!name) return '';
    if (name.length <= 30) return name;
    return name.substring(0, 30) + '...';
  }

  // Helper method to get full prestation name for tooltip
  getPrestationNameTooltip(name: string): string {
    return name || '';
  }

  isAdmin(): boolean {
    return this.authService.getCurrentUser()?.role === 'ADMINISTRATEUR';
  }

  canCreatePrestation(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'PRESTATAIRE' || user?.role === 'ADMINISTRATEUR';
  }

  getCurrentUserRoles(): string[] {
    // Return cached roles if available
    if (this.cachedUserRoles.length > 0) {
      return this.cachedUserRoles;
    }

    const user = this.authService.getCurrentUser();

    if (!user) {
      return [];
    }

    // Si user.role est déjà un tableau, le retourner directement
    if (Array.isArray(user.role)) {
      this.cachedUserRoles = user.role;
      return user.role;
    }

    // Si user.role est une chaîne, la traiter
    if (typeof user.role === 'string') {
      // Sépare par virgule et nettoie chaque rôle
      const roles = user.role.split(',').map(r => r.trim());

      // Ajoute les versions normalisées
      const allRoles = new Set<string>();

      for (const role of roles) {
        if (!role) continue;

        // Ajoute le rôle tel quel
        allRoles.add(role);

        // Ajoute la version sans préfixe ROLE_
        if (role.toUpperCase().startsWith('ROLE_')) {
          allRoles.add(role.substring(5));
        }

        // Ajoute la version en majuscules
        allRoles.add(role.toUpperCase());
      }

      this.cachedUserRoles = Array.from(allRoles).filter(r => !!r);
      return this.cachedUserRoles;
    }

    return [];
  }

  getStatutValidation(prestation: Prestation): string {
    return (prestation as any).statutValidation || '';
  }

  async changeStatus(prestation: Prestation, event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value;
    if (newStatus !== prestation.statut) {
      const confirmed = await this.confirmationService.show({
        title: 'Confirmer le changement de statut',
        message: `Êtes-vous sûr de vouloir changer le statut à "${newStatus}" ?`,
        type: 'warning',
        confirmText: 'Changer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        const updatedPrestation = { ...prestation, statut: newStatus };
        this.prestationService.updatePrestation(prestation.id!, updatedPrestation).subscribe({
          next: () => {
            prestation.statut = newStatus;
            this.loadPrestations(); // Refresh to reflect changes
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour du statut:', error);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: 'Impossible de mettre à jour le statut'
            });
          }
        });
      }
    }
  }

  // Helper methods for PrestationCard component
  getPrestationCardTitle(prestation: Prestation): string {
    return prestation.nomPrestation || `Prestation ${prestation.id ?? 'sans ID'}`;
  }

  getPrestationCardDescription(prestation: Prestation): string {
    const prestataire = prestation.nomPrestataire || 'Prestataire non spécifié';
    const structure = prestation.nomStructure || 'Structure non spécifiée';
    const lot = prestation.lot || 'Lot non spécifié';
    const montant = prestation.montantIntervention ? `${prestation.montantIntervention} FCFA` : '0 FCFA';
    const statutIntervention = prestation.statutIntervention || 'En attente';
    const statutValidation = (prestation as any).statutValidation || 'BROUILLON';

    return `Prestataire: ${prestataire}\nStructure: ${structure}\nLot: ${lot}\nMontant intervention: ${montant}\nStatut intervention: ${statutIntervention}\nStatut validation: ${statutValidation}`;
  }

  getPrestationPdfUrl(prestation: Prestation): string | undefined {
    // Return PDF URL if available, otherwise undefined
    return prestation.id ? `/api/prestations/${prestation.id}/pdf` : undefined;
  }

  getFicheForPrestation(prestation: Prestation): FichePrestation | undefined {
    if (!prestation || !prestation.id) {
      return undefined;
    }

    const pIdStr = prestation.id.toString();
    // Try map lookup first (keys normalized to strings)
    let fiche = this.ficheMap.get(pIdStr);
    if (fiche) return fiche;

    // Fallback: try to find in the fiches array with tolerant comparisons
    fiche = this.fiches.find(f => {
      const idPrestationKey = f.idPrestation !== undefined && f.idPrestation !== null ? String(f.idPrestation) : undefined;
      const matchById = idPrestationKey === pIdStr;
      const matchByNames = (f.nomPrestataire || '').toLowerCase() === (prestation.nomPrestataire || '').toLowerCase()
                        && (f.nomItem || '').toLowerCase() === (prestation.nomPrestation || '').toLowerCase();
      return matchById || matchByNames;
    });

    return fiche;
  }

  // Helper methods for FichePrestation display
  getFicheCardTitle(fiche: FichePrestation): string {
    return fiche.nomItem || `Fiche ${fiche.id ?? 'sans ID'}`;
  }

  getFicheCardDescription(fiche: FichePrestation): string {
    const prestataire = fiche.nomPrestataire || 'Prestataire non spécifié';
    const date = fiche.dateRealisation ? new Date(fiche.dateRealisation).toLocaleDateString('fr-FR') : 'Date non définie';
    const statut = fiche.statut || 'Statut non défini';
    const quantite = fiche.quantite || 0;

    return `Prestataire: ${prestataire}\nDate réalisation: ${date}\nQuantité: ${quantite}\nStatut: ${statut}`;
  }

  getFichePdfUrl(fiche: FichePrestation): string | undefined {
    // Return PDF URL if available, otherwise undefined
    return fiche.id ? `/api/fiches-prestation/${fiche.id}/pdf` : undefined;
  }

  // Event handlers for PrestationCard component
  onDetailsClicked(prestationId: string): void {
    this.router.navigate(['/prestations', prestationId]);
  }

  onSubmitClicked(prestationId: string): void {
    const prestation = this.prestations.find(p => p.id?.toString() === prestationId);
    if (!prestation) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Prestation non trouvée'
      });
      return;
    }

    // Check if prestation is in BROUILLON status
    if ((prestation as any).statutValidation !== 'BROUILLON') {
      this.toastService.show({
        type: 'warning',
        title: 'Action impossible',
        message: 'Seules les prestations en brouillon peuvent être soumises'
      });
      return;
    }

    this.prestationService.submitPrestationForValidation(parseInt(prestationId)).subscribe({
      next: (response) => {
        this.toastService.show({
          type: 'success',
          title: 'Soumission réussie',
          message: 'La prestation a été soumise pour validation'
        });
        // Refresh the list to show updated status
        this.loadPrestations();
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur de soumission',
          message: error.error?.message || 'Impossible de soumettre la prestation'
        });
      }
    });
  }

  onDeleteClicked(prestationId: string): void {
    const prestation = this.prestations.find(p => p.id?.toString() === prestationId);
    if (prestation) {
      this.deletePrestation(prestation);
    }
  }

  async onValidateClicked(prestationId: string): Promise<void> {
    console.log('Validation de la prestation ID:', prestationId);

    const prestation = this.prestations.find(p => p.id?.toString() === prestationId);
    if (!prestation) {
      this.toastService.show({ type: 'error', title: 'Erreur', message: 'Prestation introuvable' });
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Confirmer la validation',
      message: 'Êtes-vous sûr de vouloir valider cette prestation ?',
      type: 'warning',
      confirmText: 'Valider',
      cancelText: 'Annuler'
    });

    if (!confirmed) return;

    this.prestationService.validatePrestation(prestationId).subscribe({
      next: () => {
        this.toastService.show({ type: 'success', title: 'Validation réussie', message: 'La prestation a été validée avec succès' });
        this.loadPrestations();
      },
      error: (error: any) => {
        console.error('Erreur lors de la validation:', error);
        this.toastService.show({ type: 'error', title: 'Erreur de validation', message: error.error?.message || 'Une erreur est survenue' });
      }
    });
  }

  async onRejectClicked(prestationId: string): Promise<void> {
    console.log('Rejet de la prestation ID:', prestationId);

    // Trouver la prestation correspondante
    const prestation = this.prestations.find(p => p.id?.toString() === prestationId);
    if (!prestation) {
      console.error('Prestation non trouvée pour l\'ID:', prestationId);
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Prestation introuvable'
      });
      return;
    }

    // Trouver la fiche correspondant à la prestation avec plusieurs critères de correspondance
    let fiche = this.fiches.find(f => {
      // Correspondance par idPrestation (string)
      const matchById = f.idPrestation === prestationId;
      
      // Correspondance par nomPrestataire et nomItem
      const matchByNames = f.nomPrestataire === prestation.nomPrestataire &&
                          f.nomItem === prestation.nomPrestation;
      
      // Correspondance par nomPrestataire et nomStructure
      const matchByStructure = f.nomPrestataire === prestation.nomPrestataire &&
                              f.nomStructure === prestation.nomStructure;
      
      return matchById || matchByNames || matchByStructure;
    });

    // Si pas trouvée, essayer via getFicheForPrestation (Map)
    if (!fiche) {
      fiche = this.getFicheForPrestation(prestation);
    }

    if (!fiche) {
      console.error('Aucune fiche trouvée pour la prestation ID:', prestationId);
      console.log('Prestation:', prestation);
      console.log('Fiches disponibles:', this.fiches.map(f => ({
        id: f.id,
        idPrestation: f.idPrestation,
        nomItem: f.nomItem,
        nomPrestataire: f.nomPrestataire,
        nomStructure: f.nomStructure
      })));
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Fiche de prestation introuvable pour cette prestation'
      });
      return;
    }

    console.log('Fiche trouvée pour rejet:', fiche);

    console.log('Fiche trouvée pour rejet:', fiche);

    // Vérifier que l'ID de la fiche est valide
    if (!fiche.id) {
      console.error('ID de fiche manquant pour le rejet');
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de fiche manquant pour le rejet'
      });
      return;
    }

    // Afficher une boîte de dialogue de confirmation
    const confirmed = await this.confirmationService.show({
      title: 'Confirmer le rejet',
      message: 'Êtes-vous sûr de vouloir rejeter cette fiche de prestation ?',
      type: 'warning',
      confirmText: 'Rejeter',
      cancelText: 'Annuler'
    });

    if (!confirmed) return;

    console.log('Appel du service pour rejeter la fiche ID:', fiche.id);

    this.fichePrestationService.rejeterFiche(fiche.id).subscribe({
      next: (response) => {
        console.log('Réponse de rejet:', response);
        this.toastService.show({
          type: 'success',
          title: 'Rejet réussi',
          message: 'La fiche de prestation a été rejetée avec succès'
        });
        // Update fiche status in map
        fiche.statut = StatutFiche.REJETE;
        this.ficheMap.set(fiche.idPrestation!, fiche);
        this.loadPrestations();
      },
      error: (error) => {
        console.error('Erreur lors du rejet de la fiche:', error);
        let errorMessage = 'Une erreur est survenue lors du rejet';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
        } else if (error.status === 401) {
          errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette action';
        } else if (error.status === 404) {
          errorMessage = 'La fiche de prestation est introuvable';
        } else if (error.status === 400) {
          errorMessage = 'Données de rejet incorrectes';
        }

        this.toastService.show({
          type: 'error',
          title: 'Erreur de rejet',
          message: errorMessage
        });
      }
    });
  }


  async deleteFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la fiche de prestation',
      message: `Êtes-vous sûr de vouloir supprimer la fiche "${fiche.nomItem}" ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.fichePrestationService.deleteFiche(fiche.id!).subscribe({
        next: () => {
          this.loadPrestations();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de supprimer la fiche'
          });
        }
      });
    }
  }


}
