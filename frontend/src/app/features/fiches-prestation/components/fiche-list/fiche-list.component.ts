import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <div>
            <h1>Gestion de mes fiches de Prestations</h1>
          </div>
        </div>
        <!-- DEV helper: create a test fiche so admins can test validation without switching to prestataire -->
        <div class="mb-4" *ngIf="authService.isAdmin()">
          <button class="btn btn-sm btn-outline" (click)="createTestFiche()">Créer fiche de test (dev)</button>
        </div>

        <!-- Create Fiche Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} une Prestation</h2>
              </div>
              
              <form [formGroup]="ficheForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nomPrestataire">Nom du Prestataire</label>
                    <input type="text" id="nomPrestataire" formControlName="nomPrestataire">
                  </div>

                  <div class="form-group">
                    <label for="nomItem">Nom de l'Item</label>
                    <input type="text" id="nomItem" formControlName="nomItem" placeholder="Ex: Maintenance ordinateur">
                  </div>

                  <div class="form-group">
                    <label for="dateRealisation">Date de Réalisation</label>
                    <input type="datetime-local" id="dateRealisation" formControlName="dateRealisation">
                  </div>

                  <div class="form-group">
                    <label for="quantite">Quantité</label>
                    <input type="number" id="quantite" formControlName="quantite" min="1">
                  </div>

                  <div class="form-group" *ngIf="authService.isAgentDGSI()">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="VALIDE">Valider</option>
                      <option value="REJETE">Rejeter</option>
                    </select>
                  </div>

                  <div class="form-group form-group-full">
                    <label for="commentaire">Commentaire</label>
                    <textarea id="commentaire" formControlName="commentaire" rows="4" placeholder="Commentaires sur la prestation..."></textarea>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Statistics for Prestataires -->
        <div class="stats-section" *ngIf="authService.isPrestataire()">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-file-contract"></i>
              </div>
              <div class="stat-info">
                <h3>{{ fiches.length }}</h3>
                <p>Total Prestations</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('EN_ATTENTE').length }}</h3>
                <p>En Attente</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-play"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('EN_COURS').length }}</h3>
                <p>En Cours</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('TERMINEE').length + getFichesByStatus('VALIDE').length }}</h3>
                <p>Terminées/Validées</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quarterly Submission for Prestataires -->
        <div class="quarterly-submission" *ngIf="authService.isPrestataire()">
          <div class="submission-card">
            <h3>Soumission du Rapport Trimestriel</h3>
            <p>Soumettez toutes vos fiches de prestations pour le trimestre sélectionné à l'administrateur</p>

            <div class="submission-form">
              <div class="form-group">
                <label for="quarter">Trimestre</label>
                <select id="quarter" [(ngModel)]="selectedQuarter" class="form-control">
                  <option value="">Sélectionnez un trimestre</option>
                  <option value="Q1">Trimestre 1 (Jan-Mar)</option>
                  <option value="Q2">Trimestre 2 (Avr-Jun)</option>
                  <option value="Q3">Trimestre 3 (Jul-Sep)</option>
                  <option value="Q4">Trimestre 4 (Oct-Déc)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="year">Année</label>
                <select id="year" [(ngModel)]="selectedYear" class="form-control">
                  <option value="">Sélectionnez une année</option>
                  <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
                </select>
              </div>

              <button class="btn btn-success" (click)="submitQuarterlyReport()" [disabled]="!selectedQuarter || !selectedYear || submittingReport">
                {{ submittingReport ? 'Soumission...' : 'Soumettre le Rapport' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Fiches Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Prestations</h2>
            <!-- DEBUG: Show current user and role detection -->
            <div style="background: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              <div>Auth Debug: isAdmin={{authService.isAdmin()}} | isAgentDGSI={{authService.isAgentDGSI()}} | isPrestataire={{authService.isPrestataire()}}</div>
              <div>Current User: {{authService.getCurrentUser() | json}}</div>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="fiches.length > 0; else noData">
              <thead>
                <tr>
                  <th>ID Prestation</th>
                  <th>Prestataire</th>
                  <th>Item</th>
                  <th>Date Réalisation</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fiche of fiches">
                  <td>{{ fiche.idPrestation }}</td>
                  <td>{{ fiche.nomPrestataire }}</td>
                  <td>{{ fiche.nomItem }}</td>
                  <td>{{ formatDate(fiche.dateRealisation) }}</td>
                  <td>{{ fiche.quantite }}</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(fiche.statut)">
                      {{ getStatusLabel(fiche.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-info btn-sm" (click)="viewDetails(fiche)">
                        Détails
                      </button>
                      <button class="btn btn-success btn-sm"
                              *ngIf="authService.isAdmin() && fiche"
                              (click)="validerFiche(fiche)">
                        Valider
                      </button>
                      <button class="btn btn-danger btn-sm"
                              *ngIf="authService.isAdmin() && fiche"
                              (click)="rejeterFiche(fiche)">
                        Rejeter
                      </button>
                      <button class="btn btn-primary btn-sm" (click)="submitFiche(fiche)" *ngIf="authService.isPrestataire() && isFicheTerminee(fiche)">
                        Soumettre
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="editFiche(fiche)" *ngIf="authService.isPrestataire()">
                        Modifier
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteFiche(fiche)" *ngIf="authService.isAdmin()">
                        Supprimer
                      </button>
                      <button class="btn btn-warning btn-sm"
                              *ngIf="authService.isAdmin() && isFicheTerminee(fiche)"
                              (click)="evaluerPrestataire(fiche)"
                              title="Évaluer le prestataire">
                        <i class="fas fa-star"></i> Évaluer
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
        </div>

        <!-- Details Modal -->
        <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
          <div class="modal-content large-modal" (click)="$event.stopPropagation()" style="margin-top: 80px; max-width: 1000px;">
            <div class="modal-header">
              <h2>Détails de la Fiche de Prestation</h2>
              <button class="close-btn" (click)="closeDetailsModal()">&times;</button>
            </div>

            <div class="modal-body" *ngIf="selectedFiche">
              <div class="details-container">
                <!-- Informations générales -->
                <div class="details-section">
                  <h3>Informations Générales</h3>
                  <table class="details-table">
                    <tr>
                      <td><strong>ID Prestation:</strong></td>
                      <td>{{ selectedFiche.idPrestation || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Prestataire:</strong></td>
                      <td>{{ selectedFiche.nomPrestataire || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Item:</strong></td>
                      <td>{{ selectedFiche.nomItem || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Lot sélectionné:</strong></td>
                      <td>{{ getLotFromFiche(selectedFiche) || 'N/A' }}</td>
                    </tr>
                    <tr>
                      <td><strong>Date de réalisation:</strong></td>
                      <td>{{ formatDate(selectedFiche.dateRealisation) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Quantité:</strong></td>
                      <td>{{ selectedFiche.quantite || 1 }}</td>
                    </tr>
                    <tr>
                      <td><strong>Montant total:</strong></td>
                      <td><strong>{{ getMontantFromFiche(selectedFiche) | number:'1.0-0' }} FCFA</strong></td>
                    </tr>
                    <tr>
                      <td><strong>Statut:</strong></td>
                      <td>
                        <span class="status-badge" [class]="getStatusBadgeClass(selectedFiche.statut)">
                          {{ getStatusLabel(selectedFiche.statut) }}
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>

                <!-- Items couverts -->
                <div class="details-section">
                  <h3>Items Couverts</h3>
                  <div class="items-display">
                    <p>{{ getItemsCouvertsString(selectedFiche) }}</p>
                  </div>
                </div>

                <!-- Commentaire -->
                <div class="details-section" *ngIf="selectedFiche.commentaire">
                  <h3>Commentaire</h3>
                  <div class="comment-display">
                    <p>{{ selectedFiche.commentaire }}</p>
                  </div>
                </div>

                <!-- Résumé -->
                <div class="details-section">
                  <h3>Résumé</h3>
                  <table class="details-table">
                    <tr>
                      <td><strong>Nombre d'items couverts:</strong></td>
                      <td>{{ getItemsArray(selectedFiche).length }}</td>
                    </tr>
                    <tr>
                      <td><strong>Statut de l'intervention:</strong></td>
                      <td>{{ getStatutInterventionLabel(selectedFiche.statutIntervention) || 'N/A' }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button class="btn btn-primary" (click)="closeDetailsModal()">Fermer</button>
            </div>
          </div>
        </div>

        <!-- CSS Styles -->
        <style>
    /* Complete prestation-form styles for fiche details modal */
    .large-modal {
      max-width: 1100px;
    }

    .wizard-modal {
      max-width: 900px;
      width: 95%;
    }

    .modal-content.form-modal.wizard-modal.large-modal {
      max-width: 1100px;
      width: 95%;
    }

    /* Step indicator */
    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      opacity: 0.5;
      transition: all 0.3s ease;
    }

    .step.active {
      opacity: 1;
    }

    .step.completed {
      opacity: 1;
    }

    .step-number {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #e5e7eb;
      color: #6b7280;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      transition: all 0.3s ease;
    }

    .step.active .step-number {
      background: #f97316;
      color: white;
    }

    .step.completed .step-number {
      background: #10b981;
      color: white;
    }

    .step-label {
      font-size: 0.75rem;
      font-weight: 500;
      color: #6b7280;
      text-align: center;
    }

    .step.active .step-label {
      color: #f97316;
      font-weight: 600;
    }

    .step.completed .step-label {
      color: #10b981;
      font-weight: 600;
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1E2761;
      text-align: center;
      margin-bottom: 2rem;
    }

    .step-content {
      margin-bottom: 2rem;
    }

    .form-section {
      background: white;
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      color: #1E2761;
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }

    .section-divider {
      height: 3px;
      background: linear-gradient(90deg, #f97316, #ea580c);
      border-radius: 2px;
    }

    /* Summary sections and tables */
    .summary-section {
      margin-bottom: 2rem;
    }

    .summary-section h4 {
      color: #374151;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;
    }

    .summary-table tr {
      border-bottom: 1px solid #f3f4f6;
    }

    .summary-table tr:last-child {
      border-bottom: none;
    }

    .label-cell {
      font-weight: 600;
      color: #374151;
      padding: 0.75rem 1rem 0.75rem 0;
      width: 40%;
      vertical-align: top;
    }

    .value-cell {
      color: #1f2937;
      padding: 0.75rem 0;
      word-break: break-word;
    }

    /* Status colors */
    .status.VALIDE,
    .status.Validé {
      color: #10b981;
      font-weight: 600;
    }

    .status.REJETE,
    .status.Rejeté {
      color: #ef4444;
      font-weight: 600;
    }

    .status.EN_ATTENTE,
    .status.En_attente {
      color: #f59e0b;
      font-weight: 600;
    }

    .status.TERMINEE,
    .status.Terminée {
      color: #3b82f6;
      font-weight: 600;
    }

    /* Comment section */
    .comment-section {
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      border-radius: 6px;
      padding: 1rem;
      margin-top: 0.5rem;
    }

    .comment-section p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }

    /* Proforma section */
    .proforma-section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 2rem;
      margin-top: 2rem;
    }

    .proforma-header h4 {
      color: #1E2761;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
    }

    .proforma-invoice {
      background: white;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      margin-top: 1.5rem;
    }

    .invoice-table {
      padding: 1.5rem;
    }

    .proforma-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;
    }

    .proforma-table th {
      background: #f3f4f6;
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .proforma-table td {
      padding: 0.75rem;
      border-bottom: 1px solid #f3f4f6;
      color: #1f2937;
    }

    .proforma-table .invoice-row:hover {
      background: #f9fafb;
    }

    .item-col {
      width: 70%;
    }

    .qty-col {
      text-align: right;
      width: 30%;
    }

    .item-desc {
      font-weight: 500;
    }

    .qty-value {
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      text-align: right;
    }

    .invoice-summary {
      background: #f9fafb;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .summary-label {
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    .summary-value {
      color: #1f2937;
      font-weight: 500;
    }

    /* Form actions */
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    /* Modal and container styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 1000px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      background: linear-gradient(135deg, #1E2761, #3D3B5D);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px 8px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: white;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .modal-body {
      padding: 2rem;
    }

    .modal-footer {
      padding: 1.5rem;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      border-radius: 0 0 8px 8px;
    }

    .details-container {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .details-section {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1.5rem;
      border: 1px solid #e5e7eb;
    }

    .details-section h3 {
      color: #1E2761;
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      border-bottom: 2px solid #f97316;
      padding-bottom: 0.5rem;
    }

    .details-table {
      width: 100%;
      border-collapse: collapse;
    }

    .details-table tr {
      border-bottom: 1px solid #f3f4f6;
    }

    .details-table tr:last-child {
      border-bottom: none;
    }

    .details-table td {
      padding: 0.75rem;
      vertical-align: top;
    }

    .details-table td:first-child {
      font-weight: 600;
      color: #374151;
      width: 40%;
    }

    .details-table td:last-child {
      color: #1f2937;
    }

    .items-display {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 6px;
      padding: 1rem;
    }

    .items-display p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }

    .comment-display {
      background: white;
      border: 1px solid #f3f4f6;
      border-radius: 6px;
      padding: 1rem;
    }

    .comment-display p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
      font-style: italic;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      display: inline-block;
      border: none;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background: #dcfce7;
      color: #166534;
    }

    .badge-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .form-modal {
      max-width: 600px;
    }

    .prestation-form {
      width: 100%;
    }

    /* Container and page styles */
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1E2761;
      margin: 0;
      letter-spacing: 0.5px;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .table-header h2 {
      margin: 0 0 0.5rem 0;
      color: #1E2761;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f3f4f6;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid #f3f4f6;
      color: #1f2937;
      font-size: 0.9rem;
    }

    tr:hover {
      background: #f9fafb;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Badge styles */
    .badge {
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      display: inline-block;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background: #dcfce7;
      color: #166534;
    }

    .badge-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-info {
      background: #dbeafe;
      color: #1e40af;
    }

    /* Button styles */
    .btn {
      padding: 0.6rem 1.2rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn-sm {
      padding: 0.4rem 0.8rem;
      font-size: 0.8rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-success:hover:not(:disabled) {
      background: linear-gradient(135deg, #059669, #047857);
      box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
    }

    .btn-danger {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
    }

    .btn-info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-info:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6b7280, #4b5563);
      color: white;
      box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
    }

    .btn-secondary:hover:not(:disabled) {
      background: linear-gradient(135deg, #4b5563, #374151);
      box-shadow: 0 6px 16px rgba(107, 114, 128, 0.4);
    }

    .btn-outline {
      background: transparent;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }

    .btn-warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-warning:hover:not(:disabled) {
      background: linear-gradient(135deg, #d97706, #b45309);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
    }

    .btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Card styles */
    .card {
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }

    .card-header {
      background: linear-gradient(135deg, #1E2761, #3D3B5D);
      color: white;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .card-body {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.95rem;
      transition: border-color 0.2s ease;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #1E2761;
      box-shadow: 0 0 0 3px rgba(30, 39, 97, 0.1);
    }
        </style>
  `
})
export class FicheListComponent implements OnInit {
  fiches: FichePrestation[] = [];
  ficheForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  selectedQuarter = '';
  selectedYear = '';
  submittingReport = false;
  availableYears: number[] = [];
  showDetailsModal = false;
  selectedFiche: FichePrestation | null = null;

  constructor(
    private ficheService: FichePrestationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router
  ) {
    // Set default status based on user role
    const defaultStatus = this.authService.isPrestataire() ? 'TERMINEE' : 'EN_ATTENTE';
    this.ficheForm = this.formBuilder.group({
      nomPrestataire: ['', Validators.required],
      nomItem: ['', Validators.required],
      dateRealisation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      statut: [defaultStatus],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    // Debug: Check auth state immediately on init
    console.log('FicheListComponent ngOnInit - Current user:', this.authService.getCurrentUser());
    console.log('FicheListComponent ngOnInit - isAdmin:', this.authService.isAdmin());
    console.log('FicheListComponent ngOnInit - isAgentDGSI:', this.authService.isAgentDGSI());
    
    this.loadFiches();
    this.initializeAvailableYears();
  }

  initializeAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      this.availableYears.push(i);
    }
  }

  async submitQuarterlyReport(): Promise<void> {
    if (!this.selectedQuarter || !this.selectedYear) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner un trimestre et une année'
      });
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Soumission du Rapport Trimestriel',
      message: `Voulez-vous soumettre toutes vos fiches de prestations pour ${this.selectedQuarter} ${this.selectedYear} à l'administrateur ?`,
      confirmText: 'Soumettre',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.submittingReport = true;

      // Get current user's fiches for the selected quarter
      const user = this.authService.getCurrentUser();
      if (user) {
        const quarterFiches = this.fiches.filter(fiche => {
          const ficheDate = new Date(fiche.dateRealisation);
          const ficheYear = ficheDate.getFullYear();
          const ficheMonth = ficheDate.getMonth() + 1; // getMonth() returns 0-11

          // Determine quarter
          let ficheQuarter = '';
          if (ficheMonth >= 1 && ficheMonth <= 3) ficheQuarter = 'Q1';
          else if (ficheMonth >= 4 && ficheMonth <= 6) ficheQuarter = 'Q2';
          else if (ficheMonth >= 7 && ficheMonth <= 9) ficheQuarter = 'Q3';
          else ficheQuarter = 'Q4';

          return fiche.nomPrestataire === user.nom && ficheQuarter === this.selectedQuarter && ficheYear === parseInt(this.selectedYear);
        });

        if (quarterFiches.length === 0) {
          this.toastService.show({
            type: 'warning',
            title: 'Aucune fiche',
            message: 'Aucune fiche trouvée pour ce trimestre'
          });
          this.submittingReport = false;
          return;
        }

        // Here we would typically send the report to admin
        // For now, just show success and mark fiches as submitted
        this.toastService.show({
          type: 'success',
          title: 'Rapport soumis',
          message: `${quarterFiches.length} fiche(s) soumise(s) pour évaluation trimestrielle`
        });

        this.submittingReport = false;
        this.selectedQuarter = '';
        this.selectedYear = '';
      }
    }
  }

  /** DEV helper: create a minimal fiche for testing validation flow. */
  createTestFiche(): void {
    const testFiche: any = {
      // Let backend generate idPrestation if needed
      nomPrestataire: 'Prestataire Service',
      nomItem: 'Prestation de test',
      dateRealisation: new Date().toISOString(),
      quantite: 1,
      statut: 'EN_ATTENTE',
      commentaire: 'Fiche de test générée depuis l\'UI (dev)'
    };

    this.ficheService.createFiche(testFiche).subscribe({
      next: (created) => {
        this.toastService.show({ type: 'success', title: 'Fiche test', message: `Fiche de test créée (id: ${created.idPrestation || created.id})` });
        this.loadFiches();
      },
      error: (err) => {
        console.error('Erreur création fiche test:', err);
        const serverMessage = err?.error?.message || err?.error || err?.message;
        this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur création fiche test' });
      }
    });
  }

  loadFiches(): void {
    this.loadingList = true;
    this.ficheService.getAllFiches().subscribe({
      next: (fiches) => {
        // Backend already filters based on user role, so just use the returned fiches
        this.fiches = fiches;

        // DEBUG: log current user and fiche statuses to debug disabled buttons
        try {
          const currentUser = this.authService.getCurrentUser();
          console.log('DEBUG loadFiches - currentUser:', currentUser);
          console.log('DEBUG loadFiches - isAdmin:', this.authService.isAdmin(), 'isAgentDGSI:', this.authService.isAgentDGSI());
          this.fiches.forEach((f: any) => {
            console.log('DEBUG loadFiches - fiche id:', f.id, 'idPrestation:', f.idPrestation, 'statut raw:', f.statut, 'statut typeof:', typeof f.statut);
            try {
              console.log('DEBUG loadFiches - statut JSON:', JSON.stringify(f.statut));
            } catch (e) {
              // ignore stringify errors
            }
          });
        } catch (e) {
          console.warn('DEBUG loadFiches - logging failed', e);
        }

        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading fiches:', error);
        this.loadingList = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.ficheForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cette fiche ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const ficheData = this.ficheForm.value;

        if (this.isEditing && this.editingId) {
          this.ficheService.updateFiche(this.editingId, ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
            },
            error: (error) => {
              console.error('Error updating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur modification' });
            }
          });
        } else {
          this.ficheService.createFiche(ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
            },
            error: (error) => {
              console.error('Error creating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur création' });
            }
          });
        }
      }
    }
  }

  editFiche(fiche: FichePrestation): void {
    this.isEditing = true;
    this.editingId = fiche.id!;
    this.showCreateForm = true;
    
    this.ficheForm.patchValue({
      nomPrestataire: fiche.nomPrestataire,
      nomItem: fiche.nomItem,
      dateRealisation: fiche.dateRealisation,
      quantite: fiche.quantite,
      statut: fiche.statut,
      commentaire: fiche.commentaire
    });
  }

  async deleteFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer',
      message: `Supprimer la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      this.ficheService.deleteFiche(fiche.id!).subscribe({
        next: () => {
          this.loadFiches();
        },
        error: (error) => {
          console.error('Error deleting fiche:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur suppression' });
        }
      });
    }
  }

  async validerFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Valider',
      message: `Valider la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Valider',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      const commentaires = prompt('Commentaires (optionnel):');
      // DEBUG: log fiche and statut client-side to help diagnose validation issues
      // (temporary, remove after debugging)
      console.log('DEBUG validerFiche - fiche object:', fiche);
      console.log('DEBUG validerFiche - fiche.statut (raw):', (fiche as any).statut);

      this.ficheService.validerFiche(fiche.id!, commentaires || undefined).subscribe({
        next: () => {
          this.toastService.show({ type: 'success', title: 'Valider', message: `La fiche ${fiche.idPrestation} a été validée` });
          this.loadFiches();
        },
        error: (error) => {
          console.error('Error validating fiche:', error);
          const serverMessage = error?.error?.message || error?.error || error?.message;
          this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur validation' });
        }
      });
    }
  }

  async submitFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Soumettre la fiche',
      message: `Soumettre la fiche ${fiche.idPrestation} pour validation ?`,
      confirmText: 'Soumettre',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      // Update fiche status to EN_ATTENTE for validation
      const updateData = { statut: 'EN_ATTENTE' };
      this.ficheService.updateFiche(fiche.id!, updateData).subscribe({
        next: (updatedFiche) => {
          this.toastService.show({
            type: 'success',
            title: 'Fiche soumise',
            message: `La fiche ${fiche.idPrestation} a été soumise pour validation`
          });
          this.loadFiches(); // Refresh the list
        },
        error: (error) => {
          console.error('Error submitting fiche:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la soumission de la fiche'
          });
        }
      });
    }
  }

  async rejeterFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Rejeter',
      message: `Rejeter la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      const commentaires = prompt('Motif du rejet:');
      if (commentaires) {
        // DEBUG: log fiche and statut client-side to help diagnose rejection issues
        // (temporary, remove after debugging)
        console.log('DEBUG rejeterFiche - fiche object:', fiche);
        console.log('DEBUG rejeterFiche - fiche.statut (raw):', (fiche as any).statut);

        this.ficheService.rejeterFiche(fiche.id!, commentaires).subscribe({
          next: () => {
            this.toastService.show({ type: 'success', title: 'Rejet', message: `La fiche ${fiche.idPrestation} a été rejetée` });
            this.loadFiches();
          },
          error: (error) => {
            console.error('Error rejecting fiche:', error);
            const serverMessage = error?.error?.message || error?.error || error?.message;
            this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur rejet' });
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.ficheForm.reset();
    const defaultStatus = this.authService.isPrestataire() ? 'TERMINEE' : 'EN_ATTENTE';
    this.ficheForm.patchValue({ statut: defaultStatus, quantite: 1 });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutFiche): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'VALIDE': 'badge-success',
      'REJETE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutFiche): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return statusLabels[statut] || statut;
  }

  /**
   * Robust check whether a fiche is in EN_ATTENTE state.
   * Handles cases where the backend returns an enum-like object or a string.
   */
  isFicheEnAttente(fiche: FichePrestation | null | undefined): boolean {
    if (!fiche) return false;
  const s = fiche.statut ?? (fiche as any).statutValidation ?? '';
    return String(s).toUpperCase().indexOf('EN_ATTENTE') !== -1;
  }

  /**
   * Robust check whether a fiche is in TERMINEE state.
   */
  isFicheTerminee(fiche: FichePrestation | null | undefined): boolean {
    if (!fiche) return false;
  const s = fiche.statut ?? (fiche as any).statutValidation ?? '';
    return String(s).toUpperCase().indexOf('TERMINEE') !== -1;
  }

  evaluerPrestataire(fiche: FichePrestation): void {
    this.router.navigate(['/evaluations/new'], {
      queryParams: {
        prestationId: fiche.id,
        prestataire: fiche.nomPrestataire,
        nomItem: fiche.nomItem
      }
    });
  }

  getFichesByStatus(status: string): FichePrestation[] {
    return this.fiches.filter(fiche => fiche.statut === status);
  }

  viewDetails(fiche: FichePrestation): void {
    this.selectedFiche = fiche;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedFiche = null;
  }

  // Helper methods for template
  getItemsCouvertsString(fiche: FichePrestation): string {
    return fiche.itemsCouverts || 'N/A';
  }

  getStatutInterventionLabel(statut: string | undefined): string {
    if (!statut) return 'N/A';
    const labels: { [key: string]: string } = {
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'NON_COMMENCEE': 'Non commencé'
    };
    return labels[statut] || statut;
  }

  getItemsArray(fiche: FichePrestation): string[] {
    if (!fiche.itemsCouverts) return [];
    if (Array.isArray(fiche.itemsCouverts)) return fiche.itemsCouverts;
    if (typeof fiche.itemsCouverts === 'string') {
      try {
        return JSON.parse(fiche.itemsCouverts);
      } catch {
        return [fiche.itemsCouverts];
      }
    }
    return [];
  }

  // Get lot information from fiche
  getLotFromFiche(fiche: FichePrestation): string {
    const ficheAny = fiche as any;
    if (ficheAny.lot && ficheAny.lot.nomLot) {
      return ficheAny.lot.nomLot;
    }
    if (ficheAny.nomLot) {
      return ficheAny.nomLot;
    }
    // Try to get from item if available
    if (ficheAny.item && ficheAny.item.lot) {
      return `Lot ${ficheAny.item.lot}`;
    }
    return 'N/A';
  }

  // Get montant from fiche - calculate based on quantity and item price
  getMontantFromFiche(fiche: FichePrestation): number {
    const ficheAny = fiche as any;

    // If montant is directly available
    if (ficheAny.montant && ficheAny.montant > 0) {
      return ficheAny.montant;
    }

    if (ficheAny.montantIntervention && ficheAny.montantIntervention > 0) {
      return ficheAny.montantIntervention;
    }

    // Try to calculate from item price and quantity
    if (ficheAny.item && ficheAny.item.prix && fiche.quantite) {
      return ficheAny.item.prix * fiche.quantite;
    }

    // If no amount available, return 0
    return 0;
  }
}
