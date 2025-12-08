import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-lot-fiches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <button class="btn-back" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retour aux lots
        </button>
        <div class="header-info">
          <h1>Trimestre {{ selectedTrimestre }} - Lot {{ selectedLot }}</h1>
          <p class="header-subtitle">{{ lotInfo.description }}</p>
        </div>
        <div class="header-actions">
          <button class="btn-generate-global" (click)="generateFicheGlobale()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Générer Fiche Globale
          </button>
          <button class="btn-generate-prestataire" (click)="generateFicheParPrestataire()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="8.5" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20 8v6M23 11h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Générer par Prestataire
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-info">
            <div class="stat-value">{{ fiches.length }}</div>
            <div class="stat-label">Total Fiches</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <div class="stat-value">{{ getCompletedCount() }}</div>
            <div class="stat-label">Validées</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-info">
            <div class="stat-value">{{ getPendingCount() }}</div>
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
      <div *ngIf="!loading" class="table-container">
        <table class="fiches-table">
          <thead>
            <tr>
              <th>N° Fiche</th>
              <th>Prestataire</th>
              <th>Item</th>
              <th>Date</th>
              <th>Quantité</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let fiche of fiches" class="fiche-row">
              <td class="fiche-id">{{ fiche.idPrestation }}</td>
              <td class="prestataire">{{ fiche.nomPrestataire }}</td>
              <td class="item">{{ fiche.nomItem }}</td>
              <td class="date">{{ formatDate(fiche.dateRealisation) }}</td>
              <td class="quantity">{{ fiche.quantite }}</td>
              <td class="amount">{{ fiche.quantite || 0 }} unités</td>
              <td class="status">
                <span class="status-badge" [class]="getStatusClass(fiche.statut)">
                  {{ getStatusLabel(fiche.statut) }}
                </span>
              </td>
              <td class="actions">
                <button class="btn-action btn-view" (click)="viewFiche(fiche)" title="Voir détails">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button class="btn-action btn-edit" (click)="editFiche(fiche)" title="Modifier">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }

    .header-actions {
      display: flex;
      gap: 12px;
      margin-left: auto;
      flex-shrink: 0;
    }

    .btn-generate-global, .btn-generate-prestataire {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-generate-global {
      background: #28a745;
      color: white;
    }

    .btn-generate-global:hover {
      background: #218838;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-generate-prestataire {
      background: #007bff;
      color: white;
    }

    .btn-generate-prestataire:hover {
      background: #0056b3;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      color: #495057;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .btn-back:hover {
      background: #e9ecef;
      color: #007bff;
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
    }

    .stat-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .stat-icon {
      font-size: 24px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .fiches-table {
      width: 100%;
      border-collapse: collapse;
    }

    .fiches-table th {
      background: #f8f9fa;
      padding: 15px 12px;
      text-align: left;
      font-weight: 600;
      color: #495057;
      border-bottom: 2px solid #dee2e6;
    }

    .fiches-table td {
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }

    .fiche-row:hover {
      background: #f8f9ff;
    }

    .fiche-id {
      font-weight: 600;
      color: #007bff;
    }

    .prestataire {
      font-weight: 500;
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
      color: #666;
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

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-validated {
      background: #d4edda;
      color: #155724;
    }

    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      padding: 6px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-view {
      background: #e3f2fd;
      color: #1976d2;
    }

    .btn-view:hover {
      background: #bbdefb;
    }

    .btn-edit {
      background: #fff3e0;
      color: #f57c00;
    }

    .btn-edit:hover {
      background: #ffe0b2;
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

    @media (max-width: 768px) {
      .stats-grid {
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
    description: 'Maintenance préventive des équipements informatiques'
  };

  fiches: FichePrestation[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fichePrestationService: FichePrestationService,
    private toastService: ToastService
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
    console.log('Voir fiche:', fiche);
  }

  editFiche(fiche: any): void {
    console.log('Modifier fiche:', fiche);
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