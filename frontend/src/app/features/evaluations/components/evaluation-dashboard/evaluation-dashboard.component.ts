import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EvaluationTrimestrielle } from '../../../../core/models/business.models';
import { EvaluationReportComponent } from '../../../evaluation/evaluation-report.component';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EvaluationReportComponent],
  templateUrl: './evaluation-dashboard.component.html',
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #f8fafc;
      padding: 2rem;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 2rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-title {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
      color: #f8fafc;
    }

    .header-subtitle {
      font-size: 1rem;
      opacity: 0.9;
      margin: 0.25rem 0 0 0;
      color: #e2e8f0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 1px solid rgba(255,255,255,0.8);
      transition: all 0.4s ease;
      position: relative;
      overflow: hidden;
    }

    .stat-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .stat-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    }

    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }

    .stat-icon.success { background: linear-gradient(135deg, #10b981, #34d399); color: white; }
    .stat-icon.warning { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; }
    .stat-icon.danger { background: linear-gradient(135deg, #ef4444, #f87171); color: white; }
    .stat-icon.info { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; }

    .stat-value {
      font-size: 3rem;
      font-weight: 800;
      color: #1f2937;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .stat-label {
      font-size: 1rem;
      color: #6b7280;
      margin: 0.5rem 0 0 0;
      font-weight: 500;
    }

    .evaluations-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .evaluation-item {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .evaluation-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: linear-gradient(180deg, #3b82f6, #1e40af);
    }

    .evaluation-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }

    .evaluation-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 3rem;
    }

    .evaluation-main {
      flex: 1;
    }

    .evaluation-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 1.25rem 0;
      line-height: 1.2;
    }

    .evaluation-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      font-size: 0.95rem;
      color: #6b7280;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      padding: 0.75rem 1.25rem;
      border-radius: 25px;
      font-weight: 500;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .evaluation-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-width: 220px;
    }

    /* Form styles */
    .form-modal .modal-content {
      max-width: 900px;
      padding: 0;
      border-radius: 16px;
      overflow: hidden;
    }

    .evaluation-form {
      padding: 2.5rem;
      background: white;
    }

    .form-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 2.5rem;
      text-align: center;
      position: relative;
    }

    .form-title::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #3b82f6, #1e40af);
      border-radius: 2px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .form-group {
      position: relative;
    }

    .form-group label {
      display: block;
      font-size: 0.95rem;
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.75rem;
    }

    .line-input {
      width: 100%;
      padding: 1rem 1.25rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 1rem;
      background: #ffffff;
      outline: none;
      color: #1f2937;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .line-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      transform: translateY(-1px);
    }

    .line-input.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-message {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .criteria-section {
      margin: 2.5rem 0;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
    }

    .criteria-section h3 {
      font-size: 1.3rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1.5rem;
      text-align: center;
      position: relative;
    }

    .criteria-section h3::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 2px;
      background: #3b82f6;
      border-radius: 1px;
    }

    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 10px;
      border: 2px solid #f1f5f9;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .checkbox-group::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
      transition: left 0.5s;
    }

    .checkbox-group:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      transform: translateY(-2px);
    }

    .checkbox-group:hover::before {
      left: 100%;
    }

    .checkbox-group input[type="checkbox"] {
      width: 22px;
      height: 22px;
      accent-color: #3b82f6;
      cursor: pointer;
    }

    .checkbox-group label {
      font-size: 0.95rem;
      color: #374151;
      font-weight: 500;
      cursor: pointer;
      flex: 1;
      line-height: 1.4;
    }

    .form-actions {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    .btn {
      padding: 0.875rem 2rem;
      border: none;
      border-radius: 10px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
      font-family: inherit;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .btn:hover::before {
      left: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      color: white;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
    }

    .btn-success {
      background: linear-gradient(135deg, #059669, #047857);
      color: white;
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #047857, #065f46);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
    }

    .btn-secondary:hover {
      background: #4b5563;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(107, 114, 128, 0.3);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: white;
      border-radius: 20px;
      max-width: 95vw;
      max-height: 95vh;
      overflow-y: auto;
      box-shadow: 0 25px 60px rgba(0,0,0,0.3);
      animation: slideIn 0.4s ease;
      border: 1px solid rgba(255,255,255,0.2);
    }

    @keyframes slideIn {
      from {
        transform: scale(0.9) translateY(-30px);
        opacity: 0;
        filter: blur(4px);
      }
      to {
        transform: scale(1) translateY(0);
        opacity: 1;
        filter: blur(0);
      }
    }

    .loading {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
      font-size: 1.2rem;
    }

    .no-data {
      text-align: center;
      padding: 4rem;
      color: #6b7280;
      grid-column: 1 / -1;
      background: white;
      border-radius: 20px;
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }

    .no-data p {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .no-data small {
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
      }

      .header-title {
        font-size: 2.5rem;
      }

      .search-input {
        width: 250px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .evaluations-grid {
        grid-template-columns: 1fr;
      }

      .evaluation-actions {
        flex-direction: column;
      }

      .btn {
        justify-content: center;
      }
    }
  `]
})
export class EvaluationDashboardComponent implements OnInit {
  evaluations: EvaluationTrimestrielle[] = [];
  selectedEvaluation: EvaluationTrimestrielle | null = null;
  showReportModal = false;
  showCreateForm = false;
  loading = false;
  evaluationForm: FormGroup;

  constructor(
    private evaluationService: EvaluationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.evaluationForm = this.formBuilder.group({
      sessionId: [null],
      lot: ['', Validators.required],
      trimestre: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      prestataireNom: ['', Validators.required],
      evaluateurNom: ['', Validators.required],
      observationsGenerales: [''],
      signatureEvaluateur: [''],
      rapportInterventionTransmis: [false],
      delaiReactionRespecte: [false],
      delaiInterventionRespecte: [false],
      horairesRespectes: [false],
      registreRempli: [false],
      vehiculeDisponible: [false],
      tenueDisponible: [false],
      techniciensCertifies: [false],
      correspondantId: [null, Validators.required],
      techniciensListe: [''],
      prestationsVerifiees: [''],
      instancesNonResolues: [''],
      appreciationRepresentant: [''],
      signatureRepresentant: [''],
      preuves: [''],
      penalitesCalcul: [0],
      fichierPdf: [''],
      statut: ['Brouillon', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.loading = false;
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  viewReport(evaluation: EvaluationTrimestrielle): void {
    this.selectedEvaluation = evaluation;
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.selectedEvaluation = null;
  }

  generatePdf(evaluation: EvaluationTrimestrielle): void {
    // Call the backend PDF generation endpoint
    const pdfUrl = `/api/reports/evaluations/${evaluation.id}/pdf`;
    window.open(pdfUrl, '_blank');
  }

  async onSubmit(): Promise<void> {
    if (this.evaluationForm.valid) {
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: 'Voulez-vous créer cette évaluation trimestrielle ?',
        confirmText: 'Créer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const evaluationData = this.evaluationForm.value;

        this.evaluationService.createEvaluation(evaluationData).subscribe({
          next: () => {
            this.loading = false;
            this.resetForm();
            this.loadEvaluations();
            this.toastService.show({ type: 'success', title: 'Succès', message: 'Évaluation créée avec succès' });
          },
          error: (error) => {
            console.error('Error creating evaluation:', error);
            this.loading = false;
            this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de l\'évaluation' });
          }
        });
      }
    }
  }

  private resetForm(): void {
    this.evaluationForm.reset();
    this.evaluationForm.patchValue({
      rapportInterventionTransmis: false,
      delaiReactionRespecte: false,
      delaiInterventionRespecte: false,
      horairesRespectes: false,
      registreRempli: false,
      vehiculeDisponible: false,
      tenueDisponible: false,
      techniciensCertifies: false,
      penalitesCalcul: 0,
      statut: 'Brouillon'
    });
    this.showCreateForm = false;
  }
}