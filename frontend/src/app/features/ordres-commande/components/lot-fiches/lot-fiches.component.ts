import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { FichePrestation } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-lot-fiches',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <button class="btn btn-lg btn-back-sidebar" (click)="goBack()">
          <i class="bi bi-arrow-left-circle me-2"></i>
          Retour aux lots
        </button>
        <div class="header-info">
          <h1>Trimestre {{ selectedTrimestre }} -  {{ selectedLot }}</h1>
          <p class="header-subtitle" *ngIf="lotInfo.villes && lotInfo.villes.length > 0">📍 {{ lotInfo.villes.join(', ') }}</p>
          <p class="header-subtitle" *ngIf="lotInfo.regions && lotInfo.regions.length > 0">{{ lotInfo.regions.join(', ') }}</p>
          <p class="header-subtitle" *ngIf="!lotInfo.villes || lotInfo.villes.length === 0">{{ lotInfo.description }}</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-success btn-lg btn-bootstrap" (click)="generateFicheGlobale()">
            <i class="bi bi-file-earmark-text me-2"></i>
            Générer Ordre de commande
          </button>
          <button class="btn btn-primary btn-lg btn-bootstrap" (click)="generateFicheParPrestataire()">
            <i class="bi bi-people me-2"></i>
            Générer par Prestataire
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card stat-card-total">
          <div class="stat-icon-wrapper bg-primary-soft">
            <i class="bi bi-clipboard-data stat-icon"></i>
          </div>
          <div class="stat-info">
            <span class="stat-badge badge bg-light text-dark border">{{ fiches.length }}</span>
            <div class="stat-label">Total Fiches</div>
          </div>
        </div>
        <div class="stat-card stat-card-validated">
          <div class="stat-icon-wrapper bg-success-soft">
            <i class="bi bi-check-circle-fill stat-icon text-success"></i>
          </div>
          <div class="stat-info">
            <span class="stat-badge badge bg-light text-dark border">{{ getCompletedCount() }}</span>
            <div class="stat-label">Validées</div>
          </div>
        </div>
        <div class="stat-card stat-card-rejected">
          <div class="stat-icon-wrapper bg-danger-soft">
            <i class="bi bi-x-circle-fill stat-icon text-danger"></i>
          </div>
          <div class="stat-info">
            <span class="stat-badge badge bg-light text-dark border">{{ getPendingCount() }}</span>
            <div class="stat-label">Rejetées</div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-12">
        <div class="loading-spinner"></div>
        <p>Chargement des fiches...</p>
      </div>

      <!-- Fiches Table -->
      <div *ngIf="!loading" class="table-container table-bootstrap">
        <table class="table table-hover fiches-table">
          <thead class="table-dark">
            <tr>
              <th>N° Fiche</th>
              <th>Prestataire</th>
              <th>Structure</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let fiche of fiches" class="fiche-row">
              <td class="fiche-id fw-bold text-primary">{{ fiche.numeroFiche }}</td>
              <td class="prestataire">{{ (fiche.nomPrestataire || '').trim() }}</td>
              <td class="structure">{{ fiche.nomStructure || fiche.nomItem }}</td>
              <td class="date text-muted">{{ formatDate(fiche.dateRealisation) }}</td>
              <td class="status">
                <span class="badge" [class]="getStatusBootstrapClass(fiche.statut)">
                  {{ getStatusLabel(fiche.statut) }}
                </span>
              </td>
               <td class="actions">
                <button class="btn btn-sm btn-outline-info btn-action-bootstrap me-1" (click)="viewFiche(fiche)" title="Voir">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-warning btn-action-bootstrap me-1" (click)="printFiche(fiche)" title="Imprimer">
                  <i class="bi bi-printer"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger btn-action-bootstrap me-1" (click)="downloadFichePdf(fiche)" title="Télécharger PDF">
                  <i class="bi bi-file-earmark-pdf"></i>
                </button>
                <button class="btn btn-sm btn-outline-success btn-action-bootstrap me-1" (click)="validerFiche(fiche)" title="Valider" *ngIf="fiche.statut !== 'VALIDE'">
                  <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary btn-action-bootstrap me-1" (click)="rejeterFiche(fiche)" title="Rejeter" *ngIf="fiche.statut !== 'REJETE'">
                  <i class="bi bi-x-lg"></i>
                </button>
                <button class="btn btn-sm btn-outline-dark btn-action-bootstrap" (click)="deleteFiche(fiche)" title="Supprimer">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Fiche Details Modal -->
      <div *ngIf="showFicheModal" class="modal-overlay" (click)="closeFicheModal()">
  <div class="modal-content" [ngClass]="{ 'fiche-modal': true, 'pdf-modal': !!selectedFichePdfUrl }" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Détails de la Fiche de Prestation</h2>
            <button class="btn-close" (click)="closeFicheModal()">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="modal-body">
            <!-- If a PDF URL is available, show it in an iframe for same-page viewing -->
            <div *ngIf="selectedFichePdfUrl; else detailsTemplate" style="height:100%; width:100%;">
              <iframe [src]="selectedFichePdfUrl" style="border:0; width:100%; height:100%;"></iframe>
            </div>

            <ng-template #detailsTemplate>
              <div *ngIf="selectedFiche" class="fiche-details">
                <div class="detail-row">
                  <label>N° Fiche:</label>
                  <span>{{ selectedFiche.numeroFiche }}</span>
                </div>
                <div class="detail-row">
                  <label>Prestataire:</label>
                  <span>{{ (selectedFiche.nomPrestataire || '').trim() }}</span>
                </div>
                <div class="detail-row">
                  <label>Structure:</label>
                  <span>{{ selectedFiche.nomStructure || selectedFiche.nomItem }}</span>
                </div>
                <div class="detail-row">
                  <label>Date de réalisation:</label>
                  <span>{{ formatDate(selectedFiche.dateRealisation) }}</span>
                </div>
                <div class="detail-row">
                  <label>Statut:</label>
                  <span class="status-badge" [class]="getStatusClass(selectedFiche.statut)">
                    {{ getStatusLabel(selectedFiche.statut) }}
                  </span>
                </div>
                <div class="detail-row" *ngIf="selectedFiche.quantite">
                  <label>Quantité:</label>
                  <span>{{ selectedFiche.quantite }}</span>
                </div>
                <div class="detail-row" *ngIf="selectedFiche.commentaire">
                  <label>Commentaire:</label>
                  <span>{{ selectedFiche.commentaire }}</span>
                </div>
              </div>
            </ng-template>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeFicheModal()">Fermer</button>
            <button class="btn btn-primary" (click)="printFiche(selectedFiche)">
              <mat-icon>print</mat-icon>
              Imprimer
            </button>
          </div>
        </div>
      </div>


    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 40px;
      margin-left: -20px;
      margin-right: -20px;
      margin-top: -20px;
      padding: 24px 30px;
      background: #ffffff;
      border-bottom: 2px solid #dee2e6;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .header-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
      flex-shrink: 0;
    }

    /* Bouton retour avec couleur sidebar (rgb(28, 82, 118)) */
    .btn-back-sidebar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 0.5rem 1rem;
      font-weight: 600;
      font-size: 0.875rem;
      border: 2px solid rgb(28, 82, 118);
      border-radius: 0.5rem;
      background-color: rgb(28, 82, 118);
      color: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }

    .btn-back-sidebar:hover {
      transform: translateY(-2px);
      background-color: rgb(20, 60, 90);
      border-color: rgb(20, 60, 90);
      box-shadow: 0 4px 12px rgba(28, 82, 118, 0.35);
    }

    /* Boutons Bootstrap améliorés */
    .btn-bootstrap {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn-bootstrap:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.15);
    }

    .btn-bootstrap.btn-success:hover {
      box-shadow: 0 6px 12px rgba(40, 167, 69, 0.3);
    }

    .btn-bootstrap.btn-primary:hover {
      box-shadow: 0 6px 12px rgba(0, 123, 255, 0.3);
    }

    /* Boutons d'action Bootstrap - taille augmentée */
    .btn-action-bootstrap {
      width: 42px;
      height: 42px;
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .btn-action-bootstrap:hover {
      transform: scale(1.1);
    }

    .btn-action-bootstrap i {
      font-size: 18px;
    }

    .header-info h1 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0 0 5px 0;
    }

    .header-subtitle {
      color: #666;
      margin: 0;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      margin-top: 10px;
    }

    /* Cartes de statistiques avec bordures fines colorées */
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    /* Bordures fines colorées selon le type */
    .stat-card-total {
      border: 2px solid #0d6efd;
    }

    .stat-card-validated {
      border: 2px solid #198754;
    }

    .stat-card-rejected {
      border: 2px solid #dc3545;
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }

    /* Icônes avec fond coloré subtil */
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .bg-primary-soft {
      background: rgba(13, 110, 253, 0.1);
    }

    .bg-success-soft {
      background: rgba(25, 135, 84, 0.1);
    }

    .bg-danger-soft {
      background: rgba(220, 53, 69, 0.1);
    }

    .stat-icon {
      font-size: 24px;
    }

    /* Badge pour la valeur */
    .stat-badge {
      font-size: 20px;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
    }

    .stat-label {
      font-size: 13px;
      color: #6c757d;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    /* Tableau Bootstrap avec ombre élégante */
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
      border: 1px solid #dee2e6;
    }

    .table-bootstrap {
      margin-bottom: 0;
    }

    .fiches-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    .fiches-table thead th {
      background: linear-gradient(180deg, #343a40 0%, #212529 100%);
      color: white;
      padding: 16px 12px;
      font-weight: 600;
      font-size: 14px;
      border: none;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fiches-table tbody td {
      padding: 14px 12px;
      vertical-align: middle;
      border-bottom: 1px solid #e9ecef;
    }

    .fiches-table tbody tr {
      transition: background-color 0.2s ease;
    }

    .fiches-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .fiches-table tbody tr:last-child td {
      border-bottom: none;
    }

    .fiche-id {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 14px;
    }

    .prestataire {
      font-weight: 500;
      color: #495057;
    }

    .structure {
      color: #6c757d;
    }

    .item {
      max-width: 250px;
      min-width: 150px;
      word-wrap: break-word;
      word-break: break-word;
      white-space: normal;
      line-height: 1.4;
    }

    .date {
      font-size: 14px;
      white-space: nowrap;
      min-width: 100px;
    }

    .quantity {
      text-align: center;
      font-weight: 500;
    }

    .amount {
      text-align: right;
      font-weight: 600;
      color: #28a745;
    }

    .actions {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .fiche-modal {
      max-width: 500px;
    }

    /* When showing PDF, expand modal to near-fullscreen for better viewing */
    .pdf-modal {
      max-width: none !important;
      width: auto !important;
      height: auto !important;
      max-height: none !important;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow: hidden;
    }

    .pdf-modal .modal-header {
      flex-shrink: 0;
    }

    .pdf-modal .modal-body {
      flex: 1;
      padding: 0 !important;
      overflow: auto;
      display: flex;
      flex-direction: column;
      background: #525659;
    }

    .pdf-modal .modal-body > div {
      flex: 1;
      height: auto;
      min-height: 600px;
      margin: 0;
      padding: 0;
      background: #525659;
    }

    .pdf-modal iframe {
      height: 800px !important;
      width: 100% !important;
      min-width: 800px;
      border: 0;
    }

    .pdf-modal .modal-footer {
      flex-shrink: 0;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .btn-close:hover {
      background: #f8f9fa;
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .fiche-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .detail-row label {
      font-weight: 600;
      color: #555;
      min-width: 140px;
      flex-shrink: 0;
    }

    .detail-row span {
      color: #333;
      flex: 1;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px;
      border-top: 1px solid #e9ecef;
    }

    /* Form Styles */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-weight: 600;
      color: #555;
      font-size: 14px;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 10px 12px;
      border: 2px solid #e9ecef;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    .form-group input[readonly] {
      background: #f8f9fa;
      cursor: not-allowed;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }

      .header-actions {
        margin-left: 0;
        width: 100%;
        flex-direction: column;
      }

      .btn-generate-global, .btn-generate-prestataire {
        width: 100%;
        justify-content: center;
      }

      .fiches-table {
        font-size: 14px;
      }

      .fiches-table th,
      .fiches-table td {
        padding: 8px 6px;
      }

      .modal-content {
        width: 95%;
        margin: 20px;
      }

      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .detail-row label {
        min-width: auto;
        font-size: 14px;
      }
    }
  `]
})
export class LotFichesComponent implements OnInit {
  selectedTrimestre: number = 1;
  selectedLot: string = '';

  lotInfo = {
    id: '',
    nom: '',
    prestataires: [] as string[],
    nombrePrestataires: 0,
    description: 'Maintenance préventive des équipements informatiques',
    villes: [] as string[],
    regions: [] as string[]
  };

  fiches: FichePrestation[] = [];
  loading = false;
  showFicheModal = false;
  selectedFiche: FichePrestation | null = null;
  // URL blob du PDF affiché dans la modal (si présent)
  selectedFichePdfUrl: SafeResourceUrl | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fichePrestationService: FichePrestationService,
    private prestationService: PrestationService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedTrimestre = +params['trimestre'] || 1;
      this.selectedLot = params['lot'] || 'LOT01';
      this.loadLotInfo();
      this.loadFiches();
    });
  }

  loadFiches(): void {
    this.loading = true;

    this.fichePrestationService.getFichesByLot(this.selectedTrimestre, this.selectedLot)
      .subscribe({
        next: (response: any) => {
          this.lotInfo = {
            ...this.lotInfo,
            ...response.lotInfo
          };
          this.fiches = response.fiches || [];
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des fiches:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de charger les fiches de prestation'
          });
          this.loading = false;
        }
      });
  }

  loadLotInfo(): void {
    // The description will be set from the API response
    // For now, use a generic description
    this.lotInfo.description = `Lot ${this.selectedLot} - Maintenance et support technique`;
  }

  goBack(): void {
    this.router.navigate(['/ordres-commande/trimestre', this.selectedTrimestre]);
  }

  getCompletedCount(): number {
    return this.fiches.filter(f => f.statut === 'VALIDE').length;
  }

  getPendingCount(): number {
    return this.fiches.filter(f => f.statut === 'REJETE').length;
  }

  getTotalAmount(): number {
    return this.fiches.reduce((total, fiche) => {
      return total + (fiche.quantite || 0);
    }, 0);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getStatusClass(statut: any): string {
    switch (statut) {
      case 'VALIDE':
        return 'status-validated';
      case 'REJETE':
        return 'status-rejected';
      case 'EN_ATTENTE':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  }

  getStatusBootstrapClass(statut: any): string {
    switch (statut) {
      case 'VALIDE':
        return 'bg-success';
      case 'REJETE':
        return 'bg-danger';
      case 'EN_ATTENTE':
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(statut: any): string {
    switch (statut) {
      case 'VALIDE':
        return 'Validé';
      case 'REJETE':
        return 'Rejeté';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut;
    }
  }

  viewFiche(fiche: any): void {
    // If prestation id exists, try to load and display the PDF directly in the modal
    if (fiche && fiche.idPrestation) {
      const prestationId = parseInt(fiche.idPrestation);
      if (!isNaN(prestationId)) {
        this.prestationService.exportPrestationPdf(prestationId).subscribe({
          next: (blob) => {
            // Cleanup previous URL if any
            if (this.selectedFichePdfUrl) {
              try { 
                const url = (this.selectedFichePdfUrl as any).changingThisBreaksApplicationSecurity;
                if (url) window.URL.revokeObjectURL(url); 
              } catch(e) {}
            }
            const url = window.URL.createObjectURL(blob);
            this.selectedFichePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
            this.showFicheModal = true;
            // Keep selectedFiche for meta info if needed
            this.selectedFiche = fiche;
          },
          error: (error) => {
            console.error('Erreur lors du chargement du PDF de la fiche:', error);
            this.toastService.show({ type: 'error', title: 'Erreur', message: 'Impossible de charger le PDF de la fiche' });
            // Fallback: load fiche details instead
            this.loadFicheDetailsFallback(fiche);
          }
        });
        return;
      }
    }

    // Fallback: load full fiche details and show modal
    this.loadFicheDetailsFallback(fiche);
  }

  private loadFicheDetailsFallback(fiche: any) {
    if (!fiche.id) {
      this.toastService.show({ type: 'error', title: 'Erreur', message: "Impossible d'afficher cette fiche : ID manquant" });
      return;
    }

    this.fichePrestationService.getFicheById(fiche.id).subscribe({
      next: (fullFiche: FichePrestation) => {
        this.selectedFiche = fullFiche;
        this.selectedFichePdfUrl = null;
        this.showFicheModal = true;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails de la fiche:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Impossible de charger les détails de la fiche' });
      }
    });
  }

  closeFicheModal(): void {
    this.showFicheModal = false;
    this.selectedFiche = null;
    if (this.selectedFichePdfUrl) {
      try { 
        const url = (this.selectedFichePdfUrl as any).changingThisBreaksApplicationSecurity;
        if (url) window.URL.revokeObjectURL(url); 
      } catch(e) {}
      this.selectedFichePdfUrl = null;
    }
  }



  downloadFichePdf(fiche: any): void {
    console.log('DEBUG downloadFichePdf - fiche object:', fiche);
    console.log('DEBUG downloadFichePdf - fiche.idPrestation:', fiche.idPrestation);

    // Use the prestation ID to download the official FICHE DE PRESTATION PDF
    if (!fiche.idPrestation) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de télécharger le PDF : ID de prestation manquant'
      });
      return;
    }

    // Parse the prestation ID (it might be a string)
    const prestationId = parseInt(fiche.idPrestation);
    if (isNaN(prestationId)) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation invalide'
      });
      return;
    }

    this.downloadPrestationPdf(prestationId, fiche.idPrestation);
  }

  private downloadPrestationPdf(prestationId: number, idPrestation: string): void {
    // Generate official FICHE DE PRESTATION PDF
    this.prestationService.exportPrestationPdf(prestationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Fiche_Prestation_${idPrestation}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Fiche de prestation téléchargée avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du PDF:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de télécharger la fiche de prestation'
        });
      }
    });
  }

  printFiche(fiche: any): void {
    console.log('DEBUG printFiche - fiche.idPrestation:', fiche.idPrestation);

    // Use the prestation ID to download the official FICHE DE PRESTATION PDF for printing
    if (!fiche.idPrestation) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible d\'imprimer cette fiche : ID de prestation manquant'
      });
      return;
    }

    // Parse the prestation ID (it might be a string)
    const prestationId = parseInt(fiche.idPrestation);
    if (isNaN(prestationId)) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation invalide'
      });
      return;
    }

    // Generate PDF and open a print window (no download)
    this.prestationService.exportPrestationPdf(prestationId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);

        // Open a new window and embed the PDF in an iframe, then trigger print
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          // Fallback to download if popup blocked
          const link = document.createElement('a');
          link.href = url;
          link.download = `Fiche_Prestation_${fiche.idPrestation}_impression.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.toastService.show({ type: 'warning', title: 'Impression', message: 'Popup bloquée, le PDF a été téléchargé.' });
          return;
        }

        printWindow.document.write(`<!doctype html><html><head><title>Impression - Fiche ${fiche.idPrestation}</title></head><body style="margin:0"><iframe id="pdfFrame" src="${url}" style="border:0; width:100%; height:100vh;"></iframe></body></html>`);

        // Wait a bit for document to load, then try to trigger print
        setTimeout(() => {
          try {
            printWindow.focus();
            printWindow.print();
          } catch (e) {
            console.error('Erreur lors du print automatique:', e);
          }
        }, 800);

        // Cleanup URL after some time
        setTimeout(() => {
          try { window.URL.revokeObjectURL(url); } catch(e) {}
        }, 30000);

        this.toastService.show({ type: 'success', title: 'Succès', message: 'Fenêtre d\'impression ouverte' });
      },
      error: (error) => {
        console.error('Erreur lors de la préparation du PDF pour impression:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Impossible de préparer la fiche pour impression' });
      }
    });
  }

  async deleteFiche(fiche: any): Promise<void> {
    if (!fiche.id) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer cette fiche : ID manquant'
      });
      return;
    }

    // Show confirmation dialog using custom confirmation service
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la fiche',
      message: `Êtes-vous sûr de vouloir supprimer la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    this.fichePrestationService.deleteFiche(fiche.id).subscribe({
      next: () => {
        // Remove fiche from local list
        this.fiches = this.fiches.filter(f => f.id !== fiche.id);

        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Fiche supprimée avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la fiche:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de supprimer la fiche'
        });
      }
    });
  }

  async validerFiche(fiche: any): Promise<void> {
    if (!fiche.id) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de valider cette fiche : ID manquant'
      });
      return;
    }

    // Show confirmation dialog using custom confirmation service
    const confirmed = await this.confirmationService.show({
      title: 'Valider la fiche',
      message: `Êtes-vous sûr de vouloir valider la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Valider',
      cancelText: 'Annuler',
      type: 'info'
    });

    if (!confirmed) {
      return;
    }

    this.fichePrestationService.validerFiche(fiche.id).subscribe({
      next: (updatedFiche) => {
        // Update fiche in local list
        const index = this.fiches.findIndex(f => f.id === fiche.id);
        if (index !== -1) {
          this.fiches[index] = updatedFiche;
        }

        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Fiche validée avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors de la validation de la fiche:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de valider la fiche'
        });
      }
    });
  }

  async rejeterFiche(fiche: any): Promise<void> {
    if (!fiche.id) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de rejeter cette fiche : ID manquant'
      });
      return;
    }

    // Show confirmation dialog using custom confirmation service
    const confirmed = await this.confirmationService.show({
      title: 'Rejeter la fiche',
      message: `Êtes-vous sûr de vouloir rejeter la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler',
      type: 'warning'
    });

    if (!confirmed) {
      return;
    }

    this.fichePrestationService.rejeterFiche(fiche.id).subscribe({
      next: (updatedFiche) => {
        // Update fiche in local list
        const index = this.fiches.findIndex(f => f.id === fiche.id);
        if (index !== -1) {
          this.fiches[index] = updatedFiche;
        }

        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Fiche rejetée avec succès'
        });
      },
      error: (error) => {
        console.error('Erreur lors du rejet de la fiche:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de rejeter la fiche'
        });
      }
    });
  }

  generateFicheGlobale(): void {
    const currentYear = new Date().getFullYear();
    const lotString = this.selectedLot;

    this.fichePrestationService.downloadGlobalServiceSheetPdf(lotString, currentYear, this.selectedTrimestre)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Fiche_Globale_T${this.selectedTrimestre}_${lotString}_${currentYear}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);

          this.toastService.show({
            type: 'success',
            title: 'Succès',
            message: 'Fiche globale générée avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la génération de la fiche globale:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de générer la fiche globale'
          });
        }
      });
  }

  generateFicheParPrestataire(): void {
    const currentYear = new Date().getFullYear();
    const lotString = this.selectedLot;
    
    // Get unique prestataires from fiches
    const prestataires = [...new Set(this.fiches.map(f => f.nomPrestataire))];
    
    if (prestataires.length === 0) {
      this.toastService.show({
        type: 'warning',
        title: 'Aucun prestataire',
        message: 'Aucun prestataire trouvé pour ce lot'
      });
      return;
    }

    // Generate a PDF for each prestataire
    prestataires.forEach(prestataire => {
      this.fichePrestationService.downloadPrestataireServiceSheetPdf(lotString, currentYear, this.selectedTrimestre, prestataire)
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Fiche_${prestataire}_T${this.selectedTrimestre}_${lotString}_${currentYear}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error(`Erreur lors de la génération de la fiche pour ${prestataire}:`, error);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: `Impossible de générer la fiche pour ${prestataire}`
            });
          }
        });
    });

    this.toastService.show({
      type: 'success',
      title: 'Génération en cours',
      message: `Génération des fiches pour ${prestataires.length} prestataire(s)`
    });
  }


}
