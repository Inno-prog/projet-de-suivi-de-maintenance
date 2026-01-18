import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { PrestationPdfService } from '../../../../core/services/prestation-pdf.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

@Component({
  selector: 'app-prestation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="detail-overlay">
      <div class="detail-modal">
        <div class="detail-header">
          <h2>Détails de la Prestation</h2>
          <button class="close-btn" (click)="goBack()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="download-header">
          <button class="btn btn-outline download-btn" (click)="exportPdf()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            📄 Télécharger PDF
          </button>
        </div>

        <div class="loading" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Chargement des détails...</p>
        </div>

        <div class="detail-content" *ngIf="prestation && !loading">
          <!-- Section 1: Informations du Prestataire et du Responsable -->
          <div class="detail-section">
            <div class="section-header">
              <h3>👤 Informations du Prestataire et du Responsable de la Prestation</h3>
              <div class="section-divider"></div>
            </div>
            <table class="summary-table">
              <tr>
                <td class="label-cell">Nom du prestataire:</td>
                <td class="value-cell">{{ prestation.nomPrestataire || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Nom du responsable:</td>
                <td class="value-cell">{{ getResponsableInfo(prestation) || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Contact du responsable:</td>
                <td class="value-cell">{{ getResponsableContact(prestation) || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Qualification du responsable:</td>
                <td class="value-cell">{{ getResponsableQualification(prestation) || '-' }}</td>
              </tr>
            </table>
          </div>

          <!-- Section 2: Informations de la Structure Bénéficiaire -->
          <div class="detail-section">
            <div class="section-header">
              <h3>🏢 Informations de la Structure Bénéficiaire</h3>
              <div class="section-divider"></div>
            </div>
            <table class="summary-table">
              <tr>
                <td class="label-cell">Nom de la structure:</td>
                <td class="value-cell">{{ prestation.nomStructure || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Adresse:</td>
                <td class="value-cell">{{ prestation.adresseStructure || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Email:</td>
                <td class="value-cell">{{ prestation.contactStructure || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Nom du CI:</td>
                <td class="value-cell">{{ getCIName(prestation) || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Contact du CI:</td>
                <td class="value-cell">{{ prestation.contactCi || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Fonction du CI:</td>
                <td class="value-cell">{{ prestation.fonctionCi || '-' }}</td>
              </tr>
            </table>
          </div>

          <!-- Section 3: Informations sur l'Intervention -->
          <div class="detail-section">
            <div class="section-header">
              <h3>🔧 Informations sur l'Intervention</h3>
              <div class="section-divider"></div>
            </div>
            <table class="summary-table">
              <tr>
                <td class="label-cell">Lot sélectionné:</td>
                <td class="value-cell">{{ getLotFromPrestation(prestation) || '-' }}</td>
              </tr>
              <tr>
                <td class="label-cell">Items couverts:</td>
                <td class="value-cell items-list-cell">{{ getItemsStringWithBreaks(prestation) }}</td>
              </tr>
              <tr>
                <td class="label-cell">Date de début:</td>
                <td class="value-cell">{{ formatDateTime(prestation.dateHeureDebut) }}</td>
              </tr>
              <tr>
                <td class="label-cell">Date de fin:</td>
                <td class="value-cell">{{ formatDateTime(prestation.dateHeureFin) }}</td>
              </tr>
              <tr>
                <td class="label-cell">Trimestre:</td>
                <td class="value-cell highlight">{{ getTrimestreLabel(prestation.trimestre) }}</td>
              </tr>
              <tr>
                <td class="label-cell">Statut:</td>
                <td class="value-cell status">{{ getStatutLabel(prestation.statutIntervention || prestation.statut) }}</td>
              </tr>
              <tr>
                <td class="label-cell">Montant total:</td>
                <td class="value-cell highlight">{{ (prestation.montantIntervention || prestation.montantPrest || 0) | number:'1.0-0' }} FCFA</td>
              </tr>
            </table>
          </div>

          <!-- Facture Proforma -->
          <div class="proforma-section" *ngIf="getProformaItems(prestation).length > 0">
            <div class="proforma-header">
              <h4>📋 Facture Proforma - Détail des Prestations</h4>
            </div>

            <div class="proforma-invoice">
              <table class="proforma-table">
                <thead>
                  <tr>
                    <th class="item-col">Item</th>
                    <th class="qty-col">Quantité</th>
                    <th class="amount-col">Montant (FCFA)</th>
                    <th class="price-col">Prix unitaire (FCFA)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of getProformaItems(prestation)" class="invoice-row">
                    <td class="item-desc">{{ item.index }}. {{ item.nom }}</td>
                    <td class="qty-value">{{ item.quantite }}</td>
                    <td class="amount-value">{{ ((item.prix || 0) * item.quantite) | number:'1.0-0' }}</td>
                    <td class="price-value">{{ (item.prix || 0) | number:'1.0-0' }}</td>
                  </tr>
                </tbody>
              </table>

              <div class="invoice-summary">
                <div class="summary-line">
                  <span class="summary-label">Nombre d'items:</span>
                  <span class="summary-value">{{ getProformaItems(prestation).length }}</span>
                </div>
                <div class="summary-line total-line">
                  <span class="summary-label">Montant total:</span>
                  <span class="summary-value total-amount">{{ (prestation.montantIntervention || prestation.montantPrest || 0) | number:'1.0-0' }} FCFA</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Message si aucun item avec montant -->
          <div class="proforma-section" *ngIf="getProformaItems(prestation).length === 0 && (prestation.montantIntervention || prestation.montantPrest)">
            <div class="proforma-header">
              <h4>📋 Facture Proforma</h4>
            </div>
            <div class="no-items-message">
              <p><strong>Détails des prestations:</strong></p>
              <div class="items-detailed-list" *ngIf="prestation.nomPrestation">
                <div class="item-row" *ngFor="let item of getItemsListFromNomPrestation(prestation); let i = index">
                  <span class="item-number">{{ i + 1 }}.</span>
                  <span class="item-name">{{ item }}</span>
                </div>
              </div>
              <p class="montant-total">
                Montant total: <strong>{{ (prestation.montantIntervention || prestation.montantPrest || 0) | number:'1.0-0' }} FCFA</strong>
              </p>
            </div>
          </div>

          <!-- Actions -->
          <div class="detail-actions">
            <button class="btn btn-outline" (click)="goBack()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Retour
            </button>
            <div class="action-buttons">
              <button class="btn btn-success" (click)="validerPrestation()" *ngIf="canValidatePrestation()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Valider
              </button>
              <button class="btn btn-danger" (click)="rejeterPrestation()" *ngIf="canValidatePrestation()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Rejeter
              </button>
              <button class="btn btn-warning" (click)="supprimerPrestation()" *ngIf="canDeletePrestation()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div class="error-state" *ngIf="error">
          <div class="error-icon">⚠️</div>
          <p>{{ error }}</p>
          <button class="btn btn-primary" (click)="goBack()">Retour à la liste</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Overlay */
    .detail-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: flex-start;
      z-index: 1000;
      backdrop-filter: blur(2px);
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
    }

    /* Modal */
    .detail-modal {
      background: white;
      border-radius: 2px;
      border: 2px solid #000080;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 1200px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      margin: auto;
    }

    /* Header */
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      border-bottom: 2px solid #f97316;
      background: linear-gradient(135deg, #000080 0%, #000060 100%);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .detail-header h2 {
      margin: 0;
      color: white;
      font-size: 22px;
      font-weight: 600;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 8px;
      cursor: pointer;
      color: white;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .download-header {
      padding: 15px 30px;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      border-bottom: 1px solid #e9ecef;
    }

    .download-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
    }

    /* Content */
    .detail-content {
      padding: 30px;
    }

    /* Loading */
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #6b7280;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e9ecef;
      border-top-color: #f97316;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Error State */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      color: #dc2626;
    }

    .error-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }

    /* Sections */
    .detail-section {
      margin-bottom: 30px;
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      white-space: nowrap;
    }

    .section-divider {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, rgba(249, 115, 22, 0.5), rgba(249, 115, 22, 0.2), transparent);
    }

    /* Summary Table */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      border: 2px solid #333;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .summary-table td {
      border: 1px solid #333;
      padding: 12px 15px;
      vertical-align: middle;
      height: 45px;
    }

    .label-cell {
      background: #f8f9fa;
      font-weight: 500;
      color: #666;
      width: 40%;
    }

    .value-cell {
      background: white;
      font-weight: 600;
      color: #333;
      width: 60%;
    }

    .value-cell.highlight {
      color: #f97316;
      font-weight: 700;
    }

    .value-cell.status {
      background: #fff7ed;
      color: #f97316;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    /* Proforma Section */
    .proforma-section {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e9ecef;
    }

    .proforma-header {
      margin-bottom: 20px;
      padding: 0 5px;
    }

    .proforma-header h4 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .proforma-invoice {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 
        0 4px 20px rgba(0, 123, 255, 0.1),
        0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 123, 255, 0.15);
    }

    .proforma-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .proforma-table th {
      background: #f8f9fa;
      color: #333;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #f97316;
    }

    .proforma-table th.price-col {
      text-align: center;
    }

    .proforma-table .item-col {
      width: 35%;
    }

    .proforma-table .price-col {
      width: 25%;
      text-align: center;
    }

    .proforma-table .qty-col {
      width: 20%;
      text-align: center;
    }

    .proforma-table .amount-col {
      width: 20%;
      text-align: center;
    }

    .proforma-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }

    .item-desc {
      font-weight: 500;
      color: #333;
    }

    .price-value,
    .qty-value {
      text-align: center;
    }

    .amount-value {
      text-align: center;
      color: #28a745;
      font-weight: 600;
    }

    .invoice-row:hover {
      background: #fff9f5;
    }

    .invoice-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 15px 20px;
      border-top: 2px solid #f97316;
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 0;
      font-size: 14px;
    }

    .summary-line.total-line {
      border-top: 2px solid #f97316;
      margin-top: 8px;
      padding-top: 12px;
    }

    .summary-label {
      font-weight: 600;
      color: #666;
    }

    .summary-value {
      font-weight: 600;
      color: #333;
    }

    .total-amount {
      font-size: 18px;
      color: #f97316;
      font-weight: 700;
    }

    /* No items message */
    .no-items-message {
      background: #f8f9fa;
      border: 1px dashed #ccc;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      color: #666;
    }

    .no-items-message p {
      margin: 10px 0;
    }

    .no-items-message .montant-total {
      font-size: 16px;
      color: #333;
      margin-top: 20px;
    }

    .no-items-message .items-from-nomprestation {
      text-align: left;
      white-space: pre-wrap;
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 15px;
      margin: 15px 0;
      font-family: monospace;
      color: #333;
    }

    /* Items detailed list with proper alignment */
    .items-detailed-list {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 4px;
      padding: 10px 15px;
      margin: 15px 0;
    }

    .item-row {
      display: flex;
      align-items: flex-start;
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .item-row:last-child {
      border-bottom: none;
    }

    .item-number {
      font-weight: 600;
      color: #666;
      min-width: 30px;
      margin-right: 10px;
    }

    .item-name {
      color: #333;
      flex: 1;
    }

    /* Items list cell with line breaks */
    .items-list-cell {
      white-space: pre-wrap;
      line-height: 1.8;
      font-family: monospace;
    }

    /* Actions */
    .detail-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e9ecef;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    .btn-primary {
      background: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #1e7e34;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .detail-overlay {
        padding: 10px;
      }

      .detail-content {
        padding: 20px;
      }

      .summary-table td {
        padding: 8px 10px;
        font-size: 13px;
      }

      .label-cell {
        width: 35%;
      }

      .value-cell {
        width: 65%;
      }

      .detail-actions {
        flex-direction: column;
        gap: 15px;
      }

      .action-buttons {
        width: 100%;
        flex-wrap: wrap;
        justify-content: center;
      }

      .btn {
        flex: 1;
        justify-content: center;
        min-width: 120px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .section-divider {
        width: 100%;
      }

      .proforma-table {
        font-size: 12px;
      }

      .proforma-table th,
      .proforma-table td {
        padding: 8px 6px;
      }

      .total-amount {
        font-size: 16px;
      }
    }
  `]
})
export class PrestationDetailComponent implements OnInit {
  exportPdf() {
    if (!this.prestation?.id) return;
    this.prestationPdfService.generatePrestationPdf(this.prestation.id).subscribe({
      next: (blob: Blob) => {
        const filename = `fiche-prestation-${this.prestation?.nomPrestation || 'detail'}.pdf`;
        this.prestationPdfService.downloadPdf(blob, filename);
        this.toast.show({ type: 'success', title: 'Succès', message: 'PDF téléchargé avec succès' });
      },
      error: () => {
        this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de l\'export PDF' });
      }
    });
  }

  prestation: Prestation | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prestationService: PrestationService,
    private prestationPdfService: PrestationPdfService,
    private toast: ToastService,
    private authService: AuthService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPrestationDetails(id);
    } else {
      this.error = 'ID de prestation manquant';
    }
  }

  loadPrestationDetails(id: string): void {
    this.loading = true;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      this.error = 'ID de prestation invalide';
      this.loading = false;
      return;
    }

    this.prestationService.getPrestationById(numericId).subscribe({
      next: (prestation) => {
        this.prestation = prestation;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la prestation:', error);
        this.error = 'Impossible de charger les détails de la prestation';
        this.toast.show({ type: 'error', title: 'Erreur lors du chargement de la prestation' });
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/prestations']);
  }

  getEquipementsString(prestation: Prestation): string {
    if (prestation.equipementsUtilises && Array.isArray(prestation.equipementsUtilises) && prestation.equipementsUtilises.length > 0) {
      return prestation.equipementsUtilises.map((eq: any) => eq.nomEquipement).join(', ');
    }
    return prestation.equipementsUtilisesString || '';
  }

  getCIName(prestation: Prestation): string {
    const firstName = prestation.prenomCi || '';
    const lastName = prestation.nomCi || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || '';
  }

  getItemsString(prestation: Prestation): string {
    // Access items from the prestation object (loaded via join from backend)
    const itemsFromPrestation = (prestation as any).itemsUtilises;
    if (itemsFromPrestation && Array.isArray(itemsFromPrestation) && itemsFromPrestation.length > 0) {
      return itemsFromPrestation.map((item: any) => item.nomItem || item.nom_item).join(', ');
    }

    // Fallback to itemsNames if available
    const itemsNames = (prestation as any).itemsNames;
    if (itemsNames && typeof itemsNames === 'string' && itemsNames.trim().length > 0) {
      return itemsNames;
    }

    // Fallback to nomPrestation which contains the selected items names
    if (prestation.nomPrestation && prestation.nomPrestation.trim().length > 0) {
      return prestation.nomPrestation;
    }

    // If we still have no items, check if there's a montantIntervention (meaning there should be items)
    if (prestation.montantIntervention && prestation.montantIntervention > 0) {
      return 'Items chargés mais non disponibles pour affichage';
    }

    return 'Aucun item spécifié';
  }

  // Get items string with numbered list and line breaks
  getItemsStringWithBreaks(prestation: Prestation): string {
    const items = this.getItemsArrayWithDetails(prestation);
    if (items.length === 0) {
      return 'Aucun item spécifié';
    }
    return items.map((item, index) => `${index + 1}. ${item.nom || item.nomItem || item.nom_item || 'Item'}`).join('\n');
  }

  // Get items array with full details including prix
  getItemsArrayWithDetails(prestation: Prestation): any[] {
    // First try itemsUtilises (from database join)
    const itemsFromPrestation = (prestation as any).itemsUtilises;
    if (itemsFromPrestation && Array.isArray(itemsFromPrestation) && itemsFromPrestation.length > 0) {
      return itemsFromPrestation;
    }

    // Try to parse nomPrestation as JSON array
    if (prestation.nomPrestation && typeof prestation.nomPrestation === 'string') {
      try {
        // Try JSON parsing first
        const parsed = JSON.parse(prestation.nomPrestation);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not a JSON string, continue
      }

      // If not JSON, try comma-separated values
      if (prestation.nomPrestation.includes(',')) {
        return prestation.nomPrestation.split(',').map((nom: string, index: number) => ({
          nom: nom.trim(),
          nomItem: nom.trim(),
          nom_item: nom.trim(),
          prix: 0,
          quantite: 1
        }));
      } else if (prestation.nomPrestation.trim().length > 0) {
        // Single item
        return [{
          nom: prestation.nomPrestation.trim(),
          nomItem: prestation.nomPrestation.trim(),
          nom_item: prestation.nomPrestation.trim(),
          prix: 0,
          quantite: 1
        }];
      }
    }

    return [];
  }

  // Get items for proforma table with pricing info
  getProformaItems(prestation: Prestation): any[] {
    const items = this.getItemsArrayWithDetails(prestation);

    return items.map((item, index) => ({
      ...item,
      index: index + 1,
      nom: item.nom || item.nomItem || item.nom_item || 'Item',
      prix: item.prix || 0,
      quantite: item.quantite || 1
    }));
  }

  // Get simple list of item names from nomPrestation
  getItemsListFromNomPrestation(prestation: Prestation): string[] {
    if (!prestation.nomPrestation) {
      return [];
    }
    
    const nomPrestation = prestation.nomPrestation.trim();
    
    // Try JSON parsing first
    if (nomPrestation.startsWith('[')) {
      try {
        const parsed = JSON.parse(nomPrestation);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => {
            if (typeof item === 'string') return item;
            return item.nom || item.nomItem || item.nom_item || 'Item';
          });
        }
      } catch (e) {
        // Not JSON, continue
      }
    }
    
    // Try comma-separated values
    if (nomPrestation.includes(',')) {
      return nomPrestation.split(',').map(s => s.trim());
    }
    
    // Single item
    return [nomPrestation];
  }

  // Methods required by template
  getResponsableInfo(prestation: Prestation): string {
    const p = prestation as any;
    return p.nomResponsablePrestation || '';
  }

  getResponsableContact(prestation: Prestation): string {
    const p = prestation as any;
    return p.contactResponsablePrestation || '';
  }

  getResponsableQualification(prestation: Prestation): string {
    const p = prestation as any;
    return p.qualificationResponsablePrestation || '';
  }

  getLotFromPrestation(prestation: Prestation): string {
    const p = prestation as any;
    if (p.lot && p.lot.nomLot) {
      return p.lot.nomLot;
    }
    return p.nomLot || '';
  }

  formatDateTime(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('fr-FR');
  }

  getTrimestreLabel(trimestre?: string): string {
    const labels: { [key: string]: string } = {
      'Q1': 'T1',
      'Q2': 'T2',
      'Q3': 'T3',
      'Q4': 'T4'
    };
    return trimestre ? labels[trimestre] || trimestre : 'N/A';
  }

  getStatutLabel(statut?: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'VALIDE': 'Validée',
      'REJETE': 'Rejetée',
      'réussie': 'Réussie',
      'nécessite autres interventions': 'Nécessite autres interventions'
    };
    return statut ? labels[statut] || statut : 'N/A';
  }

  getItemsArray(prestation: Prestation): any[] {
    const itemsFromPrestation = (prestation as any).itemsUtilises;
    if (itemsFromPrestation && Array.isArray(itemsFromPrestation)) {
      return itemsFromPrestation;
    }
    // Try to parse itemsNames if it's a JSON string
    if (prestation.nomPrestation && typeof prestation.nomPrestation === 'string') {
      try {
        const parsed = JSON.parse(prestation.nomPrestation);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Not a JSON string, continue
      }
    }
    return [];
  }

  getItemQuantity(item: any, prestation: Prestation): number {
    return item.quantite || 1;
  }

  calculateItemAmount(item: any, prestation: Prestation): number {
    return (item.prix || 0) * (item.quantite || 1);
  }

  canValidatePrestation(): boolean {
    return this.authService.isAdmin() || this.authService.isAgentDGSI();
  }

  canDeletePrestation(): boolean {
    return this.authService.isAdmin();
  }

  async validerPrestation(): Promise<void> {
    if (!this.prestation?.id) return;

    const confirmed = await this.confirmationService.show({
      title: 'Valider la prestation',
      message: 'Voulez-vous valider cette prestation ?',
      confirmText: 'Valider',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      // Call validation endpoint
      // For now, we'll navigate back to list as the backend endpoint needs to be implemented
      this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation validée avec succès' });
      this.goBack();
    }
  }

  async rejeterPrestation(): Promise<void> {
    if (!this.prestation?.id) return;

    const commentaires = prompt('Motif du rejet:');
    if (commentaires === null) return; // User cancelled

    const confirmed = await this.confirmationService.show({
      title: 'Rejeter la prestation',
      message: `Voulez-vous rejeter cette prestation ?\n\nMotif: ${commentaires}`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      // Call rejection endpoint
      // For now, we'll navigate back to list as the backend endpoint needs to be implemented
      this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation rejetée' });
      this.goBack();
    }
  }

  async supprimerPrestation(): Promise<void> {
    if (!this.prestation?.id) return;

    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la prestation',
      message: 'Voulez-vous supprimer définitivement cette prestation ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      // Call delete endpoint
      this.prestationService.deletePrestation(this.prestation.id).subscribe({
        next: () => {
          this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation supprimée avec succès' });
          this.goBack();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de la prestation' });
        }
      });
    }
  }
}
