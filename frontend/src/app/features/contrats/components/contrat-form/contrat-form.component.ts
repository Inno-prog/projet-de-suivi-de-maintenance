import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ContratService } from '../../../../core/services/contrat.service';
import { ItemService } from '../../../../core/services/item.service';
import { LotService } from '../../../../core/services/lot.service';
import { KeycloakService, KeycloakPrestataire } from '../../../../core/services/keycloak.service';
import { Contrat, StatutContrat, Item, Lot } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-contrat-form',
  templateUrl: './contrat-form.component.html',
  styleUrls: ['./contrat-form.component.css'],
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
export class ContratFormComponent implements OnInit, OnDestroy {
  contratForm: FormGroup;
  isEditMode = false;
  loading = false;
  selectedFile: File | null = null;
  items: Item[] = [];
  selectedItems: Item[] = [];
  selectedItemIds: number[] = [];
  lots: Lot[] = [];
  prestataires: KeycloakPrestataire[] = [];

  statutOptions = [
    { value: StatutContrat.ACTIF, label: 'Actif' },
    { value: StatutContrat.RESILIE, label: 'Résilié' }
  ];

  // Mapping des lots aux villes
  lotCityMapping: { [key: string]: string } = {
    
  };



  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    private itemService: ItemService,
    private lotService: LotService,
    private keycloakService: KeycloakService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<ContratFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.contrat;
     this.contratForm = this.fb.group({
      idContrat: [data?.contrat?.idContrat || '', [Validators.required]],
      dateDebut: [data?.contrat?.dateDebut || '', [Validators.required]],
      dateFin: [data?.contrat?.dateFin || '', [Validators.required]],
      prestataireId: [data?.contrat?.prestataireId || '', [Validators.required]],
      nomPrestataire: [data?.contrat?.nomPrestataire || '', [Validators.required]],
      montant: [data?.contrat?.montant || '', [Validators.required, Validators.min(0)]],
      lotId: [data?.contrat?.lotEntity?.id || '', [Validators.required]],
      regions: [data?.contrat?.regions || ''],
      statut: [data?.contrat?.statut || StatutContrat.ACTIF, [Validators.required]],
      fichierContrat: [data?.contrat?.fichierContrat || '', [Validators.required]]
    });


  }

  ngOnInit(): void {
    this.loadItems();
    this.loadLots();
    this.loadPrestataires();
    
    // Listener pour mettre à jour le nomPrestataire lorsque le prestataireId change
    this.contratForm.get('prestataireId')?.valueChanges.subscribe(prestataireId => {
      const selectedPrestataire = this.prestataires.find(p => p.id === prestataireId);
      if (selectedPrestataire) {
        const displayName = selectedPrestataire.displayName || 
                          selectedPrestataire.nom || 
                          `${selectedPrestataire.firstName || ''} ${selectedPrestataire.lastName || ''}`.trim() || 
                          selectedPrestataire.username || '';
        this.contratForm.patchValue({
          nomPrestataire: displayName
        });
      }
    });
  }

  ngOnDestroy(): void {
   this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadItems(): void {
    this.loading = true;
    const subscription = this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des items:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des items'
        });
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  loadLots(): void {
    this.loading = true;
    const subscription = this.lotService.getAllLotEntities().subscribe({
      next: (lots) => {
        this.lots = lots;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des lots:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des lots'
        });
        this.loading = false;
      }
    });
    this.subscriptions.push(subscription);
  }

  loadPrestataires(): void {
    this.loading = true;
    // Synchroniser les utilisateurs Keycloak avec la base de données avant de charger les prestataires
    const syncSubscription = this.keycloakService.syncUsers().subscribe({
      next: (syncResult) => {
        console.log('Synchronisation Keycloak:', syncResult);
        // Charger les prestataires après synchronisation
        const loadSubscription = this.keycloakService.getPrestataires().subscribe({
          next: (prestataires) => {
            this.prestataires = prestataires;
            this.loading = false;
            console.log('Prestataires chargés:', this.prestataires);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des prestataires:', error);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: 'Erreur lors du chargement des prestataires depuis Keycloak'
            });
            this.loading = false;
          }
        });
        this.subscriptions.push(loadSubscription);
      },
      error: (syncError) => {
        console.error('Erreur lors de la synchronisation Keycloak:', syncError);
        // Charger les prestataires même si la synchronisation échoue
        const loadSubscription = this.keycloakService.getPrestataires().subscribe({
          next: (prestataires) => {
            this.prestataires = prestataires;
            this.loading = false;
            console.log('Prestataires chargés:', this.prestataires);
          },
          error: (error) => {
            console.error('Erreur lors du chargement des prestataires:', error);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: 'Erreur lors du chargement des prestataires depuis Keycloak'
            });
            this.loading = false;
          }
        });
        this.subscriptions.push(loadSubscription);
      }
    });
    this.subscriptions.push(syncSubscription);
  }

  onItemSelectionChange(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      if (!this.selectedItems.some((selected: Item) => selected.id === item.id)) {
        this.selectedItems.push(item);
        this.selectedItemIds.push(item.id!);
      }
    } else {
      this.selectedItems = this.selectedItems.filter((selected: Item) => selected.id !== item.id);
      this.selectedItemIds = this.selectedItemIds.filter((id: number) => id !== item.id);
    }
  }

  isItemSelected(item: Item): boolean {
    return this.selectedItems.some(selected => selected.id === item.id);
  }

  get filteredItems(): Item[] {
    // Show all items since items are created without lots initially
    // Items get assigned to lots when associated with contracts
    return this.items;
  }

  onSubmit(): void {
    if (this.contratForm.valid) {
      this.loading = true;
      
      try {
        // Préparation des données du contrat
        const formValue = this.contratForm.value;
        const contratData = {
          ...formValue,
          itemIds: this.selectedItemIds,
          // Conserver le fichier existant en cas de mise à jour sans nouveau fichier
          fichierContrat: this.data?.contrat?.fichierContrat
        };

        console.log('Données du contrat à envoyer:', contratData);
        console.log('Fichier sélectionné:', this.selectedFile);

        const operation = this.isEditMode
          ? this.contratService.updateContrat(this.data.contrat.id, contratData, this.selectedFile || undefined)
          : this.contratService.createContrat(contratData, this.selectedFile || undefined);

        const subscription = operation.subscribe({
          next: (result) => {
            this.toastService.show({
              type: 'success',
              title: this.isEditMode ? 'Contrat modifié' : 'Contrat créé',
              message: `Le contrat a été ${this.isEditMode ? 'modifié' : 'créé'} avec succès.`
            });
            this.dialogRef.close(true);
            this.loading = false;
          },
          error: (error) => {
            console.error('Détails de l\'erreur complète:', error);
            
            let errorMessage = 'Une erreur est survenue lors de la sauvegarde du contrat';
            
            if (error.status === 400) {
              errorMessage = 'Données invalides : ' + (error.error?.message || 'Veuillez vérifier les informations saisies');
            } else if (error.status === 500) {
              errorMessage = 'Erreur serveur : ' + (error.error?.message || 'Veuillez réessayer plus tard');
            } else if (error.error) {
              errorMessage = error.error.message || JSON.stringify(error.error);
            }
            
            this.toastService.show({
              type: 'error',
              title: `Erreur ${error.status || ''}`,
              message: errorMessage
            });
            
            this.loading = false;
          }
        });
        
        this.subscriptions.push(subscription);
        
      } catch (error) {
        console.error('Erreur lors de la préparation du formulaire:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Une erreur est survenue lors de la préparation des données'
        });
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched();
      this.toastService.show({
        type: 'error',
        title: 'Formulaire invalide',
        message: 'Veuillez corriger les erreurs dans le formulaire.'
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contratForm.controls).forEach(key => {
      const control = this.contratForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getSelectedItemsCount(): number {
    return this.selectedItems.length;
  }

  getTotalItemsValue(): number {
    return this.selectedItems.reduce((total: number, item: Item) => total + (item.prix || 0), 0);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
      this.contratForm.patchValue({
        fichierContrat: this.selectedFile.name
      });
    }
  }

  onLotChange(): void {
    const selectedLotId = this.contratForm.get('lotId')?.value;
    if (selectedLotId) {
      // Convert to number since HTML select values are strings
      const lotId = parseInt(selectedLotId, 10);
      // Find the selected lot
      const selectedLot = this.lots.find(lot => lot.id === lotId);
      if (selectedLot) {
        // Auto-fill regions with the lot's regions list
        if (selectedLot.regions && selectedLot.regions.length > 0) {
          this.contratForm.patchValue({
            regions: selectedLot.regions.join(', ')
          });
        } else {
          // Clear regions if lot has no regions
          this.contratForm.patchValue({
            regions: ''
          });
        }
        // Auto-fill ville with first ville from the selected lot's villes list
        if (selectedLot.villes && selectedLot.villes.length > 0) {
          this.contratForm.patchValue({
            ville: selectedLot.villes[0]
          });
        } else {
          // Clear ville if lot has no villes
          this.contratForm.patchValue({
            ville: ''
          });
        }
      }
    } else {
      // Clear fields if no lot selected
      this.contratForm.patchValue({
        regions: '',
        ville: ''
      });
    }
  }

  // Helper method to get display name for a prestataire
  getPrestataireDisplayName(prestataireId: string): string {
    const presta = this.prestataires.find(p => p.id === prestataireId);
    if (presta) {
      // Use nom or full name (firstName + lastName) or username
      return presta.nom || `${presta.firstName || ''} ${presta.lastName || ''}`.trim() || presta.username || '';
    }
    return '';
  }
}
