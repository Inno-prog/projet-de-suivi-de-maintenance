import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EvaluationTrimestrielle } from '../models/business.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private API_URL = `${environment.apiUrl}/evaluations`;

  constructor(private http: HttpClient) {}

  getAllEvaluations(): Observable<EvaluationTrimestrielle[]> {
    return this.http.get<EvaluationTrimestrielle[]>(this.API_URL);
  }

  getEvaluationById(id: number): Observable<EvaluationTrimestrielle> {
    return this.http.get<EvaluationTrimestrielle>(`${this.API_URL}/${id}`);
  }

  createEvaluation(evaluation: EvaluationTrimestrielle): Observable<EvaluationTrimestrielle> {
    return this.http.post<EvaluationTrimestrielle>(this.API_URL, evaluation);
  }

  updateEvaluation(id: number, evaluation: EvaluationTrimestrielle): Observable<EvaluationTrimestrielle> {
    return this.http.put<EvaluationTrimestrielle>(`${this.API_URL}/${id}`, evaluation);
  }

  deleteEvaluation(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  getEvaluationsByPrestataire(): Observable<EvaluationTrimestrielle[]> {
    return this.http.get<EvaluationTrimestrielle[]>(`${this.API_URL}/prestataire`);
  }

  getEvaluationsByStatut(statut: string): Observable<EvaluationTrimestrielle[]> {
    return this.http.get<EvaluationTrimestrielle[]>(`${this.API_URL}/statut/${statut}`);
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.API_URL}/files/upload`, formData);
  }

  /**
   * Génère et télécharge le PDF d'une évaluation trimestrielle
   */
  generateEvaluationPdf(id: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/evaluations/${id}/pdf`, {
      responseType: 'blob'
    });
  }
  
  /**
   * Envoie un email d'évaluation au prestataire
   */
  sendEvaluationEmail(id: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${id}/send-email`, {});
  }
}
