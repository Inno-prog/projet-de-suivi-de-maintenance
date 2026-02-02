import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLanguage: string = 'fr';
  
  private translations: { [key: string]: { [key: string]: string } } = {
    fr: {
      // Layout
      'dashboard': 'Tableau de bord',
      'administration': 'Administration',
      'reports_stats': 'Rapports et Statistiques',
      'supervision': 'Supervision',
      'my_services': 'Mes Services',
      'user_management': 'Gestion des Utilisateurs',
      'contract_management': 'Gestion des Contrats',
      'item_management': 'Gestion des Items',
      'prestations_validation': 'Prestations & Validation',
      'orders': 'Ordres de Commande',
      'structures_mefp': 'Structures MEFP',
      'follow_up_reports': 'Rapports de suivi',
      'statistics': 'Statistiques',
      'evaluations': 'Évaluations',
      'my_prestation_sheets': 'Mes fiches de prestations',
      'my_items': 'Mes items',
      'my_contracts': 'Mes contrats',
      'items_lots': 'Items et Lots',
      'equipment': 'Équipements',
      
      // Profile
      'profile_details': 'Détails profil',
      'my_profile': 'Mon Profil',
      'edit': 'Modifier',
      'logout': 'Déconnexion',
      'settings': 'Paramètres',
      'manage_settings': 'Gérer les paramètres',
      'notifications': 'Notifications',
      'dark_mode': 'Mode sombre',
      'language': 'Langue',
      'french': 'Français',
      'english': 'English',
      
      // Settings
      'real_time_notifications': 'Notifications en temps réel',
      'receive_instant_notifications': 'Recevez des notifications instantanées',
      'enable_dark_theme': 'Activer le thème sombre',
      'select_language': 'Sélectionnez votre langue',
      'cancel': 'Annuler',
      'save': 'Enregistrer',
      
      // Dashboard
      'welcome_admin': 'Bienvenue dans le tableau de bord administrateur',
      'quick_actions': 'Actions Rapides',
      'new_prestation': 'Nouvelle Prestation',
      'create_new_prestation': 'Créer une nouvelle demande de prestation',
      'view_manage_contracts': 'Visualiser et gérer tous les contrats',
      'administer_user_accounts': 'Administrer les comptes utilisateur',
      'access_orders': 'Accéder aux ordres de commande',
      'manage_structures_equipment': 'Gérer les structures et leurs équipements'
    },
    en: {
      // Layout
      'dashboard': 'Dashboard',
      'administration': 'Administration',
      'reports_stats': 'Reports and Statistics',
      'supervision': 'Supervision',
      'my_services': 'My Services',
      'user_management': 'User Management',
      'contract_management': 'Contract Management',
      'item_management': 'Item Management',
      'prestations_validation': 'Prestations & Validation',
      'orders': 'Purchase Orders',
      'structures_mefp': 'MEFP Structures',
      'follow_up_reports': 'Follow-up Reports',
      'statistics': 'Statistics',
      'evaluations': 'Evaluations',
      'my_prestation_sheets': 'My Service Sheets',
      'my_items': 'My Items',
      'my_contracts': 'My Contracts',
      'items_lots': 'Items and Lots',
      'equipment': 'Equipment',
      
      // Profile
      'profile_details': 'Profile Details',
      'my_profile': 'My Profile',
      'edit': 'Edit',
      'logout': 'Logout',
      'settings': 'Settings',
      'manage_settings': 'Manage Settings',
      'notifications': 'Notifications',
      'dark_mode': 'Dark Mode',
      'language': 'Language',
      'french': 'Français',
      'english': 'English',
      
      // Settings
      'real_time_notifications': 'Real-time Notifications',
      'receive_instant_notifications': 'Receive instant notifications',
      'enable_dark_theme': 'Enable dark theme',
      'select_language': 'Select your language',
      'cancel': 'Cancel',
      'save': 'Save',
      
      // Dashboard
      'welcome_admin': 'Welcome to the administrator dashboard',
      'quick_actions': 'Quick Actions',
      'new_prestation': 'New Prestation',
      'create_new_prestation': 'Create a new service request',
      'view_manage_contracts': 'View and manage all contracts',
      'administer_user_accounts': 'Administer user accounts',
      'access_orders': 'Access purchase orders',
      'manage_structures_equipment': 'Manage structures and their equipment'
    }
  };

  constructor() {
    const savedLang = localStorage.getItem('language');
    if (savedLang && ['fr', 'en'].includes(savedLang)) {
      this.currentLanguage = savedLang;
    }
  }

  getLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(lang: string): void {
    console.log('Attempting to set language from', this.currentLanguage, 'to', lang);
    if (['fr', 'en'].includes(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('language', lang);
      console.log('Language set to', lang);
      console.log('Current language:', this.currentLanguage);
    } else {
      console.log('Invalid language:', lang);
    }
  }

  translate(key: string): string {
    console.log('Translating key:', key, 'for language:', this.currentLanguage);
    const result = this.translations[this.currentLanguage][key] || key;
    console.log('Translation result:', result);
    return result;
  }
}
