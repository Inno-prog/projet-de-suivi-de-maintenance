import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Contrat, FichePrestation, RapportSuivi } from '../../core/models/business.models';
import { ContratService } from '../../core/services/contrat.service';
import { FichePrestationService } from '../../core/services/fiche-prestation.service';
import { RapportSuiviService } from '../../core/services/rapport-suivi.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-prestataire-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto py-8 px-4">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Tableau de Bord Prestataire</h1>
              <p class="text-gray-600 mt-1">Bienvenue, {{ currentUser?.nom }}</p>
            </div>
            <button (click)="exportDashboardPdf()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              <i class="fas fa-file-pdf mr-2"></i>Exporter PDF
            </button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-blue-100">
                <i class="fas fa-file-contract text-blue-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-2xl font-bold text-gray-900">{{ contrats.length }}</h3>
                <p class="text-gray-600">Contrats</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100">
                <i class="fas fa-tools text-green-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-2xl font-bold text-gray-900">{{ fiches.length }}</h3>
                <p class="text-gray-600">Mes Prestations</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-orange-100">
                <i class="fas fa-chart-line text-orange-600 text-xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-2xl font-bold text-gray-900">{{ rapports.length }}</h3>
                <p class="text-gray-600">Rapports</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <a [routerLink]="['/user', currentUser?.id, 'contrats']" class="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition">
              <i class="fas fa-file-contract text-green-600 text-2xl mb-2"></i>
              <p class="font-medium text-gray-900">Mes Contrats</p>
            </a>

            <a routerLink="/prestataire-prestation-list" class="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition">
              <i class="fas fa-tools text-blue-600 text-2xl mb-2"></i>
              <p class="font-medium text-gray-900">Mes Prestations</p>
            </a>

            <a [routerLink]="['/user', currentUser?.id, 'rapports-suivi']" class="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-center transition">
              <i class="fas fa-chart-line text-orange-600 text-2xl mb-2"></i>
              <p class="font-medium text-gray-900">Mes Rapports</p>
            </a>

            <a routerLink="/prestations" class="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition">
              <i class="fas fa-plus text-purple-600 text-2xl mb-2"></i>
              <p class="font-medium text-gray-900">Nouvelle Prestation</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Styles spécifiques au dashboard prestataire */
  `]
})
export class PrestataireDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  contrats: Contrat[] = [];
  fiches: FichePrestation[] = [];
  rapports: RapportSuivi[] = [];
  currentUser: any = null;

  constructor(
    private contratService: ContratService,
    private ficheService: FichePrestationService,
    private rapportService: RapportSuiviService,
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

      this.ficheService.getAllFiches()
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

      if (this.currentUser?.nom) {
        this.rapportService.getRapportsByPrestataire(this.currentUser.nom)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (rapports) => {
              this.rapports = rapports;
            },
            error: (error) => {
              console.error('Erreur lors du chargement des rapports:', error);
              this.rapports = [];
            }
          });
      }
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
