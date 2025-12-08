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
import { Subscription } from 'rxjs';
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
  selectedItem: Item | null = null;
  equipements: Equipement[] = [];
  selectedEquipements: Equipement[] = [];
  maxQuantityForTrimestre: number = 0;
  existingPrestationsCount: number = 0;
  showForm = false;

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
    private authService: AuthService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<PrestationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.prestation;
    this.prestationForm = this.fb.group({
      // Step 1: Prestataire info (auto-filled from current user, manual input allowed)
      nomPrestataire: [data?.prestation?.nomPrestataire || ''],
      contactPrestataire: [data?.prestation?.contactPrestataire || ''],
      structurePrestataire: [data?.prestation?.structurePrestataire || ''],
      directionPrestataire: [data?.prestation?.directionPrestataire || ''],
      qualificationPrestataire: [data?.prestation?.qualificationPrestataire || ''],

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
      itemsCouverts: [data?.prestation?.itemsCouverts || [], Validators.required],
      montantIntervention: [data?.prestation?.montantIntervention || '', [Validators.required, Validators.min(0)]],
      trimestre: [data?.prestation?.trimestre || '', Validators.required],
      dateDebut: [data?.prestation?.dateDebut || '', Validators.required],
      heureDebut: [data?.prestation?.heureDebut || '', Validators.required],
      dateFin: [data?.prestation?.dateFin || '', Validators.required],
      heureFin: [data?.prestation?.heureFin || '', Validators.required],
      statutIntervention: [data?.prestation?.statutIntervention || '', Validators.required]
    });
  }

  ngOnInit(): void {
    this.showForm = true;

    // Subscribe to user changes to update form when user data is loaded
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      console.log('🎯 PrestationForm: User data received:', user);
      this.currentUser = user;
      this.isCurrentUserPrestataire = user?.role === 'PRESTATAIRE';

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

    this.loadItems();
    this.loadStructuresMefp();
    this.loadEquipements();
    this.loadPrestataires();
    this.setupItemSelectionListener();
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  loadItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        // Charger les compteurs de prestations pour chaque item
        this.loadItemPrestationsCounters();
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des items:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des items' });
        }
      }
    });
  }

  loadItemPrestationsCounters(): void {
    // Charger les compteurs pour tous les items en parallèle
    this.items.forEach(item => {
      if (item.nomItem) {
        this.prestationService.getCountByItem(item.nomItem).subscribe({
          next: (count) => {
            this.itemPrestationsCount[item.nomItem] = count;
          },
          error: (error) => {
            console.error(`Erreur compteur pour ${item.nomItem}:`, error);
            this.itemPrestationsCount[item.nomItem] = 0;
          }
        });
      }
    });
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

  onEquipementSelectionChange(event: any): void {
    const selectedIds = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedEquipements = this.equipements.filter(eq => selectedIds.includes(eq.id));
  }

  onItemSelectionChange(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

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

    // Permettre la sélection même si le maximum est atteint
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
    this.showItemSelectionPopup = true;
  }

  closeItemSelectionPopup(): void {
    this.showItemSelectionPopup = false;
  }

  validateItemSelection(): void {
    this.showItemSelectionPopup = false;
    this.showValidationPopup = true;
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
    this.showValidationPopup = false;
    this.updateTotalAmount();
  }

  isItemSelected(item: Item): boolean {
    return this.selectedItems.some(i => i.id === item.id);
  }

  isItemBudgetExhausted(item: Item): boolean {
    const remainingBudget = item.quantiteMaxTrimestre || 0;
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

  isItemMaxReached(item: Item): boolean {
    const maxAllowed = item.quantiteMaxTrimestre || 0;
    const currentCount = this.getItemPrestationsCount(item);
    return currentCount >= maxAllowed && maxAllowed > 0;
  }

  get filteredItems(): Item[] {
    if (!this.searchTerm) {
      return this.items;
    }
    const term = this.searchTerm.toLowerCase();
    return this.items.filter(item =>
      item.nomItem?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term)
    );
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToNext(): boolean {
    switch (this.currentStep) {
      case 1:
        // For non-prestataire users, prestataire selection is required
        if (!this.isCurrentUserPrestataire) {
          const prestataireSelectionValid = this.prestationForm.get('prestataireSelection')?.valid;
          if (!prestataireSelectionValid) return false;
        }

        // Vérifier que les champs obligatoires ont des valeurs (même s'ils sont désactivés)
        const nomValid = this.prestationForm.get('nomPrestataire')?.value?.trim();
        const contactValid = this.prestationForm.get('contactPrestataire')?.value?.trim();
        const structureValid = this.prestationForm.get('structurePrestataire')?.value?.trim();
        
        return !!(nomValid && contactValid && structureValid);
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
        const baseValidation = this.selectedItems.length > 0 &&
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

  getSelectedItemsNames(): string {
    return this.selectedItems.map(i => i.nomItem).join(', ');
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
  }

  updateMaxQuantity(): void {
    if (this.selectedItem) {
      this.maxQuantityForTrimestre = this.selectedItem.quantiteMaxTrimestre || 0;
    } else {
      this.maxQuantityForTrimestre = 0;
    }
  }

  updateExistingPrestationsCount(): void {
    if (this.selectedItem) {
      const nomItem = this.selectedItem.nomItem;
      console.log(`🔍 Mise à jour compteur pour: ${nomItem}`);

      this.prestationService.getCountByItem(nomItem).subscribe({
        next: (count) => {
          this.existingPrestationsCount = count;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
          console.log(`✅ Compteur mis à jour: ${count}/${this.maxQuantityForTrimestre}`);
        },
        error: (error) => {
          console.error('❌ Erreur compteur:', error);
          // Mettre à jour avec des valeurs par défaut
          this.existingPrestationsCount = 0;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
        }
      });
    } else {
      this.existingPrestationsCount = 0;
      this.maxQuantityForTrimestre = 0;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.prestationForm.valid) {
      console.log('🔄 Soumission du formulaire...');
      console.log('📋 Données du formulaire:', this.prestationForm.getRawValue());
      console.log('🎯 Items sélectionnés:', this.selectedItems);
      console.log('👤 Utilisateur actuel:', this.currentUser);

      // Vérification du nombre maximum de prestations pour chaque item
      for (const item of this.selectedItems) {
        const maxAllowed = item.quantiteMaxTrimestre || 0;
        if (maxAllowed > 0) {
          try {
            const isMaxReached = await this.prestationService.checkMaxPrestationsReached(item.nomItem, maxAllowed).toPromise();
            if (isMaxReached) {
              this.toastService.show({
                type: 'error',
                title: 'Nombre maximum atteint',
                message: `Le nombre de prestations autorisé pour l'item "${item.nomItem}" est atteint (${maxAllowed} prestations maximum).`
              });
              return;
            }
          } catch (error) {
            console.error(`Erreur lors de la vérification pour ${item.nomItem}:`, error);
            // Continuer en cas d'erreur de vérification
          }
        }
      }

      // Vérification frontend de la capacité restante pour chaque item sélectionné
      for (const item of this.selectedItems) {
        const quantityUsed = this.getItemQuantity(item);
        const remainingCapacity = item.quantiteMaxTrimestre || 0;

        if (quantityUsed > remainingCapacity) {
          const message = `Capacité insuffisante pour "${item.nomItem}": demandé ${quantityUsed}, disponible ${remainingCapacity}`;
          console.warn('🚫 ' + message);
          this.toastService.show({
            type: 'error',
            title: 'Capacité insuffisante',
            message
          });
          return;
        }
      }

      try {
        // Créer une prestation avec les données préparées
        const prestationData = this.preparePrestationData();
        console.log('📤 Données à envoyer:', prestationData);
        
        const result = await this.prestationService.createPrestation(prestationData).toPromise();

        console.log('✅ Prestation créée:', result);

        // Afficher le message de succès selon le type d'utilisateur
        if (this.isCurrentUserPrestataire) {
          this.toastService.show({
            type: 'success',
            title: 'Fiche créée avec succès',
            message: `Votre fiche de prestation a été créée avec succès. Vous pouvez la soumettre pour validation ultérieurement.`
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
        console.error('❌ Erreur soumission complète:', {
          error,
          message: error?.message,
          status: error?.status,
          statusText: error?.statusText,
          url: error?.url
        });
        
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

  private preparePrestationData(): any {
    const formValue = this.prestationForm.getRawValue();
    console.log('🔧 Préparation des données:', formValue);

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) {
        console.warn('⚠️ Date ou heure manquante:', { date, time });
        return null;
      }
      try {
        const d = new Date(date);
        const [hours, minutes] = time.split(':');
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        const formatted = d.toISOString().replace('Z', '');
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
      this.currentUser?.id :
      (this.selectedPrestataire?.id || formValue.prestataireSelection);
    
    console.log('👤 ID Prestataire:', prestataireId);

    const data = {
      prestataireId: prestataireId,
      nomPrestataire: this.selectedPrestataire?.nom || this.currentUser?.nom || formValue.nomPrestataire,
      nomPrestation: this.getSelectedItemsNames(),
      contactPrestataire: formValue.contactPrestataire,
      structurePrestataire: formValue.structurePrestataire,
      directionPrestataire: formValue.directionPrestataire,
      servicePrestataire: formValue.structurePrestataire || 'Service Maintenance',
      rolePrestataire: formValue.directionPrestataire,
      qualificationPrestataire: formValue.qualificationPrestataire,
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

  private prepareFichePrestationDataForItem(item: Item): any {
    const formValue = this.prestationForm.value;

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) return null;
      const d = new Date(date);
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Return ISO string without Z for LocalDateTime
      return d.toISOString().replace('Z', '');
    };

    return {
      nomPrestataire: formValue.nomPrestataire,
      nomItem: item.nomItem, // Use individual item name
      dateRealisation: formatDateTime(formValue.dateDebut, formValue.heureDebut),
      quantite: this.getItemQuantity(item) || 1, // Quantity for this specific item
      statut: 'EN_ATTENTE', // Fiche status is EN_ATTENTE when created (admin will validate/reject later)
      statutIntervention: formValue.statutIntervention, // Keep intervention status separate
      commentaire: `Prestation créée via formulaire`,
      // Remove manual idPrestation to let backend generate it
      fichiersContrat: null
    };
  }

  private prepareFichePrestationData(): any {
    const formValue = this.prestationForm.value;

    const formatDateTime = (date: any, time: any) => {
      if (!date || !time) return null;
      const d = new Date(date);
      const [hours, minutes] = time.split(':');
      d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      // Return ISO string without Z for LocalDateTime
      return d.toISOString().replace('Z', '');
    };

    // Calculate total quantity from selected items
    const totalQuantite = this.selectedItems.reduce((sum, item) => sum + this.getItemQuantity(item), 0);

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
            text-align: left;
            font-weight: bold;
          }
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
            <h3>Prestataire</h3>
            <div class="info-item">
              <span class="info-label">Nom:</span>
              ${formValue.nomPrestataire || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Contact:</span>
              ${formValue.contactPrestataire || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Structure:</span>
              ${formValue.structurePrestataire || 'N/A'}
            </div>
            <div class="info-item">
              <span class="info-label">Direction:</span>
              ${formValue.directionPrestataire || 'N/A'}
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
          </div>
        </div>
        
        <div class="table-container">
          <h3>Détails de l'intervention</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="text-center">Prix unitaire</th>
                <th class="text-center">Quantité</th>
                <th class="text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              ${this.selectedItems.map(item => `
                <tr>
                  <td>${item.nomItem}</td>
                  <td class="text-center">${(item.prix || 0).toLocaleString('fr-FR')} FCFA</td>
                  <td class="text-center">${this.getItemQuantity(item)}</td>
                  <td class="text-right">${this.calculateItemAmount(item).toLocaleString('fr-FR')} FCFA</td>
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
            <h3>Informations de l'intervention</h3>
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

  onCancel(): void {
    this.showForm = false;
    this.dialogRef.close();
  }
}
