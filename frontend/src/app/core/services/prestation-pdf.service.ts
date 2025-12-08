import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PrestationPdfService {
  private apiUrl = `${environment.apiUrl}/prestations`;

  constructor(private http: HttpClient) {}

  /**
   * Génère et télécharge le PDF d'une fiche de prestation
   */
  generatePrestationPdf(prestationId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${prestationId}/pdf`, {
      responseType: 'blob'
    });
  }

  /**
   * Télécharge le fichier PDF
   */
  downloadPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup après un court délai pour s'assurer que le téléchargement a commencé
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 100);
  }
}