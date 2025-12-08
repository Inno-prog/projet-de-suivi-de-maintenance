export interface User {
  id: string;
  nom: string;
  email: string;
  contact?: string;
  telephone?: string;
  adresse?: string;
  role: string;
  qualification?: string;
  specialite?: string;
  competence?: string;
  structure?: string;
  entreprise?: string;
  societe?: string;
  direction?: string;
  service?: string;
  departement?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Administrator extends User {
  poste: string;
}

export interface Prestataire extends User {
  qualification?: string;
  structure?: string;
  direction?: string;
}

export interface CorrespondantInformatique extends User {
  structure?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  contact?: string;
  adresse?: string;
  role: string;
  qualification?: string;
  poste?: string; // For Administrator
  structure?: string; // For CorrespondantInformatique
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  nom: string;
  email: string;
  role: string;
}
