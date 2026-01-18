import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { ItemService } from '../../../../core/services/item.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';

import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PrestationService } from '../../../../core/services/prestation.service';

interface Stats {
  totalPrestations: number;
  totalItems: number;
  totalStructuresMefp: number;
}

@Component({
  selector: 'app-agent-dgsi-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Tableau de bord Agent DGSI - Style similaire au Prestataire avec meilleur remplissage -->
    <div class="dashboard-container" *ngIf="authService.isAuthenticated()" style="padding: 20px;">
      <div class="dashboard-content" style="margin-top: 0px;">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Tableau de Bord Agent DGSI</h1>
              <p class="text-gray-600 text-lg">Bienvenue, {{ authService.getCurrentUser()?.nom }}</p>
            </div>
            <div class="flex items-center gap-6">
              <button (click)="refreshStats()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg">
                <i class="fas fa-sync-alt mr-2"></i>Actualiser
              </button>
              <div class="text-right">
                <div class="text-lg text-gray-500 font-medium">{{ getCurrentDate() }}</div>
                <div class="text-xl font-bold text-gray-700">{{ getCurrentTime() }}</div>
              </div>
            </div>
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
                <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalPrestations }}</h3>
                <p class="text-gray-600">Prestations</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-green-100">
                <i class="fas fa-tools text-green-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalItems }}</h3>
                <p class="text-gray-600">Items</p>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div class="flex items-center">
              <div class="p-3 rounded-full bg-orange-100">
                <i class="fas fa-building text-orange-600 text-2xl"></i>
              </div>
              <div class="ml-4">
                <h3 class="text-3xl font-bold text-gray-900">{{ stats.totalStructuresMefp }}</h3>
                <p class="text-gray-600">Structures MEFP</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-8">Actions Rapides</h2>
          <div class="flex justify-center gap-6 flex-wrap md:flex-nowrap">

            <a routerLink="/items" class="bg-blue-50 hover:bg-blue-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-tools text-blue-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Items et Lots</p>
            </a>

            <a routerLink="/équipements" class="bg-green-50 hover:bg-green-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-cogs text-green-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Équipements</p>
            </a>

            <a routerLink="/structures-mefp" class="bg-orange-50 hover:bg-orange-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-building text-orange-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Structures MEFP</p>
            </a>

            <a routerLink="/statistiques" class="bg-purple-50 hover:bg-purple-100 p-8 rounded-lg text-center transition flex-1 min-w-[250px] hover:shadow-lg">
              <i class="fas fa-chart-line text-purple-600 text-4xl mb-4"></i>
              <p class="font-semibold text-gray-900 text-xl">Statistiques</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
  


    .font-sans {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }

    .flex {
      display: flex;
    }

    .items-center {
      align-items: center;
    }

    .justify-between {
      justify-content: space-between;
    }

    .mb-10 {
      margin-bottom: 2.5rem;
    }

    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    .font-bold {
      font-weight: 700;
    }

    .text-orange-400 {
      color: #fb923c;
    }

    .text-gray-300 {
      color: #d1d5db;
    }

    .text-sm {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .gap-4 {
      gap: 1rem;
    }

    .bg-orange-500\\/20 {
      background-color: rgba(249, 115, 22, 0.2);
    }

    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    .rounded-lg {
      border-radius: 0.5rem;
    }

    .font-medium {
      font-weight: 500;
    }

    .bg-blue-500\\/20 {
      background-color: rgba(59, 130, 246, 0.2);
    }

    .text-blue-300 {
      color: #93c5fd;
    }

    .relative {
      position: relative;
    }

    .bg-gradient-to-br {
      background-image: linear-gradient(to bottom right, var(--tw-gradient-stops));
    }

    .from-\\[\\#1e293b\\] {
      --tw-gradient-from: #1e293b;
      --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(30, 41, 59, 0));
    }

    .to-\\[\\#0f172a\\] {
      --tw-gradient-to: #0f172a;
    }

    .rounded-2xl {
      border-radius: 1rem;
    }

    .p-8 {
      padding: 2rem;
    }

    .shadow-lg {
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .overflow-hidden {
      overflow: hidden;
    }

    .border {
      border-width: 1px;
      border-style: solid;
    }

    .border-\\[\\#1e3a8a\\]\\/30 {
      border-color: rgba(30, 58, 138, 0.3);
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .text-2xl {
      font-size: 1.5rem;
      line-height: 2rem;
    }

    .font-semibold {
      font-weight: 600;
    }

    .flex-wrap {
      flex-wrap: wrap;
    }

    .hidden {
      display: none;
    }

    .md\\:block {
      display: block;
    }

    .w-40 {
      width: 10rem;
    }

    .opacity-80 {
      opacity: 0.8;
    }

    .absolute {
      position: absolute;
    }

    .-top-10 {
      top: -2.5rem;
    }

    .-right-10 {
      right: -2.5rem;
    }

    .w-48 {
      width: 12rem;
    }

    .h-48 {
      height: 12rem;
    }

    .bg-orange-500\\/10 {
      background-color: rgba(249, 115, 22, 0.1);
    }

    .rounded-full {
      border-radius: 9999px;
    }

    .blur-3xl {
      filter: blur(64px);
    }

    .-bottom-10 {
      bottom: -2.5rem;
    }

    .-left-10 {
      left: -2.5rem;
    }

    .w-64 {
      width: 16rem;
    }

    .h-64 {
      height: 16rem;
    }

    .bg-blue-700\\/10 {
      background-color: rgba(29, 78, 216, 0.1);
    }

    .grid {
      display: grid;
    }

    .md\\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .gap-6 {
      gap: 1.5rem;
    }

    .mb-10 {
      margin-bottom: 2.5rem;
    }

    .bg-\\[\\#1e293b\\] {
      background-color: #1e293b;
    }

    .hover\\:bg-\\[\\#27364b\\] {
      transition: background-color 0.15s ease-in-out;
    }

    .hover\\:bg-\\[\\#27364b\\]:hover {
      background-color: #27364b;
    }

    .transition-all {
      transition: all 0.15s ease-in-out;
    }

    .rounded-xl {
      border-radius: 0.75rem;
    }

    .p-6 {
      padding: 1.5rem;
    }

    .flex-col {
      flex-direction: column;
    }

    .items-start {
      align-items: flex-start;
    }

    .border-\\[\\#1e3a8a\\]\\/20 {
      border-color: rgba(30, 58, 138, 0.2);
    }

    .text-4xl {
      font-size: 2.25rem;
      line-height: 2.5rem;
    }

    .text-3xl {
      font-size: 1.875rem;
      line-height: 2.25rem;
    }

    .text-gray-400 {
      color: #9ca3af;
    }

    .mt-1 {
      margin-top: 0.25rem;
    }

    .text-blue-400 {
      color: #60a5fa;
    }

    .text-yellow-400 {
      color: #facc15;
    }

    .bg-\\[\\#1e293b\\] {
      background-color: #1e293b;
    }

    .border-\\[\\#1e3a8a\\]\\/30 {
      border-color: rgba(30, 58, 138, 0.3);
    }

    .shadow-md {
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05);
    }

    .justify-between {
      justify-content: space-between;
    }

    .mb-6 {
      margin-bottom: 1.5rem;
    }

    .text-xl {
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    .bg-orange-500 {
      background-color: #f97316;
    }

    .hover\\:bg-orange-600:hover {
      background-color: #ea580c;
    }

    .text-white {
      color: white;
    }

    .md\\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .bg-\\[\\#0f172a\\] {
      background-color: #0f172a;
    }

    .border-\\[\\#1e3a8a\\]\\/20 {
      border-color: rgba(30, 58, 138, 0.2);
    }

    .text-lg {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .text-blue-300 {
      color: #93c5fd;
    }

    .mb-2 {
      margin-bottom: 0.5rem;
    }

    .text-gray-400 {
      color: #9ca3af;
    }

    .cursor-pointer {
      cursor: pointer;
    }

    .transition-all {
      transition: all 0.15s ease-in-out;
    }
  `]
})
export class AgentDgsiDashboardComponent implements OnInit, OnDestroy {
  stats: Stats = {
    totalPrestations: 0,
    totalItems: 0,
    totalStructuresMefp: 0
  };

  private userSub?: Subscription;

  constructor(
    public authService: AuthService,
    private contratService: ContratService,
    private itemService: ItemService,
    private structureMefpService: StructureMefpService,
    private fichePrestationService: FichePrestationService,
    private prestationService: PrestationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isAgentDGSI()) {
      this.loadStats();
    }

    this.userSub = this.authService.currentUser$.subscribe(user => {
      if (user && this.authService.isAgentDGSI()) {
        this.loadStats();
      }
    });
  }

  private loadStats(): void {
    // Charger les statistiques des prestations via le nouveau endpoint de comptage
    this.prestationService.getPrestationsCount().subscribe({
      next: (count: number) => {
        this.stats.totalPrestations = count;
      },
      error: (error: any) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement du comptage des prestations:', error);
        }
        this.stats.totalPrestations = 0;
      }
    });

    // Charger les statistiques des items
    this.itemService.getAllItems().subscribe({
      next: (items: any[]) => {
        this.stats.totalItems = items.length;
      },
      error: (error: any) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des items:', error);
        }
        this.stats.totalItems = 0;
      }
    });

    // Charger les statistiques des structures MEFP
    this.structureMefpService.getAllStructures().subscribe({
      next: (structures: any[]) => {
        this.stats.totalStructuresMefp = structures.length;
      },
      error: (error: any) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des structures MEFP:', error);
        }
        this.stats.totalStructuresMefp = 0;
      }
    });
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  navigateTo(route: string): void {
    this.router.navigate(['/' + route]);
  }

  refreshStats(): void {
    if (this.authService.isAgentDGSI()) {
      this.loadStats();
    }
  }

  ngOnDestroy(): void {
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
