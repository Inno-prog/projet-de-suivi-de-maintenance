import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ItemService } from '../../../../core/services/item.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Item, Equipement, LotWithContractorDto, Lot } from '../../../../core/models/business.models';
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
    </div>

    <!-- Statistics Cards -->
    <div class="stats-overview mb-5">
      <div class="stat-card total-items-card shadow-sm" style="background: white; border: none; border-radius: 0;">
        <div class="stat-icon-wrapper">
          <div class="stat-icon-bg" style="background: #f8f9fa; border-radius: 0;">
            <span class="sticker-icon bg-primary text-white">
              <i class="fa-solid fa-boxes-stacked"></i>
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getTotalItems() }}</div>
          <div class="stat-label">Total Items</div>
          <div class="stat-subtitle">Tous les items</div>
        </div>
      </div>

      <div class="stat-card active-lots-card shadow-sm" style="background: white; border: none; border-radius: 0;">
        <div class="stat-icon-wrapper">
          <div class="stat-icon-bg" style="background: #f8f9fa; border-radius: 0;">
            <span class="sticker-icon bg-success text-white">
              <i class="fa-solid fa-layer-group"></i>
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getTotalLots() }}</div>
          <div class="stat-label">Lots Actifs</div>
          <div class="stat-subtitle">Lots disponibles</div>
        </div>
      </div>

      <div class="stat-card total-value-card shadow-sm" style="background: white; border: none; border-radius: 0;">
        <div class="stat-icon-wrapper">
          <div class="stat-icon-bg" style="background: #f8f9fa; border-radius: 0;">
            <span class="sticker-icon bg-warning text-white">
              <i class="fa-solid fa-money-bill-wave"></i>
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ getTotalValue() | number:'1.0-0' }}</div>
          <div class="stat-label">Valeur Totale</div>
          <div class="stat-subtitle">FCFA</div>
        </div>
      </div>

      <div class="stat-card prestations-card shadow-sm" style="background: white; border: none; border-radius: 0;">
        <div class="stat-icon-wrapper">
          <div class="stat-icon-bg" style="background: #f8f9fa; border-radius: 0;">
            <span class="sticker-icon bg-info text-white">
              <i class="fa-solid fa-check-circle"></i>
            </span>
          </div>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalPrestations }}</div>
          <div class="stat-label">Total Prestations</div>
          <div class="stat-subtitle">Utilisations</div>
        </div>
      </div>
    </div>

    <!-- BUTTONS BAR -->
    <div class="d-flex justify-content-end gap-2 mb-4">
      <button class="btn btn-outline-primary shadow-sm" (click)="showLotManager()">
        <i class="fa-solid fa-layer-group me-2"></i> Gérer les Lots
      </button>
      <button class="btn btn-primary shadow-sm" (click)="onAdd()">
        <i class="fa-solid fa-plus-circle me-2"></i> Ajouter un Item
      </button>
    </div>

    <!-- LOT SELECTION VIEW -->
    <div *ngIf="!selectedLot && !loading; else itemsView">
      

      <!-- LOTS GRID -->
      <div *ngIf="lots && lots.length > 0; else noLots" class="row g-4">
        <div class="col-xl-4 col-lg-6 col-md-6" *ngFor="let lot of lots">
          <div class="lot-selection-card card h-100 border-0 shadow-sm hover-lift cursor-pointer"
               (click)="selectLot(lot)">
            <div class="card-body d-flex flex-column text-center p-4">
              <!-- LOT ICON -->
              <div class="lot-icon mx-auto mb-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                <i class="fa-solid fa-layer-group fa-xl"></i>
              </div>

          <!-- LOT NAME -->
          <h5 class="card-title fw-bold text-primary mb-2">
            {{ formatLotLabel(lot.lot) }}
          </h5>

              <!-- LOT REGIONS -->
              <p class="text-muted small mb-3 flex-grow-1">
                <i class="fa-solid fa-map-marker-alt me-1"></i>
                {{ lot.regions.join(', ') }}
              </p>

              <!-- LOT STATS -->
              <div class="lot-stats-grid mt-auto">
                <div class="row g-2">
                  <div class="col-4">
                    <div class="stat-box p-2 bg-light rounded text-center">
                      <div class="fw-bold text-primary">{{ getItemsCountForLot(lot) }}</div>
                      <small class="text-muted">Items</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-box p-2 bg-light rounded text-center">
                      <div class="fw-bold text-success">{{ getLotTotalValue(getItemsForLot(lot)) | number:'1.0-0' }}</div>
                      <small class="text-muted">FCFA</small>
                    </div>
                  </div>
                  <div class="col-4">
                    <div class="stat-box p-2 bg-light rounded text-center">
                      <div class="fw-bold text-info">{{ getLotTotalPrestations(getItemsForLot(lot)) }}</div>
                      <small class="text-muted">Prest.</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CLICK INDICATOR -->
              <div class="mt-3 text-primary">
                <small><i class="fa-solid fa-mouse-pointer me-1"></i>Cliquez pour voir les items</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NO LOTS -->
      <ng-template #noLots>
        <div class="text-center py-5">
          <div class="empty-state-icon mb-4">
            <i class="fa-solid fa-layer-group fa-4x text-muted"></i>
          </div>
          <h4 class="text-muted mb-2">Aucun lot disponible</h4>
          <p class="text-muted">Il n'y a actuellement aucun lot dans le système.</p>
        </div>
      </ng-template>
    </div>

    <!-- ITEMS VIEW FOR SELECTED LOT -->
    <ng-template #itemsView>
      <div *ngIf="!loading; else loadingTemplate">
        <!-- BACK BUTTON AND LOT HEADER -->
        <div class="d-flex align-items-center justify-content-between mb-4">
          <div class="d-flex align-items-center gap-3">
            <button class="btn btn-lg btn-back-sidebar" (click)="backToLots()">
              <i class="bi bi-arrow-left-circle me-2"></i>
              Retour aux lots
            </button>
            <div *ngIf="selectedLot">
                <h2 class="h4 fw-bold text-primary mb-0">
                <i class="fa-solid fa-layer-group me-2"></i>
                {{ formatLotLabel(selectedLot.lot) }}
              </h2>
              <p class="text-muted small mb-0">
                <i class="fa-solid fa-map-marker-alt me-1"></i>
                {{ selectedLot.regions.join(', ') }}
              </p>
            </div>
          </div>
          <div class="lot-summary-stats d-flex gap-3">
            <div class="text-center px-3 py-2 bg-light rounded">
              <div class="fw-bold text-primary">{{ getItemsForSelectedLot().length }}</div>
              <small class="text-muted">Items</small>
            </div>
            <div class="text-center px-3 py-2 bg-light rounded">
              <div class="fw-bold text-success">{{ getLotTotalValue(getItemsForSelectedLot()) | number:'1.0-0' }} FCFA</div>
              <small class="text-muted">Valeur totale</small>
            </div>
          </div>
        </div>

        <!-- SEARCH FOR ITEMS -->
        <div class="card shadow-sm border-0 rounded-3 mb-4" *ngIf="getItemsForSelectedLot().length > 0">
          <div class="card-body">
            <div class="row g-3 align-items-end">
              <div class="col-md-4">
                <label class="form-label fw-semibold">Recherche</label>
                <div class="input-group">
                  <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass"></i></span>
                  <input type="text" class="form-control" placeholder="Nom, description ou lot..."
                         [(ngModel)]="searchTerm" (input)="applySearch()">
                </div>
              </div>

              <div class="col-md-3">
                <label class="form-label fw-semibold">Filtrer par Lot</label>
                <select class="form-select" [(ngModel)]="selectedLotFilter" (ngModelChange)="applySearch()">
                  <option [ngValue]="null">Tous les lots</option>
                  <option *ngFor="let lot of lots" [ngValue]="lot.lot">{{ formatLotLabel(lot.lot) }}</option>
                </select>
              </div>

              <div class="col-md-2">
                <button class="btn btn-outline-secondary w-100" (click)="clearSearch()" [disabled]="!searchTerm && !selectedLotFilter">
                  <i class="fa-solid fa-rotate-left"></i> Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ITEMS TABLE -->
        <div *ngIf="getItemsForSelectedLot().length > 0; else noItemsInLot" class="card shadow-sm border-0 rounded-3">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-primary text-primary">
                <tr>
                  <th>N°</th>
                  <th>Nom</th>
                  <th >Description</th>
                  <th>Prix Unitaire</th>
                  <th>Qté Max</th>
                  <th>Utilisation</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <!-- Group items by equipment -->
                <ng-container *ngFor="let equipmentGroup of groupedItemsByEquipement | keyvalue">
                  <!-- Equipment header row -->
                  <tr class="table-primary">
                    <td colspan="7" class="fw-bold text-primary">
                      <i class="fa-solid fa-tools me-2"></i>
                      {{ isEquipement(equipmentGroup.key) ? 
                         (equipmentGroup.key.numero ? equipmentGroup.key.numero + ' - ' : '') + equipmentGroup.key.nomEquipement : 
                         equipmentGroup.key }}
                    </td>
                  </tr>
                  <!-- Items for this equipment -->
                  <tr *ngFor="let item of equipmentGroup.value; let i = index" [class.table-warning]="isItemCritical(item)">
                    <td>
                      <span class="badge bg-primary-subtle text-primary fw-semibold">
                        #{{ getFormattedItemNumber(equipmentGroup.key, i + 1) }}
                      </span>
                    </td>
                    <td class="fw-semibold" [title]="item.nomItem">{{ item.nomItem }}</td>
                    <td class="text-muted" [title]="item.description || 'Aucune description'">{{ item.description || '-' }}</td>
                    <td>
                      <span class="text-success fw-semibold">{{ item.prix | number:'1.0-0' }} FCFA</span>
                    <td>
                      <span class="fw-bold fs-5">{{ item.quantiteMaxTrimestre }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div class="usage-indicator flex-grow-1">
                          <div class="progress" style="height: 8px;">
                            <div class="progress-bar" [ngClass]="getUsageProgressClass(item)"
                                 [style.width.%]="getUsagePercentage(item)">
                            </div>
                          </div>
                        </div>
                        <span class="fw-bold fs-5 text-muted">
                          {{ getPrestationsCountForItem(item) }}/{{ item.quantiteMaxTrimestre }}
                        </span>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex gap-1 justify-content-center">
                        <button class="btn btn-outline-info btn-sm" (click)="viewItem(item)" title="Voir les détails">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning btn-sm" (click)="onEdit(item)" title="Modifier l'item">
                          <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" (click)="onDelete(item)" title="Supprimer l'item">
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

        <!-- NO ITEMS IN LOT -->
        <ng-template #noItemsInLot>
          <div class="text-center py-5">
            <div class="empty-state-icon mb-4">
              <i class="fa-solid fa-box-open fa-4x text-muted"></i>
            </div>
            <h4 class="text-muted mb-2">Aucun item dans ce lot</h4>
            <p class="text-muted">Ce lot ne contient actuellement aucun item.</p>
            <button class="btn btn-primary" (click)="onAdd()">
              <i class="fa-solid fa-plus-circle me-2"></i>
              Ajouter un item
            </button>
          </div>
        </ng-template>
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
                      <option *ngFor="let lot of lots" [value]="lot.lot">{{ formatLotLabel(lot.lot) }}</option>
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
              [lots]="lotEntities"
              [items]="items"
              (lotCreated)="onLotCreated($event)"
              (lotUpdated)="onLotUpdated($event)"
              (lotDeleted)="onLotDeleted($event)">
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

    /* Modal centering fix for item-form modal-lg */
    .modal.fade.show .modal-dialog.modal-lg {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      margin: 0 !important;
      max-width: 900px !important;
      width: 90% !important;
    }

    /* Modal centering fix for lot-manager modal-xl */
    .modal.fade.show .modal-dialog.modal-xl {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      margin: 0 !important;
      max-width: 1400px !important;
      width: 95% !important;
    }

    /* Modal content centering */
    .modal.fade.show .modal-content {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      right: auto !important;
      bottom: auto !important;
      transform: none !important;
    }

    /* Modal backdrop fix */
    .modal.fade.show + .modal-backdrop {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 9998 !important;
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

    /* Lot Selection Cards */
    .lot-selection-card {
      transition: all 0.3s ease;
      border-radius: 1rem;
      cursor: pointer;
      overflow: hidden;
    }

    .lot-selection-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important;
      border-color: #0d6efd !important;
    }

    .hover-lift {
      transition: all 0.3s ease;
    }

    .hover-lift:hover {
      transform: translateY(-8px);
    }

    .cursor-pointer {
      cursor: pointer;
    }

    /* Modern Card Styles */
    .item-card {
      transition: all 0.3s ease;
      border-radius: 1rem;
      overflow: hidden;
    }

    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
    }

    .hover-shadow-lg {
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .hover-shadow-lg:hover {
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .lot-header {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-left: 4px solid #0d6efd !important;
    }

    .lot-icon {
      background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
    }

    .item-id {
      font-size: 0.75rem;
      font-weight: 600;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .usage-indicator .progress {
      background-color: #e9ecef;
      border-radius: 3px;
    }

    .usage-indicator .progress-bar {
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .empty-state-icon {
      opacity: 0.5;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .lot-stats {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .card-actions {
        flex-direction: column;
      }

      .card-actions .btn {
        width: 100%;
      }
    }

    /* Status badges */
    .badge {
      font-size: 0.7rem;
      padding: 0.375rem 0.5rem;
    }

    /* Individual action buttons */
    .table .btn {
      border-radius: 0.375rem !important;
      transition: all 0.2s ease;
      min-width: 32px;
      height: 32px;
      padding: 0.25rem 0.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .table .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Table enhancements */
    .table th {
      font-weight: 600;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.025em;
      border-bottom: 2px solid #dee2e6;
      text-align: left !important;
    }

    .table th.text-center {
      text-align: center !important;
    }

    .table td {
      vertical-align: middle;
    }

    /* Column width adjustments - compact layout */
    .table th:nth-child(1), .table td:nth-child(1) { /* ID */
      width: 60px;
      min-width: 60px;
      max-width: 80px;
    }

    .table th:nth-child(2), .table td:nth-child(2) { /* Nom */
      width: 150px;
      min-width: 120px;
      max-width: 200px;
    }

    .table th:nth-child(3), .table td:nth-child(3) { /* Description */
      width: 180px;
      min-width: 150px;
      max-width: 250px;
    }

    .table th:nth-child(4), .table td:nth-child(4) { /* Prix Unitaire */
      width: 100px;
      min-width: 100px;
      max-width: 120px;
    }

    .table th:nth-child(5), .table td:nth-child(5) { /* Qté Max */
      width: 80px;
      min-width: 80px;
      max-width: 100px;
    }

    .table th:nth-child(6), .table td:nth-child(6) { /* Utilisation */
      width: 120px;
      min-width: 120px;
      max-width: 140px;
    }

    .table th:nth-child(7), .table td:nth-child(7) { /* Actions */
      width: 160px;
      min-width: 160px;
    }

    /* Text truncation for compact columns */
    .table td:nth-child(2) {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .table td:nth-child(3) {
      max-height: 3em;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    /* Usage indicator in table */
    .usage-indicator {
      min-width: 80px;
    }

    .usage-indicator .progress {
      background-color: #e9ecef;
      border-radius: 4px;
    }

    /* Material Design Statistics Cards */
    .stats-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 16px;
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
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* Icon backgrounds with gradients */
    /* Use off-white circular backgrounds for stat icons and color the icon itself
       so the circle appears 'blanc-salé' while the icon shows the theme color. */
    .total-items-card .stat-icon-bg {
      background: #f3f2e8;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    }

    .active-lots-card .stat-icon-bg {
      background: #f3f2e8;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    }

    .total-value-card .stat-icon-bg {
      background: #f3f2e8;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    }

    .prestations-card .stat-icon-bg {
      background: #f3f2e8;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    }

    /* Color the icons (not the circle) to match the previous theme colors */
    .total-items-card .stat-icon { color: #1d4ed8; }
    .active-lots-card .stat-icon { color: #059669; }
    .total-value-card .stat-icon { color: #d97706; }
    .prestations-card .stat-icon { color: #7c3aed; }

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
      font-weight: 700;
      color: #374151;
      margin-bottom: 0.25rem;
    }

    .stat-subtitle {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
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
  `]
})
export class ItemListComponent implements OnInit {
   items: Item[] = [];
    filteredItems: Item[] = [];
    groupedItems: any[] = [];
    lots: LotWithContractorDto[] = [];
    lotEntities: Lot[] = []; // Add proper lot entities
    equipements: Equipement[] = [];
    searchTerm = '';
   selectedLotFilter: string | null = null;
    selectedLot: LotWithContractorDto | null = null; // Currently selected lot for viewing items
    showForm = false;
    showLotManagerModal = false;
    isEditing = false;
    isViewing = false;
    loading = false;
    itemForm!: FormGroup;
    currentItem: Item | null = null;
    totalPrestations = 0;
    prestationsCountByItem: { [itemId: number]: number } = {};

  // Group items by equipment - stored as property to avoid infinite loops
  groupedItemsByEquipement: Map<Equipement | string, Item[]> = new Map();

  updateGroupedItemsByEquipement() {
    const items = this.getItemsForSelectedLot();
    const grouped = new Map<string, { key: Equipement | string; items: Item[] }>();
    
    items.forEach(item => {
      // If item has equipment(s)
      if (item.equipements && item.equipements.length > 0) {
        item.equipements.forEach(equipement => {
          // Use unique key for equipment based on id or numero + nomEquipement
          const equipementKey = equipement.id ? 
            equipement.id.toString() : 
            `${equipement.numero || ''}-${equipement.nomEquipement}`.trim();
            
          if (!grouped.has(equipementKey)) {
            grouped.set(equipementKey, { key: equipement, items: [] });
          }
          grouped.get(equipementKey)?.items.push(item);
        });
      } else {
        // Items without equipment go to "Sans équipement" group
        if (!grouped.has('Sans équipement')) {
          grouped.set('Sans équipement', { key: 'Sans équipement', items: [] });
        }
        grouped.get('Sans équipement')?.items.push(item);
      }
    });
    
    // Convert back to Map with Equipement | string as key
    const result = new Map<Equipement | string, Item[]>();
    grouped.forEach(value => {
      result.set(value.key, value.items);
    });
    
    this.groupedItemsByEquipement = result;
  }

  constructor(
    private fb: FormBuilder,
    private itemService: ItemService,
    private prestationService: PrestationService,
    private equipementService: EquipementService,
    private lotService: LotService,
    private authService: AuthService,
    private toast: ToastService,
    private confirm: ConfirmationService
  ) {}

  // Helper to check if a group key is an Equipement object
  isEquipement(key: any): key is Equipement {
    return typeof key !== 'string' && 'nomEquipement' in key;
  }

  // Helper to get formatted item number (e.g., 5.1)
  getFormattedItemNumber(groupKey: Equipement | string, index: number): string {
    if (this.isEquipement(groupKey) && groupKey.numero) {
      return `${groupKey.numero}.${index}`;
    }
    return index.toString();
  }

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
      quantiteMinTrimestre: [0, [Validators.min(0)]],
      quantiteMaxTrimestre: [1, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.maxLength(500)]],
      lot: [''],
      equipements: [[]]
    });
  }


  loadItems() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    // Vérifier si l'utilisateur est un prestataire
    if (this.authService.isPrestataire() && currentUser?.id) {
      // Charger uniquement les items du prestataire via ses contrats
      console.log('[DEBUG] Loading items for prestataire:', currentUser.id);
      this.itemService.getItemsByPrestataire(currentUser.id).subscribe({
        next: (items) => {
          this.items = (items || []).map(item => ({
            ...item,
            quantiteUtilisee: item.quantiteUtilisee || 0
          }));
          this.filteredItems = [...this.items];
          this.groupItemsByLot();
          this.updateGroupedItemsByEquipement();
          this.loading = false;
          
          console.log('[DEBUG] Prestataire items loaded:', this.items.length);
        },
        error: (error) => {
          console.error('[DEBUG] Error loading prestataire items:', error);
          this.loading = false;
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des items' });
        }
      });
    } else {
      // Admin ou autre rôle : charger tous les items
      this.itemService.getAllItems().subscribe({
        next: (items) => {
          this.items = (items || []).map(item => ({
            ...item,
            quantiteUtilisee: item.quantiteUtilisee || 0
          }));
          this.filteredItems = [...this.items];
          this.groupItemsByLot();
          this.updateGroupedItemsByEquipement();
          this.loading = false;
        },
        error: (error) => {
          console.error('[DEBUG] Error loading items:', error);
          this.loading = false;
          this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des items' });
        }
      });
    }
  }

  loadLots() {
    // Load both contract-based lots and lot entities
    Promise.all([
      this.lotService.getAllLots().toPromise(),
      this.lotService.getAllLotEntities().toPromise()
    ]).then(([lots, lotEntities]) => {
      this.lots = lots || [];
      this.lotEntities = lotEntities || [];
    }).catch((error) => {
      console.error('Erreur lors du chargement des lots:', error);
      this.toast.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des lots' });
      // Fallback to empty arrays
      this.lots = [];
      this.lotEntities = [];
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
    this.prestationService.getPrestationsCount().subscribe({
      next: (count) => {
        this.totalPrestations = count;
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
       this.groupItemsByLot();
       this.updateGroupedItemsByEquipement();
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
         this.matchesLotFilter(item, this.selectedLotFilter);

       return matchesSearch && matchesLot;
     });

     this.groupItemsByLot();
     this.updateGroupedItemsByEquipement();
     this.loading = false;
    }

  private matchesLotFilter(item: Item, lotFilter: string): boolean {
    if (!item.lot) return false;

    const itemLot = item.lot.toString().trim();
    const filterValue = lotFilter.toString().trim();

    // Exact match
    if (itemLot === filterValue) return true;

    // Handle "Lot X" vs "X" format
    if (itemLot === `Lot ${filterValue}`) return true;
    if (`Lot ${itemLot}` === filterValue) return true;

    // Handle numeric matches
    const itemLotNum = itemLot.replace(/\D/g, '');
    const filterNum = filterValue.replace(/\D/g, '');
    if (itemLotNum && filterNum && itemLotNum === filterNum) return true;

    return false;
  }

  groupItemsByLot() {
    const grouped: { [key: string]: any } = {};

    this.filteredItems.forEach(item => {
      const lotKey = item.lot || '';
      const lotInfo = this.lots.find(l => l.lot === lotKey);

      if (!grouped[lotKey]) {
        grouped[lotKey] = {
          lotName: lotInfo ? this.formatLotLabel(lotInfo.lot) : (lotKey ? this.formatLotLabel(lotKey) : null),
          villes: lotInfo ? lotInfo.villes : [],
          items: []
        };
      }

      grouped[lotKey].items.push(item);
    });

    // Convert to array and sort: items without lot first, then by lot name
    this.groupedItems = Object.values(grouped).sort((a: any, b: any) => {
      if (!a.lotName && b.lotName) return -1;
      if (a.lotName && !b.lotName) return 1;
      return (a.lotName || '').localeCompare(b.lotName || '');
    });
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

  applySearch() {
    // For selected lot view, we filter the items for that specific lot
    // This is a simple implementation - in a real app you might want more sophisticated filtering
    // For now, we'll just trigger change detection
    setTimeout(() => {}, 0);
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedLotFilter = null;
  }

  selectLot(lot: LotWithContractorDto) {
    this.selectedLot = lot;
    this.selectedLotFilter = null; // Don't use filter when lot is selected
    this.searchTerm = ''; // Clear search when selecting a lot
    this.updateGroupedItemsByEquipement();
  }

  backToLots() {
    this.selectedLot = null;
    this.selectedLotFilter = null;
    this.searchTerm = '';
    this.filteredItems = [...this.items]; // Reset to all items
    this.updateGroupedItemsByEquipement();
  }

  getItemsForSelectedLot(): Item[] {
    if (!this.selectedLot) return [];
    return this.items.filter(item => this.matchesLot(item, this.selectedLot!));
  }

  private matchesLot(item: Item, lot: LotWithContractorDto): boolean {
    if (!item.lot) return false;

    const itemLot = item.lot.toString().trim();
    const lotIdentifier = lot.lot.toString().trim();

    // Exact match
    if (itemLot === lotIdentifier) return true;

    // Handle "Lot X" vs "X" format
    if (itemLot === `Lot ${lotIdentifier}`) return true;
    if (`Lot ${itemLot}` === lotIdentifier) return true;

    // Handle numeric matches
    const itemLotNum = itemLot.replace(/\D/g, '');
    const lotNum = lotIdentifier.replace(/\D/g, '');
    if (itemLotNum && lotNum && itemLotNum === lotNum) return true;

    return false;
  }

  getItemsForLot(lot: LotWithContractorDto): Item[] {
    return this.items.filter(item => this.matchesLot(item, lot));
  }

  getItemsCountForLot(lot: LotWithContractorDto): number {
    return this.getItemsForLot(lot).length;
  }

  // Méthodes utilitaires
  getTotalItems() { return this.items.length; }
  getTotalLots() { return this.lots.length; }
  getTotalValue() { return this.items.reduce((a, b) => a + (b.prix || 0), 0); }

  getLotName(lotId: string): string {
    const lot = this.lots.find(l => l.contractIds && l.contractIds.includes(lotId));
    return lot ? `${this.formatLotLabel(lot.lot)} (${(lot.regions || []).join(', ')})` : 'Lot inconnu';
  }

  /**
   * Normalise l'affichage du libellé d'un lot.
   */
  formatLotLabel(value: string | null | undefined): string {
    if (!value) return 'Lot inconnu';
    const v = value.toString().trim();
    if (/^lot\s+/i.test(v)) {
      return v.replace(/^lot\s+/i, 'Lot ');
    }
    return `Lot ${v}`;
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
      id: parseInt(lot.contractIds[0]) || 0,
      nomLot: lot.regions.join(', '),
      codeLot: lot.lot
    }));
  }

  onLotUpdated(updatedLot: Lot) {
    console.log('Lot updated:', updatedLot);
    // Refresh the lots data to reflect the changes
    this.loadLots();
    this.toast.show({
      type: 'success',
      title: 'Succès',
      message: 'Lot mis à jour avec succès'
    });
  }

  onLotCreated(newLot: Lot) {
    console.log('Lot created:', newLot);
    // Refresh the lots data to include the new lot
    this.loadLots();
    this.toast.show({
      type: 'success',
      title: 'Succès',
      message: `Lot "${newLot.nomLot}" créé avec succès`
    });
  }

  onLotDeleted(deletedLotId: number) {
    console.log('Lot deleted:', deletedLotId);
    // Refresh the lots data to remove the deleted lot
    this.loadLots();
    this.toast.show({
      type: 'success',
      title: 'Succès',
      message: 'Lot supprimé avec succès'
    });
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
      quantiteMinTrimestre: 0,
      quantiteMaxTrimestre: 1,
      equipements: []
    });
    this.itemForm.enable();
  }

  onEdit(item: Item) {
    console.log('Editing item:', item);
    this.showForm = true;
    this.isEditing = true;
    this.isViewing = false;
    this.currentItem = item;
    const formData = {
      ...item,
      lot: item.lot || '',
      equipements: item.equipements || []
    };
    console.log('Form data:', formData);
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
      lot: item.lot || '',
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

    if (this.isEditing && this.currentItem?.id) {
      const itemId = this.currentItem.id;
      console.log('Updating item with id:', itemId, 'Current item:', this.currentItem);
      this.itemService.updateItem(itemId, itemData).subscribe({
        next: (updatedItem) => {
          console.log('Updated item received:', updatedItem);
          this.loading = false;
          this.showForm = false;
          this.currentItem = null;
          this.loadItems();
          this.toast.show({ type: 'success', title: 'Succès', message: 'Item modifié avec succès' });
        },
        error: (error) => {
          console.error('Error updating item:', error);
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

  // Lot statistics methods
  getLotTotalValue(items: Item[]): number {
    return items.reduce((total, item) => total + (item.prix || 0), 0);
  }

  getLotTotalPrestations(items: Item[]): number {
    return items.reduce((total, item) => total + this.getPrestationsCountForItem(item), 0);
  }

  // Usage indicator methods
  getUsagePercentage(item: Item): number {
    const used = this.getPrestationsCountForItem(item);
    const max = item.quantiteMaxTrimestre;
    return max > 0 ? Math.min((used / max) * 100, 100) : 0;
  }

  getUsageProgressClass(item: Item): string {
    const percentage = this.getUsagePercentage(item);
    if (percentage >= 90) return 'bg-danger';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-success';
  }


 }
