import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StructureMefpService, RegionHierarchy, VilleHierarchy, StructureInfo } from '../../../../core/services/structure-mefp.service';
import { LotService } from '../../../../core/services/lot.service';
import { Lot } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';

interface RegionInfo {
  nom: string;
  villes: number;
  structures: number;
  color: string;
}

@Component({
  selector: 'app-structures-mefp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './structures-mefp.component.html',
  styleUrls: ['./structures-mefp.component.css']
})
export class StructuresMefpComponent implements OnInit {
  // Navigation state
  currentStep: 'regions' | 'villes' | 'structures' = 'regions';
  selectedRegion: string = '';
  selectedVille: string = '';
  
  // Data
  hierarchy: RegionHierarchy[] = [];
  regionsList: RegionInfo[] = [];
  villesList: string[] = [];
  structuresList: StructureInfo[] = [];
  
  // UI State
  loading = false;
  error = '';
  villesLoading = false;
  structuresLoading = false;
  showCreateModal = false;
  showViewModal = false;
  showEditModal = false;
  selectedStructure: any = null;
  editStructureData: any = null;
  
  // New structure form
  newStructure = {
    nom: '',
    categorie: '',
    contact1: '',
    contact2: '',
    contact3: '',
    email: '',
    adresseStructure: '',
    description: '',
    nomCI: '',
    prenomCI: '',
    contactCI: '',
    fonctionCI: '',
    lotId: null as number | null
  };
  
  // Lots data
  lots: Lot[] = [];

  // Region color - same as sidebar color
  private regionColor: string = 'rgb(28, 82, 118)';

  constructor(
    private structureService: StructureMefpService,
    private lotService: LotService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load lots data
    this.loadLots();
    
    // Handle route parameters for hierarchy navigation
    this.route.paramMap.subscribe(params => {
      const region = params.get('region');
      const ville = params.get('ville');
      
      if (region) {
        // Navigate to villes view for the selected region
        this.goToVilles(region);
      } else if (ville) {
        // Navigate to structures view for the selected ville
        // First, find the region that contains this ville
        this.loadRegionForVille(ville);
      } else {
        // Show all regions
        this.loadRegions();
      }
    });
  }
  
  /**
   * Load lots from the server
   */
  loadLots(): void {
    this.lotService.getAllLotEntities().subscribe({
      next: (lots: Lot[]) => {
        this.lots = lots;
      },
      error: (error: any) => {
        console.error('Error loading lots:', error);
      }
    });
  }
  
  /**
   * Automatically select the corresponding lot when a city is entered/selected
   */
  autoSelectLotForVille(ville: string): void {
    console.log('autoSelectLotForVille called with ville:', ville);
    console.log('Current lots:', this.lots);
    
    if (!ville || ville.trim().length === 0) {
      this.newStructure.lotId = null;
      return;
    }

    // Find the lot that includes this city in its villes array
    const normalizedVille = ville.trim().toLowerCase();
    const correspondingLot = this.lots.find(lot => 
      lot.villes && lot.villes.some(v => v.toLowerCase().includes(normalizedVille))
    );

    if (correspondingLot) {
      console.log(`Auto-selecting lot ${correspondingLot.nomLot} for city ${ville}`);
      this.newStructure.lotId = correspondingLot.id;
    } else {
      console.log(`No lot found for city ${ville}`);
      this.newStructure.lotId = null;
    }
  }

  /**
   * Find the region that contains a specific ville and navigate to structures
   */
  loadRegionForVille(ville: string): void {
    this.structureService.getHierarchy().subscribe({
      next: (hierarchy: RegionHierarchy[]) => {
        // Find the region that contains this ville
        const region = hierarchy.find(r => r.villes.some(v => v.nom === ville));
        if (region) {
          this.selectedRegion = region.nom;
          this.goToStructures(ville);
        } else {
          // If not found in hierarchy, try to load structures directly
          this.selectedRegion = 'Inconnue';
          this.goToStructures(ville);
        }
      },
      error: (err: any) => {
        console.error('Error finding region for ville:', err);
        this.selectedRegion = 'Inconnue';
        this.goToStructures(ville);
      }
    });
  }

