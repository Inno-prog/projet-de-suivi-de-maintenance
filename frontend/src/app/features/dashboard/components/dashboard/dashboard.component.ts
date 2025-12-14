import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { UserService } from '../../../../core/services/user.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PrestationPdfService } from '../../../../core/services/prestation-pdf.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { Contrat, FichePrestation } from '../../../../core/models/business.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Public Layout - shown only when not authenticated and on root path -->
    <ng-container *ngIf="!isAuthenticated && isRootPath()">
      <div class="public-layout">
        <nav class="navbar">
          <div class="container">
            <div class="nav-brand">
              <div class="logo">
                <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
              </div>
            </div>
            <div class="nav-menu">
              <a href="https://it.finances.bf/" target="_blank" class="nav-link">La DGSI</a>
              <a routerLink="/contact" class="nav-link">Contacts</a>
              <a routerLink="/about" class="nav-link">À propos</a>
              <a href="https://www.finances.gov.bf" target="_blank" class="nav-link">Ministère</a>
            </div>
            <div class="nav-actions">
              <button class="btn btn-outline" (click)="login()">Connexion</button>
              <button class="btn btn-primary" (click)="redirectToKeycloakRegistration()">S'inscrire</button>
            </div>
          </div>
        </nav>

        <main class="main-content">
          <div class="floating-shapes">
            <div class="shape shape-1">⚡</div>
            <div class="shape shape-2">🔧</div>
            <div class="shape shape-3">📊</div>
            <div class="shape shape-4">🚀</div>
            <div class="shape shape-5">💡</div>
            <div class="shape shape-6">🔒</div>
          </div>
          <div class="container">
            <div class="dashboard-header" style="max-width: 65%; margin: 0 auto; margin-top: 50px; margin-bottom: 30px; padding: 3rem 2rem; background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%); border-top: 1px solid #1e293b;">
              <div class="welcome-section" style="margin-top: -20px;">
                <h1 class="animated-title" style="margin-left: 50px;">
                  <span class="title-text">Bienvenue sur </span><span class="title-text-3d" style="margin-left: 10px;"> MainTrack Pro </span>
                </h1>
                <p class="animated-subtitle">
                  <span class="word" style="animation-delay: 0.8s">Notre</span>
                  <span class="word" style="animation-delay: 1s">plateforme</span>
                  <span class="word" style="animation-delay: 1.2s">de</span>
                  <span class="word" style="animation-delay: 1.4s">suivi</span>
                  <span class="word" style="animation-delay: 1.6s">professionnel</span>
                  <span class="word" style="animation-delay: 1.8s">des</span>
                  <span class="word" style="animation-delay: 2s">prestations</span>
                  <span class="word" style="animation-delay: 2.2s">de</span>
                  <span class="word" style="animation-delay: 2.4s">maintenance</span>
                  <span class="word" style="animation-delay: 2.6s">informatique</span>
                </p>
                <p class="subtitle animated-subtitle">
                  <span class="word" style="animation-delay: 2.8s">Développé</span>
                  <span class="word" style="animation-delay: 3s">par</span>
                  <span class="word" style="animation-delay: 3.2s">Direction</span>
                  <span class="word" style="animation-delay: 3.4s">Générale</span>
                  <span class="word" style="animation-delay: 3.6s">des</span>
                  <span class="word" style="animation-delay: 3.8s">Systèmes</span>
                  <span class="word" style="animation-delay: 4s">d'Information</span>
                </p>
              </div>

              <div class="cta-section" style="margin-left: 700px;">
                <a href="https://it.finances.bf/" target="_blank" class="btn btn-primary animated-cta" style="animation-delay: 1.2s">
                  <span style="margin-bottom: 50px;" class="btn-text">En savoir plus</span>
                  <span class="btn-arrow"></span>
                </a>
              </div>
            </div>

            <div class="bg-[#f4f7fb] py-16">
  <div class="max-w-7xl mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">

      <!-- Carte 1 -->
      <div class="bg-white rounded-2xl shadow-md px-8 py-10 text-center">
        <div class="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-xl bg-orange-50">
          <!-- Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 012-2z" />
          </svg>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Gestion Prestations
        </h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Création et gestion complète des prestations avec leurs items associés.
        </p>
      </div>

      <!-- Carte 2 -->
      <div class="bg-white rounded-2xl shadow-md px-8 py-10 text-center">
        <div class="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-xl bg-orange-50">
          <!-- Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 11c0 1.104-.896 2-2 2s-2-.896-2-2 .896-2 2-2 2 .896 2 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 11a5 5 0 11-10 0 5 5 0 0110 0z" />
          </svg>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Suivi Sécurisé
        </h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Suivi rigoureux de l’exécution des prestations de maintenance.
        </p>
      </div>

      <!-- Carte 3 -->
      <div class="bg-white rounded-2xl shadow-md px-8 py-10 text-center">
        <div class="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-xl bg-orange-50">
          <!-- Icon -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6M7 7h10M7 7a2 2 0 012-2h6a2 2 0 012 2" />
          </svg>
        </div>

        <h3 class="text-lg font-semibold text-gray-900 mb-3">
          Ordres de commandes
        </h3>
        <p class="text-sm text-gray-500 leading-relaxed">
          Des ordres de commandes selon les clauses du contrat        </p>
      </div>

    </div>
  </div>
