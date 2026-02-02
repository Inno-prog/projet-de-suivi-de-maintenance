import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { EvaluationTrimestrielle } from '../../../../core/models/business.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrls: ['./evaluation-dashboard.component.css']
})
export class EvaluationDashboardComponent implements OnInit {
  evaluations: EvaluationTrimestrielle[] = [];
  loading = false;
  evaluationForm: FormGroup;

  constructor(
    private evaluationService: EvaluationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.evaluationForm = this.formBuilder.group({
      sessionId: [null],
      lot: ['', Validators.required],
      trimestre: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      prestataireNom: ['', Validators.required],
      prestataireEmail: [''],
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

  navigateToNewEvaluation(): void {
    this.router.navigate(['/evaluations/new']);
  }

  loadEvaluations(): void {
    this.loading = true;
    
    // Si l'utilisateur est un prestataire, charger uniquement ses évaluations
    if (this.authService.isPrestataire()) {
      this.evaluationService.getEvaluationsByPrestataire().subscribe({
        next: (evaluations) => {
          this.evaluations = evaluations;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading evaluations:', error);
          this.loading = false;
        }
      });
    } else {
      // Sinon, charger toutes les évaluations (admin/agent DGSI)
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
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  viewPdf(evaluation: EvaluationTrimestrielle): void {
    // Afficher le PDF directement dans le navigateur
    this.evaluationService.generateEvaluationPdf(evaluation.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Erreur lors de l\'affichage du PDF:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de l\'affichage du PDF'
        });
      }
    });
  }

  downloadPdf(evaluation: EvaluationTrimestrielle): void {
    // Télécharger le PDF
    this.evaluationService.generateEvaluationPdf(evaluation.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const lot = evaluation.lot || 'lot';
        const trimestre = evaluation.trimestre || 'trimestre';
        const nomPrestataire = evaluation.prestataireNom || 'prestataire';
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

  sendEmailWithPdf(evaluation: EvaluationTrimestrielle): void {
    // Ouvrir Gmail avec le lien du PDF en pièce jointe
    const email = evaluation.prestataireEmail || '';
    const trimestre = evaluation.trimestre || 'T1';
    const lot = evaluation.lot || 'N/A';
    const year = new Date(evaluation.dateEvaluation).getFullYear();
    const pdfUrl = `${window.location.origin}/api/reports/evaluations/${evaluation.id}/pdf`;
    
    const subject = encodeURIComponent(`Évaluation Trimestrielle - Lot ${lot} - ${trimestre} ${year}`);
    const body = encodeURIComponent(
      `Bonjour,\n\nVeuillez trouver ci-joint le rapport d'évaluation trimestrielle pour le lot ${lot}.\n\nLien de téléchargement du PDF: ${pdfUrl}\n\nCordialement,\nDirection Générale des Systèmes d'Information\nMinistère de l'Économie et des Finances`
    );
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
    
    this.toastService.show({
      type: 'success',
      title: 'Messagerie ouverte',
      message: email ? `La fenêtre Gmail a été ouverte pour ${email}` : 'Veuillez entrer l\'adresse email du prestataire'
    });
  }

  editEvaluation(evaluation: EvaluationTrimestrielle): void {
    this.router.navigate(['/evaluations/edit', evaluation.id]);
  }

  async deleteEvaluation(evaluation: EvaluationTrimestrielle): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Confirmation',
      message: 'Voulez-vous supprimer cette évaluation ?',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.evaluationService.deleteEvaluation(evaluation.id!).subscribe({
        next: () => {
          this.loadEvaluations();
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Évaluation supprimée avec succès' });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression' });
        }
      });
    }
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
  }
}
