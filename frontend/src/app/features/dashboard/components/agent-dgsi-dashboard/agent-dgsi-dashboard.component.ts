import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/services/auth.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PrestationService } from '../../../../core/services/prestation.service';

interface Stats {
  totalPrestations: number;
  totalOrdres: number;
  totalEvaluations: number;
}

@Component({
  selector: 'app-agent-dgsi-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Tableau de bord Agent DGSI -->
    <div
      class="min-h-screen bg-[#0f172a] text-white px-8 py-10 font-sans"
      *ngIf="authService.isAuthenticated()"
    >
      <!-- En-tête -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h1 class="text-3xl font-bold text-orange-400">Espace Agent DGSI</h1>
        </div>
        <div class="flex items-center gap-4">
          <button
            class="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-all"
            (click)="refreshStats()"
          >
            🔄 Actualiser
          </button>
          <div
            class="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium"
          >
            {{ getCurrentDate() }}
          </div>
          <div
            class="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-lg text-sm font-medium"
          >
            {{ getCurrentTime() }}
          </div>
        </div>
      </div>

      <!-- Carte de bienvenue -->
      <div
        class="relative bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-8 shadow-lg overflow-hidden border border-[#1e3a8a]/30 mb-10"
      >
        <div class="flex items-center justify-between flex-wrap">
          <div>
            <h2 class="text-2xl font-semibold mb-2">
              Bonjour,
              <span class="text-orange-400">{{
                authService.getCurrentUser()?.nom
              }}</span>
              👋
            </h2>
            <p class="text-gray-300">
              Heureux de vous revoir sur votre tableau de bord professionnel.
            </p>
          </div>
          <div class="hidden md:block">
            <img
              src="assets/dashboard-illustration.svg"
              alt="dashboard illustration"
              class="w-40 opacity-80"
            />
          </div>
        </div>

        <!-- Animation décorative -->
        <div
          class="absolute -top-10 -right-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"
        ></div>
        <div
          class="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-700/10 rounded-full blur-3xl"
        ></div>
      </div>

      <!-- Statistiques -->
      <div class="grid md:grid-cols-3 gap-6 mb-10">
        <div
          class="bg-[#1e293b] hover:bg-[#27364b] transition-all rounded-xl p-6 flex flex-col items-start border border-[#1e3a8a]/20"
        >
          <div class="text-orange-400 text-4xl mb-3">📋</div>
          <div class="text-3xl font-bold">{{ stats.totalPrestations }}</div>
          <p class="text-gray-400 text-sm mt-1">Prestations enregistrées</p>
        </div>

        <div
          class="bg-[#1e293b] hover:bg-[#27364b] transition-all rounded-xl p-6 flex flex-col items-start border border-[#1e3a8a]/20"
        >
          <div class="text-blue-400 text-4xl mb-3">🧾</div>
          <div class="text-3xl font-bold">{{ stats.totalOrdres }}</div>
          <p class="text-gray-400 text-sm mt-1">Ordres en cours</p>
        </div>

        <div
          class="bg-[#1e293b] hover:bg-[#27364b] transition-all rounded-xl p-6 flex flex-col items-start border border-[#1e3a8a]/20"
        >
          <div class="text-yellow-400 text-4xl mb-3">⭐</div>
          <div class="text-3xl font-bold">{{ stats.totalEvaluations }}</div>
          <p class="text-gray-400 text-sm mt-1">Évaluations reçues</p>
        </div>
      </div>

      <!-- Actions rapides -->
      <div
        class="bg-[#1e293b] rounded-2xl p-8 border border-[#1e3a8a]/30 shadow-md"
      >
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-semibold text-orange-400">
            Actions rapides
          </h3>
        </div>

        <div class="grid grid-cols-4 gap-4">
          <div
            class="bg-[#0f172a] hover:bg-[#1e293b] rounded-lg p-4 border border-[#1e3a8a]/20 cursor-pointer transition-all duration-200 hover:border-orange-400/50 hover:shadow-lg"
            (click)="navigateTo('items')"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">🧰</div>
              <h4 class="text-sm font-medium text-blue-300 mb-1">Items</h4>
              <p class="text-gray-400 text-xs">
                Gérer les items
              </p>
            </div>
          </div>

          <div
            class="bg-[#0f172a] hover:bg-[#1e293b] rounded-lg p-4 border border-[#1e3a8a]/20 cursor-pointer transition-all duration-200 hover:border-orange-400/50 hover:shadow-lg"
            (click)="navigateTo('ordres-commande')"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">📦</div>
              <h4 class="text-sm font-medium text-blue-300 mb-1">Ordres</h4>
              <p class="text-gray-400 text-xs">
                Superviser les commandes
              </p>
            </div>
          </div>

          <div
            class="bg-[#0f172a] hover:bg-[#1e293b] rounded-lg p-4 border border-[#1e3a8a]/20 cursor-pointer transition-all duration-200 hover:border-orange-400/50 hover:shadow-lg"
            (click)="navigateTo('rapports-suivi')"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">📊</div>
              <h4 class="text-sm font-medium text-blue-300 mb-1">Rapports</h4>
              <p class="text-gray-400 text-xs">
                Consulter les rapports
              </p>
            </div>
          </div>

          <div
            class="bg-[#0f172a] hover:bg-[#1e293b] rounded-lg p-4 border border-[#1e3a8a]/20 cursor-pointer transition-all duration-200 hover:border-orange-400/50 hover:shadow-lg"
            (click)="navigateTo('statistiques')"
          >
            <div class="text-center">
              <div class="text-2xl mb-2">📉</div>
              <h4 class="text-sm font-medium text-blue-300 mb-1">Statistiques</h4>
              <p class="text-gray-400 text-xs">
                Voir les statistiques
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .min-h-screen {
      min-height: 100vh;
    }

    .bg-\\[\\#0f172a\\] {
      background-color: #0f172a;
    }

    .text-white {
      color: white;
    }

    .px-8 {
      padding-left: 2rem;
      padding-right: 2rem;
    }

    .py-10 {
      padding-top: 2.5rem;
      padding-bottom: 2.5rem;
    }

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
    totalOrdres: 0,
    totalEvaluations: 0
  };

  private refreshInterval: any;
  private userSub?: Subscription;

  constructor(
    public authService: AuthService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private evaluationService: EvaluationService,
    private fichePrestationService: FichePrestationService,
    private prestationService: PrestationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('AgentDgsiDashboardComponent: Initializing dashboard');
    console.log('AgentDgsiDashboardComponent: Current user:', this.authService.getCurrentUser());
    console.log('AgentDgsiDashboardComponent: Is authenticated:', this.authService.isAuthenticated());

    if (this.authService.isAgentDGSI()) {
      console.log('AgentDgsiDashboardComponent: User is Agent DGSI, loading stats');
      this.loadStats();
      this.startAutoRefresh();
    }

    this.userSub = this.authService.currentUser$.subscribe(user => {
      console.log('AgentDgsiDashboardComponent: User subscription triggered', user);
      if (user && this.authService.isAgentDGSI()) {
        console.log('AgentDgsiDashboardComponent: User authenticated as Agent DGSI, loading stats');
        this.loadStats();
        this.startAutoRefresh();
      }
    });
  }

  private loadStats(): void {
    // Charger les statistiques des prestations avec la même logique de filtrage
    const currentUser = this.authService.getCurrentUser();
    const isPrestataire = currentUser?.role === 'PRESTATAIRE';
    const prestationPromise = isPrestataire
      ? this.prestationService.getMyPrestations(0, 1000).toPromise()
      : this.prestationService.getAllPrestations(0, 1000).toPromise();

    prestationPromise?.then(prestationResponse => {
      let prestations: any[] = [];
      
      console.log('🔍 Dashboard Admin - Response brute:', prestationResponse);
      
      if (prestationResponse && typeof prestationResponse === 'object' && 'content' in prestationResponse) {
        prestations = prestationResponse.content || [];
      } else {
        prestations = prestationResponse || [];
      }

      console.log('🔍 Dashboard Admin - Prestations avant filtrage:', prestations.length);
      console.log('🔍 Dashboard Admin - User role:', currentUser?.role);
      console.log('🔍 Dashboard Admin - Is prestataire:', isPrestataire);

      if (isPrestataire && currentUser) {
        console.log('🔍 Dashboard Admin - Filtrage pour prestataire:', currentUser.nom);
        prestations = prestations.filter(p => {
          const matchNom = p.nomPrestataire === currentUser.nom;
          const matchEmail = p.contactPrestataire === currentUser.email;
          const matchId = p.prestataireId === currentUser.id?.toString();
          console.log('🔍 Dashboard Admin - Prestation:', p.nomPrestataire, 'Match:', matchNom || matchEmail || matchId);
          return matchNom || matchEmail || matchId;
        });
      }

      console.log('🔍 Dashboard Admin - Prestations après filtrage:', prestations.length);
      this.stats.totalPrestations = prestations.length;
    }).catch(error => {
      if (error.status !== 401) {
        console.error('Erreur lors du chargement des prestations:', error);
      }
      this.stats.totalPrestations = 0;
    });

    // Charger les statistiques des ordres de commande
    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        this.stats.totalOrdres = ordres.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des ordres:', error);
        }
      }
    });

    // Charger les statistiques des évaluations
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.stats.totalEvaluations = evaluations.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des évaluations:', error);
        }
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
    console.log('🔄 Dashboard Admin - refreshStats called');
    if (this.authService.isAgentDGSI()) {
      console.log('🔄 Dashboard Admin - User is Agent DGSI, loading stats');
      this.loadStats();
    } else {
      console.log('🔄 Dashboard Admin - User is not Agent DGSI');
    }
  }

  startAutoRefresh(): void {
    // Actualiser les statistiques toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      console.log('🔄 Dashboard Admin - Auto-refresh triggered');
      this.refreshStats();
    }, 30000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
  }
}
