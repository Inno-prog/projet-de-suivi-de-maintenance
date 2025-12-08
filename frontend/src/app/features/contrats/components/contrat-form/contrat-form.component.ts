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
import { Contrat, Item, StatutContrat } from '../../../../core/models/business.models';
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
  items: Item[] = [];
  selectedItems: Item[] = [];
  selectedItemIds: number[] = [];
  loading = false;
  selectedFile: File | null = null;

  statutOptions = [
    { value: StatutContrat.ACTIF, label: 'Actif' },
    { value: StatutContrat.SUSPENDU, label: 'Suspendu' },
    { value: StatutContrat.TERMINE, label: 'Terminé' },
    { value: StatutContrat.EXPIRE, label: 'Expiré' }
  ];

  // Mapping des lots aux villes
  lotCityMapping: { [key: string]: string } = {
    'Lot 4': 'Koudougou',
    'Lot 6': 'Bobo-Dioulasso',
    'Lot 9': 'Ouagadougou',
    'Lot 1': 'Banfora',
    'Lot 2': 'Dédougou',
    'Lot 3': 'Ouahigouya',
    'Lot 5': 'Manga',
    'Lot 7': 'Diébougou',
    'Lot 8': 'Fada N\'Gourma'
  };



  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private contratService: ContratService,
    private itemService: ItemService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<ContratFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.contrat;
    this.contratForm = this.fb.group({
      idContrat: [data?.contrat?.idContrat || '', [Validators.required]],
      dateDebut: [data?.contrat?.dateDebut || '', [Validators.required]],
      dateFin: [data?.contrat?.dateFin || '', [Validators.required]],
      nomPrestataire: [data?.contrat?.nomPrestataire || '', [Validators.required]],
      montant: [data?.contrat?.montant || '', [Validators.required, Validators.min(0)]],
      lot: [data?.contrat?.lot || '', [Validators.required]],
      ville: [data?.contrat?.ville || '', [Validators.required]],
      statut: [data?.contrat?.statut || StatutContrat.ACTIF, [Validators.required]],
      fichierContrat: [data?.contrat?.fichierContrat || '', [Validators.required]]
    });

    // Initialize selected items for edit mode
    if (this.isEditMode && data.contrat.items) {
      this.selectedItems = [...data.contrat.items];
      this.selectedItemIds = data.contrat.items.map((item: Item) => item.id!);
    }
  }

  ngOnInit(): void {
    this.loadItems();
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

  onItemSelectionChange(item: Item, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      if (!this.selectedItems.some(selected => selected.id === item.id)) {
        this.selectedItems.push(item);
        this.selectedItemIds.push(item.id!);
      }
    } else {
      this.selectedItems = this.selectedItems.filter(selected => selected.id !== item.id);
      this.selectedItemIds = this.selectedItemIds.filter(id => id !== item.id);
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
    return this.selectedItems.reduce((total, item) => total + (item.prix || 0), 0);
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
    const selectedLot = this.contratForm.get('lot')?.value;
    if (selectedLot && this.lotCityMapping[selectedLot]) {
      this.contratForm.patchValue({
        ville: this.lotCityMapping[selectedLot]
      });
    }
  }
}
