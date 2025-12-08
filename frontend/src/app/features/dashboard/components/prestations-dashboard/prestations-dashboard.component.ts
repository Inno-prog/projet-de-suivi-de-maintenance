import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { FichePrestation, Contrat, StatutFiche, StatutContrat } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FileUploadService } from '../../../../core/services/file-upload.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

interface PrestationDashboard {
  fiche: FichePrestation;
  contrat?: Contrat;
  progression: number;
  documentsJoints: string[];
}

@Component({
  selector: 'app-prestations-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="welcome-card">
        <div class="welcome-content">
            <h1 class="welcome-title">Bienvenue, {{ authService.isPrestataire() ? 'Prestataire' : authService.isAgentDGSI() ? 'Agent DGSI' : 'Administrateur' }}</h1>
            <p class="welcome-subtitle">{{ authService.isPrestataire() ? 'Gérez vos prestations et consultez vos rapports' : 'Gérez les prestations et consultez les rapports' }}</p>
            <div class="current-time">
              <span class="time-display">{{ getCurrentTime() }}</span>
              <span class="date-display">{{ getCurrentDate() }}</span>
            </div>
          </div>
          <div class="welcome-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="#F97316"/>
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="#F97316" stroke-width="0.5"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.7 6.3a1 1 0 0 0-1.4 0l-4 4a1 1 0 0 0 0 1.4l4 4a1 1 0 0 0 1.4-1.4L11.42 12l3.28-3.3a1 1 0 0 0 0-1.4z" fill="#F97316"/>
              <path d="M9.3 6.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4L12.58 12 9.3 9.7a1 1 0 0 1 0-1.4z" fill="#F97316"/>
              <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="#F97316" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getTotalPrestations() }}</h3>
            <p>Total Prestations</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getPrestationsReussies() }}</h3>
            <p>Prestations Réussies</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getPrestationsEchouees() }}</h3>
            <p>Prestations Échouées</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-info">
            <h3>{{ getTotalMontant() | number:'1.0-0' }} FCFA</h3>
            <p>Montant Total</p>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="actions-section">
        <div class="section-header">
          <h3 class="section-title">Actions rapides</h3>
        </div>

        <div class="actions-grid">
          <div class="action-card" (click)="navigateTo('prestations')">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#F97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-content">
              <h4>Mes Prestations</h4>
              <p>Consultez vos prestations en cours</p>
            </div>
          </div>

          <div class="action-card" (click)="navigateTo('ordres-commande-prestataire')">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-content">
              <h4>Ordres de Commande</h4>
              <p>Gérez vos ordres de commande</p>
            </div>
          </div>

          <div class="action-card" (click)="navigateTo('evaluations')">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-content">
              <h4>Évaluations</h4>
              <p>Consultez vos évaluations</p>
            </div>
          </div>

          <div class="action-card" (click)="navigateTo('fiches-prestation')">
            <div class="action-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="action-content">
              <h4>Fiches de Prestation</h4>
              <p>Gérez vos fiches de prestation</p>
            </div>
          </div>
        </div>

        <!-- Filtres et Boutons d'Action -->
        <div class="filters-section">
          <div class="action-buttons-left">
            <button class="btn btn-secondary" (click)="exportToPdf()" *ngIf="prestations.length > 0">
              📄 Exporter PDF
            </button>
            <button class="btn btn-primary" *ngIf="authService.isAdmin() || authService.isAgentDGSI()" (click)="genererOrdrePDF()">
              <i class="fas fa-file-pdf"></i> Générer Ordre de Commande PDF
            </button>
          </div>
          <div class="filters">
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminées</option>
            </select>
            <select [(ngModel)]="selectedPrestataire" (change)="applyFilters()" class="filter-select" *ngIf="!authService.isPrestataire()">
              <option value="">Tous les prestataires</option>
              <option *ngFor="let prestataire of getUniquePrestataires()" [value]="prestataire">
                {{ prestataire }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tableau -->
        <div class="prestations-table">
          <table *ngIf="filteredPrestations.length > 0; else noData">
            <thead>
              <tr>
                <th>ID</th>
                <th>Contrat</th>
                <th>Prestataire</th>
                <th>Item</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prestation of filteredPrestations" [class]="getRowClass(prestation.fiche.statut)">
                <td>{{ prestation.fiche.idPrestation }}</td>
                <td>
                  <div *ngIf="prestation.fiche.fichiersContrat; else noFiles">
                    <button class="btn btn-info btn-xs" (click)="voirFichiers(prestation.fiche.fichiersContrat)">
                      <i class="fas fa-file-pdf"></i> Voir fichiers
                    </button>
                  </div>
                  <ng-template #noFiles>
                    <span class="text-muted">Aucun fichier</span>
                  </ng-template>
                </td>
                <td>{{ prestation.fiche.nomPrestataire }}</td>
                <td>{{ prestation.fiche.nomItem }}</td>
                <td>{{ prestation.contrat ? formatDate(prestation.contrat.dateDebut) : '-' }}</td>
                <td>{{ prestation.contrat ? formatDate(prestation.contrat.dateFin) : '-' }}</td>
                <td class="montant">{{ (prestation.contrat?.montant || 0) | number:'1.0-0' }} FCFA</td>
                <td>
                  <span class="badge" [class]="getStatusBadgeClass(prestation.fiche.statut)">
                    {{ getStatusLabel(prestation.fiche.statut) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-info btn-sm" (click)="modifierPrestation(prestation)">
                      Modifier
                    </button>
                    <button class="btn btn-primary btn-sm" 
                            *ngIf="prestation.fiche.statut === 'EN_ATTENTE'" 
                            (click)="demarrerPrestation(prestation)">
                      Démarrer
                    </button>
                    <button class="btn btn-warning btn-sm" 
                            *ngIf="prestation.fiche.statut === 'EN_COURS'" 
                            (click)="terminerPrestation(prestation)">
                      Terminer
                    </button>
                    <button class="btn btn-success btn-sm" 
                            *ngIf="prestation.fiche.statut === 'TERMINEE'" 
                            (click)="evaluerPrestataire(prestation)">
                      Évaluer
                    </button>
                    <button class="btn btn-danger btn-sm" 
                            *ngIf="authService.isAdmin()" 
                            (click)="supprimerPrestation(prestation)">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <ng-template #noData>
            <div class="no-data">
              <p>Aucune prestation trouvée</p>
            </div>
          </ng-template>
        </div>

        <!-- Modal Création/Modification Prestation -->
        <div *ngIf="showCreateForm || showEditForm" class="modal-overlay" (click)="fermerFormulaire()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingPrestation ? 'Modifier Prestation' : 'Créer Nouvelle Prestation' }}</h2>
              <button class="close-btn" (click)="fermerFormulaire()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form [formGroup]="prestationForm" (ngSubmit)="creerPrestation()">
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nomPrestataire">Nom du Prestataire</label>
                    <input type="text" id="nomPrestataire" formControlName="nomPrestataire" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="nomItem">Nom de l'Item</label>
                    <input type="text" id="nomItem" formControlName="nomItem" class="form-control" placeholder="Ex: Maintenance ordinateur">
                  </div>

                  <div class="form-group">
                    <label for="dateRealisation">Date de Réalisation</label>
                    <input type="datetime-local" id="dateRealisation" formControlName="dateRealisation" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="quantite">Quantité</label>
                    <input type="number" id="quantite" formControlName="quantite" min="1" class="form-control">
                  </div>

                  <div class="form-group" *ngIf="authService.isAdmin()">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut" class="form-control">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINEE">Terminée</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="idContrat">ID Contrat</label>
                    <input type="text" id="idContrat" formControlName="idContrat" class="form-control" placeholder="Ex: CONT-2024-001">
                  </div>

                  <div class="form-group">
                    <label for="dateDebut">Date Début</label>
                    <input type="date" id="dateDebut" formControlName="dateDebut" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="dateFin">Date Fin</label>
                    <input type="date" id="dateFin" formControlName="dateFin" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="montant">Montant (FCFA)</label>
                    <input type="number" id="montant" formControlName="montant" min="0" class="form-control" placeholder="0">
                  </div>

                  <div class="form-group form-group-full">
                    <label for="commentaire">Commentaire</label>
                    <textarea id="commentaire" formControlName="commentaire" rows="3" class="form-control" placeholder="Commentaires sur la prestation..."></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="fermerFormulaire()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="prestationForm.invalid || loading">
                  {{ loading ? (editingPrestation ? 'Modification...' : 'Création...') : (editingPrestation ? 'Modifier Prestation' : 'Créer Prestation') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
    }

    .header-section {
      margin-bottom: 2rem;
    }

    .welcome-card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(249, 115, 22, 0.2);
      box-shadow: 0 20px 60px rgba(249, 115, 22, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      transition: left 0.8s;
    }

    .welcome-card:hover::before {
      left: 100%;
    }

    .welcome-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0 0 0.5rem 0;
    }

    .welcome-subtitle {
      font-size: 1.1rem;
      color: #cbd5e1;
      margin: 0 0 1rem 0;
    }

    .current-time {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .time-display {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f97316;
    }

    .date-display {
      font-size: 0.9rem;
      color: #94a3b8;
      text-transform: capitalize;
    }

    .welcome-icon {
      opacity: 0.8;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 1.5rem;
      border-radius: 16px;
      border: 1px solid rgba(249, 115, 22, 0.2);
      box-shadow: 0 8px 32px rgba(249, 115, 22, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.05), transparent);
      transition: left 0.5s;
    }

    .stat-card:hover::before {
      left: 100%;
    }

    .stat-card:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15);
      border-color: rgba(249, 115, 22, 0.4);
    }

    .stat-icon {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.2) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(249, 115, 22, 0.3);
    }

    .stat-info h3 {
      font-size: 1.8rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
    }

    .stat-info p {
      font-size: 0.9rem;
      color: #cbd5e1;
      margin: 0.25rem 0 0 0;
    }

    .actions-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(249, 115, 22, 0.2);
      box-shadow: 0 20px 60px rgba(249, 115, 22, 0.1);
      margin-bottom: 2rem;
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #f97316;
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(249, 115, 22, 0.2);
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
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
      box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15);
      border-color: rgba(249, 115, 22, 0.4);
    }

    .action-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.2) 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(249, 115, 22, 0.3);
      flex-shrink: 0;
    }

    .action-content h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: #f8fafc;
      margin: 0 0 0.5rem 0;
    }

    .action-content p {
      font-size: 0.9rem;
      color: #cbd5e1;
      margin: 0;
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }

    .action-buttons-left {
      display: flex;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
    }

    .prestations-table {
       background: white;
       border-radius: 12px;
       overflow-x: auto;
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
       width: 100%;
       transition: all 0.3s ease;
       border: 1px solid rgba(249, 115, 22, 0.1);
       position: relative;
       overflow: hidden;
     }

     .prestations-table::before {
       content: '';
       position: absolute;
       top: 0;
       left: -100%;
       width: 100%;
       height: 100%;
       background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.02), transparent);
       transition: left 0.5s;
       z-index: 1;
       pointer-events: none;
     }

     .prestations-table:hover::before {
       left: 100%;
     }

     .prestations-table:hover {
       box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
       border-color: rgba(249, 115, 22, 0.3);
     }

     .prestations-table table {
       position: relative;
       z-index: 2;
     }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    th:nth-child(4), td:nth-child(4) { /* Item */
      white-space: normal;
      max-width: 200px;
    }

    th:nth-child(9), td:nth-child(9) { /* Actions */
      white-space: normal;
      min-width: 200px;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    .row-pending { background: #fffbeb; }
    .row-progress { background: #dbeafe; }
    .row-completed { background: #f0fdf4; }



    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fecaca; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }

    .montant {
      font-weight: 600;
      color: #059669;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
    }

    .action-buttons .btn-sm i {
      font-size: 0.875rem;
      color: inherit !important;
    }

    .btn i {
      color: inherit !important;
    }

    .btn * {
      color: inherit !important;
    }

    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
    }

    .btn-xs {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .text-muted {
      color: #6b7280;
      font-style: italic;
    }

    .btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.8rem;
      color: white;
      text-align: center;
      line-height: 1.2;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    .btn-success {
      background-color: #28a745;
    }

    .btn-success:hover {
      background-color: #1e7e34;
    }

    .btn-danger {
      background-color: #dc3545;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn-info {
      background-color: #17a2b8;
    }

    .btn-info:hover {
      background-color: #138496;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background-color: #e0a800;
      color: #212529;
    }

    .btn-secondary {
      background-color: #6c757d;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .create-section {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: white;
      width: 90%;
      max-width: 600px;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #1e293b;
      box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }

    .action-buttons-left {
      display: flex;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
    }

    .prestations-table {
       background: white;
       border-radius: 12px;
       overflow-x: auto;
       box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
       width: 100%;
       transition: all 0.3s ease;
       border: 1px solid rgba(249, 115, 22, 0.1);
       position: relative;
       overflow: hidden;
     }

     .prestations-table::before {
       content: '';
       position: absolute;
       top: 0;
       left: -100%;
       width: 100%;
       height: 100%;
       background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.02), transparent);
       transition: left 0.5s;
       z-index: 1;
       pointer-events: none;
     }

     .prestations-table:hover::before {
       left: 100%;
     }

     .prestations-table:hover {
       box-shadow: 0 20px 60px rgba(249, 115, 22, 0.15), 0 8px 24px rgba(0, 0, 0, 0.1);
       border-color: rgba(249, 115, 22, 0.3);
     }

     .prestations-table table {
       position: relative;
       z-index: 2;
     }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    th:nth-child(4), td:nth-child(4) { /* Item */
      white-space: normal;
      max-width: 200px;
    }

    th:nth-child(9), td:nth-child(9) { /* Actions */
      white-space: normal;
      min-width: 200px;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    .row-pending { background: #fffbeb; }
    .row-progress { background: #dbeafe; }
    .row-completed { background: #f0fdf4; }



    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fecaca; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }

    .montant {
      font-weight: 600;
      color: #059669;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
    }

    .action-buttons .btn-sm i {
      font-size: 0.875rem;
      color: inherit !important;
    }

    .btn i {
      color: inherit !important;
    }

    .btn * {
      color: inherit !important;
    }

    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
    }

    .btn-xs {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .text-muted {
      color: #6b7280;
      font-style: italic;
    }

    .btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.8rem;
      color: white;
      text-align: center;
      line-height: 1.2;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    .btn-success {
      background-color: #28a745;
    }

    .btn-success:hover {
      background-color: #1e7e34;
    }

    .btn-danger {
      background-color: #dc3545;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn-info {
      background-color: #17a2b8;
    }

    .btn-info:hover {
      background-color: #138496;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background-color: #e0a800;
      color: #212529;
    }

    .btn-secondary {
      background-color: #6c757d;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .create-section {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: white;
      width: 90%;
      max-width: 600px;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #1e293b;
      box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class PrestationsDashboardComponent implements OnInit {
  prestations: PrestationDashboard[] = [];
  filteredPrestations: PrestationDashboard[] = [];
  contrats: Contrat[] = [];
  selectedStatus = '';
  selectedPrestataire = '';
  showCreateForm = false;
  showEditForm = false;
  prestationForm!: FormGroup;
  editingPrestation: PrestationDashboard | null = null;
  loading = false;

  constructor(
    private ficheService: FichePrestationService,
    private contratService: ContratService,
    public authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService,
    private confirmationService: ConfirmationService
  ) {
    this.prestationForm = this.formBuilder.group({
      nomPrestataire: ['', Validators.required],
      nomItem: ['', Validators.required],
      dateRealisation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      statut: ['EN_ATTENTE'],
      commentaire: [''],
      idContrat: [''],
      dateDebut: [''],
      dateFin: [''],
      montant: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAdmin() || this.authService.isPrestataire() || this.authService.isAgentDGSI()) {
      this.loadData();
    }
  }

  loadData(): void {
    Promise.all([
      this.ficheService.getAllFiches().toPromise(),
      this.contratService.getAllContrats().toPromise()
    ]).then(([fiches, contrats]) => {
      this.contrats = contrats || [];

      // Filtrer les prestations selon le rôle de l'utilisateur
      let filteredFiches = fiches || [];
      if (this.authService.isPrestataire()) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          // Pour les prestataires, ne montrer que leurs propres prestations
          filteredFiches = filteredFiches.filter(fiche => fiche.nomPrestataire === currentUser.nom);
        }
      }

      this.prestations = filteredFiches.map(fiche => this.createPrestationDashboard(fiche));
      this.filteredPrestations = [...this.prestations];
    });
  }

  private createPrestationDashboard(fiche: FichePrestation): PrestationDashboard {
    const contrat = this.contrats.find(c => c.nomPrestataire === fiche.nomPrestataire);
    
    return {
      fiche,
      contrat,
      progression: this.calculateProgression(fiche),
      documentsJoints: []
    };
  }

  private calculateProgression(fiche: FichePrestation): number {
    switch (fiche.statut) {
      case StatutFiche.EN_ATTENTE: return 25;
      case StatutFiche.EN_COURS: return 75;
      case StatutFiche.TERMINEE: return 100;
      default: return 0;
    }
  }

  applyFilters(): void {
    this.filteredPrestations = this.prestations.filter(p => {
      const statusMatch = !this.selectedStatus || p.fiche.statut === this.selectedStatus as StatutFiche;
      const prestataireMatch = !this.selectedPrestataire || p.fiche.nomPrestataire === this.selectedPrestataire;
      return statusMatch && prestataireMatch;
    });
  }

  getStatsByStatus(status: string): PrestationDashboard[] {
    return this.prestations.filter(p => p.fiche.statut === status as StatutFiche);
  }

  getTotalPrestations(): number {
    return this.prestations.length;
  }

  getPrestationsReussies(): number {
    // Count prestations with statutIntervention: 'réussi'
    return this.prestations.filter(p => p.fiche.statutIntervention === 'réussi').length;
  }

  getPrestationsEchouees(): number {
    // Count prestations with statutIntervention: 'nécessite autre intervention'
    return this.prestations.filter(p => p.fiche.statutIntervention === 'nécessite autre intervention').length;
  }

  getTotalMontant(): number {
    return this.prestations.reduce((total, p) => total + (p.contrat?.montant || 0), 0);
  }

  getUniquePrestataires(): string[] {
    return [...new Set(this.prestations.map(p => p.fiche.nomPrestataire))];
  }

  getRowClass(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'row-pending';
      case StatutFiche.EN_COURS: return 'row-progress';
      case StatutFiche.TERMINEE: return 'row-completed';
      default: return '';
    }
  }

  getStatusBadgeClass(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'badge badge-warning';
      case StatutFiche.EN_COURS: return 'badge badge-info';
      case StatutFiche.TERMINEE: return 'badge badge-success';
      default: return 'badge';
    }
  }

  getStatusLabel(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'En attente';
      case StatutFiche.EN_COURS: return 'En cours';
      case StatutFiche.TERMINEE: return 'Terminée';
      default: return statut;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  modifierPrestation(prestation: PrestationDashboard): void {
    this.editingPrestation = prestation;
    this.showEditForm = true;
    
    // Pré-remplir le formulaire avec les données existantes
    this.prestationForm.patchValue({
      nomPrestataire: prestation.fiche.nomPrestataire,
      nomItem: prestation.fiche.nomItem,
      dateRealisation: new Date(prestation.fiche.dateRealisation).toISOString().slice(0, 16),
      quantite: prestation.fiche.quantite,
      statut: prestation.fiche.statut,
      commentaire: prestation.fiche.commentaire || '',
      idContrat: prestation.contrat?.idContrat || '',
      dateDebut: prestation.contrat?.dateDebut || '',
      dateFin: prestation.contrat?.dateFin || '',
      montant: prestation.contrat?.montant || 0
    });
  }

  voirFichiers(fichiersContrat: string): void {
    try {
      const fichiers = JSON.parse(fichiersContrat);
      if (fichiers && fichiers.length > 0) {
        fichiers.forEach((fichier: any, index: number) => {
          const link = document.createElement('a');
          link.href = fichier.data;
          link.download = fichier.name || `document-${index + 1}.pdf`;
          link.click();
        });
        this.toastService.show({
          type: 'success',
          title: 'Téléchargement',
          message: `${fichiers.length} fichier(s) téléchargé(s)`
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement des fichiers:', error);
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors du téléchargement des fichiers'
      });
    }
  }

  getPrestationsAEvaluer(): PrestationDashboard[] {
    return this.prestations.filter(p => p.fiche.statut === StatutFiche.TERMINEE);
  }

  demarrerPrestation(prestation: PrestationDashboard): void {
    if (prestation.fiche.id) {
      // Préparer les données minimales pour la mise à jour du statut
      const updatedData = {
        statut: StatutFiche.EN_COURS
      };

      console.log('Données envoyées pour démarrage:', updatedData);

      this.ficheService.updateFiche(prestation.fiche.id, updatedData as any).subscribe({
        next: () => {
          prestation.fiche.statut = StatutFiche.EN_COURS;
          prestation.progression = this.calculateProgression(prestation.fiche);
          this.toastService.show({
            type: 'success',
            title: 'Prestation démarrée',
            message: 'La prestation a été marquée comme en cours'
          });
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la prestation:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du démarrage de la prestation: ' + (error.error?.message || error.message)
          });
        }
      });
    } else {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation manquant'
      });
    }
  }

  terminerPrestation(prestation: PrestationDashboard): void {
    if (prestation.fiche.id) {
      // Préparer les données minimales pour la mise à jour du statut
      const updatedData = {
        statut: StatutFiche.TERMINEE
      };

      console.log('Données envoyées pour terminaison:', updatedData);

      this.ficheService.updateFiche(prestation.fiche.id, updatedData as any).subscribe({
        next: () => {
          prestation.fiche.statut = StatutFiche.TERMINEE;
          prestation.progression = this.calculateProgression(prestation.fiche);

          // Envoyer notification si prestation terminée
          this.notificationService.notifierPrestationTerminee(
            prestation.fiche.nomPrestataire,
            prestation.fiche.id!,
            prestation.fiche.nomItem
          ).subscribe({
            next: () => {
              this.toastService.show({
                type: 'info',
                title: 'Notification envoyée',
                message: 'Le prestataire a été notifié pour soumettre son rapport'
              });
            },
            error: (error) => {
              console.error('Erreur lors de l\'envoi de notification:', error);
            }
          });

          this.toastService.show({
            type: 'success',
            title: 'Prestation terminée',
            message: 'La prestation a été marquée comme terminée'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la terminaison de la prestation:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la terminaison de la prestation: ' + (error.error?.message || error.message)
          });
        }
      });
    } else {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation manquant'
      });
    }
  }

  evaluerPrestataire(prestation: PrestationDashboard): void {
    this.router.navigate(['/evaluations/new'], {
      queryParams: {
        prestationId: prestation.fiche.id,
        prestataire: prestation.fiche.nomPrestataire,
        nomItem: prestation.fiche.nomItem,
        contratId: prestation.contrat?.idContrat
      }
    });
  }

  creerNouvellePrestation(): void {
    this.showCreateForm = true;
  }

  fermerFormulaire(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingPrestation = null;
    this.prestationForm.reset();
    this.prestationForm.patchValue({ 
      quantite: 1, 
      statut: 'EN_ATTENTE',
      montant: 0
    });
  }

  async creerPrestation(): Promise<void> {
    if (this.prestationForm.valid) {
      this.loading = true;
      const formData = this.prestationForm.value;
      
      if (this.editingPrestation) {
        // Mode modification
        const prestationData = {
          nomPrestataire: formData.nomPrestataire,
          nomItem: formData.nomItem,
          dateRealisation: new Date(formData.dateRealisation).toISOString(),
          quantite: formData.quantite,
          statut: formData.statut,
          commentaire: formData.commentaire,
          idPrestation: this.editingPrestation.fiche.idPrestation,
          fichiersContrat: this.editingPrestation.fiche.fichiersContrat
        };

        // Mettre à jour la fiche de prestation
        this.ficheService.updateFiche(this.editingPrestation.fiche.id!, prestationData).subscribe({
          next: () => {
            // Créer ou mettre à jour le contrat
            if (formData.dateDebut || formData.dateFin || formData.montant || formData.idContrat) {
              const contratData = {
                idContrat: formData.idContrat || `CONT-${prestationData.nomPrestataire}-${Date.now()}`,
                typeContrat: 'item',
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                nomPrestataire: prestationData.nomPrestataire,
                montant: formData.montant || 0,
                lot: '',
                ville: ''
              };
              
              if (this.editingPrestation!.contrat?.id) {
                // Mettre à jour le contrat existant
                this.contratService.updateContrat(this.editingPrestation!.contrat.id, { ...contratData, statut: this.editingPrestation!.contrat.statut }).subscribe({
                  next: () => {
                    this.finaliserModification();
                  },
                  error: (error) => {
                    console.error('Error updating contrat:', error);
                    this.finaliserModification();
                  }
                });
              } else {
                // Créer un nouveau contrat
                this.contratService.createContrat({ ...contratData, statut: StatutContrat.ACTIF }).subscribe({
                  next: () => {
                    this.finaliserModification();
                  },
                  error: (error) => {
                    console.error('Error creating contrat:', error);
                    this.finaliserModification();
                  }
                });
              }
            } else {
              this.finaliserModification();
            }
          },
          error: (error) => {
            console.error('Error updating prestation:', error);
            this.loading = false;
            this.toastService.show({ 
              type: 'error', 
              title: 'Erreur', 
              message: 'Erreur lors de la modification de la prestation' 
            });
          }
        });
      } else {
        // Mode création
        const prestationData = {
          nomPrestataire: formData.nomPrestataire,
          nomItem: formData.nomItem,
          dateRealisation: new Date(formData.dateRealisation).toISOString(),
          quantite: formData.quantite,
          statut: formData.statut || 'EN_ATTENTE',
          commentaire: formData.commentaire,
          idPrestation: 'PREST-' + Date.now()
        };

        this.ficheService.createFiche(prestationData).subscribe({
          next: () => {
            this.loading = false;
            this.fermerFormulaire();
            this.loadData();
            this.toastService.show({ 
              type: 'success', 
              title: 'Prestation créée', 
              message: 'La prestation a été créée avec succès' 
            });
          },
          error: (error) => {
            console.error('Error creating prestation:', error);
            this.loading = false;
            this.toastService.show({ 
              type: 'error', 
              title: 'Erreur', 
              message: 'Erreur lors de la création de la prestation' 
            });
          }
        });
      }
    }
  }

  async supprimerPrestation(prestation: PrestationDashboard): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la prestation',
      message: `Êtes-vous sûr de vouloir supprimer la prestation ${prestation.fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed && prestation.fiche.id) {
      this.ficheService.deleteFiche(prestation.fiche.id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.show({ 
            type: 'success', 
            title: 'Prestation supprimée', 
            message: 'La prestation a été supprimée avec succès' 
          });
        },
        error: (error) => {
          console.error('Error deleting prestation:', error);
          this.toastService.show({ 
            type: 'error', 
            title: 'Erreur', 
            message: 'Erreur lors de la suppression de la prestation' 
          });
        }
      });
    }
  }

  private finaliserModification(): void {
    this.loading = false;
    this.fermerFormulaire();
    this.loadData();
    this.toastService.show({ 
      type: 'success', 
      title: 'Prestation modifiée', 
      message: 'La prestation a été modifiée avec succès' 
    });
  }

  genererOrdrePDF(): void {
    const prestationsTerminees = this.prestations.filter(p => p.fiche.statut === StatutFiche.TERMINEE);
    
    if (prestationsTerminees.length === 0) {
      this.toastService.show({
        type: 'warning',
        title: 'Aucune prestation',
        message: 'Aucune prestation terminée pour générer l\'ordre de commande'
      });
      return;
    }

    this.genererPDFAvecJsPDF(prestationsTerminees);
  }

  private genererPDFAvecJsPDF(prestations: PrestationDashboard[]): void {
    // Temporarily disabled - PDF generation service removed
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité temporairement indisponible',
      message: 'La génération d\'ordre de commande sera bientôt réactivée'
    });
  }

  exportToPdf(): void {
    // Temporarily disabled - PDF export service removed
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité temporairement indisponible',
      message: 'L\'export PDF sera bientôt réactivé'
    });
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
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

  navigateTo(route: string): void {
    this.router.navigate(['/' + route]);
  }
}
