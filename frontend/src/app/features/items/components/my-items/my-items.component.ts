import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../../core/services/item.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { LotService } from '../../../../core/services/lot.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Item, LotWithContractorDto } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-my-items',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">

      <!-- HEADER -->
      <div class="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="fw-bold text-primary mb-0"><i class="fa-solid fa-boxes-stacked me-2"></i>Mes Items</h1>
          <p class="text-muted mb-0">Consultez les items disponibles dans vos contrats</p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-info shadow-sm" (click)="refreshData()">
            <i class="fa-solid fa-sync-alt me-2"></i> Actualiser
          </button>
        </div>
      </div>

      <!-- Statistics Cards - Material Design Style -->
      <div class="stats-overview">
        <div class="stat-card total-items-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon-bg">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V17H19V19M19,13H5V11H19V13M19,9H5V7H19V9Z"/>
              </svg>
            </div>
            <div class="stat-icon-shadow"></div>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalItems() }}</div>
            <div class="stat-label">Total Items</div>
            <div class="stat-subtitle">Tous mes items</div>
          </div>
        </div>

        <div class="stat-card active-lots-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon-bg">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z"/>
              </svg>
            </div>
            <div class="stat-icon-shadow"></div>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalLots() }}</div>
            <div class="stat-label">Lots Actifs</div>
            <div class="stat-subtitle">Lots disponibles</div>
          </div>
        </div>

        <div class="stat-card total-value-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon-bg">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8,10.9C9.53,10.31 8.8,13 9.6,14.4L9.47,14.5C7.55,12 5.89,8.15 4.81,6.31L3,5V4.5C3,3 4,2 5.5,2S8,3 8,4.5V5C7.14,5.78 6.32,6.5 5.55,7.17C7.41,9.95 9.22,13.47 10.55,15.93C12.3,16 13.64,13.33 11.8,10.9M15.5,4C16.88,4 18,5.12 18,6.5C18,7.88 16.88,9 15.5,9S13,7.88 13,6.5C13,5.12 14.12,4 15.5,4M12,20A2,2 0 0,0 14,18A2,2 0 0,0 12,16A2,2 0 0,0 10,18A2,2 0 0,0 12,20M7,24H17V22H7V24Z"/>
              </svg>
            </div>
            <div class="stat-icon-shadow"></div>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ getTotalValue() | number:'1.0-0' }}</div>
            <div class="stat-label">Valeur Totale</div>
            <div class="stat-subtitle">FCFA</div>
          </div>
        </div>

        <div class="stat-card prestations-card">
          <div class="stat-icon-wrapper">
            <div class="stat-icon-bg">
              <svg class="stat-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.7,19L13.6,9.9C14.5,7.6 14,4.9 12.1,3C10.1,1 7.1,0.6 4.7,1.7L9,6L7.9,7.1L3.7,2.9C2.6,5.3 3,8.3 5,10.3C6.9,12.2 9.6,12.7 11.9,11.8L21,20.9C21.4,21.3 22,21.3 22.4,20.9C22.8,20.5 22.8,19.9 22.7,19Z"/>
              </svg>
            </div>
            <div class="stat-icon-shadow"></div>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ totalPrestations }}</div>
            <div class="stat-label">Total Prestations</div>
            <div class="stat-subtitle">Utilisations</div>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTERS -->
      <div class="card shadow-sm border-0 rounded-3 mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-end">
            <div class="col-md-6">
              <label class="form-label fw-semibold">Recherche</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass"></i></span>
                <input type="text" class="form-control" placeholder="Nom ou description de l'item..." 
                       [(ngModel)]="searchTerm" (input)="applyFilters()">
              </div>
            </div>
            
            <div class="col-md-4">
              <label class="form-label fw-semibold">Filtrer par Lot</label>
              <select class="form-select" [(ngModel)]="selectedLotFilter" (ngModelChange)="onLotFilterChange($event)">
                <option [ngValue]="null">Tous les lots</option>
                <option *ngFor="let lot of lots" [ngValue]="lot.lot">{{ formatLotLabel(lot.lot) }}</option>
              </select>
            </div>

            <div class="col-md-2">
              <button class="btn btn-outline-secondary w-100" (click)="clearFilters()">
                <i class="fa-solid fa-rotate-left"></i> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TABLE -->
      <div class="card shadow-sm border-0 rounded-3" *ngIf="!loading; else loadingTemplate">
        <div class="table-responsive">
          <table class="table align-middle table-hover mb-0">
            <thead class="table-primary text-primary">
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Description</th>
                <th>Prix Unitaire</th>
                <th>Prestations Utilisées</th>
                <th>Prix Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody *ngIf="filteredItems.length > 0; else noItems">
              <tr *ngFor="let item of filteredItems" [class.table-warning]="isItemCritical(item)">
                <td><span class="badge bg-primary-subtle text-primary fw-semibold">{{ item.idItem }}</span></td>
                <td class="fw-semibold">{{ item.nomItem }}</td>
                <td class="text-muted">{{ item.description || '-' }}</td>
                <td><span class="text-success fw-semibold">{{ item.prix | number:'1.0-0' }} FCFA</span></td>
                <td>
                  <div class="d-flex gap-1 align-items-center justify-content-center">
                    <span class="fw-bold fs-5">{{ getPrestationsCountForItem(item) }}</span>
                    <span class="text-muted fs-5">/</span>
                    <span class="fw-bold fs-5">{{ item.quantiteMaxTrimestre }}</span>
                  </div>
                </td>
                <td><span class="text-danger fw-semibold">{{ (item.prix * item.quantiteMaxTrimestre) | number:'1.0-0' }} FCFA</span></td>
                <td>
                  <div class="d-flex gap-2 justify-content-center">
                    <button class="btn btn-info btn-action" (click)="viewItem(item)" title="Voir les détails">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- NO ITEMS -->
      <ng-template #noItems>
        <div class="text-center p-5 text-muted">
          <i class="fa-solid fa-box-open fa-2x mb-3"></i><br>
          Aucun item trouvé 😕
        </div>
      </ng-template>

      <!-- LOADING -->
      <ng-template #loadingTemplate>
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2">Chargement de vos items...</p>
        </div>
      </ng-template>

      <!-- ITEM DETAILS MODAL -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showDetails" (click)="closeDetails()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header bg-info text-white rounded-top-4">
              <h5 class="modal-title">
                <i class="fa-solid fa-eye me-2"></i>
                Détails de l'Item
              </h5>
              <button type="button" class="btn-close btn-close-white" (click)="closeDetails()"></button>
            </div>
            <div class="modal-body" *ngIf="selectedItem">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Nom de l'Item</label>
                    <p class="form-control-plaintext">{{ selectedItem.nomItem }}</p>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">ID Item</label>
                    <p class="form-control-plaintext">{{ selectedItem.idItem }}</p>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Prix Unitaire</label>
                    <p class="form-control-plaintext text-success fw-semibold">{{ selectedItem.prix | number:'1.0-0' }} FCFA</p>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Quantité Max/Trimestre</label>
                    <p class="form-control-plaintext">{{ selectedItem.quantiteMaxTrimestre }}</p>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Description</label>
                <p class="form-control-plaintext">{{ selectedItem.description || 'Aucune description fournie' }}</p>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Prestations Utilisées</label>
                    <p class="form-control-plaintext">
                      <span class="badge bg-warning">{{ getPrestationsCountForItem(selectedItem) }}</span>
                      <span class="text-muted ms-2">/ {{ selectedItem.quantiteMaxTrimestre }}</span>
                    </p>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Valeur Totale Estimée</label>
                    <p class="form-control-plaintext text-danger fw-semibold">{{ (selectedItem.prix * selectedItem.quantiteMaxTrimestre) | number:'1.0-0' }} FCFA</p>
                  </div>
                </div>
              </div>

              <div class="mb-3" *ngIf="selectedItem.lot">
                <label class="form-label fw-semibold">Lot</label>
                <p class="form-control-plaintext">{{ getLotName(selectedItem.lot) }}</p>
              </div>

              <!-- Usage Status -->
              <div class="alert" [ngClass]="getUsageStatusClass(selectedItem)">
                <i class="fa-solid me-2" [ngClass]="getUsageStatusIcon(selectedItem)"></i>
                <strong>Statut d'utilisation:</strong> {{ getUsageStatus(selectedItem) }}
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeDetails()">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      background-color: #f8f9fa;
      min-height: 100vh;
      padding: 2rem;
      font-family: 'Poppins', sans-serif;
    }

    /* Material Design Statistics Cards */
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 20px;
      box-shadow:
        0 16px 32px rgba(0, 0, 0, 0.1),
        0 6px 12px rgba(0, 0, 0, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #f59e0b);
      border-radius: 20px 20px 0 0;
    }

    .stat-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow:
        0 24px 48px rgba(0, 0, 0, 0.12),
        0 12px 24px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    /* Specific card themes */
    .total-items-card::before { background: linear-gradient(90deg, #3b82f6, #1d4ed8); }
    .active-lots-card::before { background: linear-gradient(90deg, #10b981, #059669); }
    .total-value-card::before { background: linear-gradient(90deg, #f59e0b, #d97706); }
    .prestations-card::before { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }

    .stat-icon-wrapper {
      position: relative;
      flex-shrink: 0;
    }

    .stat-icon-bg {
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* Icon backgrounds with gradients */
    .total-items-card .stat-icon-bg {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
    }

    .active-lots-card .stat-icon-bg {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
    }

    .total-value-card .stat-icon-bg {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3);
    }

    .prestations-card .stat-icon-bg {
      background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
      box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3);
    }

    .stat-icon {
      width: 36px;
      height: 36px;
      color: white;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }

    .stat-icon-shadow {
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 8px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 50%;
      filter: blur(6px);
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 800;
      line-height: 1;
      margin-bottom: 0.25rem;
      background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.125rem;
    }

    .stat-subtitle {
      font-size: 0.75rem;
      color: #6b7280;
      font-weight: 500;
    }

    .modal.fade.show {
      background-color: rgba(0,0,0,0.5);
      backdrop-filter: blur(3px);
    }

    .btn-action {
      padding: 0.5rem 0.75rem;
      font-size: 0.9rem;
      border-radius: 0.375rem;
      min-width: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      border: none;
      cursor: pointer;
    }

    .btn-action:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
    }

    /* Table column alignment */
    .table {
      table-layout: fixed;
      width: 100%;
      border-collapse: collapse;
    }

    /* ID column (1st column) */
    th:nth-child(1), td:nth-child(1) {
      width: 80px;
      text-align: center;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Name column (2nd column) */
    th:nth-child(2), td:nth-child(2) {
      width: 20%;
      text-align: center;
      max-width: 200px;
      word-wrap: break-word;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
      line-height: 1.4;
      font-weight: 600;
      color: #374151;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Description column (3rd column) */
    th:nth-child(3), td:nth-child(3) {
      width: 25%;
      text-align: center;
      max-width: 250px;
      min-width: 150px;
      word-wrap: break-word;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
      line-height: 1.4;
      color: #6b7280;
      font-style: italic;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Price column (4th column) */
    th:nth-child(4), td:nth-child(4) {
      width: 12%;
      text-align: center;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Prestations Used column (5th column) */
    th:nth-child(5), td:nth-child(5) {
      width: 15%;
      text-align: center;
      min-width: 120px;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Total Price column (6th column) */
    th:nth-child(6), td:nth-child(6) {
      width: 12%;
      text-align: center;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Actions column (7th column) */
    th:nth-child(7), td:nth-child(7) {
      width: 8%;
      text-align: center;
      border: 1px solid #e5e7eb;
      vertical-align: middle;
    }

    /* Header styling */
    th {
      background-color: #f8f9fa;
      font-weight: 600;
      color: #374151;
      padding: 12px 8px;
    }

    /* Cell styling */
    td {
      padding: 12px 8px;
    }
  `]
})
export class MyItemsComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];
  lots: LotWithContractorDto[] = [];
  searchTerm = '';
  selectedLotFilter: string | null = null;
  loading = false;
  showDetails = false;
  selectedItem: Item | null = null;
  totalPrestations = 0;

  constructor(
    private itemService: ItemService,
    private prestationService: PrestationService,
    private lotService: LotService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.loadPrestataireItems();
    this.loadPrestataireLots();
    this.loadTotalPrestations();
  }

  loadPrestataireLots() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.toast.show({
        type: 'error',
        title: 'Erreur',
        message: 'Utilisateur non connecté'
      });
      return;
    }

    this.lotService.getLotsByPrestataire(currentUser.id).subscribe({
      next: (lots) => {
        this.lots = lots || [];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des lots:', error);
        this.lots = [];
      }
    });
  }

  loadPrestataireItems() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.toast.show({
        type: 'error',
        title: 'Erreur',
        message: 'Utilisateur non connecté'
      });
      this.loading = false;
      return;
    }

    console.log('SUCCESS - Loading items for prestataire (dev):', currentUser.id);

    // Utiliser le endpoint dédié backend qui a une logique robuste de correspondance lots/items
    this.itemService.getItemsByPrestataire(currentUser.id).subscribe({
      next: (items) => {
        this.items = items || [];
        this.filteredItems = [...this.items];
        this.loading = false;

        console.log('Items found for prestataire:', this.items);

        if (this.items.length === 0) {
          this.toast.show({
            type: 'info',
            title: 'Information',
            message: 'Aucun item trouvé dans vos lots assignés'
          });
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des items:', error);
        this.items = [];
        this.filteredItems = [];
        this.toast.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger vos items. Veuillez réessayer.'
        });
        this.loading = false;
      }
    });
  }

  loadTotalPrestations() {
    this.prestationService.getMyPrestations(0, 1).subscribe({
      next: (prestationResponse) => {
        if (prestationResponse && typeof prestationResponse === 'object' && 'totalElements' in prestationResponse) {
          this.totalPrestations = prestationResponse.totalElements;
        } else {
          this.totalPrestations = 0;
        }
      },
      error: () => {
        this.totalPrestations = 0;
      }
    });
  }

  applyFilters() {
    // If no filters are applied, show all items
    if (!this.searchTerm && !this.selectedLotFilter) {
      this.filteredItems = [...this.items];
      return;
    }

    // Filter locally
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.nomItem.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesLot = !this.selectedLotFilter || 
        (item.lot && item.lot === this.selectedLotFilter.toString());
      
      return matchesSearch && matchesLot;
    });
  }

  onLotFilterChange(event: any) {
    setTimeout(() => {
      this.applyFilters();
    }, 0);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedLotFilter = null;
    this.applyFilters();
  }

  refreshData() {
    this.loadData();
    this.toast.show({ 
      type: 'success', 
      title: 'Succès', 
      message: 'Données actualisées' 
    });
  }

  // Méthodes utilitaires
  getTotalItems() { return this.items.length; }
  getTotalLots() { return this.lots.length; }
  getTotalValue() { return this.items.reduce((a, b) => a + (b.prix || 0), 0); }

  getLotName(lotId: string): string {
    if (!lotId) return 'Lot inconnu';

    // First try: find by lot name (most common)
    let lot = this.lots.find(l => l.lot === lotId || l.lot === (lotId || '').toString());
    if (!lot) {
      // Second try: the item.lot could store a contract id; check contractIds
      lot = this.lots.find(l => l.contractIds && l.contractIds.includes(lotId));
    }

    if (!lot) return this.formatLotLabel(lotId);
    const regions = (lot.regions || []).filter(r => r && r.trim().length > 0);
    return regions.length > 0 ? `${this.formatLotLabel(lot.lot)} (${regions.join(', ')})` : this.formatLotLabel(lot.lot);
  }

  /**
   * Retourne un libellé de lot cohérent :
   * - Si la valeur fournie commence déjà par 'lot' (insensible à la casse), on la normalise en 'Lot ...'.
   * - Sinon on préfixe par 'Lot '.
   */
  formatLotLabel(value: string | null | undefined): string {
    if (!value) return 'Lot inconnu';
    const v = value.toString().trim();
    if (/^lot\s+/i.test(v)) {
      return v.replace(/^lot\s+/i, 'Lot ');
    }
    return `Lot ${v}`;
  }

  getUsageStatus(item: Item): string {
    const usageRatio = (item.quantiteUtilisee || 0) / item.quantiteMaxTrimestre;
    if (usageRatio >= 0.8) return 'CRITIQUE - Proche de la limite';
    if (usageRatio >= 0.5) return 'ATTENTION - Utilisation modérée';
    return 'NORMAL - Utilisation faible';
  }

  getUsageStatusClass(item: Item): string {
    const usageRatio = (item.quantiteUtilisee || 0) / item.quantiteMaxTrimestre;
    if (usageRatio >= 0.8) return 'alert-danger';
    if (usageRatio >= 0.5) return 'alert-warning';
    return 'alert-success';
  }

  getUsageStatusIcon(item: Item): string {
    const usageRatio = (item.quantiteUtilisee || 0) / item.quantiteMaxTrimestre;
    if (usageRatio >= 0.8) return 'fa-exclamation-triangle';
    if (usageRatio >= 0.5) return 'fa-exclamation-circle';
    return 'fa-check-circle';
  }

  getPrestationsCountForItem(item: Item): number {
    return item.quantiteUtilisee || 0;
  }

  isItemCritical(item: Item): boolean {
    const usageRatio = (item.quantiteUtilisee || 0) / item.quantiteMaxTrimestre;
    return usageRatio >= 0.8;
  }

  viewItem(item: Item) {
    this.selectedItem = item;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedItem = null;
  }
}
