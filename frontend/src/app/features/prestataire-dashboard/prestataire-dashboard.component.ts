import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Contrat, FichePrestation, Item } from '../../core/models/business.models';
import { ContratService } from '../../core/services/contrat.service';
import { FichePrestationService } from '../../core/services/fiche-prestation.service';
import { ItemService } from '../../core/services/item.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prestataire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Tableau de bord prestataire - Version avec meilleur remplissage -->
    <div class="dashboard-container" style="padding: 20px;">
      <div class="dashboard-content" style="margin-top: 0px;">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Prestataire</h1>
              <p class="text-gray-600 text-lg">Bienvenue, {{ currentUser?.nom }}</p>
            </div>
            <button (click)="exportDashboardPdf()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">
              <i class="fas fa-file-pdf mr-2"></i>Exporter PDF
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100">
                <i class="fas fa-file-contract text-blue-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-3xl font-bold text-gray-900">{{ contrats.length }}</h3>
                <p class="text-gray-600">Contrats</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100">
                <i class="fas fa-tools text-green-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-3xl font-bold text-gray-900">{{ fiches.length }}</h3>
                <p class="text-gray-600">Prestations</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-purple-100">
                <i class="fas fa-boxes-stacked text-purple-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-3xl font-bold text-gray-900">{{ items.length }}</h3>
                <p class="text-gray-600">Items</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Actions Rapides</h2>
          <div class="flex justify-center gap-6 flex-wrap md:flex-nowrap">

            <a [routerLink]="['/user', currentUser?.id, 'contrats']" class="bg-green-50 hover:bg-green-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-file-contract text-green-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Mes Contrats</p>
            </a>

            <a routerLink="/prestataire-prestation-list" class="bg-blue-50 hover:bg-blue-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-tools text-blue-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Mes Prestations</p>
            </a>

            <a [routerLink]="['/user', currentUser?.id, 'rapports-suivi']" class="bg-orange-50 hover:bg-orange-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-chart-line text-orange-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Mes Rapports</p>
            </a>

            <a routerLink="/my-items" class="bg-purple-50 hover:bg-purple-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-boxes-stacked text-purple-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Mes Items</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PrestataireDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  contrats: Contrat[] = [];
  fiches: FichePrestation[] = [];
  items: Item[] = [];
  currentUser: any = null;

  constructor(
    private contratService: ContratService,
    private ficheService: FichePrestationService,
    private itemService: ItemService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('PrestataireDashboardComponent: Initializing');
    this.currentUser = this.authService.getCurrentUser();
    console.log('PrestataireDashboardComponent: Current user:', this.currentUser);
    this.loadPrestataireData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPrestataireData(): void {
    if (this.currentUser?.id) {
      this.contratService.getContratsByPrestataire(this.currentUser.id.toString())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (contrats) => {
            this.contrats = contrats;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des contrats:', error);
            this.contrats = [];
          }
        });

      this.ficheService.getFichesByPrestataire(this.currentUser.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (fiches) => {
            this.fiches = fiches;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des fiches:', error);
            this.fiches = [];
          }
        });

      this.itemService.getItemsByPrestataire(this.currentUser.id.toString())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (items) => {
            this.items = items;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des items:', error);
            this.items = [];
          }
        });
    }
  }

  exportDashboardPdf(): void {
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité en développement',
      message: 'L\'export PDF du tableau de bord sera bientôt disponible'
    });
  }
}
