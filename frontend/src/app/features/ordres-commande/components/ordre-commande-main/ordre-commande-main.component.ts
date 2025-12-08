import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ordre-commande-main',
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-white tracking-tight">
                Ordres de
                <span class="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Commande
                </span>
              </h1>
              <p class="text-sm text-blue-100 font-medium">
                Gestion et suivi des prestations
              </p>
            </div>
          </div>

          <!-- Status and Breadcrumb -->
          <div class="flex items-center space-x-6">
            <!-- System Status -->
            <div class="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-400/30">
              <div class="w-2 h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full animate-pulse"></div>
              <span class="text-xs font-medium text-white">Système opérationnel</span>
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
              <span class="text-sm font-semibold text-white bg-orange-500/20 px-3 py-1 rounded-lg">Ordres de Commande</span>
            </nav>
          </div>
        </div>
      </div>
    </div>



    <!-- Main Content -->
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-7xl mx-auto px-8 py-12">
        <!-- Page Header -->
        <div class="mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Sélection du Trimestre</h2>
          <p class="text-lg text-gray-600 max-w-3xl">
            Choisissez le trimestre pour lequel vous souhaitez consulter les lots et prestations associés.
            Cette organisation vous permet de gérer efficacement vos ordres de commande tout au long de l'année.
          </p>
        </div>

        <!-- Quarter Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div *ngFor="let trimestre of trimestres; let i = index"
               (click)="selectTrimestre(trimestre)"
               [ngClass]="['group bg-white rounded-xl border-2 p-8 cursor-pointer hover:shadow-xl transition-all duration-200 relative overflow-hidden', trimestre.cardBorder]">

            <!-- Background accent -->
            <div [ngClass]="['absolute top-0 left-0 w-full h-1', trimestre.accentBar]"></div>

            <!-- Icon and Quarter Number -->
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-3">
                <div [ngClass]="['flex items-center justify-center w-10 h-10 rounded-lg transition-colors duration-200', trimestre.iconBg]">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Trimestre {{ trimestre.numero }}</h3>
                  <p class="text-sm text-gray-500">{{ trimestre.nom }}</p>
                </div>
              </div>
              <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg [ngClass]="['w-6 h-6', trimestre.arrowColor]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </div>

            <!-- Months Badge -->
            <div class="mb-6">
              <span [ngClass]="['inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', trimestre.badgeBg, trimestre.badgeText]">
                {{ trimestre.mois }}
              </span>
            </div>

            <!-- Action Button -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Accéder aux lots</span>
              <button [ngClass]="['inline-flex items-center justify-center w-8 h-8 text-white rounded-lg transition-colors duration-200', trimestre.buttonBg, trimestre.buttonHover]">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>

            <!-- Hover indicator -->
            <div [ngClass]="['absolute inset-x-0 bottom-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 rounded-b-xl', trimestre.accentBar]"></div>
          </div>
        </div>

        <!-- Information Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Feature 1 -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-xl mb-4">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Organisation Structurée</h4>
              <p class="text-gray-600 text-sm">Vos données sont organisées par trimestre pour une meilleure visibilité et gestion.</p>
            </div>

            <!-- Feature 2 -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Suivi Complet</h4>
              <p class="text-gray-600 text-sm">Suivez l'état de chaque lot et prestation avec des indicateurs clairs.</p>
            </div>

            <!-- Feature 3 -->
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-xl mb-4">
                <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Actions Rapides</h4>
              <p class="text-gray-600 text-sm">Accédez rapidement aux fonctionnalités de validation et consultation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    /* Custom gradient backgrounds for quarters */
    .bg-blue-500 {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }

    .bg-emerald-500 {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }

    .bg-purple-500 {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    }

    .bg-rose-500 {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
    }

    /* Hover animations */
    .group:hover .group-hover\\:scale-105 {
      transform: scale(1.05);
    }

    .group:hover .group-hover\\:translate-x-1 {
      transform: translateX(4px);
    }

    /* Backdrop blur effects */
    .backdrop-blur-md {
      backdrop-filter: blur(12px);
    }

    .backdrop-blur-lg {
      backdrop-filter: blur(16px);
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class OrdreCommandeMainComponent {
  currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  trimestres = [
    {
      numero: 1,
      nom: 'Premier trimestre',
      mois: 'Janvier - Mars',
      cardBorder: 'border-blue-200 hover:border-blue-300',
      accentBar: 'bg-blue-500',
      iconBg: 'bg-blue-600',
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      buttonBg: 'bg-blue-600',
      buttonHover: 'hover:bg-blue-700',
      arrowColor: 'text-blue-600'
    },
    {
      numero: 2,
      nom: 'Deuxième trimestre',
      mois: 'Avril - Juin',
      cardBorder: 'border-emerald-200 hover:border-emerald-300',
      accentBar: 'bg-emerald-500',
      iconBg: 'bg-emerald-600',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      buttonBg: 'bg-emerald-600',
      buttonHover: 'hover:bg-emerald-700',
      arrowColor: 'text-emerald-600'
    },
    {
      numero: 3,
      nom: 'Troisième trimestre',
      mois: 'Juillet - Septembre',
      cardBorder: 'border-purple-200 hover:border-purple-300',
      accentBar: 'bg-purple-500',
      iconBg: 'bg-purple-600',
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      buttonBg: 'bg-purple-600',
      buttonHover: 'hover:bg-purple-700',
      arrowColor: 'text-purple-600'
    },
    {
      numero: 4,
      nom: 'Quatrième trimestre',
      mois: 'Octobre - Décembre',
      cardBorder: 'border-rose-200 hover:border-rose-300',
      accentBar: 'bg-rose-500',
      iconBg: 'bg-rose-600',
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      buttonBg: 'bg-rose-600',
      buttonHover: 'hover:bg-rose-700',
      arrowColor: 'text-rose-600'
    }
  ];

  constructor(private router: Router) {}

  selectTrimestre(trimestre: any): void {
    this.router.navigate(['/ordres-commande/trimestre', trimestre.numero]);
  }
}
