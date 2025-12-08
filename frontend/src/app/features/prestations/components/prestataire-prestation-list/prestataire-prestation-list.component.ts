import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../core/services/auth.service';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ItemService } from '../../../../core/services/item.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { Item, FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { PrestationCardComponent } from '../../../../components/prestation-card/prestation-card.component';
import { PrestationFormComponent } from '../prestation-form/prestation-form.component';

@Component({
  selector: 'app-prestataire-prestation-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, PrestationCardComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-800 p-6">

      <!-- HEADER -->
      <div class="flex items-center justify-center mb-10">
        <h1 class="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <svg class="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V5a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v2l-3 6H6l-3-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 21H8a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Gestion de mes fiches de Prestations
        </h1>
      </div>

      <!-- STATISTICS -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">Total Prestations</p>
            <h3 class="text-3xl font-bold text-blue-600">{{ displayItems.length }}</h3>
          </div>
          <i class="fas fa-clipboard-list text-3xl text-blue-500"></i>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">En Attente</p>
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

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-center hover:shadow-md transition">
          <div>
            <p class="text-sm text-gray-500">Rejetés</p>
            <h3 class="text-3xl font-bold text-red-600">{{ getValidationCountByStatut('REJETE') }}</h3>
          </div>
          <i class="fas fa-times-circle text-3xl text-red-500"></i>
        </div>
      </div>

     

      <!-- Liste des Prestations -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-900">Liste des Prestations</h2>
          <button class="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition" (click)="creerNouvellePrestation()">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle Prestation
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              placeholder="Rechercher une prestation..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div class="md:w-64">
            <select
              [(ngModel)]="selectedStatutValidation"
              (change)="onFilterChange()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="EN_ATTENTE">En attente de validation</option>
              <option value="VALIDE">Validé</option>
              <option value="REJETE">Rejeté</option>
            </select>
          </div>
          <button
            (click)="clearFilters()"
            [disabled]="!searchTerm && !selectedStatutValidation"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Effacer
          </button>
        </div>

        <div *ngIf="loading; else cardsContent" class="flex flex-col items-center justify-center py-16 text-gray-600">
          <div class="loader mb-4 border-4 border-blue-300 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
          <p>Chargement de vos prestations...</p>
        </div>

        <ng-template #cardsContent>
          <div *ngIf="filteredDisplayItems.length > 0; else noData" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <app-prestation-card
              *ngFor="let prestation of filteredDisplayItems"
              [titre]="getPrestationCardTitle(prestation)"
              [description]="getPrestationCardDescription(prestation)"
              [fichierUrl]="getPrestationPdfUrl(prestation)"
              [prestationId]="prestation.id?.toString() ?? ''"
              [userRoles]="userRoles"
              [fiche]="getFicheForPrestation(prestation)"
              [statutValidation]="getStatutValidation(prestation)"
              (detailsClicked)="onDetailsClicked($event)"
              (statutInterventionChanged)="onStatutInterventionChanged($event)"
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
              <p>{{ searchTerm || selectedStatutValidation ? 'Aucun résultat ne correspond à vos critères.' : 'Vous n\'avez pas encore créé de prestation.' }}</p>
            </div>
          </ng-template>
        </ng-template>
      </div>

    </div>
  `,
})
export class PrestatairePrestationListComponent implements OnInit {
  prestations: Prestation[] = [];
  filteredPrestations: Prestation[] = [];
  items: Item[] = [];
  fiches: FichePrestation[] = [];
  searchTerm = '';
  selectedStatutValidation = '';

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

  currentUser: any = null;

  get userRoles(): string[] {
    return this.currentUser?.role ? [this.currentUser.role] : [];
  }

  constructor(
    private authService: AuthService,
    private prestationService: PrestationService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private router: Router,
    private itemService: ItemService,
    private fichePrestationService: FichePrestationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Also set initial value
    this.currentUser = this.authService.getCurrentUser();
    this.loadPrestations();
  }

  loadPrestations(): void {
    this.loading = true;
    // Utiliser la méthode du service avec debug logs
    this.prestationService.getMyPrestations(this.pagination.page, this.pagination.size).subscribe({
      next: (prestationResponse) => {
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

        this.displayItems = [...this.prestations];
        this.filteredDisplayItems = [...this.displayItems];

        // Charger aussi les items et fiches si nécessaire
        Promise.all([
          this.itemService.getAllItems().toPromise(),
          this.fichePrestationService.getAllFiches().toPromise()
        ]).then(([items, fiches]) => {
          this.items = items || [];
          // Filtrer les fiches pour n'afficher que celles du prestataire connecté
          this.fiches = this.filterFichesByCurrentUser(fiches || []);
          console.log(`Fiches filtrées pour l'utilisateur ${this.currentUser?.nom}: ${this.fiches.length} fiches`);
          this.loading = false;
        }).catch(error => {
          console.warn('Erreur lors du chargement des données secondaires:', error);
          this.loading = false;
        });
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement de vos prestations:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de charger vos prestations. Vérifiez votre connexion.'
          });
        }
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.filterPrestations();
  }

  onFilterChange(): void {
    this.filterPrestations();
  }

  filterPrestations(): void {
    let filtered = [...this.displayItems];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.nomPrestation?.toLowerCase().includes(searchLower) ?? false) ||
        (p.nomStructure?.toLowerCase().includes(searchLower) ?? false) ||
        (p.statutIntervention?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Filter by validation status
    if (this.selectedStatutValidation) {
      filtered = filtered.filter(p => (p as any).statutValidation === this.selectedStatutValidation);
    }

    this.filteredDisplayItems = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatutValidation = '';
    this.filteredDisplayItems = [...this.displayItems];
  }

  getValidationCountByStatut(statut: string): number {
    return this.displayItems.filter(p => (p as any).statutValidation === statut).length;
  }

  filterFichesByCurrentUser(fiches: FichePrestation[]): FichePrestation[] {
    if (!this.currentUser) {
      console.warn('Aucun utilisateur connecté, retour de liste vide');
      return [];
    }

    // Récupérer le nom de l'entreprise du prestataire connecté
    const userCompanyName = this.currentUser.structurePrestataire || this.currentUser.nom;
    console.log(`Filtrage des fiches pour l'entreprise: ${userCompanyName}`);

    // Filtrer les fiches qui appartiennent à l'entreprise de l'utilisateur connecté
    const filteredFiches = fiches.filter(fiche => {
      const matches = fiche.nomPrestataire === userCompanyName;
      if (matches) {
        console.log(`Fiche ${fiche.id} correspond: ${fiche.nomPrestataire}`);
      }
      return matches;
    });

    console.log(`Fiches filtrées: ${filteredFiches.length} sur ${fiches.length} total`);
    return filteredFiches;
  }

  getStatutValidation(prestation: Prestation): string {
    return (prestation as any).statutValidation || '';
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

  // Helper methods for PrestationCard component
  getPrestationCardTitle(prestation: Prestation): string {
    return prestation.nomPrestation || `Prestation ${prestation.id ?? 'sans ID'}`;
  }

  getPrestationCardDescription(prestation: Prestation): string {
    const prestataire = prestation.nomPrestataire || 'Prestataire non spécifié';
    const structure = prestation.nomStructure || 'Structure non spécifiée';
    const montant = prestation.montantIntervention ? `${prestation.montantIntervention} FCFA` : 'Montant non défini';
    const statutIntervention = prestation.statutIntervention || 'Statut non défini';
    const statutValidation = (prestation as any).statutValidation || 'Statut inconnu';

    return `Prestataire: ${prestataire}\nStructure: ${structure}\nMontant intervention: ${montant}\nStatut intervention: ${statutIntervention}\nStatut validation: ${statutValidation}`;
  }

  getPrestationPdfUrl(prestation: Prestation): string | undefined {
    // Return PDF URL if available, otherwise undefined
    return prestation.id ? `/api/prestations/${prestation.id}/pdf` : undefined;
  }

  getFicheForPrestation(prestation: Prestation): FichePrestation | undefined {
    if (!prestation || !prestation.id) {
      console.warn('Prestation invalide ou sans ID:', prestation);
      return undefined;
    }

    const pIdStr = prestation.id.toString();
    console.log(`Recherche de fiche pour prestation ID: ${pIdStr}, nom: ${prestation.nomPrestation}, prestataire: ${prestation.nomPrestataire}`);

    // Vérifier si la prestation a déjà une fiche imbriquée
    if ((prestation as any).fiche) {
      console.log('Fiche trouvée dans l\'objet prestation:', (prestation as any).fiche);
      return (prestation as any).fiche;
    }

    // Essayer différentes méthodes de correspondance
    let fiche = this.fiches.find(f => {
      // 1. Correspondance directe par idPrestation
      if (f.idPrestation === pIdStr) {
        console.log('Correspondance directe par idPrestation');
        return true;
      }

      // 2. Correspondance par ID de fiche
      if (f.id?.toString() === pIdStr || f.id?.toString() === `FP-${pIdStr}`) {
        console.log('Correspondance par ID de fiche');
        return true;
      }

      // 3. Correspondance par nom de prestataire et nom d'item
      if (f.nomPrestataire && f.nomItem &&
          f.nomPrestataire === prestation.nomPrestataire &&
          f.nomItem === prestation.nomPrestation) {
        console.log('Correspondance par nom de prestataire et d\'item');
        return true;
      }

      return false;
    });

    // Si pas trouvée dans la liste, essayer de la récupérer individuellement
    if (!fiche) {
      console.log(`Tentative de récupération individuelle de la fiche pour prestation ${pIdStr}`);
      this.fichePrestationService.getFicheByPrestationId(pIdStr).subscribe({
        next: (fetchedFiche) => {
          console.log('Fiche récupérée individuellement:', fetchedFiche);
          // Ajouter à la liste pour éviter les appels répétés
          this.fiches.push(fetchedFiche);
          // Forcer la mise à jour de l'interface si nécessaire
          this.filteredDisplayItems = [...this.filteredDisplayItems];
        },
        error: (error) => {
          console.log(`Aucune fiche trouvée pour la prestation ${pIdStr} - elle sera créée lors de la soumission.`, error);
        }
      });
    }

    // Log des résultats de la recherche
    if (fiche) {
      console.log(`Fiche trouvée pour prestation ${pIdStr}:`, {
        ficheId: fiche.id,
        statut: fiche.statut,
        idPrestation: fiche.idPrestation,
        nomPrestataire: fiche.nomPrestataire,
        nomItem: fiche.nomItem
      });
    } else {
      console.log(`Aucune fiche trouvée pour la prestation ${pIdStr} - elle sera créée lors de la soumission. Fiches disponibles:`, this.fiches.length);
    }

    return fiche;
  }

  // Event handlers for PrestationCard component
  onDetailsClicked(prestationId: string): void {
    // Navigate to prestation detail page
    console.log('Voir détails prestation:', prestationId);
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
          message: 'Votre fiche de prestation a été soumise avec succès. L\'administrateur recevra une notification.'
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

  onValidateClicked(prestationId: string): void {
    // Update the prestation status to VALIDATED
    this.prestationService.updatePrestation(parseInt(prestationId), {
      statutValidation: 'VALIDE'
    } as any).subscribe({
      next: (response: any) => {
        this.toastService.show({
          type: 'success',
          title: 'Validation réussie',
          message: 'La prestation a été validée avec succès'
        });
        this.loadPrestations();
      },
      error: (error: any) => {
        console.error('Erreur lors de la validation:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur de validation',
          message: error.error?.message || 'Impossible de valider la prestation'
        });
      }
    });
  }

  onRejectClicked(prestationId: string): void {
    // For now, just show a message. In a real app, you'd have a dialog for rejection reason
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'Le rejet de prestation sera bientôt disponible'
    });
  }

  onStatutInterventionChanged(event: {prestationId: number, newStatutIntervention: string}): void {
    // Update the statutIntervention of the prestation
    this.prestationService.updatePrestation(event.prestationId, {
      statutIntervention: event.newStatutIntervention
    } as any).subscribe({
      next: (updatedPrestation) => {
        this.toastService.show({
          type: 'success',
          title: 'Mise à jour réussie',
          message: 'Le statut de l\'intervention a été mis à jour'
        });
        // Update the local data
        const index = this.prestations.findIndex(p => p.id === event.prestationId);
        if (index !== -1) {
          this.prestations[index] = updatedPrestation;
          this.displayItems = [...this.prestations];
          this.filteredDisplayItems = [...this.displayItems];
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur de mise à jour',
          message: 'Impossible de mettre à jour le statut de l\'intervention'
        });
      }
    });
  }

  async onDeleteClicked(prestationId: string): Promise<void> {
    const prestation = this.prestations.find(p => p.id?.toString() === prestationId);
    if (prestation) {
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
            this.toastService.show({
              type: 'success',
              title: 'Suppression réussie',
              message: 'La prestation a été supprimée'
            });
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
  }
}
