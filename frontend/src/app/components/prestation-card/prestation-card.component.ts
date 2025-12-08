import { Component, Input, EventEmitter, Output, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FichePrestationService } from '../../core/services/fiche-prestation.service';
import { PrestationService } from '../../core/services/prestation.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-prestation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './prestation-card.component.html',
  styleUrls: ['./prestation-card.component.css']
})
export class PrestationCardComponent implements OnChanges, OnInit {
  @Input() titre?: string;
  @Input() description?: string;
  @Input() fichierUrl?: string;
  @Input() prestationId?: string;
  @Input() userRoles?: string[];
  @Input() fiche?: any;
  @Input() statutValidation?: string;

  normalizedRoles: string[] = [];

  // Emit events so parent list can handle actions
  @Output() detailsClicked = new EventEmitter<string>();
  @Output() submitClicked = new EventEmitter<string>();
  @Output() validateClicked = new EventEmitter<string>();
  @Output() rejectClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();
  @Output() statutInterventionChanged = new EventEmitter<{prestationId: number, newStatutIntervention: string}>();

  constructor(
    private ficheService: FichePrestationService,
    private prestationService: PrestationService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Initialization logic removed for performance
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userRoles']) {
      this.normalizeRoles();
    }
  }

  normalizeRoles(): void {
    if (!this.userRoles || !Array.isArray(this.userRoles)) {
      this.normalizedRoles = [];
      return;
    }
    this.normalizedRoles = this.userRoles
      .map(r => (r || '').toString().trim())
      .map(r => {
        // Remove unwanted prefixes to normalize
        r = r.replace(/^ROLE_/i, '');        // ROLE_ADMINISTRATEUR  -> ADMINISTRATEUR
        r = r.replace(/^realm:/i, '');       // realm:ADMINISTRATEUR -> ADMINISTRATEUR
        r = r.replace(/^clientRole:/i, '');  // potential case
        return r.toUpperCase();
      })
      .filter(r => !!r);
  }

  // Add methods for validation status and others
  getValidationStatusClass(status: string) {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch ((status || '').toString().toUpperCase()) {
      case 'BROUILLON':
        return 'bg-gray-100 text-gray-800';
      case 'EN_ATTENTE':
      case 'EN_ATTENTE_VALIDATION':
        return 'bg-yellow-100 text-yellow-800';
      case 'VALIDE':
      case 'VALIDER':
        return 'bg-green-100 text-green-800';
      case 'REJETE':
      case 'REJETER':
        return 'bg-red-100 text-red-800';
      case 'TERMINEE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getValidationStatusLabel(status: string) {
    if (!status) return 'Inconnu';
    switch ((status || '').toString().toUpperCase()) {

      case 'EN_ATTENTE':
      case 'EN_ATTENTE_VALIDATION':
        return 'En attente';
      case 'VALIDE':
      case 'VALIDER':
        return 'Validé';
      case 'REJETE':
      case 'REJETER':
        return 'Rejeté';

      default:
        return status;
    }
  }

  // Parse description into structured data like structures-mefp
  getParsedPrestationData(): { [key: string]: string } {
    const data: { [key: string]: string } = {};

    if (!this.description) return data;

    // Extract individual fields from description
    const prestataireMatch = this.description.match(/Prestataire:\s*([^,\n]*)/i);
    const structureMatch = this.description.match(/Structure:\s*([^,\n]*)/i);
    const montantMatch = this.description.match(/Montant\s+intervention:\s*([^,\n]*)/i);
    const statutInterventionMatch = this.description.match(/Statut\s+intervention:\s*([^,\n]*)/i);
    const statutValidationMatch = this.description.match(/Statut\s+validation:\s*([^,\n]*)/i);

    if (prestataireMatch) data['prestataire'] = prestataireMatch[1].trim();
    if (structureMatch) data['structure'] = structureMatch[1].trim();
    if (montantMatch) data['montant'] = montantMatch[1].trim();
    if (statutInterventionMatch) data['statutIntervention'] = statutInterventionMatch[1].trim();
    if (statutValidationMatch) data['statutValidation'] = statutValidationMatch[1].trim();

    return data;
  }

  isAdmin(): boolean {
    if (!this.userRoles || !this.userRoles.length) {
      return false;
    }

    const adminVariants = new Set<string>([
      'ADMINISTRATEUR', 'ROLE_ADMINISTRATEUR', 'ADMIN', 'ROLE_ADMIN',
      'ADMINISTRATOR', 'ROLE_ADMINISTRATOR', 'ADMINISTRATION', 'ROLE_ADMINISTRATION',
      'AGENT_DGSI', 'ROLE_AGENT_DGSI'
    ].map(v => v.toUpperCase().trim()));

    return this.userRoles.some(role => {
      if (!role) return false;
      const roleStr = role.toString().trim().toUpperCase();
      const cleaned = roleStr
        .replace(/^ROLE_/i, '')
        .replace(/^REALM:/i, '')
        .replace(/^CLIENTROLE:/i, '');

      return adminVariants.has(roleStr) || adminVariants.has(cleaned);
    });
  }

  isPrestataire(): boolean {
    // accept PRESTATAIRE in various forms
    if (this.normalizedRoles.includes('PRESTATAIRE')) return true;
    if (this.userRoles && Array.isArray(this.userRoles)) {
      return this.userRoles.some(r => ((r || '').toString().toUpperCase().replace(/^ROLE_/, '') === 'PRESTATAIRE'));
    }
    return false;
  }

  /** Condition pour activer les boutons */
  canValidate(): boolean {
    // Administrators can validate any fiche, others only EN_ATTENTE
    if (this.isAdmin()) return true;
    const statut = (this.fiche?.statut || '').toString().toUpperCase();
    // Fiches soumises sont représentées par EN_ATTENTE in the backend enum
    return statut === 'EN_ATTENTE';
  }

  canReject(): boolean {
    // Administrators can reject any fiche, others only EN_ATTENTE
    if (this.isAdmin()) return true;
    const statut = (this.fiche?.statut || '').toString().toUpperCase();
    return statut === 'EN_ATTENTE';
  }

  /** Action Valider */
  onValidateClick(): void {
    if (!this.canValidate() || !this.prestationId) return;

    // Try to validate fiche if it exists, otherwise validate prestation directly
    if (this.fiche?.id) {
      // Validate through fiche (existing logic)
      const id = Number(this.fiche.id);
      this.ficheService.validerFiche(id).subscribe({
        next: (updated) => {
          this.fiche.statut = 'VALIDE';
          this.toastService.show({ type: 'success', title: 'Validation', message: 'La fiche a été validée' });
        },
        error: (err) => {
          console.error('Erreur validation fiche:', err);
          let errorMessage = 'Une erreur est survenue lors de la validation';

          if (err.error && err.error.message) {
            errorMessage = err.error.message;
          } else if (err.status === 0) {
            errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
          } else if (err.status === 401) {
            errorMessage = 'Vous n\'êtes pas autorisé à effectuer cette action';
          } else if (err.status === 403) {
            errorMessage = 'Accès refusé à cette action';
          } else if (err.status === 404) {
            errorMessage = 'La fiche de prestation est introuvable';
          } else if (err.status === 400) {
            errorMessage = 'Données de validation incorrectes';
          }

          this.toastService.show({ type: 'error', title: 'Erreur', message: errorMessage });
        }
      });
    } else {
      // No fiche exists - validate prestation directly (no fake fiche creation)
      const commentaires = prompt('Commentaires pour la validation (optionnel):') || '';

      this.prestationService.validatePrestation(this.prestationId, commentaires).subscribe({
        next: (validated) => {
          this.toastService.show({
            type: 'success',
            title: 'Validation réussie',
            message: 'La prestation a été validée avec succès'
          });
          // Emit event to refresh parent component
          this.validateClicked.emit(this.prestationId);
        },
        error: (err) => {
          console.error('Erreur lors de la validation directe:', err);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la validation: ' + (err.error?.message || err.message)
          });
        }
      });
    }
  }
  onRejectClick(): void {
    if (!this.canReject() || !this.prestationId) return;

    // Try to reject fiche if it exists, otherwise reject prestation directly
    if (this.fiche?.id) {
      // Reject through fiche (existing logic)
      const id = Number(this.fiche.id);
      this.ficheService.rejeterFiche(id).subscribe({
        next: (updated: any) => {
          this.fiche.statut = 'REJETE';
          this.toastService.show({ type: 'success', title: 'Rejet', message: 'La fiche a été rejetée' });
        },
        error: (err: any) => {
          console.error('Erreur rejet fiche:', err);
          this.toastService.show({ type: 'error', title: 'Erreur', message: err?.error || 'Impossible de rejeter la fiche' });
        }
      });
    } else {
      // No fiche exists - reject prestation directly (no fake fiche creation)
      const commentaires = prompt('Motif du rejet:') || '';

      this.prestationService.rejectPrestation(this.prestationId, commentaires).subscribe({
        next: (rejected) => {
          this.toastService.show({
            type: 'success',
            title: 'Rejet réussi',
            message: 'La prestation a été rejetée avec succès'
          });
          // Emit event to refresh parent component
          this.rejectClicked.emit(this.prestationId);
        },
        error: (err) => {
          console.error('Erreur lors du rejet direct:', err);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du rejet: ' + (err.error?.message || err.message)
          });
        }
      });
    }
  }

  getValidateTitle(): string {
    return 'Valider';
  }

  getRejectTitle(): string {
    return 'Rejeter';
  }

  // Helpers used by the template
  getFicheStatusForDisplay(): string {
    if (this.fiche && this.fiche.statut) return this.fiche.statut;
    if (this.statutValidation) return this.statutValidation;
    return 'BROUILLON';
  }

  onDetailsClick(): void {
    this.detailsClicked.emit(this.prestationId ?? '');
  }

  onSubmitClick(): void {
    this.submitClicked.emit(this.prestationId ?? '');
  }

  onDownloadClick(): void {
    // Try to open the provided file url or fallback to fiche PDF endpoint
    if (this.fichierUrl) {
      window.open(this.fichierUrl, '_blank');
      return;
    }
    if (this.fiche && this.fiche.id) {
      window.open(`/api/fiches-prestation/${this.fiche.id}/pdf`, '_blank');
      return;
    }
    // Nothing to download
    console.warn('Aucun fichier disponible pour téléchargement');
  }


  onDeleteClick(): void {
    this.deleteClicked.emit(this.prestationId ?? '');
  }

  // Emit status change from internal control (if any). Parent binds to this output.
  emitStatutInterventionChange(newStatut: string): void {
    const id = this.prestationId ? parseInt(this.prestationId, 10) : NaN;
    if (!isNaN(id)) {
      this.statutInterventionChanged.emit({ prestationId: id, newStatutIntervention: newStatut });
    }
  }
}
