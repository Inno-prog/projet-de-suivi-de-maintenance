import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { LotWithContractorDto } from '../../../../core/models/business.models';

@Component({
  selector: 'app-ordre-commande-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Compact Professional Header with Navy Blue and Orange Theme -->
    <div class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 border-b border-orange-500/30 shadow-lg">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="flex items-center justify-between">
          <!-- Logo and Title Section -->
          <div class="flex items-center space-x-6">
            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">
                Lots du
                <span class="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Trimestre {{ trimestre }}
                </span>
              </h1>
              <p class="text-sm text-blue-100 font-medium">
                Sélectionnez un lot pour consulter ses prestations
              </p>
            </div>
          </div>

          <!-- Status and Breadcrumb -->
          <div class="flex items-center space-x-6">
            <!-- System Status -->
            <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-400/30">
              <div class="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
              <span class="text-xs font-medium text-white">Système actif</span>
            </div>

            <!-- Separator -->
            <div class="h-4 w-px bg-orange-400/50"></div>

            <!-- Breadcrumb -->
            <nav class="flex items-center space-x-3">
              <div class="flex items-center space-x-2 text-blue-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"/>
                </svg>
                <span class="text-sm font-medium">Accueil</span>
              </div>
              <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <div class="flex items-center space-x-2 text-blue-100">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="text-sm font-medium">Ordres de Commande</span>
              </div>
              <svg class="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
              </svg>
              <span class="text-sm font-semibold text-white bg-orange-500/20 px-3 py-1 rounded-lg">Trimestre {{ trimestre }}</span>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-8 py-12">
        <!-- Back Button -->
        <div class="mb-8">
          <button
            (click)="goBack()"
            class="inline-flex items-center space-x-3 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <svg class="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Retour aux trimestres</span>
          </button>
        </div>

        <!-- Page Description -->
        <div class="mb-12">
          <p class="text-lg text-gray-600 max-w-4xl">
            Découvrez tous les lots disponibles pour le trimestre {{ trimestre }} de l'année {{ currentYear }}.
            Chaque lot contient des prestations spécifiques à gérer et suivre.
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex items-center justify-center py-16">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Chargement des lots...</p>
          </div>
        </div>

        <!-- Lots Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="!loading && lots.length > 0">
          <div
            *ngFor="let lot of lots; let i = index"
            class="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden"
            (click)="selectLot(lot)"
          >
            <!-- Top accent bar -->
            <div class="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <!-- Content -->
            <div class="p-8">
              <!-- Lot icon and info -->
              <div class="flex items-start justify-between mb-6">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-900">{{ lot.lot }}</h3>
                    <p class="text-sm text-gray-600 font-medium">{{ lot.ville }}</p>
                  </div>
                </div>

                <!-- Arrow indicator -->
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 transform group-hover:translate-x-1">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>

              <!-- Lot details -->
              <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Ville:</span>
                  <span class="font-medium text-gray-900">{{ lot.ville }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Contrat ID:</span>
                  <span class="font-medium text-gray-900">#{{ lot.contractId }}</span>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span class="text-gray-600">Lot:</span>
                  <span class="font-medium text-gray-900">{{ lot.lot }}</span>
                </div>
              </div>

              <!-- Action button -->
              <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <span class="text-sm text-gray-600">Voir les prestations</span>
                <button class="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 group-hover:scale-110 transform">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Hover effect overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:to-indigo-50/30 transition-all duration-300 pointer-events-none"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && lots.length === 0" class="text-center py-16">
          <div class="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Aucun lot trouvé</h3>
          <p class="text-gray-600 mb-8 max-w-md mx-auto">
            Il n'y a actuellement aucun lot disponible pour le trimestre {{ trimestre }} de l'année {{ currentYear }}.
          </p>
          <button
            (click)="goBack()"
            class="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            <span>Retour aux trimestres</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f8fafc;
      min-height: 100vh;
    }

    .bg-white {
      background: linear-gradient(135deg, #ffffff 0%, #fefefe 100%);
    }

    .shadow-lg {
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 10px rgba(0, 0, 0, 0.05);
    }

    .hover\:shadow-xl:hover {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .transform {
      transition: transform 0.3s ease;
    }

    .hover\:-translate-y-1:hover {
      transform: translateY(-4px);
    }
  `]
})
export class OrdreCommandeListComponent implements OnInit {
  trimestre: number = 1;
  currentYear = new Date().getFullYear();
  lots: LotWithContractorDto[] = [];
  loading: boolean = true;
  currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ficheService: FichePrestationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.trimestre = +params['trimestre'];
      this.loadLots();
    });
  }

  loadLots(): void {
    this.loading = true;
    this.ficheService.getLotsWithContractors(this.currentYear, this.trimestre)
      .subscribe({
        next: (lots: LotWithContractorDto[]) => {
          this.lots = lots;
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des lots:', error);
          this.lots = [];
          this.loading = false;
        }
      });
  }

  getStatusBadgeClass(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'actif':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'en_cours':
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'termine':
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'annule':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(statut: string): string {
    switch (statut?.toLowerCase()) {
      case 'actif':
      case 'active':
        return 'Actif';
      case 'en_cours':
      case 'in_progress':
        return 'En cours';
      case 'termine':
      case 'completed':
        return 'Terminé';
      case 'annule':
      case 'cancelled':
        return 'Annulé';
      default:
        return statut || 'Non défini';
    }
  }

  formatCurrency(amount: number): string {
    if (amount == null) return '0 €';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  selectLot(lot: LotWithContractorDto): void {
    // Navigate to prestations for this lot and trimestre
    this.router.navigate(['/ordres-commande/trimestre', this.trimestre, 'lot', lot.lot]);
  }

  goBack(): void {
    this.router.navigate(['/ordres-commande']);
  }
}
