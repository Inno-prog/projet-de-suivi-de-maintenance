import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Subscription, forkJoin } from 'rxjs';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation } from '../../../../core/models/business.models';
import { ItemService } from '../../../../core/services/item.service';
import { StructureMefpService } from '../../../../core/services/structure-mefp.service';
import { Item, Equipement, StructureMefp } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/auth.models';
import { AuthService } from '../../../../core/services/auth.service';
import { LotService } from '../../../../core/services/lot.service';
import { formatLotDisplay as formatLotDisplayUtil } from '../../../../shared/utils/lot-utils';

@Component({
  selector: 'app-prestation-form',
  templateUrl: './prestation-form.component.html',
  styleUrls: ['./prestation-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ]
})
export class PrestationFormComponent implements OnInit, OnDestroy {
  prestationForm: FormGroup;
  isEditMode = false;
  items: Item[] = [];
  allItems: Item[] = []; // Sauvegarder une copie complète
  selectedItem: Item | null = null;
  equipements: Equipement[] = [];
  selectedEquipements: Equipement[] = [];
  showForm = false;
  loading = false;
  selectedLotId: number | null = null; // ID du lot sélectionné pour le filtrage
  
  // Protection contre les soumissions multiples
  isSubmitting = false;
  isCreating = false;

  // Multi-step wizard properties
  currentStep = 1;
  totalSteps = 4;
  stepTitles = [
    'Informations du Prestataire',
    'Informations de la Structure',
    'Détails de l\'Intervention',
    'Récapitulatif'
  ];

  // Selected items for intervention step
  selectedItems: Item[] = [];
  itemQuantities: { [itemId: string]: number } = {};

  // Lot selection for filtering items
  availableLots: string[] = [];
  lotEntities: any[] = []; // Store full lot entities for mapping
  selectedLot: string = '';
  selectedLotName: string = ''; // Store the lot name for filtering (items store lot names)
  filteredItemsList: Item[] = [];

  // Popup states
  showItemSelectionPopup = false;
  showValidationPopup = false;

  // Search functionality
  searchTerm: string = '';

  // Current user (must be prestataire to access this form)
  currentUser: any = null;
  isCurrentUserPrestataire = false;
  private userSubscription?: Subscription;

  // Prestataires list (for non-prestataire users)
  prestataires: User[] = [];
  selectedPrestataire: User | null = null;

  // Structure selection (Structures MEFP)
  structuresMefp: StructureMefp[] = [];
  selectedStructure: StructureMefp | null = null;
  isNewStructure = false;

  // Track which prestataire fields were pre-filled from system data
  prefilledFields: { [key: string]: boolean } = {
    contactPrestataire: false,
    structurePrestataire: false,
    directionPrestataire: false,
    qualificationPrestataire: false
  };

  // Track if structure fields are pre-filled from selected structure
  structureFieldsPrefilled: boolean = false;

  // Cache pour les compteurs de prestations par item
  itemPrestationsCount: { [itemName: string]: number } = {};

  statutOptions = [
    { value: 'en attente', label: 'En attente' },
    { value: 'en cours', label: 'En cours' },
    { value: 'terminée', label: 'Terminée' },
    { value: 'validée', label: 'Validée' },
    { value: 'rejetée', label: 'Rejetée' },
    { value: 'réussi', label: 'Réussi' },
    { value: 'nécessite autre intervention', label: 'Nécessite autre intervention' }
  ];

  trimestreOptions = [
    { value: 'T1', label: 'Trimestre 1 (Janvier - Mars)' },
    { value: 'T2', label: 'Trimestre 2 (Avril - Juin)' },
    { value: 'T3', label: 'Trimestre 3 (Juillet - Septembre)' },
    { value: 'T4', label: 'Trimestre 4 (Octobre - Décembre)' }
  ];

  constructor(
    private fb: FormBuilder,
    private prestationService: PrestationService,
    private fichePrestationService: FichePrestationService,
    private itemService: ItemService,
    private userService: UserService,
    private structureMefpService: StructureMefpService,
    private lotService: LotService,
    private authService: AuthService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<PrestationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.prestation;
    this.prestationForm = this.fb.group({
      // Step 1: Informations du Prestataire
      nomPrestataire: [data?.prestation?.nomPrestataire || '', Validators.required],
      contactPrestataire: [data?.prestation?.contactPrestataire || ''], // Champ manquant
      nomResponsablePrestation: [data?.prestation?.nomResponsablePrestation || '', Validators.required],
      contactResponsablePrestation: [data?.prestation?.contactResponsablePrestation || '', Validators.required],
      qualificationResponsablePrestation: [data?.prestation?.qualificationResponsablePrestation || '', Validators.required],

      // Step 2: Structure info
      structureSelection: [data?.prestation?.structureSelection || ''],
      nomStructure: [data?.prestation?.nomStructure || '', Validators.required],
      adresseStructure: [data?.prestation?.adresseStructure || '', Validators.required],
      emailStructure: [data?.prestation?.emailStructure || '', [Validators.required, Validators.email]],
      nomCI: [data?.prestation?.nomCI || '', Validators.required],
      prenomCI: [data?.prestation?.prenomCI || '', Validators.required],
      contactCI: [data?.prestation?.contactCI || '', Validators.required],
      fonctionCI: [data?.prestation?.fonctionCI || '', Validators.required],

      // Step 3: Intervention details
      lotSelection: [data?.prestation?.lotSelection || '', Validators.required],
      itemsCouverts: [data?.prestation?.itemsCouverts || [], []],
      montantIntervention: [data?.prestation?.montantIntervention || 0, [Validators.min(0)]],
      trimestre: [data?.prestation?.trimestre || '', Validators.required],
      dateDebut: [data?.prestation?.dateDebut || '', Validators.required],
      heureDebut: [data?.prestation?.heureDebut || '', Validators.required],
      dateFin: [data?.prestation?.dateFin || '', Validators.required],
      heureFin: [data?.prestation?.heureFin || '', Validators.required],
      statutIntervention: [data?.prestation?.statutIntervention || '', Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('🚀 PrestationFormComponent ngOnInit called');
    this.showForm = true;

    // Subscribe to user changes to update form when user data is loaded
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('🎯 PrestationForm: User data received:', user);
      this.currentUser = user;
      this.isCurrentUserPrestataire = user?.role === 'PRESTATAIRE';

      console.log('👤 User role check:', {
        userRole: user?.role,
        isCurrentUserPrestataire: this.isCurrentUserPrestataire,
        userId: user?.id,
        userNom: user?.nom
      });

      // Load items after user is loaded
      this.loadItems();

      if (this.isCurrentUserPrestataire && user) {
        console.log('🔄 Pré-remplissage automatique des champs prestataire pour:', user.nom);

        // Préremplir automatiquement tous les champs prestataire disponibles
        const userData = user as any;

        // Utiliser seulement les valeurs non-nulles et non-vides
        const getValidValue = (...values: any[]) => {
          return values.find(val => val && val.toString().trim() !== '') || '';
        };

        this.prestationForm.patchValue({
          nomPrestataire: user.nom || '',
          contactPrestataire: getValidValue(userData.contact, userData.telephone),
          structurePrestataire: getValidValue(userData.structure, userData.entreprise, userData.societe),
          directionPrestataire: getValidValue(userData.direction, userData.service, userData.departement),
          qualificationPrestataire: getValidValue(userData.qualification, userData.specialite, userData.competence)
        });

        // Le nom reste activé pour la validation mais non modifiable visuellement
        // this.prestationForm.get('nomPrestataire')?.disable();

        console.log('✅ Champs préremplis pour le prestataire:', {
          nom: user.nom,
          contact: getValidValue(userData.contact, userData.telephone),
          structure: getValidValue(userData.structure, userData.entreprise, userData.societe),
          direction: getValidValue(userData.direction, userData.service, userData.departement),
          qualification: getValidValue(userData.qualification, userData.specialite, userData.competence),
          rawUserData: userData
        });
      } else {
        console.log('⚠️ User is not a prestataire or user data is null:', { isPrestataire: this.isCurrentUserPrestataire, user, userRole: user?.role });
      }
    });

    this.loadItems(); // Load items initially
    console.log('📋 Calling loadAvailableLots...');
    this.loadAvailableLots();
    // Removed: this.loadStructuresMefp(); // Now loaded based on lot selection
    this.loadEquipements();
    this.loadPrestataires();
    this.loadItemPrestationsCounters(); // Load item counters for max validation
    this.setupItemSelectionListener();

    // Test lot matching for debugging
    this.testLotMatching();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadItems(): void {
    this.loading = true;

    // Charger les items et les lots en parallèle
    forkJoin({
      items: this.itemService.getAllItems(),
      lots: this.lotService.getAllLotEntities()
    }).subscribe({
      next: ({ items, lots }) => {
        // Créer un map complet pour toutes les variantes de noms de lots
        const lotMap = this.createComprehensiveLotMapping(lots);

        console.log('🗺️ Lot mapping complet créé:', Array.from(lotMap.entries()));

        // Mapper les items pour inclure l'ID du lot
        this.items = (items || []).map(item => {
          let lotId = 0;
          if (item.lot) {
            // Essayer de trouver une correspondance avec toutes les variantes
            const lotName = item.lot.trim();
            lotId = this.findLotIdForItem(lotName, lotMap);
          }

          return {
            ...item,
            lotId: lotId
          } as any;
        });

        this.allItems = [...this.items];

        // Debug: Afficher les correspondances
        console.log('📦 Items chargés avec IDs de lots:');
        this.items.forEach(item => {
          const itemWithLotId = item as any;
          console.log(`  - ${item.nomItem}: "${item.lot}" -> ID ${itemWithLotId.lotId}`);
        });

        console.log('🗺️ Lots disponibles:', lots.map(l => `${l.nomLot} (ID: ${l.id})`));

        this.testLotMatching();
        this.updateFilteredItems();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des données:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les données'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Crée un mapping complet pour toutes les variantes possibles de noms de lots
   */
  private createComprehensiveLotMapping(lots: any[]): Map<string, number> {
    const lotMap = new Map<string, number>();

    lots.forEach(lot => {
      const normalizedName = lot.nomLot;

      // Ajouter le nom normalisé principal
      lotMap.set(normalizedName, lot.id);

      // Ajouter des variantes courantes
      lotMap.set(normalizedName.toLowerCase(), lot.id);
      lotMap.set(normalizedName.toUpperCase(), lot.id);

      // Extraire le numéro du lot pour les variantes avec parenthèses
      const numberMatch = normalizedName.match(/(\d+)/);
      if (numberMatch) {
        const number = numberMatch[1];
        lotMap.set(`(${number})`, lot.id);
        lotMap.set(`Lot (${number})`, lot.id);
        lotMap.set(`lot${number}`, lot.id);
        lotMap.set(`LOT${number}`, lot.id);
        lotMap.set(number, lot.id);
      }

      // Gérer les variantes avec/sans "Lot"
      if (normalizedName.startsWith('Lot ')) {
        const withoutLot = normalizedName.substring(4);
        lotMap.set(withoutLot, lot.id);
        lotMap.set(withoutLot.toLowerCase(), lot.id);
        lotMap.set(withoutLot.toUpperCase(), lot.id);
      } else {
        lotMap.set(`Lot ${normalizedName}`, lot.id);
        lotMap.set(`lot ${normalizedName}`, lot.id);
        lotMap.set(`LOT ${normalizedName}`, lot.id);
      }

      // Supprimer les espaces et caractères spéciaux pour les variantes
      const cleanName = normalizedName.replace(/[^a-zA-Z0-9]/g, '');
      lotMap.set(cleanName, lot.id);
      lotMap.set(cleanName.toLowerCase(), lot.id);
      lotMap.set(cleanName.toUpperCase(), lot.id);
    });

    return lotMap;
  }

  /**
   * Trouve l'ID du lot pour un nom d'item en essayant toutes les variantes possibles
   */
  private findLotIdForItem(itemLotName: string, lotMap: Map<string, number>): number {
    if (!itemLotName) return 0;

    // Nettoyer le nom d'entrée
    const cleanInput = itemLotName.trim();

    // Essayer les correspondances directes d'abord
    if (lotMap.has(cleanInput)) {
      return lotMap.get(cleanInput)!;
    }

    // Essayer avec casse différente
    if (lotMap.has(cleanInput.toLowerCase())) {
      return lotMap.get(cleanInput.toLowerCase())!;
    }

    if (lotMap.has(cleanInput.toUpperCase())) {
      return lotMap.get(cleanInput.toUpperCase())!;
    }

    // Essayer de normaliser et chercher
    const normalized = this.normalizeLot(cleanInput);
    if (lotMap.has(normalized)) {
      return lotMap.get(normalized)!;
    }

    // Essayer d'extraire un numéro et chercher avec parenthèses
    const numberMatch = cleanInput.match(/(\d+)/);
    if (numberMatch) {
      const number = numberMatch[1];
      if (lotMap.has(`(${number})`)) {
        return lotMap.get(`(${number})`)!;
      }
      if (lotMap.has(`Lot (${number})`)) {
        return lotMap.get(`Lot (${number})`)!;
      }
      if (lotMap.has(number)) {
        return lotMap.get(number)!;
      }
    }

    // Supprimer tous les caractères non alphanumériques et essayer
    const alphaNumeric = cleanInput.replace(/[^a-zA-Z0-9]/g, '');
    if (lotMap.has(alphaNumeric)) {
      return lotMap.get(alphaNumeric)!;
    }

    if (lotMap.has(alphaNumeric.toLowerCase())) {
      return lotMap.get(alphaNumeric.toLowerCase())!;
    }

    // Si rien ne marche, retourner 0
    console.warn(`⚠️ Impossible de trouver un lot correspondant pour "${cleanInput}"`);
    return 0;
  }

  loadAvailableLots(): void {
    console.log('🔄 Loading available lots...');
    this.lotService.getAllLotEntities().subscribe({
      next: (lots) => {
        console.log('📦 Lots loaded from API:', lots);
        this.lotEntities = lots; // Store full lot entities for mapping
        // Keep raw entities for lookups and build a user-friendly display list
        this.availableLots = lots
          .map(lot => lot.nomLot) // Use raw lot names directly
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));

        console.log('📦 Lots disponibles (raw):', this.availableLots);
        console.log('📦 Lot entities (stored):', this.lotEntities);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des lots:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des lots' });
      }
    });
  }

  /**
   * Format a raw lot name into a user-friendly display name like "Lot 1".
   * - Accepts inputs such as "(1)", "Lot (1)", "(Lot 1)", "lot1" and returns "Lot 1".
   */
  formatLotDisplay(raw?: string): string { return formatLotDisplayUtil(raw); }

  loadItemPrestationsCounters(): void {
    if (!this.items || this.items.length === 0) {
      return;
    }

    console.log('🔄 Chargement des compteurs de quantités utilisées pour validation côté client');

    // Utiliser la même logique que le backend : compter dynamiquement depuis les prestations validées
    // Pour chaque item, charger le nombre de prestations utilisant cet item
    this.items.forEach(item => {
      if (item.nomItem) {
        // Utiliser l'appel count-by-item qui existe sur le backend
        this.prestationService.getCountByItem(item.nomItem).subscribe({
          next: (count: number) => {
            // Stocker le nombre de prestations utilisant cet item
            this.itemPrestationsCount[item.nomItem] = count;
            console.log(`📊 Nombre de prestations chargées pour "${item.nomItem}": ${count}/${item.quantiteMaxTrimestre || 0}`);
          },
          error: (error) => {
            console.error(`❌ Erreur chargement compteur pour "${item.nomItem}":`, error);
            this.itemPrestationsCount[item.nomItem] = 0;
          }
        });
      }
    });

    console.log('✅ Chargement des compteurs de validation terminé');
  }

  loadPrestataires(): void {
    // Only load prestataires if current user is not a prestataire
    if (!this.isCurrentUserPrestataire) {
      this.userService.getAllUsers().subscribe({
        next: (users) => {
          this.prestataires = users.filter(user => user.role === 'PRESTATAIRE');
        },
        error: (error) => {
          if (error.status !== 401) {
            console.error('Erreur lors du chargement des prestataires:', error);
            this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des prestataires' });
          }
        }
      });
    }
  }

  loadEquipements(): void {
    // TODO: Implement equipement service call
    // For now, we'll leave this empty as the service might not exist yet
    this.equipements = [];
  }

  loadStructuresMefp(): void {
    this.structureMefpService.getAllStructures().subscribe({
      next: (structures) => {
        this.structuresMefp = structures;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des structures MEFP:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des structures MEFP' });
        }
      }
    });
  }

  loadStructuresByLot(lotId: number): void {
    console.log('🏢 loadStructuresByLot called with lotId:', lotId);
    if (!lotId) {
      console.log('🏢 No lotId provided, clearing structures');
      this.structuresMefp = [];
      return;
    }

    console.log('🏢 Chargement des structures pour le lot ID:', lotId);
    this.structureMefpService.getStructuresByLotId(lotId).subscribe({
      next: (structures) => {
        console.log('🏢 API Response - structures loaded:', structures);
        this.structuresMefp = structures;
        console.log(`🏢 ${structures.length} structures chargées pour le lot ${lotId}`);

        // Reset structure selection if current selection is not in the filtered list
        if (this.selectedStructure && !structures.find(s => s.id === this.selectedStructure!.id)) {
          console.log('🏢 Resetting structure selection as current selection is not in filtered list');
          this.selectedStructure = null;
          this.prestationForm.patchValue({
            structureSelection: '',
            nomStructure: '',
            adresseStructure: '',
            emailStructure: '',
            nomCI: '',
            prenomCI: '',
            contactCI: '',
            fonctionCI: ''
          });
        }
      },
      error: (error) => {
        console.error('🏢 Error loading structures by lot:', error);
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des structures par lot:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du chargement des structures pour ce lot'
          });
        }
        this.structuresMefp = [];
      }
    });
  }

  onEquipementSelectionChange(event: any): void {
    const selectedIds = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedEquipements = this.equipements.filter(eq => selectedIds.includes(eq.id));
  }

  onItemSelectionChange(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    // VALIDATION CRITIQUE: Vérifier que l'item appartient au lot sélectionné
    if (checked && this.selectedLotId !== null) {
      const itemLotId = (item as any).lotId || 0;
      if (itemLotId !== this.selectedLotId) {
        console.error('❌ Tentative de sélection d\'un item hors lot:', {
          item: item.nomItem,
          itemLot: item.lot,
          itemLotId: itemLotId,
          selectedLotId: this.selectedLotId,
          selectedLotName: this.selectedLotName
        });
        this.toastService.show({
          type: 'error',
          title: 'Item incompatible',
          message: `L'item "${item.nomItem}" (lot: ${item.lot}) n'appartient pas au lot sélectionné "${this.selectedLotName}".`
        });
        target.checked = false;
        return;
      }
    }

    // Check if item has exhausted budget before allowing selection
    if (checked && this.isItemBudgetExhausted(item)) {
      this.toastService.show({
        type: 'error',
        title: 'Budget épuisé',
        message: `Impossible de sélectionner "${item.nomItem}" - le budget du contrat est épuisé.`
      });
      target.checked = false;
      return;
    }

    // Check if maximum total units per item is reached
    if (checked && this.isItemMaxReached(item)) {
      const maxAllowed = item.quantiteMaxTrimestre || 0;
      const currentCount = this.getItemPrestationsCount(item);
      this.toastService.show({
        type: 'error',
        title: 'Limite d\'utilisation atteinte',
        message: `Impossible de sélectionner "${item.nomItem}" - la limite totale d'utilisation (${maxAllowed} unités) est déjà atteinte (${currentCount} unités utilisées). Vous ne pouvez plus utiliser cet item.`
      });
      target.checked = false;
      return;
    }

    // Proceed with selection if all checks pass
    this.proceedWithItemSelection(item, checked);
  }

  private proceedWithItemSelection(item: Item, checked: boolean): void {
    if (checked) {
      this.selectedItems.push(item);
      if (!this.itemQuantities[item.id!.toString()]) {
        this.itemQuantities[item.id!.toString()] = 1; // Default quantity
      }
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
      delete this.itemQuantities[item.id!.toString()];
    }
    this.prestationForm.patchValue({ itemsCouverts: this.selectedItems.map(i => i.id) });
    this.updateTotalAmount();
  }

  getItemQuantity(item: Item): number {
    return this.itemQuantities[item.id!.toString()] || 1;
  }

  updateItemQuantity(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value) || 1;
    this.itemQuantities[item.id!.toString()] = quantity;
    this.updateTotalAmount();
  }

  calculateItemAmount(item: Item): number {
    const quantity = this.getItemQuantity(item);
    const unitPrice = item.prix || 0;
    return quantity * unitPrice;
  }

  calculateTotalAmount(): number {
    return this.selectedItems.reduce((total, item) => total + this.calculateItemAmount(item), 0);
  }

  updateTotalAmount(): void {
    const total = this.calculateTotalAmount();
    this.prestationForm.patchValue({ montantIntervention: total });
  }

  openItemSelectionPopup(): void {
    console.log('🔄 Opening item selection popup...');
    console.log('📊 Current state:', {
      selectedLotId: this.selectedLotId,
      selectedLotName: this.selectedLotName,
      totalItems: this.items.length,
      filteredItemsCount: this.filteredItemsList.length,
      currentlySelectedItems: this.selectedItems.length
    });
    
    // CRITIQUE: Nettoyer les items sélectionnés qui ne sont pas dans la liste filtrée
    const filteredItemIds = new Set(this.filteredItemsList.map(i => i.id));
    const validSelectedItems = this.selectedItems.filter(item => filteredItemIds.has(item.id));
    
    if (validSelectedItems.length !== this.selectedItems.length) {
      console.warn('⚠️ Nettoyage des items hors lot:', {
        avant: this.selectedItems.length,
        après: validSelectedItems.length,
        supprimés: this.selectedItems.filter(item => !filteredItemIds.has(item.id)).map(i => i.nomItem)
      });
      this.selectedItems = validSelectedItems;
      // Nettoyer aussi les quantités
      const validItemIds = new Set(validSelectedItems.map(i => i.id!.toString()));
      Object.keys(this.itemQuantities).forEach(itemId => {
        if (!validItemIds.has(itemId)) {
          delete this.itemQuantities[itemId];
        }
      });
      this.prestationForm.patchValue({ itemsCouverts: this.selectedItems.map(i => i.id) });
      this.updateTotalAmount();
    }
    
    // Recharger les compteurs d'utilisation en temps réel avant d'ouvrir le popup
    this.loadItemPrestationsCounters();
    this.showItemSelectionPopup = true;
    
    console.log('✅ Item selection popup opened, showItemSelectionPopup:', this.showItemSelectionPopup);
  }

  closeItemSelectionPopup(): void {
    this.showItemSelectionPopup = false;
  }

  validateItemSelection(): void {
    // Vérifier d'abord les limites côté client avant d'envoyer au backend
    const invalidItems: string[] = [];
    let hasMaxReachedItems = false;

    this.selectedItems.forEach(item => {
      const quantity = this.getItemQuantity(item);
      const currentCount = this.getItemPrestationsCount(item);
      const maxAllowed = item.quantiteMaxTrimestre || 0;
      
      if (currentCount + quantity > maxAllowed && maxAllowed > 0) {
        invalidItems.push(`${item.nomItem} (${currentCount + quantity}/${maxAllowed})`);
        hasMaxReachedItems = true;
      }
    });

    // Si des items dépassent les limites, empêcher la validation
    if (hasMaxReachedItems) {
      this.toastService.show({
        type: 'error',
        title: 'Limite d\'utilisation dépassée',
        message: `Les items suivants dépassent leur limite d'utilisation :\n• ${invalidItems.join('\n• ')}\n\nVeuillez ajuster les quantités ou retirer ces items.`
      });
      return;
    }

    // Préparer les données pour validation backend
    const itemQuantities: { [key: string]: number } = {};
    this.selectedItems.forEach(item => {
      itemQuantities[item.nomItem] = this.getItemQuantity(item);
    });

    // Appeler la validation backend qui enverra des notifications si nécessaire
    this.prestationService.validateItemSelection(itemQuantities).subscribe({
      next: (response: any) => {
        if (response.valid) {
          // Validation réussie, ouvrir la popup de validation
          this.showItemSelectionPopup = false;
          this.showValidationPopup = true;
        } else {
          // Validation échouée, afficher les erreurs
          const invalidItems = response.invalidItems || [];
          const errorTitle = response.budgetExhausted ? 'Budget épuisé' : 'Limite d\'utilisation atteinte';
          const errorMessage = response.budgetExhausted
            ? `Impossible de valider cette sélection. Le budget est épuisé pour les items suivants :\n• ${invalidItems.join('\n• ')}\n\nVous ne pouvez plus utiliser ces items.`
            : `Impossible de valider cette sélection. Les items suivants dépassent leur limite d'utilisation :\n• ${invalidItems.join('\n• ')}\n\nUne notification vous a été envoyée avec plus de détails.`;

          this.toastService.show({
            type: 'error',
            title: errorTitle,
            message: errorMessage
          });
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la validation backend:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur de validation',
          message: 'Impossible de valider la sélection d\'items. Veuillez réessayer.'
        });
      }
    });
  }

  closeValidationPopup(): void {
    this.showValidationPopup = false;
  }

  backToItemSelection(): void {
    this.showValidationPopup = false;
    this.showItemSelectionPopup = true;
  }

  onItemCardClick(item: Item): void {
    const event = { target: { checked: !this.isItemSelected(item) } } as any;
    this.onItemSelectionChange(item, event);
  }

  confirmValidation(): void {
    // CRITIQUE: Dernière vérification avant de fermer
    const filteredItemIds = new Set(this.filteredItemsList.map(i => i.id));
    this.selectedItems = this.selectedItems.filter(item => filteredItemIds.has(item.id));
    
    // Nettoyer les quantités des items supprimés
    const validItemIds = new Set(this.selectedItems.map(i => i.id!.toString()));
    Object.keys(this.itemQuantities).forEach(itemId => {
      if (!validItemIds.has(itemId)) {
        delete this.itemQuantities[itemId];
      }
    });
    
    this.prestationForm.patchValue({ itemsCouverts: this.selectedItems.map(i => i.id) });
    this.showValidationPopup = false;
    this.updateTotalAmount();
    
    console.log('✅ Validation confirmée avec', this.selectedItems.length, 'items:', 
      this.selectedItems.map(i => `${i.nomItem} (lot: ${i.lot})`))
  }

  isItemSelected(item: Item): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  isItemBudgetExhausted(item: Item): boolean {
    const maxAllowed = item.quantiteMaxTrimestre || 0;
    const currentlyUsed = this.getItemPrestationsCount(item);
    const remainingBudget = maxAllowed - currentlyUsed;
    return remainingBudget <= 0;
  }

  getItemPrestationsCount(item: Item): number {
    return this.itemPrestationsCount[item.nomItem] || 0;
  }

  getItemProgressPercentage(item: Item): number {
    const maxAllowed = item.quantiteMaxTrimestre || 0;
    const currentCount = this.getItemPrestationsCount(item);
    if (maxAllowed === 0) return 0;
    return Math.min((currentCount / maxAllowed) * 100, 100);
  }

  getRemainingBudget(item: Item): number {
    const maxAllowed = item.quantiteMaxTrimestre || 0;
    const currentlyUsed = this.getItemPrestationsCount(item);
    return Math.max(0, maxAllowed - currentlyUsed);
  }

  isItemMaxReached(item: Item): boolean {
    const maxAllowed = item.quantiteMaxTrimestre || 0;
    const currentCount = this.getItemPrestationsCount(item);
    return currentCount >= maxAllowed && maxAllowed > 0;
  }

  updateFilteredItems(): void {
    console.log('🔄 updateFilteredItems called');
    
    if (!this.items || !this.items.length) {
      console.log('⚠️ No items available, clearing filtered list');
      this.filteredItemsList = [];
      return;
    }

    console.log('🔄 Filtrage des items. Total:', this.items.length);
    console.log('🎯 Lot sélectionné:', this.selectedLotName, 'ID:', this.selectedLotId);

    let filtered = this.items;

    // Filtrer par lot si un lot est sélectionné
    if (this.selectedLotId !== null) {
      console.log('🔍 Filtrage par lot ID:', this.selectedLotId);

      filtered = filtered.filter(item => {
        const itemLotId = (item as any).lotId || 0;
        const matches = itemLotId === this.selectedLotId;
        if (matches) {
          console.log('✅ Item du lot sélectionné:', item.nomItem, '- lot:', item.lot, '- lotId:', itemLotId);
        } else {
          console.log('❌ Item EXCLU:', item.nomItem, '- lot:', item.lot, '- lotId:', itemLotId, '!==', this.selectedLotId);
        }
        return matches;
      });
    } else {
      console.log('⚠️ No lot selected, showing all items');
    }

    this.filteredItemsList = filtered;
    console.log('📊 Résultat du filtrage:', this.filteredItemsList.length, 'items sur', this.items.length);
  }

  // Méthode pour normaliser les noms de lots (gardée pour compatibilité si nécessaire)
  public normalizeLot(lot: string): string {
    if (!lot) return '';

    // Convertir en minuscules et supprimer les espaces superflus
    const normalized = lot.toString().toLowerCase().trim();

    // Extraire le numéro du lot (supprimer "lot" et tout ce qui n'est pas un chiffre)
    const numberMatch = normalized.replace(/^lot\s*/, '').match(/\d+/);
    return numberMatch ? `lot${numberMatch[0]}` : normalized;
  }

  get filteredItems(): Item[] {
    console.log('🔍 filteredItems getter called, returning:', this.filteredItemsList.length, 'items');
    return this.filteredItemsList;
  }

  onLotChange(): void {
    console.log('🎯 onLotChange called - change event fired');
    const selectedValue = this.prestationForm.get('lotSelection')?.value;
    console.log('🎯 Sélection de lot (brut):', selectedValue);

    // TOUJOURS réinitialiser les items sélectionnés lors du changement de lot
    // pour éviter de garder des items d'un autre lot
    this.selectedItems = [];
    this.itemQuantities = {};
    this.prestationForm.patchValue({ itemsCouverts: [] });
    this.updateTotalAmount();

    if (selectedValue) {
      console.log('🎯 Lot value is truthy, looking up lot entity');
      // The select now stores the lot.id as value. Normalize to number and find by id.
      const selectedLotId = Number(selectedValue);
      const selectedLot = this.lotEntities.find(lot => Number(lot.id) === selectedLotId);

      if (selectedLot) {
        this.selectedLotName = selectedLot.nomLot; // keep original raw name for filtering/mapping
        this.selectedLotId = selectedLot.id;
        console.log('🎯 Lot sélectionné:', this.selectedLotName, 'ID:', this.selectedLotId);

        // Load structures for this lot
        console.log('🎯 Calling loadStructuresByLot with ID:', selectedLot.id);
        this.loadStructuresByLot(selectedLot.id);
      } else {
        console.warn('⚠️ Lot non trouvé dans la liste des entités:', selectedValue);
        console.log('Available lot entities:', this.lotEntities);
        this.selectedLotName = '';
        this.selectedLotId = null;
        this.structuresMefp = [];
        this.selectedStructure = null;
        this.prestationForm.patchValue({
          structureSelection: '',
          nomStructure: '',
          adresseStructure: '',
          emailStructure: '',
          nomCI: '',
          prenomCI: '',
          contactCI: '',
          fonctionCI: ''
        });
      }
    } else {
      console.log('🎯 No lot selected, clearing everything');
      this.selectedLotName = '';
      this.selectedLotId = null;
      this.structuresMefp = [];
      this.selectedStructure = null;
      this.prestationForm.patchValue({
        structureSelection: '',
        nomStructure: '',
        adresseStructure: '',
        emailStructure: '',
        nomCI: '',
        prenomCI: '',
        contactCI: '',
        fonctionCI: ''
      });
    }

    this.updateFilteredItems();
  }

  private autoLoadItemsFromLot(lotId: number): void {
    console.log('🔄 Chargement automatique des items pour le lot ID:', lotId);

    // Filter items that belong to the selected lot
    const lotItems = this.items.filter(item => {
      const itemLotId = parseInt(item.lot || '0');
      return itemLotId === lotId;
    });

    console.log(`📦 ${lotItems.length} items trouvés pour le lot ${lotId}`);

    // Clear previous selections
    this.selectedItems = [];
    this.itemQuantities = {};

    // Auto-select all items from the lot with default quantity of 1
    lotItems.forEach(item => {
      this.selectedItems.push(item);
      this.itemQuantities[item.id!.toString()] = 1; // Default quantity
    });

    // Update form
    this.prestationForm.patchValue({ itemsCouverts: this.selectedItems.map(i => i.id) });
    this.updateTotalAmount();

    console.log('✅ Items chargés automatiquement:', this.selectedItems.map(i => i.nomItem));
  }

  removeItem(item: Item): void {
    console.log('🗑️ Suppression de l\'item:', item.nomItem);
    this.selectedItems = this.selectedItems.filter(i => i.id !== item.id);
    delete this.itemQuantities[item.id!.toString()];
  }

  canProceedToNext(): boolean {
    switch (this.currentStep) {
      case 1:
        // For non-prestataire users, prestataire selection is required
        if (!this.isCurrentUserPrestataire) {
          const prestataireSelectionValid = this.prestationForm.get('prestataireSelection')?.valid;
          if (!prestataireSelectionValid) return false;
        }

        // Vérifier que les champs obligatoires du responsable ont des valeurs
        const nomResponsableValid = this.prestationForm.get('nomResponsablePrestation')?.value?.trim();
        const contactResponsableValid = this.prestationForm.get('contactResponsablePrestation')?.value?.trim();
        const qualificationResponsableValid = this.prestationForm.get('qualificationResponsablePrestation')?.value?.trim();

        return !!(nomResponsableValid && contactResponsableValid && qualificationResponsableValid);
      case 2:
        // For prestataires, they must select a structure which fills the fields
        if (this.isCurrentUserPrestataire) {
          return !!this.selectedStructure; // Must select a structure
        } else {
          return !!(this.prestationForm.get('nomStructure')?.valid &&
                  this.prestationForm.get('adresseStructure')?.valid &&
                  this.prestationForm.get('emailStructure')?.valid &&
                  this.prestationForm.get('nomCI')?.valid &&
                  this.prestationForm.get('prenomCI')?.valid &&
                  this.prestationForm.get('contactCI')?.valid &&
                  this.prestationForm.get('fonctionCI')?.valid);
        }
      case 3:
        const lotSelected = this.prestationForm.get('lotSelection')?.value?.trim();
        // Pour l'étape 3, on peut passer sans items (ils peuvent être ajoutés plus tard)
        const baseValidation = lotSelected &&
                this.prestationForm.get('montantIntervention')?.valid &&
                this.prestationForm.get('trimestre')?.valid &&
                this.prestationForm.get('dateDebut')?.valid &&
                this.prestationForm.get('heureDebut')?.valid &&
                this.prestationForm.get('dateFin')?.valid &&
                this.prestationForm.get('heureFin')?.valid;

        return !!(baseValidation && this.prestationForm.get('statutIntervention')?.valid);
      default:
        return true;
    }
  }

  canCreate(): boolean {
    // Pour créer, on a besoin de TOUTES les informations (comme canProceedToNext mais pour la dernière étape)
    return this.canProceedToNext() && this.currentStep === this.totalSteps;
  }

  canSaveAsDraft(): boolean {
    // Pour enregistrer comme brouillon, on a besoin seulement des informations de base
    // Les items peuvent être ajoutés plus tard

    // Étape 1: Informations du prestataire
    if (!this.isCurrentUserPrestataire) {
      const prestataireSelectionValid = this.prestationForm.get('prestataireSelection')?.valid;
      if (!prestataireSelectionValid) return false;
    }

    const nomResponsableValid = this.prestationForm.get('nomResponsablePrestation')?.value?.trim();
    const contactResponsableValid = this.prestationForm.get('contactResponsablePrestation')?.value?.trim();
    const qualificationResponsableValid = this.prestationForm.get('qualificationResponsablePrestation')?.value?.trim();

    if (!(nomResponsableValid && contactResponsableValid && qualificationResponsableValid)) {
      return false;
    }

    // Étape 2: Informations de la structure
    if (this.isCurrentUserPrestataire) {
      if (!this.selectedStructure) return false;
    } else {
      const structureValid = this.prestationForm.get('nomStructure')?.valid &&
                            this.prestationForm.get('adresseStructure')?.valid &&
                            this.prestationForm.get('emailStructure')?.valid &&
                            this.prestationForm.get('nomCI')?.valid &&
                            this.prestationForm.get('prenomCI')?.valid &&
                            this.prestationForm.get('contactCI')?.valid &&
                            this.prestationForm.get('fonctionCI')?.valid;
      if (!structureValid) return false;
    }

    // Au minimum, on doit avoir un lot sélectionné pour l'étape 3
    const lotSelected = this.prestationForm.get('lotSelection')?.value?.trim();
    if (!lotSelected) return false;

    // Les dates et autres détails peuvent être ajoutés plus tard
    return true;
  }

  async onCreate(): Promise<void> {
    if (this.canCreate() && !this.isCreating) {
      this.isCreating = true;
      console.log('🔄 Création de la prestation...');

      try {
        // Créer une prestation avec statut BROUILLON (pas EN_ATTENTE)
        const prestationData = this.preparePrestationData();
        prestationData.statutValidation = 'BROUILLON'; // Forcer le statut à BROUILLON

        console.log('📤 Données à envoyer pour création:', JSON.stringify(prestationData, null, 2));

        const result = await this.prestationService.createPrestation(prestationData).toPromise();

        console.log('✅ Prestation créée:', result);

        // Rafraîchir les compteurs d'utilisation des items après création réussie
        this.loadItemPrestationsCounters();

        // Afficher le message de succès
        this.toastService.show({
          type: 'success',
          title: 'Prestation créée',
          message: `Votre prestation a été créée avec succès. Vous pouvez la soumettre pour validation ultérieurement.`
        });

        this.dialogRef.close(true);

      } catch (error: any) {
        console.error('❌ Erreur complète:', error);
        if (error.error) {
          console.error('Détails erreur:', error.error);
        }

        let errorMessage = 'Erreur lors de la création';
        let errorTitle = 'Erreur de création';

        // Vérifier si c'est une erreur de budget insuffisant
        if (error?.error?.message && error.error.message.includes('Budget insuffisant')) {
          errorTitle = '💰 Budget insuffisant';
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        }

        this.toastService.show({
          type: 'error',
          title: errorTitle,
          message: errorMessage
        });
      } finally {
        this.isCreating = false;
      }
    } else {
      console.warn('⚠️ Formulaire incomplet pour la création');
      this.toastService.show({
        type: 'warning',
        title: 'Formulaire incomplet',
        message: 'Veuillez remplir tous les champs obligatoires avant de créer la prestation'
      });
    }
  }

  getSelectedItemsNames(): string {
    return this.selectedItems.map(i => i.nomItem).join(', ');
  }

  getSelectedItemsNamesNumbered(): string {
    if (this.selectedItems.length === 0) return '';
    return this.selectedItems.map((item, index) => `${index + 1}. ${item.nomItem}`).join('<br>');
  }

  getFormValue(fieldName: string): any {
    return this.prestationForm.get(fieldName)?.value;
  }

  getTrimestreLabel(): string {
    const trimestreValue = this.getFormValue('trimestre');
    const trimestre = this.trimestreOptions.find(t => t.value === trimestreValue);
    return trimestre ? trimestre.label : '';
  }

  getStatutLabel(): string {
    const statutValue = this.getFormValue('statutIntervention');
    const statut = this.statutOptions.find(s => s.value === statutValue);
    return statut ? statut.label : '';
  }

  detectTrimestreFromDate(date: string): void {
    if (!date) return;
    
    const selectedDate = new Date(date);
    const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
    
    let trimestre = '';
    if (month >= 1 && month <= 3) {
      trimestre = 'T1';
    } else if (month >= 4 && month <= 6) {
      trimestre = 'T2';
    } else if (month >= 7 && month <= 9) {
      trimestre = 'T3';
    } else if (month >= 10 && month <= 12) {
      trimestre = 'T4';
    }
    
    if (trimestre) {
      this.prestationForm.patchValue({ trimestre });
      console.log(`📅 Trimestre détecté automatiquement: ${trimestre} pour le mois ${month}`);
    }
  }

  setupItemSelectionListener(): void {
    // Prestataire selection listener (for non-prestataire users)
    if (!this.isCurrentUserPrestataire) {
      // Add a prestataire selection field to the form if it doesn't exist
      if (!this.prestationForm.get('prestataireSelection')) {
        this.prestationForm.addControl('prestataireSelection', this.fb.control('', Validators.required));
      }

      this.prestationForm.get('prestataireSelection')?.valueChanges.subscribe(value => {
        if (value) {
          this.selectedPrestataire = this.prestataires.find(p => p.id === value) || null;
          if (this.selectedPrestataire) {
            console.log('🔄 Pré-remplissage des champs pour prestataire sélectionné:', this.selectedPrestataire.nom);

            // Pre-fill prestataire fields from selected prestataire only if data is available
            const userData = this.selectedPrestataire as any; // Cast to any to access prestataire properties
            const contact = this.selectedPrestataire.contact || userData.contact;
            const structure = userData.structure || this.selectedPrestataire.structure;
            const direction = userData.direction || this.selectedPrestataire.direction;
            const qualification = userData.qualification || this.selectedPrestataire.qualification;

            // Only pre-fill fields that have actual data, leave others empty for manual input
            const patchData: any = {
              nomPrestataire: this.selectedPrestataire.nom || ''
            };

            // Reset prefilled tracking for selected prestataire
            this.prefilledFields = {
              contactPrestataire: false,
              structurePrestataire: false,
              directionPrestataire: false,
              qualificationPrestataire: false
            };

            if (contact && contact.trim() !== '') {
              patchData.contactPrestataire = contact;
              this.prefilledFields['contactPrestataire'] = true;
            }
            if (structure && structure.trim() !== '') {
              patchData.structurePrestataire = structure;
              this.prefilledFields['structurePrestataire'] = true;
            }
            if (direction && direction.trim() !== '') {
              patchData.directionPrestataire = direction;
              this.prefilledFields['directionPrestataire'] = true;
            }
            if (qualification && qualification.trim() !== '') {
              patchData.qualificationPrestataire = qualification;
              this.prefilledFields['qualificationPrestataire'] = true;
            }

            this.prestationForm.patchValue(patchData);

            console.log('✅ Champs pré-remplis pour prestataire sélectionné (seulement si données disponibles):', patchData);
          }
        } else {
          this.selectedPrestataire = null;
          // Clear prestataire fields when no prestataire is selected
          this.prestationForm.patchValue({
            nomPrestataire: '',
            contactPrestataire: '',
            structurePrestataire: '',
            directionPrestataire: '',
            qualificationPrestataire: ''
          });
        }
      });
    }

    // Structure selection listener
     this.prestationForm.get('structureSelection')?.valueChanges.subscribe(value => {
       if (value && value !== 'new') {
         this.selectedStructure = this.structuresMefp.find(s => s.id === value) || null;
         this.isNewStructure = false;
         this.structureFieldsPrefilled = true; // Fields are pre-filled from selected structure
         if (this.selectedStructure) {
           this.prestationForm.patchValue({
             nomStructure: this.selectedStructure.nom,
             adresseStructure: this.selectedStructure.adresseStructure || this.selectedStructure.ville || '',
             emailStructure: this.selectedStructure.email || '',
             nomCI: this.selectedStructure.nomCI || '',
             prenomCI: this.selectedStructure.prenomCI || '',
             contactCI: this.selectedStructure.contactCI || '',
             fonctionCI: this.selectedStructure.fonctionCI || ''
           });
         }
       } else if (value === 'new') {
         this.selectedStructure = null;
         this.isNewStructure = true;
         this.structureFieldsPrefilled = false; // Fields are empty for manual entry
         // Clear all structure fields for manual entry
         this.prestationForm.patchValue({
           nomStructure: '',
           adresseStructure: '',
           emailStructure: '',
           nomCI: '',
           prenomCI: '',
           contactCI: '',
           fonctionCI: ''
         });
       } else {
         // No structure selected
         this.selectedStructure = null;
         this.isNewStructure = false;
         this.structureFieldsPrefilled = false;
       }
     });

    // Date change listeners for automatic trimestre detection
    this.prestationForm.get('dateDebut')?.valueChanges.subscribe(value => {
      if (value) {
        this.detectTrimestreFromDate(value);
      }
    });

    this.prestationForm.get('dateFin')?.valueChanges.subscribe(value => {
      if (value && !this.prestationForm.get('dateDebut')?.value) {
        this.detectTrimestreFromDate(value);
      }
    });

    // Lot selection listener
    this.prestationForm.get('lotSelection')?.valueChanges.subscribe(value => {
      console.log('🎯 Lot selection listener triggered with:', value);

      // TOUJOURS réinitialiser les items sélectionnés pour éviter les items d'autres lots
      this.selectedItems = [];
      this.itemQuantities = {};
      this.prestationForm.patchValue({ itemsCouverts: [] });
      this.updateTotalAmount();

      // Normaliser le nom du lot sélectionné
      if (value) {
        this.selectedLotName = typeof value === 'object'
          ? value.nomLot
          : value.toString();

        // Normaliser le format du nom du lot
        this.selectedLotName = this.selectedLotName.trim();

        // Find the lot entity by name and set ID
        const selectedLotEntity = this.lotEntities.find(lot => lot.nomLot === this.selectedLotName);
        this.selectedLotId = selectedLotEntity ? selectedLotEntity.id : null;
        console.log('🎯 Lot sélectionné via listener:', this.selectedLotName, 'ID:', this.selectedLotId);
        
        // Load structures for the selected lot
        if (this.selectedLotId) {
          this.loadStructuresByLot(this.selectedLotId);
        } else {
          this.structuresMefp = [];
        }
      } else {
        this.selectedLotName = '';
        this.selectedLotId = null;
        this.structuresMefp = [];
        this.selectedStructure = null;
      }

      // Réinitialiser la sélection de structure
      this.selectedStructure = null;
      this.prestationForm.patchValue({
        structureSelection: '',
        nomStructure: '',
        adresseStructure: '',
        emailStructure: '',
        nomCI: '',
        prenomCI: '',
        contactCI: '',
        fonctionCI: ''
      });
      this.updateFilteredItems();
    });
  }



  async onSubmit(): Promise<void> {
    if (this.prestationForm.valid) {
      console.log('🔄 Soumission du formulaire...');
      console.log('📋 Données du formulaire:', this.prestationForm.getRawValue());
      console.log('🎯 Items sélectionnés:', this.selectedItems);
      console.log('👤 Utilisateur actuel:', this.currentUser);


      try {
        // Créer une prestation avec les données préparées
        const prestationData = this.preparePrestationData();
        console.log('📤 Données à envoyer:', JSON.stringify(prestationData, null, 2));

        const result = await this.prestationService.createPrestation(prestationData).toPromise();
        console.log('✅ Prestation créée:', result);

        // Rafraîchir les compteurs d'utilisation des items après création réussie
        this.loadItemPrestationsCounters();

        // Afficher le message de succès selon le type d'utilisateur
        if (this.isCurrentUserPrestataire) {
          this.toastService.show({
            type: 'success',
            title: 'Brouillon créé avec succès',
            message: `Votre brouillon de prestation a été créé avec succès. Vous pouvez le soumettre pour validation ultérieurement.`
          });
        } else {
          this.toastService.show({
            type: 'success',
            title: 'Prestation créée',
            message: `Prestation créée couvrant ${this.selectedItems.length} item(s)`
          });
        }

        this.dialogRef.close(true);

      } catch (error: any) {
        console.error('❌ Erreur complète:', error);

        let errorMessage = 'Erreur lors de la création';
        let errorTitle = 'Erreur de création';

        // Gestion des erreurs spécifiques
        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.toastService.show({
          type: 'error',
          title: errorTitle,
          message: errorMessage
        });
      }
    } else {
      console.warn('⚠️ Formulaire invalide:', this.prestationForm.errors);
      this.toastService.show({
        type: 'warning',
        title: 'Formulaire incomplet',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
    }
  }

  private prepareFichePrestationDataForItem(item: Item): any {
    const formValue = this.prestationForm.value;

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) return null;
      const d = new Date(date);
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Format as LocalDateTime compatible string (without milliseconds and Z)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    };

    const quantity = this.getItemQuantity(item) || 1;
    const prixUnitaire = item.prix || 50000; // Use item's price or default
    const montantTotal = quantity * prixUnitaire;

    return {
      nomPrestataire: formValue.nomPrestataire,
      nomItem: item.nomItem, // Use individual item name
      dateRealisation: formatDateTime(formValue.dateDebut, formValue.heureDebut),
      quantite: quantity, // Quantity for this specific item
      prixUnitaire: prixUnitaire,
      montantTotal: montantTotal,
      statut: 'EN_ATTENTE', // Fiche status is EN_ATTENTE when created (admin will validate/reject later)
      statutIntervention: formValue.statutIntervention, // Keep intervention status separate
      commentaire: `Prestation créée via formulaire`,
      // Remove manual idPrestation to let backend generate it
      fichiersContrat: null
    };
  }

  private preparePrestationData(): any {
    const formValue = this.prestationForm.getRawValue();
    console.log('🔧 Préparation des données:', formValue);

    // VALIDATION CRITIQUE: Vérifier que tous les items appartiennent au lot sélectionné
    if (this.selectedItems.length > 0 && this.selectedLotId !== null) {
      console.log('🔍 Validation des items sélectionnés pour le lot ID:', this.selectedLotId);
      
      const invalidItems = this.selectedItems.filter(item => {
        const itemWithLotId = item as any;
        const itemLotId = itemWithLotId.lotId || 0;
        const isInvalid = itemLotId !== this.selectedLotId;
        if (isInvalid) {
          console.error('❌ Item invalide détecté:', {
            item: item.nomItem,
            itemLot: item.lot,
            itemLotId: itemLotId,
            selectedLotId: this.selectedLotId
          });
        }
        return isInvalid;
      });

      if (invalidItems.length > 0) {
        const itemDetails = invalidItems.map(i => `${i.nomItem} (lot: ${i.lot}, lotId: ${(i as any).lotId})`).join(', ');
        const errorMsg = `Les items suivants n'appartiennent pas au lot sélectionné (ID: ${this.selectedLotId}): ${itemDetails}`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      console.log('✅ Tous les items appartiennent au lot ID:', this.selectedLotId);
    }

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) {
        console.warn('⚠️ Date ou heure manquante:', { date, time });
        return null;
      }
      try {
        const d = new Date(date);
        const [hours, minutes] = time.split(':');
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        // Format as LocalDateTime compatible string (without milliseconds and Z)
        const formatted = d.getFullYear() + '-' +
          String(d.getMonth() + 1).padStart(2, '0') + '-' +
          String(d.getDate()).padStart(2, '0') + 'T' +
          String(d.getHours()).padStart(2, '0') + ':' +
          String(d.getMinutes()).padStart(2, '0') + ':' +
          String(d.getSeconds()).padStart(2, '0');
        console.log('📅 Date formatée:', { input: { date, time }, output: formatted });
        return formatted;
      } catch (error) {
        console.error('❌ Erreur formatage date:', error);
        return null;
      }
    };

    // Convert itemQuantities map to the format expected by backend
    const itemQuantities: { [key: string]: number } = {};
    Object.keys(this.itemQuantities).forEach(itemId => {
      itemQuantities[itemId] = this.itemQuantities[itemId];
    });
    console.log('📊 Quantités items:', itemQuantities);

    const prestataireId = this.isCurrentUserPrestataire ?
      this.currentUser?.email || this.currentUser?.nom :
      (this.selectedPrestataire?.email || this.selectedPrestataire?.nom || formValue.prestataireSelection);

    console.log('👤 ID Prestataire:', prestataireId);

    const data = {
      prestataireId: prestataireId,
      nomPrestataire: formValue.nomPrestataire,
      nomPrestation: this.getSelectedItemsNames(),
      nomResponsablePrestation: formValue.nomResponsablePrestation,
      contactResponsablePrestation: formValue.contactResponsablePrestation,
      qualificationResponsablePrestation: formValue.qualificationResponsablePrestation,
      montantIntervention: formValue.montantIntervention,
      equipementsUtilises: '',
      itemIds: formValue.itemsCouverts,
      itemQuantities: itemQuantities,
      trimestre: formValue.trimestre,
      dateHeureDebut: formatDateTime(formValue.dateDebut, formValue.heureDebut),
      dateHeureFin: formatDateTime(formValue.dateFin, formValue.heureFin),
      statutIntervention: formValue.statutIntervention,
      statutValidation: 'BROUILLON',
      nomStructure: formValue.nomStructure,
      contactStructure: formValue.emailStructure,
      adresseStructure: formValue.adresseStructure,
      nomCi: formValue.nomCI,
      prenomCi: formValue.prenomCI,
      contactCi: formValue.contactCI,
      fonctionCi: formValue.fonctionCI,
    };

    console.log('📦 Données finales préparées:', data);
    return data;
  }

  private prepareFichePrestationData(): any {
    const formValue = this.prestationForm.value;

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) return null;
      const d = new Date(date);
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Format as LocalDateTime compatible string (without milliseconds and Z)
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + 'T' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    };

    // Calculate total quantity from selected items
    const totalQuantite = this.selectedItems.reduce((sum, item) => sum + this.getItemQuantity(item), 0);

    // Calculate average price per unit and total amount
    const totalMontant = this.selectedItems.reduce((sum, item) => {
      const quantity = this.getItemQuantity(item);
      const prixUnitaire = item.prix || 50000;
      return sum + (quantity * prixUnitaire);
    }, 0);
    
    const prixUnitaire = totalQuantite > 0 ? totalMontant / totalQuantite : 0;

    // Ensure we have at least one item selected
    if (this.selectedItems.length === 0) {
      throw new Error('Au moins un item doit être sélectionné');
    }

    return {
      nomPrestataire: formValue.nomPrestataire,
      nomItem: this.selectedItems[0].nomItem, // Primary item name (guaranteed to exist)
      itemsCouverts: this.getSelectedItemsNames(), // All covered items as comma-separated string
      dateRealisation: formatDateTime(formValue.dateDebut, formValue.heureDebut),
      quantite: totalQuantite, // Sum of item quantities
      prixUnitaire: prixUnitaire,
      montantTotal: totalMontant,
      statut: 'EN_ATTENTE', // Fiche status is always EN_ATTENTE when created (admin will validate/reject later)
      statutIntervention: formValue.statutIntervention, // Keep intervention status separate
      commentaire: `Prestation créée via formulaire`,
      // Remove manual idPrestation to let backend generate it
      fichiersContrat: null
    };
  }

  exportProformaPDF(): void {
    // Créer le contenu HTML pour le PDF
    const proformaContent = this.generateProformaHTML();
    
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(proformaContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Déclencher l'impression après un court délai
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  private generateProformaHTML(): string {
    const formValue = this.prestationForm.getRawValue();
    const currentDate = new Date().toLocaleDateString('fr-FR');

  const itemsToShow = this.selectedItems.filter(i => i && i.nomItem);

  return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Facture Proforma - ${formValue.nomPrestataire}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .info-block {
            width: 48%;
          }
          .info-block h3 {
            color: #007bff;
            border-bottom: 1px solid #007bff;
            padding-bottom: 5px;
            margin-bottom: 15px;
          }
          .info-item {
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
          }
          .table-container {
            margin: 30px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background: #007bff;
            color: white;
            padding: 12px;
            font-weight: bold;
          }
          th.price-col, td.price-col { text-align: center; }
          th.qty-col, td.qty-col { text-align: center; }
          th.amount-col, td.amount-col { text-align: right; }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #ddd;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .total-row {
            background: #f8f9fa;
            font-weight: bold;
            border-top: 2px solid #007bff;
          }
          .total-amount {
            color: #007bff;
            font-size: 18px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FACTURE PROFORMA</h1>
          <p>Date d'émission: ${currentDate}</p>
          <p>Prestation de maintenance informatique</p>
        </div>

        <div class="info-section">
          <div class="info-block">
            <h3>Prestataire et Responsable</h3>
            <div class="info-item">
              <span class="info-label">Nom prestataire:</span>
              ${formValue.nomPrestataire || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Responsable:</span>
              ${formValue.nomResponsablePrestation || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Contact:</span>
              ${formValue.contactResponsablePrestation || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Qualification:</span>
              ${formValue.qualificationResponsablePrestation || 'N/A'}
            </div>
          </div>

          <div class="info-block">
            <h3>Structure Bénéficiaire</h3>
            <div class="info-item">
              <span class="info-label">Nom:</span>
              ${formValue.nomStructure || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Adresse:</span>
              ${formValue.adresseStructure || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Email:</span>
              ${formValue.emailStructure || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">CI:</span>
              ${formValue.prenomCI || ''} ${formValue.nomCI || ''}
            </div>
            <div class="info-item">
              <span class="info-label">Contact CI:</span>
              ${formValue.contactCI || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Fonction CI:</span>
              ${formValue.fonctionCI || 'N/A'}
            </div>
          </div>
        </div>

        <div class="table-container">
          <h3>Détails de l'intervention</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="price-col">Prix unitaire</th>
                <th class="qty-col">Quantité</th>
                <th class="amount-col">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${itemsToShow.map(item => `
                <tr>
                  <td>${item.nomItem}</td>
                  <td class="price-col">${(item.prix || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td class="qty-col">${this.getItemQuantity(item)}</td>
                  <td class="amount-col">${this.calculateItemAmount(item).toLocaleString('fr-FR')} FCFA</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>MONTANT TOTAL</strong></td>
                <td class="text-right total-amount"><strong>${this.calculateTotalAmount().toLocaleString('fr-FR')} FCFA</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

            <div class="info-section">
          <div class="info-block">
            <h3>Informations sur l'intervention</h3>
            <div class="info-item">
              <span class="info-label">Lot:</span>
              ${this.selectedLotName || formValue.lotSelection || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Date début:</span>
              ${formValue.dateDebut || 'N/A'} à ${formValue.heureDebut || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Date fin:</span>
              ${formValue.dateFin || 'N/A'} à ${formValue.heureFin || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Trimestre:</span>
              ${this.getTrimestreLabel()}
            </div>
            <div class="info-item">
              <span class="info-label">Statut:</span>
              ${this.getStatutLabel()}
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Cette facture proforma est générée automatiquement par le système de gestion des prestations de maintenance.</p>
          <p>Document généré le ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  }

  testLotMatching() {
    const testLotId = 1; // Test avec l'ID du lot
    console.log('🧪 Test de correspondance pour lot ID:', testLotId);

    this.items.forEach(item => {
      const itemLotId = parseInt(item.lot || '0');
      console.log(`- "${item.nomItem}": ${item.lot} (ID: ${itemLotId}) === ${testLotId} ? ${itemLotId === testLotId}`);
    });
  }



  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.canProceedToNext()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onCancel(): void {
    this.showForm = false;
    this.dialogRef.close();
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredItems();
  }
}
