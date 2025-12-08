import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User, Prestataire } from '../../../../core/models/auth.models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>
            <svg class="header-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"/>
            </svg>
            Gestion des Utilisateurs
          </h1>
          <button class="btn btn-primary" (click)="openCreateUserModal()" [disabled]="!isAdmin">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            {{ showUserModal ? 'Annuler' : 'Nouvel Utilisateur' }}
          </button>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Utilisateurs</h2>
            <div class="search-bar">
              <input type="text" placeholder="Rechercher par nom, email, contact, rôle, qualification..." [(ngModel)]="searchTerm" (input)="filterUsers()" class="search-input">
              <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <button *ngIf="searchTerm" class="clear-btn" (click)="clearSearch()" title="Effacer la recherche">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="table-wrapper">
            <table *ngIf="filteredUsers.length > 0; else noData">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Contact</th>
                  <th>Qualification</th>
                  <th>Structure</th>
                  <th>Direction</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>
                    <div class="cell-content">
                      <svg class="cell-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      {{ user.nom }}
                    </div>
                  </td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>
                    <div class="cell-content">
                      <svg class="cell-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {{ user.contact || 'Contact non spécifié' }}
                    </div>
                  </td>
                  <td [innerHTML]="getQualificationInfo(user)"></td>
                  <td>{{ user.structure || 'Structure non spécifiée' }}</td>
                  <td [innerHTML]="getDirectionInfo(user)" [title]="getDirectionTooltip(user)"></td>
                  <td>
                    <div class="flex space-x-2">
                      <!-- Voir -->
                      <button
                        class="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                        title="Voir"
                        (click)="viewUser(user)"
                      >
                        <i class="bi bi-eye"></i>
                      </button>

                      <!-- Éditer -->
                      <button
                        class="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded"
                        title="Éditer"
                        (click)="editUser(user)"
                        [disabled]="!canEditUser(user)"
                      >
                        <i class="bi bi-pencil-square"></i>
                      </button>

                      <!-- Supprimer -->
                      <button
                        class="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                        title="Supprimer"
                        (click)="deleteUser(user)"
                        [disabled]="user.id === currentUserId"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun utilisateur trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          Chargement des utilisateurs...
        </div>
      </div>

      <!-- User Modal -->
      <div class="modal-overlay" *ngIf="showUserModal" (click)="closeUserModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="user-form">
            <h2 class="form-title">{{ isEditing ? 'Modifier' : 'Créer' }} un Utilisateur</h2>

            <div class="form-group">
              <label for="nom">Nom</label>
              <input
                type="text"
                id="nom"
                formControlName="nom"
                placeholder="Entrez le nom"
                class="line-input"
                [class.error]="userForm.get('nom')?.invalid && userForm.get('nom')?.touched"
              />
              <div class="input-line" [class.error]="userForm.get('nom')?.invalid && userForm.get('nom')?.touched"></div>
              <div class="error-message" *ngIf="userForm.get('nom')?.invalid && userForm.get('nom')?.touched">
                Le nom est requis
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                placeholder="Entrez l'email"
                class="line-input"
                [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"
              />
              <div class="input-line" [class.error]="userForm.get('email')?.invalid && userForm.get('email')?.touched"></div>
              <div class="error-message" *ngIf="userForm.get('email')?.invalid && userForm.get('email')?.touched">
                L'email est requis et doit être valide
              </div>
            </div>

            <div class="form-group">
              <label for="contact">Contact</label>
              <input
                type="text"
                id="contact"
                formControlName="contact"
                placeholder="Entrez le contact"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="role">Rôle</label>
              <select
                id="role"
                formControlName="role"
                class="line-input"
                [class.error]="userForm.get('role')?.invalid && userForm.get('role')?.touched"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMINISTRATEUR">Administrateur</option>
                <option value="PRESTATAIRE">Prestataire</option>
                <option value="AGENT_DGSI">Agent DGSI</option>
              </select>
              <div class="input-line" [class.error]="userForm.get('role')?.invalid && userForm.get('role')?.touched"></div>
              <div class="error-message" *ngIf="userForm.get('role')?.invalid && userForm.get('role')?.touched">
                Le rôle est requis
              </div>
            </div>

            <div class="form-group">
              <label for="adresse">Adresse</label>
              <input
                type="text"
                id="adresse"
                formControlName="adresse"
                placeholder="Entrez l'adresse"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="qualification">Qualification</label>
              <input
                type="text"
                id="qualification"
                formControlName="qualification"
                placeholder="Entrez la qualification"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="structure">Structure</label>
              <input
                type="text"
                id="structure"
                formControlName="structure"
                placeholder="Entrez la structure"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>

            <div class="form-group">
              <label for="direction">Direction</label>
              <input
                type="text"
                id="direction"
                formControlName="direction"
                placeholder="Entrez la direction"
                class="line-input"
              />
              <div class="input-line"></div>
            </div>



            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="closeUserModal()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="userForm.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
        </div>
      </div>
  `,
  styles: [`
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #1E2761;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      color: #f97316;
      flex-shrink: 0;
    }

    .btn-icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow-x: hidden;
      width: 100%;
      padding: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    th:nth-child(1), td:nth-child(1) { width: 13%; } /* Nom */
    th:nth-child(2), td:nth-child(2) { width: 16%; } /* Email */
    th:nth-child(3), td:nth-child(3) { width: 10%; } /* Rôle */
    th:nth-child(4), td:nth-child(4) { width: 11%; } /* Contact */
    th:nth-child(5), td:nth-child(5) { width: 14%; } /* Qualification */
    th:nth-child(6), td:nth-child(6) { width: 12%; } /* Structure */
    th:nth-child(7), td:nth-child(7) { width: 14%; } /* Direction */
    th:nth-child(8), td:nth-child(8) { width: 9%; }  /* Actions */

    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #1E2761;
      font-size: 0.875rem;
    }

    td {
      color: #000000;
      font-size: 0.875rem;
      font-weight: 600;
      border-bottom: 2px solid #e5e7eb;
      border-right: 1px solid #e5e7eb;
    }

    td:last-child {
      border-right: none;
    }

    .edit-btn, .delete-btn {
      background: none;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 0.5rem;
      margin-right: 0.5rem;
      font-size: 1rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .action-icon {
      width: 16px;
      height: 16px;
    }

    .edit-btn {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .edit-btn:hover {
      background: #bfdbfe;
      transform: scale(1.1);
    }

    .delete-btn {
      background: #fee2e2;
      color: #dc2626;
    }

    .delete-btn:hover:not(:disabled) {
      background: #fecaca;
      transform: scale(1.1);
    }

    .delete-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      color: #1E2761;
      font-size: 1.125rem;
      font-weight: 500;
      letter-spacing: 0.025em;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
      background: white;
      border-radius: 12px;
      padding: 0.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .search-bar:focus-within {
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-input {
      border: none;
      outline: none;
      background: transparent;
      padding: 0.5rem 0.5rem 0.5rem 0;
      font-size: 0.875rem;
      width: 280px;
      color: #374151;
    }

    .search-input::placeholder {
      color: #9ca3af;
    }

    .search-icon {
      color: #6b7280;
      margin-right: 0.5rem;
      flex-shrink: 0;
    }

    .cell-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cell-icon {
      width: 16px;
      height: 16px;
      color: #6b7280;
      flex-shrink: 0;
    }


    .clear-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .clear-btn:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    .table-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .user-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #1e293b;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    /* Boutons EXACTEMENT comme l'image */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    /* Style pour le select */
    select.line-input {
      appearance: none;
      background: transparent;
      cursor: pointer;
    }

    .form-group:has(select)::after {
      content: '▼';
      position: absolute;
      right: 0;
      bottom: 12px;
      font-size: 12px;
      color: #666;
      pointer-events: none;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = false;
  currentUserId: string | null = null;
  showUserModal = false;
  isEditing = false;
  currentUser: User | null = null;
  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.userForm = this.formBuilder.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: [''],
      adresse: [''],
      role: ['USER', Validators.required],
      qualification: [''],
      structure: [''],
      direction: [''],
      password: ['default123'] // Add default password
    });
  }

  ngOnInit(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      this.currentUserId = currentUser.id;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Données des utilisateurs reçues:', JSON.stringify(users, null, 2));

        // Afficher les détails des prestataires
        const prestataires = users.filter(u => u.role === 'PRESTATAIRE');
        console.log('Prestataires:', JSON.stringify(prestataires, null, 2));

        this.users = users;
        this.filterUsers();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user =>
        (user.nom || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        String(user.contact || '').toLowerCase().includes(term) ||
        (user.adresse || '').toLowerCase().includes(term) ||
        (user.role || '').toLowerCase().includes(term) ||
        (user.structure || '').toLowerCase().includes(term) ||
        this.getRoleLabel(user.role).toLowerCase().includes(term)
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filterUsers();
  }

  getBadgeClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      'ADMINISTRATEUR': 'badge-success',
      'PRESTATAIRE': 'badge-warning',
      'USER': 'badge-info'
    };
    return roleClasses[role] || 'badge-info';
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'ADMINISTRATEUR': 'Administrateur',
      'PRESTATAIRE': 'Prestataire',
      'AGENT_DGSI': 'Agent DGSI',
      'USER': 'Utilisateur'
    };
    return roleLabels[role] || role;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  openCreateUserModal(): void {
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset({
      nom: '',
      email: '',
      contact: '',
      adresse: 'Ouagadougou, Burkina Faso',
      role: 'USER',
      qualification: 'Technicien Informatique',
      structure: 'Direction Générale du Budget',
      direction: 'Direction du Matériel et de la Documentation Informatique',
      structurePrestataire: '',
      directionPrestataire: '',
      password: 'default123'
    });
    this.showUserModal = true;
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.currentUser = user;
    this.userForm.patchValue({
      nom: user.nom,
      email: user.email,
      contact: user.contact,
      adresse: user.adresse,
      role: user.role,
      qualification: user.qualification,
      structure: user.structure || '',
      direction: user.direction || ''
    });
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.currentUser = null;
    this.userForm.reset({
      nom: '',
      email: '',
      contact: '',
      adresse: 'Ouagadougou, Burkina Faso',
      role: 'USER',
      qualification: 'Technicien Informatique',
      structure: 'Direction Générale du Budget',
      direction: 'Direction du Matériel et de la Documentation Informatique',
      structurePrestataire: '',
      directionPrestataire: '',
      password: 'default123'
    });
  }

  async saveUser(): Promise<void> {
    if (this.userForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cet utilisateur ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        const userData = this.userForm.value;

        if (this.isEditing && this.currentUser) {
          // Use appropriate service based on whether editing self or another user
          const isEditingSelf = this.currentUser.id === this.currentUserId;

          if (isEditingSelf) {
            // Use auth service for self-editing to update current user session
            this.authService.updateUserProfile(userData).subscribe({
              next: (updatedUser) => {
                const index = this.users.findIndex(u => u.id === updatedUser.id);
                if (index !== -1) {
                  this.users[index] = updatedUser;
                  this.filterUsers();
                }
                this.closeUserModal();
                this.toastService.show({ type: 'success', title: 'Profil modifié', message: 'Votre profil a été modifié avec succès' });
              },
              error: (error) => {
                console.error('Error updating profile:', error);
                this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification du profil' });
              }
            });
          } else {
            // Use user service for editing other users
            this.userService.updateUser(this.currentUser.id, userData).subscribe({
              next: (updatedUser) => {
                const index = this.users.findIndex(u => u.id === updatedUser.id);
                if (index !== -1) {
                  this.users[index] = updatedUser;
                  this.filterUsers();
                }
                this.closeUserModal();
                this.toastService.show({ type: 'success', title: 'Utilisateur modifié', message: 'L\'utilisateur a été modifié avec succès' });
              },
              error: (error) => {
                console.error('Error updating user:', error);
                this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification de l\'utilisateur' });
              }
            });
          }
        } else {
          this.userService.createUser(userData).subscribe({
            next: (newUser) => {
              this.users.push(newUser);
              this.filterUsers();
              this.closeUserModal();
              this.toastService.show({ type: 'success', title: 'Utilisateur créé', message: 'L\'utilisateur a été créé avec succès' });
            },
            error: (error) => {
              console.error('Error creating user:', error);
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de l\'utilisateur' });
            }
          });
        }
      }
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de l\'utilisateur' });
        }
      });
    }
  }

  canEditUser(user: User): boolean {
    const currentUser = this.authService.getCurrentUser();
    return !!currentUser && (currentUser.role === 'ADMINISTRATEUR' || currentUser.id === user.id);
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getRoleDisplay(role: string): string {
    return this.getRoleLabel(role);
  }

  getStructureInfo(user: User): string {
    return user.structure || 'Structure non spécifiée';
  }

  getQualificationInfo(user: User): string {
    let qualification: string = user.qualification || 'Qualification non spécifiée';

    // Add line breaks for better readability
    if (qualification.includes(' ')) {
      const words = qualification.split(' ');
      if (words.length > 2) {
        // For longer qualifications, break into multiple lines
        return words.slice(0, 2).join(' ') + '<br>' + words.slice(2).join(' ');
      } else if (words.length > 1) {
        // For qualifications like "Technicien Informatique", break after first word
        return words[0] + '<br>' + words.slice(1).join(' ');
      }
    }

    // For very long single words, break them
    if (qualification.length > 15) {
      const midPoint = Math.floor(qualification.length / 2);
      return qualification.substring(0, midPoint) + '<br>' + qualification.substring(midPoint);
    }

    return qualification;
  }

  getDirectionInfo(user: User): string {
    let direction: string = user.direction || 'Direction non spécifiée';

    if (direction === 'Direction du Matériel et de la Documentation Informatique') {
      return 'Direction du Matériel<br>et de la Documentation<br>Informatique';
    }

    if (direction.startsWith('Direction ')) {
      const parts = direction.split(' ');
      if (parts.length >= 2) {
        return 'Direction<br>' + parts.slice(1).join(' ');
      }
    }

    return direction;
  }

  getStructureTooltip(user: User): string {
    const role = this.getRoleDisplay(user.role);
    const structure = this.getStructureInfo(user);
    return `${role}\nStructure: ${structure}`;
  }

  getQualificationTooltip(user: User): string {
    const role = this.getRoleDisplay(user.role);
    const qualification = this.getQualificationInfo(user);
    return `${role}\nQualification: ${qualification}`;
  }

  getDirectionTooltip(user: User): string {
    const direction = this.getDirectionInfo(user);
    return `Direction: ${direction}`;
  }

  viewUser(user: User): void {
    this.isEditing = true;
    this.currentUser = user;
    this.userForm.patchValue({
      nom: user.nom,
      email: user.email,
      contact: user.contact,
      adresse: user.adresse,
      role: user.role,
      qualification: user.qualification,
      structure: user.structure || '',
      direction: user.direction || ''
    });
    this.showUserModal = true;
    this.userForm.disable();
  }
}
