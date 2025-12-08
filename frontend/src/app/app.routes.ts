import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Root - Main dashboard (public access)
  {
    path: '',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Main dashboard - public access
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Ordres de commande main page (shows quarters)
  {
    path: 'ordres-commande',
    loadComponent: () => import('./features/ordres-commande/components/ordre-commande-main/ordre-commande-main.component').then(m => m.OrdreCommandeMainComponent),
    canActivate: [AuthGuard]
  },

  // Routes pour ordres de commande
  {
    path: 'ordres-commande/trimestre/:trimestre',
    loadComponent: () => import('./features/ordres-commande/components/trimestre-lots/trimestre-lots.component').then(m => m.TrimestreLotsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'ordres-commande/trimestre/:trimestre/lot/:lot',
    loadComponent: () => import('./features/ordres-commande/components/lot-fiches/lot-fiches.component').then(m => m.LotFichesComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'services/maintenance',
    loadComponent: () => import('./features/services-maintenance/services-maintenance.component').then(m => m.ServicesMaintenanceComponent)
  },
  {
    path: 'services/reports',
    loadComponent: () => import('./features/services-reports/services-reports.component').then(m => m.ReportsComponent)
  },

    // Role-based dashboard routes
  {
    path: 'dashboard/admin',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'prestataire-dashboard',
    loadComponent: () => import('./features/prestataire-dashboard/prestataire-dashboard.component').then(m => m.PrestataireDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'PRESTATAIRE' }
  },
  {
    path: 'dashboard/prestataire',
    loadComponent: () => import('./features/prestataire-dashboard/prestataire-dashboard.component').then(m => m.PrestataireDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'PRESTATAIRE' }
  },
  {
    path: 'dashboard/ci',
    loadComponent: () => import('./features/dashboard/components/agent-dgsi-dashboard/agent-dgsi-dashboard.component').then(m => m.AgentDgsiDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'AGENT_DGSI' }
  },

  // User-specific routes for accessing personal resources
  {
    path: 'user/:userId/prestations',
    loadComponent: () => import('./features/prestations/components/prestation-list/prestation-list.component').then(m => m.PrestationListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'user/:userId/contrats',
    loadComponent: () => import('./features/contrats/components/contrat-list/contrat-list.component').then(m => m.ContratListComponent),
    canActivate: [AuthGuard]
  },
  
  {
    path: 'user/:userId/rapports-suivi',
    loadComponent: () => import('./features/rapports-suivi/components/rapport-suivi-list/rapport-suivi-list.component').then(m => m.RapportSuiviListComponent),
    canActivate: [AuthGuard]
  },

  // Protected routes with role-based access
  {
    path: 'prestations-dashboard',
    loadComponent: () => import('./features/dashboard/components/prestations-dashboard/prestations-dashboard.component').then(m => m.PrestationsDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user-list/user-list.component').then(m => m.UserListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'structures-mefp',
    loadComponent: () => import('./features/structures-mefp/components/structures-mefp-list/structures-mefp-list.component').then(m => m.StructuresMefpListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'contrats',
    loadComponent: () => import('./features/contrats/components/contrat-list/contrat-list.component').then(m => m.ContratListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  
  {
    path: 'evaluations',
    loadComponent: () => import('./features/evaluations/components/evaluation-dashboard/evaluation-dashboard.component').then(m => m.EvaluationDashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'evaluations/new',
    loadComponent: () => import('./features/evaluation/evaluation-form.component').then(m => m.EvaluationFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'fiches-prestation',
    loadComponent: () => import('./features/fiches-prestation/components/fiche-list/fiche-list.component').then(m => m.FicheListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },

  {
    path: 'prestataire-prestation-list',
    loadComponent: () => import('./features/prestations/components/prestataire-prestation-list/prestataire-prestation-list.component').then(m => m.PrestatairePrestationListComponent),
    canActivate: [AuthGuard],
    data: { role: 'PRESTATAIRE' }
  },
  {
    path: 'items',
    loadComponent: () => import('./features/items/components/item-list/item-list.component').then(m => m.ItemListComponent),
    canActivate: [AuthGuard],
    data: { role: ['ADMINISTRATEUR', 'AGENT_DGSI'] }
  },
 
  {
    path: 'statistiques',
    loadComponent: () => import('./features/statistiques/components/statistiques-dashboard/statistiques-dashboard.component').then(m => m.StatistiquesDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: ['ADMINISTRATEUR', 'AGENT_DGSI'] }
  },
  {
    path: 'rapports-suivi',
    loadComponent: () => import('./features/rapports-suivi/components/rapport-suivi-list/rapport-suivi-list.component').then(m => m.RapportSuiviListComponent),
    canActivate: [AuthGuard],
    data: { role: ['ADMINISTRATEUR', 'AGENT_DGSI'] }
  },
  {
    path: 'prestations/:id',
    loadComponent: () => import('./features/prestations/components/prestation-detail/prestation-detail.component').then(m => m.PrestationDetailComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'prestations',
    loadComponent: () => import('./features/prestations/components/prestation-list/prestation-list.component').then(m => m.PrestationListComponent),
    canActivate: [AuthGuard],
    data: { role: ['ADMINISTRATEUR', 'PRESTATAIRE'] }
  },
  {
    path: 'équipements',
    loadComponent: () => import('./features/equipements/components/equipement-dashboard/equipement-dashboard.component').then(m => m.EquipementDashboardComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'equipements/list',
    loadComponent: () => import('./features/equipements/components/equipement-list/equipement-list.component').then(m => m.EquipementListComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'equipements/new',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'equipements/:id',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },
  {
    path: 'equipements/:id/edit',
    loadComponent: () => import('./features/equipements/components/equipement-form/equipement-form.component').then(m => m.EquipementFormComponent),
    canActivate: [AuthGuard],
    data: { role: 'ADMINISTRATEUR' }
  },

  // Default redirect
  {
    path: '**',
    redirectTo: ''
  }
];
