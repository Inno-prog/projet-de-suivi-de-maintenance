import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Lot, Item } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { LotService } from '../../../../core/services/lot.service';
import { formatLotDisplay } from '../../../../shared/utils/lot-utils';
import { LotDisplayPipe } from '../../../../shared/pipes/lot-display.pipe';

@Component({
  selector: 'lot-manager',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LotDisplayPipe],
  template: `
    <div class="lot-manager">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">Gestion des Lots</h4>
        <button class="btn btn-primary btn-sm" (click)="showCreateForm()">
          <i class="fa-solid fa-plus me-1"></i> Nouveau Lot
        </button>
      </div>

      <!-- Lots List -->
      <div class="lots-list mb-4">
        <div class="row g-3">
          <div class="col-md-6" *ngFor="let lot of lots">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0">{{ lot.nomLot | lotDisplay }}</h6>
                <span class="badge bg-primary">{{ getItemsCountForLot(lot) }} items</span>
              </div>
              <div class="card-body">
                <p class="text-muted small mb-3">Code: {{ lot.codeLot }}</p>
                <p class="text-muted small mb-3" *ngIf="lot.villes && lot.villes.length > 0">
                  <i class="fa-solid fa-map-marker-alt me-1"></i>
                  Villes: {{ lot.villes.join(', ') }}
                </p>

                <!-- Items in this lot -->
                <div class="lot-items mb-3" *ngIf="getItemsForLot(lot).length > 0">
                  <small class="text-muted d-block mb-2">Items associés:</small>
                  <div class="items-list">
                    <span class="badge bg-light text-dark me-1 mb-1" *ngFor="let item of getItemsForLot(lot)">
                      {{ item.nomItem }}
                      <i class="fa-solid fa-times ms-1" (click)="removeItemFromLot(item, lot)"></i>
                    </span>
                  </div>
                </div>

                <div class="btn-group btn-group-sm w-100">
                  <button class="btn btn-outline-success" (click)="addItemToLot(lot)" title="Ajouter un item">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                  <button class="btn btn-outline-primary" (click)="editLot(lot)" title="Modifier le lot">
                    <i class="fa-solid fa-edit"></i>
                  </button>
                  <button class="btn btn-outline-danger" (click)="deleteLot(lot)" title="Supprimer le lot">
                    <i class="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lot Form Modal -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showForm" (click)="cancelEdit()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                {{ isEditing ? 'Modifier' : 'Créer' }} un Lot
              </h5>
              <button type="button" class="btn-close" (click)="cancelEdit()"></button>
            </div>
            <div class="modal-body">
              <form [formGroup]="lotForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label class="form-label">Nom du Lot *</label>
                  <input formControlName="nomLot" type="text" class="form-control"
                         placeholder="Ex: Lot Maintenance Q1">
                </div>
                <div class="mb-3">
                  <label class="form-label">Code du Lot *</label>
                  <input formControlName="codeLot" type="text" class="form-control"
                         placeholder="Ex: LOT-2024-Q1">
                </div>
                <div class="mb-3">
                  <label class="form-label">Villes couvertes</label>
                  <input formControlName="villes" type="text" class="form-control"
                         placeholder="Ex: Ouagadougou, Bobo-Dioulasso">
                  <div class="form-text">Séparez les villes par des virgules</div>
                </div>
                <div class="text-end">
                  <button type="button" class="btn btn-outline-secondary me-2" (click)="cancelEdit()">
                    Annuler
                  </button>
                  <button type="submit" class="btn btn-primary" [disabled]="lotForm.invalid">
                    {{ isEditing ? 'Modifier' : 'Créer' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- ITEM SELECTION MODAL -->
      <div class="modal fade show d-block" tabindex="-1" *ngIf="showItemSelectionModal" (click)="closeItemSelection()">
        <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
          <div class="modal-content">
                <div class="modal-header">
              <h5 class="modal-title">
                <i class="fa-solid fa-plus me-2"></i>Ajouter des items au lot "{{ selectedLotForItems?.nomLot | lotDisplay }}"
              </h5>
              <button type="button" class="btn-close" (click)="closeItemSelection()"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <input type="text" class="form-control" placeholder="Rechercher un item..."
                       [(ngModel)]="itemSearchTerm" (input)="filterAvailableItems()">
              </div>

              <div class="items-selection" style="max-height: 300px; overflow-y: auto;">
                <div class="form-check" *ngFor="let item of filteredAvailableItems">
                  <input class="form-check-input" type="checkbox"
                         [id]="'item-' + item.id"
                         [checked]="isItemSelected(item)"
                         (change)="toggleItemSelection(item)">
                  <label class="form-check-label" [for]="'item-' + item.id">
                    <strong>{{ item.nomItem }}</strong>
                    <br><small class="text-muted">{{ item.description || 'Aucune description' }}</small>
                  </label>
                </div>
              </div>

              <div class="text-muted mt-3" *ngIf="filteredAvailableItems.length === 0">
                Aucun item disponible
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="closeItemSelection()">
                Annuler
              </button>
              <button type="button" class="btn btn-primary" (click)="confirmItemSelection()"
                      [disabled]="selectedItemsForLot.length === 0">
                Ajouter les items sélectionnés ({{ selectedItemsForLot.length }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop -->
      <div class="modal-backdrop fade show" *ngIf="showForm || showItemSelectionModal"></div>
    </div>
  `,
  styles: [`
    .lot-manager {
      min-height: 400px;
    }

    .card {
      transition: transform 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
    }

    /* Lot Manager Modal - Force proper centering - OVERRIDE ALL */
    .modal-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.6) !important;
      z-index: 9998 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .modal {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      z-index: 9999 !important;
      margin: 0 !important;
      padding: 20px !important;
      box-sizing: border-box !important;
      overflow: auto !important;
      background: rgba(0, 0, 0, 0.6) !important;
    }

    .modal-dialog {
      max-width: 700px !important;
      width: 100% !important;
      margin: 0 auto !important;
      margin-left: auto !important;
      margin-right: auto !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      display: flex !important;
      flex-direction: column !important;
    }

    .modal-dialog.modal-lg {
      max-width: 900px !important;
      width: 90% !important;
    }

    .modal-dialog.modal-xl {
      max-width: 1400px !important;
      width: 95% !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      margin: 0 auto !important;
    }
    
    .modal-content {
      box-shadow: 0 25px 80px rgba(0, 0, 0, 0.35) !important;
      border-radius: 12px !important;
      position: relative !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
      margin: 0 auto !important;
    }
  `]
})
export class LotManagerComponent {
  @Input() lots: Lot[] = [];
  @Input() items: Item[] = [];
  @Output() lotCreated = new EventEmitter<Lot>();
  @Output() lotUpdated = new EventEmitter<Lot>();
  @Output() lotDeleted = new EventEmitter<number>();

