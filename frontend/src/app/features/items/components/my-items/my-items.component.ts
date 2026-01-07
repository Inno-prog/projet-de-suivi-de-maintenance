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

      <!-- STAT CARDS -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="stat-card">
            <i class="fa-solid fa-box-open stat-icon text-primary"></i>
            <div>
              <h4 class="fw-bold mb-0 text-muted">{{ getTotalItems() }}</h4>
              <small class="text-muted">Items disponibles</small>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-card">
            <i class="fa-solid fa-money-bill-wave stat-icon text-success"></i>
            <div>
              <h4 class="fw-bold mb-0 text-muted">{{ getTotalValue() | number:'1.0-0' }} FCFA</h4>
              <small class="text-muted">Valeur Totale</small>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="stat-card">
            <i class="fa-solid fa-tools stat-icon text-warning"></i>
            <div>
              <h4 class="fw-bold mb-0 text-muted">{{ totalPrestations }}</h4>
              <small class="text-muted">Mes Prestations</small>
            </div>
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
                <option *ngFor="let lot of lots" [ngValue]="lot.lot">Lot {{ lot.lot }} ({{ lot.villes.join(', ') }})</option>
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
                  <div class="d-flex gap-1">
                    <span class="badge bg-warning-subtle text-warning">{{ getPrestationsCountForItem(item) }}</span>
                    <span class="text-muted">/</span>
                    <span class="badge bg-info-subtle text-info">{{ item.quantiteMaxTrimestre }}</span>
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

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      border: none;
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transition: transform .2s;
    }

    .stat-card:hover {
      transform: translateY(-3px);
    }

    .stat-icon {
      font-size: 2rem;
      border-radius: 0.5rem;
      padding: 0.5rem;
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

    /* Text wrapping for table cells */
    td:nth-child(2), td:nth-child(3) {
      max-width: 200px;
      word-wrap: break-word;
      white-space: normal;
      overflow-wrap: break-word;
      word-break: break-word;
      line-height: 1.4;
    }

    td:nth-child(2) {
      font-weight: 600;
      color: #374151;
    }

    /* Description column (3rd column) */
    td:nth-child(3) {
      color: #6b7280;
      font-style: italic;
      max-width: 250px;
      min-width: 150px;
    }

    /* Qté Utilisée/Max column (5th column) */
    td:nth-child(5) {
      min-width: 120px;
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

    this.itemService.getItemsByPrestataire(currentUser.id).subscribe({
      next: (items) => {
        this.items = items || [];
        this.filteredItems = [...this.items];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des items:', error);
        this.toast.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement de vos items'
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
  getTotalValue() { return this.items.reduce((a, b) => a + (b.prix || 0), 0); }

  getLotName(lotId: string): string {
    if (!lotId) return 'Lot inconnu';

    // First try: find by lot name (most common)
    let lot = this.lots.find(l => l.lot === lotId || l.lot === (lotId || '').toString());
    if (!lot) {
      // Second try: the item.lot could store a contract id; check contractIds
      lot = this.lots.find(l => l.contractIds && l.contractIds.includes(lotId));
    }

    if (!lot) return `Lot ${lotId}`;
    const villes = (lot.villes || []).filter(v => v && v.trim().length > 0);
    return villes.length > 0 ? `Lot ${lot.lot} (${villes.join(', ')})` : `Lot ${lot.lot}`;
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