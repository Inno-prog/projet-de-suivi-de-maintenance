import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService } from '../../core/services/evaluation.service';
import { EvaluationTrimestrielle } from '../../core/models/business.models';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Évaluation du Prestataire</h1>
        <p *ngIf="prestataireNom">Prestataire: {{ prestataireNom }}</p>
      </div>
      
      <form [formGroup]="evaluationForm" (ngSubmit)="onSubmit()">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Trimestre *</label>
              <div class="custom-select-container">
                <div class="custom-select" (click)="toggleTrimestreDropdown()" [class.open]="showTrimestreDropdown">
                  <span class="selected-text">{{ getTrimestreDisplayText() }}</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
                <div class="dropdown-overlay" *ngIf="showTrimestreDropdown" (click)="showTrimestreDropdown = false"></div>
                <div class="custom-dropdown" *ngIf="showTrimestreDropdown">
                  <div class="dropdown-option" (click)="selectTrimestre('')">Sélectionner...</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T1')">T1</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T2')">T2</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T3')">T3</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T4')">T4</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Nom du prestataire *</label>
              <select class="form-control" formControlName="prestataireNom" (change)="onPrestataireChange($event)">
                <option value="">Sélectionner un prestataire</option>
                <option *ngFor="let prestataire of prestataires" [value]="prestataire.nom">
                  {{ prestataire.nom }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Lot *</label>
              <select class="form-control" formControlName="lot">
                <option value="">Sélectionner un lot</option>
                <option *ngFor="let lot of availableLots" [value]="lot">
                  {{ lot }}
                </option>
              </select>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Date d'évaluation *</label>
              <input type="date" class="form-control" formControlName="dateEvaluation">
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Structure (Direction) *</label>
              <select class="form-control" formControlName="direction1">
                <option value="">Sélectionner une structure</option>
                <option *ngFor="let structure of structures" [value]="structure">
                  {{ structure }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <h4>III. EXIGENCES À SATISFAIRE</h4>

        <div class="exigences-grid">
          <div class="exigence-item" *ngFor="let item of exigencesList; let i = index">
            <div class="exigence-header">
              <span class="exigence-number">{{ i + 1 }}</span>
              <span class="exigence-label">{{ item.label }}</span>
            </div>
            <div class="exigence-content">
              <div class="mb-3">
                <label class="form-label">Exigences satisfaites par le prestataire</label>
                <input type="text" class="form-control" [formControlName]="item.exigenceControl" placeholder="Renseignez les exigences satisfaites">
              </div>
              <div class="mb-3">
                <label class="form-label">Observations</label>
                <input type="text" class="form-control" [formControlName]="item.obsControl" placeholder="RAS">
              </div>
            </div>
          </div>
        </div>

        <h4>IV. INSTANCES DE MAINTENANCE NON RÉSOLUES AU COURS DU TRIMESTRE</h4>

        <div class="instances-container">
          <div class="instance-item">
            <div class="instance-header">
              <span class="instance-number">1</span>
            </div>
            <div class="instance-content">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Instances non résolues</label>
                    <input type="text" class="form-control" formControlName="instance1" placeholder="RAS">
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Direction</label>
                    <input type="text" class="form-control" formControlName="direction1" placeholder="DREP/Cas">
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Date de début de la panne</label>
                    <input type="date" class="form-control" formControlName="dateDebut1">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Nombre de jours de pénalité</label>
                    <input type="number" class="form-control" formControlName="joursPenalite1" placeholder="RAS">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="mb-3">
                    <label class="form-label">Observations</label>
                    <input type="text" class="form-control" formControlName="obsInstance1" placeholder="RAS">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h4>V. APPRÉCIATION DU REPRÉSENTANT DE LA STRUCTURE</h4>

        <div class="row">
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Signature du prestataire</label>
              <input type="text" class="form-control" formControlName="signaturePrestataire" placeholder="Nom du signataire">
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Signature de la direction</label>
              <input type="text" class="form-control" formControlName="signatureDirection" placeholder="Nom du signataire">
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label">Signature de la DGSI</label>
              <input type="text" class="form-control" formControlName="signatureDGSI" placeholder="Nom du signataire">
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label elegant-label">Observations générales</label>
          <textarea class="form-control elegant-textarea" rows="4" formControlName="observationsGenerales"
                    placeholder="Saisissez vos observations générales concernant cette évaluation..."></textarea>
        </div>

        <div class="mb-4">
          <label class="form-label elegant-label">Appréciation du représentant</label>
          <textarea class="form-control elegant-textarea" rows="3" formControlName="appreciationRepresentant"
                    placeholder="Saisissez votre appréciation personnelle..."></textarea>
        </div>

        <!-- Success message and download section -->
        <div *ngIf="isSubmitted" class="success-section">
          <div class="success-message">
            <div class="success-icon">✓</div>
            <div class="success-content">
              <h4>Évaluation enregistrée avec succès</h4>
              <p>Vous pouvez maintenant télécharger le rapport d'évaluation</p>
            </div>
          </div>
          <button type="button" class="btn btn-success download-btn" (click)="downloadEvaluation()">
            <span class="download-icon">📄</span>
            Télécharger le Rapport
          </button>
        </div>

        <div class="form-actions" [class.subtle]="isSubmitted">
          <button type="button" class="btn btn-outline-secondary" (click)="retour()">
            Retour
          </button>
          <button type="submit" class="btn btn-primary elegant-submit" [disabled]="evaluationForm.invalid || isSubmitted">
            {{ isSubmitted ? 'Évaluation Enregistrée' : 'Enregistrer Évaluation' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }

    .exigences-grid {
      display: grid;
      gap: 1.5rem;
      margin: 2rem 0;
    }

    .exigence-item {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .exigence-item:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .exigence-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .exigence-number {
      background: #3b82f6;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .exigence-label {
      flex: 1;
      font-weight: 600;
      color: #1e293b;
      line-height: 1.5;
    }

    .exigence-content {
      padding-left: 42px;
    }

    .instances-container {
      margin: 2rem 0;
    }

    .instance-item {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .instance-item:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    }

    .instance-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .instance-number {
      background: #ef4444;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
      color: #1e293b;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .page-header p {
      color: #64748b;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }

    h4 {
      color: #2563eb;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 2rem 0 1rem 0;
      letter-spacing: -0.025em;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .evaluation-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .evaluation-table th {
      background: #2563eb;
      color: white;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
    }

    .evaluation-table td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .evaluation-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .evaluation-table tbody tr:hover {
      background: #f1f5f9;
    }

    .form-control-sm {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 0.375rem 0.5rem;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #374151;
      background: #ffffff;
      transition: all 0.2s ease;
    }

    .form-control-sm:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }

    .form-control-sm::placeholder {
      color: #9ca3af;
      font-style: italic;
    }

    .success-section {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 16px;
      padding: 2rem;
      margin: 2rem 0;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .success-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .success-icon {
      width: 3rem;
      height: 3rem;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    }

    .success-content h4 {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .success-content p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }

    .download-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      padding: 0.875rem 2rem;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .download-btn:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(16, 185, 129, 0.3);
    }

    .download-icon {
      font-size: 1.2rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      transition: all 0.3s ease;
    }

    .form-actions.subtle {
      opacity: 0.7;
      transform: scale(0.98);
    }

    .elegant-submit {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: none;
      border-radius: 12px;
      padding: 0.875rem 2rem;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }
  `]
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm!: FormGroup;
  prestataireNom: string = '';
  nomItem: string = '';
  evaluationId: number | null = null;
  isSubmitted: boolean = false;
  showTrimestreDropdown: boolean = false;
  prestataires: any[] = [];
  availableLots: string[] = [];
  structures: string[] = [];
  
  // Mapping prestataire -> lots
  prestataireLotsMap: { [key: string]: string[] } = {};
  
  exigencesList = [
    {
      label: 'Vérification des techniciens ayant les profils demandés et retenus avec un chef de site certifié ITIL Foundation',
      exigenceControl: 'exigence1',
      obsControl: 'obs1'
    },
    {
      label: 'Transmission du rapport d\'intervention de maintenance du trimestre évalué',
      exigenceControl: 'exigence2',
      obsControl: 'obs2'
    },
    {
      label: 'Remplissage quotidien du registre de suivi et des fiches d\'interventions',
      exigenceControl: 'exigence3',
      obsControl: 'obs3'
    },
    {
      label: 'Respect des horaires de travail de l\'administration par les techniciens sur le site. 07h30 à 12h30 et 13h00 à 16h00 du lundi au jeudi; 07h30 à 12h30 et 13h30 à 16h30 le vendredi',
      exigenceControl: 'exigence4',
      obsControl: 'obs4'
    },
    {
      label: 'Respect du délai de réaction de trois heures (3h)',
      exigenceControl: 'exigence5',
      obsControl: 'obs5'
    },
    {
      label: 'Respect du délai d\'intervention de trois jours (72h)',
      exigenceControl: 'exigence6',
      obsControl: 'obs6'
    },
    {
      label: 'Disponibilité d\'un véhicule utilitaire pour le lot concerné',
      exigenceControl: 'exigence7',
      obsControl: 'obs7'
    },
    {
      label: 'Disponibilité des tenues de travail des techniciens avec le nom de la société et du technicien',
      exigenceControl: 'exigence8',
      obsControl: 'obs8'
    },
    {
      label: 'Vérification de la liste des prestations réalisées dans le trimestre (maintenance préventive et curative)',
      exigenceControl: 'exigence9',
      obsControl: 'obs9'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.evaluationForm = this.fb.group({
      trimestre: ['', Validators.required],
      lot: ['', Validators.required],
      prestataireNom: ['', Validators.required],
      prestataireEmail: [''], // Champ pour l'email du prestataire
      dateEvaluation: ['', Validators.required],
      exigence1: [''],
      exigence2: [''],
      exigence3: [''],
      exigence4: [''],
      exigence5: [''],
      exigence6: [''],
      exigence7: [''],
      exigence8: [''],
      exigence9: [''],
      obs1: [''],
      obs2: [''],
      obs3: [''],
      obs4: [''],
      obs5: [''],
      obs6: [''],
      obs7: [''],
      obs8: [''],
      obs9: [''],
      instance1: [''],
      direction1: [''],
      dateDebut1: [''],
      joursPenalite1: [''],
      obsInstance1: [''],
      signaturePrestataire: [''],
      signatureDirection: [''],
      signatureDGSI: [''],
      observationsGenerales: [''],
      appreciationRepresentant: ['']
    });
  }

  ngOnInit(): void {
    // Vérifier si on est en mode édition (route avec id)
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.evaluationId = Number(id);
      this.loadEvaluation();
    }

    this.route.queryParams.subscribe(params => {
      if (params['prestataire']) {
        this.prestataireNom = params['prestataire'];
        this.nomItem = params['nomItem'] || '';
        
        this.evaluationForm.patchValue({
          prestataireNom: this.prestataireNom,
          dateEvaluation: new Date().toISOString().split('T')[0]
        });
      }
    });

    // Charger la liste des prestataires
    this.userService.getAllPrestataires().subscribe({
      next: (data) => {
        this.prestataires = data;
        console.log('Prestataires:', data);
        
        // Initialiser le mapping prestataire -> lots avec les données réelles des prestataires
        this.prestataireLotsMap = data.reduce((map: { [key: string]: string[] }, prestataire: any) => {
          map[prestataire.nom] = this.getDefaultLotsForPrestataire(prestataire.nom);
          return map;
        }, {});
        console.log('Prestataire lots map:', this.prestataireLotsMap);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prestataires:', error);
      }
    });

    // Charger la liste des structures (exemple)
    this.structures = [
      'Direction Régionale de l\'Économie et de la Planification des Cascades (DREP/Cas)',
      'BCMP',
      'Direction Générale des Systèmes d\'Information (DGSI)',
      'Autre'
    ];
  }

  loadEvaluation(): void {
    if (this.evaluationId) {
      this.evaluationService.getEvaluationById(this.evaluationId).subscribe({
        next: (evaluation) => {
          console.log('Évaluation chargée:', evaluation);
          this.evaluationForm.patchValue(evaluation);
          // Mettre à jour la variable prestataireNom pour l'affichage
          this.prestataireNom = evaluation.prestataireNom;
          // Charger les lots du prestataire
          this.availableLots = this.prestataireLotsMap[evaluation.prestataireNom] || [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'évaluation:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du chargement de l\'évaluation'
          });
        }
      });
    }
  }

  toggleTrimestreDropdown(): void {
    this.showTrimestreDropdown = !this.showTrimestreDropdown;
  }

  selectTrimestre(value: string): void {
    this.evaluationForm.patchValue({ trimestre: value });
    this.showTrimestreDropdown = false;
  }

  getTrimestreDisplayText(): string {
    const trimestre = this.evaluationForm.get('trimestre')?.value;
    const trimestreMap: { [key: string]: string } = {
      'T1': 'T1',
      'T2': 'T2',
      'T3': 'T3',
      'T4': 'T4'
    };
    return trimestreMap[trimestre] || 'Sélectionner un trimestre';
  }

  getDefaultLotsForPrestataire(prestataireNom: string): string[] {
    // Logique de détermination des lots par prestataire
    // Pour l'exemple, on attribue des lots par défaut
    const lots = ['Lot 1', 'Lot 2', 'Lot 3', 'Lot 4', 'Lot 5', 'Lot 6', 'Lot 7', 'Lot 8', 'Lot 9', 'Lot 10'];
    // Attribuer un lot basé sur le nom du prestataire pour des tests
    const index = prestataireNom.charCodeAt(0) % 10;
    return [lots[index]];
  }

  onPrestataireChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const prestataireNom = target.value;
    console.log('Prestataire sélectionné:', prestataireNom);
    
    // Trouver le prestataire sélectionné pour récupérer son email
    const selectedPrestataire = this.prestataires.find(p => p.nom === prestataireNom);
    if (selectedPrestataire && selectedPrestataire.email) {
      this.evaluationForm.patchValue({ prestataireEmail: selectedPrestataire.email });
    }
    
    // Charger les lots du prestataire
    this.availableLots = this.prestataireLotsMap[prestataireNom] || [];
    this.evaluationForm.patchValue({ lot: '' });
  }

  onSubmit(): void {
    if (this.evaluationForm.valid) {
      const evaluationData = this.evaluationForm.value;
      
      // Add default status if not provided
      if (!evaluationData.statut) {
        evaluationData.statut = 'BROUILLON';
      }
      
      console.log('=== Données du formulaire ===');
      console.log('Form valid:', this.evaluationForm.valid);
      console.log('Form values:', this.evaluationForm.value);
      console.log('prestataireNom field value:', this.evaluationForm.get('prestataireNom')?.value);
      console.log('prestataireNom field valid:', this.evaluationForm.get('prestataireNom')?.valid);
      console.log('================================');
      
      console.log('Envoi des données d\'évaluation:', JSON.stringify(evaluationData, null, 2));
      
      if (this.evaluationId) {
        // Mode édition
        this.evaluationService.updateEvaluation(this.evaluationId, evaluationData as EvaluationTrimestrielle).subscribe({
          next: (evaluation) => {
            console.log('Évaluation mise à jour avec succès:', evaluation);
            this.evaluationId = evaluation.id || null;
            this.isSubmitted = true;
            this.toastService.show({
              type: 'success',
              title: 'Succès',
              message: 'Évaluation mise à jour avec succès'
            });
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour de l\'évaluation:', error);
            console.error('Détails de l\'erreur:', error.error || error.message);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: error.error?.message || 'Erreur lors de la mise à jour de l\'évaluation'
            });
          }
        });
      } else {
        // Mode création
        this.evaluationService.createEvaluation(evaluationData as EvaluationTrimestrielle).subscribe({
          next: (evaluation) => {
            console.log('Évaluation créée avec succès:', evaluation);
            this.evaluationId = evaluation.id || null;
            this.isSubmitted = true;
            this.toastService.show({
              type: 'success',
              title: 'Succès',
              message: 'Évaluation enregistrée avec succès'
            });
          },
          error: (error) => {
            console.error('Erreur lors de l\'enregistrement de l\'évaluation:', error);
            console.error('Détails de l\'erreur:', error.error || error.message);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: error.error?.message || 'Erreur lors de l\'enregistrement de l\'évaluation'
            });
          }
        });
      }
    } else {
      console.warn('Formulaire invalide:', this.evaluationForm.errors);
      console.warn('Form controls status:', Object.keys(this.evaluationForm.controls).map(key => ({
        key,
        valid: this.evaluationForm.controls[key].valid,
        errors: this.evaluationForm.controls[key].errors,
        value: this.evaluationForm.controls[key].value
      })));
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  downloadEvaluation(): void {
    if (this.evaluationId) {
      this.evaluationService.generateEvaluationPdf(this.evaluationId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const lot = this.evaluationForm.get('lot')?.value || 'lot';
          const trimestre = this.getTrimestreDisplayText().toLowerCase();
          const nomPrestataire = this.evaluationForm.get('prestataireNom')?.value.replace(/\s+/g, '_') || 'prestataire';
          a.download = `rapport-evaluation-${nomPrestataire}-${trimestre}-${lot}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement du PDF:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du téléchargement du PDF'
          });
        }
      });
    }
  }

  retour(): void {
    this.router.navigate(['/evaluations']);
  }
}