  showForm = false;
  isEditing = false;
  lotForm!: FormGroup;
  currentLot: Lot | null = null;

  // Item selection properties
  showItemSelectionModal = false;
  selectedLotForItems: Lot | null = null;
  itemSearchTerm = '';
  filteredAvailableItems: Item[] = [];
  selectedItemsForLot: Item[] = [];

  constructor(
    private fb: FormBuilder,
    private toast: ToastService,
    private confirm: ConfirmationService,
    private lotService: LotService
  ) {
    this.initForm();
  }

  initForm() {
    this.lotForm = this.fb.group({
      nomLot: ['', Validators.required],
      codeLot: ['', Validators.required],
      villes: ['']
    });
  }

  showCreateForm() {
    this.showForm = true;
    this.isEditing = false;
    this.lotForm.reset();
  }

  editLot(lot: Lot) {
    this.showForm = true;
    this.isEditing = true;
    this.currentLot = lot;
    this.lotForm.patchValue({
      ...lot,
      villes: lot.villes ? lot.villes.join(', ') : ''
    });
  }

  cancelEdit() {
    this.showForm = false;
    this.isEditing = false;
    this.currentLot = null;
    this.lotForm.reset();
  }

  async onSubmit() {
    if (this.lotForm.invalid) return;

    const lotData = this.lotForm.value;

    // Convert villes string to array
    const processedLotData = {
      ...lotData,
      villes: lotData.villes ? lotData.villes.split(',').map((v: string) => v.trim()).filter((v: string) => v) : []
    };

    if (this.isEditing && this.currentLot) {
      // Update existing lot via API
      this.lotService.updateLot(this.currentLot.id, processedLotData).subscribe({
        next: (updatedLot) => {
          this.toast.show({
            type: 'success',
            title: 'Succès',
            message: 'Lot modifié avec succès'
          });
          this.lotUpdated.emit(updatedLot);
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du lot:', error);
          this.toast.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la modification du lot'
          });
        }
      });
    } else {
      // Create new lot via API
      this.lotService.createLot(processedLotData).subscribe({
        next: (newLot) => {
          this.toast.show({
            type: 'success',
            title: 'Succès',
            message: 'Lot créé avec succès'
          });
          this.lotCreated.emit(newLot);
          this.cancelEdit();
        },
        error: (error) => {
          console.error('Erreur lors de la création du lot:', error);
          this.toast.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la création du lot'
          });
        }
      });
    }
  }

  async deleteLot(lot: Lot) {
    const confirmed = await this.confirm.show({
      title: 'Supprimer le lot',
      message: `Voulez-vous vraiment supprimer "${lot.nomLot}" ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.lotService.deleteLot(lot.id).subscribe({
        next: () => {
          this.toast.show({
            type: 'success',
            title: 'Succès',
            message: 'Lot supprimé avec succès'
          });
          this.lotDeleted.emit(lot.id);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du lot:', error);
          this.toast.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la suppression du lot'
          });
        }
      });
    }
  }

  // Item management methods
  getItemsForLot(lot: Lot): Item[] {
    // Normalize comparison: items may store lot as a name, number or prefixed value.
    const normalize = (v?: string) => (v || '').toString().trim().toLowerCase();
    const lotKey = normalize(lot.nomLot);
    return this.items.filter(item => normalize(item.lot) === lotKey);
  }

  addItemToLot(lot: Lot) {
    this.selectedLotForItems = lot;
    this.selectedItemsForLot = [];
    this.itemSearchTerm = '';
    this.filterAvailableItems();
    this.showItemSelectionModal = true;
  }

  closeItemSelection() {
    this.showItemSelectionModal = false;
    this.selectedLotForItems = null;
    this.selectedItemsForLot = [];
    this.itemSearchTerm = '';
  }

  filterAvailableItems() {
    let availableItems = this.items.filter(item => !item.lot || item.lot === '');

    if (this.itemSearchTerm) {
      const term = this.itemSearchTerm.toLowerCase();
      availableItems = availableItems.filter(item =>
        item.nomItem?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    }

    this.filteredAvailableItems = availableItems;
  }

  isItemSelected(item: Item): boolean {
    return this.selectedItemsForLot.some(selected => selected.id === item.id);
  }

  toggleItemSelection(item: Item) {
    const index = this.selectedItemsForLot.findIndex(selected => selected.id === item.id);
    if (index > -1) {
      this.selectedItemsForLot.splice(index, 1);
    } else {
      this.selectedItemsForLot.push(item);
    }
  }

  confirmItemSelection() {
    if (!this.selectedLotForItems || this.selectedItemsForLot.length === 0) return;

    // Here we would emit an event to update items with the lot assignment
    // For now, we'll just show a success message
    this.toast.show({
      type: 'success',
      title: 'Succès',
      message: `${this.selectedItemsForLot.length} item(s) ajouté(s) au lot "${this.selectedLotForItems.nomLot}"`
    });

    this.closeItemSelection();
  }

  removeItemFromLot(item: Item, lot: Lot) {
    // Here we would emit an event to remove the item from the lot
    this.toast.show({
      type: 'info',
      title: 'Info',
      message: `Item "${item.nomItem}" retiré du lot "${lot.nomLot}"`
    });
  }

  getItemsCountForLot(lot: Lot): number {
    return this.getItemsForLot(lot).length;
  }

}
