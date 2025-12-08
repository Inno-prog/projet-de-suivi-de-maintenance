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
        <button class="btn-back" (click)="goBack()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Retour
        </button>
        <h1>Trimestre {{ selectedTrimestre }} - Lots disponibles</h1>
      </div>

      <!-- Lots Grid -->
      <div class="lots-grid">
        <div *ngFor="let lot of lots" 
             class="lot-card" 
             (click)="selectLot(lot.numero)">
          <div class="lot-header">
            <div class="lot-number">Lot {{ lot.numero }}</div>
            <div class="lot-status" [class]="lot.statusClass">
              {{ lot.status }}
            </div>
          </div>
          <div class="lot-info">
            <p class="lot-ville">📍 {{ lot.ville }}</p>
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
    }

    .btn-back:hover {
      background: #e9ecef;
      color: #007bff;
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

    .lot-ville {
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
          numero: lot.lot,
          ville: lot.villes.join(', '),
          villes: lot.villes,
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

  selectLot(lotNumber: number): void {
    this.router.navigate(['/ordres-commande/trimestre', this.selectedTrimestre, 'lot', lotNumber]);
  }
}