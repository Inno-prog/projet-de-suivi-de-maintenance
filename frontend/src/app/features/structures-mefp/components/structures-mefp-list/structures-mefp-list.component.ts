import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { StructureMefp } from '../../../../core/models/business.models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Component({
  selector: 'app-structures-mefp-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>
            <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5zM9 9h6v2H9V9zm0 4h6v2H9v-2zm0 4h4v2H9v-2z"/>
            </svg>
            Gestion des Structures du MEFP
          </h1>
          <button class="btn btn-primary" (click)="openCreateStructureModal()">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            {{ showStructureModal ? 'Annuler' : 'Nouvelle Structure' }}
          </button>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Structures du MEFP</h2>
            <div class="search-bar">
              <input type="text" placeholder="Rechercher par nom, email, contact, ville, description, catégorie..." [(ngModel)]="searchTerm" (input)="filterStructures()" class="search-input">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <button *ngIf="searchTerm" class="clear-btn" (click)="clearSearch()" title="Effacer la recherche">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="table-wrapper">
            <div *ngIf="filteredStructures.length > 0; else noData" class="structures-grid">
              <div *ngFor="let structure of filteredStructures" class="structure-card">
                <div class="card-header">
                  <div class="structure-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
                    </svg>
                  </div>
                  <div class="structure-info">
                    <h3 class="structure-name">{{ structure.nom }}</h3>
                    <span class="structure-category" [ngClass]="getCategoryClass(structure.categorie)">{{ structure.categorie }}</span>
                  </div>
                </div>

                <div class="card-content">
                  <div class="info-row">
                    <div class="info-item">
                      <i class="fas fa-envelope info-icon"></i>
                      <span class="info-label">Email:</span>
                      <span class="info-value">{{ structure.email || 'Non spécifié' }}</span>
                    </div>
                    <div class="info-item">
                      <i class="fas fa-phone info-icon"></i>
                      <span class="info-label">Contact:</span>
                      <span class="info-value">{{ structure.contact || 'Non spécifié' }}</span>
                    </div>
                  </div>

                  <div class="info-row">
                    <div class="info-item">
                      <i class="fas fa-map-marker-alt info-icon"></i>
                      <span class="info-label">Ville:</span>
                      <span class="info-value">{{ structure.ville || 'Non spécifiée' }}</span>
                    </div>
                    <div class="info-item" *ngIf="structure.adresseStructure">
                      <i class="fas fa-home info-icon"></i>
                      <span class="info-label">Adresse:</span>
                      <span class="info-value description-text">{{ structure.adresseStructure }}</span>
                    </div>
                  </div>

                  <div class="info-row" *ngIf="structure.nomCI || structure.prenomCI">
                    <div class="info-item">
                      <i class="fas fa-user-tie info-icon"></i>
                      <span class="info-label">CI:</span>
                      <span class="info-value">{{ (structure.prenomCI || '') + ' ' + (structure.nomCI || '') }}</span>
                    </div>
                    <div class="info-item" *ngIf="structure.contactCI">
                      <i class="fas fa-phone-alt info-icon"></i>
                      <span class="info-label">Contact CI:</span>
                      <span class="info-value">{{ structure.contactCI }}</span>
                    </div>
                  </div>

                  <div class="info-row">
                    <div class="info-item">
                      <i class="fas fa-info-circle info-icon"></i>
                      <span class="info-label">Description:</span>
                      <span class="info-value description-text">{{ structure.description || 'Aucune description' }}</span>
                    </div>
                  </div>
                </div>

                <div class="card-actions">
                  <button class="action-btn view-btn" title="Voir les détails" (click)="viewStructure(structure)">
                    <i class="fas fa-eye"></i>
                    <span>Voir</span>
                  </button>
                  <button class="action-btn edit-btn" title="Modifier" (click)="editStructure(structure)">
                    <i class="fas fa-edit"></i>
                    <span>Modifier</span>
                  </button>
                  <button class="action-btn delete-btn" title="Supprimer" (click)="deleteStructure(structure)">
                    <i class="fas fa-trash"></i>
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucune structure trouvée</p>
              </div>
            </ng-template>
          </div>

          <!-- Pagination -->
          <div class="pagination-container" *ngIf="totalPages > 1">
            <div class="pagination-info">
              <span>Affichage de {{ (currentPage * pageSize) + 1 }} à {{ getEndIndex() }} sur {{ totalElements }} structures</span>
            </div>
            <div class="pagination-controls">
              <button
                class="pagination-btn"
                [disabled]="currentPage === 0"
                (click)="goToPage(0)"
                title="Première page">
                <i class="fas fa-angle-double-left"></i>
              </button>
              <button
                class="pagination-btn"
                [disabled]="currentPage === 0"
                (click)="previousPage()"
                title="Page précédente">
                <i class="fas fa-angle-left"></i>
              </button>

              <span *ngFor="let page of getPageNumbers()" class="pagination-numbers">
                <button
                  class="pagination-btn page-number"
                  [class.active]="page === currentPage"
                  (click)="goToPage(page)">
                  {{ page + 1 }}
                </button>
              </span>

              <button
                class="pagination-btn"
                [disabled]="currentPage === totalPages - 1"
                (click)="nextPage()"
                title="Page suivante">
                <i class="fas fa-angle-right"></i>
              </button>
              <button
                class="pagination-btn"
                [disabled]="currentPage === totalPages - 1"
                (click)="goToPage(totalPages - 1)"
                title="Dernière page">
                <i class="fas fa-angle-double-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          Chargement des structures...
        </div>
      </div>

      <!-- Structure Modal -->
      <div class="modal-overlay" *ngIf="showStructureModal" (click)="closeStructureModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <form [formGroup]="structureForm" (ngSubmit)="saveStructure()" class="structure-form">
            <h2 class="form-title">{{ isEditing ? 'Modifier' : (isViewing ? 'Voir' : 'Créer') }} une Structure du MEFP</h2>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                formControlName="nom"
                placeholder="Entrez le nom"
                class="line-input"
                [class.error]="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('nom')?.invalid && structureForm.get('nom')?.touched">
                Le nom est requis
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Entrez l'email"
                class="line-input"
                [class.error]="structureForm.get('email')?.invalid && structureForm.get('email')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('email')?.invalid && structureForm.get('email')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('email')?.invalid && structureForm.get('email')?.touched">
                L'email est requis et doit être valide
              </div>
            </div>

            <div class="form-group">
              <label for="contact">Contact</label>
              <input
                type="text"
                id="contact"
                formControlName="contact"
                placeholder="Entrez le contact"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="ville">Ville</label>
              <input
                type="text"
                id="ville"
                formControlName="ville"
                placeholder="Entrez la ville"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="adresseStructure">Adresse complète</label>
              <textarea
                id="adresseStructure"
                formControlName="adresseStructure"
                placeholder="Entrez l'adresse complète de la structure"
                class="line-input"
                rows="2"
              ></textarea>
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="Entrez la description"
                class="line-input"
                rows="3"
              ></textarea>
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="categorie">Catégorie</label>
              <input
                type="text"
                id="categorie"
                formControlName="categorie"
                placeholder="Entrez la catégorie"
                class="line-input"
                [class.error]="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched"
              />
              <div class="input-line" [class.error]="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched"></div>
              <div class="error-message" *ngIf="structureForm.get('categorie')?.invalid && structureForm.get('categorie')?.touched">
                La catégorie est requise
              </div>
            </div>

            <!-- Section Correspondant Informatique -->
            <h3 style="margin: 2rem 0 1rem 0; color: #1E2761; font-size: 1.1rem; border-bottom: 2px solid #f97316; padding-bottom: 0.5rem;">Correspondant Informatique (CI)</h3>
            
            <div class="form-group">
              <label for="nomCI">Nom du CI</label>
              <input
                type="text"
                id="nomCI"
                formControlName="nomCI"
                placeholder="Entrez le nom du correspondant informatique"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="prenomCI">Prénom du CI</label>
              <input
                type="text"
                id="prenomCI"
                formControlName="prenomCI"
                placeholder="Entrez le prénom du correspondant informatique"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="contactCI">Contact du CI</label>
              <input
                type="text"
                id="contactCI"
                formControlName="contactCI"
                placeholder="Entrez le contact du correspondant informatique"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="fonctionCI">Fonction du CI</label>
              <input
                type="text"
                id="fonctionCI"
                formControlName="fonctionCI"
                placeholder="Entrez la fonction du correspondant informatique"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <!-- Actions -->
            <div class="form-actions" *ngIf="!isViewing">
              <button type="button" class="btn btn-outline" (click)="closeStructureModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="structureForm.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
            <div class="form-actions" *ngIf="isViewing">
              <button type="button" class="btn btn-outline" (click)="closeStructureModal()">
                Fermer
              </button>
            </div>
          </form>
        </div>
      </div>
  `,
  styles: [`
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: #1E2761;
      margin: 0;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 24px;
      height: 24px;
      color: #f97316;
      flex-shrink: 0;
    }

    .btn-icon {
      width: 16px;
      height: 16px;
      margin-right: 6px;
    }

    /* Modern Card-Based Layout */
    .structures-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 1.5rem;
      padding: 1rem;
    }

    .structure-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      transition: all 0.3s ease;
      border: 1px solid #e5e7eb;
    }

    .structure-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .structure-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .structure-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    .structure-info {
      flex: 1;
    }

    .structure-name {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      color: white;
    }

    .structure-category {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .category-cabinet {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .category-direction {
      background: #fef3c7;
      color: #92400e;
    }

    .category-service {
      background: #dbeafe;
      color: #1e40af;
    }

    .category-rattachee {
      background: #dcfce7;
      color: #166534;
    }

    .category-mission {
      background: #fce7f3;
      color: #be185d;
    }

    .category-default {
      background: #f3f4f6;
      color: #374151;
    }

    .card-content {
      padding: 1.5rem;
    }

    .info-row {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-row:last-child {
      margin-bottom: 0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .info-icon {
      width: 16px;
      height: 16px;
      color: #6b7280;
      flex-shrink: 0;
    }

    .info-label {
      font-weight: 600;
      color: #374151;
      min-width: 60px;
    }

    .info-value {
      color: #4b5563;
      flex: 1;
    }

    .description-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      line-height: 1.4;
    }

    .card-actions {
      padding: 1rem 1.5rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .view-btn {
      background: #10b981;
      color: white;
    }

    .view-btn:hover {
      background: #059669;
      transform: translateY(-1px);
    }

    .edit-btn {
      background: #f59e0b;
      color: white;
    }

    .edit-btn:hover {
      background: #d97706;
      transform: translateY(-1px);
    }

    .delete-btn {
      background: #ef4444;
      color: white;
    }

    .delete-btn:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .structures-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
        padding: 0.5rem;
      }

      .card-header {
        padding: 1rem;
      }

      .structure-name {
        font-size: 1.1rem;
      }

      .card-content {
        padding: 1rem;
      }

      .card-actions {
        padding: 0.75rem 1rem 1rem;
        flex-direction: column;
      }

      .action-btn {
        justify-content: center;
      }
    }


    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      color: #1E2761;
      font-size: 1.125rem;
      font-weight: 500;
      letter-spacing: 0.025em;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .search-bar:focus-within {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      padding: 0.5rem 0.5rem 0.5rem 0;
      font-size: 0.875rem;
      width: 280px;
      color: #374151;
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    .search-icon {
      color: #6b7280;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    .clear-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      margin-left: 0.5rem;
      flex-shrink: 0;
    }

    .clear-btn:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .structure-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #1e293b;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    /* Boutons EXACTEMENT comme l'image */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 8px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 100px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #ea580c, #dc2626);
      box-shadow: 0 6px 16px rgba(249, 115, 22, 0.4);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    /* Style pour le textarea */
    textarea.line-input {
      resize: vertical;
      min-height: 80px;
    }

    /* Pagination Styles */
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      border-radius: 0 0 8px 8px;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: #6b7280;
      font-weight: 500;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.875rem;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #f3f4f6;
      border-color: #9ca3af;
      transform: translateY(-1px);
    }

    .pagination-btn:disabled {
      background: #f9fafb;
      color: #d1d5db;
      cursor: not-allowed;
      transform: none;
    }

    .page-number.active {
      background: #f97316;
      color: white;
      border-color: #f97316;
      font-weight: 600;
    }

    .pagination-numbers {
      display: flex;
      gap: 0.25rem;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }

      .pagination-container {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .pagination-info {
        order: 2;
      }

      .pagination-controls {
        order: 1;
      }
    }
  `]
})
export class StructuresMefpListComponent implements OnInit {
  structures: StructureMefp[] = [];
  filteredStructures: StructureMefp[] = [];
  searchTerm = '';
  loading = false;
  showStructureModal = false;
  isEditing = false;
  isViewing = false;
  currentStructure: StructureMefp | null = null;
  structureForm: FormGroup;

  // Pagination properties
  currentPage = 0;
  pageSize = 12;
  totalElements = 0;
  totalPages = 0;
  paginatedStructures: Page<StructureMefp> | null = null;

  constructor(
    private structureMefpService: StructureMefpService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private formBuilder: FormBuilder
  ) {
    this.structureForm = this.formBuilder.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: [''],
      ville: [''],
      adresseStructure: [''],
      description: [''],
      categorie: ['', Validators.required],
      // Champs du Correspondant Informatique (CI)
      nomCI: [''],
      prenomCI: [''],
      contactCI: [''],
      fonctionCI: ['']
    });

    // Initialize confirmation service with the component
    setTimeout(() => {
      if (this.confirmationService) {
        // The confirmation service should already be initialized in the layout component
        console.log('Confirmation service initialized for structures component');
      }
    });
  }

  ngOnInit(): void {
    this.loadStructures();
  }

  loadStructures(): void {
    this.loading = true;
    console.log('Loading structures from:', this.structureMefpService['API_URL']);
    this.structureMefpService.getAllStructuresPaginated(this.currentPage, this.pageSize).subscribe({
      next: (page: Page<StructureMefp>) => {
        console.log('Successfully loaded structures:', page);
        this.paginatedStructures = page;
        this.structures = page.content;
        this.totalElements = page.totalElements;
        this.totalPages = page.totalPages;
        this.filterStructures();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading structures:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        this.toastService.show({
          type: 'error',
          title: 'Erreur de chargement',
          message: 'Impossible de charger les structures. Vérifiez la connexion réseau.'
        });
        this.loading = false;
      }
    });
  }

  filterStructures(): void {
    // For now, filtering is done on the current page data
    // In a future enhancement, we could implement server-side search with pagination
    if (!this.searchTerm.trim()) {
      this.filteredStructures = [...this.structures];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStructures = this.structures.filter(structure =>
        (structure.nom || '').toLowerCase().includes(term) ||
        (structure.email || '').toLowerCase().includes(term) ||
        String(structure.contact || '').toLowerCase().includes(term) ||
        (structure.ville || '').toLowerCase().includes(term) ||
        (structure.description || '').toLowerCase().includes(term) ||
        (structure.categorie || '').toLowerCase().includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterStructures();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  openCreateStructureModal(): void {
    this.isEditing = false;
    this.currentStructure = null;
    this.structureForm.reset({
      nom: '',
      email: '',
      contact: '',
      ville: '',
      adresseStructure: '',
      description: '',
      categorie: '',
      nomCI: '',
      prenomCI: '',
      contactCI: '',
      fonctionCI: ''
    });
    this.showStructureModal = true;
  }

  editStructure(structure: StructureMefp): void {
    this.isEditing = true;
    this.isViewing = false;
    this.currentStructure = structure;
    this.structureForm.patchValue({
      nom: structure.nom,
      email: structure.email,
      contact: structure.contact,
      ville: structure.ville,
      adresseStructure: structure.adresseStructure,
      description: structure.description,
      categorie: structure.categorie,
      nomCI: structure.nomCI,
      prenomCI: structure.prenomCI,
      contactCI: structure.contactCI,
      fonctionCI: structure.fonctionCI
    });
    this.showStructureModal = true;
  }

  closeStructureModal(): void {
    this.showStructureModal = false;
    this.isEditing = false;
    this.isViewing = false;
    this.currentStructure = null;
    this.structureForm.reset({
      nom: '',
      email: '',
      contact: '',
      ville: '',
      adresseStructure: '',
      description: '',
      categorie: '',
      nomCI: '',
      prenomCI: '',
      contactCI: '',
      fonctionCI: ''
    });
    this.structureForm.enable();
  }

  async saveStructure(): Promise<void> {
    console.log('saveStructure called, form valid:', this.structureForm.valid);
    console.log('Form value:', this.structureForm.value);

    if (this.structureForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';

      // Use custom confirmation dialog instead of browser alert
      const confirmed = await this.confirmationService.show({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} une structure`,
        message: `Voulez-vous vraiment ${action} cette structure ?`,
        confirmText: action.charAt(0).toUpperCase() + action.slice(1),
        cancelText: 'Annuler'
      });
      console.log('Custom dialog result:', confirmed);

      if (confirmed) {
        console.log('Proceeding with structure creation...');
        this.performStructureSave();
      } else {
        console.log('User cancelled via custom dialog');
      }
    } else {
      console.log('Form is invalid, marking all fields as touched');
      this.structureForm.markAllAsTouched();
    }
  }

  private performStructureSave(): void {
    const structureData = this.structureForm.value;
    console.log('Structure data to save:', structureData);

    if (this.isEditing && this.currentStructure) {
      console.log('Updating structure with ID:', this.currentStructure.id);
      this.structureMefpService.updateStructure(this.currentStructure.id!, structureData).subscribe({
        next: (updatedStructure) => {
          console.log('Structure updated successfully:', updatedStructure);
          this.loadStructures(); // Reload current page to maintain pagination state
          this.closeStructureModal();
          this.toastService.show({ type: 'success', title: 'Structure modifiée', message: 'La structure a été modifiée avec succès' });
        },
        error: (error) => {
          console.error('Error updating structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification de la structure' });
        }
      });
    } else {
      console.log('Creating new structure');
      this.structureMefpService.createStructure(structureData).subscribe({
        next: (newStructure) => {
          console.log('Structure created successfully:', newStructure);
          this.loadStructures(); // Reload current page to maintain pagination state
          this.closeStructureModal();
          this.toastService.show({ type: 'success', title: 'Structure créée', message: 'La structure a été créée avec succès' });
        },
        error: (error) => {
          console.error('Error creating structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de la structure' });
        }
      });
    }
  }

  async deleteStructure(structure: StructureMefp): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer une structure',
      message: `Êtes-vous sûr de vouloir supprimer la structure "${structure.nom}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });
    console.log('Delete confirmation result:', confirmed);

    if (confirmed) {
      console.log('Proceeding with structure deletion for:', structure.nom);
      this.structureMefpService.deleteStructure(structure.id!).subscribe({
        next: () => {
          console.log('Structure deleted successfully');
          this.loadStructures(); // Reload current page to maintain pagination state
          this.toastService.show({ type: 'success', title: 'Structure supprimée', message: 'La structure a été supprimée avec succès' });
        },
        error: (error) => {
          console.error('Error deleting structure:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message
          });
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de la structure' });
        }
      });
    } else {
      console.log('User cancelled deletion');
    }
  }

  getCategoryClass(categorie: string | undefined | undefined): string {
    switch (categorie) {
      case 'Cabinet du Ministre':
        return 'category-cabinet';
      case 'Directions Générales':
        return 'category-direction';
      case 'Directions et Services':
        return 'category-service';
      case 'Structures Rattachées':
        return 'category-rattachee';
      case 'Structures de Mission':
        return 'category-mission';
      default:
        return 'category-default';
    }
  }

  viewStructure(structure: StructureMefp): void {
    this.isViewing = true;
    this.isEditing = false;
    this.currentStructure = structure;
    this.structureForm.patchValue({
      nom: structure.nom,
      email: structure.email,
      contact: structure.contact,
      ville: structure.ville,
      adresseStructure: structure.adresseStructure,
      description: structure.description,
      categorie: structure.categorie,
      nomCI: structure.nomCI,
      prenomCI: structure.prenomCI,
      contactCI: structure.contactCI,
      fonctionCI: structure.fonctionCI
    });
    this.showStructureModal = true;
    this.structureForm.disable();
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadStructures();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadStructures();
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadStructures();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getEndIndex(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.totalElements);
  }
}
