import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OrdreCommande } from '../models/business.models';

@Injectable({
  providedIn: 'root'
})
export class OrdreCommandeService {
  private API_URL = `${environment.apiUrl}/ordres-commande`;

  constructor(private http: HttpClient) {}

  getAllOrdresCommande(): Observable<OrdreCommande[]> {
    return this.http.get<OrdreCommande[]>(this.API_URL);
  }

  getLotsByTrimestre(trimestre: number): Observable<any[]> {
    console.log(`🔍 Appel API: ${this.API_URL}/trimestre/${trimestre}/lots`);
    return this.http.get<any[]>(`${this.API_URL}/trimestre/${trimestre}/lots`).pipe(
      tap(response => console.log('✅ Réponse lots:', response)),
      catchError(error => {
        console.error('❌ Erreur API lots:', error);
        throw error;
      })
    );
  }

  getFichesByLot(lotId: string, trimestre: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/trimestre/${trimestre}/lot/${lotId}/fiches`);
  }

  downloadFichePdf(ficheId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/fiches-prestation/${ficheId}/pdf`, {
      responseType: 'blob'
    });
  }
}
