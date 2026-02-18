import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ContratService } from '../../../../core/services/contrat.service';
import { Contrat, StatutContrat } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserService } from '../../../../core/services/user.service';
import { ContratFormComponent } from '../contrat-form/contrat-form.component';

@Component({
  selector: 'app-contrat-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  template: `
    <div class="container">

        <!-- Statistics Cards - Material Design Style -->
        <div class="stats-overview">
          <div class="stat-card total-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon-bg">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              </div>
              <div class="stat-icon-shadow"></div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ filteredContrats.length }}</div>
              <div class="stat-label">Total Contrats</div>
              <div class="stat-subtitle">Tous les contrats</div>
            </div>
          </div>

          <div class="stat-card active-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon-bg">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10.3,16.74L6.21,12.63L7.62,11.21L10.3,13.89L16.38,7.79L17.79,9.21L10.3,16.74Z"/>
                </svg>
              </div>
              <div class="stat-icon-shadow"></div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getContratsByStatus('ACTIF').length }}</div>
              <div class="stat-label">Contrats Actifs</div>
              <div class="stat-subtitle">En cours d'exécution</div>
            </div>
          </div>

          <div class="stat-card suspended-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon-bg">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13,14H11V12H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/>
                </svg>
              </div>
              <div class="stat-icon-shadow"></div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getContratsByStatus('SUSPENDU').length }}</div>
              <div class="stat-label">Suspendus</div>
              <div class="stat-subtitle">En attente</div>
            </div>
          </div>

          <div class="stat-card amount-card">
            <div class="stat-icon-wrapper">
              <div class="stat-icon-bg">
                <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
                </svg>
              </div>
              <div class="stat-icon-shadow"></div>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ getTotalMontant() | number:'1.0-0' }}</div>
              <div class="stat-label">Montant Total</div>
              <div class="stat-subtitle">FCFA</div>
            </div>
          </div>
        </div>

        <!-- Contracts List - Table Style -->
        <div class="contracts-list">
          <div class="table-header">
            <h2>Listes de mes contrats</h2>
            <div class="header-actions">
              <div *ngIf="filteredContrats.length > 0" class="contract-count">
                Total : <span class="font-semibold">{{ filteredContrats.length }}</span>
              </div>
              <button class="btn btn-primary" *ngIf="authService.isAdmin()" (click)="openContratForm()">
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                Nouveau Contrat
              </button>
            </div>
          </div>

          <!-- Loading -->
          <div *ngIf="loadingList" class="text-center py-12 text-gray-500 animate-pulse">
            <i class="fas fa-spinner fa-spin text-3xl mb-3"></i>
            <p>Chargement des contrats...</p>
          </div>

          <!-- Contracts Table -->
          <div *ngIf="!loadingList && filteredContrats.length > 0; else noData" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Numéro Contrat</th>
                  <th>Prestataire</th>
                  <th>Date de Début</th>
                  <th>Date de Fin</th>
                  <th>Montant</th>
                  <th>Lot</th>
                   <th>Régions</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let contrat of filteredContrats">
                  <td>{{ contrat.idContrat }}</td>
                  <td>{{ contrat.nomPrestataire }}</td>
                  <td>{{ formatDate(contrat.dateDebut) }}</td>
                  <td>{{ formatDate(contrat.dateFin) }}</td>
                  <td class="text-green-600 font-medium">{{ contrat.montant | number:'1.0-0' }} FCFA</td>
                  <td>{{ contrat.lot }}</td>
                   <td>{{ contrat.regions }}</td>
                  <td>
                    <span class="badge" [class]="getStatutBadgeClass(contrat.statut)">
                      {{ getStatutLabel(contrat.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-2">
                      <select *ngIf="authService.isAdmin()"
                              [value]="contrat.statut"
                              (change)="changeStatut(contrat, $event)"
                              class="text-xs px-2 py-1 border border-gray-300 rounded">
                        <option *ngFor="let statut of statutOptions" [value]="statut">
                          {{ getStatutLabel(statut) }}
                        </option>
                      </select>
                      <button class="btn btn-xs btn-info" (click)="viewContrat(contrat)" title="Voir détails">
                        <i class="fas fa-eye"></i>
                      </button>
                      <button *ngIf="authService.isAdmin()" class="btn btn-xs btn-secondary" (click)="editContrat(contrat)" title="Modifier">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button *ngIf="authService.isAdmin()" class="btn btn-xs btn-danger" (click)="deleteContrat(contrat)" title="Supprimer">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- No Data -->
          <ng-template #noData>
            <div class="text-center py-12 bg-white rounded-2xl shadow">
              <i class="fas fa-folder-open text-5xl text-gray-300 mb-3"></i>
              <p class="text-gray-500">Aucun contrat trouvé</p>
            </div>
          </ng-template>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des contrats...
        </div>
      </div>
  `,
  styles: [`
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
      font-size: 24px;
      font-weight: 600;
      color: #1E2761;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      color: #f97316;
      flex-shrink: 0;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border: 1px solid #1e293b;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-modal {
      padding: 0;
    }

    .contrat-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 700;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #007bff;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    .file-info {
      color: #666;
      font-size: 0.875rem;
      margin-top: 5px;
    }

    .file-info.existing-file {
      color: #059669;
      font-weight: 500;
    }

    .file-info.warning {
      color: #d97706;
      font-weight: 500;
    }

    /* Boutons EXACTEMENT comme l'image */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: #1e293b;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #334155;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    .btn-xs {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: auto;
      width: auto;
    }

    .btn-info {
      background: #3b82f6;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #2563eb;
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #4b5563;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background: #dc2626;
    }

    /* Style pour le select */
    select.line-input {
      appearance: none;
      background: transparent;
      cursor: pointer;
    }

    .form-group:has(select)::after {
      content: '▼';
      position: absolute;
      right: 0;
      bottom: 12px;
      font-size: 12px;
      color: #666;
      pointer-events: none;
    }

    /* Table Styles - Subtils et modernes */
    .table-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      overflow-x: auto;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.08),
        0 2px 8px rgba(0, 0, 0, 0.04);
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    th, td {
      padding: 1rem 1.25rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
      font-size: 0.95rem;
    }

    th {
      white-space: nowrap;
    }

    td {
      white-space: normal;
      word-wrap: break-word;
    }

    /* Specific column widths */
    th:nth-child(1), td:nth-child(1) { min-width: 120px; } /* Numéro Contrat */
    th:nth-child(2), td:nth-child(2) { min-width: 150px; } /* Prestataire */
    th:nth-child(3), td:nth-child(3) { min-width: 100px; } /* Date Début */
    th:nth-child(4), td:nth-child(4) { min-width: 100px; } /* Date Fin */
    th:nth-child(5), td:nth-child(5) { min-width: 100px; } /* Montant */
    th:nth-child(6), td:nth-child(6) { min-width: 80px; }  /* Lot */
     th:nth-child(7), td:nth-child(7) { min-width: 150px; } /* Régions */
    th:nth-child(8), td:nth-child(8) { min-width: 100px; } /* Statut */
    th:nth-child(9), td:nth-child(9) { min-width: 150px; } /* Actions */

    /* Elegant, subtle table headers */
    table thead th {
      background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.95) 100%);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid rgba(226,232,240,0.8);
      box-shadow: inset 0 -1px 0 rgba(0,0,0,0.02);
      backdrop-filter: blur(4px);
    }

    /* Rounded top corners for the header row (applies when table is not stacked) */
    table thead th:first-child { border-top-left-radius: 12px; }
    table thead th:last-child { border-top-right-radius: 12px; }

    /* Make headers subtly sticky so they remain visible when the table body scrolls */
    table thead th {
      position: sticky;
      top: 0;
      z-index: 3;
    }

    /* Apply the same subtle header style to known component-specific tables (higher specificity) */
    .table-container table thead th,
    .prestation-table thead th,
    table thead th {
      background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.98) 100%);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 0.95rem 1rem;
      border-bottom: 1px solid rgba(226,232,240,0.85);
      box-shadow: inset 0 -1px 0 rgba(0,0,0,0.02);
      backdrop-filter: blur(4px);
    }

    /* Ensure rounded corners are applied when table is inside .table-container */
    .table-container table thead th:first-child { border-top-left-radius: 12px; }
    .table-container table thead th:last-child { border-top-right-radius: 12px; }

    /* Stronger override to beat component-scoped table header styles (use sparingly) */
    body .table-container table thead th,
    body .prestation-table thead th,
    body table thead th {
      background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.98) 100%) !important;
      color: #374151 !important;
      font-weight: 700 !important;
      font-size: 0.9rem !important;
      text-transform: uppercase !important;
      letter-spacing: 0.06em !important;
      padding: 1rem 1rem !important;
      border-bottom: 1px solid rgba(226,232,240,0.95) !important;
      box-shadow: inset 0 -1px 0 rgba(0,0,0,0.03) !important;
    }

    /* Accentise les titres des entêtes : couleur primaire et barre d'accent à gauche */
    body .table-container table thead th,
    body .prestation-table thead th,
    body table thead th {
      /* remove left accent bar and rely on generous whitespace for delimitation */
      color: var(--bg-dark) !important;
      padding: 1.1rem 1.6rem !important; /* larger horizontal padding for clear separation */
      text-align: left !important;
    }

    /* Slightly darker hover for header to indicate interactiveness (if sorting will be added later) */
    body .table-container table thead th:hover,
    body .prestation-table thead th:hover,
    body table thead th:hover {
      background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(243,244,246,1) 100%) !important;
    }

    /* Make header titles subtly stand out when inside .table-header container */
    body .table-container .table-header h3 {
      margin: 0; color: #0f172a; font-weight: 700; letter-spacing: 0.02em;
    }

    tr:hover {
      background-color: #f1f5f9;
    }

    /* Permettre le retour à la ligne pour certaines colonnes */
    th:last-child, td:last-child {
      white-space: normal;
      min-width: 140px;
      width: 140px;
    }

    /* Badge Styles */
    .badge {
      display: inline-flex;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-error {
      background-color: #fecaca;
      color: #991b1b;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    /* Utility Classes */
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 0 0.5rem;
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

    .gap-4 {
      gap: 1rem;
    }

    .text-center {
      text-align: center;
    }

    .text-right {
      text-align: right;
    }

    .mb-4 {
      margin-bottom: 1rem;
    }

    .mt-4 {
      margin-top: 1rem;
    }

    .p-4 {
      padding: 1rem;
    }

    .rounded {
      border-radius: var(--radius);
    }

    .shadow {
      box-shadow: var(--shadow);
    }

    /* Loading Spinner */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive Design */
    /* Modal overlay pour formulaires */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      animation: fadeIn 0.3s ease-out;
    }

    .modal-content {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 24px;
      box-shadow: 
        0 25px 80px rgba(0, 0, 0, 0.25),
        0 12px 32px rgba(0, 0, 0, 0.15),
        0 4px 12px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.9),
        inset 0 -1px 0 rgba(0, 0, 0, 0.02);
      max-width: 900px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      position: relative;
    }

    .modal-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent);
      border-radius: 24px 24px 0 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { 
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      to { 
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .form-modal .card {
      margin: 0;
      box-shadow: none;
      border: none;
      background: transparent;
      padding: 2.5rem;
    }

    .form-modal .card:hover {
      transform: none;
    }

    .modal-overlay {
      animation: fadeIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-xs {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      border-radius: 4px;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: auto;
      width: auto;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .action-buttons .btn {
      backdrop-filter: blur(10px);
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .table-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1e293b;
    }

    .contract-count {
      font-size: 0.875rem;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.08),
        0 2px 6px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b);
      border-radius: 12px 12px 0 0;
    }

    .stat-card:hover {
      transform: translateY(-3px) scale(1.01);
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.1),
        0 4px 10px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    /* Specific card themes */
    .total-card::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
    .active-card::before { background: linear-gradient(90deg, #10b981, #059669); }
    .suspended-card::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .amount-card::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

    .stat-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .stat-icon-bg {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* Icon backgrounds with gradients */
    .total-card .stat-icon-bg {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }

    .active-card .stat-icon-bg {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
    }

    .suspended-card .stat-icon-bg {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
    }

    .amount-card .stat-icon-bg {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      box-shadow: 0 4px 8px rgba(139, 92, 246, 0.3);
    }

    .stat-icon {
      width: 24px;
      height: 24px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .stat-icon-shadow {
      position: absolute;
      bottom: -2px;
      left: 50%;
      transform: translateX(-50%);
      width: 36px;
      height: 4px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      filter: blur(4px);
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.15rem;
    }

    .stat-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 0.5rem;
      }

      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }

      .btn {
        padding: 0.625rem 1.25rem;
        font-size: 0.8125rem;
      }

      .modal-overlay {
        padding: 1rem;
      }

      .modal-content {
        border-radius: 20px;
      }

      .stats-overview {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }

    .stat-info h3 {
      font-size: 1.5rem;
    }

    /* Items count styles */
    .items-count {
      font-weight: 600;
      color: #007bff;
      text-align: center;
    }

    .items-count.empty {
      color: #6c757d;
      font-style: italic;
    }
  }
  `]
})
export class ContratListComponent implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  prestataires: any[] = [];
  searchTerm = '';
  loadingList = false;
  statutOptions = Object.values(StatutContrat);

  constructor(
    private contratService: ContratService,
    public authService: AuthService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadContrats();
    this.loadPrestataires();
  }

  loadContrats(): void {
    this.loadingList = true;
    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        console.log('Contrats chargés:', contrats);
        // Filter contracts for current prestataire if user is prestataire
        if (this.authService.isPrestataire()) {
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.contrats = contrats.filter(contrat => contrat.nomPrestataire === currentUser.nom);
          } else {
            this.contrats = [];
          }
        } else {
          this.contrats = contrats;
        }
        this.filteredContrats = this.contrats;
        this.loadingList = false;
        
        // Log pour debug des fichiers
        this.contrats.forEach(contrat => {
          console.log(`Contrat ${contrat.idContrat} - Fichier: ${contrat.fichierContrat}`);
        });
      },
      error: (error) => {
        console.error('Error loading contrats:', error);
        this.loadingList = false;
      }
    });
  }

  loadPrestataires(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Filter only users with role PRESTATAIRE
        this.prestataires = users.filter(user => user.role === 'PRESTATAIRE');
      },
      error: (error: any) => {
        console.error('Error loading prestataires:', error);
      }
    });
  }

  filterContrats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredContrats = [...this.contrats];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredContrats = this.contrats.filter(contrat =>
        (contrat.idContrat || '').toLowerCase().includes(term) ||
        (contrat.nomPrestataire || '').toLowerCase().includes(term) ||
        (contrat.lot || '').toLowerCase().includes(term) ||
        (contrat.ville || '').toLowerCase().includes(term) ||
        (contrat.typeContrat || '').toLowerCase().includes(term) ||
        this.getStatutLabel(contrat.statut).toLowerCase().includes(term)
      );
    }
  }

  openContratForm(): void {
    const dialogRef = this.dialog.open(ContratFormComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '900px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContrats();
      }
    });
  }

  editContrat(contrat: Contrat): void {
    const dialogRef = this.dialog.open(ContratFormComponent, {
      width: '90vw',
      maxWidth: '1200px',
      height: '90vh',
      maxHeight: '900px',
      disableClose: true,
      data: { contrat }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadContrats();
      }
    });
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case StatutContrat.ACTIF:
        return 'Actif';
      case StatutContrat.TERMINE:
        return 'Terminé';
      case StatutContrat.SUSPENDU:
        return 'Suspendu';
      case StatutContrat.EXPIRE:
        return 'Expiré';
      default:
        return statut;
    }
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case StatutContrat.ACTIF:
        return 'badge-success';
      case StatutContrat.TERMINE:
        return 'badge-info';
      case StatutContrat.SUSPENDU:
        return 'badge-warning';
      case StatutContrat.EXPIRE:
        return 'badge-error';
      default:
        return 'badge-info';
    }
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  getFileName(filePath: string | undefined): string {
    if (!filePath) return '';
    // Extract filename from path like "uploads/contrats/filename.pdf"
    return filePath.split('/').pop() || filePath;
  }

  viewContrat(contrat: Contrat): void {
    console.log('View contract:', contrat);
    console.log('Contract ID:', contrat.id);
    console.log('Contract idContrat:', contrat.idContrat);
    console.log('Contract fichierContrat:', contrat.fichierContrat);
    console.log('Contract fichierContrat type:', typeof contrat.fichierContrat);
    console.log('Contract fichierContrat length:', contrat.fichierContrat ? contrat.fichierContrat.length : 'null/undefined');
    console.log('Contract fichierContrat value:', contrat.fichierContrat);

    // Check if contract has an attached file
    if (contrat.fichierContrat && contrat.fichierContrat.trim() !== '' && contrat.fichierContrat !== 'null' && contrat.fichierContrat !== null && contrat.fichierContrat !== undefined) {
      console.log('✅ Fichier détecté, ouverture...');
      // Extract filename from path (remove folder prefix if present)
      const filename = contrat.fichierContrat.includes('/') ? contrat.fichierContrat.split('/').pop() : contrat.fichierContrat;
      // Use the correct file download endpoint
      const viewUrl = `/api/files/download/contrats/${filename}`;
      console.log('URL générée:', viewUrl);

      // Open the file in a new tab/window
      window.open(viewUrl, '_blank');

      this.toastService.show({
        type: 'success',
        title: 'Document ouvert',
        message: `Ouverture du document du contrat ${contrat.idContrat}`
      });
    } else {
      console.log('❌ Aucun fichier détecté');
      // No file attached, show contract details
      this.toastService.show({
        type: 'info',
        title: 'Détails du contrat',
        message: `Contrat ${contrat.idContrat} - ${contrat.nomPrestataire} (Aucun document attaché)`
      });
    }
  }

  async deleteContrat(contrat: Contrat): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer le contrat',
      message: `Êtes-vous sûr de vouloir supprimer le contrat "${contrat.idContrat}" ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      this.contratService.deleteContrat(contrat.id!).subscribe({
        next: () => {
          this.toastService.show({
            type: 'success',
            title: 'Contrat supprimé',
            message: `Le contrat ${contrat.idContrat} a été supprimé avec succès.`
          });
          this.loadContrats();
        },
        error: (error) => {
          console.error('Error deleting contrat:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de supprimer le contrat. Veuillez réessayer.'
          });
        }
      });
    }
  }

  async changeStatut(contrat: Contrat, event: Event): Promise<void> {
    const target = event.target as HTMLSelectElement;
    const newStatut = target.value as StatutContrat;
    if (newStatut === contrat.statut) return; // No change

    const confirmed = await this.confirmationService.show({
      title: 'Changer le statut',
      message: `Êtes-vous sûr de vouloir changer le statut du contrat "${contrat.idContrat}" de "${this.getStatutLabel(contrat.statut)}" à "${this.getStatutLabel(newStatut)}" ?`,
      confirmText: 'Confirmer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.contratService.updateContratStatut(contrat.id!, newStatut).subscribe({
        next: (updatedContrat) => {
          // Update the contrat in the list
          const index = this.contrats.findIndex(c => c.id === updatedContrat.id);
          if (index !== -1) {
            this.contrats[index] = updatedContrat;
            this.filterContrats();
          }
          this.toastService.show({
            type: 'success',
            title: 'Statut mis à jour',
            message: `Le statut du contrat ${contrat.idContrat} a été changé avec succès.`
          });
        },
        error: (error) => {
          console.error('Error updating contrat status:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de changer le statut du contrat. Veuillez réessayer.'
          });
        }
      });
    } else {
      // Reset the select to the original value
      target.value = contrat.statut;
    }
  }

  getContratsByStatus(status: string): Contrat[] {
    return this.filteredContrats.filter(contrat => contrat.statut === status);
  }

  getTotalMontant(): number {
    return this.filteredContrats.reduce((total, contrat) => total + (contrat.montant || 0), 0);
  }

}