  /**
   * Load all 17 regions with their statistics
   */
  loadRegions(): void {
    this.loading = true;
    this.error = '';
    
    this.structureService.getHierarchy().subscribe({
      next: (data: RegionHierarchy[]) => {
        this.hierarchy = data;
        this.regionsList = data.map((region) => ({
          nom: region.nom,
          villes: region.villes.length,
          structures: region.villes.reduce((total, ville) => total + ville.structures.length, 0),
          color: this.regionColor
        }));
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading regions:', err);
        this.error = 'Erreur lors du chargement des régions';
        this.loading = false;
        this.loadMockRegions();
      }
    });
  }

  /**
   * Load mock regions as fallback
   */
  loadMockRegions(): void {
    this.regionsList = [
      { nom: 'Centre', villes: 4, structures: 15, color: this.regionColor },
      { nom: 'Guiriko', villes: 4, structures: 8, color: this.regionColor },
      { nom: 'Kadiogo', villes: 4, structures: 12, color: this.regionColor },
      { nom: 'Nando', villes: 4, structures: 6, color: this.regionColor },
      { nom: 'Kuilsé', villes: 4, structures: 5, color: this.regionColor },
      { nom: 'Nakambé', villes: 4, structures: 7, color: this.regionColor },
      { nom: 'Bankui', villes: 5, structures: 3, color: this.regionColor },
      { nom: 'Yaadga', villes: 3, structures: 4, color: this.regionColor },
      { nom: 'Soum', villes: 3, structures: 2, color: this.regionColor },
      { nom: 'Liptako', villes: 3, structures: 2, color: this.regionColor },
      { nom: 'Goulmou', villes: 4, structures: 3, color: this.regionColor },
      { nom: 'Djôrô', villes: 4, structures: 2, color: this.regionColor },
      { nom: 'Oubri', villes: 3, structures: 3, color: this.regionColor },
      { nom: 'Nazinon', villes: 3, structures: 4, color: this.regionColor },
      { nom: 'Tapoa', villes: 2, structures: 1, color: this.regionColor },
      { nom: 'Sourou', villes: 3, structures: 2, color: this.regionColor },
      { nom: 'Sirba', villes: 3, structures: 2, color: this.regionColor }
    ];
    this.loading = false;
  }

  /**
   * Navigate to villes view for a selected region
   */
  goToVilles(regionNom: string): void {
    this.selectedRegion = regionNom;
    this.currentStep = 'villes';
    this.villesList = [];
    this.structuresList = [];
    // Update URL to reflect current navigation state
    this.router.navigate(['/structures-mefp/region', regionNom]);
    this.loadVillesForRegion(regionNom);
  }

  /**
   * Load villes for a specific region
   */
  loadVillesForRegion(regionNom: string): void {
    this.villesLoading = true;
    
    this.structureService.getVillesByRegion(regionNom).subscribe({
      next: (villes: string[]) => {
        // Get structures count for each ville
        this.villesList = villes;
        this.villesLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading villes:', err);
        this.villesLoading = false;
        // Use mock villes from hierarchy
        const region = this.hierarchy.find(r => r.nom === regionNom);
        if (region) {
          this.villesList = region.villes.map(v => v.nom);
        } else {
          this.villesList = ['Ouagadougou', 'Bobo-Dioulasso', 'Koudougou', 'Tenkodogo'];
        }
      }
    });
  }

  /**
   * Navigate to structures view for a selected ville
   */
  goToStructures(villeNom: string): void {
    this.selectedVille = villeNom;
    this.currentStep = 'structures';
    this.structuresList = [];
    // Update URL to reflect current navigation state
    this.router.navigate(['/structures-mefp/ville', villeNom]);
    this.loadStructuresForVille(villeNom);
  }

