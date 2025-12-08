import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { RapportSuiviService } from '../../../../core/services/rapport-suivi.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { ItemService } from '../../../../core/services/item.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { OrdreCommande, RapportSuivi, StatutRapport, Prestation, Contrat, Item, StructureMefp } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ReportExportComponent } from '../../../reports/components/report-export/report-export.component';

@Component({
  selector: 'app-rapport-suivi-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, ReportExportComponent],
  template: `
    <div class="container">
        <div class="page-header">
          <div>
            <h1>Rapports de Suivi</h1>
            <p>Gérez les rapports de suivi des prestations</p>
          </div>
          <button class="btn btn-primary" *ngIf="authService.isAgentDGSI()" (click)="openCreateForm()">
            Nouveau Rapport
          </button>
        </div>

        <!-- Create Rapport Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm && authService.isAgentDGSI()" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} un Rapport de Suivi</h2>
                <div class="step-indicator">
                  <div class="step-info">
                    <span class="step-counter">{{ currentStep }}/{{ totalSteps }}</span>
                    <span class="step-title">{{ getCurrentStepTitle() }}</span>
                  </div>
                  <div class="step-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" [style.width.%]="(currentStep / totalSteps) * 100"></div>
                    </div>
                  </div>
                </div>
                <p class="methodology-info">
                  <strong>Méthodologie d'évaluation en 7 étapes</strong><br>
                  Suivez systématiquement chaque étape pour un rapport complet et structuré
                </p>
              </div>

              <form [formGroup]="rapportForm" (ngSubmit)="onSubmit()">
                <!-- Étape 1: Informations générales -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 1</span>
                    Collecte des informations générales
                  </h3>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="ordreCommandeId">Ordre de Commande</label>
                      <select id="ordreCommandeId" formControlName="ordreCommandeId">
                        <option value="">Sélectionnez un ordre de commande</option>
                        <option *ngFor="let ordre of ordres" [value]="ordre.id">{{ ordre.idOC }} - {{ ordre.numeroOc || ordre.numeroCommande }}</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="dateRapport">Date du Rapport</label>
                      <input type="date" id="dateRapport" formControlName="dateRapport">
                    </div>

                    <div class="form-group">
                      <label for="trimestre">Trimestre d'évaluation</label>
                      <select id="trimestre" formControlName="trimestre">
                        <option value="">Sélectionnez un trimestre</option>
                        <option value="T1">T1 (Jan-Mar)</option>
                        <option value="T2">T2 (Avr-Jun)</option>
                        <option value="T3">T3 (Jul-Sep)</option>
                        <option value="T4">T4 (Oct-Déc)</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="prestataire">Prestataire concerné</label>
                      <input type="text" id="prestataire" formControlName="prestataire" readonly placeholder="Sera rempli automatiquement">
                    </div>
                  </div>
                </div>

                <!-- Étape 2: Analyse des prestations -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 2</span>
                    Analyse détaillée des prestations réalisées
                  </h3>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="prestationsRealisees">Nombre de prestations réalisées</label>
                      <input type="number" id="prestationsRealisees" formControlName="prestationsRealisees" min="0">
                    </div>

                    <div class="form-group full-width">
                      <label for="observationsPrestations">Observations sur les prestations (Étape 2)</label>
                      <textarea id="observationsPrestations" formControlName="observationsPrestations" rows="3"
                        placeholder="Décrivez la qualité des prestations, les problèmes rencontrés, les délais respectés, etc."></textarea>
                    </div>
                  </div>
                </div>

                <!-- Étape 3: Vérification des ordres -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 3</span>
                    Vérification des ordres de commande émis
                  </h3>
                  <div class="form-group full-width">
                    <label for="observationsOrdres">Observations sur les ordres de commande (Étape 3)</label>
                    <textarea id="observationsOrdres" formControlName="observationsOrdres" rows="3"
                      placeholder="Vérifiez la conformité des ordres, les délais d'émission, la clarté des spécifications, etc."></textarea>
                  </div>
                </div>

                <!-- Étape 4: Contrôle des contrats -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 4</span>
                    Contrôle des contrats actifs et renouvellements
                  </h3>
                  <div class="form-group full-width">
                    <label for="observationsContrats">Observations sur les contrats (Étape 4)</label>
                    <textarea id="observationsContrats" formControlName="observationsContrats" rows="3"
                      placeholder="Évaluez l'état des contrats, les renouvellements nécessaires, les clauses respectées, etc."></textarea>
                  </div>
                </div>

                <!-- Étape 5: Inventaire des équipements -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 5</span>
                    Inventaire des items et équipements gérés
                  </h3>
                  <div class="form-group full-width">
                    <label for="observationsItems">Observations sur les équipements (Étape 5)</label>
                    <textarea id="observationsItems" formControlName="observationsItems" rows="3"
                      placeholder="Vérifiez l'état des équipements, les inventaires, la maintenance préventive, etc."></textarea>
                  </div>
                </div>

                <!-- Étape 6: Évaluation des structures -->
                <div class="step-section">
                  <h3 class="step-title">
                    <span class="step-number">Étape 6</span>
                    Évaluation des structures MEFP et couverture territoriale
                  </h3>
                  <div class="form-group full-width">
                    <label for="observationsStructures">Observations sur les structures (Étape 6)</label>
                    <textarea id="observationsStructures" formControlName="observationsStructures" rows="3"
                      placeholder="Évaluez la couverture territoriale, l'organisation des structures, les besoins identifiés, etc."></textarea>
                  </div>
                </div>

                <!-- Validation et statut -->
                <div class="step-section">
                  <h3 class="step-title">Validation finale</h3>
                  <div class="form-grid">
                    <div class="form-group">
                      <label for="statut">Statut du rapport</label>
                      <select id="statut" formControlName="statut">
                        <option value="EN_ATTENTE">En attente de validation</option>
                        <option value="APPROUVE">Approuvé et validé</option>
                        <option value="REJETE">Rejeté - corrections requises</option>
                      </select>
                    </div>

                    <div class="form-group full-width">
                      <label for="observationsGenerales">Observations générales et recommandations</label>
                      <textarea id="observationsGenerales" formControlName="observationsGenerales" rows="3"
                        placeholder="Synthèse générale du rapport et recommandations pour les prochaines périodes"></textarea>
                    </div>
                  </div>
                </div>

                <!-- Navigation entre les étapes -->
                <div class="step-navigation">
                  <button type="button" class="btn btn-outline" (click)="previousStep()"
                          [disabled]="currentStep === 1" *ngIf="currentStep > 1">
                    ← Précédent
                  </button>

                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">
                    Annuler
                  </button>

                  <button type="button" class="btn btn-primary" (click)="nextStep()"
                          [disabled]="!canProceedToNext()" *ngIf="currentStep < totalSteps">
                    Suivant →
                  </button>

                  <button type="submit" class="btn btn-success" [disabled]="loading || !canProceedToNext()"
                          *ngIf="currentStep === totalSteps">
                    <span *ngIf="loading" class="loading"></span>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Rapports Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Rapports de Suivi</h2>
          </div>

          <div class="table-wrapper">
            <table *ngIf="rapports.length > 0; else noData">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ordre de Commande</th>
                  <th>Trimestre</th>
                  <th>Prestataire</th>
                  <th>Prestations Réalisées</th>
                  <th>Statut</th>
                  <th>Observations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rapport of rapports">
                  <td>{{ rapport.dateRapport | date:'dd/MM/yyyy' }}</td>
                  <td>{{ rapport.ordreCommande?.idOC }} - {{ rapport.ordreCommande?.numeroOc || rapport.ordreCommande?.numeroCommande }}</td>
                  <td>{{ rapport.trimestre }}</td>
                  <td>{{ rapport.prestataire }}</td>
                  <td>{{ rapport.prestationsRealisees }}</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(rapport.statut!)">
                      {{ getStatusLabel(rapport.statut!) }}
                    </span>
                  </td>
                  <td>{{ rapport.observations || '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-secondary btn-sm" (click)="editRapport(rapport)" *ngIf="authService.isAgentDGSI()">
                        Modifier
                      </button>
                      <button class="btn btn-info btn-sm" (click)="viewRapport(rapport)">
                        Détails
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteRapport(rapport)" *ngIf="authService.isAgentDGSI()">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun rapport de suivi trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des rapports de suivi...
        </div>

        <!-- Section génération de rapports PDF consolidés -->
        <div class="report-export-section" *ngIf="authService.isAgentDGSI()">
          <div class="section-header">
            <h2>Rapports PDF Consolidés</h2>
            <p>Générez des rapports trimestriels complets incluant toutes les données du système</p>
          </div>

          <app-report-export></app-report-export>
        </div>
      </div>
   `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .page-header div {
      flex: 1;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .methodology-info {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 0.375rem;
      border-left: 4px solid #3b82f6;
    }

    .step-indicator {
      margin: 1rem 0;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .step-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .step-counter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border-radius: 50%;
      font-size: 1rem;
      font-weight: 700;
    }

    .step-info .step-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .step-progress {
      width: 100%;
    }

    .progress-bar {
      width: 100%;
      height: 0.5rem;
      background: #e2e8f0;
      border-radius: 0.25rem;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      border-radius: 0.25rem;
      transition: width 0.3s ease;
    }

    .step-navigation {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e2e8f0;
      gap: 1rem;
    }

    .step-navigation .btn {
      flex: 1;
      max-width: 150px;
    }

    .step-navigation .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .step-section {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }

    .step-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border-radius: 50%;
      font-size: 0.875rem;
      font-weight: 700;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .table-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-error {
      background-color: #fecaca;
      color: #991b1b;
    }

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

    .report-export-section {
      margin-top: 3rem;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 1rem;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .section-header h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .section-header p {
      font-size: 1rem;
      color: var(--text-secondary);
      margin: 0;
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .report-export-section {
        margin-top: 2rem;
        padding: 1.5rem;
      }

      .section-header h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class RapportSuiviListComponent implements OnInit {
  rapports: RapportSuivi[] = [];
  ordres: OrdreCommande[] = [];
  rapportForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;

  // Multi-step wizard properties
  currentStep = 1;
  totalSteps = 7;
  stepTitles = [
    'Sélection de l\'ordre de commande',
    'Analyse des prestations réalisées',
    'Vérification des ordres de commande',
    'Contrôle des contrats actifs',
    'Inventaire des équipements',
    'Évaluation des structures MEFP',
    'Validation et synthèse finale'
  ];

  // Auto-loaded data based on selected order
  selectedOrdreCommande: OrdreCommande | null = null;
  relatedPrestations: Prestation[] = [];
  relatedContrats: Contrat[] = [];
  relatedItems: Item[] = [];
  relatedStructures: StructureMefp[] = [];

  constructor(
    private ordreCommandeService: OrdreCommandeService,
    private rapportSuiviService: RapportSuiviService,
    private prestationService: PrestationService,
    private contratService: ContratService,
    private itemService: ItemService,
    private structureMefpService: StructureMefpService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.rapportForm = this.formBuilder.group({
      // Étape 1: Informations générales
      ordreCommandeId: ['', Validators.required],
      dateRapport: [new Date().toISOString().split('T')[0], Validators.required],
      trimestre: ['', Validators.required],
      prestataire: [{value: '', disabled: true}],

      // Étape 2: Analyse des prestations
      prestationsRealisees: [0, [Validators.required, Validators.min(0)]],
      observationsPrestations: ['', Validators.required],

      // Étape 3: Vérification des ordres
      observationsOrdres: ['', Validators.required],

      // Étape 4: Contrôle des contrats
      observationsContrats: ['', Validators.required],

      // Étape 5: Inventaire des équipements
      observationsItems: ['', Validators.required],

      // Étape 6: Évaluation des structures
      observationsStructures: ['', Validators.required],

      // Étape 7: Validation finale
      observationsGenerales: ['', Validators.required],
      statut: ['EN_ATTENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRapportsSuivi();
    this.loadOrdres();
    this.setupOrdreCommandeListener();
  }

  loadRapportsSuivi(): void {
    this.loadingList = true;
    this.rapportSuiviService.getAllRapports().subscribe({
      next: (rapports) => {
        this.rapports = rapports;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading rapports:', error);
        this.loadingList = false;
      }
    });
  }

  loadOrdres(): void {
    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        this.ordres = ordres;
      },
      error: (error) => {
        console.error('Error loading ordres:', error);
      }
    });
  }

  setupOrdreCommandeListener(): void {
    // Listener pour la sélection d'ordre de commande
    this.rapportForm.get('ordreCommandeId')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedOrdreCommande = this.ordres.find(o => o.id === value) || null;
        if (this.selectedOrdreCommande) {
          // Charger automatiquement les données liées
          this.loadRelatedData(this.selectedOrdreCommande);
          // Remplir automatiquement le prestataire
          this.rapportForm.patchValue({
            prestataire: this.selectedOrdreCommande.prestataireItem || 'Prestataire non défini'
          });
        }
      } else {
        this.clearRelatedData();
      }
    });
  }

  loadRelatedData(ordreCommande: OrdreCommande): void {
    // Étape 2: Charger toutes les prestations (simplifié pour l'instant)
    this.loadAllPrestations();

    // Étape 4: Charger tous les contrats actifs
    this.loadAllContrats();

    // Étape 5: Charger tous les items
    this.loadAllItems();

    // Étape 6: Charger toutes les structures MEFP
    this.loadAllStructures();
  }

  loadAllPrestations(): void {
    // Charger toutes les prestations pour le trimestre sélectionné
    const trimestre = this.rapportForm.get('trimestre')?.value;
    if (trimestre) {
      this.prestationService.getPrestationsByTrimestre(trimestre).subscribe({
        next: (prestations: any[]) => {
          this.relatedPrestations = prestations;
          // Calculer automatiquement le nombre de prestations réalisées
          this.rapportForm.patchValue({
            prestationsRealisees: prestations.length
          });
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des prestations:', error);
          this.relatedPrestations = [];
        }
      });
    }
  }

  loadAllContrats(): void {
    // Charger tous les contrats actifs
    this.contratService.getAllContrats().subscribe({
      next: (contrats: any[]) => {
        this.relatedContrats = contrats.filter(c => c.statut === 'ACTIF');
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des contrats:', error);
        this.relatedContrats = [];
      }
    });
  }

  loadAllItems(): void {
    // Charger tous les items disponibles
    this.itemService.getAllItems().subscribe({
      next: (items: any[]) => {
        this.relatedItems = items;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des items:', error);
        this.relatedItems = [];
      }
    });
  }

  loadAllStructures(): void {
    // Charger toutes les structures MEFP
    this.structureMefpService.getAllStructures().subscribe({
      next: (structures: any[]) => {
        this.relatedStructures = structures;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des structures:', error);
        this.relatedStructures = [];
      }
    });
  }

  clearRelatedData(): void {
    this.selectedOrdreCommande = null;
    this.relatedPrestations = [];
    this.relatedContrats = [];
    this.relatedItems = [];
    this.relatedStructures = [];
    this.rapportForm.patchValue({
      prestataire: '',
      prestationsRealisees: 0
    });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.canProceedToNext()) {
      this.currentStep++;
      // Recharger les données si nécessaire pour l'étape suivante
      if (this.currentStep === 2) {
        this.loadAllPrestations();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNext(): boolean {
    switch (this.currentStep) {
      case 1:
        return !!(this.rapportForm.get('ordreCommandeId')?.valid &&
                 this.rapportForm.get('dateRapport')?.valid &&
                 this.rapportForm.get('trimestre')?.valid);
      case 2:
        return !!(this.rapportForm.get('prestationsRealisees')?.valid &&
                 this.rapportForm.get('observationsPrestations')?.valid);
      case 3:
        return !!this.rapportForm.get('observationsOrdres')?.valid;
      case 4:
        return !!this.rapportForm.get('observationsContrats')?.valid;
      case 5:
        return !!this.rapportForm.get('observationsItems')?.valid;
      case 6:
        return !!this.rapportForm.get('observationsStructures')?.valid;
      default:
        return true;
    }
  }

  getCurrentStepTitle(): string {
    return this.stepTitles[this.currentStep - 1] || '';
  }

  openCreateForm(): void {
    this.resetForm(); // S'assurer que le formulaire est réinitialisé
    this.showCreateForm = true;
    this.currentStep = 1; // Commencer à l'étape 1
  }

  async onSubmit(): Promise<void> {
    if (this.rapportForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} ce rapport de suivi ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const rapportData = this.rapportForm.value;

        if (this.isEditing && this.editingId) {
          this.rapportSuiviService.updateRapport(this.editingId, rapportData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadRapportsSuivi();
              this.toastService.show({ type: 'success', title: 'Rapport modifié', message: 'Le rapport de suivi a été modifié avec succès' });
            },
            error: (error) => {
              console.error('Error updating rapport:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
            }
          });
        } else {
          this.rapportSuiviService.createRapport(rapportData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadRapportsSuivi();
              this.toastService.show({ type: 'success', title: 'Rapport créé', message: 'Le rapport de suivi a été créé avec succès' });
            },
            error: (error) => {
              console.error('Error creating rapport:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
            }
          });
        }
      }
    }
  }

  editRapport(rapport: any): void {
    this.isEditing = true;
    this.editingId = rapport.id!;
    this.showCreateForm = true;
    this.currentStep = 1; // Commencer à l'étape 1 en mode édition

    this.rapportForm.patchValue({
      ordreCommandeId: rapport.ordreCommandeId,
      dateRapport: rapport.dateRapport,
      trimestre: rapport.trimestre,
      prestataire: rapport.prestataire,
      prestationsRealisees: rapport.prestationsRealisees,
      observationsPrestations: rapport.observationsPrestations || '',
      observationsOrdres: rapport.observationsOrdres || '',
      observationsContrats: rapport.observationsContrats || '',
      observationsItems: rapport.observationsItems || '',
      observationsStructures: rapport.observationsStructures || '',
      observationsGenerales: rapport.observationsGenerales || '',
      statut: rapport.statut
    });
  }

  async deleteRapport(rapport: any): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer le rapport',
      message: `Êtes-vous sûr de vouloir supprimer ce rapport du ${rapport.dateRapport} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.rapportSuiviService.deleteRapport(rapport.id!).subscribe({
        next: () => {
          this.loadRapportsSuivi();
          this.toastService.show({ type: 'success', title: 'Rapport supprimé', message: 'Le rapport de suivi a été supprimé avec succès' });
        },
        error: (error) => {
          console.error('Error deleting rapport:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression du rapport' });
        }
      });
    }
  }

  viewRapport(rapport: any): void {
    // TODO: Implement rapport details view
    this.toastService.show({
      type: 'info',
      title: 'Détails du rapport',
      message: `Rapport du ${rapport.dateRapport} - ${rapport.prestataire}`
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.rapportForm.reset();
    this.rapportForm.patchValue({
      statut: 'EN_ATTENTE',
      prestationsRealisees: 0,
      observationsPrestations: '',
      observationsOrdres: '',
      observationsContrats: '',
      observationsItems: '',
      observationsStructures: '',
      observationsGenerales: ''
    });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.currentStep = 1; // Remettre à l'étape 1
    this.clearRelatedData(); // Nettoyer les données chargées
  }

  getStatusBadgeClass(statut: StatutRapport): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'APPROUVE': 'badge-success',
      'REJETE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-warning';
  }

  getStatusLabel(statut: StatutRapport): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'APPROUVE': 'Approuvé',
      'REJETE': 'Rejeté'
    };
    return statusLabels[statut] || statut;
  }
}