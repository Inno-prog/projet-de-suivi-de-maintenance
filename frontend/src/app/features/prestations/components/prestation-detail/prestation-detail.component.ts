import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { PrestationPdfService } from '../../../../core/services/prestation-pdf.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Subscription } from 'rxjs';

interface PrestationDetailData {
  id: number;
}

interface ConfirmationState {
  show: boolean;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
}

@Component({
  selector: 'app-prestation-detail',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-container">
      <div class="detail-header">
        <h2>Détails de la Prestation</h2>
        <button class="close-btn" (click)="goBack()">✕</button>
      </div>

      <div class="download-header">
        <button class="btn btn-outline download-btn" (click)="exportPdf()">📄 Télécharger PDF</button>
      </div>

      <div class="loading" *ngIf="loading">
        <div class="loading-spinner"></div>
        <p>Chargement des détails...</p>
      </div>

      <div class="detail-content" *ngIf="prestation && !loading">
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
              <td class="label-cell">Lot:</td>
              <td class="value-cell">{{ getLotName() || 'Non spécifié' }}</td>
            </tr>
            <tr>
              <td class="label-cell">Nom du responsable:</td>
              <td class="value-cell">{{ prestation.nomResponsablePrestation || '-' }}</td>
            </tr>
            <tr>
              <td class="label-cell">Contact du responsable:</td>
              <td class="value-cell">{{ prestation.contactResponsablePrestation || '-' }}</td>
            </tr>
            <tr>
              <td class="label-cell">Qualification du responsable:</td>
              <td class="value-cell">{{ prestation.qualificationResponsablePrestation || '-' }}</td>
            </tr>
          </table>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>🏢 Informations de la Structure</h3>
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
              <td class="value-cell">{{ getCIName() || '-' }}</td>
            </tr>
            <tr>
              <td class="label-cell">Contact du CI:</td>
              <td class="value-cell">{{ prestation.contactCi || '-' }}</td>
            </tr>
          </table>
        </div>

        <div class="detail-section">
          <div class="section-header">
            <h3>🔧 Informations sur l'Intervention</h3>
            <div class="section-divider"></div>
          </div>
          <table class="summary-table">
            <tr>
              <td class="label-cell">Items couverts:</td>
              <td class="value-cell items-list-cell">{{ getItemsString() }}</td>
            </tr>
            <tr>
              <td class="label-cell">Date de début:</td>
              <td class="value-cell">{{ formatDate(prestation.dateHeureDebut) }}</td>
            </tr>
            <tr>
              <td class="label-cell">Date de fin:</td>
              <td class="value-cell">{{ formatDate(prestation.dateHeureFin) }}</td>
            </tr>
            <tr>
              <td class="label-cell">Trimestre:</td>
              <td class="value-cell highlight">{{ prestation.trimestre || 'N/A' }}</td>
            </tr>
            <tr>
              <td class="label-cell">Statut:</td>
              <td class="value-cell status">{{ getStatutLabel() }}</td>
            </tr>
            <tr>
              <td class="label-cell">Montant total:</td>
              <td class="value-cell highlight">{{ getMontantLabel() }}</td>
            </tr>
          </table>
        </div>

        <div class="detail-actions">
          <button class="btn btn-outline" (click)="goBack()">← Retour</button>
          <div class="action-buttons">
            <button class="btn btn-success" (click)="confirmValider()">✓ Valider</button>
            <button class="btn btn-danger" (click)="confirmRejeter()">✕ Rejeter</button>
            <button class="btn btn-warning" (click)="confirmSupprimer()">🗑️ Supprimer</button>
          </div>
        </div>
      </div>

      <!-- Confirmation intégrée dans le modal -->
      <div class="confirmation-overlay" *ngIf="confirmation.show">
        <div class="confirmation-modal">
          <div class="confirmation-header" [ngClass]="confirmation.type">
            <h3>{{ confirmation.title }}</h3>
          </div>
          <div class="confirmation-body">
            <p>{{ confirmation.message }}</p>
          </div>
          <div class="confirmation-actions">
            <button class="btn btn-outline" (click)="cancelConfirmation()">{{ confirmation.cancelText }}</button>
            <button class="btn" [ngClass]="'btn-' + confirmation.type" (click)="executeConfirmation()">{{ confirmation.confirmText }}</button>
          </div>
        </div>
      </div>

      <div class="error-state" *ngIf="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="goBack()">Retour</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-height: 95vh;
      overflow-y: auto;
    }
    .dialog-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      position: relative;
    }
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
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.3);
      border-radius: 8px;
      padding: 8px 14px;
      color: white;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }
    .close-btn:hover {
      background: rgba(255,255,255,0.2);
    }
    .download-header {
      padding: 15px 30px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
    }
    .download-btn {
      padding: 10px 20px;
      font-size: 14px;
    }
    .detail-content {
      padding: 30px;
    }
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
    .items-list-cell {
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .detail-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding: 20px 0 0 0;
      border-top: 2px solid #e9ecef;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
    }
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-success {
      background: #22c55e;
      color: white;
    }
    .btn-warning {
      background: #f59e0b;
      color: white;
    }
    .btn-danger {
      background: #ef4444;
      color: white;
    }
    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
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
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px;
      color: #dc2626;
    }
    /* Confirmation intégrée */
    .confirmation-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      border-radius: 12px;
    }
    .confirmation-modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    }
    .confirmation-header {
      padding: 16px 20px;
      color: white;
      font-weight: 600;
    }
    .confirmation-header.danger {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
    }
    .confirmation-header.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }
    .confirmation-header.info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
    }
    .confirmation-header h3 {
      margin: 0;
      font-size: 18px;
    }
    .confirmation-body {
      padding: 20px;
      font-size: 15px;
      color: #374151;
      line-height: 1.5;
    }
    .confirmation-actions {
      padding: 16px 20px;
      background: #f8f9fa;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    @media (max-width: 768px) {
      .detail-content {
        padding: 20px;
      }
      .summary-table td {
        padding: 10px 12px;
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
        min-width: 100px;
      }
    }
  `]
})
export class PrestationDetailComponent implements OnInit, OnDestroy {
  prestation: Prestation | null = null;
  loading = true;
  error: string | null = null;
  private _itemsString = '';
  private _lotName = '';
  private _ciName = '';
  private _statutLabel = '';
  private _montantLabel = '';
  private subscription: Subscription | null = null;
  private dialogRefValue: MatDialogRef<any> | null = null;
  public dataValue: PrestationDetailData | null = null;

  confirmation: ConfirmationState = {
    show: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: '',
    cancelText: '',
    onConfirm: () => {}
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prestationService: PrestationService,
    private prestationPdfService: PrestationPdfService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private injector: Injector
  ) {
    try {
      this.dialogRefValue = this.injector.get(MatDialogRef, null);
      const data = this.injector.get(MAT_DIALOG_DATA, null);
      this.dataValue = data;
    } catch (e) {
      this.dialogRefValue = null;
      this.dataValue = null;
    }
  }

  ngOnInit(): void {
    let id: string | null = null;
    if (this.dataValue && this.dataValue.id) {
      id = this.dataValue.id.toString();
    } else {
      id = this.route.snapshot.paramMap.get('id');
    }
    if (id) {
      this.loadPrestationDetails(id);
    } else {
      this.error = 'ID de prestation manquant';
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPrestationDetails(id: string): void {
    this.loading = true;
    this.error = null;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      this.error = 'ID de prestation invalide';
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }
    this.subscription = this.prestationService.getPrestationById(numericId).subscribe({
      next: (prestation) => {
        this.prestation = prestation;
        this.loading = false;
        this.computeDerivedProperties();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = 'Impossible de charger les détails';
        this.loading = false;
        this.toast.show({ type: 'error', title: 'Erreur', message: this.error });
        this.cdr.markForCheck();
      }
    });
  }

  private computeDerivedProperties(): void {
    if (!this.prestation) return;
    this._itemsString = this.computeItemsString();
    const p = this.prestation as any;
    
    // Récupérer le nom du lot - plusieurs sources possibles
    if (p.lot) {
      if (typeof p.lot === 'string') {
        this._lotName = p.lot;
      } else if (p.lot.nomLot) {
        this._lotName = p.lot.nomLot;
      } else if (p.lot.nom) {
        this._lotName = p.lot.nom;
      } else {
        this._lotName = 'Non spécifié';
      }
    } else {
      this._lotName = 'Non spécifié';
    }
    
    this._ciName = `${this.prestation.prenomCi || ''} ${this.prestation.nomCi || ''}`.trim();
    const statut = this.prestation.statutIntervention || this.prestation.statut || '';
    const statutLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente', 'EN_COURS': 'En cours', 'TERMINEE': 'Terminée',
      'VALIDE': 'Validée', 'REJETE': 'Rejetée', 'réussie': 'Réussie'
    };
    this._statutLabel = statutLabels[statut] || statut || 'N/A';
    const montant = this.prestation.montantIntervention || this.prestation.montantPrest;
    this._montantLabel = montant ? `${this.formatNumber(montant)} CFA` : '0 CFA';
  }

  private computeItemsString(): string {
    if (!this.prestation) return 'Aucun item spécifié';
    const p = this.prestation as any;
    const itemsFromPrestation = p.itemsUtilises;
    if (itemsFromPrestation && Array.isArray(itemsFromPrestation) && itemsFromPrestation.length > 0) {
      return itemsFromPrestation.map((item: any, index: number) => {
        const nom = item.nomItem || item.nom || item.nom_item || 'Item';
        return `${index + 1}. ${nom}`;
      }).join('\n');
    }
    if (this.prestation.nomPrestation && typeof this.prestation.nomPrestation === 'string') {
      try {
        const parsed = JSON.parse(this.prestation.nomPrestation);
        if (Array.isArray(parsed)) {
          return parsed.map((nom: string, index: number) => `${index + 1}. ${nom}`).join('\n');
        }
      } catch (e) {}
      if (this.prestation.nomPrestation.includes(',')) {
        return this.prestation.nomPrestation.split(',').map((nom: string, index: number) =>
          `${index + 1}. ${nom.trim()}`
        ).join('\n');
      } else if (this.prestation.nomPrestation.trim().length > 0) {
        return `1. ${this.prestation.nomPrestation.trim()}`;
      }
    }
    return 'Aucun item spécifié';
  }

  getItemsString(): string { return this._itemsString; }
  getLotName(): string { return this._lotName; }
  getCIName(): string { return this._ciName; }
  getStatutLabel(): string { return this._statutLabel; }
  getMontantLabel(): string { return this._montantLabel; }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR') + ' à ' + date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  }

  formatNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return num.toLocaleString('fr-FR');
  }

  exportPdf(): void {
    if (!this.prestation?.id) return;
    this.prestationPdfService.generatePrestationPdf(this.prestation.id).subscribe({
      next: (blob: Blob) => {
        const filename = `fiche-prestation-${this.prestation?.nomPrestation || 'detail'}.pdf`;
        this.prestationPdfService.downloadPdf(blob, filename);
        this.toast.show({ type: 'success', title: 'Succès', message: 'PDF téléchargé' });
      },
      error: () => {
        this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du téléchargement PDF' });
      }
    });
  }

  goBack(): void {
    if (this.dialogRefValue) {
      this.dialogRefValue.close();
    } else {
      this.router.navigate(['/prestations']);
    }
  }

  // Méthodes de confirmation intégrées
  confirmValider(): void {
    this.confirmation = {
      show: true,
      title: '✓ Valider la prestation',
      message: 'Voulez-vous vraiment valider cette prestation ?',
      type: 'info',
      confirmText: '✓ Valider',
      cancelText: 'Annuler',
      onConfirm: () => this.executeValider()
    };
  }

  // confirmRejeter et confirmSupprimer restent inchangés avec motif

  confirmRejeter(): void {
    const commentaires = prompt('Motif du rejet:');
    if (commentaires === null) return;
    this.confirmation = {
      show: true,
      title: '✕ Rejeter la prestation',
      message: `Motif: ${commentaires}\n\nVoulez-vous vraiment rejeter cette prestation ?`,
      type: 'danger',
      confirmText: '✕ Rejeter',
      cancelText: 'Annuler',
      onConfirm: () => this.executeRejeter(commentaires)
    };
  }

  confirmSupprimer(): void {
    this.confirmation = {
      show: true,
      title: '🗑️ Supprimer la prestation',
      message: 'Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible.',
      type: 'danger',
      confirmText: '🗑️ Supprimer',
      cancelText: 'Annuler',
      onConfirm: () => this.executeSupprimer()
    };
  }

  cancelConfirmation(): void {
    this.confirmation.show = false;
    this.cdr.markForCheck();
  }

  executeConfirmation(): void {
    if (this.confirmation.onConfirm) {
      this.confirmation.onConfirm();
    }
    this.confirmation.show = false;
    this.cdr.markForCheck();
  }

  private executeValider(): void {
    this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation validée' });
    this.goBack();
  }

  private executeRejeter(commentaires: string): void {
    this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation rejetée' });
    this.goBack();
  }

  private executeSupprimer(): void {
    if (!this.prestation?.id) return;
    this.prestationService.deletePrestation(this.prestation.id).subscribe({
      next: () => {
        this.toast.show({ type: 'success', title: 'Succès', message: 'Prestation supprimée' });
        this.goBack();
      },
      error: () => {
        this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression' });
      }
    });
  }
}