  /**
   * Load structures for a specific ville
   */
  loadStructuresForVille(villeNom: string): void {
    this.structuresLoading = true;

    this.structureService.getStructuresByVille(villeNom).subscribe({
      next: (structures: any[]) => {
        this.structuresList = structures.map(s => ({
          id: s.id,
          nom: s.nom,
          categorie: s.categorie,
          contact1: s.contact1,
          contact2: s.contact2,
          contact3: s.contact3,
          email: s.email,
          ville: s.ville,
          region: s.region,
          adresseStructure: s.adresseStructure,
          description: s.description,
          nomCI: s.nomCI,
          prenomCI: s.prenomCI,
          contactCI: s.contactCI,
          fonctionCI: s.fonctionCI,
          lot: s.lot,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt
        }));
        this.structuresLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading structures:', err);
        this.structuresLoading = false;
        // Use mock structures from hierarchy
        const region = this.hierarchy.find(r => r.nom === this.selectedRegion);
        const ville = region?.villes.find(v => v.nom === villeNom);
        if (ville) {
          this.structuresList = ville.structures;
        }
      }
    });
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    if (this.currentStep === 'structures') {
      this.currentStep = 'villes';
      this.selectedVille = '';
      this.structuresList = [];
      // Navigate back to region view
      this.router.navigate(['/structures-mefp/region', this.selectedRegion]);
    } else if (this.currentStep === 'villes') {
      this.currentStep = 'regions';
      this.selectedRegion = '';
      this.villesList = [];
      // Navigate back to main page
      this.router.navigate(['/structures-mefp']);
    }
  }

  /**
   * Reset to regions view
   */
  goHome(): void {
    this.currentStep = 'regions';
    this.selectedRegion = '';
    this.selectedVille = '';
    this.villesList = [];
    this.structuresList = [];
    this.router.navigate(['/structures-mefp']);
  }

  /**
   * Get category CSS class based on category name
   */
  getCategoryClass(categorie?: string): string {
    if (!categorie) return 'category-default';
    
    const cat = categorie.toLowerCase();
    if (cat.includes('direction') || cat.includes('dg')) return 'category-direction';
    if (cat.includes('service')) return 'category-service';
    if (cat.includes('cabinet')) return 'category-cabinet';
    if (cat.includes('inspection')) return 'category-inspection';
    if (cat.includes('cellule')) return 'category-cellule';
    if (cat.includes('bureau')) return 'category-bureau';
    if (cat.includes('agence')) return 'category-agence';
    if (cat.includes('centre')) return 'category-centre';
    
    return 'category-default';
  }

  /**
   * Get structures count for a specific ville
   */
  getStructuresCountForVille(villeNom: string): number {
    const region = this.hierarchy.find(r => r.nom === this.selectedRegion);
    const ville = region?.villes.find(v => v.nom === villeNom);
    return ville?.structures.length || 0;
  }

  /**
   * Get region color
   */
  getRegionColor(regionNom: string): string {
    const region = this.regionsList.find(r => r.nom === regionNom);
    return region?.color || '#6366f1';
  }

  /**
   * Get total number of villes across all regions
   */
  getTotalVilles(): number {
    return this.regionsList.reduce((total, region) => total + region.villes, 0);
  }

  /**
   * Get total number of structures across all regions
   */
  getTotalStructures(): number {
    return this.regionsList.reduce((total, region) => total + region.structures, 0);
  }

  // ========== CRUD Operations ==========

  /**
   * Open create structure modal
   */
  openCreateModal(): void {
    this.newStructure = {
      nom: '',
      categorie: '',
      contact1: '',
      contact2: '',
      contact3: '',
      email: '',
      adresseStructure: '',
      description: '',
      nomCI: '',
      prenomCI: '',
      contactCI: '',
      fonctionCI: '',
      lotId: null
    };
    // Auto-select lot based on selected ville
    this.autoSelectLotForVille(this.selectedVille);
    this.showCreateModal = true;
  }

