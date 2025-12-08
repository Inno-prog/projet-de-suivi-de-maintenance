import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Contrat, StatutContrat } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContratService {
  private API_URL = `${environment.apiUrl}/contrats`;

  constructor(private http: HttpClient) {}

  getAllContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.API_URL);
  }

  getContratById(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.API_URL}/${id}`);
  }

  createContrat(contrat: any, file?: File): Observable<Contrat> {
    try {
      const formData = new FormData();
      
      // Ajout des champs obligatoires
      formData.append('idContrat', contrat.idContrat || '');
      formData.append('nomPrestataire', contrat.nomPrestataire || '');
      formData.append('lot', contrat.lot || '');
      formData.append('ville', contrat.ville || '');
      
      // Formatage des dates
      const formatDate = (date: any) => {
        if (!date) return '';
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
      };
      
      formData.append('dateDebut', formatDate(contrat.dateDebut));
      formData.append('dateFin', formatDate(contrat.dateFin));
      
      // Ajout des autres champs
      formData.append('montant', (contrat.montant || 0).toString());
      formData.append('statut', contrat.statut || 'ACTIF');
      
      if (contrat.typeContrat) {
        formData.append('typeContrat', contrat.typeContrat);
      }
      
      // Gestion du fichier
      if (file) {
        formData.append('file', file, file.name);
      } else if (contrat.fichierContrat) {
        // Si un fichier existe déjà (en cas de mise à jour)
        formData.append('fichierContrat', contrat.fichierContrat);
      }
      
      // Ajout des IDs des items
      if (contrat.itemIds && Array.isArray(contrat.itemIds) && contrat.itemIds.length > 0) {
        contrat.itemIds.forEach((itemId: number) => {
          formData.append('itemIds', itemId.toString());
        });
      }
      
      // Envoi de la requête avec les bons en-têtes
      return this.http.post<Contrat>(this.API_URL, formData, {
        reportProgress: true,
        responseType: 'json'
      });
      
    } catch (error) {
      console.error('Erreur lors de la préparation de la requête:', error);
      throw new Error('Erreur lors de la préparation des données du contrat');
    }
  }

  updateContrat(id: number, contrat: any, file?: File): Observable<Contrat> {
    const formData = new FormData();
    formData.append('idContrat', contrat.idContrat || '');
    formData.append('nomPrestataire', contrat.nomPrestataire || '');
    formData.append('lot', contrat.lot || '');
    formData.append('ville', contrat.ville || '');
    formData.append('dateDebut', contrat.dateDebut ? new Date(contrat.dateDebut).toISOString().split('T')[0] : '');
    formData.append('dateFin', contrat.dateFin ? new Date(contrat.dateFin).toISOString().split('T')[0] : '');
    formData.append('montant', (contrat.montant || 0).toString());
    formData.append('statut', contrat.statut || 'ACTIF');
    if (contrat.typeContrat) {
      formData.append('typeContrat', contrat.typeContrat);
    }
    if (file) {
      formData.append('file', file);
    }
    // Add item IDs if provided
    if (contrat.itemIds && contrat.itemIds.length > 0) {
      contrat.itemIds.forEach((itemId: number) => {
        formData.append('itemIds', itemId.toString());
      });
    }
    return this.http.put<Contrat>(`${this.API_URL}/${id}`, formData);
  }

  deleteContrat(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getContratsByPrestataire(prestataireId: number): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(`${this.API_URL}/prestataire/${prestataireId}`);
  }

  updateContratStatut(id: number, statut: StatutContrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.API_URL}/${id}/statut`, statut);
  }
}
