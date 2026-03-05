import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation } from '../../../../core/models/business.models';
import { PrestationCardComponent } from "../../../../components/prestation-card/prestation-card.component";
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-prestations-list',
  standalone: true,
  imports: [CommonModule, PrestationCardComponent],
  template: `
    <div class="p-8">
      <button (click)="goBack()" class="btn btn-lg btn-back-sidebar mb-6">
        <i class="bi bi-arrow-left-circle me-2"></i> Retour aux lots
      </button>

      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold mb-2">Prestations - Lot {{ lotId }}</h1>
          <p class="text-gray-600">Trimestre {{ trimestre }} - {{ currentYear }}</p>
        </div>
        <button (click)="genererFicheGlobale()"
                class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                [disabled]="loading || fiches.length === 0">
          <i class="fas fa-file-pdf"></i>
          Générer Fiche Globale
        </button>
      </div>

      <div *ngIf="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(28,82,118)] mx-auto"></div>
        <p class="mt-4 text-gray-600">Chargement des prestations...</p>
      </div>

      <div *ngIf="!loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <app-prestation-card
          *ngFor="let fiche of fiches"
          [titre]="getFicheCardTitle(fiche)"
          [description]="getFicheCardDescription(fiche)"
          [fichierUrl]="getFichePdfUrl(fiche)"
          [prestationId]="fiche.idPrestation || ''"
          [userRoles]="getCurrentUserRoles()"
          [fiche]="fiche"
          [statutValidation]="fiche.statut"
          (detailsClicked)="onDetailsClicked($event)"
          (validateClicked)="onValidateClicked($event)"
          (rejectClicked)="onRejectClicked($event)">
        </app-prestation-card>
      </div>

      <div *ngIf="!loading && fiches.length === 0" class="text-center py-20 text-gray-500">
        <div class="text-6xl mb-3">📋</div>
        <h3 class="text-xl font-semibold mb-1">Aucune prestation trouvée</h3>
        <p>Il n'y a pas de prestations pour ce lot dans ce trimestre.</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    /* Bouton retour avec couleur sidebar (rgb(28, 82, 118)) */
    .btn-back-sidebar {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-weight: 500;
      font-size: 0.875rem;
      border: 2px solid rgb(28, 82, 118);
      border-radius: 0.5rem;
      background-color: rgb(28, 82, 118);
      color: white;
      transition: all 0.3s ease;
    }

    .btn-back-sidebar:hover {
      transform: translateY(-2px);
      background-color: rgb(20, 60, 90);
      border-color: rgb(20, 60, 90);
      box-shadow: 0 4px 12px rgba(28, 82, 118, 0.35);
    }

    .btn-back-sidebar i {
      font-size: 1rem;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class PrestationsListComponent implements OnInit {
  trimestre!: number;
  lotId!: string;
  currentYear = new Date().getFullYear();
  fiches: FichePrestation[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheService: FichePrestationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const trimestreParam = params.get('trimestre');
      const lotIdParam = params.get('lotId');

      if (trimestreParam && lotIdParam) {
        this.trimestre = +trimestreParam;
        this.lotId = lotIdParam;
        this.loadPrestations();
      }
    });
  }

  loadPrestations(): void {
    this.loading = true;
    this.ficheService.getFichesForLotAndQuarter(this.lotId, this.currentYear, this.trimestre)
      .subscribe({
        next: (fiches) => {
          this.fiches = fiches;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des prestations', error);
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/ordres-commande/trimestre', this.trimestre]);
  }

  getCurrentUserRoles(): string[] {
    // Simple implementation - you might want to use AuthService
    return ['ADMINISTRATEUR'];
  }

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
    return fiche.id ? `${environment.apiUrl}/fiches-prestation/${fiche.id}/pdf` : undefined;
  }

  onDetailsClicked(prestationId: string): void {
    // Navigate to prestation detail or fiche detail
    this.router.navigate(['/fiches-prestation', prestationId]);
  }

  onValidateClicked(prestationId: string): void {
    // This should validate the fiche, not the prestation
    const fiche = this.fiches.find(f => f.idPrestation === prestationId);
    if (fiche && fiche.id) {
      this.ficheService.validerFiche(fiche.id).subscribe({
        next: (updatedFiche) => {
          // Update the fiche in the list
          const index = this.fiches.findIndex(f => f.id === fiche.id);
          if (index !== -1) {
            this.fiches[index] = updatedFiche;
          }
        },
        error: (error) => {
          console.error('Erreur lors de la validation', error);
        }
      });
    }
  }

  onRejectClicked(prestationId: string): void {
    // This should reject the fiche, not the prestation
    const fiche = this.fiches.find(f => f.idPrestation === prestationId);
    if (fiche && fiche.id) {
      this.ficheService.rejeterFiche(fiche.id).subscribe({
        next: (updatedFiche) => {
          // Update the fiche in the list
          const index = this.fiches.findIndex(f => f.id === fiche.id);
          if (index !== -1) {
            this.fiches[index] = updatedFiche;
          }
        },
        error: (error) => {
          console.error('Erreur lors du rejet', error);
        }
      });
    }
  }

  genererFicheGlobale(): void {
    if (this.fiches.length === 0) {
      return;
    }

    // Générer le nom du fichier
    const filename = `fiche-globale-${this.lotId.replace(/[^a-zA-Z0-9]/g, '-')}-${this.currentYear}-T${this.trimestre}.pdf`;

    // Faire une requête HTTP directe pour télécharger le PDF
    const url = `${environment.apiUrl}/fiches-prestation/lots/${this.lotId}/fiche-globale/${this.currentYear}/${this.trimestre}`;

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();

        // Nettoyer l'URL de l'objet
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors de la génération de la fiche globale', error);
        // Afficher une notification d'erreur ou un message à l'utilisateur
        alert('Erreur lors de la génération de la fiche globale. Veuillez réessayer.');
      }
    });
  }
}
