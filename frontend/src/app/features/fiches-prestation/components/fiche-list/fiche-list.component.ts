import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <div>
            <h1>Gestion de mes fiches de Prestations</h1>
          </div>
        </div>
        <!-- DEV helper: create a test fiche so admins can test validation without switching to prestataire -->
        <div class="mb-4" *ngIf="authService.isAdmin()">
          <button class="btn btn-sm btn-outline" (click)="createTestFiche()">Créer fiche de test (dev)</button>
        </div>

        <!-- Create Fiche Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} une Prestation</h2>
              </div>
              
              <form [formGroup]="ficheForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nomPrestataire">Nom du Prestataire</label>
                    <input type="text" id="nomPrestataire" formControlName="nomPrestataire">
                  </div>

                  <div class="form-group">
                    <label for="nomItem">Nom de l'Item</label>
                    <input type="text" id="nomItem" formControlName="nomItem" placeholder="Ex: Maintenance ordinateur">
                  </div>

                  <div class="form-group">
                    <label for="dateRealisation">Date de Réalisation</label>
                    <input type="datetime-local" id="dateRealisation" formControlName="dateRealisation">
                  </div>

                  <div class="form-group">
                    <label for="quantite">Quantité</label>
                    <input type="number" id="quantite" formControlName="quantite" min="1">
                  </div>

                  <div class="form-group" *ngIf="authService.isAgentDGSI()">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="VALIDE">Valider</option>
                      <option value="REJETE">Rejeter</option>
                    </select>
                  </div>

                  <div class="form-group form-group-full">
                    <label for="commentaire">Commentaire</label>
                    <textarea id="commentaire" formControlName="commentaire" rows="4" placeholder="Commentaires sur la prestation..."></textarea>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Statistics for Prestataires -->
        <div class="stats-section" *ngIf="authService.isPrestataire()">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-file-contract"></i>
              </div>
              <div class="stat-info">
                <h3>{{ fiches.length }}</h3>
                <p>Total Prestations</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-clock"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('EN_ATTENTE').length }}</h3>
                <p>En Attente</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-play"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('EN_COURS').length }}</h3>
                <p>En Cours</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-info">
                <h3>{{ getFichesByStatus('TERMINEE').length + getFichesByStatus('VALIDE').length }}</h3>
                <p>Terminées/Validées</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quarterly Submission for Prestataires -->
        <div class="quarterly-submission" *ngIf="authService.isPrestataire()">
          <div class="submission-card">
            <h3>Soumission du Rapport Trimestriel</h3>
            <p>Soumettez toutes vos fiches de prestations pour le trimestre sélectionné à l'administrateur</p>

            <div class="submission-form">
              <div class="form-group">
                <label for="quarter">Trimestre</label>
                <select id="quarter" [(ngModel)]="selectedQuarter" class="form-control">
                  <option value="">Sélectionnez un trimestre</option>
                  <option value="Q1">Trimestre 1 (Jan-Mar)</option>
                  <option value="Q2">Trimestre 2 (Avr-Jun)</option>
                  <option value="Q3">Trimestre 3 (Jul-Sep)</option>
                  <option value="Q4">Trimestre 4 (Oct-Déc)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="year">Année</label>
                <select id="year" [(ngModel)]="selectedYear" class="form-control">
                  <option value="">Sélectionnez une année</option>
                  <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
                </select>
              </div>

              <button class="btn btn-success" (click)="submitQuarterlyReport()" [disabled]="!selectedQuarter || !selectedYear || submittingReport">
                {{ submittingReport ? 'Soumission...' : 'Soumettre le Rapport' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Fiches Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Prestations</h2>
            <!-- DEBUG: Show current user and role detection -->
            <div style="background: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              <div>Auth Debug: isAdmin={{authService.isAdmin()}} | isAgentDGSI={{authService.isAgentDGSI()}} | isPrestataire={{authService.isPrestataire()}}</div>
              <div>Current User: {{authService.getCurrentUser() | json}}</div>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="fiches.length > 0; else noData">
              <thead>
                <tr>
                  <th>ID Prestation</th>
                  <th>Prestataire</th>
                  <th>Item</th>
                  <th>Date Réalisation</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fiche of fiches">
                  <td>{{ fiche.idPrestation }}</td>
                  <td>{{ fiche.nomPrestataire }}</td>
                  <td>{{ fiche.nomItem }}</td>
                  <td>{{ formatDate(fiche.dateRealisation) }}</td>
                  <td>{{ fiche.quantite }}</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(fiche.statut)">
                      {{ getStatusLabel(fiche.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-info btn-sm" (click)="viewDetails(fiche)">
                        Détails
                      </button>
                      <button class="btn btn-success btn-sm"
                              *ngIf="authService.isAdmin() && fiche"
                              (click)="validerFiche(fiche)">
                        Valider
                      </button>
                      <button class="btn btn-danger btn-sm"
                              *ngIf="authService.isAdmin() && fiche"
                              (click)="rejeterFiche(fiche)">
                        Rejeter
                      </button>
                      <button class="btn btn-primary btn-sm" (click)="submitFiche(fiche)" *ngIf="authService.isPrestataire() && isFicheTerminee(fiche)">
                        Soumettre
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="editFiche(fiche)" *ngIf="authService.isPrestataire()">
                        Modifier
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteFiche(fiche)" *ngIf="authService.isAdmin()">
                        Supprimer
                      </button>
                      <button class="btn btn-warning btn-sm"
                              *ngIf="authService.isAdmin() && isFicheTerminee(fiche)"
                              (click)="evaluerPrestataire(fiche)"
                              title="Évaluer le prestataire">
                        <i class="fas fa-star"></i> Évaluer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucune prestation trouvée</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Details Modal -->
        <div class="modal-overlay" *ngIf="showDetailsModal" (click)="closeDetailsModal()">
          <div class="modal-content details-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>Détails de la Prestation</h2>
                <button class="close-btn" (click)="closeDetailsModal()">&times;</button>
              </div>

              <div class="card-body" *ngIf="selectedFiche">
                <div class="details-grid">
                  <div class="detail-item">
                    <label>ID Prestation:</label>
                    <span>{{ selectedFiche.idPrestation }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Prestataire:</label>
                    <span>{{ selectedFiche.nomPrestataire }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Item:</label>
                    <span>{{ selectedFiche.nomItem }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Items Couvert:</label>
                    <span>{{ selectedFiche.itemsCouverts || 'N/A' }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Date de Réalisation:</label>
                    <span>{{ formatDate(selectedFiche.dateRealisation) }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Quantité:</label>
                    <span>{{ selectedFiche.quantite }}</span>
                  </div>

                  <div class="detail-item">
                    <label>Statut:</label>
                    <span class="badge" [class]="getStatusBadgeClass(selectedFiche.statut)">
                      {{ getStatusLabel(selectedFiche.statut) }}
                    </span>
                  </div>

                  <div class="detail-item">
                    <label>Statut Intervention:</label>
                    <span>{{ selectedFiche.statutIntervention || 'N/A' }}</span>
                  </div>

                  <div class="detail-item full-width">
                    <label>Commentaire:</label>
                    <span>{{ selectedFiche.commentaire || 'Aucun commentaire' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des prestations...
        </div>
      </div>
  `,
  styles: [`
    .no-data {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    .quarterly-submission {
      margin-bottom: 2rem;
    }

    .submission-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(249, 115, 22, 0.15);
      padding: 2rem;
      text-align: center;
    }

    .submission-card h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .submission-card p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .submission-form {
      display: flex;
      gap: 1rem;
      align-items: end;
      justify-content: center;
      flex-wrap: wrap;
    }

    .submission-form .form-group {
      margin-bottom: 0;
      min-width: 150px;
    }

    .submission-form .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
    }

    .submission-form .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
      background: white;
    }

    .stats-section {
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(249, 115, 22, 0.15);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(249, 115, 22, 0.2);
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: #f97316;
      background: rgba(249, 115, 22, 0.1);
      flex-shrink: 0;
    }

    .stat-info h3 {
      font-size: 2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1;
    }

    .stat-info p {
      font-size: 0.875rem;
      color: #64748b;
      margin: 0.25rem 0 0 0;
      font-weight: 500;
    }

    .details-modal {
      max-width: 600px;
      width: 90%;
    }

    .details-modal .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .close-btn:hover {
      background: rgba(0, 0, 0, 0.1);
      color: var(--text-primary);
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-item label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .detail-item span {
      color: var(--text-secondary);
      padding: 0.5rem;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      word-break: break-word;
    }

    .detail-item.full-width {
      grid-column: 1 / -1;
    }

    .detail-item .badge {
      width: fit-content;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }

      .submission-form {
        flex-direction: column;
        align-items: stretch;
      }

      .submission-form .form-group {
        min-width: auto;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 1rem;
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
      }

      .stat-info h3 {
        font-size: 1.5rem;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class FicheListComponent implements OnInit {
  fiches: FichePrestation[] = [];
  ficheForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  selectedQuarter = '';
  selectedYear = '';
  submittingReport = false;
  availableYears: number[] = [];
  showDetailsModal = false;
  selectedFiche: FichePrestation | null = null;

  constructor(
    private ficheService: FichePrestationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router
  ) {
    // Set default status based on user role
    const defaultStatus = this.authService.isPrestataire() ? 'TERMINEE' : 'EN_ATTENTE';
    this.ficheForm = this.formBuilder.group({
      nomPrestataire: ['', Validators.required],
      nomItem: ['', Validators.required],
      dateRealisation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      statut: [defaultStatus],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    // Debug: Check auth state immediately on init
    console.log('FicheListComponent ngOnInit - Current user:', this.authService.getCurrentUser());
    console.log('FicheListComponent ngOnInit - isAdmin:', this.authService.isAdmin());
    console.log('FicheListComponent ngOnInit - isAgentDGSI:', this.authService.isAgentDGSI());
    
    this.loadFiches();
    this.initializeAvailableYears();
  }

  initializeAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      this.availableYears.push(i);
    }
  }

  async submitQuarterlyReport(): Promise<void> {
    if (!this.selectedQuarter || !this.selectedYear) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner un trimestre et une année'
      });
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Soumission du Rapport Trimestriel',
      message: `Voulez-vous soumettre toutes vos fiches de prestations pour ${this.selectedQuarter} ${this.selectedYear} à l'administrateur ?`,
      confirmText: 'Soumettre',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.submittingReport = true;

      // Get current user's fiches for the selected quarter
      const user = this.authService.getCurrentUser();
      if (user) {
        const quarterFiches = this.fiches.filter(fiche => {
          const ficheDate = new Date(fiche.dateRealisation);
          const ficheYear = ficheDate.getFullYear();
          const ficheMonth = ficheDate.getMonth() + 1; // getMonth() returns 0-11

          // Determine quarter
          let ficheQuarter = '';
          if (ficheMonth >= 1 && ficheMonth <= 3) ficheQuarter = 'Q1';
          else if (ficheMonth >= 4 && ficheMonth <= 6) ficheQuarter = 'Q2';
          else if (ficheMonth >= 7 && ficheMonth <= 9) ficheQuarter = 'Q3';
          else ficheQuarter = 'Q4';

          return fiche.nomPrestataire === user.nom && ficheQuarter === this.selectedQuarter && ficheYear === parseInt(this.selectedYear);
        });

        if (quarterFiches.length === 0) {
          this.toastService.show({
            type: 'warning',
            title: 'Aucune fiche',
            message: 'Aucune fiche trouvée pour ce trimestre'
          });
          this.submittingReport = false;
          return;
        }

        // Here we would typically send the report to admin
        // For now, just show success and mark fiches as submitted
        this.toastService.show({
          type: 'success',
          title: 'Rapport soumis',
          message: `${quarterFiches.length} fiche(s) soumise(s) pour évaluation trimestrielle`
        });

        this.submittingReport = false;
        this.selectedQuarter = '';
        this.selectedYear = '';
      }
    }
  }

  /** DEV helper: create a minimal fiche for testing validation flow. */
  createTestFiche(): void {
    const testFiche: any = {
      // Let backend generate idPrestation if needed
      nomPrestataire: 'Prestataire Service',
      nomItem: 'Prestation de test',
      dateRealisation: new Date().toISOString(),
      quantite: 1,
      statut: 'EN_ATTENTE',
      commentaire: 'Fiche de test générée depuis l\'UI (dev)'
    };

    this.ficheService.createFiche(testFiche).subscribe({
      next: (created) => {
        this.toastService.show({ type: 'success', title: 'Fiche test', message: `Fiche de test créée (id: ${created.idPrestation || created.id})` });
        this.loadFiches();
      },
      error: (err) => {
        console.error('Erreur création fiche test:', err);
        const serverMessage = err?.error?.message || err?.error || err?.message;
        this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur création fiche test' });
      }
    });
  }

  loadFiches(): void {
    this.loadingList = true;
    this.ficheService.getAllFiches().subscribe({
      next: (fiches) => {
        // Backend already filters based on user role, so just use the returned fiches
        this.fiches = fiches;

        // DEBUG: log current user and fiche statuses to debug disabled buttons
        try {
          const currentUser = this.authService.getCurrentUser();
          console.log('DEBUG loadFiches - currentUser:', currentUser);
          console.log('DEBUG loadFiches - isAdmin:', this.authService.isAdmin(), 'isAgentDGSI:', this.authService.isAgentDGSI());
          this.fiches.forEach((f: any) => {
            console.log('DEBUG loadFiches - fiche id:', f.id, 'idPrestation:', f.idPrestation, 'statut raw:', f.statut, 'statut typeof:', typeof f.statut);
            try {
              console.log('DEBUG loadFiches - statut JSON:', JSON.stringify(f.statut));
            } catch (e) {
              // ignore stringify errors
            }
          });
        } catch (e) {
          console.warn('DEBUG loadFiches - logging failed', e);
        }

        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading fiches:', error);
        this.loadingList = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.ficheForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cette fiche ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const ficheData = this.ficheForm.value;

        if (this.isEditing && this.editingId) {
          this.ficheService.updateFiche(this.editingId, ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
            },
            error: (error) => {
              console.error('Error updating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur modification' });
            }
          });
        } else {
          this.ficheService.createFiche(ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
            },
            error: (error) => {
              console.error('Error creating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur création' });
            }
          });
        }
      }
    }
  }

  editFiche(fiche: FichePrestation): void {
    this.isEditing = true;
    this.editingId = fiche.id!;
    this.showCreateForm = true;
    
    this.ficheForm.patchValue({
      nomPrestataire: fiche.nomPrestataire,
      nomItem: fiche.nomItem,
      dateRealisation: fiche.dateRealisation,
      quantite: fiche.quantite,
      statut: fiche.statut,
      commentaire: fiche.commentaire
    });
  }

  async deleteFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer',
      message: `Supprimer la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      this.ficheService.deleteFiche(fiche.id!).subscribe({
        next: () => {
          this.loadFiches();
        },
        error: (error) => {
          console.error('Error deleting fiche:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur suppression' });
        }
      });
    }
  }

  async validerFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Valider',
      message: `Valider la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Valider',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      const commentaires = prompt('Commentaires (optionnel):');
      // DEBUG: log fiche and statut client-side to help diagnose validation issues
      // (temporary, remove after debugging)
      console.log('DEBUG validerFiche - fiche object:', fiche);
      console.log('DEBUG validerFiche - fiche.statut (raw):', (fiche as any).statut);

      this.ficheService.validerFiche(fiche.id!, commentaires || undefined).subscribe({
        next: () => {
          this.toastService.show({ type: 'success', title: 'Valider', message: `La fiche ${fiche.idPrestation} a été validée` });
          this.loadFiches();
        },
        error: (error) => {
          console.error('Error validating fiche:', error);
          const serverMessage = error?.error?.message || error?.error || error?.message;
          this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur validation' });
        }
      });
    }
  }

  async submitFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Soumettre la fiche',
      message: `Soumettre la fiche ${fiche.idPrestation} pour validation ?`,
      confirmText: 'Soumettre',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      // Update fiche status to EN_ATTENTE for validation
      const updateData = { statut: 'EN_ATTENTE' };
      this.ficheService.updateFiche(fiche.id!, updateData).subscribe({
        next: (updatedFiche) => {
          this.toastService.show({
            type: 'success',
            title: 'Fiche soumise',
            message: `La fiche ${fiche.idPrestation} a été soumise pour validation`
          });
          this.loadFiches(); // Refresh the list
        },
        error: (error) => {
          console.error('Error submitting fiche:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la soumission de la fiche'
          });
        }
      });
    }
  }

  async rejeterFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Rejeter',
      message: `Rejeter la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      const commentaires = prompt('Motif du rejet:');
      if (commentaires) {
        // DEBUG: log fiche and statut client-side to help diagnose rejection issues
        // (temporary, remove after debugging)
        console.log('DEBUG rejeterFiche - fiche object:', fiche);
        console.log('DEBUG rejeterFiche - fiche.statut (raw):', (fiche as any).statut);

        this.ficheService.rejeterFiche(fiche.id!, commentaires).subscribe({
          next: () => {
            this.toastService.show({ type: 'success', title: 'Rejet', message: `La fiche ${fiche.idPrestation} a été rejetée` });
            this.loadFiches();
          },
          error: (error) => {
            console.error('Error rejecting fiche:', error);
            const serverMessage = error?.error?.message || error?.error || error?.message;
            this.toastService.show({ type: 'error', title: 'Erreur', message: serverMessage || 'Erreur rejet' });
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.ficheForm.reset();
    const defaultStatus = this.authService.isPrestataire() ? 'TERMINEE' : 'EN_ATTENTE';
    this.ficheForm.patchValue({ statut: defaultStatus, quantite: 1 });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutFiche): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'VALIDE': 'badge-success',
      'REJETE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutFiche): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'VALIDE': 'Validé',
      'REJETE': 'Rejeté'
    };
    return statusLabels[statut] || statut;
  }

  /**
   * Robust check whether a fiche is in EN_ATTENTE state.
   * Handles cases where the backend returns an enum-like object or a string.
   */
  isFicheEnAttente(fiche: FichePrestation | null | undefined): boolean {
    if (!fiche) return false;
  const s = fiche.statut ?? (fiche as any).statutValidation ?? '';
    return String(s).toUpperCase().indexOf('EN_ATTENTE') !== -1;
  }

  /**
   * Robust check whether a fiche is in TERMINEE state.
   */
  isFicheTerminee(fiche: FichePrestation | null | undefined): boolean {
    if (!fiche) return false;
  const s = fiche.statut ?? (fiche as any).statutValidation ?? '';
    return String(s).toUpperCase().indexOf('TERMINEE') !== -1;
  }

  evaluerPrestataire(fiche: FichePrestation): void {
    this.router.navigate(['/evaluations/new'], {
      queryParams: {
        prestationId: fiche.id,
        prestataire: fiche.nomPrestataire,
        nomItem: fiche.nomItem
      }
    });
  }

  getFichesByStatus(status: string): FichePrestation[] {
    return this.fiches.filter(fiche => fiche.statut === status);
  }

  viewDetails(fiche: FichePrestation): void {
    this.selectedFiche = fiche;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedFiche = null;
  }
}