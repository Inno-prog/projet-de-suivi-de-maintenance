import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RapportSuivi, StatutRapport } from '../models/business.models';

@Injectable({
  providedIn: 'root'
})
export class RapportSuiviService {

  private apiUrl = '/api/rapports-suivi';

  constructor(private http: HttpClient) { }

  // Récupérer tous les rapports
  getAllRapports(): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(this.apiUrl);
  }

  // Récupérer un rapport par ID
  getRapportById(id: number): Observable<RapportSuivi> {
    return this.http.get<RapportSuivi>(`${this.apiUrl}/${id}`);
  }

  // Créer un nouveau rapport
  createRapport(rapport: RapportSuivi): Observable<RapportSuivi> {
    return this.http.post<RapportSuivi>(this.apiUrl, rapport);
  }

  // Mettre à jour un rapport
  updateRapport(id: number, rapport: RapportSuivi): Observable<RapportSuivi> {
    return this.http.put<RapportSuivi>(`${this.apiUrl}/${id}`, rapport);
  }

  // Supprimer un rapport
  deleteRapport(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Approuver un rapport
  approuverRapport(id: number): Observable<RapportSuivi> {
    return this.http.put<RapportSuivi>(`${this.apiUrl}/${id}/approuver`, {});
  }

  // Rejeter un rapport
  rejeterRapport(id: number): Observable<RapportSuivi> {
    return this.http.put<RapportSuivi>(`${this.apiUrl}/${id}/rejeter`, {});
  }

  // Récupérer les rapports par prestataire
  getRapportsByPrestataire(prestataire: string): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(`${this.apiUrl}/prestataire/${prestataire}`);
  }

  // Récupérer les rapports par trimestre
  getRapportsByTrimestre(trimestre: string): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(`${this.apiUrl}/trimestre/${trimestre}`);
  }

  // Récupérer les rapports par statut
  getRapportsByStatut(statut: StatutRapport): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(`${this.apiUrl}/statut/${statut}`);
  }

  // Récupérer les rapports par ordre de commande
  getRapportsByOrdreCommande(ordreCommandeId: number): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(`${this.apiUrl}/ordre-commande/${ordreCommandeId}`);
  }

  // Récupérer les rapports entre deux dates
  getRapportsBetweenDates(dateDebut: string, dateFin: string): Observable<RapportSuivi[]> {
    return this.http.get<RapportSuivi[]>(`${this.apiUrl}/periode?dateDebut=${dateDebut}&dateFin=${dateFin}`);
  }

  // Récupérer les statistiques des rapports
  getStatistiquesRapports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/statistiques`);
  }
}
