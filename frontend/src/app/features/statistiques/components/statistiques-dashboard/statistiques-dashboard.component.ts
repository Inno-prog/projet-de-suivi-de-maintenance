import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { UserService } from '../../../../core/services/user.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { EquipementService } from '../../../../core/services/equipement.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { ItemService } from '../../../../core/services/item.service';
import { RapportSuiviService } from '../../../../core/services/rapport-suivi.service';
import { PrestationService } from '../../../../core/services/prestation.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-statistiques-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="dashboard-container">
    <header class="dashboard-header">
      <h1>📊 Tableau de Bord Global</h1>
      <p>Visualisez les performances et les statistiques du système</p>
      <div class="last-updated">
        <small>🔄 Dernière mise à jour: {{ lastUpdated | date:'dd/MM/yyyy HH:mm:ss' }}</small>
      </div>
    </header>

    <!-- Statistiques principales -->
    <section class="stats-grid">
      <div class="stat-card" *ngFor="let item of mainStats">
        <div class="icon-circle" [style.background]="item.color">
          <i [class]="item.icon"></i>
        </div>
        <div class="info">
          <h3>{{ item.value }}</h3>
          <p>{{ item.label }}</p>
        </div>
      </div>
    </section>

    <!-- Tables section -->
    <section class="tables-section">
      <div class="table-container">
        <h3>Derniers Ordres de Commande</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom Item</th>
              <th>Statut</th>
              <th>Montant</th>
              <th>Date Création</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of recentOrders">
              <td>{{ order.idOC }}</td>
              <td>{{ order.nomItem }}</td>
              <td>
                <span class="status-badge" [class]="'status-' + order.statut.toLowerCase()">
                  {{ order.statut }}
                </span>
              </td>
              <td>{{ order.montant | number:'1.0-0':'fr-FR' }} FCFA</td>
              <td>{{ order.dateCreation | date:'dd/MM/yyyy' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-container">
        <h3>Résumé des Statistiques Détaillées</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <h4>Taux d'Approbation</h4>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="stats.tauxApprobation"></div>
            </div>
            <p>{{ stats.tauxApprobation | number:'1.1-1' }}%</p>
          </div>
          <div class="summary-item">
            <h4>Ordres Approuvés</h4>
            <p class="large-number">{{ stats.ordresApprouves }}</p>
          </div>
          <div class="summary-item">
            <h4>Ordres Non Approuvés</h4>
            <p class="large-number">{{ stats.ordresNonApprouves }}</p>
          </div>
          <div class="summary-item">
            <h4>Montant Moyen par Ordre</h4>
            <p class="large-number">{{ stats.totalOrdres > 0 ? ((stats.montantTotal / stats.totalOrdres) | number:'1.0-0') : 0 }} FCFA</p>
          </div>
        </div>
      </div>
    </section>

  </div>
  `,
  styles: [`
    :host {
      --primary: #f97316;
      --text-primary: #1f2937;
      --text-secondary: #6b7280;
    }

    .dashboard-container {
      padding: 2rem;
      background: #f9fafb;
      min-height: 100vh;
      font-family: 'Inter', sans-serif;
    }

    .dashboard-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .dashboard-header h1 {
      font-size: 2.2rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .dashboard-header p {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .last-updated {
      margin-top: 0.5rem;
    }

    .last-updated small {
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    /* Statistiques principales */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(249,115,22,0.2);
    }

    .icon-circle {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2rem;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }

    .info h3 {
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0;
    }

    .info p {
      margin: 0;
      font-weight: 500;
      color: var(--text-secondary);
    }

    /* Tables section */
    .tables-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-top: 3rem;
    }

    .table-container {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    }

    .table-container h3 {
      font-size: 1.3rem;
      color: var(--text-primary);
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .data-table th,
    .data-table td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    .data-table th {
      background: #f9fafb;
      font-weight: 600;
      color: var(--text-primary);
    }

    .data-table tr:hover {
      background: #f9fafb;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-approuve {
      background: #d1fae5;
      color: #065f46;
    }

    .status-non_approuve {
      background: #fee2e2;
      color: #991b1b;
    }

    .status-en_attente {
      background: #fef3c7;
      color: #92400e;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .summary-item {
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
    }

    .summary-item h4 {
      font-size: 1rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .large-number {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
      margin: 0;
    }

    .summary-item p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

  `]
})
export class StatistiquesDashboardComponent implements OnInit, OnDestroy {
  stats = {
    totalUsers: 0,
    totalContrats: 0,
    totalOrdres: 0,
    totalEvaluations: 0,
    totalPrestations: 0,
    totalEquipements: 0,
    totalStructuresMefp: 0,
    totalItems: 0,
    totalRapportsSuivi: 0,
    montantTotal: 0,
    ordresApprouves: 0,
    ordresNonApprouves: 0,
    tauxApprobation: 0
  };

  mainStats = [
    { label: 'Utilisateurs', value: 0, color: '#f97316', icon: 'fas fa-users' },
    { label: 'Contrats', value: 0, color: '#10b981', icon: 'fas fa-file-contract' },
    { label: 'Ordres', value: 0, color: '#3b82f6', icon: 'fas fa-tasks' },
    { label: 'Prestations', value: 0, color: '#8b5cf6', icon: 'fas fa-cogs' },
    { label: 'Structures MEFP', value: 0, color: '#06b6d4', icon: 'fas fa-building' },
    { label: 'Items', value: 0, color: '#84cc16', icon: 'fas fa-list' },
    { label: 'Rapports Suivi', value: 0, color: '#ec4899', icon: 'fas fa-chart-line' },
    { label: 'Évaluations', value: 0, color: '#14b8a6', icon: 'fas fa-star' },
  ];

  recentOrders: any[] = [];
  recentPrestations: any[] = [];
  private refreshSubscription: Subscription | undefined;
  lastUpdated: Date = new Date();


  constructor(
    private userService: UserService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private evaluationService: EvaluationService,
    private fichePrestationService: FichePrestationService,
    private equipementService: EquipementService,
    private structureMefpService: StructureMefpService,
    private itemService: ItemService,
    private rapportSuiviService: RapportSuiviService,
    private prestationService: PrestationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStats();
    // Refresh statistics every 30 seconds for real-time updates
    this.refreshSubscription = interval(30000).subscribe(() => {
      this.loadStats();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  private loadStats(): void {
    this.lastUpdated = new Date();
    this.userService.getAllUsers().subscribe(users => {
      this.stats.totalUsers = users.length;
      this.mainStats[0].value = users.length;
    });

    this.contratService.getAllContrats().subscribe(contrats => {
      this.stats.totalContrats = contrats.length;
      this.mainStats[1].value = contrats.length;
    });

    this.ordreCommandeService.getAllOrdresCommande().subscribe(ordres => {
      this.stats.totalOrdres = ordres.length;
      this.mainStats[2].value = ordres.length;
      const approuves = ordres.filter(o => o.statut === 'APPROUVE').length;
      const nonApprouves = ordres.filter(o => o.statut === 'NON_APPROUVE').length;
      this.stats.tauxApprobation = ordres.length ? (approuves / ordres.length) * 100 : 0;
      this.stats.ordresApprouves = approuves;
      this.stats.ordresNonApprouves = nonApprouves;

      // Calculate total montant
      this.stats.montantTotal = ordres.reduce((sum, ordre) => sum + (ordre.montant || 0), 0);

      // Get recent orders (last 5)
      this.recentOrders = ordres
        .sort((a, b) => new Date(b.dateCreation || '').getTime() - new Date(a.dateCreation || '').getTime())
        .slice(0, 5);
    });

    // Utiliser la même logique de filtrage que PrestationListComponent
    const currentUser = this.authService.getCurrentUser();
    const isPrestataire = currentUser?.role === 'PRESTATAIRE';
    const prestationPromise = isPrestataire
      ? this.prestationService.getMyPrestations(0, 1000).toPromise()
      : this.prestationService.getAllPrestations(0, 1000).toPromise();

    prestationPromise?.then(prestationResponse => {
      let prestations: any[] = [];
      
      // Handle paginated response
      if (prestationResponse && typeof prestationResponse === 'object' && 'content' in prestationResponse) {
        prestations = prestationResponse.content || [];
      } else {
        prestations = prestationResponse || [];
      }

      // Filter prestations based on user role (same logic as PrestationListComponent)
      if (isPrestataire && currentUser) {
        prestations = prestations.filter(p => {
          const matchNom = p.nomPrestataire === currentUser.nom;
          const matchEmail = p.contactPrestataire === currentUser.email;
          const matchId = p.prestataireId === currentUser.id?.toString();
          return matchNom || matchEmail || matchId;
        });
      }

      this.stats.totalPrestations = prestations.length;
      this.mainStats[3].value = prestations.length;
    }).catch(error => {
      console.error('Erreur lors du chargement des prestations:', error);
      this.stats.totalPrestations = 0;
      this.mainStats[3].value = 0;
    });

    this.equipementService.getAllEquipements().subscribe(equipements => {
      this.stats.totalEquipements = equipements.length;
      this.mainStats[4].value = equipements.length;
    });

    this.structureMefpService.getAllStructures().subscribe(structures => {
      this.stats.totalStructuresMefp = structures.length;
      this.mainStats[5].value = structures.length;
    });

    this.itemService.getAllItems().subscribe(items => {
      this.stats.totalItems = items.length;
      this.mainStats[6].value = items.length;
    });

    this.rapportSuiviService.getAllRapports().subscribe(rapports => {
      this.stats.totalRapportsSuivi = rapports.length;
      this.mainStats[7].value = rapports.length;
    });

    this.evaluationService.getAllEvaluations().subscribe(evaluations => {
      this.stats.totalEvaluations = evaluations.length;
      this.mainStats[8].value = evaluations.length;
    });
  }
}