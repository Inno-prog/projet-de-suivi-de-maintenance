import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ItemService } from '../../../../core/services/item.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { Item, Equipement, LotWithContractorDto } from '../../../../core/models/business.models';
import { EquipementService } from '../../../../core/services/equipement.service';
import { LotService } from '../../../../core/services/lot.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { LotManagerComponent } from '../lot-manager/lot-manager.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LotManagerComponent],
  template: `
  <div class="dashboard-container">

    <!-- HEADER -->
    <div class="dashboard-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="fw-bold text-primary mb-0"><i class="fa-solid fa-boxes-stacked me-2"></i>Gestion des Items & Lots</h1>
        <p class="text-muted mb-0">Créez, modifiez et organisez vos items par lots</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-primary shadow-sm" (click)="showLotManager()">
          <i class="fa-solid fa-layer-group me-2"></i> Gérer les Lots
        </button>
        <button class="btn btn-primary shadow-sm" (click)="onAdd()">
          <i class="fa-solid fa-plus-circle me-2"></i> Ajouter un Item
        </button>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="stat-card">
          <i class="fa-solid fa-box-open stat-icon text-primary"></i>
          <div>
            <h4 class="fw-bold mb-0 text-muted">{{ getTotalItems() }}</h4>
            <small class="text-muted">Total d'items</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <i class="fa-solid fa-layer-group stat-icon text-info"></i>
          <div>
            <h4 class="fw-bold mb-0 text-muted">{{ getTotalLots() }}</h4>
            <small class="text-muted">Lots actifs</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <i class="fa-solid fa-money-bill-wave stat-icon text-success"></i>
          <div>
            <h4 class="fw-bold mb-0 text-muted">{{ getTotalValue() | number:'1.0-0' }} FCFA</h4>
            <small class="text-muted">Valeur Totale</small>
          </div>
        </div>
      </div>

      <div class="col-md-3">
        <div class="stat-card">
          <i class="fa-solid fa-tools stat-icon text-warning"></i>
          <div>
            <h4 class="fw-bold mb-0 text-muted">{{ totalPrestations }}</h4>
            <small class="text-muted">Total Prestations</small>
          </div>
        </div>
      </div>
    </div>

    <!-- SEARCH & FILTERS -->
    <div class="card shadow-sm border-0 rounded-3 mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label fw-semibold">Recherche</label>
            <div class="input-group">
              <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input type="text" class="form-control" placeholder="Nom, description ou lot..." 
                     [(ngModel)]="searchTerm" (input)="applyFilters()">
            </div>
          </div>
          
          <div class="col-md-3">
            <label class="form-label fw-semibold">Filtrer par Lot</label>
            <select class="form-select" [(ngModel)]="selectedLotFilter" (ngModelChange)="onLotFilterChange($event)">
              <option [ngValue]="null">Tous les lots</option>
              <option *ngFor="let lot of lots" [ngValue]="lot.contractIds[0]">Lot {{ lot.lot }} ({{ lot.villes.join(', ') }})</option>
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
              <th>Prestations/Max</th>
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
                  <button class="btn btn-warning btn-action" (click)="onEdit(item)" title="Modifier l'item">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-danger btn-action" (click)="onDelete(item)" title="Supprimer l'item">
                    <i class="fa-solid fa-trash"></i>
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
        <p class="mt-2">Chargement des items...</p>
      </div>
    </ng-template>

    <!-- ITEM MODAL -->
    <div class="modal fade show d-block" tabindex="-1" *ngIf="showForm" (click)="cancelEdit()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-primary text-white rounded-top-4">
            <h5 class="modal-title">
              <i class="fa-solid me-2" [class]="isViewing ? 'fa-eye text-info' : isEditing ? 'fa-pen-to-square text-warning' : 'fa-plus-circle text-success'"></i>
              {{ isViewing ? 'Détails' : isEditing ? 'Modifier' : 'Créer' }} un Item
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="cancelEdit()"></button>
          </div>
          <div class="modal-body">
            <form [formGroup]="itemForm" (ngSubmit)="onSubmit()">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Nom Item *</label>
                    <input formControlName="nomItem" type="text" class="form-control" 
                           placeholder="Ex: Clavier sans fil Logitech MX Keys">
                    <div class="form-text">Nom descriptif de l'item</div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Lot d'appartenance</label>
                    <select formControlName="lot" class="form-select">
                      <option value="">Aucun lot</option>
                      <option *ngFor="let lot of lots" [value]="lot.contractIds[0]">Lot {{ lot.lot }} ({{ lot.villes.join(', ') }})</option>
                    </select>
                    <div class="form-text">Associer cet item à un lot géographique</div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Prix Unitaire (FCFA) *</label>
                    <input formControlName="prix" type="number" class="form-control"
                           min="0" step="0.01" placeholder="0">
                    <div class="form-text">Prix d'achat unitaire</div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">Qté Max/Trimestre *</label>
                    <input formControlName="quantiteMaxTrimestre" type="number" class="form-control"
                           min="1" placeholder="100">
                    <div class="form-text">Quantité maximale autorisée par trimestre</div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Description</label>
                <textarea formControlName="description" rows="3" class="form-control"
                          placeholder="Décrivez les spécifications, caractéristiques et utilisation de l'item..."></textarea>
                <div class="form-text">{{ itemForm.get('description')?.value?.length || 0 }}/500 caractères</div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Équipements concernés</label>
                <div class="border rounded p-3 bg-light" style="max-height: 200px; overflow-y: auto;">
                  <div *ngFor="let equipement of equipements" class="form-check mb-2">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [id]="'equip-' + equipement.id"
                      [checked]="isEquipementSelected(equipement)"
                      (change)="toggleEquipement(equipement)"
                      [disabled]="isViewing">
                    <label class="form-check-label" [for]="'equip-' + equipement.id">
                      {{ equipement.nomEquipement }}
                    </label>
                  </div>
                  <div *ngIf="equipements.length === 0" class="text-muted">
                    Aucun équipement disponible
                  </div>
                </div>
                <div class="form-text">Sélectionnez les équipements concernés par cet item</div>
              </div>

              <!-- Display selected equipment when viewing -->
              <div class="mb-3" *ngIf="isViewing">
                <label class="form-label fw-semibold">Équipements concernés</label>
                <div class="equipement-list border rounded p-3 bg-light">
                  <div *ngFor="let equipement of (itemForm.get('equipements')?.value || [])" class="badge bg-primary me-2 mb-2">
                    {{ equipement.nomEquipement }}
                  </div>
                  <div *ngIf="(itemForm.get('equipements')?.value || []).length === 0" class="text-muted">
                    Aucun équipement sélectionné
                  </div>
                </div>
              </div>

              <!-- Preview Section -->
              <div class="preview-section border rounded p-3 bg-light mt-3" *ngIf="!isViewing">
                <h6 class="fw-semibold mb-3"><i class="fa-solid fa-eye me-2"></i>Aperçu</h6>
                <div class="row">
                  <div class="col-md-6">
                    <strong>Valeur totale estimée:</strong> 
                    {{ (itemForm.get('prix')?.value * itemForm.get('quantiteMaxTrimestre')?.value) | number:'1.0-0' }} FCFA
                  </div>
                  <div class="col-md-6">
                    <strong>Statut:</strong> 
                    <span class="badge" [ngClass]="getPreviewStatusClass()">
                      {{ getPreviewStatus() }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="text-end mt-4">
                <button type="button" class="btn btn-outline-secondary me-2" (click)="cancelEdit()">
                  {{ isViewing ? 'Fermer' : 'Annuler' }}
                </button>
                <button *ngIf="!isViewing" type="submit" class="btn btn-primary" [disabled]="itemForm.invalid || loading">
                  <i class="fa-solid fa-save me-1"></i> 
                  {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- LOT MANAGER MODAL -->
    <div class="modal fade show d-block" tabindex="-1" *ngIf="showLotManagerModal" (click)="closeLotManager()">
      <div class="modal-dialog modal-xl" (click)="$event.stopPropagation()">
        <div class="modal-content border-0 shadow-lg rounded-4">
          <div class="modal-header bg-info text-white rounded-top-4">
            <h5 class="modal-title">
              <i class="fa-solid fa-layer-group me-2"></i>Gestionnaire de Lots
            </h5>
            <button type="button" class="btn-close btn-close-white" (click)="closeLotManager()"></button>
          </div>
          <div class="modal-body">
            <lot-manager
              [lots]="transformLotsForManager(lots)"
              [items]="items">
            </lot-manager>
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

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      min-height: 45px;
    }

    .tag {
      cursor: pointer;
      padding: 0.25rem 0.5rem;
    }

    .tag-input {
      border: none;
      outline: none;
      flex: 1;
      min-width: 120px;
    }

    .preview-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
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
export class ItemListComponent implements OnInit {
   items: Item[] = [];
   filteredItems: Item[] = [];
   lots: LotWithContractorDto[] = [];
   equipements: Equipement[] = [];
   searchTerm = '';
   selectedLotFilter: number | null = null;
   showForm = false;
   showLotManagerModal = false;
   isEditing = false;
   isViewing = false;
   loading = false;
   itemForm!: FormGroup;
   currentItem: Item | null = null;
   totalPrestations = 0;
   prestationsCountByItem: { [itemId: number]: number } = {};

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private prestationService: PrestationService,
    private equipementService: EquipementService,
    private lotService: LotService,
    private toast: ToastService,
    private confirm: ConfirmationService
  ) {}

  ngOnInit() {
    this.initForm();
    this.loadItems();
    this.loadLots();
    this.loadEquipements();
    this.loadTotalPrestations();
  }

  initForm() {
    this.itemForm = this.fb.group({
      nomItem: ['', [Validators.required, Validators.minLength(3)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      quantiteMaxTrimestre: [1, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.maxLength(500)]],
      lot: [''],
      equipements: [[]]
    });
  }


  loadItems() {
    this.loading = true;
    // Charger les items complets ET les statistiques
    Promise.all([
      this.itemService.getAllItems().toPromise(),
      this.itemService.getItemsStatistiques().toPromise()
    ]).then(([items, itemsStats]) => {
      // Fusionner les données complètes avec les statistiques
      this.items = (items || []).map(item => {
        const stat = (itemsStats || []).find(s => s.id === item.id);
        return {
          ...item,
          quantiteUtilisee: stat ? stat.quantiteUtilisee : 0,
          quantiteUtiliseeTrimestre: stat ? stat.quantiteUtiliseeTrimestre : 0
        };
      });
      this.filteredItems = [...this.items];
      this.loading = false;
    }).catch(() => {
      this.loading = false;
      this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des données' });
    });
  }

  loadLots() {
    this.lotService.getAllLots().subscribe({
      next: (lots) => {
        console.log('Loaded lots:', lots);
        this.lots = lots;
      },
      error: (error) => {
        console.error('Error loading lots:', error);
        this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des lots' });
        // Fallback to empty array
        this.lots = [];
      }
    });
  }

  loadEquipements() {
    this.equipementService.getAllEquipements().subscribe({
      next: (equipements) => {
        this.equipements = equipements;
      },
      error: (error) => {
        console.error('Error loading equipements:', error);
        this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des équipements' });
      }
    });
  }

  loadTotalPrestations() {
    this.prestationService.getAllPrestations(0, 1).subscribe({
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

    // Use API calls for better filtering
    this.loading = true;

    // Filtrer localement pour éviter les rechargements
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm || 
        item.nomItem.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesLot = !this.selectedLotFilter || 
        (item.lot && item.lot === this.selectedLotFilter.toString());
      
      return matchesSearch && matchesLot;
    });
    
    this.loading = false;
  }

  onLotFilterChange(event: any) {
    console.log('Lot filter changed:', event, this.selectedLotFilter);
    // Ensure the model is updated before applying filters
    setTimeout(() => {
      console.log('Applying filters with selectedLotFilter:', this.selectedLotFilter);
      this.applyFilters();
    }, 0);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedLotFilter = null;
    this.applyFilters();
  }

  // Méthodes utilitaires
  getTotalItems() { return this.items.length; }
  getTotalLots() { return this.lots.length; }
  getTotalValue() { return this.items.reduce((a, b) => a + (b.prix || 0), 0); }

  getLotName(lotId: string): string {
    const lot = this.lots.find(l => l.contractIds.includes(lotId));
    return lot ? `Lot ${lot.lot} (${lot.villes.join(', ')})` : 'Lot inconnu';
  }

  getLotBadgeClass(lotId: string): string {
    const lot = this.lots.find(l => l.contractIds.includes(lotId));
    return lot ? 'bg-primary' : 'bg-secondary';
  }

  getItemStatus(item: Item): string {
    const usageRatio = (item.quantiteUtilisee || 0) / item.quantiteMaxTrimestre;
    if (usageRatio >= 0.8) return 'CRITIQUE';
    if (usageRatio >= 0.5) return 'ATTENTION';
    return 'NORMAL';
  }

  getItemStatusClass(item: Item): string {
    const status = this.getItemStatus(item);
    switch(status) {
      case 'CRITIQUE': return 'bg-danger';
      case 'ATTENTION': return 'bg-warning';
      default: return 'bg-success';
    }
  }

  calculatePrestationsCountForItems(prestations: any[]) {
    this.prestationsCountByItem = {};

    // Compter le nombre de prestations par item
    prestations.forEach(prestation => {
      if (prestation.itemsUtilises && Array.isArray(prestation.itemsUtilises)) {
        prestation.itemsUtilises.forEach((item: any) => {
          const itemId = item.id || item.idItem;
          if (itemId) {
            this.prestationsCountByItem[itemId] = (this.prestationsCountByItem[itemId] || 0) + 1;
          }
        });
      }
    });
  }

  getPrestationsCountForItem(item: Item): number {
    return item.quantiteUtilisee || 0;
  }

  isItemCritical(item: Item): boolean {
    return this.getItemStatus(item) === 'CRITIQUE';
  }


  // Gestion des lots - Les lots sont maintenant dérivés des contrats actifs
  showLotManager() {
    this.showLotManagerModal = true;
  }

  closeLotManager() {
    this.showLotManagerModal = false;
  }

  transformLotsForManager(lots: LotWithContractorDto[]): any[] {
    return lots.map(lot => ({
      id: lot.contractIds[0] || 0,
      nomLot: lot.villes.join(', '),
      codeLot: lot.lot
    }));
  }

  // Note: Les lots sont maintenant en lecture seule car ils sont dérivés des contrats actifs
  // Les méthodes CRUD ne sont plus nécessaires

  // Gestion des items
  onAdd() {
    this.showForm = true;
    this.isEditing = false;
    this.isViewing = false;
    this.itemForm.reset({
      prix: 0,
      quantiteMaxTrimestre: 1,
      equipements: []
    });
    this.itemForm.enable();
  }

  onEdit(item: Item) {
    this.showForm = true;
    this.isEditing = true;
    this.isViewing = false;
    this.currentItem = item;
    const formData = {
      ...item,
      lot: item.lot ? parseInt(item.lot) : '',
      equipements: item.equipements || []
    };
    this.itemForm.patchValue(formData);
    this.itemForm.enable();
  }

  cancelEdit() {
    this.showForm = false;
    this.isViewing = false;
    this.currentItem = null;
    this.itemForm.enable();
  }

  viewItem(item: Item) {
    this.showForm = true;
    this.isEditing = false;
    this.isViewing = true;
    const formData = {
      ...item,
      lot: item.lot ? parseInt(item.lot) : '',
      equipements: item.equipements || []
    };
    this.itemForm.patchValue(formData);
    this.itemForm.disable();
  }

  async onDelete(item: Item) {
    const confirmed = await this.confirm.show({
      title: 'Supprimer l\'item',
      message: `Voulez-vous vraiment supprimer "${item.nomItem}" ? Cette action est irréversible.`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      const itemId = item.id || item.idItem!;
      this.itemService.deleteItem(itemId).subscribe({
        next: () => {
          this.loadItems();
          this.toast.show({ type: 'success', title: 'Succès', message: 'Item supprimé avec succès' });
        },
        error: () => {
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression' });
        }
      });
    }
  }

  onSubmit() {
    if (this.itemForm.invalid) return;

    this.loading = true;
    const formData = this.itemForm.value;
    const itemData = {
      ...formData,
      lot: formData.lot ? formData.lot.toString() : ''
    };

    if (this.isEditing && (this.currentItem?.id || this.currentItem?.idItem)) {
      const itemId = this.currentItem.id || this.currentItem.idItem!;
      this.itemService.updateItem(itemId, itemData).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.currentItem = null;
          this.loadItems();
          this.toast.show({ type: 'success', title: 'Succès', message: 'Item modifié avec succès' });
        },
        error: () => {
          this.loading = false;
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
        }
      });
    } else {
      this.itemService.createItem(itemData).subscribe({
        next: () => {
          this.loading = false;
          this.showForm = false;
          this.loadItems();
          this.toast.show({ type: 'success', title: 'Succès', message: 'Item créé avec succès' });
        },
        error: () => {
          this.loading = false;
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
        }
      });
    }
  }

  // Preview methods
  getPreviewStatus(): string {
    const prix = this.itemForm.get('prix')?.value || 0;
    const max = this.itemForm.get('quantiteMaxTrimestre')?.value || 1;
    const total = prix * max;
    
    if (total > 1000000) return 'HAUTE VALEUR';
    if (total > 100000) return 'MOYENNE VALEUR';
    return 'STANDARD';
  }

  getPreviewStatusClass(): string {
    const status = this.getPreviewStatus();
    switch(status) {
      case 'HAUTE VALEUR': return 'bg-danger';
      case 'MOYENNE VALEUR': return 'bg-warning';
      default: return 'bg-success';
    }
  }

  toggleEquipement(equipement: Equipement): void {
    if (this.isViewing) return;

    const currentEquipements = this.itemForm.get('equipements')?.value || [];
    const index = currentEquipements.findIndex((e: Equipement) => e.id === equipement.id);

    if (index > -1) {
      currentEquipements.splice(index, 1);
    } else {
      currentEquipements.push(equipement);
    }

    this.itemForm.get('equipements')?.setValue([...currentEquipements]);
  }

  isEquipementSelected(equipement: Equipement): boolean {
    const currentEquipements = this.itemForm.get('equipements')?.value || [];
    return currentEquipements.some((e: Equipement) => e.id === equipement.id);
  }


}