  /**
   * Close create structure modal
   */
  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  /**
   * Create a new structure
   */
  createStructure(): void {
    if (!this.newStructure.nom || !this.newStructure.categorie) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir les champs obligatoires (nom et catégorie)'
      });
      return;
    }

    const structureData: any = {
      ...this.newStructure,
      ville: this.selectedVille,
      region: this.selectedRegion
    };
    
    // Handle lot: construct lot object or null
    if (structureData.lotId) {
      const lotId = structureData.lotId;
      const selectedLot = this.lots.find(lot => lot.id === lotId);
      if (selectedLot) {
        structureData.lot = {
          id: selectedLot.id,
          nomLot: selectedLot.nomLot,
          codeLot: selectedLot.codeLot
        };
      }
    }
    // Remove lotId from the data sent to backend
    delete structureData.lotId;

    this.structureService.createStructure(structureData).subscribe({
      next: (created: any) => {
        // Add to local list
        this.structuresList.push({
          id: created.id,
          nom: created.nom,
          categorie: created.categorie,
          contact1: created.contact1,
          contact2: created.contact2,
          contact3: created.contact3,
          email: created.email,
          adresseStructure: created.adresseStructure,
          description: created.description
        });
        this.closeCreateModal();
        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Structure créée avec succès !'
        });
      },
      error: (err: any) => {
        console.error('Error creating structure:', err);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la création de la structure'
        });
      }
    });
  }

  /**
   * Select a structure for viewing
   */
  selectStructure(structure: StructureInfo): void {
    this.selectedStructure = structure;
    this.showViewModal = true;
  }

  /**
   * Close view modal
   */
  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedStructure = null;
  }

  /**
   * Open edit structure modal
   */
  editStructure(structure: StructureInfo): void {
    console.log('Edit structure:', structure);
    // Create a copy of the structure data for editing
    this.editStructureData = {
      id: structure.id,
      nom: structure.nom,
      categorie: structure.categorie,
      contact1: structure.contact1,
      contact2: structure.contact2,
      contact3: structure.contact3,
      email: structure.email,
      adresseStructure: structure.adresseStructure,
      description: structure.description,
      nomCI: structure.nomCI,
      prenomCI: structure.prenomCI,
      contactCI: structure.contactCI,
      fonctionCI: structure.fonctionCI,
      lotId: structure.lot?.id || null
    };
    this.showEditModal = true;
  }

  /**
   * Close edit structure modal
   */
  closeEditModal(): void {
    this.showEditModal = false;
    this.editStructureData = null;
  }

  /**
   * Save edited structure
   */
  saveEditStructure(): void {
    if (!this.editStructureData.nom || !this.editStructureData.categorie) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir les champs obligatoires (nom et catégorie)'
      });
      return;
    }

    const structureData: any = {
      ...this.editStructureData,
      ville: this.selectedVille,
      region: this.selectedRegion
    };
    
    // Handle lot: construct lot object or null
    if (structureData.lotId) {
      const lotId = structureData.lotId;
      const selectedLot = this.lots.find(lot => lot.id === lotId);
      if (selectedLot) {
        structureData.lot = {
          id: selectedLot.id,
          nomLot: selectedLot.nomLot,
          codeLot: selectedLot.codeLot
        };
      }
    }
    // Remove lotId from the data sent to backend
    delete structureData.lotId;

    this.structureService.updateStructure(this.editStructureData.id, structureData).subscribe({
      next: (updated: any) => {
        // Update the local list
        const index = this.structuresList.findIndex(s => s.id === updated.id);
        if (index !== -1) {
          this.structuresList[index] = {
            ...this.structuresList[index],
            ...updated
          };
        }
        this.closeEditModal();
        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Structure modifiée avec succès !'
        });
      },
      error: (err: any) => {
        console.error('Error updating structure:', err);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la modification de la structure'
        });
      }
    });
  }

  /**
   * Delete a structure
   */
  deleteStructure(structure: StructureInfo): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${structure.nom}" ?`)) {
      return;
    }

    this.structureService.deleteStructure(structure.id).subscribe({
      next: () => {
        this.structuresList = this.structuresList.filter(s => s.id !== structure.id);
        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: 'Structure supprimée avec succès !'
        });
      },
      error: (err: any) => {
        console.error('Error deleting structure:', err);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la suppression de la structure'
        });
      }
    });
  }
}
