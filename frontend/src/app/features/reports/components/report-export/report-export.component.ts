import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../../../core/services/report.service';
import { UserService } from '../../../../core/services/user.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { ItemService } from '../../../../core/services/item.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div class="mb-6">
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Génération de Rapport</h3>
        <p class="text-gray-600">Rapport trimestriel consolidé des prestations de maintenance</p>
      </div>

      <form class="space-y-6">
        <!-- Informations générales -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-gray-700 mb-3">Informations générales</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Titre du rapport</label>
              <input
                [(ngModel)]="reportTitle"
                name="reportTitle"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Titre du rapport"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Période générée</label>
              <input
                [value]="period"
                readonly
                class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
              />
            </div>
          </div>
        </div>

        <!-- Sélection de période -->
        <div class="bg-blue-50 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-gray-700 mb-3">Sélection de la période</h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Année</label>
              <select
                [(ngModel)]="selectedYear"
                name="selectedYear"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option *ngFor="let year of years" [value]="year">{{ year }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Trimestre</label>
              <select
                [(ngModel)]="selectedQuarter"
                name="selectedQuarter"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option *ngFor="let quarter of quarters" [value]="quarter.value">{{ quarter.label }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Options d'inclusion -->
        <div class="bg-green-50 p-4 rounded-lg">
          <h4 class="text-lg font-semibold text-gray-700 mb-3">Sections à inclure</h4>

          <div class="space-y-3">
            <div class="flex items-center">
              <input
                [(ngModel)]="includeEvaluations"
                name="includeEvaluations"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-700">
                Inclure les évaluations trimestrielles
              </label>
            </div>

            <div class="flex items-center">
              <input
                [(ngModel)]="includeItems"
                name="includeItems"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-700">
                Inclure l'inventaire des items et équipements
              </label>
            </div>

            <div class="flex items-center">
              <input
                [(ngModel)]="includeStructures"
                name="includeStructures"
                type="checkbox"
                class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-700">
                Inclure les structures MEFP et couverture territoriale
              </label>
            </div>
          </div>
        </div>

        <!-- Bouton de génération -->
        <div class="flex justify-center pt-4">
          <button
            (click)="generatePdf()"
            [disabled]="isLoading"
            class="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-lg shadow-md hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span *ngIf="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Génération en cours...
            </span>
            <span *ngIf="!isLoading" class="flex items-center">
              <svg class="-ml-1 mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              Générer et télécharger le PDF
            </span>
          </button>
        </div>
      </form>
    </div>
  `
})
export class ReportExportComponent implements OnInit {
  // Paramètres du rapport
  selectedYear = new Date().getFullYear();
  selectedQuarter = 'T1';
  reportTitle = 'Rapport de Suivi des Prestations';
  includeEvaluations = true;
  includeItems = true;
  includeStructures = true;

  // Options
  years = [2023, 2024, 2025, 2026];
  quarters = [
    { value: 'T1', label: 'Trimestre 1 (Jan-Mar)' },
    { value: 'T2', label: 'Trimestre 2 (Avr-Jun)' },
    { value: 'T3', label: 'Trimestre 3 (Jul-Sep)' },
    { value: 'T4', label: 'Trimestre 4 (Oct-Déc)' }
  ];

  isLoading = false;

  constructor(
    private reportService: ReportService,
    private userService: UserService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private prestationService: PrestationService,
    private itemService: ItemService,
    private evaluationService: EvaluationService,
    private structureMefpService: StructureMefpService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Définir le trimestre actuel
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth <= 3) this.selectedQuarter = 'T1';
    else if (currentMonth <= 6) this.selectedQuarter = 'T2';
    else if (currentMonth <= 9) this.selectedQuarter = 'T3';
    else this.selectedQuarter = 'T4';
  }

  get period(): string {
    return `${this.selectedQuarter} ${this.selectedYear}`;
  }

  async generatePdf() {
    this.isLoading = true;
    try {
      const payload = await this.buildReportData();
      this.reportService.exportPrestationsPdf(payload).subscribe({
        next: blob => {
          const filename = `rapport-prestations-${this.period.replace(/\s+/g,'_')}.pdf`;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          this.isLoading = false;
        },
        error: err => {
          console.error('Export failed', err);
          alert('Erreur lors de l\'exportation du PDF');
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error building report data', error);
      alert('Erreur lors de la préparation des données');
      this.isLoading = false;
    }
  }

  private async buildReportData() {
    const currentUser = this.authService.getCurrentUser();
    const generatedBy = currentUser ? currentUser.nom : 'Système';

    // Fetch all data concurrently
    const [
      utilisateurs,
      contrats,
      prestations,
      ordres,
      items,
      evaluations,
      structures
    ] = await Promise.all([
      this.userService.getAllUsers().toPromise().catch(() => []),
      this.contratService.getAllContrats().toPromise().catch(() => []),
      this.prestationService.getAllPrestations().toPromise().catch(() => []),
      this.ordreCommandeService.getAllOrdresCommande().toPromise().catch(() => []),
      this.itemService.getAllItems().toPromise().catch(() => []),
      this.evaluationService.getAllEvaluations().toPromise().catch(() => []),
      this.structureMefpService.getAllStructures().toPromise().catch(() => [])
    ]);

    // Filtrer les évaluations par trimestre si demandé
    let filteredEvaluations = evaluations || [];
    if (this.includeEvaluations && filteredEvaluations.length > 0) {
      filteredEvaluations = filteredEvaluations.filter(evaluation =>
        evaluation.trimestre === this.period
      );
    }

    return {
      title: this.reportTitle,
      period: this.period,
      generatedBy: generatedBy,
      generatedAt: new Date().toISOString(),
      meta: {
        objective: 'Suivi trimestriel des prestations et ordres de commande',
        includeEvaluations: this.includeEvaluations,
        includeItems: this.includeItems,
        includeStructures: this.includeStructures
      },
      utilisateurs: utilisateurs || [],
      contrats: contrats || [],
      prestations: prestations || [],
      ordres: ordres || [],
      items: this.includeItems ? (items || []) : [],
      evaluations: this.includeEvaluations ? filteredEvaluations : [],
      structures: this.includeStructures ? (structures || []) : []
    };
  }
}