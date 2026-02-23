import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LotService } from '../../../../core/services/lot.service';
import { LotWithContractorDto } from '../../../../core/models/business.models';

@Component({
  selector: 'app-trimestre-lots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <button class="btn btn-lg btn-back-sidebar" (click)="goBack()">
          <i class="bi bi-arrow-left-circle me-2"></i>
          Retour aux trimestres
        </button>
        <h1>Trimestre {{ selectedTrimestre }} - Lots disponibles</h1>
      </div>

      <!-- Lots Grid -->
      <div class="lots-grid">
        <div *ngFor="let lot of lots"
             class="lot-card"
             (click)="selectLot(lot)">
          <div class="lot-header">
            <div class="lot-number">{{ lot.numero }}</div>
            <div class="lot-status" [class]="lot.statusClass">
              {{ lot.status }}
            </div>
          </div>
           <div class="lot-info">
              <p class="lot-region" *ngIf="lot.regions && lot.regions.length > 0">
                <i class="fa-solid fa-map-marker-alt me-1"></i>
                Régions: {{ lot.regions.join(', ') }}
              </p>
              <div class="lot-contracts" *ngIf="lot.contractIds && lot.contractIds.length > 0">
                <small class="text-muted">Contrats:</small>
                <div class="contract-badges">
                  <span class="contract-badge" *ngFor="let contractId of lot.contractIds">{{ contractId }}</span>
                </div>
              </div>
              <p class="lot-description">{{ lot.description }}</p>
              <div class="lot-stats">
                <span class="stat">{{ lot.contractIds.length }} contrat(s)</span>
              </div>
            </div>
          <div class="lot-footer">
            <button class="btn-view">Voir les fiches</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e9ecef;
    }

    /* Bouton retour avec couleur sidebar (rgb(28, 82, 118)) */
    .btn-back-sidebar {
      display: inline-flex;
      align-items: center;
      padding: 0.5rem 1rem;
      font-weight: 500;
      font-size: 0.875rem;
      border: 2px solid rgb(28, 82, 118);
      border-radius: 0.5rem;
      background-color: rgb(28, 82, 118);
      color: white;
      transition: all 0.3s ease;
    }

    .btn-back-sidebar:hover {
      transform: translateY(-2px);
      background-color: rgb(20, 60, 90);
      border-color: rgb(20, 60, 90);
      box-shadow: 0 4px 12px rgba(28, 82, 118, 0.35);
    }

    .btn-back-sidebar i {
      font-size: 1rem;
    }

    h1 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .lots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

     .lot-card {
      background: white;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .lot-card:hover {
      border-color: #007bff;
      box-shadow: 0 4px 12px rgba(0,123,255,0.15);
      transform: translateY(-2px);
    }

    .lot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .lot-number {
      font-size: 18px;
      font-weight: 600;
      color: #007bff;
    }

    .lot-status {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-active {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    .status-completed {
      background: #cce5ff;
      color: #004085;
    }

    .lot-info {
      margin-bottom: 20px;
    }

    .lot-region {
      color: #007bff;
      font-weight: 600;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .lot-contracts {
      margin-bottom: 10px;
    }

    .lot-contracts small {
      display: block;
      margin-bottom: 5px;
      font-size: 12px;
      color: #666;
    }

    .contract-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .contract-badge {
      display: inline-block;
      padding: 3px 8px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .lot-description {
      color: #666;
      margin-bottom: 15px;
      line-height: 1.5;
      font-size: 13px;
    }

    .lot-stats {
      display: flex;
      gap: 15px;
    }

    .stat {
      font-size: 14px;
      font-weight: 500;
      color: #495057;
      background: #f8f9fa;
      padding: 6px 12px;
      border-radius: 6px;
    }

    .lot-footer {
      text-align: center;
    }

    .btn-view {
      width: 100%;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .btn-view:hover {
      background: #0056b3;
    }

    @media (max-width: 768px) {
      .lots-grid {
        grid-template-columns: 1fr;
      }
      
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
      }
    }
  `]
})
export class TrimestreLotsComponent implements OnInit {
  selectedTrimestre: number = 1;
  
  lots: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lotService: LotService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedTrimestre = +params['trimestre'] || 1;
      this.loadLots();
    });
  }

   loadLots(): void {
    this.lotService.getActiveLots().subscribe({
      next: (lotsData: LotWithContractorDto[]) => {
        this.lots = lotsData.map(lot => ({
          numero: lot.lot, // Already normalized by backend: "Lot X"
          rawNumero: (lot as any).lotRaw, // Raw lot name like "lot9"
          regions: lot.regions,
          contractIds: lot.contractIds,
          description: `Contrats: ${lot.contractIds.join(', ')}`,
          status: 'Actif',
          statusClass: 'status-active',
          fichesCount: 0, // Will be loaded when viewing specific trimestre
          montantTotal: 0
        }));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des lots:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/ordres-commande']);
  }

  selectLot(lot: any): void {
    // Pass the raw lot name, not the display name
    const rawLotName = lot.rawNumero || lot.numero.split(' (')[0];
    this.router.navigate(['/ordres-commande/trimestre', this.selectedTrimestre, 'lot', rawLotName]);
  }
}
