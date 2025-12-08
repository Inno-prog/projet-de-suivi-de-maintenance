import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { PrestationPdfService } from '../../../../core/services/prestation-pdf.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-prestation-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <button class="back-btn" (click)="goBack()">← Retour à la liste</button>
        <h1>Détails de la Prestation</h1>
      </div>

      <div class="loading" *ngIf="loading">Chargement des détails...</div>

      <div class="prestation-detail" *ngIf="prestation && !loading">
        <!-- Informations du prestataire -->
        <div class="info-section">
          <h2>Informations du Prestataire</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Nom du prestataire:</label>
              <span>{{ prestation.nomPrestataire || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Contact:</label>
              <span>{{ prestation.contactPrestataire || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Structure:</label>
              <span>{{ prestation.structurePrestataire || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Service:</label>
              <span>{{ prestation.servicePrestataire || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Qualification:</label>
              <span>{{ prestation.qualificationPrestataire || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Informations de la Structure -->
        <div class="info-section">
          <h2>Informations de la Structure</h2>
          <div class="info-grid">
            <!-- Informations de la structure -->
            <div class="info-item">
              <label>Nom de la Structure:</label>
              <span>{{ prestation.nomStructure || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Adresse de la Structure:</label>
              <span>{{ prestation.adresseStructure || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Email de la Structure:</label>
              <span>{{ prestation.contactStructure || 'N/A' }}</span>
            </div>

            <!-- Informations du Correspondant Informatique -->
            <div class="info-item">
              <label>Nom du Correspondant Informatique:</label>
              <span>{{ getCIName(prestation) || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Contact du Correspondant Informatique:</label>
              <span>{{ prestation.contactCi || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Fonction du Correspondant Informatique:</label>
              <span>{{ prestation.fonctionCi || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Détails de l'intervention -->
        <div class="info-section">
          <h2>Détails de l'Intervention</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>Items couverts par la prestation:</label>
              <span>{{ getItemsString(prestation) || 'Aucun item spécifié' }}</span>
            </div>
            <div class="info-item">
              <label>Trimestre:</label>
              <span>{{ prestation.trimestre || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Montant d'intervention:</label>
              <span>{{ prestation.montantIntervention | number:'1.0-0' }} FCFA</span>
            </div>
            <div class="info-item">
              <label>Statut de l'intervention:</label>
              <span>{{ prestation.statutIntervention || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <label>Date/heure de début:</label>
              <span>{{ prestation.dateHeureDebut | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
            <div class="info-item">
              <label>Date/heure de fin:</label>
              <span>{{ prestation.dateHeureFin | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
          </div>
        </div>



        <!-- Actions -->
        <div class="actions">
          <button class="btn btn-primary" (click)="goBack()">Retour à la liste</button>
          <button class="btn btn-secondary" (click)="exportPdf()">📄 Télécharger PDF</button>
        </div>
      </div>

      <div class="error" *ngIf="error">
        <p>{{ error }}</p>
        <button class="btn btn-primary" (click)="goBack()">Retour</button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .back-btn {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      font-weight: 500;
      color: #374151;
      transition: all 0.2s ease;
    }

    .back-btn:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }

    h1 {
      color: #1f2937;
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .loading {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .error {
      text-align: center;
      padding: 3rem;
      color: #dc2626;
    }

    .prestation-detail {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
    }

    .info-section {
      padding: 2rem;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-section:last-child {
      border-bottom: none;
    }

    .info-section h2 {
      color: #1f2937;
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #f97316;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-item span {
      color: #1f2937;
      font-size: 1rem;
      padding: 0.5rem;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #f3f4f6;
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      display: inline-block;
    }

    .status-terminé {
      background: #dcfce7;
      color: #166534;
    }

    .status-en-cours {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-en-attente {
      background: #fef3c7;
      color: #92400e;
    }

    .status-unknown {
      background: #f3f4f6;
      color: #6b7280;
    }

    .observations {
      display: grid;
      gap: 1.5rem;
    }

    .observation-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .observation-item label {
      font-weight: 600;
      color: #374151;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .observation-item p {
      color: #1f2937;
      font-size: 1rem;
      line-height: 1.6;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 6px;
      border: 1px solid #f3f4f6;
      margin: 0;
      white-space: pre-line;
    }

    .actions {
      padding: 2rem;
      background: #f9fafb;
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-primary {
      background: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .info-section {
        padding: 1.5rem;
      }

      .actions {
        flex-direction: column;
        padding: 1.5rem;
      }

      .btn {
        width: 100%;
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
    private toast: ToastService
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
    const itemsFromPrestation = (prestation as any).itemsUtilises || (prestation as any).items;
    if (itemsFromPrestation && Array.isArray(itemsFromPrestation) && itemsFromPrestation.length > 0) {
      return itemsFromPrestation.map((item: any) => item.nomItem || item.nom_item).join(', ');
    }

    // Fallback to itemsNames if available
    const itemsNames = (prestation as any).itemsNames;
    if (itemsNames && typeof itemsNames === 'string' && itemsNames.trim().length > 0) {
      return itemsNames;
    }

    return 'Aucun item spécifié';
  }
}