</div>

          </div>
        </main>

        <div class="footer text-white px-6 pt-2 pb-8" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); position: relative; top: -70px;">
          <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Newsletter -->
            <div class="max-w-xs">
              <h3 class="footer-section-title">Newsletter</h3>
              <div class="flex">
                <input
                  type="email"
                  placeholder="Email"
                  class="flex-1 px-2 py-1.5 text-sm bg-gray-700 text-white placeholder-gray-400 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <button class="bg-orange-500 hover:bg-orange-600 px-3 py-1.5 text-sm rounded-r-md font-semibold transition-colors">
                  SOUSCRIRE
                </button>
              </div>
            </div>

            <!-- Logo et Statistiques -->
            <div class="space-y-6">
              <div class="flex items-center space-x-4" style="margin-left: -500px;">
                <img src="/assets/logoFinal.png" alt="DGSI Logo" class="w-16 h-16 object-contain rounded-full" />
              </div>
            </div>

            <!-- Structures du MEFP -->
            <div class="mfp" style="margin-left: -150px;">
              <h3 class="footer-section-title">Structures du MEFP</h3>
              <ul class="space-y-1 text-sm">
                <li class="text-white hover:text-orange-400 cursor-pointer">Ministère de l'Économie, des Finances et de la Prospective</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale du Trésor et de la Comptabilité Publique</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale des Douanes</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale des Impôts</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale du Budget</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale des Affaires Immobilières de l'État</li>
                <li class="text-white hover:text-orange-400 cursor-pointer">Direction Générale du Contrôle des Marchés Publics et des Engagement Financier</li>
              </ul>
            </div>

            <!-- Liens utiles -->
            <div >
              <h3 class="footer-section-title">Liens utiles</h3>
              <ul class="space-y-1 text-sm">
                <li><a href="https://anptic.gov.bf/" target="_blank" class="text-white hover:text-orange-400 transition-colors">Agence Nationale de Promotion des TIC</a></li>
                <li><a href="https://anssi.bf/" target="_blank" class="text-white hover:text-orange-400 transition-colors">Agence Nationale de Sécurité des Systèmes d'Information</a></li>
                <li><a href="https://cil.bf/" target="_blank" class="text-white hover:text-orange-400 transition-colors">Commission de l'Informatique et des Libertés</a></li>
                <li><a href="https://www.mdenp.gov.bf/accueil" target="_blank" class="text-white hover:text-orange-400 transition-colors">Ministère de l'Économie numérique, des Postes et de la Transformation Digitale</a></li>
                <li><a href="https://mailer.gov.bf/keycloak/realms/global.virt/protocol/openid-connect/auth?client_id=global.virt-cli&redirect_uri=https%3A%2F%2Fmailer.gov.bf%2Fauth%2Fopenid&code_challenge=z3YJ7jn5aUDZLGdZyl7Fslf6bhtYZi9pUDfhKFy1DR8&state=eyJjb2RlVmVyaWZpZXJLZXkiOiIzYmEyY2E0YS01ZjI3LTQ0NzgtYTlmZi03N2FiNjdlOWUyMTAiLCJwYXRoIjoiLyIsImRvbWFpbl91aWQiOiJnbG9iYWwudmlydCJ9&code_challenge_method=S256&response_type=code&scope=openid" target="_blank" class="text-white hover:text-orange-400 transition-colors">Webmail</a></li>
              </ul>
            </div>
          </div>

          <!-- Social Media et Webmail -->
          <div class="max-w-7xl mx-auto mt-8 pt-6 border-t border-blue-800">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <a href="#" class="text-white hover:text-blue-300 text-xl">
                  <i class="fab fa-facebook-f"></i>
                </a>
                <a href="#" class="text-white hover:text-blue-300 text-xl">
                  <i class="fab fa-twitter"></i>
                </a>
                <a href="#" class="text-white hover:text-blue-300 text-xl">
                  <i class="fab fa-youtube"></i>
                </a>
                <a href="#" class="text-white hover:text-blue-300 text-xl">
                  <i class="fab fa-rss"></i>
                </a>
              </div>

              <button class="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded font-semibold transition-colors">
                Webmail
              </button>
            </div>
          </div>

          <!-- Copyright -->
        </div>
      </div>
    </ng-container>

    <!-- Authenticated Dashboard Layout -->
    <ng-container *ngIf="isAuthenticated">
      <div class="dashboard-container">
        <!-- Welcome Section for Authenticated Users -->
        <div class="welcome-palette" *ngIf="isAuthenticated" style="margin-bottom: 1rem;">
           <div class="welcome-card">
            <div class="welcome-icon">
              <span class="material-symbols-outlined">work</span>
            </div>
            <div class="welcome-content">
              <h2 class="welcome-title">Bienvenue sur <span class="brand-highlight">MainTrack Pro</span></h2>
              <div class="user-info">
                <span class="greeting">Bonjour</span>
                <span class="user-name">{{ currentUser?.nom }}</span>
                <span class="role-badge" [class]="getRoleClass()">{{ getRoleDisplayName() }}</span>
              </div>
            </div>
          </div>
        </div>

      <!-- Statistics Section for Admins -->
        <div *ngIf="isAdmin" class="stats-section">
          <div class="stats-header">
            <h2>Statistiques du système</h2>
            <button class="refresh-btn" (click)="refreshStats()" title="Actualiser les statistiques">
              <span>🔄</span> Actualiser
            </button>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-sticker">
                <span class="material-symbols-outlined">group</span>
              </div>
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">Utilisateurs</div>
            </div>
            <div class="stat-card">
              <div class="stat-sticker">
                <span class="material-symbols-outlined">assignment</span>
              </div>
              <div class="stat-number">{{ stats.totalPrestations }}</div>
              <div class="stat-label">Prestations</div>
            </div>
            <div class="stat-card">
              <div class="stat-sticker">
                <span class="material-symbols-outlined">receipt</span>
              </div>
              <div class="stat-number">{{ stats.totalOrdres }}</div>
              <div class="stat-label">Ordres de commande</div>
            </div>
            <div class="stat-card">
              <div class="stat-sticker">
                <span class="material-symbols-outlined">description</span>
              </div>
              <div class="stat-number">{{ stats.totalContrats }}</div>
              <div class="stat-label">Contrats</div>
            </div>
          </div>
 
          <!-- Role-specific Actions -->
          <div class="role-actions" *ngIf="isAuthenticated">
            <h2>Actions rapides</h2>
            <div class="actions-grid">
              <!-- Admin actions -->
              <ng-container *ngIf="isAdmin">
                <a routerLink="/prestations" class="action-card">
                  <div class="action-icon">📋</div>
                  <h3>Prestations & Validation</h3>
                  <p>Valider ou rejeter les fiches de prestations</p>
                </a>
                <a routerLink="/users" class="action-card">
                  <div class="action-icon">👥</div>
                  <h3>Gérer les Utilisateurs</h3>
                  <p>Administrer les comptes utilisateur</p>
                </a>
                <a routerLink="/contrats" class="action-card">
                  <div class="action-icon">📄</div>
                  <h3>Gérer les Contrats</h3>
                  <p>Visualiser et gérer tous les contrats</p>
                </a>
                <a routerLink="/ordres-commande" class="action-card">
                  <div class="action-icon">📋</div>
                  <h3>Ordres de Commande</h3>
                  <p>Accéder aux ordres de commande par trimestre</p>
                </a>
                <a routerLink="/équipements" class="action-card">
                  <div class="action-icon">🛠️</div>
                  <h3>Équipements</h3>
                  <p>Gestion complète des équipements informatiques</p>
                </a>
              </ng-container>
 
              <!-- Agent DGSI actions -->
              <ng-container *ngIf="isAgentDGSI">
                <!-- Gestion des équipements et items -->
                <a routerLink="/items" class="action-card">
                  <div class="action-icon">🛠️</div>
                  <h3>Gérer les Équipements</h3>
                  <p>Gestion complète des équipements informatiques</p>
                </a>
 
                <a routerLink="/type-items" class="action-card">
                  <div class="action-icon">📦</div>
                  <h3>Gérer les Items</h3>
                  <p>Administration des types d'items et catégories</p>
                </a>
 
                <!-- Gestion des lots -->
                <a routerLink="/lots" class="action-card">
                  <div class="action-icon">🏷️</div>
                  <h3>Gérer les Lots</h3>
                  <p>Organisation et gestion des lots de maintenance</p>
                </a>
 
                <!-- Validation et évaluation -->
                <a routerLink="/fiches-prestation" class="action-card">
                  <div class="action-icon">📄</div>
                  <h3>Fiches de Prestation</h3>
                  <p>Valider les fiches de prestations des prestataires</p>
                </a>
 
                <a routerLink="/evaluations" class="action-card">
                  <div class="action-icon">⭐</div>
                  <h3>Évaluations</h3>
                  <p>Créer et consulter les évaluations des prestataires</p>
                </a>
 
                <!-- Gestion des contrats -->
                <a routerLink="/contrats" class="action-card">
                  <div class="action-icon">📋</div>
                  <h3>Reconduire un Contrat</h3>
                  <p>Renouveler et gérer les contrats de maintenance</p>
                </a>
 
                <!-- Gestion des rapports de suivi -->
                <a routerLink="/rapports-suivi" class="action-card">
                  <div class="action-icon">📋</div>
                  <h3>Rapports de Suivi</h3>
                  <p>Gérer et consulter les rapports de suivi des prestations</p>
                </a>
 
                <!-- Génération de rapports -->
                <button class="action-card" (click)="genererRapportTrimestriel()">
                  <div class="action-icon">📊</div>
                  <h3>Rapport Trimestriel</h3>
                  <p>Générer le rapport de suivi trimestriel</p>
                </button>
 
                <button class="action-card" (click)="genererRapportAnnuel()">
                  <div class="action-icon">📈</div>
                  <h3>Rapport Annuel</h3>
                  <p>Générer le rapport annuel de maintenance</p>
                </button>
 
                <!-- Gestion des équipements -->
                <a routerLink="/équipements" class="action-card">
                  <div class="action-icon">🛠️</div>
                  <h3>Équipements</h3>
                  <p>Gestion complète des équipements informatiques</p>
                </a>
 
                <!-- Statistiques -->
                <a routerLink="/statistiques" class="action-card">
                  <div class="action-icon">📊</div>
                  <h3>Consulter Statistiques</h3>
                  <p>Tableaux de bord et statistiques détaillées</p>
                </a>
              </ng-container>
            </div>
          </div>
 
        </div>

      </div>
    </ng-container>

  `,
  styles: [`
    .dashboard-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .stats-section {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .quick-actions {
      background: #fff;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .action-buttons {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .action-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .action-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    
    .action-button i {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      color: #0d6efd;
    }
    
    .debug-info {
      background: #f8f9fa;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid #28a745;
      font-family: monospace;
      font-size: 0.9rem;
      border-radius: 4px;
    }
    /* Styles de débogage */
    .debug-border {
      border: 2px dashed red !important;
      padding: 1rem !important;
      margin: 1rem 0 !important;
    }
    .stats-section {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin: 1rem 0;
    }
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      border-bottom: 1px solid #1e293b;
      color: #e2e8f0;
      padding: 1rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
    }

    .navbar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-icon {
      width: 3rem;
      height: 3rem;
      background: var(--primary);
      color: white;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo-image {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius);
      object-fit: contain;
    }


    /* Styles pour le conteneur du menu de navigation */
    .nav-menu {
      display: flex;
      gap: 1rem;
      position: relative;
      z-index: 1000;
    }

    /* Styles de base pour les éléments de menu */
    .nav-item {
      position: relative;
      display: inline-block;
    }

    .nav-link {
      background: none;
      border: none;
      color: #cbd5e1;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      transition: left 0.5s;
    }

    .nav-link:hover::before {
      left: 100%;
    }

    .nav-link:hover {
      background: rgba(249, 115, 22, 0.1);
      color: #f97316;
    }

    .dropdown-arrow {
      font-size: 0.8rem;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.rotate {
      transform: rotate(180deg);
    }

    .nav-item:hover .dropdown-arrow {
      transform: rotate(180deg);
    }


    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .nav-info {
      display: inline-flex;
      align-items: center;
      position: relative;
      margin-left: 1rem;
    }

    .info-toggle {
      background: rgba(255, 255, 255, 0.06);
      color: white;
      border: none;
      padding: 0.45rem 0.75rem;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      transition: background 0.16s ease, transform 0.12s ease;
    }

    .info-toggle:focus,
    .info-toggle:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-2px);
      outline: none;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      color: #0f172a;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(2,6,23,0.12);
      min-width: 200px;
      padding: 0.5rem 0;
      list-style: none;
      margin: 0;
      opacity: 0;
      transform: translateY(-6px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
      z-index: 50;
    }

    .info-dropdown:focus-within .dropdown-menu,
    .info-dropdown:hover .dropdown-menu {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .dropdown-item {
      display: block;
      padding: 0.6rem 1rem;
      color: #0f172a;
      text-decoration: none;
      font-weight: 500;
    }

    .dropdown-item:hover {
      background: #f3f4f6;
    }

    .nav-actions .btn {
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }

    .nav-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav-actions .btn:hover::before {
      left: 100%;
    }

    .nav-actions .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
    }

    .nav-actions .btn-outline {
      background-color: transparent;
      border: 1px solid rgba(249, 115, 22, 0.6);
      color: var(--primary);
    }

    .nav-actions .btn-outline:hover {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .nav-actions .btn-primary {
      background-color: var(--primary);
      border: 1px solid var(--primary);
      color: white;
    }

    .nav-actions .btn-primary:hover {
      background-color: #ea580c;
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6);
    }


    .main-content {
      flex: 1;
      padding: 2rem 0;
      background: #f8fafc;
      position: relative;
      overflow: hidden;
    }

    .main-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.5);
      z-index: -1;
    }


    .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      font-size: 2rem;
      opacity: 0.1;
      animation: floatShape 15s ease-in-out infinite;
    }

    .shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
    .shape-2 { top: 20%; right: 15%; animation-delay: 2s; }
    .shape-3 { bottom: 30%; left: 20%; animation-delay: 4s; }
    .shape-4 { bottom: 20%; right: 10%; animation-delay: 6s; }
    .shape-5 { top: 50%; left: 50%; animation-delay: 8s; }
    .shape-6 { top: 70%; right: 20%; animation-delay: 10s; }

    @keyframes floatShape {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .hero-section {
      position: relative;
      min-height: 35vh;
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 2rem;
      margin: 2rem auto;
      max-width: 85%;
      border-radius: 20px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    }

    .hero-content {
      text-align: center;
      max-width: 800px;
      z-index: 2;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
      color: #f8fafc;
    }

    .hero-highlight {
      color: #f97316;
      text-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
    }

    .hero-subtitle {
      font-size: 1.3rem;
      color: #4a5568;
      margin-bottom: 0.5rem;
      line-height: 1.4;
      font-weight: 400;
    }

    .hero-description {
      font-size: 1rem;
      color: #718096;
      margin-bottom: 2rem;
      line-height: 1.5;
      font-weight: 400;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-cta {
      font-size: 1rem;
      padding: 0.8rem 2rem;
      background: #f97316;
      border: 2px solid #f97316;
      border-radius: 12px;
      color: #ffffff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
    }

    .hero-cta:hover {
      background: #ea580c;
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(249, 115, 22, 0.4);
    }

    .hero-secondary {
      font-size: 1.2rem;
      padding: 1.2rem 3rem;
      background: transparent;
      border: 2px solid #4a5568;
      border-radius: 12px;
      color: #4a5568;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .hero-secondary:hover {
      background: rgba(74, 85, 104, 0.1);
      transform: translateY(-3px);
    }

    .hero-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    .hero-visual {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 400px;
    }

    .hero-shape {
      position: absolute;
      font-size: 4rem;
      opacity: 0.1;
      animation: floatShape 15s ease-in-out infinite;
    }

    .hero-shape.shape-1 { top: 20%; left: 20%; animation-delay: 0s; }
    .hero-shape.shape-2 { top: 40%; right: 25%; animation-delay: 3s; }
    .hero-shape.shape-3 { bottom: 30%; left: 30%; animation-delay: 6s; }
    .hero-shape.shape-4 { bottom: 20%; right: 20%; animation-delay: 9s; }

    .welcome-section h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: #f8fafc;
    }

    .text-primary {
      color: var(--primary);
    }

    .welcome-section p {
      font-size: 1.25rem;
      color: #cbd5e1;
      margin-bottom: 0.5rem;
    }

    .welcome-palette {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .welcome-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 16px;
      padding: 1.2rem;
      box-shadow: 0 10px 40px rgba(249, 115, 22, 0.15), 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 2px solid rgba(249, 115, 22, 0.1);
      display: flex;
      align-items: center;
      gap: 1.2rem;
      max-width: 450px;
      width: 100%;
      position: relative;
      overflow: hidden;
    }

    .welcome-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.05), transparent);
      transition: left 0.6s;
    }

    .welcome-card:hover::before {
      left: 100%;
    }

    .welcome-icon {
       flex-shrink: 0;
       background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
       border-radius: 50%;
       padding: 1rem;
       box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
       border: 2px solid rgba(249, 115, 22, 0.2);
     }

    .welcome-icon .material-symbols-outlined {
       font-size: 48px;
       color: #F97316;
       font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
     }

    .welcome-content {
      flex: 1;
    }

    .welcome-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.75rem 0;
      line-height: 1.3;
    }

    .brand-highlight {
      color: #f97316;
      font-weight: 800;
      text-shadow: 0 1px 2px rgba(249, 115, 22, 0.3);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .greeting {
      font-size: 1rem;
      color: #6b7280;
      font-weight: 500;
    }

    .user-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: #1f2937;
    }

    .role-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .role-admin {
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      color: #dc2626;
      border: 1px solid #fca5a5;
    }

    .role-prestataire {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: #2563eb;
      border: 1px solid #93c5fd;
    }

    .role-ci {
      background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
      color: #7c3aed;
      border: 1px solid #c4b5fd;
    }

    .user-role {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .role-admin {
      background-color: #dc2626;
      color: white;
    }

    .role-prestataire {
      background-color: #059669;
      color: white;
    }

    .role-ci {
      background-color: #7c3aed;
      color: white;
    }

    .subtitle {
      font-size: 1rem !important;
      color: #94a3b8 !important;
    }

    .cta-section .btn {
      font-size: 0.9rem;
      padding: 0.6rem 1.2rem;
      background-color: var(--primary);
      border: none;
    }

    .cta-section .btn span {
      margin-left: 0.5rem;
      transition: transform 0.2s ease-in-out;
    }

    .cta-section .btn:hover span {
      transform: translateX(4px);
    }

    .cta-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-bell {
      position: relative;
      cursor: pointer;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .notification-bell:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .bell-icon {
      font-size: 1.5rem;
      display: block;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }

    /* Section Fonctionnalités */
    .features-section {
      padding: 6rem 0;
      background: #f8fafc;
      position: relative;
    }

    .features-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
    }

    .features-header {
      text-align: center;
      margin-bottom: 4rem;
      position: relative;
      z-index: 2;
    }

    .features-header h2 {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 1rem;
      background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .features-header p {
      font-size: 1.25rem;
      color: #6b7280;
      max-width: 600px;
      margin: 0 auto;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      position: relative;
      z-index: 2;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(2, 6, 23, 0.12), 0 0 0 1px rgba(249, 115, 22, 0.1);
      text-align: center;
      transition: transform 240ms cubic-bezier(.2,.8,.2,1), box-shadow 240ms cubic-bezier(.2,.8,.2,1);
      border: 1px solid rgba(249, 115, 22, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.5s;
    }

    .feature-card:hover::before {
      left: 100%;
    }

    .feature-card:nth-child(1) { animation-delay: 0.1s; }
    .feature-card:nth-child(2) { animation-delay: 0.2s; }
    .feature-card:nth-child(3) { animation-delay: 0.3s; }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animated-title {
      display: inline-block;
    }

    .title-text {
      display: inline-block;
      animation: fadeInUp 1s ease-out;
    }

    .title-text-3d {
      display: inline-block;
      background: linear-gradient(135deg, #F97316 0%, #ea580c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      animation: fadeInUp 1s ease-out 0.3s both;
      text-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
    }

    .animated-subtitle {
      animation: fadeInUp 1s ease-out both;
      opacity: 0;
    }

    .word {
      display: inline-block;
      opacity: 0;
      animation: fadeInWord 0.8s ease-out forwards, slideWord 3s ease-in-out infinite;
      margin-right: 0.3em;
    }

    @keyframes fadeInWord {
      to {
        opacity: 1;
      }
    }

    @keyframes slideWord {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .animated-cta {
      animation: fadeInUp 1s ease-out both;
      opacity: 0;
    }

    .btn-text {
      display: inline-block;
      transition: transform 0.2s ease;
    }

    .btn-arrow {
      display: inline-block;
      margin-left: 0.5rem;
      transition: transform 0.2s ease;
    }

    .animated-cta:hover .btn-text {
      transform: translateX(-4px);
    }

    .animated-cta:hover .btn-arrow {
      transform: translateX(4px);
    }

    .feature-card:hover {
      transform: translateY(-8px) scale(1.01);
      box-shadow: 0 22px 60px rgba(249, 115, 22, 0.25), 0 0 0 1px rgba(249, 115, 22, 0.3);
      border-color: #F97316;
      background: linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%);
    }

    .feature-card.animate {
      animation: slideUp 0.8s ease-out forwards;
      opacity: 0;
    }

    .card-glow {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 50%, transparent 100%);
      border-radius: 14px;
      opacity: 0;
      transition: opacity 0.4s ease;
      pointer-events: none;
    }

    .feature-card:hover .card-glow {
      opacity: 1;
    }

    .feature-icon {
       margin-bottom: 1rem;
       display: flex;
       justify-content: center;
       align-items: center;
     }

    .feature-icon .material-symbols-outlined {
       font-size: 64px;
       color: #F97316;
       font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
     }

    .feature-card h3 {
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: #6b7280;
      line-height: 1.4;
      font-size: 0.85rem;
    }

    .stats-section {
      margin-bottom: 1.5rem;
    }

    .stats-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .stats-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary);
      margin: 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .refresh-btn:hover {
      background: #ea580c;
      transform: translateY(-1px);
    }

    .refresh-btn span {
      font-size: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .stat-card {
        background: white;
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
        text-align: center;
        position: relative;
        transition: all 0.3s ease;
        border: 1px solid rgba(249, 115, 22, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .stat-card:hover {
        transform: translateY(-6px);
        box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
        border-color: rgba(249, 115, 22, 0.3);
      }

    .stat-sticker {
       margin-bottom: 0.75rem;
       display: flex;
       justify-content: center;
       align-items: center;
       width: 56px;
       height: 56px;
       background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
       border-radius: 50%;
       box-shadow: 0 8px 24px rgba(249, 115, 22, 0.25), 0 4px 12px rgba(249, 115, 22, 0.15);
       border: 3px solid rgba(249, 115, 22, 0.3);
       position: relative;
       overflow: hidden;
     }

     .stat-sticker::before {
       content: '';
       position: absolute;
       top: -50%;
       left: -50%;
       width: 200%;
       height: 200%;
       background: linear-gradient(45deg, transparent, rgba(249, 115, 22, 0.15), transparent);
       animation: rotate 4s linear infinite;
     }

     @keyframes rotate {
       0% { transform: rotate(0deg); }
       100% { transform: rotate(360deg); }
     }

    .stat-sticker .material-symbols-outlined {
      font-size: 48px;
      color: #F97316;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 48;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #374151;
      font-weight: 600;
    }

    .quick-actions h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
       background: white;
       padding: 2rem;
       border-radius: 12px;
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
       text-decoration: none;
       transition: all 0.3s ease;
       border: 2px solid transparent;
       position: relative;
       overflow: hidden;
     }

     .action-card::before {
       content: '';
       position: absolute;
       top: 0;
       left: -100%;
       width: 100%;
       height: 100%;
       background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.05), transparent);
       transition: left 0.5s;
     }

     .action-card:hover::before {
       left: 100%;
     }

     .action-card:hover {
       transform: translateY(-4px) scale(1.02);
       box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
       border-color: rgba(249, 115, 22, 0.3);
     }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: var(--primary);
      margin: 0;
    }

    .notifications-section {
      margin-top: 3rem;
    }

    .notifications-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      border-left: 4px solid #e5e7eb;
    }

    .notification-card.unread {
      border-left-color: var(--primary);
      background: #fef3c7;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .notification-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .type-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .type-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .type-success {
      background: #dcfce7;
      color: #166534;
    }

    .type-error {
      background: #fecaca;
      color: #991b1b;
    }

    .notification-date {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .notification-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .notification-card p {
      margin: 0 0 1rem 0;
      color: #4b5563;
    }

    .professional-footer {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      color: #e2e8f0;
      border-top: 1px solid #1e293b;
      margin-top: auto;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.6s ease forwards;
      box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
      padding-top: 40px;
    }

    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .footer-container {
      max-width: 80%;
      margin: 0 auto;
      padding: 80px 20px 30px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 40px;
    }

    .footer-column {
      transition: transform 0.3s ease;
    }

    .footer-column:hover {
      transform: translateY(-5px);
    }

    .footer-column h4 {
      color: #f8fafc;
      font-size: 1.1rem;
      margin-bottom: 20px;
      font-weight: 600;
      position: relative;
    }

    .footer-column h4::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 30px;
      height: 2px;
      background: #f97316;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      line-height: 1.4;
    }

    .contact-item .icon {
      color: #f97316;
      font-size: 1.1rem;
      min-width: 20px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 10px;
    }

    .footer-links a {
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
    }

    .footer-links a:hover {
      color: #f97316;
      padding-left: 5px;
    }

    .social-links {
      display: flex;
      gap: 15px;
      margin-top: 15px;
    }

    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s ease;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .social-link:hover {
      color: #f97316;
      background: rgba(249, 115, 22, 0.1);
      border-color: #f97316;
      transform: translateY(-2px);
    }

    .social-link svg {
      width: 20px;
      height: 20px;
    }

    .newsletter {
      margin-top: 1.5rem;
    }

    .newsletter p {
      margin-bottom: 1rem;
      font-size: 0.95rem;
      color: #e2e8f0;
    }

    .newsletter-form {
      display: flex;
      gap: 0.5rem;
    }

    .newsletter-form input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.9rem;
    }

    .newsletter-form input::placeholder {
      color: #94a3b8;
    }

    .newsletter-form button {
      padding: 0.5rem 1rem;
      background: #F97316;
      border: none;
      border-radius: 4px;
      color: white;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .newsletter-form button:hover {
      background: #ea580c;
    }

    .footer-bottom {
      border-top: 1px solid #1e293b;
      background: rgba(15, 23, 42, 0.8);
    }

    .footer-bottom-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }

    .copyright {
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .legal-links {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .legal-links a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease;
    }

    .legal-links a:hover {
      color: #f97316;
    }

    @media (max-width: 768px) {
      .hero-section {
        padding: 2rem 1.5rem;
        min-height: 45vh;
        margin: 1.5rem auto;
        max-width: 95%;
      }

      .hero-title {
        font-size: 2.5rem;
        margin-bottom: 0.8rem;
      }

      .hero-subtitle {
        font-size: 1.1rem;
        margin-bottom: 0.4rem;
      }

      .hero-description {
        font-size: 0.95rem;
        margin-bottom: 1.5rem;
      }

      .hero-actions {
        gap: 0.8rem;
      }

      .hero-cta, .hero-secondary {
        padding: 1rem 2rem;
        font-size: 1rem;
      }

      .hero-visual {
        display: none;
      }

      .features-section {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 0 1rem;
        margin: 3rem auto;
      }

      .feature-card {
        padding: 2rem 1.5rem;
      }

      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .shape {
        font-size: 1.5rem;
      }

      .footer-container {
        grid-template-columns: 1fr;
        gap: 30px;
        padding: 40px 20px 20px;
      }

      .footer-bottom-container {
        flex-direction: column;
        text-align: center;
      }

      .legal-links {
        justify-content: center;
      }
    }

    /* Quarter Cards Section */
    .quarter-cards-section {
      margin-top: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
    }

    .quarter-cards-section h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 2rem;
      text-align: center;
    }

    .quarter-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .quarter-card-link {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-decoration: none;
      color: inherit;
    }

    .quarter-card-link:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.2);
      border-color: #f97316;
      background: linear-gradient(135deg, #fefefe 0%, #f1f5f9 100%);
    }


    .quarter-card-arrow {
      color: #f97316;
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .quarter-card-link:hover .quarter-card-arrow {
      transform: translateX(4px);
    }

    @media (max-width: 768px) {
      .quarter-cards-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .quarter-card-link {
        padding: 1rem;
      }
    
      .quarter-card-link .quarter-card-content .quarter-number {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .footer-container {
        padding: 30px 15px 15px;
      }

      .legal-links {
        gap: 10px;
      }

      .legal-links a {
        font-size: 0.8rem;
      }

      .footer-bottom-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
        padding: 0 1rem;
      }

      .legal-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 1rem;
      }

      .social-links {
        justify-content: center;
      }

      .newsletter-form {
        flex-direction: column;
      }
    }

    /* Ensure navbar has proper z-index */
    .navbar {
      position: relative;
      z-index: 100;
    }

    /* Footer section titles styling */
    .footer-section-title {
      color: white;
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-decoration: underline;
      text-decoration-color: #f97316;
      text-decoration-thickness: 2px;
      text-underline-offset: 4px;
      transition: all 0.3s ease;
    }

    .footer-section-title:hover {
      text-decoration-color: #ea580c;
      transform: translateY(-1px);
    }

    .quarter-card-content .quarter-number {
      font-size: 2.5rem;
      font-weight: 900;
      color: #f97316;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .quarter-card-content .quarter-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.25rem;
    }

    .quarter-card-content .quarter-description {
      font-size: 0.9rem;
      color: #6b7280;
    }


  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = {
    totalUsers: 0,
    totalContrats: 0,
    totalOrdres: 0,
    totalEvaluations: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    totalPrestations: 0
  };

  private refreshInterval: any;
  private userSub: Subscription;
  private destroy$ = new Subject<void>();

  isAuthenticated = false;
  isAdmin = false;
  isPrestataire = false;
  isAgentDGSI = false;
  currentUser: any = null;

  constructor(
    private authService: AuthService,
    private contratService: ContratService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    public router: Router,
    private prestationService: FichePrestationService,
    private pdfService: PrestationPdfService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    console.log('DashboardComponent: Constructeur appelé');
    console.log('URL actuelle:', this.router.url);
    // Initialize authentication state to avoid change detection issues
    this.userSub = this.authService.currentUser$.subscribe(user => {
      console.log('DashboardComponent: User changed:', user);
      console.log('Rôle utilisateur:', user?.role);
      console.log('Est admin?:', user?.role === 'ADMINISTRATEUR');
      
      this.currentUser = user;
      this.isAuthenticated = !!user;
      this.isAdmin = user?.role === 'ADMINISTRATEUR';
      this.isAgentDGSI = user?.role === 'AGENT_DGSI';
      
      console.log('isAuthenticated:', this.isAuthenticated);
      console.log('isAdmin:', this.isAdmin);

      // Handle redirection based on user role when user data becomes available
      this.handleRoleBasedRedirection(user);
    });
  }

  login(): void {
    this.authService.login();
  }

  redirectToKeycloakRegistration(): void {
    const isProduction = window.location.protocol === 'https:';
    const issuer = isProduction
      ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI'
      : 'http://localhost:8080/realms/Maintenance-DGSI';
    const clientId = 'maintenance-app';
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const registrationUrl = `${issuer}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = registrationUrl;
  }

  ngOnInit(): void {
    console.log('DashboardComponent: Initializing dashboard');
    console.log('DashboardComponent: Current user:', this.authService.getCurrentUser());
    console.log('DashboardComponent: Is authenticated:', this.authService.isAuthenticated());
    console.log('DashboardComponent: Current URL:', this.router.url);

    // Initialize authentication state synchronously
    const currentUser = this.authService.getCurrentUser();
    this.currentUser = currentUser;
    this.isAuthenticated = !!currentUser;
    this.isAdmin = currentUser?.role === 'ADMINISTRATEUR';
    this.isAgentDGSI = currentUser?.role === 'AGENT_DGSI';
    this.isPrestataire = currentUser?.role === 'PRESTATAIRE';

    // Trigger change detection to update the view
    this.cdr.detectChanges();

    // Handle OAuth callback if on login route
    if (this.router.url.startsWith('/login')) {
      console.log('DashboardComponent: Handling OAuth callback');
      this.authService.handleOAuthCallback().then(success => {
        if (success) {
          console.log('DashboardComponent: OAuth callback successful, redirecting to appropriate dashboard');
          const currentUser = this.authService.getCurrentUser();
          if (currentUser?.role) {
            this.redirectBasedOnRole(currentUser);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          console.error('DashboardComponent: OAuth callback failed');
        }
      });
      return;
    }

    // If user is authenticated and on generic /dashboard route, redirect to specific dashboard
    // But don't redirect if already on a specific dashboard route
    if (this.authService.isAuthenticated() && this.router.url === '/dashboard') {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.role) {
        console.log('DashboardComponent: User on generic dashboard, redirecting to specific dashboard');
        this.redirectBasedOnRole(currentUser);
        return;
      }
    }

    // Load stats for all authenticated users
    if (this.authService.isAuthenticated()) {
      this.loadStats();
      this.startAutoRefresh();
    }


  }

  private redirectBasedOnRole(user: any): void {
    console.log('DashboardComponent: Redirecting user based on role:', user.role);

    switch (user.role) {
      case 'PRESTATAIRE':
        console.log('DashboardComponent: Redirecting prestataire to /prestataire-dashboard');
        this.router.navigate(['/prestataire-dashboard']);
        break;
      case 'ADMINISTRATEUR':
        console.log('DashboardComponent: Redirecting admin to /dashboard/admin');
        this.router.navigate(['/dashboard/admin']);
        break;
      case 'AGENT_DGSI':
        console.log('DashboardComponent: Redirecting agent DGSI to /dashboard/ci');
        this.router.navigate(['/dashboard/ci']);
        break;
      default:
        console.log('DashboardComponent: Unknown role, redirecting to home');
        this.router.navigate(['/']);
    }
  }

  private handleRoleBasedRedirection(user: any): void {
    // Rediriger les prestataires depuis toutes les routes sauf leur dashboard
    if (user && this.authService.isAuthenticated()) {
      if (user.role === 'PRESTATAIRE' && !this.router.url.includes('/prestataire-dashboard')) {
        this.router.navigate(['/prestataire-dashboard']);
      } else if (user.role !== 'PRESTATAIRE' && this.router.url === '/dashboard') {
        this.redirectBasedOnRole(user);
      }
    }
  }

  private loadStats(): void {
    console.log('Chargement des statistiques...');
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Utilisateurs chargés:', users);
        this.stats.totalUsers = users.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: `Impossible de charger les statistiques des utilisateurs : ${errMsg}`
          });
        }
      }
    });

    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        console.log('Contrats chargés:', contrats);
        this.stats.totalContrats = contrats.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des contrats:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des contrats : ${errMsg}` });
        }
      }
    });

    // Temporarily disable order stats loading as service is not available
    this.stats.totalOrdres = 0;

    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.stats.totalEvaluations = evaluations.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des évaluations:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des évaluations : ${errMsg}` });
        }
      }
    });

    this.prestationService.getAllFiches().subscribe({
      next: (prestations) => {
        this.stats.totalPrestations = prestations.length;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des prestations:', error);
          const errMsg = error?.message || error?.statusText || JSON.stringify(error) || 'Erreur inconnue';
          this.toastService.show({ type: 'error', title: 'Erreur', message: `Impossible de charger les statistiques des prestations : ${errMsg}` });
        }
      }
    });
  }


  getRoleDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'Administrateur';
      case 'PRESTATAIRE':
        return 'Prestataire';
      case 'AGENT_DGSI':
        return 'Agent DGSI';
      default:
        return user.role;
    }
  }

  getRoleClass(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'role-admin';
      case 'PRESTATAIRE':
        return 'role-prestataire';
      case 'AGENT_DGSI':
        return 'role-ci';
      default:
        return '';
    }
  }


  goToUserDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'ADMINISTRATEUR':
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'PRESTATAIRE':
          this.router.navigate(['/prestataire-dashboard']);
          break;
        case 'AGENT_DGSI':
          this.router.navigate(['/dashboard/ci']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
  }


  genererOrdreCommande(): void {
    // Temporarily disabled - PDF generation service removed
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité temporairement indisponible',
      message: 'La génération d\'ordre de commande sera bientôt réactivée'
    });
  }

  private getCurrentTrimestre(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const trimestre = Math.ceil(month / 3);
    return `T${trimestre}-${year}`;
  }

  genererRapportTrimestriel(): void {
    // Temporarily disabled - PDF generation service removed
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité temporairement indisponible',
      message: 'La génération de rapport trimestriel sera bientôt réactivée'
    });
  }

  genererRapportAnnuel(): void {
    // Temporarily disabled - PDF generation service removed
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité temporairement indisponible',
      message: 'La génération de rapport annuel sera bientôt réactivée'
    });
  }

  startAutoRefresh(): void {
    // Actualiser les statistiques toutes les 30 secondes
    this.refreshInterval = setInterval(() => {
      this.refreshStats();
    }, 30000);
  }

  refreshStats(): void {
    if (this.authService.isAuthenticated()) {
      this.loadStats();
    }
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.userSub) {
      this.userSub.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToQuarterOrders(quarter: number): void {
    this.router.navigate(['/ordres-commande/trimestre', quarter]);
  }

  async cloturerTrimestre(): Promise<void> {
    const trimestre = this.getCurrentTrimestre();
    const confirmed = await this.confirmationService.show({
      title: 'Clôturer le trimestre',
      message: `Êtes-vous sûr de vouloir clôturer le trimestre ${trimestre} ? Cette action est irréversible.`,
      confirmText: 'Clôturer',
      cancelText: 'Annuler',
      type: 'warning'
    });

    if (confirmed) {
      // TODO: Implement trimestre closure logic
    }
  }

  isRootPath(): boolean {
    return this.router.url === '/' || this.router.url === '/dashboard';
  }



  exportDashboardPdf(): void {
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité en développement',
      message: 'L\'export PDF du tableau de bord sera bientôt disponible'
    });
  }

}
